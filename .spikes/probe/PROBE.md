# PROBE — Minimal TMA Skeleton + Blazor Static Feasibility
Date: 2026-07-08
Spike type: исполнимость (feasibility), НЕ деливерабл

---

## Environment

| Tool   | Version     | Path                      |
|--------|-------------|---------------------------|
| node   | v26.4.0     | /opt/homebrew/bin/node    |
| npm    | 11.17.0     | /opt/homebrew/bin/npm     |
| npx    | 11.17.0     | /opt/homebrew/bin/npx     |
| dotnet | 10.0.301    | /opt/homebrew/bin/dotnet  |

---

## P1 — Статический TMA-скелет (index.html)

**Файл:** `.spikes/probe/index.html`

**Что сделано:**
- Подключение Telegram WebApp SDK: `<script src="https://telegram.org/js/telegram-web-app.js">`
- Чтение `themeParams` (bg_color, text_color, button_color, colorScheme) + применение через CSS `var(--tg-theme-*)`
- Чтение `initData` (raw) и `initDataUnsafe.user` с отображением
- Одна SRS-карточка (flash card) с кнопками Show / Again / Good
- CloudStorage API: при наличии `tg.CloudStorage` — реальный `setItem/getItem` round-trip;
  вне Telegram — in-memory mock (явно помечается как `[MOCK]`)
- HapticFeedback (selectionChanged при показе ответа, notificationOccurred при рейтинге)

**Что работает В БРАУЗЕРЕ (без Telegram):**
- Открывается статически через `file://` или любой HTTP-сервер
- SDK-скрипт грузится (требует сеть для первого раза, потом кэшируется браузером)
- CSS-переменные `--tg-theme-*` имеют fallback-значения → тёмная тема в браузере
- Mock CloudStorage работает (in-memory), карточка переключается, haptic нет
- Карточка, кнопки, счётчик — всё интерактивно

**Что требует реального Telegram:**
- `tg.initData` — пустая строка вне Telegram (SDK инициализируется, но payload пуст)
- `tg.CloudStorage` — объект существует только внутри TMA в Telegram-клиенте
- `tg.HapticFeedback` — реально работает только на мобильном клиенте Telegram
- `tg.expand()` / `tg.ready()` — вызовы безвредны вне Telegram, но ничего не делают
- themeParams — вне Telegram все поля пусты (используются CSS fallback-а)

**Что требует бота/HTTPS для полного старта:**
- Регистрация Web App через BotFather (нужен токен бота + валидный HTTPS URL)
- Валидация initData — только если есть сервер; client-only MVP обходится без неё
- HTTPS: для хостинга как TMA нужен валидный SSL (GitHub Pages / Cloudflare Pages — бесплатно)

**Грабли:**
- `tg.showToast()` — не существует в стандартном API; правильный метод: `tg.showPopup()` или просто DOM
- `initDataUnsafe` на клиенте — OK для display, НЕЛЬЗЯ доверять на сервере
- CSS `var(--tg-theme-*)` — работают автоматически без JS, но только ВНУТРИ Telegram; снаружи обязателен fallback
- `cloudStorage.setItem` — callback-based в базовом API (не Promise); SDK-обёртки делают Promise

---

## P2 — Blazor WASM как статический сайт

**Команды:**
```sh
dotnet new blazorwasm -n BlazorProbe --no-restore
cd BlazorProbe
dotnet publish -c Release
```

**Результат: PASS** — публикует как чистый статик (wwwroot), нет server-side DLL в выходной папке.

**Размеры (dotnet 10.0.301, БЕЗ wasm-tools, Release, IL trimming):**

| Метрика                     | Размер        |
|-----------------------------|---------------|
| Всего wwwroot (uncompressed)| ~26 MB        |
| _framework (uncompressed)   | ~15 MB        |
| _framework (.br, brotli)    | **~2.8 MB**   |
| dotnet.native.wasm.br       | 960 KB        |
| System.Private.CoreLib.br   | 512 KB        |
| Только .wasm brotli total   | ~2.0 MB       |

**Что работает:**
- `dotnet publish` успешно создаёт `wwwroot/` с `index.html`, `_framework/`, CSS
- Чистый статик — деплоить на GitHub Pages/Cloudflare Pages можно без сервера
- JS-interop с Telegram SDK подключается стандартно (добавить `<script>` в `wwwroot/index.html`)

**Что НЕ работает / требует дополнительных шагов:**
- `wasm-tools` workload не установлен → нет AOT, нет нативного WASM-компилятора:
  `dotnet workload install wasm-tools` нужен для оптимальной trimming + AOT
- Без wasm-tools brotli ~2.8 MB; с wasm-tools + `InvariantGlobalization=true` + agressive trimming
  реально снизить до ~1.5–1.8 MB, но НЕ до уровня JS SPA (<200 KB)
- Telegram WebApp JS bridge подключается ВРУЧНУЮ через IJSRuntime — нет официального Blazor SDK

**Вердикт по Blazor:**
Blazor WASM реально публикуется как статик и может быть TMA. Но:
- ~2.8 MB brotli на холодном старте vs <200 KB JS SPA — разрыв в ~14x
- На слабой мобильной сети (3G, 1 Мбит/с) — 22+ секунд TTI против <2 с у JS
- На кэше — быстрый; проблема только при первом открытии / обновлении рантайма
- Рекомендация: Blazor — на бэкенде/CLI, не на фронте

---

## Итоговая матрица: что заводится, что нет

| Функция                        | В браузере (file://) | В браузере (HTTP) | В Telegram TMA |
|-------------------------------|---------------------|-------------------|----------------|
| Загрузка SDK                  | да (с сетью)        | да                | да             |
| CSS themeParams fallback       | да                  | да                | да (реальные)  |
| initData / user               | пусто               | пусто             | да             |
| CloudStorage setItem/getItem  | mock only           | mock only         | да             |
| HapticFeedback                 | вызов есть, нет эффекта | то же        | да (mobile)    |
| expand() / ready()            | безвредно           | безвредно         | да             |
| Карточка + кнопки (UI)         | да                  | да                | да             |
| Валидация initData (сервер)    | не нужен            | не нужен          | нужен HTTPS+бот|
| Blazor WASM статик-деплой      | да                  | да                | да (тяжело)    |

---

## Сигнал сложности

**light** для статического JS/TS TMA:
- index.html со SDK открывается сразу, без бота и сервера
- mockEnv для локальной разработки — стандартная практика (есть в шаблоне)
- CloudStorage mock тривиален, реальный — только внутри Telegram
- Единственный реальный барьер: нужен бот + HTTPS для тестирования initData и CloudStorage

**medium** для подключения реального бота и деплоя на HTTPS:
- BotFather: `/newbot` → `/newapp` → установить Web App URL — 15 минут
- GitHub Pages: бесплатный HTTPS, автодеплой из шаблона — 30 минут
- Итого: от нуля до реального TMA в Telegram = ~1–2 часа

**heavy-tail** для Blazor WASM TMA:
- Требует wasm-tools, IJSRuntime-обёртки для каждого вызова WebApp API
- Нет официального SDK, нет Telegram-native UI-кита
- ~2.8 MB brotli рантайм — конфликт с UX-целью

---

## Оценка майлстоунов

**Прототип (MVP flash-card TMA, client-only, CloudStorage):**
≈ 3 майлстоуна:
1. Static TMA shell: themeParams + 1 карточка + CloudStorage (2–3 дня)
2. SRS engine (FSRS) + шардинг CloudStorage + очередь due-today (3–4 дня)
3. Деплой на GitHub Pages + бот + BotFather (1 день)

**Готовый продукт (ежедневная SRS-обучалка, геймификация, напоминания):**
≈ 8–10 майлстоунов:
1. Shell + тема + карточка + CloudStorage
2. FSRS engine + шардинг + offline IndexedDB cache
3. PWA / service worker (offline в поездке)
4. Контент-библиотека карточек (C#/.NET/БД/алгоритмы/паттерны) v1
5. Геймификация: streak, XP, лента прогресса, HapticFeedback
6. Бот + напоминания через sendMessage (Bot API)
7. Бэкенд (опция): initData-валидация + синхронизация + аналитика
8. Лидерборды / социальные фичи (опция волны 3)
9. Контент v2 (LLM/Claude/Codex, тюнинг моделей)
10. Шлифовка UX + A/B retention + Production hardening
