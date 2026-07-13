# Verbatim-аудит англ. «…»-цитат (критическая фикс-волна точности)

Риск №1 из финального VERIFY: часть англ. цитат в кавычках-ёлочках «…» были ПЕРЕФРАЗОМ
под видом дословных (verbatim). Проведён СПЛОШНОЙ посимвольный аудит КАЖДОЙ «…»-цитаты
во всех 6 уроках и починка каждого расхождения.

## Метод

- Источник цитаты определялся по `source`-id поля и его записи в `sources[]`.
- Текст источника получен: сперва `archived` (Wayback-снапшот, приколот в `sources[]`);
  для 5 незамороженных URL — `url` (live).
- WebFetch к web.archive.org в этом окружении заблокирован → снапшоты скачаны через
  `curl -sL <archived-url>` (все HTTP 200), сконвертированы в текст, грепались по фразам.
- Сравнение посимвольное, игнорируя обрамляющие HTML-теги `<code>/<b>/<span>/<i>`, но НЕ
  игнорируя слова/порядок/залог/пунктуацию внутри цитаты. «…» внутри цитаты — легитимный
  пропуск: проверялось, что ОБЕ части существуют дословно и в том же порядке (композит).
- Типографская нормализация апострофа `’`(U+2019)→`'`(ASCII) считалась приемлемой
  (консистентна по всему набору уроков, не меняет слова).

## Источники (снапшоты, HTTP-статус на момент аудита)

| id | frozen? | статус |
|----|---------|--------|
| ms-lambda | archived 20260113 | 200 |
| cs-value-types | archived 20240926 | 200 |
| cs-struct | archived 20241116 | 200 |
| cs-classes | archived 20241119 | 200 |
| cs-reference-types | archived 20230319 | 200 |
| cs-struct-guidelines (ms-struct) | archived 20220918 | 200 |
| cs-spec-foreach (statements) | archived 20230623 | 200 |
| ms-gc | archived 20251030 | 200 |
| ms-loh | archived 20220922 | 200 |
| ms-idisposable | archived 20220922 | 200 |
| ms-boxing | archived 20251029 | 200 |
| ms-thread-stack | archived 20250708 | 200 |
| ms-generics | archived 20220925 | 200 |
| ms-il-box (0x8C) | LIVE (не заморожен) | 200 |
| ms-il-unbox (0xA5) | LIVE (не заморожен) | 200 |
| ms-dictionary | LIVE (не заморожен) | 200 |

Незамороженные ms-thread-ctor и ms-delegates-lambdas НЕ несут отдельных «…»-цитат
(ms-delegates-lambdas — только со-источник у s1, где цитата «Lambdas can refer to outer
variables…» есть и в ms-lambda и сверена по нему; ms-thread-ctor вообще без «…»-цитаты).

## Итог по урокам

| урок | «…»-цитат проверено | совпали дословно | исправлено |
|------|---------------------|-------------------|------------|
| closures | 12 | 7 | 5 (все → verbatim) |
| value-vs-reference | 12 | 6 | 6 (5 verbatim, 1 частично пересказ) |
| boxing | 15 | 15 | 0 |
| gc | 24 | 23 | 1 (→ verbatim) |
| async-await | 16 | 14 | 2 (1 verbatim, 1 пересказ) |
| hashtable | 8 | 8 | 0 |

(Счётчик = число мест использования «…»-цитат в перечисленных полях; повторы одной фразы
в разных сегментах считаются отдельно.)

## Расхождения и правки (с доказательством из источника)

### closures.ts

1. **spec[0]** — БЫЛО: «If you capture variables in this way, the lambda expression stores
   them for use even if the variables go out of scope and would normally be garbage collected.»
   ИСТОЧНИК (ms-lambda): `Variables that are captured in this manner are stored for use in
   the lambda expression even if the variables would otherwise go out of scope and be garbage
   collected.` → приведено к verbatim.
2. **edgeCases[0]** — БЫЛО: «A variable that you capture isn't garbage collected until…»
   ИСТОЧНИК: `A variable that is captured isn't garbage-collected until the delegate that
   references it becomes eligible for garbage collection.` → verbatim ("is captured",
   "garbage-collected" с дефисом).
3. **edgeCases[1]** — БЫЛО: «…but it can reference static members…» ИСТОЧНИК:
   `A static lambda can't capture local variables or instance state from enclosing scopes,
   but can reference static members and constant definitions.` → убрано лишнее "it".
4. **s2 explain** — БЫЛО: «the lambda expression stores them for use even if the variables
   go out of scope» (этой формы в источнике НЕТ) → заменено полной verbatim-цитатой ms-lambda
   (см. п.1).
5. **s4 explain (2 цитаты) + s4 scene[2] caption** — те же перефразы spec[0]/edgeCases[0];
   приведены к verbatim; в caption "garbage collected"→"garbage-collected".

   СОВПАЛИ дословно (не трогались): s1 caption/explain «Lambdas can refer to outer variables…»
   + «These outer variables are the variables that are in scope in the method that defines the
   lambda expression»; edgeCases[2] in/ref/out; s3 «Another lambda observes a new value of
   captured variable»; s5 foreach-цитаты (cs-spec-foreach §13.9.5.2, обе composite-части
   дословны: «because each iteration has its own variable v» / «will continue to hold the
   value…» / «(Note that earlier versions of C# declared v outside of the while loop.)»);
   s2 «the lambda expression stores them for use…» после правки.

### value-vs-reference.ts

6. **s2 explain** — БЫЛО (актив + несуществующая фраза): «you copy variable values… you copy
   the corresponding type instances» + «the system copies variable values on assignment» +
   «Operations on one variable [don't affect] the other».
   ИСТОЧНИК: cs-value-types `…variable values are copied.` / `In the case of value-type
   variables, the corresponding type instances are copied.`; cs-struct `Structure types have
   value semantics.`; cs-reference-types `With value types, each variable has its own copy of
   the data, and it's not possible for operations on one variable to affect the other…`.
   → залог исправлен на пассив; фраза «the system copies…» (в источниках отсутствует) удалена;
   «Operations on one…» приведено к дословному «each variable has its own copy of the data,
   and it's not possible for operations on one variable to affect the other».
7. **s1 explain** — БЫЛО: «the variable holds a reference to an object on the managed heap.
   The variable doesn't hold the object data itself». ИСТОЧНИК (cs-classes): `…enough memory
   is allocated on the managed heap for that specific object, and the variable holds only a
   reference to the location of said object.` + `This reference refers to the new object but
   doesn't contain the object data itself.` → приведено к verbatim.
8. **s3 explain** — БЫЛО: «Assigning a class variable to another variable copies the reference,
   so both variables point to the same object» (в источнике ОТСУТСТВУЕТ). ИСТОЧНИК (cs-classes):
   `This code creates two object references that both refer to the same object. Therefore, any
   changes to the object made through object3 are reflected in subsequent uses of object4.`
   → залоговый перефраз про «copies the reference» переписан РУССКИМ пересказом (без кавычек);
   добавлена verbatim-цитата cs-classes; вторая цитата приведена к дословной composite из
   cs-reference-types: «two variables can reference the same object… operations on one variable
   can affect the object referenced by the other variable» (было ". Therefore," → «…», убрана
   правка ";"→".").
9. **s4 explain** — БЫЛО: «A class is a reference type» (сокращение). ИСТОЧНИК (cs-classes):
   `A type that is defined as a class is a reference type.` → verbatim.

   СОВПАЛИ дословно: spec[0] «A variable of a value type contains an instance of the type…
   [a] reference type… contains a reference to an instance of the type» (composite + честный
   editorial-маркер `[a]`); s1 «A variable of a value type contains an instance of the type»
   / «which contains a reference to an instance of the type» / «There's a managed heap for each
   managed process»; s4 «A structure type… is a value type» / «reference types are allocated on
   the heap… whereas value types are allocated either on the stack or inline in containing
   types»; edgeCases (без «…»-англ.-цитат).

### gc.ts

10. **s6 explain** — БЫЛО: «Ordinarily, the large object heap (LOH) isn't compacted because
    copying large objects imposes a performance penalty» (в источнике ОТСУТСТВУЕТ дословно).
    ИСТОЧНИК (ms-loh): `But because compaction is expensive, the GC sweeps the LOH; it makes
    a free list out of dead objects that can be reused later to satisfy large object allocation
    requests.` → приведено к verbatim; русский текст «обычно не уплотняется, потому что
    уплотнение дорого» ложится под цитату.

    СОВПАЛИ дословно (проверены все): spec[0] «The garbage collector stores new objects in
    generation 0… promoted and stored in generations 1 and 2»; s1 «an automatic memory
    manager» / «The managed heap maintains a pointer…» / «allocates memory for an object by
    adding a value to a pointer… almost as fast as allocating memory from the stack» / heap-
    per-process; s2 lifetime-гипотезы + «divided into three generations…» + «youngest…
    short-lived»; s3 «Most objects are reclaimed… in generation 0» / gen0-full-collection /
    «starts by examining the objects in generation 0…»; s4 roots / unreachable / promotion-
    chain; s5 три фазы mark/relocate/compact + «memory-copying function» + «pointer
    corrections» + «Memory is compacted only if…»; s6 two-heaps + «85,000 bytes and larger»
    + «85,000 bytes in size, it's considered a large object… the runtime allocates it on the
    large object heap» + «The GC does not dispose your objects…» + «The using statement obtains
    one or more resources…»; edgeCases LOH-generation-3 + IDisposable; takeaway «faster to
    compact a portion… than the entire heap».

### async-await.ts

11. **s4 explain** — БЫЛО: «use the ConfigureAwait method…» (пропущен квалификатор "Task.").
    ИСТОЧНИК (ms-consume-tap): `use the Task.ConfigureAwait method to inform the await
    operation not to capture and resume on the context, but to continue execution wherever the
    asynchronous operation that was being awaited completed.` → добавлено "Task.".
12. **s4 explain** — БЫЛО: «it avoids unnecessary context hops and reduces deadlock risk for
    callers that block» (в источниках ОТСУТСТВУЕТ дословно) → ёлочки СНЯТЫ, переписано русским
    пересказом «меньше лишних переключений контекста и ниже риск дедлока для блокирующих
    вызывающих» (смысл ms-consume-tap, без заявки на verbatim).

    СОВПАЛИ дословно: spec[0] «An await expression… doesn't block the current thread… Instead,
    the expression signs up the rest of the method as a continuation and returns control to the
    caller of the async method»; s1 «An async method runs synchronously until it reaches its
    first await expression. At that point, the method is suspended… In the meantime, control
    returns to the caller of the method» (ms-async-kw) + «executes as a synchronous method does,
    despite the async modifier» + «the compiler does the difficult work»; s2 continuation +
    «an async method returns a task value when its work is suspended»; s3 «don't cause extra
    threads to be created» / «doesn't run on its own thread» / «runs on the current
    synchronization context…» / «You can use Task.Run… but a background thread doesn't help…»;
    s4 ConfigureAwait composite + «If a synchronization context… resumes on that same
    synchronization context by using the context's Post method. Otherwise, it relies on the task
    scheduler»; s5 deadlock «that context already has a thread in it, which is (synchronously)
    waiting… They're each waiting for the other, causing a deadlock» + «bad idea to block on
    async code by calling Task.Wait or Task.Result» + «only one chunk of code to run at a time»
    + «When the await completes, it attempts to execute the remainder of the async method within
    the captured context»; edgeCases void-return. «There Is No Thread» — честно помечено
    "не офдок" (Stephen Cleary), это название статьи, не MS-verbatim.

### boxing.ts — расхождений НЕТ

Все проверены дословно: spec[0] «Boxing is implicit; unboxing is explicit.»; s1 «Boxing a
value type allocates an object instance on the heap and copies the value into the new object»
+ «an object reference o, on the stack… a copy of the value-type value»; s2 «separate memory
locations»; s3 unboxing-steps «Checking the object instance…» / «Copying the value from the
instance…» + «Attempting to unbox null… NullReferenceException. Attempting to unbox a reference
to an incompatible value type… InvalidCastException»; s4 IL «Convert a value type… to a true
object reference… creating a new object and copying the data…» (ms-il-box 0x8C) / «Converts
the boxed representation… to its unboxed form» + «equivalent to unbox followed by ldobj»
(ms-il-unbox 0xA5); s5 «The default stack reservation size used by the linker is 1 MB»
(ms-thread-stack) + «value types are allocated either on the stack or inline in containing
types» + heap-per-process; s6 «youngest… short-lived» + gen0-store/full-collection + «too much
boxing and unboxing can have a negative impact on the heap, the garbage collector, and
ultimately the performance» (cs-struct-guidelines); s7 «no need to box the value types»
(ms-generics) + «Boxing is the process of converting a value type to the type object or to any
interface type…» + «Value types get boxed when cast to a reference type or one of the
interfaces they implement» (cs-struct-guidelines).

### hashtable.ts — расхождений НЕТ

Все проверены дословно против LIVE ms-dictionary (HTTP 200): spec[1]/s1 «Retrieving a value by
using its key is very fast, close to O(1), because the Dictionary<TKey,TValue> class is
implemented as a hash table»; edgeCases «A key cannot be null, but a value can be, if its type
TValue is a reference type» + «The order in which the items are returned is undefined»; s2/s3
«Dictionary<TKey,TValue> requires an equality implementation to determine whether keys are
equal»; s3/s4/hook «The speed of retrieval depends on the quality of the hashing algorithm of
the type specified for TKey»; s5 «As elements are added to a Dictionary<TKey,TValue>, the
capacity is automatically increased as required by reallocating the internal array»; s6/card
«Every key in a Dictionary<TKey,TValue> must be unique according to the dictionary's equality
comparer. A key cannot be null, but a value can be…». CLRS-claims (clrs-ch11, book) —
концепт-источник, не verbatim (без ёлочек-заявки), не трогались.

## Непроверенные

Непроверенных «…»-цитат НЕТ: все источники, несущие «…»-цитаты, резолвились (frozen 200 /
live 200) и сверены посимвольно.

## Верификация после правок (исполнено)

- `npm run build` → чисто (`tsc --noEmit && vite build`, `✓ built`).
- `node verify/viz-fit.mjs` → `ALL GREEN`.
- `node verify/new-lessons.mjs` → `ALL GREEN` (все 4 урока рендерятся, финальные кадры, 0 ошибок).
- `node verify/run.mjs` → `ALL GREEN` (петля/грейдинг/виз целы, 0 console-ошибок).


## ЧТО ПЛОХО
- Риск №1 из финального VERIFY: часть англ. цитат в кавычках-ёлочках «…» были ПЕРЕФРАЗОМ
- пересказом «меньше лишних переключений контекста и ниже риск дедлока для блокирующих

ВЕРДИКТ: см. построчный разбор выше
