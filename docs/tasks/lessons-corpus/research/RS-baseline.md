# RS-baseline: Базлайн-замер и инвентарь уроков

**Фаза:** Research 1 · lessons-corpus baseline  
**Дата:** 2026-07-17 (v2 — после реального прогона всех гейтов)  
**Статус:** FROZEN (все числа — из исполненных команд; вывод приложен)

> v2 исправляет v1: (а) базлайн снят ТЕМИ ЖЕ инструментами, которыми меряются гейты
> (бэкенд поднят, все 5 харнессов + dotnet test + G-EXEC исполнены); (б) исправлена
> арифметика карточек — прежний grep `'"id": "c'` ловил id источников (`cs-value-types`)
> и claims: реально карточек **59**, не 84; (в) средний размер урока пересчитан: **316
> строк** (6005/19, без index.ts и types.ts); (г) уточнено: 141 KB gzip — ВЕСЬ JS-бандл
> приложения, не только уроки.

---

## 0. Реальный прогон гейтов (команды + фактический вывод)

Окружение: бэкенд `dotnet run` на `:5080` (Development), фронт `npm run preview` на `:4173` (свежий `dist/` от `npm run build`).

### 0.1 `npm run build` — ✅ ЗЕЛЁНЫЙ

```
$ cd app && npm run build
> tsc --noEmit && vite build
vite v6.4.3 building for production...
✓ 54 modules transformed.
dist/assets/index-DdK5oNEf.js   571.88 kB │ gzip: 141.75 kB
✓ built in 388ms
```

### 0.2 Бэкенд поднят — ✅

```
$ curl -s http://localhost:5080/health
{"status":"ok","fsrs":"fsrs-6","storage":"sqlite"}
```

### 0.3 G-EXEC (`/api/authoring/run-csharp`) — ✅ ЗЕЛЁНЫЙ

```
$ curl -s -X POST http://localhost:5080/api/authoring/run-csharp \
    -H 'Content-Type: application/json' \
    -d '{"code":"using System; int n = 1; Console.Write(n);"}'
{"success":true,"stdout":"1","error":null,"elapsedMs":565}
```

stdout == ожидаемому `"1"` → механика G-EXEC работает.

### 0.4 `npm run verify` (verify/run.mjs, E2E) — ✅ ALL GREEN

```
$ cd app && npm run verify
== F3: TYPE correct answer -> ✓ -> Good pre-selected -> POST /api/review moves schedule ==
  ✓ typed-answer input rendered (generation, not MCQ)
  ✓ typing the exact expect is graded objectively correct
  review response: {"itemId":"T1.M3.boxing/c1","grade":"Good",…,"state":"Learning"}
  ✓ due count dropped 59 -> 58
== F6: TYPE wrong answer -> Again -> card due again this session ==
  ✓ Again re-queues due 60s out (< 2 min, this session)
== G5: console errors ==
  ✓ zero console/page errors across the run
==== ALL GREEN · runUser=972715 ====
```

### 0.5 `node verify/viz-fit.mjs` (AUTHORING-PROOF) — ✅ ALL GREEN

```
$ cd app && node verify/viz-fit.mjs
  ✓ zero non-nested overlap on EVERY settled scene across all lessons (checked 316 scenes, found 0)
  ✓ zero non-nested overlap MID-TRANSITION across all lessons (633 mid-samples over 211 transitions, found 0)
  ✓ zero viewBox clip MID-TRANSITION across all lessons (found 0)
  ✓ zero console/page errors across the run
==== ALL GREEN · runUser=702800 ====
```

Попутный замер: **316 сцен** и **211 переходов** во всём корпусе.

### 0.6 `node verify/shell.mjs` — ✅ ALL GREEN

```
  ✓ calibration ring shows 100% (got "100%")
  ✓ zero console/page errors across the run
==== ALL GREEN · runUser=867300 emptyUser=898017 completeUser=872502 ====
```

### 0.7 `node verify/new-lessons.mjs` — ✅ ALL GREEN

```
  ✓ PY.M13.stdlib-idioms reduced-motion: every segment shows its final frame
(paced 63 mutating POSTs at 1050ms spacing — limiter allows 60/min)
  ✓ zero console/page errors across the run
==== ALL GREEN · runUser=863152 ====
```

Примечание для планирования объёма: харнесс упирается в **rate-limiter бэка 60 мутирующих POST/мин** — при росте корпуса прогоны замедляются линейно.

### 0.8 `dotnet test` (xUnit бэка) — ✅ 65/65

```
$ dotnet test backend/Codex.Backend.Tests/Codex.Backend.Tests.csproj
Passed!  - Failed: 0, Passed: 65, Skipped: 0, Total: 65, Duration: 1 s - Codex.Backend.Tests.dll (net10.0)
```

### 0.9 `node verify/loop.mjs` — ✅ ALL GREEN

```
  ✓ no spinner element (skeletons, per spec)
  ✓ zero console/page errors across the run
==== ALL GREEN · firstUser=713630 doneUser=722355 ====
```

**Итог: базлайн ПОЛНОСТЬЮ ЗЕЛЁНЫЙ** — 5 харнессов, 65 xUnit-тестов, сборка, G-EXEC.

---

## 1. GET /api/due для нового пользователя (день 1)

Замер (свежий dev-пользователь 999111):

```
$ curl -s -X POST http://localhost:5080/api/auth -d '{"devUserId": 999111}'  → token
$ curl -s http://localhost:5080/api/due -H "Authorization: Bearer $TOKEN"
keys: ['userId', 'now', 'count', 'items']
due items for NEW user: 59
  PY.M1.names-objects: 4      PY.M8.object-model: 4
  PY.M2.collections-hash: 3   PY.M9.exceptions: 4
  PY.M3.args-unpacking: 3     PY.M10.type-hints: 4
  PY.M4.closures-scope: 3     PY.M11.async-await: 4
  PY.M5.decorators: 4         PY.M12.strings-flow: 6
  PY.M6.generators: 4         PY.M13.stdlib-idioms: 6
  PY.M7.context-managers: 4
  T1.M2.value-vs-reference: 1   T2.M1.async-await: 1
  T1.M3.boxing: 1               T2.M2.closures: 1
  T1.M4.gc: 1                   T2.M5.hashtable: 1
```

**Вывод для решения о лимите:** новому пользователю в день 1 отдаётся **ВЕСЬ каталог
сразу — 59 карт** (100% сида). Лимита «новых карт в день» на бэке НЕТ. При расширении
корпуса (книги + C# заново + инструменты) очередь дня 1 растёт линейно с числом
карточек — это дизайн-решение, которое надо принять до волны наполнения.

---

## 2. Инвентарь: полная таблица уроков

Карточки посчитаны парсингом JSON (`python3` по `cards[]` каждого сида) и сверены с
фронтом (`grep -c 'verify: { kind: "exec"' app/src/lessons/*.ts`): **фронт == сид == 59**.

| # | ID | Трек | Название | Строк (фронт) | Карт (сид=фронт) |
|---|---|---|---|---|---|
| 1 | T1.M2.value-vs-reference | T1 | Значение и ссылка | 125 | 1 |
| 2 | T1.M3.boxing | T1 | Boxing | 188 | 1 |
| 3 | T1.M4.gc | T1 | GC и память | 170 | 1 |
| 4 | T2.M1.async-await | T2 | Async/await | 154 | 1 |
| 5 | T2.M2.closures | T2 | Замыкания | 157 | 1 |
| 6 | T2.M5.hashtable | T2 | Хеш-таблицы | 277 | 1 |
| — | **C# подитог** | T1+T2 | 6 уроков | **1071** | **6** |
| 7 | PY.M1.names-objects | PY | Имена и объекты | 593 | 4 |
| 8 | PY.M2.collections-hash | PY | Коллекции и хеш | 310 | 3 |
| 9 | PY.M3.args-unpacking | PY | Распаковка аргументов | 289 | 3 |
| 10 | PY.M4.closures-scope | PY | Замыкания и scope | 418 | 3 |
| 11 | PY.M5.decorators | PY | Декораторы | 475 | 4 |
| 12 | PY.M6.generators | PY | Генераторы | 337 | 4 |
| 13 | PY.M7.context-managers | PY | Контекст-менеджеры | 330 | 4 |
| 14 | PY.M8.object-model | PY | Объектная модель | 480 | 4 |
| 15 | PY.M9.exceptions | PY | Исключения | 347 | 4 |
| 16 | PY.M10.type-hints | PY | Type hints | 309 | 4 |
| 17 | PY.M11.async-await | PY | Async/await (Py) | 469 | 4 |
| 18 | PY.M12.strings-flow | PY | Строки и потоки | 301 | 6 |
| 19 | PY.M13.stdlib-idioms | PY | Идиомы stdlib | 276 | 6 |
| — | **Python подитог** | PY | 13 уроков | **4934** | **53** |
| — | **ВСЕГО** | 3 трека (T1/T2/PY) | **19 уроков** | **6005** | **59** |

Треки на home группируются через `TRACK_GROUPS` (`app/src/lessons/index.ts:75-78`):
`csharp` = [T1, T2], `python` = [PY]. Новый трек = одна строка реестра.

---

## 3. Размерный базлайн (пересчитан, команды приложены)

### 3.1 Строки

```
$ cd app/src/lessons && wc -l *.ts | grep -v -E "(index|types)\.ts" | grep -v total \
    | awk '{s+=$1; n++} END {print s" lines / "n" lessons = "s/n" avg"}'
6005 lines / 19 lessons = 316.053 avg
```

| Метрика | C# (6) | Python (13) | Всего (19) |
|---|---|---|---|
| Строк (data-файлы уроков) | 1071 | 4934 | 6005 |
| Среднее строк/урок | **178.5** | **379.5** | **316** |
| Карточек | 6 | 53 | 59 |
| Карточек/урок | 1.0 | 4.1 | 3.1 |

Плюс инфраструктура: `index.ts` 90 строк, `types.ts` 131 строка (не контент).

### 3.2 Байты и токены

```
$ cat app/src/lessons/*.ts | wc -c
593377          # включая index.ts + types.ts
```

- Raw контент уроков ≈ 570 KB (593 KB минус инфраструктура).
- **141.75 KB gzip — это ВЕСЬ JS-бандл приложения** (`dist/assets/index-*.js`: движок +
  экраны + уроки), НЕ только уроки. Отдельного замера gzip уроков нет.
- Оценка токенов (эвристика ~4 символа/токен, НЕ замер): ~148k токенов на весь каталог,
  **~7.8k токенов на средний урок** (C# ~4–5k, Python ~9–12k). Уверенность: низкая
  (эвристика), для планирования бюджета генерации годится как порядок величины.

### 3.3 Сцены и переходы (замер viz-fit, п.0.5)

- **316 сцен** суммарно; 211 переходов; ≈ 316/19 ≈ **16.6 сцен/урок**.
- Сегментов: C# 4–7/урок (эталон boxing = 7), Python 6–8/урок.

---

## 4. Качество: статусы и гейты

| Гейт | Статус базлайна | Доказательство |
|---|---|---|
| build (tsc+vite) | ✅ | п.0.1 |
| verify/run E2E | ✅ ALL GREEN | п.0.4 |
| verify/viz-fit | ✅ ALL GREEN (0 наруш. на 316 сцен) | п.0.5 |
| verify/shell | ✅ ALL GREEN (+axe) | п.0.6 |
| verify/new-lessons | ✅ ALL GREEN | п.0.7 |
| verify/loop | ✅ ALL GREEN | п.0.9 |
| dotnet test | ✅ 65/65 | п.0.8 |
| G-EXEC endpoint | ✅ живой, детерминированный | п.0.3 |

Статус всех 19 уроков в данных: `status: "self-pass"` (ни один не `verified` — это
поле контента, а не результат харнессов).

---

## 5. Что даёт удаление 6 C#-уроков (сверено с реальным сидом)

- Фронт: 6 файлов (1071 строка) + 6 импортов + 6 строк `LESSONS` в `index.ts`.
- Бэк: 6 сид-файлов `backend/Codex.Backend/seed/lessons/T*.json` → из очереди уходит
  **6 карточек** (не 13, как ошибочно в v1: у каждого C#-урока ровно 1 карта, см. п.2).
- `GET /api/due` дня 1 сократится 59 → 53.
- Прогресс пользователей: `review_state`/`progress_events` по `T1.*/T2.*` останутся в
  SQLite как осиротевшие записи (сид только добавляет элементы на старте, чистки нет).
- Харнесс `verify/run.mjs` СЛОМАЕТСЯ: он использует `T1.M3.boxing/c1` и
  `T1.M2.value-vs-reference/c1` как тестовые карты (вывод п.0.4); `verify/new-lessons.mjs`
  гоняет gc/closures/async-await/hashtable. Замена C#-уроков требует правки харнессов.
- Prereq-цепочка C# замкнута внутри C# (T1.M2→T1.M3→{T1.M4,T2.M1,T2.M2}→T2.M5); PY
  независим. Внешних ссылок нет (grep по `app/src`).

---

## 6. Ограничения масштабирования (для полного корпуса)

1. **Нет лимита новых карт/день** — 59 карт в due дня 1 уже сейчас; при корпусе
   в сотни карточек onboarding-очередь станет неподъёмной. Нужно решение (лимит на
   бэке или порционная выдача).
2. **Rate-limiter 60 мутирующих POST/мин** — харнессы уже пейсят запросы (п.0.7);
   полный корпус удлинит verify-прогоны.
3. **Уроки бандлятся, не фетчатся** (offline-решение RS-15, `index.ts:10-11`):
   сейчас 571 KB JS; каждый ~300-строчный урок добавляет ~8–30 KB raw. Сотни уроков —
   пересмотр стратегии бандла (code-split, о чём Vite уже предупреждает).
4. **Токены генерации**: ~7.8k токенов/урок только данных + источники + G-EXEC
   прогоны — бюджет волны наполнения считать от этого.

---

## Итоговая карточка базлайна

| Метрика | Значение | Как получено |
|---|---|---|
| Уроков | 19 (6 C#, 13 PY) | реестр + сид |
| Карточек | **59** (6 C#, 53 PY) | JSON-парс сида == grep фронта |
| Due нового пользователя, день 1 | **59** (лимита нет) | живой `GET /api/due` |
| Строк контента | 6005 | `wc -l` |
| Средний урок | **316 строк** (C# 178, PY 380) | `awk` по `wc -l` |
| Сцен | 316 (16.6/урок) | verify/viz-fit |
| JS-бандл | 571.88 KB (141.75 KB gzip, ВЕСЬ апп) | vite build |
| Харнессы | 5/5 ALL GREEN | живой прогон |
| xUnit | 65/65 passed | dotnet test |
| G-EXEC | работает (`elapsedMs:565`) | живой curl |
