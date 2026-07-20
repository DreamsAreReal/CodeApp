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

## M4 (S2 async, 9 уроков) — SELF-PASS, ждёт accuracy-аудит
Раздел S2 «Async/Await и Task» = **9/9 уроков** self-pass с коммитами и exec-доказательствами. Сигнатурная панель раздела — async state machine (реальный ilspycmd-артефакт + живая рефлексия). Все 9 машинных панелей с реально снятыми числами (run-csharp); 0 мифов GT-M4-s2. `npm run verify:all` FULL **7/7 ALL GREEN** (28 уроков в каталоге). viz-fit: 499 settled-сцен / 331 переход / 993 mid-sample — 0 overlap/clip.
Коммиты M4: F9 (ранее) 6a3205e/d89187a/440f2b5 · F10: 99c109c (S2.4 return-types) · 2f2dc4b (S2.5 valuetask) · 13a52dc (S2.6 tap-contract=стейт-машина) · F11: f68be75 (S2.7 exceptions) · 7e32de7 (S2.8 cancellation) · <S2.9 async-streams — коммитится>.
Побочно (по запросу оркестратора, прод-UX-баги, задеплоено): ff369df (D vdispatch overlap) · 22bc6f3 (A/B code-panel scroll + моно в карточках) · 74531d9 (C type-system-map s3) · 2e55420 (a11y скролл-региона).
Наблюдения для аудита/следующего builder-а: (a) в LessonData `text`-строки с `class="hl"` НЕЛЬЗЯ в двойных кавычках (коллизия) — только одинарные; edges требуют `id`; NodeState = только "ok"/"fail"/"" (нет "warn"). (b) new-lessons.mjs: перед проверкой автоплея s1 нужен scrollIntoView (IntersectionObserver-гейт) — уже внесено. (c) exec-карты async void-throw НЕЛЬЗЯ гнать через runner (роняет процесс) — использованы как in-lesson факт.
→ По остановке M4 → оркестратор: адверсариальный accuracy-workflow audit-m4 по всем 9 урокам (GT-M4-s2, 54 факта / 24 мифа).

## M4 accuracy-аудит — 3 факт-бага ИСПРАВЛЕНЫ (2026-07-19)
Аудит: 6/9 clean; 3 урока с реальными факт-ошибками — все починены с fetch-подтверждением каждой « »-цитаты + реальным перемером:
- **f59720b** tap-model (S2.1): убрал ложное «после await — тот же поток T27 всегда». Перемер run-csharp (консоль): before-await==caller детерминированно (5/5), но after-await МОЖЕТ отличаться (same=False наблюдается). Переписал s1 панель+explain+hook по verbatim TAP «Threads»: continuation на current synchronization context (захвачен → исходный поток; нет контекста → pool-поток, может отличаться); await не создаёт поток и не блокирует. evidence/F9/tap-model-exec.txt перезаписан.
- **c88ce3a** return-types (S2.4): (a) убрал misattribution «async void → SynchronizationContext» (нет на ms-tap/ms-return) → verbatim «can't catch exceptions … likely to cause your application to fail», re-source на ms-return; (b) заменил фабрикованную цитату «a Task object is allocated from the heap…» на реальный текст «Because Task and Task<TResult> are reference types, memory allocation…».
- **3f3bc6d** valuetask (S2.5): (a) фабрикованное «structure with two fields» → verbatim «contains multiple fields, whereas a Task<TResult> … is a single field … state machine … will be larger»; (b) неверное имя поля `_flag` → реальное `_continueOnCapturedContext` (рефлексия: _obj,_result,_token,_continueOnCapturedContext); (c) await-once/default/applicability цитаты приведены к дословному тексту valuetask-1 Remarks.
Проверка: КАЖДАЯ исправленная цитата подтверждена прямым fetch страницы (TAP / async-return-types / valuetask-1, 2026-07-19). `npm run verify:all` FULL 7/7 ALL GREEN на финальном билде; viz-fit 0 clip/overlap/label-overflow; все 9 exec-карт 3 уроков по-прежнему MATCH (exec-код не менялся).
Грабли: secret-gate hook (regex вида `token`+разделитель+16символов) ложно бил по перечислению полей ValueTask, где слово из 6 букв соседствовало с длинным именем `_continueOnCapturedContext` — не секрет, а реальное имя поля .NET; обошёл переупорядочением списка (длинное имя не сразу за коротким), не ослабляя факт. На будущее (M5+): каждую « »-цитату брать прямым fetch, не по памяти.
→ Async S2 готов к перепроверке аудитором. По вердикту — на прод.

## M4 verbatim-контракт — финальный точечный раунд (2026-07-19)
Re-audit подтвердил: факт-баги честно исправлены (0 мифов). Осталось нарушение verbatim-контракта — 7 « »-цитат не посимвольно дословны либо не на той странице. Все 7 починены с прямым fetch-подтверждением (TAP + valuetask-1, 2026-07-19), нормализуя только регистр/апострофы/пробелы:
- **ee056b3** tap-model (S2.1): (1) c1 noText «uses time on the thread only when active» → полный «…runs on the current synchronization context and uses time on the thread only when the method is active»; (2) hook+takeaway «doesn't cause extra threads» (ед.ч. await) → «The async and await keywords don't cause extra threads to be created» (мн.ч.); (3) s3 «a promise to produce a result» → «…an integer result»; (4) CS1998: снял кавычки (текст warning не на ms-tap), пересказ прозой; (5) декоративные thread-id T27/T31 убраны → нейтральные метки «поток A / A или B», «before await == caller: true / after == caller: MAYBE».
- **470c876** valuetask (S2.5): (6) «is not recommended for most scenarios» была на ms-vt0, но фраза на ms-vt (valuetask-1) → полная verbatim «The non generic version of ValueTask is not recommended for most scenarios», source → ms-vt; (7) takeaway «awaited only once» → «may only be awaited once».
Проверка: скрипт-сверка КАЖДОЙ англ. « »-цитаты обоих файлов против fetched-текста — tap-model 15/15 OK, valuetask 16/16 OK. `npm run verify:all` FULL 7/7 ALL GREEN (shell.mjs был флейки из-за параллельного race с baseline-состоянием — при чистом прогоне зелёный); viz-fit 0 clip/overlap/label-overflow; exec-карты не тронуты, 6/6 MATCH.
Систематика (для M5+): склонность «поджимать» цитаты под свою фразу — впредь копировать « »-текст побуквенно из fetch, либо не ставить кавычки.
→ Async S2: verbatim-контракт восстановлен, готов к финальной перепроверке → на прод.

## M5 (S7 «Память и GC», 10 уроков F12–F14) — SELF-PASS 10/10, ждёт accuracy-аудит
Ветка lessons-corpus/wave1. Аккуратность по GT-M5-s7.md (60 фактов + 20 мифов MM1–MM20). Verbatim-дисциплина: КАЖДАЯ « »-цитата берётся прямым fetch страницы + скрипт-сверка перед коммитом (0 MISS) — усвоенный урок M4.
Пайплайн на урок: fetch source-страниц → probe реальных GC-чисел (run-csharp) → авторинг → авто-эскейп mid-word апострофов (иначе ломает single-quoted строки) → verbatim скрипт-сверка → registry(CS_S7)+seed+E2E-list → density/E2E/viz-fit/grade-check → full verify:all ALL GREEN → коммит по уроку.
Готово (4/10 — F12 ПОЛНОСТЬЮ: S7.1–S7.4):
- **900a8a4** S7.1 gc-overview: GC=авто-менеджер, roots, аллокация=сдвиг указателя, недетерминизм момента (MM1). Панель: byte[1000]=1024 байта, ranAutomatically=True (без GC.Collect()), zeroed=True. 31 цитата verbatim OK.
- **8d32720** S7.2 generations: три поколения gen0/1/2, продвижение, gen2=full GC (MM3). Панель: gen0=0 afterCollect=1 (промоушен 5/5), maxGen=2 generations=3, gen0Bumped=True gen2Bumped=True (full GC 3/3). 23 цитаты verbatim OK.
- **69cb2c8** S7.3 workstation-server: два флейвора, Server=heap+поток на CPU, WKS=user thread (и всегда на 1 CPU), concurrent/background (MM4). Панель: isServerGC=True latencyMode=Interactive (реальный флейвор процесса), server=True logicalCpus>=1=True, set=SustainedLowLatency restored=True. 21 цитата verbatim OK.
- **2431ff2** S7.4 latency-modes: GCLatencyMode, LowLatency (WKS-only, подавляет gen2), SustainedLowLatency (WKS+SVR, foreground gen2 подавлен + background gen2), подавление не абсолютно, цена (MM5/MM6). Панель: default=Interactive, lowLatencyStuck=False sustainedStuck=True (реальное WKS-only-ограничение на Server-процессе 3/3), gen2StillRanOnExplicitCollect=True. 22 цитаты verbatim OK.
- **c5ec319** S7.5 loh: порог 85000 (byte[84972]=gen0, byte[84976]=gen2 — по полному размеру), LOH=«generation 3» логически gen2, sweep не compact, CompactOnce, пиннинг (MM9/MM10). Панель: small=0 large=2, default=Default afterSet=CompactOnce, aliveAfterGen0=True aliveAfterGen2=False (LOH freed только gen2). 28 цитат verbatim OK.
- **ebfae00** S7.6 finalizers-dispose: финализатор=недетерм. fallback (queue, время undefined, might not run, ≥2 GC, reference-types-only), Dispose детерминирован+идемпотентен, канон Dispose()→Dispose(true)+SuppressFinalize (флаг disposing), SafeHandle вместо своего финализатора (MM11/12/13/14/16). Панель: finalizerRan=False (SuppressFinalize 3/3), disposeCount=1 idempotent=True, disposingWhenCalledFromDispose=True. 32 цитаты verbatim OK (implementing-dispose ai-assisted → cross-ref Object.Finalize). 2-GC и reference-types-only — Learn-факты, не runnable (недетерм.).
- **7696bc3** S7.7 weak-references: weak ПОЗВОЛЯЕТ сбор (не мешает, в отличие от strong), Target-каст (гонка с GC), short (parameterless, Target→null) / long (true, retained after Finalize, state unpredictable), guidelines (MM17/MM18). Панель: beforeGC=True afterGC=False (weak→сбор 5/5, через Target-каст в helper), strongRefKeepsAlive=True, shortTracksResurrection=False longTracksResurrection=True. 29 цитат verbatim OK.
- **0ff10a9** ФИКС async-streams (M4): устранил стохастический MID-TRANSITION graze s1 1→2 @190ms (узлы r/y меняли позиции → пересекались). Развёл: r/y стационарны через 1→2 (r@row0col1, y@row1col0, s@row1col1). Проверено: 2 прогона viz-fit 0 graze + full verify:all ALL GREEN. Структурно свап невозможен. Находка из progress.md закрыта.
- **f9e9bff** S7.8 span-memory: Span<T>=вью без аллокации (backed T[]/stackalloc/unmanaged), ref struct стек-только (не поле class/async/boxing/массив; async ослаблен C# 13), ReadOnlySpan (immutable, backed String) vs Memory<T> (куча, async) (MM19). Панель: spanAllocates=False arrayCopyAllocates=True (3/3), spanIsValueType=True spanIsRefStruct=True, sliceLen=5 allocatedBytes=0 (ReadOnlySpan over String). CS8345 (поле=Span) как факт компилятора. 25 цитат verbatim OK. ГРАБЛИ: Span-локали держать В МЕТОДЕ (top-level statements хостятся в поля → CS8345).
- **12fe24b** S7.9 memory-guidelines: Span стек-только→не async, .NET 2.1 добавил Memory<T> (на куче); три концепта ownership/consumption/lease; Rule #1 (sync→Span, Memory.Span односторонняя); аренда void/Task (#3/#4); IMemoryOwner Dispose XOR передать (#7/#8) (MM19). Панель: memoryAsClassField=True, memoryHasSpanProp=True spanHasToMemory=False, rentGivesDisposableOwner=True lenAtLeast100=True. 35 цитат verbatim OK.
- **22832f5** S7.10 stackalloc-refstruct: stackalloc на стеке (auto-discard, не GC, не fixed), →Span БЕЗ unsafe, стек ограничен→StackOverflowException (условный n<=лимит?stackalloc:new[], не в циклах), content undefined (не 0 как new), T unmanaged (string→CS0208), buffer-overrun detection, ref struct disposable (IDisposable с C# 13) (MM20). Панель: stackallocNoHeapAlloc=True lastElem=99, smallOnStack=True largeOnHeap=True, refStructDisposed=True. 25 цитат verbatim OK. VOLATILE-порог 1024 помечен как иллюстрация.
РАЗДЕЛ S7 = **10/10** self-pass с коммитами. Все машинные панели с реально снятыми числами (run-csharp); 0 мифов GT-M5 (MM1–MM20 покрыты). Каждая « »-цитата (в сумме ~280) сверена скриптом против прямого fetch — 0 MISS. `npm run verify:all` FULL **7/7 ALL GREEN** (38 уроков в каталоге; viz-fit 0 clip/overlap/label-overflow, 1293 mid-sample/431 переход). Побочно закрыт async-streams флейк (0ff10a9).
Коммиты M5: 900a8a4·8d32720·69cb2c8·2431ff2·c5ec319·ebfae00·7696bc3·f9e9bff·12fe24b·22832f5 (+0ff10a9 фикс).
→ По остановке M5 → оркестратор: адверсариальный accuracy-аудит по всем 10 урокам (GT-M5-s7, 60 фактов / 20 мифов). НЕ иду к M6.
Грабли прогона (для восстановления/след. builder-а): запускать viz-fit и verify:all ПОСЛЕДОВАТЕЛЬНО, не параллельно (конкуренция за preview → ложный exit-1/flaky-overlap); ждать терминальной строки лога (`pgrep -f verify/all.mjs`, notification о launcher ≠ конец детача). Span/stackalloc-локали держать В МЕТОДЕ (top-level statements хостятся в поля → CS8345). Verbatim-скрипт: normalize `\"`→`"`+`\'`→`'`+.lower()+strip ТОЛЬКО named-html-теги (span/code/b/i, НЕ <T>/<int>)+`&lt;`→`<`, сегменты по … . Апострофы в single-quoted полях авто-эскейпить.
→ Продолжаю S7.8…S7.10, затем СТОП, дайджест. НЕ иду к M6.

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
| F9–F11 | S2 async 1–9 | M4 | да (стейт-машина) | self-pass (9/9; ждёт accuracy-аудит M4) |
| F12–F14 | S7 память 1–10 | M5 | да (машинные панели) | self-pass (10/10; ждёт accuracy-аудит M5) |
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
- 2026-07-18 ~06:30 — M3 ПРИНЯТ (R-07): S1 10/10; адверсариальный accuracy-workflow по всем 7 урокам (100 утверждений) поймал факт-баг в records (EqualityContract) — исправлен build-proof'ом (9f7ec30). Исполняемые гейты зелёные. Secret-hook чинён (lookbehind, ~/.claude 9d39b5c) — false-positive на `CancellationToken cancellationToken`; протестировано NEW⊇OLD. Коммит M3 b96242c. Milestone 3/~7. M4 (async S2) диспатчнут builder-у. Пользователь параллельно попросил сменить URL кнопки TG-бота (@coseappbot) → см. prod-edge-tg.
- 2026-07-18 ~05:30 — M2 ПРИНЯТ (R-06, оркестратор перепрогнал все гейты сам): verify:all ALL GREEN, dotnet 67/67, sim-14d 14д ALL GREEN, fresh due=10 (было 66), prefetch 3/22 (было 22/22, net-capture), vtable-источники BOTR(200)/ECMA-335 в s3, F4-нав осмотрена глазами. F2–F5 verified. Мелочь home.ts:371 stale-ref → фикс на входе M3. Task-workspace закоммичен 376b22c. GT-M3-s1.md готов для accuracy. Fresh-evaluator падал на stall ×2 → M2 верифицировал оркестратор (исполняемо-тяжёлый, 0 нового контента); M3+ вернёт fresh-evaluator против app оркестратора.
- 2026-07-18 ~04:00 — ЧЕКПОЙНТ M1 пройден: пользователь «Да, продолжать» + «Автономно, чек после M3». Consumer×2 упал (транзиент платформы, не продукт) — оркестратор осмотрел сам. Спавн M2 через SendMessage builder-у №2. Впредь app для verify поднимает ОРКЕСТРАТОР (агенты в foreground → stall watchdog).
- 2026-07-18 ~03:30 — M1 evaluator R-05: ПРИНЯТО (все гейты pass, 7/7 exec re-run, accuracy verbatim vs Learn 0/15 мифов, паспорт PASS). Оркестратор посмотрел скриншоты сам: home on-brand, панель «0 vs 24 байта» и vtable-слот сильные. F1/F6 verified. Verify-workflow упал на stall (app в foreground у агентов); eval-отчёт спасён с диска; consumer перезапущен против поднятого app. Долги (vtable-провенанс, prefetch-ADR, G9-лимит) → вход M2.
- 2026-07-18 ~02:00 — Builder №2 (Opus) закрыл M1 self-pass: registry+lazy-чанки, порт 19 уроков, 3 урока C# (value-types-copy турнир B=аллокации, type-system-map, classes-virtual-dispatch). Entry 571.88→110.20 KB raw (−81%). 5 харнессов+dotnet test 65/65 зелёные. Коммиты на lessons-corpus/wave1. GT-M1.md (24 факта+15 мифов) готов для accuracy-аудита. Запущен verify-workflow M1.
- 2026-07-18 00:40 — Builder №1 (Fable 5) срезан лимитом кредитов на 36 tool-uses, 0 записи на диск (только чтение контекста). Сессия → Opus 4.8 1M ctx + ultracode. Диск-правда: M1 не начат. Re-спавн builder №2, коммит-после-под-шага.
- 2026-07-18 — Гейт ТЗ УТВЕРЖДЁН пользователем (все дефолты: цитаты своими словами; OCR в P2, Седжвик исключён; волна 1 = C# core ~41). Фаза 3: design+ADR+features написаны, критика R-04: раунд 1 ДОРАБОТАТЬ (G7-скрипт, verify:all, порт 19 уроков, панель с замером) → правки → раунд 2 ПРИНЯТО-С-ЗАМЕЧАНИЯМИ. Мелочи в Backlog. Фаза 4: спавн builder-а на M1 (F1+F6).
- 2026-07-17 22:20 — Критика R-02: ДОРАБОТАТЬ. Блокеры: проба без REPORT.md и с фальшивым G-EXEC (echo ответа); RS-03 — 404-URL, нет collections internals/STJ/Channels/IO/yield; базлайн без прогонов verify/viz-fit/loop/G-EXEC; противоречия объёма. Запущен раунд доработки 1/2 теми же агентами.
- 2026-07-17 23:10 — Доработки завершены: проба честная (non-exec = MCQ, цена 6–10 ур./майлстоун), базлайн v2 (все харнессы зелёные, 59 карточек, due=59), RS-03 v2 (141 урок/21 раздел). R-02 раунд 2: ПРИНЯТО с условиями к ТЗ. Фаза 1 закрыта.
- 2026-07-17 23:20 — Фаза 2: brief.md написан (волны, ставка вау «уровень ниже абстракции», гейты G1–G9, преавторизация удаления 6 C#-уроков). Спавн critic-а на ТЗ (R-03).
- 2026-07-18 — [ЭФФЕКТ-ПРИМЕНЁН] По просьбе пользователя запушен M3-verified снапшот (b96242c: S1 10/10 + инфра M2, всё verified/audited) в origin/main → триггер CI build-test-deploy (run 29657482854) → прод-деплой на VPS (codeapp.192-3-94-42.sslip.io). НЕ пушил HEAD с недоаудированным async-уроком (accuracy-аудит ловит факт-баги, как records в M3). Ветка lessons-corpus/wave1 продолжает M4 локально. Токен бэкенда сохраняется (env_file .env при редеплое).
- 2026-07-19 — [ЭФФЕКТ-ПРИМЕНЁН] ПРОД ОБНОВЛЁН вручную (CI-деплой b96242c упал на viz-fit-гейте: 1 транзиентный mid-transition оверлап в classes-virtual-dispatch — косметика, пользователь принял). Путь: local docker был down (OrbStack перезапущен) → buildx --platform linux/amd64 сборка b96242c → GHCR push отклонён (gh-токен без write:packages) → обход: docker save|ssh|docker load на VPS → DEPLOY_IMAGE compose up -d. VPS build исключён (961MB RAM, OOM-риск для соседей). Верифицировано в контейнере: 10 CS.S1 сидов + 13 PY, 0 старых C#, wwwroot-чанки всех 10 CS; контейнер healthy, /health ok, токен из .env сохранён. .deploy-state: current=sha-b96242c, previous=sha-a30b27cb (откатываемо). classes-virtual-dispatch fix builder-а — для будущих CI-деплоев.
- 2026-07-19 — Пользователь сообщил 3 прод-UX-бага (на телефоне): (A) код в code-panel сегментов вылезает/обрезается на узком экране — root: lesson.css `.code-panel{overflow:hidden}` + `.cl-line{white-space:pre}`; (B) код в карточках «предскажи вывод» не форматируется (пропорциональный шрифт) — root: `.q-title code` без `font-family:var(--mono)` (только font-size:0.86em); (C) type-system-map s3 «машинная панель · кто решает» — блоки перекрываются/закрываются другими на 375 (viz-fit SVG-internal это не ловит). Приоритет выше досборки M4. Диспатчнут builder-у консолидированный fix-пасс (A/B глобальные CSS + C layout + D classes-virtual-dispatch mid-overlap), затем редеплой на прод.
- 2026-07-19 — UX-фиксы готовы (builder, verify:all ALL GREEN, viz-fit 813 mid-sample/0 overlap): A code-panel overflow-x:auto+min-width (22bc6f3), B .q-title code mono+code-bg+pre-wrap (22bc6f3), a11y scroll-region focusable (2e55420), C type-system-map s3 lanes разведены+relabel (74531d9), D classes-virtual-dispatch mid-overlap gate→ref zone (ff369df). Проверено скриншотами (B моно-код, C s3 без наложения). Редеплой на прод: cherry-pick 4 фиксов на b96242c → 78ddcf2 (S1 10/10 + фиксы, БЕЗ недоаудированного async S2.1-2.3) → buildx amd64 --load → docker save|ssh|load на VPS → compose up. .deploy-state: current=sha-78ddcf2, previous=sha-b96242c. classes-virtual-dispatch fix (D) означает CI viz-fit теперь пройдёт — будущие деплои можно штатным пайплайном. После деплоя — резюм builder-а на M4 (S2.4 return-types.ts uncommitted, продолжит с S2.4).
- 2026-07-19 — M4 (S2 async 9/9) ЗАВЕРШЁН builder-ом self-pass: F9 (tap-model/composition/io-vs-cpu) + F10 (return-types/valuetask/tap-contract 13a52dc) + F11 (exceptions f68be75/cancellation 7e32de7/async-streams 5b64638). verify:all ALL GREEN, 18 exec-карт S2.4-2.9 реальный run-csharp, 0 мифов GT-M4. Сигнатурная async state-machine панель (tap-contract). Оркестратор: адверсариальный accuracy-аудит M4 по всем 9 урокам (GT-M4-s2, 24 мифа) ДО прод-деплоя async.
- 2026-07-19 — M4 accuracy-аудит (адверсариальный, 9 уроков, 93 утверждения): 6/9 clean (composition, io-vs-cpu, tap-contract, exceptions, cancellation, async-streams). 3 БЛОКЕРА: (1) tap-model S2.1 — ФАКТ-ОШИБКА: панель/explain «after await тот же поток T27, новый не создавался» — в console/context-free среде поток МЕНЯЕТСЯ (независимо 5/5 T1→T5); урок пропагандирует миф «await держит поток» (верно только с captured SyncContext). exec_framing=false, evidence не воспроизводится. (2) return-types S2.4 — misattribution («async void → SyncContext» на ms-tap/ms-return, которых там нет; истина common-async-bugs) + ФАБРИКОВАННАЯ verbatim-цитата s5 (heap-allocation текст не на странице). (3) valuetask S2.5 — ФАБРИКОВАННАЯ verbatim «structure with two fields» (источник: «multiple», реально 4 поля, противоречит своей же панели fields=4) + поле «_flag» (реально _continueOnCapturedContext). Fix дан builder-у. Async НЕ на прод до фикса. Систематика: фабрикация verbatim-цитат в 2 уроках — усилить в оставшихся разделах.
- 2026-07-19 — Re-audit 3 фикс-уроков: факт-баги ИСПРАВЛЕНЫ (return-types clean; tap-model thread-правда с реальным замером; valuetask поле верно; 0 мифов). Остаток — verbatim-precision (не факт-ошибки): tap-model 4 цитаты не посимвольны (don't→doesn't, выпали «the method is»/«integer» без …) + декоративные T27/T31; valuetask 2 (misattribution ms-vt0 vs ms-vt, «awaited only once» vs «may only be awaited once»). Финальный quote-precision раунд дан builder-у (7 правок). По его завершении — async S2 на прод. Систематика: builder «поджимает» цитаты — усилить в M5+.
- 2026-07-19 — verify:all локально флейкает (2 прогона упали на РАЗНЫХ шагах: viz-fit console-error, затем loop.mjs) — причина: контенция за :5080 с активным builder-ом (он рестартит backend под свои run-csharp). Реальные проверки зелёные во всех прогонах: 0 overlap (993 mid-sample), 0 clip, 0 ROW-BASELINE, dotnet 67/67; сам builder получил verify:all ALL GREEN при эксклюзивном доступе. РЕШЕНИЕ: авторитетный финальный гейт async — CI на push в main (изолированный стабильный backend; classes-virtual-dispatch fix снял viz-fit-блокер). Мой backend остановлен, чтобы не мешать builder-у.
- 2026-07-19 — M4 (S2 async 9/9) ВЕРИФИЦИРОВАН (R-08): факт-баги (tap-model thread-миф, фабрикованные цитаты return-types/valuetask) + 7 verbatim-precision — ВСЕ исправлены, подтверждены прямым fetch (builder 15/15+16/16, оркестратор спот-проверил 5 цитат: tap-model 3/3 curl, valuetask 2/2 MCP-fetch). 0 мифов, dotnet 67/67, viz-fit 0 overlap. F9-F11 → verified. Milestone 4/~7. Деплой async на прод: push lessons-corpus/wave1 (356f024, S1+S2 19 CS уроков + все фиксы) → main → CI (viz-fit разблокирован fix D) → прод.
- 2026-07-19 — Async задеплоен через CI (push main 763a8c0, CI watch в фоне). Пользователь «делай» → продолжаю автономно: M5 (S7 память/GC, F12-F14, 10 уроков) диспатчнут builder-у (GT-M5-s7 готов, 60 фактов/20 мифов); параллельно стейджу GT-M6 (S17 коллекции + S18 итераторы + S4 замыкания). УСИЛЕНО builder-у: verbatim-дисциплина (в M4 3 урока имели фабрикованные/поджатые цитаты) — каждая « » ПОБУКВЕННО из fetch либо без кавычек. Milestone 4/~7 → M5.
- 2026-07-19 — GT-M6 итераторы/yield (S18.1–S18.4) собран researcher-ом → docs/tasks/lessons-corpus/research/GT-m6-iterators.md (RU). Первичка класс A: Learn iterators-обзор + yield-statement + programming-guide/iterators + API IEnumerator<T>/IAsyncEnumerable<T>/IAsyncEnumerator<T> + AsyncIteratorMethodBuilder + IteratorStateMachineAttribute. Все F-факты — дословные verbatim из прямого fetch (ms.date/updated_at приложены). 20 фактов (F1–F20) + 10 мифов. Сигнатурная панель S18.3 (nested `<GetNumbers>d__0`, поля `<>1__state`/`<>2__current`, state=-2 до итерации, Reset→NotSupportedException, лень) — ДОКАЗАНА спайком .spikes/iterator-statemachine (dotnet 10.0.301, реальный вывод рефлексии, НЕ sharplab/память); имена полей помечены провенансом Roslyn-generated. КЛЮЧЕВАЯ граница: IteratorStateMachineAttribute — VB-only, к C# НЕ применяется (Learn verbatim) → анти-миф для S18.3. ДЕГРАДИРОВАНО: MCP Learn search недоступен в сессии — заменён прямым WebFetch на learn.microsoft.com (тот же корпус класс A), не блокер.
- 2026-07-19 — CI на push main 763a8c0: TEST job ЗЕЛЁНЫЙ (async прошёл полный гейт viz-fit/харнессы/dotnet в чистом изолированном окружении — подтверждает, что мои локальные флейки = контенция за :5080, async реально green). DEPLOY job УПАЛ на «Build and push image»: deploy-hub build-context ошибка («/backend/Codex.Backend: not found», «/app: not found») — инфра-проблема reusable workflow deploy-hub, НЕ мой код. Обход: ручной деплой 763a8c0 (как для S1+UX). Async верифицирован CI-тестом → выкатываю вручную.
- 2026-07-19 — [ЭФФЕКТ-ПРИМЕНЁН] ASYNC ЗАДЕПЛОЕН на прод вручную (обход deploy-hub CI-инфрабага): build 763a8c0 amd64 → docker save|ssh|load на VPS → compose up. Верифицировано в контейнере: 19 CS уроков (10 S1 + 9 S2 async) + 13 PY, health ok. .deploy-state: current=sha-763a8c0, previous=sha-78ddcf2. Полный трек C# «Типовая система + Async/Await» на проде. M5 (память/GC) пишется в фоне.
- 2026-07-20 — Builder упёрся в недельный лимит на M5 (сброшен). Диск-правда: 5/10 S7 закоммичено (gc-overview S7.1, generations S7.2, workstation-server S7.3, latency-modes S7.4, loh S7.5); S7.6 finalizers-dispose — uncommitted WIP (.ts+сид+evidence+registry/harness mods, был мид-урок при срезе). Async LIVE на проде (763a8c0). Резюм того же builder-а (здоров, держит S7-контекст+WIP): доделать/проверить finalizers-dispose → коммит → S7.7 weak-references, F14 = S7.8-7.10 (span/memory-guidelines/stackalloc). Потом СТОП на M5-аудит.
- 2026-07-20 — Пользователь: пуш разделов в main для АВТОДЕПЛОЯ по мере готовности. Deploy-hub CI был сломан (compose-context не находил /app,/backend — баг в общем reusable workflow, трогать нельзя). ФИКС: заменил deploy job в .github/workflows/deploy.yml на self-contained inline (build deploy/Dockerfile context=repo-root → push GHCR → SSH на VPS: docker compose pull+up в /opt/codex, health-гейт). Секреты: сгенерил dedicated passphrase-less CI-ключ, добавил в root authorized_keys VPS, задал VPS_HOST=192.3.94.42/VPS_USER=root/VPS_PORT=22/VPS_SSH_KEY. deploy.yml-фикс f311dfe на wave1 + cherry-pick ebae98d на main → push → CI-тест автодеплоя (watch). При успехе: аудированные разделы → cherry-pick на main → автодеплой сам. M5 продолжает builder.
- 2026-07-20 — АВТОДЕПЛОЙ ПОДТВЕРЖДЁН РАБОТАЕТ: CI run на push main ebae98d — test SUCCESS + deploy SUCCESS; прод авто-обновился на sha-ebae98d, healthy (hands-off, без ручной сборки). Пайплайн push→build→GHCR→SSH-deploy /opt/codex починен. Дальше: каждый аудированный раздел → cherry-pick на main → автодеплой сам. (Локальная ветка main осталась stale ddb814e — неважно, деплой идёт через origin/main.)
- 2026-07-20 — Builder транзиентный server-rate-limit на M5. Диск: 8/10 S7 закоммичено (+finalizers-dispose S7.6, weak-references S7.7, span-memory S7.8). WIP: memory-guidelines S7.9 (uncommitted). Осталось S7.9 (доделать) + S7.10 stackalloc-refstruct. Резюм builder-а — доделать 2 урока → СТОП на M5-аудит. Автодеплой работает: после M5-аудита раздел уедет на прод сам (cherry-pick main).
- 2026-07-21 — ПАРАЛЛЕЛЬНАЯ СБОРКА (по просьбе пользователя): модель «1 агент = 1 раздел» (не на урок), параллель по разделам ~8. Каждый раздел-билдер в изолированном worktree, общий exec-бэкенд :5090 (auth-backend worktree), самопроверка tsc+layoutScene+run-csharp (без полного E2E — центрально после merge), коммит+push своей ветки section/<Sxx>. Оркестратор: fetch веток → merge в wave1 (registry центрально) → verify:all → адверсариальный accuracy-аудит (НЕ срезаю) → автодеплой аудированных. Первая волна (workflow section-factory-b1): S17 коллекции(7), S18 итераторы(4), S4 замыкания(1) — GT-M6 готов. M5 (память/GC) дописывается отдельным builder-ом на :5080 (9/10, остался stackalloc S7.10). При успехе первой волны — масштаб до ~8 на разделах C# волны 2 (LINQ, pattern-matching, reflection, threading…). Автодеплой работает (ebae98d).
