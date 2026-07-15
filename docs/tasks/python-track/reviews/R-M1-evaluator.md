# R-M1 — Вердикт evaluator-а: майлстоун M1 (walking skeleton Python-трека, F1)

Дата: 2026-07-15 · Раунд: 1 · Оценщик: внешний evaluator (свежий контекст, builder-у не верю)
Проверено против: brief.md (ворота G1–G9, G-MT), features.md (F1-приёмка), design.md,
AUTHORING-AI.md §2 (планка плотности), RS-02 (банк источников), RS-03 (чеклист expect).
Метод: ВСЁ перепрогнано моими руками из /Users/admin/Desktop/CodeApp; заявления
builder-а доказательствами не считались. Живой стек: бэк :5080 (health ok, sqlite),
фронт :4173.

---

## 1. Построчный разбор по чеклисту промпта

### 1.1 Сборка и харнессы (мой прогон)

| Проверка | Команда | Результат |
|---|---|---|
| Сборка фронта | `npm run build` | ЧИСТО; JS 261.19 KB → **69.04 KB gz** (< 200 KB гейт продукта) |
| viz-fit | `node verify/viz-fit.mjs` | **ALL GREEN**; AUTHORING-PROOF: 7/7 уроков на `at`, включая PY.M1.names-objects; 0 нарушений FIT/CLIP/OVERLAP/…; 0 ошибок консоли. **НО**: browser-часть (FIT лейблов по getComputedTextLength, CLIP, design-system, mid-transition) гоняется по хардкод-списку 6 C#-уроков (`verify/viz-fit.mjs:42–49`) — PY.M1 покрыт только pure-engine-проверкой. Детали — Проблема №1 |
| new-lessons | `node verify/new-lessons.mjs` | **ALL GREEN**. PY.M1 включён: «PY.M1.names-objects present in home path», 8 сегментов построены, s1 автоплей, все сегменты до финального кадра, бейдж «DIS · БАЙТКОД», python-подсветка (tok>0), typed-ввод реального stdout → verdict ✓ → Good → POST /api/review, **due 7→6**, карточка ушла из очереди; reduced-motion статика; 0 ошибок консоли |
| npm run verify | `npm run verify` | ALL GREEN (typed верный/неверный ответ, Good/Again, re-queue 60s, 0 конс. ошибок) |
| shell | `node verify/shell.mjs` | ALL GREEN; **axe 0 serious/critical**, в т.ч. «axe Lesson (PY.M1.names-objects): 0 serious/critical (18 checks)»; прогресс/калибровка целы (смоук ранее verified экранов — регресса нет) |
| Бэкенд-тесты | `dotnet test …Codex.Backend.Tests.csproj` | **65/65 PASS** (= базлайн, порог шума 0) |

### 1.2 G1 — петля жива (ACT→OBSERVE→PERSIST), мой собственный curl-прогон

Не харнесс builder-а — свой прогон на свежем dev-пользователе 990771:

1. `POST /api/auth {devUserId:990771}` → токен.
2. `GET /api/due` → **count 9**, в очереди `PY.M1.names-objects/c1..c3` как new.
3. ACT: `POST /api/review {"itemId":"PY.M1.names-objects/c1","grade":3,...}` →
   `{"grade":"Good","stability":2.3065,"intervalDays":0.0069,"state":"Learning",...}` — FSRS-состояние создано, learning-step ~10 мин.
4. OBSERVE: `GET /api/due` → **count 8**, c1 ушла из очереди — расписание двигается.
5. PERSIST: прямой запрос в SQLite (`backend/Codex.Backend/codex.db`):
   `SELECT * FROM review_state WHERE user_id=990771;` →
   `990771|PY.M1.names-objects/c1|2.118…|2.3065|2026-07-15T16:51:38…|1|0|…|1|1` —
   строка лежит в базе, эффект реален, не display-only. **G1 PASS.**

Плюс predict-гейт — моя headless-проверка (не скриптовый оптимум: открыл урок,
доскроллил до s4, ждал): автоплей s4 остановился на index 2/5 и **не двигался 9 секунд**
(вопрос «что напечатает print(a)…» виден), клик «Показать шаг» → index 4/5 (финал).
Гейт реально блокирует до resolve. 0 ошибок консоли.

### 1.3 G3 — плотность (app/src/lessons/py-names-objects.ts, прочитан целиком)

**8 сегментов s1–s8** (флагман: требование ≥7 по F1 / ≥6 по G3 — выполнено):

| Сегмент | Сцен | Анимация несёт состояние? | explain + дословная цитата | sources |
|---|---|---|---|---|
| s1 карта хребта §0 | 3 | chips механизмов → рёбра к инструментам AQA (пары decorator→fixture, with→httpx) | да («A function returning another function…») | py-glossary-deco, py-datamodel |
| s2 привязка имени | 3 | объект в куче → перекидка ссылки → второе имя, refs 1→2 | да («Every object has an identity…») | py-datamodel, py-gc |
| s3 mutable/immutable | 4 | мутация list на месте через 2 имени vs новый str-объект + ghost старого | да (дословное определение mutable/immutable) | py-datamodel |
| s4 aliasing | 5, **predict-гейт** | refs 1→2, мутация через b, вывод, identity | да | py-datamodel |
| s5 mutable default | 4, **predict-гейт** | `__defaults__` у объекта-функции копит `[]→['a']→['a','b']` + кадр починки | да (2 цитаты Tutorial+FAQ) | py-defaults, py-faq-defaults |
| s6 refcount+GC | 4 | del имени → refs 2→1→0 → смерть; кольцо → циклический gc | да («the collector supplements…») | py-gc |
| s7 int-кэш | 3 | один объект из кэша −5…256 vs два объекта 257 + гейт-вывод | да (C-API + 2 цитаты PEP 8) | py-int-cache, pep8 |
| s8 dis-кадр | 4 | il-панель синхронна сценам: LOAD_CONST→STORE_NAME x→LOAD_NAME→STORE_NAME y, refs 1→2 | да (2 цитаты dis-доков) | py-dis |

0 «упоминаний вместо анимации»: каждый нюанс показан сценами с новым состоянием кадра.
Плюс hook-мисконцепция с refutation, 3 edge-cases с источниками, 3 takeaway «где
встречаешь в инструментах» (fixtures/conftest/with) — хребет §0 соблюдён (P1).
estMinutes=10 ≤ 12 (флагманский предел G9-прокси). **G3 PASS.**

### 1.4 G-MT — мультитрек

- `grep -rn "Ядро C#" app/src` → 5 совпадений, ВСЕ — кикеры C#-уроков внутри
  `src/lessons/` (value-vs-reference, async-await, boxing, gc, closures). Вне lessons/ = **0**.
- Лейблы из реестра: `lessons/index.ts:43–45` TRACK_GROUPS → `strings.ts:28–30`
  («Фундамент C#», «Python · фундамент» — placeholder из brief-вопроса №3, сабтайтл,
  бейдж «новый трек»). Хардкод убран.
- Подсветка python: harness-assert tok>0 (мой прогон) + глазами на кадрах (def/return/
  f-строки/`#`-комменты окрашены). Бейдж «DIS · БАЙТКОД» — harness-assert + глазами s8.
- Home headless 390: две раздельные секции — глазами (см. 1.6). **G-MT PASS.**

### 1.5 G2 — точность выборкой (риск №1) — 14 независимых проверок, 0 расхождений

**Цитаты — WebFetch первоисточников, сверка дословности (9/9 совпали):**

| # | Цитата в уроке | Источник | Вердикт |
|---|---|---|---|
| 1 | «Every object has an identity, a type and a value.» | datamodel | ДОСЛОВНО |
| 2 | «Objects whose value can change are said to be mutable; objects whose value is unchangeable once they are created are called immutable» | datamodel | ДОСЛОВНО |
| 3 | «The default value is evaluated only once. This makes a difference when the default is a mutable object such as a list…» | tutorial/controlflow | ДОСЛОВНО (обрыв «…» честный: далее «, dictionary, or instances of most classes») |
| 4 | «Default values are created exactly once, when the function is defined.» | faq/programming | ДОСЛОВНО |
| 5 | «the collector supplements the reference counting already used in Python» | library/gc | ДОСЛОВНО (фрагмент предложения) |
| 6 | «CPython keeps an array of integer objects for all integers between -5 and 256» | c-api/long (PyLong_FromLong) | ДОСЛОВНО |
| 7 | «Comparisons to singletons like None should always be done with is or is not, never the equality operators» | PEP 8 | ДОСЛОВНО |
| 8 | «Don't compare boolean values to True or False using ==» | PEP 8 | ДОСЛОВНО |
| 9 | «The dis module supports the analysis of CPython bytecode by disassembling it» + «Bytecode is an implementation detail of the CPython interpreter» | library/dis | ДОСЛОВНО |

**Опкоды s8 — мой независимый прогон** `python3.12 -m dis` (Python 3.12.13) на
`x = 257; y = x`: `0 RESUME 0 · 2 LOAD_CONST 0 (257) · 4 STORE_NAME 0 (x) ·
6 LOAD_NAME 0 (x) · 8 STORE_NAME 1 (y) · 10 RETURN_CONST 1 (None)` — офсеты, опкоды и
аргументы **байт-в-байт** совпадают с `il[]` урока. Совпадает и с evidence/F1/dis-s8.txt.

**int-кэш s7 — мой прогон**: `int("256") is int("256")` → True; `int("257") is int("257")`
→ False — ровно как в сегменте; литеральный `257 is 257` в уроке НЕ утверждается
(соответствует запрету RS-03).

**Карточки c1–c3 (G-EXEC-PY + чеклист RS-03) — мой прогон ×2** файлов
`evidence/py-cards/PY.M1_c{1,2,3}.py` через python3.12.13:
- c1 `['a']\n['a', 'b']` · c2 `[1, 2, 3, 4]\nTrue` · c3 `(1, [2, 3, 4])` — stdout
  **== verify.expect фронта байт-в-байт**, оба прогона идентичны, stderr пуст.
- Seed синхронен: `backend/…/seed/lessons/PY.M1.names-objects.json` cards c1–c3,
  `expectedOutput` == expect фронта (id/card.id контракт цел).
- Чеклист RS-03: (1) детерминизм ×2 файлом ✓; (2) stdout-only, stderr пуст ✓; (3) без
  set/dict-порядка ✓; (4) без таймингов/id()/адресов ✓; (5) `is` в c2 — на одном list-объекте
  через `b = a`, гарантия языка, не рантайм-int/str ✓; (6) без текста traceback ✓;
  (7) python3.12 + лог в evidence (census-log.txt: 3.12.13, ×2, stderr раздельно) ✓.
- MCQ-fallback: 0/3 карточек (все с expect) ≤ 25% ✓. **G2/G2a на выборке M1 PASS.**

### 1.6 Глазами — evidence/F1/*.png (23 файла) + паспорт вкуса

- **390-home-full.png / 390-home-python-section.png**: две РАЗДЕЛЬНЫЕ секции —
  «ФУНДАМЕНТ C#» (6 уроков) и «PYTHON · ФУНДАМЕНТ» с бейджем «НОВЫЙ ТРЕК» и сабтайтлом
  «6 механизмов, из которых сделаны твои инструменты»; иерархия ясная, читаемость
  хорошая; cream `#F6F1E9` фон, белые карточки, coral CTA «Начать с value-типов»,
  line-SVG иконки (не эмодзи), Rubik-заголовки. Соответствует победителю турнира A1+грефты.
- **Кадры s1–s8 (autoplay+final, 16 снимков)**: не пустые, каждый кадр несёт состояние;
  лейблы в боксах не режутся (сверил глазами все финалы); зоны «ИМЕНА / frame · только
  ссылки» и «ОБЪЕКТЫ / куча CPython» читаемы; refs-чипы с coral-акцентом при изменении
  (гarantирован грефт B3). s4-autoplay остановлен ДО раскрытия (гейт), s4-final — после.
- **s8-final**: signature-элемент — тёмная dis-панель с бейджем «DIS · БАЙТКОД», подсветка
  активного опкода STORE_NAME синхронна сцене — фирменная ось ставки существует и заметна.
- **390-card-before/after.png**: typed-ввод («НАПЕЧАТАЙ ВЫВОД», моно-поле), после —
  «✓ верно», +10 XP, предвыбран «Хорошо» — фидбек событий различим.
- **Анти-слоп**: без золота/тёмного кино/Inter; тон сеньорский; streak-shaming нет.

**Паспорт вкуса: PASS** (доказательства: evidence/F1/390-home-full.png,
390-seg-s8-final.png — токены cream/coral, Rubik/Onest/JetBrains Mono, радиусы, line-SVG,
signature dis-панель заметна; сверено соседство с эталоном boxing по 390-seg-* кадрам —
та же плотность подачи кадра: код-панель + зоны + подпись механизма).

### 1.7 Пересчёт количественных под-заявок

| Заявка builder-а | Пересчитано | Вердикт |
|---|---|---|
| «8 сегментов» | 8 (s1–s8 в файле; harness built 8) | ✓ |
| «3 карточки c1–c3» | 3 на фронте + 3 в seed, id совпали | ✓ |
| «JS 69.04 KB gz» | 69.04 KB gz (мой build) | ✓ |
| «due 7→6» | у моего пользователя 9→8 (7 C#-карт уже new + 3 PY − разница сценариев харнесса); харнесс-прогон мой: 7→6 | ✓ |
| «65/65 dotnet» | 65/65 | ✓ |
| «grep „Ядро C#“ вне lessons = 0» | 0 | ✓ |
| «турниры проведены» | .spikes/tournament/VERDICT.md: A1/B1, парные сравнения в обоих порядках, грефты перечислены | ✓ |

---

## ВЕРДИКТ: ПРИНЯТО-С-ЗАМЕЧАНИЯМИ

(по грамматике review-verdict: 0 БЛОКЕРОВ, 1 СУЩЕСТВЕННОЕ + мелочи → не дотягивает до
ДОРАБОТАТЬ; для бинарного контракта оркестратора = ПРИНЯТО, замечания — в backlog M2)

## ПРОБЛЕМЫ:
- [СУЩЕСТВЕННОЕ] `app/verify/viz-fit.mjs:42–49`: browser-часть харнесса (label-FIT по
  getComputedTextLength, CLIP, design-system, mid-transition overlap) гоняется по
  ХАРДКОД-списку из 6 C#-уроков — PY.M1 покрыт только pure-engine AUTHORING-PROOF
  (in-zone/overlap/row/snap) — нарушено обещание design.md «viz-fit (авто по реестру)»
  и это единственный измерительный инструмент G4 для «лейблы не режутся» на волну из
  13 уроков. Сейчас компенсировано (engine бросает ошибку авторинга при переполнении;
  new-lessons рендерит PY.M1 без ошибок; мои глаза на 16 кадрах — 0 обрезаний), но с
  M2 это слепая зона на 12 уроков. Фикс: генерировать LESSONS из реестра (как уже
  делает AUTHORING-PROOF) до сдачи M2.
- [МЕЛОЧЬ] features.md F1: «predict-гейт s4 блокирует до resolve — проверено headless»
  атрибутировано прогону `verify/new-lessons.mjs`, но в харнессе НЕТ такого assert-а
  (грепнул: гейт нигде не ассертится; `_py-track-shots.mjs` лишь снимает кадр «до»).
  Факт ИСТИНЕН — доказан моим собственным headless-прогоном (s4 стоит на 2/5 ≥9с,
  resolve → 4/5), но привязка доказательства к харнессу неточна. Фикс: добавить assert
  гейта в new-lessons (заодно закроет гейт-проверку для будущих уроков волны).

## ЧТО ПЛОХО:
- **Опыт/петля**: карточная фаза M1 — только 3× predict-output; лесенки
  predict→modify→explain (G9 lead-прокси «лесенка у 100% механизм-уроков», AUTHORING-AI §3.4)
  у флагмана нет. Отклонение задокументировано («решение на чекпойнте M1»), но именно
  первый урок задаёт образец для 10 следующих механизм-уроков — если чекпойнт пропустит,
  прокси-гейт G9 станет невыполним задним числом. От boxing-эталона это M1 и отделяет:
  там глубина закрепляется многоступенчатой карточной фазой.
- s1 «карта трека» — самый слабый сегмент по плотности: три сцены почти статичной сетки
  chips, между кадрами меняются только акценты и 2 ребра; на фоне s2–s8 (где каждый кадр —
  новое состояние памяти) выглядит оглавлением. Допустимо как вводная карта хребта §0,
  но это нижняя граница планки «каждый кадр несёт новое состояние».
- s7: в кадре 390-seg-s7-final видно, что код-панель проскроллена и первая строка
  частично срезана краем панели (артефакт скролла к активной строке, не clip лейбла);
  на 340px-вьюпорте 2-строчные сегменты лучше не скроллить вовсе.
- Сводка viz-fit до сих пор печатает «across all 6 lessons» — косметика, но вводит в
  заблуждение читателя лога (уроков уже 7).

## ПРОВЕРКА ДОКАЗАТЕЛЬСТВ:
- «npm run build чисто, 69.04 KB gz» → мой build: чисто, 69.04 KB gz ✓
- «viz-fit ALL GREEN (96 сцен)» → мой прогон: ALL GREEN, но 96 сцен = только C#-уроки;
  PY.M1 в browser-части НЕ участвует (см. СУЩЕСТВЕННОЕ) — заявление верно буквально,
  вводит в заблуждение по охвату ⚠
- «new-lessons ALL GREEN: PY.M1 8 сегментов, typed → Good → due 7→6» → мой прогон:
  подтверждено дословно ✓
- «predict-гейт s4 блокирует — проверено headless» → в харнессе assert-а нет; проверил
  сам headless — гейт блокирует ✓ (доказательство моё, не builder-а) ⚠
- «shell ALL GREEN (axe AA)» → мой прогон: 0 serious/critical, включая PY-урок ✓
- «dotnet 65/65» → мой прогон: 65/65 ✓
- «census: expect = stdout python3.12 ×2, stderr пуст» → перегнал сам ×2: байт-в-байт ✓
- «dis-опкоды s8 из реального прогона» → перегнал сам `python3.12 -m dis`: байт-в-байт ✓
- «цитаты дословны из банка RS-02» → 9 цитат сверил WebFetch-ем: 9/9 дословны ✓
- «grep „Ядро C#“ вне lessons = 0» → перегнал: 0 ✓
- «турниры до сдачи F1 проведены» → VERDICT.md существует, парные сравнения в обоих
  порядках описаны, грефты видны в продукте (сабтайтл секции, бейдж, refs-чип) ✓

## СОМНЕНИЯ:
- s6: формулировка «CPython освобождает объект немедленно и детерминированно» при
  refcount=0 — прозе соответствует поведение CPython (datamodel: «collected as soon as
  they become unreachable» — implementation detail), но слово «детерминированно» на
  границе: для волны стоит держать канон «сразу при нуле ссылок; это деталь CPython»,
  чтобы не породить misconception про гарантию спеки языка.
- «Фундамент C#» как лейбл секции — brief просил варианты лейблов показать пользователю
  на чекпойнте M1 (открытый вопрос №3); placeholder «Python · фундамент» соответствует
  brief-у, но подтверждение пользователем ещё впереди — не забыть на гейте.
- Due-очередь нового пользователя = 9 карт разом (7 C# + видимо 2… у меня 9 new сразу):
  FSRS-дозирование new-карт (риск brief-а «очередь дня не взрывается») отложено на F15 —
  на M1 не мерил, но при сиде ещё 10 уроков × 3–6 карт это станет ощутимо.

РЕЗЮМЕ: Скелет реален и доказан моими прогонами: сборка/5 харнессов/65 тестов зелёные,
петля ACT→OBSERVE→PERSIST подтверждена собственным curl-ом до строки в SQLite,
плотность флагмана (8 анимированных разборов + dis-кадр) на планке, 14 проверок точности
(цитаты/опкоды/карточки) — 0 расхождений, мультитрек-home и signature-панель dis — глазами.
Одно существенное замечание — viz-fit browser-часть не расширена на PY-уроки (слепая
зона G4 на остальную волну) — обязательно закрыть в M2 вместе с assert-ом predict-гейта.
