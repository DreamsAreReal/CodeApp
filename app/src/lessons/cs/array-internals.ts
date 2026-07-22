/**
 * Lesson: array internals (CS.S13.array-internals) — expert density, 5 animated deep-dives.
 * Book-sourced (Richter, CLR via C#, 4th ed., ch. 16 «Массивы»). The CLR treats arrays as a
 * first-class reference type derived from System.Array: an array carries a type-object pointer +
 * sync-block index + dimensionality/lower-bounds/length metadata. Array COVARIANCE lets an
 * `object[]` variable point at a `string[]`, but the CLR must then TYPE-CHECK every store into
 * that slot at run time — writing an `int` (via boxing) into an array whose real element type is
 * `string` throws ArrayTypeMismatchException. And the runtime bounds-checks every index.
 * COMPLEMENTS CS.S17 (collections built on top of arrays) and CS.S1 (boxing) — here the subject is
 * the CLR-level array object: covariance safety, the array's type object, and bounds checking.
 *
 * SIGNATURE machine panel (s5): covariance is unsafe by construction, so the CLR guards it — the
 * canonical `object[] a = new string[1]; a[0] = 42;` throws a DETERMINISTIC ArrayTypeMismatchException
 * (the array's REAL element type is string, 42 is int). And `new int[3].GetType()` reports
 * System.Int32[] — the CLR auto-manufactures a distinct array type. REAL run-csharp measurements
 * (this file's exec cards, app backend :5080). Never a fabricated internal number.
 *
 * BOOK PROVENANCE (replaces the URL-verbatim rule):
 *   - Every guillemet passage is VERBATIM RUSSIAN from clr-book.txt (ch. 16, intro + the
 *     "Приведение типов в массивах" covariance example + the bounds-check note), substring-checked (wrap/soft-hyphen normalized).
 *   - Exec-card expects are REAL, DETERMINISTIC run-csharp stdout:
 *     c1 "ArrayTypeMismatchException" (covariance run-time store-check fails for object[]←string[], a[0]=42) ·
 *     c2 "System.Int32[]" (the CLR manufactures a distinct array type object per element type) ·
 *     c3 "IndexOutOfRangeException" (the CLR bounds-checks every index).
 *   - The per-store type check and the auto-created array type are proven by exec; the array's raw
 *     header/metadata bytes are internal and taught FROM THE BOOK (quoted). No fabricated internal number.
 *   - .NET 10 note: arrays deriving from System.Array, reference-type array covariance with a run-time
 *     store type-check (ArrayTypeMismatchException), value-type arrays NOT being covariant, and index
 *     bounds-checking are TIMELESS CLR internals unchanged in .NET 10.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S13.array-internals/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: an array is a reference type derived from System.Object, laid out in the managed heap.
const Z_VAR: Zone = { id: "var", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ПЕРЕМЕННАЯ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "ссылка на массив", subCls: "vz-zsub", subY: 47 };
const Z_HEAP: Zone = { id: "heap", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "МАССИВ В КУЧЕ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "заголовок + элементы", subCls: "vz-zsub heap", subY: 47 };
const VAR_ZONES: Zone[] = [Z_VAR, Z_HEAP];

// s2: the array block carries type-object pointer + sync-block index + shape metadata.
const Z_BLK: Zone = { id: "blk", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone heap", label: "БЛОК ПАМЯТИ МАССИВА", labelCls: "vz-zlabel heap", lx: 170, ly: 22, sub: "служебные члены + сведения о форме + элементы", subCls: "vz-zsub heap", subY: 40 };
const BLK_ZONES: Zone[] = [Z_BLK];

// s3: covariance — an object[] variable may point at a string[] array (reference types only).
const Z_SA: Zone = { id: "sa", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "String[] sa", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "реальный массив", subCls: "vz-zsub", subY: 47 };
const Z_OA: Zone = { id: "oa", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Object[] oa = sa", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "ковариантный вид", subCls: "vz-zsub good", subY: 47 };
const COV_ZONES: Zone[] = [Z_SA, Z_OA];

// s4: every store through the covariant view is type-checked at run time.
const Z_STORE: Zone = { id: "store", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ЗАПИСЬ oa[i] = ...", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "проверка при выполнении", subCls: "vz-zsub", subY: 47 };
const Z_CHK: Zone = { id: "chk", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ПРОВЕРКА CLR", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "тип элемента = String?", subCls: "vz-zsub good", subY: 47 };
const STORE_ZONES: Zone[] = [Z_STORE, Z_CHK];

// s5 (SIGNATURE): the canonical covariance trap + the manufactured array type object.
const Z_CODE: Zone = { id: "code", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "КАНОНИЧЕСКИЙ КЕЙС", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "object[] ← string[]", subCls: "vz-zsub", subY: 47 };
const Z_PROOF: Zone = { id: "proof", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "СЛЕДСТВИЕ (замер)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "детерминированный тип", subCls: "vz-zsub good", subY: 47 };
const PROOF_ZONES: Zone[] = [Z_CODE, Z_PROOF];

export const arrayInternals: LessonData = {
  id: "CS.S13.array-internals",
  track: "CS",
  section: "CS.S13",
  module: "S13.7",
  lang: "csharp",
  title: "Внутренности массива: ковариантность, тип-объект, границы",
  kicker: "CLR внутри · S13 · массив в CLR",
  home: { subtitle: "Ковариантность массивов и её проверка; тип-объект массива; проверка границ", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "clr-ch16", kind: "book", org: "Джеффри Рихтер", title: "CLR via C#, 4-е изд., гл. 16 «Массивы»", url: "", date: "2013" },
  ],

  spec: [
    { text: "Массив — ссылочный тип от <code>System.Object</code>, в его блоке лежат служебные члены и форма: «Базовым для всех массивов является абстрактный класс System.Array, производный от System.Object. Значит, массивы всегда относятся к ссылочному типу и размещаются в управляемой куче». В блоке «помимо элементов массива… размещается <b>указатель на объект-тип, индекс блока синхронизации</b>, а также некоторые дополнительные члены».", source: "clr-ch16" },
  ],
  edgeCases: [
    { text: "Ковариантность массивов — только для <b>ссылочных</b> типов, и CLR проверяет каждую запись: «CLR проверяет принадлежность oa к типу Int32»… «Генерируется исключение <b>ArrayTypeMismatchException</b>» (собственный прогон: <code>object[] a = new string[1]; a[0] = 42;</code> → детерминированно <code>ArrayTypeMismatchException</code>).", source: "clr-ch16" },
    { text: "Массивы <b>значимых</b> типов ковариантности не имеют вовсе: «CLR не поддерживает преобразование массивов с элементами значимых типов в другие типы» — <code>(Object[]) i1dim</code> для <code>Int32[]</code> даже не компилируется (ошибка CS0030).", source: "clr-ch16" },
    { text: "CLR проверяет и <b>границы</b>: «CLR проверяет корректность индексов. То есть если у вас имеется массив, состоящий из 100 элементов с индексами от 0 до 99, попытка обратиться к его элементу по индексу –5 или 100 породит исключение» (собственный прогон: <code>(new int[3])[3]</code> — индекс 3 у массива из 3 элементов → <code>IndexOutOfRangeException</code>).", source: "clr-ch16" },
  ],

  misconceptions: [
    {
      wrong: "массив — это просто указатель на непрерывный блок значений; ковариантность массивов бесплатна и безопасна, а тип массива — тот же, что у элементов",
      hook: 'Нет по всем пунктам. Массив — полноценный <b>ссылочный тип</b> от <code>System.Array</code> с заголовком (указатель на объект-тип, индекс блока синхронизации) и метаданными формы. У массива <span class="hl">свой тип-объект</span>: <code>new int[3].GetType()</code> → <code>System.Int32[]</code>, а не <code>Int32</code>. Ковариантность массивов (<code>object[] oa = sa;</code>, где <code>sa</code> — <code>string[]</code>) — <b>не бесплатна</b>: «эта операция сказывается на производительности», потому что CLR проверяет <span class="hl">каждую запись</span> в рантайме. Записать <code>int</code> в массив, реальный тип которого <code>string</code>, нельзя: «Генерируется исключение <b>ArrayTypeMismatchException</b>». Дальше <b>пять разборов</b>: массив как ссылочный тип, служебные члены + форма, ковариантность (только ссылочные), проверка записи в рантайме, и <b>машинная панель</b> — <code>a[0] = 42</code> бросает <code>ArrayTypeMismatchException</code>, а <code>new int[3].GetType()</code> = <code>System.Int32[]</code> (реальный прогон).',
      source: "clr-ch16",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Ссылочный тип от System.Array", title: "Массив — ссылочный тип: переменная хранит ссылку, не элементы",
      viewBox: "0 0 340 210", zones: VAR_ZONES,
      code: ["Int32[] myIntegers;            // объявление ссылки (пока null)", "myIntegers = new Int32[100];   // выделение в куче, элементы = 0", "// переменная содержит НЕ элементы, а ссылку на массив"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Объявление даёт <b>ссылку</b>, пока <code>null</code>: «Вначале ей присваивается значение null, так как память под массив пока не выделена».', nodes: [{ id: "v", kind: "slot", at: { zone: "var", row: 0 }, name: "myIntegers", value: "null", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>new Int32[100]</code> выделяет блок в <span class="hl">управляемой куче</span> и обнуляет элементы: «массивы всегда относятся к ссылочному типу и размещаются в управляемой куче».', nodes: [{ id: "v", kind: "slot", at: { zone: "var", row: 0 }, name: "myIntegers", value: "→" }, { id: "arr", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "Int32[100]", value: "элементы = 0", accent: true }], edges: [{ id: "e", from: "v", to: "arr", accent: true }] },
        { codeLine: 2, out: "", caption: 'Переменная хранит <b>адрес блока</b>, а не сами элементы: «переменная в приложении содержит не элементы массива, а ссылку на массив».', nodes: [{ id: "v", kind: "slot", at: { zone: "var", row: 0 }, name: "myIntegers", value: "адрес блока" }, { id: "arr", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "Int32[100]", value: "в куче" }], edges: [{ id: "e", from: "v", to: "arr" }] },
      ],
      explain: 'Массив — это не сырой указатель на память, а <b>объект ссылочного типа</b>. Дословно: «Базовым для всех массивов является абстрактный класс System.Array, производный от System.Object. Значит, <span class="hl">массивы всегда относятся к ссылочному типу и размещаются в управляемой куче</span>, а переменная в приложении содержит не элементы массива, а ссылку на массив». При <code>new Int32[100]</code> «выделяется память под 100 значений типа Int32; и всем им присваивается начальное значение 0. Поскольку массивы относятся к ссылочным типам, блок памяти для хранения 100 неупакованных экземпляров типа Int32 выделяется в управляемой куче». Именно потому, что массив — объект в куче, у него есть заголовок и тип-объект (разбор 02), а его тип отличается от типа элемента: <code>new int[3].GetType()</code> вернёт <code>System.Int32[]</code>, а не <code>Int32</code> (разбор 05).',
      sources: ["clr-ch16"],
    },
    {
      id: "s2", num: "02", kicker: "Заголовок + форма", title: "В блоке массива: служебные члены и сведения о форме",
      viewBox: "0 0 340 276", zones: BLK_ZONES,
      code: ["// блок памяти массива в куче содержит:", "//   указатель на объект-тип + индекс блока синхронизации", "//   размерность, нижние границы, длину каждого измерения", "//   и сами элементы"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Как у любого объекта кучи — <b>служебные члены</b>: «помимо элементов массива в этом блоке размещается указатель на объект-тип, индекс блока синхронизации, а также некоторые дополнительные члены».', nodes: [{ id: "hdr", kind: "obj", at: { zone: "blk", row: 0 }, typeTag: "заголовок", value: "objptr + sync + доп. члены", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Плюс <span class="hl">сведения о форме</span>: «Это сведения о размерности массива, нижних границах всех его измерений (почти всегда 0) и количестве элементов в каждом измерении. Здесь же указывается тип элементов массива».', nodes: [{ id: "hdr", kind: "obj", at: { zone: "blk", row: 0 }, typeTag: "заголовок", value: "objptr + sync" }, { id: "shape", kind: "obj", at: { zone: "blk", row: 1 }, typeTag: "форма", value: "размерность · границы · длины · тип элемента", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'И <b>сами элементы</b>. Итог: массив = заголовок + форма + данные, всё в одном блоке кучи.', nodes: [{ id: "hdr", kind: "obj", at: { zone: "blk", row: 0 }, typeTag: "заголовок", value: "objptr + sync" }, { id: "shape", kind: "obj", at: { zone: "blk", row: 1 }, typeTag: "форма", value: "размерность · границы · длины" }, { id: "data", kind: "obj", at: { zone: "blk", row: 2 }, typeTag: "элементы", value: "неупакованные значения / ссылки", accent: true }], edges: [] },
      ],
      explain: 'Блок массива несёт не только данные, но и <b>метаданные формы</b>, которыми пользуются проверки CLR. Дословно: «помимо элементов массива в этом блоке размещается <span class="hl">указатель на объект-тип, индекс блока синхронизации</span>, а также некоторые дополнительные члены». И отдельно про форму: «в массиве присутствует некая дополнительная информация. Это сведения о размерности массива, нижних границах всех его измерений (почти всегда 0) и количестве элементов в каждом измерении. Здесь же указывается тип элементов массива». Именно эта записанная в блоке информация — реальный тип элементов и длины измерений — позволяет CLR проверять <b>границы</b> (разбор 05: <code>IndexOutOfRangeException</code>) и <b>совместимость типа при записи</b> в ковариантный массив (разбор 04). Быстрее всего работают одномерные массивы с нулевым началом (SZ / векторы): для них есть свои IL-инструкции — «newarr, ldelem, ldelema, ldlen и stelem».',
      sources: ["clr-ch16"],
    },
    {
      id: "s3", num: "03", kicker: "Ковариантность · только ссылочные", title: "Ковариантность: object[] может смотреть на string[]",
      viewBox: "0 0 340 210", zones: COV_ZONES,
      code: ["String[] sa = new String[100];  // реальный массив String", "Object[] oa = sa;               // ковариантный вид", "// oa ссылается на ТОТ ЖЕ массив, но видит его как Object[]", "// (только для ссылочных типов; Int32[] так нельзя)"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>sa</code> — реальный массив <code>String[100]</code> в куче.', nodes: [{ id: "sa", kind: "obj", at: { zone: "sa", row: 0 }, typeTag: "String[100]", value: "реальный тип", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Ковариантность: <code>Object[] oa = sa;</code> — «oa ссылается на массив элементов типа String». <span class="hl">Тот же</span> массив, вид как <code>Object[]</code>.', nodes: [{ id: "sa", kind: "obj", at: { zone: "sa", row: 0 }, typeTag: "String[100]", value: "реальный тип" }, { id: "oa", kind: "slot", at: { zone: "oa", row: 0 }, name: "oa: Object[]", value: "→ тот же массив", accent: true }], edges: [{ id: "e", from: "oa", to: "sa", accent: true }] },
        { codeLine: 3, out: "", caption: 'Для <b>значимых</b> типов так нельзя: «CLR не поддерживает преобразование массивов с элементами значимых типов» — <code>(Object[]) i1dim</code> не скомпилируется.', nodes: [{ id: "int", kind: "obj", at: { zone: "sa", row: 0 }, typeTag: "Int32[]", value: "значимый" }, { id: "no", kind: "gate", at: { zone: "oa", row: 0 }, state: "fail", label: "(Object[])", detail: "CS0030", accent: true }], edges: [] },
      ],
      explain: 'Ковариантность массивов — это возможность смотреть на массив производного типа как на массив базового, но <b>только для ссылочных</b> элементов. Дословно: «В CLR для массивов с элементами ссылочного типа допустимо приведение. В рамках решения этой задачи оба типа массивов должны иметь одинаковую размерность; кроме того, должно иметь место неявное или явное преобразование из типа элементов исходного массива в целевой тип». И жёсткое ограничение для значимых типов: «<span class="hl">CLR не поддерживает преобразование массивов с элементами значимых типов в другие типы</span>» — <code>Object[] o1dim = (Object[]) i1dim;</code> для <code>Int32[]</code> даёт «Ошибка компиляции CS0030». Ковариантность удобна, но небесплатна: «Бывают ситуации, когда полезно изменить тип массива, то есть выполнить его ковариацию (array covariance). Однако следует помнить, что <b>эта операция сказывается на производительности</b>» — почему, покажет разбор 04.',
      sources: ["clr-ch16"],
    },
    {
      id: "s4", num: "04", kicker: "Проверка записи в рантайме", title: "Каждая запись в ковариантный массив проверяется CLR",
      viewBox: "0 0 340 210", zones: STORE_ZONES,
      code: ["Object[] oa = sa;   // oa смотрит на String[]", "oa[5] = \"Jeff\";     // String в String[] — проверка ОК", "oa[3] = 5;          // Int32 в String[] — проверка НЕ пройдёт", "//                   → ArrayTypeMismatchException"],
      predictAt: 2, predictQ: '<code>oa</code> имеет тип <code>Object[]</code>, но реально указывает на <code>String[]</code>. Запись <code>oa[5] = "Jeff"</code> проходит. А <code>oa[3] = 5</code> (Int32) — компилируется, но что будет в рантайме?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Запись <code>String</code> в массив <code>String</code>: «CLR проверяет принадлежность oa к типу String»… «Проверка проходит успешно».', nodes: [{ id: "s", kind: "obj", at: { zone: "store", row: 0 }, typeTag: "oa[5]=\"Jeff\"", value: "String", accent: true }, { id: "ok", kind: "gate", at: { zone: "chk", row: 0 }, state: "ok", label: "тип совпал", detail: "String = String", accent: true }], edges: [{ id: "e", from: "s", to: "ok", accent: true }] },
        { codeLine: 2, out: "", caption: 'Запись <code>Int32</code>: CLR «в процессе выполнения контролирует наличие в массиве элементов типа Int32. <span class="hl">В данном случае такие элементы отсутствуют</span>».', nodes: [{ id: "i", kind: "obj", at: { zone: "store", row: 0 }, typeTag: "oa[3]=5", value: "Int32" }, { id: "fail", kind: "gate", at: { zone: "chk", row: 0 }, state: "fail", label: "тип НЕ тот", detail: "Int32 ≠ String", accent: true }], edges: [{ id: "e", from: "i", to: "fail", accent: true }] },
        { codeLine: 3, out: "", caption: 'Итог — исключение: «что и становится причиной исключения <b>ArrayTypeMismatchException</b>». Проверка на КАЖДУЮ запись — вот цена ковариантности.', nodes: [{ id: "ex", kind: "gate", at: { zone: "store", row: 0 }, state: "fail", label: "throw", detail: "ArrayTypeMismatch", accent: true }, { id: "why", kind: "obj", at: { zone: "chk", row: 0 }, typeTag: "цена", value: "проверка каждой записи", accent: true }], edges: [] },
      ],
      explain: 'Ковариантность массивов <b>небезопасна по построению</b>, поэтому CLR закрывает дыру проверкой каждой записи. Разберём пример из книги: <code>String[] sa = new String[100]; Object[] oa = sa;</code>. Дословно, запись <code>oa[5]</code>: «CLR проверяет принадлежность oa к типу String»… «Проверка проходит успешно» — а вот запись <code>oa[3] = 5</code>: «CLR проверяет принадлежность oa к типу Int32»… <span class="hl">«Генерируется исключение ArrayTypeMismatchException»</span>. Почему: «переменная oa, тип которой определен как Object[], ссылается на массив типа String[]. Затем вы пытаетесь присвоить одному из элементов этого массива значение 5, относящееся к типу Int32… CLR проверяет корректность такого присваивания, то есть в процессе выполнения контролирует наличие в массиве элементов типа Int32. В данном случае такие элементы отсутствуют, что и становится причиной исключения ArrayTypeMismatchException». Именно эта проверка на каждый store — «операция сказывается на производительности». Реальный тип элемента CLR берёт из формы массива (разбор 02).',
      sources: ["clr-ch16"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · следствие замером", title: "a[0]=42 → ArrayTypeMismatchException; тип = System.Int32[]",
      viewBox: "0 0 340 210", zones: PROOF_ZONES,
      code: ["object[] a = new string[1];   // ковариантный вид на string[]", "try { a[0] = 42; }            // Int32 в string[] — запрещено", "catch (ArrayTypeMismatchException) { WriteLine(\"ArrayTypeMismatchException\"); }", "Console.WriteLine(new int[3].GetType());  // тип-объект массива"],
      predictAt: 1, predictQ: '<code>object[] a = new string[1];</code> затем <code>a[0] = 42;</code> в try/catch. Какой тип исключения поймается? И что напечатает <code>new int[3].GetType()</code> — <code>Int32</code> или что-то другое?',
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>a</code> имеет тип <code>object[]</code>, но реально это <code>string[1]</code>. Записать <code>int</code> нельзя — реальный тип элемента <code>string</code>.', nodes: [{ id: "a", kind: "slot", at: { zone: "code", row: 0 }, name: "a: object[]", value: "→ string[1]", accent: true }, { id: "put", kind: "obj", at: { zone: "code", row: 1 }, typeTag: "a[0] = 42", value: "Int32" }], edges: [] },
        { codeLine: 2, out: "ArrayTypeMismatchException", caption: 'CLR проверяет запись и бросает <span class="hl">ArrayTypeMismatchException</span> — детерминированно, тот же тип всегда (реальный прогон).', nodes: [{ id: "a", kind: "slot", at: { zone: "code", row: 0 }, name: "a: object[]", value: "→ string[1]" }, { id: "ex", kind: "gate", at: { zone: "proof", row: 0 }, state: "fail", label: "throw", detail: "ArrayTypeMismatch", accent: true }], edges: [{ id: "e", from: "a", to: "ex", accent: true }] },
        { codeLine: 3, out: "System.Int32[]", caption: '<code>new int[3].GetType()</code> = <b>System.Int32[]</b>: у массива <span class="hl">свой тип-объект</span>, отличный от <code>Int32</code> — CLR создаёт тип массива автоматически (реальный прогон).', nodes: [{ id: "arr", kind: "obj", at: { zone: "code", row: 0 }, typeTag: "new int[3]", value: "GetType()", accent: true }, { id: "t", kind: "gate", at: { zone: "proof", row: 0 }, state: "ok", label: "тип массива", detail: "System.Int32[]", accent: true }], edges: [{ id: "e", from: "arr", to: "t", accent: true }] },
      ],
      explain: 'Это машинная панель урока — два следствия внутренностей массива, снятые замером. <b>Первое</b>: канонический трюк ковариантности <code>object[] a = new string[1]; a[0] = 42;</code> бросает <b>ArrayTypeMismatchException</b> — детерминированно, всегда именно этот тип. Это прямая проверка store из разбора 04: «CLR проверяет корректность такого присваивания»… «В данном случае такие элементы отсутствуют, что и становится причиной исключения ArrayTypeMismatchException». Реальный тип элемента (<code>string</code>) CLR знает из формы массива, поэтому запись <code>int</code> отвергается. <b>Второе</b>: <code>new int[3].GetType()</code> = <b>System.Int32[]</b>, а не <code>Int32</code> — у массива свой <b>тип-объект</b>, который CLR создаёт автоматически: «Объявление переменной массива подобным образом приводит к автоматическому созданию типа <code>FileStream[]</code> для домена приложений». Массив — самостоятельный ссылочный тип, а не просто набор <code>int</code> с индексами. Оба факта не читаются как сырые байты, но их эффект — вот, числом и типом исключения.',
      sources: ["clr-ch16"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>object[] a = new string[1];</code><br/><code>try { a[0] = 42; Console.WriteLine("no throw"); }</code><br/><code>catch (ArrayTypeMismatchException) { Console.WriteLine("ArrayTypeMismatchException"); }</code> — что напечатает?',
      options: ["ArrayTypeMismatchException", "no throw", "InvalidCastException", "IndexOutOfRangeException"], correctIndex: 0, xp: 10,
      okText: '<code>a</code> реально указывает на <code>string[]</code>. CLR проверяет тип на <b>каждую запись</b>: <code>int</code> в массив <code>string</code> запрещён — «Генерируется исключение <span class="hl">ArrayTypeMismatchException</span>». Это и есть цена ковариантности массивов.',
      noText: 'Ковариантность делает <code>a</code> видом на <code>string[]</code>, но реальный тип элемента — <code>string</code>. Запись <code>int</code> проверяется в рантайме и падает с <b>ArrayTypeMismatchException</b> (детерминированно).',
      verify: { kind: "exec", run: "dotnet run", expect: "ArrayTypeMismatchException" }, sourceRefs: ["clr-ch16"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>Console.WriteLine(new int[3].GetType());</code> — что напечатает (тип-объект массива)?',
      options: ["System.Int32[]", "System.Int32", "System.Array", "System.Object[]"], correctIndex: 0, xp: 10,
      okText: 'У массива <b>свой</b> тип-объект, отличный от типа элемента: <code>new int[3].GetType()</code> = <span class="hl">System.Int32[]</span>. CLR «автоматически» создаёт тип массива для домена приложений. Массив — самостоятельный ссылочный тип.',
      noText: 'Тип массива — не <code>Int32</code> и не <code>System.Array</code>, а конкретный <b>System.Int32[]</b>, который CLR создаёт для каждого типа элементов. Массив производен от <code>System.Array</code>, но его <code>GetType()</code> точен.',
      verify: { kind: "exec", run: "dotnet run", expect: "System.Int32[]" }, sourceRefs: ["clr-ch16"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var a = new int[3];</code><br/><code>try { Console.WriteLine(a[3]); }</code><br/><code>catch (IndexOutOfRangeException) { Console.WriteLine("IndexOutOfRangeException"); }</code> — что напечатает?',
      options: ["IndexOutOfRangeException", "0", "ArrayTypeMismatchException", "3"], correctIndex: 0, xp: 10,
      okText: 'Массив из 3 элементов имеет индексы 0..2; индекс 3 — за границей. «CLR проверяет корректность индексов… попытка обратиться к его элементу по индексу… <span class="hl">100 породит исключение</span>» → <b>IndexOutOfRangeException</b>. Проверка границ защищает безопасность типов.',
      noText: 'Индекс 3 в массиве длиной 3 выходит за границу (валидны 0..2). CLR проверяет каждый индекс и бросает <b>IndexOutOfRangeException</b> — «Доступ к памяти за пределами массива нарушает безопасность типов».',
      verify: { kind: "exec", run: "dotnet run", expect: "IndexOutOfRangeException" }, sourceRefs: ["clr-ch16"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Массив = ссылочный тип с формой", v: '«массивы всегда относятся к ссылочному типу и размещаются в управляемой куче»; в блоке — «указатель на объект-тип, индекс блока синхронизации», размерность, границы, длины и тип элемента. Свой тип-объект: <code>new int[3].GetType()</code> = <b>System.Int32[]</b> (замер).' },
    { icon: "cost", k: "Ковариантность проверяется на записи", v: 'Для ссылочных типов <code>object[] oa = sa;</code> допустимо, но «операция сказывается на производительности»: CLR проверяет тип на КАЖДУЮ запись. <code>oa[3]=5</code> для <code>String[]</code> → «Генерируется исключение <b>ArrayTypeMismatchException</b>» (замер).' },
    { icon: "avoid", k: "Границы и значимые типы", v: 'Массивы значимых типов не ковариантны вовсе («CLR не поддерживает преобразование массивов с элементами значимых типов»). И «CLR проверяет корректность индексов» — выход за границу → <b>IndexOutOfRangeException</b> (замер).' },
  ],

  foot: 'урок · <b>внутренности массива</b> · 5 анимир. разборов · ссылочный тип · ковариантность · проверка записи · панель ATME / System.Int32[] · источник <b>Рихтер, CLR via C#, гл.16</b> · дизайн <b>mid</b>',
};
