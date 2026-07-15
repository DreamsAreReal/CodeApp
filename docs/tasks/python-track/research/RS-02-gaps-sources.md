# RS-02 — Gap-анализ `00-python-refresher.md` против первоисточников + банк источников

Дата: 2026-07-15 · Researcher-прогон · Корпус: файл пользователя (2294 строки, прочитан целиком)
+ живой веб (docs.python.org, peps.python.org, wiki.python.org, pydantic.dev — 32 URL проверены фетчем)
+ исполнение спорных мест: **Python 3.9.6** локально (Bash, вывод зафиксирован ниже).

Ограничение среды: локальный интерпретатор — 3.9.6, а md местами описывает 3.10+ фичи
(`X | None`, `match` нет в md). Всё, что зависит от версии, помечено. Поведение 3.12+
(например, PEP 765 SyntaxWarning в 3.14) проверено по первоисточникам, не исполнением —
помечено «не исполнено локально».

---

## Сводка

- **Неточностей/упрощений-до-неверности в md: 9** (3 фактические ошибки, доказаны исполнением/офдоком; 6 упрощений на грани).
- **Senior-gaps: 12**, из них 6 рекомендованы во вплетение в волну 1.
- **Банк источников: 32 живых URL**, каждый проверен фетчем, с дословными EN-цитатами.
- md в целом добротный: ~95% проверенных утверждений подтвердились (полный реестр — §5).

---

# A. СПОТ-ЧЕК ТОЧНОСТИ (по темам)

Формат: цитата md → первоисточник/исполнение → вердикт. Спайк-скрипт исполнен, вывод
в кодовых блоках — реальный (python3 3.9.6).

## A-1. ФАКТИЧЕСКИЕ ОШИБКИ (блокеры контента — чинить до урока)

### Ошибка 1 — §5 «global»: комментарий описывает несуществующее поведение

- **md (~строка 677):** `global count  # ← без этого ниже создастся локальная`
- **Реальность (исполнено):** без `global` строка `count += 1` НЕ «создаёт локальную» —
  падает `UnboundLocalError`, потому что присваивание где угодно в теле делает имя
  локальным на этапе компиляции, а чтение до присваивания запрещено.
  ```
  UnboundLocalError: local variable 'count' referenced before assignment
  ```
- **Первоисточник:** FAQ: «that variable becomes local to that scope and shadows any
  similarly named variable in the outer scope» —
  https://docs.python.org/3/faq/programming.html#why-am-i-getting-an-unboundlocalerror-when-the-variable-has-a-value
- **Фикс:** заменить комментарий на «без этого — UnboundLocalError (имя стало локальным
  при компиляции)». Это, кстати, готовый senior-вопрос (см. gap B-12).

### Ошибка 2 — §9: пример полиморфизма «выучить дословно» — падает при запуске

- **md (~строки 1477–1489):** классы `Circle`/`Rectangle` без `__init__`, но
  `for shape in [Circle(), Rectangle()]: print(shape.area())` с пометкой
  «выучить дословно — это ровно то, что забыл».
- **Реальность (исполнено):**
  ```
  AttributeError: 'Circle' object has no attribute 'r'
  ```
  Пользователь заучит дословно код, который на собесе при «а запусти» упадёт.
- **Фикс:** добавить `__init__(self, r)` / `__init__(self, w, h)` и создавать
  `Circle(2), Rectangle(3, 4)`.

### Ошибка 3 — §11: схема иерархии исключений неверна

- **md (~строки 1638–1650):** `FileNotFoundError` и `ConnectionError` нарисованы прямыми
  детьми `Exception`.
- **Первоисточник:** оба — подклассы `OSError` (`OSError → ConnectionError → BrokenPipeError…`,
  `OSError → FileNotFoundError`) —
  https://docs.python.org/3/library/exceptions.html#exception-hierarchy
- **Исполнено:** `ConnectionError.__mro__[1].__name__ == 'OSError'`, то же для
  `FileNotFoundError`. Также в ветке `BaseException` md пропущен `GeneratorExit` —
  а он важен ровно для генераторов-фикстур (§7) и `@contextmanager`.
- **Почему важно:** `except OSError:` ловит сетевые и файловые ошибки разом — типовой
  follow-up «что поймает except OSError».

## A-2. Упрощения-до-грани (чинить формулировку)

### Упрощение 4 — §1: «`is` для синглтонов (None, True, False)» противоречит PEP 8

- **md (~строка 183):** «Правило: `is` для **синглтонов** (`None`, `True`, `False`)».
- **PEP 8:** «Comparisons to singletons like None should always be done with `is` or
  `is not`» — но для булевых: «Don't compare boolean values to True or False using ==»
  и `if greeting is True:` помечено **«Worse»**. Правильно — `if greeting:`.
  https://peps.python.org/pep-0008/#programming-recommendations
- **Фикс:** «`is` — для `None`; с `True`/`False` вообще не сравнивают — пишут `if x:`»
  (исключение — тесты, где надо отличить `True` от truthy, но это уже осознанный выбор).

### Упрощение 5 — §3/§7: «~30 MB RAM» для списка из 1M квадратов

- **md (~строка 1081):** `[x**2 for x in range(1_000_000)] # ~30 MB RAM`.
- **Исполнено:** `sys.getsizeof(list) + sum(getsizeof(int))` = **40.3 MB**
  (контейнер 8.4 MB + int-объекты). Порядок верен, цифру поправить на «~40 MB»
  или «десятки MB» (значения до 10^12 → int по 28–32 байта).

### Упрощение 6 — §3: «set поиск O(1)» без оговорки

- **md (таблица §3):** `x in set` — O(1).
- **Первоисточник:** wiki CPython TimeComplexity: set/dict `in` — **average O(1),
  worst O(n)**; «assume that the hash function … make collisions uncommon».
  https://wiki.python.org/moin/TimeComplexity
- **Фикс:** говорить «в среднем O(1)» — на собесе follow-up «а worst case?» стандартен.

### Упрощение 7 — §9: «`super()` — это обращение к родительскому классу»

- **md (~строка 1304).** При множественном наследовании `super()` идёт к **следующему
  в MRO**, а не «к родителю» (в diamond это может быть sibling).
- **Первоисточник:** глоссарий MRO + C3: «the linearization of C is the sum of C plus
  the merge of the linearizations of the parents and the list of the parents» —
  https://docs.python.org/3/howto/mro.html
- **Фикс:** одна фраза «точнее: к следующему по MRO — при одиночном наследовании это
  и есть родитель». Даёт «вау»-мостик к gap B-5.

### Упрощение 8 — §12: `print(async_func())` — не упомянут RuntimeWarning

- **md (~строка 1812):** показан только `<coroutine object ...>`.
- Реально CPython при сборке невызванной корутины печатает
  `RuntimeWarning: coroutine ... was never awaited` — это главный симптом бага
  «забыл await» в реальных логах. Первоисточник: asyncio docs («simply calling a
  coroutine will not schedule it to be executed») —
  https://docs.python.org/3/library/asyncio-task.html#coroutines
- **Фикс:** добавить строку про warning — это то, что видно в CI-логах.

### Упрощение 9 — §6: «Эквивалентно: my_func = my_decorator(my_func)»

- **md (~строка 747).** Language Reference уточняет: «except that the original function
  is not temporarily bound to the name func» (имя связывается один раз, после применения
  всех декораторов) —
  https://docs.python.org/3/reference/compound_stmts.html#function-definitions
- Для урока хватит сноски; «roughly equivalent» — формулировка самих докс.

## A-3. Что проверено и ПОДТВЕРДИЛОСЬ (выборка, всё исполнено)

- `Counter("mississippi").most_common(3)` → `[('i', 4), ('s', 4), ('p', 2)]` ✅
- 4-й `next(g)` печатает «After 3», затем `StopIteration` ✅
- `D(B, C)` → `d.hello() == 'B'`, MRO `[D, B, C, A, object]` ✅
- `return` в `finally` → `"from finally"` ✅ (и md прав, что это антипаттерн — теперь
  официально: PEP 765, SyntaxWarning с 3.14 — не исполнено локально, версия 3.9)
- `await` в обычной `def` → `SyntaxError: 'await' outside async function` ✅
- `(1, [2,3])`: `t[1].append(4)` OK, `hash(t)` → `TypeError: unhashable type: 'list'` ✅
- `frozen=True` dataclass → `FrozenInstanceError` (подкласс AttributeError) ✅
- f-строки: `f"{x=}"`, `f"{0.85:.1%}"`, `f"{42:>5}"`, `f"{7:04d}"`, `!r`, срезы ✅
- `random.randint(1, 3)` включает верхнюю границу ✅
- Декораторы снизу вверх — подтверждено Reference (`func = f1(arg)(f2(func))`) ✅
- Mutable default: подтверждено Tutorial 4.9.1 («The default value is evaluated only once») ✅
- dict упорядочен с 3.7: whatsnew 3.7 («declared to be an official part of the Python
  language spec») ✅
- Name mangling `_ClassName__spam` — дословно совпадает с Tutorial 9.6 ✅
- Pydantic `id="1"` → `1`: pydantic docs («the string '123' was coerced to an integer») ✅
- Type hints не проверяются в runtime: PEP 484 («no type checking happens at runtime») ✅

---

# B. SENIOR-DEPTH GAPS («как будто сам спроектировал язык»)

Вердикт: **волна 1** = вплетать в существующие разделы md (даёт вау-глубину + анимируется);
**P2** = отдельный урок/поздняя волна.

| # | Gap | Чего нет в md | Вердикт | Почему / чем анимировать |
|---|---|---|---|---|
| B-1 | **GIL** | Слово «GIL» в md отсутствует вообще | **Волна 1** (в §12) | Топ-вопрос senior-собеса рядом с async: «почему threading не ускоряет CPU-bound». Анимация: один «жетон» GIL передаётся между потоками. Свежий хук: free-threaded build 3.13+ (GIL выключаем). Цитаты: glossary GIL, howto free-threading |
| B-2 | **Refcounting + циклический GC** | Модель памяти без «кто удаляет объект» | **Волна 1** (в §1, mutable/immutable) | Замыкает историю «имена→объекты»: счётчик ссылок на объекте, стрелки появляются/исчезают, цикл ловит gc. Объясняет и «файл закроется, но когда — не гарантировано» из §8. Цитата: gc docs («supplements the reference counting») |
| B-3 | **Generator frame: как yield замораживает кадр** | md говорит «замораживается», но не ЧЕМ | **Волна 1** (в §7) | Reference даёт дословно анимируемое: сохраняются locals, instruction pointer, stack. Спайк: `gg.gi_frame.f_locals == {'x': 10}` после next(). Прямое усиление фикстур-истории |
| B-4 | **Closure cells** (`__closure__`, `cell_contents`) + **late binding в цикле** | Замыкания без механики; ловушка `lambda i: i` в цикле не покрыта | **Волна 1** (в §5) | Спайк: `dbl.__closure__[0].cell_contents == 2`. Анимация: общая «коробка-cell» между outer и inner. Late-binding-ловушка — классика собеса, в md её НЕТ |
| B-5 | **Дескрипторный протокол** (методы/property/classmethod = дескрипторы) | md: «u.greet() под капотом User.greet(u)» — но не сказано, КАК | **Волна 1** (в §9, коротко) + полный протокол P2 | Descriptor HowTo: «It is how functions turn into bound methods». Спайк: `U.__dict__['greet'].__get__(u, U)` → bound method. Одна анимация «функция + точка = bound method» связывает methods/property/classmethod в один механизм |
| B-6 | **Small-int cache / string interning** | Нет; а раздел `is` vs `==` прямо просит | **Волна 1** (в §1, врезка) | Спайк: `256 is 256 → True`, `257 is 257 → False` (в разных statement). Дёшево, «вау», объясняет почему `is` для чисел/строк — баг. Цитата: C-API («array of integer objects for all integers between -5 and 256») |
| B-7 | **Устройство dict** (compact dict, почему insertion order с 3.7) | md даёт факт «3.7+» без «почему» | **P2** | Красиво анимируется (indices-массив + entries-массив), но на AQA-собесе глубже факта не спрашивают. В волну 1 — только цитату whatsnew 3.7 |
| B-8 | **MRO C3 механика** (merge, почему `D(B,C)` даёт B) | md называет C3 и советует «не важно» | **P2**, но убрать «на AQA не очень важно» и поправить super() (см. A-7) | Follow-up «а что делает super() в diamond» ловит senior. Волна 1 — только фикс формулировки |
| B-9 | **contextlib внутренности**: `@contextmanager` = генератор + `throw()` внутрь; `ExitStack` | md показывает `@contextmanager`, но без «исключение из with влетает В генератор» | **Волна 1 — половинка** (одна фраза + try/finally вокруг yield ОБЯЗАТЕЛЕН), ExitStack — P2 | В md-примере `timer()` yield БЕЗ try/finally — при исключении в блоке время не напечатается. Это же правило pytest-фикстур. Цитата: contextlib docs |
| B-10 | **Awaitable protocol / корутина-как-генератор / Task vs coroutine** | md даёт аналогию «await ≈ yield», но без подтверждения и без Task | **Волна 1** (в §12) | PEP 492 дословно легитимизирует аналогию md: «Internally, coroutines are a special kind of generators». Добавить: 3 вида awaitable (coroutines, Tasks, Futures), «calling a coroutine does not schedule it», TaskGroup (3.11) как современный gather |
| B-11 | **Байткод и `dis`** | Нет | **P2** | Один кадр `dis.dis(add)` в декораторах — приятно, но не критично; bytecode — implementation detail (docs) |
| B-12 | **LEGB: cell vs global, UnboundLocalError на этапе компиляции** | LEGB есть, но без «имя становится локальным при компиляции» | **Волна 1** (в §5) — обязан, т.к. чинит Ошибку 1 | Анимация: компилятор красит имена в цвета (local/cell/global) ДО выполнения. FAQ-цитата готова |

**Топ-5 в волну 1 (по соотношению вау-глубина × вероятность на собесе × анимируемость):**
B-1 GIL → B-2 refcount+GC → B-3 generator frame → B-4 closure cells + late binding → B-5 дескрипторы (bound method).
Шестым бесплатно идёт B-6 (small-int cache) — 10 строк и готовый «вау».

---

# C. БАНК ПЕРВОИСТОЧНИКОВ (все URL живые, проверены фетчем 2026-07-15)

Формат: URL → что содержит → дословная EN-цитата (образец для «каждое утверждение
урока обязано иметь первоисточник»).

## C-1. Модель памяти: имена → объекты, mutable/immutable, mutable default

1. https://docs.python.org/3/reference/datamodel.html#objects-values-and-types
   — «Every object has an identity, a type and a value.»; «Objects whose value can
   change are said to be *mutable*; objects whose value is unchangeable once they are
   created are called *immutable*.»
2. https://docs.python.org/3/tutorial/controlflow.html#default-argument-values
   — «**Important warning:** The default value is evaluated only once. This makes a
   difference when the default is a mutable object such as a list…»
3. https://docs.python.org/3/faq/programming.html#why-are-default-values-shared-between-objects
   — «Default values are created exactly once, when the function is defined.»
4. https://docs.python.org/3/library/gc.html — (для B-2) «the collector supplements the
   reference counting already used in Python».
5. https://docs.python.org/3/c-api/long.html#c.PyLong_FromLong — (для B-6) «CPython keeps
   an array of integer objects for all integers between -5 and 256.»

## C-2. Строки и f-strings

1. https://peps.python.org/pep-0498/ — «an f-string is a literal string, prefixed with
   'f', which contains expressions inside braces»; «an f-string is really an expression
   evaluated at run time, not a constant value».
2. https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str
   — «There is also no mutable string type, but str.join() or io.StringIO can be used
   to efficiently construct strings from multiple fragments.» *(страница огромная,
   фетчер режет — цитата из секции str получена, dict-секцию бери по якорю ниже)*
3. https://peps.python.org/pep-0008/#programming-recommendations — «Comparisons to
   singletons like None should always be done with `is` or `is not`, never the equality
   operators.» + «Don't compare boolean values to True or False using ==».

## C-3. Коллекции list / dict / set / tuple

1. https://docs.python.org/3/tutorial/datastructures.html — «A set is an unordered
   collection with no duplicate elements.»; «dictionaries are indexed by *keys*, which
   can be any immutable type»; «You can't use lists as keys».
2. https://docs.python.org/3/whatsnew/3.7.html — «the insertion-order preservation
   nature of dict objects has been declared to be an official part of the Python
   language spec.»
3. https://docs.python.org/3/glossary.html#term-hashable — «An object is *hashable* if
   it has a hash value which never changes during its lifetime… Hashable objects which
   compare equal must have the same hash value.»
4. https://wiki.python.org/moin/TimeComplexity — set/dict `x in s`: average O(1),
   worst O(n); list `x in s`: O(n).
5. https://docs.python.org/3/library/stdtypes.html#mapping-types-dict — «Dictionaries
   preserve insertion order» *(якорь живой; полнотекстовую цитату фетчер не вытянул из-за
   размера страницы — для урока дублировать факт цитатой из whatsnew 3.7, п.2)*.

## C-4. Функции, scope, замыкания

1. https://docs.python.org/3/tutorial/classes.html#python-scopes-and-namespaces
   — «At any time during execution, there are 3 or 4 nested scopes whose namespaces are
   directly accessible: the innermost scope… the scopes of any enclosing functions…
   the current module's global names… built-in names» (это и есть LEGB).
2. https://docs.python.org/3/faq/programming.html#why-am-i-getting-an-unboundlocalerror-when-the-variable-has-a-value
   — присваивание в теле функции делает имя локальным → UnboundLocalError.
3. https://docs.python.org/3/reference/datamodel.html (Callable types → function
   attributes) — `function.__closure__`: «None or a tuple of cells that contain bindings
   for the names specified in the co_freevars attribute»; «A cell object has the
   attribute `cell_contents`.»
4. https://docs.python.org/3/reference/executionmodel.html#naming-and-binding
   — нормативная база про binding/free variables *(страница живая; в этом прогоне
   контент отдельно не цитировался — цитаты по scope взяты из Tutorial/FAQ)*.

## C-5. Декораторы

1. https://docs.python.org/3/reference/compound_stmts.html#function-definitions
   — «is roughly equivalent to … `func = f1(arg)(f2(func))` … except that the original
   function is not temporarily bound to the name func.» (порядок снизу вверх — отсюда).
2. https://peps.python.org/pep-0318/ — мотивация: «move the transformation of the
   method closer to the method's own declaration».
3. https://docs.python.org/3/glossary.html#term-decorator — «A function returning
   another function, usually applied as a function transformation using the `@wrapper`
   syntax.»
4. https://docs.python.org/3/library/functools.html#functools.wraps — «Update a
   *wrapper* function to look like the *wrapped* function»; копирует `__module__`,
   `__name__`, `__qualname__`, `__doc__`… и добавляет `__wrapped__`.

## C-6. Генераторы и yield

1. https://docs.python.org/3/reference/expressions.html#yield-expressions
   — ★ ключевая цитата для анимации кадра: «By suspended, we mean that all local state
   is retained, including the current bindings of local variables, the instruction
   pointer, the internal evaluation stack, and the state of any exception handling.»
2. https://docs.python.org/3/glossary.html#term-generator — определение generator /
   generator iterator.

## C-7. Context managers

1. https://docs.python.org/3/reference/compound_stmts.html#the-with-statement
   — «The with statement guarantees that if the `__enter__()` method returns without an
   error, then `__exit__()` will always be called.»
2. https://peps.python.org/pep-0343/ — «This PEP adds a new statement "with" to the
   Python language to make it possible to factor out standard uses of try/finally
   statements.» (+ полная трансляция в try/finally).
3. https://docs.python.org/3/library/contextlib.html#contextlib.contextmanager
   — «At the point where the generator yields, the block nested in the with statement
   is executed.»; must «yield exactly one value». ExitStack: «programmatically combine
   other context managers and cleanup functions».
4. https://docs.python.org/3/glossary.html#term-context-manager — определение.

## C-8. Классы, OOP, MRO, дескрипторы

1. https://docs.python.org/3/howto/descriptor.html — ★ «Descriptors are used throughout
   the language. **It is how functions turn into bound methods.** Common tools like
   classmethod(), staticmethod(), property()… are all implemented as descriptors.»
2. https://docs.python.org/3/howto/mro.html — «the linearization of C is the sum of C
   plus the merge of the linearizations of the parents and the list of the parents.»
3. https://docs.python.org/3/glossary.html#term-method-resolution-order — определение MRO.
4. https://docs.python.org/3/tutorial/classes.html#private-variables — «Any identifier
   of the form `__spam` (at least two leading underscores, at most one trailing
   underscore) is textually replaced with `_classname__spam`»; «nothing in Python makes
   it possible to enforce data hiding — it is all based upon convention.»
5. https://docs.python.org/3/library/abc.html — «cannot be instantiated unless all of
   its abstract methods and properties are overridden» (PEP 3119 упомянут в первой строке;
   сам https://peps.python.org/pep-3119/ отдельно не фетчился в этом прогоне).
6. https://docs.python.org/3/library/dataclasses.html — «a decorator and functions for
   automatically adding generated special methods such as `__init__()` and `__repr__()`»;
   frozen: «assigning to fields will generate an exception. This emulates read-only
   frozen instances.» (PEP 557 — та же нормативка, реализация в этом модуле).

## C-9. Type hints + Pydantic

1. https://peps.python.org/pep-0484/ — «Python will remain a dynamically typed language,
   and the authors have no desire to ever make type hints mandatory, even by
   convention.»; «no type checking happens at runtime».
2. https://docs.python.org/3/library/typing.html — «The Python runtime does not enforce
   function and variable type annotations.»; «Optional[X] is equivalent to X | None».
3. https://pydantic.dev/docs/validation/latest/concepts/models/ — «Models are simply
   classes which inherit from BaseModel and define fields as annotated attributes.»;
   coercion: «the string '123' was coerced to an integer».
   *(Внимание: канонический URL docs.pydantic.dev/latest/concepts/models/ теперь
   301-редиректит сюда — в уроках ставить новый адрес.)*

## C-10. Исключения

1. https://docs.python.org/3/library/exceptions.html#exception-hierarchy — полное дерево
   (ConnectionError/FileNotFoundError под OSError!); «All built-in, non-system-exiting
   exceptions are derived from this class [Exception]. All user-defined exceptions
   should also be derived from this class.»
2. https://docs.python.org/3/reference/compound_stmts.html#the-try-statement
   — ★ «If the finally clause executes a return, break or continue statement, the saved
   exception is discarded.»
3. https://peps.python.org/pep-0765/ — Final, Python 3.14: withdraw support for
   return/break/continue exiting a finally block (SyntaxWarning). Подтверждает md-тезис
   «антипаттерн» официальной нормой.

## C-11. Async / await, event loop, GIL

1. https://peps.python.org/pep-0492/ — ★ «Internally, coroutines are a special kind of
   generators, every await is suspended by a yield somewhere down the chain of await
   calls.» (официально легитимизирует аналогию md «корутина — родственник генератора»);
   «await, similarly to yield from, suspends execution… until … awaitable completes».
2. https://docs.python.org/3/library/asyncio-task.html — «simply calling a coroutine
   will not schedule it to be executed»; «There are three main types of *awaitable*
   objects: coroutines, Tasks, and Futures»; gather: «Run awaitable objects in the aws
   sequence *concurrently*»; «asyncio.TaskGroup class provides a more modern alternative
   to create_task()».
3. https://docs.python.org/3/glossary.html#term-global-interpreter-lock — «The mechanism
   used by the CPython interpreter to assure that only one thread executes Python
   bytecode at a time.»
4. https://docs.python.org/3/howto/free-threading-python.html — «Starting with the 3.13
   release, CPython has support for a build of Python called free threading where the
   global interpreter lock (GIL) is disabled.»
5. https://docs.python.org/3/glossary.html#term-coroutine — «Coroutines can be entered,
   exited, and resumed at many different points.»

## C-12. Внутренности CPython (для gaps B-2, B-11)

1. https://docs.python.org/3/library/gc.html — refcounting + циклический сборщик (цитата в C-1.4).
2. https://docs.python.org/3/library/dis.html — «The dis module supports the analysis of
   CPython bytecode by disassembling it.»; «Bytecode is an implementation detail of the
   CPython interpreter.»
3. ~~https://devguide.python.org/internals/garbage-collector/~~ — **404 на 2026-07-15**,
   в банк НЕ включён (устойчивая замена — library/gc.html). Не использовать в уроках
   без перепроверки актуального пути devguide.

---

## 5. Реестр покрытия

Закрытый корпус (11 тем из ТЗ) — 11/11 покрыты по A (спот-чек) и C (≥2 URL на тему);
B-кандидаты из ТЗ — 12/12 разобраны с вердиктом. md прочитан 2294/2294 строк.

| Тема | A спот-чек | B gap | C URL |
|---|---|---|---|
| Модель памяти / mutable default | ✅ (Ош.-, Упр.5) | B-2, B-6 | 5 |
| Строки / f-strings | ✅ (исполнено) | — | 3 |
| Коллекции | ✅ (Упр.6) | B-7 | 5 |
| Функции / scope / замыкания | ✅ (Ош.1) | B-4, B-12 | 4 |
| Декораторы | ✅ (Упр.9) | B-11 | 4 |
| Генераторы | ✅ | B-3 | 2 |
| Context managers | ✅ | B-9 | 4 |
| Классы / OOP / MRO | ✅ (Ош.2, Упр.7) | B-5, B-8 | 6 |
| Type hints / Pydantic | ✅ | — | 3 |
| Исключения | ✅ (Ош.3) | — | 3 |
| Async / await | ✅ (Упр.8) | B-1, B-10 | 5 |

Итого уникальных живых URL: **32** (glossary/compound_stmts/faq/tutorial-classes считаны
по одному разу, используются в нескольких темах).

## 6. Противоречия источников

- md «is для None/True/False» ↔ PEP 8 «is True — Worse» — разрешено в пользу PEP 8 (A-4).
- md-схема исключений ↔ официальное дерево — в пользу docs (A-3).
- Прочих межисточниковых противоречий не найдено (docs/PEP/исполнение согласованы).

## 7. Что не удалось выяснить / деградации

- `docs.python.org/3/library/stdtypes.html`: страница живая, но слишком большая для
  фетчера — дословная цитата «Dictionaries preserve insertion order» не вытянута
  (заменена эквивалентной нормой из whatsnew/3.7). Для урока при вёрстке цитаты —
  перепроверить якорь #mapping-types-dict вручную.
- devguide GC — 404 (см. C-12.3).
- Локально Python 3.9.6: поведение 3.12–3.14 (PEP 765 warning, f-string PEP 701)
  не исполнено — только по первоисточникам.
- PEP 3119 и executionmodel.html отдельным фетчем не цитировались (норма покрыта
  library/abc.html и Tutorial/FAQ соответственно) — при использовании в уроке как
  прямых ссылок сделать контрольный фетч.

## 8. Рекомендация

1. **До волны 1 починить 3 фактические ошибки** (A-1…A-3) и формулировку про PEP 8
   (A-4) — это прямой риск №1 продукта (точность), всё с готовыми цитатами и
   исполненными доказательствами.
2. В волну 1 вплести 6 gaps: **GIL, refcount+GC, generator frame, closure cells +
   late binding, дескрипторы (bound method), small-int cache** — каждый анимируется и
   имеет дословную цитату из банка C.
3. B-7 (устройство dict), B-8 (C3 merge), B-9-полный (ExitStack/throw), B-11 (dis) — P2.
4. Каждому экрану урока прикладывать цитату из банка C в формате «EN-цитата + URL+якорь»
   — банк построен так, что на все 11 тем есть ≥2 независимых первоисточника
   (Reference/PEP + Tutorial/HowTo).
