# RS-12 — Данные, персистентность, синхронизация, бэкенд (долгосрочный сеньор)

Линза RS-12. Дата: 2026-07-09. Автор: researcher RS-12.
Отчёт — RU; код/идентификаторы/команды — EN.
Строит на: RS-02 (§3.3 персистентность, спайки), RS-05 (§8 guardrails, §4.2 хранилища),
PROBE.md (стек, Blazor-вердикт), brief.md (P0: FSRS-дерево в IndexedDB, CloudStorage — sync).

Уверенность: **[В]** высокая (первоисточник/офдок/артефакт) · **[С]** средняя (вторичка/
практик/суммаризатор) · **[Н]** низкая (SEO/маркетинг). Класс: A первичка · B сообщество
с историей · C авторская · D безавторный SEO.

> Аудитория этой линзы — СЕНЬОР на дистанции **месяцы/годы, возможно несколько устройств**.
> Это смещает акцент с «влезет ли корпус карт» (RS-02 доказал: влезает) на **рост
> append-only истории за годы** и **durability при разрывах использования** — там, где
> план brief.md (bulk в IndexedDB) даёт трещину на iOS. Главная находка — §3.1.

---

## 1. Вопросы линзы

1. **Client-only** (CloudStorage + IndexedDB): хватит ли на генеративную историю /
   калибровку / много треков за годы; **где ломается**.
2. **Минимальный бэкенд**: initData-валидация (HMAC), лёгкая БД (Postgres/SQLite/Supabase),
   sync-модель, конфликты, цена/ops для СОЛО; serverless vs always-on.
3. **Приватность / экспорт данных обучения; бэкап.**
4. **Рекомендация**: client-only для волны 1 + чёткий порог «когда нужен бэкенд» + путь
   миграции. Спайк-кандидаты.

---

## 2. Корпусы и классы источников

| Вопрос | Корпус | Первоисточник (класс) | Покрытие |
|---|---|---|---|
| CloudStorage/DeviceStorage/SecureStorage лимиты | мир (офдок) | core.telegram.org/bots/webapps (A) | покрыто [В] |
| IndexedDB квота/eviction, persist() | мир (офдок) | MDN Storage API (A), WebKit blog (A) | покрыто [В] |
| iOS 7-day eviction (WebKit ITP) | мир (офдок+практики) | MDN + WebKit blog (A), Dexie #739 (B) | покрыто [В] |
| persist() в WKWebView | мир (практики) | MDN persist (A), bugzilla/Dexie (B) | покрыто [С] |
| Рост истории за годы | данные (спайк) | `growth-sizing.mjs` (A, воспроизв.) | покрыто [В] |
| Supabase free/pro лимиты, pause | мир (офдок) | supabase.com/pricing (A) | покрыто [В] |
| Cloudflare Workers/D1 free | мир (офдок) | developers.cloudflare.com/d1 (A) | покрыто [В] |
| initData HMAC | артефакт | СПАЙК `validate.mjs` PASS (A) | покрыто, доказано [В] |
| Sync/конфликты solo multi-device | практики+инженерный вывод | MDN + LWW/append-only анализ | покрыто [С] |
| GDPR минимизация/экспорт | норма | GDPR Art.5/15/20 (A) | покрыто [В] |

PII-предохранитель: корпуса людей нет — контент технический, из первоисточников. Неприменимо.

---

## 3. Находки

### 3.1 ГЛАВНАЯ находка: на iOS IndexedDB — evictable, а НЕ durable. План brief.md уязвим.

`brief.md` P0: «FSRS-дерево offline в **IndexedDB** (без лимита 1024 ключей); CloudStorage —
только лёгкий sync настроек/сводного прогресса». Это делает **IndexedDB источником правды**.
Первоисточники говорят: на iOS это опасно.

- **WebKit удаляет script-writable storage (IndexedDB, localStorage, Cache, SW) после
  7 дней «browser use» без взаимодействия с сайтом.** Дословно (MDN Storage API,
  Proactive eviction): *«If an origin has no user interaction, such as click or tap, in the
  last seven days of browser use, its data created from script will be deleted.»* Это ITP,
  «happens only in Safari»/WebKit. «7 дней использования» ≠ 7 календарных: счётчик тикает в
  дни, когда движок вообще используется. Источник: MDN + webkit.org/blog/14403 (A, 2026-07-09).
  Уверенность: **[В]**.
- **Telegram на iOS = WKWebView (WebKit).** Значит Mini App подпадает под правило (исключение
  «added to home screen» к Mini App НЕ применимо — это не PWA на домашнем экране, а WebView
  внутри Telegram). Уверенность: **[С]** (архитектурно верно; точный счётчик внутри именно
  WKWebView Telegram — проверить спайком, §9).
- **persist() как защита — НЕнадёжна в WKWebView.** `StorageManager.persist()` даёт
  persistent-режим (MDN: persistent-данные «only evicted if the user chooses to»), НО в
  iOS in-app WebView `navigator.storage`/persist() исторически недоступен/возвращает false, и
  практики фиксируют полную потерю IndexedDB на iOS (Dexie.js #739 — датированный отчёт о
  потере данных на iOS 11.3/11.4; bugzilla 1204545). Вывод: **на persist() опираться нельзя**;
  проектировать так, будто IndexedDB на iOS может быть стёрт. Источник: MDN persist + Dexie #739
  (A/B). Уверенность: **[С]** (современный iOS частично добавил StorageManager — точную
  доступность мерить спайком; консервативно — не полагаться).

**Кого это бьёт.** НЕ ежедневного юзера (взаимодействие сбрасывает счётчик). Бьёт **сценарий
разрыва**: отпуск/болезнь/занятая неделя > «7 дней использования Telegram» без открытия
приложения — именно тогда, когда сеньор возвращается и НЕ хочет увидеть стёртое FSRS-дерево
вместо due-очереди. Это ровно тот «в поездке»-риск, что RS-02/RS-05 не вскрыли.

**Почему CloudStorage это чинит.** CloudStorage живёт на серверах Telegram (мост Bot API),
это НЕ браузерное хранилище → **не подпадает под WebKit ITP**, переживает переустановку
клиента и смену устройства. Значит durable-якорь FSRS-состояния — CloudStorage (или бэкенд),
а IndexedDB — рабочий **кэш/offline-копия**, а не источник правды. Источник: core.telegram.org
(A). Уверенность: **[В]**.

> **Коррекция к brief.md P0 (не отмена, уточнение ролей):**
> - **Источник правды FSRS-расписания** = CloudStorage (durable, cross-device, крошечное).
> - **IndexedDB** = offline рабочая копия + кэш «сегодня» + полная история (evictable, ок).
> - Потеря IndexedDB на iOS → регидратация из CloudStorage при следующем открытии (теряется
>   лишь несинхронизированная append-only история, не расписание).

### 3.2 Лимиты клиентских хранилищ (сверено с офдоком 2026-07-09)

- **CloudStorage (Bot API 6.9+):** дословно *«up to 1024 items per user»*; ключ *«1-128
  characters»*, символы *«only A-Z, a-z, 0-9, _ and - »*; значение *«0-4096 characters»*.
  **Rate-limit в доке не специфицирован** — но практики отмечают: сырые Telegram-вызовы
  «~500ms–2s», следить за p95 (docs.telegram-mini-apps.com, C). Char-потолок: 1024×4096 ≈
  **4.19 MB**. Источник: core.telegram.org/bots/webapps (A). Уверенность: лимиты **[В]**,
  отсутствие rate-limit **[С]** (не задокументировано ≠ отсутствует — проверить спайком).
- **DeviceStorage (Bot API 9.0+):** *«up to 5 MB per user»*, локально, offline, НЕ cross-device.
- **SecureStorage (Bot API 9.0+):** *«up to 10 items per user»* (Keychain/Keystore — для токенов).
- **IndexedDB:** best-effort по умолчанию, **evictable** (storage pressure / инактивность /
  превышение квоты). Квота: Firefox — min(10% диска, 10 GiB); persistent — до 50% диска/8 TiB;
  *«another app's embedded WebView … ~150 GiB»* (MDN). НО (см. §3.1) на iOS фактическая
  durability ограничена ITP-eviction. Источник: MDN Storage quotas (A). Уверенность: **[В]**.

### 3.3 Рост данных за годы: где именно ломается client-only (СПАЙК)

Спайк `growth-sizing.mjs` (воспроизв., `node growth-sizing.mjs`) разделяет **ограниченное
состояние** и **безграничную историю** — это ключ ко всему вопросу №1.

**(A) Ограниченное: FSRS-расписание** (размер ~ #карт, НЕ растёт со временем):
- все 2480 карт (RS-04 верх, 7 треков), компактный CSV ~29 симв/карта = **70 KB = 18 ключей
  из 1024 (1.8% бюджета ключей)**. → Влезает в CloudStorage навсегда, с колоссальным запасом.

**(B) Безграничное: append-only история** (генеративные попытки predict/bug/write + калибровка
confidence/Brier + латентность — то, что RS-05 требует для learner-vs-farmer, delayed-retention,
mastery-viz). Строка лога ~42 симв: `20185,1734,3,20,12.34,5.67,2300,0.8,w`. Сеньор ~120
review/день:

| Горизонт | Reviews | Размер истории | % от CloudStorage 4.19 MB | % от DeviceStorage 5 MB |
|---|---|---|---|---|
| 1 год | 43 800 | 1.7 MB | 40% | 32% |
| 3 года | 131 400 | 5.0 MB | **119% (переполнение)** | 95% |
| 5 лет | 219 000 | 8.3 MB | **198%** | **159%** |

**Точки слома (history-only):** CloudStorage-потолок 4.19 MB исчерпан за **~2.5 года**;
DeviceStorage 5 MB — за **~3.2 года** ежедневного сеньора. Источник: СПАЙК (A). Уверенность: **[В]**
(арифметика на офдок-лимитах; параметры — консервативная оценка).

**Вывод по вопросу №1:**
- FSRS-**расписание** → client-only (CloudStorage durable + IndexedDB кэш) хватает
  **на неопределённый срок**.
- Полная генеративно-калибровочная **история** → в CloudStorage/DeviceStorage НЕ помещается на
  дистанции лет И туда её писать не следует (каждый setItem — сетевой round-trip ~0.5–2s;
  120 строк/день = шторм запросов). Её место — **IndexedDB** (evictable, но история —
  не core-loop-critical: это аналитика). В CloudStorage кладём только **свёрнутые сводки**
  (mastery per node, агрегатный Brier, streak) — это и есть «лёгкий sync прогресса» из brief.md.
- **Где ломается client-only окончательно:** когда сеньор хочет СОХРАНИТЬ многолетнюю историю
  калибровки/генерации как ценность (не потерять при iOS-eviction и не упереться в потолок за
  ~2.5–3 года). Это и есть порог бэкенда (§3.6).

### 3.4 Sync-модель и конфликты для СОЛО multi-device

Solo = один человек, обычно одно устройство за раз; конфликт редок (телефон↔планшет). Не нужны
CRDT. Достаточно двух простых правил по типу данных:

- **FSRS-расписание (mutable, per-card):** **per-card Last-Write-Wins по `last_review`
  timestamp.** Для каждого cardId держим запись с максимальным `last_review` — более свежий
  обзор авторитетен, т.к. FSRS-состояние выводится из последовательности обзоров.
  Гранулярность — карта, НЕ блоб (иначе перезапишешь чужие карты с другого устройства).
- **Append-only история (immutable):** **union-merge с дедупом по `(ts,cardId)`.** Логи
  сливаются тривиально, конфликтов по природе нет.
- **CloudStorage как транспорт:** шардируем состояние по ключам (трек/батч, §3.5); на чтении —
  читаем все шарды, в приложении делаем per-card LWW-merge, пишем назад. CloudStorage сам —
  KV per-user; при записи одного ключа с двух устройств у Telegram last-write-wins (гранулярность
  не задокументирована — RS-02 открытый вопрос #3), поэтому merge держим В ПРИЛОЖЕНИИ, не полагаясь
  на Telegram. Уверенность: **[С]** (инженерный вывод; проверить спайком на 2 устройствах).

### 3.5 Схема раскладки (client-only, волна 1)

| Данные | Хранилище | Ключи/структура | Роль |
|---|---|---|---|
| FSRS-расписание (durable) | **CloudStorage** | `fsrs:<track>:<shard>` (≤18 ключей), + `settings`, `due:today` | источник правды, cross-device |
| FSRS-дерево (рабочая копия) | **IndexedDB** | object store `cards` | offline-петля, регидрат. из CloudStorage |
| Генеративно-калибр. история | **IndexedDB** | object store `reviews` (append-only), прунинг/cap | аналитика, learner-vs-farmer, mastery-viz |
| Сводный прогресс (mastery, Brier, streak) | **CloudStorage** | `summary` (1 ключ) | лёгкий sync между устройствами |
| Секреты/токены (если появятся) | **SecureStorage** | ≤10 | не для волны 1 (client-only без бэка) |

Всё за интерфейсом **`IProgressStore`** (get/put/sync/export) — RS-02 §3.3. Подмена реализации
на бэкенд без переписывания домена.

### 3.6 Минимальный бэкенд: когда, из чего, почём (вопрос №2)

**Auth.** initData-валидация HMAC-SHA256 — механизм доказан спайком `validate.mjs` (PASS: genuine
ok / tampered fail / wrong-token fail / stale fail). На Node — `@telegram-apps/init-data-node`;
на .NET — ~15 строк. `initDataUnsafe` на сервере не доверять никогда. Источник: RS-02 §3.1 +
СПАЙК (A). Уверенность: **[В]**.

**Выбор БД/платформы для СОЛО (serverless vs always-on):**

| Вариант | Free-лимиты (офдок 2026-07-09) | Ops для соло | Ловушки | Вердикт |
|---|---|---|---|---|
| **Cloudflare Workers + D1** | 100k req/день, D1 5 GB, 5M row-read/день, 100k row-write/день; сброс 00:00 UTC | ~ноль (scale-to-zero) | при превышении дневного write — 429 до полуночи UTC | **выбор, когда нужен бэкенд** [В] |
| Supabase (Postgres) | 500 MB БД, 5 GB egress, 50k MAU, 500k edge-fn; **пауза после 1 нед. инактивности**; **бэкапов на free НЕТ** | низкий, но пауза | **1-нед пауза = 30s cold wake** для личного app, что открывают нерегулярно; free без бэкапов | батарейки (auth/realtime), но пауза — ops-грабля для соло [В] |
| Supabase Pro | $25/мес; **пауза never**; бэкапы 7 дней; 8 GB | низкий | платно | когда история/бэкап критичны и есть бюджет [В] |
| VPS + SQLite/Postgres (always-on) | ~$5/мес | **высокий** (патчи, uptime, бэкапы вручную) | ops-бремя на соло-джуна | не для волны 1/2 [С] |

**Почему Cloudflare Workers+D1, а не Supabase-free, когда бэкенд понадобится:** для ЛИЧНОГО
приложения, которое сам разработчик может не трогать неделю, Supabase-free **паузит проект
после 1 недели инактивности** (офдок) → следующий sync ловит 30s cold-wake или требует
разбудить проект. Cloudflare Workers **не паузятся по инактивности** и дают 100k req/день
бесплатно; D1 — это SQLite (совпадает с «один файл, просто», бэкап через export). Serverless
(scale-to-zero) для соло бьёт always-on VPS по ops. Источник: supabase.com/pricing,
developers.cloudflare.com/d1 (A). Уверенность: **[В]**.

**Порог «когда нужен бэкенд» (любой из):**
1. **Durability многолетней истории** — хотим НЕ потерять генеративно-калибровочную историю при
   iOS-eviction и не упереться в потолок ~2.5–3 года (§3.3). ← главный для сеньора-долгосрочника.
2. **Обновление контента без релиза фронта** (новые карты/треки волнами — RS-04).
3. **Cross-device сверх CloudStorage-sync** (реальный конфликт-резолюшн, история на всех устройствах).
4. **Гарантированный бэкап/экспорт** (client-only бэкапа не даёт — §3.7).
5. Server-side existence-check/verification пайплайн для G3 — но это **build-time**, не runtime;
   бэкенд для рантайма ради G3 НЕ нужен.

### 3.7 Приватность, экспорт, бэкап (вопрос №3)

- **Данные обучения = псевдонимные:** Telegram user id (из initData) как псевдоним; контент
  технический, PII нет. GDPR Art.5(1)(c) минимизация (RS-05 G7): собирать только нужное под
  цель, агрегировать события на клиенте, consent отдельно от сервиса. Источник: GDPR (A).
  Уверенность: **[В]**.
- **Экспорт (GDPR Art.15/20 право доступа/переносимости):** кнопка **«Выгрузить мои данные» →
  JSON** (FSRS-состояние + история из IndexedDB + сводка из CloudStorage). Один артефакт решает
  ТРИ задачи: право на переносимость, ручной бэкап, payload миграции на бэкенд. Уверенность: **[В]**.
- **Бэкап — слабое место client-only:** CloudStorage — у Telegram, привязан к аккаунту; при
  потере аккаунта данные теряются; автобэкапа нет. IndexedDB — evictable (§3.1). → Для волны 1
  бэкап = **экспорт-в-файл** (ручной/периодическое напоминание) + durable-якорь FSRS в
  CloudStorage. Реальные бэкапы даёт только бэкенд (D1 export / Supabase Pro 7 дней; **Supabase
  free — без бэкапов**). Уверенность: **[В]**.
- Импорт JSON обратно (восстановление/перенос) — парный к экспорту, дешёвый, обязателен.

---

## 4. Варианты и трейдофы (со спайками)

**Персистентность волны 1 (рекомендация):** CloudStorage(durable FSRS+summary) + IndexedDB(кэш+
история) за `IProgressStore`. Спайк-доказательства: `srs-sizing.mjs` (влезает), `growth-sizing.mjs`
(где ломается), `validate.mjs` (auth готов). Кандидат-бэкенд Cloudflare Workers+D1 — по описанию/
офдоку; **до реального прогона не рекомендуется как решение** (спайк §9 P-B).

**Отвергнуто:**
- *IndexedDB как источник правды (план brief.md буквально)* — на iOS уязвим к 7-дневному
  eviction (§3.1). Оставляем IndexedDB кэшем, правду двигаем в CloudStorage.
- *История в CloudStorage/DeviceStorage* — потолок за ~2.5–3 года + сетевой шторм (§3.3).
- *Supabase-free как первый бэкенд* — пауза по инактивности + нет бэкапов (§3.6).
- *Always-on VPS для соло* — ops-бремя (§3.6).

---

## 5. Реестр покрытия

| # | Единица | Источник-первооткрыватель | Статус |
|---|---|---|---|
| 1 | CloudStorage 1024/4096/128, символы | core.telegram.org (A) | покрыто [В] |
| 2 | DeviceStorage 5MB / SecureStorage 10 | core.telegram.org (A) | покрыто [В] |
| 3 | CloudStorage rate-limit не задокумент. | core.telegram.org + практик | покрыто, [С] (спайк §9) |
| 4 | IndexedDB best-effort/evictable, квоты | MDN Storage API (A) | покрыто [В] |
| 5 | WebKit 7-day eviction script-storage | MDN + webkit.org/blog/14403 (A) | покрыто [В] |
| 6 | persist() ненадёжен в WKWebView | MDN persist + Dexie #739 (A/B) | покрыто [С] |
| 7 | Рост истории → слом ~2.5–3 года | СПАЙК growth-sizing.mjs (A) | покрыто, посчитано [В] |
| 8 | FSRS-расписание = 1.8% ключей CloudStorage | СПАЙК (A) | покрыто [В] |
| 9 | initData HMAC валидация | СПАЙК validate.mjs PASS (A) | доказано [В] |
| 10 | Supabase free 500MB/1нед пауза/без бэкапов | supabase.com/pricing (A) | покрыто [В] |
| 11 | Cloudflare D1 free 5GB/100k write/день, no-pause | developers.cloudflare.com/d1 (A) | покрыто [В] |
| 12 | Sync: per-card LWW + append union | инженерный вывод | покрыто [С] |
| 13 | GDPR минимизация/экспорт/переносимость | GDPR Art.5/15/20 (A) | покрыто [В] |

**Критерий остановки:** открытый корпус (веб-обзор). База >6 единиц по под-вопросам; последние
запросы (persist-в-WKWebView, rate-limit) добавляли <5% нового ядра. Ядро (лимиты, eviction, рост,
бэкенд-цена) насыщено. Хвост (точный счётчик eviction ВНУТРИ Telegram-WKWebView; реальная
CloudStorage-latency/rate-limit) — требует спайка в живом клиенте → §9, ДЕГРАДИРОВАНО до замера.

---

## 6. Противоречия источников

- **persist() на iOS:** старые отчёты (Dexie #739, bugzilla) — `navigator.storage` undefined на
  iOS; современный iOS (16.4+) частично добавил StorageManager. Не конфликт, а тренд → консервативно:
  **не полагаться на persist()**, проектировать под возможный eviction. [С]
- **CloudStorage rate-limit:** офдок молчит; практик (docs.telegram-mini-apps, C) советует беречь
  p95 и не спамить. «Не задокументировано» ≠ «нет» → пишем батчами, не по строке. [С]
- **Supabase free-лимиты:** офиц. (supabase.com/pricing, A) vs SEO-агрегаторы (D, aiagencyplus и
  пр., выданные поиском). Взял ТОЛЬКО офиц. значения; SEO — лишь наводка. Инъекций не обнаружено.
- **Квота IndexedDB в WebView (~150 GiB, MDN)** описывает потолок РАЗМЕРА, но НЕ отменяет
  ITP-eviction по инактивности — это разные механизмы; путать нельзя.

---

## 7. Что не удалось выяснить (→ спайк/следующий researcher)

1. Точный счётчик 7-дневного eviction ВНУТРИ WKWebView Telegram (Safari-счётчик vs собственный у
   WebView) — измерить только в живом iOS-клиенте (не открывать 8+ «дней использования», проверить
   выживание IndexedDB). [С→спайк]
2. Реальная latency и наличие/порог rate-limit `CloudStorage.setItem/getItem` внутри клиента —
   мерить в живом Telegram на телефоне (нельзя вне Telegram — RS-02 открытый #2/#5).
3. Гранулярность конфликта CloudStorage при записи одного ключа с 2 устройств (RS-02 #3).
4. Доступность `StorageManager.persist()` в актуальном Telegram-WKWebView (true/false на целевых iOS).

---

## 8. Рекомендация (почему лучше альтернатив)

**Волна 1 — client-only, но с исправленными ролями хранилищ:**

1. **Источник правды FSRS-расписания → CloudStorage** (durable, cross-device, не под ITP,
   18/1024 ключей). **IndexedDB → рабочий кэш + offline-петля + append-only история**
   (evictable — ок, регидрат. из CloudStorage). Это чинит iOS-eviction-риск, который несёт
   буквальный план brief.md «правда в IndexedDB» (§3.1). Всё за `IProgressStore`.
2. **История/калибровка → IndexedDB, свёрнутые сводки → CloudStorage.** Полную историю в облако
   не писать (потолок ~2.5–3 года + сетевой шторм; §3.3). «Лёгкий sync прогресса» из brief.md =
   именно сводки (mastery/Brier/streak) — согласуется.
3. **Sync = per-card LWW по `last_review` + append-union по `(ts,cardId)`**, merge в приложении,
   не полагаясь на Telegram-семантику (§3.4). CRDT не нужны для соло.
4. **Экспорт/импорт JSON — обязателен в волне 1** (GDPR Art.15/20 + единственный бэкап client-only +
   payload миграции). Периодическое напоминание «выгрузи данные». (§3.7)
5. **Бэкенд — отложенная опция.** Порог — §3.6 (durability многолетней истории / обновление
   контента без релиза / гарантир. бэкап). Когда придёт — **Cloudflare Workers + D1**, НЕ
   Supabase-free (пауза по инактивности + нет бэкапов) и НЕ VPS (ops-бремя). Миграция: initData-HMAC
   (спайк готов) → залить экспорт-JSON → бэкенд = правда, CloudStorage = sync-hint/кэш; реализация
   `IProgressStore` подменяется.

**Почему лучше альтернатив.** «Правда в IndexedDB» (brief буквально) — теряет FSRS-дерево на iOS
при разрыве >7 дней использования (первоисточник WebKit/MDN). «История в CloudStorage» — упирается
в потолок за ~2.5 года (спайк). «Сразу бэкенд» — лишние ops/деньги соло-джуну, когда CloudStorage
несёт durable-расписание бесплатно. «Supabase-free как бэкенд» — паузится и не бэкапит.
Предложенное = durable там, где нужно (расписание), дёшево-и-offline там, где потеря терпима
(история), с чистым порогом и путём миграции.

---

## 9. Спайк-кандидаты (что реально собрать/замерить)

- **P-A (CloudStorage реальный лимит-тест, ЗАПРОШЕН ТЗ):** мини-страница `setItem/getItem` крупных
  значений (4096 симв., много ключей), запуск в **живом Telegram на телефоне** → снять latency,
  проверить лимиты 4096/1024 эмпирически, поймать наличие rate-limit при burst-записи. Закрывает §7.2.
- **P-B (Cloudflare Workers+D1 бэкенд, кандидат):** `wrangler` → Worker с initData-HMAC middleware
  + D1-таблицы `cards`/`reviews`; прогнать 4 initData-кейса (PASS) + upsert-merge (per-card LWW) +
  append-union. Артефакт = вывод `wrangler dev` + миграция. Обязателен ДО рекомендации бэкенда (§5).
- **P-C (iOS eviction, durability):** IndexedDB + запись → в живом iOS-Telegram НЕ открывать
  приложение серию «дней использования» → проверить, стёрлось ли; проверить `persist()` true/false.
  Закрывает §7.1/§7.4.
- **P-D (экспорт/импорт round-trip):** экспорт всего `IProgressStore` в JSON → wipe → импорт →
  сверить FSRS-состояние идентично. Дешёвый, доказывает бэкап/переносимость (§3.7).
- **Готово:** `validate.mjs` (initData HMAC PASS), `srs-sizing.mjs` (влезает), `growth-sizing.mjs`
  (где ломается) — воспроизводимы `node <file>`.

---

## Источники (URL + дата обращения 2026-07-09)

- Telegram Mini Apps (CloudStorage/DeviceStorage/SecureStorage лимиты, initData) —
  https://core.telegram.org/bots/webapps
- MDN Storage quotas and eviction criteria (best-effort/persistent, proactive 7-day eviction) —
  https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- WebKit blog, Updates to Storage Policy (14403) — https://webkit.org/blog/14403/updates-to-storage-policy/
- WebKit «Full Third-Party Cookie Blocking and More» (7-day cap, first-party) —
  https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
- MDN StorageManager.persist() — https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
- Dexie.js #739 (iOS потеря IndexedDB, практик) — https://github.com/dfahlander/Dexie.js/issues/739
- Supabase Pricing (free/pro, пауза, бэкапы) — https://supabase.com/pricing
- Cloudflare D1 limits (free 5GB/100k write/день, no-pause) — https://developers.cloudflare.com/d1/platform/limits/
- Cloudflare Workers pricing — https://developers.cloudflare.com/workers/platform/pricing/
- @telegram-apps/init-data-node (npm) — https://www.npmjs.com/package/@telegram-apps/init-data-node
- GDPR Art.5 (минимизация) — https://gdpr-info.eu/art-5-gdpr/ ; Art.15/20 (доступ/переносимость) —
  https://gdpr-info.eu/art-15-gdpr/ , https://gdpr-info.eu/art-20-gdpr/

### Артефакты спайков
- /Users/admin/Desktop/test5/.spikes/tma-initdata-validation/validate.mjs — initData HMAC PASS
- /Users/admin/Desktop/test5/.spikes/tma-initdata-validation/srs-sizing.mjs — корпус влезает
- /Users/admin/Desktop/test5/.spikes/tma-initdata-validation/growth-sizing.mjs — где ломается (~2.5–3 года)
