/**
 * Lesson: object header layout (CS.S13.object-header-layout) — expert density, 5 animated
 * deep-dives. Book-sourced (Richter, CLR via C#, 4th ed., ch. 4 «Основы типов»). Every heap
 * object carries TWO overhead members the CLR needs to manage it: the type-object pointer (points
 * at the object's type object, which holds the static fields + the method table) and the sync-block
 * index. `new` computes the instance-field bytes PLUS these two members, zeroes them, then
 * initializes the pointer and index. COMPLEMENTS CS.S1.classes-virtual-dispatch (the C# language
 * angle on vtable/override) — here the subject is the physical object header the CLR lays down.
 *
 * SIGNATURE machine panel (s5): the header is INTERNAL (its raw bytes are not readable), so we
 * prove the OBSERVABLE consequences — (a) all instances of a type share ONE type object
 * (object.ReferenceEquals(a.GetType(), b.GetType()) == True, because both type-object pointers
 * point at the same type object); (b) an EMPTY class instance still allocates 24 bytes on 64-bit,
 * because the two header members occupy space even with zero instance fields. REAL run-csharp
 * measurements (this file's exec cards, app backend :5080). NEVER a fabricated internal byte.
 *
 * BOOK PROVENANCE (replaces the URL-verbatim rule):
 *   - Every « » passage is VERBATIM RUSSIAN from clr-book.txt (ch. 4, `new`-operator steps + the
 *     type-object / method-table section), substring-checked (wrap/soft-hyphen normalized).
 *   - Exec-card expects are REAL, DETERMINISTIC run-csharp stdout:
 *     c1 "True" (all instances share ONE type object — the type-object pointer) ·
 *     c2 "True False" (GetType is non-virtual truth: two Managers same type object, Manager != Employee) ·
 *     c3 "24" (an EMPTY class instance is still 24 bytes on 64-bit — the header overhead).
 *   - The raw header bytes + the sync-block index value are taught FROM THE BOOK (quoted) — they are
 *     internal and not directly readable; the consequences (shared type object, header overhead) are
 *     proven by exec. No fabricated internal number.
 *   - .NET 10 note: the object header (type-object pointer + sync-block index) and the 24-byte
 *     minimum object size on 64-bit are TIMELESS CLR internals unchanged in .NET 10.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S13.object-header-layout/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: `new` computes bytes = instance fields + the two overhead members.
const Z_CALC: Zone = { id: "calc", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "new ВЫЧИСЛЯЕТ БАЙТЫ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "поля + служебные члены", subCls: "vz-zsub", subY: 47 };
const Z_OBJ: Zone = { id: "obj", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ОБЪЕКТ В КУЧЕ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "заголовок + поля", subCls: "vz-zsub heap", subY: 47 };
const CALC_ZONES: Zone[] = [Z_CALC, Z_OBJ];

// s2: the two header members laid out — sync-block index + type-object pointer.
const Z_HDR: Zone = { id: "hdr", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone heap", label: "ЗАГОЛОВОК ОБЪЕКТА (2 СЛУЖЕБНЫХ ЧЛЕНА)", labelCls: "vz-zlabel heap", lx: 170, ly: 22, sub: "индекс блока синхронизации · указатель на объект-тип", subCls: "vz-zsub heap", subY: 40 };
const HDR_ZONES: Zone[] = [Z_HDR];

// s3: the type-object pointer points at the shared type object (holds statics + method table).
const Z_INST: Zone = { id: "inst", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ЭКЗЕМПЛЯРЫ", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "у каждого свой заголовок", subCls: "vz-zsub heap", subY: 47 };
const Z_TYPEOBJ: Zone = { id: "typeobj", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ОБЪЕКТ-ТИП (один)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "статика + таблица методов", subCls: "vz-zsub good", subY: 47 };
const TYPEOBJ_ZONES: Zone[] = [Z_INST, Z_TYPEOBJ];

// s4: GetType is non-virtual — returns the type-object pointer, so a type cannot lie.
const Z_CALL: Zone = { id: "call", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "obj.GetType()", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "невиртуальный", subCls: "vz-zsub", subY: 47 };
const Z_PTR: Zone = { id: "ptr", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "УКАЗАТЕЛЬ НА ОБЪЕКТ-ТИП", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "истинный тип", subCls: "vz-zsub good", subY: 47 };
const PTR_ZONES: Zone[] = [Z_CALL, Z_PTR];

// s5 (SIGNATURE): observable consequences — shared type object + header overhead bytes.
const Z_TWO: Zone = { id: "two", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ДВА ЭКЗЕМПЛЯРА", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "a, b одного типа", subCls: "vz-zsub heap", subY: 47 };
const Z_PROOF: Zone = { id: "proof", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "СЛЕДСТВИЕ (замер)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "один объект-тип · 24 B", subCls: "vz-zsub good", subY: 47 };
const PROOF_ZONES: Zone[] = [Z_TWO, Z_PROOF];

export const objectHeaderLayout: LessonData = {
  id: "CS.S13.object-header-layout",
  track: "CS",
  section: "CS.S13",
  module: "S13.4",
  lang: "csharp",
  title: "Устройство объекта в куче: заголовок, объект-тип, таблица методов",
  kicker: "CLR внутри · S13 · заголовок объекта",
  home: { subtitle: "sync-block index + указатель на объект-тип; new; общий объект-тип", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "clr-ch4", kind: "book", org: "Джеффри Рихтер", title: "CLR via C#, 4-е изд., гл. 4 «Основы типов»", url: "", date: "2013" },
  ],

  spec: [
    { text: "У каждого объекта кучи — два служебных члена: «в каждом объекте кучи должны присутствовать дополнительные члены, называемые указателем на объект-тип (type object pointer) и индексом блока синхронизации (sync block index); они необходимы CLR для управления объектом».", source: "clr-ch4" },
  ],
  edgeCases: [
    { text: "<code>new</code> считает байты <b>вместе</b> с заголовком: «Байты этих дополнительных членов добавляются к байтам, необходимым для размещения самого объекта». Поэтому даже пустой класс без полей занимает больше нуля (собственный прогон: пустой объект — 24 байта на 64-бит).", source: "clr-ch4" },
    { text: "Указатель на объект-тип у нового объекта CLR настраивает автоматически: «CLR автоматически инициализирует внутренний указатель на объект-тип так, чтобы он <span class=\"hl\">указывал на соответствующий объект-тип</span>» — поэтому все экземпляры одного типа делят один объект-тип (собственный прогон: <code>ReferenceEquals(a.GetType(), b.GetType())</code> = True).", source: "clr-ch4" },
    { text: "<code>GetType</code> нельзя обмануть, потому что он читает указатель на объект-тип: «метод GetType типа System.Object просто <b>возвращает адрес, хранящийся в указателе на объект-тип</b> заданного объекта». Он невиртуальный — «никакой тип не сможет сообщить о себе ложные сведения».", source: "clr-ch4" },
  ],

  misconceptions: [
    {
      wrong: "объект в куче — это просто его поля; пустой класс занимает 0 байт, а тип объекта где-то в отдельной таблице",
      hook: 'Нет. Кроме полей, у <b>каждого</b> объекта кучи есть <span class="hl">два служебных члена</span> заголовка: «в каждом объекте кучи должны присутствовать дополнительные члены, называемые <b>указателем на объект-тип</b> (type object pointer) и <b>индексом блока синхронизации</b> (sync block index); они необходимы CLR для управления объектом». Поэтому пустой объект не бесплатен: «Байты этих дополнительных членов добавляются к байтам, необходимым для размещения самого объекта» (реальный прогон: пустой класс — 24 байта на 64-бит). Указатель на объект-тип ведёт к <b>объекту-типу</b> — одному на все экземпляры типа, где лежат статика и <b>таблица методов</b>. Именно его читает <code>GetType</code>: «метод GetType… просто возвращает адрес, хранящийся в указателе на объект-тип». Дальше <b>пять разборов</b>: что считает <code>new</code>, два члена заголовка, указатель → общий объект-тип, невиртуальный <code>GetType</code>, и <b>машинная панель</b> — следствия заголовка замером (общий объект-тип = True; пустой объект = 24 B).',
      source: "clr-ch4",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Что считает new", title: "new: байты полей ПЛЮС два служебных члена",
      viewBox: "0 0 340 210", zones: CALC_ZONES,
      code: ["Employee e = new Employee(\"...\");", "// шаг 1: посчитать байты всех экземплярных полей", "//        + указатель на объект-тип", "//        + индекс блока синхронизации", "// шаг 2: выделить в куче, обнулить; шаг 3: инициализировать члены"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Сначала <code>new</code> считает байты полей типа и всех базовых (вплоть до <code>System.Object</code>).', nodes: [{ id: "f", kind: "obj", at: { zone: "calc", row: 0 }, typeTag: "поля", value: "экземплярные", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'К ним <span class="hl">добавляются</span> два служебных члена: «Байты этих дополнительных членов добавляются к байтам, необходимым для размещения самого объекта».', nodes: [{ id: "f", kind: "obj", at: { zone: "calc", row: 0 }, typeTag: "поля", value: "экземплярные" }, { id: "ovh", kind: "obj", at: { zone: "calc", row: 1 }, typeTag: "+ служебные", value: "objptr + syncidx", accent: true }], edges: [] },
        { codeLine: 4, out: "", caption: 'Затем память выделяется, обнуляется и <b>служебные члены инициализируются</b> — в куче лежит объект с заголовком и полями.', nodes: [{ id: "obj", kind: "obj", at: { zone: "obj", row: 0 }, typeTag: "Employee", value: "заголовок + поля", accent: true }], edges: [{ id: "e", from: "obj", to: "obj" }] },
      ],
      explain: 'Оператор <code>new</code> резервирует место не только под поля. Шаг 1 книги: «Вычисление количества байтов, необходимых для хранения всех экземплярных полей типа и всех его базовых типов, включая System.Object… Кроме того, в каждом объекте кучи должны присутствовать <span class="hl">дополнительные члены, называемые указателем на объект-тип (type object pointer) и индексом блока синхронизации (sync block index)</span>; они необходимы CLR для управления объектом. Байты этих дополнительных членов добавляются к байтам, необходимым для размещения самого объекта». Дальше шаг 2 — «Выделение памяти… Выделенные байты инициализируются нулями (0)» — и шаг 3 — «Инициализация указателя на объект-тип и индекса блока синхронизации». То есть заголовок — не абстракция, а реальные байты, которые считает и заполняет <code>new</code> ещё до вызова конструктора. Сколько это стоит для пустого класса — снимет машинная панель (разбор 05).',
      sources: ["clr-ch4"],
    },
    {
      id: "s2", num: "02", kicker: "Два члена заголовка", title: "sync-block index + указатель на объект-тип",
      viewBox: "0 0 340 276", zones: HDR_ZONES,
      code: ["// заголовок каждого объекта кучи = 2 служебных члена:", "//   индекс блока синхронизации (sync block index)", "//   указатель на объект-тип (type object pointer)", "// ниже — сами экземплярные поля объекта"],
      scenes: [
        { codeLine: 1, out: "", caption: '<b>Индекс блока синхронизации</b> — служит для блокировок/идентичности: индекс в массиве блоков синхронизации CLR (по умолчанию «свободен»).', nodes: [{ id: "sync", kind: "obj", at: { zone: "hdr", row: 0 }, typeTag: "sync block index", value: "для lock/identity", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<b>Указатель на объект-тип</b> — ведёт к объекту-типу (где статика и <span class="hl">таблица методов</span>). Оба члена «необходимы CLR для управления объектом».', nodes: [{ id: "sync", kind: "obj", at: { zone: "hdr", row: 0 }, typeTag: "sync block index", value: "для lock/identity" }, { id: "tptr", kind: "obj", at: { zone: "hdr", row: 1 }, typeTag: "type object pointer", value: "→ объект-тип", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Ниже заголовка — сами <b>поля</b> экземпляра. Итог: объект = 2 служебных члена + поля.', nodes: [{ id: "sync", kind: "obj", at: { zone: "hdr", row: 0 }, typeTag: "sync block index", value: "для lock/identity" }, { id: "tptr", kind: "obj", at: { zone: "hdr", row: 1 }, typeTag: "type object pointer", value: "→ объект-тип" }, { id: "fields", kind: "obj", at: { zone: "hdr", row: 2 }, typeTag: "поля", value: "экземплярные данные", accent: true }], edges: [] },
      ],
      explain: 'Заголовок объекта — ровно <b>два</b> служебных члена, одинаковых у любого объекта кучи: «в каждом объекте кучи должны присутствовать дополнительные члены, называемые <b>указателем на объект-тип</b> (type object pointer) и <b>индексом блока синхронизации</b> (sync block index)». Указатель на объект-тип адресует объект-тип (см. разбор 03) — там статические поля и таблица методов. Индекс блока синхронизации — это индекс в массиве блоков синхронизации CLR; он нужен для блокировок (<code>lock</code>/<code>Monitor</code>) и вычисления identity-hash. При конструировании «этому индексу присваивается значение –1, что означает отсутствие ссылок на блок синхронизации», а привязка происходит лениво — «при вызове метода Monitor.Enter CLR обнаруживает в массиве свободный блок синхронизации и присваивает ссылку на него объекту». Эти сырые байты изнутри sandbox не прочитать — но их <b>стоимость</b> и следствия наблюдаемы (разбор 05).',
      sources: ["clr-ch4"],
    },
    {
      id: "s3", num: "03", kicker: "Указатель → общий объект-тип", title: "Все экземпляры типа делят один объект-тип",
      viewBox: "0 0 340 210", zones: TYPEOBJ_ZONES,
      code: ["var a = new Employee();", "var b = new Employee();", "// у a и b СВОЙ заголовок, но указатель на объект-тип", "// у обоих ведёт к ОДНОМУ объекту-типу Employee"],
      predictAt: 2, predictQ: 'Создали два <code>Employee</code>. Их указатели на объект-тип ведут к <b>одному</b> объекту-типу или у каждого свой? (Где живут статика и таблица методов?)', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Два экземпляра — у каждого <b>свой</b> заголовок и свои поля в куче.', nodes: [{ id: "a", kind: "obj", at: { zone: "inst", row: 0 }, typeTag: "a: Employee", value: "заголовок+поля", accent: true }, { id: "b", kind: "obj", at: { zone: "inst", row: 1 }, typeTag: "b: Employee", value: "заголовок+поля" }], edges: [] },
        { codeLine: 3, out: "", caption: 'Но указатель на объект-тип у обоих ведёт к <span class="hl">одному объекту-типу</span> <code>Employee</code>: «CLR автоматически инициализирует… указатель на объект-тип так, чтобы он указывал на соответствующий объект-тип».', nodes: [{ id: "a", kind: "obj", at: { zone: "inst", row: 0 }, typeTag: "a: Employee", value: "заголовок+поля" }, { id: "b", kind: "obj", at: { zone: "inst", row: 1 }, typeTag: "b: Employee", value: "заголовок+поля" }, { id: "to", kind: "obj", at: { zone: "typeobj", row: 0 }, typeTag: "объект-тип Employee", value: "статика + method table", accent: true }], edges: [{ id: "e1", from: "a", to: "to", accent: true }, { id: "e2", from: "b", to: "to", accent: true }] },
        { codeLine: 3, out: "", caption: 'В объекте-типе — <b>статические поля</b> и <b>таблица методов</b>: «у каждого объекта-типа есть таблица методов с входными точками всех методов, определенных в типе». Один на весь тип.', nodes: [{ id: "to", kind: "obj", at: { zone: "typeobj", row: 0 }, typeTag: "объект-тип", value: "статика", accent: true }, { id: "mt", kind: "obj", at: { zone: "typeobj", row: 1 }, typeTag: "method table", value: "точки входа методов", accent: true }], edges: [] },
      ],
      explain: 'Указатель на объект-тип связывает экземпляр с его <b>объектом-типом</b> — а объект-тип один на весь тип. При создании «CLR автоматически инициализирует внутренний указатель на объект-тип так, чтобы он <span class="hl">указывал на соответствующий объект-тип</span> (в данном случае — на объект-тип Manager)». Что лежит в объекте-типе: «Байты для этих статических полей выделяются в составе самих объектов-типов. Наконец, <b>у каждого объекта-типа есть таблица методов</b> с входными точками всех методов, определенных в типе». Поэтому статические поля общие (они в одном объекте-типе), а таблица методов — там же. Это ровно тот method table, что мы разбирали в <code>CS.S1.classes-virtual-dispatch</code> с точки зрения языка, но здесь он — физически поле объекта-типа, на который смотрит заголовок каждого экземпляра. Как CLR готовит этот объект-тип и находит в нём метод — урок 5 этой секции.',
      sources: ["clr-ch4"],
    },
    {
      id: "s4", num: "04", kicker: "GetType — невиртуальный", title: "GetType читает указатель на объект-тип — обмануть нельзя",
      viewBox: "0 0 340 210", zones: PTR_ZONES,
      code: ["object o = new Manager();", "Type t = o.GetType();", "// GetType НЕвиртуальный: он просто читает указатель", "// на объект-тип из заголовка — тип не может солгать"],
      scenes: [
        { codeLine: 1, out: "", caption: '<code>o.GetType()</code> — <b>невиртуальный</b> метод <code>System.Object</code>. Тип не может его переопределить и выдать себя за другой.', nodes: [{ id: "o", kind: "obj", at: { zone: "call", row: 0 }, typeTag: "o", value: "GetType()", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Он просто <span class="hl">читает указатель на объект-тип</span> из заголовка: «метод GetType… просто возвращает адрес, хранящийся в указателе на объект-тип заданного объекта».', nodes: [{ id: "o", kind: "obj", at: { zone: "call", row: 0 }, typeTag: "o", value: "GetType()" }, { id: "to", kind: "obj", at: { zone: "ptr", row: 0 }, typeTag: "объект-тип", value: "Manager", accent: true }], edges: [{ id: "e", from: "o", to: "to", accent: true }] },
        { codeLine: 3, out: "", caption: 'Поэтому «никакой тип не сможет сообщить о себе <b>ложные сведения</b>»: истинный тип всегда тот, на что указывает заголовок.', nodes: [{ id: "o", kind: "obj", at: { zone: "call", row: 0 }, typeTag: "o", value: "GetType()" }, { id: "to", kind: "gate", at: { zone: "ptr", row: 0 }, state: "ok", label: "истинный тип", detail: "Manager", accent: true }], edges: [] },
      ],
      explain: 'Почему <code>GetType</code> — источник истины о типе. Он невиртуальный: «Программист всегда может точно определить тип объекта при помощи метода GetType. Поскольку это <span class="hl">невиртуальный метод, никакой тип не сможет сообщить о себе ложные сведения</span>. Например, тип Employee не может переопределить метод GetType, чтобы тот вернул тип SuperHero». А реализация тривиальна — чтение заголовка: «метод GetType типа System.Object просто <b>возвращает адрес, хранящийся в указателе на объект-тип</b> заданного объекта. Иначе говоря, метод GetType возвращает указатель на объект-тип указанного объекта и именно поэтому можно определить истинный тип любого объекта в системе». То есть «истинный тип» объекта физически закодирован в его заголовке, и <code>GetType</code> лишь возвращает этот указатель. Отсюда наблюдаемое: два объекта одного типа дают <b>один и тот же</b> объект-тип по ссылке (разбор 05).',
      sources: ["clr-ch4"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · следствия замером", title: "Общий объект-тип = True; пустой объект = 24 байта",
      viewBox: "0 0 340 210", zones: PROOF_ZONES,
      code: ["var a = new object(); var b = new object();", "Console.WriteLine(object.ReferenceEquals(a.GetType(), b.GetType()));", "// и: пустой класс — сколько байт занимает экземпляр?"],
      predictAt: 1, predictQ: 'Заголовок сырьём не прочитать. Но: <code>ReferenceEquals(a.GetType(), b.GetType())</code> для двух объектов одного типа — True или False? И сколько байт у экземпляра ПУСТОГО класса на 64-бит?',
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Два объекта одного типа. У каждого свой заголовок, но указатель на объект-тип должен вести к <b>одному</b> объекту-типу.', nodes: [{ id: "a", kind: "obj", at: { zone: "two", row: 0 }, typeTag: "a", value: "objptr →", accent: true }, { id: "b", kind: "obj", at: { zone: "two", row: 1 }, typeTag: "b", value: "objptr →" }], edges: [] },
        { codeLine: 1, out: "True", caption: '<code>ReferenceEquals(a.GetType(), b.GetType())</code> = <span class="hl">True</span>: оба указателя ведут к одному объекту-типу (реальный прогон). Значит объект-тип общий.', nodes: [{ id: "a", kind: "obj", at: { zone: "two", row: 0 }, typeTag: "a", value: "objptr →" }, { id: "b", kind: "obj", at: { zone: "two", row: 1 }, typeTag: "b", value: "objptr →" }, { id: "eq", kind: "gate", at: { zone: "proof", row: 0 }, state: "ok", label: "один объект-тип", detail: "True", accent: true }], edges: [{ id: "e1", from: "a", to: "eq" }, { id: "e2", from: "b", to: "eq" }] },
        { codeLine: 2, out: "24", caption: 'А пустой класс без полей — <b>24 байта</b> на 64-бит: заголовок (2 члена × 8 B) + минимальный размер. «Байты этих дополнительных членов добавляются» — заголовок <span class="hl">не бесплатен</span> (реальный прогон).', nodes: [{ id: "empty", kind: "obj", at: { zone: "two", row: 0 }, typeTag: "class Empty", value: "0 полей", accent: true }, { id: "sz", kind: "gate", at: { zone: "proof", row: 0 }, state: "ok", label: "размер", detail: "24 B", accent: true }], edges: [{ id: "e", from: "empty", to: "sz", accent: true }] },
      ],
      explain: 'Это машинная панель урока — заголовок изнутри не прочитать, но его следствия снимаются числом. <b>Первое</b>: <code>object.ReferenceEquals(a.GetType(), b.GetType())</code> = <b>True</b> для двух объектов одного типа. Это прямое следствие того, что «CLR автоматически инициализирует… указатель на объект-тип так, чтобы он указывал на соответствующий объект-тип» — оба указателя ведут к <b>одному</b> объекту-типу, а <code>GetType</code> «возвращает адрес, хранящийся в указателе на объект-тип». <b>Второе</b>: экземпляр пустого класса на 64-бит занимает <b>24 байта</b> — 8 (индекс блока синхронизации) + 8 (указатель на объект-тип) + 8 (минимальный размер/выравнивание), хотя полей нет. Это подтверждает «Байты этих дополнительных членов добавляются к байтам, необходимым для размещения самого объекта». Сам заголовок непубличен, но его <b>цена</b> и <b>эффект</b> — вот, замером.',
      sources: ["clr-ch4"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var a = new object(); var b = new object();</code><br/><code>Console.WriteLine(object.ReferenceEquals(a.GetType(), b.GetType()));</code> — что напечатает?',
      options: ["True", "False", "0", "System.Object"], correctIndex: 0, xp: 10,
      okText: 'Указатель на объект-тип у обоих ведёт к <b>одному</b> объекту-типу, а <code>GetType</code> «возвращает адрес, хранящийся в указателе на объект-тип». Значит <code>a.GetType()</code> и <code>b.GetType()</code> — это <span class="hl">одна и та же ссылка</span> → True.',
      noText: 'Все экземпляры типа делят ОДИН объект-тип (там статика + таблица методов). Их указатели на объект-тип равны, поэтому <code>ReferenceEquals</code> двух <code>GetType()</code> — <b>True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True" }, sourceRefs: ["clr-ch4"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Employee{} class Manager:Employee{}</code><br/><code>var m1=new Manager(); var m2=new Manager(); var e=new Employee();</code><br/><code>Console.WriteLine($"{object.ReferenceEquals(m1.GetType(),m2.GetType())} {object.ReferenceEquals(m1.GetType(),e.GetType())}");</code> — что напечатает?',
      options: ["True False", "True True", "False False", "False True"], correctIndex: 0, xp: 10,
      okText: 'Два <code>Manager</code> делят объект-тип Manager (<b>True</b>); а Manager и Employee — <b>разные</b> объекты-типы (<b>False</b>). <code>GetType</code> невиртуальный — «никакой тип не сможет сообщить о себе ложные сведения».',
      noText: 'Указатель на объект-тип равен только у объектов одного типа. m1/m2 → Manager (True), m1 vs e → Manager≠Employee (False). Вывод: <b>True False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True False" }, sourceRefs: ["clr-ch4"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Empty{}</code><br/><code>var w=new Empty(); long a=GC.GetAllocatedBytesForCurrentThread(); var x=new Empty(); long b=GC.GetAllocatedBytesForCurrentThread();</code><br/><code>Console.WriteLine(b-a);</code> — сколько байт у экземпляра пустого класса (64-бит)?',
      options: ["24", "0", "8", "16"], correctIndex: 0, xp: 10,
      okText: 'Даже без полей объект несёт <b>заголовок</b>: 8 (индекс блока синхронизации) + 8 (указатель на объект-тип) + 8 (мин. размер) = <span class="hl">24 байта</span>. «Байты этих дополнительных членов добавляются к байтам, необходимым для размещения самого объекта».',
      noText: 'Пустой класс не бесплатен: заголовок из двух служебных членов + минимальный размер = <b>24 байта</b> на 64-бит. Заголовок объекта реален и занимает место.',
      verify: { kind: "exec", run: "dotnet run", expect: "24" }, sourceRefs: ["clr-ch4"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Заголовок = 2 члена", v: 'У каждого объекта кучи есть дополнительные члены, называемые «указателем на объект-тип (type object pointer) и индексом блока синхронизации (sync block index); они необходимы CLR для управления объектом». Указатель ведёт к объекту-типу (статика + таблица методов), индекс — для lock/identity.' },
    { icon: "cost", k: "Заголовок не бесплатен", v: '«Байты этих дополнительных членов добавляются к байтам, необходимым для размещения самого объекта» — пустой класс на 64-бит занимает <b>24 байта</b> (замер): 8+8 заголовок + 8 мин. размер, хотя полей нет.' },
    { icon: "avoid", k: "GetType не обмануть", v: 'Указатель на объект-тип у всех экземпляров типа ведёт к одному объекту-типу; <code>GetType</code> невиртуальный и «просто возвращает адрес, хранящийся в указателе на объект-тип» → истинный тип (замер: <code>ReferenceEquals(a.GetType(),b.GetType())</code> = True).' },
  ],

  foot: 'урок · <b>устройство объекта</b> · 5 анимир. разборов · заголовок(sync-idx+objptr) · общий объект-тип · панель True / 24 B · источник <b>Рихтер, CLR via C#, гл.4</b> · дизайн <b>mid</b>',
};
