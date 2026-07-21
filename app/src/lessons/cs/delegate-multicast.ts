/**
 * Lesson: Multicast-делегаты (CS.S4.delegate-multicast) — expert density, 6 animated
 * deep-dives. A delegate instance can hold MANY methods: `+`/`+=` append to an invocation
 * list, `-`/`-=` remove the rightmost matching entry, and invoking the delegate calls every
 * method in the list, in order. Delegates are immutable, so combining produces a NEW delegate
 * and leaves the operands untouched. The senior-level trap: a multicast Func returns only the
 * LAST method's value (and out params of the last method) — every earlier return is discarded.
 *
 * SIGNATURE machine panel (s5): a multicast Func<int> over three methods returns 3 (the last
 * one's value) and its GetInvocationList().Length is the real count — REAL run-csharp
 * measurement (this file's exec cards): (1+2+3)() -> 3, list length 3; after -= two -> still 3,
 * length 2.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the EXACT page in sources[] (fetched + substring-
 *     checked 2026-07-21):
 *       · how-to-combine (ms-combine): the "+ operator / list of assigned delegates / invokes
 *         in order / only combine delegates of the same type / - operator" clauses, and the
 *         "rightmost matching entry" note;
 *       · using-delegates (ms-using): the invocation-list definition, "+/+=", the "return value
 *         and parameters of the last method invoked" clause, "-/-=", GetInvocationList,
 *         "Delegates with more than one method in their invocation list derive from
 *         System.MulticastDelegate", the immutability/derivation clauses.
 *   - every card's verify.expect is the REAL stdout of the run-csharp exec cards on the app
 *     backend (c1: ABC / 3 · c2: 3 / 3 / 2 · c3: XX / 2);
 *   - the s5 machine-panel numbers (multicast Func returns the last value; list length) are OWN
 *     measurements.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S4.delegate-multicast/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: declaration + instantiation — the delegate type (left) wrapping one method (right).
const Z_DECL: Zone = { id: "decl", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ТИП ДЕЛЕГАТА", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "delegate int Op(int)", subCls: "vz-zsub", subY: 47 };
const Z_INST: Zone = { id: "inst", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ЭКЗЕМПЛЯР", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "обёртка над методом", subCls: "vz-zsub heap", subY: 47 };
const DECL_ZONES: Zone[] = [Z_DECL, Z_INST];

// s2: the invocation list building up with += (three methods in one delegate).
// Tall zones (h=232 → inner 216u) so three stacked chip rows fit with PAD≥8.
const Z_DVAR: Zone = { id: "dvar", x: 14, y: 34, w: 138, h: 232, cls: "vz-zone", label: "a (Action)", labelCls: "vz-zlabel", lx: 83, ly: 22, sub: "один делегат", subCls: "vz-zsub", subY: 40 };
const Z_LIST: Zone = { id: "list", x: 188, y: 34, w: 138, h: 232, cls: "vz-zone heap", label: "INVOCATION LIST", labelCls: "vz-zlabel heap sm", lx: 257, ly: 22, sub: "методы по порядку", subCls: "vz-zsub heap", subY: 40 };
const LIST_ZONES: Zone[] = [Z_DVAR, Z_LIST];

// s3: immutability — combining builds a NEW delegate, operands untouched.
const Z_ORIG: Zone = { id: "orig", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ИСХОДНЫЕ d1, d2", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "не меняются", subCls: "vz-zsub", subY: 47 };
const Z_NEW: Zone = { id: "newd", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "НОВЫЙ d1 + d2", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "отдельный объект", subCls: "vz-zsub heap", subY: 47 };
const IMMUT_ZONES: Zone[] = [Z_ORIG, Z_NEW];

// s4: -= removes the rightmost matching entry.
// Tall zones (h=232 → inner 216u) so three stacked chip rows fit with PAD≥8.
const Z_BEFORE: Zone = { id: "before", x: 14, y: 34, w: 150, h: 232, cls: "vz-zone", label: "m + m + m", labelCls: "vz-zlabel sm", lx: 89, ly: 22, sub: "дубликаты в списке", subCls: "vz-zsub", subY: 40 };
const Z_AFTER: Zone = { id: "after", x: 176, y: 34, w: 150, h: 232, cls: "vz-zone good", label: "после -= m", labelCls: "vz-zlabel good sm", lx: 251, ly: 22, sub: "снят самый правый", subCls: "vz-zsub good", subY: 40 };
const REMOVE_ZONES: Zone[] = [Z_BEFORE, Z_AFTER];

// s5 (SIGNATURE): the return-value trap — a multicast Func yields only the last result.
// Tall zones (h=232 → inner 216u) so three stacked chip rows fit with PAD≥8.
const Z_CHAIN: Zone = { id: "chain", x: 14, y: 34, w: 150, h: 232, cls: "vz-zone heap", label: "Func: 1 + 2 + 3", labelCls: "vz-zlabel heap sm", lx: 89, ly: 22, sub: "три метода", subCls: "vz-zsub heap", subY: 40 };
const Z_RET: Zone = { id: "ret", x: 176, y: 34, w: 150, h: 232, cls: "vz-zone", label: "ЧТО ВЕРНЁТ", labelCls: "vz-zlabel sm", lx: 251, ly: 22, sub: "combo()", subCls: "vz-zsub", subY: 40 };
const RETURN_ZONES: Zone[] = [Z_CHAIN, Z_RET];

// s6: exception short-circuits the rest of the list.
// Tall zones (h=232 → inner 216u) so three stacked M1/M2/M3 rows fit with PAD≥8.
const Z_RUN: Zone = { id: "run", x: 14, y: 34, w: 150, h: 232, cls: "vz-zone", label: "ВЫЗОВ ПО СПИСКУ", labelCls: "vz-zlabel sm", lx: 89, ly: 22, sub: "M1 → M2 → M3", subCls: "vz-zsub", subY: 40 };
const Z_THROW: Zone = { id: "throw", x: 176, y: 34, w: 150, h: 232, cls: "vz-zone heap", label: "ИСКЛЮЧЕНИЕ В M2", labelCls: "vz-zlabel heap sm", lx: 251, ly: 22, sub: "остаток не вызван", subCls: "vz-zsub heap", subY: 40 };
const THROW_ZONES: Zone[] = [Z_RUN, Z_THROW];

export const delegateMulticast: LessonData = {
  id: "CS.S4.delegate-multicast",
  track: "CS",
  section: "CS.S4",
  module: "S4.3",
  lang: "csharp",
  title: "Multicast: invocation list, +=/-=",
  kicker: "C# вглубь · S4 · цепочка методов",
  home: { subtitle: "Объявление, instantiation, invocation list, +=/-=, ловушки", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-combine", kind: "doc", org: "Microsoft Learn", title: "How to combine delegates (Multicast Delegates) (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/how-to-combine-delegates-multicast-delegates", date: "2021-09-15" },
    { id: "ms-using", kind: "doc", org: "Microsoft Learn", title: "Using delegates (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/using-delegates", date: "2023-02-13" },
    { id: "ms-delegates", kind: "doc", org: "Microsoft Learn", title: "Work with delegate types in C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/", date: "2025-03-11" },
  ],

  spec: [
    { text: "«A useful property of delegate objects is that you can assign multiple methods to one delegate instance by using the + operator.» <span class=\"ru-tr\">«Полезное свойство объектов-делегатов в том, что можно назначить несколько методов одному экземпляру делегата с помощью оператора +.»</span>", source: "ms-combine" },
  ],
  edgeCases: [
    { text: "Комбинировать можно только <b>однотипные</b> делегаты: «You can only combine delegates of the same type». <span class=\"ru-tr\">«Комбинировать можно только делегаты одного и того же типа».</span>", source: "ms-combine" },
    { text: "Дубликаты допустимы и вызываются все: «You can add the same delegate to a multicast delegate multiple times… it invokes all the delegates in the list, including duplicates». <span class=\"ru-tr\">«Один и тот же делегат можно добавить в multicast-делегат несколько раз… он вызывает все делегаты из списка, включая дубликаты».</span>", source: "ms-combine" },
    { text: "Исключение обрывает список: «No subsequent methods in the invocation list are called» <span class=\"ru-tr\">«Ни один из последующих методов в invocation list не вызывается»</span> — незакрытое в методе исключение уходит вызывающему, остаток не выполняется.", source: "ms-using" },
  ],

  misconceptions: [
    {
      wrong: "делегат держит ровно один метод, а += — это как обычное сложение чисел",
      hook: 'На деле один делегат может держать <b>список</b> методов. «A useful property of <b>delegate</b> objects is that you can assign <span class="hl">multiple methods to one delegate instance</span> by using the <code>+</code> operator. The multicast delegate contains a list of the assigned delegates. When you call the multicast delegate, it <b>invokes the delegates in the list, in order</b>». <span class="ru-tr">«Полезное свойство объектов-<b>делегатов</b> в том, что можно назначить несколько методов одному экземпляру делегата с помощью оператора <code>+</code>. Multicast-делегат содержит список назначенных делегатов. Когда вы вызываете multicast-делегат, он <b>вызывает делегаты из списка по порядку</b>».</span> Этот список зовётся <i>invocation list</i>: «To add an extra method to the delegate\'s list of methods—the <b>invocation list</b>—simply requires adding two delegates using the addition or addition assignment operators (\'+\' or \'+=\')». <span class="ru-tr">«Чтобы добавить ещё один метод в список методов делегата — <b>invocation list</b> — достаточно сложить два делегата операторами сложения или сложения с присваиванием (\'+\' или \'+=\')».</span> Дальше <b>шесть разборов</b>: объявление+instantiation, рост invocation list через <code>+=</code>, иммутабельность (новый объект, а не мутация), удаление самого правого через <code>-=</code>, <b>машинная панель</b> — что вернёт multicast-<code>Func</code> (реальный прогон: <code>3</code> — только последний), и обрыв списка исключением.',
      source: ["ms-combine", "ms-using"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Объявление · instantiation", title: "delegate-тип объявляют, потом заворачивают метод",
      viewBox: "0 0 340 210", zones: DECL_ZONES,
      code: ["delegate int Op(int x);        // объявление ТИПА", "int Twice(int n) => n * 2;", "Op op = Twice;                 // instantiation", "Op op2 = n => n + 1;           // или лямбдой"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>delegate int Op(int x);</code> — объявляем <b>тип</b>: сигнатура <code>(int) → int</code>. Экземпляра ещё нет, это как объявить класс.', nodes: [{ id: "ty", kind: "obj", at: { zone: "decl", row: 0 }, typeTag: "delegate type", value: "Op: (int)→int", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>Op op = Twice;</code> — instantiation: делегат <span class="hl">заворачивает метод</span> <code>Twice</code> по имени.', nodes: [{ id: "ty", kind: "obj", at: { zone: "decl", row: 0 }, typeTag: "delegate type", value: "Op: (int)→int" }, { id: "op", kind: "obj", at: { zone: "inst", row: 0 }, typeTag: "op", value: "→ Twice", accent: true }], edges: [{ id: "e1", from: "ty", to: "op", accent: true }] },
        { codeLine: 3, out: "", caption: 'Или лямбдой: <code>Op op2 = n =&gt; n + 1;</code>. Оба способа дают экземпляр делегата, готовый к вызову.', nodes: [{ id: "ty", kind: "obj", at: { zone: "decl", row: 0 }, typeTag: "delegate type", value: "Op: (int)→int" }, { id: "op", kind: "obj", at: { zone: "inst", row: 0 }, typeTag: "op", value: "→ Twice" }, { id: "op2", kind: "obj", at: { zone: "inst", row: 1 }, typeTag: "op2", value: "→ n+1", accent: true }], edges: [] },
      ],
      explain: 'Делегат — двухшаговая штука: сначала объявляют <b>тип</b>, потом создают <b>экземпляр</b>, заворачивающий метод. «A delegate object is normally constructed by providing the name of the method the delegate wraps, or with a <b>lambda expression</b>. A delegate can be <span class="hl">invoked once instantiated</span> in this manner. Invoking a delegate calls the method attached to the delegate instance». <span class="ru-tr">«Объект-делегат обычно конструируют, указывая имя метода, который делегат заворачивает, или с помощью <b>лямбда-выражения</b>. Делегат можно вызвать, будучи созданным таким образом. Вызов делегата вызывает метод, привязанный к экземпляру делегата».</span> Экземпляр — это настоящий объект: «Because the instantiated delegate is an object, it can be passed as an argument, or assigned to a property». <span class="ru-tr">«Поскольку созданный делегат является объектом, его можно передать как аргумент или присвоить свойству».</span> И типы делегатов особые: «Delegate types are derived from the <code>Delegate</code> class in .NET. Delegate types are <b>sealed</b>, they can\'t be derived from». <span class="ru-tr">«Типы делегатов происходят от класса <code>Delegate</code> в .NET. Типы делегатов <b>запечатаны</b> (sealed), от них нельзя наследоваться».</span> Именно потому, что экземпляр — объект, к нему применимы операторы <code>+</code>/<code>-</code> — следующий разбор.',
      sources: ["ms-using"],
    },
    {
      id: "s2", num: "02", kicker: "Invocation list · +=", title: "+= добавляет метод в список одного делегата",
      viewBox: "0 0 340 276", zones: LIST_ZONES,
      code: ["Action a = () => sb.Append(\"A\");", "a += () => sb.Append(\"B\");", "a += () => sb.Append(\"C\");", "a();  // вызывает ВСЕ три по порядку → \"ABC\""],
      predictAt: 3, predictQ: 'После трёх <code>+=</code> вызов <code>a()</code> прогоняет весь список. Что окажется в <code>sb</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>a</code> держит один метод — печать <code>"A"</code>. Invocation list длиной 1.', nodes: [{ id: "a", kind: "ref", at: { zone: "dvar", row: 0 }, name: "a", value: "Action", accent: true }, { id: "m1", kind: "chip", at: { zone: "list", row: 0 }, value: "1. Append(A)", w: 120 }], edges: [{ id: "e1", from: "a", to: "m1" }] },
        { codeLine: 1, out: "", caption: '<code>a += …B</code> — <span class="hl">добавляет второй</span> метод в тот же делегат. Это не перезапись: список растёт.', nodes: [{ id: "a", kind: "ref", at: { zone: "dvar", row: 0 }, name: "a", value: "Action" }, { id: "m1", kind: "chip", at: { zone: "list", row: 0 }, value: "1. Append(A)", w: 120 }, { id: "m2", kind: "chip", at: { zone: "list", row: 1 }, value: "2. Append(B)", w: 120, accent: true }], edges: [{ id: "e1", from: "a", to: "m1" }] },
        { codeLine: 2, out: "", caption: 'Третий <code>+=</code> — три метода в одном делегате. Порядок в списке = порядок добавления.', nodes: [{ id: "a", kind: "ref", at: { zone: "dvar", row: 0 }, name: "a", value: "list = 3" }, { id: "m1", kind: "chip", at: { zone: "list", row: 0 }, value: "1. Append(A)", w: 120 }, { id: "m2", kind: "chip", at: { zone: "list", row: 1 }, value: "2. Append(B)", w: 120 }, { id: "m3", kind: "chip", at: { zone: "list", row: 2 }, value: "3. Append(C)", w: 120, accent: true }], edges: [] },
        { codeLine: 3, out: "ABC", caption: 'Один вызов <code>a()</code> прогоняет <span class="hl">весь список по порядку</span> → <code>"ABC"</code> (реальный прогон). Три метода — один invoke.', nodes: [{ id: "a", kind: "ref", at: { zone: "dvar", row: 0 }, name: "a()", value: "→ ABC", accent: true }, { id: "m1", kind: "chip", at: { zone: "list", row: 0 }, value: "1. Append(A) ✓", w: 132 }, { id: "m2", kind: "chip", at: { zone: "list", row: 1 }, value: "2. Append(B) ✓", w: 132 }, { id: "m3", kind: "chip", at: { zone: "list", row: 2 }, value: "3. Append(C) ✓", w: 132 }], edges: [] },
      ],
      explain: 'Это multicasting: «A delegate can call more than one method when invoked, referred to as <b>multicasting</b>. To add an extra method to the delegate\'s list of methods—the <span class="hl">invocation list</span>—simply requires adding two delegates using the addition or addition assignment operators (\'+\' or \'+=\')». <span class="ru-tr">«При вызове делегат может вызвать более одного метода — это называется <b>multicasting</b>. Чтобы добавить ещё один метод в список методов делегата — invocation list — достаточно сложить два делегата операторами сложения или сложения с присваиванием (\'+\' или \'+=\')».</span> Порядок — по добавлению: «When you call the multicast delegate, it <b>invokes the delegates in the list, in order</b>». <span class="ru-tr">«Когда вы вызываете multicast-делегат, он <b>вызывает делегаты из списка по порядку</b>».</span> В доках прямой пример: «The <code>allMethodsDelegate</code> contains three methods in its invocation list… When <code>allMethodsDelegate</code> is invoked, <b>all three methods are called in order</b>». <span class="ru-tr">«<code>allMethodsDelegate</code> содержит три метода в своём invocation list… Когда <code>allMethodsDelegate</code> вызывается, <b>все три метода вызываются по порядку</b>».</span> Реальный прогон подтверждает: три <code>+=</code>, один <code>a()</code> → <code>"ABC"</code>. Ограничение: «You can only combine delegates of the <b>same type</b>» <span class="ru-tr">«Комбинировать можно только делегаты <b>одного и того же типа</b>»</span> — иначе ошибка компиляции.',
      sources: ["ms-using", "ms-combine"],
    },
    {
      id: "s3", num: "03", kicker: "Иммутабельность · новый объект", title: "Комбинирование строит НОВЫЙ делегат, операнды целы",
      viewBox: "0 0 340 210", zones: IMMUT_ZONES,
      code: ["Action d1 = () => {};", "Action d2 = () => {};", "Action all = d1 + d2;   // новый делегат", "// d1.GetInvocationList().Length  → 1", "// all.GetInvocationList().Length → 2"],
      predictAt: 3, predictQ: 'После <code>all = d1 + d2</code> изменился ли сам <code>d1</code>? Что даст <code>d1.GetInvocationList().Length</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Два одиночных делегата: <code>d1</code> и <code>d2</code>, у каждого список длиной 1.', nodes: [{ id: "d1", kind: "obj", at: { zone: "orig", row: 0 }, typeTag: "d1", value: "list = 1", accent: true }, { id: "d2", kind: "obj", at: { zone: "orig", row: 1 }, typeTag: "d2", value: "list = 1" }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>d1 + d2</code> создаёт <span class="hl">отдельный новый</span> делегат с двумя методами. Делегаты <b>иммутабельны</b> — исходные не трогаются.', nodes: [{ id: "d1", kind: "obj", at: { zone: "orig", row: 0 }, typeTag: "d1", value: "list = 1" }, { id: "d2", kind: "obj", at: { zone: "orig", row: 1 }, typeTag: "d2", value: "list = 1" }, { id: "all", kind: "obj", at: { zone: "newd", row: 0 }, typeTag: "all", value: "list = 2", accent: true }], edges: [] },
        { codeLine: 4, out: "1\n2", caption: '<code>d1</code> остался длиной <b>1</b>, <code>all</code> — <b>2</b> (реальный прогон). Сложение делегатов — не мутация, а <span class="hl">новый объект</span>.', nodes: [{ id: "d1", kind: "obj", at: { zone: "orig", row: 0 }, typeTag: "d1", value: "list = 1", accent: true }, { id: "d2", kind: "obj", at: { zone: "orig", row: 1 }, typeTag: "d2", value: "list = 1" }, { id: "all", kind: "obj", at: { zone: "newd", row: 0 }, typeTag: "all", value: "list = 2", accent: true }], edges: [] },
      ],
      explain: 'Делегаты — <b>иммутабельны</b>: <code>+</code> не меняет операнды, а возвращает новый объект. В доках это видно на примере invocation list: «The original three delegates, <code>d1</code>, <code>d2</code>, and <code>d3</code>, <span class="hl">remain unchanged</span>». <span class="ru-tr">«Исходные три делегата, <code>d1</code>, <code>d2</code> и <code>d3</code>, остаются без изменений».</span> Реальный прогон подтверждает: после <code>all = d1 + d2</code> у <code>d1</code> список всё ещё длиной 1, у <code>all</code> — 2. Практическое следствие: <code>a += b</code> — это на самом деле <code>a = a + b</code> (присваивание нового делегата переменной <code>a</code>), поэтому в событийном коде важно, что подписчики видят снимок списка на момент вызова. Длину списка читают через <code>GetInvocationList()</code>: «to find the number of methods in a delegate\'s invocation list, you can write» <span class="ru-tr">«чтобы узнать количество методов в invocation list делегата, можно написать»</span> <code>del.GetInvocationList().Length</code>.',
      sources: ["ms-using"],
    },
    {
      id: "s4", num: "04", kicker: "Удаление · -=", title: "-= снимает самый правый совпадающий метод",
      viewBox: "0 0 340 276", zones: REMOVE_ZONES,
      code: ["Action combo = m + m + m;   // один метод трижды", "combo -= m;                 // снять ОДИН, самый правый", "combo();                    // → \"XX\" (осталось два)", "// combo.GetInvocationList().Length → 2"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Один и тот же метод <code>m</code> добавлен <b>трижды</b>. Дубликаты разрешены — в списке три записи <code>X</code>.', nodes: [{ id: "b1", kind: "chip", at: { zone: "before", row: 0 }, value: "1. X", w: 72 }, { id: "b2", kind: "chip", at: { zone: "before", row: 1 }, value: "2. X", w: 72 }, { id: "b3", kind: "chip", at: { zone: "before", row: 2 }, value: "3. X", w: 72, accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>combo -= m</code> снимает <span class="hl">самый правый</span> совпадающий — только одну запись, не все три.', nodes: [{ id: "b1", kind: "chip", at: { zone: "before", row: 0 }, value: "1. X", w: 72 }, { id: "b2", kind: "chip", at: { zone: "before", row: 1 }, value: "2. X", w: 72 }, { id: "b3", kind: "chip", at: { zone: "before", row: 2 }, value: "3. X ✗ снят", w: 108, accent: true }, { id: "a1", kind: "chip", at: { zone: "after", row: 0 }, value: "1. X", w: 72 }, { id: "a2", kind: "chip", at: { zone: "after", row: 1 }, value: "2. X", w: 72, accent: true }], edges: [] },
        { codeLine: 2, out: "XX", caption: 'Осталось два метода → <code>combo()</code> печатает <span class="hl">"XX"</span>, список длиной <b>2</b> (реальный прогон). Убрана ровно одна копия.', nodes: [{ id: "a1", kind: "chip", at: { zone: "after", row: 0 }, value: "1. X ✓", w: 72 }, { id: "a2", kind: "chip", at: { zone: "after", row: 1 }, value: "2. X ✓", w: 72, accent: true }], edges: [] },
      ],
      explain: 'Удаление — оператор <code>-</code>/<code>-=</code>: «You can use the <code>-</code> operator to remove a component delegate from a multicast delegate». <span class="ru-tr">«Оператором <code>-</code> можно удалить компонентный делегат из multicast-делегата».</span> Тонкость с дубликатами прямо в доках: «You can add the same delegate to a multicast delegate multiple times. When you call the multicast delegate, it invokes all the delegates in the list, <b>including duplicates</b>. When you remove a delegate from a multicast delegate, it removes the <span class="hl">rightmost matching entry</span>, so only one instance is removed if there are multiple copies». <span class="ru-tr">«Один и тот же делегат можно добавить в multicast-делегат несколько раз. Когда вы вызываете multicast-делегат, он вызывает все делегаты из списка, <b>включая дубликаты</b>. Когда вы удаляете делегат из multicast-делегата, он удаляет самую правую совпадающую запись, поэтому убирается лишь один экземпляр, если копий несколько».</span> Реальный прогон: <code>m + m + m</code>, затем <code>-= m</code> оставляет два вызова (<code>"XX"</code>, список 2). А если снять <b>последний</b> метод — делегат станет <code>null</code> (реальный прогон: <code>true</code>): пустого делегата с нулём методов не бывает, поэтому перед вызовом стоит проверить <code>?.Invoke()</code>.',
      sources: ["ms-combine"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · возврат multicast", title: "Multicast-Func возвращает только ПОСЛЕДНИЙ результат",
      viewBox: "0 0 340 276", zones: RETURN_ZONES,
      code: ["Func<int> combo = (() => 1) + (() => 2) + (() => 3);", "Console.WriteLine(combo());              // ?", "combo -= (() => 2 - как та же? нет — тождества нет)", "// вернётся значение ПОСЛЕДНЕГО метода в списке"],
      predictAt: 1, predictQ: 'Multicast-<code>Func&lt;int&gt;</code> из трёх методов (1, 2, 3) — что вернёт один <code>combo()</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Три метода в одном <code>Func&lt;int&gt;</code>: возвращают 1, 2 и 3. Все они <b>выполнятся</b> при вызове.', nodes: [{ id: "m1", kind: "chip", at: { zone: "chain", row: 0 }, value: "1. () => 1", w: 108 }, { id: "m2", kind: "chip", at: { zone: "chain", row: 1 }, value: "2. () => 2", w: 108 }, { id: "m3", kind: "chip", at: { zone: "chain", row: 2 }, value: "3. () => 3", w: 108, accent: true }], edges: [] },
        { codeLine: 1, out: "3", caption: 'Хотя вызвались <b>все три</b>, <code>combo()</code> вернёт <span class="hl">3</span> — значение <b>последнего</b> метода. Результаты 1 и 2 <b>потеряны</b> (реальный прогон).', nodes: [{ id: "m1", kind: "chip", at: { zone: "chain", row: 0 }, value: "1. () => 1 ✗", w: 120 }, { id: "m2", kind: "chip", at: { zone: "chain", row: 1 }, value: "2. () => 2 ✗", w: 120 }, { id: "m3", kind: "chip", at: { zone: "chain", row: 2 }, value: "3. () => 3 ←", w: 120, accent: true }, { id: "r", kind: "obj", at: { zone: "ret", row: 0 }, typeTag: "combo()", value: "3", accent: true }], edges: [{ id: "e", from: "m3", to: "r", accent: true }] },
      ],
      explain: 'Это машинная панель урока — реально снятое поведение возврата. Дословно: «If the delegate has a return value and/or out parameters, it <span class="hl">returns the return value and parameters of the last method invoked</span>». <span class="ru-tr">«Если делегат имеет возвращаемое значение и/или out-параметры, он возвращает возвращаемое значение и параметры последнего вызванного метода».</span> То есть в multicast-<code>Func</code> выполняются <b>все</b> методы, но наружу отдаётся только результат <b>последнего</b> — остальные молча отбрасываются (реальный прогон: <code>1 + 2 + 3</code> → <code>combo()</code> = <code>3</code>). Отсюда правило: <code>Func</code> для multicast почти всегда неправильный выбор — если нужны результаты всех методов, идут по <code>GetInvocationList()</code> и вызывают каждый вручную. И база подтверждает механику: «Delegates with more than one method in their invocation list <b>derive from</b> <code>MulticastDelegate</code>, which is a subclass of <code>System.Delegate</code>». <span class="ru-tr">«Делегаты с более чем одним методом в своём invocation list <b>наследуются от</b> <code>MulticastDelegate</code>, который является подклассом <code>System.Delegate</code>».</span>',
      sources: ["ms-using"],
    },
    {
      id: "s6", num: "06", kicker: "Ловушка · исключение в списке", title: "Исключение в методе обрывает остаток invocation list",
      viewBox: "0 0 340 276", zones: THROW_ZONES,
      code: ["Action chain = M1;   // печатает 1", "chain += M2;         // бросает InvalidOperationException", "chain += M3;         // печатает 3", "chain();  // 1, затем throw — M3 НЕ вызовется"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Три метода в списке: <code>M1</code>, <code>M2</code> (бросает), <code>M3</code>. Вызов пойдёт по порядку.', nodes: [{ id: "r1", kind: "chip", at: { zone: "run", row: 0 }, value: "M1: печать 1", w: 120 }, { id: "r2", kind: "chip", at: { zone: "run", row: 1 }, value: "M2: throw", w: 108, accent: true }, { id: "r3", kind: "chip", at: { zone: "run", row: 2 }, value: "M3: печать 3", w: 120 }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>M1</code> отработал, <code>M2</code> <span class="hl">бросил</span> исключение. Оно уходит вызывающему <b>сразу</b>.', nodes: [{ id: "r1", kind: "chip", at: { zone: "run", row: 0 }, value: "M1: печать 1 ✓", w: 132 }, { id: "r2", kind: "chip", at: { zone: "run", row: 1 }, value: "M2: throw →", w: 120, accent: true }, { id: "r3", kind: "chip", at: { zone: "run", row: 2 }, value: "M3: печать 3", w: 120 }, { id: "ex", kind: "obj", at: { zone: "throw", row: 0 }, typeTag: "exception", value: "→ caller", accent: true }], edges: [{ id: "e", from: "r2", to: "ex", accent: true }] },
        { codeLine: 3, out: "", caption: '<code>M3</code> <span class="hl">не вызовется</span>: остаток списка обрывается. Один «падающий» подписчик глушит всех, кто после него.', nodes: [{ id: "r1", kind: "chip", at: { zone: "run", row: 0 }, value: "M1: печать 1 ✓", w: 132 }, { id: "r2", kind: "chip", at: { zone: "run", row: 1 }, value: "M2: throw", w: 108 }, { id: "r3", kind: "chip", at: { zone: "run", row: 2 }, value: "M3: не вызван ✗", w: 132, accent: true }], edges: [] },
      ],
      explain: 'Опасная деталь multicast: исключение обрывает список. «When any of the methods throws an exception that isn\'t caught within the method, that exception is passed to the caller of the delegate. <span class="hl">No subsequent methods in the invocation list are called</span>». <span class="ru-tr">«Когда любой из методов бросает исключение, не перехваченное внутри метода, это исключение передаётся вызывающему делегат. Ни один из последующих методов в invocation list не вызывается».</span> То есть в <code>M1 → M2(throw) → M3</code> отработает <code>M1</code>, <code>M2</code> кинет исключение вызывающему, а <code>M3</code> уже не выполнится. В событийном коде это значит: один «падающий» обработчик глушит всех подписчиков после себя. Если нужна изоляция — итерируют <code>GetInvocationList()</code> и оборачивают каждый вызов в <code>try/catch</code>. И помним про reference-параметры: «If the delegate uses reference parameters, the reference is passed sequentially to each of the three methods… and any changes by one method are visible to the next». <span class="ru-tr">«Если делегат использует параметры по ссылке, ссылка передаётся последовательно каждому из трёх методов… и любые изменения, сделанные одним методом, видны следующему».</span>',
      sources: ["ms-using"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var sb = new StringBuilder(); Action a = () =&gt; sb.Append("A"); a += () =&gt; sb.Append("B"); a += () =&gt; sb.Append("C"); a(); Console.WriteLine(sb); Console.WriteLine(a.GetInvocationList().Length);</code> — обе строки?',
      options: ["ABC\\n3", "C\\n3", "ABC\\n1", "A\\n3"], correctIndex: 0, xp: 10,
      okText: '<code>+=</code> строит invocation list из трёх методов; один <code>a()</code> вызывает <span class="hl">все по порядку</span> → <code>ABC</code>, длина списка <b>3</b>. «invokes the delegates in the list, in order». <span class="ru-tr">«вызывает делегаты из списка по порядку».</span>',
      noText: 'Multicast — не перезапись: список растёт, вызов прогоняет весь. <code>ABC</code> (порядок добавления) и <code>GetInvocationList().Length == 3</code>. Реальный вывод: <code>ABC</code>, затем <code>3</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "ABC\n3" }, sourceRefs: ["ms-using", "ms-combine"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>Func&lt;int&gt; one=()=&gt;1, two=()=&gt;2, three=()=&gt;3; Func&lt;int&gt; combo = one + two + three; Console.WriteLine(combo()); combo -= two; Console.WriteLine(combo()); Console.WriteLine(combo.GetInvocationList().Length);</code> — три строки?',
      options: ["3\\n3\\n2", "6\\n4\\n2", "1\\n1\\n2", "3\\n1\\n2"], correctIndex: 0, xp: 10,
      okText: 'Multicast-<code>Func</code> возвращает <span class="hl">только последний</span> результат: <code>3</code>. После <code>-= two</code> список <code>one, three</code> — последний всё ещё <code>three</code> → <code>3</code>, длина <b>2</b>. Результаты 1 и 2 отброшены.',
      noText: 'Значения методов НЕ складываются: наружу идёт результат последнего метода в списке. <code>3</code>, затем <code>3</code> (three остался последним), длина <code>2</code>. Реальный прогон.',
      verify: { kind: "exec", run: "dotnet run", expect: "3\n3\n2" }, sourceRefs: ["ms-using"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var sb = new StringBuilder(); Action m = () =&gt; sb.Append("X"); Action combo = m + m + m; combo -= m; combo(); Console.WriteLine(sb); Console.WriteLine(combo.GetInvocationList().Length);</code> — обе строки?',
      options: ["XX\\n2", "\\n0", "XXX\\n3", "X\\n2"], correctIndex: 0, xp: 10,
      okText: 'Один метод добавлен трижды (дубликаты разрешены), <code>-= m</code> снимает <span class="hl">самый правый</span> — одну копию. Осталось два → <code>XX</code>, список <b>2</b>. «removes the rightmost matching entry». <span class="ru-tr">«удаляет самую правую совпадающую запись».</span>',
      noText: '<code>-=</code> убирает ОДНУ запись, не все совпадающие. Из трёх <code>X</code> осталось два → <code>XX</code>, длина <code>2</code>. Реальный вывод: <code>XX</code>, затем <code>2</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "XX\n2" }, sourceRefs: ["ms-combine"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Invocation list", v: 'Один делегат держит <span class="hl">список методов</span>: <code>+</code>/<code>+=</code> добавляют, вызов прогоняет весь список <b>по порядку</b>. «invokes the delegates in the list, in order». <span class="ru-tr">«вызывает делегаты из списка по порядку».</span> <code>-</code>/<code>-=</code> снимают самый правый совпадающий (реальный прогон: <code>XX</code>).' },
    { icon: "cost", k: "Иммутабельность", v: 'Делегаты иммутабельны: <code>a += b</code> — это <code>a = a + b</code>, новый объект, операнды целы (реальный прогон: <code>d1</code>=1, <code>all</code>=2). Снятие последнего метода даёт <code>null</code> — перед вызовом <code>?.Invoke()</code>.' },
    { icon: "avoid", k: "Ловушки multicast", v: 'Multicast-<code>Func</code> возвращает <span class="hl">только результат последнего</span> метода (реальный прогон: <code>3</code>) — остальные отброшены. Исключение в методе <b>обрывает</b> остаток списка: «No subsequent methods in the invocation list are called». <span class="ru-tr">«Ни один из последующих методов в invocation list не вызывается».</span>' },
  ],

  foot: 'урок · <b>multicast: invocation list</b> · 6 анимир. разборов · +=/-= · иммутабельность · панель «возврат последнего» · дизайн <b>mid</b>',
};
