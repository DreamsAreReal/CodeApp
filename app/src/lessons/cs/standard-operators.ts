/**
 * Lesson: Standard query operators — filter / project / group / join (CS.S3.standard-operators) —
 * expert density, 5 animated deep-dives + a machine panel. The map a senior needs: the standard
 * query operators are the METHODS (and their query keywords) that form the LINQ pattern, defined
 * as extension members whose receiver is IEnumerable<T> or IQueryable<T>. They fall into families:
 * filtering (Where), projection (Select/SelectMany), grouping (GroupBy), joining (Join), ordering
 * (OrderBy). The output of one operator is the input of the next — that is what makes queries
 * composable.
 *
 * SIGNATURE machine panel (s5): Join's output ORDER is deterministic — it preserves the OUTER
 * sequence order, then the matching inner elements. A real run-csharp measurement:
 * Ann->Eng, Cy->Eng, Bob->Math (outer = departments {Eng,Math}). See
 * docs/evidence/S3/L3-standard-operators.txt.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from
 *     learn.microsoft.com/.../csharp/linq/standard-query-operators/ (fetch 2026-07-21);
 *   - every card's verify.expect is the REAL stdout of run-csharp on :5101
 *     (evidence/S3/L3-standard-operators.txt: "9,16,25,36"; "3:2 5:2"; "Ann->Eng,Cy->Eng,Bob->Math").
 *
 * Loop: cards c1..c3 map to backend review items `CS.S3.standard-operators/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: operators are extension methods on IEnumerable<T> / IQueryable<T>.
const Z_RECV: Zone = { id: "recv", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "RECEIVER", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "IEnumerable<T> / IQueryable<T>", subCls: "vz-zsub good", subY: 47 };
const Z_OPS: Zone = { id: "ops", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ОПЕРАТОРЫ", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "extension-методы LINQ", subCls: "vz-zsub", subY: 47 };
const OPS_ZONES: Zone[] = [Z_RECV, Z_OPS];

// s2/s3/s4: a source lane on the left, the operator's output lane on the right.
const Z_IN: Zone = { id: "in", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ВХОД", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "исходная последовательность", subCls: "vz-zsub", subY: 47 };
const Z_OUT: Zone = { id: "out", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ВЫХОД", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "новая последовательность", subCls: "vz-zsub good", subY: 47 };
const IO_ZONES: Zone[] = [Z_IN, Z_OUT];

// s5 (SIGNATURE): Join — outer preserved, matched inner appended, deterministic order.
const Z_OUTER: Zone = { id: "outer", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "OUTER · departments", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "Eng · Math (порядок)", subCls: "vz-zsub", subY: 47 };
const Z_JOINED: Zone = { id: "joined", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "JOIN · результат", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "outer-порядок сохранён", subCls: "vz-zsub good", subY: 47 };
const JOIN_ZONES: Zone[] = [Z_OUTER, Z_JOINED];

export const standardOperators: LessonData = {
  id: "CS.S3.standard-operators",
  track: "CS",
  section: "CS.S3",
  module: "S3.3",
  lang: "csharp",
  title: "Стандартные операторы: Where, Select, GroupBy, Join",
  kicker: "C# вглубь · S3 · семейства операторов",
  home: { subtitle: "фильтр/проекция/группировка/join, extension-методы, композиция", icon: "collections", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-sqo", kind: "doc", org: "Microsoft Learn", title: "Standard query operators overview — C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/", date: "2025-12-01" },
    { id: "ms-intro", kind: "doc", org: "Microsoft Learn", title: "Introduction to LINQ Queries — C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/get-started/introduction-to-linq-queries", date: "2024-04-22" },
  ],

  spec: [
    { text: "«The standard query operators are the keywords and methods that form the LINQ pattern.» <span class=\"ru-tr\">«Стандартные операторы запросов — это ключевые слова и методы, образующие паттерн LINQ.»</span>", source: "ms-sqo" },
  ],
  edgeCases: [
    { text: "Операторы — <b>extension-члены</b>: «The methods that make up each set are <span class=\"hl\">extension members</span> defined in the <code>Enumerable</code> and <code>Queryable</code> classes… where the receiver type is either the <code>IEnumerable&lt;T&gt;</code> or <code>IQueryable&lt;T&gt;</code> type». <span class=\"ru-tr\">«Методы, образующие каждый набор, — это extension-члены, определённые в классах <code>Enumerable</code> и <code>Queryable</code>… где тип получателя — это либо <code>IEnumerable&lt;T&gt;</code>, либо <code>IQueryable&lt;T&gt;</code>.»</span>", source: "ms-sqo" },
    { text: "Тайминг зависит от типа возврата: «Those methods that return a singleton value (such as <code>Average</code> and <code>Sum</code>) <span class=\"hl\">execute immediately</span>. Methods that return a sequence <b>defer</b> the query execution and return an enumerable object». <span class=\"ru-tr\">«Те методы, что возвращают одиночное значение (такие как <code>Average</code> и <code>Sum</code>), выполняются немедленно. Методы, возвращающие последовательность, <b>откладывают</b> выполнение запроса и возвращают перечислимый объект.»</span>", source: "ms-sqo" },
    { text: "Композиция: «You can use the output sequence of one query as the <span class=\"hl\">input sequence to another query</span>. You chain query methods together in one query, which enables queries to become arbitrarily complex». <span class=\"ru-tr\">«Выходную последовательность одного запроса можно использовать как входную последовательность для другого запроса. Методы запросов сцепляются в один запрос, что позволяет запросам становиться сколь угодно сложными.»</span>", source: "ms-sqo" },
  ],

  misconceptions: [
    {
      wrong: "Where/Select/GroupBy/Join — встроенные конструкции языка, как for или if",
      hook: 'Заблуждение: <span class="wrong"><code>Where/Select/GroupBy/Join</code> — это языковые конструкции</span>, часть синтаксиса C#. На деле это <b>обычные методы</b> — «The standard query operators are the <span class="hl">keywords and methods</span> that form the LINQ pattern» <span class="ru-tr">«Стандартные операторы запросов — это ключевые слова и методы, образующие паттерн LINQ»</span> — extension-члены на <code>IEnumerable&lt;T&gt;</code>/<code>IQueryable&lt;T&gt;</code>. Они делятся на семейства: фильтр, проекция, группировка, join, сортировка; выход одного — вход следующего. Ниже <b>пять разборов</b>: операторы как extension-методы, фильтр→проекция, группировка, и <b>машинная панель</b> — детерминированный порядок <code>Join</code>: outer сохраняется, затем совпавшие inner (реальный прогон: <b>Ann→Eng, Cy→Eng, Bob→Math</b>).',
      source: "ms-sqo",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Операторы = extension-методы", title: "Where/Select/GroupBy — методы на IEnumerable<T>",
      viewBox: "0 0 340 210", zones: OPS_ZONES,
      code: ["// эти вызовы — extension-методы из System.Linq:", "seq.Where(...)      // фильтрация", "seq.Select(...)     // проекция", "seq.GroupBy(...)    // группировка", "seq.Join(...)       // соединение"],
      scenes: [
        { codeLine: 0, caption: 'Ресивер операторов — <span class="hl">IEnumerable&lt;T&gt;</span> (in-memory) или <code>IQueryable&lt;T&gt;</code> (провайдер). Любая последовательность получает всю палитру LINQ.', nodes: [{ id: "r", kind: "obj", at: { zone: "recv", row: 0 }, typeTag: "IEnumerable<T>", value: "seq", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Операторы «висят» на ресивере как <b>extension-члены</b> из <code>Enumerable</code>/<code>Queryable</code> — не встроены в язык.', nodes: [{ id: "r", kind: "obj", at: { zone: "recv", row: 0 }, typeTag: "IEnumerable<T>", value: "seq" }, { id: "w", kind: "chip", at: { zone: "ops", row: 0 }, value: "Where · фильтр", accent: true }], edges: [{ id: "e1", from: "r", to: "w" }] },
        { codeLine: 3, caption: 'Семейства: <span class="hl">фильтр, проекция, группировка, join, сортировка</span>. Каждое — набор методов на том же ресивере.', nodes: [{ id: "r", kind: "obj", at: { zone: "recv", row: 0 }, typeTag: "IEnumerable<T>", value: "seq" }, { id: "w", kind: "chip", at: { zone: "ops", row: 0 }, value: "Where · Select" }, { id: "g", kind: "chip", at: { zone: "ops", row: 1 }, value: "GroupBy · Join", accent: true }], edges: [{ id: "e1", from: "r", to: "w" }, { id: "e2", from: "r", to: "g", accent: true }] },
      ],
      explain: 'Что такое стандартные операторы — дословно: «The standard query operators are the <span class="hl">keywords and methods that form the LINQ pattern</span>… The methods that make up each set are <b>extension members</b> defined in the <code>Enumerable</code> and <code>Queryable</code> classes, respectively. They\'re defined as extension members where the <b>receiver type is either the <code>IEnumerable&lt;T&gt;</code> or <code>IQueryable&lt;T&gt;</code></b> type that they operate on». <span class="ru-tr">«Стандартные операторы запросов — это ключевые слова и методы, образующие паттерн LINQ… Методы, составляющие каждый набор, — это <b>extension-члены</b>, определённые в классах <code>Enumerable</code> и <code>Queryable</code> соответственно. Они определены как extension-члены, где <b>тип получателя — это либо <code>IEnumerable&lt;T&gt;</code>, либо <code>IQueryable&lt;T&gt;</code></b> тип, над которым они работают.»</span> То есть <code>Where/Select/GroupBy/Join</code> — не синтаксис языка, а библиотечные методы, подцепляемые через <code>using System.Linq</code>. Отсюда их универсальность: любой тип, реализующий <code>IEnumerable&lt;T&gt;</code>, мгновенно получает весь набор.',
      sources: ["ms-sqo"],
    },
    {
      id: "s2", num: "02", kicker: "Фильтр → проекция", title: "Where отбирает, Select преобразует",
      viewBox: "0 0 340 210", zones: IO_ZONES,
      code: ["int[] n = [1,2,3,4,5,6];", "var r = n.Where(x => x > 2)   // фильтр: {3,4,5,6}", "         .Select(x => x * x); // проекция: {9,16,25,36}"],
      scenes: [
        { codeLine: 1, caption: '<code>Where(x =&gt; x &gt; 2)</code> — <span class="hl">фильтр</span>: пропускает только элементы, где предикат истинен. Форма элементов не меняется.', nodes: [{ id: "src", kind: "obj", at: { zone: "in", row: 0 }, typeTag: "n", value: "1..6" }, { id: "f", kind: "obj", at: { zone: "out", row: 0 }, typeTag: "Where >2", value: "3,4,5,6", accent: true }], edges: [{ id: "e", from: "src", to: "f", accent: true }] },
        { codeLine: 2, caption: '<code>Select(x =&gt; x*x)</code> — <b>проекция</b>: преобразует каждый элемент в новую форму (тут — квадрат).', nodes: [{ id: "f", kind: "obj", at: { zone: "in", row: 0 }, typeTag: "после Where", value: "3,4,5,6" }, { id: "p", kind: "obj", at: { zone: "out", row: 0 }, typeTag: "Select x*x", value: "9,16,25,36", accent: true }], edges: [{ id: "e", from: "f", to: "p", accent: true }] },
        { codeLine: 2, caption: 'Выход <code>Where</code> — <span class="hl">вход</span> <code>Select</code>: операторы <b>композируются</b> в конвейер. Результат — <b>9,16,25,36</b> (реальный прогон).', nodes: [{ id: "f", kind: "obj", at: { zone: "in", row: 0 }, typeTag: "Where", value: "3,4,5,6" }, { id: "p", kind: "obj", at: { zone: "out", row: 0 }, typeTag: "результат", value: "9,16,25,36", accent: true }], edges: [{ id: "e", from: "f", to: "p" }] },
      ],
      explain: 'Два базовых семейства. <b>Фильтрация</b>: «Filter data using the <code>where</code> keyword». <span class="ru-tr">«Фильтруйте данные с помощью ключевого слова <code>where</code>.»</span> <b>Проекция</b>: «Project data using the <code>select</code> keyword». <span class="ru-tr">«Проецируйте данные с помощью ключевого слова <code>select</code>.»</span> Ключ к их силе — композиция: «You can use the <span class="hl">output sequence of one query as the input sequence to another query</span>. You chain query methods together in one query, which enables queries to become arbitrarily complex». <span class="ru-tr">«Выходную последовательность одного запроса можно использовать как входную последовательность для другого запроса. Методы запросов сцепляются в один запрос, что позволяет запросам становиться сколь угодно сложными.»</span> Поэтому <code>Where(...).Select(...)</code> — конвейер: отфильтровали {3,4,5,6}, спроецировали в квадраты {9,16,25,36}. Каждый оператор возвращает последовательность, к которой цепляется следующий.',
      sources: ["ms-sqo"],
    },
    {
      id: "s3", num: "03", kicker: "Группировка", title: "GroupBy делит на группы по ключу",
      viewBox: "0 0 340 210", zones: IO_ZONES,
      code: ["string[] words = \"the quick brown fox\".Split(\" \");", "var g = words.GroupBy(w => w.Length)      // ключ = длина", "             .OrderBy(x => x.Key)", "             .Select(x => $\"{x.Key}:{x.Count()}\");"],
      scenes: [
        { codeLine: 1, caption: '<code>GroupBy(w =&gt; w.Length)</code> строит группы по <span class="hl">ключу</span> (длине слова): каждый ключ → набор элементов.', nodes: [{ id: "w", kind: "obj", at: { zone: "in", row: 0 }, typeTag: "words", value: "the·quick·brown·fox" }, { id: "g", kind: "obj", at: { zone: "out", row: 0 }, typeTag: "GroupBy len", value: "3→{the,fox}", accent: true }], edges: [{ id: "e", from: "w", to: "g", accent: true }] },
        { codeLine: 2, caption: 'Группа — это <code>IGrouping&lt;Key, T&gt;</code>: у неё есть <code>Key</code> и она сама — <b>последовательность</b> своих элементов.', nodes: [{ id: "g", kind: "obj", at: { zone: "in", row: 0 }, typeTag: "группы", value: "len 3, len 5" }, { id: "k", kind: "obj", at: { zone: "out", row: 0 }, typeTag: "IGrouping", value: "Key + элементы", accent: true }], edges: [{ id: "e", from: "g", to: "k", accent: true }] },
        { codeLine: 3, caption: 'Проекция группы в строку: длина 3 → {the, fox} = 2; длина 5 → {quick, brown} = 2. Результат <b>3:2 5:2</b> (реальный прогон).', nodes: [{ id: "k", kind: "obj", at: { zone: "in", row: 0 }, typeTag: "IGrouping", value: "Key, Count" }, { id: "r", kind: "obj", at: { zone: "out", row: 0 }, typeTag: "результат", value: "3:2 5:2", accent: true }], edges: [{ id: "e", from: "k", to: "r" }] },
      ],
      explain: '<b>Группировка</b> — дословно: «Group data using the <code>group</code> and optionally <code>into</code> keywords» <span class="ru-tr">«Группируйте данные с помощью ключевого слова <code>group</code> и, при необходимости, <code>into</code>.»</span> (метод — <code>GroupBy</code>). Каждая группа — <code>IGrouping&lt;TKey, TElement&gt;</code>: имеет <code>Key</code> и сама перечислима. В примере из доки слова группируются по длине: <code>"the quick brown fox"</code> → длина 3: {the, fox}, длина 5: {quick, brown}. После <code>OrderBy(x =&gt; x.Key)</code> и проекции в <code>"{Key}:{Count}"</code> получаем <b>3:2 5:2</b>. GroupBy — <b>nonstreaming</b> оператор: чтобы построить группы, он обязан прочитать <span class="hl">весь</span> источник (детально о streaming/nonstreaming — урок S3.4).',
      sources: ["ms-sqo", "ms-intro"],
    },
    {
      id: "s4", num: "04", kicker: "Соединение", title: "Join связывает две последовательности по ключу",
      viewBox: "0 0 340 210", zones: IO_ZONES,
      code: ["deps.Join(studs,", "  d => d.Id,        // ключ outer", "  s => s.Dep,       // ключ inner", "  (d, s) => $\"{s.N}->{d.Name}\")  // результат для пары"],
      scenes: [
        { codeLine: 1, caption: '<code>Join</code> берёт <span class="hl">ключ из каждой</span> последовательности: <code>d.Id</code> (outer) и <code>s.Dep</code> (inner). Совпали ключи — пара образуется.', nodes: [{ id: "o", kind: "obj", at: { zone: "in", row: 0 }, typeTag: "outer key", value: "d.Id" }, { id: "i", kind: "obj", at: { zone: "in", row: 1 }, typeTag: "inner key", value: "s.Dep", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Для каждой совпавшей пары вызывается <b>селектор результата</b> <code>(d, s) =&gt; …</code> — формирует элемент выходной последовательности.', nodes: [{ id: "o", kind: "obj", at: { zone: "in", row: 0 }, typeTag: "пара (d,s)", value: "ключи равны" }, { id: "r", kind: "obj", at: { zone: "out", row: 0 }, typeTag: "селектор", value: "s.N->d.Name", accent: true }], edges: [{ id: "e", from: "o", to: "r", accent: true }] },
        { codeLine: 3, caption: 'Это <b>inner join</b>: элементы без совпадения <span class="hl">выпадают</span>. Для «всех outer» нужен <code>GroupJoin</code>/left-join через <code>DefaultIfEmpty</code>.', nodes: [{ id: "r", kind: "obj", at: { zone: "in", row: 0 }, typeTag: "inner join", value: "только совпавшие" }, { id: "d", kind: "chip", at: { zone: "out", row: 0 }, value: "нет пары → выпал", accent: true }], edges: [] },
      ],
      explain: '<b>Соединение</b> — дословно: «Join data using the <code>join</code> keyword» <span class="ru-tr">«Соединяйте данные с помощью ключевого слова <code>join</code>.»</span> (метод — <code>Join</code>). <code>Join</code> сопоставляет две последовательности по <b>равенству ключей</b>: селектор <code>outerKeySelector</code> и <code>innerKeySelector</code> дают ключ каждой стороны, а <code>resultSelector</code> формирует элемент из совпавшей пары. Семантика — <b>inner join</b>: элементы без пары не попадают в результат. Для «сохранить всех outer» есть <code>GroupJoin</code> (в query-синтаксисе — <code>join … into …</code>) и приём left-join через <code>DefaultIfEmpty</code>. Порядок результата — детерминированный, его и снимает машинная панель.',
      sources: ["ms-sqo"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный порядок", title: "Join сохраняет порядок outer, потом совпавшие inner",
      viewBox: "0 0 340 210", zones: JOIN_ZONES,
      code: ["var deps  = [{Id:1,Eng}, {Id:2,Math}];   // OUTER", "var studs = [{Dep:1,Ann}, {Dep:2,Bob}, {Dep:1,Cy}];", "deps.Join(studs, d=>d.Id, s=>s.Dep,", "          (d,s) => $\"{s.N}->{d.Name}\");"],
      predictAt: 2, predictQ: 'В каком порядке выйдут пары? outer = [Eng(1), Math(2)], inner = [Ann(1), Bob(2), Cy(1)].', console: true,
      scenes: [
        { codeLine: 0, caption: 'OUTER — departments в порядке <b>Eng(1), Math(2)</b>. Именно этот порядок <span class="hl">определяет</span> порядок результата.', nodes: [{ id: "e", kind: "obj", at: { zone: "outer", row: 0 }, typeTag: "Eng", value: "Id 1", accent: true }, { id: "m", kind: "obj", at: { zone: "outer", row: 1 }, typeTag: "Math", value: "Id 2" }], edges: [] },
        { codeLine: 2, caption: 'Для Eng(1) собираются <b>все совпавшие</b> inner в их порядке: Ann(1), затем Cy(1). Обе идут раньше Math.', nodes: [{ id: "e", kind: "obj", at: { zone: "outer", row: 0 }, typeTag: "Eng", value: "Id 1", accent: true }, { id: "a", kind: "chip", at: { zone: "joined", row: 0 }, value: "Ann->Eng" }, { id: "c", kind: "chip", at: { zone: "joined", row: 1 }, value: "Cy->Eng", accent: true }], edges: [{ id: "e1", from: "e", to: "a" }] },
        { codeLine: 3, out: "Ann->Eng,Cy->Eng,Bob->Math", caption: 'Затем Math(2) → Bob(2). Итог <span class="hl">детерминирован</span>: <b>Ann→Eng, Cy→Eng, Bob→Math</b> — outer-порядок сохранён (реальный прогон).', nodes: [{ id: "m", kind: "obj", at: { zone: "outer", row: 0 }, typeTag: "Math", value: "Id 2", accent: true }, { id: "b", kind: "chip", at: { zone: "joined", row: 0 }, value: "Bob->Math", accent: true }], edges: [{ id: "e2", from: "m", to: "b" }] },
      ],
      explain: 'Машинная панель — детерминированный порядок <code>Join</code>, снятый прогоном. <code>Enumerable.Join</code> перечисляет <b>outer</b> в его порядке и для каждого outer-элемента выдаёт совпавшие <b>inner</b> в их порядке. При outer = [Eng(1), Math(2)] и inner = [Ann(1), Bob(2), Cy(1)] результат — <b>Ann→Eng, Cy→Eng, Bob→Math</b> (реальный вывод). Это важно на практике: порядок join-результата предсказуем и завязан на порядок outer, а не inner. Замечание из доки про сортировку до join: «Some LINQ providers might not preserve that ordering after the join» <span class="ru-tr">«Некоторые провайдеры LINQ могут не сохранять этот порядок после соединения.»</span> — то есть на in-memory (LINQ to Objects) порядок outer держится, но у провайдеров (EF Core → SQL) гарантий порядка без явного <code>OrderBy</code> нет.',
      sources: ["ms-sqo"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>int[] n = [1,2,3,4,5,6]; var r = n.Where(x =&gt; x &gt; 2).Select(x =&gt; x * x); Console.WriteLine(string.Join(",", r));</code> — что напечатает?',
      options: ["9,16,25,36", "3,4,5,6", "1,4,9,16,25,36", "16,25,36"], correctIndex: 0, xp: 10,
      okText: '<code>Where(&gt;2)</code> → {3,4,5,6}; выход подаётся во <code>Select(x*x)</code> → <b>9,16,25,36</b>. Фильтр и проекция композируются в конвейер.',
      noText: 'Сначала фильтр &gt;2 (не &gt;=2): {3,4,5,6}. Затем квадрат каждого: <b>9,16,25,36</b>. Порядок сохранён.',
      verify: { kind: "exec", run: "dotnet run", expect: "9,16,25,36" }, sourceRefs: ["ms-sqo"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>string[] words = "the quick brown fox".Split(" "); var g = words.GroupBy(w =&gt; w.Length).OrderBy(x =&gt; x.Key).Select(x =&gt; $"{x.Key}:{x.Count()}"); Console.WriteLine(string.Join(" ", g));</code> — что напечатает?',
      options: ["3:2 5:2", "4:4", "3:1 5:1", "5:2 3:2"], correctIndex: 0, xp: 10,
      okText: 'Группировка по длине: длина 3 → {the, fox} (2), длина 5 → {quick, brown} (2). После <code>OrderBy(Key)</code>: <b>3:2 5:2</b>. GroupBy читает весь источник (nonstreaming).',
      noText: 'the/fox = длина 3 (2 шт), quick/brown = длина 5 (2 шт). Сортировка по ключу возрастающе → <b>3:2 5:2</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "3:2 5:2" }, sourceRefs: ["ms-sqo"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var deps = new[]{new{Id=1,Name="Eng"},new{Id=2,Name="Math"}}; var studs = new[]{new{Dep=1,N="Ann"},new{Dep=2,N="Bob"},new{Dep=1,N="Cy"}}; var j = deps.Join(studs, d=&gt;d.Id, s=&gt;s.Dep, (d,s)=&gt;$"{s.N}-&gt;{d.Name}"); Console.WriteLine(string.Join(",", j));</code> — в каком порядке?',
      options: ["Ann->Eng,Cy->Eng,Bob->Math", "Ann->Eng,Bob->Math,Cy->Eng", "Bob->Math,Ann->Eng,Cy->Eng", "Cy->Eng,Ann->Eng,Bob->Math"], correctIndex: 0, xp: 10,
      okText: 'Join сохраняет порядок <b>outer</b> (Eng(1), затем Math(2)). Для Eng — совпавшие inner в их порядке: Ann, Cy; затем Bob для Math → <b>Ann→Eng, Cy→Eng, Bob→Math</b>.',
      noText: 'Порядок определяет outer: сначала все совпадения Eng(1) — Ann, Cy — потом Math(2) — Bob. Реальный вывод: <b>Ann→Eng, Cy→Eng, Bob→Math</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Ann->Eng,Cy->Eng,Bob->Math" }, sourceRefs: ["ms-sqo"],
    },
  ],

  takeaways: [
    { icon: "why", k: "операторы — это методы", v: '«The standard query operators are the keywords and methods that form the LINQ pattern» <span class="ru-tr">«Стандартные операторы запросов — это ключевые слова и методы, образующие паттерн LINQ»</span> — extension-члены на <code>IEnumerable&lt;T&gt;</code>/<code>IQueryable&lt;T&gt;</code>, не синтаксис языка. Семейства: фильтр/проекция/группировка/join/сортировка.' },
    { icon: "cost", k: "композиция конвейером", v: '«output sequence of one query as the input sequence to another» <span class="ru-tr">«выходная последовательность одного запроса как входная последовательность для другого»</span> — <code>Where().Select().GroupBy()</code> цепляются. Скаляры (<code>Count/Sum</code>) исполняются сразу; последовательности — отложенно.' },
    { icon: "avoid", k: "порядок Join предсказуем", v: 'Замер: <code>Join</code> держит порядок <b>outer</b>, затем совпавшие inner → <b>Ann→Eng, Cy→Eng, Bob→Math</b>. Но провайдеры (EF→SQL) без явного <code>OrderBy</code> порядок не гарантируют.' },
  ],

  foot: 'урок · <b>стандартные операторы LINQ</b> · 5 анимир. разборов · панель детерминированного порядка Join · дизайн <b>mid</b>',
};
