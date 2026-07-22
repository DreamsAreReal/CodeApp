/**
 * Lesson: DebugView syntax for inspecting trees (CS.S11.debugview) — expert density, 5 animated
 * deep-dives. DebugView is a debugger-only string rendering of an expression tree with a compact
 * special syntax: ParameterExpression names get a `$` prefix ($num, or $var1 when unnamed);
 * ConstantExpression shows the value with a C#-literal suffix (10D for double); LambdaExpression
 * shows `.Lambda #Lambda1<delegate-type>`; checked operators get a `#` prefix (#+). Although the
 * DebugView property is internal/debugger-only, this lesson proves each documented rule with a REAL
 * exec card that reads DebugView via reflection — deterministic runtime strings, not a mockup.
 *
 * SIGNATURE machine panel (s5): three documented DebugView rules on one line —
 * $num | 10D | 1 #+ 2 (parameter $-prefix · double D-suffix · checked #+) — REAL run-csharp
 * measurement reading the internal DebugView property via reflection (this file's exec cards, :5080).
 *
 * NOTE: DebugView is "available only when debugging" (an internal property). The exec cards reach it
 * deterministically via reflection (typeof(Expression).GetProperty("DebugView", NonPublic)); the
 * documented syntax is taught verbatim from the DebugView-syntax page. Not runnable through the
 * public API — reflection is the deterministic bridge; every printed string matches the doc's
 * example block character-for-character.
 *
 * Accuracy contract (G4/G7/G8) — verified against
 * learn.microsoft.com/.../expression-trees/debugview-syntax (ms.date 2023-03-06), fetched +
 * substring-checked 2026-07-22:
 *   - every English quote is VERBATIM from that page (per-item sources[]);
 *   - every card verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (this file's exec
 *     cards, DebugView via reflection): c1 "$num" · c2 "10D" · c3 "$num | 10D | 1 #+ 2".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S11.debugview/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: what DebugView is — debugger-only string rendering.
const Z_TREE: Zone = { id: "tree", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ДЕРЕВО", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "объектный граф", subCls: "vz-zsub", subY: 47 };
const Z_DV: Zone = { id: "dv", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "DebugView", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "строка для дебага", subCls: "vz-zsub good", subY: 47 };
const DV_ZONES: Zone[] = [Z_TREE, Z_DV];

// s2: ParameterExpression -> $-prefix.
const Z_PAR: Zone = { id: "par", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Parameter(\"num\")", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "имя параметра", subCls: "vz-zsub", subY: 47 };
const Z_DOLLAR: Zone = { id: "dollar", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "$num", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "$-префикс", subCls: "vz-zsub good", subY: 47 };
const PAR_ZONES: Zone[] = [Z_PAR, Z_DOLLAR];

// s3: ConstantExpression -> value + literal suffix.
const Z_CONST: Zone = { id: "const", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Constant", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "значение", subCls: "vz-zsub", subY: 47 };
const Z_SUFFIX: Zone = { id: "suffix", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "10D / 10L / 10", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "суффикс литерала", subCls: "vz-zsub good", subY: 47 };
const CONST_ZONES: Zone[] = [Z_CONST, Z_SUFFIX];

// s4: Lambda -> .Lambda #Lambda1<...>; checked -> #.
const Z_LAM: Zone = { id: "lam", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: ".Lambda #Lambda1", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "+ тип делегата", subCls: "vz-zsub", subY: 47 };
const Z_CHK: Zone = { id: "chk", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "#+ checked", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "#-префикс оператора", subCls: "vz-zsub heap", subY: 47 };
const LAM_ZONES: Zone[] = [Z_LAM, Z_CHK];

// s5 (SIGNATURE): three rules on one line.
const Z_RULES: Zone = { id: "rules", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ТРИ ПРАВИЛА", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "$ · суффикс · #", subCls: "vz-zsub", subY: 47 };
const Z_OUT: Zone = { id: "out", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "$num | 10D | 1 #+ 2", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "реальный DebugView", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_RULES, Z_OUT];

export const debugview: LessonData = {
  id: "CS.S11.debugview",
  track: "CS",
  section: "CS.S11",
  module: "S11.5",
  lang: "csharp",
  title: "DebugView: синтаксис инспекции дерева",
  kicker: "C# вглубь · S11 · чтение дерева",
  home: { subtitle: "$-параметры, суффиксы констант, .Lambda #, #-checked, реальный DebugView", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S3", "CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-dv", kind: "doc", org: "Microsoft Learn", title: "Syntax used by DebugView property (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/debugview-syntax", date: "2023-03-06" },
  ],

  spec: [
    { text: "«The <b>DebugView</b> property (available only when debugging) <span class=\"hl\">provides a string rendering of expression trees</span>. Most of the syntax is fairly straightforward to understand; the special cases are described in the following sections.» <span class=\"ru-tr\">«Свойство <b>DebugView</b> (доступно только при отладке) даёт строковое представление деревьев выражений. Большая часть синтаксиса понятна интуитивно; особые случаи описаны в следующих разделах.»</span>", source: "ms-dv" },
  ],
  edgeCases: [
    { text: "Параметр — с <code>$</code>: «<code>ParameterExpression</code> variable names are displayed with a <span class=\"hl\"><code>$</code> symbol at the beginning</span>». <span class=\"ru-tr\">«Имена переменных <code>ParameterExpression</code> отображаются с символом <code>$</code> в начале».</span> Без имени: «it's assigned an automatically generated name, such as <code>$var1</code> or <code>$var2</code>». <span class=\"ru-tr\">«ему присваивается автоматически сгенерированное имя, например <code>$var1</code> или <code>$var2</code>».</span>", source: "ms-dv" },
    { text: "Константа с числовым суффиксом: «For numeric types that have standard suffixes as C# literals, <span class=\"hl\">the suffix is added to the value</span>». <span class=\"ru-tr\">«Для числовых типов со стандартными суффиксами C#-литералов суффикс добавляется к значению».</span> <code>double</code> → <code>D</code> (<code>10D</code>), <code>long</code> → <code>L</code>, <code>float</code> → <code>F</code>.", source: "ms-dv" },
    { text: "Checked-оператор — с <code>#</code>: «Checked operators are displayed with the <span class=\"hl\"><code>#</code> symbol in front of the operator</span>. For example, the checked addition operator is displayed as <code>#+</code>». <span class=\"ru-tr\">«Checked-операторы отображаются с символом <code>#</code> перед оператором. Например, checked-сложение показывается как <code>#+</code>».</span>", source: "ms-dv" },
  ],

  misconceptions: [
    {
      wrong: "DebugView — это просто ToString() дерева, тот же обычный C#-синтаксис x => x + 1",
      hook: 'Не совсем: <span class="wrong">DebugView == ToString()</span>. У DebugView <b>свой</b> компактный синтаксис для отладки: «The <b>DebugView</b> property (available only when debugging) <span class="hl">provides a string rendering of expression trees</span>». <span class="ru-tr">«Свойство <b>DebugView</b> (доступно только при отладке) даёт строковое представление деревьев выражений».</span> В нём параметры помечаются <code>$</code>: «variable names are displayed with a <code>$</code> symbol at the beginning». <span class="ru-tr">«имена переменных отображаются с символом <code>$</code> в начале».</span> Константы несут суффикс литерала (<code>10D</code>), лямбды печатаются как <code>.Lambda #Lambda1&lt;тип&gt;</code>, а checked-операторы — с <code>#</code> (<code>#+</code>). Это не <code>ToString()</code> (тот даёт <code>x =&gt; (x + 1)</code>), а отладочный дамп <b>структуры</b>. Ниже <b>пять разборов</b> и <b>машинная панель</b>: три правила разом — <code>$num | 10D | 1 #+ 2</code> (реальный DebugView, снятый рефлексией).',
      source: "ms-dv",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Что такое DebugView", title: "Debugger-only строковое представление дерева",
      viewBox: "0 0 340 210", zones: DV_ZONES,
      code: ["// DebugView — свойство, видимое в отладчике", "// показывает СТРУКТУРУ дерева спец-синтаксисом", "// в этом уроке читаем его рефлексией (реальный прогон)"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>DebugView</code> «(available only when debugging)» <span class="ru-tr">«(доступно только при отладке)»</span> — свойство для инспекции дерева в отладчике. Публичного API у него нет.', nodes: [{ id: "t", kind: "obj", at: { zone: "tree", row: 0 }, typeTag: "Expression", value: "дерево", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Оно «<span class="hl">provides a string rendering of expression trees</span>» <span class="ru-tr">«даёт строковое представление деревьев выражений»</span> — компактный дамп структуры, не исходный C#.', nodes: [{ id: "t", kind: "obj", at: { zone: "tree", row: 0 }, typeTag: "дерево", value: "граф" }, { id: "d", kind: "gate", at: { zone: "dv", row: 0 }, state: "ok", label: "DebugView", detail: "строка", accent: true }], edges: [{ id: "e", from: "t", to: "d", accent: true }] },
        { codeLine: 2, out: "", caption: 'Большая часть синтаксиса интуитивна; <span class="hl">особые случаи</span> — параметры, константы, лямбды, checked — разберём далее. Читать будем реальным прогоном через рефлексию.', nodes: [{ id: "d", kind: "gate", at: { zone: "dv", row: 0 }, state: "ok", label: "спец-синтаксис", detail: "$ · суффикс · #", accent: true }], edges: [] },
      ],
      explain: 'DebugView — отладочный дамп дерева, не его <code>ToString()</code>. Дословно: «The <b>DebugView</b> property (available only when debugging) <span class="hl">provides a string rendering of expression trees</span>. Most of the syntax is fairly straightforward to understand; the special cases are described in the following sections». <span class="ru-tr">«Свойство <b>DebugView</b> (доступно только при отладке) даёт строковое представление деревьев выражений. Большая часть синтаксиса понятна интуитивно; особые случаи описаны в следующих разделах».</span> Свойство internal (видно в watch-окне отладчика), но снять его детерминированно можно рефлексией — <code>typeof(Expression).GetProperty("DebugView", BindingFlags.Instance | BindingFlags.NonPublic)</code>. Именно так экзамплы этого урока получают <b>реальные</b> строки DebugView в рантайме, совпадающие с примерами доки символ-в-символ. Дальше — четыре спецсинтаксиса, ради которых DebugView и читают.',
      sources: ["ms-dv"],
    },
    {
      id: "s2", num: "02", kicker: "Параметры", title: "ParameterExpression — с $-префиксом; безымянный → $var1",
      viewBox: "0 0 340 210", zones: PAR_ZONES,
      code: ["Expression.Parameter(typeof(int), \"num\")   // DebugView: $num", "Expression.Parameter(typeof(int))          // DebugView: $var1", "// $-префикс отличает параметр от прочего в дампе"],
      predictAt: 0, predictQ: 'В DebugView имя параметра <code>Expression.Parameter(typeof(int), "num")</code> печатается... как именно?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '«<code>ParameterExpression</code> variable names are displayed with a <span class="hl"><code>$</code> symbol at the beginning</span>». <span class="ru-tr">«Имена переменных <code>ParameterExpression</code> отображаются с символом <code>$</code> в начале».</span> <code>num</code> → <code>$num</code>.', nodes: [{ id: "p", kind: "obj", at: { zone: "par", row: 0 }, typeTag: "Parameter", value: "num", accent: true }, { id: "d", kind: "gate", at: { zone: "dollar", row: 0 }, state: "ok", label: "DebugView", detail: "$num", accent: true }], edges: [{ id: "e", from: "p", to: "d", accent: true }] },
        { codeLine: 1, out: "", caption: 'Без имени: «it\'s assigned an automatically generated name, such as <span class="hl"><code>$var1</code> or <code>$var2</code></span>». <span class="ru-tr">«присваивается автоимя, например <code>$var1</code> или <code>$var2</code>».</span>', nodes: [{ id: "p", kind: "obj", at: { zone: "par", row: 0 }, typeTag: "Parameter", value: "(без имени)" }, { id: "d", kind: "gate", at: { zone: "dollar", row: 0 }, state: "ok", label: "DebugView", detail: "$var1", accent: true }], edges: [] },
        { codeLine: 0, out: "$num", caption: 'Панель: <span class="hl">$num</span> (реальный DebugView через рефлексию). <code>$</code>-префикс — визуальный маркер параметра в дампе.', nodes: [{ id: "d", kind: "gate", at: { zone: "dollar", row: 0 }, state: "ok", label: "результат", detail: "$num", accent: true }], edges: [] },
      ],
      explain: 'Первый спецсимвол — <code>$</code> для параметров. Дословно: «<code>ParameterExpression</code> variable names are displayed with a <span class="hl"><code>$</code> symbol at the beginning</span>». <span class="ru-tr">«Имена переменных <code>ParameterExpression</code> отображаются с символом <code>$</code> в начале».</span> Так <code>Expression.Parameter(typeof(int), "num")</code> в DebugView — это <code>$num</code>. Если параметр создан без имени: «If a parameter doesn\'t have a name, it\'s assigned an automatically generated name, such as <code>$var1</code> or <code>$var2</code>». <span class="ru-tr">«Если у параметра нет имени, ему присваивается автоматически сгенерированное имя, например <code>$var1</code> или <code>$var2</code>».</span> Реальный прогон подтверждает: именованный даёт <code>$num</code>, безымянный — <code>$var1</code>. Префикс <code>$</code> нужен, чтобы в дампе сложного дерева параметр нельзя было спутать с константой, вызовом метода или чем-то ещё.',
      sources: ["ms-dv"],
    },
    {
      id: "s3", num: "03", kicker: "Константы", title: "ConstantExpression — значение с суффиксом литерала",
      viewBox: "0 0 340 210", zones: CONST_ZONES,
      code: ["Expression.Constant(10)     // int    → DebugView: 10", "Expression.Constant(10.0)   // double → DebugView: 10D", "Expression.Constant(10L)    // long   → DebugView: 10L"],
      predictAt: 1, predictQ: 'В DebugView <code>Expression.Constant(10.0)</code> (double) печатается с суффиксом литерала. Каким?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Для целых, строк и <code>null</code>: «<span class="hl">the value of the constant is displayed</span>». <span class="ru-tr">«отображается значение константы».</span> <code>int 10</code> → <code>10</code>, без суффикса.', nodes: [{ id: "c", kind: "obj", at: { zone: "const", row: 0 }, typeTag: "Constant", value: "int 10", accent: true }, { id: "s", kind: "gate", at: { zone: "suffix", row: 0 }, state: "ok", label: "DebugView", detail: "10" }], edges: [] },
        { codeLine: 1, out: "", caption: '«For numeric types that have standard suffixes as C# literals, <span class="hl">the suffix is added to the value</span>». <span class="ru-tr">«суффикс добавляется к значению».</span> <code>double</code> → <code>D</code>: <code>10D</code>.', nodes: [{ id: "c", kind: "obj", at: { zone: "const", row: 0 }, typeTag: "Constant", value: "double 10" }, { id: "s", kind: "gate", at: { zone: "suffix", row: 0 }, state: "ok", label: "DebugView", detail: "10D", accent: true }], edges: [{ id: "e", from: "c", to: "s", accent: true }] },
        { codeLine: 1, out: "10D", caption: 'Панель: <span class="hl">10D</span> (реальный DebugView). <code>long</code>→<code>10L</code>, <code>float</code>→<code>10F</code>, <code>decimal</code>→<code>10M</code>. Суффикс = <b>тип</b> константы в дампе.', nodes: [{ id: "s", kind: "gate", at: { zone: "suffix", row: 0 }, state: "ok", label: "результат", detail: "10D", accent: true }], edges: [] },
      ],
      explain: 'Константы в DebugView несут информацию о типе через суффикс. «For <code>ConstantExpression</code> objects that represent integer values, strings, and <code>null</code>, the value of the constant is displayed». <span class="ru-tr">«Для объектов <code>ConstantExpression</code>, представляющих целые значения, строки и <code>null</code>, отображается значение константы».</span> А для чисел с суффиксом: «For numeric types that have standard suffixes as C# literals, <span class="hl">the suffix is added to the value</span>». <span class="ru-tr">«Для числовых типов со стандартными суффиксами C#-литералов суффикс добавляется к значению».</span> Таблица суффиксов из доки: <code>uint</code>→<code>U</code>, <code>long</code>→<code>L</code>, <code>ulong</code>→<code>UL</code>, <code>double</code>→<code>D</code>, <code>float</code>→<code>F</code>, <code>decimal</code>→<code>M</code>. Реальный прогон: <code>Expression.Constant(10.0)</code> → <code>10D</code>. Суффикс избавляет от догадок «это <code>int</code> или <code>double</code>?» — тип виден прямо в дампе.',
      sources: ["ms-dv"],
    },
    {
      id: "s4", num: "04", kicker: "Лямбды и checked", title: ".Lambda #Lambda1<тип>; checked-оператор с #",
      viewBox: "0 0 340 210", zones: LAM_ZONES,
      code: ["Expression.Lambda<Func<int>>(...)  // .Lambda #Lambda1<System.Func`1[...]>", "// безымянная лямбда → авто-имя #Lambda1 / #Lambda2", "Expression.AddChecked(a, b)        // DebugView: a #+ b"],
      scenes: [
        { codeLine: 0, out: "", caption: '«<code>LambdaExpression</code> objects are displayed <span class="hl">together with their delegate types</span>». <span class="ru-tr">«Объекты <code>LambdaExpression</code> отображаются вместе с типами их делегатов».</span> Формат: <code>.Lambda #Lambda1&lt;тип&gt;</code>.', nodes: [{ id: "l", kind: "obj", at: { zone: "lam", row: 0 }, typeTag: ".Lambda", value: "#Lambda1<Func>", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Без имени: «it\'s assigned an automatically generated name, such as <span class="hl"><code>#Lambda1</code> or <code>#Lambda2</code></span>». <span class="ru-tr">«присваивается автоимя, например <code>#Lambda1</code> или <code>#Lambda2</code>».</span>', nodes: [{ id: "l", kind: "obj", at: { zone: "lam", row: 0 }, typeTag: ".Lambda", value: "#Lambda1" }], edges: [] },
        { codeLine: 2, out: "", caption: '«Checked operators are displayed with the <span class="hl"><code>#</code> symbol in front of the operator</span>… the checked addition operator is displayed as <code>#+</code>». <span class="ru-tr">«Checked-операторы — с <code>#</code> перед оператором… checked-сложение как <code>#+</code>».</span>', nodes: [{ id: "l", kind: "obj", at: { zone: "lam", row: 0 }, typeTag: ".Lambda", value: "#Lambda1" }, { id: "c", kind: "gate", at: { zone: "chk", row: 0 }, state: "ok", label: "AddChecked", detail: "1 #+ 2", accent: true }], edges: [] },
      ],
      explain: 'Ещё два спецсинтаксиса. <b>Лямбды</b>: «<code>LambdaExpression</code> objects are displayed <span class="hl">together with their delegate types</span>». <span class="ru-tr">«Объекты <code>LambdaExpression</code> отображаются вместе с типами их делегатов».</span> — в DebugView это <code>.Lambda #Lambda1&lt;System.Func`1[System.Int32]&gt;() { ... }</code>. Безымянная лямбда получает авто-имя: «If a lambda expression doesn\'t have a name, it\'s assigned an automatically generated name, such as <code>#Lambda1</code> or <code>#Lambda2</code>». <span class="ru-tr">«Если у лямбды нет имени, ей присваивается автоимя, например <code>#Lambda1</code> или <code>#Lambda2</code>».</span> <b>Checked</b>: «Checked operators are displayed with the <span class="hl"><code>#</code> symbol in front of the operator</span>. For example, the checked addition operator is displayed as <code>#+</code>». <span class="ru-tr">«Checked-операторы отображаются с символом <code>#</code> перед оператором. Например, checked-сложение показывается как <code>#+</code>».</span> Так <code>Expression.AddChecked(1, 2)</code> в DebugView — <code>1 #+ 2</code>. Префиксы <code>$</code>/<code>#</code> и суффиксы делают дамп однозначным.',
      sources: ["ms-dv"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · прогон", title: "Три правила разом: $num | 10D | 1 #+ 2",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["static string DV(Expression e) => (string)typeof(Expression)", "  .GetProperty(\"DebugView\", NonPublic|Instance).GetValue(e);", "DV(Expression.Parameter(typeof(int),\"num\"))     // $num", "DV(Expression.Constant(10.0))                   // 10D", "DV(Expression.AddChecked(Constant(1),Constant(2))) // 1 #+ 2"],
      predictAt: 2, predictQ: 'DebugView трёх узлов: параметр <code>num</code>, константа <code>10.0</code> (double), <code>AddChecked(1,2)</code>. Что даст <code>$"{a} | {b} | {c}"</code>?', console: true,
      scenes: [
        { codeLine: 2, out: "", caption: 'Параметр <code>num</code> → <span class="hl">$num</span> ($-префикс). Первое правило DebugView.', nodes: [{ id: "r", kind: "obj", at: { zone: "rules", row: 0 }, typeTag: "Parameter", value: "num", accent: true }, { id: "o", kind: "gate", at: { zone: "out", row: 0 }, state: "ok", label: "$num", detail: "$-префикс" }], edges: [] },
        { codeLine: 3, out: "", caption: 'Константа <code>10.0</code> (double) → <span class="hl">10D</span> (суффикс литерала). <code>AddChecked</code> → <code>1 #+ 2</code> (#-checked).', nodes: [{ id: "r", kind: "obj", at: { zone: "rules", row: 0 }, typeTag: "три узла", value: "$ / D / #" }, { id: "o", kind: "gate", at: { zone: "out", row: 0 }, state: "ok", label: "10D · 1 #+ 2", detail: "суффикс · #", accent: true }], edges: [{ id: "e", from: "r", to: "o", accent: true }] },
        { codeLine: 4, out: "$num | 10D | 1 #+ 2", caption: 'Панель: <span class="hl">$num | 10D | 1 #+ 2</span> (реальный DebugView через рефлексию). Три правила синтаксиса в одной строке.', nodes: [{ id: "o", kind: "gate", at: { zone: "out", row: 0 }, state: "ok", label: "результат", detail: "$num | 10D | 1 #+ 2", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель собирает три правила DebugView в один реальный прогон (свойство снято рефлексией — оно debugger-only). Параметр <code>num</code> печатается как <code>$num</code> («<code>$</code> symbol at the beginning» <span class="ru-tr">«символ <code>$</code> в начале»</span>), <code>double</code>-константа <code>10.0</code> — как <code>10D</code> («the suffix is added to the value» <span class="ru-tr">«суффикс добавляется к значению»</span>), а <code>AddChecked(1, 2)</code> — как <code>1 #+ 2</code> («<code>#</code> symbol in front of the operator… displayed as <code>#+</code>» <span class="ru-tr">«символ <code>#</code> перед оператором… показывается как <code>#+</code>»</span>). Реальный вывод: <code>$num | 10D | 1 #+ 2</code> — символ-в-символ как в примерах доки. Это доказывает: DebugView — не косметический <code>ToString()</code>, а строгий формат, где <b>каждый</b> префикс/суффикс несёт тип и вид узла. При инспекции сложного дерева в отладчике этот формат читается однозначно.',
      sources: ["ms-dv"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>static string DV(Expression e)=&gt;(string)typeof(Expression).GetProperty("DebugView",BindingFlags.Instance|BindingFlags.NonPublic).GetValue(e); var numParam = Expression.Parameter(typeof(int), "num"); Console.WriteLine(DV(numParam));</code> — что напечатает DebugView?',
      options: ["$num", "num", "$var1", "Parameter num"], correctIndex: 0, xp: 10,
      okText: '«<code>ParameterExpression</code> variable names are displayed with a <code>$</code> symbol at the beginning». <span class="ru-tr">«Имена параметров — с <code>$</code> в начале».</span> <code>num</code> → <b>$num</b>.',
      noText: 'В DebugView параметр получает <code>$</code>-префикс. Имя есть → <code>$num</code> (а не автоимя <code>$var1</code>). Вывод: <b>$num</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "$num" }, sourceRefs: ["ms-dv"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>static string DV(Expression e)=&gt;(string)typeof(Expression).GetProperty("DebugView",BindingFlags.Instance|BindingFlags.NonPublic).GetValue(e); double num=10; ConstantExpression expr = Expression.Constant(num); Console.WriteLine(DV(expr));</code> — что напечатает DebugView?',
      options: ["10D", "10", "10.0", "$10"], correctIndex: 0, xp: 10,
      okText: '«For numeric types that have standard suffixes as C# literals, the suffix is added to the value». <span class="ru-tr">«суффикс добавляется к значению».</span> <code>double</code> → суффикс <code>D</code>: <b>10D</b>.',
      noText: 'DebugView добавляет к числу суффикс его C#-литерала. Для <code>double</code> это <code>D</code> → <b>10D</b> (не <code>10</code> и не <code>10.0</code>).',
      verify: { kind: "exec", run: "dotnet run", expect: "10D" }, sourceRefs: ["ms-dv"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>static string DV(Expression e)=&gt;(string)typeof(Expression).GetProperty("DebugView",BindingFlags.Instance|BindingFlags.NonPublic).GetValue(e); Console.WriteLine($"{DV(Expression.Parameter(typeof(int),"num"))} | {DV(Expression.Constant(10.0))} | {DV(Expression.AddChecked(Expression.Constant(1),Expression.Constant(2)))}");</code> — что напечатает?',
      options: ["$num | 10D | 1 #+ 2", "num | 10 | 1 + 2", "$num | 10.0 | 1 #+ 2", "$num | 10D | 1 + 2"], correctIndex: 0, xp: 10,
      okText: 'Три правила DebugView: параметр → <code>$num</code>, <code>double</code>-константа → <code>10D</code>, checked-сложение → <code>1 #+ 2</code> (<code>#</code> перед оператором). Вывод: <b>$num | 10D | 1 #+ 2</b>.',
      noText: '<code>$</code>-префикс параметра + <code>D</code>-суффикс double + <code>#</code>-префикс checked-оператора. «the checked addition operator is displayed as <code>#+</code>». <span class="ru-tr">«checked-сложение как <code>#+</code>».</span> Вывод: <b>$num | 10D | 1 #+ 2</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "$num | 10D | 1 #+ 2" }, sourceRefs: ["ms-dv"],
    },
  ],

  takeaways: [
    { icon: "why", k: "не ToString(), а дамп", v: 'DebugView «(available only when debugging) <span class="hl">provides a string rendering of expression trees</span>». <span class="ru-tr">«(только при отладке) даёт строковое представление деревьев».</span> Свой компактный синтаксис структуры, читается рефлексией. Замер: <code>$num</code>.' },
    { icon: "cost", k: "$ параметры, суффикс констант", v: 'Параметр — «<code>$</code> symbol at the beginning» <span class="ru-tr">«символ <code>$</code> в начале»</span> (<code>$num</code>, безымянный <code>$var1</code>). Константа — «the suffix is added to the value» <span class="ru-tr">«суффикс добавляется к значению»</span>: <code>double</code>→<code>10D</code>, <code>long</code>→<code>L</code>. Замер: <code>10D</code>.' },
    { icon: "avoid", k: "# для лямбд и checked", v: 'Лямбда — <code>.Lambda #Lambda1&lt;тип&gt;</code> «together with their delegate types» <span class="ru-tr">«вместе с типами делегатов»</span>. Checked — «<code>#</code> symbol in front of the operator» (<code>#+</code>). <span class="ru-tr">«<code>#</code> перед оператором».</span> Замер трёх правил: <code>$num | 10D | 1 #+ 2</code>.' },
  ],

  foot: 'урок · <b>DebugView: синтаксис инспекции дерева</b> · 5 анимир. разборов · панель $num | 10D | 1 #+ 2 · дизайн <b>mid</b>',
};
