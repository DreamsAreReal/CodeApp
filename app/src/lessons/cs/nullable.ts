/**
 * Lesson: Nullable<T> — value type, который умеет null (CS.S1.nullable) — expert density,
 * 5 animated deep-dives. The machine truth: `int?` is NOT a reference type — it's the struct
 * Nullable<T> (a value + a HasValue flag); .Value throws when empty; lifted operators propagate
 * null and comparisons with null are false; and — the signature — boxing a nullable boxes the
 * UNDERLYING value (or null), never a boxed Nullable<T>, so ((int?)17).GetType() is Int32.
 *
 * SIGNATURE machine panel (s1): boxing an int? boxes the underlying Int32 (not Nullable<int>),
 * and `boxed is int` is True — a REAL run-csharp measurement (evidence/F8/nullable-exec.txt).
 * This is the machine-level proof that int? is a struct, not a heap reference.
 *
 * Accuracy contract (G4/G7/G8) — verified against Learn nullable-value-types (fetch 2026-07-18)
 * + GT-M3-s1.md:
 *   - every English quote is VERBATIM from learn.microsoft.com/.../builtin-types/nullable-value-types;
 *   - every card's verify.expect is the REAL stdout of run-csharp (evidence/F8/nullable-exec.txt:
 *     "Int32 True"; "True False 0"; "True False False");
 *   - NO GT-M3 red flags: int? is a STRUCT (not a reference type); boxing a nullable gives null or
 *     boxed T (never boxed Nullable<T>); .Value throws when HasValue false; nullable value types are
 *     NOT the same as nullable reference types (string?).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S1.nullable/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1 (SIGNATURE): the box — value on the stack, boxed underlying Int32 on the heap.
const Z_STACK: Zone = { id: "stack", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "СТЕК · int? n = 17", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "Nullable<int> · struct", subCls: "vz-zsub good", subY: 47 };
const Z_HEAP: Zone = { id: "heap", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "GC-КУЧА · boxed", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "boxed Int32 (не Nullable)", subCls: "vz-zsub heap", subY: 47 };
const BOX_ZONES: Zone[] = [Z_STACK, Z_HEAP];

// s2: the struct layout — value + HasValue flag.
const Z_LAYOUT: Zone = { id: "layout", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "Nullable<T> · СТРУКТУРА", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "value + HasValue", subCls: "vz-zsub", subY: 47 };
const LAYOUT_ZONES: Zone[] = [Z_LAYOUT];

// s3: .Value gate — throws when empty.
const Z_HASVAL: Zone = { id: "hasval", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "HasValue == true", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: ".Value безопасен", subCls: "vz-zsub good", subY: 47 };
const Z_EMPTY: Zone = { id: "empty", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "HasValue == false", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: ".Value бросает", subCls: "vz-zsub heap", subY: 47 };
const VALUE_ZONES: Zone[] = [Z_HASVAL, Z_EMPTY];

// s4: lifted operators — null propagation + comparison-with-null.
const Z_LIFT: Zone = { id: "lift", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "LIFTED OPERATORS", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "null распространяется", subCls: "vz-zsub", subY: 47 };
const LIFT_ZONES: Zone[] = [Z_LIFT];

// s5: extraction — ?? and GetValueOrDefault vs explicit cast.
const Z_SAFE: Zone = { id: "safe", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "?? / GetValueOrDefault", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "безопасно", subCls: "vz-zsub good", subY: 47 };
const Z_CAST: Zone = { id: "cast", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "(int)n при null", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "бросает", subCls: "vz-zsub heap", subY: 47 };
const EXTRACT_ZONES: Zone[] = [Z_SAFE, Z_CAST];

export const nullable: LessonData = {
  id: "CS.S1.nullable",
  track: "CS",
  section: "CS.S1",
  module: "S1.9",
  lang: "csharp",
  title: "Nullable<T>: value type, который умеет null",
  kicker: "C# вглубь · S1 · структура под T?",
  home: { subtitle: "Nullable<T> struct, боксинг, lifted operators", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S1.type-system-map"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-nullable", kind: "doc", org: "Microsoft Learn", title: "Nullable value types (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types", date: "2026-01-14" },
    { id: "ms-nullable-api", kind: "doc", org: "Microsoft Learn", title: "Nullable<T> Struct (API)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.nullable-1", date: "2025-07-01" },
  ],

  spec: [
    { text: "«If HasValue returns true, the boxing operation boxes the corresponding value of the underlying value type T, not the instance of Nullable<T>.» <span class=\"ru-tr\">«Если HasValue возвращает true, операция боксинга упаковывает соответствующее значение базового типа-значения T, а не экземпляр Nullable<T>.»</span>", source: "ms-nullable" },
  ],
  edgeCases: [
    { text: "<code>Nullable&lt;T&gt;.Value</code> при <code>HasValue == false</code> бросает <span class=\"hl\">InvalidOperationException</span>; явный каст <code>(int)n</code> при <code>n == null</code> — тоже бросает. Извлекай через <code>??</code>/<code>GetValueOrDefault()</code>.", source: "ms-nullable" },
    { text: "Lifted operators: <code>&lt;</code>/<code>&gt;</code>/<code>&lt;=</code>/<code>&gt;=</code> с <code>null</code> → <b>false</b> (обе стороны). Не выводи обратное: <code>a &gt;= null</code> false НЕ значит <code>a &lt; null</code> true. <code>bool?</code> <code>&amp;</code>/<code>|</code> — исключение.", source: "ms-nullable" },
    { text: "Nullable value type (<code>int?</code>) ≠ nullable reference type (<code>string?</code>): первый — <b>структура</b> <code>Nullable&lt;T&gt;</code>, второй — compile-time аннотация NRT, не тип в рантайме.", source: "ms-nullable" },
  ],

  misconceptions: [
    {
      wrong: "int? — это reference type, а его боксинг даёт boxed Nullable<T>",
      hook: 'Главный миф: «<span class="wrong">int? — это reference type / класс</span>». Нет: <code>int?</code> — это <b>структура</b> <code>Nullable&lt;T&gt;</code> (value + флаг <code>HasValue</code>); <code>null</code> — это <b>состояние</b> <code>HasValue==false</code>, а не ссылка на кучу. Второй миф: «<span class="wrong">боксинг int? даёт boxed Nullable&lt;T&gt;</span>» — нет: боксится <b>базовый тип</b> (или null), поэтому <code>((int?)17).GetType()</code> → <code>Int32</code>. Ниже <b>пять разборов</b>: <b>машинная панель</b> боксинга (реально снятое <code>Int32 True</code>), layout структуры, гейт <code>.Value</code>, lifted operators и извлечение значения.',
      source: "ms-nullable",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Машинная панель · боксинг nullable", title: "boxing int? даёт boxed Int32, не Nullable<T>",
      viewBox: "0 0 340 210", zones: BOX_ZONES,
      code: ["int? n = 17;", "object boxed = n;   // boxing nullable", "Console.WriteLine($\"{boxed.GetType().Name} {boxed is int}\");"],
      predictAt: 1, predictQ: '<code>int? n = 17; object boxed = n;</code>. Что даст <code>boxed.GetType().Name</code> и <code>boxed is int</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>int? n = 17</code> — на стеке <span class="hl">структура</span> <code>Nullable&lt;int&gt;</code>: значение 17 + флаг <code>HasValue=true</code>.', nodes: [{ id: "n", kind: "obj", at: { zone: "stack", row: 0 }, typeTag: "int? n", value: "17 · has", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>object boxed = n</code>: боксится <span class="hl">базовый тип</span> — на кучу кладётся <code>Int32</code>, <b>не</b> <code>Nullable&lt;int&gt;</code>.', nodes: [{ id: "n", kind: "obj", at: { zone: "stack", row: 0 }, typeTag: "int? n", value: "17 · has" }, { id: "bx", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "boxed Int32", value: "17", accent: true }], edges: [{ id: "e", from: "n", to: "bx", accent: true }] },
        { codeLine: 2, out: "Int32 True", caption: 'Панель: <code>GetType().Name</code>=<b>Int32</b> (не Nullable), <code>boxed is int</code>=<span class="hl">True</span> (реальный прогон).', nodes: [{ id: "g", kind: "gate", at: { zone: "heap", row: 0 }, state: "ok", label: "GetType()", detail: "Int32" }, { id: "t", kind: "gate", at: { zone: "heap", row: 1 }, state: "ok", label: "is int", detail: "True", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — боксинг nullable, снятый числом. Дословно: «If HasValue returns true, the boxing operation boxes the corresponding value of the <span class="hl">underlying value type T</span>, <b>not the instance of Nullable&lt;T&gt;</b>». <span class="ru-tr">«Если HasValue возвращает true, операция боксинга упаковывает соответствующее значение базового типа-значения T, <b>а не экземпляр Nullable&lt;T&gt;</b>».</span> Прогон: <code>object boxed = (int?)17</code> даёт <code>GetType()</code> = <b>Int32</b>, <code>boxed is int</code> = <b>True</b>. Дока подтверждает прямо: «<code>int? a = 17; a.GetType().FullName</code> → <code>System.Int32</code>». Это машинное доказательство, что <code>int?</code> — структура: если <code>HasValue==false</code>, боксинг даёт <code>null</code>, если true — boxed базовый тип. Никакого boxed <code>Nullable&lt;T&gt;</code> не существует.',
      sources: ["ms-nullable"],
    },
    {
      id: "s2", num: "02", kicker: "Layout · структура, не ссылка", title: "T? = Nullable<T> = значение + HasValue",
      viewBox: "0 0 340 210", zones: LAYOUT_ZONES,
      code: ["int? m = 10;   // Nullable<int>: value=10, HasValue=true", "int? empty = null;  // value=0, HasValue=false", "// int? — это struct, null — это состояние, не ссылка"],
      scenes: [
        { codeLine: 0, caption: '<code>int? m = 10</code> — структура <code>Nullable&lt;int&gt;</code>: <span class="hl">два поля</span> — value(10) и HasValue(true).', nodes: [{ id: "v", kind: "slot", at: { zone: "layout", row: 0, col: 0 }, name: "value", value: "10" }, { id: "h", kind: "slot", at: { zone: "layout", row: 0, col: 1 }, name: "HasValue", value: "true", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>int? empty = null</code>: <code>HasValue=false</code>, value=0. <code>null</code> здесь — <span class="hl">состояние структуры</span>, а не ссылка на кучу.', nodes: [{ id: "v", kind: "slot", at: { zone: "layout", row: 0, col: 0 }, name: "value", value: "0" }, { id: "h", kind: "slot", at: { zone: "layout", row: 0, col: 1 }, name: "HasValue", value: "false", accent: true }], edges: [] },
        { codeLine: 2, caption: '<code>typeof(int?).IsValueType</code> → <b>True</b>. Это value type, живёт inline на стеке, как любой struct.', nodes: [{ id: "iv", kind: "gate", at: { zone: "layout", row: 0 }, state: "ok", label: "int?.IsValueType", detail: "True", accent: true }], edges: [] },
      ],
      explain: 'Опровержение мифа «int? — reference type». Дословно: «Any nullable value type is an <b>instance of the generic <code>System.Nullable&lt;T&gt;</code> structure</b>. You can refer to a nullable value type… in any of the following interchangeable forms: <code>Nullable&lt;T&gt;</code> or <code>T?</code>». <span class="ru-tr">«Любой nullable value type — это <b>экземпляр обобщённой структуры <code>System.Nullable&lt;T&gt;</code></b>. Ссылаться на nullable value type можно в любой из следующих взаимозаменяемых форм: <code>Nullable&lt;T&gt;</code> или <code>T?</code>».</span> Это структура из значения и флага: «The default value of a nullable value type represents <code>null</code>. It\'s an instance whose <code>Nullable&lt;T&gt;.HasValue</code> property returns <code>false</code>». <span class="ru-tr">«Значение по умолчанию у nullable value type представляет <code>null</code>. Это экземпляр, у которого свойство <code>Nullable&lt;T&gt;.HasValue</code> возвращает <code>false</code>».</span> То есть <code>null</code> у <code>int?</code> — это <span class="hl">состояние</span> (<code>HasValue==false</code>), а не ссылка на кучу; <code>typeof(int?).IsValueType</code> → True. Базовый <code>T</code> сам не может быть nullable value type.',
      sources: ["ms-nullable"],
    },
    {
      id: "s3", num: "03", kicker: "Гейт .Value · бросает на пустом", title: ".Value при HasValue==false → исключение",
      viewBox: "0 0 340 210", zones: VALUE_ZONES,
      code: ["int? b = 10;  if (b.HasValue) use(b.Value);   // безопасно", "int? n = null;  int v = n.Value;   // InvalidOperationException", "// извлекай через ?? или GetValueOrDefault()"],
      predictAt: 1, predictQ: 'У <code>int? n = null</code> — что сделает <code>n.Value</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>HasValue==true</code>: <code>.Value</code> отдаёт базовое значение <span class="hl">безопасно</span>.', nodes: [{ id: "ok", kind: "gate", at: { zone: "hasval", row: 0 }, state: "ok", label: "b.HasValue", detail: "true → .Value OK", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>int? n = null</code>: <code>HasValue==false</code>. Обращение к <code>.Value</code> — <span class="hl">гейт закрыт</span>.', nodes: [{ id: "ok", kind: "gate", at: { zone: "hasval", row: 0 }, state: "ok", label: "b.Value", detail: "10" }, { id: "no", kind: "gate", at: { zone: "empty", row: 0 }, state: "fail", label: "n.Value", detail: "throws", accent: true }], edges: [] },
        { codeLine: 1, out: "InvalidOperationException", caption: '<code>n.Value</code> бросает <b>InvalidOperationException</b> (реальный прогон). То же — явный каст <code>(int)null-nullable</code>.', nodes: [{ id: "no", kind: "gate", at: { zone: "empty", row: 0 }, state: "fail", label: "n.Value", detail: "InvalidOperationException", accent: true }], edges: [] },
      ],
      explain: 'Гейт извлечения. Дословно: «<code>Nullable&lt;T&gt;.Value</code> gets the value of an underlying type if <code>HasValue</code> is <code>true</code>. If <code>HasValue</code> is <code>false</code>, the <code>Value</code> property throws an <span class="hl">InvalidOperationException</span>». <span class="ru-tr">«<code>Nullable&lt;T&gt;.Value</code> возвращает значение базового типа, если <code>HasValue</code> равно <code>true</code>. Если <code>HasValue</code> равно <code>false</code>, свойство <code>Value</code> бросает <code>InvalidOperationException</code>».</span> Прогон: <code>((int?)null).Value</code> бросает <code>InvalidOperationException</code>. То же с явным кастом: «At run time, if the value of a nullable value type is <code>null</code>, the explicit cast throws an <code>InvalidOperationException</code>». <span class="ru-tr">«Во время выполнения, если значение nullable value type равно <code>null</code>, явное приведение бросает <code>InvalidOperationException</code>».</span> Безопасно: проверь <code>HasValue</code> (или <code>!= null</code>), либо извлекай через <code>??</code>/<code>GetValueOrDefault()</code> — разбор 05.',
      sources: ["ms-nullable"],
    },
    {
      id: "s4", num: "04", kicker: "Lifted operators · null распространяется", title: "null в операции → null; сравнение с null → false",
      viewBox: "0 0 340 210", zones: LIFT_ZONES,
      code: ["int? a = 5; int? b = null;", "a + b   == null   // True — null распространяется", "a > b             // False — сравнение с null", "a < b             // тоже False (не выводи обратное!)"],
      predictAt: 1, predictQ: '<code>int? a=5, b=null</code>. Что дадут <code>a+b == null</code>, <code>a &gt; b</code>, <code>a &lt; b</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>a + b</code> при <code>b == null</code> → <span class="hl">null</span>: lifted-оператор распространяет null, если хоть один операнд null.', nodes: [{ id: "add", kind: "gate", at: { zone: "lift", row: 0, col: 0 }, state: "ok", label: "a + b", detail: "null", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>a &gt; b</code> при <code>b == null</code> → <span class="hl">False</span>: сравнение с null всегда false.', nodes: [{ id: "add", kind: "gate", at: { zone: "lift", row: 0, col: 0 }, state: "ok", label: "a+b==null", detail: "True" }, { id: "gt", kind: "gate", at: { zone: "lift", row: 1, col: 0 }, state: "fail", label: "a > b", detail: "False", accent: true }], edges: [] },
        { codeLine: 3, out: "True False False", caption: '<code>a &lt; b</code> — <b>тоже False</b>! Ловушка: <code>a&gt;b</code> false НЕ значит <code>a&lt;b</code> true (реальный прогон).', nodes: [{ id: "res", kind: "gate", at: { zone: "lift", row: 0 }, state: "ok", label: "a+b==null", detail: "True" }, { id: "gt", kind: "gate", at: { zone: "lift", row: 1, col: 0 }, state: "fail", label: "a > b", detail: "False" }, { id: "lt", kind: "gate", at: { zone: "lift", row: 1, col: 1 }, state: "fail", label: "a < b", detail: "False", accent: true }], edges: [] },
      ],
      explain: 'Lifted operators распространяют null. Дословно: «These operators, also known as <b>lifted operators</b>, <span class="hl">return null if one or both operands are null</span>». <span class="ru-tr">«Эти операторы, также известные как <b>lifted operators</b>, возвращают null, если один или оба операнда равны null».</span> Поэтому <code>a + b</code> при <code>b==null</code> даёт <code>null</code> (то есть <code>== null</code> True). А сравнения: «For the comparison operators <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, and <code>&gt;=</code>, if one or both operands are <code>null</code>, the result is <b>false</b>». <span class="ru-tr">«Для операторов сравнения <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code> и <code>&gt;=</code>, если один или оба операнда равны <code>null</code>, результат — <b>false</b>».</span> Ключевая ловушка из доки: «Don\'t assume that because a particular comparison (for example, <code>&lt;=</code>) returns <code>false</code>, the opposite comparison (<code>&gt;</code>) returns <code>true</code>» <span class="ru-tr">«Не считайте, что раз некое сравнение (например, <code>&lt;=</code>) возвращает <code>false</code>, то противоположное сравнение (<code>&gt;</code>) возвращает <code>true</code>».</span> — прогон: и <code>a&gt;b</code>, и <code>a&lt;b</code> дают False. (<code>bool?</code> <code>&amp;</code>/<code>|</code> — отдельное исключение.)',
      sources: ["ms-nullable"],
    },
    {
      id: "s5", num: "05", kicker: "Извлечение · безопасно vs бросает", title: "?? и GetValueOrDefault против явного каста",
      viewBox: "0 0 340 210", zones: EXTRACT_ZONES,
      code: ["int? n = null;", "int x = n ?? 42;              // безопасно → 42", "int y = n.GetValueOrDefault();  // → 0 (default)", "int z = (int)n;                 // бросает при null"],
      scenes: [
        { codeLine: 1, caption: '<code>n ?? 42</code>: если null — берём <b>42</b>. Безопасное извлечение с дефолтом.', nodes: [{ id: "c", kind: "gate", at: { zone: "safe", row: 0 }, state: "ok", label: "n ?? 42", detail: "42", accent: true }], edges: [] },
        { codeLine: 2, caption: '<code>GetValueOrDefault()</code>: если null — <b>default(int)</b>=0. Тоже без исключения.', nodes: [{ id: "c", kind: "gate", at: { zone: "safe", row: 0 }, state: "ok", label: "n ?? 42", detail: "42" }, { id: "d", kind: "gate", at: { zone: "safe", row: 1 }, state: "ok", label: "GetValueOrDefault", detail: "0", accent: true }], edges: [] },
        { codeLine: 3, caption: '<code>(int)n</code> при <code>n==null</code> — <span class="hl">бросает</span> InvalidOperationException. <code>T</code> неявно конвертируется в <code>T?</code>, обратно — явно.', nodes: [{ id: "s", kind: "gate", at: { zone: "safe", row: 0 }, state: "ok", label: "?? / GetValueOrDefault", detail: "безопасно" }, { id: "no", kind: "gate", at: { zone: "cast", row: 0 }, state: "fail", label: "(int)n", detail: "throws", accent: true }], edges: [] },
      ],
      explain: 'Три способа извлечь значение — два безопасных, один бросающий. «Use the null-coalescing operator <code>??</code>… You can also use the <code>Nullable&lt;T&gt;.GetValueOrDefault(T)</code> method» <span class="ru-tr">«Используйте оператор объединения с null <code>??</code>… Также можно использовать метод <code>Nullable&lt;T&gt;.GetValueOrDefault(T)</code>».</span>; <code>GetValueOrDefault()</code> без аргумента даёт <code>default</code> базового типа. А явный каст рискован: «you can also explicitly cast… <code>int n2 = (int)n;</code> Compiles, but <span class="hl">throws an exception if n is null</span>». <span class="ru-tr">«можно также явно привести… <code>int n2 = (int)n;</code> Компилируется, но бросает исключение, если n равно null».</span> И асимметрия конверсий: «A non-nullable value type <code>T</code> is <b>implicitly convertible</b> to the corresponding nullable value type <code>T?</code>» <span class="ru-tr">«Non-nullable value type <code>T</code> <b>неявно приводится</b> к соответствующему nullable value type <code>T?</code>».</span> — а обратно только явно/через безопасные методы. Правило: из <code>T?</code> в <code>T</code> — через <code>??</code>/<code>GetValueOrDefault</code>, не голым кастом.',
      sources: ["ms-nullable"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>int? n = 17; object boxed = n; Console.WriteLine($"{boxed.GetType().Name} {boxed is int}");</code> — что напечатает?',
      options: ["Int32 True", "Nullable`1 True", "Int32 False", "Nullable`1 False"], correctIndex: 0, xp: 10,
      okText: 'Боксинг nullable кладёт на кучу <b>базовый тип</b>, не <code>Nullable&lt;T&gt;</code>: <code>GetType()</code> → <span class="hl">Int32</span>, <code>boxed is int</code> → True. Это машинное доказательство, что <code>int?</code> — структура.',
      noText: '«the boxing operation boxes the corresponding value of the underlying value type T, not the instance of Nullable<T>». <span class="ru-tr">«операция боксинга упаковывает соответствующее значение базового типа-значения T, а не экземпляр Nullable<T>».</span> Реальный вывод: <b>Int32 True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Int32 True" }, sourceRefs: ["ms-nullable"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>int? n = null; Console.WriteLine($"{typeof(int?).IsValueType} {n.HasValue} {n.GetValueOrDefault()}");</code> — что напечатает?',
      options: ["True False 0", "False False 0", "True True 0", "False True null"], correctIndex: 0, xp: 10,
      okText: '<code>int?</code> — <b>структура</b> (<code>IsValueType</code>=True). <code>null</code> = состояние <code>HasValue==false</code>. <code>GetValueOrDefault()</code> = <span class="hl">default(int)=0</span>, без исключения.',
      noText: '«Any nullable value type is an instance of the generic Nullable<T> structure». <span class="ru-tr">«Любой nullable value type — это экземпляр обобщённой структуры Nullable<T>».</span> <code>int?</code> — value type: <b>True False 0</b>, не reference type.',
      verify: { kind: "exec", run: "dotnet run", expect: "True False 0" }, sourceRefs: ["ms-nullable"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>int? a = 5; int? b = null; Console.WriteLine($"{a+b == null} {(a > b)} {(a < b)}");</code> — что напечатает?',
      options: ["True False False", "True False True", "False True False", "True True False"], correctIndex: 0, xp: 10,
      okText: 'Lifted: <code>a+b</code> с null → null (<code>== null</code> → <b>True</b>). Сравнения с null → <span class="hl">False</span> для обоих (<code>a&gt;b</code> и <code>a&lt;b</code>) — не выводи обратное!',
      noText: '«lifted operators return null if… operands are null» <span class="ru-tr">«lifted operators возвращают null, если… операнды равны null».</span>; сравнения с null → false. Ловушка: <code>a&gt;b</code> false НЕ значит <code>a&lt;b</code> true. Реальный вывод: <b>True False False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True False False" }, sourceRefs: ["ms-nullable"],
    },
  ],

  takeaways: [
    { icon: "why", k: "int? — структура", v: '<code>int?</code> = <code>Nullable&lt;int&gt;</code> — <b>value type</b> (value + HasValue). <code>null</code> — состояние <code>HasValue==false</code>, не ссылка. <span class="hl">Не путать</span> с nullable reference types (<code>string?</code> — compile-time аннотация).' },
    { icon: "cost", k: "Боксинг → базовый тип", v: 'Боксинг <code>int?</code> кладёт на кучу <b>базовый тип</b> (или null), не <code>Nullable&lt;T&gt;</code>: <code>((int?)17).GetType()</code> → <span class="hl">Int32</span>, <code>is int</code> True. Boxed <code>Nullable&lt;T&gt;</code> не существует.' },
    { icon: "avoid", k: "Value и lifted", v: '<code>.Value</code>/<code>(int)n</code> при null — <b>InvalidOperationException</b>; бери через <code>??</code>/<code>GetValueOrDefault</code>. Lifted: null распространяется; <code>&lt;</code>/<code>&gt;</code> с null → false (обе стороны).' },
  ],

  foot: 'урок · <b>Nullable&lt;T&gt;</b> · 5 анимир. разборов · панель боксинга int? → Int32 · дизайн <b>mid</b>',
};
