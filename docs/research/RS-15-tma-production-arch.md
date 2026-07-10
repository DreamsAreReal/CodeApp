# RS-15 — Прод-архитектура TMA для контент-тяжёлого интерактивного приложения

Линза RS-15. Дата: 2026-07-09 (accessed). Автор: researcher.
Продукт: Telegram Mini App для СЕНЬОР C#-разработчика; много тяжёлых интерактивных
уроков (HTML/JS/SVG + диаграммный движок RS-08 + данные lesson-as-data), ежедневно, в
т.ч. «в поездке» оффлайн, с хорошим перфом на мобиле.
Код/идентификаторы/команды — английский; текст — русский.

Опирается на: RS-02 (TMA-стек, initData, CloudStorage), RS-08 (движок 1.28 КБ,
модель→шаги→FLIP→скраббер), RS-06 (педагогика, замеры аним-либ), PROBE (Blazor 2.8 МБ,
статик-скелет). НЕ переделывает их — достраивает прод-слой доставки/оффлайна/деплоя.

---

## 1. Вопросы линзы

1. Упаковка/доставка уроков: bundling, code-splitting, lazy-load урока, версионирование
   контента; вес одного урока.
2. Offline «в поездке»: PWA/service worker ВНУТРИ Telegram WebView — работает ли,
   ограничения; кэш уроков и ассетов; сверка с офдоком.
3. initData-auth + лёгкий бэкенд (если нужен) + деплой/CI (GitHub/Cloudflare Pages) +
   бот (BotFather, напоминания через sendMessage).
4. Перф-бюджет с многими анимир. сегментами на мобиле: память/джанк, prefers-reduced-motion.
5. Рекомендованная прод-архитектура волны 1 + спайк-кандидаты.

---

## 2. TL;DR (для занятых)

1. **Уроки отдавать как ДАННЫЕ, не как разметку.** Движок RS-08 (1.28 КБ) рендерит
   HTML/SVG из `Scene[]` в рантайме. Спайк RS-15 замерил: экспертный урок «boxing» на
   **7 анимированных сегментов / 55 сцен / 608 снимков-узлов = 1.9 КБ gzip** (96 КБ raw,
   сжатие до 2% из-за структурной повторяемости JSON). Это делает per-lesson-вес почти
   бесплатным и переносит проблему с «веса» на «доставку и оффлайн».
2. **Code-splitting: каждый урок — отдельный чанк, `import()` по требованию.** Vite
   автоматически бьёт динамические импорты в чанки; `manualChunks` изолирует движок и
   опц. аним-либы в стабильный vendor-чанк (кэшируется навсегда по хэшу). Основной бандл
   держим <200 КБ (RS-06 бюджет), уроки грузятся лениво.
3. **ГЛАВНАЯ ПРАВКА к RS-02/RS-06: service worker в Telegram на iOS НЕ РАБОТАЕТ.** Это не
   «инженерная неопределённость», а подтверждённое ограничение: WKWebView без entitlement
   «Web Browser» не даёт Service Worker API (ограничение WebKit); Telegram как мессенджер
   этот entitlement иметь не может. Issue Telegram-Mini-Apps #27 открыт с 2024-07-10, статус
   «in progress». Android и desktop — SW работает. Офдок Telegram про оффлайн/PWA/SW **молчит
   вообще**.
4. **Оффлайн-стратегия — двухпутёвая и ЧЕСТНО деградирующая.** Android/desktop → Workbox
   precache (настоящий оффлайн-shell). iOS → SW нет: (a) lesson-as-data prefetch в
   **IndexedDB** (работает в WKWebView, до ~500 МБ) или **DeviceStorage** (5 МБ, Bot API
   9.0+ — спайк: ~2700 уроков влезает); (b) app-shell на iOS оффлайн-cold-start
   **не гарантируется** (только best-effort HTTP-дисковый кэш WKWebView). Вывод: «открыть
   с нуля без сети» на iOS — не обещать; «уже открыл онлайн → уроки доступны офлайн» —
   реально.
5. **Бэкенд волны 1 не обязателен** (RS-02 подтвердил: client-only на CloudStorage хватает).
   Появляется только ради: push-обновления контента без редеплоя, лидербордов,
   кросс-девайс-конфликтов, аналитики ретеншена. Если берём — **Cloudflare Pages +
   Workers + KV/D1 + Cron Triggers** (один провайдер: статик-CDN, edge-функции,
   планировщик напоминаний). GitHub Pages — только для чистой статики без бэка.
6. **Напоминания о повторениях — через БОТА (`sendMessage`), а не WebApp** (у WebApp нет
   фонового исполнения — RS-02). Нужен планировщик (Cloudflare Cron / любой cron),
   дёргающий bot API по «due today».
7. **Перф-бюджет: узкое место не бандл, а РАНТАЙМ многих одновременных анимаций.**
   Спасает сама архитектура RS-08: скраббер = индекс, в один момент рендерится ОДНА сцена
   одного плеера → число одновременных анимаций естественно ограничено. Плюс: монтировать
   только активный сегмент (виртуализация), гасить офскрин через IntersectionObserver,
   анимировать только transform/opacity (инвариант движка), `prefers-reduced-motion`
   первым классом (движок уже режет переходы, сохраняя шаги — доказано RS-08).

---

## 3. Корпусы и классы источников

| Вопрос | Корпус | Первоисточник (класс) | Покрытие |
|---|---|---|---|
| SW в Telegram iOS/Android | мир (issue+спека платформы) | Telegram-Mini-Apps/issues #27 (B, датир. репорт+повтор), WebKit/Apple-forum root cause (A/B) | покрыто, доказано |
| Офдок Telegram про оффлайн/хранилища | мир (офдок) | core.telegram.org/bots/webapps (A) | покрыто |
| DeviceStorage/SecureStorage лимиты | мир (офдок) | core.telegram.org/bots/webapps (A) | покрыто |
| IndexedDB в WKWebView | мир (практики+спека) | web.dev / dev.to (C/B), Safari 8+ | покрыто (число 500 МБ — средняя) |
| Vite code-splitting/manualChunks | мир (офдок+практики) | vitejs discussion #17730 (B), практики 2025 (C) | покрыто |
| Workbox precache/версионирование | мир (офдок) | vite-pwa-org, developer.chrome.com/workbox (A) | покрыто |
| Перф многих анимаций на мобиле | мир (офдок+практики) | MDN Animation performance (A), Chrome for Devs (A/B) | покрыто |
| Вес урока как lesson-as-data | артефакт | СПАЙК `rs15-lesson-payload` (A, исполнен) | покрыто, посчитано |
| Blazor 2.8 МБ / статик-скелет | артефакт | PROBE (A, исполнен) | покрыто (из RS-02/PROBE) |

PII-предохранитель: людей в корпусе нет — неприменимо.

> Слоп-риск: часть выдач — SEO/AI-агрегаторы (magnetto, ejaw, magicbell, zigpoll). Их брал
> ТОЛЬКО как наводку; load-bearing факты (SW-баг, лимиты, root cause) подтверждены first-party
> (issue-тред Telegram-Mini-Apps, офдок Telegram, WebKit/Apple-forum, офдок Vite/Workbox).
> Инъекций/манипуляций во внешнем контенте не обнаружено.

---

## 4. Находки

### 4.1 Упаковка и доставка уроков (Q1)

**Ship DATA, not markup.** Ядро RS-08 — движок 1.28 КБ, который из декларативной модели
`Scene[]` рендерит SVG/HTML детерминированно. Значит урок = JSON-данные, а не собранная
страница. **Спайк RS-15** (`rs15-lesson-payload/measure.mjs`, исполнен, Node v26.4.0):

```
экспертный урок "boxing": 7 анимированных сегментов, 55 сцен, 608 снимков-узлов
raw JSON:      98 620 B (96.3 KB)
gzip level 9:   1 939 B (1.9 KB)   ← структурная повторяемость сжимает до ~2%
```

Уверенность: high (исполнено). Оговорка: реальный урок с более разнообразным прозаическим
текстом сожмётся хуже; даже при ×10 (≈19 КБ) вывод не меняется — per-lesson вес мизерный
относительно бюджета. Это переносит фокус с «веса» на «доставку и оффлайн».

**Code-splitting и lazy-load (Vite).**
- Каждый урок грузить через **динамический `import()`** (или `fetch` JSON-манифеста урока) —
  Vite автоматически выделяет отдельный чанк на каждый динамический импорт; посетитель
  главного экрана не тянет данные всех уроков. Источник: vitejs discussion #17730,
  практики 2025 (accessed 2026-07-09). Уверенность: high.
- **`build.rollupOptions.manualChunks`** — изолировать движок + опц. аним-либы (anime.js
  13.3 КБ, d3-модули ≤18 КБ из RS-06) в стабильный `vendor`-чанк: меняется редко →
  кэшируется по хэшу «навечно», не инвалидируется при добавлении уроков. Function-форма
  `manualChunks` предпочтительна, когда границы усложняются.
- Основной бандл (shell + движок + StepPlayer) держать < ~200 КБ (бюджет RS-06/R8); уроки —
  вне него, лениво.

**Версионирование контента.**
- **Иммутабельные ассеты по контент-хэшу** — дефолт Vite (`[name].[hash].js`). Хэшированные
  файлы кэшируются `Cache-Control: immutable, max-age=31536000`; при смене контента меняется
  имя → «cache-busting» бесплатный. Источник: developer.chrome.com/workbox precaching,
  vite-pwa-org (accessed 2026-07-09). Уверенность: high.
- **Разделить «индекс» и «тела».** Тонкий `lessons/index.json` (id → version → contentHash →
  url) грузить свежим (short TTL / network-first); тела уроков (`lesson-<id>-<hash>.json`) —
  иммутабельные, cache-forever. Так контент обновляется без редеплоя shell, а офлайн-кэш не
  инвалидируется зря. Поле `version`/`contentHash` в самом уроке (спайк это моделирует) —
  ключ для инвалидации оффлайн-копии в IndexedDB.

### 4.2 Offline «в поездке» (Q2) — ГЛАВНАЯ ПРАВКА к прежним отчётам

**Факт 1 (доказан): Service Worker в Telegram на iOS не работает.**
- Issue `Telegram-Mini-Apps/issues#27` «Service Worker Not Supported in Telegram Mini App on
  iOS»: открыт **2024-07-10**, статус open/«in progress», assignee heyqbnk. Повтор: React-TMA
  с SW → на iOS SW не регистрируется; на Android и macOS — регистрируется и работает.
- **Root cause (first-party):** Service Worker API в WebKit доступен только в Safari,
  приложениях на `SFSafariViewController` и PWA «на домашнем экране»; **внутри `WKWebView` SW
  недоступен без entitlement «Web Browser»**, который Telegram как мессенджер иметь не может.
  Источники: Apple Developer Forums (thread 722160), WebKit blog «Workers at Your Service»
  (accessed 2026-07-09). Уверенность: high (совпали независимый репорт-с-повтором + спека
  платформы).
- Это прямо **корректирует** RS-02 §3.1 и RS-06 R-заметки, где «свой PWA/service worker»
  предлагался как решение оффлайна без оговорки про iOS. На iOS так оффлайн не сделать.

**Факт 2 (офдок): Telegram про оффлайн/PWA/SW/кэш WebView — не пишет ничего.**
core.telegram.org/bots/webapps: 0 упоминаний offline/service worker/PWA/кэширования WebView
(проверено 2026-07-09). Из коробки оффлайна нет — это делается самим приложением.

**Факт 3 (хранилища, офдок, что доступно на iOS без SW):**
- **IndexedDB** — работает в WKWebView (Safari 8+), лимит на iOS ориентировочно ~500 МБ.
  Уверенность: high для факта работы, средняя для числа лимита.
- **DeviceStorage** (Bot API 9.0+): до **5 МБ/пользователь**, локально (не синкается между
  устройствами). Спайк RS-15: при 1.9 КБ/урок в 5 МБ влезает **~2700 уроков**.
- **SecureStorage** (Bot API 9.0+): до **10 элементов** (Keychain/Keystore) — для секретов, не
  для контента.
- **CloudStorage** (Bot API 6.9+): 1024 ключа × 4096 симв — синкается между устройствами; урок
  1.9 КБ raw не влезает в один ключ (нужно ~25 шардов), поэтому CloudStorage — под SRS-прогресс
  (RS-02), НЕ под тела уроков.
- **`window.caches` (Cache Storage API)** доступен из window-scope и без SW, но БЕЗ SW нельзя
  перехватывать навигацию/`fetch` → он бесполезен для оффлайн-загрузки самого shell на iOS.
  Источники: core.telegram.org/bots/webapps, MDN CacheStorage, web.dev offline-data (accessed
  2026-07-09). Уверенность: high (механизм), средняя (число IndexedDB).

**Вывод по оффлайну — двухпутёвая архитектура с честной деградацией:**

| Платформа | App-shell оффлайн (cold-start без сети) | Тела уроков оффлайн | Как |
|---|---|---|---|
| Android / Telegram Desktop | **да** | да | Workbox SW precache (shell+движок) + IndexedDB для уроков |
| iOS | **нет (best-effort HTTP-кэш WKWebView, не гарантирован)** | да, если предзагружены | SW нет → prefetch уроков в IndexedDB/DeviceStorage когда онлайн; shell — надежда на дисковый кэш |

Практический смысл для «в поездке»:
- **Не обещать «открыть приложение с полностью выключенной сетью на iOS».** Это единственный
  сценарий, который не закрывается стандартным вебом в WKWebView.
- **Обещать реально:** «зашёл при живой сети хотя бы раз → уроки предзагружены в IndexedDB →
  дальше листаешь оффлайн в рамках сессии/тёплого старта». SRS-прогресс копится локально
  (IndexedDB/CloudStorage) и синкается при появлении сети (RS-02 `IProgressStore`).
- **Prefetch-стратегия:** при онлайне тянуть N ближайших «due» уроков + следующий по программе
  в IndexedDB заранее (уроки по 1.9 КБ — можно тянуть десятками впрок дёшево).
- Workbox ставить всё равно (Vite PWA plugin): на Android/desktop даёт полноценный оффлайн, на
  iOS просто не активируется — деградация без поломки.

### 4.3 Auth + бэкенд + деплой/CI + бот (Q3)

**initData-auth.** Механизм HMAC-SHA256 доказан спайком RS-02 (`validate.mjs` PASS: genuine=ok,
tampered/wrong-token/stale=fail). Нужен ТОЛЬКО при наличии бэкенда; client-only MVP на
CloudStorage обходится без сервера (RS-02 §3.3, PROBE «light»). На Node —
`@telegram-apps/init-data-node`; на .NET — ~15 строк. `initDataUnsafe` на сервере не доверять
никогда.

**Нужен ли бэкенд в волне 1 — нет по умолчанию.** RS-02 показал: SRS соло-пользователя влезает
в CloudStorage с запасом. Бэкенд появляется ради: (1) **push-обновления контента без редеплоя**
(новые уроки/правки — с сервера, не через сборку), (2) лидерборды/социальное, (3)
кросс-девайс-конфликт-резолюшн, (4) **планировщик напоминаний** (см. бот), (5) аналитика
ретеншена. Пункты (1) и (4) — самые вероятные триггеры для контент-тяжёлого продукта.

**Деплой/CI — развилка по наличию бэкенда:**

| Вариант | Когда | Плюсы | Минусы |
|---|---|---|---|
| **GitHub Pages** | чистая статика, client-only MVP | бесплатно, workflow уже в reactjs-template (RS-02), просто | нет edge-функций/cron → бот-напоминания негде планировать |
| **Cloudflare Pages (+ Workers, KV/D1, Cron Triggers)** | как только нужен бэкенд/cron/контент-API | один провайдер: статик-CDN + edge-функции + KV/D1 + **планировщик (Cron Triggers)** для напоминаний; иммутабельный кэш ассетов; git-интеграция CI | небольшой vendor-lock на Workers-API |

Рекомендация: **старт на GitHub Pages** (быстрее всего, шаблон готов), **переезд на Cloudflare
Pages** в момент, когда понадобится первый серверный кусок (обновляемый контент ИЛИ cron-бот).
Cloudflare выигрывает у GitHub Pages именно наличием Workers+Cron в той же платформе — не нужен
отдельный always-on сервер ради напоминаний.

**Бот (BotFather + напоминания).**
- Регистрация TMA: BotFather `/newbot` → `/newapp`/`/myapps` (Web App URL, валидный HTTPS) →
  `/setmenubutton`; direct-link `t.me/{bot}/{app}` (+ `startapp`). (RS-02 §3.4.)
- **Напоминания о повторениях делает БОТ через `sendMessage`, НЕ WebApp** — у Mini App нет
  фонового исполнения (RS-02 §3.1: `activated`/`deactivated`, становится inactive при
  сворачивании). Нужен планировщик: **Cloudflare Cron Triggers** (или любой cron) периодически
  считает «due today» и шлёт `sendMessage` с кнопкой, открывающей нужный урок/дрилл
  (`startapp`-параметр → deep-link в конкретный сегмент). Это ещё один аргумент за Cloudflare
  волны 2.

### 4.4 Перф-бюджет: много анимир. сегментов на мобиле (Q4)

**Бандл — не проблема.** Движок 1.28 КБ + опц. anime.js 13.3 + опц. d3-модули 18.3 ≈ <35 КБ gz
на весь виз-слой (RS-08 §6); уроки лениво по ~2 КБ. Бюджет <200 КБ (RS-06) держится с запасом.

**Реальный риск — рантайм: много одновременных анимаций → память GPU-слоёв и джанк.**
Практика/офдок (MDN Animation performance, Chrome for Developers, accessed 2026-07-09):
- Каждый анимируемый слой = отдельная GPU-текстура; слишком много слоёв быстро исчерпывают
  память и дают обратный эффект. Анимировать **только transform/opacity** (compositor-поток),
  не layout/paint-свойства (`width/height/top/left/d`).
- `will-change: transform` — точечно (провоцирует промоушен слоя), НЕ на всё подряд (раздувает
  память).
- **Гасить офскрин-анимации через IntersectionObserver**; не запускать всё разом — стаггер.
Уверенность: high (сходятся MDN + Chrome + практики).

**Ключ: архитектура RS-08 сама ограничивает одновременность.** Скраббер = индекс (единственный
источник правды); в один момент виден кадр ОДНОГО шага ОДНОГО плеера. FLIP-переход играет только
между двумя соседними снимками при переключении шага — не N параллельных бесконечных твинов.
Значит «7 сегментов/урок» и «много сцен» НЕ означают «много одновременных анимаций»: активна одна
сцена. Правила на уровне продукта:
- **Виртуализация сегментов:** монтировать в DOM только активный сегмент (и, опц., соседний для
  предзагрузки); остальные — размонтированы или «замороженный кадр» `frame(i)` (SVG-строка,
  RS-08) без живых анимаций.
- **Пауза при неактивности:** на события Telegram `deactivated`/потерю видимости — паузить WAAPI
  (`animation.pause()`); при `activated` — возобновлять. Экономит батарею/CPU в фоне.
- **`prefers-reduced-motion` — первым классом** (не опция): движок RS-08 уже умеет резать FLIP,
  сохраняя шаги и подсветку (доказано спайком RS-08, PASS 7/7). `matchMedia('(prefers-reduced-
  motion: reduce)')` → `reducedMotion:true`. Обязательно для доступности (сеньор мог включить
  системно) и как страховка перфа на слабом железе.
- **Кэп одновременных анимаций** на «густых» сценах (сортировка сотен столбиков): переключать
  такие на Canvas (RS-06 §2.4 / RS-08 §4.4) вместо десятков SVG-твинов.

Не измерено на устройстве (см. §7): реальный FPS FLIP в WebView Telegram на бюджетном Android —
переносится в полевой прогон, как и в RS-06 O3 / RS-08 O2.

---

## 5. Реестр покрытия

| # | Единица | Источник-первооткрыватель | Статус |
|---|---|---|---|
| 1 | Вес урока как lesson-as-data | СПАЙК rs15-lesson-payload (1.9 КБ gz) | покрыто, посчитано |
| 2 | Vite code-splitting / manualChunks | vitejs #17730 + офдок Vite/практики | покрыто |
| 3 | Версионирование по контент-хэшу | developer.chrome.com/workbox, vite-pwa | покрыто |
| 4 | SW в Telegram iOS не работает + root cause | Telegram-Mini-Apps#27 + WebKit/Apple-forum | покрыто, доказано |
| 5 | Офдок Telegram про оффлайн (ничего) | core.telegram.org/bots/webapps | покрыто |
| 6 | DeviceStorage 5МБ / SecureStorage 10 / IndexedDB | офдок Telegram + web.dev | покрыто (IDB-число средняя) |
| 7 | Workbox precache для Android/desktop | vite-pwa-org, Chrome workbox | покрыто |
| 8 | initData-auth (нужен при бэке) | СПАЙК RS-02 validate.mjs PASS | покрыто (из RS-02) |
| 9 | Деплой GH Pages vs Cloudflare Pages+Cron | core.telegram.org + практики | покрыто |
| 10 | Напоминания через bot sendMessage + планировщик | core.telegram.org (RS-02) + Cloudflare Cron | покрыто |
| 11 | Перф многих анимаций (GPU-слои, IO, reduced-motion) | MDN + Chrome for Devs | покрыто |
| 12 | Blazor 2.8 МБ (почему не фронт) | PROBE (исполнено) | покрыто (из PROBE) |

Насыщение открытого корпуса: ключевые узлы (SW-баг, лимиты хранилищ, доставка) подтверждены
first-party ≥2 канала; новые запросы давали те же issue #27 / офдок / Vite-Workbox без новых
load-bearing строк → на этих узлах насыщение. Полевые перф-замеры — вне веб-корпуса (устройство).

---

## 6. Противоречия и риски источников

- **Лимит IndexedDB на iOS** (~500 МБ) — из практик (C/B), не из офдока Apple; число средней
  уверенности. Для нашего кейса некритично: даже консервативные десятки МБ вмещают тысячи уроков
  по 1.9 КБ.
- **«SW на iOS улучшился в 2024-2026»** (агрегаторы magicbell) — относится к Safari/PWA-на-домашнем-
  экране, НЕ к WKWebView-без-entitlement. Для Telegram-iOS не применимо; взял корневую причину из
  WebKit/Apple, а не агрегатор.
- **Ориентир бандла ~650 КБ** (RS-06, из практик Habr) — не офдок; наш бюджет жёстче (<200 КБ shell).
- **Числа сжатия урока** — синтетический урок в спайке структурно повторяем (gzip ×50); реальный
  текст сожмётся слабее. Отмечено, вывод устойчив.
- Инъекций/манипуляций во внешнем контенте не обнаружено.

---

## 7. Что не удалось выяснить (в поле / следующему)

- **O1.** Реально ли WKWebView Telegram-iOS удерживает app-shell в HTTP-дисковом кэше между
  холодными запусками без сети (best-effort) — только на реальном устройстве/сети. Определяет,
  насколько «оффлайн cold-start на iOS» частично работает.
- **O2.** Реальный FPS FLIP-переходов и троттлинг rAF/WAAPI в WebView Telegram на бюджетном
  Android (совпадает с RS-06 O3 / RS-08 O2) — полевой прогон.
- **O3.** Точный лимит IndexedDB/квоты хранилища в WKWebView Telegram (эвикция под давлением
  памяти) — эмпирически в клиенте.
- **O4.** Латентность и rate-limit CloudStorage/DeviceStorage внутри клиента (RS-02 O2/O5 всё ещё
  открыты) — измерять в реальном Telegram.
- **O5.** Поведение SW-precache на Telegram Desktop (Electron/своя обёртка) — работает ли Workbox
  так же, как в Chrome; проверить на десктоп-клиенте.

---

## 8. Рекомендованная прод-архитектура волны 1 + спайк-кандидаты

### 8.1 Архитектура волны 1 (почему лучше альтернатив)

**Фронт:** TypeScript + `@telegram-apps/sdk` на официальном reactjs-template (RS-02),
TON Connect вырезать; движок RS-08 (1.28 КБ) в основном бандле. Blazor-фронт отклонён по PROBE
(2.8 МБ brotli, ~22 c TTI на 3G) — C# остаётся в бэкенде/контент-генераторе, не в TTI.

**Контент:** **lesson-as-data**. Урок = `Scene[]` JSON (~2 КБ gz/урок, спайк). Движок рендерит
в рантайме. Уроки — отдельные чанки, `import()`/`fetch` по требованию; `manualChunks` изолирует
движок+аним-либы в иммутабельный vendor-чанк. Разделить `lessons/index.json` (свежий, network-first)
и тела (иммутабельные по контент-хэшу, cache-forever).

**Персистентность:** SRS-прогресс — CloudStorage + IndexedDB-кэш за интерфейсом `IProgressStore`
(RS-02). Тела уроков оффлайн — IndexedDB (prefetch впрок при онлайне), опц. DeviceStorage (5 МБ ≈
2700 уроков). CloudStorage НЕ под тела уроков (шардинг ×25 — незачем).

**Оффлайн:** Vite PWA plugin (Workbox) — precache shell+движок. Работает на Android/desktop
(настоящий оффлайн-shell), на iOS деградирует без поломки (SW не активируется). iOS-оффлайн уроков
держится на предзагрузке в IndexedDB. **Явно НЕ обещать iOS-cold-start без сети.**

**Auth/бэкенд:** волна 1 — client-only, без сервера (RS-02). Бэкенд — волна 2 при первом из:
обновляемый контент без редеплоя / cron-напоминания / лидерборды. Тогда — Cloudflare Pages +
Workers + KV/D1 + Cron Triggers (один провайдер, есть планировщик для бота); initData-валидация
готова (спайк RS-02).

**Бот:** BotFather-регистрация; напоминания «due today» через `sendMessage` от бота по расписанию
(Cloudflare Cron в волне 2), deep-link `startapp` в конкретный урок/дрилл.

**Деплой/CI:** старт — GitHub Pages (workflow в шаблоне). Переезд на Cloudflare Pages при первом
серверном куске.

**Перф:** активна одна сцена (скраббер-инвариант RS-08); виртуализация сегментов; пауза на
`deactivated`; только transform/opacity; IntersectionObserver для офскрина; `prefers-reduced-motion`
первым классом (движок умеет); Canvas для «густых» сцен. CI-гейт бандла (Lighthouse+Puppeteer
харнесс из RS-06 §6).

**Почему это лучше альтернатив:**
1. lesson-as-data + движок 1.28 КБ бьёт любую «страница-на-урок» сборку по весу (спайк: 1.9 КБ/урок
   против десятков-сотен КБ HTML/JS) — решает контент-тяжесть в корне.
2. Двухпутёвый оффлайн — единственный ЧЕСТНЫЙ вариант с учётом доказанного SW-бага iOS; не обещает
   невозможного, но даёт максимум (уроки офлайн через IndexedDB везде, shell-оффлайн на
   Android/desktop).
3. Client-first (RS-02) → волна 1 без ops/сервера; бэкенд подключается точечно (Cloudflare) ровно
   там, где нужен, с готовым планировщиком под бота.
4. Перф решён архитектурно (одна активная сцена), а не «оптимизацией потом».

### 8.2 Спайк-кандидаты для probe (что собрать и замерить)

- **S1 (PWA-offline в TMA, двухпутёвость):** Vite PWA plugin (Workbox `generateSW`) поверх
  reactjs-template → задеплоить на HTTPS → открыть в реальном Telegram на **Android** (проверить
  оффлайн-shell после первого визита) и на **iOS** (подтвердить, что SW НЕ регистрируется, а уроки
  из IndexedDB всё равно доступны офлайн). Артефакт: таблица «shell/уроки × iOS/Android/desktop ×
  online/offline». Закрывает O1/O5.
- **S2 (lesson-as-data lazy-load, реальные числа):** собрать Vite-проект с 20+ уроков-чанками +
  `manualChunks` (движок/аним в vendor) → замерить: размер основного бандла, размер чанка урока,
  водопад загрузки при открытии урока (Lighthouse/Puppeteer харнесс RS-06). Подтверждает бюджет
  <200 КБ shell и ленивую доставку.
- **S3 (IndexedDB prefetch + версионирование):** мини-модуль `IProgressStore`/`ILessonCache` на
  IndexedDB: prefetch N уроков, инвалидация по `contentHash`, чтение офлайн; прогнать в реальном
  Telegram-iOS (главный кейс без SW). Снять квоту/латентность (O3/O4).
- **S4 (cron-бот напоминаний):** Cloudflare Worker + Cron Trigger, читает «due» из KV, шлёт
  `sendMessage` с `startapp`-deep-link; проверить доставку и открытие нужного сегмента. Валидирует
  волну-2-триггер и выбор Cloudflare.
- **S5 (перф многих сегментов на бюджетном Android):** урок на 7 сегментов/55 сцен в WebView
  Telegram, замерить FPS FLIP, память, поведение виртуализации/паузы и `prefers-reduced-motion`.
  Закрывает O2.

---

## 9. Источники (URL + accessed 2026-07-09)

First-party / спека (A):
1. Telegram Mini Apps офдок (хранилища, отсутствие оффлайна/SW) — https://core.telegram.org/bots/webapps
2. WebKit «Workers at Your Service» (SW доступность) — https://webkit.org/blog/8090/workers-at-your-service/
3. Apple Developer Forums, WKWebView ServiceWorker entitlement (thread 722160) — https://developer.apple.com/forums/thread/722160
4. Vite PWA plugin / Workbox precache — https://vite-pwa-org.netlify.app/guide/service-worker-precache
5. workbox-precaching (ревизии/версионирование) — https://developer.chrome.com/docs/workbox/modules/workbox-precaching
6. MDN Animation performance and frame rate — https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate
7. Chrome for Developers, hardware-accelerated animations — https://developer.chrome.com/blog/hardware-accelerated-animations
8. MDN CacheStorage (window.caches вне SW) — https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage

Практики / issue (B/C):
9. Telegram-Mini-Apps/issues #27 «Service Worker Not Supported on iOS» (open 2024-07-10) —
   https://github.com/Telegram-Mini-Apps/issues/issues/27
10. Vite code-splitting/manualChunks — https://github.com/vitejs/vite/discussions/17730
11. web.dev offline data (IndexedDB/Cache API) — https://web.dev/learn/pwa/offline-data
12. PWA iOS limitations (Safari/WKWebView, контекст) — https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide

Опора на прежние линзы: RS-02 (TMA-стек/initData/CloudStorage), RS-08 (движок/скраббер/reduced-motion),
RS-06 (педагогика/замеры аним-либ/бюджет), PROBE (Blazor 2.8 МБ, статик-скелет).

Артефакт-спайк (первичный, этой линзы):
`/Users/admin/Desktop/test5/.spikes/rs15-lesson-payload/measure.mjs`
(`node measure.mjs` → урок 7 сегментов/55 сцен = **1.9 КБ gz**; DeviceStorage 5МБ ≈ 2700 уроков).
