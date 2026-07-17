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
