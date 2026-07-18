# R-07 — Верификация майлстоуна M3 (F7 + F8: раздел S1 уроки 4–10)

Дата: 2026-07-18 · Ветка: `lessons-corpus/wave1` · Верификатор: ОРКЕСТРАТОР (исполняемые гейты) + адверсариальный accuracy-workflow (7 независимых проверяющих).

## ВЕРДИКТ: ПРИНЯТО

Раздел S1 «Типовая система» = **10/10 уроков**. Все гейты зелёные; единственный найденный факт-баг (records/EqualityContract) исправлен и доказан живым build.

## Исполняемые гейты (мой прогон)
| Гейт | Команда | Результат |
|---|---|---|
| step0 cleanup | `grep value-vs-reference app/src/app/home.ts` | 0 (stale id убран; 2 совпадения в records.ts — легит-проза «value-vs-reference equality», не id) |
| G1/каталог | `npm run build`; `/api/lessons` | build зелёный, entry 115 KB; каталог 23 (10 CS + 13 PY) |
| G2 harнессы | `npm run verify:all` | ALL GREEN (5 харнессов + density + fixtures; 23/23 урока на `at`) |
| G3 бэкенд | `dotnet test` | 67/67 |

## Accuracy-аудит (адверсариальный, ВСЕ 7 уроков, workflow audit-m3)
7 независимых проверяющих (agentType evaluator), каждый пытался ОПРОВЕРГНУТЬ свой урок против GT-M3-s1.md + живого Learn. **100 утверждений проверено.**
- **Clean с первого прохода (6/7):** structs-traps, interfaces-dim, enum-flags, generics-basics, nullable, casts — 0 неподтверждённых, 0 мифов, exec-интерпретация верна.
- **Найден 1 факт-баг (records, S1.5):** урок 3× утверждал «объявлять override `EqualityContract` — ошибка компиляции». ОПРОВЕРГНУТО: Learn «You can declare this property explicitly» + живой build (override EqualityContract компилируется). Миф-лист GT его НЕ содержал — поймал только per-lesson fetch-and-refute. **Ценность адверсариального аудита: без него баг ушёл бы в прод.**

## Фикс records (sha 9f7ec30) — проверен
Строки 74/109/182: EqualityContract перенесён из «ошибка» в «можно объявить» (+ цитата Learn); Object.Equals и ==/!= остались «ошибка» (верно); s5 (runtime-тип) не тронут. Build-доказательство (evidence/F7/records-equalitycontract-fix.txt): base virtual EqualityContract → compiles; derived override → compiles; override Object.Equals / operator == → CS0111. `verify:all --lessons CS.S1.records` ALL GREEN.

## Бюджет-чек (обязателен на M3)
M3 = 7 уроков (~150 tool-вызовов builder-а, ~21/урок) — в коридоре оценки 6–10/майлстоун. Кумулятив волны 1: **10/41 уроков** готовы (M1:3 + M3:7) + инфра M2. Остаток 31 (S2:9, S7:10, S17:7, S18:4, S4:1). При ~7/майлстоун → ещё ~4-5 майлстоунов → волна 1 финиширует ~M7-M8 (план был M6, +1-2). В пределах оценки, НЕ пересмотр скоупа; счётчик майлстоунов волны растёт — сообщено пользователю.

## Долги/наблюдения (в backlog)
- density.mjs не проверяет геометрию (layout-throws ловит viz-fit) — расширить density ИЛИ всегда гнать viz-fit per-урок (builder-наблюдение M3).
- Лимитер новых карт × растущий каталог давит дальние карты в харнессах — new-lessons.mjs чинён sim-walk'ом; повторится в M4+.
- Secret-gate hook ложно срабатывает на untracked M4 GT-файлах (`[EnumeratorCancellation] CancellationToken`) — GT-файлы держать закоммиченными (я коммичу GT в task-workspace).
