# STATE — CS.S13 «CLR внутри» (book-based lessons)

Статус: WORKING · единственный пишущий агент-строитель.

## North Star
5 экспертных уроков по ВНУТРЕННОСТЯМ CLR из русского перевода Рихтера «CLR via C#» (4-е изд.).
Плотность как в boxing.ts: анимированные машинные панели + РЕАЛЬНЫЕ исполняемые примеры.
Источник = КНИГА (clr-book.txt), не веб-доки. Цитаты « » дословны из книги (0 MISS).
Книга 2013 (.NET 4.5) — учим только ВНЕВРЕМЕННЫЕ внутренности, актуальные в .NET 10.

## Фиче-лист (порядок священен)
| # | slug | глава | статус | доказательство |
|---|---|---|---|---|
| 1 | clr-execution-model | гл.1 | self-pass | build+vizfit green, 0 MISS, exec 3/3 (commit 1111621) |
| 2 | il-and-jit | гл.1 | self-pass | build+vizfit green, 0 MISS, exec 3/3 (commit 1111621) |
| 3 | metadata-and-assemblies | гл.1-2 | self-pass | build+vizfit green, 0 MISS, exec 3/3 (commit da188f9) |
| 4 | object-header-layout | гл.4 | self-pass | build green, 0 MISS, exec 3/3 (24/True/True False) |
| 5 | type-loading-dispatch | гл.4 | self-pass | build green, 0 MISS, exec 3/3 (Manager/True/True) |

Section id `CS.S13` (order 13), lesson ids `CS.S13.<slug>`, prereq CS.S1.
Seed order globally UNIQUE 107–111 (max был 106).

## Как проверить (гейты на каждый урок)
- `cd app && npm run build` — зелено (tsc + vite).
- G-EXEC: каждая карточка → POST :5080/api/authoring/run-csharp, stdout.trim() == expect.
- Self-check цитат: `node scratchpad/qcheck.mjs <lesson.ts>` → 0 MISS.
- viz-fit (нужен preview :4173 + backend :5080): FIT/CLIP/OVERLAP + AUTHORING-PROOF.
- Финал: `cd app && npm run verify:all` — ALL GREEN.

## Прогон-факты (реальные stdout, не память)
- L1 c1 `System.Private.CoreLib.dll` · c2 `4: 2 3 88 42` (IL Add: ldarg.0 ldarg.1 add ret) · c3 `System.Private.CoreLib / 1`.
- L2 c1 `2 3 88 42` · c2 `2 3 90 42` (Mul: mul=90 вместо add=88) · c3 `maxstack=8 il=4`.
- L3 c1 `02` (TypeDef) · c2 `02 06 04` (TypeDef/MethodDef/FieldDef) · c3 `1 System.Private.CoreLib.dll`.
- L4 c1 `True` (общий объект-тип) · c2 `True False` (2 Manager same, Manager≠Employee) · c3 `24` (пустой класс, 64-бит).
- L5 c1 `Manager` (virt dispatch → override) · c2 `True` (объект-тип — экземпляр System.Type) · c3 `True` (System.Type ссылается на себя).

## Решения / грабли
- Endpoint = CSharpScript (top-level statements). Expression-bodied методы дают чистый IL БЕЗ nop
  (statement-body `return a+b;` вставляет nop). Для IL-карточек беру expression-bodied.
- Книга пишет «е» вместо «ё» (создает, генерируют) и имеет опечатку «включаетсяч» —
  дословные « »-цитаты обязаны совпадать ПОБУКВЕННО: репродуцирую книгу или перефразирую БЕЗ « ».
- « » ТОЛЬКО для книжных цитат; для своих подписей/лейблов — без « » (иначе qcheck ловит MISS).
- Табличные ячейки книги (напр. IL-описание) перемешаны с колоночными подписями → композит
  через «…» между ними НЕ contiguous. Разбиваю на отдельные « »-цитаты по реально смежным словам.
- viz-fit ловит перевысокие зоны: 4 obj-ряда ≈ 288u inner → зона h=306, viewBox 348 (s2 модуля).
- Book source: `{ id:"clr-ch1", kind:"book", org:"Джеффри Рихтер", title:"CLR via C#, 4-е изд., гл.1 …", url:"", date:"2013" }`.
  В seed JSON source kind тоже "book", url "".

## Запуск продукта (чекпойнт)
`cd app && npm run dev` (или `npm run preview` после build) + backend `:5080`.
Урок открывается по id `CS.S13.clr-execution-model`.
