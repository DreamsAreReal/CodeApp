# Фиче-лист — Python-трек, волна 1

North Star: сеньор каждый день заходит в Mini App и глубоко, с анимациями, рефрешит
Python-фундамент своей AQA-подготовки; собес-вопрос → ответ, обоснованный механизмом.

## Дисциплина статусов
- Каждая фича рождается `todo`. Порядок священен: F1 — walking skeleton.
- `self-pass` ставит builder — только с доказательством (команда → вывод / скриншоты
  `docs/tasks/python-track/evidence/F<N>/`).
- `verified` проставляет ОРКЕСТРАТОР по вердикту evaluator-а.
- `cut` — только целиком по протоколу; «частично работает» запрещено.
- Смоук новой builder-сессии: build + viz-fit + открытие F1-урока headless (≤5 проверок).
- Общая приёмка КАЖДОГО урока (не повторяется в фичах, действует всюду): (а) segments
  только `at`, viz-fit GREEN; (б) каждый claim с источником из банка RS-02, цитаты EN
  дословно; (в) собес-блок md отражён в misconceptions/okText; (г) takeaway «где
  встречаешь в инструментах»; (д) карточки по чеклисту RS-03, expect = stdout python3.12
  ×2 (лог census); (е) БЕЗ сравнений с C#; (ж) seed синхронен фронту (id/card.id);
  (з) 0 ошибок консоли; (и) estMinutes проставлен, лесенка predict→modify→explain —
  для МЕХАНИЗМ-уроков F1–F11; шпаргалки F12/F13 — исключение (колода predict-output
  без обязательных modify/explain; зафиксировано с согласия ADR-0002 lead-прокси:
  «лесенка у 100% механизм-уроков»).

## Фичи

### F1 — Walking skeleton: мультитрек-UI + флагман py-names-objects [M1] [золотой путь]
Зачем: разделы C#/Python врозь (гейт) + первый полный такт петли с signature («невидимое»).
Что: TRACK_GROUPS + группировка home на 2 секции (хардкоды «Ядро C#» убраны), lang-подсветка
python в hlcode, бейдж `dis · байткод`, урок PY.M1.names-objects (≥7 сегм: карта хребта §0,
имена→объекты, mutable/immutable, mutable default, aliasing, refcount+GC, int("257")-кэш,
dis-кадр) + seed + 3 карточки (по D-3 RS-01: c01–c03). Турниры (3 варианта секции home /
3 варианта signature-кадра) проведены до сдачи, победители интегрированы.
Приёмка:
- [x] home headless 390: две раздельные секции с лейблами, grep «Ядро C#» по src = 0
      (скрины evidence/F1/390-home-full.png, 390-home-python-section.png; `grep -rn "Ядро C#" app/src`
      → только кикеры 5 C#-уроков, вне lessons/ = 0)
- [x] урок играет end-to-end: сегменты анимируются, карточка (ввод stdout) двигает /api/review
      (`node verify/new-lessons.mjs` → ALL GREEN: PY.M1 8 сегментов до финального кадра, typed-ввод
      `['a']\n['a', 'b']` → verdict ✓ → Good → /api/review, due 7→6; predict-гейт s4 блокирует до
      resolve — проверено headless)
- [x] python-код подсвечен (keywords/#-комменты/f-строки), dis-панель с бейджем байткода
      (harness-assert «DIS · БАЙТКОД» + tok-ty>0; скрины 390-seg-s2-final.png, 390-seg-s8-final.png)
Проверка: `npm run build` чисто (JS 69.04 KB gz < 200), `node verify/viz-fit.mjs` ALL GREEN (96 сцен),
`npm run verify` ALL GREEN, `node verify/shell.mjs` ALL GREEN (axe AA), `dotnet test` 65/65 PASS;
G-EXEC-PY: evidence/py-cards/census-log.txt (python3.12.13, ×2, stderr пуст); dis-опкоды s8 из
реального прогона (evidence/F1/dis-s8.txt); int-кэш s7 (evidence/F1/int-cache-s7.txt).
Турниры: победители A1+грефты (две секции, сабтайтл, бейдж) и B1+грефты (dis-панель + refs-чип
с coral-вспышкой) интегрированы (.spikes/tournament/VERDICT.md).
Отклонение (задокументировано): карточки = ровно c1–c3 predict-output по D-3 RS-01 (контракт F1);
лесенка modify/explain для M1 не добавлялась — решение оркестратора: c4 (modify-предикт) в такте M2.
Статус: verified (R-M1-evaluator.md: ПРИНЯТО; G1 доказан curl+SQLite оценщика: due 9→8, review_state
persisted; G2 выборка 14 проверок 0 расхождений; G3 8/8 сегментов анимированы; глазами 23 PNG)

### F1b — Переключатель треков на home + фиксы M1 [M2]
Зачем: решение пользователя на чекпойнте M1 («в одну кучу не кидай, сделай переключатель —
уроков будет дохуя»); масштабируемость на N треков.
Что: чипы-переключатель треков над лентой (актив — коралл, скролл при N>3), лента одного
трека, выбор персистится, hero/due — глобальные; лейблы «Фундамент C#» / «Python для AQA».
+ фиксы M1: viz-fit browser-список из реестра; assert predict-гейта в new-lessons;
sessionQueue multicard-счётчик честный; кнопки оценки после выставления; s1 плотность,
s7 подрезка, устаревший принт viz-fit; карточка c4 (modify-предикт) в PY.M1.
Приёмка:
- [x] home 390: переключатель работает (скрины evidence/F1b/390-switcher-{csharp,python}.png),
      выбор переживает перезагрузку (390-switcher-python-after-reload.png; __home.activeTrack:
      csharp → python → python после reload → csharp после открытия C#-урока — лог _f1b-shots)
- [x] все фиксы M1 доказаны:
      a) viz-fit browser-список из реестра (`LESSONS = LESSON_DATA.map(...)`), принт «all 6»
         убран; прогон ПОКРЫЛ PY.M1 и ВСКРЫЛ 3 реальных ROW-BASELINE-нарушения (s2/s4/s8,
         Δ6px слот↔объект) → починены структурно (refs-чип → typeTag объекта, паттерн
         boxing/closures) → `node verify/viz-fit.mjs` ALL GREEN;
      b) assert predict-гейта в new-lessons.mjs (блокирует / показывает вопрос / resolve
         разблокирует) → `node verify/new-lessons.mjs` ALL GREEN;
      c) sessionQueue multicard: причина «1 из 3 → 2 из 2» = прерывание сессии + перезаход
         (новая сессия из остатка). Очередь сделана честной: Again-карта ре-энкьюится в ТУ ЖЕ
         сессию (обещание AUTHORING-AI §3, кап ×1 на карту — без вечного цикла), M растёт
         честно, «Завершить сессию» только на истинно последней карте → новый харнесс
         `node verify/multicard-session.mjs` ALL GREEN (1 из 4 → Again → 1 из 5 → … → 5 из 5);
      d) кнопки оценки/уверенности ПОСЛЕ оценки: функционально disabled (headless-прогон:
         gradeDisabled=[true×4], повторный клик не шлёт второй /api/review) и предсуществующее
         (git show 5772ad5 = тот же код до волны) → НЕ трогал, строка в progress.md;
      e) s1: +4-й кадр (межмеханизменные связи, цитата PEP 492) — скрин 390-seg-s1-final.png;
         s7-подрезка: hairline-шов .lbar + скролл-оффсет в скрин-скриптах — 390-s7-under-bar-seam.png;
      f) s6 «немедленно и детерминированно» → «деталь реализации CPython, не гарантия
         спецификации» (caption + explain + edgeCase + title) — скрин 390-seg-s6-final.png;
      g) карточка c4 (modify-ступень: починенный дефолт из s5) + seed; expect `['a']\n['b']` =
         stdout python3.12 ×2 (census-log.txt, stderr пуст; чеклист RS-03 соблюдён)
- [x] харнессы ALL GREEN на финальном билде: build чисто (70.11 KB gz < 200), viz-fit,
      npm run verify, new-lessons, shell (axe AA), loop, multicard-session; dotnet test 65/65
Проверка: harness-набор + скрины evidence/F1b/
Статус: verified (R-M2-evaluator: ПРИНЯТО; переключатель доказан headless-прогоном оценщика: чипы/лента одного трека/персист через reload/last-opened-wins; multicard-session честный)

### F2 — Урок py-collections-hash [M2]
Зачем: dict/set = хребет тестовых данных; собес-классика O(1)/hashable.
Что: PY.M2: list vs tuple vs set vs dict (выбор структуры), hashable-ключи (TypeError
list-ключа — спайк c22), устройство dict (buckets/chain-примитивы), insertion order 3.7+.
Приёмка:
- [x] 5 сегментов с buckets-виз (скан vs hash-прыжок, hash-гейты, set-дифф, порядок dict);
      карточки c1 (c22: `TypeError\nok`), c2 modify (tuple(lst)-ключ: `ok\nTrue`),
      c3 (insertion order: `['b', 'a', 'c']`) — все exec, python3.12 ×2 в census-log.txt
- [x] общая приёмка: A-6 вплетена («в среднем O(1), worst O(n)»), цитаты RS-02 C-3 дословно,
      собес-блок mayflower → misconception, только `at`, seed синхронен, 0 ошибок консоли
- [x] харнессы: viz-fit ALL GREEN (8/8 уроков) · new-lessons ALL GREEN (PY-COLL) ·
      verify/shell/loop/multicard ALL GREEN · dotnet test 65/65; скрины evidence/F2/
Проверка: viz-fit + new-lessons(PY) + census-лог
Статус: verified (R-M2-evaluator: ПРИНЯТО; 5 сегм, цитаты дословны против живых URL, карточки stdout==expect ×2)

### F3 — Урок py-args-unpacking [M2]
Зачем: *args/**kwargs — везде в фикстурах/декораторах; пререквизит decorators.
Что: PY.M3: позиционные/именованные, *args/**kwargs, распаковка вызова, порядок параметров,
mutable default (кросс-ссылка на M1 внутри трека).
Приёмка:
- [x] 4 сегмента (упаковка в tuple/dict; find_element(*locator); порядок сигнатуры с
      SyntaxError-гейтом; first,*rest = list по PEP 3132); mutable default — edgeCase-кросс
- [x] карточки: c1 predict (`1 (2, 3) {'x': 4}`), c2 modify (тот же вызов через */**),
      c3 predict (`1\n[2, 3, 4]`) — все exec, python3.12 ×2 в census-log.txt
- [x] общая приёмка: цитаты дословно (Tutorial controlflow + PEP 3132, URL фетч-проверены),
      Q3-мисконцепция (*locator ≠ магия Selenium), только `at`, seed синхронен, 0 конс. ошибок;
      харнессы viz-fit/new-lessons/verify/shell/loop/multicard ALL GREEN, dotnet 65/65;
      скрины evidence/F3/
Проверка: harness-набор
Статус: verified (R-M2-evaluator: ПРИНЯТО; 4 сегм; примечание: s3 псевдокод — единственный, G2-риска нет)

### F4 — Урок py-closures-scope [M2] [золотой путь]
Зачем: замыкания = основа декораторов/фикстур; собес-ловушка late binding.
Что: PY.M4: LEGB, global/UnboundLocalError (фикс md A-1), nonlocal, cells/__closure__
(невидимое), late binding в цикле [2,2,2]→[0,1,2] (спайк c20).
Приёмка:
- [x] 6 сегментов: LEGB-цепочка · компилятор красит имена (A-1/B-12: UnboundLocalError,
      реальный текст 3.12 — spikes/f4_unboundlocal.py) · nonlocal · фабрики с разными cells ·
      РЕНТГЕН __closure__ (xray-зона, грефт B2 из VERDICT) + dis-кадр MAKE_CELL/LOAD_CLOSURE/
      MAKE_FUNCTION(closure)/LOAD_DEREF (реальный прогон — spikes/f4_dis_closure.txt) ·
      late binding с predict-гейтом
- [x] карточки: c1 late-binding `[2, 2, 2]\n[0, 1, 2]` (predict+modify в одной), c2 nonlocal
      `1 2 3`, c3 фабрики `10 15` — все exec, python3.12 ×2 в census-log.txt
- [x] общая приёмка: цитаты C-4 банка дословно, мисконцепция «10 10», только `at`, seed
      синхронен, 0 конс. ошибок; харнессы ALL GREEN (viz-fit после фикса MID-OVL s1 —
      константные лейблы чипов), dotnet 65/65; скрины evidence/F4/
Проверка: harness-набор
Статус: verified (R-M2-evaluator: ПРИНЯТО; 6 сегм, dis s5 сверен python3.12 -m dis байт-в-байт, рентген __closure__)

### F5 — Урок py-decorators [M2] [золотой путь]
Зачем: «декоратор — это pytest»: @fixture/@parametrize/@allure.step; ядро собес-флоу.
Что: PY.M5 (флагман ≥6): функция-объект, def-time исполнение (c06), слои/порядок (c04),
потеря имени → functools.wraps (c05), параметризованный декоратор (фабрика), связка
@pytest.fixture; dis/байткод-кадр MAKE_FUNCTION/ячейки.
Приёмка:
- [x] 8 сегментов: @ = перепривязка имени (A-9 «roughly equivalent») · def-time с
      predict-гейтом · порядок wrapper-а · стек снизу вверх (композит C-5.1) · фабрика
      @repeat(3) с xray-замыканием («это и есть @fixture(scope=…)») · wraps ·
      refutation «декоратор ≠ фикстура» (ecommpay, дом ≠ кирпич) · dis-кадр
      LOAD_NAME/MAKE_FUNCTION/CALL/STORE_NAME + MAKE_CELL (реальный прогон —
      spikes/f5_dis_decorator.txt)
- [x] карточки лесенкой: c1 predict (before/after/5), c2 predict (wrapper), c3 MODIFY
      (return убран → None), c4 predict def-time (decorating foo/done) — все exec,
      python3.12 ×2 в census-log.txt
- [x] общая приёмка: цитаты C-5 банка дословно (композит помечен COMPOSITE-QUOTES),
      только `at`, fit-margins чисто (кроме slot-имени «add» 4.8 — прецедент C#), seed
      синхронен, 0 конс. ошибок; харнессы ALL GREEN, dotnet 65/65; скрины evidence/F5/
Проверка: harness-набор
Статус: verified (R-M2-evaluator: ПРИНЯТО; 8 сегм, dis s8 сверен; margin 4.8px принят по hard-clamp+зелёному Linux CI)

### F6 — Урок py-generators [M2]
Зачем: yield = setup/teardown фикстур; «пауза кадра» — невидимое ядро.
Что: PY.M6: ленивость (c08), замороженный кадр gi_frame (спайк RS-02), исчерпание (c09),
StopIteration (c10), фикстура yield-паттерном, genexpr vs list (память — замер python3.12).
Приёмка:
- [x] 6 сегментов: ленивый старт (GEN_CREATED) · рентген gi_frame (xray-зона: f_locals
      {'n': 41}, IP; спайк f6_gi_frame_out.txt ×2) · StopIteration с predict-гейтом ·
      yield-фикстура (teardown гаснет при return; GeneratorExit-киккер A-3) · память
      ЗАМЕРЕНА: список 1M ≈ 38.4 MB vs genexpr 200 Б (f6_genexpr_memory_out.txt ×2,
      «~30 MB» из md НЕ цитируется — A-5) · одноразовость с predict-гейтом
- [x] карточки: c1 predict (created/start/1/middle/2), c2 predict (5\n0), c3 predict
      (1\nStopIteration), c4 MODIFY (материализация: 5\n5) — все exec, ×2 в census-log.txt
- [x] общая приёмка: ★-цитата C-6 дословно, только `at` (фикс: gate s4 переехал в test-band —
      zone-overflow пойман viz-fit), fit-margins чисто, seed синхронен, 0 конс. ошибок;
      харнессы ALL GREEN, dotnet 65/65; скрины evidence/F6/
Проверка: harness-набор
Статус: verified (R-M2-evaluator: ПРИНЯТО; 6 сегм, замер 38.4MB vs 200Б воспроизведён оценщиком ×2; G1 такт: due 27→26, SQLite persisted)

### F7 — Урок py-context-managers [M3]
Зачем: with = httpx.Client/testcontainers/allure.step; teardown-гарантии.
Что: PY.M7: протокол __enter__/__exit__ (c11), подавление исключений возвратом True,
@contextlib.contextmanager (c14 — мост от генераторов), with vs try/finally.
Приёмка:
- [x] 5 сегментов, gate-примитив для exit-решения есть (s2: return True ok-gate «подавлено» /
      return False fail-gate «reraised»; s4: fail-gate «elapsed не напечатан» → ok-gate «finally»):
      s1 протокол enter/exit · s2 подавление (predict-гейт) · s3 @contextmanager (мост от PY.M6,
      пауза кадра) · s4 ловушка «yield без try/finally теряет teardown» (predict-гейт; спайк
      evidence/spikes/f7_cm_no_finally_out.txt ×2) · s5 with vs try/finally (PEP 343)
- [x] карточки лесенкой 4 exec: c1 predict (подавление: `enter\nbody\nexit\nafter`), c2 MODIFY
      (False → `enter\nbody\nexit\nValueError`), c3 predict (`setup\n42\nteardown`), c4 MODIFY
      (raise без finally → `setup\nValueError`) — все python3.12.13 ×2, stdout==expect
      байт-в-байт, stderr пуст (census-log.txt перегнан 2026-07-16, front==seed==census
      проверено скриптом)
- [x] общая приёмка: только `at`; 6 EN-цитат перепроверены фетчем живых страниц (compound_stmts
      ×2, contextlib ×3, PEP 343) — дословны; собес-блок «зачем with, если try/finally» →
      misconception-hook; takeaway «httpx.Client/testcontainers/allure.step/pytest.raises»;
      без C#; seed синхронен; 0 ошибок консоли; estMinutes 7; headroom: худший лейбл M7 = 6.8px ≥ 6
Проверка: build чисто (104.57 KB gz < 200) · viz-fit ALL GREEN (221 сцена, 13 уроков) ·
npm run verify ALL GREEN · new-lessons ALL GREEN (PY.M7 5 сегм + reduced-motion) ·
multicard-session ALL GREEN · shell ALL GREEN · dotnet 65/65; скрины evidence/F7/ (13 PNG,
смотрел глазами). Попутный фикс: PY.M6 s5 лейбл «200 байт» natural margin −0.4px → «200 Б»
(margin 7) — профилактика Linux FIT по канону волны.
Статус: verified (R-M3-evaluator: ПРИНЯТО; 5 сегм; цитаты дословны живым фетчем; карточки front==seed==stdout)

### F8 — Урок py-object-model [M3]
Зачем: POM/BasePage; собес: MRO, classmethod/staticmethod, property.
Что: PY.M8 (≥6): класс/инстанс-атрибуты (shadowing c15), MRO C3 (c16), дескрипторы →
bound method (невидимое, B-5), property, name mangling (c17), classmethod vs staticmethod;
полиморфизм-пример md ИСПРАВЛЕН (A-2).
Приёмка:
- [x] 8 сегментов (≥6): s1 атрибуты = два словаря (чтение цепочкой, спайк f8_lookup ×2) ·
      s2 shadowing c15 с predict-гейтом (`5 0 0`) · s3 MRO C3 c16 (chips D→B→C→A, gate «стоп
      на первом», `D.__mro__`) · s4 super() → следующий по MRO, в diamond — sibling (A-7 фикс;
      спайк f8_super_mro ×2: `D->B->C->A`) · s5 дескрипторы → bound method (B-5, xray-зона
      «РЕНТГЕН · __get__», спайк f8_descriptor ×2: function→method) · s6 property = тот же
      протокол с гейтом setter (f8_property ×2: 100/250/ValueError) · s7 classmethod vs
      staticmethod (f8_cls_static ×2) · s8 mangling c17 с predict-гейтом (1/AttributeError);
      полиморфизм-пример md ИСПРАВЛЕН (A-2) в misconception-hook (f8_polymorphism_fixed ×2:
      12.56/12)
- [x] карточки лесенкой 4 exec: c1 predict shadowing (`5 0 0`), c2 MODIFY (запись через класс →
      `2 2 2`), c3 predict MRO (`B` + список __mro__), c4 predict mangling (`1\nAttributeError`) —
      python3.12.13 ×2, stdout==expect байт-в-байт, stderr пуст, front==seed==census скриптом
- [x] общая приёмка: только `at`; 6 EN-цитат (tutorial/classes ×3, mro-howto, descriptor-howto,
      library/functions ×3) перепроверены фетчем — дословны; собес-блоки mayflower
      (полиморфизм-hook + classmethod/staticmethod s7); takeaway «BasePage/mixins по MRO,
      фабрики from_env, property-инварианты»; без C#; seed синхронен; 0 ошибок консоли;
      estMinutes 10; headroom: худший лейбл M8 = 6.9px ≥ 6
Проверка: build чисто (112.4 KB gz < 200) · viz-fit ALL GREEN (245 сцен, 14 уроков) ·
new-lessons ALL GREEN (PY.M8: 8 сегм, autoplay s1, reduced-motion) · npm run verify ALL GREEN ·
multicard-session ALL GREEN · shell ALL GREEN · dotnet 65/65; скрины evidence/F8/ (19 PNG,
смотрел глазами; счётчик исправлен по пересчёту M3-evaluator-а)
Статус: verified (R-M3-evaluator: ПРИНЯТО; 8 сегм; MRO/super-sibling прогнан python3.12 оценщика; примечание: PNG-счётчик 13→факт 19)

### F9 — Урок py-exceptions [M3]
Зачем: try/except в каждом тесте; собес: иерархия, finally-gotcha.
Что: PY.M9: иерархия ОТ OSError (фикс md A-3), except-порядок, else/finally (c13),
finally-return глотает исключение (c12), raise from, pytest.raises-связка.
Приёмка:
- [x] 5 сегментов, gate-примитив = перехват (s1: ok-gate «except OSError · ловит подклассы»
      принимает FileNotFoundError И ConnectionError; s2: ok-gate «первый · совпал» +
      мёртвая точная ветка; s4: fail-gate «return в finally · исключение стёрто»):
      s1 дерево от OSError (A-3 фикс; спайк f9_hierarchy ×2: __mro__ обоих через OSError) ·
      s2 first-match порядок с predict-гейтом (f9_except_order ×2: `A`) · s3 else/finally
      оба пути (f9_flow_paths ×2: else/finally + err2/finally2) · s4 finally-return
      с predict-гейтом (f9_finally_swallow ×2: done + from finally) · s5 raise from /
      __cause__ (f9_raise_from ×2: RuntimeError/ValueError)
- [x] карточка finally-return: c1 predict (`done`) + c2 MODIFY (finally починен →
      `cleanup\nValueError`); ещё c3 else/finally (`else\nfinally`), c4 порядок+иерархия
      (`os: ConnectionError`) — 4 exec, имена исключений только через type(e).__name__,
      python3.12.13 ×2, stdout==expect байт-в-байт, stderr пуст (census-log.txt 33 карты)
- [x] общая приёмка: только `at`; 10 EN-цитат перепроверены фетчем живых страниц
      (compound_stmts try ×4, exceptions ×4, simple_stmts raise ×3, PEP 765 ×2 — дословно);
      собес-блок md §11 (finally-return) → misconception-hook; takeaway
      «pytest.raises(match)/retry по OSError/raise from в обёртках API»; без C#;
      seed синхронен; 0 ошибок консоли; estMinutes 7; _fit-margins: у PY.M9 ни одного
      лейбла с natural margin <10 (после фикса: gate не делит grid-колонку с чипами)
Проверка: build чисто (117.73 KB gz < 200) · viz-fit ALL GREEN (260 сцен, 15 уроков) ·
new-lessons ALL GREEN (PY.M9: 5 сегм + reduced-motion) · npm run verify ALL GREEN ·
multicard-session ALL GREEN · shell ALL GREEN · dotnet 65/65; скрины evidence/F9/ (13 PNG,
смотрел глазами)
Статус: verified (R-M3-evaluator: ПРИНЯТО; 5 сегм; иерархия от OSError сверена с живой docs-страницей и __mro__; G1 такт: due 43→42, SQLite persisted)

### F10 — Урок py-type-hints [M3]
Зачем: hints → Pydantic-контракты API-тестов.
Что: PY.M10: hints ≠ принуждение (c18), __annotations__ (r2_c28), Optional/Union и
PEP 604 «3.10+» (RS-03: без exec-ловушек на 3.9), Pydantic-preview (валидация = рантайм).
Приёмка:
- [x] 4 сегмента: s1 гейта нет (c18: add("a","b") → ab; ok-gate «проверки типов нет»,
      спайк f10_hints_runtime ×2) · s2 РЕНТГЕН __annotations__ (xray-зона: dict на объекте
      функции; f10_annotations ×2) · s3 PEP 604 «синтаксис 3.10+» БЕЗ версии-ловушки
      (RS-03; невидимое: type(int | None).__name__ → UnionType; predict-гейт «label(0):
      default или found?»; f10_pep604 ×2) · s4 Pydantic-гейт (predict-гейт коэрции;
      ok-gate «приведено: 1 (int)» / fail-gate «ValidationError»; спайк f10_pydantic ×2
      в authoring-venv python 3.12.13 + pydantic 2.13.4 — версии в out-логе)
- [x] карточка __annotations__: c2 (r2_c28: `int\nstr`); лесенка: c1 predict (`ab`),
      c3 MODIFY (isinstance-гейт руками → `5\nTypeError` — «Pydantic делает это системно»),
      c4 predict PEP604+is None (`default\nfound`) — 4 exec, python3.12.13 ×2,
      stdout==expect байт-в-байт, stderr пуст (census-log.txt 37 карт)
- [x] общая приёмка: только `at`; 8 EN-цитат перепроверены фетчем (PEP 484 ×2, typing ×3,
      PEP 604, pydantic.dev ×2 — дословно); собес-блок md §10 («хинты = проверка») →
      misconception-hook; takeaway «Pydantic-контракт API/mypy в CI/хинты фикстур»; без C#;
      seed синхронен; 0 ошибок консоли; estMinutes 5; _fit-margins: худший лейбл M10 =
      7 ≥ 6; MCQ волны по-прежнему 0% (37/37 exec)
Проверка: build чисто (123.05 KB gz < 200) · viz-fit ALL GREEN (273 сцены, 16 уроков) ·
new-lessons ALL GREEN (PY.M10: 4 сегм, autoplay s1 после сноса predict-гейта с первого
сегмента, reduced-motion) · npm run verify ALL GREEN · multicard-session ALL GREEN ·
shell ALL GREEN · dotnet 65/65; /api/due свежего пользователя содержит все 8 карт M9+M10;
скрины evidence/F10/ (11 PNG, смотрел глазами)
Статус: verified (R-M3-evaluator: ПРИНЯТО; 4 сегм; pydantic-клейм воспроизведён в venv оценщика 3.12.13+2.13.4)

### F11 — Урок py-async-await [M4] [золотой путь]
Зачем: AsyncClient/нагрузка; собес: «await ≠ поток», GIL.
Что: PY.M11 (флагман ≥7): event loop (timeline-примитив), корутина-объект (c19, stderr-
предупреждение отдельным кадром), await=точка передачи, gather (c24 — БЕЗ speedup-числа
в карточке), корутина-как-родственник генератора, GIL (B-1: таймлайн потоков с замком),
блокирующий вызов в лупе — антипаттерн.
Приёмка:
- [x] 7 сегментов (≥7), GIL-кадры есть: s1 event loop на таймлайн-бандах (задача уезжает
      в I/O-банду, луп занимает поток следующей) · s2 корутина-объект с predict-гейтом
      (c19; RuntimeWarning показан ОТДЕЛЬНЫМ кадром-гейтом, текст дословно из stderr
      спайка f11_coroutine_obj ×2 — в expect не входит) · s3 await = точка передачи
      управления (не поток; три вида awaitable — B-10) · s4 gather с predict-гейтом:
      порядок завершения (done: fast раньше) ≠ порядок результатов (['slow', 'fast']),
      БЕЗ speedup-чисел (запрет критика: только детерминированный ПОРЯДОК печати,
      спайки f11_gather_* + f11_await_sequential ×2) · s5 мост к PY.M6: send(None) ведёт
      корутину как генератор, РЕНТГЕН cr_frame (f_locals {'n': 41} — зеркало gi_frame),
      результат приезжает в StopIteration.value (спайк f11_send_frame ×2) · s6 GIL:
      таймлайн двух потоков, жетон «GIL · замок» переезжает FLIP-ом между бандами (B-1),
      free-threading 3.13 хук · s7 блокирующий вызов с predict-гейтом: time.sleep морозит
      весь луп (block start/block end/other), починка await asyncio.sleep меняет порядок
      (block start/other/block end) — спайки f11_blocking_loop + f11_async_sleep ×2
- [x] карточка порядка gather ЛЕСЕНКОЙ: c2 predict (`['slow', 'fast']`) + c3 MODIFY
      (добавлен print("done:", name) → `done: fast\ndone: slow\n['slow', 'fast']`);
      ещё c1 predict корутина-объект (`coroutine\n42`; stderr-RuntimeWarning
      аннотирован в census-логе BY DESIGN) и c4 predict блокирующий вызов
      (`block start\nblock end\nother`) — 4 exec, python3.12.13 ×2, stdout==expect
      байт-в-байт, front==seed==census (seedsync FAILURES: 0 по 43 картам волны)
- [x] общая приёмка: только `at`; 9 EN-цитат перепроверены фетчем живых страниц
      (PEP 492 ×3 — «Since, internally, …» взята с начала предложения по канону M2,
      asyncio-task ×5, glossary GIL ×3 фрагмента, glossary coroutine, free-threading
      HOWTO) — дословны; собес-блок md §12 Q5 («async with в обычной def») →
      misconception-hook (SyntaxError + coroutine-объект); takeaway «httpx.AsyncClient/
      pytest-asyncio/Locust»; БЕЗ C#-сравнений; seed синхронен; 0 ошибок консоли;
      estMinutes 10 ≤ 12 (флагман); _fit-margins: у PY.M11 ни одного лейбла <10
      (после фикса «▶ дальше»/gate-detail/чипов s7); predictAt не на s1 (канон волны),
      hook ужат до ~460 видимых символов (автоплей s1 доказан харнессом)
Проверка: build чисто (131.25 KB gz < 200) · viz-fit ALL GREEN (297 сцен, 17 уроков) ·
new-lessons ALL GREEN (PY.M11: 7 сегм, autoplay s1, reduced-motion) · npm run verify
ALL GREEN · multicard-session ALL GREEN · shell ALL GREEN · loop ALL GREEN · dotnet
65/65; MCQ волны 0% (41/41 exec); скрины evidence/F11/ (17 PNG, смотрел глазами;
дефект «пустая банда s4 со сцены 3» пойман глазами и починен ghost-чипами)
Статус: self-pass

### F12 — Шпаргалка strings+flow (P2) [M4]
Зачем: справочные разделы md (§2, §4) без потери — колода + минимум сюжетных анимаций.
Что: PY.M12: срезы-анимация (s[::-1], шаги), f-string format-spec, for-else (c23),
walrus кратко; колода 4–6 карточек predict-output.
Приёмка:
- [x] 3 сегмента с сюжетом: s1 срезы на живой строке (полуинтервал → отриц. индексы →
      реверс шагом -1 → шаг 2; консоль = спайк f12_slices ×2) · s2 конвейер f-string
      format-spec с predict-гейтом на !r (:.2f/:04d → !r=repr → {name=}; спайк
      f12_fstrings ×2) · s3 for-else с predict-гейтом (контракт «no break» + сцена
      wait_for-поллинга из md §4; спайки f12_for_else + f12_for_else_empty ×2 —
      «на пустой коллекции else тоже выполнится» в hook); walrus — edgeCase + c6
      (лесенка modify НЕ обязательна — исключение шпаргалок из шапки)
- [x] колода 6 exec-карточек по чеклисту RS-03: c1 срезы (`tseT\nes`), c2 спеки
      (`99.50\n0007`), c3 !r/= (`'Alice'\nname='Alice'`), c4 for-else (`not found`),
      c5 strip/join/count (`Hi\na,b,c\n2`), c6 walrus (`3`) — python3.12.13 ×2,
      stdout==expect байт-в-байт, stderr пуст (census-log.txt 49 карт), front==seed==
      stdout сверено скриптом (.verify/seedsync.py: FAILURES 0 по 49 картам)
- [x] общая приёмка: только `at`; 7 EN-цитат перепроверены фетчем живых страниц
      (tutorial/controlflow for-else, reference/expressions walrus, PEP 498 ×2,
      stdtypes ×3: s[i:j:k]/negative-index/no-mutable-string — дословны, усечения
      только на границах предложений); трик-вопрос md §4 (for-else) → misconception-
      hook; takeaway «срезы для ID/логов, f-spec в отчётах, while-else = wait_for»;
      без C#; seed синхронен; 0 ошибок консоли; estMinutes 6; predictAt не на s1;
      _fit-margins: худший лейбл M12 = 6.8px («TimeoutError») ≥ 6
Проверка: build чисто (136.34 KB gz < 200) · viz-fit ALL GREEN (307 сцен, 18 уроков) ·
new-lessons ALL GREEN (PY.M12: 3 сегм, autoplay s1, reduced-motion) · npm run verify
ALL GREEN · multicard-session ALL GREEN · shell ALL GREEN · dotnet 65/65; MCQ волны 0%
(49/49 exec); скрины evidence/F12/ (9 PNG, смотрел глазами)
Статус: self-pass

### F13 — Шпаргалка stdlib+pathlib+idioms (P2) [M4]
Зачем: §13–15 md: то, что дергаешь в тестах ежедневно.
Что: PY.M13: pathlib-путь (анимация Path/glob), json round-trip, EAFP vs LBYL,
truthiness-таблица, enumerate/zip; колода 4–6 карточек.
Приёмка:
- [x] 3 сегмента с сюжетом: s1 pathlib (слэш собирает Path-объект → анатомия
      suffix/stem без I/O → glob-фильтр: 2 файла accent, 2 ghost; спайки f13_pathlib +
      f13_glob ×2) · s2 json round-trip с predict-гейтом на ключ-int (dumps по таблице
      True→true/None→null → loads возвращает живые типы → fail-gate «ключ 1 → '1'»;
      спайк f13_json_roundtrip ×2) · s3 EAFP vs LBYL с predict-гейтом на KeyError
      (LBYL два шага → ok-gate «except KeyError · пойман» → d.get(key, default);
      спайк f13_eafp ×2); truthiness/enumerate-zip — в edgeCases + колоде (по RS-01
      «truthiness-таблица → карточки»); predictAt не на s1 (канон волны)
- [x] колода 6 exec-карточек по чеклисту RS-03: c1 pathlib (`.json\nusers`), c2 dumps
      (`{"ok": true, "err": null}`), c3 round-trip (`{'1': 'a'}\nFalse`), c4 EAFP/get
      (`Anonymous\nKeyError`, имя исключения через type(e).__name__), c5 truthiness
      (`False\nFalse\nFalse\nTrue`), c6 zip/enumerate (`1 1 a\n2 2 b`) — python3.12.13
      ×2, stdout==expect байт-в-байт, stderr пуст (census-log.txt, блок PY.M13);
      front==seed==stdout: .verify/seedsync.py FAILURES: 0 (53 карты волны)
- [x] общая приёмка: только `at` (viz-fit: autolayout 19/19); 15+ EN-цитат фетчем живых
      страниц 2026-07-17 (pathlib intro/slash/pure-concrete/glob-order, json dumps/keys-
      coerced/loads!=x, glossary EAFP+LBYL+race, truth-value testing, zip shortest,
      enumerate count) — дословны; собес-блок md §15 (LBYL «стиль из других языков») →
      misconception-hook EAFP; takeaway «Path(__file__).parent/data, glob артефактов,
      json в API-тестах, EAFP=pytest.raises, enumerate(start=1)»; без C#; seed синхронен;
      0 ошибок консоли (скрин-прогон: console errors: 0); estMinutes 6; _fit-margins:
      худший лейбл M13 = 8px ≥ 6 (после структурного фикса glob-чипа w168+I/O w56);
      6 карт M13 входят в /api/due свежего пользователя (59 total)
Проверка: build чисто (141.53 KB gz < 200) · viz-fit ALL GREEN (316 сцен, 19 уроков) ·
new-lessons ALL GREEN (PY.M13: 3 сегм, autoplay s1, reduced-motion) · npm run verify
ALL GREEN · multicard-session ALL GREEN · shell ALL GREEN · dotnet 65/65; MCQ волны 0%
(53/53 exec); скрины evidence/F13/ (9 PNG, смотрел глазами)
Статус: self-pass

### F14 — Прогресс/стата по трекам — честная проверка [M4]
Зачем: два трека не должны смешивать ощущение прогресса.
Что: экран Прогресс при двух треках не смешивает ощущение прогресса; при необходимости —
группировка per-lesson по трекам БЕЗ новых экранов (LOCKED); иначе cut по протоколу.
Приёмка:
- [x] ИСХОД: per-lesson секция Прогресса сгруппирована по TRACK_GROUPS (registry-driven,
      без per-track хардкода, БЕЗ новых экранов): два заголовка «Темы: прохождение и
      закрепление · Фундамент C# / · Python для AQA», под каждым своя лента; заголовки —
      композиция существующих строк strings.ts. Доказано headless-прогоном
      `node verify/_f14-progress-tracks.mjs` ALL GREEN с ДАННЫМИ ОБОИХ ТРЕКОВ (свежий
      юзер прошёл T1.M4.gc/c1 и PY.M13.stdlib-idioms/c1, оба /api/review Good;
      reviewsTotal=2; группы csharp=6 + python=13 = perLesson 19; 2 заголовка в DOM;
      обе ленты непустые; 0 ошибок консоли). Скрины evidence/F14/
      390-progress-tracks-full.png + 390-progress-tracks-boundary.png — граница треков
      читается глазами (C#-лента с «GC и память · Пройдено» → заголовок PY → PY-лента)
- [x] метрики не сломаны: node verify/shell.mjs ALL GREEN (все progress-ассерты, axe,
      empty/completed-стейты); npm run build чисто; viz-fit ALL GREEN (правка только
      app/src/app/progress.ts — рендер per-lesson списка). Cut не потребовался.
Проверка: node verify/shell.mjs + скрин evidence/F14/
Статус: self-pass

### F15 — Деплой волны [M5] [золотой путь]
Зачем: просьба пользователя «затем задеплой» (полномочия ТЗ).
Что: commit+push main → CI (test+build-and-push) зелёный → prod-смоук: /api/lessons
содержит PY-уроки, урок открывается.
Приёмка:
- [ ] CI run зелёный (test, build-and-push; deploy — если секреты заданы)
- [ ] prod: GET /api/lessons содержит 11+2 PY-уроков (или доклад graceful-skip + шаг активации)
- [ ] FSRS-дозирование: замер GET /api/due дневной очереди ДО/ПОСЛЕ сида PY-волны в
      evidence/F15/ — очередь дня не взрывается (new-карты входят постепенно, число зафиксировано)
Проверка: gh api runs / curl прод / curl /api/due (лог до/после)
Статус: todo

<!-- Майлстоуны: M1=F1(скелет)+чекпойнт пользователя; M2=F2–F6; M3=F7–F10; M4=F11–F14;
     M5=F15+финальный VERIFY. Золотой путь: F1, F4, F5, F11, F15. -->
