# GUIDE — онбординг разработчика

Единый гайд «прочитать за один присест»: как устроено приложение, **как работают
анимации** и **как добавить урок**. Читается сверху вниз; за деталями — ссылки на
спеки. Термины/имена файлов — как в репо (английский), пояснения — русские.

> Машинный плейбук для ИИ-авторинга уроков — `docs/AUTHORING-AI.md` (компактный,
> «делай ровно так»). Этот файл — для человека: понять целое, потом идти в плейбук.

## Оглавление
1. [Что это и как устроено](#1-что-это-и-как-устроено)
2. [Как работают анимации (движок «живой диаграммы»)](#2-как-работают-анимации-движок-живой-диаграммы)
3. [Как добавить урок (пошагово)](#3-как-добавить-урок-пошагово)
4. [Петля повторов (FSRS)](#4-петля-повторов-fsrs)
5. [Запуск · верификация · деплой](#5-запуск--верификация--деплой)

---

## 1. Что это и как устроено

Приложение — **Telegram Mini App** для ежедневного обучения сеньор-разработчиков: короткие
глубокие разборы + научная петля запоминания. Это **общий обучающий продукт, а не только
C#**: движок и формат «урок-как-данные» тематически-агностичны, треки на бэке — общие ID
(`T1/T2/…`). Первый выкаченный трек — **фундамент C#/.NET вглубь** (IL, память, GC,
стейт-машины — «как будто я сам спроектировал технологию»); дальше — Python, Claude Code
и другое (тот же движок, просто новые data-файлы уроков). Каждый урок — набор автоиграющих
**анимированных разборов**, привязанных к настоящей петле интервального повторения
**FSRS-6** на сервере. Фронт —
Vite + TypeScript, без UI-фреймворка (статичный бандл). Бэкенд — C#/ASP.NET Core + SQLite.
Раздача **single-origin**: тот же хост отдаёт и SPA, и `/api/*` (для TMA это проще всего —
без CORS).

```
   ┌──────────────────────── Telegram client ────────────────────────┐
   │  Mini App (WebView)                                              │
   │  ┌────────────────────────────────────────────────────────────┐ │
   │  │  Frontend  (Vite / TypeScript, no framework)               │ │
   │  │   main.ts → router → home / lessonRunner / progress / profile │
   │  │   engine/  = living-diagram animation (Scene→SVG→FLIP)     │ │
   │  │   lessons/ = уроки-как-данные (по файлу на урок)           │ │
   │  │   api/client.ts  ── Bearer session token ──┐               │ │
   │  └────────────────────────────────────────────┼──────────────┘ │
   └───────────────────────────────────────────────┼────────────────┘
                                                    │ HTTPS, single origin
                                                    ▼
   ┌──────────────────────── Backend (ASP.NET Core) ─────────────────┐
   │  Program.cs  (minimal-API эндпойнты)                            │
   │   POST /api/auth        initData HMAC / dev-fallback → token    │
   │   GET  /api/due         очередь на сегодня (FSRS)               │
   │   POST /api/review      grade → FSRS-6 двигает расписание       │
   │   GET  /api/stats · /api/progress · /api/lessons · …           │
   │  Fsrs.cs (порт py-fsrs 6.3.1) · ReviewService.cs · Db.cs (SQLite)│
   │  seed/lessons/*.json  = каталог карт для очереди повторов       │
   └─────────────────────────────────────────────────────────────────┘
```

**Петля** (подробно — §4): boot → `POST /api/auth` (initData или dev-`devUserId`) →
home тянет `GET /api/due` (+`/api/stats`, `/api/lessons`, `/api/progress`) → открываешь
урок → смотришь анимации + отвечаешь на карточку → `POST /api/review` → FSRS-6 сдвигает
due-дату на сервере (SQLite) → назад на home: карточка ушла из очереди до следующего due.
Расписание durable на сервере — переживает вайп клиента (iOS WebKit вытесняет storage) и
рестарт бэкенда.

### Карта каталогов (где что лежит)

```
app/                                Frontend (Vite + TS)
  src/
    main.ts                         boot: tg.ready → session.authenticate → router.showHome
    strings.ts                      ВСЕ user-facing строки (язык продукта: ru)
    engine/                         движок «живой диаграммы» (см. §2)
      index.ts                      публичный фасад модуля
      types.ts                      Scene / DiagramNode / Zone / VNode …
      render.ts                     pure Scene→VNode + sizeNode + routeEdge (ortho)
      layout.ts                     auto-layout v2: at:{…} → конкретные x/y/w/h
      diff.ts                       keyed data-join diff + planFlip (FLIP)
      stepPlayer.ts                 goto(i) → tree+diff+flip (без DOM)
      vizPlayer.ts                  DOM/SVG-адаптер: монтирует, играет, predict-гейт, UI
      dom.ts                        SVG-хелперы, motion policy, canvas-измеритель текста
      hlcode.ts · icons.ts          подсветка C#-строк · line-SVG иконки
    lessons/                        УРОКИ-КАК-ДАННЫЕ
      types.ts                      интерфейс LessonData / Segment / Card
      index.ts                      реестр LESSONS (единственное место регистрации)
      closures.ts                   ЭТАЛОН миграции на `at` (5 сегментов; см. §2, §3)
      value-vs-reference.ts · boxing.ts · gc.ts · async-await.ts · hashtable.ts
    app/                            экраны + роутинг
      home.ts                       машина состояний home (deriveHomeState)
      lessonRunner.ts               ГЕНЕРИЧЕСКИЙ рендер любого урока + карточка + grade
      progress.ts · profile.ts      дашборд прогресса · профиль/настройки
      nav.ts · router.ts · session.ts · onboarding.ts · ui.ts · settings.ts
    api/
      client.ts                     типизированный клиент бэкенда (Bearer token)
      types.ts                      типы ответов API
    telegram/webapp.ts              интеграция Telegram WebApp + dev-fallback
    styles/                         дизайн-токены (cream + coral + Rubik) + CSS
  verify/                           headless-харнессы (Playwright) — см. §5
  README.md                         короткий запуск

backend/Codex.Backend/             Backend (ASP.NET Core)
  Program.cs                        конфиг + все minimal-API эндпойнты
  Fsrs.cs                           FsrsScheduler — порт py-fsrs 6.3.1 (§4)
  ReviewService.cs                  read state → advance → persist → append history
  Db.cs                             SQLite (schema, миграции, запросы)
  TelegramAuth.cs                   валидация initData (HMAC-SHA256)
  SessionToken.cs · AuthMiddleware.cs   stateless Bearer-токен + auth-гейт
  CSharpRunner.cs                   DEV-ONLY: Roslyn CSharpScript — считает эталон карты
  LessonStore.cs · Models.cs · Strings.cs
  seed/lessons/*.json               каталог уроков → карты в очередь FSRS
backend/Codex.Backend.Tests/       xUnit (Fsrs / Api / TelegramAuth / SessionToken / ProdConfig)

docs/
  AUTHORING-AI.md                   машинный плейбук авторинга уроков
  design/viz-design-spec.md         числовые правила движка (grid/размеры/рёбра/auto-layout)
  design/lesson-format.md · product-readiness-spec.md
deploy/ · .github/workflows/deploy.yml · DEPLOY.md   деплой (§5)
```

---

## 2. Как работают анимации (движок «живой диаграммы»)

Это ГЛАВНОЕ. Один движок (`app/src/engine/`) рисует КАЖДУЮ анимацию во всех уроках. Он
типизирован, без внешних зависимостей, подложка — только SVG. Числовые правила (сетка,
размеры, рёбра) — в `docs/design/viz-design-spec.md`; здесь — модель и как её читать в коде.

### Модель: от данных к пикселям

Анимация сегмента — это упорядоченный список **кадров** (`Scene[]`). Каждая `Scene` — ЧИСТО
декларативный снимок: набор `nodes[]` (примитивы) + `edges[]` + синхронные UI-подсказки
(`caption`, `codeLine`, `ilLine`, `out`). Никаких пикселей автор не пишет. Конвейер:

```
Scene[]  (данные: узлы объявляют МЕСТО через at:{…}, а не x/y)
   │  layoutScene(scene, zones, measure, viewBox)   ← layout.ts (PURE, детерминизм)
   ▼  каждому узлу проставлены конкретные x/y/w/h
Scene*  (с геометрией)
   │  render(scene, measure)                        ← render.ts (PURE)
   ▼  keyed VNode-дерево (у каждого узла/ребра стабильный key)
VNode
   │  diff(prev, next) → {enter, update, exit}       ← diff.ts (data-join по key)
   │  planFlip(prev, next, diff) → moves[]           ← FLIP (First-Last-Invert-Play)
   ▼
StepPlayer.goto(i)   → { tree, diff, flip }          ← stepPlayer.ts (без DOM)
   │
   ▼
VizPlayer            → монтирует SVG, применяет enter/update/exit,                 ← vizPlayer.ts
                       гоняет FLIP + accent-вспышки через WAAPI,
                       синхронит code/IL/console/caption/scrubber,
                       держит predict-гейт и автоплей.
```

Ключевая идея: `layoutScene` + `render` + `diff` — **чистые** (детерминированные, без DOM,
юнит-тестируемые). Только `VizPlayer`/`dom.ts` трогают DOM. Поэтому «правильность кадра»
доказуема в изоляции (что и делает харнесс `viz-fit.mjs`, §5).

### Примитивы (общий визуальный словарь)

Узел (`DiagramNode`, `types.ts`) — это один из пяти видов (`NodeKind`):

- **`slot`** — именованная ячейка на стеке (`name` + `value`), с разделителем имя|значение.
- **`ref`** — ссылка/делегат (`name` + метка/точка); из неё обычно идёт ребро-стрелка.
- **`obj`** — объект на куче (`typeTag` + `value`); может авто-растягиваться под вложенные поля.
- **`chip`** — компактный бейдж-значение (`value`).
- **`gate`** — «ворота»/проверка (`label` + `detail`), напр. распаковка/проверка типа.

Плюс **`Zone`** — статичный фон-прямоугольник (напр. `СТЕК ПОТОКА` / `GC-КУЧА`) с `id`.
Ребро (`DiagramEdge`) — `{from, to}`; по умолчанию маршрут `ortho` (скруглённый
ортогональный L/Z), опционально `straight`. Флаги `accent/good/state/ghost` красят узел
(accent → coral-вспышка при появлении признака). Как из узла рисуется SVG — см.
`renderNode` в `render.ts`.

### КЛЮЧЕВОЕ: auto-layout `at` (кривой кадр собрать нельзя)

Узел НЕ несёт координат. Он объявляет только **место** — `at`:

- **В зоне:** `at: { zone: <zoneId>, row: <int>, col?: <int> }`. Узлы с одинаковым
  `(zone,row)` образуют РЯД (слева-направо), делят один center-Y; ряды стопкой,
  весь блок центрируется в зоне. Колонки дают стабильный center-X через ряды (2D-таймлайн).
- **Вложенность:** `at: { in: <parentId>, order?: <int> }` — узел кладётся ВНУТРЬ другого
  (напр. поле display-класса внутри его `obj`); родитель **авто-растёт** под детей.
- **Размер** приходит из `sizeNode` (высота по kind, ширина — по 6-ступенчатой лестнице
  `W_LADDER` под измеренный текст). `w/h` писать не надо.

`layoutScene` — чистая детерминированная функция: `at:{…}` → конкретные `x/y/w/h`,
grid-snap, PAD≥8 от границ зоны, выравнивание, ортогональные рёбра. Поскольку позицию
считает ДВИЖОК, а не автор, **кривой/вылезающий/несбалансированный кадр собрать нельзя**.
Если сцена реально не влезает — движок сначала ужимает ширины вниз по лестнице, а если и
на минимальной ступени не входит — **бросает ошибку авторинга** (`layout: zone '…'
overflow …`) вместо тихого визуального бага. Узел без `at` и без `x/y` — тоже ошибка.
Явные `x/y` (без `at`) остаются как escape hatch (snap+clamp в viewBox) для редких случаев.

Мини-диаграмма «как сцена превращается в SVG»:

```
node: { id:"n", kind:"slot",  at:{ zone:"stack", row:0 }, name:"n", value:"1" }
             │
             │  layoutScene: zone "stack" → PAD, ряд row 0 центрируется,
             │  sizeNode → w на лестнице, h=40 (slot) → x/y проставлены
             ▼
node*:{ …, x:83, y:88, w:96, h:40 }
             │  renderNode → <g transform="translate(83,88)" class="node slot">
             ▼            <rect …/> <line …/> <text .vz-name>n</text> <text .vz-val>1</text>
       VNode(key="n:n")
             │  VizPlayer: svgEl(vnode) → реальный <g> в nodeLayer;
             │  между кадрами — diff по key + FLIP-перелёт при смене x/y
             ▼
       <svg> … </svg>   на стадии сегмента (.stage)
```

**Эталон в коде:** `app/src/lessons/closures.ts` — все 5 сегментов на `at` (ряды в зонах,
вложение поля в display-класс, рёбра). Полные числовые правила (grid=2, `KIND_H`,
`W_LADDER`, маршрутизация рёбер, PAD/GUTTER) — `docs/design/viz-design-spec.md`.

---

## 3. Как добавить урок (пошагово)

Урок = ОДИН файл данных. Движок и дизайн — общие; UI урока писать не надо (`LessonRunner`
отрендерит любой `LessonData` через общий движок). Полный плейбук с методикой и правилами
плотности — `docs/AUTHORING-AI.md`; здесь — практический костяк.

### (а) Создать data-файл `app/src/lessons/<slug>.ts`

Экспортируй объект `LessonData` (интерфейс — `app/src/lessons/types.ts`). Он драйвит сразу
три вещи: анимации (`segments[].scenes`), карточку SRS (`cards[]`) и текст урока.
Сегменты размещай ТОЛЬКО через `at` (§2). Карта — `predict-output` с непустым
`verify.expect` рендерится как ТЕКСТОВЫЙ ВВОД (пользователь печатает вывод, сверка строкой);
`expect` — это **реальный stdout** (через `POST /api/authoring/run-csharp`, не «LLM думает»).

Мини-пример (короткий сегмент на `at` + одна карта):

```ts
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// Zone обязана нести id — на него ссылается at:{ zone }.
const Z_STACK: Zone = { id: "stack", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone",
  label: "СТЕК ПОТОКА", labelCls: "vz-zlabel", lx: 83, ly: 24 };

export const mylesson: LessonData = {
  id: "T2.M9.myslug", track: "T2", module: "M9", title: "…", kicker: "…",
  home: { subtitle: "…", icon: "types", estMinutes: 8 },
  prereqs: [], depth: 3, version: "1", status: "self-pass",
  sources: [{ id: "ms-x", kind: "doc", org: "Microsoft Learn", title: "…",
              url: "https://learn.microsoft.com/…", date: "2026-01-20" }],
  spec: [{ text: "«…дословная цитата…»", source: "ms-x" }],
  edgeCases: [], misconceptions: [{ wrong: "…", hook: "HTML…", source: "ms-x" }],
  segments: [
    { id: "s1", num: "01", kicker: "Категория · подпись", title: "Заголовок разбора",
      viewBox: "0 0 340 210", zones: [Z_STACK],
      code: ["int n = 1;"], console: true,
      scenes: [
        { codeLine: 0, out: "1", caption: "Ячейка <code>n</code> на стеке.",
          nodes: [{ id: "n", kind: "slot", at: { zone: "stack", row: 0 }, name: "n", value: "1" }],
          edges: [] },
      ],
      explain: "Механизм — как и почему, с дословной цитатой.", sources: ["ms-x"] },
  ],
  cards: [
    { id: "c1", type: "predict-output", engagementLevel: "responding",
      question: "<code>Console.Write(n);</code> — что напечатает?",
      options: ["1", "0", "null", "err"], correctIndex: 0, xp: 10,
      okText: "…", noText: "…",
      verify: { kind: "exec", run: "dotnet run", expect: "1" }, sourceRefs: ["ms-x"] },
  ],
  takeaways: [{ icon: "why", k: "…", v: "…" }],
  foot: "урок · …",
};
```

### (б) Зарегистрировать в реестре `app/src/lessons/index.ts`

Импортируй файл и добавь объект в массив `LESSONS` (порядок = concept-DAG, prereqs первыми).
Это единственное место регистрации на фронте — ничего в UI не хардкодится.

```ts
import { mylesson } from "./myslug.ts";
export const LESSONS: LessonData[] = [ /* … */, mylesson ];
```

### (в) Добавить seed на бэке `backend/Codex.Backend/seed/lessons/<id>.json`

Seed кладёт карты урока в очередь повторов. **Контракт петли:** элемент повтора на бэке —
`` `${lesson.id}/${card.id}` `` (напр. `T2.M2.closures/c1`). Значит `id` урока и каждый
`card.id` в JSON-сиде ДОЛЖНЫ совпадать с фронтом — иначе карта не попадёт в `GET /api/due`,
и `POST /api/review` уйдёт в никуда. `Program.cs` на старте вызывает `db.SeedItem(item)` для
каждого файла (`LessonStore` читает `seed/lessons/`).

### (г) Прогнать verify

Собери фронт и прогони харнессы (§5): урок должен рендериться, анимация — доигрывать до
финального кадра, карточка — двигать расписание, `viz-fit` — быть зелёным (все узлы влезают,
не клипаются, не перекрываются). Гейт точности перед сдачей — сверить `verify.expect` с
реальным исполнением:

```bash
curl -s -X POST http://localhost:5080/api/authoring/run-csharp \
  -H 'Content-Type: application/json' \
  -d '{"code":"using System; int n = 1; Console.Write(n);"}'
# stdout.trim() ДОЛЖЕН == verify.expect
# ВАЖНО: это Roslyn CSharpScript (top-level statements). НЕ оборачивай в class/Main —
# такой код компилируется, но Main не вызывается → пустой stdout.
```

Полный плейбук (методика RS-09, правила плотности, каталог примитивов, частые ошибки) —
`docs/AUTHORING-AI.md`.

---

## 4. Петля повторов (FSRS)

Каждая карта урока — элемент повтора с id `` `${lesson.id}/${card.id}` `` в SQLite.

**Как карта попадает в очередь.** Seed при старте (`Program.cs` → `db.SeedItem`) заносит
элемент в таблицу `items`. `GET /api/due` (`Program.cs` → `db.GetDue(userId, now)`) отдаёт
элементы, чей `due <= now` (плюс новые, ещё не отвеченные). Home группирует их по `lessonId`
(срез до последнего `/`) и показывает счётчик на уроке.

**Как ответ двигает расписание.** В `lessonRunner.ts`: ответ на карту → объективный вердикт
(typed-сверка с `verify.expect`, либо MCQ-fallback) **предвыбирает** FSRS-оценку (верно →
Good=3, мимо → Again=1); пользователь подтверждает касанием (может уточнить Hard/Easy) →
`api.review(itemId, grade, {correct, confidence})` → `POST /api/review`. На сервере
`ReviewService.Review` читает прошлое FSRS-состояние, зовёт `FsrsScheduler.Review(prev,
elapsedDays, grade)`, персистит новое `due = now + interval` в `review_state` и дописывает
событие в `progress_events` (grade + опциональные `correct`/`confidence` для калибровки).
Вернувшись на home, `GET /api/due` уже не содержит эту карту — счётчик упал. Это НЕ
display-only: расписание durable в SQLite.

**Про FSRS-6.** `Fsrs.cs` — верный порт **py-fsrs 6.3.1** (`fsrs.scheduler.Scheduler`):
полная модель DSR (Difficulty / Stability / Retrievability), 21 вес (`DefaultParameters`
дословно из py-fsrs), краткосрочные термы w17–w19, машина состояний Learning → Review →
Relearning. Мимо (Again) роняет карту в learning-step ~1 мин — ошибка возвращается в этой
же сессии. Осознанное отличие от дефолта py-fsrs: **фаззинг интервалов выключен** (иначе
расписание было бы недетерминированным и непроверяемым). Детали и формулы — `Fsrs.cs`.

---

## 5. Запуск · верификация · деплой

### Запуск (dev, два процесса)

```bash
# 1) Бэкенд на :5080
cd backend/Codex.Backend
ASPNETCORE_ENVIRONMENT=Development ASPNETCORE_URLS=http://localhost:5080 dotnet run --no-launch-profile
# sanity: curl -s http://localhost:5080/health

# 2) Фронт
cd app
npm install
npm run dev                         # dev-сервер → http://localhost:5173
# или прод-сборка для харнессов:
npm run build && npm run preview    # → http://localhost:4173
```

В обычном браузере (без Telegram) фронт использует **dev-fallback** (стабильный `devUserId`),
так что вся петля работает локально. `VITE_API_BASE` переопределяет базу API (по умолчанию
`http://localhost:5080`). Сборка: `npm run build` = `tsc --noEmit && vite build`.

### Верификация (headless, Playwright/Chromium)

Требуют: бэкенд на `:5080` + `npm run preview` на `:4173`. Пишут PNG-доказательства в
`docs/evidence/`. Запуск — напрямую через node (или `npm run verify` для основного).

| Харнесс | Команда | Что доказывает |
|---|---|---|
| **run** | `npm run verify` (= `node verify/run.mjs`) | Walking skeleton end-to-end: home + dev-auth + live due (F1); урок рендерит сегменты и анимация играет (F2); карта → grade → `/api/review` двигает расписание, due падает (F3); второй урок рендерит/играет (F4); reduced-motion + адаптив (F5). |
| **shell** | `node verify/shell.mjs` | Экраны Progress + Profile + общий nav; reduce-motion флип+persist; пустой Progress; **axe** 0 serious/critical; 0 ошибок консоли. |
| **new-lessons** | `node verify/new-lessons.mjs` | Уроки волны-1 (gc/closures/async-await/hashtable): сегменты рендерят, анимация доходит до финального кадра; карта двигает расписание; reduced-motion — статичные финальные кадры; 0 ошибок консоли. |
| **viz-fit** | `node verify/viz-fit.mjs` | AUTHORING-PROOF по ВСЕМ урокам/сегментам: FIT (текст не шире своей области), CLIP (rect в пределах viewBox), OVERLAP (узлы не перекрываются). Прогоняет РЕАЛЬНЫЙ `layoutScene`. `ALL GREEN` = 0 нарушений. |
| **loop** | `node verify/loop.mjs` | Петля возврата + product-readiness: first-run / session / done / empty-new / empty-all; онбординг один раз; стрик без shaming; error+retry на мёртвом API; skeleton-загрузка; axe на hero-состояниях. |

Бэкенд-тесты (xUnit): из корня репо

```bash
dotnet test backend/Codex.Backend.Tests/Codex.Backend.Tests.csproj
# покрытие: Fsrs (golden-векторы py-fsrs) / Api / TelegramAuth / SessionToken / ProdConfig
```

### Деплой (single-origin, Docker/CI с SHA-pin)

Модель — один публичный HTTPS-хост отдаёт и SPA, и `/api/*`. `npm run deploy:pack` собирает
относительный фронт в `backend/Codex.Backend/wwwroot`; бэкенд в Production выключает
`run-csharp` и `/api/dev/*` (403) и работает только внутри Telegram (там есть `initData`).

CI/CD (`.github/workflows/deploy.yml`): push в `main` → `dotnet test` + `npm run build` +
headless `viz-fit` → сборка Docker-образа → push в GHCR под тегом **точного git-sha** (плюс
moving `latest` для людей) → SSH-деплой на VPS, **запиненный на sha-тег** (воспроизводимо,
откатываемо; `:latest` для деплоя не используется). PR-ы гоняют только тесты.

Пути и рецепты: `DEPLOY.md` (быстрый туннель trycloudflare + постоянный хостинг),
`deploy/` (`Dockerfile`, compose, Caddyfile, oracle-free-setup.md),
`deploy/cicd-github-actions.md` (настройка секретов пайплайна).
