# CI/CD — авто-деплой на твой VPS через GitHub Actions

Пайплайн `.github/workflows/deploy.yml`: **push в `main` → тесты → сборка образа → push в
GHCR → SSH-деплой на VPS**. После разовой настройки секретов деплой идёт **без твоего участия**.
PR-ы гоняют только тесты.

```
push main ─▶ test (dotnet test + coverlet + npm build + viz-fit headless)
                 │
                 ▼
           build image ─▶ push ghcr.io/<owner>/<repo>:<git-sha> (+ :latest)
                                          │
                            ssh VPS ◀─────┘
                            docker compose pull && up -d  (пин на :<git-sha>)
```

**Гейт `test`** гоняет: backend `dotnet test` + покрытие (`coverlet`, публикуется артефактом
`backend-coverage`) с **ЖЁСТКИМ порогом line-coverage ≥ 90%** (текущее ~93%, запас ~3пп),
фронт `tsc+vite build`, и полную headless-приёмку в реальном Chromium против живого
backend :5080 + preview :4173: `viz-fit.mjs`, `run.mjs`, `loop.mjs`, `shell.mjs` **и теперь
`new-lessons.mjs`** (multi-lesson authoring/generation flow). Все харнесы чеканят СЛУЧАЙНЫЕ
user-id — самоизолируются на общей БД.

**SHA-пиннинг Actions (supply-chain):** ВСЕ сторонние GitHub Actions запиннены на полный
40-символьный commit-SHA с комментарием `# vN` для читаемости (`actions/*`, `docker/*` и
сторонний `appleboy/ssh-action`). Тег может быть переписан на злонамеренный коммит — SHA
неизменяем, поэтому пайплайн воспроизводим и не подвержен подмене тега. Обновление версий —
осознанное: заменить SHA + комментарий.

**SHA-пиннинг образа:** образ тегается неизменяемым `${{ github.sha }}` (плюс подвижный
`:latest` для людей), а деплой ТЯНЕТ именно sha-тег — деплой воспроизводим и откатываем.

**Non-root образ:** рантайм-процесс — непривилегированный `app` (uid 1654), НЕ root;
у образа есть `HEALTHCHECK` на `/health/ready`. Проба — **без curl/apt**: чистый bash
`/dev/tcp` (bash 5.2 уже в base-образе aspnet:10.0) шлёт минимальный HTTP GET и требует
строго `200`. Это убирает apt/curl-слой (−10 МБ, меньше поверхность атаки), семантика
`unhealthy`-флипа та же, что была у `curl -fsS` (`docker inspect .State.Health` → `healthy`).

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

## Допущения деплоя (архитектурная граница)
- **Single-instance деплой.** Топология — один edge (Caddy) → **один** контейнер приложения
  на `127.0.0.1:8080`. Это НЕ горизонтально масштабируемая схема, и многоинстансность **не
  является целью** этого деплоя.
- **SQLite (WAL) на docker-volume `codexdata`.** Конкурентность решается in-process (WAL даёт
  одновременные чтения + один писатель внутри одного процесса). Именно поэтому один контейнер:
  запуск второй реплики на том же файле БД НЕ поддерживается (SQLite не рассчитан на
  многопроцессную запись по сети/тому). Нужна горизонтальность → это отдельная миграция на
  клиент-серверную СУБД, вне текущего скоупа.
- **Прокатка = pull + up -d + ожидание `healthy`, затем prune.** Кратковременный разрыв на
  рестарт одного контейнера — приемлем для этого продукта (не zero-downtime blue-green).
- **`appleboy/ssh-action` теперь SHA-запиннен** (см. «SHA-пиннинг Actions»): сторонний деплой-
  экшен воспроизводим и не подменяем через перезапись тега `v1`.

## Что проверено локально (граница честности)
- `dotnet test` → 62/62 PASS; покрытие (coverlet) собрано: line 92.6% / branch 75.6%.
- `npm run build` (tsc+vite) → зелёно; `node verify/viz-fit.mjs` против живого backend+preview
  → ALL GREEN — это ровно джоба `test`.
- **Coverage-гейт (порог 90):** awk-фрагмент прогнан локально — line=0.93 → PASS exit0;
  line=0.88 → FAIL exit1; граница line=0.90 → PASS exit0.
- **Curl-free HEALTHCHECK:** образ пересобран без curl/apt (`command -v curl` → ABSENT,
  bash present); запущен → `HEALTHCHECK` (bash `/dev/tcp` проба `/health/ready`) → `healthy`
  за ~6с, health-log `exit=0`, `GET /` 200, `/health/ready` 200; образ уменьшился 507 → 497 МБ.
- **SHA-пины:** каждый SHA получен из GitHub API (`git/refs/tags/<vN>` → object.sha,
  дереференс аннотированных тегов) и перепроверен `repos/<a>/commits/<sha>` — все 9 экшенов
  резолвятся в реальные коммиты; `grep uses:` показывает 11 вхождений, все 40-hex@ + `# vN`.
- Сам GitHub-workflow и SSH-деплой на живой VPS я прогнать не могу (нет доступа к твоему VPS/аккаунту)
  — это выполнится при первом пуше. Шаги подобраны по канонному паттерну (docker/build-push-action
  + appleboy/ssh-action) + coverlet/viz-fit/sha-пиннинг; YAML провалидирован (safe_load),
  bash-фрагменты (coverage-репорт, backend+preview wait, /dev/tcp-проба) прогнаны локально.
