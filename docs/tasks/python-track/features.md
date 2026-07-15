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
лесенка modify/explain для M1 не добавлялась — решение на чекпойнте M1 (см. progress.md).
Статус: self-pass

### F2 — Урок py-collections-hash [M2]
Зачем: dict/set = хребет тестовых данных; собес-классика O(1)/hashable.
Что: PY.M2: list vs tuple vs set vs dict (выбор структуры), hashable-ключи (TypeError
list-ключа — спайк c22), устройство dict (buckets/chain-примитивы), insertion order 3.7+.
Приёмка:
- [ ] ≥4 сегмента с buckets-виз; карточка на hashable/lookup
- [ ] общая приёмка уроков (шапка) зелёная
Проверка: viz-fit + new-lessons(PY) + census-лог
Статус: todo

### F3 — Урок py-args-unpacking [M2]
Зачем: *args/**kwargs — везде в фикстурах/декораторах; пререквизит decorators.
Что: PY.M3: позиционные/именованные, *args/**kwargs, распаковка вызова, порядок параметров,
mutable default (кросс-ссылка на M1 внутри трека).
Приёмка: [ ] ≥3 сегмента; [ ] карточка predict-output; [ ] общая приёмка
Проверка: harness-набор
Статус: todo

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
