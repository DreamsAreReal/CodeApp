# RS-16 — Стратегия тестирования (static TS фронт + ASP.NET Core/xUnit бэк + SQLite)

Линза: тест-пирамида для этой формы приложения; какие самые высоко-ROI тесты такие
приложения обычно НЕ имеют. Дата: 2026-07-11. Корпусы: **мир** (живой веб — Microsoft
Learn, Playwright, Telegram, open-spaced-repetition) + **корпус пользователя** (реальные
файлы бэка/фронта/CI — прочитаны сейчас).

---

## 1. Вопросы

1. Тест-пирамида для этой формы: бэк unit/integration (WebApplicationFactory,
   детерминированное время, изоляция SQLite), контрактные тесты API, фронт E2E с
   Playwright + симуляция Telegram webview/initData, a11y (axe/WCAG), visual regression,
   perf/load smoke, гейтинг в CI и покрытие, которое реально что-то значит.
2. Какие тесты этот класс приложений ЧАЩЕ ВСЕГО не имеет (auth edge cases,
   корректность FSRS-математики, персистентность расписания через рестарт,
   empty/error-состояния).

## 2. Корпусы и классы источников

- **Мир (первичка A):** Microsoft Learn (integration tests, FakeTimeProvider, coverage),
  Playwright docs (a11y, visual, mock-browser-apis), core.telegram.org + docs.telegram-
  mini-apps.com (алгоритм initData), open-spaced-repetition/py-fsrs (эталонные векторы).
- **Корпус пользователя (прочитан):** `backend/Codex.Backend.Tests/{ApiTests,FsrsTests,
  TelegramAuthTests}.cs`, `backend/Codex.Backend/{Fsrs,TelegramAuth,Program,Db}.cs`,
  `.github/workflows/deploy.yml`, `app/verify/{run,shell,new-lessons}.mjs`.
- **Не покрыто:** нет живого прогона нагрузки/перф-бюджета на VPS (нет доступа) — perf
  smoke дан как рецепт, не как замер. `ДЕГРАДИРОВАНО: живой VPS/нагрузка` — только для
  load-числа; всё остальное проверено кодом и первичкой.
- **PII-предохранитель:** реальный user id из captured payload (grobozvon 618483287)
  остаётся тест-фикстурой, наружу не проверяется.

## 3. Находки (утверждение + источник + дата + уверенность)

### F1. WebApplicationFactory: изоляция per-test обязательна даже при общем IClassFixture
Официальная позиция MS: при общей фабрике (`IClassFixture`) состояние БД переживает
между тестами — «Because another test … deletes all of the records … the database is
reseeded in this test method». Рекомендация: пересеивать состояние в Arrange каждого
теста через `_factory.Services.CreateScope()`. Источник:
learn.microsoft.com/aspnet/core/test/integration-tests (aspnetcore-10.0). Уверенность:
высокая.
> **Про нас:** `ApiTests` использует ОДНУ `Factory` через `IClassFixture` и один
> SQLite-файл на всю фабрику, и явно обходит проблему разбросом случайных user-id
> (`FreshUser()`) + комментарий про «shared cache keeps a file-keyed DB alive process-
> wide». Это работает, но хрупко: любой тест с фиксированным id (`DevAuth_CreatesUser`
> — id 111; `ReviewGood…` — фикс. itemId на случайном user) может накопить состояние
> между прогонами в общем кэше. Каноничнее — либо **фабрика-на-тест** (не IClassFixture),
> либо in-memory SQLite с одним открытым `SqliteConnection` через DI-singleton (см. F2),
> который EF/провайдер не закрывает, + `respawn`/reseed на каждый тест.

### F2. In-memory SQLite: держать соединение открытым, иначе БД исчезает
MS: SQLite-провайдер — рекомендуемый выбор для in-memory-тестов, НО in-memory-БД живёт,
пока открыто хотя бы одно соединение; закрытие соединения удаляет БД. Паттерн —
зарегистрировать `SqliteConnection("DataSource=:memory:")` как singleton и открыть его
до передачи, чтобы жил всё время теста. Источник: learn.microsoft.com/ef/core/testing/
testing-without-the-database + integration-tests page. Уверенность: высокая.
> **Про нас:** мы НЕ на EF — прямой `Microsoft.Data.Sqlite`. Тот же принцип: сейчас
> тесты пишут в реальный файл во `%TEMP%` (`codex-test-{guid}.db`) и полагаются на
> shared-cache. Переход на `Data Source=file:memdb-{guid}?mode=memory&cache=shared` с
> удержанным соединением даст быструю полную изоляцию per-test без временных файлов.

### F3. Детерминированное время: инъекция TimeProvider + FakeTimeProvider (риск №1 у нас)
`Microsoft.Extensions.TimeProvider.Testing` даёт `FakeTimeProvider` для контроля
времени: `SetUtcNow`, `Advance(TimeSpan)`, `GetUtcNow`, DI через
`services.AddSingleton<TimeProvider>(fake)`. Best practice: «Always inject `TimeProvider`
… rather than using `DateTime`/`DateTimeOffset` directly» и «Test edge cases like
midnight, month boundaries, DST, leap years». Источник: learn.microsoft.com/dotnet/core/
extensions/timeprovider-testing (обновл. 2026-03). Уверенность: высокая.
> **Про нас — САМЫЙ ВЫСОКИЙ ROI, и напрямую блокирует «персистентность расписания через
> рестарт»:** `grep` подтвердил, что бэк дергает `DateTimeOffset.UtcNow` НАПРЯМУЮ в
> `Program.cs` (due, review, stats/streak), `Db.cs` (created_at) и `TelegramAuth.cs`
> (auth_date freshness). Значит СЕЙЧАС невозможно детерминированно проверить:
> (а) карта, ставшая due «завтра», реально всплывает в очереди после того, как время
> прошло; (б) `streakDays`/`daysActive` на границе суток и часовых поясов;
> (в) истечение `auth_date` (см. F4). Тест `RepeatedGoodWithElapsedTime` в `FsrsTests`
> обходит это, передавая `elapsedDays` вручную В САМ scheduler — но полный E2E-путь
> «review → сохранили due-дату → время идёт → GET /api/due её показывает» непокрываем.
> Рекомендация: провести `TimeProvider` через DI в `Program.cs`/`Db.cs`/`TelegramAuth`,
> в тестах подменять `FakeTimeProvider`, крутить `Advance()` для due/streak/expiry.

### F4. Telegram initData: точный алгоритм + edge-cases + документированный конфликт
Первичка (core.telegram.org/bots/webapps и docs.telegram-mini-apps.com/platform/init-data):
data-check-string = все поля КРОМЕ `hash`, отсортированы по алфавиту, `key=value`, разделитель
`\n`; secret = HMAC-SHA256(botToken, key="WebAppData"); сравнить с `hash`; дополнительно
проверить `auth_date` на свежесть. **Важный нюанс/конфликт источников:** для СТАНДАРТНОЙ
(bot-token) валидации docs.telegram-mini-apps.com прямо пишет «Key `hash` should be
excluded … The `signature` key should also be excluded» — но это относится к **Ed25519
third-party** валидации; для HMAC-пути официально исключается ТОЛЬКО `hash`, а `signature`
ОСТАЁТСЯ в строке. Уверенность: высокая (два первичных источника + наш captured payload).
> **Про нас:** ровно этот конфликт нас укусил (STATE 2026-07-11): код исключал
> `signature` → каждый реальный логин падал в 401. `TelegramAuthTests` теперь фиксирует
> правильное поведение (signature ВНУТРИ HMAC). **Дыры в auth edge-cases, которых
> сейчас НЕТ:** (1) истёкший `auth_date` (наш `Sign()` всегда ставит свежий UtcNow —
> ветка `maxAge` в `TelegramAuth.cs:59` НЕ проверяется негативно; чинится через F3
> FakeTimeProvider + старый auth_date → ждём 401); (2) отсутствует поле `hash` целиком;
> (3) отсутствует/битый `user` JSON; (4) лишнее поле, добавленное после подписи;
> (5) пустой initData; (6) правильный hash, но подписанный ЧУЖИМ токеном (есть —
> `InitData_SignedWithWrongToken_IsRejected`, хорошо). На фронте E2E-путь реальной
> авторизации через `window.Telegram.WebApp` НЕ тестируется (см. F7).

### F5. FSRS-корректность: сверять с ЭТАЛОННЫМИ векторами py-fsrs, не только «направление»
open-spaced-repetition/py-fsrs `tests/test_basic.py` содержит золотые векторы:
- Рейтинги `[Good×6, Again, Again, Good×5]` → интервалы (дни)
  `[0, 2, 11, 46, 163, 498, 0, 0, 2, 4, 7, 12, 21]` (fuzzing off).
- Рейтинги `[Again, Good×5]` → интервалы `[0, 0, 1, 3, 8, 21]`,
  итог **Stability ≈ 53.62691**, **Difficulty ≈ 6.3574867** (±1e-4).
Источник: raw.githubusercontent.com/open-spaced-repetition/py-fsrs/main/tests/test_basic.py.
Уверенность: высокая.
> **Про нас:** `FsrsTests` проверяет НАПРАВЛЕНИЕ и монотонность (Good>Again, стабильность
> растёт, difficulty в границах) и калибровку кривой (R(t=S)=0.9, interval@0.9=S) —
> это хорошо и уже ловит грубые ошибки. Но НЕ сверяет абсолютные числа с эталонной
> реализацией. Наш `Fsrs.cs` СОЗНАТЕЛЬНО опускает FSRS-6 short-term термы (w17..w19),
> поэтому 1:1 с py-fsrs совпадёт только на across-day путях — golden-тест нужно строить
> на многодневных последовательностях (передавая elapsed=interval между ревью, как уже
> делает `RepeatedGoodWithElapsedTime`) и сверять S/D/interval с эталоном ±1e-3. Это
> ловит регрессии параметров/формул, которые «направленческие» тесты пропускают.

### F6. A11y (axe/WCAG) через Playwright
`@axe-core/playwright`: `new AxeBuilder({ page }).analyze()`; ограничить критериями через
`.withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa'])`; `.include()` для куска страницы;
`.disableRules()` для временного подавления. Явное ограничение из первички: «Automated
accessibility tests can detect some common accessibility problems … many … can only be
discovered through manual testing» → авто + ручное. Источник: playwright.dev/docs/
accessibility-testing. Уверенность: высокая.
> **Про нас:** a11y-тестов НЕТ. Приложение — кастомный SVG-движок + `reduced-motion`
> уже уважается (проверяется в харнессах). Высокий ROI: axe-скан Home/Lesson/Progress/
> Profile на wcag2a+aa — поймает контраст (крем+коралл — реальный риск по контрасту),
> отсутствие имён у интерактивных SVG/кнопок, роль/лейбл нав-табов. Дёшево прикрутить к
> уже существующему Playwright-харнессу.

### F7. Симуляция Telegram webview / initData в Playwright
Playwright: `page.addInitScript()` / `context.addInitScript()` выполняется ДО загрузки
страницы — «setup all the mocks before the page started loading». Именно так подкладывают
`window.Telegram.WebApp` (с `initData`, `initDataUnsafe`, `themeParams`, `ready()`,
`HapticFeedback`, `expand()`, `MainButton`) до того, как код фронта его прочитает.
Источник: playwright.dev/docs/mock-browser-apis + evaluating. Уверенность: высокая.
> **Про нас:** харнессы (`run.mjs`/`shell.mjs`) СЕЙЧАС авторизуются, кладя
> `localStorage['codex.devUserId']` через `addInitScript` — то есть тестируют dev-
> fallback, а НЕ реальный Telegram-путь (initData → HMAC → mode=telegram). Учитывая, что
> именно этот путь дал 401 в проде, ВЫСОКИЙ ROI: добавить E2E-сценарий, где `addInitScript`
> ставит полноценный mock `window.Telegram.WebApp.initData` = валидно подписанный
> payload (переиспользовать `/api/dev/sign-initdata`), и проверить, что фронт реально
> проходит `/api/auth` в режиме telegram, читает тему и не падает. Плюс негативный:
> подделанный initData → грациозное состояние ошибки на UI, а не белый экран.

### F8. Visual regression (Playwright toHaveScreenshot) — с укрощением анимаций
`expect(page).toHaveScreenshot()`; опция `animations: 'disabled'` по умолчанию —
«CSS animations, transitions and Web Animations … finite fast-forwarded to completion,
infinite canceled to initial state». Для стабильности: одинаковое окружение для
baseline, `stylePath` чтобы прятать динамику, `maxDiffPixels/threshold`. Источник:
playwright.dev/docs/test-snapshots + api/class-pageassertions. Уверенность: высокая.
> **Про нас:** визуального регресса НЕТ. Наша ценность — «сочная» кастомная SVG-анимация
> + залоченный дизайн (крем/коралл/Rubik). Тут visual regression реально высоко-ROI, НО
> надо снимать в детерминированной точке анимации (движок — скраббер: снимать на
> зафиксированном кадре/после `__viz.ready`, а не в полёте), иначе флейки. Начать с
> 2-3 ключевых экранов на фикс. вьюпорте 390.

### F9. Perf/load smoke + перф-бюджет
Ценность интерактивного продукта — во времени взаимодействия (STATE флаг). Бандл уже
меряется (JS ~22-36КБ gz — числа в STATE). Для бэка smoke: несколько сотен `/api/due`+
`/api/review` последовательно (SQLite single-writer!) под замером латентности; это
контролирует, что WAL/индексы не деградируют. `ДЕГРАДИРОВАНО: живой VPS` — реальную
нагрузку под cloudflared не мерил. Уверенность: средняя (рецепт, не замер).

### F10. Покрытие, которое значит: coverlet + гейт по критичным модулям, не по %
`dotnet test --collect:"XPlat Code Coverage"` (coverlet) → `coverage.cobertura.xml`;
ReportGenerator для отчёта; Code Coverage Summary Action для гейта в CI. Источник:
learn.microsoft.com/dotnet/core/testing/unit-testing-code-coverage + github.com/coverlet-
coverage/coverlet. Уверенность: высокая.
> **Про нас:** CI (`deploy.yml`) гейтит `dotnet test` + `npm run build`, но НЕ собирает
> покрытие и НЕ гоняет Playwright-харнессы (им нужен живой бэк — сейчас они запускаются
> только локально). ROI не в проценте, а в требовании: `Fsrs.cs` + `TelegramAuth.cs` +
> due/review-хендлеры `Program.cs` = ~100% ветвей (это «мозг» и «замок» приложения).
> Гейтить по покрытию ИМЕННО этих файлов, а «джунк» (Strings, статик-раздача) — нет.

## 4. Варианты и трейдофы

- **Изоляция SQLite:** (A) текущий файл+shared-cache+random-id — работает, но неявная
  связь через процесс-кэш; (B) фабрика-на-тест (без IClassFixture) — чистая изоляция,
  дороже по времени старта хоста; (C) in-memory shared-cache с удержанным соединением
  per-test — быстро+чисто, требует правки регистрации connection. Реко: C, с fallback B
  для тестов, которым нужен реальный файл (persist-across-restart, см. ниже).
- **Персистентность через рестарт:** нельзя проверить in-memory (БД умрёт с
  соединением). Нужен ОТДЕЛЬНЫЙ тест на файловой БД: review → `Dispose` фабрики →
  новая фабрика на ТОТ ЖЕ файл → `/api/due`/`/api/progress` показывают сохранённое
  состояние. Комбинируется с FakeTimeProvider (F3), чтобы «время прошло» между рестартами.
- **Telegram-путь:** dev-fallback (быстро, есть) vs. реальный HMAC E2E (ловит прод-баги,
  как 401). Реко: держать оба — dev для скорости, один реальный HMAC-E2E как «замок».

## 5. Реестр покрытия (факт × первооткрыватель)

| # | Тема линзы | Статус | Первоисточник |
|---|-----------|--------|---------------|
| 1 | WebApplicationFactory изоляция | покрыто | MS integration-tests |
| 2 | SQLite in-memory lifetime | покрыто | MS EF testing / integration-tests |
| 3 | Детерминированное время | покрыто | MS FakeTimeProvider |
| 4 | initData алгоритм + edge | покрыто | Telegram core + mini-apps docs |
| 5 | FSRS golden-векторы | покрыто | py-fsrs test_basic.py |
| 6 | A11y axe/WCAG | покрыто | Playwright a11y docs |
| 7 | Симуляция Telegram webview | покрыто | Playwright mock-browser-apis |
| 8 | Visual regression | покрыто | Playwright test-snapshots |
| 9 | Perf/load smoke | частично | STATE-бюджет; живой замер ДЕГРАДИРОВАН |
| 10 | Coverage-гейт | покрыто | MS coverage + coverlet |
| 11 | Контрактные тесты API | покрыто-нами | наш ApiTests (форма payload) |
| 12 | Empty/error states | частично | наш shell.mjs (1 empty state) |

## 6. Противоречия источников

- **initData `signature` в HMAC:** обобщённые формулировки (в т.ч. первый ответ поиска и
  часть bl"exclude hash and signature") создают впечатление, что `signature` исключается
  и в bot-token пути. Первичка (mini-apps docs, раздельно про HMAC и Ed25519) + наш
  captured payload разрешают: для HMAC исключается только `hash`. Trace-to-original
  выполнен. D-источники (Medium/DEV про «2025 change») — только наводка, в фактику не брал.
- **Empty/error-состояния:** запрос вернул в основном D-тир (Medium/DEV/LinkedIn). Как
  порог/источник НЕ используется; сам факт «это чаще всего недотестировано» подтверждён
  нашим корпусом (в `shell.mjs` есть ровно ОДИН empty-state, error-состояний нет).

## 7. Что не удалось выяснить

- Реальные числа латентности/пропускной под cloudflared на живом VPS (нет доступа) —
  perf smoke дан рецептом.
- Точное соответствие нашего усечённого FSRS-6 (без w17..w19) эталону py-fsrs на
  SAME-DAY последовательностях — совпадёт только across-day; golden-тест строить на
  многодневных путях.

## 8. Рекомендация (приоритет по ROI)

Топ-3 (наивысший ROI, чинят реальные дыры именно этого приложения):
1. **Инъекция `TimeProvider` + FakeTimeProvider** (F3) — разблокирует детерминированные
   тесты due-очереди, streak-границ, истечения initData и персистентности-через-рестарт.
   Один архитектурный сдвиг, множит ценность всех остальных тестов.
2. **Auth edge-cases** (F4): истёкший auth_date, нет hash, битый/нет user, чужой токен,
   лишнее поле — по одному xUnit-факту на TelegramAuth + один реальный-HMAC E2E на фронте
   через mock `window.Telegram.WebApp` (F7). Прямо покрывает класс багов, давший прод-401.
3. **FSRS golden-vectors** (F5) — сверка S/D/interval с py-fsrs на across-day
   последовательностях, ±1e-3. Ловит регрессии формул, которые направленческие тесты
   пропускают.
Затем: persist-across-restart (файловая БД + рестарт фабрики), a11y-скан ключевых экранов
(F6), coverage-гейт на Fsrs/TelegramAuth/due-review (F10), Playwright в CI против живого
бэка, visual regression на фикс. кадре (F8), error/empty-состояния фронта (F ниже §6).
