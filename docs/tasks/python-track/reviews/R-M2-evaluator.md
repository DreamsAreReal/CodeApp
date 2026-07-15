# R-M2 — Вердикт evaluator-а: майлстоун M2 (F1b переключатель треков + уроки F2–F6)

Дата: 2026-07-16 · Раунд: 1 · Оценщик: СВЕЖИЙ внешний evaluator (не тот, что принимал M1;
R-M1 прочитан как контекст — что уже сверено, я не пересверяю, беру НОВОЕ)
Проверено против: brief.md (ворота G1–G9, G-MT), features.md (приёмки F1b, F2–F6),
design.md, RS-02 (банк источников), RS-03 (чеклист expect / py3.12).
Метод: ВСЁ перепрогнано моими руками из /Users/admin/Desktop/CodeApp; заявления builder-а
доказательствами не считались. Живой стек: бэк :5080 (health ok, sqlite), фронт :4173.
Мои скрипты: `.verify/_eval-m2-*.mjs`, `.verify/qcheck.py`, `.verify/seedsync.py`;
мои скрины: `docs/reviews/evidence/M2-python/`.

---

## 1. Сборка и харнессы — мой прогон (чеклист п.1)

| Проверка | Команда | Результат |
|---|---|---|
| Сборка фронта | `npm run build` | ЧИСТО; JS 392.16 KB → **99.03 KB gz** (< 200 KB гейт) |
| viz-fit | `node verify/viz-fit.mjs` | **ALL GREEN по 12 урокам** (206 settled-сцен + 408 mid-transition проб): 0 FIT/CLIP/OVERLAP/ROW-BASELINE/…; 0 ошибок консоли. Фикс M1 (а) подтверждён: browser-часть из реестра, PY-уроки покрыты; принт «all 6» убран |
| new-lessons | `node verify/new-lessons.mjs` | **ALL GREEN**. Все 6 PY-уроков в home path, построены и доиграны до финального кадра: PY.M2=5, PY.M3=4, PY.M4=6, PY.M5=8, PY.M6=6 сегментов (счётчики = заявкам). Фикс M1 (b) подтверждён: assert predict-гейта есть и зелёный (blocks / prompt / resolve unblocks). PY.M1 typed-такт: Good → /api/review → due 25→24. Reduced-motion статика по всем 10 урокам |
| multicard-session | `node verify/multicard-session.mjs` | **ALL GREEN**: честный счётчик «1 из 4 → (Again) → 1 из 5 → … → 5 из 5», Again ре-энкьюится в ТУ ЖЕ сессию, кап ×1, «Завершить сессию» только на истинно последней. Фикс M1 (c) доказан |
| shell | `node verify/shell.mjs` | **ALL GREEN**; axe 0 serious/critical (Home 13, Document 19, Progress 14, Lesson PY.M1 18 checks); смоук ранее verified экранов (boxing-completion, прогресс, калибровка) — регресса нет |
| Бэкенд-тесты | `dotnet test …Codex.Backend.Tests.csproj` | **65/65 PASS** (= базлайн, порог шума 0) |

## 2. F1b — переключатель треков: мой собственный headless-прогон (не харнесс builder-а)

`.verify/_eval-m2-f1b-switcher.mjs`, свежий пользователь, 390×844 — **ALL GREEN**:
- 2 чипа с лейблами решения пользователя: «Фундамент C#» / «Python для AQA» (+бейдж «новый»);
- свежий пользователь: дефолт csharp, лента ТОЛЬКО C# (cs=6, py=0);
- клик python-чипа: чип активен, лента ТОЛЬКО PY (py=6, cs=0), `localStorage
  codex.activeTrackGroup=python`;
- **полный reload: python остаётся активным, лента остаётся PY** (персист доказан);
- открытие C#-урока переключает сохранённый дефолт на csharp (last-opened wins);
- 0 ошибок консоли.
Глазами (мой скрин eval-390-home-python-switcher.png): активный чип — коралл, лента PY
из 6 уроков с честными счётчиками новых карт (4/3/3/3/4/4), hero/due — глобальные.

## 3. G3 — плотность F2–F6 (все 5 файлов py-*.ts прочитаны целиком)

| Урок | Сегм (заявка/факт) | Гейты | Лесенка (modify-ступень) | Собес-блок | Takeaway «где встречаешь» | est |
|---|---|---|---|---|---|---|
| F2 collections-hash | 5/5 ✓ | s2 | c2 (tuple(lst)-ключ) | «list/set/tuple = 3 слова» refutation | ✓ | 7 |
| F3 args-unpacking | 4/4 ✓ | s1 | c2 (тот же вызов через */**) | «*locator = магия Selenium» | ✓ | 5 |
| F4 closures-scope | 6/6 ✓ | s2, s6 | c1 (predict+modify в одной) | «10 10» junior-ловушка | ✓ | 7 |
| F5 decorators (флагман) | 8/8 ✓ (≥6) | s2 | c3 (убран return → None) | ecommpay «декоратор = фикстура» refutation + s7-кадр | ✓ | 9 ≤ 12 |
| F6 generators | 6/6 ✓ | s3, s6 | c4 (материализация 5\n5) | «yield — это такой return» | ✓ | 8 |

Каждый сегмент: мультикадровые scenes (2–4 кадра, каждый кадр меняет состояние узлов) +
explain + sources. 0 «упоминаний вместо анимации» на выборке моего чтения: каждый
заявленный нюанс (buckets-прыжок, TypeError-гейт, компилятор красит имена, cells-рентген,
def-time, wraps, gi_frame, исчерпание) показан сценами. Signature «невидимое»: xray-зоны
(`__closure__` F4 s5, gi_frame F6 s2) + dis-панели (F4 s5, F5 s8) — есть и заметны.
**БЕЗ C#-сравнений**: `grep "C#" py-*.ts` → единственное совпадение — EN-комментарий
авторинга в py-names-objects.ts:23 (не пользовательский контент); в контенте F2–F6 — 0.

Фиксы M1 (e/f/g) в py-names-objects: s1 теперь 4 сцены (+PEP 492-цитата в explain
s1) ✓; «немедленно и детерминированно» убрано, «деталь реализации CPython» есть ✓;
c4 (modify: починенный дефолт) в фронте+seed ✓.

## 4. G2 — ТОЧНОСТЬ выборкой ПОВЕРХ M1: 30 независимых проверок, 1 нюанс, 0 ошибок

### 4.1 Дословность EN-цитат против ЖИВЫХ URL (мой фетч, qcheck.py) — 21/21 VERBATIM
glossary (hashable, decorator) · tutorial/datastructures («You can't use lists as keys»,
«A set is an unordered collection…») · whatsnew/3.7 (insertion-order spec) ·
tutorial/controlflow (×6: «wrapped up in a tuple», «it receives a dictionary»,
keyword-only, *-operator unpack, **-operator dicts, «scoop up all remaining input
arguments») · PEP 3132 («assigned a list of all items…») · tutorial/classes («3 or 4
nested scopes…») · datamodel (×2: __closure__ cells, cell_contents) · compound_stmts
(×2: «func = f1(arg)(f2(func))», «except that the original function is not temporarily
bound…») · PEP 318 («move the transformation…») · functools («Update a wrapper
function…») · reference/expressions (★ «By suspended, we mean that all local state is
retained…») · FAQ («that variable becomes local to that scope and shadows…»).
**Нюанс (не блокер):** цитата PEP 492 в s1 py-names-objects начинается с середины
предложения источника («Since, internally, coroutines…») с молчаливой капитализацией
«Internally» — содержание дословно (case-insensitive match подтверждён моим фетчем),
банк RS-02 C-11.1 сам так нормализовал; по гигиене цитирования лучше `[I]nternally` или
захват «Since».

### 4.2 dis-опкоды — мой независимый `python3.12 -m dis` (3.12.13)
- **F4 s5** (фабрика замыкания): `0 MAKE_CELL 0 (factor) · 4 LOAD_CLOSURE 0 (factor) ·
  6 BUILD_TUPLE 1 · 8 LOAD_CONST 1 (multiply) · 10 MAKE_FUNCTION 8 (closure)` + в теле
  multiply `6 LOAD_DEREF 1 (factor)` — офсеты/опкоды/аргументы **байт-в-байт** = il[]
  урока (пометка `6*` честная).
- **F5 s8** (@log def add): `8 LOAD_NAME 0 (log) · 10 LOAD_CONST 1 (add) ·
  12 MAKE_FUNCTION 0 · 14 CALL 0 · 22 STORE_NAME 1 (add)` + `0* MAKE_CELL 0 (func)` в
  теле log — **байт-в-байт** (вход воспроизведён из evidence/spikes/f5_dis_input.py).
  (LOAD_CONST-аргумент в панели сокращён «(add)»/«(multiply)» против «(<code object …>)»
  реального вывода — сокращение отображения, не фальсификация.)

### 4.3 Замер «38.4 MB vs 200 Б» (F6 s5) — воспроизведён МОИМ скриптом ×2
container 8 448 728 Б + int-объекты 31 868 928 Б = 40 317 656 Б = **38.4 MB**;
genexpr — **200 Б**. Оба прогона идентичны; числа в уроке (8.4 MB контейнер,
31 868 928, 38.4 MB, 200 Б) совпали; «~30 MB» из md не воспроизводится (A-5 соблюдён).

### 4.4 Карточки из evidence/py-cards — мой прогон ×2 (python3.12.13)
PY.M2_c1 → `TypeError\nok` · PY.M4_c1 → `[2, 2, 2]\n[0, 1, 2]` · PY.M5_c4 →
`decorating foo\ndone` · PY.M6_c3 → `1\nStopIteration` — stdout **== verify.expect
байт-в-байт**, оба прогона идентичны, stderr пуст. Чеклист RS-03: детерминизм ×2 файлом ✓;
stdout-only ✓; без set-порядка ✓; без таймингов/id() ✓; без `is` на рантайм-объектах ✓;
имя исключения через `except: print(...)`, без текста traceback ✓; лог census
(3.12.13, ×2, stderr раздельно) есть ✓. MCQ-fallback: 0/21 карточек волны (все exec) ✓.

### 4.5 Прочие исполняемые факты — мой прогон
- Текст UnboundLocalError 3.12 (F4 s2): «cannot access local variable 'count' where it
  is not associated with a value» — дословно ✓.
- gi_frame (F6 s1/s2): `GEN_CREATED` → `GEN_SUSPENDED`, `f_locals == {'n': 41}`,
  второй next → `42` ✓.
- **Синк seed↔фронт (seedsync.py): 21/21 карточек** — id и expectedOutput совпали
  байт-в-байт по всем 6 PY-урокам (M1=4, M2=3, M3=3, M4=3, M5=4, M6=4).

## 5. Глазами — скрины evidence/F1b..F6 (37 PNG) + мои 4 кадра

- F2 s1/s5 + card: buckets-виз читаем, hash-гейт, порядок dict с консолью
  `['b', 'a', 'c']`; карточка — typed-ввод «НАПЕЧАТАЙ ВЫВОД», моно, уверенность.
- F4 s5: тёмная dis-панель «DIS · БАЙТКОД» + xray-зона «РЕНТГЕН · __closure__»
  (штриховая) — signature в наличии и заметен; s6: три лямбды → одна ячейка, `[0, 1, 2]`.
- F5 s1/s8: слот «add» в боксе с видимым запасом (мой кадр eval-390-m5-s8-dis.png),
  wrapper→add, активный опкод подсвечен синхронно сцене.
- F6 s2/s4/s5: gi_frame-рентген (`n = 42`, `IP · дальше`), фикстура setup/пауза/teardown
  с fail-гейтом «conn.close() не выполнится», замер 38.4 MB vs 200 байт в кадре.
- F1b: чипы обоих состояний, python-after-reload, s7-шов (hairline .lbar) — чисто.
- Кадры не пустые, лейблы не режутся (сверил глазами все присланные финалы), бренд
  выдержан: cream #F6F1E9, белые карточки, коралловые акценты/CTA, Rubik/JetBrains Mono,
  xray/консоль-паттерны как в эталоне boxing/closures; анти-слоп (без золота/Inter) ✓.

**Паспорт вкуса: PASS** (доказательства: мои снимки docs/reviews/evidence/M2-python/
eval-390-home-python-switcher.png — токены/чипы/лента, eval-390-m5-s8-dis.png —
signature dis-панель + зоны имена/объекты, eval-390-m6-s2-frame.png — xray gi_frame;
соседство с эталоном boxing выдерживает: та же плотность кадра код-панель+зоны+механизм).

### Отклонение builder-а: slot «add» margin 4.8px < 6px (F5 s1/s8) — оценка риска
Мой замер (`_fit-margins.mjs`): natural len 25.2 при avail 30 → margin 4.8px на macOS;
FreeType на Linux рендерит моно ~3–4px шире → запас ~0.8–1.8px, впритык. НО: (1) движок
имеет last-resort hard-clamp `textLength` (vizPlayer.ts:507 — текст ГЕОМЕТРИЧЕСКИ не
может вылезти, худший случай — лёгкое поджатие межглифовых просветов); (2) **реальный
Linux-ран CI на HEAD b475475 с этими лейблами — SUCCESS** (см. §6), т.е. риск проверен
не рассуждением, а прогоном; (3) прецедент C#-уроков подтверждаю. Отклонение ПРИНИМАЮ;
остаточный риск — косметика (сжатие глифов при смене метрик шрифта), не FIT-провал.

## 6. CI на HEAD b475475 — мой запрос
`gh run list` / `gh run view 29450728387`: **completed SUCCESS** (test 7m16s ✓,
build-and-push 1m43s ✓, deploy 4s ✓ graceful-skip). Примечание: ран коммита PY.M3
(29446600520) падал на viz-fit (Linux FIT) — закрыт фиксом e643d40 «compact mono labels
with natural >=6px headroom» ДО HEAD; на HEAD зелено со всеми 6 PY-уроками.

## 7. G1 — такт петли на НОВОМ уроке (PY.M6.generators), мой собственный прогон

`.verify/_eval-m2-g1-generators.mjs`, свежий пользователь 855371, путь ПОЛЬЗОВАТЕЛЯ
(home → чип python → карточка урока из ленты, не deep-link) — **ALL GREEN**:
1. `/api/due` ДО: 27 карт, `PY.M6.generators/c1` в очереди.
2. ACT: typed-ввод `created\nstart\n1\nmiddle\n2` (= мой собственный python3.12-прогон
   PY.M6_c1.py) → verdict ✓ (objective) → Good предвыбран → POST /api/review →
   `{"grade":"Good","stability":2.3065,"state":"Learning","reps":1,…}`.
3. OBSERVE: due 27→26, c1 ушла из очереди.
4. PERSIST: полный reload — due остаётся 26, c1 отсутствует; прямой запрос в SQLite:
   `855371|PY.M6.generators/c1|2.3065|1|1` — строка в review_state. Эффект реален.
5. 0 ошибок консоли.

## 8. Пересчёт количественных под-заявок

| Заявка builder-а | Пересчитано мной | Вердикт |
|---|---|---|
| Сегменты F2..F6 = 5/4/6/8/6 | harness built 5/4/6/8/6 + `grep id: "s\d"` по файлам | ✓ |
| Карточки 3/3/3/4/4 (+M1 c4) | seedsync: 3/3/3/4/4, M1=4; фронт=seed 21/21 | ✓ |
| «70.11 KB gz» (F1b-времени) | мой build HEAD: 99.03 KB gz — вырос на данные F2–F6, < 200 КБ гейта; guardrail «рост только на данные уроков» правдоподобен (JS-чанк один) | ✓ (с уточнением) |
| «viz-fit 8/8 уроков» (F2-времени) | сейчас 12/12 ALL GREEN | ✓ |
| dotnet 65/65 | 65/65 | ✓ |
| MCQ-fallback ≤25% | 0/21 exec | ✓ |
| «замер 38.4 MB vs 200 Б» | воспроизведён ×2 байт-в-байт | ✓ |

---

## ВЕРДИКТ: ПРИНЯТО-С-ЗАМЕЧАНИЯМИ

(0 БЛОКЕРОВ; для бинарного контракта оркестратора = ПРИНЯТО; замечания — в backlog M3)

## ПРОБЛЕМЫ:
- [МЕЛОЧЬ] Цитата PEP 492 в py-names-objects s1: фрагмент начат с середины предложения
  источника с молчаливой капитализацией («Since, internally, …» → «Internally, …») без
  маркировки. Содержание дословно, банк RS-02 нормализовал так же — но правило волны
  «цитаты дословно» лучше держать буквально: `[I]nternally` или включить «Since,».
- [МЕЛОЧЬ] dis-панели F4 s5 / F5 s8 сокращают аргумент LOAD_CONST до «(multiply)»/
  «(add)» против реального «(<code object multiply at 0x…>)». Для 340px оправдано и
  адрес в уроке запрещён RS-03, но соглашение о сокращении нигде не задекларировано
  (в отличие от честной пометки `*`); одна строка в комменте il[] сняла бы вопрос.
- [МЕЛОЧЬ] multicard-session.mjs гоняет только PY.M1 — механизм очереди lesson-agnostic,
  но 4-карточные F5/F6 в счётчиковом харнессе не представлены.

## ЧТО ПЛОХО:
- Нижняя граница плотности волны — 2-сценные сегменты из чипов почти без кода-движения:
  F5 s7 (refutation «дом ≠ кирпич») и F2 s4 (set-дифф). Концептуально оправданы и
  состояние между кадрами меняется, но на фоне соседних xray/dis-разборов это самые
  «плоские» кадры M2 — при 5 уроках M3 не наращивать их долю.
- Очередь свежего пользователя — уже 27 new-карт разом (6 C# + 21 PY); после M3/M4 будет
  ~35+. FSRS-дозирование отложено на F15 честно, но риск brief-а «очередь дня не
  взрывается» растёт с каждым майлстоуном — замер ДО/ПОСЛЕ в F15 обязателен.
- Margin 4.8px принят на прецеденте+hard-clamp, но builder сам ввёл правило «natural
  >=6px headroom» коммитом e643d40 и сам же его нарушил в тот же день для «add»:
  дисциплина собственных порогов хромает — следующий 3-символьный слот в M3 может
  снова уехать в клэмп.
- `npm run build` печатает предупреждений 0, но бандл 99 KB gz уже на полпути к гейту
  200 KB при 6 из 13 уроков волны — на M4 стоит глянуть, что даёт code-splitting данных
  уроков (не требую: гейт пока с запасом).

## ПРОВЕРКА ДОКАЗАТЕЛЬСТВ (заявления builder-а против моих прогонов):
- «build чисто 70.11→…» → мой build: чисто, 99.03 KB gz ✓
- «viz-fit ALL GREEN 12 уроков, PY покрыты» → мой прогон: подтверждено дословно ✓
- «new-lessons ALL GREEN, assert predict-гейта» → мой прогон: assert есть, зелёный ✓
- «multicard: 1 из 4 → Again → 5 из 5, кап ×1» → мой прогон: подтверждено дословно ✓
- «shell axe AA» → мой прогон: 0 serious/critical ✓
- «dotnet 65/65» → мой прогон: 65/65 ✓
- «переключатель + персист» → мой СОБСТВЕННЫЙ скрипт (не builder-а): подтверждено ✓
- «цитаты дословно, URL фетч-проверены» → 21/21 моим фетчем + 1 case-нюанс PEP 492 ⚠
- «dis-опкоды из реального прогона» → 2 кадра перегнал сам: байт-в-байт ✓
- «память 38.4 MB vs 200 Б замерена» → перемерил сам ×2: байт-в-байт ✓
- «expect = stdout python3.12 ×2» → 4 карточки перегнал сам ×2 + seedsync 21/21 ✓
- «кнопки оценки disabled — предсуществующее, git show 5772ad5» → не перепроверял
  отдельным прогоном (повторный клик не в моём чеклисте); косвенно: 0 двойных
  /api/review во всех моих прогонах ⚠ (принято как не-регрессия)
- «CI HEAD зелёный» → gh run view: SUCCESS ✓

## СОМНЕНИЯ:
- F3 s3 код-панель показывает псевдокод «def f(...): ok» / «def g(**kw, a): SyntaxError»
  — как иллюстрация сигнатуры допустимо (консоль-гейт честно говорит SyntaxError на
  компиляции), но это единственное место волны, где код-панель не является запускаемым
  кодом; G2-риска нет (нет expect на этом), стилистически — на грани.
- F2 s1 «в тесте … O(n²)» — вывод для цикла по n элементов корректен как порядок, но
  каррирует допущение «проверка по такому же n»; формулировка «на n проверках» была бы
  строже. Источник (TimeComplexity) сам утверждение O(n²) не содержит — это композиция.
- Чип-текст в DOM конкатенируется «Python для AQAновый» (лейбл+бейдж) — на скрине
  разделено визуально, но screen-reader прочтёт слитно; axe это не ловит (0 serious),
  на будущее — aria-label или разделитель.

РЕЗЮМЕ: M2 реален и доказан моими прогонами. 5 харнессов + 65 тестов зелёные моим
запуском; переключатель F1b с персистом доказан собственным headless-скриптом; все 6
фиксов M1 закрыты (viz-fit из реестра покрыл PY, assert гейта, честный multicard, s1/s6/
s7, c4); плотность F2–F6 = заявленным 5/4/6/8/6 сегментам с гейтами, лесенками, собес-
блоками и takeaway в каждом, без C#-сравнений; точность — 30 независимых проверок
(21 цитата фетчем, 2 dis-кадра, замер памяти, 4 карточки ×2, UnboundLocalError/gi_frame,
seedsync 21/21) с единственным case-нюансом PEP 492; глазами — 37 кадров builder-а + 4
моих, паспорт вкуса PASS; margin-отклонение 4.8px принято на исполняемом основании
(hard-clamp движка + зелёный Linux-ран HEAD); G1-такт на новом уроке PY.M6 доказан до
строки в SQLite.
