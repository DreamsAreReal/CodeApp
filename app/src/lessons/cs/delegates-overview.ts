/**
 * Lesson: Делегаты — обзор (CS.S4.delegates-overview) — expert density, 5 animated
 * deep-dives. A delegate is a TYPE that represents a reference to a method — a type-safe,
 * late-binding function pointer. The caller supplies part of the algorithm as a method the
 * delegate carries; the compiler proves the signature matches, so the "function pointer" is
 * type safe in a way a raw C/C++ pointer is not. Reassigning the delegate swaps the method
 * behind the same variable — that is the late binding that powers callbacks, LINQ and events.
 *
 * SIGNATURE machine panel (s5): a Func<int,int> you declare is not a bespoke type — its base
 * class is MulticastDelegate (the CLR class every delegate derives from, which is why a single
 * delegate can chain many methods). REAL run-csharp measurement (this file's exec cards):
 * op.GetType().BaseType.Name -> "MulticastDelegate"; op.Method.Name -> the bound method's name.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the EXACT page in sources[] (fetched + substring-
 *     checked 2026-07-21):
 *       · delegates-overview (ms-overview): the late-binding definition, the type-safety
 *         clauses, the multicast clause, the event-pattern clause;
 *       · delegates guide (ms-delegates): "A delegate is a type that represents references
 *         to methods with a particular parameter list and return type.", the instantiate/
 *         invoke sentence, the callback clause, the characteristics bullets, the lambda clause.
 *   - every card's verify.expect is the REAL stdout of the run-csharp exec cards on the app
 *     backend (c1: 42 / 121 · c2: Twice / MulticastDelegate · c3: hi lo / True);
 *   - the s5 machine-panel name (BaseType is MulticastDelegate) is an OWN measurement.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S4.delegates-overview/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the caller's algorithm (left) gets a method plugged in (right) — late binding.
const Z_ALGO: Zone = { id: "algo", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "АЛГОРИТМ", labelCls: "vz-zlabel", lx: 89, ly: 24, sub: "вызывающий код", subCls: "vz-zsub", subY: 47 };
const Z_PLUG: Zone = { id: "plug", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "МЕТОД-ЗАТЫЧКА", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "поставляет вызывающий", subCls: "vz-zsub heap", subY: 47 };
const BIND_ZONES: Zone[] = [Z_ALGO, Z_PLUG];

// s2: the delegate variable (left) referencing one method (right).
const Z_DVAR: Zone = { id: "dvar", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ДЕЛЕГАТ", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "переменная-тип", subCls: "vz-zsub", subY: 47 };
const Z_METH: Zone = { id: "meth", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "МЕТОДЫ", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "цель делегата", subCls: "vz-zsub heap", subY: 47 };
const REF_ZONES: Zone[] = [Z_DVAR, Z_METH];

// s3: the type-safety gate — matching signature passes, mismatched is rejected at compile time.
const Z_SIG: Zone = { id: "sig", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "СИГНАТУРА ДЕЛЕГАТА", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "Func<int,int>", subCls: "vz-zsub", subY: 47 };
const Z_CAND: Zone = { id: "cand", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "КАНДИДАТЫ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "компилятор сверяет", subCls: "vz-zsub heap", subY: 47 };
const SAFE_ZONES: Zone[] = [Z_SIG, Z_CAND];

// s4: reassignment — same variable, different method behind it (late binding).
const Z_CALLER: Zone = { id: "caller", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "op(21)", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "один вызов", subCls: "vz-zsub", subY: 47 };
const Z_BEHIND: Zone = { id: "behind", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ЗА ПЕРЕМЕННОЙ", labelCls: "vz-zlabel heap sm", lx: 257, ly: 24, sub: "меняется в рантайме", subCls: "vz-zsub heap", subY: 47 };
const LATE_ZONES: Zone[] = [Z_CALLER, Z_BEHIND];

// s5 (SIGNATURE): what class the delegate really is — the MulticastDelegate reveal.
const Z_DECL: Zone = { id: "decl", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ЧТО В КОДЕ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "Func<int,int> op", subCls: "vz-zsub", subY: 47 };
const Z_BASE: Zone = { id: "base", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ЧТО В КУЧЕ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "BaseType.Name", subCls: "vz-zsub heap", subY: 47 };
const CLASS_ZONES: Zone[] = [Z_DECL, Z_BASE];

export const delegatesOverview: LessonData = {
  id: "CS.S4.delegates-overview",
  track: "CS",
  section: "CS.S4",
  module: "S4.2",
  lang: "csharp",
  title: "Делегаты: type-safe function pointer",
  kicker: "C# вглубь · S4 · позднее связывание",
  home: { subtitle: "Делегат = ссылка на метод, типобезопасность, MulticastDelegate", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-overview", kind: "doc", org: "Microsoft Learn", title: "Introduction to delegates and events (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/delegates-overview", date: "2022-03-24" },
    { id: "ms-delegates", kind: "doc", org: "Microsoft Learn", title: "Work with delegate types in C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/", date: "2025-03-11" },
  ],

  spec: [
    { text: "«A delegate is a type that represents references to methods with a particular parameter list and return type.» <span class=\"ru-tr\">«Делегат — это тип, представляющий ссылки на методы с определённым списком параметров и типом возврата.»</span>", source: "ms-delegates" },
  ],
  edgeCases: [
    { text: "Делегат — не сам метод, а <b>ссылка</b> на него: «When you instantiate a delegate, you can associate the delegate instance with any method that has a compatible signature and return type. You can invoke (or call) the method through the delegate instance». <span class=\"ru-tr\">«Когда вы создаёте экземпляр делегата, вы можете связать этот экземпляр с любым методом, у которого совместимая сигнатура и тип возврата. Вы можете вызвать метод через экземпляр делегата».</span>", source: "ms-delegates" },
    { text: "Метод может быть <b>любым</b> совместимым: «You can assign any method from any accessible class or struct that matches the delegate type to the delegate. The method can be either static or an instance method». <span class=\"ru-tr\">«Вы можете присвоить делегату любой метод из любого доступного класса или структуры, который соответствует типу делегата. Метод может быть как статическим, так и методом экземпляра».</span>", source: "ms-delegates" },
    { text: "В контексте делегата сигнатура <b>включает возврат</b>: «in the context of delegates, the signature does include the return value» <span class=\"ru-tr\">«в контексте делегатов сигнатура действительно включает возвращаемое значение»</span> — метод обязан иметь совместимый тип возврата с делегатом.", source: "ms-delegates" },
  ],

  misconceptions: [
    {
      wrong: "делегат — это просто указатель на функцию, как в C, и он так же небезопасен",
      hook: 'Делегат и правда похож на указатель на функцию — но с решающим отличием: он <span class="hl">типобезопасен</span>. «The C# language delegate concept provides first class language support, and <b>type safety</b> around the concept» <span class="ru-tr">«Концепция делегатов в языке C# обеспечивает первоклассную поддержку на уровне языка и <b>типобезопасность</b> вокруг этой концепции»</span>, и «The compiler ensures that the types match for arguments and return types» <span class="ru-tr">«Компилятор гарантирует, что типы аргументов и типов возврата совпадают»</span>. Формально это <b>тип</b>, а не адрес: «A delegate is a type that represents references to methods with a particular parameter list and return type» <span class="ru-tr">«Делегат — это тип, представляющий ссылки на методы с определённым списком параметров и типом возврата»</span>. Зачем он вообще нужен — это <i>позднее связывание</i>: «Delegates provide a <b>late binding</b> mechanism in .NET. Late Binding means that you create an algorithm where the caller also supplies at least one method that implements part of the algorithm» <span class="ru-tr">«Делегаты обеспечивают механизм <b>позднего связывания</b> в .NET. Позднее связывание означает, что вы создаёте алгоритм, в котором вызывающий также поставляет хотя бы один метод, реализующий часть алгоритма»</span>. Дальше <b>пять разборов</b>: затычка-метод в алгоритм, делегат как ссылка на метод, гейт типобезопасности, переприсваивание (позднее связывание) и <b>машинная панель</b> — какой класс на самом деле стоит за <code>Func</code> (реальный прогон: <code>MulticastDelegate</code>).',
      source: ["ms-overview", "ms-delegates"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Зачем · позднее связывание", title: "Вызывающий поставляет часть алгоритма методом",
      viewBox: "0 0 340 210", zones: BIND_ZONES,
      code: ["// Sort умеет упорядочивать что угодно,", "// но КАК сравнивать — решает вызывающий:", "list.Sort(CompareByDistance);", "list.Sort(CompareByBrightness);"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Есть общий алгоритм — <code>Sort</code>. Он <span class="hl">не знает</span>, как сравнивать элементы: это часть логики, которую подставят снаружи.', nodes: [{ id: "algo", kind: "obj", at: { zone: "algo", row: 0 }, typeTag: "Sort()", value: "упорядочить", accent: true }, { id: "hole", kind: "gate", at: { zone: "algo", row: 1 }, state: "fail", label: "как сравнивать?", detail: "дырка" }], edges: [] },
        { codeLine: 2, out: "", caption: 'Вызывающий <b>поставляет метод</b> сравнения. Это и есть позднее связывание: часть алгоритма приходит от того, кто вызывает.', nodes: [{ id: "algo", kind: "obj", at: { zone: "algo", row: 0 }, typeTag: "Sort()", value: "упорядочить" }, { id: "hole", kind: "gate", at: { zone: "algo", row: 1 }, state: "ok", label: "сравнение ←", detail: "подставлено" }, { id: "m1", kind: "chip", at: { zone: "plug", row: 0 }, value: "CompareByDistance", w: 132, accent: true }], edges: [{ id: "e1", from: "hole", to: "m1", accent: true }] },
        { codeLine: 3, out: "", caption: 'Тот же <code>Sort</code>, другой метод — другой порядок. Один алгоритм, <span class="hl">разные затычки</span>: делегат носит эту затычку типобезопасно.', nodes: [{ id: "algo", kind: "obj", at: { zone: "algo", row: 0 }, typeTag: "Sort()", value: "упорядочить" }, { id: "hole", kind: "gate", at: { zone: "algo", row: 1 }, state: "ok", label: "сравнение ←", detail: "другой метод" }, { id: "m1", kind: "chip", at: { zone: "plug", row: 0 }, value: "CompareByDistance", w: 132 }, { id: "m2", kind: "chip", at: { zone: "plug", row: 1 }, value: "CompareByBrightness", w: 144, accent: true }], edges: [{ id: "e2", from: "hole", to: "m2", accent: true }] },
      ],
      explain: 'Делегат существует ради <b>позднего связывания</b>: «Delegates provide a <b>late binding</b> mechanism in .NET. Late Binding means that you create an algorithm where the caller also supplies at least one method that implements part of the algorithm» <span class="ru-tr">«Делегаты обеспечивают механизм <b>позднего связывания</b> в .NET. Позднее связывание означает, что вы создаёте алгоритм, в котором вызывающий также поставляет хотя бы один метод, реализующий часть алгоритма»</span>. Классический пример из доков — сортировка: «the Sort() method does essentially the same thing: arranges the items in the list based on some comparison. The code that compares two stars is different for each of the sort orderings» <span class="ru-tr">«метод Sort() делает по сути то же самое: упорядочивает элементы списка на основе некоторого сравнения. Код, сравнивающий две звезды, разный для каждого из порядков сортировки»</span>. То есть каркас алгоритма один, а «сменную деталь» — метод сравнения — подставляет вызывающий. Делегат — это первоклассная языковая поддержка этой идеи: «The C# language delegate concept provides first class language support, and type safety around the concept» <span class="ru-tr">«Концепция делегатов в языке C# обеспечивает первоклассную поддержку на уровне языка и типобезопасность вокруг этой концепции»</span>.',
      sources: ["ms-overview"],
    },
    {
      id: "s2", num: "02", kicker: "Что это · ссылка на метод", title: "Делегат — это ТИП, ссылающийся на метод",
      viewBox: "0 0 340 210", zones: REF_ZONES,
      code: ["int Twice(int n) => n * 2;", "Func<int,int> op = Twice;   // ссылка, не вызов", "int r = op(21);             // вызов ЧЕРЕЗ делегат", "Console.WriteLine(r);       // 42"],
      predictAt: 3, predictQ: 'Делегат <code>op</code> указывает на <code>Twice</code>. Что напечатает вызов <code>op(21)</code> через делегат?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>op = Twice</code> — <span class="hl">не вызов</span>, а присваивание ссылки. <code>op</code> теперь указывает на метод <code>Twice</code>, но ещё не выполнил его.', nodes: [{ id: "op", kind: "ref", at: { zone: "dvar", row: 0 }, name: "op", value: "Func<int,int>", accent: true }, { id: "tw", kind: "obj", at: { zone: "meth", row: 0 }, typeTag: "method", value: "Twice(int)" }], edges: [{ id: "e", from: "op", to: "tw", accent: true }] },
        { codeLine: 2, out: "", caption: '<code>op(21)</code> — вызов метода <b>через делегат</b>. Управление уходит в <code>Twice</code>, аргумент <code>21</code> передаётся.', nodes: [{ id: "op", kind: "ref", at: { zone: "dvar", row: 0 }, name: "op", value: "→ Twice" }, { id: "tw", kind: "obj", at: { zone: "meth", row: 0 }, typeTag: "method", value: "Twice(21)", accent: true }], edges: [{ id: "e", from: "op", to: "tw", accent: true }] },
        { codeLine: 3, out: "42", caption: '<code>Twice(21)</code> вернул <span class="hl">42</span> — через делегат, как будто вызвали метод напрямую (реальный прогон).', nodes: [{ id: "op", kind: "ref", at: { zone: "dvar", row: 0 }, name: "op", value: "→ Twice" }, { id: "tw", kind: "obj", at: { zone: "meth", row: 0 }, typeTag: "method", value: "→ 42", accent: true }], edges: [{ id: "e", from: "op", to: "tw" }] },
      ],
      explain: 'Ключевое: делегат — это <b>тип</b>, а его значение — ссылка на метод. Дословно: «A <b>delegate</b> is a type that represents references to methods with a particular parameter list and return type. When you instantiate a delegate, you can <span class="hl">associate the delegate instance with any method</span> that has a compatible signature and return type. You can <b>invoke (or call) the method through the delegate instance</b>» <span class="ru-tr">«<b>Делегат</b> — это тип, представляющий ссылки на методы с определённым списком параметров и типом возврата. Когда вы создаёте экземпляр делегата, вы можете связать этот экземпляр с любым методом, у которого совместимая сигнатура и тип возврата. Вы можете <b>вызвать метод через экземпляр делегата</b>»</span>. То есть <code>op = Twice</code> связывает переменную с методом, а <code>op(21)</code> вызывает метод через неё. Метод может быть любым совместимым: «You can assign any method from any accessible class or struct that matches the delegate type to the delegate. The method can be either static or an instance method» <span class="ru-tr">«Вы можете присвоить делегату любой метод из любого доступного класса или структуры, который соответствует типу делегата. Метод может быть как статическим, так и методом экземпляра»</span>. Именно это делает делегаты идеальными для callback\'ов: «The ability to refer to a method as a parameter makes delegates ideal for defining callback methods» <span class="ru-tr">«Возможность ссылаться на метод как на параметр делает делегаты идеальными для задания методов обратного вызова»</span>.',
      sources: ["ms-delegates"],
    },
    {
      id: "s3", num: "03", kicker: "Типобезопасность · гейт", title: "Компилятор сверяет сигнатуру — не любой метод подойдёт",
      viewBox: "0 0 340 210", zones: SAFE_ZONES,
      code: ["Func<int,int> op;", "int Ok(int n) => n * 2;        // (int) -> int  ✓", "string Bad(int n) => \"x\";      // (int) -> string ✗", "op = Ok;    // компилируется", "op = Bad;   // ошибка компиляции: тип возврата"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Делегат объявлен как <code>Func&lt;int,int&gt;</code>: параметр <code>int</code>, возврат <code>int</code>. Компилятор <span class="hl">знает эту сигнатуру</span>.', nodes: [{ id: "sig", kind: "obj", at: { zone: "sig", row: 0 }, typeTag: "Func<int,int>", value: "(int)→int", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>Ok</code>: <code>(int) → int</code> — сигнатура совпадает. Гейт <span class="hl">пропускает</span>: <code>op = Ok</code> компилируется.', nodes: [{ id: "sig", kind: "obj", at: { zone: "sig", row: 0 }, typeTag: "Func<int,int>", value: "(int)→int" }, { id: "ok", kind: "gate", at: { zone: "cand", row: 0 }, state: "ok", label: "Ok: (int)→int", detail: "совпало ✓", accent: true }], edges: [] },
        { codeLine: 4, out: "", caption: '<code>Bad</code>: <code>(int) → string</code> — возврат не тот. Гейт <span class="hl">рубит на компиляции</span>: сигнатура делегата включает тип возврата.', nodes: [{ id: "sig", kind: "obj", at: { zone: "sig", row: 0 }, typeTag: "Func<int,int>", value: "(int)→int" }, { id: "ok", kind: "gate", at: { zone: "cand", row: 0 }, state: "ok", label: "Ok: (int)→int", detail: "совпало ✓" }, { id: "bad", kind: "gate", at: { zone: "cand", row: 1 }, state: "fail", label: "Bad: (int)→string", detail: "CS-ошибка", accent: true }], edges: [] },
      ],
      explain: 'В этом отличие делегата от сырого указателя на функцию: он <b>типобезопасен</b>, и проверку делает компилятор. «As you\'ll see later in this series, the C# code you write for algorithms like this is type safe. <span class="hl">The compiler ensures that the types match for arguments and return types</span>» <span class="ru-tr">«Как вы увидите далее в этой серии, код на C#, который вы пишете для подобных алгоритмов, типобезопасен. <b>Компилятор гарантирует, что типы аргументов и типов возврата совпадают</b>»</span>. Важная тонкость: в отличие от перегрузки, у делегата сигнатура <b>включает возврат</b> — «In the context of method overloading, the signature of a method doesn\'t include the return value. However, <b>in the context of delegates, the signature does include the return value</b>. In other words, a method must have a compatible return type as the return type declared by the delegate» <span class="ru-tr">«В контексте перегрузки методов сигнатура метода не включает возвращаемое значение. Однако <b>в контексте делегатов сигнатура действительно включает возвращаемое значение</b>. Иначе говоря, метод должен иметь тип возврата, совместимый с типом возврата, объявленным делегатом»</span>. Поэтому <code>Bad</code> с возвратом <code>string</code> не присвоится к <code>Func&lt;int,int&gt;</code> — это ошибка компиляции, а не рантайм-сюрприз. Оговорка: точное совпадение не всегда обязательно — «Methods don\'t have to match the delegate type exactly» <span class="ru-tr">«Методы не обязаны в точности соответствовать типу делегата»</span> (это вариантность, отдельный разбор раздела).',
      sources: ["ms-overview", "ms-delegates"],
    },
    {
      id: "s4", num: "04", kicker: "Позднее связывание · подмена", title: "Одна переменная — разный метод за ней в рантайме",
      viewBox: "0 0 340 210", zones: LATE_ZONES,
      code: ["Func<int,int> op = Twice;      // n * 2", "Console.WriteLine(op(21));     // 42", "op = n => n + 100;             // подменили метод", "Console.WriteLine(op(21));     // 121"],
      predictAt: 3, predictQ: 'После <code>op = n =&gt; n + 100</code> тот же вызов <code>op(21)</code> — что напечатает второй раз?', console: true,
      scenes: [
        { codeLine: 1, out: "42", caption: '<code>op</code> указывает на <code>Twice</code>. Вызов <code>op(21)</code> идёт в <code>Twice</code> → <b>42</b>.', nodes: [{ id: "call", kind: "chip", at: { zone: "caller", row: 0 }, value: "op(21)", w: 84, accent: true }, { id: "tw", kind: "obj", at: { zone: "behind", row: 0 }, typeTag: "→ Twice", value: "n * 2 = 42" }], edges: [{ id: "e", from: "call", to: "tw", accent: true }] },
        { codeLine: 2, out: "42", caption: '<code>op = n =&gt; n + 100</code> — за <b>той же переменной</b> теперь другой метод. Код вызова <code>op(21)</code> ни строчки не изменился.', nodes: [{ id: "call", kind: "chip", at: { zone: "caller", row: 0 }, value: "op(21)", w: 84 }, { id: "lam", kind: "obj", at: { zone: "behind", row: 0 }, typeTag: "→ lambda", value: "n + 100", accent: true }], edges: [{ id: "e", from: "call", to: "lam", accent: true }] },
        { codeLine: 3, out: "42\n121", caption: 'Тот же <code>op(21)</code> уходит уже в лямбду → <span class="hl">121</span> (реальный прогон). Метод <b>связывается в рантайме</b> — это позднее связывание в действии.', nodes: [{ id: "call", kind: "chip", at: { zone: "caller", row: 0 }, value: "op(21)", w: 84, accent: true }, { id: "lam", kind: "obj", at: { zone: "behind", row: 0 }, typeTag: "→ lambda", value: "= 121", accent: true }], edges: [{ id: "e", from: "call", to: "lam", accent: true }] },
      ],
      explain: 'Гибкость делегата — в подмене цели за одной и той же переменной без изменения кода вызова: «The flexibility allows you to <span class="hl">programmatically change method calls</span>, or plug new code into existing classes» <span class="ru-tr">«Эта гибкость позволяет вам <b>программно менять вызовы методов</b> или подключать новый код в существующие классы»</span>. Присваивание <code>op = Twice</code>, затем <code>op = n =&gt; n + 100</code> оставляет вызов <code>op(21)</code> нетронутым, но результат меняется (реальный прогон: <code>42</code>, затем <code>121</code>) — метод выбирается в рантайме. Это тот самый механизм, что стоит за callback\'ами и событиями: «Finally, the team recognized an event pattern is one specific pattern where delegates, or any late binding algorithm, is useful» <span class="ru-tr">«Наконец, команда осознала, что паттерн событий — это один конкретный паттерн, где делегаты или любой алгоритм позднего связывания полезны»</span>. И лямбда здесь — просто ещё один способ дать делегату метод: «Lambda expressions (in certain contexts) are compiled to delegate types» <span class="ru-tr">«Лямбда-выражения (в определённых контекстах) компилируются в делегатные типы»</span> (разбор лямбд — соседний урок раздела).',
      sources: ["ms-overview", "ms-delegates"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · что реально держишь", title: "За Func стоит класс MulticastDelegate",
      viewBox: "0 0 340 210", zones: CLASS_ZONES,
      code: ["int Twice(int n) => n * 2;", "Func<int,int> op = Twice;", "Console.WriteLine(op.Method.Name);          // Twice", "Console.WriteLine(op.GetType().BaseType.Name); // ?"],
      predictAt: 3, predictQ: 'От какого базового класса наследуется <code>Func&lt;int,int&gt;</code>? Что напечатает <code>BaseType.Name</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'В коде <code>op</code> — статически <code>Func&lt;int,int&gt;</code>. Но это не «указатель», а <b>объект</b> в куче: у него есть свойства.', nodes: [{ id: "decl", kind: "obj", at: { zone: "decl", row: 0 }, typeTag: "op", value: "Func<int,int>", accent: true }], edges: [] },
        { codeLine: 2, out: "Twice", caption: '<code>op.Method.Name</code> → <span class="hl">Twice</span>: делегат хранит <b>ссылку на метод</b> (<code>MethodInfo</code>) и знает, куда указывает (реальный прогон).', nodes: [{ id: "decl", kind: "obj", at: { zone: "decl", row: 0 }, typeTag: "op", value: "Func<int,int>" }, { id: "m", kind: "gate", at: { zone: "base", row: 0 }, state: "ok", label: "op.Method.Name", detail: "Twice" }], edges: [{ id: "e1", from: "decl", to: "m", accent: true }] },
        { codeLine: 3, out: "Twice\nMulticastDelegate", caption: 'Базовый класс — <span class="hl">MulticastDelegate</span>: от него наследуется <b>каждый</b> делегат. Потому один делегат умеет цепочку методов (реальный прогон).', nodes: [{ id: "decl", kind: "obj", at: { zone: "decl", row: 0 }, typeTag: "op", value: "Func<int,int>" }, { id: "m", kind: "gate", at: { zone: "base", row: 0 }, state: "ok", label: "op.Method.Name", detail: "Twice" }, { id: "base", kind: "obj", at: { zone: "base", row: 1 }, typeTag: "BaseType", value: "MulticastDelegate", accent: true }], edges: [{ id: "e2", from: "decl", to: "base", accent: true }] },
      ],
      explain: 'Это машинная панель урока — реально снятое имя класса. <code>Func&lt;int,int&gt;</code> — не магический «адрес функции», а объект-делегат: у него есть <code>Method</code> (реальный прогон: <code>Twice</code>) — ссылка на связанный метод. А его базовый класс — <code>MulticastDelegate</code> (собственный замер <code>op.GetType().BaseType.Name</code>): от него наследуется всякий делегат в .NET, и именно поэтому один делегат способен нести <b>цепочку</b> вызовов — «the team wanted to support both single and multicast method calls. (<b>Multicast delegates</b> are delegates that chain together multiple method calls…» <span class="ru-tr">«команда хотела поддержать как одиночные, так и групповые (multicast) вызовы методов. (<b>Групповые делегаты</b> — это делегаты, которые сцепляют вместе несколько вызовов методов…»</span>. Отсюда и вся линейка возможностей: «Delegates can be chained together, such as calling multiple methods on a single event» <span class="ru-tr">«Делегаты можно сцеплять вместе, например, вызывая несколько методов на одном событии»</span> — это следующий разбор про <code>+=</code>/<code>-=</code> и invocation list.',
      sources: ["ms-overview", "ms-delegates"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>int Twice(int n) =&gt; n * 2; Func&lt;int,int&gt; op = Twice; Console.WriteLine(op(21)); op = n =&gt; n + 100; Console.WriteLine(op(21));</code> — что напечатают обе строки?',
      options: ["42\\n121", "42\\n42", "121\\n121", "Twice\\n121"], correctIndex: 0, xp: 10,
      okText: 'Первый <code>op(21)</code> идёт в <code>Twice</code> → <b>42</b>. Переприсваивание <code>op = n =&gt; n + 100</code> подменило метод за той же переменной → второй <code>op(21)</code> = <span class="hl">121</span>. Метод связывается в рантайме.',
      noText: 'Делегат — <b>ссылка</b> на метод, которую можно подменить: «programmatically change method calls» <span class="ru-tr">«программно менять вызовы методов»</span>. Тот же код вызова, другой результат. Реальный вывод: <code>42</code>, затем <code>121</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "42\n121" }, sourceRefs: ["ms-overview", "ms-delegates"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>int Twice(int n) =&gt; n * 2; Func&lt;int,int&gt; op = Twice; Console.WriteLine(op.Method.Name); Console.WriteLine(op.GetType().BaseType.Name);</code> — обе строки?',
      options: ["Twice\\nMulticastDelegate", "Twice\\nDelegate", "op\\nFunc", "Twice\\nFunc"], correctIndex: 0, xp: 10,
      okText: 'Делегат хранит <code>Method</code> (реальный метод <code>Twice</code>), а его базовый класс — <span class="hl">MulticastDelegate</span>: от него наследуется всякий делегат, потому он и умеет цепочку методов.',
      noText: '<code>op.Method.Name</code> — имя связанного метода (<code>Twice</code>). <code>BaseType.Name</code> у любого делегата — <b>MulticastDelegate</b> (не <code>Delegate</code> напрямую). Реальный прогон.',
      verify: { kind: "exec", run: "dotnet run", expect: "Twice\nMulticastDelegate" }, sourceRefs: ["ms-delegates"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>string Hi(string who) =&gt; "hi " + who; Func&lt;string,string&gt; greet = Hi; Console.WriteLine(greet("lo")); Console.WriteLine(greet is Delegate);</code> — обе строки?',
      options: ["hi lo\\nTrue", "hi lo\\nFalse", "Hi\\nTrue", "hi \\nTrue"], correctIndex: 0, xp: 10,
      okText: 'Вызов через делегат <code>greet("lo")</code> → <code>hi lo</code>. И <code>greet is Delegate</code> → <span class="hl">True</span>: делегат — это <b>тип</b>, экземпляр наследника <code>Delegate</code>, а не просто адрес функции.',
      noText: 'Делегат — типобезопасная ссылка на метод: вызов даёт <code>hi lo</code>, а сам он — <b>экземпляр делегатного типа</b> (<code>is Delegate</code> → <code>True</code>). Реальный вывод: <code>hi lo</code>, затем <code>True</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "hi lo\nTrue" }, sourceRefs: ["ms-delegates"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Что это", v: 'Делегат — <span class="hl">тип, ссылающийся на метод</span> с заданной сигнатурой: «a type that represents references to methods with a particular parameter list and return type» <span class="ru-tr">«тип, представляющий ссылки на методы с определённым списком параметров и типом возврата»</span>. Вызов метода идёт <b>через</b> делегат; это механизм <i>позднего связывания</i>.' },
    { icon: "cost", k: "Типобезопасность", v: 'В отличие от сырого указателя на функцию, делегат <b>типобезопасен</b>: «The compiler ensures that the types match for arguments and return types» <span class="ru-tr">«Компилятор гарантирует, что типы аргументов и типов возврата совпадают»</span>. В контексте делегата сигнатура <span class="hl">включает тип возврата</span> — несовместимый метод не присвоится.' },
    { icon: "avoid", k: "Что под капотом", v: 'За <code>Func</code>/<code>Action</code> стоит объект, чей базовый класс — <span class="hl">MulticastDelegate</span> (реальный прогон). У него есть <code>Method</code> (связанный метод) и способность нести <b>цепочку</b> вызовов — основа multicast, событий и LINQ.' },
  ],

  foot: 'урок · <b>делегаты: обзор</b> · 5 анимир. разборов · позднее связывание · гейт типобезопасности · панель MulticastDelegate · дизайн <b>mid</b>',
};
