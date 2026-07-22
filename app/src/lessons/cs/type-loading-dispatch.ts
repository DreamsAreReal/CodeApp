/**
 * Lesson: type loading and dispatch (CS.S13.type-loading-dispatch) — expert density, 5 animated
 * deep-dives. Book-sourced (Richter, CLR via C#, 4th ed., ch. 4 «Основы типов»). When the JIT
 * compiles a method, it finds every type the method references and the CLR loads those assemblies
 * and BUILDS the type objects (each with its static fields + a method table of entry points). Then
 * every call resolves through a type object: a static call → the defining type's type object; a
 * non-virtual instance call → the compile-time type's table; a VIRTUAL call → the type object the
 * instance's header points at (so the override runs). COMPLEMENTS CS.S13.object-header-layout (which
 * established the header + type-object pointer) and CS.S1.classes-virtual-dispatch (the C# language
 * angle) — here the subject is how the CLR PREPARES the type object and RESOLVES a method through it.
 *
 * SIGNATURE machine panel (s5): the type system closes on itself. A type object is itself a heap
 * object, so it too has a type-object pointer — and it points at System.Type; System.Type's own
 * type-object pointer points at ITSELF (the recursion terminates). REAL run-csharp measurements
 * (this file's exec cards, app backend :5080): a virtual call resolves to the override (Manager);
 * a type object IS an instance of System.Type (True); System.Type's type object references itself
 * (ReferenceEquals(t.GetType(), t.GetType().GetType()) == True). No fabricated internal number.
 *
 * BOOK PROVENANCE (replaces the URL-verbatim rule):
 *   - Every « » passage is VERBATIM RUSSIAN from clr-book.txt (ch. 4, «Как разные компоненты
 *     взаимодействуют во время выполнения» + the System.Type recursion at the end of ch. 4),
 *     substring-checked (wrap/soft-hyphen/compound-hyphen normalized). No translation gloss.
 *   - Exec-card expects are REAL, DETERMINISTIC run-csharp stdout:
 *     c1 "Manager" (virtual call resolves through the method table to the override) ·
 *     c2 "True" (a type object is itself an instance of System.Type) ·
 *     c3 "True" (System.Type's type object references itself — the recursion the book describes).
 *   - The method-table slots + the JIT-on-lookup patch are taught FROM THE BOOK (quoted) — internal,
 *     not directly readable; the dispatch RESULT + the type-object-of-a-type-object are proven by exec.
 *   - .NET 10 note: the type object + method table, virtual dispatch through the method table, and
 *     System.Type as the type object of every type object are TIMELESS CLR internals unchanged in .NET 10.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S13.type-loading-dispatch/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: JIT compiling a method finds referenced types → CLR loads assemblies + builds type objects.
const Z_JITM: Zone = { id: "jitm", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "JIT МЕТОДА M3", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "находит типы в коде", subCls: "vz-zsub", subY: 47 };
const Z_LOADED: Zone = { id: "loaded", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ОБЪЕКТЫ-ТИПЫ ПОСТРОЕНЫ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "Employee, Manager…", subCls: "vz-zsub good", subY: 47 };
const LOAD_ZONES: Zone[] = [Z_JITM, Z_LOADED];

// s2: the type object holds static fields + a method table of entry points.
const Z_TO: Zone = { id: "to", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone good", label: "ОБЪЕКТ-ТИП: СТАТИКА + ТАБЛИЦА МЕТОДОВ", labelCls: "vz-zlabel good", lx: 170, ly: 22, sub: "запись на каждый метод типа → точка входа", subCls: "vz-zsub good", subY: 40 };
const TO_ZONES: Zone[] = [Z_TO];

// s3: three call kinds resolve through a type object (static / non-virtual / virtual).
const Z_KIND: Zone = { id: "kind", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ВИД ВЫЗОВА", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "static / non-virt / virt", subCls: "vz-zsub", subY: 47 };
const Z_RESOLVE: Zone = { id: "resolve", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ЧЕРЕЗ КАКОЙ ОБЪЕКТ-ТИП", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "какая таблица методов", subCls: "vz-zsub good", subY: 47 };
const RESOLVE_ZONES: Zone[] = [Z_KIND, Z_RESOLVE];

// s4: virtual dispatch — CLR follows the instance's type-object pointer, then its method table.
const Z_VAR: Zone = { id: "var", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Employee e = new Manager()", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "e.R() виртуальный", subCls: "vz-zsub", subY: 47 };
const Z_MT: Zone = { id: "mt", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ТАБЛИЦА МЕТОДОВ Manager", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "override R()", subCls: "vz-zsub good", subY: 47 };
const VIRT_ZONES: Zone[] = [Z_VAR, Z_MT];

// s5 (SIGNATURE): the type system closes — a type object's type is System.Type, which is its own type.
const Z_SELF: Zone = { id: "self", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ОБЪЕКТ-ТИП C", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "тоже объект → есть objptr", subCls: "vz-zsub heap", subY: 47 };
const Z_STYPE: Zone = { id: "stype", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "System.Type", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "тип всех объектов-типов", subCls: "vz-zsub good", subY: 47 };
const SELF_ZONES: Zone[] = [Z_SELF, Z_STYPE];

export const typeLoadingDispatch: LessonData = {
  id: "CS.S13.type-loading-dispatch",
  track: "CS",
  section: "CS.S13",
  module: "S13.5",
  lang: "csharp",
  title: "Загрузка типа и диспетчеризация: объект-тип, таблица методов",
  kicker: "CLR внутри · S13 · загрузка и вызов",
  home: { subtitle: "CLR строит объект-тип при JIT; static/non-virt/virt через таблицу методов", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "clr-ch4", kind: "book", org: "Джеффри Рихтер", title: "CLR via C#, 4-е изд., гл. 4 «Основы типов»", url: "", date: "2013" },
  ],

  spec: [
    { text: "CLR строит объекты-типы при JIT метода: «выявляет все типы, на которые есть ссылки в M3»… а затем «CLR получает информацию о типах и создает структуры данных, собственно и представляющие эти типы».", source: "clr-ch4" },
  ],
  edgeCases: [
    { text: "У объекта-типа есть <b>таблица методов</b>: «у каждого объекта-типа есть таблица методов с входными точками всех методов, определенных в типе». В <code>Employee</code> три метода → три записи; в <code>Manager</code> один переопределённый — своя запись.", source: "clr-ch4" },
    { text: "<b>Виртуальный</b> вызов идёт через заголовок экземпляра: «CLR проверяет у объекта внутренний указатель на объект-тип. Затем CLR находит в таблице методов объекта-типа запись вызываемого метода» — поэтому у <code>Employee e = new Manager()</code> выполнится override из <code>Manager</code> (собственный прогон: <code>Manager</code>).", source: "clr-ch4" },
    { text: "Система типов замыкается на себя: указатель на объект-тип у самого <code>System.Type</code> — «А ссылается он на самого себя», так как объект-тип System.Type сам по себе является экземпляром объекта-типа (собственный прогон: <code>ReferenceEquals(t.GetType(), t.GetType().GetType())</code> = True).", source: "clr-ch4" },
  ],

  misconceptions: [
    {
      wrong: "тип просто существует в рантайме, а виртуальный вызов — это какая-то магия компилятора, не связанная с объектом в куче",
      hook: 'Нет. Объект-тип <b>строит CLR</b> — лениво, когда JIT компилирует метод: «выявляет все типы, на которые есть ссылки в M3»… а затем «CLR получает информацию о типах и <span class="hl">создает структуры данных, собственно и представляющие эти типы</span>». В каждом таком объекте-типе — статика и <b>таблица методов</b>: «у каждого объекта-типа есть таблица методов с входными точками всех методов, определенных в типе». И виртуальный вызов — не магия, а <b>два шага через заголовок</b>: «CLR проверяет у объекта внутренний указатель на объект-тип. Затем CLR находит в таблице методов объекта-типа запись вызываемого метода» — вот почему <code>Employee e = new Manager()</code> вызывает override из <code>Manager</code>. Дальше <b>пять разборов</b>: загрузка типа при JIT, содержимое объекта-типа, три вида вызова, механика виртуальной диспетчеризации, и <b>машинная панель</b> — как система типов замыкается на <code>System.Type</code> (реальный прогон: объект-тип — экземпляр System.Type, который ссылается сам на себя → True).',
      source: "clr-ch4",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Загрузка типа при JIT", title: "JIT метода находит типы → CLR строит объекты-типы",
      viewBox: "0 0 340 210", zones: LOAD_ZONES,
      code: ["// JIT компилирует M3; в коде M3 упомянуты Employee, Manager, ...", "// 1) CLR грузит сборки, где определены эти типы", "// 2) по метаданным CLR строит СТРУКТУРЫ, представляющие типы", "//    — это и есть объекты-типы (создаются один раз)"],
      scenes: [
        { codeLine: 0, out: "", caption: 'JIT компилирует <code>M3</code> и <span class="hl">выявляет все типы</span>, на которые ссылается код: <code>Employee</code>, <code>Manager</code>, <code>Int32</code>, <code>String</code>.', nodes: [{ id: "m3", kind: "obj", at: { zone: "jitm", row: 0 }, typeTag: "JIT M3", value: "нашёл типы", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'CLR обеспечивает <b>загрузку сборок</b>, где определены эти типы, в домен приложений.', nodes: [{ id: "m3", kind: "obj", at: { zone: "jitm", row: 0 }, typeTag: "JIT M3", value: "нашёл типы" }, { id: "asm", kind: "gate", at: { zone: "jitm", row: 1 }, state: "ok", label: "сборки", detail: "загружены", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'По метаданным CLR «создает структуры данных, собственно и представляющие эти типы» — это <span class="hl">объекты-типы</span> <code>Employee</code> и <code>Manager</code>.', nodes: [{ id: "m3", kind: "obj", at: { zone: "jitm", row: 0 }, typeTag: "JIT M3", value: "нашёл типы" }, { id: "emp", kind: "obj", at: { zone: "loaded", row: 0 }, typeTag: "объект-тип", value: "Employee", accent: true }, { id: "mgr", kind: "obj", at: { zone: "loaded", row: 1 }, typeTag: "объект-тип", value: "Manager", accent: true }], edges: [{ id: "e1", from: "m3", to: "emp", accent: true }] },
      ],
      explain: 'Объекты-типы не существуют заранее и вечно — CLR строит их <b>по требованию</b>, когда JIT компилирует метод, который на них ссылается. Дословно: «<span class="hl">выявляет все типы, на которые есть ссылки в M3</span>»… далее «CLR обеспечивает загрузку в домен приложений всех сборок, в которых определены все эти типы. Затем, используя метаданные сборки, CLR получает информацию о типах и <b>создает структуры данных, собственно и представляющие эти типы</b>». Часто используемые типы (<code>Int32</code>, <code>String</code>) обычно уже построены. Так метаданные (урок 3) превращаются в живые рантайм-структуры: строка <code>TypeDef</code> → объект-тип в куче. Что именно в этом объекте-типе — разбор 02.',
      sources: ["clr-ch4"],
    },
    {
      id: "s2", num: "02", kicker: "Содержимое объекта-типа", title: "Статические поля + таблица методов (точки входа)",
      viewBox: "0 0 340 276", zones: TO_ZONES,
      code: ["class Employee {", "  public Int32 GetYearsEmployed() {...}      // запись 1", "  public virtual String GenProgressReport(){...} // запись 2", "  public static Employee Lookup(String n) {...}  // запись 3", "}  // → таблица методов объекта-типа Employee: 3 записи"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Объект-тип хранит <b>статические поля</b> типа: «Байты для этих статических полей выделяются в составе самих объектов-типов».', nodes: [{ id: "stat", kind: "obj", at: { zone: "to", row: 0 }, typeTag: "статика", value: "static-поля типа", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'И <b>таблицу методов</b>: «у каждого объекта-типа есть таблица методов с <span class="hl">входными точками всех методов</span>, определенных в типе». Каждая запись → адрес реализации.', nodes: [{ id: "stat", kind: "obj", at: { zone: "to", row: 0 }, typeTag: "статика", value: "static-поля типа" }, { id: "mt", kind: "obj", at: { zone: "to", row: 1 }, typeTag: "таблица методов", value: "запись → точка входа", accent: true }], edges: [] },
        { codeLine: 4, out: "", caption: 'В <code>Employee</code> три метода → <span class="hl">три записи</span>: «в соответствующей таблице методов есть три записи». Изначально запись указывает на JITCompiler.', nodes: [{ id: "stat", kind: "obj", at: { zone: "to", row: 0 }, typeTag: "статика", value: "static-поля типа" }, { id: "mt", kind: "obj", at: { zone: "to", row: 1 }, typeTag: "таблица методов", value: "запись → точка входа" }, { id: "three", kind: "chip", at: { zone: "to", row: 2 }, value: "GetYears · GenReport · Lookup", accent: true }], edges: [] },
      ],
      explain: 'Объект-тип — не пустая метка, а структура с двумя главными частями. Статика: «Байты для этих статических полей выделяются в составе самих объектов-типов» — вот почему статические поля общие на весь тип (они физически в одном объекте-типе). Методы: «Наконец, <b>у каждого объекта-типа есть таблица методов</b> с входными точками всех методов, определенных в типе. Эта таблица методов уже обсуждалась в главе 1». Число записей = число методов: «Так как в типе Employee определены три метода (GetYearsEmployed, GenProgressReport и Lookup), в соответствующей таблице методов есть <span class="hl">три записи</span>. В типе Manager определен один метод… который и представлен в таблице методов этого типа». Каждая запись — точка входа: сперва на <code>JITCompiler</code>, после первого вызова — на нативный код (урок 2). Это тот же method table, что и в <code>CS.S1.classes-virtual-dispatch</code>, но здесь — как поле объекта-типа.',
      sources: ["clr-ch4"],
    },
    {
      id: "s3", num: "03", kicker: "Три вида вызова", title: "static / невиртуальный / виртуальный — через какой объект-тип",
      viewBox: "0 0 340 210", zones: RESOLVE_ZONES,
      code: ["Employee.Lookup(\"Joe\");   // static → объект-тип, где ОПРЕДЕЛЁН метод", "e.GetYearsEmployed();     // невирт. → объект-тип типа переменной", "e.GenProgressReport();    // ВИРТ. → объект-тип, на который смотрит e"],
      scenes: [
        { codeLine: 0, out: "", caption: '<b>Статический</b> вызов: «CLR определяет местонахождение объекта-типа, соответствующего типу, в котором <span class="hl">определен статический метод</span>» — и его таблицу методов.', nodes: [{ id: "s", kind: "obj", at: { zone: "kind", row: 0 }, typeTag: "static", value: "Lookup", accent: true }, { id: "sd", kind: "obj", at: { zone: "resolve", row: 0 }, typeTag: "объект-тип", value: "где определён", accent: true }], edges: [{ id: "e1", from: "s", to: "sd", accent: true }] },
        { codeLine: 1, out: "", caption: '<b>Невиртуальный</b> экземплярный: резолвится по <span class="hl">compile-time типу</span> переменной (тут <code>Employee</code>) — без обращения к заголовку.', nodes: [{ id: "s", kind: "obj", at: { zone: "kind", row: 0 }, typeTag: "static", value: "Lookup" }, { id: "nv", kind: "obj", at: { zone: "kind", row: 1 }, typeTag: "non-virt", value: "GetYears", accent: true }, { id: "nvd", kind: "obj", at: { zone: "resolve", row: 1 }, typeTag: "объект-тип", value: "тип переменной", accent: true }], edges: [{ id: "e2", from: "nv", to: "nvd", accent: true }] },
        { codeLine: 2, out: "", caption: '<b>Виртуальный</b>: через <span class="hl">заголовок экземпляра</span> — объект-тип, на который реально указывает <code>e</code> (тут <code>Manager</code>). Отсюда override.', nodes: [{ id: "v", kind: "obj", at: { zone: "kind", row: 0 }, typeTag: "virtual", value: "GenReport", accent: true }, { id: "vd", kind: "gate", at: { zone: "resolve", row: 0 }, state: "ok", label: "по заголовку e", detail: "→ Manager", accent: true }], edges: [{ id: "e3", from: "v", to: "vd", accent: true }] },
      ],
      explain: 'Все три вида вызова резолвятся через объект-тип, но через <b>разный</b>. Статический: «При вызове этого метода CLR <span class="hl">определяет местонахождение объекта-типа, соответствующего типу, в котором определен статический метод</span>. Затем на основании таблицы методов объекта-типа среда CLR находит точку входа в вызываемый метод». Невиртуальный экземплярный — по compile-time типу переменной (объект-тип известен статически). Виртуальный — по <b>рантайм</b> типу из заголовка экземпляра: сначала CLR идёт по ссылке переменной к объекту, потом читает его указатель на объект-тип. Разница между невиртуальным и виртуальным — ровно в том, <b>чей</b> объект-тип берётся: типа переменной или типа реального объекта. Механику виртуального разберём отдельно (разбор 04).',
      sources: ["clr-ch4"],
    },
    {
      id: "s4", num: "04", kicker: "Виртуальная диспетчеризация", title: "CLR идёт по заголовку экземпляра, потом в его таблицу методов",
      viewBox: "0 0 340 210", zones: VIRT_ZONES,
      code: ["Employee e = new Manager();   // e типа Employee, объект — Manager", "e.GenProgressReport();        // виртуальный вызов", "// 1) по ссылке e → объект Joe (типа Manager)", "// 2) читаем указатель на объект-тип → Manager", "// 3) в таблице методов Manager ищем запись → override"],
      predictAt: 1, predictQ: 'Переменная <code>e</code> имеет тип <code>Employee</code>, но объект — <code>Manager</code> с override. Какой <code>R()</code>/<code>GenProgressReport()</code> вызовется при виртуальном вызове — из Employee или из Manager?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>e</code> статически <code>Employee</code>, но в куче — объект <code>Manager</code>, чей заголовок указывает на объект-тип <code>Manager</code>.', nodes: [{ id: "e", kind: "obj", at: { zone: "var", row: 0 }, typeTag: "e: Employee", value: "→ объект Manager", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Шаг 1-2: «CLR обращается к переменной… и затем следует по адресу вызывающего объекта… <span class="hl">CLR проверяет у объекта внутренний указатель на объект-тип</span>».', nodes: [{ id: "e", kind: "obj", at: { zone: "var", row: 0 }, typeTag: "e: Employee", value: "→ объект Manager" }, { id: "ptr", kind: "gate", at: { zone: "var", row: 1 }, state: "ok", label: "objptr", detail: "→ Manager", accent: true }], edges: [] },
        { codeLine: 4, out: "", caption: 'Шаг 3: «CLR находит в таблице методов объекта-типа запись вызываемого метода» — в <code>Manager</code> это <span class="hl">override</span>. Вызовется реализация <code>Manager</code>.', nodes: [{ id: "e", kind: "obj", at: { zone: "var", row: 0 }, typeTag: "e: Employee", value: "→ объект Manager" }, { id: "mt", kind: "obj", at: { zone: "mt", row: 0 }, typeTag: "method table", value: "override R()", accent: true }, { id: "run", kind: "gate", at: { zone: "mt", row: 1 }, state: "ok", label: "вызов", detail: "Manager.R()", accent: true }], edges: [{ id: "e1", from: "e", to: "mt", accent: true }] },
      ],
      explain: 'Виртуальная диспетчеризация — это <b>три конкретных шага</b> через заголовок, а не магия. Дословно: «При вызове виртуального экземплярного метода CLR приходится выполнять некоторую дополнительную работу. Во-первых, CLR обращается к переменной, используемой для вызова, и затем следует по адресу вызывающего объекта… Во-вторых, <span class="hl">CLR проверяет у объекта внутренний указатель на объект-тип. Затем CLR находит в таблице методов объекта-типа запись вызываемого метода</span>, обрабатывает код JIT-компилятором (при необходимости) и вызывает полученный машинный код. В нашем случае вызывается реализация метода GenProgressReport в Manager, потому что e ссылается на объект Manager». Ключ — шаг «указатель на объект-тип»: берётся объект-тип <b>реального</b> объекта (из заголовка), а не типа переменной. Книга подчёркивает контраст: «если метод Lookup… обнаружит, что Joe — это всего лишь Employee… это приведет к тому, что выполнится реализация GenProgressReport из Employee, а не из Manager». Тот же объект-тип, что мы разбирали как поле заголовка (урок 4), — это точка, где живёт полиморфизм.',
      sources: ["clr-ch4"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · система замыкается", title: "Объект-тип — тоже объект; его тип — System.Type, ссылающийся на себя",
      viewBox: "0 0 340 210", zones: SELF_ZONES,
      code: ["Type t = typeof(int);", "// объект-тип int — сам объект в куче, у него тоже есть objptr", "Console.WriteLine(typeof(Type).IsAssignableFrom(t.GetType()));", "Console.WriteLine(object.ReferenceEquals(t.GetType(), t.GetType().GetType()));"],
      predictAt: 2, predictQ: 'Объект-тип — сам объект, значит у него тоже есть указатель на объект-тип. На что он указывает? И на что указывает объект-тип System.Type?',
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Объект-тип <code>C</code> — <b>сам объект</b> в куче: «объекты-типы тоже являются объектами». Значит у него тоже есть указатель на объект-тип.', nodes: [{ id: "c", kind: "obj", at: { zone: "self", row: 0 }, typeTag: "объект-тип C", value: "objptr → ?", accent: true }], edges: [] },
        { codeLine: 2, out: "True", caption: 'Он указывает на <span class="hl">System.Type</span>: указатели объектов-типов «инициализируются ссылкой на объект-тип System.Type». Прогон: объект-тип — экземпляр <code>System.Type</code> → True.', nodes: [{ id: "c", kind: "obj", at: { zone: "self", row: 0 }, typeTag: "объект-тип C", value: "objptr →" }, { id: "st", kind: "obj", at: { zone: "stype", row: 0 }, typeTag: "System.Type", value: "тип объектов-типов", accent: true }], edges: [{ id: "e1", from: "c", to: "st", accent: true }] },
        { codeLine: 3, out: "True", caption: 'А objptr самого <code>System.Type</code> «ссылается он на <span class="hl">самого себя</span>» — рекурсия замыкается. Прогон: <code>t.GetType() == t.GetType().GetType()</code> → True.', nodes: [{ id: "st", kind: "obj", at: { zone: "stype", row: 0 }, typeTag: "System.Type", value: "objptr → сам себя", accent: true }, { id: "loop", kind: "gate", at: { zone: "stype", row: 1 }, state: "ok", label: "рекурсия", detail: "замкнута", accent: true }], edges: [{ id: "self", from: "st", to: "st", accent: true }] },
      ],
      explain: 'Это машинная панель урока — система типов замыкается на себя, и это видно замером. Объект-тип сам живёт в куче: «объекты-типы тоже являются объектами», значит и у него есть заголовок с указателем на объект-тип. На что он указывает? При запуске «CLR сразу же создает специальный объект-тип для типа System.Type», и указатели объектов-типов Employee и Manager «инициализируются ссылкой на объект-тип System.Type». А сам <code>System.Type</code>? Его объект-тип «также содержит указатель на объект-тип», и вот куда: «<b>А ссылается он на самого себя</b>», так как объект-тип System.Type сам по себе является экземпляром объекта-типа. Прогон подтверждает обе вещи: объект-тип — экземпляр <code>System.Type</code> (True), а объект-тип <code>System.Type</code> ссылается сам на себя (<code>ReferenceEquals(t.GetType(), t.GetType().GetType())</code> = True). Вот где рекурсия тип-у-типа останавливается — на <code>System.Type</code>. И «метод GetType… просто возвращает адрес, хранящийся в указателе на объект-тип» — та же дверь, что открывает reflection.',
      sources: ["clr-ch4"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Employee{ public virtual string R()=&gt;"Employee"; }</code><br/><code>class Manager:Employee{ public override string R()=&gt;"Manager"; }</code><br/><code>Employee e=new Manager(); Console.WriteLine(e.R());</code> — что напечатает?',
      options: ["Manager", "Employee", "Employee.R", "R"], correctIndex: 0, xp: 10,
      okText: 'Виртуальный вызов идёт через заголовок: «CLR проверяет у объекта внутренний указатель на объект-тип. Затем CLR находит в таблице методов объекта-типа запись». Объект — <code>Manager</code>, его таблица содержит <span class="hl">override</span> → <b>Manager</b>.',
      noText: 'Тип переменной <code>Employee</code>, но диспетчеризация — по объекту-типу <b>реального</b> объекта (из заголовка). Объект — <code>Manager</code> с override → печатает <b>Manager</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Manager" }, sourceRefs: ["clr-ch4"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class C{} Type t = typeof(C);</code><br/><code>Console.WriteLine(typeof(Type).IsAssignableFrom(t.GetType()));</code> — что напечатает?',
      options: ["True", "False", "C", "System.Type"], correctIndex: 0, xp: 10,
      okText: 'Объект-тип — <b>сам объект</b>, и его тип это <code>System.Type</code>: объекты-типы являются его экземплярами, а их указатели «инициализируются ссылкой на объект-тип System.Type». Значит <code>t.GetType()</code> присваиваемо к <code>Type</code> → <span class="hl">True</span>.',
      noText: 'Объект-тип живёт в куче как обычный объект, а его объект-тип — <code>System.Type</code>. Поэтому <code>t.GetType()</code> — это Type (точнее RuntimeType : Type) → <b>True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True" }, sourceRefs: ["clr-ch4"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>Type t = typeof(int);</code><br/><code>Console.WriteLine(object.ReferenceEquals(t.GetType(), t.GetType().GetType()));</code> — что напечатает?',
      options: ["True", "False", "RuntimeType", "System.Type"], correctIndex: 0, xp: 10,
      okText: 'Рекурсия тип-у-типа замыкается на <code>System.Type</code>: его объект-тип «ссылается он на <span class="hl">самого себя</span>». Поэтому <code>t.GetType()</code> и <code>t.GetType().GetType()</code> — одна ссылка → <b>True</b>.',
      noText: '<code>t.GetType()</code> даёт объект-тип для типа t (это System.Type/RuntimeType), а его <code>.GetType()</code> — тот же самый объект-тип, потому что System.Type ссылается на себя. Вывод: <b>True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True" }, sourceRefs: ["clr-ch4"],
    },
  ],

  takeaways: [
    { icon: "why", k: "CLR строит объект-тип при JIT", v: '«выявляет все типы, на которые есть ссылки… CLR получает информацию о типах и создает структуры данных, собственно и представляющие эти типы». В объекте-типе — статика + «таблица методов с входными точками всех методов, определенных в типе».' },
    { icon: "cost", k: "Виртуальный вызов = заголовок → method table", v: '«CLR проверяет у объекта внутренний указатель на объект-тип. Затем CLR находит в таблице методов объекта-типа запись вызываемого метода». Берётся объект-тип РЕАЛЬНОГО объекта → выполняется override (замер: <code>Employee e=new Manager(); e.R()</code> → Manager).' },
    { icon: "avoid", k: "Система замыкается на System.Type", v: 'Объект-тип — сам объект; его тип — <code>System.Type</code>, а тот «ссылается он на самого себя». Так рекурсия тип-у-типа останавливается (замер: объект-тип — экземпляр Type = True; <code>t.GetType()==t.GetType().GetType()</code> = True).' },
  ],

  foot: 'урок · <b>загрузка типа и диспетчеризация</b> · 5 анимир. разборов · объект-тип+method table · виртуальный вызов через заголовок · панель System.Type→себя · источник <b>Рихтер, CLR via C#, гл.4</b> · дизайн <b>mid</b>',
};
