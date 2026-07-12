# Заморозка цитат-провенанса (P2-final, accuracy-hardening)

Риск №1 из VERIFY: verbatim-цитаты ссылались на ЖИВЫЕ MS-доки без снапшота → риск дрейфа.
Меры: (1) поле `Source.archived` (URL веб-архива) — снапшот, к которому «пришпилена» цитата;
(2) машинные маркеры композитных цитат; (3) нота по CLRS-книге.

Дата извлечения (`source.date`) сохранена без изменений. Тексты цитат/объяснений/вопросов
НЕ менялись — только метаданные источника + комментарии-маркеры.

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
- Тексты цитат/вопросов/объяснений — БЕЗ изменений.
