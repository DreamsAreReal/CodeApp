/**
 * Lesson: Regex — the engine, Compiled, and GeneratedRegex (CS.S12.regex) — expert density,
 * 5 animated deep-dives. The senior fact: `new Regex(pattern)` runs on an INTERPRETER (the
 * default engine that walks opcodes); RegexOptions.Compiled reflection-emits IL into DynamicMethods
 * for faster steady-state at a heavy first-use cost; and the [GeneratedRegex] source generator
 * moves that work to COMPILE time (source-generated, trimmable, fast startup).
 *
 * SIGNATURE machine panel (s5): the same pattern behaves identically whether interpreted or
 * RegexOptions.Compiled — Compiled changes the HOW (IL vs opcodes), not the match result. REAL
 * run-csharp measurement (this file's exec cards, run via reflection into System.Text.
 * RegularExpressions because the sandbox does not reference that assembly at compile time —
 * behavior is genuine runtime Regex): c1 "True\n555-1234" (IsMatch + Match.Value) · c2 "3\nthree"
 * (RegexOptions.Compiled: Matches.Count + [2].Value) · c3 "USER\nExample\nX X" (IgnoreCase groups
 * + Replace). NOTE: [GeneratedRegex] source generators do NOT run in the CSharpScript sandbox —
 * they are taught CONCEPTUALLY from the docs; the runtime behavior is proven with Compiled/new Regex.
 *
 * Accuracy contract (G4/G7/G8) — verified against learn.microsoft.com/.../standard/base-types/
 * regular-expressions and .../regular-expression-source-generators (dotnet/docs, substring-checked
 * 2026-07-22, live rendering confirmed):
 *   - every English quote is VERBATIM from its own cited page (each item lists the page(s) it quotes);
 *   - the match RESULTS are OWN DETERMINISTIC run-csharp measurements (this file's exec cards),
 *     never faked;
 *   - every card verify.expect is the REAL stdout of run-csharp: c1 "True\n555-1234" · c2 "3\nthree" ·
 *     c3 "USER\nExample\nX X".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S12.regex/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the engine — Regex object + two inputs (pattern, text).
const Z_ENGINE: Zone = { id: "engine", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "REGEX ENGINE", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "System.Text.RegularExpressions.Regex", subCls: "vz-zsub", subY: 47 };
const Z_INPUTS: Zone = { id: "inputs", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ДВА ВХОДА", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "pattern + text", subCls: "vz-zsub heap", subY: 47 };
const ENGINE_ZONES: Zone[] = [Z_ENGINE, Z_INPUTS];

// s2: the methods — IsMatch / Match / Matches / Replace.
const Z_METH: Zone = { id: "meth", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "МЕТОДЫ Regex · один pattern — четыре операции", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "IsMatch · Match · Matches · Replace", subCls: "vz-zsub", subY: 47 };
const METH_ZONES: Zone[] = [Z_METH];

// s3: interpreter vs Compiled — opcodes vs IL.
const Z_INTERP: Zone = { id: "interp", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "INTERPRETER · default", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "walks opcodes", subCls: "vz-zsub good", subY: 47 };
const Z_COMPILED: Zone = { id: "compiled", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Compiled · IL", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "reflection-emit → DynamicMethod", subCls: "vz-zsub heap", subY: 47 };
const ENGINE2_ZONES: Zone[] = [Z_INTERP, Z_COMPILED];

// s4: GeneratedRegex — compile-time source generation.
const Z_RUNTIME: Zone = { id: "runtime", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Compiled · РАНТАЙМ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "IL на первом использовании", subCls: "vz-zsub", subY: 47 };
const Z_BUILDTIME: Zone = { id: "buildtime", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "GeneratedRegex · COMPILE", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "код генерится на билде", subCls: "vz-zsub good", subY: 47 };
const GEN_ZONES: Zone[] = [Z_RUNTIME, Z_BUILDTIME];

// s5 (SIGNATURE): interpreted vs Compiled — same match, different HOW.
const Z_PAT: Zone = { id: "pat", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: 'pattern \\w+', labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: '"one two three"', subCls: "vz-zsub", subY: 47 };
const Z_MATCH: Zone = { id: "matchz", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Compiled · тот же результат", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "Count 3 · [2]=three", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_PAT, Z_MATCH];

export const regex: LessonData = {
  id: "CS.S12.regex",
  track: "CS",
  section: "CS.S12",
  module: "S12.6",
  lang: "csharp",
  title: "Regex: движок, RegexOptions.Compiled и GeneratedRegex",
  kicker: "C# вглубь · S12 · движок и три engine",
  home: { subtitle: "Regex engine, IsMatch/Match/Matches, interpreter vs Compiled vs source-gen", icon: "types", estMinutes: 11 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-regex", kind: "doc", org: "Microsoft Learn", title: ".NET Regular Expressions", url: "https://learn.microsoft.com/en-us/dotnet/standard/base-types/regular-expressions", date: "2026-03-18" },
    { id: "ms-srcgen", kind: "doc", org: "Microsoft Learn", title: ".NET regular expression source generators", url: "https://learn.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-source-generators", date: "2025-07-01" },
  ],

  spec: [
    { text: "«The centerpiece of text processing with regular expressions is the regular expression engine, which is represented by the System.Text.RegularExpressions.Regex object in .NET.»", source: "ms-regex" },
  ],
  edgeCases: [
    { text: "У <code>Regex</code> один pattern — несколько операций: «Determine whether the regular expression pattern occurs in the input text by calling the <span class=\"hl\">System.Text.RegularExpressions.Regex.IsMatch</span> method». <code>Matches</code> возвращает коллекцию, что «contains one System.Text.RegularExpressions.Match object for each match found in the parsed text». Собственный прогон: <code>IsMatch</code>=True, <code>Match.Value</code>=555-1234.", source: "ms-regex" },
    { text: "<code>new Regex(...)</code> по умолчанию идёт на <b>интерпретатор</b>: «When instantiating a new <code>Regex</code> instance or calling one of the static methods on <code>Regex</code>, the <span class=\"hl\">interpreter is the default engine</span> employed». Собственный прогон подтверждает поведение движка (детерминированные совпадения).", source: "ms-srcgen" },
    { text: "<code>RegexOptions.Compiled</code> эмитит IL: «The resulting instructions are transformed further by the <span class=\"hl\">reflection-emit-based compiler into IL instructions</span> that are written to a few System.Reflection.Emit.DynamicMethod objects». Это «a fundamental tradeoff between overheads on the first use and overheads on every subsequent use». Собственный прогон: Compiled даёт тот же результат (Count=3).", source: "ms-srcgen" },
    { text: "<code>[GeneratedRegex]</code> — <b>compile-time</b>, не рантайм. Рекомендация доков — предпочесть source generation режиму <code>Compiled</code>, потому что «Source generation can help your app <span class=\"hl\">start faster, run more quickly, and be more trimmable</span>». Источник-генератор не исполняется в песочнице — доказан concept, поведение снято на <code>Compiled</code>.", source: "ms-srcgen" },
  ],

  misconceptions: [
    {
      wrong: "Regex — это «медленная строковая магия»; new Regex(pattern) и [GeneratedRegex] делают одно и то же, RegexOptions.Compiled всегда быстрее",
      hook: 'Нет — за одним <code>pattern</code> стоит <b>движок</b> с несколькими реализациями, и выбор между ними — это трейдоф, а не «всегда быстрее». «The centerpiece of text processing with regular expressions is the <b>regular expression engine</b>, which is represented by the <b>System.Text.RegularExpressions.Regex</b> object in .NET». Когда ты пишешь <code>new Regex(...)</code>, «the <span class="hl">interpreter is the default engine</span> employed» — он просто «walks through those instructions» (опкоды). <code>RegexOptions.Compiled</code> добавляет «reflection-emit-based compiler into IL instructions… written to a few System.Reflection.Emit.DynamicMethod objects» — быстрее в устоявшемся режиме, но это «a <b>fundamental tradeoff</b> between overheads on the first use and overheads on every subsequent use» (дорогой старт). А <code>[GeneratedRegex]</code> переносит всю работу на <b>компиляцию</b>: «use source-generated regular expressions instead of compiling regular expressions» — что помогает «<span class="hl">start faster, run more quickly, and be more trimmable</span>». Три разных engine — три разных профиля. Дальше <b>пять разборов</b>: движок и два входа, методы Regex, interpreter vs Compiled, GeneratedRegex как compile-time, и <b>машинная панель</b> — Compiled даёт тот же результат, что интерпретатор (реальный прогон: Count 3, [2]=three). <i>Примечание: <code>[GeneratedRegex]</code>-генератор не исполняется в песочнице — он показан как концепт из доков, а рантайм-поведение доказано на <code>Compiled</code>/<code>new Regex</code>.</i>',
      source: ["ms-regex", "ms-srcgen"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Движок и два входа", title: "Regex — движок, которому дают pattern и text",
      viewBox: "0 0 340 210", zones: ENGINE_ZONES,
      code: ["var re = new Regex(@\"\\d{3}-\\d{4}\");   // pattern → движок", "re.IsMatch(\"call 555-1234\");            // text → парсинг"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Центр всего — <b>движок регулярных выражений</b>, воплощённый объектом <code>Regex</code>. Ему нужны <span class="hl">два</span> входа.', nodes: [{ id: "e", kind: "obj", at: { zone: "engine", row: 0 }, typeTag: "Regex", value: "движок", accent: true }], edges: [] },
        { codeLine: 0, out: "", caption: 'Вход 1 — <b>pattern</b>: «The regular expression pattern to identify in the text». Синтаксис «compatible with Perl 5».', nodes: [{ id: "e", kind: "obj", at: { zone: "engine", row: 0 }, typeTag: "Regex", value: "движок" }, { id: "p", kind: "chip", at: { zone: "inputs", row: 0 }, value: '@"\\d{3}-\\d{4}"', accent: true }], edges: [{ id: "ep", from: "p", to: "e", accent: true }] },
        { codeLine: 1, out: "", caption: 'Вход 2 — <b>text</b>: строка, которую парсим на pattern. Движок ищет совпадения в ней.', nodes: [{ id: "e", kind: "obj", at: { zone: "engine", row: 0 }, typeTag: "Regex", value: "движок" }, { id: "p", kind: "chip", at: { zone: "inputs", row: 0 }, value: '@"\\d{3}-\\d{4}"' }, { id: "t", kind: "chip", at: { zone: "inputs", row: 1 }, value: '"call 555-1234"', accent: true }], edges: [{ id: "ep", from: "p", to: "e" }, { id: "et", from: "t", to: "e", accent: true }] },
      ],
      explain: 'Regex — не «магия над строками», а конкретный движок: «The centerpiece of text processing with regular expressions is the <b>regular expression engine</b>, which is represented by the <span class="hl">System.Text.RegularExpressions.Regex</span> object in .NET». <span class="ru-tr">(центральный элемент обработки текста регулярными выражениями — движок, представленный объектом System.Text.RegularExpressions.Regex в .NET).</span> Ему нужны ровно два входа: «The regular expression <b>pattern</b> to identify in the text» и «The <b>text</b> to parse for the regular expression pattern». <span class="ru-tr">(шаблон для поиска в тексте; и текст, который разбирают на этот шаблон).</span> Сам язык шаблонов «compatible with Perl 5 regular expressions and adds some other features such as right-to-left matching». <span class="ru-tr">(совместим с регулярными выражениями Perl 5 и добавляет, например, сопоставление справа налево).</span> Держи модель «движок + pattern + text» — она объясняет и API, и различия движков дальше.',
      sources: ["ms-regex"],
    },
    {
      id: "s2", num: "02", kicker: "Методы · один pattern — операции", title: "IsMatch / Match / Matches / Replace",
      viewBox: "0 0 340 210", zones: METH_ZONES,
      code: ["re.IsMatch(text);    // bool — есть ли совпадение", "re.Match(text);      // Match — первое совпадение", "re.Matches(text);    // MatchCollection — все", "re.Replace(text, r); // строка с заменами"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>IsMatch</code> — «Determine whether the regular expression pattern <span class="hl">occurs</span> in the input text». Возвращает <code>bool</code>.', nodes: [{ id: "im", kind: "gate", at: { zone: "meth", row: 0, col: 0 }, state: "ok", label: "IsMatch", detail: "bool", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Match</code> — первое совпадение: «returns a <b>System.Text.RegularExpressions.Match</b> object that provides information about the matching text» (Value, Index, Groups).', nodes: [{ id: "im", kind: "gate", at: { zone: "meth", row: 0, col: 0 }, state: "ok", label: "IsMatch", detail: "bool" }, { id: "m", kind: "gate", at: { zone: "meth", row: 0, col: 1 }, state: "ok", label: "Match", detail: "Match", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>Matches</code> — все: «contains one <b>System.Text.RegularExpressions.Match</b> object for each match found in the parsed text». <code>Replace</code> меняет совпадения на строку.', nodes: [{ id: "m", kind: "gate", at: { zone: "meth", row: 0, col: 0 }, state: "ok", label: "Match", detail: "первое" }, { id: "ms", kind: "gate", at: { zone: "meth", row: 0, col: 1 }, state: "ok", label: "Matches", detail: "MatchCollection" }, { id: "rp", kind: "gate", at: { zone: "meth", row: 1 }, state: "ok", label: "Replace", detail: "строка", accent: true }], edges: [] },
      ],
      explain: 'Один объект <code>Regex</code> с одним pattern даёт четыре операции. «Determine whether the regular expression pattern occurs in the input text by calling the <b>System.Text.RegularExpressions.Regex.IsMatch</b> method». <span class="ru-tr">(определить, встречается ли шаблон в тексте, вызвав метод IsMatch).</span> «Retrieve one or all occurrences of text that matches the regular expression pattern by calling the <b>System.Text.RegularExpressions.Regex.Match</b> or <b>System.Text.RegularExpressions.Regex.Matches</b> method. The former method returns a <b>System.Text.RegularExpressions.Match</b> object that provides information about the matching text. The latter returns a <span class="hl">System.Text.RegularExpressions.MatchCollection</span> object that contains one System.Text.RegularExpressions.Match object for each match found in the parsed text». <span class="ru-tr">(получить одно или все вхождения методом Match или Matches; первый возвращает объект Match со сведениями о совпадении, второй — MatchCollection с одним Match на каждое найденное совпадение).</span> Плюс операция «<b>Replace</b> text that matches the regular expression pattern by calling the <b>System.Text.RegularExpressions.Regex.Replace</b> method». <code>Match</code> несёт <code>Value</code>, <code>Index</code> и <code>Groups</code> — доступ к захваченным группам, что мы снимем прогоном.',
      sources: ["ms-regex"],
    },
    {
      id: "s3", num: "03", kicker: "Interpreter vs Compiled", title: "Один pattern, два способа исполнения",
      viewBox: "0 0 340 210", zones: ENGINE2_ZONES,
      code: ["new Regex(pattern);                         // INTERPRETER (по умолчанию)", "new Regex(pattern, RegexOptions.Compiled);  // COMPILED → IL"],
      scenes: [
        { codeLine: 0, out: "", caption: 'По умолчанию pattern превращается в <b>опкоды</b>, и «the <span class="hl">interpreter</span> simply walks through those instructions». Дёшево создать, медленнее матчить.', nodes: [{ id: "i", kind: "gate", at: { zone: "interp", row: 0 }, state: "ok", label: "interpreter", detail: "walks opcodes · default", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>RegexOptions.Compiled</code>: «reflection-emit-based compiler into <span class="hl">IL instructions</span>… written to a few System.Reflection.Emit.DynamicMethod objects». Быстрее матчить.', nodes: [{ id: "i", kind: "gate", at: { zone: "interp", row: 0 }, state: "ok", label: "interpreter", detail: "opcodes" }, { id: "c", kind: "gate", at: { zone: "compiled", row: 0 }, state: "ok", label: "Compiled", detail: "IL → DynamicMethod", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Но это трейдоф: «a <b>fundamental tradeoff</b> between overheads on the <span class="hl">first use</span> and overheads on every <span class="hl">subsequent use</span>». Дорогой старт (эмит + JIT) ради быстрого стедистейта.', nodes: [{ id: "t", kind: "gate", at: { zone: "compiled", row: 0 }, state: "fail", label: "tradeoff", detail: "дорогой первый запуск", accent: true }], edges: [] },
      ],
      explain: 'За одним pattern скрыты два движка. По умолчанию — <b>интерпретатор</b>: «When you write <code>new Regex("somepattern")</code>… The tree is written into a form that can be interpreted as a series of opcodes and operands… the interpreter simply walks through those instructions». <span class="ru-tr">(дерево записывается в набор опкодов и операндов; интерпретатор просто идёт по этим инструкциям).</span> И «When instantiating a new <code>Regex</code> instance or calling one of the static methods on <code>Regex</code>, the <span class="hl">interpreter is the default engine</span> employed». <span class="ru-tr">(при создании нового Regex или вызове статических методов по умолчанию используется интерпретатор).</span> С <code>RegexOptions.Compiled</code>: «The resulting instructions are transformed further by the <b>reflection-emit-based compiler into IL instructions</b> that are written to a few System.Reflection.Emit.DynamicMethod objects» — это «some of the main reasons that specifying <b>RegexOptions.Compiled</b> yields <b>much faster-matching throughput</b> than the interpreter». Цена: «<span class="hl">a fundamental tradeoff between overheads on the first use and overheads on every subsequent use</span>» + инхибирует trimming/AOT (эмит запрещён в некоторых средах, там <code>Compiled</code> «becomes a no-op»). Собственный прогон подтвердит: результат матча <b>тот же</b>, что у интерпретатора.',
      sources: ["ms-srcgen"],
    },
    {
      id: "s4", num: "04", kicker: "GeneratedRegex · compile-time", title: "Source generator переносит работу на компиляцию",
      viewBox: "0 0 340 210", zones: GEN_ZONES,
      code: ["// РАНТАЙМ (Compiled): IL эмитится при первом использовании", "// COMPILE-TIME (source-gen):", "[GeneratedRegex(\"abc|def\", RegexOptions.IgnoreCase)]", "private static partial Regex AbcOrDef();"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>RegexOptions.Compiled</code> платит цену в <b>рантайме</b>: reflection-emit + JIT на первом использовании.', nodes: [{ id: "r", kind: "gate", at: { zone: "runtime", row: 0 }, state: "fail", label: "Compiled", detail: "IL в рантайме · дорогой старт", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>[GeneratedRegex]</code> на <code>partial</code>-методе → «a source generator… <span class="hl">plugs into the compiler</span> and augments the compilation unit». Код генерится на <b>билде</b>.', nodes: [{ id: "r", kind: "gate", at: { zone: "runtime", row: 0 }, state: "fail", label: "Compiled", detail: "рантайм" }, { id: "g", kind: "obj", at: { zone: "buildtime", row: 0 }, typeTag: "[GeneratedRegex]", value: "код на компиляции", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Выигрыш: «start faster, run more quickly, and be more <span class="hl">trimmable</span>». Рекомендация доков — предпочесть его <code>Compiled</code>, где возможно.', nodes: [{ id: "g", kind: "gate", at: { zone: "buildtime", row: 0 }, state: "ok", label: "source-generated", detail: "startup · trimmable", accent: true }], edges: [] },
      ],
      explain: 'Третий движок — <b>source-generated</b>, работающий на компиляции. «.NET 7 introduced a new <code>RegexGenerator</code> source generator. A <b>source generator</b> is a component that <span class="hl">plugs into the compiler</span> and augments the compilation unit with additional source code». <span class="ru-tr">(source generator — компонент, встраивающийся в компилятор и дополняющий единицу компиляции исходным кодом).</span> «The .NET SDK includes a source generator that recognizes the <b>System.Text.RegularExpressions.GeneratedRegexAttribute</b> attribute on a partial method that returns Regex». <span class="ru-tr">(SDK содержит генератор, распознающий атрибут GeneratedRegexAttribute на partial-методе, возвращающем Regex).</span> Рекомендация прямая: «Where possible, use <b>source-generated</b> regular expressions instead of compiling regular expressions using the <b>System.Text.RegularExpressions.RegexOptions.Compiled</b> option. Source generation can help your app <span class="hl">start faster, run more quickly, and be more trimmable</span>». <span class="ru-tr">(где возможно, используйте source-generated регулярки вместо RegexOptions.Compiled; генерация ускоряет старт, ускоряет работу и улучшает trimming).</span> <i>Важно про доказательство: этот source-generator <b>не исполняется</b> в песочнице CSharpScript (он работает на этапе компиляции проекта). Поэтому здесь он показан <b>концептуально</b> из доков, а реальное рантайм-поведение движка снято на <code>RegexOptions.Compiled</code> и <code>new Regex(...)</code> в exec-картах.</i>',
      sources: ["ms-srcgen"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · Compiled = тот же результат", title: "RegexOptions.Compiled меняет HOW, не результат",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["var re = new Regex(@\"\\w+\", RegexOptions.Compiled);", "var ms = re.Matches(\"one two three\");", "Console.WriteLine(ms.Count);      // 3", "Console.WriteLine(ms[2].Value);   // three"],
      predictAt: 1, predictQ: 'Pattern <code>\\w+</code> с <code>RegexOptions.Compiled</code> по <code>"one two three"</code>. Что напечатают <code>ms.Count</code> и <code>ms[2].Value</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>RegexOptions.Compiled</code> эмитит IL в <code>DynamicMethod</code> — но это лишь <span class="hl">как</span> исполняется матч, не <b>что</b> он находит.', nodes: [{ id: "c", kind: "gate", at: { zone: "pat", row: 0 }, state: "ok", label: "Compiled", detail: "IL · DynamicMethod", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>\\w+</code> находит <b>три</b> слова: <code>one</code>, <code>two</code>, <code>three</code>. Ровно как сделал бы интерпретатор.', nodes: [{ id: "c", kind: "gate", at: { zone: "pat", row: 0 }, state: "ok", label: "Compiled", detail: "IL" }, { id: "m", kind: "gate", at: { zone: "matchz", row: 0 }, state: "ok", label: "Matches", detail: "3 совпадения", accent: true }], edges: [] },
        { codeLine: 3, out: "3\nthree", caption: 'Панель: <span class="hl">3 · three</span> (реальный прогон) — <code>Count</code>=3, <code>ms[2].Value</code>=<code>three</code>. Compiled = тот же результат, другой движок.', nodes: [{ id: "res", kind: "gate", at: { zone: "matchz", row: 0 }, state: "ok", label: "3 / three", detail: "результат = как у interpreter", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — снятая на <code>RegexOptions.Compiled</code>. Ключевая мысль: Compiled «yields much faster-matching throughput» <span class="ru-tr">(даёт заметно бо́льшую пропускную способность матчинга)</span>, но семантика матча <b>идентична</b> интерпретатору — «This IL essentially does exactly what the interpreter would do, except specialized for the exact pattern». <span class="ru-tr">(этот IL по сути делает ровно то же, что интерпретатор, но специализированно под конкретный шаблон).</span> Поэтому <code>\\w+</code> по <code>"one two three"</code> и с Compiled даёт те же <b>3</b> совпадения, а <code>ms[2].Value</code> — <code>three</code> (реальный вывод: <code>3</code>, <code>three</code>). Выбор движка — это профиль производительности (старт vs стедистейт vs trimming), а не изменение поведения. <i>Прогон выполнен через reflection в <code>System.Text.RegularExpressions</code>, т.к. песочница не ссылается на эту сборку на этапе компиляции — но вызываются те же рантайм-методы <code>Regex</code>, результат подлинный.</i> Итог секции: строка иммутабельна и интернируема, собирается через <code>StringBuilder</code>, сравнивается ordinal/culture, состоит из UTF-16 code units (char/Rune), а паттерны в ней ищет движок <code>Regex</code> с тремя реализациями.',
      sources: ["ms-regex", "ms-srcgen"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>using System.Text.RegularExpressions;</code><br/><code>var re = new Regex(@"\\d{3}-\\d{4}");</code><br/><code>Console.WriteLine(re.IsMatch("call 555-1234 now")); Console.WriteLine(re.Match("call 555-1234 now").Value);</code> — обе строки?',
      options: ["True\\n555-1234", "False\\n\\n", "True\\ncall 555-1234 now", "True\\n555"], correctIndex: 0, xp: 10,
      okText: '<code>IsMatch</code> находит совпадение pattern <code>\\d{3}-\\d{4}</code> → <b>True</b>. <code>Match.Value</code> — <span class="hl">совпавший</span> текст: <b>555-1234</b> (только совпадение, не вся строка).',
      noText: '<code>IsMatch</code> = «occurs in the input text» → True. <code>Match.Value</code> — только совпавшая подстрока (555-1234), не весь input. Реальный вывод: <b>True</b>, <b>555-1234</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True\n555-1234" }, sourceRefs: ["ms-regex"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>using System.Text.RegularExpressions;</code><br/><code>var re = new Regex(@"\\w+", RegexOptions.Compiled);</code><br/><code>var ms = re.Matches("one two three"); Console.WriteLine(ms.Count); Console.WriteLine(ms[2].Value);</code> — обе строки?',
      options: ["3\\nthree", "1\\none", "3\\ntwo", "2\\nthree"], correctIndex: 0, xp: 10,
      okText: '<code>Matches</code> = «one System.Text.RegularExpressions.Match object for each match». <code>\\w+</code> находит <b>3</b> слова; <code>ms[2]</code> — третье: <b>three</b>. <code>Compiled</code> (IL) даёт <span class="hl">тот же</span> результат, что интерпретатор.',
      noText: '<code>Matches</code> возвращает MatchCollection всех совпадений (3), индекс [2] — третье (three). RegexOptions.Compiled меняет движок, не результат. Реальный вывод: <b>3</b>, <b>three</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "3\nthree" }, sourceRefs: ["ms-regex", "ms-srcgen"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>using System.Text.RegularExpressions;</code><br/><code>var re = new Regex(@"(\\w+)@(\\w+)", RegexOptions.IgnoreCase); var m = re.Match("USER@Example rest");</code><br/><code>Console.WriteLine(m.Groups[1].Value); Console.WriteLine(m.Groups[2].Value); Console.WriteLine(re.Replace("a@b c@d", "X"));</code> — все три?',
      options: ["USER\\nExample\\nX X", "user\\nexample\\nX X", "USER@Example\\n\\nX", "USER\\nExample\\nX"], correctIndex: 0, xp: 10,
      okText: 'Группы захвата: <code>Groups[1]</code>=<b>USER</b>, <code>Groups[2]</code>=<b>Example</b> (значения сохраняются как есть). <code>Replace</code> меняет <span class="hl">каждое</span> совпадение <code>(\\w+)@(\\w+)</code> на X → <b>X X</b>.',
      noText: '<code>Groups[n]</code> — n-я захваченная подгруппа (USER, Example). <code>Replace</code> заменяет все совпадения: <code>a@b</code>→X, <code>c@d</code>→X = <b>X X</b>. Реальный вывод: <b>USER / Example / X X</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "USER\nExample\nX X" }, sourceRefs: ["ms-regex"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Движок + pattern + text", v: '«the regular expression engine… represented by the <b>System.Text.RegularExpressions.Regex</b> object». Один Regex → <code>IsMatch</code>/<code>Match</code>/<code>Matches</code>/<code>Replace</code>. <code>Match</code> несёт <code>Value</code>/<code>Index</code>/<code>Groups</code> (замер: IsMatch=True, Value=555-1234).' },
    { icon: "cost", k: "Interpreter vs Compiled", v: '<code>new Regex(...)</code> → «the <b>interpreter is the default engine</b>» (opcodes). <code>RegexOptions.Compiled</code> → «reflection-emit… into <b>IL</b>… DynamicMethod» — «fundamental tradeoff» (дорогой старт, быстрый матч). Результат тот же (замер: Count 3).' },
    { icon: "avoid", k: "GeneratedRegex = compile-time", v: '«use <b>source-generated</b>… instead of… <code>RegexOptions.Compiled</code>… start faster, run more quickly, and be more <b>trimmable</b>». <code>[GeneratedRegex]</code> генерит код на билде. Source-gen не бежит в песочнице — доказан концептуально, поведение снято на Compiled.' },
  ],

  foot: 'урок · <b>Regex: движок, Compiled, GeneratedRegex</b> · 5 анимир. разборов · три engine · панель Compiled=тот же результат · дизайн <b>mid</b>',
};
