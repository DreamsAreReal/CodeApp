# RS-01 — Read-only разведка прод-VPS (192.3.94.42)

Дата: 2026-07-17. Метод: только чтение по `ssh vpn` (root) + пассивные curl/nc с локальной
машины. Ни одного изменения состояния сервера не производилось (ни рестартов, ни правок
конфигов, ни установки пакетов). Все факты — с командой и выводом.

## 1. Домены и сертификаты

**Вывод: на VPS НЕТ ни одного собственного домена и ни одного TLS-сертификата.**

```
$ ls -la /etc/letsencrypt/live/ 2>/dev/null
(пусто — каталога нет)
$ which certbot
(пусто — certbot не установлен)
$ certbot certificates 2>/dev/null
(пусто)
$ which caddy; ls /etc/caddy 2>/dev/null
(пусто — caddy не установлен)
```

Домены в конфигах xray — только **спуфнутые SNI для REALITY**, это не домены владельца:

```
$ docker inspect xray-server --format '{{json .Mounts}}'
... bind /opt/xray/config.json -> /etc/xray/config.json (ro) ...
$ grep -rhi "serverName\|\"host\"\|domain" /opt/xray/config.json
      { "address": "https://1.1.1.1/dns-query", "domains": ["geosite:geolocation-!cn"] },
          "serverNames": ["addons.mozilla.org", "www.mozilla.org"],
          "serverNames": ["addons.mozilla.org", "www.mozilla.org"],
```

`addons.mozilla.org` / `www.mozilla.org` — маскировка REALITY (чужие домены), A-записи
на этот IP у них нет. xray-sub (nginx:alpine, порт 8080) отдаёт только
`/450fa5a47b91e78202fd782dd1a63f94/sub` → `/opt/xray/sub/sub.json` (base64-блоб
подписки, доменов внутри не обнаружено — только бинарный blob). Итог: **домен под
Mini App придётся заводить с нуля** (вопрос пользователю на гейте: свой / DuckDNS / др.).

Единственный «домен», связанный с codeapp, — эфемерный quick-tunnel
`*.trycloudflare.com` (см. п.5) — меняется при каждом рестарте cloudflared.

## 2. Порт 443

**Изнутри: свободен. Снаружи: закрыт firewall-ом (ufw), но НЕ провайдером — 80/tcp
проходит, значит облачного фильтра, режущего всё, нет; 443 просто не в allow-списке.**

```
$ ss -tlnp | grep ":443 "
(пусто, rc=1 — никто не слушает 443)
```

Слушают (полный список): nginx :80 (0.0.0.0), sshd :22, docker-proxy 8080/2096/8443
(0.0.0.0 — xray), docker-proxy 127.0.0.1: 8000/8090/8091/9001/9003, cloudflared
127.0.0.1:20241 (metrics).

```
$ ufw status verbose
Status: active
Default: deny (incoming), allow (outgoing), deny (routed)
22/tcp ALLOW IN  # SSH
2096/tcp+udp ALLOW IN  # Xray main
8443/tcp+udp ALLOW IN  # Xray backup
8080/tcp ALLOW IN  # Subscription nginx
80/tcp ALLOW IN  # VPN instruction site
```

443 в правилах ОТСУТСТВУЕТ → входящие на 443 дропаются (policy DROP в INPUT).
iptables/nft — стандартные цепочки ufw + DOCKER (проброшены только порты контейнеров
выше). Проверка снаружи (с локальной машины, не по ssh):

```
$ curl -m 5 -sk https://192.3.94.42/ ; echo exit=$?
exit=28 (timeout)
$ nc -vz -w5 192.3.94.42 443
nc: connectx to 192.3.94.42 port 443 (tcp) failed: Operation timed out
```

Timeout (не connection refused) = пакеты дропаются firewall-ом. Для занятия 443
понадобится `ufw allow 443/tcp` (изменение — вне рамок этой разведки). Никто из
соседей (xray 2096/8443, sub 8080) на 443 не претендует по конфигам.

## 3. nginx на хосте

```
$ nginx -v
nginx version: nginx/1.24.0 (Ubuntu)
$ systemctl is-enabled nginx; systemctl is-active nginx
enabled
active
```

Автозапуск включён, работает. Конфиг один: `/etc/nginx/sites-enabled/default`
(симлинк на sites-available/default), `conf.d/` пуст. Содержимое default:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/html;
    location = /fef680164f41a3099c9cdcfe/ { ... }   # секретная VPN-инструкция
    location /fef680164f41a3099c9cdcfe { return 301 ...; }
    # deploy-hub F9: apps behind nginx, containers bound to 127.0.0.1 only
    location /portfolio/ { proxy_pass http://127.0.0.1:9001/; }
    location /zhaba/     { proxy_pass http://127.0.0.1:8090/; }
    location /vote/      { proxy_pass http://127.0.0.1:8000/; }
    location /api/       { proxy_pass http://127.0.0.1:8000; }  # concert-vote
    location / { return 404; }
}
```

Только HTTP :80, ни одного `listen 443` / `ssl` блока. Новый HTTPS-server-блок можно
добавить отдельным файлом, не трогая чужой default (следствие из угла «сосед»).

## 4. Стабильность порта 8091 при редеплоях

**Вывод: СТАБИЛЕН. `deploy codeapp sha-...` не может изменить порт.**

Механизм: юзер `deploy` с forced-command:

```
$ cat /home/deploy/.ssh/authorized_keys
command="/opt/deploy-hub/bin/runner.sh",no-pty,no-port-forwarding,... ssh-ed25519 AAAA... deploy-hub
```

`/opt/deploy-hub/apps.list`: `codeapp /opt/codex`. Runner (`/opt/deploy-hub/bin/runner.sh`,
root:root, деплой-юзеру недоступен на запись) при deploy делает только
`DEPLOY_IMAGE=<image:tag> docker compose -f /opt/codex/docker-compose.yml up -d --pull never app`
— т.е. подставляет ТОЛЬКО образ; сам compose-файл лежит на сервере и деплоем не
перезаписывается:

```
$ cat /opt/codex/docker-compose.yml
# codex (CodeApp) behind deploy-hub. Port 8091 is fixed: the cloudflared quick
# tunnel (codex-tunnel.service) points at it. ...
services:
  app:
    image: ${DEPLOY_IMAGE:?...}
    container_name: codex
    ports:
      - "127.0.0.1:8091:8080"
    volumes:
      - codex_data:/data   # external volume, деплоями не пересоздаётся
$ cat /opt/codex/app.conf
profile=service
port=8091
health_path=/health/ready
image=ghcr.io/dreamsarereal/codeapp
```

Порт зашит в двух серверных файлах (`docker-compose.yml` + `app.conf` — по нему же
идёт health-gate на `127.0.0.1:8091/health/ready`): деплой, меняющий порт, просто не
прошёл бы health-gate. Текущее состояние: `current=sha-a30b27cb...`,
`previous=sha-4054379...` (`/opt/codex/.deploy-state`); контейнер `codex` запущен,
`127.0.0.1:8091->8080/tcp`. Единственный путь сменить порт — root-правка файлов в
/opt/codex, что вне протокола deploy.

## 5. Telegram-бот и кнопка меню

Токен: задан в контейнере (`docker exec codex printenv Telegram__BotToken` — префикс
`8696759013:A...`; целиком в отчёт не включён; env-файл `/opt/codex/.env`, 600).
Read-only вызовы Bot API с VPS:

```
$ curl -s https://api.telegram.org/bot$TOKEN/getMe
{"ok":true,"result":{"id":8696759013,"is_bot":true,"first_name":"code app",
 "username":"coseappbot", ... "has_main_web_app":false, ...}}

$ curl -s https://api.telegram.org/bot$TOKEN/getChatMenuButton
{"ok":true,"result":{"type":"web_app","text":"Учить C#",
 "web_app":{"url":"https://tremendous-print-insider-enhancing.trycloudflare.com/"}}}

$ curl -s https://api.telegram.org/bot$TOKEN/getWebhookInfo
{"ok":true,"result":{"url":"","has_custom_certificate":false,"pending_update_count":0}}
```

- Бот: **@coseappbot** («code app»), webhook не настроен (long polling).
- Кнопка меню: web_app «Учить C#» → **quick-tunnel URL**.

**КРИТИЧЕСКАЯ находка — кнопка меню сейчас МЕРТВА.** Туннель — systemd-юнит
`codex-tunnel.service` (enabled, Restart=always):

```
ExecStart=/usr/local/bin/cloudflared tunnel --no-autoupdate --url http://localhost:8091
```

Это quick tunnel БЕЗ аккаунта: URL выдаётся заново при каждом старте. Журнал
`/var/log/codex-tunnel.log`:

```
2026-07-10T20:39:53Z |  https://tremendous-print-insider-enhancing.trycloudflare.com  |
2026-07-17T16:06:26Z |  https://ballet-workshop-made-blake.trycloudflare.com          |
```

17.07 (ребут/рестарт ~16:06 UTC) туннель получил НОВЫЙ URL, а кнопка бота всё ещё
указывает на старый. Проверка с локальной машины:

```
$ curl -m 10 -s -o /dev/null -w "%{http_code}" https://tremendous-print-insider-enhancing.trycloudflare.com/
000   # кнопка меню — мертва
$ curl -m 10 -s -o /dev/null -w "%{http_code}" https://ballet-workshop-made-blake.trycloudflare.com/
200   # актуальный туннель — жив, но в кнопке его нет
```

Это прямое подтверждение North Star-проблемы: у «туриста» прямо сейчас белый экран.
Любое решение со стабильным доменом+сертификатом устраняет класс отказа целиком.

## Прочее наблюдённое (для полноты)

- Контейнеры: codex (8091), deploy-hub-demo (9003), concert-vote (8000), zhaba (8090),
  portfolio-new (9001), xray-sub (8080), xray-server (2096, 8443) — все живы.
- cron root: только `0 4 * * * /opt/xray/update-geo.sh`.
- health изнутри: `curl -s http://127.0.0.1:8091/health/live` → `{"status":"live"}`;
  `/health/ready` → 200.

## Риски для следующего шага

1. Кнопка меню уже сломана (протухший trycloudflare URL) — фикс нужен в любом случае;
   `setChatMenuButton` перезапишет текущую кнопку «Учить C#» (текст сохранить).
2. 443 закрыт только ufw — открытие потребует правки firewall (изменение, на гейт).
3. Домена нет вообще; certbot/caddy не установлены — TLS-обвязку строить с нуля.
4. nginx общий с VPN-инструкцией и тремя приложениями — правки только отдельным
   server-блоком, бэкап + `nginx -t` перед reload; юнит codex-tunnel.service после
   переезда на домен надо будет вывести из эксплуатации (иначе два входа).
