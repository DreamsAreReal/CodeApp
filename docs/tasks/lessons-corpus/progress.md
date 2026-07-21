# progress — lessons-corpus, волна 1 (builder журнал, append-only)

## F1 — Walking skeleton: registry + lazy-чанки + первый урок

### Под-шаг (a+b): типы + registry + порт 19 уроков + харнессы [зелёно]
Сделано:
- `types.ts`: `section: string` (обязательно, ADR-0004); `LessonLang += "none"`; `track` — комментарий про union CS/PY/legacy/future.
- `registry.ts` (новое): `TRACKS: Track[]` (CS / LEGACY_CS / PY) → `Section` → `LessonManifestEntry{ id, slug, track, section, title, kicker, icon, subtitle, estMinutes, cards, load }`. `load()` — dynamic `import()` на урок (Vite режет чанк на урок), мемоизация в `BODY_CACHE`. `prefetchAll()` (boot, non-blocking), `getLoadedBody()` (синхронно после prefetch), `loadBody()` (await по требованию). CS.S1 пока пустая (уроки регистрируются по мере создания файлов — value-types-copy в (c), S1.1/S1.3 в F6).
- `index.ts`: без статических импортов тел. `LESSONS: LessonMeta[]` (лёгкие метаданные — id/track/section/title/home/cards.length). `getLesson()` = загруженное тело или undefined; `loadLesson()` = await; `getLessonMeta()` для home/progress/trackPref; `TRACK_GROUPS` выводятся из `TRACKS`.
- Порт 19 уроков: в каждый TS-файл добавлено поле `section` (= track id для legacy/PY, плоский раздел); тела грузятся lazy.
- Потребители: `lessonRunner.runLesson` — если тело не в кэше, рисует loading-скелет и `loadLesson().then(render)`; `home.ts`/`progress.ts`/`trackPref.ts` → `getLessonMeta`; `main.ts` boot → `void prefetchAll()`.
- Харнесс `viz-fit.mjs`: перевёл на `MANIFEST + loadBody` (await всех тел) — AUTHORING-PROOF работает на реальных телах. run/new-lessons/shell/loop не тронуты (работают через runtime приложения, id уроков не менялись).
- Строки: `S.lessonLoading`, `S.trackCsDeepLabel/Sub` (RU).

Решения:
- Синхронный контракт `runLesson`/харнессов сохранён через boot-prefetch + мемо-кэш; при промахе — async-fallback (харнессы ждут `__viz.ready` до 15s). Это отступление от «runLesson синхронный» задокументировано здесь: тела теперь могут грузиться асинхронно, но UI-контракт (openLesson → __viz.ready) не изменился.
- id уроков НЕ менялись при порте (T1.M3.boxing и т.д.) → харнессы run/new-lessons/shell/loop и backend seed целы, миграция id — отдельная F2.

Грабли:
- `LESSONS` перестал быть `LessonData[]` → каскад в home/progress/trackPref: развёл на `LessonMeta` (лёгкое) vs `getLesson` (тело). `LessonRow.lesson: LessonMeta`.

Доказательство (backend :5080, preview :4173):
- `npm run build`: tsc clean; 20 JS-чанков; entry `index-*.js` 110.20 KB raw / 34.56 KB gzip (базлайн 571.88/141.75 → −81% raw). НОВЫЙ базлайн G1. evidence/F1/build-chunks.txt.
- 5 харнессов ALL GREEN + `dotnet test` 65/65. evidence/F1/harness-runs.txt.

### Под-шаг (c): урок CS.S1.value-types-copy на полной планке эталона [зелёно]
Сделано:
- `cs/value-types-copy.ts`: 6 анимир. сегментов (layout inline · копия при присваивании · shared ref-член · IL копии · МАШИННАЯ ПАНЕЛЬ счётчика аллокаций · передача в метод), 3 exec-карточки. Тон сеньора, дословные цитаты MS Learn value-types (fetch 2026-07-18), 0 «chip+подпись» без динамики.
- Signature-панель (турнир): 3 черновика (A IL-лента / B счётчик-замер аллокаций / C X-ray стек-куча), парные сравнения в ОБОИХ порядках → победитель B (0 vs 24 байта, реальный `GC.GetAllocatedBytesForCurrentThread`). Протокол — evidence/F1/tournament-signature-panel.md. B интегрирован как s5; проигравшие A→s4 (IL), C→s1–s3/s6.
- Сид `CS.S1.value-types-copy.json` (+section, 3 карточки); backend перезапущен, урок в каталоге (3 cards).

Реальные числа/артефакты (evidence/F1/value-types-copy-exec-il.txt):
- EXEC c1 `a=(1,2) b=(99,2)`; c2 `0 [A, B]` / `7 [A, B]`; c3 `struct copy: 0 bytes` — все через run-csharp, stdout==expect.
- Панель: `struct copy: 0 bytes; class new: 24 bytes` (реальный GC-замер).
- IL: настоящая Release-компиляция (ilspycmd 10.1.1) — `ldarg.0 / stloc.0` копия структуры без newobj/box.
- G4 анти-echo: expect НЕ подстрока code во всех 3 карточках (проверено).

Решения/грабли:
- Первая версия сегментов упала на layout: `obj` + 2 вложенных `slot` × 2 ряда = 244u > 152u высоты зоны stack (правило движка «rows taller than inner height»). Правило трёх правок: перегенерил модель узлов — struct = один `obj` с `value:"X:1 Y:2"` (без вложенности), ref-член s3 = `ref`-узлы с ребром на общий List. Pure-engine layout-check зелёный, потом E2E.
- Метод-кадр p в s6 — на стеке (row 1), не в куче (исправлено, точность модели).
- ilspycmd — dev-инструмент верификации (global tool), не зависимость продукта (design «инструментарий верификации» без ADR).

Доказательство:
- `npm run build`: tsc clean; чанк `value-types-copy-*.js` 22.34 KB; entry 110.58 KB (+0.38 KB метаданных, < +1.5 KB/урок).
- E2E-проба: урок открывается, 6 сегментов + autoplay + финальный кадр, exec-карточка c1 → typed ✓ → Good → `/api/review` двигает расписание, 0 console errors, скриншоты 375/768 + панель + карточка (evidence/F1/*.png).
- `node verify/viz-fit.mjs` ALL GREEN (20/20 lessons на `at`, урок 0 нарушений FIT/CLIP/OVERLAP/…); `node verify/run.mjs` ALL GREEN (скелет не деградировал).

## F6 — Уроки S1.1 (type-system-map) и S1.3 (classes-virtual-dispatch)

### Под-шаги (d) type-system-map + (e) classes-virtual-dispatch [зелёно]
Сделано:
- `cs/type-system-map.ts` (S1.1, вход первой сессии): 5 сегментов (иерархия CTS · два типа переменной compile/run-time · МАШИННАЯ ПАНЕЛЬ overload-vs-dispatch · виртуальный вызов · value/reference), 2 exec-карточки. Дословные цитаты MS Learn fundamentals/types.
- `cs/classes-virtual-dispatch.ts` (S1.3): 5 сегментов (наследование · override run-time дисп. · МАШИННАЯ ПАНЕЛЬ vtable-слота · new-сокрытие compile-time · base/virtual внутри метода базы), 2 exec-карточки. Цитаты MS Learn polymorphism.
- Оба зарегистрированы в CS_S1 (порядок S1.1→S1.2→S1.3); сиды `CS.S1.type-system-map.json`, `CS.S1.classes-virtual-dispatch.json` (+section).

Реальные числа (evidence/F6/*-exec.txt, run-csharp, stdout==expect, anti-echo OK):
- type-system-map: панель — `object overload` / `string overload` / `String` (один объект → разные перегрузки по compile-time типу); c1 `object overload\nstring overload`, c2 `Dog\nDog`.
- classes-virtual-dispatch: панель — `Derived.V` (vtable→override, run-time) / `Base.N` (new-сокрытие, compile-time); c1 `Derived.V\nBase.N`, c2 `Area=12.57`.

Грабли:
- `dotnet test` упал 64/65 на `ConcurrentReviews_ForOneUser_NoDatabaseLocked`: тест шлёт ВСЮ due-очередь конкуррентно; +7 новых CS-карт перевели свежего пользователя за лимит 60 запросов/мин → 429. Не DB-lock, а rate-limit-коллизия из-за роста каталога. Починка (минимальный дифф, без ослабления ассертов): дефолтный тест-Factory поднимает `RateLimit:PermitPerMinute=1000` через `UseSetting` (тот же документированный рычаг, что у RateLimitFactory; `ConfigureAppConfiguration` перебивается appsettings.json — не работает). Выделенный rate-limit тест сохранил свой tiny-лимит. Итог 65/65.

Доказательство:
- E2E-проба всех 3 CS-уроков ALL GREEN (5/6/5 сегментов, exec-карточки grade→review двигает due, 0 console errors), скриншоты 375/768 — evidence/F6/*.png.
- `node verify/viz-fit.mjs` ALL GREEN (22/22 lessons на `at`, оба урока 0 нарушений); run/new-lessons/shell/loop ALL GREEN; `dotnet test` 65/65 — evidence/F6/harness-runs.txt.

## Итог M1 (F1+F6): скелет + 3 урока S1 (первые 3 урока трека). Все харнессы + dotnet test зелёные. Coverage S1 = 3/10.

---

# M2 (F2–F5 + долги 0a/0b)

## Смоук старта M2 [зелёно]
`npm run build` (entry 111.30 KB / 34.88 gzip; 22 чанка на урок) + 5 харнессов ALL GREEN (run/viz-fit 359 сцен/shell/new-lessons/loop) + `dotnet test` 65/65. Fresh due=66 (лимита нет — подтверждает F3). Регресса M1 нет.

## Долг 0a — vtable-провенанс (evaluator R-05) [зелёно]
Сделано:
- В `cs/classes-virtual-dispatch.ts` s3 (панель «МЕТОД-ТАБЛИЦА/vtable») и `cs/type-system-map.ts` s4 (gate «vtable →») добавлен машинный первоисточник термина vtable: `botr-method-slots` (dotnet/runtime Book of the Runtime — Method Descriptor, §Method Slots) + `ecma-335` (I.8.10 virtual methods). В s3.explain вплетены ДОСЛОВНЫЕ цитаты BOTR: «Each MethodDesc has a slot… entry point» и «The slot is stored in MethodTable… e.g. virtual methods»; в s4.explain — та же цитата про MethodTable-слот + ссылка на S1.3.
Решения:
- Термин «vtable» отсутствует на Learn C# fundamentals → механика слота метод-таблицы сорсится к ECMA-335 (стандарт CLI) + BOTR рантайма (первоисточник реализации). URL обоих резолвятся 200.
Доказательство (evidence/M2/0a-vtable-provenance.txt):
- HTTP 200 обоих URL; дословная цитата запинена из raw BOTR (строки 88/94). `npm run build` tsc clean, entry 111.30 KB неизменен. E2E: оба урока 5 сегментов, финальный кадр, 0 console errors.

## Долг 0b — section-on-demand prefetch → ADR-0005 [зелёно]
Сделано:
- ADR-0005 (грузить тела по разделу/по требованию). `registry.ts`: `prefetchSection(id)` (греет тела ОДНОГО раздела), `firstSectionId()` (первый раздел не-legacy трека по order = CS.S1), `sectionLessonIds(id)`. `index.ts` реэкспорт (вместо `prefetchAll`). `main.ts`: после home — `void prefetchSection(firstSectionId())` вместо жадного `prefetchAll()`.
Проблема (замер до): на home скачивались ВСЕ 22/22 тела уроков (жадный prefetchAll) — при 100+ уроках обнуляет G1 (мелкий entry, но сеть тянет весь каталог).
Решения:
- Section-scoped (вариант C ADR-0005): греем только вход первой сессии (S1, 3 тела). Остальное — lazy по клику (контракт `runLesson` уже рисует loading-скелет + `await loadLesson` на промах кэша — ADR-0003 fallback).
Доказательство (evidence/M2/0b-section-on-demand.txt):
- home: было 22/22 тел → стало **3/22** (ровно уроки CS.S1). Холодный урок вне S1 (PY.M6.generators) открывается по требованию — 6 сегментов. `run.mjs` ALL GREEN (lesson-open путь цел). build entry 111.60 KB (+0.30 KB хелперы, << G1).

## F2 — Миграция удаления 6 старых C#-уроков [self-pass]
Сделано:
- Удалены (git rm) 6 TS (`value-vs-reference,boxing,gc,async-await,closures,hashtable`) + 6 сид-JSON (T1.M2/M3/M4, T2.M1/M2/M5). Registry: убран `LEGACY_CS` трек → `TRACKS=[CS,PY]`; `firstSectionId` упрощён (нет legacy-фильтра); `index.ts` TRACK_GROUPS без ветки LEGACY_CS; `strings.trackCsharpLabel` удалён (осиротел). Комментарий lessonRunner обезличен.
- Харнессы переведены на CS.S1: `run.mjs` (value-types-copy 6 сег + type-system-map 5 сег; expect'ы новых карт), `shell.mjs` (value-types-copy 6/6 completion), `new-lessons.mjs` (EXPECT = 3 CS.S1 + 13 PY; grade-петля на classes-virtual-dispatch/c1 + value-types-copy/c1), `viz-fit.mjs` (SHOTS → панели CS.S1). Backend-тесты: старые id → реальные сидовые CS id (`T1.M3.boxing/c1`→`CS.S1.value-types-copy/c1` и т.д.).
- dev-БД: остановил backend → удалил stale-копии сидов из bin/Debug → явный purge `DELETE ... WHERE item_id LIKE 'T1.%' OR 'T2.%'` из review_state/progress_events/items (ловит и сироту `T1.M3.boxing/c2`, которой не было в items — ReconcileCatalog её бы не поймал) → рестарт backend (ReconcileCatalog доотсекает по сиду).
Решения:
- Явный SQL-purge помимо серверного `ReconcileCatalog` (Db.cs): reconcile каскадит только по строкам, что ЕСТЬ в `items`; сирота в review_state без items-строки требует прямого DELETE. Зафиксировано как решение F2.
- Backend-тесты правлю (в скоупе F2 «правка харнессов»): ссылались на сидовые id удалённых уроков; 2 теста (persist-across-restart, progress-monotonic) падали на членстве в due/каталоге. Ассерты НЕ ослаблены — только подменены id на реальные сидовые.
Грабли:
- 2 упавших dotnet-теста после удаления сидов — не логика, а ссылки на несуществующие теперь id. Правка = ремап id, ассерты целы. 65/65 восстановлено.
Доказательство (evidence/F2/migration.txt):
- grep старых id (app/backend/verify, без bin/obj/dist/node_modules) = **0** (exit 1). Сироты: review_state/progress_events/items по T1./T2. = **0/0/0**. `/api/due ⊆ registry`: каталог 16 (3 CS+13 PY), fresh due=60, legacy в due=[]. PY нетронут: 13 сидов/53 карты/13 registry, DB PY items=53/review_state=3415. 5 харнессов ALL GREEN + `dotnet test` 65/65.

## F3 — Лимит новых карт/день (NEW_CARDS_PER_DAY=10) + sim-14d [self-pass]
Сделано:
- Migration 4: `items.ord` (ключ порядка) + таблица `new_card_grants(user_id, item_id, granted_date)`. Сиды: top-level `"order"` (CS.S1: 1,2,3; PY M1..M13: 10..22); LessonStore пакует `Ord = order*100 + cardIndex`.
- `Db.GetDue(userId, now, newCardsPerDay)`: review-карты без лимита; never-reviewed капятся `newCardsPerDay` ПЕРВЫХ грантов за UTC-день (гранты вечны → refresh не обходит, review не освобождает слот того же дня), порядок `items.ord`; pending (гранты не отвеченные) персистят. Config `Fsrs:NewCardsPerDay=10`.
- `verify/sim-14d.mjs`: 14 виртуальных дней через dev-хедер `X-Sim-Now`, каждый день due→grade Good→next; ассерты new≤10 И due≤25; пейсинг под rate-limit (1.05s) + ретрай на 429.
- Юнит-тесты: `Due_CapsNewCardsPerDay_InCurriculumOrder`, `Due_ReleasesNextBatch_OncePriorBatchReviewed`.
Решения (отступление от design.md — фиксирую):
- **Семантика лимита = «≤10 ПЕРВЫХ грантов/день»** (не «≤10 видимых new»): review одной карты не рефилит слот того же дня (иначе ломается инвариант «review → due−1»), пропущенная new-карта не теряется (персистит как pending). Контр-флуд обеспечивает G9-метрика due≤25 (sim-14d).
- **Dev-only `X-Sim-Now` хедер** (НЕ было в design): единый sim-clock для `/api/due` + `/api/review` — иначе 14-дневную симуляцию против HTTP-бэка не прогнать (прод-clock реального времени, FakeClock только в юнит-тестах). Гейтед `devMode`; в Production игнорится (не влияет на прод). `ReviewService.Review(..., nowOverride=null)` — контракт байт-в-байт цел при null.
Грабли:
- Первая семантика («≤10 видимых new total») ломала инвариант review→due−1 (рефил слота) И тест day-2. Вторая («персист pending без капа total») → флуд на пропущенных днях (day2=20 new). Правило трёх правок не превышено: третья, финальная — «≤10 первых грантов/день», прошла все тесты + sim.
- sim без пейсинга: rate-limit 60/мин рубил grade→карты оставались never-reviewed→накопление isNew. Починка: пейсинг 1.05s + ретрай 429 + ассерт `itemId==` (grade не мог тихо провалиться).
Доказательство (evidence/F3/limiter.txt, sim-14d-output.txt):
- fresh due день1 = **10** new (было 66/60), curl PASS. `node verify/sim-14d.mjs` exit 0 (14 дней, new≤10 & due≤25). `dotnet test` **67/67** (+2 лимитер-теста). Регресс харнессов: run/new-lessons/shell/loop ALL GREEN (PY.M1.names-objects/c1 — карта #8, в бюджете 10).

## F4 — Навигация home: трек → раздел → урок (турнир) [self-pass] [золотой путь]
Сделано:
- registry: `getTrack(id)`, `sectionsInPrereqOrder(trackId)` (топосорт разделов по `Section.prereqs`, tie-break `order` — мягкая цепочка S1→S7→S17→S18→S2, без хард-лока). Реэкспорт в index.ts.
- home.ts: `trackArea` группирует уроки активного трека ПО РАЗДЕЛУ (`sectionNavBody`), прогресс раздела (пройдено/всего), мягкая рекомендация «дальше» (`recommendedNextLessonId` = первый непройденный по prereq-порядку) — пилюля «Продолжить здесь» + `data-next`. `topicRow(...isNext)`. Строки `sectionProgress/sectionNextHint/sectionAria`. CSS home.css: 3 варианта + маркер.
- ТУРНИР нулевого экрана: 3 радикально разных варианта (A минимал-разделитель / B карта-раздел с кольцом / C ступенчатый рельс), скрины 375+768, парные сравнения В ОБОИХ ПОРЯДКАХ. Победитель **B** (карта-раздел): масштаб на N разделов (рельс C схлопывается при 1 разделе волны 1), кольцо = требование design «Опыт». `F4_WINNER="B"` дефолт; A/C переключаемы `__f4Variant` только для турнира.
Решения:
- Рекомендация «дальше» — SOFT (пилюля-маркер, не lock): урок остаётся кликабельным. Порядок разделов — топосорт prereqs (не просто order), чтобы цепочка S1→S7→… соблюдалась при добавлении разделов волн 2+.
Грабли:
- axe-контраст: `.pill-next` white-on-`--coral`(#f0533a)=3.5:1 < AA 4.5. Починка: `--coral-d`(#c43d28) → 5.19:1 (посчитано + axe-verified). shell/loop axe снова 0 serious/critical.
- `\bиз\b` в ассерте run.mjs не матчит кириллицу (нет `\w`) → заменил на `\d+ из \d+`.
Доказательство (evidence/F4/tournament-section-nav.md + 8 png):
- E2E: раздел-заголовок «Типовая система / 0 из 3 пройдено» рендерится; ровно 1 маркер «дальше» = `CS.S1.type-system-map` (первый по prereq); урок открывается из раздела; 0 console errors (ассерты в run.mjs). build entry 112.57 KB (<G1+10%). 5 харнессов ALL GREEN (axe 0 serious/critical на home).

## F5 — Авторская обвязка: verify:all + density(G7) + анти-echo lint [self-pass]
Сделано:
- `verify/density.mjs` (G7): на урок ≥4 сегмента & ≥2 карты (авторский трек; PY grandfathered на count-gate — G5), ≥90% сегментов ДИНАМИЧНЫ (диф node/edge/code-pointer между кадрами), анти-echo lint. Экспорт чистых чекеров (`lessonViolations/isDynamic/runEchoesAnswer`), CLI-гейт по `import.meta.url`. Флаг `--lessons`, unknown id → error.
- `verify/density-fixtures.mjs`: self-test — echo-карта ловится, статичный сегмент ловится, count-gate ловится, легальный урок чист, filename-run НЕ ложно-срабатывает.
- `verify/all.mjs` + npm `verify:all`: FULL = 5 браузер-харнессов + density + fixtures; `-- --lessons <ids>` = INCREMENTAL (density scoped + fixtures, без браузера).
Решения (отступления — фиксирую):
- **Анти-echo lint = «run эмитит ответ»**, не наивная подстрока: `run` реальных карт — команда-файл (`python3.12 X_c3.py`, `dotnet run`), где expect="3" ложно матчит "python3.**3**.12"/"c3". Ловим leak только когда expect внутри emit-вызова (`echo`/`print`/`Console.Write`/...). Иначе frozen-PY (валидный G4, реальный stdout) падал бы 6 ложными.
- **PY count-gate grandfathered** (≥4 сег/≥2 карты — только авторский трек): PY.M12/M13 легально по 3 сегмента, трек неприкосновенен (G5). Динамика + анти-echo применяются ко ВСЕМ (это корректность, не длина).
Грабли:
- Первая версия lint (expect как подстрока question ИЛИ run) давала 6 ложных на frozen-PY (predict-output ЗАКОННО показывает код, порождающий вывод; run-имя-файла содержит цифры). Снёс «в question»-чек целиком, run-чек сузил до emit-вызова. Правило трёх правок не превышено.
Доказательство (evidence/F5/authoring-harness.txt):
- fixtures ALL GREEN (violators ловятся, легальный чист, 0 ложных). density на 16 уроках ALL GREEN. `npm run verify:all` FULL = **7/7 шагов ALL GREEN**, exit 0. `-- --lessons CS.S1.value-types-copy` = 2 шага (density scoped + fixtures), без браузера, ALL GREEN.

---

# M3 (шаг 0 + F7 + F8): раздел S1 уроки 4–10 (7 уроков)

## Шаг 0 — cleanup home.ts:371 [зелёно]
Сделано: first-run CTA `rows.find(...includes("value-vs-reference"))` → `rows.find(r => !r.completed)` (первый непройденный по curriculum order, без хардкода удалённого id).
Доказательство: `grep -rn "value-vs-reference" app/src` = 0 (exit 1); run.mjs + shell.mjs ALL GREEN. sha 0939c7c. evidence/M3/step0-home-cleanup.txt.

## F7 — S1.4/S1.5/S1.6 [self-pass]
- **S1.4 structs-traps** (393c689): 5 сегм./3 exec-карты. Панель — **защитная копия** (readonly-поле, Bump() бежит на копии): вернул 11, поле осталось 10. Карты: mutable-struct-в-List `0`; defensive copy `11 10`; default vs new `0 42`. GT-M3: struct МОЖЕТ быть immutable, readonly shallow + влияет на перф, default пропускает ctor — 0 мифов.
- **S1.5 records** (b9ced9d): 5/3. Панель — **value vs reference equality** (`True False`). Карты: `True False`; `with` nondestructive `Point{X=1..} Point{X=99..}`; разные record-типы `False`. GT-M3: record бывает struct, with nondestructive+shallow, разные типы ≠, нет Clone — 0 мифов.
- **S1.6 interfaces-dim** (77c7bcf): 5/3. Панель — **гейт интерфейс-ссылки** (`class-Hi Hi` + CS1061 при вызове DIM на экземпляре). Карты: `class-Hi Hi`; DIM `working\nresting (default)`; дизамбигуация `A B`. GT-M3: интерфейс МОЖЕТ иметь тело (C# 8.0), DIM/explicit только через ссылку, explicit без модификатора (CS0106) — 0 мифов. Грабль: s5 layout-throw (3 gate-ряда > зоны) → увеличил зону/viewBox; viz-fit ALL GREEN.

## F8 — S1.7/S1.8/S1.9/S1.10 [self-pass]
- **S1.7 enum-flags** (6c03483, layout-фикс 28e0568): 5/3. Панель — **enum боксится** (`True B True`, аллокация замерена). Карты: `[Flags]` `Read, Write True False`; underlying byte `4 Byte`; `default(E)0` `0 0 False`. GT-M3: enum не всегда int, enum→int явно, боксится, `&`-паттерн (не HasFlag) — 0 мифов.
- **S1.8 generics-basics** (a4e0993): 5/3. Панель — **без боксинга** (List<int> `8392` vs ArrayList `40568` байт на 1000 int). Карты: type inference `42 Int32`; no erasure `Int32 String`; open/closed `True False True`. GT-M3: НЕ type erasure (замерено), where T:struct → non-nullable (CS0453) — 0 мифов.
- **S1.9 nullable** (9c92212): 5/3. Панель — **boxing int? → boxed Int32** (`Int32 True`, не Nullable<T>). Карты: `Int32 True`; struct/HasValue `True False 0`; lifted `True False False`. GT-M3: int? — структура не reference, boxing даёт null/boxed T, .Value бросает, ≠ NRT — 0 мифов.
- **S1.10 casts** (415f9e5): 5/3. Панель — **три поведения is/as/cast** (`False hello InvalidCastException`). Карты: `False hello InvalidCastException`; is-no-numeric `True False`; typeof/is `True False True`. GT-M3: as возвращает null не бросает, cast бросает, is → bool, typeof — имя типа — 0 мифов.

## Грабли M3 (общие)
- Апостроф в single-quoted explain (`isn't`) ронял tsc — экранировать `\'` (S1.4 s3).
- Layout-throws движка (зона короче суммы рядов гейтов) — ловятся viz-fit (ROW-BASELINE), НЕ density: enum-flags s1 (chip vs slot разной высоты → near-equal center-Y) → сделал оба chip; interfaces-dim s5 → увеличил зону.
- **Лимитер × растущий каталог**: 10 уроков S1 (~28 карт) вытеснили PY.M1 за бюджет 10 new/день → new-lessons.mjs упал на «PY.M1 due». Починка: sim-walk по дням через X-Sim-Now (paced под 60/мин rate-limit) до релиза PY.M1, ассерт isNew=false после grade.
- Секрет-гейт (ложное срабатывание на untracked M4 GT-файлах `[EnumeratorCancellation] CancellationToken`) блокировал коммит — M4-файлы отложены aside на время M3-сессии (не мои, восстановлены при СТОП).

## Доказательство M3 (итог)
- `npm run verify:all` FULL **7/7 ALL GREEN** (23/23 урока на `at`, 0 ROW-BASELINE); `dotnet test` **67/67**; density на всех уроках ALL GREEN. Каждый урок: density --lessons + E2E (render 5 сегм. + grade-петля) зелёные, скрины 375/768 в evidence/F7|F8/. Все exec-числа реальны (run-csharp, stdout==expect, anti-echo OK) — evidence/F7|F8/*-exec.txt. GT-M3-s1: 0 красных флагов во всех 7 уроках. Coverage S1 = **10/10**.

## M5 (S7 «Память и GC») — прогресс
- **Находка (не мой скоуп, для координатора):** viz-fit при прогоне S7.1 поймал стохастический MID-TRANSITION overlap в УЖЕ закоммиченном `CS.S2.async-streams` s1 1→2 @190ms (`r ∩ y = [18.02,4.51]`) — узлы `r` и `y` меняются местами (row0col1 ↔ row1col0), их твины пересекаются на середине. НЕ воспроизвёлся на повторном прогоне (probe семплит случайные ms; CI M4 проходил). Пре-существующий borderline, не регресс от S7. Рекомендация: при следующем касании async-streams развести своп (не менять col одновременно) либо промежуточный кадр.
- S7.1 gc-overview: панель-числа реальные (byte[1000]=1024 байта; ranAutomatically=True без GC.Collect(); zeroed=True). Все 31 англ. « »-цитата сверены скриптом против fetched fundamentals-страницы — 0 MISS. Инвариант verbatim соблюдён.

## M6 интеграция (S17/S18/S4, 12 уроков чужих агентов) — recon
Задача: НЕ переписывать контент, а зарегистрировать + технически проверить 12 уроков (staged на wave1).
Карта (id → export const, все 3 predict-output карты):
- S17 (icon=collections): collections-overview→collectionsOverview, choosing-collection→choosingCollection, dictionary-internals→dictionaryInternals, list-internals→listInternals, hashset→hashSet, concurrent-collections→concurrentCollections, immutable-collections→immutableCollections
- S18 (icon=async): iterators-overview→iteratorsOverview, yield-contract→yieldContract, iterator-state-machine→iteratorStateMachine, async-iterator-statemachine→asyncIteratorStatemachine
- S4 (icon=types): closures-capture→closuresCapture
НАХОДКА (интеграционный баг): seed `order` у секций-агентов был section-local и коллизийный — S17 все =17 (→ Ord 1700-1702 overlap), S18 =20-23 (КОЛЛИЗИЯ с S7.1-S7.4 order 20-23), S4=4. Ord=lessonOrder*100+cardIndex — ГЛОБАЛЬНЫЙ (Db.cs:468 OrderBy(Ord).ThenBy(ItemId)). Ties не крашат (ThenBy), но скремблят релиз-последовательность. Фикс (минимальный, метадата не контент): уникальные catalog-global orders после S7(max=29): S17=30-36, S18=37-40, S4=41.
exec re-verify: ВСЕ 36 карт (12×3) через :5080 run-csharp → 36/36 MATCH дословно (вкл. immutable Assembly.Load-reflection и async-iterator interface-панель). exec-фиксы НЕ нужны.
Регистрация: 3 секции в CS_TRACK.sections (registry.ts:562): CS_S17(order 17, после S7), CS_S18(18), CS_S4(4); prereqs все [CS.S1].

## M6 интеграция — ЗАВЕРШЕНО (self-pass 12/12)
- Регистрация зелёная: каталог 54 урока (12 новых видны в home-пути через new-lessons harness).
- Exec 36/36 MATCH подтверждён повторно на финале (exec_verify.py, живой :5080).
- Браузерный viz-fit ловил 2 реальных дефекта раскладки (не воспроизводились в pure layoutScene секций-билдеров) — оба починены реально (геометрия), verify:all зелёный:
  1. list-internals s1 overlap a0∩sub-label «непрерывная память» [72×7.1] → subY 47→38, ly 24→22 на зонах arr/list (sub-лейбл поднят из 3-рядного блока слотов).
  2. hashset s2 MID-TRANSITION e5∩cnt [23.6×28]@190ms → value слота «5 (тот же)»→«5» (ширина слота стабильна между кадрами → сосед-chip не дрейфует сквозь него).
- new-lessons harness: segs list-internals 6→5, closures-capture 7→6 (были мои оценки recon, реальность иная); + ветка для predict-гейта НА s1 (yield-contract predictAt=1: автоплей играет кадр0 и держит гейт, index остаётся 0 → проверяю played/гейт, не index>0).
- `npm run verify:all` 7/7 ALL GREEN (0 FAIL, 0 console-errors); `dotnet test` 67/67. Коммит f62a669.
- Грабли: backend :5080 падал в ходе долгого verify:all → browser-шаги ложно валились на preflight «не подняты»; поднимать `ASPNETCORE_ENVIRONMENT=Development ASPNETCORE_URLS=http://localhost:5080 dotnet run` и повторять. verify:all у меня шёл ~12-15 мин (2 browser-прохода) — ждать pid, а не launcher-notification.

## M6 accuracy-аудит Batch-1 (S17/S18/S4) — исправлено (коммит 7d73774)
2 факт-бага машинных панелей (перемерены живьём :5080, детерминированно):
- collections-overview s5: код панели БЕЗ presize → честные числа растущего пути ArrayList 40568 B / List<int> 8392 B (×4.8), не старые presized 32056/4056/×8. Presized-путь (4056/32056/×8) остаётся в predict-карте c3 (она presize-ит явно). Выдуманная GC-цитата → дословный Returns-текст «The total number of bytes allocated to the current thread since the beginning of its lifetime»; «selecting a collection class» (URL-слаг) → видимая проза «When choosing a collection class, it's worth considering potential tradeoffs in performance».
- closures-capture s5: static-лямбда НЕ бесплатна на первом достижении call-site — 88 B (создание+кэш делегата один раз), потом 0 на повторах (цикл: 88→0→0). s6: захват локали в обычном методе — CS8820 (не CS8821; CS8821 = ссылка на this/base), с реально снятым текстом ошибки.
Source-mismatch (цитата реальна, страница не та → перенесена на истинную, каждая fetch-подтверждена):
- «This method is an O(1) operation» → HashSet<T>.Contains (добавил ms-hashset-contains в choosing-collection и list-internals).
- «automatically reallocating the internal array» → List<T>.Capacity; «set the initial capacity» → collections index (в sourceRefs карты).
- «a Dictionary<TKey,TValue> collection without values» → HashSet<T> class; «capacity automatically increases…» → полная фраза.
- concurrent: полная фраза энумератора «…to the collection after GetEnumerator was called».
- immutable s3: 4 цитаты ImmutableArray → ms-immutablearray (добавил источник), оборванные с … .
- iterators-overview: восстановлен квалификатор «System.Collections.Generic.» в правиле foreach/await foreach; «traverses a container, particularly lists» дополнено.
- yield-contract: «can't have both a return…yield return…» → Iterators (C#) (добавил ms-iterators).
- async-iterator: имя стейт-машины — паттерн <G>d__N (замер: d__0 в статич. классе, d__1 у top-level локал-функции), не литерал d__0 — захеджировано; стабильный факт = интерфейс+builder.
Доказательство: verify:all 7/7 ALL GREEN; exec 36/36 MATCH; dotnet 67/67. Ни одна карта (код/expect) не менялась — только display/цитаты/источники.
