# RS-02 — Telegram Mini App: платформа, стек фронта, персистентность SRS, UX-ограничения

Линза R2 фазы 1. Дата: 2026-07-08. Автор: researcher R2.
Отчёт — RU; код/команды/идентификаторы — EN.

> ДЕГРАДИРОВАНО (частично): MCP-инструменты (Microsoft Learn, Context7, PubMed) в этом
> прогоне НЕ были доступны в наборе функций — ToolSearch отсутствует. Факты по .NET/Blazor
> и SDK взяты напрямую с first-party веба (learn.microsoft.com, core.telegram.org, GitHub,
> npm) через WebFetch/WebSearch. Там, где число пришло через модель-суммаризатор WebFetch,
> уверенность помечена «средняя» и требует финальной проверки probe (см. §5, §9).

---

## 1. TL;DR

- **Mini App = обычное web-приложение в WebView внутри Telegram.** Управляется JS-мостом
  `window.Telegram.WebApp` (+ SDK). Значит, ЛЮБОЙ статический фронт (JS/TS ИЛИ Blazor WASM)
  технически запускается. Вопрос не «работает ли», а «холодный старт и вес».
- **Auth = валидация `initData` на сервере по HMAC-SHA256.** Механизм проверен спайком
  (артефакт PASS): подлинная нагрузка проходит, подмена поля / чужой токен / протухший
  `auth_date` — отклоняются. Это единственный корректный способ доверять `user.id`.
- **Персистентность SRS реально влезает в client-only `CloudStorage`.** Лимиты: 1024 ключа
  на пользователя, значение ≤4096 символов. Спайк-расчёт: ~141 карта в один ключ при
  компактной упаковке → реалистичный корпус джуна (~2000 карт) занимает ~15 из 1024 ключей.
  Бэкенд для соло-джуна на старте НЕ обязателен.
- **Blazor WASM честный вердикт: пригоден как TMA, но платит холодным стартом.** Минимальный
  фреймворк-пейлоад ~1.3–1.8 МБ (brotli) даже после trimming — против <100 КБ у JS/TS-SDK
  приложения. Для сценария «в поездке на телефоне каждый день» это секунды TTI на слабой
  сети. Педагогический бонус (учиться из C#-кодовой базы) реален, но противоречит UX-цели
  «не больно». Рекомендация — §8.
- **Хостинг — тривиальный:** любой статик-хостинг с HTTPS (GitHub Pages / Cloudflare Pages /
  Vercel / Netlify). Официальный `reactjs-template` уже везёт GitHub Actions-деплой на Pages.
  Привязка в BotFather: `/myapps` (Web App URL) + `/setmenubutton` + direct-link `t.me/{bot}/{app}`.

---

## 2. Корпусы и классы источников

| Вопрос | Корпус | Первоисточник (класс) | Покрытие |
|---|---|---|---|
| WebApp JS API, initData, CloudStorage лимиты | мир (офдок) | core.telegram.org/bots/webapps (A) | покрыто |
| initData validation алгоритм | артефакт | СПАЙК `.spikes/tma-initdata-validation` (A, воспроизводимо) | покрыто, PASS |
| @telegram-apps SDK, шаблоны | мир (репозиторий/npm) | github.com/Telegram-Mini-Apps (A/B), npm (A) | покрыто |
| Blazor WASM размер/старт | мир (офдок + практики) | learn.microsoft.com (A), dotnet/aspnetcore issue #41909 (B), Meziantou (B) | покрыто, число «среднее» |
| CloudStorage sizing для SRS | данные | СПАЙК `srs-sizing.mjs` (A) | покрыто |
| Хостинг/BotFather | мир (офдок + практики) | core.telegram.org, docs.telegram-mini-apps.com (B) | покрыто |

PII-предохранитель: корпуса пользователя с людьми нет — неприменимо.

---

## 3. Находки по под-темам

### 3.1 Как устроены Mini Apps (платформа)

- **Среда исполнения** — WebView внутри клиента Telegram; мост `window.Telegram.WebApp`
  (подключается скриптом `https://telegram.org/js/telegram-web-app.js`, либо через SDK).
  Источник: core.telegram.org/bots/webapps (2026-07-08). Уверенность: высокая.

- **initData / initDataUnsafe.** Поля: `query_id`, `user` (WebAppUser), `receiver`, `chat`,
  `chat_type`, `chat_instance`, `start_param`, `can_send_after`, `auth_date` (unix),
  `hash`, и новый `signature` (Ed25519 для third-party валидации без токена бота).
  `initDataUnsafe` — распарсенный объект БЕЗ проверки, доверять ему на сервере НЕЛЬЗЯ;
  доверяем только `initData`-строке после HMAC-проверки. Источник: core.telegram.org
  /bots/webapps (2026-07-08). Уверенность: высокая.

- **Валидация `initData` (HMAC-SHA256).** Алгоритм (проверен спайком, §5):
  1. `data_check_string` = все поля кроме `hash` (и `signature`), отсортированы по ключу,
     каждое как `key=value`, склеены `\n`.
  2. `secret_key = HMAC_SHA256(key="WebAppData", message=<bot_token>)`.
  3. `hash == hex(HMAC_SHA256(key=secret_key, message=data_check_string))`.
  4. Дополнительно проверить свежесть `auth_date` (защита от replay).
  Порядок аргументов HMAC критичен: ключ — строка `"WebAppData"`, сообщение — токен бота.
  Источник: core.telegram.org/bots/webapps + СПАЙК PASS (2026-07-08). Уверенность: высокая.

- **Ed25519 signature (third-party валидация без токена).** Новый метод: `signature` +
  `data_check_string` вида `{bot_id}:WebAppData\n{sorted_pairs}`, проверяется публичным
  ключом Telegram (production public key упоминается как `e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d`).
  Предупреждение: подпись может быть без base64-padding — дополнить `=`. Источник:
  docs.telegram-mini-apps.com/platform/init-data (B, 2026-07-08). Уверенность: средняя
  (публичный ключ и точная схема — проверить probe перед использованием).

- **themeParams / colorScheme.** `WebApp.themeParams` (bg_color, text_color, hint_color,
  link_color, button_color, button_text_color, secondary_bg_color, и расширенные в 7.0+),
  `WebApp.colorScheme` (`light`/`dark`), событие `themeChanged`. Используем для нативного
  вида. Источник: core.telegram.org/bots/webapps. Уверенность: высокая.

- **Viewport / expand.** `viewportHeight` (обновляется в реальном времени, низкий refresh),
  `viewportStableHeight` (стабильная высота после анимаций — на неё завязывать layout),
  `isExpanded`, метод `expand()` до максимальной высоты. Fullscreen-режим добавлен в Bot
  API 8.0. Источник: core.telegram.org/bots/webapps. Уверенность: высокая (детали 8.0 —
  средняя).

- **Кнопки и хаптика (нативный UX).**
  - `MainButton` / `SecondaryButton` (BottomButton): `setText`, `show/hide`, `enable/disable`,
    `showProgress(leaveActive)`, `hideProgress`, `setParams`, `onClick/offClick`.
  - `BackButton`: `show/hide`, `onClick/offClick`.
  - `SettingsButton`: `show/hide`, `onClick/offClick`.
  - `HapticFeedback`: `impactOccurred(light|medium|heavy|rigid|soft)`,
    `notificationOccurred(error|success|warning)`, `selectionChanged()`.
  Хаптика — дешёвый и сильный инструмент «сочности»/дофамина для геймификации (важно для
  ежедневной привычки). Источник: core.telegram.org/bots/webapps. Уверенность: высокая.

- **Хранилища на клиенте:**
  - `CloudStorage` (Bot API 6.9+): синхронизируется между устройствами пользователя, живёт
    у Telegram, привязка per-user-per-bot. Лимиты: **1024 ключа/пользователь**, ключ
    **1–128 символов** из `[A-Za-z0-9_-]`, значение **0–4096 символов**. API асинхронный
    (`setItem/getItem/getItems/removeItem/getKeys`, callback/Promise).
  - `DeviceStorage` (Bot API 9.0+): локально на устройстве, до ~5 МБ/пользователь (НЕ
    синхронизируется между устройствами).
  - `SecureStorage` (Bot API 9.0+): ~10 элементов, защищённое хранилище.
  - Плюс обычные WebView-хранилища (`localStorage`, `IndexedDB`) — но они НЕ синхронизируются
    между устройствами и могут чиститься; для кросс-девайс SRS предпочтителен `CloudStorage`.
  Источник: core.telegram.org/bots/webapps (лимиты — 2026-07-08). Уверенность: лимиты
  CloudStorage — высокая; версии DeviceStorage/SecureStorage — средняя.

- **Launch flow.** Открытие: меню-кнопка, inline-кнопка `web_app`, attachment menu, или
  direct link `t.me/{bot}/{app}` (+ `start_param`). При старте: `WebApp.ready()`,
  затем `expand()`; параметры запуска — в `initData`. Источник: core.telegram.org/bots/webapps.
  Уверенность: высокая.

- **Ограничения (важно для «в поездке / каждый день»):**
  - **Нет настоящего фонового исполнения.** Mini App становится `inactive` при сворачивании
    (события `activated`/`deactivated`); пуши/напоминания о повторениях делает БОТ
    (`sendMessage`), а не сам WebApp. Это архитектурный факт: «напомнить повторить» = бот.
  - **Оффлайн не гарантирован из коробки.** В доках нет механизма оффлайн-кэша; чтобы
    приложение открывалось без сети в поездке, нужен свой **PWA/service worker** (кэш
    ассетов) + локальный кэш прогресса (IndexedDB), а `CloudStorage`-синк — при появлении сети.
  - **HTTPS обязателен** (валидный SSL) для URL приложения.
  Источник: core.telegram.org/bots/webapps. Уверенность: высокая (по факту ограничений),
  вывод про PWA — инженерный (средняя).

### 3.2 Стек фронта: кандидаты и трейдофы

- **@telegram-apps SDK (JS/TS), v3.x.** Монорепо `github.com/Telegram-Mini-Apps/telegram-apps`
  (ранее `tma.js`), MIT, активно поддерживается (релизы 2026 г., напр. `@tma.js/sdk-solid@3.0.22`
  от 2026-06-20; ~1.2k звёзд, >4700 коммитов). Пакеты: `@telegram-apps/sdk` (ядро),
  `-sdk-react`, `-sdk-vue`, `-sdk-solid`, `@telegram-apps/init-data-node` (серверная
  валидация initData на Node), `@telegram-apps/telegram-ui` (готовые нативные компоненты).
  Скаффолдинг: `npx @telegram-apps/create-mini-app` (интерактивно; шаблоны React/Vue/Solid/
  Vanilla-JS). Источник: github.com/Telegram-Mini-Apps, npm (2026-07-08). Уверенность: высокая.

- **Официальный `reactjs-template`.** React + `@telegram-apps/sdk-react` + `@telegram-apps/
  telegram-ui` + TypeScript + Vite + TON Connect + `src/mockEnv.ts` (эмуляция Telegram-среды
  для локальной разработки) + GitHub Actions деплой на GitHub Pages. ~421★, ~139 коммитов,
  TS 92%. Готовая стартовая точка. Источник: github.com/Telegram-Mini-Apps/reactjs-template
  (2026-07-08). Уверенность: высокая. Примечание: TON Connect не нужен обучалке — вырезать.

- **Blazor WebAssembly (C#) как TMA — честная оценка.**
  - Технически работает: это статический web-app в WebView, JS-мост Telegram дергается через
    `IJSRuntime`.
  - **Вес фреймворка (главный минус):** минимальный Blazor WASM в .NET 8 — ~1.3 МБ (сжатый),
    у практиков даже при агрессивной оптимизации (trimming + brotli + InvariantGlobalization +
    выключенный timezone) ~1.8 МБ (issue #41909, .NET 6-эра). AOT НЕ уменьшает, а ~удваивает
    размер (компромисс «загрузка ↔ рантайм»); IL-trimming after AOT и `WasmStripILAfterAOT`
    частично компенсируют. `jiterpreter` (.NET 8+) даёт рантайм-ускорение (MS: +20% рендер,
    2× JSON) без AOT-пейлоада. Native AOT «production-ready» заявлен только с .NET 10.
    Источник: learn.microsoft.com/.../performance/app-download-size (обновл. 2025-11-12),
    dotnet/aspnetcore#41909 (2022-05-29), Meziantou (2020). Уверенность: числа — средняя
    (нужен probe-замер на актуальном .NET), тренд — высокая.
  - **TTI:** для «открыть в поездке на телефоне» разница 1.3–2 МБ WASM-рантайма vs <100 КБ
    JS/TS-бандла — это единицы секунд холодного старта на слабой сети → прямой конфликт с
    UX-целью «не больно». Мобильные жалобы (>15 c на слабой сети) в issue #41909.
  - **Плюс:** пользователь — C#-джун и ХОЧЕТ учиться из кодовой базы; Blazor даёт единый язык
    фронта, домена и (возможного) бэкенда. Но это learning-цель, а не UX-цель.
  - Зрелость: экосистема зрелая (компоненты MudBlazor/Radzen), но НЕТ Telegram-native UI-кита
    уровня `@telegram-apps/telegram-ui` и НЕТ официального Telegram-Blazor-SDK — мост к
    `WebApp` пишется вручную через JS interop.

### 3.3 Персистентность прогресса SRS

- **(a) Client-only на `CloudStorage` — рекомендуемый старт для соло-джуна.** Спайк-расчёт
  (`srs-sizing.mjs`): компактная упаковка карты FSRS (`id,dueDays,stab,diff,reps,lapses,state`)
  ≈29 симв. → ~141 карта в один 4096-символьный ключ; 1024 ключа → ~144k карт (теор. максимум);
  реалистичные ~2000 карт → ~15 ключей. Значит client-only ФИЗИЧЕСКИ хватает с огромным
  запасом. Трейдофы: нет серверной валидации записей/анти-чита (для соло не важно), нет
  общих лидербордов/аналитики, синхронизация требует сети, конфликты между устройствами
  надо решать самому (last-write-wins по `auth_date`/версии). Дерево интервальных повторений
  хранить как: 1 ключ = метаданные/настройки, N ключей-шардов = батчи карт (JSON или CSV-пак),
  1 ключ = очередь «due today» для быстрого старта. Источник: лимиты — core.telegram.org;
  вместимость — СПАЙК (2026-07-08). Уверенность: высокая.

- **(b) Serverless (Cloudflare Workers / Vercel Functions + KV/D1/Postgres).** Нужен, если
  захочется: серверная верификация initData, общие лидерборды, обновляемый контент/карты
  без релиза фронта, кросс-девайс конфликт-резолюшн, аналитика ретеншена. Стоимость входа —
  низкая, но добавляет ops. Уверенность: высокая (архитектурно), детали лимитов провайдеров —
  вне линзы.

- **(c) Небольшой бэкенд ASP.NET Core / Node + БД (Postgres/SQLite/Supabase).** Auth — та же
  серверная валидация initData (спайк доказал механизм; на Node — `@telegram-apps/
  init-data-node`, на .NET — вручную HMAC-SHA256, ~15 строк). SQLite — идеален для соло
  (один файл, ноль ops); Postgres/Supabase — когда нужен managed + realtime. Минус для
  джуна-соло: постоянный сервер = деньги + аптайм + деплой. Уверенность: высокая.

- **Вывод по персистентности:** старт — **CloudStorage + IndexedDB-кэш** за чистым
  интерфейсом `IProgressStore` (get/put/sync), чтобы позже без переписывания подменить на
  бэкенд. «Правда» SRS-дерева на старте — у клиента (CloudStorage), бэкенд — опция волны 2.

### 3.4 Хостинг, бот, CI

- **Статик-хостинг (любой с HTTPS):** GitHub Pages (бесплатно, HTTPS, `https://{user}.github.io/
  {repo}/`), Cloudflare Pages, Vercel, Netlify. TMA нужен лишь валидный HTTPS-URL. Источник:
  core.telegram.org/bots/webapps, docs.telegram-mini-apps.com (2026-07-08). Уверенность: высокая.
- **BotFather:** `/newbot` → создать бота; `/newapp` или `/myapps` → задать Web App URL;
  `/setmenubutton` → кнопка-меню в чате; direct link `t.me/{bot}/{app}` (+ `startapp` параметр).
  Требуется валидный SSL/HTTPS. Уверенность: высокая.
- **CI:** официальный `reactjs-template` уже содержит GitHub Actions workflow, деплоящий на
  Pages при push в master (+ `gh-pages` для ручного деплоя). Уверенность: высокая.

---

## 4. Сравнительные таблицы

### 4.1 Фронт-стек для TMA

| Критерий | Vanilla TS + SDK | React/Solid + @telegram-apps SDK | Blazor WASM (C#) |
|---|---|---|---|
| Холодный старт (пейлоад) | наименьший (<100 КБ реально) | малый (десятки–сотни КБ) | **1.3–1.8 МБ+ рантайм (brotli)** |
| TTI на слабой мобильной сети | лучший | хороший | **худший (секунды)** |
| Telegram-native UI-кит | вручную | **`@telegram-apps/telegram-ui`** | нет (писать самому) |
| Официальный SDK/шаблон | да (vanilla) | **да (reactjs/vue/solid-template)** | нет офиц. Telegram-SDK |
| JS-мост к `WebApp` | прямой | обёртки/хуки | ручной JS interop |
| Learning-ценность для C#-джуна | средняя | средняя (учит TS/React) | **высокая (весь код на C#)** |
| Зрелость экосистемы под TMA | высокая | **высокая** | низкая (под TMA) |
| Единый язык фронт+бэк | нет | нет | **да (C#)** |

Вывод: по UX-цели «быстро и не больно каждый день на телефоне» выигрывает JS/TS + SDK; по
learning-цели «как будто я сам всё написал на C#» тянет Blazor. Это два РАЗНЫХ приоритета —
решение выносится на гейт (§8, §10).

### 4.2 Персистентность SRS

| Вариант | Ops для соло | Кросс-девайс | Вместимость | Серверная валидация/аналитика | Когда выбирать |
|---|---|---|---|---|---|
| CloudStorage (client-only) | ноль | да (через Telegram) | ~144k карт теор. / ~2000 = 15 ключей | нет | **старт, соло** |
| IndexedDB/localStorage | ноль | нет | большая | нет | оффлайн-кэш поверх CloudStorage |
| Serverless + KV/D1 | низкий | да | большая | да | лидерборды/обновляемый контент |
| Backend (ASP.NET/Node)+БД | средний | да | большая | да | многопольз., аналитика ретеншена |

### 4.3 Хостинг

| Хостинг | Цена | HTTPS | CI из коробки | Заметка |
|---|---|---|---|---|
| GitHub Pages | free | да | да (в reactjs-template) | проще всего для соло |
| Cloudflare Pages | free-tier | да | да | + Workers/KV если нужен serverless |
| Vercel | free-tier | да | да | удобно, но vendor-lock на функции |
| Netlify | free-tier | да | да | аналогично |

---

## 5. Реестр покрытия и артефакты спайков

| # | Единица | Источник-первооткрыватель | Статус |
|---|---|---|---|
| 1 | WebApp JS API surface | core.telegram.org/bots/webapps | покрыто |
| 2 | initData HMAC validation | СПАЙК validate.mjs (PASS) | покрыто, доказано |
| 3 | CloudStorage лимиты 1024/4096 | core.telegram.org | покрыто |
| 4 | SRS вместимость в CloudStorage | СПАЙК srs-sizing.mjs | покрыто, посчитано |
| 5 | @telegram-apps SDK/шаблоны | GitHub org + npm | покрыто |
| 6 | Blazor WASM размер/старт | learn.microsoft.com + #41909 | покрыто (число «среднее») |
| 7 | Хостинг + BotFather | core.telegram.org + community docs | покрыто |
| 8 | Ed25519 third-party validation | docs.telegram-mini-apps.com | частично (проверить probe) |

Артефакты (воспроизводимо):
- `/.spikes/tma-initdata-validation/validate.mjs` — `node validate.mjs` →
  `SPIKE RESULT: PASS`, exit 0. Кейсы A/B/C/D: genuine=ok, tampered=fail, wrong-token=fail,
  stale=не свежий. Доказывает корректность HMAC-схемы и tamper-detection.
- `/.spikes/tma-initdata-validation/srs-sizing.mjs` — `node srs-sizing.mjs` →
  141 карта/ключ (компакт), ~144k теор. максимум, ~2000 карт = 15 ключей.

---

## 6. Противоречия и риски источников

- **Числа Blazor размазаны по версиям .NET.** 1.3 МБ (.NET 8, MS-док) vs 1.8 МБ (.NET 6,
  практик, агрессивно) vs 6.8 МБ (старый тред без оптимизаций). Все пришли частично через
  модель-суммаризатор WebFetch. → probe обязан замерить на ЦЕЛЕВОМ .NET (9/10) фактический
  brotli-размер `_framework` и TTI. До замера — уверенность «средняя».
- **Версии Bot API для отдельных фич** (SettingsButton, DeviceStorage) получены через
  суммаризатор — возможна неточность на ±минор. Load-bearing факты (лимиты CloudStorage,
  алгоритм initData) — проверены независимо (спайк/офдок).
- **Ed25519 public key** — из community-доков (B). Не использовать как «истину» без сверки с
  core.telegram.org напрямую (антициркулярность).
- Инъекций/манипуляций во внешнем контенте не обнаружено.

---

## 7. Что не удалось выяснить (для probe / следующего researcher-а)

1. Фактический brotli-размер и cold-TTI минимального Blazor WASM на .NET 9/10 в WebView
   Telegram на среднем Android (нужен реальный `dotnet publish` + замер).
2. Реальная latency `CloudStorage.setItem/getItem` ВНУТРИ клиента Telegram (нельзя измерить
   вне Telegram; нужен тест в реальном клиенте на телефоне).
3. Поведение CloudStorage при конфликте записей с двух устройств (last-write-wins? какая
   гранулярность?).
4. Точная актуальная схема Ed25519-валидации и public key с первоисточника.
5. Есть ли жёсткий rate-limit на CloudStorage-операции (в доках не нашёл числа).

---

## 8. Рекомендации для ТЗ/дизайна

1. **Фронт по умолчанию — TypeScript + `@telegram-apps/sdk` (+ опционально Solid/React) на
   базе официального шаблона**, TON Connect вырезать. Обоснование: наименьший холодный старт,
   Telegram-native UI-кит, официальный SDK+CI+mockEnv — прямо бьёт в UX-цель «быстро и не больно
   каждый день». Learning-ценность на C# добираем на БЭКЕНДЕ/контент-генераторе (см. п.5).
2. **Персистентность SRS — client-first на CloudStorage** за интерфейсом `IProgressStore`
   (+ IndexedDB-кэш для оффлайна), схема шардинга из §3.3. Бэкенд — отложенная опция (волна 2),
   не блокер MVP.
3. **Auth — серверная валидация initData** только если появляется бэкенд; механизм готов
   (спайк). На Node — `@telegram-apps/init-data-node`; на .NET — ~15 строк HMAC-SHA256.
   `initDataUnsafe` на сервере не доверять никогда.
4. **UX-ограничения зафиксировать как требования:** (a) напоминания о повторениях — через
   БОТА (`sendMessage`), не WebApp; (b) оффлайн — свой PWA/service worker + локальный кэш;
   (c) layout завязывать на `viewportStableHeight`, вызывать `ready()`+`expand()`; (d)
   активно использовать `HapticFeedback` и `MainButton`/`BackButton` для «сочности» и
   нативности (дешёвый вклад в ежедневную привычку).
5. **Blazor как ОТДЕЛЬНЫЙ обучающий трек, а не как фронт MVP.** Если хочется учиться из
   C#-кодовой базы — вынести C# в бэкенд/генератор контента/CLI-инструменты, где вес не
   бьёт по TTI. Вариант «Blazor-фронт» держать как явную развилку на гейте с пониманием
   цены холодного старта (числа — после probe).
6. **Хостинг MVP — GitHub Pages** (шаблон уже везёт workflow); переезд на Cloudflare Pages —
   когда понадобится serverless-функция для валидации/лидербордов.

## 9. Спайк-кандидаты для probe (что реально собрать и замерить)

- **P1 (head-to-head размер/старт):** `npx @telegram-apps/create-mini-app` (React/Solid) →
  `npm run build` → измерить gzip/brotli размер `dist` + Lighthouse TTI (mobile throttle).
  Против: минимальный Blazor WASM `dotnet publish -c Release` (.NET 9/10, trimming+
  InvariantGlobalization) → brotli-размер `_framework` + cold TTI. Это ЧИСЛОВОЙ ответ на
  главную развилку стека.
- **P2 (initData в реальном .NET-бэке):** воспроизвести спайк §5 на ASP.NET Core middleware,
  прогнать те же 4 кейса → PASS.
- **P3 (CloudStorage round-trip):** мини-страница с `setItem/getItem` больших значений,
  запустить в РЕАЛЬНОМ Telegram на телефоне, снять latency и проверить лимит 4096/1024
  эмпирически.
- **P4 (оффлайн):** PWA service worker поверх шаблона — открыть без сети, проверить кэш
  ассетов + отложенную синхронизацию CloudStorage.

---

## 10. Импликации для гейта пользователя

- **Развилка стека (SCOPE/PLANK):** JS/TS+SDK (UX-приоритет, быстрый старт) vs Blazor WASM
  (learning-приоритет «весь код на C#», цена — секунды холодного старта). Числа для решения
  даст probe P1.
- **Компромисс:** JS/TS-фронт + C#-бэкенд/контент-генератор — закрывает ОБЕ цели, C# остаётся
  языком, из которого пользователь учится, без удара по TTI.
- **Persistence-решение:** MVP без бэкенда (CloudStorage) реально возможен — можно стартовать
  «tracer-bullet» быстрее; бэкенд — как явная волна 2.
- **Оффлайн/«в поездке»** — не бесплатен: требует PWA-работы, заложить в план как отдельную
  фичу, а не «само получится».

---

## Источники (URL + дата обращения 2026-07-08)

- Telegram Mini Apps (офдок, платформа/CloudStorage/initData/кнопки/viewport):
  https://core.telegram.org/bots/webapps
- Init Data (community docs, Ed25519/HMAC): https://docs.telegram-mini-apps.com/platform/init-data
- @telegram-apps SDK (npm): https://www.npmjs.com/package/@telegram-apps/sdk
- @telegram-apps/init-data-node (npm): https://www.npmjs.com/package/@telegram-apps/init-data-node
- @telegram-apps/create-mini-app (npm): https://www.npmjs.com/package/@telegram-apps/create-mini-app
- Монорепо: https://github.com/Telegram-Mini-Apps/telegram-apps
- Официальный React-шаблон: https://github.com/Telegram-Mini-Apps/reactjs-template
- Blazor app download size (learn.microsoft.com, обновл. 2025-11-12):
  https://learn.microsoft.com/en-us/aspnet/core/blazor/performance/app-download-size?view=aspnetcore-9.0
- Blazor WASM build tools & AOT: https://learn.microsoft.com/en-us/aspnet/core/blazor/webassembly-build-tools-and-aot
- dotnet/aspnetcore issue #41909 (размер/старт, практики, 2022-05-29):
  https://github.com/dotnet/aspnetcore/issues/41909
- Meziantou, оптимизация размера Blazor WASM (2020): https://www.meziantou.net/optimizing-a-blazor-webassembly-application-size.htm
- Getting App Link / Creating New App (BotFather): https://docs.telegram-mini-apps.com/platform/getting-app-link

### Артефакты спайков
- /Users/admin/Desktop/test5/.spikes/tma-initdata-validation/validate.mjs (PASS)
- /Users/admin/Desktop/test5/.spikes/tma-initdata-validation/srs-sizing.mjs
