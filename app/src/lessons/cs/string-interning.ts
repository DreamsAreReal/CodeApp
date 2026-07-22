/**
 * Lesson: String interning (CS.S12.string-interning) — expert density, 5 animated deep-dives.
 * The intern pool is a runtime table holding ONE reference per unique string value. Two equal
 * string LITERALS resolve to the same reference; a string BUILT at runtime is a distinct object
 * with an equal value but a DIFFERENT reference — until String.Intern hands back the pooled one.
 * This is the STRING-IDENTITY angle (ReferenceEquals vs ==), complementing S1's reference types.
 *
 * SIGNATURE machine panel (s5): object.ReferenceEquals on a literal vs a runtime-built copy is
 * False; feed the copy through String.Intern and ReferenceEquals becomes True. REAL run-csharp
 * measurement (this file's exec cards): c1 "True\nFalse\nTrue" (literals share, built differs,
 * Intern re-unifies) · c2 "True\nTrue\n1000-runtime" (IsInterned: literal found, runtime value
 * not) · c3 "False\nTrue" (built copy differs then Intern == literal).
 *
 * Accuracy contract (G4/G7/G8) — verified against learn.microsoft.com/.../api/system.string.intern
 * and .../system.string.isinterned (dotnet-api-docs String.xml, substring-checked 2026-07-22):
 *   - every English quote is VERBATIM from the Intern/IsInterned Remarks + returns;
 *   - the reference-identity FACTS are OWN DETERMINISTIC run-csharp measurements (this file's exec
 *     cards), presented as such and PROVEN by them, never faked;
 *   - every card verify.expect is the REAL stdout of run-csharp: c1 "True\nFalse\nTrue" · c2
 *     "True\nTrue\n1000-runtime" · c3 "False\nTrue".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S12.string-interning/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the intern pool — one reference per unique value.
const Z_POOL: Zone = { id: "pool", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "INTERN POOL", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "1 ссылка на значение", subCls: "vz-zsub heap", subY: 47 };
const Z_VARS: Zone = { id: "vars", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ПЕРЕМЕННЫЕ", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "a, b на один объект", subCls: "vz-zsub", subY: 47 };
const POOL_ZONES: Zone[] = [Z_POOL, Z_VARS];

// s2: two equal literals -> same reference (True).
const Z_LITS: Zone = { id: "lits", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ДВА ЛИТЕРАЛА", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: 'a="x", b="x"', subCls: "vz-zsub", subY: 47 };
const Z_ONE: Zone = { id: "one", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ОДИН объект", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "ReferenceEquals = True", subCls: "vz-zsub good", subY: 47 };
const LIT_ZONES: Zone[] = [Z_LITS, Z_ONE];

// s3: a runtime-built equal string -> different reference (False).
const Z_LIT: Zone = { id: "lit", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ЛИТЕРАЛ (в пуле)", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "a", subCls: "vz-zsub good", subY: 47 };
const Z_BUILT: Zone = { id: "built", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ПОСТРОЕН В РАНТАЙМЕ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "c — другой объект", subCls: "vz-zsub heap", subY: 47 };
const BUILT_ZONES: Zone[] = [Z_LIT, Z_BUILT];

// s4: Intern re-unifies; IsInterned probes without adding.
const Z_INTERN: Zone = { id: "intern", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "String.Intern", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "вернёт ссылку из пула", subCls: "vz-zsub", subY: 47 };
const Z_ISI: Zone = { id: "isi", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "String.IsInterned", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "нет в пуле → null", subCls: "vz-zsub", subY: 47 };
const PROBE_ZONES: Zone[] = [Z_INTERN, Z_ISI];

// s5 (SIGNATURE): ReferenceEquals before/after Intern (False -> True), measured.
const Z_PRE: Zone = { id: "pre", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ДО Intern", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "x литерал · y построен", subCls: "vz-zsub", subY: 47 };
const Z_POST: Zone = { id: "post", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ПОСЛЕ Intern", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "z = ссылка из пула", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_PRE, Z_POST];

export const stringInterning: LessonData = {
  id: "CS.S12.string-interning",
  track: "CS",
  section: "CS.S12",
  module: "S12.2",
  lang: "csharp",
  title: "Интернирование: пул из одной ссылки на значение",
  kicker: "C# вглубь · S12 · intern pool",
  home: { subtitle: "intern pool, литералы = один ref, String.Intern/IsInterned, ReferenceEquals", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-intern", kind: "doc", org: "Microsoft Learn", title: "String.Intern(String) Method", url: "https://learn.microsoft.com/en-us/dotnet/api/system.string.intern", date: "2025-07-01" },
    { id: "ms-isinterned", kind: "doc", org: "Microsoft Learn", title: "String.IsInterned(String) Method", url: "https://learn.microsoft.com/en-us/dotnet/api/system.string.isinterned", date: "2025-07-01" },
  ],

  spec: [
    { text: "«The common language runtime maintains a table, called the intern pool, that holds a single reference for each unique string value.» <span class=\"ru-tr\">«Среда CLR поддерживает таблицу, называемую пулом интернирования, которая держит одну ссылку на каждое уникальное строковое значение.»</span>", source: "ms-intern" },
  ],
  edgeCases: [
    { text: "Два равных <b>литерала</b> ссылаются на один объект в пуле: «each variable is set to reference the <span class=\"hl\">same constant in the intern pool</span> instead of referencing several different instances of String that have identical values». <span class=\"ru-tr\">«каждая переменная указывает на одну и ту же константу в пуле интернирования, а не на несколько разных экземпляров String с одинаковыми значениями».</span> Собственный прогон: <code>ReferenceEquals</code> двух литералов = <code>True</code>.", source: "ms-isinterned" },
    { text: "<code>String.Intern</code> возвращает ссылку из пула: «The system's reference to <code>str</code>, if it is interned; otherwise, a new reference to a string with the value of <code>str</code>». <span class=\"ru-tr\">«Системная ссылка на <code>str</code>, если он интернирован; иначе — новая ссылка на строку со значением <code>str</code>».</span> Собственный прогон: построенная копия ≠ литерал (<code>False</code>), но <code>Intern(copy)</code> == литерал (<code>True</code>).", source: "ms-intern" },
    { text: "<code>String.IsInterned</code> только <b>проверяет</b>, не добавляя: «If <code>str</code> has already been interned, a reference to that instance is returned; otherwise, <code>null</code> is returned». <span class=\"ru-tr\">«Если <code>str</code> уже интернирован, возвращается ссылка на этот экземпляр; иначе возвращается <code>null</code>».</span> Собственный прогон: значение, собранное в рантайме, не в пуле → <code>null</code>.", source: "ms-isinterned" },
    { text: "Автоинтернирование литералов <b>не гарантировано</b>: «automatic interning of string literals isn't guaranteed—depending on how the assembly was compiled and executed, some literals might not be added to the pool». <span class=\"ru-tr\">«автоматическое интернирование строковых литералов не гарантировано — в зависимости от того, как сборка была скомпилирована и выполнена, некоторые литералы могут не быть добавлены в пул».</span>", source: "ms-intern" },
  ],

  misconceptions: [
    {
      wrong: "любые две строки с одинаковым значением — это один и тот же объект в памяти (== и ReferenceEquals для строк всегда совпадают)",
      hook: 'Нет — <code>==</code> у строк сравнивает <b>значение</b>, а <code>ReferenceEquals</code> — <b>идентичность объекта</b>, и они расходятся. Общий объект гарантирован только для того, что попало в <span class="hl">пул интернирования</span>: «The common language runtime maintains a table, called the <b>intern pool</b>, that holds a <span class="hl">single reference for each unique string value</span>». <span class="ru-tr">«Среда CLR поддерживает таблицу, называемую <b>пулом интернирования</b>, которая держит одну ссылку на каждое уникальное строковое значение».</span> Два равных <b>литерала</b> действительно указывают на один объект: «each variable is set to reference the <b>same constant in the intern pool</b>». <span class="ru-tr">«каждая переменная указывает на одну и ту же <b>константу в пуле интернирования</b>».</span> А вот строка, <b>собранная в рантайме</b> (конкатенация переменных, <code>new string(chars)</code>), — это <b>отдельный</b> объект с равным значением, но другой ссылкой; в пул она не попадает, пока ты явно не позовёшь <code>String.Intern</code>. И даже автоинтернирование литералов «isn\'t guaranteed» <span class="ru-tr">(не гарантировано)</span> — зависит от того, как собрана и запущена сборка. Дальше <b>пять разборов</b>: что такое пул, два литерала = один ref, построенная копия = другой ref, <code>Intern</code> vs <code>IsInterned</code>, и <b>машинная панель</b> — <code>ReferenceEquals</code> до/после <code>Intern</code> (реальный прогон: <code>False</code> → <code>True</code>).',
      source: ["ms-intern", "ms-isinterned"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Что такое intern pool", title: "Таблица: одна ссылка на каждое уникальное значение",
      viewBox: "0 0 340 210", zones: POOL_ZONES,
      code: ["// CLR держит таблицу — intern pool", "string a = \"hi\";   // \"hi\" кладётся в пул", "string b = \"hi\";   // b берёт ТУ ЖЕ ссылку из пула"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Рантайм держит таблицу — <span class="hl">intern pool</span>: по <b>одной ссылке</b> на каждое уникальное строковое значение.', nodes: [{ id: "p", kind: "obj", at: { zone: "pool", row: 0 }, typeTag: "intern pool", value: '"hi"', accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Литерал <code>"hi"</code> кладётся в пул (или уже там). <code>a</code> ссылается на <b>объект из пула</b>.', nodes: [{ id: "p", kind: "obj", at: { zone: "pool", row: 0 }, typeTag: "intern pool", value: '"hi"' }, { id: "a", kind: "ref", at: { zone: "vars", row: 0 }, name: "a", accent: true }], edges: [{ id: "ea", from: "a", to: "p", accent: true }] },
        { codeLine: 2, out: "", caption: '<code>b = "hi"</code> не создаёт новый объект — берёт <span class="hl">ту же ссылку</span> из пула. <code>a</code> и <code>b</code> — один объект.', nodes: [{ id: "p", kind: "obj", at: { zone: "pool", row: 0 }, typeTag: "intern pool", value: '"hi"' }, { id: "a", kind: "ref", at: { zone: "vars", row: 0 }, name: "a" }, { id: "b", kind: "ref", at: { zone: "vars", row: 1 }, name: "b", accent: true }], edges: [{ id: "ea", from: "a", to: "p" }, { id: "eb", from: "b", to: "p", accent: true }] },
      ],
      explain: 'Основа урока: «The common language runtime maintains a table, called the <b>intern pool</b>, that holds a <span class="hl">single reference for each unique string value</span>». <span class="ru-tr">(среда CLR поддерживает таблицу — пул интернирования, — которая держит одну ссылку на каждое уникальное строковое значение).</span> Зачем: «The intern pool <b>conserves string storage</b>. If you assign a literal string constant to several variables, each variable is set to reference the <b>same constant in the intern pool</b> instead of referencing several different instances of String that have identical values». <span class="ru-tr">(пул экономит память под строки; при присваивании литеральной константы нескольким переменным каждая ссылается на одну константу в пуле, а не на разные экземпляры с одинаковым значением).</span> Практический смысл: равные литералы бесплатно дедуплицируются, что и делает <code>ReferenceEquals</code> для литералов истинным.',
      sources: ["ms-intern", "ms-isinterned"],
    },
    {
      id: "s2", num: "02", kicker: "Два литерала · один ref", title: "Равные литералы указывают на один объект",
      viewBox: "0 0 340 210", zones: LIT_ZONES,
      code: ["string a = \"hello world\";", "string b = \"hello world\";", "Console.WriteLine(object.ReferenceEquals(a, b));  // True"],
      predictAt: 1, predictQ: 'Два литерала с одинаковым текстом. Что напечатает <code>object.ReferenceEquals(a, b)</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>a = "hello world"</code> — значение в пуле, <code>a</code> ссылается на него.', nodes: [{ id: "a", kind: "ref", at: { zone: "lits", row: 0 }, name: "a", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>b = "hello world"</code> — тот же текст, значит <span class="hl">та же</span> ссылка из пула, а не новый объект.', nodes: [{ id: "a", kind: "ref", at: { zone: "lits", row: 0 }, name: "a" }, { id: "b", kind: "ref", at: { zone: "lits", row: 1 }, name: "b", accent: true }], edges: [] },
        { codeLine: 2, out: "True", caption: 'Панель: <span class="hl">True</span> (реальный прогон) — <code>a</code> и <code>b</code> это <b>один объект</b>, поэтому <code>ReferenceEquals</code> = <code>True</code>.', nodes: [{ id: "g", kind: "gate", at: { zone: "one", row: 0 }, state: "ok", label: "ReferenceEquals(a,b)", detail: "True — один объект", accent: true }], edges: [] },
      ],
      explain: 'Первое следствие пула: два равных <b>литерала</b> — это один объект. «If you assign a literal string constant to several variables, each variable is set to reference the <b>same constant in the intern pool</b>». <span class="ru-tr">(при присваивании литеральной константы нескольким переменным каждая ссылается на ту же константу в пуле).</span> Поэтому <code>object.ReferenceEquals(a, b)</code> для двух одинаковых литералов — <code>True</code> (собственный прогон). Тонкость для сеньора: это верно для <b>литералов</b> и compile-time-констант; строки, чьё значение вычисляется в рантайме, под эту гарантию не подпадают — как раз следующий разбор.',
      sources: ["ms-isinterned"],
    },
    {
      id: "s3", num: "03", kicker: "Построена в рантайме · другой ref", title: "Равное значение, но новый объект — не в пуле",
      viewBox: "0 0 340 210", zones: BUILT_ZONES,
      code: ["string a = \"hello world\";", "string c = new string(\"hello world\".ToCharArray());  // построена", "Console.WriteLine(object.ReferenceEquals(a, c));  // False"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>a</code> — литерал, ссылается на объект <b>в пуле</b>.', nodes: [{ id: "a", kind: "obj", at: { zone: "lit", row: 0 }, typeTag: "a (литерал)", value: '"hello world"', accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>c = new string(...)</code> строит <span class="hl">новый</span> объект в куче. Значение равно, но объект <b>другой</b>, и в пул он не добавлен.', nodes: [{ id: "a", kind: "obj", at: { zone: "lit", row: 0 }, typeTag: "a (литерал)", value: '"hello world"' }, { id: "c", kind: "obj", at: { zone: "built", row: 0 }, typeTag: "c (построена)", value: '"hello world"', accent: true }], edges: [] },
        { codeLine: 2, out: "False", caption: 'Панель: <span class="hl">False</span> (реальный прогон) — <code>a</code> и <code>c</code> это <b>разные</b> объекты. <code>==</code> дал бы <code>True</code> (равные значения), но <code>ReferenceEquals</code> = <code>False</code>.', nodes: [{ id: "g", kind: "gate", at: { zone: "built", row: 0 }, state: "fail", label: "ReferenceEquals(a,c)", detail: "False — разные объекты", accent: true }], edges: [] },
      ],
      explain: 'Второе следствие: строка, <b>собранная в рантайме</b> (<code>new string(chars)</code>, конкатенация переменных, чтение из файла), — это отдельный объект с равным значением, но <b>другой</b> ссылкой; в пул она автоматически не попадает. Отсюда расхождение операторов: <code>a == c</code> сравнивает <b>значение</b> (было бы <code>True</code>), а <code>object.ReferenceEquals(a, c)</code> сравнивает <b>идентичность</b> и даёт <code>False</code> (собственный прогон). Это ловушка, если кто-то использует <code>ReferenceEquals</code> (или <code>(object)a == (object)c</code>) в расчёте на равенство строк — для нелитералов это ломается. Чтобы вернуть общий объект, значение нужно <b>явно</b> прогнать через <code>String.Intern</code> — следующий разбор.',
      sources: ["ms-intern"],
    },
    {
      id: "s4", num: "04", kicker: "Intern vs IsInterned", title: "Intern добавляет и возвращает; IsInterned только проверяет",
      viewBox: "0 0 340 210", zones: PROBE_ZONES,
      code: ["string z = string.Intern(c);       // вернёт ссылку из пула (добавит, если надо)", "string.IsInterned(lit);            // literal → ссылка (не null)", "string.IsInterned(runtimeBuilt);   // не в пуле → null"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>String.Intern(c)</code> ищет в пуле строку, равную <code>c</code>. Нашёл — вернёт <b>её</b> ссылку; нет — <span class="hl">добавит</span> и вернёт.', nodes: [{ id: "in", kind: "gate", at: { zone: "intern", row: 0 }, state: "ok", label: "Intern(c)", detail: "ссылка из пула", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>IsInterned(lit)</code> для литерала — <b>не</b> null: значение уже в пуле, метод вернёт его ссылку. Но пул <span class="hl">не меняет</span>.', nodes: [{ id: "in", kind: "gate", at: { zone: "intern", row: 0 }, state: "ok", label: "Intern(c)", detail: "ссылка из пула" }, { id: "y", kind: "gate", at: { zone: "isi", row: 0 }, state: "ok", label: "IsInterned(lit)", detail: "≠ null", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>IsInterned(runtimeBuilt)</code> для значения, собранного в рантайме, — <span class="hl">null</span>: его нет в пуле, а <code>IsInterned</code> ничего <b>не добавляет</b>.', nodes: [{ id: "y", kind: "gate", at: { zone: "isi", row: 0, col: 0 }, state: "ok", label: "IsInterned(lit)", detail: "≠ null" }, { id: "n", kind: "gate", at: { zone: "isi", row: 0, col: 1 }, state: "fail", label: "IsInterned(built)", detail: "null", accent: true }], edges: [] },
      ],
      explain: 'Два метода делят одну ответственность на «изменить пул» и «только заглянуть». <code>String.Intern</code>: «The <b>Intern</b> method uses the intern pool to search for a string equal to the value of <code>str</code>. If no such string exists, a reference to <code>str</code> is <b>added to the pool</b>, and that reference is returned». <span class="ru-tr">(метод Intern ищет в пуле строку, равную значению str; если такой нет — ссылка на str добавляется в пул и возвращается).</span> Его результат — «The system\'s reference to <code>str</code>, if it is interned; otherwise, a new reference to a string with the value of <code>str</code>». <span class="ru-tr">(системная ссылка на str, если он интернирован; иначе новая ссылка на строку с значением str).</span> <code>String.IsInterned</code> — <b>только проверка</b>: «If <code>str</code> has already been interned, a reference to that instance is returned; <span class="hl">otherwise, null is returned</span>». <span class="ru-tr">(если str уже интернирован — возвращается ссылка на этот экземпляр; иначе — null).</span> Собственный прогон подтверждает: <code>IsInterned</code> находит литерал и не находит рантайм-значение.',
      sources: ["ms-intern", "ms-isinterned"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · ReferenceEquals до/после Intern", title: "Intern превращает False в True",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["string x = \"abc123\";", "string y = new string(new[]{'a','b','c','1','2','3'});", "Console.WriteLine(object.ReferenceEquals(x, y));   // ДО: False",
        "string z = string.Intern(y);", "Console.WriteLine(object.ReferenceEquals(x, z));   // ПОСЛЕ: True"],
      predictAt: 2, predictQ: '<code>x</code> — литерал, <code>y</code> — построена (<code>new string</code>) с тем же текстом. Что даст <code>ReferenceEquals(x, y)</code>, а затем <code>ReferenceEquals(x, string.Intern(y))</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>x</code> — литерал в пуле; <code>y</code> — <span class="hl">построена</span> из массива char. Значения равны, объекты разные.', nodes: [{ id: "x", kind: "obj", at: { zone: "pre", row: 0 }, typeTag: "x (пул)", value: '"abc123"', accent: true }, { id: "y", kind: "obj", at: { zone: "pre", row: 1 }, typeTag: "y (построена)", value: '"abc123"' }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>ReferenceEquals(x, y)</code> = <b>False</b>: <code>y</code> не в пуле, это отдельный объект.', nodes: [{ id: "g1", kind: "gate", at: { zone: "pre", row: 0 }, state: "fail", label: "ReferenceEquals(x,y)", detail: "False", accent: true }], edges: [] },
        { codeLine: 4, out: "False\nTrue", caption: 'Панель: <span class="hl">False / True</span> (реальный прогон) — <code>Intern(y)</code> вернул <b>ссылку из пула</b> (== <code>x</code>), поэтому <code>ReferenceEquals(x, z)</code> = <code>True</code>.', nodes: [{ id: "g1", kind: "gate", at: { zone: "pre", row: 0 }, state: "fail", label: "до", detail: "False" }, { id: "g2", kind: "gate", at: { zone: "post", row: 0 }, state: "ok", label: "после Intern", detail: "True", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — снятая через идентичность объектов до и после интернирования. <code>x</code> — литерал (в пуле), <code>y</code> — построена <code>new string(...)</code> с тем же значением, но это <b>другой</b> объект: <code>ReferenceEquals(x, y)</code> = <code>False</code>. Затем <code>String.Intern(y)</code> «uses the intern pool to search for a string equal to the value of <code>str</code>» <span class="ru-tr">(ищет в пуле строку, равную значению str)</span> — находит там значение <code>x</code> и возвращает <b>его</b> ссылку. Поэтому <code>ReferenceEquals(x, z)</code> = <code>True</code> (реальный вывод сниппета: <code>False</code>, затем <code>True</code>). Вывод для сеньора: интернирование <b>дедуплицирует</b> одинаковые значения до одной ссылки — полезно при массе повторяющихся строк (токены, ключи), но помни про издержки: интернированные строки живут до конца процесса, и чтобы интернировать строку, её сначала нужно <b>создать</b>.',
      sources: ["ms-intern"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>string a = "hello world"; string b = "hello world"; string c = new string("hello world".ToCharArray());</code><br/><code>Console.WriteLine(object.ReferenceEquals(a, b)); Console.WriteLine(object.ReferenceEquals(a, c)); Console.WriteLine(object.ReferenceEquals(a, string.Intern(c)));</code> — все три?',
      options: ["True\\nFalse\\nTrue", "True\\nTrue\\nTrue", "True\\nFalse\\nFalse", "False\\nFalse\\nTrue"], correctIndex: 0, xp: 10,
      okText: 'Литералы <code>a</code>,<code>b</code> — один объект в пуле (<b>True</b>). Построенная <code>c</code> — другой объект (<b>False</b>). <code>Intern(c)</code> вернул ссылку из пула, == <code>a</code> (<b>True</b>).',
      noText: 'Пул держит «single reference for each unique string value». <span class="ru-tr">«одну ссылку на каждое уникальное строковое значение».</span> Литералы совпадают по ссылке, <code>new string</code> — нет, а <code>Intern</code> возвращает пуловую ссылку. Реальный вывод: <b>True / False / True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True\nFalse\nTrue" }, sourceRefs: ["ms-intern", "ms-isinterned"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>string lit = "interned-yes"; string built = 1000 + "-runtime";</code><br/><code>Console.WriteLine(string.IsInterned(lit) != null); Console.WriteLine(string.IsInterned(built) == null); Console.WriteLine(built);</code> — все три?',
      options: ["True\\nTrue\\n1000-runtime", "False\\nFalse\\n1000-runtime", "True\\nFalse\\n1000-runtime", "True\\nTrue\\n-runtime"], correctIndex: 0, xp: 10,
      okText: '<code>IsInterned(lit)</code> находит литерал в пуле → не null (<b>True</b>). Значение <code>built</code> собрано в рантайме, его нет в пуле → <code>IsInterned</code> = null (<b>True</b>). <code>built</code> = <b>1000-runtime</b>.',
      noText: '«otherwise, null is returned» <span class="ru-tr">«иначе возвращается null»</span>: <code>IsInterned</code> только проверяет. Литерал в пуле, рантайм-значение нет. Реальный вывод: <b>True / True / 1000-runtime</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True\nTrue\n1000-runtime" }, sourceRefs: ["ms-isinterned"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>string x = "abc123"; string y = new string(new[]{\'a\',\'b\',\'c\',\'1\',\'2\',\'3\'});</code><br/><code>Console.WriteLine(object.ReferenceEquals(x, y)); string z = string.Intern(y); Console.WriteLine(object.ReferenceEquals(x, z));</code> — обе строки?',
      options: ["False\\nTrue", "True\\nTrue", "False\\nFalse", "True\\nFalse"], correctIndex: 0, xp: 10,
      okText: 'Построенная <code>y</code> ≠ литерал <code>x</code> по ссылке (<b>False</b>). <code>Intern(y)</code> вернул <span class="hl">ссылку из пула</span> — ту же, что у <code>x</code>: <code>ReferenceEquals(x, z)</code> = <b>True</b>.',
      noText: '<code>new string</code> — отдельный объект (False). <code>Intern</code> «search for a string equal to the value of str» <span class="ru-tr">«ищет в пуле строку, равную значению str»</span> и вернул пуловую ссылку == <code>x</code>. Реальный вывод: <b>False / True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "False\nTrue" }, sourceRefs: ["ms-intern"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Пул = 1 ref/значение", v: '«a table, called the <b>intern pool</b>, that holds a single reference for each unique string value». <span class="ru-tr">(таблица — пул интернирования — держит одну ссылку на каждое уникальное значение).</span> Равные литералы дедуплицируются в один объект.' },
    { icon: "cost", k: "Литерал ≠ построенная", v: 'Два литерала → один ref (<code>ReferenceEquals</code>=True). Строка из рантайма (<code>new string</code>, конкатенация) → <b>другой</b> объект (False), пока не позовёшь <code>String.Intern</code>. <code>==</code> (значение) и <code>ReferenceEquals</code> (идентичность) расходятся.' },
    { icon: "avoid", k: "Intern vs IsInterned", v: '<code>Intern</code> добавляет и возвращает пуловую ссылку; <code>IsInterned</code> «otherwise, null is returned» <span class="ru-tr">(иначе — null)</span> — только проверяет. Интернированные строки живут до конца процесса; интернируй с умом.' },
  ],

  foot: 'урок · <b>интернирование строк</b> · 5 анимир. разборов · intern pool · панель ReferenceEquals до/после Intern · дизайн <b>mid</b>',
};
