# R-M4 — Вердикт evaluator-а: майлстоун M4 (F11 async-await · F12 strings-flow · F13 stdlib-idioms · F14 прогресс-по-трекам · фиксы M3)

Дата: 2026-07-17 · Раунд: 1 · Оценщик: СВЕЖИЙ внешний evaluator (не тот, что принимал M1–M3;
R-M1/R-M2/R-M3 прочитаны как контекст — их скоуп не пересверяю, фокус на НОВОМ).
Проверено против: brief.md (G1–G9), features.md (приёмки F11–F14 + фиксы M3 в стиле F1b),
design.md, RS-02 (банк источников), RS-03 (чеклист expect).
Метод: всё перепрогнано моими руками на главном дереве (HEAD 0105f39, дерево чистое,
билдеров нет; бэк :5080 / preview :4173 живые — проверено /health до старта). Заявления
builder-ов доказательствами не считались. Мой скрипт: `.verify/_eval-m4-g1-async.mjs`;
мои скрины: `docs/tasks/python-track/reviews/evidence/M4/`; полные логи verify ×3 —
scratchpad/verify-run{1,2,3}.log (35 ассертов каждый).

---

## 1. Сборка и харнессы — мой прогон (чеклист п.1)

| Проверка | Команда | Результат |
|---|---|---|
| Сборка фронта | `npm run build` | ЧИСТО; JS 572.12 KB → **141.77 KB gz** (< 200; заявка F13 «141.53» — это уровень 70226e8, +0.24 KB добавил F14-код, сходится) |
| viz-fit | `node verify/viz-fit.mjs` | **ALL GREEN: 316 settled-сцен + 633 mid-transition проб по 19 урокам**; 0 FIT/CLIP/OVERLAP/ROW-BASELINE/…; 0 ошибок консоли |
| new-lessons | `node verify/new-lessons.mjs` (полный лог сохранён) | **ALL GREEN**: PY.M11 «built 7 animated segments», M12 — 3, M13 — 3; autoplay s1 у всех трёх; predict-гейт assert (блокирует/показывает вопрос/resolve разблокирует) ✓; reduced-motion по всем 19; 0 конс. ошибок |
| multicard-session | `node verify/multicard-session.mjs` | **ALL GREEN**, 0 конс. ошибок |
| shell | `node verify/shell.mjs` | **ALL GREEN** (axe, progress-ассерты, empty/completed) — смоук ранее verified экранов без регресса |
| dotnet | `dotnet test …Tests.csproj` | **65/65 PASS** (= базлайн) |

### ФЛЕЙК npm run verify — спецпроверка (вход F15)
Прогнано **3 раза подряд с ПОЛНЫМ логом** (без `| tail`): **3/3 ALL GREEN**, по 35 «✓»
в каждом логе, 0 фейлов (единственный grep-хит «fail» — заголовок секции негативного
теста F6). Флейк 2/9 builder-а НЕ воспроизведён; имя assert-а по-прежнему неизвестно
(логи builder-а утеряны). Сигнал остаётся: в F15 гонять verify только с полным логом.

## 2. G3 — плотность и структура F11–F13 (все 3 файла прочитаны целиком)

| Урок | Сегм (заявка/факт) | Гейты (predictAt) | Лесенка | est |
|---|---|---|---|---|
| F11 async-await (флагман) | **7/7** ✓ (≥7) | s2, s4, s7 | c2 predict → c3 MODIFY (gather+print) ✓ | 10 ≤ 12 ✓ |
| F12 strings-flow (шпаргалка) | **3/3** ✓ (2–3) | s2 (!r), s3 (for-else) | колода 6 exec, без лесенки (исключение шпаргалок) ✓ | 6 |
| F13 stdlib-idioms (шпаргалка) | **3/3** ✓ (2–3) | s2 (json-ключ), s3 (KeyError) | колода 6 exec ✓ | 6 |

Контракт F11 закрыт по пунктам: event-loop timeline (s1: задача уезжает в I/O-банду,
луп занимает поток следующей) · корутина-объект (s2) со **stderr-предупреждением
ОТДЕЛЬНЫМ КАДРОМ** — сцена 3/4 = fail-gate «не awaited · RuntimeWarning», текст
дословно из спайка, В expect НЕ входит (c1 expect = `coroutine\n42`, warning в stderr —
проверено моим прогоном) · await=передача (s3, три вида awaitable) · gather-порядок
(s4: done fast→slow ≠ res ['slow','fast'], БЕЗ speedup-чисел — запрет критика соблюдён) ·
мост к M6 (s5: send(None), **РЕНТГЕН cr_frame** {'n': 41}, StopIteration.value) ·
**GIL-жетон** (s6: «GIL · замок» переезжает Поток 1 → Поток 2, кадры различаются;
free-threading 3.13 хук) · блокирующий вызов (s7: fail-gate time.sleep → ok-gate
asyncio.sleep, порядок печати меняется). `grep -c "C#"` по 3 новым файлам = **0**.
MCQ волны: **53/53 exec, 0% MCQ** (мой grep). Сюжетные гейты шпаргалок играют:
мой headless-пробник — PY.M13 s2 сцена 3 рендерит fail-gate «ключ 1 → '1'», s3 сцена 2 —
ok-gate «except KeyError» (`.verify/_eval-m4-g1-async.mjs` + scene-goTo-проба).

## 3. G2 — ТОЧНОСТЬ: 27 проверок цитат живым фетчем + 17 карточек + 6 спайков

### 3.1 EN-цитаты против живых URL (мой WebFetch, 2026-07-17) — 27/27 VERBATIM
- PEP 492 (×3): «Since, internally, coroutines are a special kind of generators…
  (please refer to PEP 3156 for a detailed explanation)» — дословно С НАЧАЛА предложения
  (канон M2 соблюдён) · read_data/db.fetch · «It is a SyntaxError to use await outside
  of an async def function» ✓.
- asyncio-task (×5): «simply calling a coroutine will not schedule it to be executed» ·
  three main types of awaitable · «Run awaitable objects in the aws sequence concurrently» ·
  «The order of result values corresponds to the order of awaitables in aws» · TaskGroup ✓.
- glossary (×8): GIL — 4 фрагмента (only one thread executes bytecode · object model/dict
  implicitly safe · at the expense of much of the parallelism · GIL released when doing I/O) ·
  coroutine · EAFP · LBYL · race «…removes key from mapping after the test» ✓.
- free-threading HOWTO: «Starting with the 3.13 release…» ✓.
- F12: tutorial/controlflow for-else · reference/expressions walrus · PEP 498 ×2 ·
  stdtypes ×3 (s[i:j:k] · negative index · no mutable string) ✓.
- F13: pathlib ×6 (intro · slash operator · pure/concrete · glob no order · suffix · stem) ·
  json ×3 (keys coerced · conversion table · loads(dumps(x)) != x) · truth-value ×2
  (__bool__/__len__ · falsy-список) · zip shortest · enumerate count ✓.
Все «MISMATCH» фетчера — только markdown-разметка источника (backticks/курсив/ссылки),
текст дословен.

### 3.2 Карточки — мой прогон python3.12.13 ×2 ВСЕХ 16 карт M11–M13 (+ M8_c4)
Детерминизм 17/17; stderr пуст 16/17 (M11_c1 — RuntimeWarning BY DESIGN, аннотирован
NOTE-строкой в census-log); **трёхсторонняя сверка моим скриптом front(ts) == seed(json
expectedOutput) == stdout: 17/17 OK, FAILURES: 0**. Чеклист RS-03: stdout-only ✓ (warning
M11_c1 не в expect ✓); без set-порядка ✓; без таймингов/id()/адресов в expect ✓
(gather-карточки сверяют детерминированный ПОРЯДОК, не время); имена исключений через
type(e).__name__ (M13_c4) ✓. census-log: 53 уникальные карты + аннотированный re-run-блок
M8_c4 — согласован с моими прогонами.

### 3.3 Спайки — моё независимое воспроизведение (6 шт.)
f11_send_frame → `{'n': 41}` / `StopIteration: 42` (консоль s5 = факт) · f11_blocking_loop →
`block start/block end/other` · f11_async_sleep → `block start/other/block end` ·
f11_gather_done_order → `done: fast / done: slow / ['slow', 'fast']` · f12_for_else_empty →
`else ran` (клейм хука «на пустой коллекции else тоже») · f13_glob →
`['test_cart.py', 'test_login.py']` — все байт-в-байт с уроками и \_out.txt-логами.

### 3.4 Замер лейблов (мой прогон `_fit-margins`, теперь читает APP_BASE)
M11 — ни одного лейбла с margin <10 (секция пуста — заявка сходится); M12 худший =
**6.8px** («TimeoutError») ≥ 6; M13 худший = **8px** ≥ 6. Все числа builder-а совпали.

## 4. G1 — такт петли на F11 (мой скрипт, путь пользователя)

`.verify/_eval-m4-g1-async.mjs`, свежий user 7xxxxx, home → чип python → урок из ленты —
**все ассерты зелёные**:
1. `/api/due` ДО: **59** карт (= 6 C# + 53 PY — все карты волны в очереди), M11/c1 в очереди.
2. ACT: typed-ввод `coroutine\n42` (мой python3.12-прогон) → verdict ✓ (objective) →
   Good предвыбран → POST /api/review → `{"grade":"Good","stability":2.3065,"reps":1,"state":"Learning"}`.
3. OBSERVE: due 59→58, c1 ушла.
4. PERSIST: полный reload — due 58, c1 отсутствует (эффект серверный, не display-only).
5. 0 ошибок консоли.

## 5. F14 — мой прогон харнесса + глазами

`node verify/_f14-progress-tracks.mjs` → **ALL GREEN**: свежий юзер прошёл C#-карту
(T1.M4.gc/c1) И PY-карту (PY.M13/c1), оба /api/review Good; perLessonGroups =
csharp 6 + python 13 = perLesson **19** (счётчики честные: 13 PY-уроков фактом в
реестре, 6 C#); ровно 2 заголовка «Темы: … · Фундамент C# / · Python для AQA»; обе
ленты непустые; 0 ошибок консоли. Скрин границы треков (390-progress-tracks-boundary.png)
смотрел глазами: C#-лента («GC и память · Пройдено») → заголовок PY → PY-лента — граница
читается, смешения прогресса нет.

## 6. Фиксы M3 (00a4c40) — каждый перепроверен

| Фикс | Моя проверка | Вердикт |
|---|---|---|
| PY.M8_c4 → type(e).__name__ | файл прочитан (except AttributeError as e: print(type(e).__name__)), прогон ×2 `1\nAttributeError`, front==seed==stdout | ✓ |
| Цитата F9 s2 до конца предложения | py-exceptions.ts:171 «…, or to a tuple that contains such a class» + мой фетч compound_stmts: предложение кончается ровно там, VERBATIM | ✓ |
| features.md F8 PNG 13→19 | строка исправлена | ✓ |
| _fit-margins APP_BASE | `grep`: `process.env.APP_BASE \|\|` + мой прогон | ✓ |
| ghost 0.4 | evidence/M3-fixes/ смотрел глазами: M7 s4 reduced — ghost ValueError в «ТЕЛО WITH» теперь читается; M12 s3 reduced — ghost-гейт «без break · TimeoutError» виден | ✓ |
| мусорные docs/evidence/PY-* | каталогов нет, .gitignore-правило evidence/harness есть | ✓ |

## 7. Глазами — 12 кадров builder-а + 7 моих (3 вьюпорта)

- F11 s2 сцена 3 (мой пересъём eval-390-f11-s2-scene3-runtimewarning.png): отдельный
  кадр-гейт «не awaited · RuntimeWarning», caption цитирует stderr дословно — есть и заметен.
- F11 s6 сцены 1→2 (мои): жетон «GIL · замок» реально переезжает Поток 1 → Поток 2,
  кадры различаются (фидбек событий различим).
- F11 s5 (builder): «РЕНТГЕН · cr_frame», n=41→42, IP-чип, консоль StopIteration: 42 —
  signature-«невидимое» вернулось во флагман (замечание R-M3 исполнено: GIL + cr_frame).
- F11 s4: gather-гейт «порядок аргументов ['slow', 'fast']», консоль done: fast/done: slow.
- F11 s7 (мой пересъём): ok-gate «asyncio.sleep · пауза отдаёт луп», «во время сна».
- F12 s2: конвейер {name=} → name='Alice'; F13 s1: glob-фильтр (2 accent + 2 ghost файла) —
  кадры не пустые, лейблы не режутся (подтверждено margin-замером §3.4).
- Карточка F11 (390-card-after): «НАПЕЧАТАЙ ВЫВОД», моно-ввод coroutine/42, вердикт ✓,
  okText честно оговаривает stderr.
- Смоук home 375/768/1440 (мои eval-*-home.png): чипы треков, лента, токены — регресса нет.

**Паспорт вкуса: PASS** (доказательства: мои снимки reviews/evidence/M4/
eval-390-f11-s6-scene2-gil-th2.png — GIL-жетон = прямо перечисленный в паспорте
signature-элемент, eval-390-f11-s2-scene3-runtimewarning.png, eval-375-home.png —
cream #F6F1E9/coral/Rubik+JetBrains Mono, радиусы, line-иконки; builder-ов
F11/390-seg-s5-final.png — xray cr_frame. Соседство с эталоном boxing/closures
выдерживает: та же плотность «код-панель + зоны + консоль + механизм»).

## 8. Пересчёт количественных под-заявок

| Заявка | Пересчитано мной | Вердикт |
|---|---|---|
| Сегменты 7/3/3 | harness «built N» 7/3/3 + чтение файлов | ✓ |
| Карточки 4/6/6, все exec | grep + трёхсторонняя сверка 16/16 | ✓ |
| MCQ волны 0% (53/53) | grep по 13 py-уроков: 53 exec | ✓ |
| viz-fit «316 сцен / 19 уроков» | мой прогон: дословно | ✓ |
| census 53 карты ×2 | 53 уникальных блока + re-run M8_c4 | ✓ |
| «/api/due свежего = 59 с 6×M13» | мой G1: due=59, M13-карты в очереди | ✓ |
| PNG: F11=17, F12=9, F13=9, F14=2 | ls: 17/9/9/2 | ✓ |
| бандл 141.53 gz | мой build HEAD: 141.77 (F14-код поверх F13-замера) | ✓ (< 200) |
| headroom M11 «<10 нет» / M12 6.8 / M13 8 | мой замер: пусто / 6.8 / 8.0 | ✓ |
| dotnet 65/65 | 65/65 | ✓ |

---

## ВЕРДИКТ: ПРИНЯТО-С-ЗАМЕЧАНИЯМИ

(0 БЛОКЕРОВ; 1 СУЩЕСТВЕННОЕ — авто-конверсия повтора R-M3, решение диспозиции за
оркестратором; для бинарного контракта = ПРИНЯТО, F11–F14 достойны verified)

## ПРОБЛЕМЫ:
- [СУЩЕСТВЕННОЕ · ПОВТОР R-M3 → авто-конверсия по правилу «двух вердиктов подряд»]
  Половина signature-оси «байткод-панель dis» не использована и в M4: 0 dis-кадров в
  M11–M13, последний dis — M5 (8 уроков подряд без фирменной панели). Ось «невидимого»
  в F11 честно закрыта GIL-жетоном и рентгеном cr_frame (оба прямо в паспорте) — поэтому
  НЕ блокер M4; но флагман F11 был последним естественным местом волны для dis-кадра
  (GET_AWAITABLE/SEND корутины — готовый «вау» 3.12). Диспозиция оркестратора: дешёвый
  dis-кадр до/в F15 или явная запись в backlog волны-2 — пункт не может дальше жить
  примечанием.
- [МЕЛОЧЬ] Гигиена усечения цитат (тот же класс, что чинённый F9 s2): (а)
  py-async-await.ts s2 caption и edgeCase цитируют «simply calling a coroutine will not
  schedule it to be executed» без открывающего «Note that» и без маркера усечения
  (в explain — полный вариант); (б) py-stdlib-idioms.ts c5 noText обрывает «…a __len__()
  method that returns zero» без «, when called with the object» и без маркера. Содержание
  дословно, риска смысла нет — маркировать усечения.

## ЧТО ПЛОХО:
- **[опыт/петля]** Свежему пользователю падает **59 new-карт разом** (43 на M3 → 59 на M4);
  первая сессия рискует ощущаться стеной. Диспозиция уже существует — замер FSRS-дозирования
  ДО/ПОСЛЕ в приёмке F15 теперь единственное, что отделяет риск от факта: без этого замера
  F15 сдавать нельзя.
- F11 s6 (GIL) все 4 сцены висят на одной строке кода (codeLine 2) — код-панель статична
  весь сегмент, нарратив несут только зоны/жетон. Эталон boxing ведёт сцену кодом; здесь
  планка чуть ниже флагманской (компенсируется контентом кадров, но это самый «плоский»
  код-сегмент M4).
- Шпаргалки M12/M13 — почти целиком чип-сцены без объект-нод (obj-kind в M12/M13 = 0):
  для P2-формата легально, но доля чип-графики в волне растёт; ставка трека держится
  только на механизм-уроках.
- «6 механизмов, из которых сделаны твои инструменты» под чипами Python-трека при 13
  уроках в ленте — сабтайтл времён M1; формально про хребет §0, но рядом со счётчиком
  13 уроков читается устаревшим.

## ПРОВЕРКА ДОКАЗАТЕЛЬСТВ:
- «7/3/3 сегментов, autoplay s1, reduced-motion» → мой new-lessons, полный лог: дословно ✓
- «viz-fit 316/19, verify/multicard/shell ALL GREEN, dotnet 65/65» → мои прогоны: ✓
- «флейк 2/9» → мои 3 полных прогона: 0/3, не воспроизведён (имя assert-а так и не добыто) ✓/⚠
- «expect = stdout ×2, front==seed==census, seedsync 0» → 17 карт перегнал сам ×2 +
  свой трёхсторонний скрипт: 17/17 ✓
- «9/7/15+ EN-цитат дословны» → 27 цитат моим фетчем: 27/27 VERBATIM (2 усечения без
  маркера — МЕЛОЧЬ выше) ✓
- «RuntimeWarning отдельным кадром, не в expect» → кадр снят мной (s2 сцена 3), stderr
  моего прогона = текст кадра, expect stdout-only ✓
- «спайки ×2» → 6 спайков перегнал сам, байт-в-байт ✓
- «F14 registry-driven, 6+13=19, 2 заголовка» → мой прогон харнесса + глазами ✓
- «фиксы M3» → все 6 перепроверены исполняемо (§6) ✓
- «0 ошибок консоли» → 0 во всех моих прогонах (viz-fit/new-lessons/multicard/shell/verify×3/G1/F14) ✓

## СОМНЕНИЯ:
- Карточки c2–c4 M11 сверяют порядок печати, зависящий от разницы sleep 0.01/0.05 —
  детерминирован во всех 4 моих/census прогонах и одобрен критиком («только порядок»),
  но на перегруженном CI-раннере теоретическая инверсия не исключена на 100%; если
  когда-нибудь флейкнет G-EXEC-PY — искать здесь.
- `options`/`distractors` в predict-карточках сидят в данных при typed-вводе в UI —
  предсуществующий паттерн продукта (так во всех уроках с M1), в игре их не видно;
  на верификацию не влияет.
- Флейк verify остаётся неатрибутированным: 3/3 зелёных у меня + 7 подряд у builder-а —
  вероятна интерференция окружения (параллельный браузер/бэк), но без имени assert-а
  это гипотеза; страховка — полные логи в F15/CI.

РЕЗЮМЕ: M4 реален и доказан моими прогонами на чистом HEAD 0105f39: 6 харнессов + 65
тестов зелёные, verify ×3 без флейка; F11 — полноценный флагман (7 сегментов фактом,
stderr-кадр отдельно и вне expect, GIL-жетон и cr_frame-рентген возвращают signature,
gather без speedup-чисел); шпаргалки F12/F13 — по 3 сюжетных сегмента с играющими
гейтами и колодами 6 exec; F14 доказан прогоном с данными обоих треков (6+13=19);
все 6 фиксов M3 закрыты исполняемо. Точность: 27 цитат живым фетчем VERBATIM, 17 карт
×2 с трёхсторонней сверкой, 6 спайков воспроизведены. Единственное СУЩЕСТВЕННОЕ —
простой dis-панели второй вердикт подряд (авто-конверсия), требует диспозиции
оркестратора, приёмку M4 не блокирует.
