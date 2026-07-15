# RS-01 — Дигест и нарезка `00-python-refresher.md` на уроки Python-трека

Дата: 2026-07-15 · Ресерчер конвейера · Статус: DONE (закрытый корпус, покрытие 100%) · Дополнение раунда 2 — в конце файла

## 1. Вопросы

1. Инвентарь 15 разделов md: утверждения, gotchas, «на собесе», примеры с выводом; пометка УРОК vs СПРАВОЧНИК.
2. Нарезка на уроки-кандидаты: slug, разделы-источники, 4–8 несущих нюансов, маппинг на виз-примитивы, 2–4 карточки predict-output с ПРОВЕРЕННЫМ выводом.
3. Приоритизация P0/P1/P2 + объём в сегментах.
4. Мостики к существующим C#-урокам.

## 2. Корпусы и источники

| Корпус | Что | Покрытие |
|---|---|---|
| Корпус пользователя (закрытый) | `/Users/admin/Desktop/CodeApp/00-python-refresher.md` — 2293 строки, §0–§15 | **100%, прочитан целиком** (2 прогона Read: 1–1556, 1557–2293) |
| Планка приложения | `docs/AUTHORING-AI.md` (целиком), `app/src/lessons/closures.ts` (эталон, целиком), листинг `app/src/lessons/` | 100% |
| Спайки (артефакты) | 26 сниппетов, реальный прогон **python3 3.9.6** (системный, macOS): `/private/tmp/claude-501/-Users-admin-Desktop-CodeApp/4fbaa397-5ea3-4d13-b40b-5f8ae08dcea3/scratchpad/pyspike/c01…c26_*.py` | все выводы ниже = реальный stdout |

Веб не требовался (единственный источник контента — md пользователя); спорные места проверены исполнением, не поиском. Semantics-факты Python в md сверены исполнением там, где они несущие; остальное помечено «по корпусу». `ДЕГРАДИРОВАНО`: нет.

**Замечание о версии:** все `expect` ниже валидны для CPython 3.9.6. Выводы стабильны по версиям 3.8–3.12, КРОМЕ помеченного c25 (PEP 604) — он и есть проверка версии. *(Раунд 2: подтверждено перепрогоном RS-03 на python3.12 — разошлись только c25 и c26/dis.)*

---

## 3. A. Инвентарь по разделам md

Легенда: **УРОК** = есть механизм/процесс, тянет на анимированные сегменты; **СПРАВОЧНИК** = перечень API, в урок не тянуть; **ГИБРИД** = ядро в урок, перечни в справочник.

| § | Раздел (строки) | Вердикт | Несущее содержимое |
|---|---|---|---|
| 0 | Общая картина, карта блоков (1–72) | МЕТА | Хребет «6 механизмов → инструменты AQA» (таблица §0). Не урок — материал для интро-экрана трека и киккеров («это и есть pytest.fixture»). |
| 1 | Базовый синтаксис и типы (74–186) | **УРОК** (ядро) | Mutable vs immutable (таблица типов); mutable default argument (пример с выводом `['a'] / ['a','b']`); `is` vs `==`, None-singleton. Блок «на собесе»: is/==. Mermaid-схема mutable/immutable → сцены. |
| 2 | Строки и f-strings (188–268) | СПРАВОЧНИК | Перечень методов и format-спеков. Изюм для карточек справочника: `{x=}` (3.8+), `!r`, срезы `s[::-1]`. Механизма/процесса нет. |
| 3 | Коллекции (272–461) | **ГИБРИД** | API-листинги list/dict/set/tuple = справочник. УРОК: ❗разбор собеса (2026-07, mayflower) — senior-таблица list/tuple/set/dict (хэшируемость, O(1) vs O(n)); «3 вещи, ради которых set»; tuple как ключ dict; **поверхностная неизменяемость tuple** `t=(1,[2,3])`; list-comp vs genexpr (блок «на собесе»). |
| 4 | Управление потоком (464–563) | СПРАВОЧНИК | if/for/while/range/enumerate/zip. Изюм для карточек: walrus `:=` (3.8+), `else` на цикле (трик-вопрос), polling-паттерн `while…else` для wait_for. |
| 5 | Функции (567–727) | **ГИБРИД** | Справочник: сигнатуры, дефолты. УРОК: `*args/**kwargs`, распаковка `*locator` (= Selenium `find_element(*locator)`, вопрос Q3); LEGB (mermaid → сцена); `global`/`nonlocal`; **замыкания make_multiplier** (блок «на собесе»: `10 15`, Q1). |
| 6 | **Декораторы — глубоко** (730–949) | **УРОК** (флагман) | `@` = сахар для `f = deco(f)` (перепривязка имени!); wrapper замыкает func; фабрика `@repeat(3)` — 3 шага чтения; стек декораторов снизу вверх; `functools.wraps` обязателен (иначе `__name__=='wrapper'` и pytest глючит); класс-декоратор `__call__`; ❗разбор собеса (2026-07, ecommpay): **декоратор ≠ фикстура** (refutation-мисконцепция!). Блок «на собесе»: `@measure_time`, забытый `return result` → None. |
| 7 | **Генераторы и yield — глубоко** (952–1089) | **УРОК** (флагман) | Вызов генератора НЕ исполняет тело; yield = пауза с заморозкой состояния (mermaid stateDiagram → timeline); StopIteration; **yield в фикстуре = «тест выполняется здесь», код после yield = teardown, выполнится даже при падении; return вместо yield = cleanup исчез** (блок «на собесе», Q2); ленивость/константная память. |
| 8 | **Context managers** (1092–1226) | **УРОК** | `with` = `__enter__`/try/finally/`__exit__` (десахаризация в md есть); `__exit__` вызывается и при exception; `return True` в `__exit__` подавляет; `@contextmanager` = генератор с одним yield (склейка с §7); класс-CM TempUser; testcontainers/pytest.raises. Блок «на собесе»: зачем with, RAII. |
| 9 | **Классы и OOP** (1229–1526) | **УРОК** (2 части) | self явный (`u.greet()` → `User.greet(u)`); class- vs instance-атрибуты; наследование/`super()` (POM); MRO `D(B,C)` → `'B'`; classmethod/staticmethod (таблица); property; dunder; dataclass. ❗разбор собеса (2026-07, mayflower): 4 принципа ООП, пример полиморфизма «выучить дословно», ABC/abstractmethod, **name mangling `__x` → `_Class__x`**, SOLID списком. Блоки «на собесе»: classmethod vs staticmethod; принципы ООП. |
| 10 | Type hints + Pydantic (1529–1587) | **УРОК** (короткий) | **Python НЕ проверяет типы в runtime** — hints для IDE/mypy; `Optional` / `X \| None` (3.10+ — см. риск ниже); Literal/Callable; **Pydantic проверяет И приводит** (`id="1"` → `1`, `id="abc"` → ValidationError) = контракт API. |
| 11 | Обработка ошибок (1591–1737) | **УРОК** | Поток try/except/else/finally (mermaid → сцена); иерархия BaseException; `except Exception: pass` — антипаттерн; `raise … from e` (chaining); кастомные exceptions; pytest.raises+match. Блок «на собесе»: **`return` в `finally` переопределяет return из try и глотает exception**. |
| 12 | **Async/await** (1741–1899) | **УРОК** (флагман) | I/O-bound vs CPU-bound; **конкурентность ≠ параллельность** (один поток, один повар); event loop = диспетчер; **корутина — родственник генератора, await ≈ yield** (склейка с §7); вызов `async def` без await → coroutine-объект; **await подряд НЕ ускоряет — ускоряет только gather**; 3 грабли (забыл await; await вне async; sync-клиент блокирует loop). Блок «на собесе»: Q5 — две проблемы кода. |
| 13 | Стандартная библиотека (1903–2087) | СПРАВОЧНИК | random/itertools/collections/pathlib/json/datetime/subprocess/os — чистые перечни API с однострочными выводами. В карточки-справочник: `Counter.most_common`, `defaultdict(list)`, `product` для параметризации. |
| 14 | Файлы и pathlib (2091–2128) | СПРАВОЧНИК | read_text/write_text, режимы открытия (таблица), построчное чтение больших файлов (перекликается с §7 — упомянуть в уроке генераторов). |
| 15 | Common idioms (2131–2234) | **ГИБРИД** | EAFP vs LBYL (→ в урок exceptions); truthiness-таблица (→ карточки); swap `a,b=b,a`; chained comparison; `first,*rest` распаковка (→ в §5-контент); mutable default (дубль §1). |
| — | Финальная проверка Q1–Q5 (2256–2289) | МЕТА | Готовая лесенка Junior→Staff — прямые прототипы карточек predict/explain для 5 уроков. |

Итог по корпусу: ~55% строк = механизмы (уроки), ~40% = справочник API, ~5% = мета/навигация. Три блока «❗Разбор собеса» (mayflower ×2, ecommpay ×1) — готовые refutation-мисконцепции, самый ценный материал файла для формата `misconceptions` урока.

---

## 4. B. Нарезка на уроки-кандидаты

Общие решения (по AUTHORING-AI §3a/§4 и closures.ts):
- Зоны для памяти Python: слева `frame` («ФРЕЙМ ФУНКЦИИ · имена → ссылки»), справа `heap` («КУЧА CPython · все значения — объекты»). Это осознанный контраст с C#-зонами «стек/куча»: **в Python на «стеке» нет значений, только имена**.
- **IL-панель переиспользуется как байткод-панель `dis`** — проверено реальным прогоном (c26): `LOAD_CLOSURE / MAKE_FUNCTION 8 (closure) / LOAD_DEREF / STORE_FAST`, `d.__closure__[0].cell_contents == 2`. Опкоды в уроки брать ТОЛЬКО из реального `dis.dis` на версии раннера (между 3.9/3.11/3.12 опкоды меняются: BINARY_MULTIPLY → BINARY_OP).
- Вьюпорт 340px: строки кода ≤ ~40 символов, 1–4 строки на сегмент. Все длинные листинги md (декоратор log_calls 15 строк, retry_on_failure 20 строк, LoginPage 14 строк) дробятся по сегментам; в карточках сниппеты сокращены до 3–7 строк (см. спайки).
- Все `expect` = реальный stdout python3 3.9.6, файлы `pyspike/cNN_*.py`.

### P0-1. `py-names-objects` — «Имена и объекты: модель памяти Python» (7 сегментов)

Из: §1 + §3 (tuple/хэшируемость) + §15 (mutable default дубль). Корневой урок трека.

Несущие нюансы → сегменты:
1. Имя ≠ ячейка: присваивание привязывает имя к объекту (`x = 5; x = "hello"` — тип у объекта, не у имени). Виз: slot-имя в `frame`, obj в `heap`, ref-стрелка перепрыгивает.
2. Aliasing: `b = a` копирует ссылку, не объект — мутация видна через оба имени (c02). Виз: два ref → один obj, accent на мутации.
3. «Изменение» immutable = новый объект: `s = s + "!"` — старый объект остаётся, имя переезжает. Виз: enter нового obj, exit старого (FLIP).
4. Mutable default argument: **дефолт вычисляется один раз на def**, живёт у объекта-функции (c01). Виз: obj-функция с полем `__defaults__` → chip `[]`, растущий между вызовами; gate «items is None?» для починки.
5. Поверхностная неизменяемость tuple: `t = (1, [2,3]); t[1].append(4)` — OK, `t[0] = 9` — TypeError (c03). Виз: tuple-obj держит ref на list-obj; gate fail на попытке перепривязать слот.
6. `is` vs `==`: identity vs равенство; None — singleton (`x is None`). Виз: два obj с равными значениями, chip `== True / is False`.
7. Хэшируемость: почему tuple — ключ dict, list — нет (c22). Виз: gate `hash()` ok/fail. (Мостик к P1-урок collections-hash, здесь коротко.)

Карточки (проверено python3 3.9.6):
- **c1** (c01): `def add_item(item, items=[]): items.append(item); return items` + два вызова → expect `['a']\n['a', 'b']`.
- **c2** (c02): aliasing `a=[1,2,3]; b=a; b.append(4); print(a); print(a is b)` → expect `[1, 2, 3, 4]\nTrue`.
- **c3** (c03): `t=(1,[2,3]); t[1].append(4); print(t)` → expect `(1, [2, 3, 4])`.

### P0-2. `py-decorators` — «Декораторы: из чего сделан pytest» (7 сегментов)

Из: §6 (+§5 замыкание как опора, одним сегментом-склейкой).

1. `@deco` = сахар для `f = deco(f)`: **перепривязка имени** (ровно модель памяти из P0-1). Виз: ref `add` переезжает с obj-функции на obj-wrapper; wrapper держит ref на оригинал (замыкание).
2. Декоратор исполняется на **def-time**, не на вызове (c06: `decorating foo` печатается до `done`). Виз: timeline «import → def → call».
3. Порядок исполнения wrapper: before → func → after → return (c04). Виз: chain вызова, chip-выводы по шагам.
4. Фабрика `@repeat(3)`: три шага — `repeat(3)` → decorator → wrapper; «это и есть `@pytest.fixture(scope=…)`». Виз: три вложенных obj + рёбра захвата `times=3`.
5. Стек декораторов применяется снизу вверх. Виз: buckets/стопка chip-ов, порядок оборачивания.
6. `functools.wraps`: без него `__name__ == 'wrapper'` (c05) — pytest показывает не то имя. Виз: obj-wrapper c полем `__name__`, gate wraps копирует мета.
7. Refutation-мисконцепция «декоратор = фикстура» (ecommpay): декоратор — механизм языка, фикстура — конструкция pytest ПОВЕРХ него («дом ≠ кирпич»). Сегмент-сравнение без кода или с двумя chip-зонами.

Карточки:
- **c1** (c04): log-декоратор + `print(add(2,3))` → expect `before\nafter\n5`.
- **c2** (c05): декоратор без wraps + `print(greet.__name__)` → expect `wrapper`.
- **c3** (c07): wrapper без `return` + `print(add(2,3))` → expect `None` (классика «декоратор съел результат»).
- **c4** (c06): `@deco` с print на def-time → expect `decorating foo\ndone`.

### P0-3. `py-generators` — «yield: пауза, а не return» (6 сегментов)

Из: §7 + §3 (genexpr).

1. Вызов генератора не исполняет тело: `g = gen()` → объект, «start» не напечатан (c08). Виз: obj-генератор в state `created`, код-строка не подсвечена.
2. `next()` едет до yield и замораживается; локальные живы. Виз: **timeline-стейт-машина** (created → running → suspended → …), slot локальной переменной сохраняет значение между next.
3. Исчерпание → StopIteration (c10). Виз: gate fail на последнем next.
4. Фикстура pytest: `yield` = «здесь выполняется тест»; после yield = teardown, выполнится даже при падении теста; **заменил на return — teardown исчез** (Q2). Виз: timeline с треками fixture/test, зона teardown гаснет при return.
5. Ленивость: genexpr vs list-comp — константная память против всего списка (§3 «на собесе»). Виз: buckets-поток по одному элементу vs куча объектов разом.
6. Генератор одноразовый: `sum(g)` второй раз → 0 (c09) — частая причина «пустых» данных в тестах. Виз: obj в state `exhausted`.

Карточки:
- **c1** (c08): gen с print + `print("created")` + 2×next → expect `created\nstart\n1\nmiddle\n2`.
- **c2** (c09): `g=(x*x for x in range(3)); print(sum(g)); print(sum(g))` → expect `5\n0`.
- **c3** (c10): next после исчерпания → expect `1\nStopIteration`.

### P0-4. `py-context-managers` — «with: протокол enter/exit» (5 сегментов)

Из: §8 (+§11 finally-связка).

1. Десахаризация `with` = `__enter__` → try → finally `__exit__` (листинг из md, дроблённый). Виз: timeline/chain шагов протокола.
2. `__exit__` вызывается и при exception; `return True` подавляет её (c11: `after` печатается). Виз: gate exception → exit → suppressed.
3. `@contextmanager`: генератор с одним yield — setup/тело/teardown (c14) — прямая склейка с P0-3 и `with allure.step()`. Виз: timeline генератора c зоной «тело with здесь».
4. Класс-CM (TempUser из md): `__enter__` возвращает то, что попадает в `as`; юзер удалён даже при падении. Виз: obj с методами, ref `as user_id`.
5. `pytest.raises` как CM: exception ожидалась → тест зелёный; не случилась → красный. Виз: gate инвертированной логики.

Карточки:
- **c1** (c11): CM с `return True` + raise в теле → expect `enter\nbody\nexit\nafter`.
- **c2** (c14): `@contextmanager` + `with cm() as v: print(v)` → expect `setup\n42\nteardown`.

### P0-5. `py-object-model` — «Объектная модель: self, атрибуты, MRO» (7 сегментов)

Из: §9 (механика; принципы ООП/SOLID → P2-справочник собес-ответов).

1. `self` явный: `u.greet()` ≡ `User.greet(u)`. Виз: ref-стрелка от вызова к классу с подстановкой obj.
2. Class-атрибут vs instance-атрибут: `c1.total = 5` создаёт **теневой instance-атрибут**, класс не тронут (c15: `5 0 0`). Виз: две зоны class/instance, chip затеняет.
3. Attribute lookup chain: instance `__dict__` → class → базы (атрибуты реально живут в dict!). Виз: **chain-поиск как в hashtable-уроке**.
4. MRO: `D(B,C)` → `'B'`, C3-линеаризация, `D.__mro__` (c16). Виз: chain порядка обхода по графу наследования.
5. classmethod (`cls`, фабрики `from_dict`) vs staticmethod (утилка в namespace) vs instance method. Виз: три chip-варианта первого аргумента.
6. Name mangling: `self.__x` → `_P__x`; `p.__x` → AttributeError (c17); это защита от переопределения, не приватность. Виз: obj с переименованным слотом, gate fail на прямом доступе.
7. `@property`/dunder (`__eq__` ↔ `==`, `__repr__`) — «операторы = вызовы методов». Виз: chip-маппинг оператор→dunder. (dataclass — упомянуть в explain, не сегмент.)

Карточки:
- **c1** (c15): shadowing → expect `5 0 0`.
- **c2** (c16): MRO → expect `B`.
- **c3** (c17): mangling → expect `1\nAttributeError`.

### P0-6. `py-type-hints` — «Hints не проверяются. Pydantic проверяет» (4 сегмента)

Из: §10.

1. Runtime не enforce'ит: `add("a","b")` с хинтами `int` → `'ab'` (c18). Виз: gate, который ВСЕГДА ok (подсвечен как «декорация»), контраст с C#.
2. `Optional[X]` / `X | None`: **PEP 604 синтаксис на 3.9 падает TypeError в runtime** (c25 — реальный прогон!) — версия среды = часть контракта. Виз: gate по версии. *(Раунд 2, по RS-03: на раннере 3.12 работает и печатает `0` — сегмент подавать как «современный синтаксис 3.10+», ошибка 3.9 — историческая справка БЕЗ exec-карточки; см. Дополнение D-3.)*
3. Pydantic: валидирует И приводит — `User(id="1", …)` → `id == 1` (int); `id="abc"` → ValidationError. Виз: gate ok/fail + chip коэрции `"1"→1`. (Требует pydantic в раннере — пометка билдеру; либо сегмент без карточки.)
4. Зачем в AQA: модель = контракт ответа API; mypy — статический гейт, Pydantic — runtime-гейт. Виз: две gate-станции.

Карточки:
- **c1** (c18): → expect `ab`.
- **c2** (c25): `def f(x: int | None): …` на 3.9 → expect (stderr/исключение) `TypeError…` — формат «что произойдёт?» с вариантами, т.к. вывод — traceback; либо MCQ-fallback. Пометить билдеру. *(Раунд 2: в этом виде ЗАПРЕЩЕНА — на 3.12 не падает; заменена картой r2_c28 `__annotations__` → см. Дополнение D-3.)*

### P0-7. `py-async-await` — «Один поток, который не ждёт» (7 сегментов)

Из: §12.

1. Блокирующий код: 3 запроса × 1с = 3с, процессор смотрит в стену; I/O-bound vs CPU-bound. Виз: **timeline{tracks}** с мёртвыми зонами ожидания.
2. Конкурентность ≠ параллельность: один трек с переключениями vs два трека (multiprocessing). Виз: timeline 1 трек vs 2 трека.
3. Event loop — диспетчер: пока задача на await, управление другой; будит с места паузы. Виз: timeline + ref-переключатель loop.
4. Корутина = родственник генератора: await ≈ yield, только отдаёт управление, а не значение (склейка с P0-3). Виз: та же стейт-машина suspended/resumed.
5. `async def` без await → coroutine-объект, не результат (c19: `coroutine`, потом 42 через `asyncio.run`). Виз: obj-coroutine + gate «awaited?».
6. **await подряд НЕ ускоряет; gather — да**: спайк c24 = `seq=0.30s par=0.10s speedup>3.0x` (реальные числа). Виз: timeline последовательный vs gather.
7. Грабли: sync `requests.get` внутри async блокирует весь loop. Виз: timeline с замёрзшими всеми задачами.

Карточки:
- **c1** (c19): `print(type(f()).__name__); print(asyncio.run(f()))` → expect stdout `coroutine\n42` (RuntimeWarning уходит в stderr — раннер должен отделять потоки!).
- **c2**: Q5 из md (async with в обычной def) — тип «объясни/почини», без exec-expect → MCQ-fallback.
- (Тайминг c24 в карточку НЕ брать — вывод недетерминирован; это спайк-доказательство для explain.)

### P1-1. `py-closures-scope` — «LEGB и замыкания: [2,2,2]» (5 сегментов)

Из: §5 (+§15 распаковка). Самый прямой мостик к closures.ts — рекомендую поднять в первую волну после P0.

1. LEGB-порядок поиска имени (mermaid md → chain). 2. `global`/`nonlocal`: без nonlocal — новая локальная (c21: `1 2 3`). *(Раунд 2: формулировка исправлена по A-1/B-12 — см. Дополнение D-1.)* 3. `make_multiplier`: каждая фабрика — свой scope (`10 15`, Q1). Виз: два obj-замыкания с разными cell. 4. **Late binding: `[lambda: i for i in range(3)]` → `[2, 2, 2]`** (c20) — захватывается переменная, не значение — точное зеркало «333» из closures.ts; починка `lambda i=i:` → `[0, 1, 2]`. 5. Под капотом: `__closure__`, cell_contents, байткод `LOAD_CLOSURE/LOAD_DEREF` (c26, dis-панель = аналог IL).

Карточки: **c1** (c20) → `[2, 2, 2]\n[0, 1, 2]`; **c2** (c21) → `1 2 3`; **c3** (двойник Q1) → `10 15` (проверить отдельным прогоном при сборке). *(Раунд 2: проверено — r2_c27 на 3.12 → `10 15`, см. Дополнение D-3.)*

### P1-2. `py-collections-hash` — «Хэшируемость и O(1)» (5 сегментов)

Из: §3 (senior-таблица + разбор собеса mayflower). 1. `x in list` O(n) vs `x in set` O(1) — **buckets+chain** (переиспользование примитива hashtable). 2. Почему ключ dict обязан быть хэшируемым; tuple да, list нет (c22). 3. tuple с list внутри — не хэшируем. 4. set-операции для тестов: `expected - actual`. 5. dict упорядочен с 3.7 (гарантия, не случайность). Карточки: **c1** (c22) → `TypeError\nok`; **c2** (c03, повтор в другом ракурсе). В карточках НЕ печатать set (порядок не гарантирован спекой).

### P1-3. `py-exceptions` — «finally, который переписал return» (5 сегментов)

Из: §11 + §15 (EAFP). 1. Поток try/except/else/finally (c13: `else\nfinally`). 2. **`return` в finally переопределяет return из try и глотает exception** (c12: `from finally`). 3. Иерархия; `except Exception: pass` — антипаттерн. 4. `raise … from e` — chaining, `__cause__`. 5. EAFP vs LBYL (+ `d.get(k, default)`); pytest.raises+match. Карточки: **c1** (c12) → `from finally`; **c2** (c13) → `else\nfinally`; **c3** (c23, for-else) → `not found`.

### P1-4. `py-args-unpacking` — «*args, **kwargs и *locator» (3–4 сегмента)

Из: §5 + §15. Packing/unpacking, `find_element(*locator)` (Q3), `first,*rest`. Кандидат на слияние с P1-1, если объём трека жмёт.

### P2 — справочник (НЕ уроки; формат: колода карточек-шпаргалок или cheatsheet-экран без анимаций)

§2 строки/f-strings · §4 поток (walrus, polling) · §13 stdlib (random/itertools/collections/pathlib/json/datetime/subprocess) · §14 файлы/режимы · §15 truthiness/swap/идиомы · §9-часть «принципы ООП + SOLID + собес-формулировки» (это зубрёжка формулировок, не механизм; можно карточками explain). §0 — интро-экран трека.

---

## 5. C. Приоритизация и объём

| Пр. | Slug | Сегм. | Карточек (провер.) | Источник в md |
|---|---|---|---|---|
| P0 | `py-names-objects` | 7 | 3 | §1, §3, §15 |
| P0 | `py-decorators` | 7 | 4 | §6, §5 |
| P0 | `py-generators` | 6 | 3 | §7, §3 |
| P0 | `py-context-managers` | 5 | 2 | §8 |
| P0 | `py-object-model` | 7 | 3 | §9 |
| P0 | `py-type-hints` | 4 | 2 (1 exec) | §10 |
| P0 | `py-async-await` | 7 | 2 (1 exec) | §12 |
| P1 | `py-closures-scope` | 5 | 3 | §5, §15 |
| P1 | `py-collections-hash` | 5 | 2 | §3 |
| P1 | `py-exceptions` | 5 | 3 | §11, §15 |
| P1 | `py-args-unpacking` | 3–4 | 1–2 | §5, §15 |
| P2 | справочник-колоды | — | ~15–20 шпаргалок | §0,2,4,13,14,15, часть §9 |

P0 = 43 сегмента (7 уроков), P1 = 18–19 (4 урока). Порядок прохождения (concept-DAG): names-objects → closures-scope → decorators → generators → context-managers → object-model → type-hints → async-await (генераторы до async — md сам строит async на «родстве с yield»; closures до decorators — wrapper = замыкание). Замечание: closures-scope логически нужен ДО decorators — рассмотреть его повышение до P0 или влить сегмент 5.3 (make_multiplier) в py-decorators.

## 6. D. Мостики C#↔Python (существующие уроки: value-vs-reference, boxing, gc, closures, async-await, hashtable)

| Python-урок | C#-урок | Суть сравнения |
|---|---|---|
| py-names-objects | **value-vs-reference** + **boxing** | В C# int живёт в слоте стека, в Python ВСЁ — объект в куче, имена — только ссылки («в CPython всё уже „boxed“»); зоны стек/куча переиспользуются с новой подписью |
| py-closures-scope | **closures** | Прямое зеркало: `[2,2,2]` (late binding, одна переменная цикла) ↔ `333` (одна `i` в for); display class ↔ cell/`__closure__`; сцены s5 closures.ts переиспользовать почти 1:1 |
| py-decorators | **closures** | wrapper захватывает func так же, как display class захватывает переменную |
| py-generators | **async-await (C#)** | Компилятор C# строит стейт-машину из await; генератор Python — та же заморозка/возобновление, но явная |
| py-context-managers | **gc** (IDisposable/using) | `with` = `using`: `__enter__/__exit__` ↔ `Dispose`; детерминированный cleanup вне GC |
| py-object-model | **hashtable** | Атрибуты объекта живут в `__dict__` — lookup-цепочка атрибутов = поиск в хэш-таблице; chain-примитив переиспользуется |
| py-collections-hash | **hashtable** | buckets+chain 1:1; хэшируемость ключа ↔ GetHashCode/Equals |
| py-type-hints | **boxing** (гейт распаковки) | Гейт типа в CIL — настоящий; hints — «нарисованный гейт»; Pydantic возвращает runtime-гейт |
| py-async-await | **async-await (C#)** | Event loop + корутины ↔ стейт-машина + TaskScheduler; «await не ускоряет без gather» ↔ «await не создаёт поток»; timeline-примитив общий |
| py-exceptions | (прямого нет) | Ближайшее — finally/Dispose из gc; кандидат на будущий C#-урок try/finally/filters |

## 7. Реестр покрытия (закрытый корпус — 100%)

Единицы = разделы md §0–§15 + финальный блок Q1–Q5 = 17/17 размечены (см. §3-A). Блоки «на собесе спросят» в md: §1(is/==), §3(list/set/tuple; list-comp/genexpr), §5(closures), §6(measure_time), §7(return/yield), §8(with open), §9(classmethod/staticmethod; принципы ООП), §11(finally-return), §12(Q5) — 10/10 замаплены на уроки/карточки. Разборы собесов: 3/3 → refutation-мисконцепции (P0-1/P1-2, P0-2, P0-5). Спайки: 26/26 файлов исполнены, выводы зафиксированы дословно.

## 8. Противоречия и риски

1. **Версия Python.** md местами рекомендует 3.10+ синтаксис (`X | None`), а системный python3 = 3.9.6, где это **runtime TypeError** (c25). Все `expect` обязаны генериться на версии бэкенд-раннера, версию зафиксировать в уроке. *(Раунд 2: версия зафиксирована — python3.12; перепрогон RS-03.)*
2. **Нет run-python endpoint.** Бэкенд умеет только `run-csharp` (Roslyn top-level). Для гейта G-EXEC Python-карточек нужен `run-python` (или пресчитанные expect из этого отчёта + CI-проверка python3). Блокер для статуса `verified`, не для авторинга. **[СНЯТО в раунде 2: endpoint не строим, решение — авторский локальный python3.12; см. Дополнение D-2.]**
3. **stdout vs stderr.** c19 печатает RuntimeWarning в stderr — раннер обязан отдавать чистый stdout (как это уже сделано для dotnet), иначе expect не сойдётся.
4. **Опкоды dis нестабильны между версиями** (3.9 `BINARY_MULTIPLY` vs 3.11+ `BINARY_OP`) — байткод-панели генерить только реальным `dis` на версии раннера, не из памяти.
5. **AUTHORING-AI требует первоисточник на каждый claim.** md пользователя — источник контента/нарезки, но НЕ первоисточник семантики Python: при сборке уроков цитаты брать из docs.python.org (reference/datamodel, PEP 604/557/3129 и т.д.) — в этой задаче веб-добыча цитат не выполнялась (вне скоупа RS-01).
6. Незначительная неточность md: «`(x for x in …)` не жрёт RAM» — genexpr одноразовый, о чём md не говорит в §3 (говорит косвенно); карточка c09 закрывает.

## 9. Что не удалось выяснить / вне скоупа

- Track-id для Python (T3? PY?) и module-нумерация — решение оркестратора.
- Дословные цитаты первоисточников (docs.python.org) на каждый claim — отдельный ресерч при сборке каждого урока.
- Наличие pydantic в окружении раннера (для P0-6 сегмента 3) — проверить при билде.

## 10. Рекомендация

Собирать в порядке: **py-names-objects → py-decorators → py-generators** (три урока покрывают 80% «на собесе»-блоков md и весь фундамент pytest), затем context-managers, object-model, async-await, type-hints; py-closures-scope поднять вплотную к decorators. ~~Перед первым уроком — добавить `run-python` в бэкенд (риск №2).~~ *(Снято в раунде 2: expect считает автор локальным python3.12 на этапе авторинга, endpoint не строится — см. Дополнение D-2.)* Каждый predict-output обязан пересобрать expect реальным прогоном на версии раннера; выводы этого отчёта (python3 3.9.6, артефакты в `pyspike/`) — эталон для сверки, актуальный эталон версии — RS-03 (python3.12).

Артефакты спайков: `/private/tmp/claude-501/-Users-admin-Desktop-CodeApp/4fbaa397-5ea3-4d13-b40b-5f8ae08dcea3/scratchpad/pyspike/c01…c26` (26 файлов, все исполнены).

---

# Дополнение раунда 2 (2026-07-15)

Закрывает must-fix №2 и №4 вердикта `docs/tasks/python-track/reviews/R-research.md`;
пересчёт карточек по чеклисту G-EXEC-PY из RS-03; пейсинг уроков. Основания:
RS-02 (номера A-1…A-9, B-1…B-12), RS-03 (перепрогон python3.12, чеклист expect),
новые спайки раунда 2 — исполнены **python3.12 (3.12.13)**, файлы в `pyspike/r2_*.py`.

## D-1. Merge-карта RS-02 → уроки-кандидаты (must-fix №4)

Каждая неточность md (A-1…A-9) и каждый senior-гэп волны 1 (B-1…B-6 + B-9/B-10/B-12
из списка критика) имеет адрес-урок и исправленную формулировку. «+сегмент» = новый
сегмент сверх нарезки §4; «внутрь сег. N» = обогащение без роста числа сегментов.

| Единица RS-02 | Урок | Куда | Исправленная формулировка для урока/карточки |
|---|---|---|---|
| **A-1** global-комментарий | `py-closures-scope` | сег. 2 (переформулировка) | НЕ «без global создастся локальная»: присваивание в теле делает имя локальным на этапе КОМПИЛЯЦИИ, чтение до присваивания → `UnboundLocalError`. Текст сообщения — только из прогона 3.12 (в 3.11+ переформулирован, RS-03). Карточка c2 (c21, nonlocal-счётчик `1 2 3`) остаётся — падает не она, а старая формулировка сегмента |
| **A-2** полиморфизм «выучить дословно» | `py-object-model` | сег. 7 / explain-блок (+ P2-колода «принципы ООП») | Пример собеса чинить перед показом: `Circle.__init__(self, r)`, `Rectangle.__init__(self, w, h)`, инстансы `Circle(2), Rectangle(3, 4)` — код md в исходном виде падает `AttributeError` (исполнено RS-02) |
| **A-3** иерархия исключений | `py-exceptions` | сег. 3 (замена схемы) | `FileNotFoundError` и `ConnectionError` — подклассы **OSError**, не прямые дети Exception; киккер «`except OSError:` ловит файловые и сетевые разом». В дерево добавить `GeneratorExit` (ветка BaseException) + перекрёстный киккер в `py-generators` сег. 4 (close()/teardown генераторных фикстур) |
| **A-4** «is для синглтонов (None, True, False)» | `py-names-objects` | сег. 6 (переформулировка) | «`is` — для `None`; с `True`/`False` не сравнивают вообще — пишут `if x:` (PEP 8: `is True` — Worse)»; оговорка про осознанный выбор в тестах |
| **A-5** «~30 MB RAM» | `py-generators` | сег. 5 (переформулировка) | В сегменте — «десятки MB», без точной цифры; точное число только из замера на 3.12 при авторинге (RS-03: замер 40.3 MB был на 3.9, перемерить) |
| **A-6** «set O(1)» | `py-collections-hash` | сег. 1 (переформулировка) | «В среднем O(1), worst-case O(n) при коллизиях» — готовый follow-up собеса |
| **A-7** «super() = родитель» | `py-object-model` | сег. 4 (MRO, переформулировка) | «`super()` → следующий по MRO; при одиночном наследовании это и есть родитель; в diamond может оказаться sibling» (+ фикс B-8: убрать тон «на AQA не важно») |
| **A-8** нет RuntimeWarning | `py-async-await` | сег. 5 (обогащение) | Забытый await виден в CI-логах как `RuntimeWarning: coroutine … was never awaited` — показывать отдельным кадром как stderr; в expect карточки c1 НЕ входит (RS-03) |
| **A-9** «эквивалентно f = deco(f)» | `py-decorators` | сег. 1 (сноска) | «roughly equivalent» (формулировка docs): имя исходной функции временно НЕ привязывается — связывается один раз после применения всех декораторов |
| **B-1** GIL | `py-async-await` | **+сегмент 8** | «Почему threading не ускоряет CPU-bound»: жетон GIL передаётся между потоками (виз: один chip-жетон на timeline); хук free-threaded build 3.13+. Выбор адреса: async-урок, не names-objects — вопрос живёт рядом с конкурентностью; в names-objects только refcount-связка (B-2) |
| **B-2** refcount + циклический GC | `py-names-objects` | **+сегмент 8** | Счётчик ссылок на объекте: стрелки появляются/исчезают, ноль → объект умирает; цикл ловит `gc`. Замыкает «имена → объекты» и объясняет «файл закроется, но когда — не гарантировано» |
| **B-3** generator frame | `py-generators` | внутрь сег. 2 | ЧЕМ заморожен кадр: locals + instruction pointer + stack (дословная цитата Reference из банка C-6); спайк `gg.gi_frame.f_locals` при авторинге |
| **B-4** closure cells + late binding | `py-closures-scope` | сег. 4–5 (подтверждение) | Уже в нарезке RS-01 (c20, c26); из RS-02 добавить цитату `__closure__`/`cell_contents` (C-4.3). Новых сегментов не нужно |
| **B-5** дескрипторы (bound method) | `py-object-model` | внутрь сег. 1 | «Функция + точка = bound method»: `U.__dict__['greet'].__get__(u, U)`; property/classmethod — тот же механизм (одной фразой). Полный протокол — P2 |
| **B-6** small-int cache | `py-names-objects` | врезка в сег. 6 | **ОГРАНИЧЕНИЕ RS-03**: только конструкция `int("257")` (рантайм-объекты): `int("257") is int("257")` → False, `int("256") is …` → True (кэш −5..256); формулировка «identity малых int — деталь реализации ⇒ `is` для чисел — баг». Литералы `257 is 257` НЕ показывать как False (в одном файле — True, co_consts); **exec-карточка на identity малых int ЗАПРЕЩЕНА** |
| **B-9** (половинка) contextlib | `py-context-managers` | внутрь сег. 3 | Исключение из тела with влетает В генератор → `try/finally` вокруг `yield` в `@contextmanager` ОБЯЗАТЕЛЕН (пример timer() из md без finally — время не напечатается); то же правило для pytest-фикстур. ExitStack — P2 |
| **B-10** awaitable protocol / TaskGroup | `py-async-await` | внутрь сег. 3–5 | Три вида awaitable (coroutine, Task, Future); «calling a coroutine does not schedule it»; TaskGroup (3.11+) как современная альтернатива gather — одной фразой в сег. 6 |
| **B-12** UnboundLocalError на компиляции | `py-closures-scope` | сег. 2 (склейка с A-1) | Виз: «компилятор красит имена в цвета local/cell/global ДО выполнения» — чинит A-1 и даёт senior-глубину LEGB |

Проверка (критерий must-fix №4): 3 фактические ошибки (A-1, A-2, A-3) — адресованы;
6 гэпов волны 1 (B-1, B-2, B-3, B-4, B-5, B-6) — адресованы; довесок критика
(B-9-половинка, B-10, B-12, A-7/B-8-фикс) — адресован. Повисших единиц нет: 9/9 A + 9/9 B-волны-1 → 18/18.

## D-2. ADR: механизм verify Python-карточек (must-fix №2)

**Рекомендация RS-01 §10 «перед первым уроком добавить `run-python` в бэкенд» СНЯТА**
(соответствующие места §8-риск-2 и §10 помечены выше).

**Принято (решение оркестратора, зафиксировано):** эталоны `verify.expect` считает
АВТОР урока локальным **python3.12** на этапе авторинга — ровно так же, как
`run-csharp` использовался как авторский инструмент, а не пользовательская фича.
Endpoint `/api/run-python` НЕ строим: движок/скоуп бэкенда LOCKED (режим improvement).
Доказательство корректности expect = лог прогона версии+вывода в
`docs/tasks/python-track/evidence/` (требование RS-03 §Чеклист, п.7); карточка без
лога не получает статус `verified`.

Отклонённые альтернативы: (а) `run-python` endpoint — молчаливое расширение
LOCKED-скоупа, требует снятия LOCKED на гейте, ценности для пользователя не добавляет
(карточки predict-output исполняются не пользователем); (б) MCQ-only — узнавание
вместо генерации, нарушает методику (RS-00c), лимит MCQ ≤25% сохраняется.

## D-3. Пересчёт карточек по чеклисту G-EXEC-PY (RS-03)

Чеклист: (1) детерминизм между прогонами и способами запуска · (2) stdout-only ·
(3) без set/dict-порядка вне гарантий · (4) без таймингов/адресов/id() · (5) без `is`
на рантайм-int/str вне гарантий · (6) без текста traceback (только имя исключения
через try/except+print) · (7) прогнано python3.12. Базис: RS-03 — 24/26 спайков
байт-в-байт совпали 3.9→3.12; спорные карточки перегнаны в раунде 2 (вывод ниже —
реальный stdout python3.12.13).

| Урок · карточка (спайк) | Expect | Вердикт | Примечание |
|---|---|---|---|
| names c1 (c01) | `['a']\n['a', 'b']` | **OK** | 3.12 байт-в-байт (RS-03) |
| names c2 (c02) | `[1, 2, 3, 4]\nTrue` | **OK** | `a is b` после `b = a` — гарантия семантики привязки имён, не рантайм-identity int/str; чеклист п.5 не нарушен |
| names c3 (c03) | `(1, [2, 3, 4])` | **OK** | |
| deco c1 (c04) | `before\nafter\n5` | **OK** | |
| deco c2 (c05) | `wrapper` | **OK** | |
| deco c3 (c07) | `None` | **OK** | |
| deco c4 (c06) | `decorating foo\ndone` | **OK** | |
| gen c1 (c08) | `created\nstart\n1\nmiddle\n2` | **OK** | |
| gen c2 (c09) | `5\n0` | **OK** | |
| gen c3 (c10) | `1\nStopIteration` | **OK** | имя исключения через try/except+print (проверено ревью), traceback-текста нет — п.6 соблюдён |
| cm c1 (c11) | `enter\nbody\nexit\nafter` | **OK** | |
| cm c2 (c14) | `setup\n42\nteardown` | **OK** | |
| obj c1 (c15) | `5 0 0` | **OK** | |
| obj c2 (c16) | `B` | **OK** | |
| obj c3 (c17) | `1\nAttributeError` | **OK** | имя через try/except — п.6 |
| hints c1 (c18) | `ab` | **OK** | |
| hints c2 (c25) | ~~`TypeError…` на 3.9~~ | **ПЕРЕДЕЛАНА** | На 3.12 `int \| None` РАБОТАЕТ (прогон раунда 2: печатает `0`) — старый expect стал ложью, версиозависимость нарушает п.1/п.7. **Замена: r2_c28** — `def f(x: int) -> str: return str(x)` + `print(f.__annotations__['x'].__name__)` / `…['return'].__name__` → expect `int\nstr` (прогнано 3.12 дважды, детерминировано; усиливает тезис сегмента 1 «хинты — данные, не проверка»). PEP 604-история 3.9 остаётся справкой в сегменте 2 БЕЗ exec-карточки (RS-03) |
| async c1 (c19) | `coroutine\n42` | **OK** | перегнано в раунде 2 на 3.12 с `2>/dev/null`: stdout чистый; RuntimeWarning — stderr, в expect не входит (п.2); показать warning отдельным кадром (A-8) |
| async c2 (Q5) | — (MCQ) | **OK (MCQ-fallback)** | без expect; идёт в лимит ≤25% карточек волны (RS-03) |
| closures c1 (c20) | `[2, 2, 2]\n[0, 1, 2]` | **OK** | |
| closures c2 (c21) | `1 2 3` | **OK** | спайк — корректный nonlocal-счётчик, детерминирован; правится формулировка СЕГМЕНТА (A-1/B-12, см. D-1), не карточка |
| closures c3 (Q1) | `10 15` | **OK** | долг «проверить при сборке» ЗАКРЫТ: спайк **r2_c27** прогнан python3.12 → `10 15` |
| coll c1 (c22) | `TypeError\nok` | **OK** | имя исключения через try/except; set в expect не печатается (п.3) |
| coll c2 (c03-ракурс) | `(1, [2, 3, 4])` | **OK** | |
| exc c1 (c12) | `from finally` | **OK** | на 3.12 SyntaxWarning (PEP 765) ещё нет; с 3.14 уйдёт в stderr — expect не тронет; при смене версии раннера перепроверить |
| exc c2 (c13) | `else\nfinally` | **OK** | |
| exc c3 (c23) | `not found` | **OK** | |
| args-unpacking c1–c2 | — | не специфицированы | в RS-01 без кода; авторить сразу по чеклисту RS-03 + лог в evidence/ |
| (кандидат RS-02 B-6) «257 is 257» | — | **ЗАПРЕЩЕНА** | RS-03: недетерминированна между способами исполнения (в одном файле — True через co_consts; False — только для рантайм-объектов). Тема остаётся сегментом-врезкой через `int("257")` (см. D-1), exec-карточки нет |

**Итог: 26 OK** (из них 1 — MCQ-fallback по дизайну) **· 1 ПЕРЕДЕЛАНА** (hints c2 →
r2_c28 `int\nstr`) **· 1 ЗАПРЕЩЕНА** (small-int identity, в трек как exec не входит).
MCQ-fallback в волне: 1 из 27 специфицированных (~4%) — в лимите ≤25%.

Новые артефакты раунда 2 (все прогнаны python3.12.13, stdout дословно выше):
`pyspike/r2_c27_multiplier.py`, `pyspike/r2_c28_annotations.py`; перепрогоны
`c19` (stdout-канал), `c25` (→ `0`), `int_cache_file.py` (→ `True/True/False/True`).

## D-4. Пейсинг уроков-кандидатов

Калибровка: урок boxing = 7 сегментов ≈ 9 мин ⇒ **~1.3 мин/сегмент** (карточки урока
входят в калибровку — у boxing они есть; отдельный коэффициент на карточку не вводим).
Числа сегментов — С УЧЁТОМ merge-карты D-1 (B-1 и B-2 добавляют по сегменту).
Это ГИПОТЕЗА, унаследованная от C#-калибровки: перемерить телеметрией после волны 1
(строка ТЗ по must-fix №6 критика).

| Урок | Сегм. (после D-1) | Карточек | Пейсинг, мин |
|---|---|---|---|
| `py-names-objects` | 8 (7 + B-2) | 3 | ~10 |
| `py-decorators` | 7 | 4 | ~9 |
| `py-generators` | 6 | 3 | ~8 |
| `py-context-managers` | 5 | 2 | ~6–7 |
| `py-object-model` | 7 | 3 | ~9 |
| `py-type-hints` | 4 | 2 | ~5 |
| `py-async-await` | 8 (7 + B-1) | 2 | ~10 |
| `py-closures-scope` | 5 | 3 | ~6–7 |
| `py-collections-hash` | 5 | 2 | ~6–7 |
| `py-exceptions` | 5 | 3 | ~6–7 |
| `py-args-unpacking` | 3–4 | 1–2 | ~4–5 |

Риск пейсинга: `py-names-objects` и `py-async-await` после вплетения гэпов — на
верхней границе (~10 мин). Если телеметрия волны 1 покажет перегруз, кандидаты на
вынос: B-2 (refcount/GC) — в отдельный мини-урок P1, B-1 (GIL) — в хвостовой сегмент
без карточки. Решение — на DESIGN, не здесь.
