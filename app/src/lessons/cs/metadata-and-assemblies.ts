/**
 * Lesson: metadata and assemblies (CS.S13.metadata-and-assemblies) — expert density, 5 animated
 * deep-dives. Book-sourced (Richter, CLR via C#, 4th ed., ch. 1-2). Metadata is a block of tables
 * (definition tables, reference tables, manifest tables) the compiler emits alongside IL; a
 * 4-byte metadata TOKEN identifies one row of one table (high byte = table id, low 3 bytes = row).
 * An assembly = manifest + modules + metadata: the manifest (itself metadata tables) lists the
 * files, exported types and referenced assemblies, making the assembly self-describing. COMPLEMENTS
 * the pipeline lesson (which named the managed module's four parts) by opening the metadata block:
 * what the tables hold and how tokens point into them. Also complements CS.S6.reflection-overview
 * (the reflection API that READS this metadata) — here the subject is the on-disk metadata structure.
 *
 * SIGNATURE machine panel (s5): the metadata token, decoded. typeof(X).MetadataToken >> 24 is the
 * TABLE ID: 0x02 = TypeDef for a type, 0x06 = MethodDef for a method, 0x04 = FieldDef for a field —
 * exactly the book's token-type bytes (0x02=TypeDef). REAL run-csharp measurement (this file's exec
 * cards, app backend :5080): a type's token high byte is 02; type/method/field give 02 06 04; a
 * single-file assembly has 1 module and its manifest module is the .dll.
 *
 * BOOK PROVENANCE (replaces the URL-verbatim rule):
 *   - Every « » passage is VERBATIM RUSSIAN from clr-book.txt (ch. 1 «Модель выполнения кода в среде
 *     CLR» + ch. 2 «Компоновка, упаковка, развертывание», metadata-tables + token sections),
 *     substring-checked (wrap/soft-hyphen normalized). No translation gloss.
 *   - Exec-card expects are REAL, DETERMINISTIC run-csharp stdout:
 *     c1 "02" (a Type's token high byte = TypeDef table) ·
 *     c2 "02 06 04" (Type/Method/Field tokens → TypeDef/MethodDef/FieldDef tables) ·
 *     c3 "1 System.Private.CoreLib.dll" (assembly = manifest + one module; manifest module = the .dll).
 *   - The book's token byte values (0x02=TypeDef, 0x06=MethodDef, 0x04=FieldDef) are quoted for
 *     TypeDef and PROVEN observable by exec for all three. No fabricated table id.
 *   - .NET 10 note: metadata tables + tokens (ECMA-335) and assembly = manifest+modules+metadata are
 *     TIMELESS and unchanged in .NET 10. The book's multi-file-assembly / GAC deployment asides are
 *     legacy .NET-Framework specifics and are NOT taught here (modern .NET ships single-file assemblies;
 *     multi-module assemblies are effectively gone). BCL assembly NAMES changed (MSCorLib → CoreLib).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S13.metadata-and-assemblies/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: three categories of metadata tables (definition / reference / manifest).
const Z_META: Zone = { id: "meta", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone heap", label: "БЛОК МЕТАДАННЫХ = ТАБЛИЦЫ", labelCls: "vz-zlabel heap", lx: 170, ly: 22, sub: "три категории: определений · ссылок · манифеста", subCls: "vz-zsub heap", subY: 40 };
const META_ZONES: Zone[] = [Z_META];

// s2: the compiler emits one row per defined entity into a definition table.
const Z_SRC: Zone = { id: "src", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ИСХОДНЫЙ ТЕКСТ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "тип, метод, поле", subCls: "vz-zsub", subY: 47 };
const Z_TBL: Zone = { id: "tbl", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ТАБЛИЦЫ ОПРЕДЕЛЕНИЙ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "строка на сущность", subCls: "vz-zsub heap", subY: 47 };
const DEF_ZONES: Zone[] = [Z_SRC, Z_TBL];

// s3: a token = table id (high byte) + row index (low 3 bytes) → one row.
const Z_TOK: Zone = { id: "tok", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "МАРКЕР (TOKEN) 4 БАЙТА", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "0x02 000002", subCls: "vz-zsub", subY: 47 };
const Z_ROW: Zone = { id: "row", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "СТРОКА ТАБЛИЦЫ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "TypeDef · строка 2", subCls: "vz-zsub heap", subY: 47 };
const TOK_ZONES: Zone[] = [Z_TOK, Z_ROW];

// s4: assembly = manifest + modules + metadata; manifest makes it self-describing.
const Z_FILES: Zone = { id: "files", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ФАЙЛЫ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "модули + ресурсы", subCls: "vz-zsub", subY: 47 };
const Z_MAN: Zone = { id: "man", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "СБОРКА", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "манифест описывает состав", subCls: "vz-zsub heap", subY: 47 };
const MAN_ZONES: Zone[] = [Z_FILES, Z_MAN];

// s5 (SIGNATURE): decode the metadata token — high byte is the table id.
const Z_ENT: Zone = { id: "ent", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "СУЩНОСТЬ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "тип / метод / поле", subCls: "vz-zsub", subY: 47 };
const Z_TID: Zone = { id: "tid", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "СТАРШИЙ БАЙТ = ТАБЛИЦА", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "token >> 24", subCls: "vz-zsub heap", subY: 47 };
const TID_ZONES: Zone[] = [Z_ENT, Z_TID];

export const metadataAndAssemblies: LessonData = {
  id: "CS.S13.metadata-and-assemblies",
  track: "CS",
  section: "CS.S13",
  module: "S13.3",
  lang: "csharp",
  title: "Метаданные и сборки: таблицы, токены, манифест",
  kicker: "CLR внутри · S13 · таблицы и токены",
  home: { subtitle: "Метаданные = таблицы; токен = таблица+строка; сборка = манифест + модули", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "clr-ch1", kind: "book", org: "Джеффри Рихтер", title: "CLR via C#, 4-е изд., гл. 1 «Модель выполнения кода в среде CLR»", url: "", date: "2013" },
    { id: "clr-ch2", kind: "book", org: "Джеффри Рихтер", title: "CLR via C#, 4-е изд., гл. 2 «Компоновка, упаковка, развертывание»", url: "", date: "2013" },
  ],

  spec: [
    { text: "Метаданные — это таблицы: «Метаданные — это блок двоичных данных, состоящий из нескольких таблиц. Существуют три категории таблиц: определений, ссылок и манифестов». В таблицах определений — <code>ModuleDef</code>, <code>TypeDef</code>, <code>MethodDef</code>, <code>FieldDef</code> и др.", source: "clr-ch2" },
  ],
  edgeCases: [
    { text: "Компилятор пишет строку метаданных на <b>каждую</b> определённую сущность: «Для каждой сущности, определяемой в компилируемом исходном тексте, компилятор генерирует строку в одной из таблиц». <code>TypeDef</code> «Содержит по одной записи для каждого типа, определенного в модуле».", source: "clr-ch2" },
    { text: "<b>Токен</b> — 4 байта: «размер маркеров метаданных — 4 байта. Старший байт указывает тип маркера (0x01=TypeRef, <span class=\"hl\">0x02=TypeDef</span>, 0x26=FileRef, 0x27=ExportedType)», а «Три младших байта маркера просто идентифицируют запись в соответствующей таблице метаданных» (собственный прогон: тип → 02, метод → 06, поле → 04).", source: "clr-ch2" },
    { text: "Манифест делает сборку <b>самоописываемой</b>: он «представляет собой обычный набор таблиц метаданных», а «Модули сборки также содержат сведения о других сборках, на которые они ссылаются» (таблица <code>AssemblyRef</code>), поэтому «среда CLR может определить все прямые зависимости данной сборки».", source: ["clr-ch1", "clr-ch2"] },
  ],

  misconceptions: [
    {
      wrong: "метаданные — это какой-то XML/манифест сбоку от кода, а токен — это строка с именем типа",
      hook: 'Нет. Метаданные — <b>бинарный блок таблиц</b> внутри того же файла, что и IL: «Метаданные — это <span class="hl">блок двоичных данных, состоящий из нескольких таблиц</span>. Существуют три категории таблиц: определений, ссылок и манифестов». Компилятор пишет по строке на каждую сущность: «Для каждой сущности, определяемой в компилируемом исходном тексте, компилятор генерирует строку в одной из таблиц». А <b>токен</b> (маркер) — не имя, а 4-байтовый индекс: «размер маркеров метаданных — 4 байта. <span class="hl">Старший байт указывает тип маркера</span> (0x01=TypeRef, 0x02=TypeDef, …)», три младших байта — номер строки. Сборка же = манифест + модули + метаданные: манифест «представляет собой обычный набор таблиц метаданных». Дальше <b>пять разборов</b>: три категории таблиц, строка-на-сущность, токен как таблица+строка, сборка/манифест, и <b>машинная панель</b> — реальный старший байт токена (реальный прогон: тип → <code>02</code> TypeDef, метод → <code>06</code> MethodDef, поле → <code>04</code> FieldDef).',
      source: ["clr-ch1", "clr-ch2"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Три категории таблиц", title: "Метаданные = блок таблиц: определений, ссылок, манифеста",
      viewBox: "0 0 340 276", zones: META_ZONES,
      code: ["// метаданные — это НЕ текст/XML, а бинарные ТАБЛИЦЫ", "//   определений: ModuleDef, TypeDef, MethodDef, FieldDef…", "//   ссылок:      AssemblyRef, TypeRef, MemberRef…", "//   манифеста:   какие файлы и типы входят в сборку"],
      scenes: [
        { codeLine: 1, out: "", caption: '<b>Таблицы определений</b> описывают то, что <span class="hl">определено</span> в модуле: <code>TypeDef</code>, <code>MethodDef</code>, <code>FieldDef</code> — строка на сущность.', nodes: [{ id: "def", kind: "obj", at: { zone: "meta", row: 0 }, typeTag: "определений", value: "TypeDef · MethodDef · FieldDef", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<b>Таблицы ссылок</b> — на что модуль <span class="hl">ссылается</span>: <code>AssemblyRef</code> (внешние сборки), <code>TypeRef</code>, <code>MemberRef</code>.', nodes: [{ id: "def", kind: "obj", at: { zone: "meta", row: 0 }, typeTag: "определений", value: "TypeDef · MethodDef · FieldDef" }, { id: "ref", kind: "obj", at: { zone: "meta", row: 1 }, typeTag: "ссылок", value: "AssemblyRef · TypeRef · MemberRef", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<b>Таблицы манифеста</b> — состав сборки: входящие файлы и экспортируемые типы. Всё это — «блок двоичных данных, состоящий из нескольких таблиц».', nodes: [{ id: "def", kind: "obj", at: { zone: "meta", row: 0 }, typeTag: "определений", value: "TypeDef · MethodDef · FieldDef" }, { id: "ref", kind: "obj", at: { zone: "meta", row: 1 }, typeTag: "ссылок", value: "AssemblyRef · TypeRef · MemberRef" }, { id: "man", kind: "obj", at: { zone: "meta", row: 2 }, typeTag: "манифеста", value: "файлы + экспорт. типы", accent: true }], edges: [] },
      ],
      explain: 'Метаданные — не отдельный XML и не манифест сбоку, а бинарный блок таблиц внутри модуля: «Метаданные — это <span class="hl">блок двоичных данных, состоящий из нескольких таблиц</span>. Существуют три категории таблиц: определений, ссылок и манифестов». Таблицы определений (<code>ModuleDef</code>, <code>TypeDef</code>, <code>MethodDef</code>, <code>FieldDef</code>, <code>ParamDef</code>, <code>PropertyDef</code>, <code>EventDef</code>) описывают то, что определено в модуле; таблицы ссылок (<code>AssemblyRef</code>, <code>TypeRef</code>, <code>MemberRef</code>) — то, на что модуль ссылается; таблицы манифеста — состав сборки. Например, <code>ModuleDef</code> «Всегда содержит одну запись, идентифицирующую модуль», а <code>TypeDef</code> «Содержит по одной записи для каждого типа, определенного в модуле… указывает на записи таблиц MethodDef, PropertyDef и EventDef». Это и есть то, что читает reflection (см. <code>CS.S6.reflection-overview</code>) — только на уровне сырых таблиц.',
      sources: ["clr-ch2"],
    },
    {
      id: "s2", num: "02", kicker: "Строка на сущность", title: "Компилятор пишет по строке метаданных на каждую сущность",
      viewBox: "0 0 340 210", zones: DEF_ZONES,
      code: ["class C {              // → строка в TypeDef", "  public int F;         // → строка в FieldDef", "  public void M() { }    // → строка в MethodDef", "}"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Определил тип <code>C</code> — компилятор кладёт <span class="hl">строку в TypeDef</span>: имя типа, базовый тип, флаги, ссылки на члены.', nodes: [{ id: "c", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "class", value: "C", accent: true }, { id: "td", kind: "obj", at: { zone: "tbl", row: 0 }, typeTag: "TypeDef", value: "строка: C", accent: true }], edges: [{ id: "e1", from: "c", to: "td", accent: true }] },
        { codeLine: 1, out: "", caption: 'Поле <code>F</code> → <span class="hl">строка в FieldDef</span> (флаги + тип поля). <code>FieldDef</code> «Содержит по одной записи для каждого поля».', nodes: [{ id: "c", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "class", value: "C" }, { id: "f", kind: "obj", at: { zone: "src", row: 1 }, typeTag: "field", value: "F", accent: true }, { id: "td", kind: "obj", at: { zone: "tbl", row: 0 }, typeTag: "TypeDef", value: "строка: C" }, { id: "fd", kind: "obj", at: { zone: "tbl", row: 1 }, typeTag: "FieldDef", value: "строка: F", accent: true }], edges: [{ id: "e2", from: "f", to: "fd", accent: true }] },
        { codeLine: 2, out: "", caption: 'Метод <code>M</code> → <span class="hl">строка в MethodDef</span>, включая «смещение в модуле, по которому находится соответствующий IL-код» — так метаданные связаны с IL.', nodes: [{ id: "m", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "method", value: "M", accent: true }, { id: "md", kind: "obj", at: { zone: "tbl", row: 0 }, typeTag: "MethodDef", value: "строка: M → IL-смещение", accent: true }], edges: [{ id: "e3", from: "m", to: "md", accent: true }] },
      ],
      explain: 'Метаданные — не декларация «вообще», а <b>построчная</b> запись каждой определённой сущности: «Для каждой сущности, определяемой в компилируемом исходном тексте, <span class="hl">компилятор генерирует строку в одной из таблиц</span>». Тип → <code>TypeDef</code> (одна запись на тип, «включает имя типа, базовый тип, флаги… и указывает на записи таблиц MethodDef, PropertyDef и EventDef»), поле → <code>FieldDef</code>, метод → <code>MethodDef</code>. Особенно важен <code>MethodDef</code>: его строка включает «сигнатуру и смещение в модуле, по которому находится соответствующий <b>IL-код</b>» — то есть метаданные метода прямо указывают, где лежит его IL. Отсюда та неразрывность метаданных и IL, о которой шла речь в уроке 1: одна таблица описывает метод, а её поле-смещение ведёт к его байтам IL (которые снимала машинная панель урока 2).',
      sources: ["clr-ch2"],
    },
    {
      id: "s3", num: "03", kicker: "Токен = таблица + строка", title: "Маркер метаданных: старший байт — таблица, младшие — строка",
      viewBox: "0 0 340 210", zones: TOK_ZONES,
      code: ["// TypeDef token: 0x02000002", "//   0x02     — старший байт: ТИП таблицы (TypeDef)", "//   0x000002 — три младших: номер СТРОКИ в таблице", "// токен — это НЕ имя, а 4-байтовый индекс в таблицу"],
      predictAt: 1, predictQ: 'Токен типа выглядит как <code>0x02000002</code>. Что кодирует <b>старший байт</b> <code>0x02</code> — номер строки, размер типа, или какую именно таблицу метаданных?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Токен — 4 байта: «размер маркеров метаданных — <b>4 байта</b>». Например у типа — <code>0x02000002</code>.', nodes: [{ id: "t", kind: "obj", at: { zone: "tok", row: 0 }, typeTag: "token", value: "0x02000002", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<b>Старший байт</b> <code>0x02</code> = тип таблицы: «Старший байт указывает тип маркера (… <span class="hl">0x02=TypeDef</span> …)».', nodes: [{ id: "t", kind: "obj", at: { zone: "tok", row: 0 }, typeTag: "token", value: "0x02000002" }, { id: "hi", kind: "gate", at: { zone: "tok", row: 1 }, state: "ok", label: "0x02", detail: "= TypeDef", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<b>Три младших байта</b> — номер строки: «Три младших байта маркера просто <span class="hl">идентифицируют запись</span> в соответствующей таблице». <code>0x000002</code> → строка 2 в TypeDef.', nodes: [{ id: "t", kind: "obj", at: { zone: "tok", row: 0 }, typeTag: "token", value: "0x02000002" }, { id: "hi", kind: "gate", at: { zone: "tok", row: 1 }, state: "ok", label: "0x02", detail: "= TypeDef" }, { id: "rowr", kind: "obj", at: { zone: "row", row: 0 }, typeTag: "TypeDef[2]", value: "строка типа C", accent: true }], edges: [{ id: "e", from: "t", to: "rowr", accent: true }] },
      ],
      explain: 'Токен (маркер, token) — это <b>не имя типа</b>, а компактный 4-байтовый указатель в таблицу метаданных. Дословно: «размер маркеров метаданных — 4 байта. <span class="hl">Старший байт указывает тип маркера</span> (0x01=TypeRef, 0x02=TypeDef, 0x26=FileRef, 0x27=ExportedType)… Три младших байта маркера просто идентифицируют запись в соответствующей таблице метаданных». То есть токен = (id таблицы в старшем байте) + (номер строки в младших трёх). Пример из книги: «TypeDef token: 0x02000002» — таблица TypeDef (0x02), строка 2. Кстати нумерация в TypeDef начинается с 2 («в TypeDef нумерация строк начинается с 2»), потому что строка 1 — это псевдо-тип <code>&lt;Module&gt;</code>. Так IL-инструкции ссылаются на типы и члены: не строкой-именем, а токеном, который CLR за O(1) резолвит в строку таблицы.',
      sources: ["clr-ch2"],
    },
    {
      id: "s4", num: "04", kicker: "Сборка = манифест + модули", title: "Манифест (тоже таблицы) описывает состав и делает сборку самоописываемой",
      viewBox: "0 0 340 210", zones: MAN_ZONES,
      code: ["// сборка = манифест + модули + метаданные", "// манифест — тоже набор таблиц метаданных:", "//   какие файлы входят, какие типы экспортируются", "//   на какие ВНЕШНИЕ сборки есть ссылки (AssemblyRef)"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Физически — модули и ресурсы. Сборка объединяет их и добавляет <b>манифест</b>.', nodes: [{ id: "m", kind: "obj", at: { zone: "files", row: 0 }, typeTag: "Module", value: "IL + метаданные", accent: true }, { id: "r", kind: "chip", at: { zone: "files", row: 1 }, value: "ресурсы" }], edges: [] },
        { codeLine: 1, out: "", caption: 'Манифест — <span class="hl">тоже таблицы метаданных</span>: «Манифест представляет собой обычный набор таблиц метаданных», описывающих файлы и экспортируемые типы.', nodes: [{ id: "m", kind: "obj", at: { zone: "files", row: 0 }, typeTag: "Module", value: "IL + метаданные" }, { id: "r", kind: "chip", at: { zone: "files", row: 1 }, value: "ресурсы" }, { id: "man", kind: "obj", at: { zone: "man", row: 0 }, typeTag: "Manifest", value: "таблицы: файлы + экспорт", accent: true }], edges: [{ id: "e1", from: "m", to: "man", accent: true }] },
        { codeLine: 3, out: "", caption: '<code>AssemblyRef</code> перечисляет внешние зависимости — сборка <span class="hl">самоописываема</span>: «среда CLR может определить все прямые зависимости данной сборки».', nodes: [{ id: "m", kind: "obj", at: { zone: "files", row: 0 }, typeTag: "Module", value: "IL + метаданные" }, { id: "man", kind: "obj", at: { zone: "man", row: 0 }, typeTag: "Manifest", value: "таблицы: файлы + экспорт" }, { id: "dep", kind: "obj", at: { zone: "man", row: 1 }, typeTag: "AssemblyRef", value: "внешние зависимости", accent: true }], edges: [] },
      ],
      explain: 'Сборка — не просто «.dll», а <b>манифест + модули + метаданные</b>. Манифест сам сделан из метаданных: «Манифест представляет собой обычный набор таблиц метаданных. Эти таблицы описывают файлы, которые входят в сборку, общедоступные экспортируемые типы, реализованные в файлах сборки, а также относящиеся к сборке файлы ресурсов или данных». Ключевое свойство — самоописываемость: «Модули сборки также содержат сведения о других сборках, на которые они ссылаются (в том числе номера их версий). Эти данные делают сборку <span class="hl">самоописываемой</span> (self-describing)». Эти сведения лежат в таблице <code>AssemblyRef</code> («по одной записи для каждой сборки, на которую ссылается модуль»), поэтому «среда CLR может определить все прямые зависимости данной сборки… Не нужно размещать никакой дополнительной информации ни в системном реестре, ни в доменной службе». <b>.NET 10</b>: многофайловые сборки и деплой в GAC — legacy .NET Framework; современный .NET — одна сборка = один модуль, но модель манифест+метаданные та же.',
      sources: ["clr-ch1", "clr-ch2"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · декод токена", title: "token >> 24: тип → 02, метод → 06, поле → 04",
      viewBox: "0 0 340 210", zones: TID_ZONES,
      code: ["class C { public int F; public void M(){} }", "int t = typeof(C).MetadataToken;         // тип", "int m = typeof(C).GetMethod(\"M\").MetadataToken; // метод", "int f = typeof(C).GetField(\"F\").MetadataToken;  // поле", "// старший байт каждого = id таблицы: t>>24, m>>24, f>>24"],
      predictAt: 1, predictQ: 'У типа, метода и поля берём <code>MetadataToken &gt;&gt; 24</code> (старший байт = id таблицы). Какие три числа выйдут — по книге TypeDef=0x02, MethodDef=0x06, FieldDef=0x04?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'У каждой сущности есть <code>MetadataToken</code> — тот самый 4-байтовый маркер её строки в таблице.', nodes: [{ id: "c", kind: "obj", at: { zone: "ent", row: 0 }, typeTag: "тип C", value: "MetadataToken", accent: true }], edges: [] },
        { codeLine: 4, out: "", caption: 'Сдвигаем на 24 бита — остаётся <span class="hl">старший байт</span>, id таблицы. Спросим у типа, метода и поля.', nodes: [{ id: "c", kind: "obj", at: { zone: "ent", row: 0 }, typeTag: "тип", value: "token>>24" }, { id: "mm", kind: "obj", at: { zone: "ent", row: 1, col: 0 }, typeTag: "метод", value: "token>>24" }, { id: "ff", kind: "obj", at: { zone: "ent", row: 1, col: 1 }, typeTag: "поле", value: "token>>24", accent: true }], edges: [] },
        { codeLine: 4, out: "02 06 04", caption: 'Панель: <b>02 06 04</b> — <code>TypeDef</code>(0x02), <code>MethodDef</code>(0x06), <code>FieldDef</code>(0x04). Ровно байты из книги (реальный прогон): токен <span class="hl">указывает таблицу</span>.', nodes: [{ id: "c", kind: "gate", at: { zone: "tid", row: 0 }, state: "ok", label: "тип", detail: "02 TypeDef" }, { id: "mm", kind: "gate", at: { zone: "tid", row: 1, col: 0 }, state: "ok", label: "метод", detail: "06 MethodDef" }, { id: "ff", kind: "gate", at: { zone: "tid", row: 1, col: 1 }, state: "ok", label: "поле", detail: "04 FieldDef", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — старший байт токена, снятый прогоном, ровно совпадает с байтами из книги. Для типа, метода и поля <code>MetadataToken >> 24</code> даёт <b>02 06 04</b>: <code>TypeDef</code> = 0x02, <code>MethodDef</code> = 0x06, <code>FieldDef</code> = 0x04. Книга подтверждает про TypeDef дословно: «Старший байт указывает тип маркера (0x01=TypeRef, <span class="hl">0x02=TypeDef</span>, 0x26=FileRef, 0x27=ExportedType)». Так и работает связь IL ↔ метаданные: инструкция несёт не имя, а токен, старший байт которого выбирает таблицу, а младшие три — строку. Читаемость наружу это то же самое, что делает reflection: <code>MetadataToken</code> у <code>MemberInfo</code> — публичное окно в эту таблицу. <b>.NET 10</b>: значения байтов таблиц заданы ECMA-335 и не менялись — 0x02/0x06/0x04 те же, что в книге 2013 года.',
      sources: ["clr-ch2"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>class C {}</code><br/><code>int tok = typeof(C).MetadataToken;</code><br/><code>Console.WriteLine((tok &gt;&gt; 24).ToString("X2"));</code> — что напечатает (старший байт токена типа)?',
      options: ["02", "06", "04", "01"], correctIndex: 0, xp: 10,
      okText: 'Старший байт токена = id таблицы. У <b>типа</b> это <code>TypeDef</code> = <span class="hl">0x02</span>. «Старший байт указывает тип маркера (… 0x02=TypeDef …)». Три младших байта — номер строки.',
      noText: 'Токен — 4-байтовый маркер: старший байт = таблица. Для типа таблица <code>TypeDef</code>, её байт <b>0x02</b> → печатает <code>02</code>. Не путай с методом (06) или полем (04).',
      verify: { kind: "exec", run: "dotnet run", expect: "02" }, sourceRefs: ["clr-ch2"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class C { public int F; public void M(){} }</code><br/><code>Console.WriteLine($"{typeof(C).MetadataToken&gt;&gt;24:X2} {typeof(C).GetMethod("M").MetadataToken&gt;&gt;24:X2} {typeof(C).GetField("F").MetadataToken&gt;&gt;24:X2}");</code> — три старших байта?',
      options: ["02 06 04", "02 02 02", "06 04 02", "01 06 04"], correctIndex: 0, xp: 10,
      okText: 'Три сущности → <b>три таблицы</b>: тип <code>TypeDef</code>=02, метод <code>MethodDef</code>=06, поле <code>FieldDef</code>=04. Токен каждой указывает <span class="hl">свою таблицу</span> метаданных. Ровно байты из книги.',
      noText: 'Каждый род сущности живёт в своей таблице определений, и старший байт токена — её id: <code>02 06 04</code> (TypeDef / MethodDef / FieldDef). Реальный прогон.',
      verify: { kind: "exec", run: "dotnet run", expect: "02 06 04" }, sourceRefs: ["clr-ch2"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var a = typeof(System.Text.StringBuilder).Assembly;</code><br/><code>Console.WriteLine($"{a.GetModules().Length} {a.ManifestModule.Name}");</code> — число модулей и имя манифест-модуля?',
      options: ["1 System.Private.CoreLib.dll", "0 (none)", "1 Manifest", "4 System.Private.CoreLib.dll"], correctIndex: 0, xp: 10,
      okText: 'Сборка = <b>манифест + модули + метаданные</b>. У single-file сборки <span class="hl">один</span> модуль, и манифест лежит в нём же — <code>ManifestModule.Name</code> это тот самый <code>.dll</code>. «Манифест представляет собой обычный набор таблиц метаданных».',
      noText: '<code>GetModules().Length</code> = 1 (одна сборка = один модуль в современном .NET), <code>ManifestModule.Name</code> = файл с манифестом = <code>System.Private.CoreLib.dll</code>. Манифест — часть модуля, не отдельный файл.',
      verify: { kind: "exec", run: "dotnet run", expect: "1 System.Private.CoreLib.dll" }, sourceRefs: ["clr-ch1", "clr-ch2"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Метаданные = таблицы", v: '«Метаданные — это <span class="hl">блок двоичных данных, состоящий из нескольких таблиц</span>. Существуют три категории таблиц: определений, ссылок и манифестов». Компилятор пишет строку на каждую сущность (<code>TypeDef</code>/<code>MethodDef</code>/<code>FieldDef</code>).' },
    { icon: "cost", k: "Токен = таблица + строка", v: '«размер маркеров метаданных — 4 байта. Старший байт указывает тип маркера (… 0x02=TypeDef …)»; три младших — номер строки. IL ссылается на типы/члены токеном, а не именем (замер: тип/метод/поле → <code>02 06 04</code>).' },
    { icon: "avoid", k: "Сборка самоописываема", v: 'Сборка = манифест + модули + метаданные; манифест «представляет собой обычный набор таблиц метаданных», а <code>AssemblyRef</code> перечисляет зависимости → «среда CLR может определить все прямые зависимости данной сборки» (замер: 1 модуль, манифест = <code>.dll</code>).' },
  ],

  foot: 'урок · <b>метаданные и сборки</b> · 5 анимир. разборов · таблицы+токены · манифест самоописывает · панель token>>24=таблица · источник <b>Рихтер, CLR via C#, гл.1-2</b> · дизайн <b>mid</b>',
};
