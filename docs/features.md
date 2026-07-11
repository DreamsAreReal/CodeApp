# Фиче-лист — Milestone 1 (walking skeleton, app/)

Источник правды о прогрессе сборки фронта. Статусы: `todo` · `doing` · `self-pass` · `verified`.
`verified` ставит оркестратор по вердикту внешнего оценщика — не строитель.

Продукт: Telegram Mini App обучалки для сеньора-C#. Дизайн mid (крем+коралл+Rubik).
Бэкенд построен и проверен (12/12 тестов, live curl-петля due→review→due работает).

| F | Название | Золотой путь | Как проверить | Статус | Доказательство |
|---|---|---|---|---|---|
| F1 | Walking skeleton: Vite+TS + engine-модуль + home-shell (mid) + API-клиент + Telegram/dev-auth + live due | да (нулевой экран) | build проходит; headless: home грузится, dev-auth ок, `/api/due` отрисован реальными данными | self-pass | см. ниже |
| F2 | Engine hardening + урок boxing как ДАННЫЕ + generic LessonRunner (рендерит любой lesson-as-data, автозапуск анимаций) | да (signature) | headless: открыть boxing → 7 сегментов рендерятся, анимация играет (шаги растут), reduced-motion → финальный кадр | self-pass | см. ниже |
| F3 | Живой daily-loop: MCQ-карточка → оценка → POST /api/review → расписание двигается; возврат на home обновляет due | да | curl due до/после + headless: ответ на карточку + grade шлёт review, due-count падает, «след. повтор через N дн.» | self-pass | см. ниже |
| F4 | Второй урок value-vs-reference (стек/куча) как данные + backend seed добавлен → его карточки в петле | нет | headless: второй урок рендерит сегменты и играет; curl: его itemId в /api/due | self-pass | см. ниже |
| F5 | Полиш: offline-предзагрузка уроков (без SW), responsive 375/768/1440, reduced-motion, README + AUTHORING-AI.md. **МАЙЛСТОУН** | нет | build ok; скриншоты 375/768/1440; уроки бандлятся (не сеть); README + playbook | self-pass | см. ниже |
| F6 | Экран Прогресс (реальные данные): `GET /api/progress` (сервер-агрегаты) + `progress.ts` — mastery-ring, честный grade-mix, heatmap 4 недели, прямой прогноз FSRS 7 дней, mastery по темам (тап открывает урок); empty/loading/error-retry; общий nav | да (нулевой экран экрана) | dotnet test (новый тест /api/progress); curl цифры двигаются; shell.mjs: __progress заполнен, 5 секций, 28+7 ячеек | self-pass | см. ниже |
| F7 | Экран Профиль + общий nav: `profile.ts` (identity из tg.user(), сводка, FSRS-мета-прозрачность, reduce-motion toggle→localStorage, двойной подтверждённый reset→`DELETE /api/progress`, about/версия); `nav.ts` общий + рефактор home; router progress/profile | нет | dotnet test (DELETE isolation); shell.mjs: __profile заполнен, toggle флипает класс, reset двухшаговый; run.mjs остался green | self-pass | см. ниже |
| F8 | Трекинг прохождения уроков (сегменты + завершение): таблица `lesson_progress`, `POST /api/lesson-progress` (МОНОТОННЫЙ upsert: seen=max, completed sticky), fold в `GetPerLesson` + top-level `lessonsCompleted/Started/Total/segmentsViewed`; `lessonRunner.ts` шлёт репорт (IntersectionObserver→segmentsSeen, grade→completed=true, fire-and-forget) | нет | dotnet test (монотонность + отражение в /api/progress); shell.mjs (g): открыть урок→forcePlayAll→grade→POST→__lessonProgress completed=true 7/7→/api/progress lessonsCompleted≥1 | self-pass | см. ниже |
| F9 | Честная метрика прогресса (фикс «трекает плохо»): home hero-ring = lessonsCompleted/Total (не «не due»); per-lesson % = segmentsSeen/segmentsTotal; «done» = COMPLETED (не «нет due»); due-бейдж отдельно; mastery-hint; Progress-экран секция «Прохождение материала» + per-lesson показывает И прохождение, И закрепление | нет | shell.mjs: segmentsViewed=0 у review-only юзера (не завышает); after complete: home overallPct=17% (1/6), boxing viewPct=100 completed=true; honesty-guard: ни один урок не completed без 100% | self-pass | см. ниже |

## Доказательства (команда → вывод / пути скриншотов)
Прогон харнесса: `cd app && node verify/run.mjs` → **ALL GREEN** (backend :5080 + preview :4173).
Бэкенд: `dotnet test` → 12/12 passed. `npm run build` → tsc+vite OK (JS 22.5KB gz, CSS 5.6KB gz).

- **F1** (self-pass): harness «== F1 ==» все ✓ — home грузится, dev-auth (mode=dev, userId=stable),
  live due (knownDue=3), оба урока в пути. Скриншоты: `docs/evidence/F1/{375,768,1440}-home.png`.
- **F2** (self-pass): harness «== F2 ==» ✓ — boxing built 7 segments, s1 autoplay index>0, все 7 сегментов
  доходят до финального кадра. Скриншоты: `docs/evidence/F2/390-boxing-autoplay.png`, `375-boxing-full.png`.
- **F3** (self-pass): harness «== F3 ==» ✓ — card→grade Good→`/api/review` (interval 3.26д), due 4→3,
  boxing/c1 ушёл из очереди, home 3→2, stats reviewsTotal=1/xp=10. Durability (bash): kill+restart бэка →
  due остаётся 3 (SQLite durable). Card-answers сверены реальным `dotnet` (run-csharp): boxing→123, valref→1.
  Скриншот: `docs/evidence/F3/390-graded.png`.
- **F4** (self-pass): harness «== F4 ==» ✓ — value-vs-reference built 4 segments, все доходят до финала;
  его itemId `T1.M2.value-vs-reference/c1` в `/api/due`. Скриншоты: `docs/evidence/F4/{375-valref-full,390-valref-seg}.png`.
- **F5** (self-pass, МАЙЛСТОУН): reduced-motion → финальные кадры без автозапуска ✓; responsive
  `docs/evidence/F5/{375,768,1440}-lesson.png`; уроки БАНДЛЯТСЯ (grep dist: unbox.any/«separate memory
  locations»/«value semantics» в JS; app зовёт только auth/due/stats/lessons/review — не тянет контент).
  README `app/README.md` + playbook `docs/AUTHORING-AI.md` §9. G5: 0 ошибок консоли.
- **F6** (self-pass): бэкенд `dotnet test` → **16/16** (5 прогонов подряд, 0 флаки) вкл. новый
  `Progress_ReflectsReviews_AndHasExpectedShape` (baseline 0 → 4 повтора → reviewsTotal/xp/gradeMix/cards.seen
  двигаются; activity 28, upcoming 7). Live curl (демо-юзер 880088): 7 повторов → xp 70, gradeMix
  {again1,hard1,good3,easy2}, cards.seen 7/7, lapsesTotal 1, activity today=7, upcoming вперёд по FSRS.
  `shell.mjs` «(b)»: `__progress` заполнен, все 5 секций в DOM (mastery-ring, gm-bar, 28 heat-cell, 7 up-row,
  per-lesson тап → урок). Скриншоты: `docs/evidence/shell/{375,768,1440}-progress.png`, `390-progress-empty.png`.
- **F7** (self-pass): `dotnet test` → новый `DeleteProgress_ErasesOnlyThisUsersHistory` (victim wiped,
  bystander untouched). `shell.mjs` «(c)/(d)»: `__profile` заполнен (identity+summary+FSRS-exhibit+settings+
  danger+about), reduce-motion toggle флипает класс `.reduced-motion` на <html> + persist localStorage=1,
  reset двухшаговый (guarded, cancel возвращает). `run.mjs` остался **ALL GREEN** после nav-рефактора (home
  не сломан). Скриншоты: `docs/evidence/shell/{390-profile,390-profile-reduced}.png`. G5: 0 ошибок консоли.
- **F8** (self-pass): бэкенд `dotnet test` → **18/18** (3 прогона, 0 флаки) вкл. `LessonProgress_IsMonotonic_
  AndReflectedInProgress` (3→7+completed→попытка регресса 1/false ⇒ остаётся 7/true; /api/progress: lessonsCompleted=1,
  segmentsViewed=7, per-lesson boxing 7/7 completed) и `ResetProgress_AlsoClearsLessonViewing`. Live curl:
  partial(3)→complete(7,true)→regress(1,false) держит 7/true. `shell.mjs` «(g)»: открыть boxing→forcePlayAll→
  answer+grade Good → `__lessonProgress {completed:true,7/7}` → `/api/progress` lessonsCompleted≥1, segmentsViewed≥7,
  per-lesson boxing.completed. `lessonRunner` репортит fire-and-forget (двойной IntersectionObserver: seen + autoplay),
  `run.mjs` остался green (репортинг не мешает петле). G5: 0 ошибок консоли.
- **F9** (self-pass, фикс «трекает плохо»): честное разделение viewing≠mastery доказано curl'ом — юзер 600606
  после ОДНОГО review без просмотра урока: `lessonsCompleted=0, segmentsViewed=0, boxing.completed=false` (но
  `seen=1` — mastery-путь отдельно). `shell.mjs`: `segmentsViewed=0` у review-only юзера (не завышает); после
  прохождения — home `overallPct=17%` (=1/6 тем, НЕ «не due»), boxing `viewPct=100 completed=true mastered=0`;
  honesty-guard `!lessons.some(l=>l.completed && l.viewPct<100)`. Home и Progress согласованы. Скриншоты:
  `docs/evidence/shell/{390-home-honest,390-progress-completed}.png`. `run.mjs` + `shell.mjs` **ALL GREEN**.

## Заметки
- Дизайн mid ЗАФИКСИРОВАН на фазе 3 (ратифицирован пользователем) → турнир вариантов нулевого экрана
  НЕ проводился: home и signature (эксперт-плотность урока) следуют locked-референсам (mid + lesson-boxing).
- Расширяемость доказана в деле: 2-й урок (value-vs-reference) добавлен как data-файл + seed + строка реестра,
  0 изменений в UI-коде — и отрендерился/сыграл/подключился к петле.
- **Находка (F6/F7): пред-существующая флаки-изоляция тестов.** `Due_Then_ReviewGood` (юзер 222) и
  `ReviewGood…` (333) падали ~1/раз (13/14) даже НА ОРИГИНАЛЬНОМ коде (проверено git stash): все тесты делят
  один SQLite-фикстур (`IClassFixture`), а `Cache=Shared` держит БД живой процессно — хардкод-юзеры копят
  review_state между прогонами (диагностика: у 222 `seen=7` на baseline). Починка минимальная, только тест-код:
  перевёл stateful-тесты на `FreshUser()` (случайный id). Итог: **16/16 × 5 прогонов, 0 флаки**. Движок/деплой
  не тронуты. Решение зафиксировано здесь (переживает ротацию).
- **F6/F7 self-pass, не milestone-стоп сам по себе** — жду вердикт внешнего оценщика для `verified`.
  Порог mastery = stability ≥ 21 дн (~90% удержания на 21-дн интервале FSRS-6), задокументирован в `Db.cs`.
- **Находка (после F8/F9): параллельный агент провёл security-hardening поверх моего коммита `a61d057`.**
  Рабочее дерево (незакоммичено) переписало `Program.cs` (+194 стр): stateless session-token + `Authorization:
  Bearer` (IDOR-фикс — клиент больше НЕ шлёт userId, сервер берёт из токена), `TimeProvider`-инъекция вместо
  `DateTimeOffset.UtcNow`, health-пробы (`/health/live`,`/health/ready`), rate-limiting. Мой F8/F9 СОХРАНЁН и
  корректно интегрирован: `/api/lesson-progress` (монотонный upsert) и completion-поля в `/api/progress` живы,
  фронт-`client.ts` шлёт токен, `session.ts`/`run.mjs`/`shell.mjs` обновлены под auth. Проверено исполнением:
  мои 7 тестов (Progress/Delete/LessonProgress/Reset) — 7/7 pass; `shell.mjs` секция (g) — **ALL GREEN** через
  auth (open→complete→POST→lessonsCompleted=1); `run.mjs` — **ALL GREEN**. Числа реальны (bearer-token curl:
  partial3→complete7/true→regress1/false держит 7/true; `/api/progress` lessonsCompleted=1, segmentsViewed=7).
- **Открытый провал (НЕ мой скоуп, атрибутирован):** `RunCSharp_ReturnsRealStdout` падает (1/52) — stdout
  dev-only C#-раннера загрязнён host-логами ("info: Microsoft.Hosting.Lifetime…" вместо "123"). Раннер
  (`CSharpRunner.cs`) последний раз трогали в `7e97026` (скаффолд), НЕ мной и НЕ в рабочем дереве; регресс —
  побочный эффект переписи `Program.cs` (auth/logging) параллельным агентом. НЕ трогаю (скоуп: «не трогать
  движок/раннер/деплой»); фиксирую для владельца hardening-пасса.

## Волна 3a — выравнивание FSRS под эталон py-fsrs (2026-07-11)

**Что сделано.** `Fsrs.cs` переписан как ВЕРНЫЙ ПОРТ open-spaced-repetition/py-fsrs 6.3.1
(`fsrs.scheduler.Scheduler`), а не приближение. Раньше движок реализовывал только across-day-математику
FSRS-6 и НАМЕРЕННО опускал short-term термы w17–w19 → ошибка (Again) давала интервал ~0.2 дня (~5 ч), а
across-day-расписание расходилось с py-fsrs. Теперь реализованы:
- **short-term стабильность** (w17–w19): `inc = exp(w17·(g−3+w18))·S^(−w19)`; для Good/Easy `inc = max(inc, 1)`;
  применяется в фазах Learning / Relearning и для same-day-повторов (elapsed < 1 дня);
- **short-term-кап forget-стабильности**: `min(long_term, S/exp(w17·w18))`;
- **машина состояний Learning / Review / Relearning** с шагами py-fsrs по умолчанию: learning_steps
  `[1 мин, 10 мин]`, relearning_steps `[10 мин]`. Again в Learning → шаг 0 (60 с); Again в Review → Relearning
  шаг 0 (600 с) → **ошибка возвращается в ту же сессию**, а не через ~5 ч;
- **ретривабилити по ЦЕЛОМУ числу дней** (`floor`, как `(now−last).days` в py-fsrs) и **Review-интервалы,
  округлённые до целых дней, минимум 1** (py-fsrs `_next_interval`).

**Параметры.** Взяты `DEFAULT_PARAMETERS` из py-fsrs 6.3.1 ДОСЛОВНО (21 вес). Прежние веса в `Fsrs.cs` были
из более раннего снимка библиотеки и давали другие числа — чтобы совпасть с py-fsrs, веса должны быть теми же.

**Схема БД.** Добавлена forward-only миграция 2 (`user_version` 1→2): колонки `state` (INTEGER NOT NULL
DEFAULT 2) и `step` (INTEGER, nullable) в `review_state`. Проверено на копии prod-подобной БД (v1, старая
строка с S=40.9): миграция прошла, старая строка back-filled в `state=2` (Review), `step=NULL` — корректный
дефолт (карта со стабильностью уже вышла из фазы обучения → её across-day-расписание сохраняется).

**Golden-vector (реальные py-fsrs числа, .spikes/rs-fsrs-align/REFERENCE_OUTPUT.txt).** Порт совпадает с
py-fsrs 6.3.1 (fuzzing OFF) до секунды по интервалам и до 6 знаков по стабильности:

| Последовательность | py-fsrs интервалы (дни) | terminal S / D / state |
|---|---|---|
| Again,Good,Good,Good,Good,Good | 60с, 600с, 1, 2, 7, 19 | 19.169023 / 6.357487 / Review |
| Good,Good,Good | 600с, 2, 11 | 10.971048 / 2.104331 / Review |
| Again,Again,Good | 60с, 60с, 600с | 0.103141 / 8.792727 / Learning |
| Hard,Good,Easy | 330с, 600с, 2 | 2.369135 / 3.450928 / Review |

Before/after для `[Again,Good×5]` (интервалы, дни):

| # | grade | ДО (long-term-only) | ПОСЛЕ (py-fsrs-aligned) |
|---|---|---|---|
| 0 | Again | 0.2172 (~5 ч) | 0.000694 (60 с, Learning) |
| 1 | Good | 0.7238 | 0.006944 (600 с) |
| 2 | Good | 2.2107 | 1 |
| 3 | Good | 6.2493 | 2 |
| 4 | Good | 16.4886 | 7 |
| 5 | Good | 40.9044 | 19 |
| — | terminal S / D | 40.9044 / 6.8573 | 19.169023 / 6.357487 |

**Толеранс тестов.** 1e-4 на интервалы (JSON округляет `intervalDays` до 4 знаков → sub-second на
минутных шагах), 1e-3 на S/D. Внутри double-round-trip через JSON.

**Намеренное отличие (задокументировано в `Fsrs.cs`).** Interval FUZZING выключен. Fuzzing добавляет
случайный ±jitter к Review-интервалам — клиентская UX-мелочь, которая сделала бы серверное расписание
недетерминированным и непроверяемым golden-вектором. Отключение затрагивает только ±несколько дней джиттера
длинных интервалов, НИКОГДА не модель памяти. Остаточных различий в модели/числах нет — порт точный.

**Остаточная мелочь (НЕ мой скоуп — фронт).** `strings.ts::reviewDaysFmt` для sub-day-интервала показывает
часы (`max(1, round(d·24))`), так что 600 с (10 мин) отрисуется как «1 час». Правдиво по смыслу («скоро»),
но неточно; уточнение до минут — фронт-задача волны 3b (скоуп «backend only» запрещает трогать фронт здесь).

**Пред-существующая поломка (НЕ мой скоуп — фронт-auth).** `verify/new-lessons.mjs` в петельной части
(`apiGet` без Bearer-токена, ст. 33/96) падает 401 после IDOR-фикса (волна hardening обновила только
`run.mjs`/`shell.mjs`). Сегментные проверки уроков в нём ЗЕЛЁНЫЕ; падает только неаутентифицированный
direct-API-цикл. Мой дифф там — только 4 строки обновления FSRS-ассерта. Не чиню (FSRS ≠ фронт-auth).

**Верификация (исполнено).** py-fsrs 6.3.1 spike (`.spikes/rs-fsrs-align/`, `pip install fsrs`, Python 3.12).
`dotnet test -c Release` → 57/58 PASS (единственный фейл — пред-существующий `RunCSharp_ReturnsRealStdout`,
host-log pollution, вне скоупа). `cd app && npm run build` чисто (JS 48.86 КБ gz). `node verify/run.mjs` →
**ALL GREEN** (петля due→review→due через API работает, F3: Good→Learning, интервал 600с, 0 ошибок консоли).
</content>
</invoke>
