# GT-s1: Классы, наследование, virtual dispatch в C# — проверяемые факты (Microsoft Learn)

**Дата сбора**: 2026-07-18
**Корпус**: нормативная база — официальная документация Microsoft Learn (действующая редакция страниц `dotnet/csharp/...`).
**Метод**: WebFetch полных страниц Learn (en) + WebSearch с фильтром `allowed_domains=learn.microsoft.com`.
**Провенанс**: класс A (первичная офдокументация вендора языка). Цитаты дословные (en), из зафиксированных редакций страниц (`ms.date` / `updated_at` указаны у каждого источника).
**Оговорка (п.3b)**: `microsoft_docs_search` (MCP Microsoft Learn) в этой сессии оказался недоступен (`No such tool available`) — вместо него использованы WebSearch(learn.microsoft.com) + WebFetch тех же страниц Learn; корпус тот же (нормативный), деградации нет.
**PII**: объектов-людей нет.

## Источники (все проверены fetch 2026-07-18)

- **S1** Inheritance — https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance (ms.date 2021-05-14; updated 2026-06-11)
- **S2** Polymorphism — https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/polymorphism (ms.date 2025-10-13; updated 2025-10-17)
- **S3** `virtual` keyword — https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/virtual (ms.date 2026-01-22; updated 2026-01-26)
- **S4** `sealed` modifier — https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/sealed (ms.date 2026-06-05; updated 2026-06-11)
- **S5** Versioning with the Override and New Keywords — https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/versioning-with-the-override-and-new-keywords (ms.date 2015-07-20; updated 2024-05-16)

Природа фактов — конвенции языка/семантика (стабильны годами), возраст страниц несущественен (п.3).

---

## Проверяемые утверждения

### Наследование (базовая механика)

**F1.** Производный класс может иметь только один прямой базовый класс, но наследование транзитивно (C→B→A наследует членов B и A). Источник: S1.
> «A derived class can have only one direct base class. However, inheritance is transitive.»
Уверенность: высокая.

**F2.** При наследовании производный класс неявно получает всех членов базового класса, КРОМЕ конструкторов и финализаторов. Источник: S1.
> «the derived class implicitly gains all the members of the base class, except for its constructors and finalizers.»
Уверенность: высокая.

**F3.** Структуры не поддерживают наследование (но реализуют интерфейсы); структуры неявно `sealed`, наследоваться от них нельзя. Источники: S1 («Structs don't support inheritance, but they can implement interfaces.»), S4 («Because structs are implicitly sealed, you can't inherit from them.»).
Уверенность: высокая.

### virtual / override — семантика виртуальной диспетчеризации

**F4.** По умолчанию методы в C# НЕ виртуальны; невиртуальный метод переопределить нельзя. Источники: S3, S5.
> S3: «By default, methods are non-virtual. You can't override a non-virtual method.»
> S5: «By default, C# methods are not virtual.»
Уверенность: высокая.

**F5.** Производный класс может переопределить член базового класса ТОЛЬКО если тот объявлен `virtual` или `abstract`, и переопределяющий член ОБЯЗАН использовать ключевое слово `override`. Источник: S2.
> «A derived class can override a base class member only if the base class member is declared as virtual or abstract. The derived member must use the override keyword to explicitly indicate that the method is intended to participate in virtual invocation.»
Уверенность: высокая.

**F6.** Виртуальными могут быть только методы, свойства, события и индексаторы — поля виртуальными быть НЕ могут. Источник: S2.
> «Fields can't be virtual; only methods, properties, events, and indexers can be virtual.»
Уверенность: высокая.

**F7.** (Ядро virtual dispatch, рантайм) При вызове метода клиентским кодом CLR смотрит на РАНТАЙМ-тип объекта и вызывает соответствующий override виртуального метода — так что вызов метода на базовом типе может выполнить версию из производного класса. Источник: S2.
> «At run-time, when client code calls the method, the CLR looks up the run-time type of the object, and invokes that override of the virtual method. In your source code you can call a method on a base class, and cause a derived class's version of the method to be executed.»
Уверенность: высокая.
Примечание корпуса: страницы Learn формулируют механику как «CLR looks up the run-time type… invokes that override». Термин «method table / vtable» на этих страницах Learn НЕ встречается — во избежание вымысла из памяти он в утверждениях НЕ заявлен (при необходимости уровня IL/CLR — отдельная линза по ECMA-335/BOTR, не покрыта этим сбором). Пометка: `НЕПОКРЫТО: явная терминология method-table на страницах C# fundamentals`.

**F8.** При вызове виртуального метода рантайм проверяет тип объекта на наличие переопределяющего члена и вызывает переопределение в САМОМ производном классе; если ни один производный класс не переопределил член — вызывается исходный. Источник: S3.
> «When you invoke a virtual method, the runtime checks the type of the object for an overriding member. It calls the overriding member in the most derived class. If no derived class overrides the member, the original member is called.»
Уверенность: высокая.

**F9.** Когда производный класс переопределяет виртуальный член, этот член вызывается ДАЖЕ если к экземпляру обращаются как к экземпляру базового класса (`BaseClass A = B; A.DoWork()` вызывает переопределённый метод). Источник: S2.
> «When a derived class overrides a virtual member, that member is called even when an instance of that class is being accessed as an instance of the base class.»
Уверенность: высокая.

**F10.** Виртуальность транзитивна: член остаётся виртуальным независимо от числа классов между исходным объявлением и наследником (A→B→C: C может переопределить, даже если B не переопределял). Источник: S2.
> «Virtual members remain virtual, regardless of how many classes are declared between the virtual member and the class that originally declared it.»
Уверенность: высокая.

**F11.** Переопределяющий метод может вызвать реализацию базового класса через ключевое слово `base` (`base.DoWork()`). Источники: S2, S5.
> S5: «The base class method can be called from within the derived class using the base keyword.»
Уверенность: высокая.

### new — скрытие (hiding) vs override

**F12.** `new` СКРЫВАЕТ (hides) член базового класса, а не переопределяет его; при скрытии вызванный метод зависит от КОМПАЙЛ-ТАЙМ типа переменной, а не от рантайм-типа объекта. Источник: S2.
> «When you use the new keyword, you're creating a method that hides the base class method rather than overriding it. This is different from virtual methods. With method hiding, the method that gets called depends on the compile-time type of the variable, not the run-time type of the object.»
Уверенность: высокая.
Контраст-пара с F7/F9: override → рантайм-тип; new/hiding → декларируемый (компайл-тайм) тип.

**F13.** Скрытые члены базового класса доступны из клиентского кода приведением экземпляра производного класса к базовому (`BaseClass A = (BaseClass)B; A.DoWork()` вызывает старый метод). Источник: S2.
> «Hidden base class members can be accessed from client code by casting the instance of the derived class to an instance of the base class.»
> «the method that gets called depends on the variable's declared type: DerivedClass.DoWork() when accessed through the DerivedClass variable, and BaseClass.DoWork() when accessed through the BaseClass variable.»
Уверенность: высокая.

**F14.** Одновременно использовать `new` и `override` на одном члене — ошибка: модификаторы взаимоисключающие (`new` создаёт новый член и скрывает исходный; `override` расширяет реализацию наследованного). Источник: S (WebSearch-дайджест Learn override-модификатора, сверено с семантикой S5).
> «It's an error to use both new and override on the same member, because the two modifiers have mutually exclusive meanings.»
Уверенность: высокая. Провенанс: цитата из результата WebSearch по learn.microsoft.com (страница override-модификатора); согласуется с S5. Для строгой первички — при использовании перепроверить fetch страницы `.../keywords/override`.

### Порядок разрешения и предупреждения компилятора

**F15.** Если метод в производном классе не помечен ни `new`, ни `override`, компилятор выдаёт предупреждение (CS0108) и метод ведёт себя так, как будто присутствует `new` (скрытие — поведение по умолчанию). Источник: S5 (подтверждено также S1).
> S5: «If the method in the derived class is not preceded by new or override keywords, the compiler will issue a warning and the method will behave as if the new keyword were present.»
> S5: «you will receive a warning from the compiler, CS0108.»
> S1: «The use of new isn't required, but a compiler warning is generated if new isn't used.»
Уверенность: высокая.

**F16.** (Порядок разрешения перегрузок vs override) Методы `override` НЕ считаются объявленными на данном классе — это новые реализации метода, объявленного в базовом классе. Компилятор сначала пытается сопоставить вызов с методами, объявленными непосредственно на производном классе, и только если совпадения нет — с переопределённым методом. Источник: S5.
> «Override methods are not considered as declared on a class, they are new implementations of a method declared on a base class. Only if the C# compiler cannot match the method call to an original method on Derived, it will try to match the call to an overridden method with the same name and compatible parameters.»
Пример-ловушка (S5): при `override void DoWork(int)` + `void DoWork(double)` вызов `d.DoWork(5)` идёт в `DoWork(double)` (неявное расширение int→double); чтобы попасть в переопределённый `DoWork(int)`, нужно привести к базовому типу: `((Base)d).DoWork(val)`.
Уверенность: высокая.

**F17.** (Версионирование) C# спроектирован так, что добавление в базовый класс нового члена с тем же именем, что и у члена производного класса, полностью поддерживается и не ведёт к неожиданному поведению; уже развёрнутый бинарник остаётся совместим, а предупреждение CS0108 возникает лишь при перекомпиляции с новой версией базового класса. Источник: S5.
> «the introduction of a new member in a base class with the same name as a member in a derived class is completely supported by C# and does not lead to unexpected behavior.»
> «The new version is still binary compatible with the old version.»
Уверенность: высокая.

### sealed — запрет дальнейшего наследования/переопределения

**F18.** `sealed` на классе запрещает наследование от него (`class MyDerivedC: SealedClass {}` → ошибка «cannot derive from sealed type»). Источник: S4.
> «When you apply the sealed modifier to a class, it prevents other classes from inheriting from that class.»
Уверенность: высокая.

**F19.** `sealed` можно применить к методу/свойству, ПЕРЕОПРЕДЕЛЯЮЩЕМУ виртуальный член базового класса: это останавливает дальнейшее переопределение (`sealed` ставится перед `override`); при этом класс всё ещё можно наследовать. Дальнейшая попытка override запечатанного члена → ошибка CS0239. Источники: S4, S2.
> S2: «A derived class can stop virtual inheritance by declaring an override as sealed. Stopping inheritance requires putting the sealed keyword before the override keyword.»
> S4: «When you apply the sealed modifier to a method or property, always use it with override.»
> S4 (пример): «Attempting to override F causes compiler error CS0239.»
Уверенность: высокая.

**F20.** Запечатанный (`sealed override`) метод перестаёт быть виртуальным для классов, производных от запечатавшего, но остаётся виртуальным для экземпляров самого этого класса (даже при приведении к более базовому типу); его всё ещё можно СКРЫТЬ через `new` в дальнейшем производном классе. Источник: S2.
> «the method DoWork is no longer virtual to any class derived from C. It's still virtual for instances of C, even if they're cast to type B or type A. Sealed methods can be replaced by derived classes by using the new keyword.»
Уверенность: высокая.

### abstract (сопутствующее)

**F21.** Если базовый класс объявляет член `abstract`, он ОБЯЗАН быть переопределён в любом не-абстрактном классе, прямо наследующем от него; абстрактный класс нельзя инстанцировать оператором `new`. Источник: S1.
> «If a base class declares a member as abstract, that method must be overridden in any non-abstract class that directly inherits from that class.»
> «You can declare a class as abstract if you want to prevent direct instantiation by using the new operator.»
Уверенность: высокая.

---

## Реестр покрытия (закрытый набор запрошенных подтем)

| Подтема (из запроса) | Утверждения | Источник(и) | Покрыто |
|---|---|---|---|
| Семантика virtual vs override | F4, F5, F7, F8, F9, F10 | S2, S3, S5 | да |
| new hiding vs override (компайл-тайм vs рантайм) | F12, F13, F14 | S2, override-page | да |
| sealed (класс + member) | F18, F19, F20 | S4, S2 | да |
| Порядок разрешения / предупреждения компилятора | F15, F16, F17 | S5, S1 | да |
| Что происходит в рантайме (виртуальная диспетчеризация) | F7, F8, F9 | S2, S3 | да (на уровне формулировок Learn) |
| method table / vtable (термин) | — | — | НЕПОКРЫТО (нет на страницах C# fundamentals; см. прим. F7) |
| Наследование (базис) + abstract | F1, F2, F3, F6, F11, F21 | S1, S2, S4 | да |

**Критерий остановки (закрытый корпус)**: все 6 запрошенных подтем адресованы; извлечено 21 утверждение (запрошено 12–18 → перевыполнено), каждое с URL и дословной цитатой. Единственный НЕ покрытый пункт — явный термин «method table» — отсутствует в целевом корпусе C# fundamentals и НЕ сфабрикован (требует отдельной линзы по ECMA-335 / dotnet BOTR, вне скоупа этого сбора).

## Что не удалось / границы
- MCP `microsoft_docs_search`/`microsoft_docs_fetch` недоступны в сессии → тот же нормативный корпус взят через WebSearch(learn.microsoft.com)+WebFetch (не деградация корпуса, п.3b).
- «Method table / vtable» как машинный слой (ставка вау «уровень ниже абстракции»): на страницах C# fundamentals термина нет; для урока этот слой добывать отдельно (ECMA-335 §I.8.10, dotnet/runtime BOTR type-loader) — вне данной линзы, зафиксировано как НЕПОКРЫТО.
- F14 — цитата из WebSearch-выдачи страницы `.../keywords/override`; при использовании в деливерабле перепроверить прямым fetch этой страницы.
