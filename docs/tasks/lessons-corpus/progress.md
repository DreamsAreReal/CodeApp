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
