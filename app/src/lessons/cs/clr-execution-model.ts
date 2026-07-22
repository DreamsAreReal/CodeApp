/**
 * Lesson: CLR execution model (CS.S13.clr-execution-model) — expert density, 5 animated
 * deep-dives. The BOOK-SOURCED opener of the "CLR внутри" section. The whole pipeline that
 * turns C# source into running native code: a CLR-targeting compiler emits a MANAGED MODULE
 * (a PE file carrying IL + metadata, not native code); many modules group into an ASSEMBLY;
 * at run time the JIT compiler turns a method's IL into native instructions the first time it
 * is called. This establishes the model the rest of S13 builds on; it COMPLEMENTS the doc-based
 * C# corpus (types/GC/generics) by going into the runtime's execution pipeline the docs skip.
 *
 * SIGNATURE machine panel (s5): the managed module is a real PE file on disk — the assembly of
 * a type resolves to a `.dll` whose module name is the file. REAL run-csharp measurement (this
 * file's exec cards, app backend :5080): typeof(StringBuilder).Assembly → System.Private.CoreLib,
 * its module → System.Private.CoreLib.dll; and a method really carries an IL body (4 bytes for a
 * trivial add). We observe the CONSEQUENCE; the internal PE header bytes are taught from the book.
 *
 * BOOK PROVENANCE (replaces the URL-verbatim rule):
 *   - Every « » passage is VERBATIM RUSSIAN from clr-book.txt (Richter, CLR via C#, 4th ed.,
 *     ch. 1 «Модель выполнения кода в среде CLR»), substring-checked against the source
 *     (soft-hyphen/line-wrap normalized). No translation gloss — the book is already Russian.
 *   - Exec-card expects are the REAL, DETERMINISTIC stdout of run-csharp:
 *     c1 "System.Private.CoreLib.dll" (the managed module is a PE .dll) ·
 *     c2 "4: 2 3 88 42" (source → IL: ldarg.0 ldarg.1 add ret) ·
 *     c3 "System.Private.CoreLib / 1" (assembly = manifest + ONE module for a single-file assembly).
 *   - The internal PE32/CLR-header structure is taught FROM THE BOOK (quoted) + a machine panel;
 *     it is not directly readable, so the observable consequence (the module IS a .dll file, the
 *     method HAS IL) is proven by exec instead. No fabricated internal byte.
 *   - .NET 10 note: the book is 2013 (.NET 4.5). The taught facts (managed module = PE with IL +
 *     metadata, IL is CPU-independent, JIT compiles IL → native on first call) are TIMELESS and
 *     still hold in .NET 10. Dated Framework-only bits (MSCorEE.dll bootstrap, NGen, AppDomains,
 *     /platform legacy table) are deliberately NOT taught here.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S13.clr-execution-model/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: many source languages → one CLR-targeting compiler output. The compiler is the funnel.
const Z_SRC: Zone = { id: "src", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ИСХОДНИК", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "C# / F# / VB…", subCls: "vz-zsub", subY: 47 };
const Z_MM: Zone = { id: "mm", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "УПРАВЛЯЕМЫЙ МОДУЛЬ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "IL + метаданные", subCls: "vz-zsub heap", subY: 47 };
const SRC_ZONES: Zone[] = [Z_SRC, Z_MM];

// s2: the four parts of a managed module stacked in one tall zone (PE header, CLR header, meta, IL).
const Z_PARTS: Zone = { id: "parts", x: 14, y: 34, w: 312, h: 306, cls: "vz-zone heap", label: "ЧАСТИ УПРАВЛЯЕМОГО МОДУЛЯ", labelCls: "vz-zlabel heap", lx: 170, ly: 22, sub: "PE-заголовок · CLR-заголовок · метаданные · IL", subCls: "vz-zsub heap", subY: 40 };
const PARTS_ZONES: Zone[] = [Z_PARTS];

// s3: modules + resources group into an assembly (manifest describes the set).
const Z_MODS: Zone = { id: "mods", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "МОДУЛИ + РЕСУРСЫ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "физические файлы", subCls: "vz-zsub", subY: 47 };
const Z_ASM: Zone = { id: "asm", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "СБОРКА", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "манифест группирует", subCls: "vz-zsub heap", subY: 47 };
const ASM_ZONES: Zone[] = [Z_MODS, Z_ASM];

// s4: JIT on first call — IL of a method → native block, then patched in place.
const Z_IL: Zone = { id: "il", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "IL МЕТОДА", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "в метаданных", subCls: "vz-zsub", subY: 47 };
const Z_NAT: Zone = { id: "nat", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "МАШИННЫЙ КОД", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "динамическая память", subCls: "vz-zsub good", subY: 47 };
const JIT_ZONES: Zone[] = [Z_IL, Z_NAT];

// s5 (SIGNATURE): the managed module is a real PE file on disk — resolve the .dll and its module.
const Z_TYPE: Zone = { id: "type", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ТИП В КОДЕ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "typeof(StringBuilder)", subCls: "vz-zsub", subY: 47 };
const Z_FILE: Zone = { id: "file", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ФАЙЛ НА ДИСКЕ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: ".Assembly / .Module", subCls: "vz-zsub heap", subY: 47 };
const FILE_ZONES: Zone[] = [Z_TYPE, Z_FILE];

export const clrExecutionModel: LessonData = {
  id: "CS.S13.clr-execution-model",
  track: "CS",
  section: "CS.S13",
  module: "S13.1",
  lang: "csharp",
  title: "Модель выполнения CLR: исходник → IL → JIT → машинный код",
  kicker: "CLR внутри · S13 · пайплайн выполнения",
  home: { subtitle: "Managed module (PE: IL + метаданные), сборка, JIT на первом вызове", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "clr-ch1", kind: "book", org: "Джеффри Рихтер", title: "CLR via C#, 4-е изд., гл. 1 «Модель выполнения кода в среде CLR»", url: "", date: "2013" },
  ],

  spec: [
    { text: "Любой CLR-совместимый компилятор выдаёт не машинный код, а <b>управляемый модуль</b> — PE-файл с IL и метаданными: «результатом компиляции будет являться управляемый модуль (managed module) — стандартный переносимый исполняемый (portable executable, PE) файл 32-разрядной (PE32) или 64-разрядной Windows (PE32+), который требует для своего выполнения CLR».", source: "clr-ch1" },
  ],
  edgeCases: [
    { text: "IL — не привязан к процессору: «все CLR-совместимые компиляторы генерируют IL-код». Именно поэтому «один и тот же файл будет работать на любом компьютере с установленной платформой». Тот же <code>.dll</code> исполняется и на x86, и на x64, и на ARM (собственный прогон: тип живёт в PE-файле <code>System.Private.CoreLib.dll</code>).", source: "clr-ch1" },
    { text: "Метаданные и IL <b>нельзя разделить</b>: «метаданные всегда встроены в тот же EXE- или DLL-файл, что и код, так что их нельзя разделить». Компилятор пишет их одновременно — «возможность рассинхронизации метаданных и описываемого ими IL-кода исключена».", source: "clr-ch1" },
    { text: "JIT платит только раз: «Снижение производительности наблюдается только при первом вызове метода». Все последующие обращения выполняются на максимальной скорости, «потому что повторная верификация и компиляция не производятся». Второй вызов бьёт прямо в закэшированный машинный код.", source: "clr-ch1" },
  ],

  misconceptions: [
    {
      wrong: "C#-компилятор выдаёт машинный код, а .NET — просто «виртуальная машина», которая его интерпретирует",
      hook: 'Нет. Компилятор C# выдаёт <span class="hl">не машинный код</span>, а <b>управляемый модуль</b> — PE-файл с IL и метаданными, который сам по себе не исполняется процессором. «результатом компиляции будет являться <b>управляемый модуль</b> (managed module) — стандартный переносимый исполняемый (portable executable, PE) файл… который требует для своего выполнения CLR». А в машинный код IL превращается <b>во время выполнения</b>, метод за методом: «Для выполнения какого-либо метода его IL-код должен быть преобразован в машинные команды. Этим занимается <span class="hl">JIT-компилятор</span> (Just-In-Time) среды CLR». Это не интерпретация — это компиляция в нативный код при первом вызове, и «Снижение производительности наблюдается только при первом вызове метода». Дальше <b>пять разборов</b>: языки → один формат модуля, четыре части модуля (PE/CLR-заголовки, метаданные, IL), группировка модулей в сборку, JIT на первом вызове, и <b>машинная панель</b> — управляемый модуль как реальный PE-файл на диске (реальный прогон: тип <code>StringBuilder</code> живёт в <code>System.Private.CoreLib.dll</code>).',
      source: "clr-ch1",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Языки → один формат", title: "Любой CLR-язык компилируется в управляемый модуль",
      viewBox: "0 0 340 210", zones: SRC_ZONES,
      code: ["// C#, F#, VB — разный синтаксис,", "// но КАЖДЫЙ CLR-компилятор выдаёт IL,", "// а не машинный код"],
      scenes: [
        { codeLine: 0, out: "", caption: 'На входе — исходник на любом CLR-языке. Компилятор <span class="hl">не</span> производит команды процессора.', nodes: [{ id: "cs", kind: "chip", at: { zone: "src", row: 0 }, value: "C#", accent: true }, { id: "fs", kind: "chip", at: { zone: "src", row: 1 }, value: "F# / VB" }], edges: [] },
        { codeLine: 1, out: "", caption: 'Результат один для всех языков — <b>управляемый модуль</b>: PE-файл с <span class="hl">IL и метаданными</span>. «все CLR-совместимые компиляторы генерируют IL-код».', nodes: [{ id: "cs", kind: "chip", at: { zone: "src", row: 0 }, value: "C#" }, { id: "fs", kind: "chip", at: { zone: "src", row: 1 }, value: "F# / VB" }, { id: "mm", kind: "obj", at: { zone: "mm", row: 0 }, typeTag: "ManagedModule", value: "IL + метаданные", accent: true }], edges: [{ id: "e1", from: "cs", to: "mm", accent: true }] },
        { codeLine: 2, out: "", caption: 'Модуль требует CLR: «стандартный переносимый исполняемый (portable executable, PE) файл… <span class="hl">который требует для своего выполнения CLR</span>». Сам процессор его не запустит.', nodes: [{ id: "cs", kind: "chip", at: { zone: "src", row: 0 }, value: "C#" }, { id: "fs", kind: "chip", at: { zone: "src", row: 1 }, value: "F# / VB" }, { id: "mm", kind: "obj", at: { zone: "mm", row: 0 }, typeTag: "ManagedModule", value: "IL + метаданные" }, { id: "clr", kind: "gate", at: { zone: "mm", row: 1 }, state: "ok", label: "нужна CLR", detail: "IL → native", accent: true }], edges: [{ id: "e1", from: "cs", to: "mm" }] },
      ],
      explain: 'Первый шаг пайплайна: компилятор превращает исходник в <b>управляемый модуль</b>, а не в машинный код. Дословно: «Вне зависимости от типа используемого компилятора результатом компиляции будет являться <b>управляемый модуль</b> (managed module) — стандартный переносимый исполняемый (portable executable, PE) файл 32-разрядной (PE32) или 64-разрядной Windows (PE32+), <span class="hl">который требует для своего выполнения CLR</span>». И для всех языков формат один: «Компиляторы машинного кода производят код, ориентированный на конкретную процессорную архитектуру, например x86, х64 или ARM. В отличие от этого, <b>все CLR-совместимые компиляторы генерируют IL-код</b>». Отсюда и слово «управляемый»: «IL-код иногда называют управляемым (managed code), потому что <b>CLR управляет его выполнением</b>». Процессор не понимает IL напрямую — понадобится ещё один шаг (JIT, разбор 04).',
      sources: ["clr-ch1"],
    },
    {
      id: "s2", num: "02", kicker: "Четыре части модуля", title: "PE-заголовок · CLR-заголовок · метаданные · IL",
      viewBox: "0 0 340 348", zones: PARTS_ZONES,
      code: ["// один .dll/.exe = четыре части:", "//   PE32(+)-заголовок  — тип файла Windows", "//   CLR-заголовок       — версия CLR, точка входа Main", "//   метаданные          — таблицы типов и членов", "//   IL                  — код, который скомпилирует CLR"],
      scenes: [
        { codeLine: 1, out: "", caption: '<b>PE32(+)-заголовок</b> — стандартный заголовок Windows-файла: тип (GUI/CUI/DLL), метка сборки. Для чисто-IL модуля большая его часть игнорируется.', nodes: [{ id: "pe", kind: "obj", at: { zone: "parts", row: 0 }, typeTag: "PE-заголовок", value: "тип файла Windows", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<b>CLR-заголовок</b> — то, что делает модуль управляемым: нужная версия CLR, токен метаданных точки входа (<code>Main</code>), адрес/размер метаданных.', nodes: [{ id: "pe", kind: "obj", at: { zone: "parts", row: 0 }, typeTag: "PE-заголовок", value: "тип файла Windows" }, { id: "clr", kind: "obj", at: { zone: "parts", row: 1 }, typeTag: "CLR-заголовок", value: "версия · Main", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<b>Метаданные</b> — «набор таблиц данных, описывающих то, что определено в модуле, например типы и их члены», и на что модуль ссылается.', nodes: [{ id: "pe", kind: "obj", at: { zone: "parts", row: 0 }, typeTag: "PE-заголовок", value: "тип файла Windows" }, { id: "clr", kind: "obj", at: { zone: "parts", row: 1 }, typeTag: "CLR-заголовок", value: "версия · Main" }, { id: "md", kind: "obj", at: { zone: "parts", row: 2 }, typeTag: "Метаданные", value: "таблицы типов/членов", accent: true }], edges: [] },
        { codeLine: 4, out: "", caption: '<b>IL</b> — код, создаваемый компилятором из исходника. А дальше: «<span class="hl">Впоследствии CLR компилирует IL в машинные команды</span>». Метаданные и IL нераздельны в одном файле.', nodes: [{ id: "pe", kind: "obj", at: { zone: "parts", row: 0 }, typeTag: "PE-заголовок", value: "тип файла Windows" }, { id: "clr", kind: "obj", at: { zone: "parts", row: 1 }, typeTag: "CLR-заголовок", value: "версия · Main" }, { id: "md", kind: "obj", at: { zone: "parts", row: 2 }, typeTag: "Метаданные", value: "таблицы типов/членов" }, { id: "il", kind: "obj", at: { zone: "parts", row: 3 }, typeTag: "IL", value: "код → CLR скомпилирует", accent: true }], edges: [] },
      ],
      explain: 'Управляемый модуль — не просто <code>.dll</code>, а файл из четырёх различимых частей. Метаданные: «Проще говоря, <b>метаданные — это набор таблиц данных, описывающих то, что определено в модуле</b>, например типы и их члены. В метаданных также есть таблицы, указывающие, на что ссылается управляемый модуль». А про IL книга говорит, что это код, создаваемый компилятором из исходника, и «<b>Впоследствии CLR компилирует IL в машинные команды</b>». Ключевой инвариант — метаданные и IL <b>физически связаны</b>: «метаданные всегда встроены в тот же EXE- или DLL-файл, что и код, так что их нельзя разделить. А поскольку компилятор генерирует метаданные и код одновременно… <span class="hl">возможность рассинхронизации метаданных и описываемого ими IL-кода исключена</span>». Метаданные разбираются подробно в разборе про сборки (S13, урок 3) и главе 2 книги.',
      sources: ["clr-ch1"],
    },
    {
      id: "s3", num: "03", kicker: "Модули → сборка", title: "CLR работает со сборками, а манифест их группирует",
      viewBox: "0 0 340 210", zones: ASM_ZONES,
      code: ["// среда CLR работает не с модулями, а со СБОРКАМИ", "// сборка = логическая группировка модулей + ресурсов", "// манифест (таблицы метаданных) описывает состав"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Физически на диске — управляемые модули и файлы ресурсов. По отдельности CLR их не грузит.', nodes: [{ id: "m1", kind: "obj", at: { zone: "mods", row: 0 }, typeTag: "Module", value: "IL + метаданные", accent: true }, { id: "r1", kind: "chip", at: { zone: "mods", row: 1 }, value: "ресурсы" }], edges: [] },
        { codeLine: 1, out: "", caption: '<b>Сборка</b> объединяет их в одну сущность: «наименьшая единица многократного использования, безопасности и управления версиями». «среда CLR работает не с модулями, а <span class="hl">со сборками</span>».', nodes: [{ id: "m1", kind: "obj", at: { zone: "mods", row: 0 }, typeTag: "Module", value: "IL + метаданные" }, { id: "r1", kind: "chip", at: { zone: "mods", row: 1 }, value: "ресурсы" }, { id: "asm", kind: "obj", at: { zone: "asm", row: 0 }, typeTag: "Assembly", value: "логическая группа", accent: true }], edges: [{ id: "e1", from: "m1", to: "asm", accent: true }] },
        { codeLine: 2, out: "", caption: 'В сборке есть <b>манифест</b> — «обычный набор таблиц метаданных», который описывает входящие файлы и экспортируемые типы. Он делает сборку <span class="hl">самоописываемой</span>.', nodes: [{ id: "m1", kind: "obj", at: { zone: "mods", row: 0 }, typeTag: "Module", value: "IL + метаданные" }, { id: "r1", kind: "chip", at: { zone: "mods", row: 1 }, value: "ресурсы" }, { id: "asm", kind: "obj", at: { zone: "asm", row: 0 }, typeTag: "Assembly", value: "логическая группа" }, { id: "man", kind: "obj", at: { zone: "asm", row: 1 }, typeTag: "Manifest", value: "описывает состав", accent: true }], edges: [{ id: "e1", from: "m1", to: "asm" }] },
      ],
      explain: 'CLR оперирует не отдельными файлами, а сборками: «На самом деле <b>среда CLR работает не с модулями, а со сборками</b>. Сборка (assembly) — это абстрактное понятие». А по сути это «<span class="hl">наименьшая единица многократного использования, безопасности и управления версиями</span>». Группировку описывает <b>манифест</b>, встроенный в файл PE32(+): «Манифест представляет собой обычный набор таблиц метаданных. Эти таблицы описывают файлы, которые входят в сборку, общедоступные экспортируемые типы». По умолчанию у C#-проекта это один файл: «компилятор C# создает управляемый модуль с манифестом, указывающим, что <b>сборка состоит только из одного файла</b>» — тогда «сборка и является управляемым модулем». Манифест же делает сборку самоописываемой: «среда CLR может определить все прямые зависимости данной сборки». Устройство метаданных и токенов — в уроке 3 этой секции.',
      sources: ["clr-ch1"],
    },
    {
      id: "s4", num: "04", kicker: "JIT · первый вызов", title: "IL метода → машинный код при первом обращении",
      viewBox: "0 0 340 210", zones: JIT_ZONES,
      code: ["// первый вызов метода:", "//   CLR находит IL метода в метаданных", "//   JIT компилирует IL → машинные команды", "//   запись метода патчится на адрес нативного блока", "// второй вызов: прямо в машинный код, без JIT"],
      predictAt: 3, predictQ: 'Метод вызвали <b>дважды</b>. На каком вызове CLR тратит время на JIT-компиляцию IL в машинный код — на первом, на втором, или на обоих?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Первый вызов: у метода в метаданных лежит <b>IL</b>, а не готовый машинный код. Запись метода указывает на функцию <code>JITCompiler</code>.', nodes: [{ id: "il", kind: "obj", at: { zone: "il", row: 0 }, typeTag: "IL метода", value: "стековый код", accent: true }, { id: "empty", kind: "chip", at: { zone: "nat", row: 0 }, value: "пусто" }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>JITCompiler</code> «проверяет и компилирует IL-код в машинные команды, которые сохраняются в <span class="hl">динамически выделенном блоке памяти</span>».', nodes: [{ id: "il", kind: "obj", at: { zone: "il", row: 0 }, typeTag: "IL метода", value: "стековый код" }, { id: "nat", kind: "obj", at: { zone: "nat", row: 0 }, typeTag: "Native", value: "машинные команды", accent: true }], edges: [{ id: "e1", from: "il", to: "nat", accent: true }] },
        { codeLine: 3, out: "", caption: 'JIT «заменяет адрес вызываемого метода адресом блока памяти, содержащего готовые машинные команды» — запись метода теперь бьёт прямо в нативный код.', nodes: [{ id: "il", kind: "obj", at: { zone: "il", row: 0 }, typeTag: "IL метода", value: "стековый код" }, { id: "nat", kind: "obj", at: { zone: "nat", row: 0 }, typeTag: "Native", value: "машинные команды" }, { id: "patch", kind: "gate", at: { zone: "nat", row: 1 }, state: "ok", label: "адрес пропатчен", detail: "→ native", accent: true }], edges: [{ id: "e1", from: "il", to: "nat" }] },
        { codeLine: 4, out: "первый вызов", caption: 'Второй вызов идёт <b>напрямую</b> в машинный код: «Снижение производительности наблюдается <span class="hl">только при первом вызове метода</span>» (JIT платится один раз).', nodes: [{ id: "nat", kind: "obj", at: { zone: "nat", row: 0 }, typeTag: "Native", value: "машинные команды" }, { id: "fast", kind: "gate", at: { zone: "nat", row: 1 }, state: "ok", label: "2-й вызов", detail: "без JIT", accent: true }], edges: [] },
      ],
      explain: 'Второй шаг пайплайна происходит <b>в рантайме</b>, лениво, метод за методом: «Для выполнения какого-либо метода его IL-код должен быть преобразован в машинные команды. Этим занимается <b>JIT-компилятор</b> (Just-In-Time) среды CLR». Механика первого вызова: «JITCompiler ищет в метаданных соответствующей сборки IL-код вызываемого метода. Затем JITCompiler <span class="hl">проверяет и компилирует IL-код в машинные команды</span>, которые сохраняются в динамически выделенном блоке памяти. После этого JITCompiler… <b>заменяет адрес вызываемого метода адресом блока памяти</b>, содержащего готовые машинные команды». А дальше — бесплатно: «Снижение производительности наблюдается только при первом вызове метода». Все последующие обращения выполняются на максимальной скорости, «потому что повторная верификация и компиляция не производятся». Отвечая на вопрос: JIT платится <b>только на первом</b> вызове. Как это выглядит на уровне IL-инструкций — урок 2 этой секции.',
      sources: ["clr-ch1"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · модуль на диске", title: "Управляемый модуль — реальный PE-файл (.dll)",
      viewBox: "0 0 340 210", zones: FILE_ZONES,
      code: ["using System.Text;", "var a = typeof(StringBuilder).Assembly;", "Console.WriteLine(a.GetName().Name);", "Console.WriteLine(System.IO.Path.GetExtension(a.Location));"],
      predictAt: 1, predictQ: 'Тип <code>StringBuilder</code> определён в BCL. В файле какого <b>расширения</b> на диске лежит его управляемый модуль — и как называется сборка?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'В коде у нас только <b>тип</b> <code>StringBuilder</code>. Спросим у него сборку — она указывает на файл модуля на диске.', nodes: [{ id: "t", kind: "obj", at: { zone: "type", row: 0 }, typeTag: "Type", value: "StringBuilder", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>.Assembly.GetName().Name</code> даёт имя сборки — <span class="hl">System.Private.CoreLib</span>. Это тот самый контейнер, что группирует модули (разбор 03).', nodes: [{ id: "t", kind: "obj", at: { zone: "type", row: 0 }, typeTag: "Type", value: "StringBuilder" }, { id: "asm", kind: "obj", at: { zone: "file", row: 0 }, typeTag: "Assembly", value: "System.Private.CoreLib", accent: true }], edges: [{ id: "e1", from: "t", to: "asm", accent: true }] },
        { codeLine: 3, out: "System.Private.CoreLib.dll", caption: 'А расширение файла — <b>.dll</b>: управляемый модуль это реальный <span class="hl">PE-файл на диске</span>, не абстракция (реальный прогон). Вот та самая PE-упаковка («portable executable»).', nodes: [{ id: "t", kind: "obj", at: { zone: "type", row: 0 }, typeTag: "Type", value: "StringBuilder" }, { id: "asm", kind: "obj", at: { zone: "file", row: 0 }, typeTag: "Assembly", value: "System.Private.CoreLib" }, { id: "dll", kind: "obj", at: { zone: "file", row: 1 }, typeTag: "PE-файл", value: ".dll на диске", accent: true }], edges: [{ id: "e1", from: "t", to: "asm" }] },
      ],
      explain: 'Это машинная панель урока — управляемый модуль как реальный файл, снятый прогоном. Мы не можем прочитать PE-заголовок побайтно из sandbox, но можем показать <b>следствие</b>: тип из BCL живёт в PE-файле с расширением <code>.dll</code>, а его сборка называется <code>System.Private.CoreLib</code>. Это ровно то, что описывает книга: «результатом компиляции будет являться управляемый модуль… <b>стандартный переносимый исполняемый (portable executable, PE) файл</b>… который требует для своего выполнения CLR». Расширение <code>.dll</code>/<code>.exe</code> — это и есть та PE-упаковка. И тот же файл кросс-платформенен: «один и тот же файл будет работать на любом компьютере с установленной платформой» — потому что внутри IL, а не команды конкретного процессора (их выдаст JIT уже на целевой машине). <b>.NET 10</b>: имена сборок BCL изменились с 2013 года (тогда — <code>MSCorLib.dll</code>), но модель — управляемый модуль это PE-файл с IL и метаданными — осталась ровно той же.',
      sources: ["clr-ch1"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var a = typeof(System.Text.StringBuilder).Assembly;</code><br/><code>Console.WriteLine(a.GetName().Name + System.IO.Path.GetExtension(a.Location));</code> — что напечатает?',
      options: ["System.Private.CoreLib.dll", "StringBuilder.exe", "System.Text.dll", "mscorlib.dll"], correctIndex: 0, xp: 10,
      okText: 'Управляемый модуль — это <b>реальный PE-файл</b> на диске. Тип <code>StringBuilder</code> лежит в сборке <span class="hl">System.Private.CoreLib</span>, а её модуль — файл <code>.dll</code>. «стандартный переносимый исполняемый (portable executable, PE) файл… который требует для своего выполнения CLR».',
      noText: '<code>.GetName().Name</code> — имя <b>сборки</b> (не типа), а расширение файла модуля — <code>.dll</code>. Для <code>StringBuilder</code> в .NET 10 это <b>System.Private.CoreLib.dll</b> (реальный прогон). В книге 2013-го это была <code>MSCorLib.dll</code> — имя сменилось, модель нет.',
      verify: { kind: "exec", run: "dotnet run", expect: "System.Private.CoreLib.dll" }, sourceRefs: ["clr-ch1"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class C { public static int Add(int a,int b)=&gt;a+b; }</code><br/><code>var il = typeof(C).GetMethod("Add").GetMethodBody().GetILAsByteArray();</code><br/><code>Console.WriteLine($"{il.Length}: {string.Join(" ", il)}");</code> — что напечатает (байты IL)?',
      options: ["4: 2 3 88 42", "0: ", "2: 88 42", "4: 88 42 2 3"], correctIndex: 0, xp: 10,
      okText: 'Компилятор выдал не машинный код, а <b>IL</b>: <code>ldarg.0</code> (2), <code>ldarg.1</code> (3), <code>add</code> (88=0x58), <code>ret</code> (42=0x2A) — <span class="hl">4 байта стекового кода</span>. Именно этот IL JIT превратит в машинные команды на первом вызове.',
      noText: 'У метода в метаданных лежит <b>IL-тело</b>, а не native. <code>GetILAsByteArray()</code> отдаёт реальные байты: <code>2 3 88 42</code> — push arg0, push arg1, add, ret. «Впоследствии CLR компилирует IL в машинные команды».',
      verify: { kind: "exec", run: "dotnet run", expect: "4: 2 3 88 42" }, sourceRefs: ["clr-ch1"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var a = typeof(System.Text.StringBuilder).Assembly;</code><br/><code>Console.WriteLine($"{a.GetName().Name} / {a.GetModules().Length}");</code> — что напечатает (сборка / число модулей)?',
      options: ["System.Private.CoreLib / 1", "System.Private.CoreLib / 0", "StringBuilder / 1", "System.Private.CoreLib / 4"], correctIndex: 0, xp: 10,
      okText: 'Сборка группирует модули; у типичной сборки их <b>один</b>. «компилятор C# создает управляемый модуль с манифестом, указывающим, что <span class="hl">сборка состоит только из одного файла</span>» — тогда «сборка и является управляемым модулем».',
      noText: 'Сборка = манифест + модули. Для <code>System.Private.CoreLib</code> модуль <b>один</b> (single-file assembly): <code>GetModules().Length == 1</code>. «среда CLR работает не с модулями, а со сборками».',
      verify: { kind: "exec", run: "dotnet run", expect: "System.Private.CoreLib / 1" }, sourceRefs: ["clr-ch1"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Что выдаёт компилятор", v: 'Не машинный код, а <span class="hl">управляемый модуль</span>: «стандартный переносимый исполняемый (portable executable, PE) файл… который требует для своего выполнения CLR». Внутри — четыре части: PE-заголовок, CLR-заголовок, метаданные, IL. IL один для всех CLR-языков.' },
    { icon: "cost", k: "JIT — только раз", v: 'IL → машинный код происходит <b>в рантайме</b>, при первом вызове метода: JIT «компилирует IL-код в машинные команды… заменяет адрес вызываемого метода адресом блока памяти». «Снижение производительности наблюдается только при первом вызове метода» — дальше прямо в native (реальный прогон: метод несёт IL <code>2 3 88 42</code>).' },
    { icon: "avoid", k: "Сборка ≠ модуль", v: 'CLR грузит <b>сборки</b>, а не модули: сборка = манифест + модули + ресурсы, «наименьшая единица многократного использования, безопасности и управления версиями». У C#-проекта по умолчанию один модуль (замер: <code>GetModules().Length == 1</code>), но это отдельная сущность над файлом.' },
  ],

  foot: 'урок · <b>модель выполнения CLR</b> · 5 анимир. разборов · source→IL→JIT→native · панель модуль-на-диске=PE-файл · источник <b>Рихтер, CLR via C#, гл.1</b> · дизайн <b>mid</b>',
};
