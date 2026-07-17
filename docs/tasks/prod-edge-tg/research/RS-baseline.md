# RS-baseline — замер «как есть» до любых изменений

Дата замера: 2026-07-17, ~17:10 UTC. Внешние замеры — с локальной машины разработчика
(не с VPS); внутренний — по `ssh vpn`. Состояние сервера не менялось.

## Снаружи

HTTP :80 — nginx отвечает, корень отдаёт 404 (ожидаемо):

```
$ curl -sI http://192.3.94.42/
HTTP/1.1 404 Not Found
Server: nginx/1.24.0 (Ubuntu)
Date: Fri, 17 Jul 2026 17:09:50 GMT
Content-Type: text/html
Content-Length: 162
Connection: keep-alive
```

HTTPS :443 — недоступен, пакеты дропаются (timeout, не refused → firewall ufw):

```
$ curl -m 5 -sk https://192.3.94.42/ -o /dev/null -w "code=%{http_code}\n"; echo exit=$?
code=000
exit=28

$ curl -m 5 -skI https://192.3.94.42/; echo exit=$?
exit=28

$ nc -vz -w5 192.3.94.42 443
nc: connectx to 192.3.94.42 port 443 (tcp) failed: Operation timed out
```

Кнопка меню Telegram-бота (@coseappbot) на момент замера указывает на
`https://tremendous-print-insider-enhancing.trycloudflare.com/` — URL мёртв:

```
$ curl -m 10 -s -o /dev/null -w "%{http_code}" https://tremendous-print-insider-enhancing.trycloudflare.com/
000
```

Актуальный quick-tunnel (из /var/log/codex-tunnel.log, выдан 2026-07-17 16:06 UTC) жив,
но в кнопку не прописан:

```
$ curl -m 10 -s -o /dev/null -w "%{http_code}" https://ballet-workshop-made-blake.trycloudflare.com/
200
```

## Изнутри (ssh vpn)

```
$ curl -s http://127.0.0.1:8091/health/live
{"status":"live"}

$ curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8091/health/ready
200
```

## Итог базлайна

| Замер | Результат |
|---|---|
| http://192.3.94.42/ снаружи | 404, nginx/1.24.0 (жив) |
| https://192.3.94.42/ снаружи | timeout (443 дропается ufw) |
| :443 слушатель изнутри | отсутствует (порт свободен) |
| Mini App по кнопке бота | НЕ открывается (протухший trycloudflare URL, 000) |
| codex /health/live изнутри | 200, {"status":"live"} |
