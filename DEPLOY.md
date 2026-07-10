# Deploy — запуск как настоящего Telegram Mini App

Приложение построено под **single-origin**: бэкенд C#/ASP.NET раздаёт и сам фронтенд
(`wwwroot`), и API (`/api/*`) с одного HTTPS-хоста. Значит для Telegram нужен **один**
публичный HTTPS-URL, без CORS-возни. Аутентификация уже настоящая: `initData` проверяется
HMAC-SHA256 с токеном твоего бота (`TelegramAuth.cs`), `initDataUnsafe` не доверяется.

Что уже готово и проверено локально (без Telegram): single-origin раздача, реальный
HMAC round-trip (подпись → проверка тем же токеном → `mode:"telegram"`), отклонение
подделанного `initData` (401), и prod-локдаун (`/api/dev/*` и `run-csharp` → 403).

---

## Что делаю я и что делаешь ТЫ

**Turnkey (сделано в коде):** single-origin раздача, prod-конфиг (`appsettings.Production.json`:
`DevMode:false`), относительная сборка фронта, скрипт упаковки `npm run deploy:pack`.

**Только ты (я не могу — это твой аккаунт и твой секрет):**
1. Создать бота в @BotFather (нужен твой Telegram).
2. Токен бота — это **секрет**. Передавай его бэкенду **только через переменную окружения**
   `Telegram__BotToken` в СВОём терминале. Не коммить его, не вставляй в чат.
3. Запустить публичный HTTPS-туннель (он открывает твою машину наружу — запускаешь ты).
4. Прописать URL Mini App в BotFather.

---

## Путь A — быстрый тест с телефона (бесплатно, без аккаунта, ~5 минут)

Эфемерный туннель `trycloudflare.com`. URL меняется при каждом запуске — для разовой проверки
петли с телефона идеально.

### 1. Создай бота (в Telegram, @BotFather)
- `/newbot` → имя + username → получишь **токен** вида `123456789:AAE...` (это секрет).
- Он же понадобится в шаге 3.

### 2. Упакуй фронт в бэкенд (turnkey)
```bash
cd /Users/admin/Desktop/test5/app
npm run deploy:pack     # relative-сборка → backend/Codex.Backend/wwwroot
```

### 3. Запусти бэкенд с настоящим токеном (single origin, Production = локдаун)
Подставь свой токен вместо `<TOKEN>` (это делаешь в своём терминале — через `! ...` в этой
сессии или в обычном шелле):
```bash
ASPNETCORE_ENVIRONMENT=Production ASPNETCORE_URLS=http://localhost:5080 \
  Telegram__BotToken='<TOKEN>' \
  dotnet run --project /Users/admin/Desktop/test5/backend/Codex.Backend -c Release --no-launch-profile
# проверка: curl -s http://localhost:5080/health  и открой http://localhost:5080/ (отдаёт приложение)
```

### 4. Подними HTTPS-туннель (открывает машину наружу — запускаешь ты)
```bash
brew install cloudflared                       # один раз
cloudflared tunnel --url http://localhost:5080 # печатает https://<random>.trycloudflare.com
```
Скопируй выданный `https://<random>.trycloudflare.com`.

### 5. Пропиши URL в BotFather
@BotFather → `/mybots` → твой бот → **Bot Settings → Configure Mini App → Enable** →
вставь `https://<random>.trycloudflare.com`. (Либо `/newapp` и укажи тот же URL.)

### 6. Открой с телефона
Открой бота в Telegram → кнопка меню / Mini App. Приложение откроется с настоящим
`initData`, бэкенд проверит его HMAC твоим токеном → `mode:"telegram"`, петля FSRS пойдёт.

> **Важно:** в Production приложение работает ТОЛЬКО внутри Telegram (там есть `initData`).
> В обычном браузере `initData` нет → dev-обхода в Production нет (403) → увидишь «нет связи».
> Это правильно. Тестируй в Telegram (мобильный ИЛИ Telegram Desktop — он тоже открывает Mini Apps).
> Туннель `trycloudflare` эфемерный: при перезапуске URL меняется — обнови его в BotFather.

---

## Путь B — постоянный хостинг (стабильный URL)

**Рекомендованный бесплатный путь под «много проектов на одной коробке»:**
`deploy/oracle-free-setup.md` — Oracle Always Free ARM-VM + Caddy (авто-HTTPS), приложение
контейнером с SQLite на volume. Артефакты: `deploy/Dockerfile` (single-origin, multi-arch/ARM),
`deploy/docker-compose.yml`, `deploy/Caddyfile.example`, `deploy/.env.example`. Fly.io в 2026
платный (~$2/мес за инстанс, множится на число проектов); Render free — эфемерный диск, SQLite
стирается (нужен переезд на Postgres). Для одной коробки под много проектов бесплатно = Oracle.

Общий рецепт для ЛЮБОГО хоста с постоянным HTTPS (свой VPS и т.п.):

1. `cd app && npm run deploy:pack` — фронт уедет в `backend/Codex.Backend/wwwroot`.
2. Опубликуй бэкенд: `dotnet publish backend/Codex.Backend -c Release -o out` (папка `out`
   содержит и `wwwroot`, и `appsettings.Production.json`, и `seed/`).
3. На хосте задай окружение: `ASPNETCORE_ENVIRONMENT=Production`, `Telegram__BotToken=<TOKEN>`,
   слушать на `$PORT` (`ASPNETCORE_URLS=http://0.0.0.0:$PORT`); TLS терминирует хост/прокси.
4. БД `codex.db` (SQLite) — на постоянном диске/volume, чтобы расписание переживало рестарты.
5. В BotFather пропиши стабильный `https://<домен>` как URL Mini App.

---

## Проверка перед деплоем (то, что я гоняю локально)
```bash
# single origin + реальный HMAC + локдаун — без Telegram:
curl -s http://localhost:5080/                         # 200, HTML приложения
curl -s http://localhost:5080/api/lessons              # 200, 6 уроков
# в Production dev-эндпоинты закрыты:
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:5080/api/auth -d '{"devUserId":1}' -H 'Content-Type: application/json'  # 403
```

## Безопасность (жёстко)
- Токен бота — секрет. Только env `Telegram__BotToken`. Не в git, не в appsettings, не в чат.
- `appsettings.Production.json` держит `BotToken:""` намеренно — реальное значение приходит из env.
- Production выключает `run-csharp` и `/api/dev/*` (это авторские dev-инструменты, не для прода).
