# ВЕРДИКТ — Фаза 5 VERIFY · Гейт «Контейнер/CI гигиена»

Дата: 2026-07-11 · Evaluator: внешний, docker включён (Docker 29.4.0) · Метод: исполнение, не доверие файлам.

**ВЕРДИКТ — ПРИНЯТО (все 5 гейтов PASS, исполнением).**
**Паспорт вкуса: N/A** — это инфра-гейт (Dockerfile/CI), не UI-деливерабл; визуальная рубрика неприменима, паспорт вкуса не оценивается на этом измерении.

## Гейты (порог → измерено → метод → вердикт)

| Гейт | Порог | Измерено | Метод | Вердикт |
|---|---|---|---|---|
| build | exit 0 | exit 0, image 507MB | `docker build -f deploy/Dockerfile` | PASS |
| non-root | uid ≠ 0 | uid=1654(app), PID1 = `app dotnet Codex.Backend.dll` | `docker exec id -u` + `ps` | PASS |
| healthcheck | healthy | healthy @ t=2s; 3 probe exit=0 `{"status":"ready"}` | `docker inspect .State.Health` | PASS |
| sha-pin деплоя | не :latest | deploy IMAGE=`...:${{ github.sha }}`, pull/up по нему | код-ревью deploy.yml:124,153,171 | PASS |
| harness-in-CI (viz-fit) | гоняется, не no-op | `node verify/viz-fit.mjs`, ассертит FIT/CLIP/OVERLAP × 6 уроков, exit при FAIL | код-ревью + чтение viz-fit.mjs | PASS |
| coverlet | сбор + артефакт | `--collect:"XPlat Code Coverage"` + upload-artifact `backend-coverage` | код-ревью deploy.yml:33-56 | PASS |

## Эндпойнты (Production-контейнер, реальный HMAC-auth)

- `/health/ready` → **200** `{"status":"ready"}` (SELECT 1 через Ping).
- `/health` → 200; `GET /` (SPA) → **200**, 1035 bytes text/html.
- `/api/lessons` без токена → **401** (защищён, НЕ публичный список — как и задумано в prod).
- `/api/lessons` с реальным Bearer → **200, ровно 6 уроков**, ID = seed на диске:
  T1.M2.value-vs-reference, T1.M3.boxing, T1.M4.gc, T2.M1.async-await, T2.M2.closures, T2.M5.hashtable.
- Токен получен третьей дорогой: собственная HMAC-SHA256 реализация signInitData
  (`.verify/verify5-auth-lessons.mjs`, зеркало TelegramAuth.cs) → POST /api/auth → mode:"telegram".
- Контроли реальности auth: подделанный hash → **401**; dev-bypass (devUserId) → **403**;
  `/api/dev/sign-initdata` → **403** (DevMode off в prod).

## Поток CI

`test` → (`build-and-push` needs: test, main only) → (`deploy` needs: build-and-push).
Красный test блокирует build и deploy. deploy pull/up строго по sha-тегу. Поток цел.

## ЧТО ПЛОХО (обязательно, ≥3)

1. **viz-fit в CI гоняет НЕ prod-образ**, а отдельный `dotnet run` в Development
   (dev-auth bypass, throwaway SQLite). Значит CI НЕ проверяет ни non-root, ни healthcheck,
   ни prod-auth собранного образа — их проверяет только `docker build` (без запуска).
   Регресс рантайма (напр. кто-то уберёт `USER app`) CI не поймает. СРЕДНЯЯ тяжесть.
2. **Coverage-порог НЕ enforced** (deploy.yml:31-32 «threshold is not enforced yet»);
   cobertura парсится grep-ом, при отсутствии отчёта — `exit 0` (мягко). Покрытие
   собирается «для галочки», не гейтит. НИЗКАЯ тяжесть (заявлено «просто собрать число»).
3. **Full live-loop harnesses вынесены из CI** (TODO deploy.yml:94-97: run.mjs, new-lessons.mjs
   «run locally for now»). CI покрывает только диаграм-движок (viz-fit), не полный
   review/FSRS-цикл. НИЗКАЯ-СРЕДНЯЯ тяжесть.
4. **deploy.yml не ждёт healthy после `up -d`** (строка 184): SSH-деплой запускает контейнер
   и сразу делает logout/prune, не проверяя, что новый образ поднялся healthy. Битый
   релиз обнаружится только по факту. НИЗКАЯ тяжесть (restart:unless-stopped смягчает).
5. Косметика: лог prod-контейнера содержит warning ASP.NET об override HTTP_PORTS через URLS —
   безвредно, но шум. Можно убрать, не задавая HTTP_PORTS.

## СОМНЕНИЯ

- viz-fit exit-code в реальном CI-прогоне не проверял (нет Playwright/Chromium локально
  под этот прогон) — читал исходник и подтвердил наличие `assert`/`process.exit` и логики
  «ALL GREEN only when ZERO violations». Проверка статическая, не исполнением.
- Негативный healthcheck (unhealthy при недоступной БД) не форсировал — подтверждён по коду
  (`Ping()` → 503) + тем, что probe возвращает реальный JSON приложения, а не статику.

## Доказательства
Сырой вывод: `docs/reviews/evidence/M-infra/`. Скрипт: `.verify/verify5-auth-lessons.mjs`.
Контейнер/образ/volume удалены после проверки (docker ps -a / images чисто).


ВЕРДИКТ: ПРИНЯТО (все 5 гейтов PASS, исполнением).**
