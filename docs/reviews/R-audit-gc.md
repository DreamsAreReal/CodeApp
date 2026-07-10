# Аудит точности — урок GC (T1.M4.gc)

Дата: 2026-07-10. Аудитор: точность-ревьюер. Файл: `app/src/lessons/gc.ts`.
Первоисточники (получены целиком, retrieved 2026-07-10):
- ms-gc: https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals
- ms-loh: https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/large-object-heap
- ms-idisposable: https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/using-objects

## Метод
Извлечены ВСЕ дословные англ. цитаты (в «…»), числа, идентификаторы API, поведенческие
утверждения. Каждая цитата сверена посимвольно с полным текстом страницы-источника
(не поиском, а fetch всей страницы). Эллипсисы «…» считаются допустимым сокращением,
если оставшийся текст присутствует дословно и смысл не искажён.

## Результат: verdict = minor-fixes. Проверено ~35 единиц.

### Цитаты — совпадают дословно (с корректными эллипсисами)
- spec: «The garbage collector stores new objects in generation 0… promoted and stored in generations 1 and 2» — OK (склейка через "Objects created early…").
- «There's a managed heap for each managed process. All threads… allocate on the same heap» — OK.
- «an automatic memory manager» — OK ("serves as an automatic memory manager").
- «The managed heap maintains a pointer to the address where the next object in the heap will be allocated» — OK, дословно.
- «Newer objects have shorter lifetimes, and older objects have longer lifetimes» — OK.
- «It's faster to compact… a portion… than… the entire managed heap» — OK.
- «Newer objects tend to be related… and accessed… around the same time» — OK.
- «the managed heap is divided into three generations, 0, 1, and 2…separately» — OK.
- «the youngest and contains short-lived objects… most frequently in this generation» — OK.
- «Most objects are reclaimed… in generation 0» — OK.
- «If an application attempts to create a new object when generation 0 is full, the garbage collector performs a collection to free address space for the object» — OK, дословно.
- «starts by examining the objects in generation 0 rather than all objects in the managed heap. A collection of generation 0 alone often reclaims enough memory» — OK.
- «An application's roots include static fields, local variables on a thread's stack, CPU registers, GC handles» — OK (цитата оборвана до "…and the finalize queue"; обрыв, не искажение).
- «The garbage collector considers unreachable objects garbage and releases the memory» — OK (обрыв "…allocated for them").
- Цепочка promotion gen0→1→2, remain in gen2 — OK, дословно с эллипсисами.
- Три фазы marking/relocating/compacting — OK, дословно.
- «uses a memory-copying function to compact the reachable objects» — OK.
- «makes the necessary pointer corrections so that the… roots point to the objects in their new locations» — OK.
- «Memory is compacted only if a collection discovers a significant number of unreachable objects. If all the objects… survive… there's no need for… compaction» — OK.
- LOH: «if they are large objects, they go on the large object heap (LOH), which is sometimes referred to as generation 3… logically collected as part of generation 2» — OK (атрибуция ms-loh верна; ms-loh формулирует "if they are", ms-gc — "if they're"; урок берёт версию ms-loh дословно).
- «the large object heap and the small object heap. The large object heap contains objects that are 85,000 bytes and larger» — OK.
- «If an object is greater than or equal to 85,000 bytes in size, it's considered a large object… the runtime allocates it on the large object heap» — OK.
- «Ordinarily, the large object heap (LOH) isn't compacted because copying large objects imposes a performance penalty» — OK, дословно.
- «The GC does not dispose your objects, as it has no knowledge of IDisposable.Dispose()» — OK (источник: "does ***not*** dispose… no knowledge of IDisposable.Dispose() or IAsyncDisposable.DisposeAsync()"; обрыв корректен).
- «The using statement obtains one or more resources, executes the statements… and automatically disposes of the object» — OK.

### Числа / поведение — верны
- LOH-порог 85 000 байт (≥85000) — подтверждён двумя источниками. OK.
- LOH = gen 2 при сборке; GC.GetGeneration(big)=2 — ms-loh: "Large objects belong to generation 2". OK.
- Card c1: GetGeneration(o)=0 → GC.Collect() → 1 (вывод "01") — соответствует правилу promotion (живой survive gen0 → gen1). OK.
- Компилятор using → эквивалент try/finally с Dispose в finally — подтверждён ms-idisposable. OK.
- Аллокация = сдвиг указателя, «почти как стек» — подтверждён. OK.

### Идентификаторы API — существуют
GC.GetGeneration, GC.Collect, IDisposable.Dispose(), Object.Finalize, File.Open, using — все реальны. OK.

## Найденные несоответствия

### [minor] s1.explain — грамматическая форма первого слова внутри дословной цитаты
Урок (line 65): «allocating memory for an object by adding a value to a pointer… almost
as fast as allocating memory from the stack».
Источник ms-gc дословно: "Because the runtime **allocates** memory for an object by
adding a value to a pointer, it's almost as fast as allocating memory from the stack."
Проблема: первое слово в кавычках изменено с "allocates" на "allocating" — технически
это не verbatim. Смысл не искажён (major/blocker не ставлю: факт верен, число/термин
на месте). Коррекция: заменить на «allocates memory for an object by adding a value to
a pointer… almost as fast as allocating memory from the stack» ИЛИ начать цитату со
слова после (напр. «adding a value to a pointer…»).

## Темы из ТЗ, отсутствующие в уроке (не применимо)
async «extra/additional threads», closure-захват переменной, C#5 foreach, await/поток,
дедлок .Result, InvalidCastException/NullReferenceException при unbox, IL-опкоды/hex —
в этом уроке (тема: GC) НЕ встречаются. Проверять нечего. (IL-опкоды 0x8C/0xA5 и unbox-
исключения относятся к соседнему уроку boxing.ts, который был лишь эталоном формата.)

## Вывод
Урок фактически точен. Все числа, поведение, идентификаторы и 25+ дословных цитат
подтверждены первоисточниками Microsoft Learn. Единственная правка — minor: одно слово
("allocating" вместо "allocates") в дословной цитате s1. Выдуманных цитат, неверных
чисел, несуществующих API, мисатрибуции источников НЕ обнаружено.
