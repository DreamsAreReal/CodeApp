# Oracle Always Free + Caddy — одна бесплатная коробка под много проектов

Модель: **одна бесплатная-навсегда ARM-VM** (Oracle Always Free, VM.Standard.A1.Flex,
до 2 OCPU / 12 ГБ) + **Caddy** как единый reverse-proxy с авто-HTTPS. На эту коробку
вешаешь сколько угодно проектов — каждый на своём локальном порту, Caddy разводит их по
поддоменам. Наше приложение едет как Docker-контейнер (single-origin) с SQLite на volume.

Что уже проверено локально (на .NET-уровне, без Docker здесь): publish под `linux-arm64`
собирается, нативный `libe_sqlite3.so` под ARM на месте, опубликованный артефакт запускается
как в контейнере и отдаёт single-origin + `/api`, prod-локдаун (dev-эндпоинты 403), SQLite
пишется на примонтированный `/data`. Сборку самого образа делаешь на VM (там есть Docker).

---

## 0. Что понадобится
- Аккаунт Oracle Cloud (нужна карта для верификации; списаний на Always Free нет).
- Домен для HTTPS: бесплатно — поддомен **DuckDNS** (`yourname.duckdns.org`), либо любой свой.
- Токен бота из @BotFather (`/newbot`). Это **секрет** — только в `deploy/.env` на VM, не в git.

## 1. Создай Always Free ARM-VM
1. Oracle Cloud Console → Compute → Instances → **Create instance**.
2. Image: **Ubuntu 24.04** (или 22.04). Shape: **VM.Standard.A1.Flex** (Ampere/ARM), например
   1 OCPU / 6 ГБ (в пределах Always Free). Убедись, что шейп помечен «Always Free eligible».
3. Добавь свой **SSH public key**. Запиши **public IP** инстанса.
   - Капризы Oracle: в некоторых регионах ARM-ёмкости нет — попробуй другой AD/регион или
     повтори позже (ошибка «out of host capacity»).

## 2. Открой порты 80 и 443
- **В VCN**: Networking → твоя VCN → Security List → добавь Ingress: `0.0.0.0/0` TCP **80** и **443**.
- **На самой VM** (образы Oracle держат жёсткий iptables): выполни на VM
  ```bash
  sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
  sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
  sudo netfilter-persistent save
  ```

## 3. Домен → IP (бесплатно через DuckDNS)
1. duckdns.org → войди → создай поддомен `yourname` → в поле current ip впиши **public IP** VM.
2. Проверка с любой машины: `dig +short yourname.duckdns.org` должен вернуть IP VM.

## 4. Поставь Docker на VM
```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER && newgrp docker   # чтобы docker без sudo
```

## 5. Забери код и задай токен
```bash
git clone <твой-репозиторий> codex && cd codex        # или scp -r проект на VM
cp deploy/.env.example deploy/.env
nano deploy/.env      # TELEGRAM_BOT_TOKEN=<твой токен из BotFather>
chmod 600 deploy/.env # секрет виден только тебе
```

## 6. Собери и подними приложение
```bash
docker compose -f deploy/docker-compose.yml up -d --build
# приложение слушает 127.0.0.1:8080 (наружу его выставит Caddy)
curl -s http://127.0.0.1:8080/health          # {"status":"ok",...}
curl -s http://127.0.0.1:8080/api/lessons | head -c 80   # каталог уроков
```
SQLite лежит в docker-volume `codexdata` (`/data/codex.db` внутри контейнера) — переживает
рестарты, `up -d --build` и перезагрузку VM. Бэкап: `docker run --rm -v codex_codexdata:/d
-v $PWD:/b alpine cp /d/codex.db /b/` (или `docker cp`).

## 7. Caddy — публичный HTTPS-фронт
```bash
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy
```
Пропиши сайт (замени домен на свой DuckDNS-поддомен):
```bash
sudo tee /etc/caddy/Caddyfile >/dev/null <<'EOF'
yourname.duckdns.org {
	reverse_proxy 127.0.0.1:8080
}
EOF
sudo systemctl reload caddy
```
Caddy сам выпустит и будет продлевать Let's Encrypt-сертификат. Проверка снаружи:
`curl -sI https://yourname.duckdns.org/health` → HTTP/2 200.

## 8. Подключи Mini App в BotFather
@BotFather → `/mybots` → бот → **Bot Settings → Configure Mini App → Enable** → вставь
`https://yourname.duckdns.org`. Открой бота в Telegram (телефон или Desktop) → петля пойдёт
с настоящим `initData`, бэкенд проверит HMAC твоим токеном.

## 9. Докинуть ещё проект на ту же коробку
1. Подними новый сервис на другом локальном порту (например `127.0.0.1:8090`).
2. Добавь блок в `/etc/caddy/Caddyfile`:
   ```
   other.duckdns.org {
   	reverse_proxy 127.0.0.1:8090
   }
   ```
3. `sudo systemctl reload caddy`. Всё — новый проект под HTTPS, та же бесплатная VM.

---

## Обновление приложения
```bash
cd codex && git pull && docker compose -f deploy/docker-compose.yml up -d --build
```
Volume `codexdata` не трогается — расписание и прогресс на месте.

## Безопасность
- Токен — только в `deploy/.env` (chmod 600), не в git, не в образ, не в чат.
- `Production` выключает `run-csharp` и `/api/dev/*` (авторские dev-инструменты).
- В проде приложение работает только внутри Telegram (там есть `initData`); в браузере — 403,
  это правильно.
