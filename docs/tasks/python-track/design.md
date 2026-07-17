# Design — Python-трек, волна 1 (11 уроков + P2-шпаргалки)

North Star: сеньор каждый день заходит в Mini App и глубоко, с анимациями, рефрешит
Python-фундамент своей AQA-подготовки; собес-вопрос → ответ, обоснованный механизмом.

## Архитектура (движок/дизайн LOCKED — только generic-доработки)

**Контент = данные.** Урок = `app/src/lessons/py-<slug>.ts` (LessonData) + seed
`backend/Codex.Backend/seed/lessons/PY.M<n>.<slug>.json` + строка в реестре. Никакой
вёрстки уроков; размещение виз-узлов ТОЛЬКО `at:{zone,row,col}|{in}`.

**Track id: `PY`** (ADR-0003), id урока `PY.M<n>.<slug>`, карточки `c1..cN`
(контракт петли `${lesson.id}/${card.id}` не меняется; бэк парсит track из seed как есть).

**Generic-доработки фронта (общие, не per-lesson):**
1. `lessons/types.ts`: `LessonData.lang?: "csharp" | "python"` (default `"csharp"`).
2. `lessons/index.ts`: реестр `TRACK_GROUPS: {id, label, tracks[]}[]` —
   `[{csharp, S.trackCsharp, ["T1","T2"]}, {python, S.trackPython, ["PY"]}]`.
3. `app/home.ts`: ПЕРЕКЛЮЧАТЕЛЬ ТРЕКОВ (решение пользователя на чекпойнте M1, заменяет
   секции-стопкой A1): ряд чипов/пилюль по TRACK_GROUPS над лентой уроков (активный —
   коралл; масштабируется горизонтальным скроллом чипов при N треков), видна лента ОДНОГО
   трека; выбор персистится (localStorage, ключ в settings-паттерне); дефолт при входе =
   трек последнего открытого урока, иначе первый. Hero «продолжить»/сегодняшняя очередь —
   ГЛОБАЛЬНЫЕ (due охватывает все треки), переключатель управляет только лентой уроков.
   Лейблы: csharp «Фундамент C#», python «Python для AQA» (решение пользователя).
4. `engine/hlcode.ts`: `hlCode(line, lang)` — для python: keywords (def/class/return/
   yield/async/await/with/for/if/import/lambda/None/True/False/…), builtins
   (print/len/range/isinstance/…), комменты `#`, строки `'…'/"…"/f"…"`; C#-путь не тронут.
5. `lessonRunner.ts` + `strings.ts`: бейдж код-панели по `lesson.lang` — `IL` (csharp) /
   `dis · байткод` (python); caption панели тоже по языку. Структура `IlLine` переиспользуется
   для вывода `python3.12 -m dis` (опкоды только из реального прогона).
6. `strings.ts`: greetSub/pathLabel → нейтральные/параметризованные по группе трека.
Бэкенд НЕ меняется (LessonStore/track готовы — Explore file:line в RS: LessonStore.cs:40).

## Данные: уроки волны (нарезка RS-01 + merge-карта RS-02, порядок = concept-DAG)
M1 names-objects (флагман ≥7: вводная карта хребта md §0 → имена→объекты → mutable/
immutable → mutable default → aliasing → refcount+GC → int-cache/interning(int("257")) +
первый dis-кадр LOAD_CONST/STORE_NAME) · M2 collections-hash · M3 args-unpacking ·
M4 closures-scope (LEGB, cells, late binding, global/UnboundLocalError-фикс md) ·
M5 decorators (флагман ≥6: слои, def-time, wraps, параметризованные, @pytest.fixture) ·
M6 generators (yield=пауза кадра, gi_frame, exhaust, setup/teardown фикстур) ·
M7 context-managers (__enter__/__exit__, подавление, contextlib, finally-vs-with) ·
M8 object-model (класс/инстанс-атрибуты, MRO C3, дескрипторы→bound methods, property,
mangling; полиморфизм-пример md исправлен) · M9 exceptions (иерархия от OSError — фикс,
try/else/finally, finally-return gotcha, raise from) · M10 type-hints (hints≠принуждение,
`__annotations__`, PEP 604 «3.10+», Pydantic-preview) · M11 async-await (флагман ≥7:
event loop, корутина-как-генератор, await≠поток, gather, GIL) ·
M12–M13 шпаргалки P2 (существующий формат, 2–3 сегмента с сюжетом + колода карточек):
M12 strings+flow (срезы-анимация, f-string spec, for-else) · M13 stdlib+pathlib+idioms
(json/re/datetime-минимум, pathlib-путь, EAFP/LBYL, truthiness).
Каждый урок: собес-блоки md → misconceptions + okText/noText; takeaway «где встречаешь
в инструментах» (pytest/allure/httpx/locust — из хребта §0); БЕЗ сравнений с C#.

## Опыт/ценность (владелец смысла)
Дневная петля не меняется: home → секция «Python» → урок (5–10 мин: анимированные
разборы, predict-гейты) → карточка (напечатай stdout) → FSRS двигает расписание →
завтра повтор. Ценность волны: (а) собес-вопросы md закрыты пониманием механизма
(«видел анимацию кадра генератора — не поплывёшь на yield»); (б) невидимое показано
(cells/frames/dis/GIL/refcount); (в) хребет md держит смежности (каждый урок говорит,
в каком инструменте это встретится). Первая сессия Python-трека: 0–1 мин карта хребта
(вводный сегмент M1) → 1–8 мин 3–4 разбора → 8–10 мин карточка+оценка.

## Верификация (инструментарий — команды)
- Бэк: `ASPNETCORE_ENVIRONMENT=Development ASPNETCORE_URLS=http://localhost:5080 dotnet run --no-launch-profile` (в backend/Codex.Backend); фронт: `cd app && npm run build && npm run preview` (:4173).
- Харнессы: `npm run verify` · `node verify/shell.mjs` · `node verify/new-lessons.mjs`
  (расширить списком PY-уроков) · `node verify/viz-fit.mjs` (авто по реестру) ·
  `node verify/loop.mjs`; `dotnet test backend/Codex.Backend.Tests/...csproj`.
- Скриншоты: headless 390×844 (TMA-вьюпорт), кадры сегментов + home двух секций →
  `docs/tasks/python-track/evidence/F<N>/`.
- **G-EXEC-PY (census)**: каждый predict-output → `evidence/py-cards/<lesson>_<card>.py`;
  прогон `python3.12 file.py` ×2 (детерминизм), stdout и stderr РАЗДЕЛЬНО в лог
  `evidence/py-cards/census-log.txt`; expect == stdout байт-в-байт (после norm).
  Чеклист допустимости expect — RS-03 (set-порядок/тайминги/is/traceback — запрещены).
- Турниры (до сдачи F1): (а) нулевой экран — 3 черновика секций-треков home (одноразовые
  haiku-агенты, standalone HTML в .spikes/tournament/home/, LOCKED-токены), парные
  сравнения в обоих порядках; (б) signature — 3 варианта подачи «невидимого» кадра
  (dis-панель/refcount) в .spikes/tournament/sig/. Победители интегрируются builder-ом.

## Контракты/инварианты сборки
Один пишущий builder; уроки последовательно (шарят registry/seed). Фича = зелёное
(build + харнессы + G-EXEC-PY своих карточек) → коммит (EN-месседж) → следующая.
Дизайн-токены/движок не менять; новый примитив — только через ADR. Цитаты EN дословно
с URL из банка RS-02; опкоды/выводы — только python3.12. сверено: 2026-07-17 (пост-M4:
дельта гейта-чекпойнта M1 — переключатель треков вместо секций — внесена в §3; правда
сведена против кода фикс-тактов b3c50a4/6e1406c).
