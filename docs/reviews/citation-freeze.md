# Заморозка цитат-провенанса (P2-final, accuracy-hardening)

Риск №1 из VERIFY: verbatim-цитаты ссылались на ЖИВЫЕ MS-доки без снапшота → риск дрейфа.
Меры: (1) поле `Source.archived` (URL веб-архива) — снапшот, к которому «пришпилена» цитата;
(2) машинные маркеры композитных цитат; (3) нота по CLRS-книге.

Дата извлечения (`source.date`) сохранена без изменений. В ЗАДАЧЕ 1 (заморозка) тексты
цитат/объяснений/вопросов НЕ менялись — только метаданные источника + комментарии-маркеры.

> **ПОПРАВКА (accuracy-audit, критическая фикс-волна точности).** Финальный VERIFY вернул
> гейт точности: ряд англ. «…»-цитат были ПЕРЕФРАЗОМ под видом дословных. Проведён сплошной
> verbatim-аудит всех «…»-цитат во всех 6 уроках против приколотых снапшотов (`archived`),
> для 5 незамороженных URL — против live. Расхождения приведены к дословному тексту источника
> либо (где дословный текст не ложится в русскую фразу) переведены в ЯВНЫЙ пересказ без кавычек.
> Полный аудит-лог: `docs/reviews/citation-audit.md`. Итог правок ниже.

## Итог заморозки: 20 из 25 уникальных URL

Метод: Wayback availability API (`https://archive.org/wayback/available?url=…&timestamp=<date>`)
— брал ближайший к дате извлечения существующий снапшот; для 3 URL без снапшота на дату взял
любой доступный снапшот (availability без timestamp). Все записанные `archived`-URL проверены
на резолв (spot-check выборки → HTTP 200). Дважды-делённые URL (ms-gc, choosing-between-class-and-struct)
получили один и тот же снапшот во всех файлах — итого 24 occurrences `archived:` в 6 файлах.

### Незамороженные (5 уникальных URL) — честно, архив недоступен

Wayback не имеет снапшота этих страниц (SPA-страницы MS Learn `/dotnet/api/*` и `delegates-lambdas`
плохо захватываются SPN2; попытка `curl /save/` в этом окружении флейкала — HTTP 000/timeout).
Оставлены с пустым `archived`, дата извлечения сохранена. Кандидаты на повторную заморозку позже:

| id | файл | url |
|----|------|-----|
| ms-thread-ctor | boxing | learn.microsoft.com/…/api/system.threading.thread.-ctor |
| ms-il-box | boxing | learn.microsoft.com/…/api/system.reflection.emit.opcodes.box |
| ms-il-unbox | boxing | learn.microsoft.com/…/api/system.reflection.emit.opcodes.unbox_any |
| ms-delegates-lambdas | closures | learn.microsoft.com/…/fundamentals/types/delegates-lambdas |
| ms-dictionary | hashtable | learn.microsoft.com/…/api/system.collections.generic.dictionary-2 |

Примечание точности: цитаты из этих 5 источников короткие и точечные (IL-опкоды 0x8C/0xA5,
maxStackSize, «the lambda expression stores them…», «Every key … must be unique») — низкий риск
переписывания источником. Но пометка стоит: их провенанс НЕ пришпилен.

## Инвентарь композитных цитат (склейка несмежных предложений через «…»)

Композит = verbatim-цитата, собранная из НЕсмежных предложений одного источника, соединённых
многоточием внутри «…». Заморожены как есть; будущему автору ЗАПРЕЩЕНО их расширять (новый
«…»-хоп может тихо разойтись с источником). Машинный маркер: блок `// COMPOSITE-QUOTES:` над
`sources:` в каждом файле-носителе + описание соглашения в `app/src/lessons/types.ts`.
Грепается: `grep -rn COMPOSITE-QUOTES app/src/lessons`.

| файл | поле-локатор | суть |
|------|--------------|------|
| value-vs-reference | spec[0] (cs-value-types) | «A variable of a value type contains an instance… [a] reference type… contains a reference…» |
| value-vs-reference | seg "contains-instance" explain | contains-instance / reference / managed-heap склейка |
| value-vs-reference | seg copy explain | «on assignment… you copy variable values…» + «Structure types have value semantics…» |
| value-vs-reference | seg struct-vs-class explain | «reference types are allocated on the heap… value types… stack or inline…» |
| boxing | seg1 explain | «an object reference o, on the stack… a copy of the value-type value» |
| boxing | seg IL explain | «Convert a value type … to a true object reference …» / «… to its unboxed form» |
| boxing | gen0 scene caption | «youngest … short-lived objects» |
| boxing | loop explain | «the youngest and contains short-lived objects … Garbage collection occurs most frequently…» |
| gc | spec[0] (ms-gc) | «stores new objects in generation 0… promoted and stored in generations 1 and 2» |
| gc | spec (ms-loh) | «they go on the large object heap (LOH)… logically collected as part of generation 2» |
| gc | scene captions (heap/gen0/relocate) | «All threads… allocate on the same heap»; «Most objects are reclaimed… in generation 0»; «makes the necessary pointer corrections so that the… roots…» |
| gc | explains (alloc / generations / roots-promote / mark-relocate-compact / LOH+using) | множественные склейки внутри одного источника |
| gc | takeaway "why" | «faster to compact a portion… than the entire heap» |
| closures | seg display-class explain | «the lambda expression stores them for use even if the variables go out of scope» |
| closures | "delegate alive" scene caption | «isn't garbage collected until the delegate… becomes eligible» |
| closures | foreach scene caption | «because each iteration has its own variable v… earlier versions of C# declared v outside» |
| closures | foreach-vs-for explain (cs-spec §13.9.5.2) | «…the value… (Note that earlier versions of C# declared v outside of the while loop.)» |
| async-await | spec ConfigureAwait (ms-consume-tap) | «not to capture and resume on the context, but to continue execution wherever the asynchronous operation… completed» |
| async-await | scene captions (ConfigureAwait / deadlock) | «not to capture… but to continue… wherever…»; «which is (synchronously) waiting… They're each waiting for the other» |
| async-await | continuation/context explain | «If a synchronization context… is associated…»; «use the ConfigureAwait method…» |
| hashtable | "upsert" card noText | «Every key … must be unique» |

## CLRS — концепт-источник

`hashtable.ts` `clrs-ch11` (kind: `book`, MIT Press): claims об усреднённой/худшей сложности
и амортизации сформулированы НАШИМИ словами и атрибутированы CLRS гл. 11 как КОНЦЕПТ — это
НЕ verbatim-цитата. Книга не проверяется по URL; `archived` пришпиливает только издательскую
landing-страницу. Помечено инлайн-комментарием над строкой источника.

## Изменённые файлы (задача 1)

- `app/src/lessons/types.ts` — `Source.archived?: string` + соглашение о композитах в шапке.
- `app/src/lessons/{value-vs-reference,boxing,gc,closures,async-await,hashtable}.ts` —
  `archived`-снапшоты на источники + блоки-маркеры `// COMPOSITE-QUOTES:`.
- Тексты цитат/вопросов/объяснений — В ЗАДАЧЕ 1 без изменений (см. поправку в шапке).

## Изменённые цитаты (задача accuracy-audit)

Каждая правка сверена посимвольно против `archived`-снапшота источника (для live — против live).
`verbatim` = «…»-цитата приведена к дословному тексту источника; `→ пересказ` = ёлочки сняты,
формулировка переписана как явный пересказ (без заявки на дословность).

| файл · локатор | было (перефраз) | стало | тип |
|----------------|------------------|-------|-----|
| closures spec[0] | «If you capture variables in this way, the lambda expression stores them for use even if the variables go out of scope and would normally be garbage collected.» | «Variables that are captured in this manner are stored for use in the lambda expression even if the variables would otherwise go out of scope and be garbage collected.» (ms-lambda) | verbatim |
| closures edgeCases[0] | «A variable that you capture isn't garbage collected until…» | «A variable that is captured isn't garbage-collected until…» (ms-lambda) | verbatim |
| closures edgeCases[1] | «…but it can reference static members…» | «…but can reference static members…» (ms-lambda; лишнее "it") | verbatim |
| closures s2 explain | «the lambda expression stores them for use even if the variables go out of scope» | полная verbatim-цитата ms-lambda (см. spec[0]) | verbatim |
| closures s4 explain (×2) | те же перефразы spec[0] + edgeCases[0] | обе приведены к verbatim ms-lambda | verbatim |
| closures s4 caption | «isn't garbage collected until the delegate… becomes eligible» | «isn't garbage-collected until the delegate… becomes eligible» (дефис) | verbatim |
| value-vs-reference s2 explain | «you copy variable values… you copy the corresponding type instances» (актив) + «the system copies variable values on assignment» (нет в источнике) + «Operations on one variable [don't affect] the other» | «variable values are copied… the corresponding type instances are copied» (пассив, cs-value-types) + «each variable has its own copy of the data, and it's not possible for operations on one variable to affect the other» (cs-reference-types); несуществующая фраза удалена | verbatim |
| value-vs-reference s1 explain | «the variable holds a reference to an object on the managed heap. The variable doesn't hold the object data itself» | «enough memory is allocated on the managed heap for that specific object, and the variable holds only a reference to the location of said object» + «This reference refers to the new object but doesn't contain the object data itself» (cs-classes) | verbatim |
| value-vs-reference s3 explain | «Assigning a class variable to another variable copies the reference, so both variables point to the same object» (нет в источнике) | «This code creates two object references that both refer to the same object. Therefore, any changes to the object made through object3 are reflected in subsequent uses of object4» (cs-classes); залоговый перефраз про copy заменён русским текстом + composite из cs-reference-types приведён к «…» | verbatim + пересказ |
| value-vs-reference s4 explain | «A class is a reference type» (сокращение) | «A type that is defined as a class is a reference type» (cs-classes) | verbatim |
| gc s6 explain | «Ordinarily, the large object heap (LOH) isn't compacted because copying large objects imposes a performance penalty» (нет в источнике) | «But because compaction is expensive, the GC sweeps the LOH; it makes a free list out of dead objects that can be reused later to satisfy large object allocation requests» (ms-loh) | verbatim |
| async-await s4 explain | «use the ConfigureAwait method…» (пропущен "Task.") | «use the Task.ConfigureAwait method…» (ms-consume-tap) | verbatim |
| async-await s4 explain | «it avoids unnecessary context hops and reduces deadlock risk for callers that block» (нет в источнике) | русский пересказ без кавычек (смысл ms-consume-tap) | → пересказ |

**boxing.ts, hashtable.ts — расхождений НЕ найдено**: все «…»-цитаты сверены посимвольно и
дословны (ms-boxing, ms-il-box 0x8C, ms-il-unbox 0xA5, ms-thread-stack, ms-generics,
ms-struct-guidelines для boxing; ms-dictionary для hashtable). Незамороженные live-URL
(ms-il-box, ms-il-unbox, ms-dictionary) на момент аудита резолвятся HTTP 200 и сверены по live.
CLRS-claims в hashtable — концепт, не verbatim (без ёлочек-заявки), не трогались.


## ЧТО ПЛОХО
- Риск №1 из VERIFY: verbatim-цитаты ссылались на ЖИВЫЕ MS-доки без снапшота → риск дрейфа.
- maxStackSize, «the lambda expression stores them…», «Every key … must be unique») — низкий риск

ВЕРДИКТ: см. построчный разбор выше
