/**
 * Lesson: Reflection.Emit и DynamicMethod (CS.S6.reflection-emit) — expert density, 5 animated
 * deep-dives. This is the section's payoff: reflection that WRITES code. System.Reflection.Emit
 * lets a tool emit CIL at runtime; a DynamicMethod is a lightweight global method built op-by-op
 * with an ILGenerator, JIT-compiled, and called through a delegate. The IL you emit is the same
 * CIL the C# compiler produces — real opcodes with real byte values.
 *
 * SIGNATURE machine panel (s5): a DynamicMethod hand-built from raw IL (ldarg.0 / ldc.i4.1 / add
 * / ret), turned into a Func<int,int> via CreateDelegate, executed → f(41) = 42. The IL panel
 * shows the REAL opcodes with their REAL byte values (own run-csharp measurements on :5103:
 * ldarg.0=0x02, ldc.i4.1=0x17, add=0x58, ret=0x2A).
 *
 * Accuracy contract (G4/G7/G8):
 *   - English quotes VERBATIM from
 *     learn.microsoft.com/.../fundamentals/reflection/emitting-dynamic-methods-and-assemblies
 *     (microsoft_docs_fetch-verified 2026-07-21, ms.date 2024-03-27);
 *   - the emitted-IL opcodes AND their byte values are OWN run-csharp measurements (OpCodes.*.Value);
 *   - every card verify.expect is REAL run-csharp stdout on :5103
 *     (c1: 42 · c2: 42 · c3: 81/Square).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S6.reflection-emit/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: read (reflection) vs write (emit) — two lanes.
const Z_READ: Zone = { id: "read", x: 14, y: 34, w: 312, h: 78, cls: "vz-zone", label: "REFLECTION · ЧИТАЕТ МЕТАДАННЫЕ", labelCls: "vz-zlabel sm", lx: 170, ly: 24 };
const Z_WRITE: Zone = { id: "write", x: 14, y: 132, w: 312, h: 78, cls: "vz-zone heap", label: "REFLECTION.EMIT · ПИШЕТ CIL", labelCls: "vz-zlabel heap sm", lx: 170, ly: 122 };
const RW_ZONES: Zone[] = [Z_READ, Z_WRITE];

// s2: the build pipeline — DynamicMethod → ILGenerator → CreateDelegate.
// Tall zone (h=234 → inner 218u) so three stacked rows (obj + obj + gate, measured 212u)
// fit with PAD≥8.
const Z_PIPE: Zone = { id: "pipe", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "КОНВЕЙЕР DynamicMethod", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "объявить → эмитить IL → делегат", subCls: "vz-zsub", subY: 40 };
const PIPE_ZONES: Zone[] = [Z_PIPE];

// s3: the eval stack as IL executes (ldarg.0 / ldc.i4.1 / add / ret).
const Z_ILCODE: Zone = { id: "ilcode", x: 14, y: 34, w: 130, h: 168, cls: "vz-zone", label: "ЭМИТИРОВАННЫЙ IL", labelCls: "vz-zlabel sm", lx: 79, ly: 24, sub: "il.Emit(...)", subCls: "vz-zsub", subY: 47 };
const Z_EVAL: Zone = { id: "eval", x: 156, y: 34, w: 170, h: 168, cls: "vz-zone heap", label: "СТЕК ВЫЧИСЛЕНИЙ", labelCls: "vz-zlabel heap sm", lx: 241, ly: 24, sub: "eval stack", subCls: "vz-zsub heap", subY: 47 };
const EVAL_ZONES: Zone[] = [Z_ILCODE, Z_EVAL];

// s4: CreateDelegate — the emitted IL becomes a callable Func.
const Z_METHOD: Zone = { id: "method", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "DynamicMethod", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "тело из IL", subCls: "vz-zsub", subY: 47 };
const Z_DELEGATE: Zone = { id: "deleg", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Func<int,int>", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "JIT-скомпилирован", subCls: "vz-zsub heap", subY: 47 };
const DELEG_ZONES: Zone[] = [Z_METHOD, Z_DELEGATE];

// s5 (SIGNATURE): the full hand-built method with an IL panel, executed → 42.
const Z_HANDIL: Zone = { id: "handil", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "IL ВРУЧНУЮ", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "4 опкода", subCls: "vz-zsub good", subY: 47 };
const Z_RUN: Zone = { id: "run", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ВЫПОЛНЕНО", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "f(41)", subCls: "vz-zsub heap", subY: 47 };
const RUN_ZONES: Zone[] = [Z_HANDIL, Z_RUN];

export const reflectionEmit: LessonData = {
  id: "CS.S6.reflection-emit",
  track: "CS",
  section: "CS.S6",
  module: "S6.5",
  lang: "csharp",
  title: "Reflection.Emit: генерация IL в рантайме",
  kicker: "C# вглубь · S6 · reflection, которая пишет код",
  home: { subtitle: "System.Reflection.Emit, DynamicMethod, ILGenerator, CreateDelegate", icon: "types", estMinutes: 11 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-emit", kind: "doc", org: "Microsoft Learn", title: "Emitting Dynamic Methods and Assemblies", url: "https://learn.microsoft.com/en-us/dotnet/fundamentals/reflection/emitting-dynamic-methods-and-assemblies", date: "2024-03-27" },
    { id: "ms-dynmethod", kind: "doc", org: "Microsoft Learn", title: "DynamicMethod Class (System.Reflection.Emit)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.reflection.emit.dynamicmethod", date: "2025-07-01" },
    { id: "ms-opcodes", kind: "doc", org: "Microsoft Learn", title: "OpCodes Class (System.Reflection.Emit)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.reflection.emit.opcodes", date: "2025-07-01" },
  ],

  spec: [
    { text: "«…a set of managed types in the System.Reflection.Emit namespace that allow a compiler or tool to emit metadata and common intermediate language (CIL) at runtime.»", source: "ms-emit" },
  ],
  edgeCases: [
    { text: "<code>DynamicMethod</code> — «Define <b>lightweight global methods</b> at runtime… and execute them using <b>delegates</b>» (метод без класса-владельца).", source: "ms-emit" },
    { text: "<code>OpCodes</code> «Catalogs the <b>CIL instruction codes</b> you can use to build method bodies» — у каждого реальный байт (<code>add</code>=0x58).", source: "ms-opcodes" },
    { text: "Managed emit строже unmanaged: «provides stronger <b>semantic error checking</b> and a higher level of abstraction of the metadata than the unmanaged metadata interfaces».", source: "ms-emit" },
  ],

  misconceptions: [
    {
      wrong: "reflection умеет только читать метаданные — сгенерировать метод на лету нельзя",
      hook: 'Reflection умеет и <span class="hl">писать код</span>. «This section describes a set of managed types in the <b>System.Reflection.Emit</b> namespace that allow a compiler or tool to <b>emit metadata and common intermediate language (CIL) at runtime</b>». Ты собираешь тело метода <b>опкод за опкодом</b> через <code>ILGenerator</code>, а <code>DynamicMethod</code> даёт «lightweight global methods at runtime… execute them using <b>delegates</b>». Тот же CIL, что выдаёт компилятор C#. Дальше <b>пять разборов</b>: read vs emit, конвейер сборки метода, стек вычислений под IL, <code>CreateDelegate</code>, и <b>машинная панель</b> — рукописный IL (<code>ldarg.0/ldc.i4.1/add/ret</code>), скомпилированный JIT-ом и <b>выполненный</b>: <code>f(41)=42</code> (реальный прогон, реальные байты опкодов).',
      source: "ms-emit",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Read vs Emit", title: "Reflection читает метаданные, Emit — пишет CIL",
      viewBox: "0 0 340 224", zones: RW_ZONES,
      code: ["// уроки 1–4: reflection ЧИТАЕТ", "typeof(int).GetMembers();", "// этот урок: reflection.Emit ПИШЕТ", "il.Emit(OpCodes.Add);"],
      scenes: [
        { codeLine: 1, out: "", caption: 'До этого reflection только <b>читала</b> метаданные: <code>GetMembers</code>, <code>GetCustomAttribute</code> — интроспекция.', nodes: [{ id: "r", kind: "gate", at: { zone: "read", row: 0 }, state: "ok", label: "GetMembers()", detail: "читает метаданные", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>System.Reflection.Emit</code> — обратное: <span class="hl">генерирует CIL в рантайме</span>. Ты пишешь опкоды, движок собирает метод.', nodes: [{ id: "r", kind: "gate", at: { zone: "read", row: 0 }, state: "ok", label: "GetMembers()", detail: "читает метаданные" }, { id: "w", kind: "gate", at: { zone: "write", row: 0 }, state: "ok", label: "il.Emit(Add)", detail: "пишет CIL", accent: true }], edges: [] },
      ],
      explain: 'Reflection — двусторонняя. Уроки 1–4 были про <b>интроспекцию</b> (чтение метаданных). <code>System.Reflection.Emit</code> — про <b>генерацию</b>: «a set of managed types in the <code>System.Reflection.Emit</code> namespace that allow a compiler or tool to <span class="hl">emit metadata and common intermediate language (CIL) at runtime</span>». Главные потребители — «Script engines and compilers». Managed-вариант удобнее сырых интерфейсов: «Managed reflection emit provides <b>stronger semantic error checking</b> and a higher level of abstraction of the metadata than the unmanaged metadata interfaces». Итог: reflection не только смотрит на код — она умеет его создавать.',
      sources: ["ms-emit"],
    },
    {
      id: "s2", num: "02", kicker: "Конвейер · три шага", title: "DynamicMethod → ILGenerator → CreateDelegate",
      viewBox: "0 0 340 276", zones: PIPE_ZONES,
      code: ["var dm = new DynamicMethod(\"AddOne\",", "     typeof(int), new[]{ typeof(int) });", "var il = dm.GetILGenerator();", "var f = (Func<int,int>)dm.CreateDelegate(...);"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Шаг 1: <code>new DynamicMethod(name, returnType, paramTypes)</code> — <b>объявляем</b> метод: сигнатура без тела.', nodes: [{ id: "dm", kind: "obj", at: { zone: "pipe", row: 0 }, typeTag: "DynamicMethod", value: "int(int)", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Шаг 2: <code>GetILGenerator()</code> даёт <span class="hl">ILGenerator</span> — им пишем тело <b>опкод за опкодом</b>.', nodes: [{ id: "dm", kind: "obj", at: { zone: "pipe", row: 0 }, typeTag: "DynamicMethod", value: "int(int)" }, { id: "il", kind: "obj", at: { zone: "pipe", row: 1 }, typeTag: "ILGenerator", value: "Emit(op)", accent: true }], edges: [{ id: "e1", from: "il", to: "dm", accent: true }] },
        { codeLine: 3, out: "", caption: 'Шаг 3: <code>CreateDelegate</code> — движок <b>JIT-компилирует</b> IL и отдаёт вызываемый <code>Func</code>.', nodes: [{ id: "dm", kind: "obj", at: { zone: "pipe", row: 0 }, typeTag: "DynamicMethod", value: "int(int)" }, { id: "il", kind: "obj", at: { zone: "pipe", row: 1 }, typeTag: "ILGenerator", value: "Emit(op)" }, { id: "f", kind: "gate", at: { zone: "pipe", row: 2 }, state: "ok", label: "CreateDelegate", detail: "→ Func<int,int>", accent: true }], edges: [] },
      ],
      explain: 'Сборка динамического метода — три шага. <code>DynamicMethod</code> — «Define <b>lightweight global methods</b> at runtime… and execute them using delegates»: это метод <b>без класса-владельца</b>, живёт сам по себе. Конструктор задаёт имя, тип возврата и типы параметров — сигнатуру. <code>GetILGenerator()</code> возвращает <code>ILGenerator</code>, которым ты эмитишь тело по инструкции за раз. Наконец <code>CreateDelegate(delegateType)</code> компилирует IL в исполнимый код и возвращает делегат нужной сигнатуры. После этого вызов делегата — обычный вызов метода, только тело собрано в рантайме.',
      sources: ["ms-emit", "ms-dynmethod"],
    },
    {
      id: "s3", num: "03", kicker: "Стек вычислений · IL — стековая машина", title: "IL кладёт и снимает со стека: ldarg → ldc → add",
      viewBox: "0 0 340 210", zones: EVAL_ZONES,
      code: ["il.Emit(OpCodes.Ldarg_0);   // аргумент → стек", "il.Emit(OpCodes.Ldc_I4_1);  // константа 1 → стек", "il.Emit(OpCodes.Add);       // снять 2, положить сумму", "il.Emit(OpCodes.Ret);       // вернуть верх стека"],
      il: [
        { off: "IL_0000", op: "ldarg.0", arg: "", cmt: "// push arg" },
        { off: "IL_0001", op: "ldc.i4.1", arg: "", cmt: "// push 1" },
        { off: "IL_0002", op: "add", arg: "", cmt: "// pop 2, push sum" },
        { off: "IL_0003", op: "ret", arg: "", cmt: "// return top" },
      ],
      scenes: [
        { codeLine: 0, ilLine: 0, out: "", caption: '<code>ldarg.0</code> кладёт аргумент (41) на <span class="hl">стек вычислений</span>. IL — стековая машина, регистров нет.', nodes: [{ id: "op", kind: "chip", at: { zone: "ilcode", row: 0 }, value: "ldarg.0", accent: true }, { id: "s0", kind: "slot", at: { zone: "eval", row: 0 }, name: "top", value: "41", accent: true }], edges: [] },
        { codeLine: 1, ilLine: 1, out: "", caption: '<code>ldc.i4.1</code> кладёт константу <b>1</b> поверх. На стеке два значения: 1, 41.', nodes: [{ id: "op", kind: "chip", at: { zone: "ilcode", row: 0 }, value: "ldc.i4.1", accent: true }, { id: "s1", kind: "slot", at: { zone: "eval", row: 0 }, name: "top", value: "1", accent: true }, { id: "s0", kind: "slot", at: { zone: "eval", row: 1 }, name: "", value: "41" }], edges: [] },
        { codeLine: 2, ilLine: 2, out: "", caption: '<code>add</code> <span class="hl">снимает два</span> верхних, кладёт сумму: <b>42</b>. Опкод <code>add</code> = байт 0x58.', nodes: [{ id: "op", kind: "chip", at: { zone: "ilcode", row: 0 }, value: "add", accent: true }, { id: "sum", kind: "slot", at: { zone: "eval", row: 0 }, name: "top", value: "42", accent: true }], edges: [] },
        { codeLine: 3, ilLine: 3, out: "", caption: '<code>ret</code> возвращает верх стека — <b>42</b>. Четыре опкода = целый метод <code>x + 1</code>.', nodes: [{ id: "op", kind: "chip", at: { zone: "ilcode", row: 0 }, value: "ret", accent: true }, { id: "sum", kind: "gate", at: { zone: "eval", row: 0 }, state: "ok", label: "return", detail: "42", accent: true }], edges: [] },
      ],
      explain: 'CIL — <b>стековая</b> машина: инструкции кладут операнды на стек вычислений и снимают результаты, регистров нет. <code>ldarg.0</code> — push нулевого аргумента; <code>ldc.i4.1</code> — push константы 1; <code>add</code> — pop двух верхних, push суммы; <code>ret</code> — вернуть верх. Опкоды не абстрактны: «<code>OpCodes</code> Catalogs the <b>CIL instruction codes</b> you can use to build method bodies», у каждого реальный байт (собственный прогон: <code>ldarg.0</code>=0x02, <code>ldc.i4.1</code>=0x17, <code>add</code>=0x58, <code>ret</code>=0x2A). Именно такие последовательности выдаёт и компилятор C# — reflection.Emit пишет ровно тот же язык.',
      sources: ["ms-emit", "ms-opcodes"],
    },
    {
      id: "s4", num: "04", kicker: "CreateDelegate · IL → вызов", title: "Эмитированный IL становится вызываемым Func",
      viewBox: "0 0 340 210", zones: DELEG_ZONES,
      code: ["var f = (Func<int,int>)dm.CreateDelegate(", "          typeof(Func<int,int>));", "int r = f(41);   // как обычный вызов"],
      predictAt: 1, predictQ: 'IL собран для <code>x + 1</code>. После <code>CreateDelegate</code> вызов <code>f(41)</code> — что вернёт?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'У <code>DynamicMethod</code> тело — эмитированный IL. Но напрямую его не вызвать: нужен <b>делегат</b>.', nodes: [{ id: "dm", kind: "obj", at: { zone: "method", row: 0 }, typeTag: "DynamicMethod", value: "IL: x+1", accent: true }], edges: [] },
        { codeLine: 0, out: "", caption: '<code>CreateDelegate(typeof(Func&lt;int,int&gt;))</code> — движок <span class="hl">JIT-компилирует</span> IL под сигнатуру делегата.', nodes: [{ id: "dm", kind: "obj", at: { zone: "method", row: 0 }, typeTag: "DynamicMethod", value: "IL: x+1" }, { id: "f", kind: "obj", at: { zone: "deleg", row: 0 }, typeTag: "Func<int,int>", value: "готов", accent: true }], edges: [{ id: "e", from: "dm", to: "f", accent: true }] },
        { codeLine: 2, out: "42", caption: '<code>f(41)</code> — обычный вызов: возвращает <b>42</b> (реальный прогон). Метод, которого не было в исходнике, теперь работает.', nodes: [{ id: "dm", kind: "obj", at: { zone: "method", row: 0 }, typeTag: "DynamicMethod", value: "IL: x+1" }, { id: "f", kind: "gate", at: { zone: "deleg", row: 0 }, state: "ok", label: "f(41)", detail: "→ 42", accent: true }], edges: [] },
      ],
      explain: 'Эмитированный IL исполняется через делегат: <code>DynamicMethod</code> нужно «execute them using <b>delegates</b>». <code>CreateDelegate(delegateType)</code> берёт тело-IL, <b>JIT-компилирует</b> его в машинный код под сигнатуру делегата и возвращает вызываемый объект. Дальше <code>f(41)</code> — обычный вызов метода, без reflection-накладных на каждый запуск (в отличие от <code>MethodInfo.Invoke</code>): затраты только на разовую сборку и JIT. Реальный прогон: <code>f(41) = 42</code>. Так работают быстрые сериализаторы и мапперы — генерируют специализированный метод один раз, потом зовут напрямую.',
      sources: ["ms-emit", "ms-dynmethod"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · рукописный IL исполнен", title: "Четыре опкода, собранные вручную, дают f(41)=42",
      viewBox: "0 0 340 210", zones: RUN_ZONES,
      code: ["var dm = new DynamicMethod(\"AddOne\", typeof(int), new[]{typeof(int)});", "var il = dm.GetILGenerator();", "il.Emit(OpCodes.Ldarg_0); il.Emit(OpCodes.Ldc_I4_1);", "il.Emit(OpCodes.Add);     il.Emit(OpCodes.Ret);", "var f = (Func<int,int>)dm.CreateDelegate(typeof(Func<int,int>));", "Console.WriteLine(f(41));"],
      il: [
        { off: "0x02", op: "ldarg.0", arg: "", cmt: "// push arg (реальный байт)" },
        { off: "0x17", op: "ldc.i4.1", arg: "", cmt: "// push 1" },
        { off: "0x58", op: "add", arg: "", cmt: "// pop 2, push sum" },
        { off: "0x2A", op: "ret", arg: "", cmt: "// return top" },
      ],
      predictAt: 2, predictQ: 'Собран IL: <code>ldarg.0; ldc.i4.1; add; ret</code>. После <code>CreateDelegate</code> и вызова — что напечатает <code>f(41)</code>?', console: true,
      scenes: [
        { codeLine: 3, out: "", caption: 'Тело метода — <b>четыре опкода вручную</b>: <code>ldarg.0</code>(0x02), <code>ldc.i4.1</code>(0x17), <code>add</code>(0x58), <code>ret</code>(0x2A). Реальные байты CIL.', nodes: [{ id: "il", kind: "obj", at: { zone: "handil", row: 0 }, typeTag: "IL-тело", value: "4 опкода", accent: true }], edges: [] },
        { codeLine: 4, out: "", caption: '<code>CreateDelegate</code> компилирует эти байты JIT-ом в <span class="hl">Func&lt;int,int&gt;</span>. Метода не было в коде — он появился в рантайме.', nodes: [{ id: "il", kind: "obj", at: { zone: "handil", row: 0 }, typeTag: "IL-тело", value: "4 опкода" }, { id: "f", kind: "obj", at: { zone: "run", row: 0 }, typeTag: "Func<int,int>", value: "JIT ✓", accent: true }], edges: [{ id: "e", from: "il", to: "f", accent: true }] },
        { codeLine: 5, out: "42", caption: '<code>f(41)</code> → <span class="hl">42</span> (реальный прогон). Ты собрал работающий метод из сырого IL и выполнил его.', nodes: [{ id: "il", kind: "obj", at: { zone: "handil", row: 0 }, typeTag: "IL-тело", value: "4 опкода" }, { id: "f", kind: "gate", at: { zone: "run", row: 0 }, state: "ok", label: "f(41)", detail: "= 42", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — <b>реально сгенерированный и выполненный IL</b>. Тело метода <code>x + 1</code> собрано вручную из четырёх инструкций CIL с их настоящими байтами (собственный прогон <code>OpCodes.*.Value</code>): <code>ldarg.0</code>=0x02, <code>ldc.i4.1</code>=0x17, <code>add</code>=0x58, <code>ret</code>=0x2A. <code>CreateDelegate</code> прогнал их через JIT, и <code>f(41)</code> вернул <b>42</b> — метода, которого не было в исходнике, теперь исполняется. Это и есть «emit… CIL at runtime» в чистом виде: reflection не просто читает код — она его <span class="hl">пишет и запускает</span>. Уровень ниже абстракции C# буквально у тебя в руках.',
      sources: ["ms-emit", "ms-opcodes"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var dm = new DynamicMethod("AddOne", typeof(int), new[]{typeof(int)});</code><br/><code>var il = dm.GetILGenerator();</code><br/><code>il.Emit(OpCodes.Ldarg_0); il.Emit(OpCodes.Ldc_I4_1); il.Emit(OpCodes.Add); il.Emit(OpCodes.Ret);</code><br/><code>var f = (Func&lt;int,int&gt;)dm.CreateDelegate(typeof(Func&lt;int,int&gt;)); Console.WriteLine(f(41));</code> — что напечатает?',
      options: ["42", "41", "1", "AddOne"], correctIndex: 0, xp: 10,
      okText: 'IL <code>ldarg.0; ldc.i4.1; add; ret</code> = метод <code>x + 1</code>. <code>CreateDelegate</code> JIT-компилировал его, <code>f(41) = <span class="hl">42</span></code>. Метод собран из сырого IL в рантайме.',
      noText: 'Прочитай стек: аргумент 41, константа 1, <code>add</code> → 42, <code>ret</code>. Это метод инкремента, построенный вручную: <code>f(41) = <b>42</b></code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "42" }, sourceRefs: ["ms-emit"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var dm = new DynamicMethod("Mul", typeof(int), new[]{typeof(int),typeof(int)});</code><br/><code>var il = dm.GetILGenerator(); il.Emit(OpCodes.Ldarg_0); il.Emit(OpCodes.Ldarg_1); il.Emit(OpCodes.Mul); il.Emit(OpCodes.Ret);</code><br/><code>var f = (Func&lt;int,int,int&gt;)dm.CreateDelegate(typeof(Func&lt;int,int,int&gt;)); Console.WriteLine(f(6,7));</code> — что напечатает?',
      options: ["42", "13", "67", "Mul"], correctIndex: 0, xp: 10,
      okText: '<code>ldarg.0; ldarg.1; mul; ret</code> = метод <code>a * b</code>. Оба аргумента на стек, <code>mul</code> перемножил: <code>f(6,7) = <span class="hl">42</span></code>.',
      noText: 'Два <code>ldarg</code> кладут 6 и 7, <code>mul</code> снимает оба и кладёт произведение: <code>6 * 7 = <b>42</b></code>. Это умножение, а не сложение.',
      verify: { kind: "exec", run: "dotnet run", expect: "42" }, sourceRefs: ["ms-emit"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var dm = new DynamicMethod("Square", typeof(int), new[]{typeof(int)});</code><br/><code>var il = dm.GetILGenerator(); il.Emit(OpCodes.Ldarg_0); il.Emit(OpCodes.Dup); il.Emit(OpCodes.Mul); il.Emit(OpCodes.Ret);</code><br/><code>var f = (Func&lt;int,int&gt;)dm.CreateDelegate(typeof(Func&lt;int,int&gt;)); Console.WriteLine(f(9)); Console.WriteLine(dm.Name);</code> — обе строки?',
      options: ["81\\nSquare", "18\\nSquare", "81\\nDynamicMethod", "9\\nSquare"], correctIndex: 0, xp: 10,
      okText: '<code>ldarg.0; dup; mul</code> — <code>dup</code> дублирует аргумент на стеке, <code>mul</code> перемножает: <code>9 * 9 = <span class="hl">81</span></code>. Имя метода — <b>Square</b>.',
      noText: 'Хитрость — <code>dup</code>: он копирует верх стека, так что <code>mul</code> умножает <code>x</code> на себя → квадрат. <code>f(9) = 81</code>, <code>dm.Name = Square</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "81\nSquare" }, sourceRefs: ["ms-emit", "ms-opcodes"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Reflection пишет код", v: '<code>System.Reflection.Emit</code> — «emit… CIL at runtime». Не только читать метаданные: собрать тело метода <b>опкод за опкодом</b> через <code>ILGenerator</code>.' },
    { icon: "cost", k: "Конвейер", v: '<code>DynamicMethod</code> (сигнатура) → <code>GetILGenerator</code> (эмит IL) → <code>CreateDelegate</code> (JIT в <code>Func</code>). Дальше вызов <span class="hl">без reflection-накладных</span>.' },
    { icon: "avoid", k: "IL — стековая машина", v: 'Опкоды кладут/снимают со стека вычислений (<code>ldarg</code>/<code>ldc</code>/<code>add</code>/<code>ret</code>), у каждого реальный байт (<code>add</code>=0x58). Рукописный IL <code>x+1</code> дал <span class="hl">f(41)=42</span>.' },
  ],

  foot: 'урок · <b>Reflection.Emit</b> · 5 анимир. разборов · IL <code>ldarg/ldc/add/ret</code> · панель: рукописный IL → f(41)=42 · дизайн <b>mid</b>',
};
