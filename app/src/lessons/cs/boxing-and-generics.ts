/**
 * Lesson: Generics убирают боксинг (CS.S10.boxing-and-generics) — expert density, 5 animated
 * deep-dives. The measurement-heavy treatment: WHY a non-generic ArrayList boxes every value type
 * (its slot is object, so each int becomes a heap object with a header), what one box COSTS
 * (measured 24 bytes each), that two boxes of the same value are distinct heap objects, and how the
 * generic List<int> stores ints inline for ~8x less allocation. Complements CS.S1.generics-basics
 * (whose boxing panel was a single headline number) by making the allocation accounting the whole
 * subject, per-box and per-collection.
 *
 * SIGNATURE machine panel (s5): ArrayList vs List<int> allocation delta, measured. 1000 ints ->
 * ArrayList 32056 B (boxed), List<int> 4056 B (inline). REAL run-csharp measurement (this file's
 * exec cards): c1 "ArrayList: 32056 List<int>: 4056" · c2 "False True 42" (two distinct boxes) ·
 * c3 "boxes bytes: 24000 per-box: 24".
 *
 * Accuracy contract (G4/G7/G8) — verified against learn.microsoft.com/.../standard/generics/
 * (fetched + substring-checked 2026-07-21, ms.date 2022-07-26):
 *   - the verbatim quote is the value-type / no-boxing performance sentence from that page;
 *   - the per-box (24 B) and per-collection (32056 / 4056 B) numbers are OWN, DETERMINISTIC
 *     GC.GetAllocatedBytesForCurrentThread measurements (pre-sized + warmed, like the S7/S17
 *     lessons) — never faked;
 *   - every card verify.expect is the REAL stdout of run-csharp (this file's exec cards).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S10.boxing-and-generics/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: WHY ArrayList boxes — its slot is object.
const Z_SLOT: Zone = { id: "slot", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ArrayList · слот = object", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "хранит ССЫЛКУ", subCls: "vz-zsub", subY: 47 };
const Z_BOXED: Zone = { id: "boxed", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "КУЧА · бокс на каждый int", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "header + значение", subCls: "vz-zsub heap", subY: 47 };
const WHY_ZONES: Zone[] = [Z_SLOT, Z_BOXED];

// s2: what a box costs — one heap object per value, measured 24 bytes.
const Z_VAL: Zone = { id: "val", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "int на стеке · 4 байта", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "inline значение", subCls: "vz-zsub good", subY: 47 };
const Z_HDR: Zone = { id: "hdr", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "бокс · 24 байта", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "header + int + padding", subCls: "vz-zsub heap", subY: 47 };
const COST_ZONES: Zone[] = [Z_VAL, Z_HDR];

// s3: two boxes of the same value are distinct heap objects.
const Z_B1: Zone = { id: "b1", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "box1 · (object)42", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "отдельный объект", subCls: "vz-zsub heap", subY: 47 };
const Z_B2: Zone = { id: "b2", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "box2 · (object)42", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "ЕЩЁ один объект", subCls: "vz-zsub heap", subY: 47 };
const TWO_ZONES: Zone[] = [Z_B1, Z_B2];

// s4: List<int> stores inline — no box per element.
const Z_INLINE: Zone = { id: "inline", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "List<int> · int[] inline — 0 боксов", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "элемент = само значение в массиве", subCls: "vz-zsub good", subY: 47 };
const INLINE_ZONES: Zone[] = [Z_INLINE];

// s5 (SIGNATURE): ArrayList vs List<int> allocation delta — measured.
const Z_AL: Zone = { id: "al", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ArrayList · 32056 B", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "1000 боксов", subCls: "vz-zsub heap", subY: 47 };
const Z_GL: Zone = { id: "gl", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "List<int> · 4056 B", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "inline · ~8× дешевле", subCls: "vz-zsub good", subY: 47 };
const MEASURE_ZONES: Zone[] = [Z_AL, Z_GL];

export const boxingAndGenerics: LessonData = {
  id: "CS.S10.boxing-and-generics",
  track: "CS",
  section: "CS.S10",
  module: "S10.7",
  lang: "csharp",
  title: "Generics убирают боксинг: List<int> vs ArrayList",
  kicker: "C# вглубь · S10 · цена боксинга",
  home: { subtitle: "почему ArrayList боксит, цена бокса (24 B), List<int> inline, замер", icon: "gc", estMinutes: 9 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-generics-std", kind: "doc", org: "Microsoft Learn", title: "Generics in .NET", url: "https://learn.microsoft.com/en-us/dotnet/standard/generics/", date: "2022-07-26" },
  ],

  spec: [
    { text: "«Generic collection types generally perform better for storing and manipulating value types because there is no need to box the value types.» <span class=\"ru-tr\">«Обобщённые типы коллекций, как правило, работают лучше при хранении и обработке значимых типов, потому что нет необходимости упаковывать значимые типы.»</span>", source: "ms-generics-std" },
  ],
  edgeCases: [
    { text: "Каждый бокс — <b>отдельный</b> объект на куче: <code>(object)42</code> дважды даёт <b>два разных</b> объекта — собственный прогон: <code>ReferenceEquals</code>=False, <code>Equals</code>=True.", source: "ms-generics-std" },
    { text: "Цена одного бокса <code>int</code> — <b>24 байта</b> (object header + значение + выравнивание): собственный прогон — 1000 боксов = 24000 байт.", source: "ms-generics-std" },
    { text: "Выигрыш обобщений — не только скорость, но и <b>аллокации</b>: «Generic collection types generally perform better for storing and manipulating value types because there is <span class=\"hl\">no need to box the value types</span>». <span class=\"ru-tr\">«Обобщённые типы коллекций, как правило, работают лучше при хранении и обработке значимых типов, потому что нет необходимости упаковывать значимые типы».</span>", source: "ms-generics-std" },
  ],

  misconceptions: [
    {
      wrong: "боксинг — мелочь: ArrayList и List<int> хранят int примерно одинаково",
      hook: 'Разница <b>измерима и большая</b>. Необобщённый <code>ArrayList</code> хранит слот как <code>object</code>, поэтому каждый <code>int</code> при <code>Add</code> <span class="hl">упаковывается</span> в отдельный объект на куче (заголовок + значение) — собственный прогон: <b>24 байта на бокс</b>. Обобщённый <code>List&lt;int&gt;</code> хранит <code>int</code> <b>inline</b> в массиве — 0 боксов. Дословно почему: «Generic collection types generally perform better for storing and manipulating value types because there is <span class="hl">no need to box the value types</span>». <span class="ru-tr">«Обобщённые типы коллекций, как правило, работают лучше при хранении и обработке значимых типов, потому что нет необходимости упаковывать значимые типы».</span> На 1000 int это <code>ArrayList</code> 32056 B против <code>List&lt;int&gt;</code> 4056 B — <b>~8×</b>. Дальше <b>пять разборов</b>: почему ArrayList боксит (слот object), цена одного бокса (24 B), два бокса одного значения = два объекта, <code>List&lt;int&gt;</code> inline, и <b>машинная панель</b> — замер аллокаций обеих коллекций (реальный прогон: 32056 vs 4056).',
      source: "ms-generics-std",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Почему ArrayList боксит", title: "Слот ArrayList — object, значит int упаковывается",
      viewBox: "0 0 340 210", zones: WHY_ZONES,
      code: ["ArrayList al = new ArrayList();", "al.Add(42);   // сигнатура Add(object) → int упаковывается в object", "// в куче появляется бокс: object-заголовок + значение 42"],
      scenes: [
        { codeLine: 1, out: "", caption: 'У <code>ArrayList</code> метод — <code>Add(object)</code>. <code>int</code> — value-тип, но слот ждёт <b>ссылку</b>, поэтому значение надо <span class="hl">упаковать</span>.', nodes: [{ id: "s", kind: "obj", at: { zone: "slot", row: 0 }, typeTag: "ArrayList[0]", value: "object-слот", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Упаковка создаёт <b>объект на куче</b>: object-заголовок + копия значения. Слот массива хранит <span class="hl">ссылку</span> на этот бокс.', nodes: [{ id: "s", kind: "obj", at: { zone: "slot", row: 0 }, typeTag: "ArrayList[0]", value: "→ бокс" }, { id: "b", kind: "obj", at: { zone: "boxed", row: 0 }, typeTag: "boxed int", value: "header + 42", accent: true }], edges: [{ id: "e", from: "s", to: "b", accent: true }] },
        { codeLine: 2, out: "", caption: 'Так с <b>каждым</b> элементом: 1000 int → 1000 боксов на куче. Отсюда и цена — её снимет машинная панель.', nodes: [{ id: "s", kind: "obj", at: { zone: "slot", row: 0 }, typeTag: "ArrayList", value: "1000 слотов" }, { id: "b", kind: "obj", at: { zone: "boxed", row: 0 }, typeTag: "1000 боксов", value: "на куче", accent: true }], edges: [] },
      ],
      explain: 'Причина боксинга в <code>ArrayList</code> — его нетипизированный контракт: слот и <code>Add</code> работают с <code>object</code>. Value-тип нельзя положить туда напрямую (нужна ссылка), поэтому CLR <b>упаковывает</b> каждый <code>int</code> в объект на управляемой куче — с полноценным заголовком. Это цена, которую generics устраняют: «Generic collection types generally perform better for storing and manipulating value types because there is <span class="hl">no need to box the value types</span>». <span class="ru-tr">«Обобщённые типы коллекций, как правило, работают лучше при хранении и обработке значимых типов, потому что нет необходимости упаковывать значимые типы».</span> <code>ArrayList</code> — исторический до-generic контейнер; в современном коде его заменяет <code>List&lt;int&gt;</code>, чей слот уже <code>int</code>, а не <code>object</code>. Здесь мы фиксируем механику: боксинг — не абстракция, а реальная аллокация объекта на каждый элемент.',
      sources: ["ms-generics-std"],
    },
    {
      id: "s2", num: "02", kicker: "Цена одного бокса", title: "Один бокс int = 24 байта (header + значение + padding)",
      viewBox: "0 0 340 210", zones: COST_ZONES,
      code: ["object sink = null;", "for (int i=0;i<1000;i++) sink = (object)i;  // 1000 боксов", "// замер: 24000 байт → 24 байта на бокс int"],
      predictAt: 1, predictQ: '1000 раз <code>(object)i</code> для <code>int i</code> — сколько байт аллоцирует и сколько это на один бокс? (int — 4 байта данных)', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>int</code> на стеке — <b>4 байта</b> чистого значения, без заголовка. Дёшево.', nodes: [{ id: "v", kind: "obj", at: { zone: "val", row: 0 }, typeTag: "int i", value: "4 байта", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Бокс <code>(object)i</code> — это <b>объект на куче</b>: object-заголовок (~16 байт на 64-бит) + значение + выравнивание. Заметно <span class="hl">дороже</span> 4 байт.', nodes: [{ id: "v", kind: "obj", at: { zone: "val", row: 0 }, typeTag: "int i", value: "4 байта" }, { id: "h", kind: "obj", at: { zone: "hdr", row: 0 }, typeTag: "boxed int", value: "header + 4 + pad", accent: true }], edges: [{ id: "e", from: "v", to: "h", accent: true }] },
        { codeLine: 2, out: "boxes bytes: 24000 per-box: 24", caption: 'Панель: 1000 боксов = <b>24000 байт</b> → <span class="hl">24 байта на бокс</span> (реальный прогон). В <b>6 раз</b> больше 4 байт голого int.', nodes: [{ id: "h", kind: "gate", at: { zone: "hdr", row: 0 }, state: "fail", label: "1000 боксов", detail: "24000 B", accent: true }, { id: "v", kind: "gate", at: { zone: "val", row: 0 }, state: "ok", label: "per-box", detail: "24 B" }], edges: [] },
      ],
      explain: 'Здесь мы измеряем цену <b>одного</b> бокса. На стеке <code>int</code> — 4 байта. Бокс же — это полноценный managed-объект: object-заголовок (указатель на method table + sync block, ~16 байт на 64-битной среде) плюс само значение плюс выравнивание до 8. Собственный детерминированный прогон <code>GC.GetAllocatedBytesForCurrentThread()</code> вокруг 1000 упаковок даёт <b>24000 байт</b> — ровно <b>24 байта на бокс</b>, в 6 раз больше голого int. Это и есть скрытая стоимость нетипизированных коллекций и любого неявного боксинга (например, <code>object o = 42;</code> или передача value-типа в параметр <code>object</code>). Умножь на миллионы элементов в горячем пути — получишь давление на GC, которого generics полностью избегают.',
      sources: ["ms-generics-std"],
    },
    {
      id: "s3", num: "03", kicker: "Два бокса ≠ один", title: "Два (object)42 — два разных объекта на куче",
      viewBox: "0 0 340 210", zones: TWO_ZONES,
      code: ["int x = 42;", "object b1 = x;  object b2 = x;   // ДВА отдельных бокса", "// ReferenceEquals(b1,b2)=False, b1.Equals(b2)=True, (int)b1=42"],
      predictAt: 1, predictQ: 'Упаковали одно значение <code>42</code> дважды. Что даст <code>ReferenceEquals(b1,b2)</code>, <code>b1.Equals(b2)</code>, <code>(int)b1</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Каждое <code>(object)x</code> — <b>новая</b> аллокация. <code>b1</code> и <code>b2</code> ссылаются на <span class="hl">разные</span> объекты, хотя значение одно.', nodes: [{ id: "b1", kind: "obj", at: { zone: "b1", row: 0 }, typeTag: "b1", value: "boxed 42", accent: true }, { id: "b2", kind: "obj", at: { zone: "b2", row: 0 }, typeTag: "b2", value: "boxed 42" }], edges: [] },
        { codeLine: 2, out: "False True 42", caption: 'Панель: <code>ReferenceEquals</code>=<b>False</b> (разные объекты), <code>Equals</code>=<b>True</b> (равные значения), <code>(int)b1</code>=<span class="hl">42</span> (распаковка) — реальный прогон.', nodes: [{ id: "b1", kind: "gate", at: { zone: "b1", row: 0 }, state: "fail", label: "b1 ≠ b2", detail: "Reference=False", accent: true }, { id: "b2", kind: "gate", at: { zone: "b2", row: 0 }, state: "ok", label: "значения", detail: "Equals=True" }], edges: [] },
      ],
      explain: 'Разбор подтверждает: боксинг — это <b>аллокация нового объекта</b>, а не «пометка» значения. Упаковав <code>42</code> дважды, получаем <b>два</b> разных объекта на куче: <code>ReferenceEquals(b1,b2)</code> = <code>False</code> (идентичность различна), но <code>b1.Equals(b2)</code> = <code>True</code> (переопределённый <code>Equals</code> сравнивает <b>значения</b>), а <code>(int)b1</code> = <code>42</code> (распаковка возвращает копию значения). Реальный прогон: <code>False True 42</code>. Практический смысл: в цикле, где ты боксишь одно и то же значение, ты каждый раз платишь за <b>новую</b> аллокацию — компилятор не кэширует боксы (в отличие от, например, интернирования строк). Ещё один аргумент за <code>List&lt;int&gt;</code>, где никаких боксов вообще нет.',
      sources: ["ms-generics-std"],
    },
    {
      id: "s4", num: "04", kicker: "List<int> · inline", title: "List<int> хранит int в массиве, без единого бокса",
      viewBox: "0 0 340 210", zones: INLINE_ZONES,
      code: ["List<int> gl = new List<int>();", "gl.Add(42);   // сигнатура Add(int) → значение кладётся ПРЯМО в int[]", "// int[] внутри List<int> хранит значения inline: 0 боксов"],
      scenes: [
        { codeLine: 1, out: "", caption: 'У <code>List&lt;int&gt;</code> метод — <code>Add(int)</code>, а слот внутреннего массива — <code>int</code>. Значение кладётся <span class="hl">прямо</span>, без упаковки.', nodes: [{ id: "l", kind: "obj", at: { zone: "inline", row: 0 }, typeTag: "List<int>", value: "int[] inline", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Никакого объекта-бокса на элемент: 1000 int занимают <b>один</b> int-массив (~4 КБ), а не 1000 отдельных объектов. Это value-специализация из первого урока.', nodes: [{ id: "l", kind: "obj", at: { zone: "inline", row: 0 }, typeTag: "List<int>", value: "1000 int в int[]" }, { id: "z", kind: "chip", at: { zone: "inline", row: 1 }, value: "0 боксов", accent: true }], edges: [] },
      ],
      explain: 'Обобщённый <code>List&lt;int&gt;</code> закрывает дыру боксинга структурно: его слот — <code>int</code>, а не <code>object</code>. Значение хранится <b>inline</b> во внутреннем <code>int[]</code>, поэтому упаковка не нужна вовсе — ровно то, о чём говорит документация: «Generic collection types generally perform better for storing and manipulating value types because there is <span class="hl">no need to box the value types</span>». <span class="ru-tr">«Обобщённые типы коллекций, как правило, работают лучше при хранении и обработке значимых типов, потому что нет необходимости упаковывать значимые типы».</span> Это та же value-специализация закрытого типа, что мы видели в уроке <code>generics-runtime</code>: <code>List&lt;int&gt;</code> — отдельная специализация <code>List`1</code>, где элемент лежит по значению. Итог: одна аллокация массива вместо тысячи аллокаций боксов; меньше памяти, меньше работы GC, лучше локальность кэша. Машинная панель дальше покажет разницу числом.',
      sources: ["ms-generics-std"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · замер аллокаций", title: "ArrayList 32056 B vs List<int> 4056 B на 1000 int",
      viewBox: "0 0 340 210", zones: MEASURE_ZONES,
      code: ["var al = new ArrayList(1000);  for(..1000) al.Add(i);   // боксит", "var gl = new List<int>(1000);  for(..1000) gl.Add(i);   // inline", "// GC.GetAllocatedBytesForCurrentThread() вокруг каждого (pre-sized + warmed)"],
      predictAt: 1, predictQ: 'Обе коллекции предразмерены на 1000 и добавляют те же 1000 int. Кто аллоцирует больше — <code>ArrayList</code> (боксит) или <code>List&lt;int&gt;</code> (inline)?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>ArrayList</code> боксит каждый <code>int</code> в отдельный объект: 1000 боксов по 24 байта + массив ссылок. <span class="hl">Дорого</span>.', nodes: [{ id: "a", kind: "obj", at: { zone: "al", row: 0 }, typeTag: "ArrayList", value: "1000 боксов", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>List&lt;int&gt;</code> хранит <code>int</code> inline в одном массиве — <b>0 боксов</b>. Только <span class="hl">один</span> int-массив на 1000 значений.', nodes: [{ id: "a", kind: "obj", at: { zone: "al", row: 0 }, typeTag: "ArrayList", value: "1000 боксов" }, { id: "g", kind: "obj", at: { zone: "gl", row: 0 }, typeTag: "List<int>", value: "int[] inline", accent: true }], edges: [] },
        { codeLine: 2, out: "ArrayList: 32056 List<int>: 4056", caption: 'Панель: <code>ArrayList</code> — <b>32056 B</b>, <code>List&lt;int&gt;</code> — <b>4056 B</b> → <span class="hl">~8× дешевле</span> (реальный прогон). Тот же результат, разная цена.', nodes: [{ id: "ag", kind: "gate", at: { zone: "al", row: 0 }, state: "fail", label: "ArrayList", detail: "32056 B" }, { id: "gg", kind: "gate", at: { zone: "gl", row: 0 }, state: "ok", label: "List<int>", detail: "4056 B", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — полная цена боксинга на коллекции, снятая числом. Обе коллекции предразмерены на 1000 (чтобы исключить аллокации на рост) и прогреты (чтобы снять шум JIT), затем каждая наполняется 1000 <code>int</code> под <code>GC.GetAllocatedBytesForCurrentThread()</code>. Реальный прогон: <code>ArrayList</code> — <b>32056 байт</b> (1000 боксов по 24 байта + массив object-ссылок ~8 КБ), <code>List&lt;int&gt;</code> — <b>4056 байт</b> (int-массив на 1000 × 4 байта + служебное). Разница — <b>почти 8×</b>. Дословный вывод из документации: «Generic collection types generally perform better for storing and manipulating value types because there is <span class="hl">no need to box the value types</span>». <span class="ru-tr">«Обобщённые типы коллекций, как правило, работают лучше при хранении и обработке значимых типов, потому что нет необходимости упаковывать значимые типы».</span> Это самый практичный аргумент за generics в горячем пути: не только type safety, но и радикально меньшее давление на GC.',
      sources: ["ms-generics-std"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>const int N=1000; var w1=new ArrayList(N); for(int i=0;i&lt;N;i++)w1.Add(i); var w2=new List&lt;int&gt;(N); for(int i=0;i&lt;N;i++)w2.Add(i); long a0=GC.GetAllocatedBytesForCurrentThread(); var al=new ArrayList(N); for(int i=0;i&lt;N;i++)al.Add(i); long a1=GC.GetAllocatedBytesForCurrentThread(); var gl=new List&lt;int&gt;(N); for(int i=0;i&lt;N;i++)gl.Add(i); long a2=GC.GetAllocatedBytesForCurrentThread(); Console.WriteLine($"ArrayList: {a1-a0} List&lt;int&gt;: {a2-a1}");</code> — что напечатает?',
      options: ["ArrayList: 32056 List<int>: 4056", "ArrayList: 4056 List<int>: 32056", "ArrayList: 4056 List<int>: 4056", "ArrayList: 0 List<int>: 0"], correctIndex: 0, xp: 10,
      okText: '<code>ArrayList</code> боксит каждый int (слот <code>object</code>) → <b>32056 B</b>; <code>List&lt;int&gt;</code> хранит inline → <b>4056 B</b>. «no need to box the value types» <span class="ru-tr">«нет необходимости упаковывать значимые типы»</span> — <span class="hl">~8×</span> дешевле.',
      noText: 'Нетипизированный <code>ArrayList</code> упаковывает 1000 int в 1000 объектов; <code>List&lt;int&gt;</code> — один int-массив. Реальный прогон: <b>ArrayList: 32056 List<int>: 4056</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "ArrayList: 32056 List<int>: 4056" }, sourceRefs: ["ms-generics-std"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>int x = 42; object b1 = x; object b2 = x; Console.WriteLine($"{object.ReferenceEquals(b1, b2)} {b1.Equals(b2)} {(int)b1}");</code> — что напечатает?',
      options: ["False True 42", "True True 42", "False False 42", "True False 0"], correctIndex: 0, xp: 10,
      okText: 'Каждый <code>(object)x</code> — <b>новая</b> аллокация: <code>b1</code> и <code>b2</code> — разные объекты (<code>ReferenceEquals</code>=<span class="hl">False</span>), но равные значения (<code>Equals</code>=True), распаковка даёт 42. Вывод: <b>False True 42</b>.',
      noText: 'Боксинг = аллокация нового объекта, не пометка. Два бокса одного значения не reference-equal, но value-equal. <code>(int)b1</code> распаковывает 42. Реальный вывод: <b>False True 42</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "False True 42" }, sourceRefs: ["ms-generics-std"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>const int N=1000; object sink=null; for(int i=0;i&lt;N;i++) sink=(object)i; long a0=GC.GetAllocatedBytesForCurrentThread(); for(int i=0;i&lt;N;i++) sink=(object)i; long a1=GC.GetAllocatedBytesForCurrentThread(); Console.WriteLine($"boxes bytes: {a1-a0} per-box: {(a1-a0)/N}");</code> — что напечатает?',
      options: ["boxes bytes: 24000 per-box: 24", "boxes bytes: 4000 per-box: 4", "boxes bytes: 0 per-box: 0", "boxes bytes: 16000 per-box: 16"], correctIndex: 0, xp: 10,
      okText: 'Каждый бокс int — managed-объект: header + значение + padding = <b>24 байта</b>. 1000 боксов = <b>24000 B</b>, per-box <span class="hl">24</span>. В 6× больше 4-байтного int.',
      noText: 'Бокс — полноценный объект на куче (не 4 байта). Замер: 1000 упаковок = 24000 байт, по 24 на бокс. Реальный вывод: <b>boxes bytes: 24000 per-box: 24</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "boxes bytes: 24000 per-box: 24" }, sourceRefs: ["ms-generics-std"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Почему боксит", v: '<code>ArrayList</code> хранит слот как <code>object</code> → каждый <code>int</code> при <code>Add</code> упаковывается в объект на куче. <code>List&lt;int&gt;</code> хранит <code>int</code> <b>inline</b>: «<span class="hl">no need to box the value types</span>». <span class="ru-tr">«нет необходимости упаковывать значимые типы».</span>' },
    { icon: "cost", k: "Цена измерима", v: 'Один бокс int = <b>24 байта</b> (header+значение+padding) против 4 байт голого int (замер: 24000/1000). Два <code>(object)42</code> — два разных объекта (замер: <code>ReferenceEquals</code>=False).' },
    { icon: "avoid", k: "На коллекции ~8×", v: '1000 int: <code>ArrayList</code> <b>32056 B</b> против <code>List&lt;int&gt;</code> <b>4056 B</b> (замер). Меньше памяти и давления на GC — практичнейший аргумент за generics в горячем пути, помимо type safety.' },
  ],

  foot: 'урок · <b>generics убирают боксинг</b> · 5 анимир. разборов · цена бокса 24 B · панель ArrayList 32056 vs List<int> 4056 · дизайн <b>mid</b>',
};
