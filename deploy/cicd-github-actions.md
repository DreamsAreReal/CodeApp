# CI/CD — авто-деплой на твой VPS через GitHub Actions

Пайплайн `.github/workflows/deploy.yml`: **push в `main` → тесты → сборка образа → push в
GHCR → SSH-деплой на VPS**. После разовой настройки секретов деплой идёт **без твоего участия**.
PR-ы гоняют только тесты.

```
push main ─▶ test (dotnet test + npm build) ─▶ build image ─▶ push ghcr.io/<owner>/<repo>
                                                                     │
                                                       ssh VPS ◀─────┘
                                                       docker compose pull && up -d  (образ обновлён)
```

Образ single-origin (фронт+API в одном контейнере), SQLite на docker-volume `codexdata`
(переживает деплои). GHCR-аутентификация — встроенный `GITHUB_TOKEN`, отдельный PAT не нужен.

---

## Разово: секреты репозитория (только ты — это твои доступы)
GitHub → репозиторий → **Settings → Secrets and variables → Actions → New repository secret**:

| Секрет | Что это |
|---|---|
| `VPS_HOST` | IP или хост твоего VPS |
| `VPS_USER` | SSH-пользователь на VPS (состоит в группе `docker`) |
| `VPS_SSH_KEY` | приватный ключ этого пользователя (заведи отдельный deploy-ключ, см. ниже) |
| `VPS_PORT` | SSH-порт (обычно `22`) |
| `TELEGRAM_BOT_TOKEN` | токен бота из @BotFather |

Отдельный deploy-ключ (на своей машине):
```bash
ssh-keygen -t ed25519 -f codex_deploy -N "" -C "codex-ci"
ssh-copy-id -i codex_deploy.pub <VPS_USER>@<VPS_HOST>   # или добавь codex_deploy.pub в ~/.ssh/authorized_keys на VPS
# приватный ключ codex_deploy -> секрет VPS_SSH_KEY (целиком, включая BEGIN/END строки)
```

## Разово: подготовка VPS
1. Docker + compose v2 — у тебя уже есть (`docker compose version`).
2. Пользователь `VPS_USER` в группе docker: `sudo usermod -aG docker <VPS_USER>`.
3. HTTPS-фронт (нужен Telegram): поставь Caddy перед `127.0.0.1:8080` со своим доменом —
   конфиг в `deploy/Caddyfile.example` (замени домен → `reverse_proxy 127.0.0.1:8080`).
   Это разовая настройка; CI обновляет только контейнер приложения, не трогая прокси.
4. Разреши пакетам репозитория читаться runner-ом: по умолчанию `GITHUB_TOKEN` уже может
   пушить/тянуть пакет этого репозитория — доп. действий не нужно.

## Разово: создать репозиторий и запушить
`gh` не установлен, поэтому создай репозиторий в вебе (github.com → New repository), затем:
```bash
cd /Users/admin/Desktop/test5
git add -A
git commit -m "app + backend + deploy + CI/CD"
git remote add origin git@github.com:<owner>/<repo>.git
git push -u origin main
```
(Первый пуш в `main` сразу запустит пайплайн: тесты → образ → деплой. Если секреты/прокси ещё
не готовы — джоба `deploy` упадёт, но `test`+`build` пройдут; допоставь секреты и запушь снова.)

## Дальше — без твоего участия
Любой `git push` в `main` авто-собирает образ и катит его на VPS. Прокатка: `docker compose
pull && up -d` (zero-config, том с базой не трогается). Проверить после деплоя:
`curl -sI https://<твой-домен>/health`.

## Первое развёртывание HTTPS-фронта (Caddy) — кратко
См. `deploy/oracle-free-setup.md` §7 (те же шаги для любого VPS): установить Caddy, вписать
свой домен в `/etc/caddy/Caddyfile` → `reverse_proxy 127.0.0.1:8080`, `systemctl reload caddy`,
затем в @BotFather указать `https://<домен>` как URL Mini App.

## Что проверено локально (граница честности)
- `dotnet test` → 12/12 PASS; `npm run build` (tsc+vite) → зелёно — это ровно джоба `test`.
- Образ собирает то, что проверено спайками: publish под linux-arm64 + нативный SQLite, запуск
  опубликованного артефакта single-origin, prod-локдаун, SQLite на примонтированном `/data`.
- Сам GitHub-workflow и SSH-деплой на живой VPS я прогнать не могу (нет доступа к твоему VPS/аккаунту)
  — это выполнится при первом пуше. Шаги подобраны по канонному паттерну (docker/build-push-action
  + appleboy/ssh-action) и не содержат недоказанных допущений.
