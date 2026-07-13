# ВЕРДИКТ — ФИНАЛЬНЫЙ VERIFY, гейт «Контейнер/CI»

Дата: 2026-07-12. Оценщик: внешний скептичный evaluator (свежий контекст).
Метод: исполнение (docker build/run/inspect/exec/logs) + код-ревью deploy.yml + compose.
Продукт не изменялся (Bash read-only по отношению к артефакту).

## ВЕРДИКТ — ПРИНЯТО

Все обязательные гейты пройдены реальным исполнением. Образ собирается, контейнер
поднимается и становится healthy за ~6с, процесс non-root (uid 1654), эндпоинты
отвечают 200/200/401, стартовый лог чист от HTTP_PORTS warning. CI-конвейер целостен:
coverage ENFORCED, prod-smoke гейтит push, deploy ждёт healthy перед prune, sha-пиннинг
образа на месте, viz-fit + live-loop (run/loop/shell) в CI.

Паспорт вкуса: N/A для этого гейта (инфраструктура/CI, не визуальный слой). Визуальный
паспорт меряется параллельным E-прогоном по UI. Здесь проверена только контейнер/CI-строгость.

## ГЕЙТЫ (гейт → метод → измерено → verdict)

| Гейт | Метод | Измерено | Verdict |
|---|---|---|---|
| docker build OK | `docker build -f deploy/Dockerfile -t codex:eval .` | наминг `codex:eval done`, exit 0 | PASS |
| контейнер healthy | run + poll `docker inspect .State.Health` | starting→healthy за 6с | PASS |
| non-root | `docker exec id` / `whoami` / `ps` | uid=1654(app), PID1 dotnet под app | PASS |
| /health/ready 200 | `curl -w %{http_code}` | 200, тело `{"status":"ready"}` | PASS |
| GET / 200 | `curl -w %{http_code}` | 200, SPA `<html lang="ru">…Фундамент C#` | PASS |
| лог без HTTP_PORTS warn | `docker logs | grep -i "overriding http_ports"` | CLEAN, 0 warn/error | PASS |
| стоп+удаление | `docker stop && docker rm` | контейнер удалён, `ps -a` пуст | PASS |
| coverage ENFORCED | симуляция awk-гейта | line=0.50→exit1 (FAIL); 0.93→exit0 (PASS); нет cobertura→exit1 | PASS |
| deploy ждёт healthy перед prune | код-ревью порядка строк | healthy-wait стр.264 ПЕРЕД prune стр.274; при unhealthy — exit 1 без prune | PASS |
| prod-smoke в CI гейтит push | код-ревью порядка шагов | build(147)→smoke(162)→push(189); smoke на deploy/Dockerfile | PASS |
| live-loop + viz-fit в CI | grep test-job | viz-fit.mjs(99), run/loop/shell(109-111), все файлы существуют | PASS |
| sha-пиннинг деплоя | grep IMAGE | `IMAGE: …:${{ github.sha }}`, deploy pull по sha, никогда :latest | PASS |
| поток test→build→push→deploy | grep needs | build needs test; deploy needs build-and-push; push/deploy только main | PASS |

## Сырой вывод (ключевое)

- id: `uid=1654(app) gid=1654(app) groups=1654(app)`; PID1 = dotnet под app.
- health: `starting(0s)→starting(3s)→healthy(6s)`.
- endpoints: `GET / -> 200 ; /health/ready -> 200 ; /health/live -> 200 ; POST /api/auth(bad) -> 401`.
- /data: `WRITE OK` под app; codex.db/-shm/-wal созданы (readiness SELECT 1 реален).
- image config: `User=app | ExposedPorts=8080/tcp | Healthcheck=curl -fsS …/health/ready`.
- log: `Now listening on: http://0.0.0.0:8080` / `Hosting environment: Production`, ноль warn/error.
- размер образа: 507MB (aspnet+curl; приемлемо, не раздут).
- coverage awk: low→exit1, high→exit0, no-cobertura→exit1.
- YAML valid: deploy.yml + оба compose; `docker compose config` рендерит prod без ошибок.

## ЧТО ПЛОХО (обязательно, ≥3)

1. **GitHub Actions запиннены по мажорному тегу, не по commit-sha** (checkout@v4,
   build-push-action@v6, appleboy/ssh-action@v1). Задание требует «sha-пиннинг деплоя» —
   пиннинг ОБРАЗА выполнен (github.sha), это PASS. Но сами Actions мутабельны по тегу:
   supply-chain-риск (тег можно перевесить). Тяжесть: СРЕДНЯЯ, не блокер для этого гейта
   (образ пиннится), но релиз-строгость «готового продукта» просит `@<sha>` и на actions.
2. **appleboy/ssh-action — сторонний action с полным SSH-ключом и токенами в env.**
   Это функционально, но третья сторона в критическом пути деплоя. Не проверяемо мной
   исполнением (нет VPS/секретов). Тяжесть: НИЗКАЯ-СРЕДНЯЯ, отметка для аудита.
3. **new-lessons.mjs осознанно НЕ в CI** (задокументировано как TODO, стр.112-115).
   Самый state-heavy harness гейтит контент-флоу авторинга только локально. Регресс в
   генерации новых уроков CI не поймает. Тяжесть: НИЗКАЯ (осознанное решение, loop уже
   гейтит review/FSRS-движок), но это дыра в автоматическом покрытии.
4. **Смоук/деплой healthcheck зависят от `curl`, установленного в runtime-слой** через
   apt (стр.30-32). Работает, но добавляет apt-поверхность в prod-образ. Альтернатива —
   dotnet-based healthcheck без curl. Тяжесть: КОСМЕТИЧЕСКАЯ.
5. **Не проверено исполнением: реальный push в GHCR и SSH-деплой** — требуют секретов/
   VPS, недоступных evaluator-у. Проверена только логика (порядок, пиннинг, гейты).
   Тяжесть: НИЗКАЯ (это природа CI-секции; логика кода целостна).

## СОМНЕНИЯ

- viz-fit backend в CI поднимается в `ASPNETCORE_ENVIRONMENT=Development` (dev-auth bypass,
  стр.82). Это CI-only на throwaway-порту :5080 — НЕ prod-образ. Prod-smoke отдельно гоняет
  РЕАЛЬНЫЙ prod-образ (Production, auth 401). Разделение корректно, dev-режим в prod не течёт.
- coverage floor = 80% при текущих ~93%: гейт реален (доказан exit1 на 0.50), но floor
  ниже фактического значения на 13пп — «запас на честный churn». Не снижение планки, но
  большой зазор; для строгого релиза можно поднять до ~88-90%.

## АНТИ-ЗАЦИКЛИВАНИЕ

Прошлый цикл (commit d2c3b56 «container/CI hygiene», 9f7e7ce «release rigor»): заявленные
доработки — HTTP_PORTS warning устранён (ASPNETCORE_HTTP_PORTS= в Dockerfile, подтверждено
чистым логом), deploy ждёт healthy перед prune (подтверждено порядком строк), prod-smoke
гейтит push (подтверждено). Все заявленные фиксы реальны, регрессий не обнаружено. Планка
НЕ снижена. Блокеров прошлых раундов по этому гейту не осталось открытых.

## РЕГРЕССИИ: нет.

## БЛОКЕРЫ: нет (для гейта Контейнер/CI).


ВЕРДИКТ: ПРИНЯТО
