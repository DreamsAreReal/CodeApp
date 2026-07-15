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
Статус: self-pass

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
Статус: self-pass

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
Статус: self-pass

### F4 — Урок py-closures-scope [M2] [золотой путь]
Зачем: замыкания = основа декораторов/фикстур; собес-ловушка late binding.
Что: PY.M4: LEGB, global/UnboundLocalError (фикс md A-1), nonlocal, cells/__closure__
(невидимое), late binding в цикле [2,2,2]→[0,1,2] (спайк c20).
Приёмка: [ ] ≥5 сегментов, cells показаны анимацией; [ ] карточка late-binding; [ ] общая
Проверка: harness-набор
Статус: todo

### F5 — Урок py-decorators [M2] [золотой путь]
Зачем: «декоратор — это pytest»: @fixture/@parametrize/@allure.step; ядро собес-флоу.
Что: PY.M5 (флагман ≥6): функция-объект, def-time исполнение (c06), слои/порядок (c04),
потеря имени → functools.wraps (c05), параметризованный декоратор (фабрика), связка
@pytest.fixture; dis/байткод-кадр MAKE_FUNCTION/ячейки.
Приёмка: [ ] ≥6 сегментов; [ ] карточки лесенкой (порядок слоёв/что напечатает); [ ] общая
Проверка: harness-набор
Статус: todo

### F6 — Урок py-generators [M2]
Зачем: yield = setup/teardown фикстур; «пауза кадра» — невидимое ядро.
Что: PY.M6: ленивость (c08), замороженный кадр gi_frame (спайк RS-02), исчерпание (c09),
StopIteration (c10), фикстура yield-паттерном, genexpr vs list (память — замер python3.12).
Приёмка: [ ] ≥5 сегментов, кадр-«заморозка» анимирован; [ ] карточка; [ ] общая
Проверка: harness-набор
Статус: todo

### F7 — Урок py-context-managers [M3]
Зачем: with = httpx.Client/testcontainers/allure.step; teardown-гарантии.
Что: PY.M7: протокол __enter__/__exit__ (c11), подавление исключений возвратом True,
@contextlib.contextmanager (c14 — мост от генераторов), with vs try/finally.
Приёмка: [ ] ≥4 сегмента (gate-примитив для exit-решения); [ ] карточка; [ ] общая
Проверка: harness-набор
Статус: todo

### F8 — Урок py-object-model [M3]
Зачем: POM/BasePage; собес: MRO, classmethod/staticmethod, property.
Что: PY.M8 (≥6): класс/инстанс-атрибуты (shadowing c15), MRO C3 (c16), дескрипторы →
bound method (невидимое, B-5), property, name mangling (c17), classmethod vs staticmethod;
полиморфизм-пример md ИСПРАВЛЕН (A-2).
Приёмка: [ ] ≥6 сегментов; [ ] карточка MRO/shadowing; [ ] общая
Проверка: harness-набор
Статус: todo

### F9 — Урок py-exceptions [M3]
Зачем: try/except в каждом тесте; собес: иерархия, finally-gotcha.
Что: PY.M9: иерархия ОТ OSError (фикс md A-3), except-порядок, else/finally (c13),
finally-return глотает исключение (c12), raise from, pytest.raises-связка.
Приёмка: [ ] ≥5 сегментов (gate-примитив = перехват); [ ] карточка finally-return; [ ] общая
Проверка: harness-набор
Статус: todo

### F10 — Урок py-type-hints [M3]
Зачем: hints → Pydantic-контракты API-тестов.
Что: PY.M10: hints ≠ принуждение (c18), __annotations__ (r2_c28), Optional/Union и
PEP 604 «3.10+» (RS-03: без exec-ловушек на 3.9), Pydantic-preview (валидация = рантайм).
Приёмка: [ ] ≥4 сегмента; [ ] карточка __annotations__; [ ] общая
Проверка: harness-набор
Статус: todo

### F11 — Урок py-async-await [M4] [золотой путь]
Зачем: AsyncClient/нагрузка; собес: «await ≠ поток», GIL.
Что: PY.M11 (флагман ≥7): event loop (timeline-примитив), корутина-объект (c19, stderr-
предупреждение отдельным кадром), await=точка передачи, gather (c24 — БЕЗ speedup-числа
в карточке), корутина-как-родственник генератора, GIL (B-1: таймлайн потоков с замком),
блокирующий вызов в лупе — антипаттерн.
Приёмка: [ ] ≥7 сегментов, GIL-кадр есть; [ ] карточка порядка вывода gather; [ ] общая
Проверка: harness-набор
Статус: todo

### F12 — Шпаргалка strings+flow (P2) [M4]
Зачем: справочные разделы md (§2, §4) без потери — колода + минимум сюжетных анимаций.
Что: PY.M12: срезы-анимация (s[::-1], шаги), f-string format-spec, for-else (c23),
walrus кратко; колода 4–6 карточек predict-output.
Приёмка: [ ] 2–3 сегмента; [ ] колода по чеклисту RS-03; [ ] общая
Проверка: harness-набор
Статус: todo

### F13 — Шпаргалка stdlib+pathlib+idioms (P2) [M4]
Зачем: §13–15 md: то, что дергаешь в тестах ежедневно.
Что: PY.M13: pathlib-путь (анимация Path/glob), json round-trip, EAFP vs LBYL,
truthiness-таблица, enumerate/zip; колода 4–6 карточек.
Приёмка: [ ] 2–3 сегмента; [ ] колода; [ ] общая
Проверка: harness-набор
Статус: todo

### F14 — Прогресс/стата по трекам — честная проверка [M4]
Зачем: два трека не должны смешивать ощущение прогресса.
Что: экран Прогресс при двух треках не смешивает ощущение прогресса; при необходимости —
группировка per-lesson по трекам БЕЗ новых экранов (LOCKED); иначе cut по протоколу.
Приёмка:
- [ ] ИСХОД: на скрине Прогресса PY-уроки визуально отделимы от C# (группировка или
      ясная подпись урока) И ни одна существующая метрика не сломана (shell.mjs GREEN)
- [ ] ЛИБО фича cut по протоколу с докладом пользователю (причина + что потребовалось бы)
Проверка: node verify/shell.mjs + скрин evidence/F14/
Статус: todo

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
