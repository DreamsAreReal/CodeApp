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
</content>
</invoke>
