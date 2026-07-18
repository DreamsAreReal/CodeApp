/**
 * Lesson: Enum и [Flags] — value type под именами (CS.S1.enum-flags) — expert density,
 * 5 animated deep-dives. What an enum actually is: a value type over a named set of integral
 * constants; the underlying type is int by DEFAULT but can be any integral type; [Flags] makes
 * members power-of-two bit fields combined with | and tested with &; the default is (E)0 even
 * without a 0-member (an invalid value); enum↔underlying conversions are EXPLICIT casts (only 0
 * is implicit); and an enum is a real value type — it BOXES to System.Enum.
 *
 * SIGNATURE machine panel (s5): enum BOXES — a real GC.GetAllocatedBytesForCurrentThread
 * measurement shows the allocation, and `boxed is Enum` is True (evidence/F8/enum-flags-exec.txt).
 * This kills the "enum is just int" myth at the machine level.
 *
 * Accuracy contract (G4/G7/G8) — verified against Learn enum (fetch 2026-07-18) + GT-M3-s1.md:
 *   - every English quote is VERBATIM from learn.microsoft.com/.../builtin-types/enum;
 *   - every card's verify.expect is the REAL stdout of run-csharp (evidence/F8/enum-flags-exec.txt:
 *     "Read, Write True False"; "4 Byte"; "0 0 False");
 *   - NO GT-M3 red flags: enum is NOT always int (any integral); enum→int is NOT implicit (cast
 *     needed, only 0 implicit); enum BOXES (it is a real value type); the & bit-test pattern is
 *     used (NOT Enum.HasFlag, which this source page does not document).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S1.enum-flags/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the named constants over their integral values.
const Z_NAMES: Zone = { id: "names", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ИМЕНА · enum", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "именованные константы", subCls: "vz-zsub", subY: 47 };
const Z_INTS: Zone = { id: "ints", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "INTEGRAL · значения", labelCls: "vz-zlabel heap sm", lx: 257, ly: 24, sub: "int по умолчанию", subCls: "vz-zsub heap", subY: 47 };
const ENUM_ZONES: Zone[] = [Z_NAMES, Z_INTS];

// s2: [Flags] bit fields — the bit lanes.
const Z_BITS: Zone = { id: "bits", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "[Flags] · БИТОВЫЕ ПОЛЯ", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "степени двойки · | и &", subCls: "vz-zsub", subY: 47 };
const FLAGS_ZONES: Zone[] = [Z_BITS];

// s3: underlying type is a CHOICE — two lanes int vs byte.
const Z_INT: Zone = { id: "intT", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "enum : int (default)", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "4 байта", subCls: "vz-zsub", subY: 47 };
const Z_BYTE: Zone = { id: "byteT", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "enum : byte", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "1 байт · явно указан", subCls: "vz-zsub good", subY: 47 };
const UNDERLYING_ZONES: Zone[] = [Z_INT, Z_BYTE];

// s4: default = (E)0 even without a 0-member — the invalid-value trap.
const Z_DEF: Zone = { id: "def", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "default(E) = (E)0", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "даже без члена со значением 0", subCls: "vz-zsub", subY: 47 };
const DEFAULT_ZONES: Zone[] = [Z_DEF];

// s5 (SIGNATURE): enum boxes — value on the stack, boxed System.Enum on the heap.
const Z_STACK: Zone = { id: "stack", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone good", label: "СТЕК · enum", labelCls: "vz-zlabel good sm", lx: 83, ly: 24, sub: "value type", subCls: "vz-zsub good", subY: 47 };
const Z_HEAP: Zone = { id: "heap", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "GC-КУЧА · boxed", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "System.Enum", subCls: "vz-zsub heap", subY: 47 };
const BOX_ZONES: Zone[] = [Z_STACK, Z_HEAP];

export const enumFlags: LessonData = {
  id: "CS.S1.enum-flags",
  track: "CS",
  section: "CS.S1",
  module: "S1.7",
  lang: "csharp",
  title: "Enum и [Flags]: value type под именами",
  kicker: "C# вглубь · S1 · биты и боксинг",
  home: { subtitle: "underlying type, [Flags], боксинг, приведения", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S1.type-system-map"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-enum", kind: "doc", org: "Microsoft Learn", title: "Enumeration types (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/enum", date: "2026-01-14" },
  ],

  spec: [
    { text: "«An enumeration type (or enum type) is a value type defined by a set of named constants of the underlying integral numeric type.»", source: "ms-enum" },
  ],
  edgeCases: [
    { text: "По умолчанию базовый тип — <code>int</code>, старт с 0, +1 по порядку; можно <b>явно</b> указать любой другой integral (<code>byte</code>, <code>ushort</code>, <code>long</code>…).", source: "ms-enum" },
    { text: "<code>default(E) = (E)0</code> даже без члена со значением 0 (может дать <span class=\"hl\">невалидное</span> значение); неявно конвертируется только литерал/<code>const</code> <code>0</code>. Валидируй <code>Enum.IsDefined</code>.", source: "ms-enum" },
    { text: "<code>System.Enum</code> — абстрактный базовый класс всех enum; enum удовлетворяет <code>struct</code>-constraint (non-nullable value type). Метод внутри enum объявить нельзя.", source: "ms-enum" },
  ],

  misconceptions: [
    {
      wrong: "enum — это всегда int, и он не боксится, это просто число",
      hook: 'Три ложные интуиции. «<span class="wrong">enum всегда int</span>» — нет: базовый тип можно указать любой integral (<code>byte</code>, <code>long</code>…). «<span class="wrong">enum → int неявно</span>» — нет: нужен <code>(int)</code>, неявно только <code>0</code>. «<span class="wrong">enum не боксится, это просто число</span>» — нет: enum — <b>настоящий value type</b>, он боксится в <code>System.Enum</code>. Ниже <b>пять разборов</b>: имена над числами, <code>[Flags]</code>-биты, выбор базового типа, ловушка <code>(E)0</code>, и <b>машинная панель</b> — реально снятый боксинг enum (аллокация + <code>is Enum</code>).',
      source: "ms-enum",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Имена над числами · value type", title: "enum — именованные integral-константы",
      viewBox: "0 0 340 210", zones: ENUM_ZONES,
      code: ["enum Season { Spring, Summer, Autumn, Winter }", "// Spring=0, Summer=1, Autumn=2, Winter=3"],
      scenes: [
        { codeLine: 0, caption: '<code>enum Season</code> — <b>value type</b>: набор именованных констант integral-типа.', nodes: [{ id: "sp", kind: "chip", at: { zone: "names", row: 0 }, value: "Spring" }, { id: "su", kind: "chip", at: { zone: "names", row: 1 }, value: "Summer", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Значения по умолчанию: <span class="hl">старт с 0</span>, +1 по порядку. Spring=0, Summer=1, …', nodes: [{ id: "sp", kind: "chip", at: { zone: "names", row: 0 }, value: "Spring" }, { id: "su", kind: "chip", at: { zone: "names", row: 1 }, value: "Summer" }, { id: "v0", kind: "slot", at: { zone: "ints", row: 0 }, name: "= 0", value: "int" }, { id: "v1", kind: "slot", at: { zone: "ints", row: 1 }, name: "= 1", value: "int", accent: true }], edges: [] },
      ],
      explain: 'Enum — это value type над числами: «An enumeration type… is a <b>value type</b> defined by a set of named constants of the underlying <span class="hl">integral numeric</span> type». Значения по умолчанию: «By default, the associated constant values of enum members are of type <code>int</code>. They <b>start with zero and increase by one</b> following the definition text order». Имена — удобная обёртка над целыми: <code>Season.Autumn</code> и есть <code>2</code>. Метод внутри enum объявить нельзя — только extension-члены.',
      sources: ["ms-enum"],
    },
    {
      id: "s2", num: "02", kicker: "[Flags] · битовые поля", title: "Степени двойки, комбинируем | и проверяем &",
      viewBox: "0 0 340 210", zones: FLAGS_ZONES,
      code: ["[Flags] enum Perm { None=0, Read=1, Write=2, Exec=4 }", "var p = Perm.Read | Perm.Write;   // 0b011", "(p & Perm.Write) == Perm.Write;   // True", "(p & Perm.Exec)  == Perm.Exec;    // False"],
      predictAt: 1, predictQ: '<code>p = Read | Write</code>. Что даст <code>ToString(p)</code>, затем проверки <code>(p&amp;Write)==Write</code> и <code>(p&amp;Exec)==Exec</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>Read=1, Write=2, Exec=4</code> — <b>степени двойки</b> (биты). <code>Read | Write</code> зажигает биты 0 и 1 → <span class="hl">0b011</span>.', nodes: [{ id: "r", kind: "chip", at: { zone: "bits", row: 0, col: 0 }, value: "Read·1" }, { id: "w", kind: "chip", at: { zone: "bits", row: 0, col: 1 }, value: "Write·2", accent: true }, { id: "or", kind: "chip", at: { zone: "bits", row: 0, col: 2 }, value: "= 0b011", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>(p &amp; Write) == Write</code>: бит Write установлен → <span class="hl">True</span>. Пересечение <code>&amp;</code> проверяет флаг.', nodes: [{ id: "or", kind: "chip", at: { zone: "bits", row: 0, col: 0 }, value: "0b011" }, { id: "chk", kind: "gate", at: { zone: "bits", row: 1, col: 0 }, state: "ok", label: "& Write", detail: "True", accent: true }], edges: [] },
        { codeLine: 3, out: "Read, Write True False", caption: '<code>(p &amp; Exec) == Exec</code>: бит Exec <b>не</b> установлен → <span class="hl">False</span>. ToString: <b>Read, Write</b> (реальный прогон).', nodes: [{ id: "or", kind: "chip", at: { zone: "bits", row: 0, col: 0 }, value: "0b011" }, { id: "ok", kind: "gate", at: { zone: "bits", row: 1, col: 0 }, state: "ok", label: "& Write", detail: "True" }, { id: "no", kind: "gate", at: { zone: "bits", row: 1, col: 1 }, state: "fail", label: "& Exec", detail: "False", accent: true }], edges: [] },
      ],
      explain: 'Для комбинации выборов enum делают битовыми флагами: «use the associated values of those enum members as the <b>powers of two</b>. Then, use the bitwise logical operators <code>|</code> or <code>&amp;</code> to <span class="hl">combine</span> choices or <span class="hl">intersect</span> combinations of choices… apply the <code>[Flags]</code> attribute». Прогон: <code>Read | Write</code> печатает <code>Read, Write</code> (атрибут <code>[Flags]</code> учит <code>ToString</code> раскладывать биты); <code>(p &amp; Write) == Write</code> → True, <code>(p &amp; Exec) == Exec</code> → False. Комбинация — это ИЛИ битов, проверка флага — И с последующим сравнением.',
      sources: ["ms-enum"],
    },
    {
      id: "s3", num: "03", kicker: "Базовый тип · это выбор", title: "int по умолчанию, но можно byte/long",
      viewBox: "0 0 340 210", zones: UNDERLYING_ZONES,
      code: ["enum A { X }             // : int (default), 4 байта", "enum Size : byte { S=1, M=2, L=4 }  // 1 байт", "Console.WriteLine($\"{(int)Size.L} {Enum.GetUnderlyingType(typeof(Size)).Name}\");"],
      predictAt: 1, predictQ: 'У <code>enum Size : byte</code> — что даст <code>(int)Size.L</code> и <code>GetUnderlyingType(...).Name</code>?', console: true,
      scenes: [
        { codeLine: 0, caption: 'Без указания базовый тип — <b>int</b> (4 байта). Это дефолт, не закон.', nodes: [{ id: "i", kind: "obj", at: { zone: "intT", row: 0 }, typeTag: "enum A", value: ": int", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>enum Size : byte</code> — базовый тип <span class="hl">явно byte</span> (1 байт): компактнее, если значения помещаются.', nodes: [{ id: "i", kind: "obj", at: { zone: "intT", row: 0 }, typeTag: "enum A", value: ": int" }, { id: "b", kind: "obj", at: { zone: "byteT", row: 0 }, typeTag: "Size", value: ": byte", accent: true }], edges: [] },
        { codeLine: 2, out: "4 Byte", caption: '<code>(int)Size.L</code> → <b>4</b> (явный каст к базовому); <code>GetUnderlyingType</code> → <span class="hl">Byte</span>. Реальный прогон.', nodes: [{ id: "b", kind: "obj", at: { zone: "byteT", row: 0 }, typeTag: "Size.L", value: "4" }, { id: "u", kind: "gate", at: { zone: "byteT", row: 1 }, state: "ok", label: "underlying", detail: "Byte", accent: true }], edges: [] },
      ],
      explain: 'Опровержение мифа «enum всегда int». Дословно: «You can <b>explicitly specify any other integral numeric type</b> as an underlying type of an enumeration type». Прогон: <code>enum Size : byte</code> даёт underlying <code>Byte</code>, <code>(int)Size.L</code> → <b>4</b>. Каст между enum и его базовым типом — <span class="hl">явный</span>: «explicit conversions exist between the enumeration type and its underlying integral type». Практика: выбирай узкий базовый тип для компактных enum (например, в структурах данных), но помни — по умолчанию это int.',
      sources: ["ms-enum"],
    },
    {
      id: "s4", num: "04", kicker: "Ловушка · (E)0 без члена", title: "default(E) = (E)0, даже если такого члена нет",
      viewBox: "0 0 340 210", zones: DEFAULT_ZONES,
      code: ["enum Color { Red=1, Green=2 }   // нет члена со значением 0", "Color c = default;               // (Color)0", "Console.WriteLine($\"{(int)c} {c} {Enum.IsDefined(typeof(Color), c)}\");"],
      predictAt: 1, predictQ: 'У <code>Color</code> нет члена со значением 0. Что даст <code>(int)c</code>, <code>c</code> и <code>IsDefined</code> для <code>c = default</code>?', console: true,
      scenes: [
        { codeLine: 0, caption: 'У <code>Color</code> члены <code>Red=1, Green=2</code> — <span class="hl">нет</span> члена со значением 0.', nodes: [{ id: "r", kind: "chip", at: { zone: "def", row: 0, col: 0 }, value: "Red=1" }, { id: "g", kind: "chip", at: { zone: "def", row: 0, col: 1 }, value: "Green=2", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>Color c = default</code> → <code>(Color)0</code>. Значение 0 <b>есть</b>, а имени для него <span class="hl">нет</span>.', nodes: [{ id: "r", kind: "chip", at: { zone: "def", row: 0, col: 0 }, value: "Red=1" }, { id: "g", kind: "chip", at: { zone: "def", row: 0, col: 1 }, value: "Green=2" }, { id: "z", kind: "gate", at: { zone: "def", row: 1, col: 0 }, state: "fail", label: "default → (Color)0", detail: "нет имени", accent: true }], edges: [] },
        { codeLine: 2, out: "0 0 False", caption: 'Печать: <code>(int)c</code>=<b>0</b>, <code>c</code>=<b>0</b> (нет имени), <code>IsDefined</code>=<span class="hl">False</span> — невалидное значение (реальный прогон).', nodes: [{ id: "z", kind: "gate", at: { zone: "def", row: 0 }, state: "fail", label: "c = (Color)0", detail: "0 · невалидно" }, { id: "v", kind: "gate", at: { zone: "def", row: 1 }, state: "fail", label: "IsDefined", detail: "False", accent: true }], edges: [] },
      ],
      explain: 'Тонкая ловушка. Дословно: «The default value of an enumeration type <code>E</code> is the value produced by expression <code>(E)0</code>, <span class="hl">even if zero doesn\'t have the corresponding enum member</span>». Прогон: <code>default(Color)</code> = 0, но у <code>Color</code> нет члена 0, поэтому <code>ToString</code> печатает <code>0</code>, а <code>Enum.IsDefined</code> → <b>False</b>. Почему так: «the 0-bit pattern is the default for all struct types, including all enum types». Рекомендация доки: «Almost always define a member with value <code>0</code> in your enums» и валидируй <code>Enum.IsDefined</code> при конвертации из чисел.',
      sources: ["ms-enum"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · enum боксится", title: "enum — настоящий value type: реальный боксинг",
      viewBox: "0 0 340 210", zones: BOX_ZONES,
      code: ["enum E { A, B }", "b0 = GC.GetAllocatedBytesForCurrentThread();", "object boxed = E.B;     // boxing → System.Enum", "b1 = GC.GetAllocatedBytesForCurrentThread();", "// (b1-b0) > 0  ·  boxed is Enum == True"],
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>E.B</code> — value на стеке. Замеряем аллокации <b>до и после</b> боксинга живым счётчиком GC.', nodes: [{ id: "e", kind: "slot", at: { zone: "stack", row: 0 }, name: "E.B", value: "value", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>object boxed = E.B</code>: <span class="hl">боксинг</span> — CLR аллоцирует объект <code>System.Enum</code> на куче и копирует значение.', nodes: [{ id: "e", kind: "slot", at: { zone: "stack", row: 0 }, name: "E.B", value: "value" }, { id: "bx", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "boxed E", value: "B", accent: true }], edges: [{ id: "e1", from: "e", to: "bx", accent: true }] },
        { codeLine: 4, out: "True B True", caption: 'Панель: аллокация <b>&gt;0 True</b>, <code>boxed</code>=<b>B</b>, <code>boxed is Enum</code>=<span class="hl">True</span>. enum реально боксится (реальный прогон).', nodes: [{ id: "a", kind: "gate", at: { zone: "heap", row: 0 }, state: "ok", label: "аллокация", detail: "> 0 · True" }, { id: "t", kind: "gate", at: { zone: "heap", row: 1 }, state: "ok", label: "is Enum", detail: "True", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — боксинг enum, снятый числом. Дословно: «For any enumeration type, <b>boxing and unboxing</b> conversions to and from the <code>System.Enum</code> type exist». Прогон: <code>object boxed = E.B</code> увеличил <code>GC.GetAllocatedBytesForCurrentThread()</code> (аллокация &gt;0 → <b>True</b>), а <code>boxed is Enum</code> → <b>True</b>. Это опровергает миф «enum — просто int, он не боксится»: enum — настоящий value type (наследует <code>System.Enum</code> → <code>ValueType</code> → <code>object</code>), и трактовка как <code>object</code> стоит аллокации на куче, как у любого value-типа. Отсюда — избегай лишних боксингов enum в горячем коде (например, <code>object</code>-параметры, необобщённые коллекции).',
      sources: ["ms-enum"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>[Flags] enum Perm{ None=0, Read=1, Write=2, Exec=4 } var p = Perm.Read | Perm.Write; Console.WriteLine($"{p} {(p&amp;Perm.Write)==Perm.Write} {(p&amp;Perm.Exec)==Perm.Exec}");</code> — что напечатает?',
      options: ["Read, Write True False", "3 True False", "Read, Write True True", "Read Write True False"], correctIndex: 0, xp: 10,
      okText: '<code>[Flags]</code> учит <code>ToString</code> раскладывать биты: <code>Read | Write</code> → <b>Read, Write</b>. <code>(p&amp;Write)==Write</code> → True (бит установлен), <code>(p&amp;Exec)==Exec</code> → False.',
      noText: '<code>|</code> комбинирует биты, <code>&amp;</code> проверяет флаг. Реальный вывод: <b>Read, Write True False</b> — Exec не входит в комбинацию.',
      verify: { kind: "exec", run: "dotnet run", expect: "Read, Write True False" }, sourceRefs: ["ms-enum"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>enum Size : byte { S=1, M=2, L=4 } Console.WriteLine($"{(int)Size.L} {Enum.GetUnderlyingType(typeof(Size)).Name}");</code> — что напечатает?',
      options: ["4 Byte", "4 Int32", "L Byte", "4 byte"], correctIndex: 0, xp: 10,
      okText: 'Базовый тип указан <span class="hl">явно byte</span>: <code>GetUnderlyingType</code> → <b>Byte</b>. <code>(int)Size.L</code> — явный каст к целому → <b>4</b>. enum <b>не</b> всегда int.',
      noText: '«You can explicitly specify any other integral numeric type as an underlying type». Underlying — <b>Byte</b>, значение L — <b>4</b>. Реальный вывод: <b>4 Byte</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "4 Byte" }, sourceRefs: ["ms-enum"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>enum Color{ Red=1, Green=2 } Color c = default; Console.WriteLine($"{(int)c} {c} {Enum.IsDefined(typeof(Color), c)}");</code> — что напечатает?',
      options: ["0 0 False", "1 Red True", "0 Red False", "0 0 True"], correctIndex: 0, xp: 10,
      okText: '<code>default(Color)</code> = <code>(Color)0</code>, но у <code>Color</code> нет члена 0: <code>(int)c</code>=<b>0</b>, <code>c</code>=<b>0</b> (нет имени), <code>IsDefined</code>=<span class="hl">False</span> (невалидно).',
      noText: '«The default value… is (E)0, even if zero doesn\'t have the corresponding enum member». Реальный вывод: <b>0 0 False</b>. Всегда определяй член со значением 0.',
      verify: { kind: "exec", run: "dotnet run", expect: "0 0 False" }, sourceRefs: ["ms-enum"],
    },
  ],

  takeaways: [
    { icon: "why", k: "[Flags] = биты", v: 'Степени двойки + <code>[Flags]</code>: <code>|</code> комбинирует, <code>(x &amp; F) == F</code> проверяет флаг. <code>Read | Write</code> → «Read, Write». Проверка Exec — False.' },
    { icon: "cost", k: "Базовый тип и боксинг", v: 'По умолчанию <b>int</b>, но можно любой integral (<code>byte</code>…). enum → int — <span class="hl">явный</span> каст (неявно только 0). enum <b>боксится</b> в <code>System.Enum</code> (замер: аллокация &gt;0, <code>is Enum</code> True) — это value type, не «просто число».' },
    { icon: "avoid", k: "Ловушка (E)0", v: '<code>default(E)</code> = <code>(E)0</code> даже без члена 0 → <span class="hl">невалидное</span> значение (<code>IsDefined</code> False). Почти всегда определяй член <code>= 0</code> и валидируй при конвертации из чисел.' },
  ],

  foot: 'урок · <b>enum и [Flags]</b> · 5 анимир. разборов · панель боксинга enum · дизайн <b>mid</b>',
};
