# STATE — lessons-corpus (уроки: книги + C# заново + инструменты бэкенда)

## Мета
Задача: Сделать уроки на основе всех книг из `books/` (по разделам книг), удалить существующие уроки по C#, заново пройти документацию C# и пересобрать все уроки по C#, плюс добавить уроки по инструментам, обычно нужным в C#-бэкенде. Результат — полный корпус уроков в формате приложения (уроки-как-данные): все книги + доки инструментов + сам C#.
Класс: mixed — document(информировать)-контент в форме кода-данных (TS-уроки + seed) внутри существующего продукта; режим improvement (не сломать движок/существующие треки, в т.ч. Python-уроки).
Workspace: /Users/admin/Desktop/CodeApp/docs/tasks/lessons-corpus/
Обновлено: 2026-07-17T21:45:00

## Фазы (словарь = стейт-машина SKILL)
- [x] 0 INTAKE
- [x] 1 RESEARCH — ПРИНЯТО критиком (R-02, раунд 2, 2026-07-17)
- [x] 2 ТЗ — Гейт ТЗ: УТВЕРЖДЕНО 2026-07-18 (все дефолты) — Режим: полный — чекпойнт после скелета: да (первые ~3 урока волны 1)
- [x] 3 DESIGN — ПРИНЯТО критиком (R-04 раунд 2, 2026-07-18); design.md + ADR-0001..0004 + features.md (F1–F18, M1–M6)
- [ ] 4 BUILD (builder; счётчик майлстоунов: 3/~7 — M1 R-05, M2 R-06, M3 R-07 ПРИНЯТ; прогноз волны вырос M6→~M7-M8 по факт-скорости 7/майлстоун)
- [ ] 5 VERIFY (финал + ретро)

## Рекап задачи (ЖИВОЙ — обновляется при смене вводных)
Пользователь просит: (1) уроки на основе ВСЕХ книг в `books/develop/` (~20 PDF: Кормен, Скиена, Грокаем алгоритмы, DDIA/Клеппман, Чистая архитектура, Фаулер PoEAA, Эванс DDD, Ньюмен и Ричардсон (микросервисы), Бёрнс и Таненбаум (распределённые системы), Release It!, Прагматик, EIP, CLR via C#, Кокоса (память .NET), Клири (конкурентность C#), Дэвис (async C#), Тюкачев (алгоритмы C#), Седжвик (Java-алгоритмы, .djvu)) — «с разными разделами», т.е. уроки по разделам книг; (2) УДАЛИТЬ существующие C#-уроки (async-await, boxing, closures, gc, hashtable, value-vs-reference в app/src/lessons/) и пересобрать трек C# заново по официальной документации C#, «все уроки»; (3) добавить уроки по инструментам, обычно нужным в C#-бэкенде (по их докам). Формат — существующий движок «урок-как-данные» (docs/AUTHORING-AI.md — плейбук), Python-трек (py-*) не трогать. Удаление C#-уроков — деструктивный шаг, требует преавторизации в ТЗ. Флаги: SAFETY нет, high-stakes нет.

## Следующий шаг
M3 (шаг 0 + F7 + F8) ЗАВЕРШЁН builder-ом (2028→фикт., реально 2026-07-18), 7 уроков S1.4–S1.10 self-pass с коммитами и доказательствами. Раздел S1 = **10/10**. Все машинные панели с реально снятыми числами (run-csharp); 0 красных флагов GT-M3-s1 во всех 7 уроках. `npm run verify:all` FULL **7/7 ALL GREEN** (23/23 урока), `dotnet test` **67/67**. Backend/preview остановлены. Отложенные M4 GT-файлы восстановлены.
Коммиты M3: 0939c7c (шаг0) · 393c689 (S1.4) · b9ced9d (S1.5) · 77c7bcf (S1.6) · 6c03483 (S1.7) · a4e0993 (S1.8) · 9c92212 (S1.9) · 415f9e5 (S1.10) · 28e0568 (layout+harness фиксы).
→ M3 ВЕРИФИКАЦИЯ (оркестратор): исполняемые гейты ЗЕЛЁНЫЕ (verify:all ALL GREEN, dotnet 67/67, home.ts step0 подтверждён, каталог 23=10CS+13PY). Accuracy-аудит АДВЕРСАРИАЛЬНЫЙ по ВСЕМ 7 урокам (workflow audit-m3, 100 утверждений): 6/7 clean, 0 мифов. БЛОКЕР: records.ts (S1.5) — 3× ложное «объявлять override EqualityContract — ошибка компиляции» (Learn: «You can declare this property explicitly», подтверждено живым build). Строки 74/109/182 — убрать EqualityContract из списка «ошибка», Object.Equals и ==/!= оставить (они верно=ошибка); s5 (139-173) НЕ трогать (там EqualityContract корректен). Fix дана builder-у.
БЮДЖЕТ-ЧЕК: M3 = 7 уроков (~150 tool-вызовов, ~21/урок) — в коридоре 6–10. Кумулятив волны 1: 10/41 уроков (M1:3 + M3:7) + инфра M2. Остаток 31 урок (S2:9, S7:10, S17:7, S18:4, S4:1) при 7/майлстоун ≈ 4-5 майлстоунов → волна 1 финиширует к M7-M8 (план был M6; +1-2). Не блокер, но счётчик майлстоунов волны вырастет — отражу в отчёте пользователю.
→ После fix records + re-audit → F7/F8 verified → отчёт пользователю (тачпойнт «чек после M3») → M4.
M3 ПРИНЯТ (R-07): records-фикс проверен на диске (строки 74/109/182 — EqualityContract в «можно», build-proof в evidence), F7/F8 → verified, S1 = 10/10. Milestone 3/~7.
→ M4 (F9–F11, S2 async, 9 уроков): builder №2 продолжается через SendMessage. GT-M4-s2.md (54 факта, 24 мифа) готов для accuracy. Наблюдения M3 в промпт builder-у: (a) GT-файлы держать закоммиченными (secret-gate hook ложно бил по untracked GT); (b) лимитер×каталог давит дальние карты в харнессах — правь sim-walk'ом как в M3; (c) стейт-машина async — сигнатурная панель раздела. По остановке M4 → оркестратор: verify:all+dotnet (сам поднимаю app), адверсариальный accuracy-workflow audit-m4 по всем 9 урокам (GT-M4-s2). Параллельно билду M4 — стейджу GT-M5 (память S7).
ОТЧЁТ ПОЛЬЗОВАТЕЛЮ по «чек после M3» — дан в этом ходе (M3 verified, аудит поймал+исправил 1 факт-баг, бюджет в коридоре, волна +1-2 майлстоуна). Продолжаю автономно.

## Фиче-борд (волна 1; правда — features.md)
| F | Название | Майлстоун | Золотой путь | Статус |
|---|---|---|---|---|
| F1 | Skeleton: registry+lazy+урок с панелью | M1 | да | verified (R-05) |
| F6 | Уроки S1.1, S1.3 | M1 | — | verified (R-05) |
| F2 | Миграция удаления 6 старых | M2 | — | verified (R-06; cleanup home.ts:371 → M3) |
| F3 | Лимит новых карт + sim-14d | M2 | — | verified (R-06) |
| F4 | Навигация трек→раздел (турнир) | M2 | да | verified (R-06) |
| F5 | verify:all + lint + density | M2 | — | verified (R-06) |
| F7–F8 | S1 уроки 4–10 | M3 | — | verified (R-07; records-баг найден аудитом и исправлен 9f7ec30) |
| F9–F11 | S2 async 1–9 | M4 | — | todo |
| F12–F14 | S7 память 1–10 | M5 | — | todo |
| F15–F16 | S17 коллекции 1–7 | M6 | — | todo |
| F17 | S18 итераторы 1–4 | M6 | — | todo |
| F18 | closures + закрытие волны | M6 | — | todo |
Решения гейта (2026-07-18): ТЗ утверждено целиком; цитаты — идеи своими словами, дословно только открытые доки; нечитаемые — OCR в P2, Седжвик исключён; волна 1 = инфраструктура + миграция + ~41 урок C# core. Режим: полный.

## Синтез research (итог фазы 1, ≤10 строк)
1. Формат жёсткий и зелёный: урок = TS-файл (LessonData) + index.ts + сид-JSON; 5 харнессов + dotnet test 65/65 + G-EXEC — всё зелёное (RS-baseline v2). База: 19 уроков, 59 карточек, средний урок 316 строк.
2. Ёмкость корпуса (сводка, потолок): C# по докам — 141 урок (108 core, 21 раздел, URL верифицированы; RS-03 v2); инструменты — 23 шт., ~100–130 уроков (RS-04; оценка «C# 15–20» в RS-04 устарела, истина RS-03); книги — ~280–380 уроков читаемых сейчас (RS-02a/b). Итого ≈ 520–650.
3. Цена (проба, честная): 6–10 exec-уроков/майлстоун 40ч; полный корпус ≈ 60–100 майлстоунов → волны, ратифицирует пользователь.
4. Нечитаемы без OCR: Кормен, Фаулер PoEAA, EIP, Седжвик (.djvu, кандидат на исключение — дубль алго-тем на Java).
5. Card.verify обязателен типом → non-exec темы (архитектура, книги-советы) сегодня = только MCQ; generation-карточки требуют нового механизма + чек «run не содержит ответ» (антифальсификация).
6. Удаление 6 C#-уроков затрагивает: 6 TS + index.ts + 6 сид-JSON + харнессы run.mjs/new-lessons.mjs + сироты review_state; нужна миграция.
7. Лимита новых карт/день НЕТ: due дня 1 = все 59 карт; при корпусе 500+ это блокер UX — лимит обязателен до массового наполнения.
8. Инфраструктурные пререквизиты корпуса: code-splitting (бандл 571.88 KB raw — все уроки статически), навигация трек→раздел, LessonLang расширить.
9. Пересечения: Рихтер/Кокоса/Дэвис ⊂ трек C#; Ньюмен↔Ричардсон; Клеппман↔Таненбаум; Кормен⊃Грокаем — нужен concept-реестр «тема → один канонический урок».
10. Копирайт: PDF — коммерческие переводы; политика «идеи своими словами, дословные цитаты только из открытых доков» — решение пользователя на гейте.

## Архив синтеза (детали по RS)

### RS-03: Реестр документации C# (Microsoft Learn)
**Статус**: ✓ ГОТОВО  
**Дата**: 2026-07-17  
**Файл**: `/Users/admin/Desktop/CodeApp/docs/tasks/lessons-corpus/research/RS-03-csharp-docs.md`

**Корпус**: Официальная документация Microsoft Learn (https://learn.microsoft.com/en-us/dotnet/csharp/)  
**Метод**: WebFetch основные разделы + анализ первоисточников  
**Дата фетча**: 2026-07-17

**Результат (v2 после критики)**: 21 раздел C#, **141 урок** (core: 108, optional: 33); все URL проверены (curl + деревья dotnet/docs и dotnet-api-docs, 2026-07-17); 17 битых URL заменены; добавлены разделы: коллекции-внутренности (hashtable сохранён), итераторы/yield, System.Text.Json, Channels, IO/Pipelines

**Core разделы (v2: 108 уроков в 15 core-разделах; ниже исходные 16 + 5 новых)**:
1. Type System (10) — value/reference, generics, variance
2. Async/Await & Task (9) — TAP, state machine, ConfigureAwait, SyncContext
3. LINQ (8) — query syntax, Expression trees, IQueryable, lazy eval
4. Delegates & Events (7) — lambdas, closures, variance, multicast
5. Pattern Matching (7) — switch expr, list patterns, guards, exhaustiveness
6. Reflection & Attributes (7) — Type inspection, IL emit, source generators
7. Memory & GC (10) — generational GC, Span<T>, Boxing, unsafe, finalizers
8. Threading & Sync (9) — primitives, TPL, Interlocked, lock-free patterns
9. Exceptions (7) — hierarchy, async handling, filters, SEH integration
10. Generics Deep Dive (8) — constraints, specialization, variance
11. Expression Trees (6) — compilation, visitors, metaprogramming
12. Strings & Interning (6) — allocation, pooling, Regex, culture
13. IoC & DI (5) — container, lifetimes, factories, decorators
14. Modern C# 8–15 (7) — nullability, records, init, union types, closed hierarchies
15. Unsafe & P/Invoke (6) — pointers, DllImport, marshalling, COM interop
16. Spec & Roslyn (5) — language spec, overload resolution, source generators

**Статистика**:
- Текущий трек: 6 уроков (async-await, boxing, closures, gc, hashtable, value-vs-reference)
- Полный core: 108 уроков; полный (с optional): 141 урок
- Покрытие: Все senior-уровневые темы (IL, memory models, async statemachine, Span, generics internals, delegates, LINQ internals, pattern matching, records/structs, boxing, string interning, exceptions, reflection, interop, threading/lock internals, GC tuning, reflection, Roslyn)

**Первоисточник**: 100% official Microsoft Learn, версии C# 8–15, .NET Standard 2.1+, .NET 6–11

**Пропуски**:
- ASP.NET Core (отдельная траектория, не C# core)
- Entity Framework Core (упомянут как LINQ provider, но ORM — отдельно)
- Books (RS-02a/b) — не входят в RS-03, ортогональны

---

### RS-01 (формат + базлайн) — ОЖИДАНИЕ
**Статус**: В очереди  
**Ответ**: PENDING  

### RS-02a/b (книги: инвентарь + разделы) — ОЖИДАНИЕ
**Статус**: В очереди  
**Ответ**: PENDING  

### RS-04 (инструменты бэкенда: доки) — ОЖИДАНИЕ
**Статус**: В очереди  
**Ответ**: PENDING  

---

## Фиче-борд (зеркало features.md — там источник правды)
| F | Название | Майлстоун | Золотой путь | Статус | Раунд оценки |
|---|---|---|---|---|---|

## Карта рисков / сомнения агентов
- ⚠️ **Масштаб огромный**: даже 108 core-уроков C# — пользователь ратифицирует очередность/волны на гейте ТЗ
- ⚠️ **Книги (RS-02) + инструменты (RS-04)** пока не исследованы — их объём ещё не известен
- ⚠️ **Удаление 6 C#-уроков** может ломать ссылки в app/src/lessons/index.ts и backend seed — проверить связность на фазе DESIGN
- ⚠️ **Волны build**: Рекомендуется split на 3+ волны: Wave 1 (core memory/async/generics), Wave 2 (LINQ/pattern/reflection), Wave 3 (optional + книги + инструменты)

## Backlog (МЕЛОЧИ / P2-хвосты)
- Согласование с AUTHORING-AI.md по структуре данных (metadata, tags, difficulty)
- Из R-03: ADR non-exec — назвать цену дефолта MCQ; G4-lint ловит только литеральный ответ (докрутить); выборка G7 — случайная, seed у evaluator-а; порог G1 пересчитать после code-splitting
- Из R-03 (сигналы): «первый вау ≤ N минут» — числовую планку задаёт design; RS-04 пересобрать (слой практиков, NUnit-версия) до ратификации волны 2

## Журнал (append-only, не редактировать прошлые строки)
- 2026-07-17 — Фаза 0: класс mixed/improvement, workspace docs/tasks/lessons-corpus/, флагов нет. Обнаружено: books/develop 20 файлов; текущие C#-уроки 6 шт. + py-* 13 шт. в app/src/lessons/.
- 2026-07-17 21:45 — Фаза 1: RS-03 (реестр C# docs) ГОТОВ (v1: 117 уроков/16 разделов).
- 2026-07-17 — RS-03 v2 после критики: все 141 URL верифицированы (curl 65×200/8×404/68×429 + деревья dotnet/docs 28097 файлов и dotnet-api-docs), 17 битых заменены, +5 разделов (+24 урока). Итог: 21 раздел, 141 урок (core 108 / optional 33).
- 2026-07-17 22:10 — Фаза 1: все RS на диске (RS-02a/b дописаны после сетевых падений агентов). Ёмкость: книги ~280–380 ур., C# 141 (v2), инструменты ~100–130. Проба: урок исполним, 336 строк, tsc зелёный.
- 2026-07-18 ~05:30 — M2 ПРИНЯТ (R-06, оркестратор перепрогнал все гейты сам): verify:all ALL GREEN, dotnet 67/67, sim-14d 14д ALL GREEN, fresh due=10 (было 66), prefetch 3/22 (было 22/22, net-capture), vtable-источники BOTR(200)/ECMA-335 в s3, F4-нав осмотрена глазами. F2–F5 verified. Мелочь home.ts:371 stale-ref → фикс на входе M3. Task-workspace закоммичен 376b22c. GT-M3-s1.md готов для accuracy. Fresh-evaluator падал на stall ×2 → M2 верифицировал оркестратор (исполняемо-тяжёлый, 0 нового контента); M3+ вернёт fresh-evaluator против app оркестратора.
- 2026-07-18 ~04:00 — ЧЕКПОЙНТ M1 пройден: пользователь «Да, продолжать» + «Автономно, чек после M3». Consumer×2 упал (транзиент платформы, не продукт) — оркестратор осмотрел сам. Спавн M2 через SendMessage builder-у №2. Впредь app для verify поднимает ОРКЕСТРАТОР (агенты в foreground → stall watchdog).
- 2026-07-18 ~03:30 — M1 evaluator R-05: ПРИНЯТО (все гейты pass, 7/7 exec re-run, accuracy verbatim vs Learn 0/15 мифов, паспорт PASS). Оркестратор посмотрел скриншоты сам: home on-brand, панель «0 vs 24 байта» и vtable-слот сильные. F1/F6 verified. Verify-workflow упал на stall (app в foreground у агентов); eval-отчёт спасён с диска; consumer перезапущен против поднятого app. Долги (vtable-провенанс, prefetch-ADR, G9-лимит) → вход M2.
- 2026-07-18 ~02:00 — Builder №2 (Opus) закрыл M1 self-pass: registry+lazy-чанки, порт 19 уроков, 3 урока C# (value-types-copy турнир B=аллокации, type-system-map, classes-virtual-dispatch). Entry 571.88→110.20 KB raw (−81%). 5 харнессов+dotnet test 65/65 зелёные. Коммиты на lessons-corpus/wave1. GT-M1.md (24 факта+15 мифов) готов для accuracy-аудита. Запущен verify-workflow M1.
- 2026-07-18 00:40 — Builder №1 (Fable 5) срезан лимитом кредитов на 36 tool-uses, 0 записи на диск (только чтение контекста). Сессия → Opus 4.8 1M ctx + ultracode. Диск-правда: M1 не начат. Re-спавн builder №2, коммит-после-под-шага.
- 2026-07-18 — Гейт ТЗ УТВЕРЖДЁН пользователем (все дефолты: цитаты своими словами; OCR в P2, Седжвик исключён; волна 1 = C# core ~41). Фаза 3: design+ADR+features написаны, критика R-04: раунд 1 ДОРАБОТАТЬ (G7-скрипт, verify:all, порт 19 уроков, панель с замером) → правки → раунд 2 ПРИНЯТО-С-ЗАМЕЧАНИЯМИ. Мелочи в Backlog. Фаза 4: спавн builder-а на M1 (F1+F6).
- 2026-07-17 22:20 — Критика R-02: ДОРАБОТАТЬ. Блокеры: проба без REPORT.md и с фальшивым G-EXEC (echo ответа); RS-03 — 404-URL, нет collections internals/STJ/Channels/IO/yield; базлайн без прогонов verify/viz-fit/loop/G-EXEC; противоречия объёма. Запущен раунд доработки 1/2 теми же агентами.
- 2026-07-17 23:10 — Доработки завершены: проба честная (non-exec = MCQ, цена 6–10 ур./майлстоун), базлайн v2 (все харнессы зелёные, 59 карточек, due=59), RS-03 v2 (141 урок/21 раздел). R-02 раунд 2: ПРИНЯТО с условиями к ТЗ. Фаза 1 закрыта.
- 2026-07-17 23:20 — Фаза 2: brief.md написан (волны, ставка вау «уровень ниже абстракции», гейты G1–G9, преавторизация удаления 6 C#-уроков). Спавн critic-а на ТЗ (R-03).
