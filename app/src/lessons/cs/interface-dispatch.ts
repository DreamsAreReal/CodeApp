/**
 * Lesson: interface dispatch (CS.S13.interface-dispatch) — expert density, 5 animated deep-dives.
 * Book-sourced (Richter, CLR via C#, 4th ed., ch. 13 «Интерфейсы»). How the CLR dispatches an
 * INTERFACE method call: interface methods are virtual, an object's method table carries an entry
 * for every inherited interface method, and calling through an interface-typed variable dispatches
 * to the implementation bound to the object's own type. The signature twist: an EXPLICIT interface
 * method implementation (EIMI) is emitted as a PRIVATE method, so it is reachable ONLY through a
 * cast to the interface — a plain `obj.Method()` either fails to compile or calls a different member.
 * COMPLEMENTS CS.S1.interfaces-dim (the C# language angle: explicit vs implicit, default interface
 * methods) and CS.S1.classes-virtual-dispatch (class vtable/override) — here the subject is the CLR
 * dispatch mechanics of interface calls and the EIMI privacy trick, proven by exec.
 *
 * SIGNATURE machine panel (s5): a type implements two interfaces whose methods collide by name via
 * EIMI (`string IArtist.Name()` + `string IChef.Name()`). Because each EIMI is emitted private, the
 * ONLY way to reach it is a cast: `((IArtist)p).Name()` → "artist", `((IChef)p).Name()` → "chef".
 * REAL run-csharp measurement (this file's exec cards, app backend :5080). The method-table slot the
 * CLR walks is internal and not directly readable; we prove the OBSERVABLE consequence (which
 * implementation runs through which interface cast) by exec. Never a fabricated internal address.
 *
 * BOOK PROVENANCE (replaces the URL-verbatim rule):
 *   - Every « » passage is VERBATIM RUSSIAN from clr-book.txt (ch. 13, «Наследование интерфейсов» +
 *     «Явные и неявные реализации интерфейсных методов»), substring-checked (wrap/soft-hyphen normalized).
 *   - Exec-card expects are REAL, DETERMINISTIC run-csharp stdout:
 *     c1 "artist chef" (EIMI: each interface cast reaches its own private implementation) ·
 *     c2 "public Dispose IDisposable Dispose" (public member vs EIMI are two distinct slots) ·
 *     c3 "7" (interface polymorphism: dispatch to each object's own Area() through IShape).
 *   - The internal method-table interface slot the CLR walks is taught FROM THE BOOK (quoted) — it is
 *     not directly readable; the dispatch OUTCOME is proven by exec. No fabricated internal number.
 *   - .NET 10 note: interface methods being virtual, the method-table entry per inherited interface
 *     method, EIMI emitted as private + reachable only via cast, and dispatch to the object's own type
 *     are TIMELESS CLR internals unchanged in .NET 10 (default interface methods add a separate axis,
 *     covered in CS.S1.interfaces-dim, out of this lesson's mechanics scope).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S13.interface-dispatch/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: interface methods are virtual — dispatch goes to the implementation bound to the object's type.
const Z_VAR: Zone = { id: "var", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ПЕРЕМЕННАЯ IDisposable", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "интерфейсный тип", subCls: "vz-zsub", subY: 47 };
const Z_IMPL: Zone = { id: "impl", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "РЕАЛИЗАЦИЯ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "по типу объекта", subCls: "vz-zsub good", subY: 47 };
const VAR_ZONES: Zone[] = [Z_VAR, Z_IMPL];

// s2: the method table carries an entry per inherited interface method.
const Z_MT: Zone = { id: "mt", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone heap", label: "ТАБЛИЦА МЕТОДОВ ТИПА SimpleType", labelCls: "vz-zlabel heap", lx: 170, ly: 22, sub: "запись на каждый унаследованный интерфейсный метод", subCls: "vz-zsub heap", subY: 40 };
const MT_ZONES: Zone[] = [Z_MT];

// s3: implicit implementation — one method backs both the public slot and the interface slot.
const Z_SRC: Zone = { id: "src", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "public void Dispose", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "неявная реализация", subCls: "vz-zsub", subY: 47 };
const Z_TWO: Zone = { id: "two", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ДВЕ ЗАПИСИ → ОДИН КОД", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "public + интерфейс", subCls: "vz-zsub good", subY: 47 };
const SRC_ZONES: Zone[] = [Z_SRC, Z_TWO];

// s4: explicit implementation (EIMI) — emitted private, reachable only via a cast to the interface.
const Z_EIMI: Zone = { id: "eimi", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "void IDisposable.Dispose", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "EIMI · private", subCls: "vz-zsub", subY: 47 };
const Z_REACH: Zone = { id: "reach", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "КАК ДОСТАТЬ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "только приведением", subCls: "vz-zsub good", subY: 47 };
const EIMI_ZONES: Zone[] = [Z_EIMI, Z_REACH];

// s5 (SIGNATURE): two interfaces, same method name via EIMI — each cast reaches its own slot.
const Z_CAST: Zone = { id: "cast", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ПРИВЕДЕНИЕ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "(IArtist) / (IChef)", subCls: "vz-zsub", subY: 47 };
const Z_PROOF: Zone = { id: "proof", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "СЛЕДСТВИЕ (замер)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "artist · chef", subCls: "vz-zsub good", subY: 47 };
const PROOF_ZONES: Zone[] = [Z_CAST, Z_PROOF];

export const interfaceDispatch: LessonData = {
  id: "CS.S13.interface-dispatch",
  track: "CS",
  section: "CS.S13",
  module: "S13.6",
  lang: "csharp",
  title: "Диспетчеризация интерфейсного вызова: виртуальность, таблица методов, EIMI",
  kicker: "CLR внутри · S13 · вызов через интерфейс",
  home: { subtitle: "Интерфейсные методы виртуальны; вызов через переменную интерфейса; явная реализация скрывает член", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "clr-ch13", kind: "book", org: "Джеффри Рихтер", title: "CLR via C#, 4-е изд., гл. 13 «Интерфейсы»", url: "", date: "2013" },
  ],

  spec: [
    { text: "Интерфейсные методы <b>виртуальны</b>, и вызов через интерфейс идёт по типу объекта: «CLR требует, чтобы интерфейсные методы были виртуальными». А «При вызове интерфейсного метода объекта вызывается реализация, связанная с типом самого объекта» — это и есть диспетчеризация через таблицу методов.", source: "clr-ch13" },
  ],
  edgeCases: [
    { text: "Таблица методов несёт <b>запись на каждый унаследованный интерфейсный метод</b>: «Она содержит по одной записи для каждого нового, представляемого только этим типом метода, а также записи для всех виртуальных методов, унаследованных типом. Унаследованные виртуальные методы включают… все методы, определенные интерфейсными типами».", source: "clr-ch13" },
    { text: "Явная реализация (EIMI) компилируется <b>приватной</b> и потому скрыта: «когда компилятор создает метаданные для метода, он назначает ему закрытый уровень доступа (private), что запрещает любому коду использовать экземпляр класса простым вызовом интерфейсного метода. <span class=\"hl\">Единственный способ вызвать интерфейсный метод — обратиться через переменную этого интерфейсного типа</span>» (собственный прогон: два EIMI с одним именем — <code>artist chef</code> через приведения).", source: "clr-ch13" },
    { text: "EIMI-метод <b>не виртуален</b> и не переопределяется: «EIMI-метод не может быть виртуальным, а значит, его нельзя переопределить. Это происходит потому, что EIMI-метод в действительности не является частью объектной модели типа; это всего лишь средство связывания интерфейса… с типом».", source: "clr-ch13" },
  ],

  misconceptions: [
    {
      wrong: "интерфейс — это просто список сигнатур; вызов интерфейсного метода ничем не отличается от обычного, а «явная реализация» — косметика, член всё равно виден как обычный метод",
      hook: 'Нет. Интерфейсные методы — <span class="hl">виртуальные</span>, и CLR диспетчеризует их через таблицу методов: «CLR требует, чтобы интерфейсные методы были виртуальными», а «При вызове интерфейсного метода объекта вызывается реализация, связанная с типом самого объекта». А <b>явная</b> реализация (EIMI) — не косметика: компилятор делает такой метод <b>приватным</b>, поэтому «Единственный способ вызвать интерфейсный метод — обратиться через переменную этого интерфейсного типа». Обычный <code>p.Name()</code> его <b>не видит</b> — нужно приведение <code>((IArtist)p).Name()</code>. Дальше <b>пять разборов</b>: виртуальность + диспетчеризация по типу объекта, запись в таблице методов на каждый интерфейсный метод, неявная реализация (public = интерфейс), явная реализация как private, и <b>машинная панель</b> — два EIMI с одним именем: приведение к <code>IArtist</code> зовёт <code>artist</code>, к <code>IChef</code> — <code>chef</code> (реальный прогон).',
      source: "clr-ch13",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Виртуальны · по типу объекта", title: "Интерфейсные методы виртуальны: вызов идёт по типу объекта",
      viewBox: "0 0 340 210", zones: VAR_ZONES,
      code: ["IDisposable d = new SimpleType();", "d.Dispose();   // вызов через ИНТЕРФЕЙСНУЮ переменную", "// CLR берёт тип самого объекта (SimpleType) и", "// диспетчеризует в его реализацию Dispose"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Переменная <code>d</code> имеет <b>интерфейсный</b> тип <code>IDisposable</code>, но ссылается на объект <code>SimpleType</code> в куче.', nodes: [{ id: "d", kind: "slot", at: { zone: "var", row: 0 }, name: "d: IDisposable", value: "→ SimpleType", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Интерфейсные методы <span class="hl">виртуальны</span>: «CLR требует, чтобы интерфейсные методы были виртуальными». Значит вызов не привязан к типу переменной.', nodes: [{ id: "d", kind: "slot", at: { zone: "var", row: 0 }, name: "d: IDisposable", value: "→ SimpleType" }, { id: "v", kind: "gate", at: { zone: "impl", row: 0 }, state: "ok", label: "virtual", detail: "по типу объекта", accent: true }], edges: [{ id: "e", from: "d", to: "v", accent: true }] },
        { codeLine: 3, out: "", caption: 'CLR берёт <b>тип самого объекта</b> и диспетчеризует туда: «вызывается реализация, связанная с типом самого объекта».', nodes: [{ id: "d", kind: "slot", at: { zone: "var", row: 0 }, name: "d: IDisposable", value: "→ SimpleType" }, { id: "impl", kind: "obj", at: { zone: "impl", row: 0 }, typeTag: "SimpleType", value: "Dispose()", accent: true }], edges: [{ id: "e", from: "d", to: "impl", accent: true }] },
      ],
      explain: 'Вызов через интерфейсную переменную — это <b>виртуальная</b> диспетчеризация, а не статический вызов по типу переменной. Дословно: «Компилятор C# требует, чтобы метод, реализующий интерфейс, отмечался модификатором public. <span class="hl">CLR требует, чтобы интерфейсные методы были виртуальными</span>. Если метод явно не определен в коде как виртуальный, компилятор сделает его таковым и, вдобавок, запечатанным». Поэтому при вызове реализация выбирается по <b>типу объекта</b>, а не переменной: «При вызове интерфейсного метода объекта <span class="hl">вызывается реализация, связанная с типом самого объекта</span>». Механически это работает через таблицу методов типа (разбор 02): интерфейсный вызов находит слот интерфейса в таблице и прыгает в реализацию. Для значимого типа перед этим нужна упаковка — «при вызове метода интерфейса с упакованным значимым типом CLR использует указатель, чтобы найти таблицу методов типа объекта и вызвать нужный метод».',
      sources: ["clr-ch13"],
    },
    {
      id: "s2", num: "02", kicker: "Таблица методов", title: "В таблице методов — запись на каждый интерфейсный метод",
      viewBox: "0 0 340 276", zones: MT_ZONES,
      code: ["internal sealed class SimpleType : IDisposable {", "  public void Dispose() { ... }", "}", "// при загрузке типа CLR строит таблицу методов"],
      scenes: [
        { codeLine: 3, out: "", caption: 'Когда тип загружается, CLR строит <b>таблицу методов</b>: «Когда тип загружается в CLR, для него создается и инициализируется таблица методов».', nodes: [{ id: "obj", kind: "obj", at: { zone: "mt", row: 0 }, typeTag: "методы Object", value: "ToString/Equals/GetHashCode/GetType", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'В ней — запись на каждый <span class="hl">унаследованный интерфейсный метод</span>: «записи для всех виртуальных методов, унаследованных типом… все методы, определенные интерфейсными типами».', nodes: [{ id: "obj", kind: "obj", at: { zone: "mt", row: 0 }, typeTag: "методы Object", value: "4 метода" }, { id: "iface", kind: "obj", at: { zone: "mt", row: 1 }, typeTag: "IDisposable.Dispose", value: "интерфейсный слот", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'И запись на <b>новый</b> метод типа. Итог: <code>SimpleType</code> = методы Object + слот интерфейса + свой <code>Dispose</code>.', nodes: [{ id: "obj", kind: "obj", at: { zone: "mt", row: 0 }, typeTag: "методы Object", value: "4 метода" }, { id: "iface", kind: "obj", at: { zone: "mt", row: 1 }, typeTag: "IDisposable.Dispose", value: "интерфейсный слот" }, { id: "own", kind: "obj", at: { zone: "mt", row: 2 }, typeTag: "SimpleType.Dispose", value: "новый метод типа", accent: true }], edges: [] },
      ],
      explain: 'Диспетчеризация интерфейсного вызова опирается на <b>таблицу методов</b>, которую CLR строит при загрузке типа. Дословно: «Когда тип загружается в CLR, для него создается и инициализируется таблица методов (см. главу 1). <span class="hl">Она содержит по одной записи для каждого нового, представляемого только этим типом метода, а также записи для всех виртуальных методов, унаследованных типом</span>. Унаследованные виртуальные методы включают методы, определенные в базовых типах иерархии наследования, а также все методы, определенные интерфейсными типами». Для <code>SimpleType : IDisposable</code> в таблице оказываются: все экземплярные методы <code>Object</code>, метод <code>Dispose</code> интерфейса <code>IDisposable</code>, и новый метод <code>Dispose</code> самого типа. Как именно эти записи связываются с реализацией — зависит от того, реализован метод неявно (разбор 03) или явно (разбор 04). Сами слоты таблицы изнутри sandbox не прочитать — но их эффект (какая реализация выполнится) наблюдаем замером (разбор 05).',
      sources: ["clr-ch13"],
    },
    {
      id: "s3", num: "03", kicker: "Неявная реализация", title: "public-метод = реализация интерфейса: две записи, один код",
      viewBox: "0 0 340 210", zones: SRC_ZONES,
      code: ["internal sealed class SimpleType : IDisposable {", "  public void Dispose() { ... }   // НЕЯВНАЯ реализация", "}", "st.Dispose();          // public-вызов", "((IDisposable)st).Dispose();  // интерфейсный вызов — тот же код"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Открытый <code>public void Dispose()</code> с сигнатурой интерфейса компилятор считает <b>реализацией</b> <code>IDisposable.Dispose</code>.', nodes: [{ id: "m", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "public Dispose", value: "сигнатура совпала", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Компилятор помечает обе записи в таблице методов как <span class="hl">одну реализацию</span>: «обе записи в таблице методов типа SimpleType должны ссылаться на одну реализацию».', nodes: [{ id: "m", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "public Dispose", value: "один код" }, { id: "pub", kind: "gate", at: { zone: "two", row: 0 }, state: "ok", label: "public слот", detail: "→ Dispose" }, { id: "if", kind: "gate", at: { zone: "two", row: 1 }, state: "ok", label: "интерфейс слот", detail: "→ Dispose", accent: true }], edges: [{ id: "e1", from: "m", to: "pub" }, { id: "e2", from: "m", to: "if", accent: true }] },
        { codeLine: 3, out: "", caption: 'Поэтому <code>st.Dispose()</code> и <code>((IDisposable)st).Dispose()</code> дают <b>один</b> результат — «будет выполнен тот же код».', nodes: [{ id: "pub", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "st.Dispose()", value: "тот же" }, { id: "if", kind: "obj", at: { zone: "two", row: 0 }, typeTag: "(IDisposable)st", value: "код", accent: true }], edges: [] },
      ],
      explain: 'При <b>неявной</b> реализации открытый метод разом закрывает и обычный вызов, и интерфейсный. Дословно: «Чтобы упростить жизнь программиста, компилятор C# считает, что появившийся в типе SimpleType метод Dispose является реализацией метода Dispose из интерфейса IDisposable. Компилятор C# вправе сделать такое предположение, потому что метод открытый, а сигнатуры интерфейсного метода и нового метода совпадают». Что происходит в метаданных: «Сопоставляя новый метод с интерфейсным методом, компилятор C# генерирует метаданные, указывающие на то, что <span class="hl">обе записи в таблице методов типа SimpleType должны ссылаться на одну реализацию</span>». Следствие: «при вызове d.Dispose() выполняется обращение к методу Dispose интерфейса IDisposable. Так как C# требует, чтобы открытый метод Dispose тоже был реализацией для метода Dispose интерфейса IDisposable, <b>будет выполнен тот же код</b>». Разница появляется только при <b>явной</b> реализации (разбор 04).',
      sources: ["clr-ch13"],
    },
    {
      id: "s4", num: "04", kicker: "Явная реализация · private", title: "EIMI — приватный член: достать можно только приведением",
      viewBox: "0 0 340 210", zones: EIMI_ZONES,
      code: ["internal sealed class SimpleType : IDisposable {", "  public void Dispose() { WriteLine(\"public Dispose\"); }", "  void IDisposable.Dispose() { WriteLine(\"IDisposable Dispose\"); }", "}", "st.Dispose();                 // → public Dispose", "((IDisposable)st).Dispose();  // → IDisposable Dispose"],
      predictAt: 3, predictQ: 'У <code>SimpleType</code> есть <code>public Dispose()</code> и явная <code>void IDisposable.Dispose()</code> (EIMI). Что выведет обычный <code>st.Dispose()</code> — public-версию или EIMI? И как вызвать EIMI?', console: true,
      scenes: [
        { codeLine: 2, out: "", caption: 'Имя интерфейса перед методом = <b>явная реализация</b> (EIMI): «Если в C# перед именем метода указано имя интерфейса… то вы создаете явную реализацию интерфейсного метода».', nodes: [{ id: "eimi", kind: "obj", at: { zone: "eimi", row: 0 }, typeTag: "IDisposable.Dispose", value: "EIMI", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Компилятор делает EIMI <span class="hl">приватным</span>: «он назначает ему закрытый уровень доступа (private), что запрещает любому коду использовать экземпляр класса простым вызовом интерфейсного метода».', nodes: [{ id: "eimi", kind: "obj", at: { zone: "eimi", row: 0 }, typeTag: "IDisposable.Dispose", value: "private" }, { id: "block", kind: "gate", at: { zone: "reach", row: 0 }, state: "fail", label: "st.Dispose()", detail: "не видит EIMI", accent: true }], edges: [] },
        { codeLine: 5, out: "", caption: 'Единственный доступ — <b>приведение</b> к интерфейсу: «Единственный способ вызвать интерфейсный метод — обратиться через переменную этого интерфейсного типа».', nodes: [{ id: "cast", kind: "obj", at: { zone: "eimi", row: 0 }, typeTag: "(IDisposable)st", value: "приведение" }, { id: "ok", kind: "gate", at: { zone: "reach", row: 0 }, state: "ok", label: "→ EIMI", detail: "IDisposable Dispose", accent: true }], edges: [{ id: "e", from: "cast", to: "ok", accent: true }] },
      ],
      explain: 'Явная реализация <b>прячет</b> член от обычного вызова — это и есть механизм сокрытия. Дословно: «Если в C# перед именем метода указано имя интерфейса, в котором определен этот метод (в нашем примере — IDisposable.Dispose), то вы создаете явную реализацию интерфейсного метода (Explicit Interface Method Implementation, EIMI)». Ключевое: «когда компилятор создает метаданные для метода, <span class="hl">он назначает ему закрытый уровень доступа (private)</span>, что запрещает любому коду использовать экземпляр класса простым вызовом интерфейсного метода. Единственный способ вызвать интерфейсный метод — обратиться через переменную этого интерфейсного типа». Поэтому <code>st.Dispose()</code> зовёт <b>public</b>-версию (выведет «public Dispose»), а EIMI достаётся только через приведение <code>((IDisposable)st).Dispose()</code> (выведет «IDisposable Dispose»). И такой метод не участвует в полиморфизме: «EIMI-метод не может быть виртуальным, а значит, его нельзя переопределить… это всего лишь средство связывания интерфейса… с типом». Когда имён-коллизий два — приведение выбирает нужный (разбор 05).',
      sources: ["clr-ch13"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · следствие замером", title: "Два EIMI, одно имя: приведение выбирает реализацию",
      viewBox: "0 0 340 210", zones: PROOF_ZONES,
      code: ["interface IArtist { string Name(); }", "interface IChef   { string Name(); }", "class Person : IArtist, IChef {", "  string IArtist.Name() => \"artist\";  // EIMI", "  string IChef.Name()   => \"chef\";    // EIMI", "}", "var p = new Person();", "WriteLine($\"{((IArtist)p).Name()} {((IChef)p).Name()}\");"],
      predictAt: 6, predictQ: 'Два интерфейса с одинаковым методом <code>Name()</code>, оба реализованы явно (EIMI). Что напечатает <code>((IArtist)p).Name()</code> и <code>((IChef)p).Name()</code>? (Обычный <code>p.Name()</code> вообще не скомпилируется.)', console: true,
      scenes: [
        { codeLine: 2, out: "", caption: '<code>Person</code> реализует два интерфейса с <b>одноимённым</b> методом <code>Name()</code> — коллизию разруливает только EIMI (каждый привязан к своему интерфейсу).', nodes: [{ id: "a", kind: "obj", at: { zone: "cast", row: 0 }, typeTag: "IArtist.Name", value: "artist", accent: true }, { id: "c", kind: "obj", at: { zone: "cast", row: 1 }, typeTag: "IChef.Name", value: "chef" }], edges: [] },
        { codeLine: 7, out: "artist chef", caption: '<code>((IArtist)p).Name()</code> = <span class="hl">artist</span>, <code>((IChef)p).Name()</code> = <span class="hl">chef</span>: приведение выбирает слот интерфейса в таблице методов (реальный прогон).', nodes: [{ id: "a", kind: "obj", at: { zone: "cast", row: 0 }, typeTag: "(IArtist)p", value: "Name()" }, { id: "c", kind: "obj", at: { zone: "cast", row: 1 }, typeTag: "(IChef)p", value: "Name()" }, { id: "ra", kind: "gate", at: { zone: "proof", row: 0 }, state: "ok", label: "→ artist", detail: "IArtist слот", accent: true }, { id: "rc", kind: "gate", at: { zone: "proof", row: 1 }, state: "ok", label: "→ chef", detail: "IChef слот", accent: true }], edges: [{ id: "e1", from: "a", to: "ra", accent: true }, { id: "e2", from: "c", to: "rc", accent: true }] },
        { codeLine: 7, out: "artist chef", caption: 'Обычный <code>p.Name()</code> <b>не скомпилируется</b> — оба EIMI приватны: «Единственный способ… — обратиться через переменную этого интерфейсного типа».', nodes: [{ id: "plain", kind: "gate", at: { zone: "cast", row: 0 }, state: "fail", label: "p.Name()", detail: "не видит EIMI", accent: true }, { id: "res", kind: "obj", at: { zone: "proof", row: 0 }, typeTag: "только через", value: "приведение", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — сокрытие через EIMI, снятое замером. Слот интерфейса в таблице методов изнутри не прочитать, но <b>какая реализация выполнится через какое приведение</b> — наблюдаемо. <code>Person</code> реализует <code>IArtist</code> и <code>IChef</code>, у обоих метод <code>Name()</code>; каждый реализован явно. Результат прогона: <code>((IArtist)p).Name()</code> → <b>artist</b>, <code>((IChef)p).Name()</code> → <b>chef</b>. Это прямое следствие того, что EIMI приватен и привязан к конкретному интерфейсу: «Единственный способ вызвать интерфейсный метод — обратиться через <span class="hl">переменную этого интерфейсного типа</span>». Обычный <code>p.Name()</code> здесь даже не скомпилируется — у <code>Person</code> нет публичного <code>Name</code>. Так EIMI решает <b>коллизию имён</b> двух интерфейсов и одновременно скрывает члены от «внешнего» API типа. Внутренний механизм — тот же слот таблицы методов из разбора 02; здесь мы доказали его эффект.',
      sources: ["clr-ch13"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>interface IArtist { string Name(); } interface IChef { string Name(); }</code><br/><code>class Person : IArtist, IChef { string IArtist.Name() =&gt; "artist"; string IChef.Name() =&gt; "chef"; }</code><br/><code>var p = new Person(); Console.WriteLine($"{((IArtist)p).Name()} {((IChef)p).Name()}");</code> — что напечатает?',
      options: ["artist chef", "chef artist", "artist artist", "chef chef"], correctIndex: 0, xp: 10,
      okText: 'Оба <code>Name()</code> реализованы <b>явно</b> (EIMI) и приватны, поэтому доступны только через приведение к своему интерфейсу: <code>(IArtist)p</code> → <span class="hl">artist</span>, <code>(IChef)p</code> → <span class="hl">chef</span>. «Единственный способ вызвать интерфейсный метод — обратиться через переменную этого интерфейсного типа».',
      noText: 'EIMI привязан к конкретному интерфейсу: приведение к <code>IArtist</code> зовёт <code>IArtist.Name</code>, к <code>IChef</code> — <code>IChef.Name</code>. Вывод: <b>artist chef</b>. Обычный <code>p.Name()</code> вообще не скомпилировался бы.',
      verify: { kind: "exec", run: "dotnet run", expect: "artist chef" }, sourceRefs: ["clr-ch13"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class SimpleType : IDisposable { public void Dispose() =&gt; Console.Write("public Dispose "); void IDisposable.Dispose() =&gt; Console.Write("IDisposable Dispose"); }</code><br/><code>var st = new SimpleType(); st.Dispose(); ((IDisposable)st).Dispose();</code> — что напечатает?',
      options: ["public Dispose IDisposable Dispose", "public Dispose public Dispose", "IDisposable Dispose IDisposable Dispose", "IDisposable Dispose public Dispose"], correctIndex: 0, xp: 10,
      okText: 'public-член и EIMI — <b>две разные записи</b>. <code>st.Dispose()</code> зовёт public-версию, <code>((IDisposable)st).Dispose()</code> — приватную EIMI. «когда компилятор создает метаданные для метода, он назначает ему <span class="hl">закрытый уровень доступа (private)</span>».',
      noText: 'При явной реализации public-член и интерфейсный член расходятся: <code>st.Dispose()</code> → «public Dispose », приведение к <code>IDisposable</code> → «IDisposable Dispose». Вывод: <b>public Dispose IDisposable Dispose</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "public Dispose IDisposable Dispose" }, sourceRefs: ["clr-ch13"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>interface IShape { double Area(); } class Sq : IShape { public double Area() =&gt; 4; } class Ci : IShape { public double Area() =&gt; 3; }</code><br/><code>var shapes = new List&lt;IShape&gt;{ new Sq(), new Ci() }; double s = 0; foreach (var x in shapes) s += x.Area(); Console.WriteLine(s);</code> — что напечатает?',
      options: ["7", "12", "4", "3"], correctIndex: 0, xp: 10,
      okText: 'Интерфейсный вызов <code>x.Area()</code> — <b>виртуальный</b>: «вызывается реализация, связанная с типом самого объекта». Для <code>Sq</code> это 4, для <code>Ci</code> — 3, сумма = <span class="hl">7</span>. Полиморфизм через интерфейс, а не через тип переменной.',
      noText: 'Диспетчеризация идёт по типу объекта в списке: <code>Sq.Area()</code>=4, <code>Ci.Area()</code>=3. <code>4 + 3 = 7</code>. «CLR требует, чтобы интерфейсные методы были виртуальными».',
      verify: { kind: "exec", run: "dotnet run", expect: "7" }, sourceRefs: ["clr-ch13"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Интерфейсный вызов виртуален", v: '«CLR требует, чтобы интерфейсные методы были виртуальными», и «При вызове интерфейсного метода объекта <b>вызывается реализация, связанная с типом самого объекта</b>» — через слот интерфейса в таблице методов. Отсюда полиморфизм по интерфейсу (замер: сумма Area() = 7).' },
    { icon: "cost", k: "EIMI = private → скрыт", v: 'Явная реализация: «он назначает ему <b>закрытый уровень доступа (private)</b>… Единственный способ вызвать интерфейсный метод — обратиться через переменную этого интерфейсного типа». Обычный <code>obj.Method()</code> его не видит — только приведение (замер: <code>artist chef</code>).' },
    { icon: "avoid", k: "EIMI не виртуален", v: '«EIMI-метод не может быть виртуальным, а значит, его нельзя переопределить… это всего лишь средство связывания интерфейса… с типом». Он решает коллизию имён двух интерфейсов и прячет член от внешнего API типа.' },
  ],

  foot: 'урок · <b>диспетчеризация интерфейса</b> · 5 анимир. разборов · виртуальность · таблица методов · EIMI=private · панель artist/chef · источник <b>Рихтер, CLR via C#, гл.13</b> · дизайн <b>mid</b>',
};
