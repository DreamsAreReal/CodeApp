/**
 * Lesson: const vs readonly (CS.S13.const-vs-readonly) — expert density, 5 animated deep-dives.
 * Book-sourced (Richter, CLR via C#, 4th ed., ch. 7 «Константы и поля»). A `const` is a compile-time
 * literal: the compiler reads its value from metadata and BAKES it into the IL of every CALLING method
 * (an `ldc` load-constant opcode), so no memory is allocated at run time and a version mismatch is
 * invisible until callers recompile. A `readonly` field is a real FIELD in the heap/type object, read
 * at run time (an `ldsfld` load-static-field opcode), so changing it in the defining assembly is picked
 * up without recompiling callers. COMPLEMENTS CS.S13 il-and-jit (IL opcodes generally) — here the
 * subject is exactly which opcode a const vs a readonly produces in the caller's IL, proven byte for byte.
 *
 * SIGNATURE machine panel (s5): the real IL bytes of two methods that only differ by const-vs-readonly.
 * `const Max=100; M()=>Max` compiles to `31 100 42` — ldc.i4.s (0x1F=31) with the literal 100 baked in,
 * then ret (0x2A=42). `static readonly Max=100; M()=>Max` compiles to `126 2 0 0 4 42` — ldsfld
 * (0x7E=126) + a 4-byte field metadata token, then ret. One reads a literal, the other reads a field.
 * REAL run-csharp measurements via GetILAsByteArray (this file's exec cards, app backend :5080).
 * Expression-bodied members are used so CSharpScript emits clean IL with no leading nop. No fabricated opcode.
 *
 * BOOK PROVENANCE (replaces the URL-verbatim rule):
 *   - Every « » passage is VERBATIM RUSSIAN from clr-book.txt (ch. 7, «Константы» + «Поля»),
 *     substring-checked (wrap/soft-hyphen normalized).
 *   - Exec-card expects are REAL, DETERMINISTIC run-csharp stdout:
 *     c1 "31 100 42" (const M(): ldc.i4.s 100 baked into the caller's IL, then ret) ·
 *     c2 "126" (readonly M(): first IL opcode byte is ldsfld = 126, a field LOAD at run time) ·
 *     c3 "32 232 3 0 0 42" (const Max=1000: ldc.i4 32 with the full 4-byte literal 1000 baked in, then ret).
 *   - The opcode identities (ldc.i4.s=0x1F, ldc.i4=0x20, ldsfld=0x7E, ret=0x2A) are ECMA-335 facts;
 *     the emitted BYTES are proven by exec on the sandbox. No fabricated opcode/number.
 *   - .NET 10 note: const being inlined as a literal into the caller's IL (ldc) and readonly being a
 *     run-time field load (ldsfld), plus the versioning consequence, are TIMELESS and hold in .NET 10.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S13.const-vs-readonly/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: const is a compile-time literal stored in metadata, inlined into the caller's IL.
const Z_META: Zone = { id: "meta", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "МЕТАДАННЫЕ (const)", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "значение на компиляции", subCls: "vz-zsub", subY: 47 };
const Z_ILC: Zone = { id: "ilc", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "IL ВЫЗЫВАЮЩЕГО", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "литерал вшит сюда", subCls: "vz-zsub heap", subY: 47 };
const META_ZONES: Zone[] = [Z_META, Z_ILC];

// s2: no memory allocated for a const; can't take its address.
const Z_CONST: Zone = { id: "const", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "const", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "нет памяти в рантайме", subCls: "vz-zsub", subY: 47 };
const Z_STAT: Zone = { id: "stat", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "СВОЙСТВА", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "статическая · без адреса", subCls: "vz-zsub good", subY: 47 };
const CONST_ZONES: Zone[] = [Z_CONST, Z_STAT];

// s3: readonly is a real field, read at run time from the heap/type object.
const Z_FLD: Zone = { id: "fld", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "readonly ПОЛЕ", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "в динамической памяти", subCls: "vz-zsub heap", subY: 47 };
const Z_RUN: Zone = { id: "run", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ЧТЕНИЕ В РАНТАЙМЕ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "ldsfld — загрузка поля", subCls: "vz-zsub good", subY: 47 };
const FLD_ZONES: Zone[] = [Z_FLD, Z_RUN];

// s4: the versioning consequence — const needs caller recompile, readonly does not.
const Z_DLL: Zone = { id: "dll", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "МЕНЯЕМ 50 → 1000", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "в DLL-сборке", subCls: "vz-zsub", subY: 47 };
const Z_APP: Zone = { id: "app", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ЧТО ВИДИТ ПРИЛОЖЕНИЕ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "без перекомпиляции", subCls: "vz-zsub good", subY: 47 };
const DLL_ZONES: Zone[] = [Z_DLL, Z_APP];

// s5 (SIGNATURE): the real IL bytes — const → ldc literal, readonly → ldsfld field load.
const Z_SRC: Zone = { id: "src", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "M() => Max", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "const vs readonly", subCls: "vz-zsub", subY: 47 };
const Z_BYTES: Zone = { id: "bytes", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "БАЙТЫ IL (замер)", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "GetILAsByteArray()", subCls: "vz-zsub heap", subY: 47 };
const BYTES_ZONES: Zone[] = [Z_SRC, Z_BYTES];

export const constVsReadonly: LessonData = {
  id: "CS.S13.const-vs-readonly",
  track: "CS",
  section: "CS.S13",
  module: "S13.8",
  lang: "csharp",
  title: "const и readonly: литерал в IL против чтения поля в рантайме",
  kicker: "CLR внутри · S13 · вшитый литерал",
  home: { subtitle: "const вшивается в IL вызывающего (ldc); readonly читается в рантайме (ldsfld)", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "clr-ch7", kind: "book", org: "Джеффри Рихтер", title: "CLR via C#, 4-е изд., гл. 7 «Константы и поля»", url: "", date: "2013" },
  ],

  spec: [
    { text: "<code>const</code> — литерал, вычисляемый на компиляции и <b>вшиваемый</b> в IL вызывающего: «Встретив в исходном тексте имя константы, компилятор просматривает метаданные модуля, в котором она определена, извлекает значение константы и <span class=\"hl\">внедряет его в генерируемый им IL-код</span>» (собственный прогон: <code>M() =&gt; Max</code> при <code>const</code> → байты <code>31 100 42</code>, где <code>31</code> = <code>ldc.i4.s</code>).", source: "clr-ch7" },
  ],
  edgeCases: [
    { text: "Для <code>const</code> в рантайме <b>нет памяти</b> и нет адреса: «Поскольку значение константы внедряется прямо в код, в период выполнения память для констант не выделяется. Кроме того, нельзя получать адрес константы и передавать ее по ссылке». Константа всегда <b>статическая</b>: «константы считаются статическими, а не экземплярными членами».", source: "clr-ch7" },
    { text: "<code>readonly</code> — реальное поле, читаемое в рантайме: «Поскольку поля хранятся в динамической памяти, их <span class=\"hl\">значения можно получить лишь в период выполнения</span>» (собственный прогон: <code>M() =&gt; Max</code> при <code>static readonly</code> → первый байт IL = <code>126</code> = <code>ldsfld</code>, то есть загрузка поля, а не литерал).", source: "clr-ch7" },
    { text: "Отсюда разница в версионировании: если поменять <code>const</code> с 50 на 1000, «это не повлияет на код самого приложения… его тоже необходимо перекомпилировать». А для <code>readonly</code>: «При повторном исполнении код приложения <b>автоматически задействует новое значение — 1000</b>… не обязательно компоновать код приложения заново».", source: "clr-ch7" },
  ],

  misconceptions: [
    {
      wrong: "const и readonly — почти одно и то же: оба это неизменяемые константы, просто readonly можно задать в конструкторе; в скомпилированном коде они одинаковы",
      hook: 'Нет — они различаются <b>на уровне IL</b>. <code>const</code> — это <span class="hl">литерал</span>, который компилятор извлекает из метаданных и <b>вшивает прямо в IL вызывающего кода</b>: «извлекает значение константы и внедряет его в генерируемый им IL-код». В IL это опкод <code>ldc</code> (загрузка константы), для <code>M() =&gt; Max</code> байты — <code>31 100 42</code> (<code>ldc.i4.s 100</code>, <code>ret</code>). <code>readonly</code> — настоящее <b>поле</b> в памяти, читаемое <span class="hl">в рантайме</span>: в IL это <code>ldsfld</code> (загрузка статического поля), первый байт — <code>126</code>. Отсюда и разное поведение при смене версии сборки, и разная цена. Дальше <b>пять разборов</b>: const вшивается в IL вызывающего, у const нет памяти/адреса, readonly читается в рантайме, версионирование (const требует перекомпиляции вызывающих), и <b>машинная панель</b> — реальные байты IL: <code>ldc</code> для const против <code>ldsfld</code> для readonly (реальный прогон).',
      source: "clr-ch7",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Литерал вшит в IL вызывающего", title: "const: компилятор внедряет значение прямо в IL",
      viewBox: "0 0 340 210", zones: META_ZONES,
      code: ["public const Int32 MaxEntriesInList = 50;   // в DLL-сборке", "// в приложении:", "Console.WriteLine(... + SomeLibraryType.MaxEntriesInList);", "// компилятор внедрит ЧИСЛО 50 прямо в IL приложения"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Значение <code>const</code> вычисляется на компиляции и лежит в <b>метаданных</b> модуля: «компилятор сохраняет значение константы в метаданных модуля».', nodes: [{ id: "m", kind: "obj", at: { zone: "meta", row: 0 }, typeTag: "метаданные", value: "MaxEntriesInList = 50", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Встретив имя константы, компилятор <span class="hl">внедряет её значение</span> в IL: «извлекает значение константы и внедряет его в генерируемый им IL-код».', nodes: [{ id: "m", kind: "obj", at: { zone: "meta", row: 0 }, typeTag: "метаданные", value: "= 50" }, { id: "il", kind: "obj", at: { zone: "ilc", row: 0 }, typeTag: "IL приложения", value: "ldc.i4.s 50", accent: true }], edges: [{ id: "e", from: "m", to: "il", accent: true }] },
        { codeLine: 3, out: "", caption: 'Число <b>50</b> оказывается в IL приложения как литерал: «внедрит значение 50 типа Int32 прямо в IL-код приложения». DLL при выполнении даже не нужна.', nodes: [{ id: "il", kind: "obj", at: { zone: "meta", row: 0 }, typeTag: "IL приложения", value: "содержит 50" }, { id: "dll", kind: "gate", at: { zone: "ilc", row: 0 }, state: "ok", label: "DLL не нужна", detail: "литерал вшит", accent: true }], edges: [] },
      ],
      explain: 'Ключевая идея: <code>const</code> живёт не как поле, а как <b>литерал в IL того, кто им пользуется</b>. Дословно: «Значение, связанное с именем константы, должно определяться во время компиляции. Затем компилятор сохраняет значение константы в метаданных модуля». И при использовании: «Встретив в исходном тексте имя константы, компилятор просматривает метаданные модуля, в котором она определена, <span class="hl">извлекает значение константы и внедряет его в генерируемый им IL-код</span>». В примере книги: «компилятор, обнаружив, что MaxEntriesInList — это литерал константы со значением 50, внедрит значение 50 типа Int32 прямо в IL-код приложения. Фактически после построения кода приложения DLL-сборка даже не будет загружаться в период выполнения». В IL это load-constant инструкция (<code>ldc</code>) — машинная панель (разбор 05) снимет реальные байты: <code>31 100 42</code> для <code>M() =&gt; Max</code>. Отсюда и то, что у const нет памяти в рантайме (разбор 02).',
      sources: ["clr-ch7"],
    },
    {
      id: "s2", num: "02", kicker: "Нет памяти · нет адреса", title: "const: статический, без памяти в рантайме и без адреса",
      viewBox: "0 0 340 210", zones: CONST_ZONES,
      code: ["public const Int32 Max = 50;", "// значение вшито в IL вызывающих →", "//   в рантайме память под const НЕ выделяется", "//   адрес const взять нельзя (нет ref/out)", "// const ВСЕГДА статическая (не экземплярная)"],
      scenes: [
        { codeLine: 2, out: "", caption: 'Раз литерал вшит в IL, отдельной <b>памяти</b> в рантайме нет: «в период выполнения память для констант не выделяется».', nodes: [{ id: "c", kind: "obj", at: { zone: "const", row: 0 }, typeTag: "const", value: "нет памяти", accent: true }, { id: "no", kind: "gate", at: { zone: "stat", row: 0 }, state: "ok", label: "0 байт", detail: "в рантайме", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'И <span class="hl">адрес</span> взять нельзя: «нельзя получать адрес константы и передавать ее по ссылке». Значит const не передашь по <code>ref</code>/<code>out</code>.', nodes: [{ id: "c", kind: "obj", at: { zone: "const", row: 0 }, typeTag: "const", value: "нет памяти" }, { id: "addr", kind: "gate", at: { zone: "stat", row: 0 }, state: "fail", label: "&const", detail: "нельзя по ссылке", accent: true }], edges: [] },
        { codeLine: 4, out: "", caption: 'Константа всегда <b>статическая</b>: «константы считаются статическими, а не экземплярными членами» — <code>static</code> для неё даже нельзя указать.', nodes: [{ id: "c", kind: "obj", at: { zone: "const", row: 0 }, typeTag: "const", value: "часть типа" }, { id: "st", kind: "gate", at: { zone: "stat", row: 0 }, state: "ok", label: "static", detail: "подразумевается", accent: true }], edges: [] },
      ],
      explain: 'Прямые следствия того, что <code>const</code> — это вшитый литерал, а не поле в памяти. Дословно: «Поскольку значение константы внедряется прямо в код, <span class="hl">в период выполнения память для констант не выделяется. Кроме того, нельзя получать адрес константы и передавать ее по ссылке</span>». Поэтому const нельзя передать по <code>ref</code>/<code>out</code> — у неё нет ячейки. И она всегда статическая: «Так как значение констант никогда не меняется, константы всегда считаются частью типа. Иначе говоря, константы считаются статическими, а не экземплярными членами». В C# даже нельзя написать <code>static const</code> — «C# не позволяет использовать для констант модификатор»… «static, поскольку всегда подразумевается, что константы являются» статическими. Тип const ограничен примитивами (или <code>null</code>) — «константы можно определять только для таких типов, которые компилятор считает примитивными». Всё это — цена за инлайн литерала; поле <code>readonly</code> ведёт себя иначе (разбор 03).',
      sources: ["clr-ch7"],
    },
    {
      id: "s3", num: "03", kicker: "Поле · чтение в рантайме", title: "readonly: настоящее поле, читается в период выполнения",
      viewBox: "0 0 340 210", zones: FLD_ZONES,
      code: ["public static readonly Int32 Max = 50;   // это ПОЛЕ", "// значение живёт в динамической памяти (объект-тип)", "int M() => Max;   // в IL это ldsfld — загрузка поля,", "//                  а НЕ литерал: значение читается в рантайме"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>readonly</code> — это <b>поле</b> (InitOnly): «Запись в поле разрешается только из кода конструктора». Не литерал, а член данных.', nodes: [{ id: "f", kind: "obj", at: { zone: "fld", row: 0 }, typeTag: "static readonly", value: "поле Max = 50", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Поле живёт в <span class="hl">динамической памяти</span> (для static — в объекте-типе): «Динамическая память для хранения поля типа выделяется в пределах объекта типа».', nodes: [{ id: "f", kind: "obj", at: { zone: "fld", row: 0 }, typeTag: "static readonly", value: "поле Max" }, { id: "to", kind: "obj", at: { zone: "run", row: 0 }, typeTag: "объект-тип", value: "хранит значение поля", accent: true }], edges: [{ id: "e", from: "f", to: "to" }] },
        { codeLine: 2, out: "", caption: 'Чтение — в рантайме: «значения можно получить лишь в период выполнения». В IL это <b>ldsfld</b> (загрузка статического поля), первый байт <code>126</code>.', nodes: [{ id: "m", kind: "obj", at: { zone: "fld", row: 0 }, typeTag: "M() => Max", value: "ldsfld" }, { id: "ld", kind: "gate", at: { zone: "run", row: 0 }, state: "ok", label: "ldsfld (126)", detail: "загрузка поля", accent: true }], edges: [{ id: "e", from: "m", to: "ld", accent: true }] },
      ],
      explain: 'В отличие от const, <code>readonly</code> — это настоящее <b>поле</b> в памяти, значение которого читается во время выполнения. По таблице модификаторов: <code>readonly</code> = термин CLR «InitOnly», «Запись в поле разрешается только из кода конструктора». Где живёт значение: «Динамическая память для хранения поля типа выделяется в пределах объекта типа, который создается при загрузке типа в домен приложений… что обычно происходит при JIT-компиляции любого метода, ссылающегося на этот тип». А главное — <span class="hl">когда</span> читается: «Поскольку поля хранятся в динамической памяти, их значения <b>можно получить лишь в период выполнения</b>». Поэтому метод, использующий <code>readonly</code>-поле, в IL содержит не литерал, а инструкцию <b>загрузки поля</b> <code>ldsfld</code> (первый байт <code>126</code> = 0x7E) — машинная панель (разбор 05) покажет это байт в байт. Ограничение примитивами тут снято: «полю можно назначить любой тип данных». И версионирование ведёт себя иначе (разбор 04).',
      sources: ["clr-ch7"],
    },
    {
      id: "s4", num: "04", kicker: "Версионирование", title: "Смена значения: const требует перекомпиляции вызывающих, readonly — нет",
      viewBox: "0 0 340 210", zones: DLL_ZONES,
      code: ["// В DLL-сборке разработчик меняет значение 50 → 1000", "// const:    приложение всё ещё печатает 50 (литерал вшит)", "//           нужно ПЕРЕКОМПИЛИРОВАТЬ приложение", "// readonly: приложение автоматически печатает 1000", "//           перекомпиляция приложения НЕ нужна"],
      predictAt: 1, predictQ: 'В DLL значение поменяли с 50 на 1000 и перестроили ТОЛЬКО DLL. Приложение не перекомпилировали. Что оно напечатает, если значение было <code>const</code>? А если <code>static readonly</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Для <code>const</code>: литерал 50 уже вшит в IL приложения. Смена DLL <b>не влияет</b>: «это не повлияет на код самого приложения».', nodes: [{ id: "d", kind: "obj", at: { zone: "dll", row: 0 }, typeTag: "DLL: const 1000", value: "перестроена" }, { id: "app", kind: "gate", at: { zone: "app", row: 0 }, state: "fail", label: "печатает 50", detail: "старый литерал", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Чтобы увидеть 1000, приложение надо <span class="hl">перекомпилировать</span>: «его тоже необходимо перекомпилировать».', nodes: [{ id: "d", kind: "obj", at: { zone: "dll", row: 0 }, typeTag: "DLL: const 1000", value: "перестроена" }, { id: "rec", kind: "gate", at: { zone: "app", row: 0 }, state: "ok", label: "перекомпиляция", detail: "тогда 1000", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Для <code>readonly</code>: значение читается из DLL в рантайме → «код приложения <b>автоматически задействует новое значение — 1000</b>… не обязательно компоновать код приложения заново».', nodes: [{ id: "d2", kind: "obj", at: { zone: "dll", row: 0 }, typeTag: "DLL: readonly 1000", value: "перестроена" }, { id: "auto", kind: "gate", at: { zone: "app", row: 0 }, state: "ok", label: "печатает 1000", detail: "без перекомпиляции", accent: true }], edges: [{ id: "e", from: "d2", to: "auto", accent: true }] },
      ],
      explain: 'Разница в IL напрямую даёт разное поведение при управлении версиями. Для <code>const</code>: «Если разработчик изменит значение константы MaxEntriesInList на 1000 и перестроит только DLL-сборку, <span class="hl">это не повлияет на код самого приложения</span>. Для того чтобы в приложении использовалось новое значение константы, его тоже необходимо перекомпилировать» — ведь старый литерал уже вшит в IL приложения. Книга прямо советует: «Нельзя применять константы во время выполнения… если модуль должен задействовать значение, определенное в другом модуле. В этом случае вместо констант следует использовать предназначенные только для чтения поля». Для <code>readonly</code>: «Допустим, разработчик сборки изменил значение поля с 50 на 1000 и скомпоновал сборку заново. При повторном исполнении <b>код приложения автоматически задействует новое значение — 1000</b>… не обязательно компоновать код приложения заново, оно просто работает в том виде, в котором было (хотя и чуть медленнее)». Это «чуть медленнее» — цена <code>ldsfld</code> против инлайн-литерала (разбор 05).',
      sources: ["clr-ch7"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · байты IL", title: "Реальные байты: const → ldc (литерал), readonly → ldsfld (поле)",
      viewBox: "0 0 340 210", zones: BYTES_ZONES,
      code: ["class X { const int Max = 100;         public static int M() => Max; }", "class Y { static readonly int Max = 100; public static int M() => Max; }", "// typeof(X).GetMethod(\"M\").GetMethodBody().GetILAsByteArray()", "//   X (const)    → 31 100 42   (ldc.i4.s 100, ret)", "//   Y (readonly) → 126 ...   4 42 (ldsfld <поле>, ret)"],
      predictAt: 2, predictQ: 'Два метода <code>M() =&gt; Max</code> отличаются только тем, что <code>Max</code> — const или static readonly. Какой первый байт IL у const-версии (ldc-семейство) и какой у readonly-версии (ldsfld=126)?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'В обоих исходник одинаков: <code>M() =&gt; Max</code>. Но <code>Max</code> в <code>X</code> — <b>const</b> (литерал), в <code>Y</code> — <b>readonly</b> (поле).', nodes: [{ id: "x", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "X.M (const)", value: "литерал", accent: true }, { id: "y", kind: "obj", at: { zone: "src", row: 1 }, typeTag: "Y.M (readonly)", value: "поле" }], edges: [] },
        { codeLine: 3, out: "31 100 42", caption: '<b>const</b>: <code>31 100 42</code> — <code>ldc.i4.s</code>(31=0x1F) <span class="hl">со вшитым литералом 100</span>, затем <code>ret</code>(42). Значение прямо в IL (реальный прогон).', nodes: [{ id: "x", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "X.M (const)", value: "ldc.i4.s 100" }, { id: "bc", kind: "gate", at: { zone: "bytes", row: 0 }, state: "ok", label: "31 100 42", detail: "литерал вшит", accent: true }], edges: [{ id: "e", from: "x", to: "bc", accent: true }] },
        { codeLine: 4, out: "126", caption: '<b>readonly</b>: первый байт <code>126</code> = <span class="hl">ldsfld</span> (загрузка статического поля) + токен поля, затем <code>ret</code>. Значение читается из поля, не вшито (реальный прогон).', nodes: [{ id: "y", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "Y.M (readonly)", value: "ldsfld <поле>" }, { id: "br", kind: "gate", at: { zone: "bytes", row: 0 }, state: "ok", label: "126 = ldsfld", detail: "загрузка поля", accent: true }], edges: [{ id: "e", from: "y", to: "br", accent: true }] },
      ],
      explain: 'Это машинная панель урока — разница <code>const</code>/<code>readonly</code> снятая побайтно из реального IL. Оба метода — <code>M() =&gt; Max</code>, но опкоды разные. <b>const</b> (<code>X</code>): <code>GetILAsByteArray()</code> = <b>31 100 42</b> — это <code>ldc.i4.s</code> (0x1F=31) с <b>вшитым литералом 100</b>, затем <code>ret</code> (0x2A=42). Значение 100 буквально лежит в IL вызывающего метода — «внедряет его в генерируемый им IL-код». <b>readonly</b> (<code>Y</code>): первый байт IL = <b>126</b> = <code>ldsfld</code> (0x7E, load static field) + 4-байтовый токен поля, затем <code>ret</code> — то есть <span class="hl">загрузка поля в рантайме</span>, а не литерал. Проверка на большем значении добивает мысль: <code>const Max = 1000</code> даёт <b>32 232 3 0 0 42</b> — <code>ldc.i4</code> (0x20=32) с полным 4-байтовым литералом 1000 (232 + 3·256 = 1000), тоже вшитым. Expression-bodied члены дают чистый IL без ведущего <code>nop</code>, поэтому байты читаются один в один. Один опкод — <code>ldc</code> vs <code>ldsfld</code> — и есть вся разница между литералом, вшитым в вызывающего, и полем, читаемым в рантайме.',
      sources: ["clr-ch7"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>class X { const int Max = 100; public static int M() =&gt; Max; }</code><br/><code>var il = typeof(X).GetMethod("M").GetMethodBody().GetILAsByteArray();</code><br/><code>Console.WriteLine(string.Join(" ", il));</code> — что напечатает (байты IL метода, использующего const)?',
      options: ["31 100 42", "126 2 0 0 4 42", "31 42", "100 42"], correctIndex: 0, xp: 10,
      okText: '<code>const</code> вшивается в IL вызывающего как <b>литерал</b>: <code>ldc.i4.s</code>(31=0x1F) со значением <code>100</code>, затем <code>ret</code>(42). «извлекает значение константы и <span class="hl">внедряет его в генерируемый им IL-код</span>». Значение прямо в IL — поля нет.',
      noText: 'Метод с <code>const</code> содержит load-constant: <code>31 100 42</code> = ldc.i4.s 100, ret. Литерал 100 вшит в IL — отдельного поля не читается. Expression-bodied даёт чистый IL без nop.',
      verify: { kind: "exec", run: "dotnet run", expect: "31 100 42" }, sourceRefs: ["clr-ch7"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Y { static readonly int Max = 100; public static int M() =&gt; Max; }</code><br/><code>var il = typeof(Y).GetMethod("M").GetMethodBody().GetILAsByteArray();</code><br/><code>Console.WriteLine(il[0]);</code> — первый байт IL (сравни с const = 31)?',
      options: ["126", "31", "100", "42"], correctIndex: 0, xp: 10,
      okText: '<code>readonly</code> — это <b>поле</b>, читаемое в рантайме, поэтому первый опкод — <code>ldsfld</code> = <span class="hl">126</span> (0x7E, load static field), а не литерал. «их значения можно получить лишь в период выполнения». В отличие от const (ldc=31), значение НЕ вшито.',
      noText: 'Метод с <code>readonly</code>-полем грузит поле в рантайме: первый байт IL = <b>126</b> = ldsfld. Это загрузка статического поля (+ токен поля), а не литерал ldc (31). Разница в один опкод — суть const vs readonly.',
      verify: { kind: "exec", run: "dotnet run", expect: "126" }, sourceRefs: ["clr-ch7"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Z { const int Max = 1000; public static int M() =&gt; Max; }</code><br/><code>var il = typeof(Z).GetMethod("M").GetMethodBody().GetILAsByteArray();</code><br/><code>Console.WriteLine(string.Join(" ", il));</code> — что напечатает (const = 1000, больше 127)?',
      options: ["32 232 3 0 0 42", "31 1000 42", "126 2 0 0 4 42", "32 1000 42"], correctIndex: 0, xp: 10,
      okText: 'Значение &gt; 127 не влезает в короткий ldc.i4.s, поэтому <code>ldc.i4</code>(32=0x20) с <b>полным 4-байтовым литералом</b> 1000: <code>232 3 0 0</code> (232 + 3·256 = 1000), затем <code>ret</code>(42). Литерал всё равно вшит в IL — это по-прежнему const. «внедряет его в генерируемый им IL-код».',
      noText: 'const вшивает литерал даже когда он полный int: <code>32 232 3 0 0 42</code> = ldc.i4 + 4 байта значения 1000 (little-endian) + ret. Значение целиком в IL вызывающего, поля не читается.',
      verify: { kind: "exec", run: "dotnet run", expect: "32 232 3 0 0 42" }, sourceRefs: ["clr-ch7"],
    },
  ],

  takeaways: [
    { icon: "why", k: "const = литерал в IL вызывающего", v: '«извлекает значение константы и <b>внедряет его в генерируемый им IL-код</b>»: в IL это <code>ldc</code>. Замер: <code>M() =&gt; Max</code> при <code>const 100</code> → <code>31 100 42</code> (ldc.i4.s), при <code>const 1000</code> → <code>32 232 3 0 0 42</code> (ldc.i4 + 4 байта). Значение вшито, памяти в рантайме нет.' },
    { icon: "cost", k: "readonly = поле, читается в рантайме", v: '«Поскольку поля хранятся в динамической памяти, их <b>значения можно получить лишь в период выполнения</b>»: в IL это <code>ldsfld</code>. Замер: первый байт IL метода с <code>readonly</code> = <b>126</b> (load static field) против <code>31</code>/<code>32</code> (ldc) у const.' },
    { icon: "avoid", k: "Версионирование расходится", v: 'Сменив <code>const</code> 50→1000 в DLL, приложение печатает 50, пока «его тоже необходимо перекомпилировать». Для <code>readonly</code> «код приложения автоматически задействует новое значение — 1000» без перекомпиляции. Кросс-модульное значение → readonly.' },
  ],

  foot: 'урок · <b>const и readonly</b> · 5 анимир. разборов · литерал в IL · ldc vs ldsfld · версионирование · панель 31 100 42 / 126 · источник <b>Рихтер, CLR via C#, гл.7</b> · дизайн <b>mid</b>',
};
