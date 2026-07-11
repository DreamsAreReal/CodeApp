# Прогресс сборки — Milestone 1 (app/)

North Star: живой daily-loop через готовый бэкенд + пара уроков эксперт-плотности,
расширяемая архитектура «добавил файл-урок = добавил урок». Дизайн mid. Всё реально
запускается (build + прогон = доказательство).

## Recon бэкенда (контракт, проверен live curl)
- `POST /api/auth {devUserId:N}` → `{userId,created,mode:"dev"}`. initData-путь — HMAC.
- `GET /api/due?userId=N` → `{userId,now,count,items:[{itemId,prompt,isNew,stability,difficulty,due,reps,lastReview}]}`.
  itemId = `<lessonId>/<cardId>` (напр. `T1.M3.boxing/c1`). Новые айтемы due сразу.
- `POST /api/review {userId,itemId,grade(1..4)}` → `{itemId,grade,difficulty,stability,intervalDays,due,reps,lapses}`.
  Grade: 1=Again,2=Hard,3=Good,4=Easy. FSRS-6 двигает due на сервере (SQLite, durable).
- `GET /api/lessons` → summaries[]; `GET /api/lessons/{id}` → verbatim JSON.
- Backend seed: T1.M3.boxing (cards c1,c2), T2.M5.hashtable (c1). Проверено: due 3→2 после review Good.
- Смоук foundation: dotnet build ok, 12/12 tests, live curl петля работает (due→review→due меняется).

## Ключевые решения
- Два источника уроков синхронизированы по (lessonId, cardId): фронт `src/lessons/*.ts` = БОГАТЫЙ
  контент (segments[] драйвят анимации+engine), бэкенд `seed/lessons/*.json` = каталог due/review.
  Общие id связывают петлю. Уроки БАНДЛЯТСЯ во фронт (RS-15: нет SW на iOS) — прогресс-правда на сервере.
- Движок living-diagram извлечён из concepts/lesson-boxing/index.html в типизированный модуль
  `src/engine/` (render→diff→planFlip→StepPlayer→VizPlayer, 0 зависимостей). Алгоритм сохранён
  (был 40/40 asserts), декуплён от глобалей (ui-строки и состояние инжектятся через cfg).
- LessonRunner (`src/app/lessonRunner.ts`) рендерит ЛЮБОЙ lesson-as-data: hook → segments (каждый
  = мини-анимация + code/IL/predict/console + «Механизм») → MCQ → grade-петля → reconstruct.
- Telegram: `src/telegram/webapp.ts` — если есть window.Telegram.WebApp: ready/expand/themeParams/
  haptics + initData→auth; иначе DEV-FALLBACK (стабильный devUserId в localStorage) → работает в браузере.

## Аддитивные правки бэка (минимальный дифф, тесты 12/12 зелёные)
- `GET /api/stats?userId=` — durable стрик/XP из `progress_events` (Db.GetStats). Нужно, т.к. home
  требует «стрик/XP из бэка», а эндпойнта не было; фабриковать числа запрещено → добавил реальный.
- `LessonSummary.Cards` (кол-во карточек) в `/api/lessons` — чтобы home считал реальный прогресс.
- Seed `T1.M2.value-vs-reference.json` — карточки 2-го урока входят в очередь FSRS.
- `appsettings.json` Cors: добавлен `http://localhost:4173` (preview) к дев-allowlist (был только 5173/3000).

## Грабли
- CORS: preview на :4173 блокировался (allowlist только 5173/3000) → home не грузился в харнессе.
  Фикс — добавил 4173 в дев-allowlist. Для `npm run dev` (5173) правки не нужны.
- TS strict: `stage`/`svg` в VizPlayer — definite-assignment (`!`) и убрал неиспользуемое поле.
- Мисматч карточек: фронт boxing = 1 MCQ, бэк boxing = 2 items (c1,c2). Оставил как есть (бэк-контент
  не трогаю); home показывает реальный due (2), после review c1 → 1. Честно, петля видна.

## Журнал
- 2026-07-09 — Recon бэка + смоук foundation зелёный. Заведены features.md, build-progress.md, evidence/F1..5.
- 2026-07-09 — F1..F5 собраны за один проход: engine извлечён в `app/src/engine/` (типизирован, 0 deps),
  2 урока-данные (boxing 7 сегм. портирован дословно; value-vs-reference 4 сегм., цитаты сверены с MS Learn
  live-curl), generic LessonRunner, api-клиент, Telegram+dev-fallback, home (mid). Backend: 12/12,
  build+run OK. Frontend: `npm run build` OK (22.5KB gz). Harness `node verify/run.mjs` → ALL GREEN
  (F1..F5 + G5). Durability (kill+restart) PASS. Card-answers сверены реальным dotnet. МАЙЛСТОУН 1 достигнут.
- 2026-07-11 — АПГРЕЙД REVIEW/QUIZ: слабое узнавание (MCQ) → сильная генерация (напечатай вывод) +
  объективная проверка + калибровка. Что сделано:
  * ТИПОВАННЫЙ ОТВЕТ: `predict-output` с непустым `verify.expect` рендерит текст-ввод (моно), сверка
    строкой с толерантной нормализацией (trim/CRLF→LF/срез хвостовых пробелов) → объективное ✓/✗;
    на мимо — diff «твой ↔ ожидалось». Нет годного expect (compare/explain) → MCQ-fallback. Панели
    code/console сохранены (`app/src/app/lessonRunner.ts`: buildTyped/buildOptions/typedReveal).
  * ОБЪЕКТИВНЫЙ РЕЗУЛЬТАТ → FSRS-оценка: верно=Хорошо, мимо=Снова — ПРЕДВЫБИРАЕТСЯ; само-оценка
    вторична (можно уточнить Трудно/Легко). Контракт `/api/review` не тронут (grade постится как раньше).
  * КАЛИБРОВКА: «уверен?» да/нет перед раскрытием + реплика после (верно+уверен=отлично · мимо+уверен=
    «переоценил» — ценный сигнал). ПЕРСИСТ: миграция 3 (user_version-gated, forward-only) добавила
    `correct`+`confidence` (NULLABLE) в progress_events; проброшены опц. полями в `/api/review` (default
    null → старый контракт цел); стат «Калибровка» на Прогрессе (Db.GetCalibration). Debug: `window.__lastAnswer`.
  * Миграция ПРОВЕРЕНА на живой codex.db: user_version 2→3, 656 старых строк СОХРАНЕНЫ, колонки добавлены.
  * ДОКАЗАТЕЛЬСТВА (исполнено): `dotnet test -c Release` = 62 PASS (58 базовых + 4 калибровочных).
    `npm run build` чисто. ВСЕ ТРИ харнесса переписаны на typed-flow и ALL GREEN: run.mjs (F1-F6; F6 —
    реальный 60-сек поллинг: мимо→Снова→карта RE-APPEARS в /api/due после learning-step), shell.mjs
    (калибровка персистит end-to-end, ring 100%), new-lessons.mjs (typed ✓ + wrong-path). 0 ошибок консоли.
  * AUTHORING-AI.md обновлён: expect = ОЦЕНИВАЕМЫЙ ответ (typed), options = fallback, лесенка predict→
    modify→explain. Скриншоты: docs/evidence/F-typed/ (before/verdict-ok/verdict-wrong/progress-calibration).
</content>
