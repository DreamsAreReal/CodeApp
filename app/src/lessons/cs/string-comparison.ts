/**
 * Lesson: String comparison — ordinal vs culture (CS.S12.string-comparison) — expert density,
 * 5 animated deep-dives. The senior fact: string comparison is NOT one thing. An ordinal
 * comparison is a byte/code-point comparison — fast and culture-insensitive; a culture-sensitive
 * comparison applies linguistic word-sort rules that DIFFER per culture (the Turkish-I). Always
 * call an overload with an explicit StringComparison, and default to Ordinal/OrdinalIgnoreCase
 * for non-linguistic (identifier/symbolic) matching.
 *
 * SIGNATURE machine panel (s5): "i" vs "I" is EQUAL under OrdinalIgnoreCase and under the invariant
 * culture, but NOT equal under the tr-TR (Turkish) culture — the canonical Turkish-I bug. REAL
 * run-csharp measurement (this file's exec cards): c1 "32\n0\nTrue" (Ordinal magnitude, IgnoreCase
 * equal) · c2 "True\n1\n0" (OrdinalIgnoreCase eq, tr-TR IgnoreCase NOT eq, invariant eq) · c3
 * "32\n-1" (ordinal by code point vs en-US linguistic sort).
 *
 * Accuracy contract (G4/G7/G8) — verified against learn.microsoft.com/.../standard/base-types/
 * best-practices-strings and .../api/system.stringcomparison (dotnet/docs + StringComparison.xml,
 * substring-checked 2026-07-22):
 *   - every English quote is VERBATIM from those two pages (each item cites its own page(s));
 *   - the comparison RESULTS are OWN DETERMINISTIC run-csharp measurements (this file's exec cards),
 *     presented as such and PROVEN by them, never faked;
 *   - every card verify.expect is the REAL stdout of run-csharp: c1 "32\n0\nTrue" · c2 "True\n1\n0" ·
 *     c3 "32\n-1".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S12.string-comparison/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: two comparison worlds — ordinal (bytes) vs culture (linguistic).
const Z_ORD: Zone = { id: "ord", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ORDINAL · по code point", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "fast · culture-insensitive", subCls: "vz-zsub good", subY: 47 };
const Z_CUL: Zone = { id: "cul", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "CULTURE · word sort", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "зависит от культуры", subCls: "vz-zsub heap", subY: 47 };
const WORLD_ZONES: Zone[] = [Z_ORD, Z_CUL];

// s2: ordinal = numeric code-point comparison.
const Z_CODE: Zone = { id: "code", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "ORDINAL · numeric value (Unicode code point) каждого char", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "'a'=97, 'A'=65 → разница 32", subCls: "vz-zsub good", subY: 47 };
const CODE_ZONES: Zone[] = [Z_CODE];

// s3: culture-sensitive word sort differs per culture.
const Z_INV: Zone = { id: "inv", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "INVARIANT · i == I", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "IgnoreCase → равны", subCls: "vz-zsub", subY: 47 };
const Z_TR: Zone = { id: "tr", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "tr-TR · i ≠ I", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "турецкая точечная i", subCls: "vz-zsub heap", subY: 47 };
const CULTURE_ZONES: Zone[] = [Z_INV, Z_TR];

// s4: best practice — always pass an explicit StringComparison.
const Z_BAD: Zone = { id: "bad", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "БЕЗ StringComparison", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "неявная культура → баги", subCls: "vz-zsub", subY: 47 };
const Z_GOOD: Zone = { id: "good", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "С Ordinal / OrdinalIgnoreCase", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "явно · быстро · надёжно", subCls: "vz-zsub good", subY: 47 };
const RULE_ZONES: Zone[] = [Z_BAD, Z_GOOD];

// s5 (SIGNATURE): Turkish-I — same "i"/"I" pair, three verdicts.
const Z_PAIR: Zone = { id: "pair", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: '"i" vs "I"', labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "одна пара, три политики", subCls: "vz-zsub", subY: 47 };
const Z_VERD: Zone = { id: "verd", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ТРИ ВЕРДИКТА", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "OrdIC=eq · tr-TR≠ · inv=eq", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_PAIR, Z_VERD];

export const stringComparison: LessonData = {
  id: "CS.S12.string-comparison",
  track: "CS",
  section: "CS.S12",
  module: "S12.4",
  lang: "csharp",
  title: "Сравнение строк: ordinal vs culture и StringComparison",
  kicker: "C# вглубь · S12 · как сравнивать",
  home: { subtitle: "ordinal = code point, culture = word sort, Turkish-I, всегда StringComparison", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-bps", kind: "doc", org: "Microsoft Learn", title: "Best practices for comparing strings in .NET", url: "https://learn.microsoft.com/en-us/dotnet/standard/base-types/best-practices-strings", date: "2025-07-01" },
    { id: "ms-sc", kind: "doc", org: "Microsoft Learn", title: "StringComparison Enum", url: "https://learn.microsoft.com/en-us/dotnet/api/system.stringcomparison", date: "2025-07-01" },
  ],

  spec: [
    { text: "«The StringComparison enumeration is used to specify whether a string comparison should use the current culture or the invariant culture, word or ordinal sort rules, and be case-sensitive or case-insensitive.» <span class=\"ru-tr\">«Перечисление StringComparison используется, чтобы задать, должно ли сравнение строк использовать текущую культуру или инвариантную культуру, словарные или порядковые правила сортировки, и быть чувствительным или нечувствительным к регистру.»</span>", source: "ms-sc" },
  ],
  edgeCases: [
    { text: "Ordinal — это <b>сравнение по коду</b>: «An operation that uses ordinal sort rules performs a comparison based on the <span class=\"hl\">numeric value (Unicode code point)</span> of each Char in the string. An ordinal comparison is <b>fast but culture-insensitive</b>». <span class=\"ru-tr\">«Операция, использующая порядковые правила сортировки, выполняет сравнение на основе числового значения (Unicode code point) каждого Char в строке. Порядковое сравнение быстрое, но нечувствительно к культуре».</span> Собственный прогон: <code>Compare(\"abc\",\"ABC\",Ordinal)</code> = 32 ('a'−'A').", source: "ms-sc" },
    { text: "Culture-sensitive применяет <b>лингвистические</b> правила: «An operation that uses word sort rules performs a <span class=\"hl\">culture-sensitive comparison</span> wherein certain nonalphanumeric Unicode characters might have special weights assigned to them». <span class=\"ru-tr\">«Операция, использующая словарные правила сортировки, выполняет культурозависимое сравнение, при котором определённым не-буквенно-цифровым символам Unicode могут быть назначены особые веса».</span> Собственный прогон: <code>\"i\"</code> и <code>\"I\"</code> без учёта регистра — равны в invariant, но <b>не</b> в <code>tr-TR</code>.", source: "ms-sc" },
    { text: "Всегда передавай <code>StringComparison</code>: «you should <b>always</b> call an overload that includes a parameter of type StringComparison so that you can specify the type of comparison that the method performs». <span class=\"ru-tr\">«вы должны <b>всегда</b> вызывать перегрузку, которая включает параметр типа StringComparison, чтобы вы могли указать тип сравнения, который выполняет метод».</span> Дефолт для нелингвистичного матчинга — <code>Ordinal</code>/<code>OrdinalIgnoreCase</code>.", source: "ms-sc" },
    { text: "Ordinal — «non-linguistic» <span class=\"ru-tr\">«не-лингвистический»</span>: «Methods that are invoked with these StringComparison values base string operation decisions on <span class=\"hl\">simple byte comparisons</span> instead of casing or equivalence tables that are parameterized by culture». <span class=\"ru-tr\">«Методы, вызванные с этими значениями StringComparison, основывают решения об операциях над строками на <b>простых сравнениях байтов</b>, а не на таблицах регистра или эквивалентности, параметризованных культурой».</span> Быстрее и надёжнее для идентификаторов/символов.", source: "ms-bps" },
  ],

  misconceptions: [
    {
      wrong: "сравнение строк — это одно и то же везде; == и string.Compare(a, b) всегда дают один и тот же порядок, регистронезависимость не зависит от языка",
      hook: 'Нет — «сравнение» строк — это <b>несколько разных операций</b>, и результат зависит от выбранной политики. «The <b>StringComparison</b> enumeration is used to specify whether a string comparison should use the <span class="hl">current culture or the invariant culture</span>, <span class="hl">word or ordinal sort rules</span>, and be case-sensitive or case-insensitive». <span class="ru-tr">«Перечисление <b>StringComparison</b> используется, чтобы задать, должно ли сравнение строк использовать текущую культуру или инвариантную культуру, словарные или порядковые правила сортировки, и быть чувствительным или нечувствительным к регистру».</span> Есть два мира: <b>ordinal</b> — «a comparison based on the numeric value (Unicode code point) of each Char… fast but culture-insensitive» <span class="ru-tr">«сравнение на основе числового значения (Unicode code point) каждого Char… быстрое, но нечувствительно к культуре»</span>, и <b>culture-sensitive</b> word sort — «wherein certain nonalphanumeric Unicode characters might have special weights» <span class="ru-tr">«при котором определённые не-буквенно-цифровые символы Unicode могут иметь особые веса»</span>. Они дают <b>разные</b> вердикты: классический пример — Turkish-I, где <code>"i"</code> и <code>"I"</code> без регистра равны в инвариантной культуре, но <b>не равны</b> в турецкой. Поэтому правило: «you should <b>always</b> call an overload that includes a parameter of type <b>StringComparison</b>» <span class="ru-tr">«вы должны <b>всегда</b> вызывать перегрузку, которая включает параметр типа <b>StringComparison</b>»</span>, а безопасный дефолт для нелингвистичного матчинга — <code>Ordinal</code>/<code>OrdinalIgnoreCase</code>. Дальше <b>пять разборов</b>: два мира сравнения, ordinal как code point, culture word-sort и Turkish-I, правило «всегда передавай <code>StringComparison</code>», и <b>машинная панель</b> — три вердикта для одной пары <code>"i"/"I"</code> (реальный прогон).',
      source: ["ms-sc", "ms-bps"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Два мира сравнения", title: "Ordinal (байты) против culture (лингвистика)",
      viewBox: "0 0 340 210", zones: WORLD_ZONES,
      code: ["string.Compare(a, b, StringComparison.Ordinal);          // по code point", "string.Compare(a, b, StringComparison.CurrentCulture);   // word sort культуры"],
      scenes: [
        { codeLine: 0, out: "", caption: '<b>Ordinal</b>: сравнение по <span class="hl">числовому коду</span> каждого char. Быстро и <b>не зависит</b> от культуры.', nodes: [{ id: "o", kind: "gate", at: { zone: "ord", row: 0 }, state: "ok", label: "Ordinal", detail: "code point · fast", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<b>Culture</b>: <span class="hl">word sort</span> с лингвистическими весами. Результат <b>зависит</b> от культуры (язык, регистр).', nodes: [{ id: "o", kind: "gate", at: { zone: "ord", row: 0 }, state: "ok", label: "Ordinal", detail: "code point · fast" }, { id: "c", kind: "gate", at: { zone: "cul", row: 0 }, state: "ok", label: "Culture", detail: "word sort · per-culture", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Один <code>StringComparison</code> выбирает: current/invariant культуру, word/ordinal правила, чувствительность к регистру. Три оси, не «одно сравнение».', nodes: [{ id: "e", kind: "obj", at: { zone: "ord", row: 0 }, typeTag: "StringComparison", value: "3 оси", accent: true }], edges: [] },
      ],
      explain: 'Первое, что нужно принять: сравнение строк — это <b>не одна</b> операция. «The <b>StringComparison</b> enumeration is used to specify whether a string comparison should use the <span class="hl">current culture or the invariant culture, word or ordinal sort rules, and be case-sensitive or case-insensitive</span>». <span class="ru-tr">(перечисление StringComparison задаёт, использовать ли текущую или инвариантную культуру, словарные или порядковые правила сортировки, и учитывать ли регистр).</span> Два принципиально разных режима: <b>ordinal</b> сравнивает числовые коды символов, <b>word sort</b> применяет лингвистические правила конкретной культуры. У них разная скорость, разная семантика и — как увидим — разные вердикты для одних и тех же строк. Для сеньора это значит: выбор режима — часть контракта метода, а не деталь.',
      sources: ["ms-sc"],
    },
    {
      id: "s2", num: "02", kicker: "Ordinal = code point", title: "Сравнение по числовому коду каждого char",
      viewBox: "0 0 340 210", zones: CODE_ZONES,
      code: ["string.Compare(\"abc\", \"ABC\", StringComparison.Ordinal);            // 32", "string.Compare(\"abc\", \"ABC\", StringComparison.OrdinalIgnoreCase);  // 0", "string.Equals(\"abc\", \"ABC\", StringComparison.OrdinalIgnoreCase);   // True"],
      predictAt: 1, predictQ: "'a' = 97, 'A' = 65. Что даст <code>Compare(\"abc\",\"ABC\",Ordinal)</code>, затем <code>...OrdinalIgnoreCase</code>, затем <code>Equals(...,OrdinalIgnoreCase)</code>?", console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Ordinal сравнивает <span class="hl">коды</span>: <code>\'a\'</code>=97, <code>\'A\'</code>=65. Первый разный символ даёт знак и величину: 97−65 = <b>32</b>.', nodes: [{ id: "a", kind: "obj", at: { zone: "code", row: 0, col: 0 }, typeTag: "'a'", value: "97" }, { id: "A", kind: "obj", at: { zone: "code", row: 0, col: 1 }, typeTag: "'A'", value: "65", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>OrdinalIgnoreCase</code> для ASCII приравнивает <code>[A-Z]</code> к <code>[a-z]</code> → строки равны, <code>Compare</code> = <b>0</b>.', nodes: [{ id: "eq", kind: "gate", at: { zone: "code", row: 0 }, state: "ok", label: "OrdinalIgnoreCase", detail: "abc == ABC → 0", accent: true }], edges: [] },
        { codeLine: 2, out: "32\n0\nTrue", caption: 'Панель: <span class="hl">32 · 0 · True</span> (реальный прогон) — Ordinal=32 (по коду), OrdinalIgnoreCase Compare=0 и Equals=True.', nodes: [{ id: "r", kind: "gate", at: { zone: "code", row: 0 }, state: "ok", label: "32 / 0 / True", detail: "code point · ignore-case", accent: true }], edges: [] },
      ],
      explain: 'Ordinal — самый простой и быстрый режим: «An operation that uses <b>ordinal</b> sort rules performs a comparison based on the <span class="hl">numeric value (Unicode code point)</span> of each <b>Char</b> in the string. An ordinal comparison is <b>fast but culture-insensitive</b>». <span class="ru-tr">(операция с порядковыми правилами сравнивает по числовому значению (Unicode code point) каждого Char; порядковое сравнение быстрое, но нечувствительно к культуре).</span> Поэтому <code>Compare("abc","ABC",Ordinal)</code> возвращает <code>32</code> — это разность кодов первого различающегося символа (<code>\'a\'</code>=97, <code>\'A\'</code>=65). <code>OrdinalIgnoreCase</code> для ASCII «any character in [A, Z]… matches the corresponding character in [a,z]» <span class="ru-tr">«любой символ из [A, Z]… совпадает с соответствующим символом из [a,z]»</span>, поэтому <code>Compare</code> = <code>0</code>, а <code>Equals</code> = <code>True</code>. Собственный прогон: <code>32 / 0 / True</code>. Именно так стоит сравнивать идентификаторы, ключи, протокольные токены — предсказуемо и без сюрпризов культуры.',
      sources: ["ms-sc", "ms-bps"],
    },
    {
      id: "s3", num: "03", kicker: "Culture word-sort · Turkish-I", title: "Один и тот же i/I — разный вердикт по культуре",
      viewBox: "0 0 340 210", zones: CULTURE_ZONES,
      code: ["var tr = new CultureInfo(\"tr-TR\");", "string.Compare(\"i\", \"I\", CultureInfo.InvariantCulture, CompareOptions.IgnoreCase);  // 0 (равны)", "string.Compare(\"i\", \"I\", tr, CompareOptions.IgnoreCase);                          // 1 (НЕ равны)"],
      scenes: [
        { codeLine: 1, out: "", caption: 'В <b>инвариантной</b> культуре без регистра <code>"i"</code> и <code>"I"</code> — <span class="hl">равны</span> (Compare = 0). Как ожидает англоязычная интуиция.', nodes: [{ id: "inv", kind: "gate", at: { zone: "inv", row: 0 }, state: "ok", label: "invariant IgnoreCase", detail: "i == I → 0", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'В <b>турецкой</b> культуре <code>"i"</code> и <code>"I"</code> — <span class="hl">разные буквы</span> (точечная/бесточечная I). Даже без регистра они <b>не равны</b> (Compare = 1).', nodes: [{ id: "inv", kind: "gate", at: { zone: "inv", row: 0 }, state: "ok", label: "invariant", detail: "i == I → 0" }, { id: "tr", kind: "gate", at: { zone: "tr", row: 0 }, state: "fail", label: "tr-TR IgnoreCase", detail: "i ≠ I → 1", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Это «Turkish-I problem» <span class="ru-tr">«проблема турецкой I»</span>: культурные таблицы регистра <b>различаются</b>. Дефолтные (культурозависимые) перегрузки ловят такие баги.', nodes: [{ id: "bug", kind: "gate", at: { zone: "tr", row: 0 }, state: "fail", label: "Turkish-I", detail: "assumptions aren't valid among all cultures", accent: true }], edges: [] },
      ],
      explain: 'Culture-sensitive сравнение применяет <b>лингвистические</b> правила конкретной культуры: «An operation that uses <b>word sort</b> rules performs a <span class="hl">culture-sensitive comparison</span> wherein certain nonalphanumeric Unicode characters might have special weights assigned to them». <span class="ru-tr">(операция со словарными правилами выполняет культурозависимое сравнение, где определённым не-буквенно-цифровым символам Unicode могут назначаться особые веса).</span> Отсюда «Turkish-I problem» <span class="ru-tr">«проблема турецкой I»</span>: «assumptions made about capitalizing <b>"i"</b> or lowercasing <b>"I"</b> <span class="hl">aren\'t valid among all cultures</span>». <span class="ru-tr">(предположения о том, как переводить в верхний регистр «i» или в нижний «I», неверны для всех культур).</span> Собственный прогон подтверждает: <code>"i"</code>/<code>"I"</code> без регистра равны в инвариантной культуре (<code>0</code>), но <b>не равны</b> в <code>tr-TR</code> (<code>1</code>). Мораль: если строка — <b>не</b> человеческий текст (путь, схема URL, ключ), культурозависимое сравнение — источник тонких багов.',
      sources: ["ms-sc", "ms-bps"],
    },
    {
      id: "s4", num: "04", kicker: "Правило · always StringComparison", title: "Всегда указывай политику явно",
      viewBox: "0 0 340 210", zones: RULE_ZONES,
      code: ["// ПЛОХО: неявная культура — поведение зависит от локали машины", "if (path.StartsWith(\"file:\"))  { ... }", "// ХОРОШО: явный Ordinal — нелингвистичный идентификатор", "if (path.StartsWith(\"file:\", StringComparison.Ordinal)) { ... }"],
      scenes: [
        { codeLine: 1, out: "", caption: '<b>Без</b> <code>StringComparison</code> метод берёт <span class="hl">культурозависимое</span> сравнение по умолчанию → результат зависит от локали и ломается на Turkish-I.', nodes: [{ id: "bad", kind: "gate", at: { zone: "bad", row: 0 }, state: "fail", label: "StartsWith(\"file:\")", detail: "неявная культура", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'С явным <code>Ordinal</code> — <span class="hl">нелингвистичное</span> сравнение по коду. Для схемы URL, пути, ключа это и нужно: «simple byte comparisons» <span class="ru-tr">«простые сравнения байтов»</span>.', nodes: [{ id: "bad", kind: "gate", at: { zone: "bad", row: 0 }, state: "fail", label: "без флага", detail: "культура" }, { id: "good", kind: "gate", at: { zone: "good", row: 0 }, state: "ok", label: "StartsWith(..., Ordinal)", detail: "byte compare", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Правило: «you should <b>always</b> call an overload that includes a parameter of type <code>StringComparison</code>» <span class="ru-tr">«вы должны <b>всегда</b> вызывать перегрузку, которая включает параметр типа <code>StringComparison</code>»</span>. Дефолт для матчинга — <code>Ordinal</code>/<code>OrdinalIgnoreCase</code>.', nodes: [{ id: "rule", kind: "gate", at: { zone: "good", row: 0 }, state: "ok", label: "always StringComparison", detail: "intent явный", accent: true }], edges: [] },
      ],
      explain: 'Отсюда главная практика: «When you call a string comparison method such as <b>String.Compare</b>, <b>String.Equals</b>, or <b>String.IndexOf</b>, you should <span class="hl">always</span> call an overload that includes a parameter of type <b>StringComparison</b> so that you can specify the type of comparison that the method performs». <span class="ru-tr">(при вызове методов сравнения String.Compare, String.Equals или String.IndexOf всегда вызывайте перегрузку с параметром StringComparison, чтобы задать тип сравнения).</span> Дефолтный выбор — ordinal: «Use <b>StringComparison.Ordinal</b> or <b>StringComparison.OrdinalIgnoreCase</b> for comparisons as your <span class="hl">safe default</span> for culture-agnostic string matching». <span class="ru-tr">(используйте Ordinal или OrdinalIgnoreCase как безопасный дефолт для культуронезависимого матчинга).</span> Почему: ordinal «base string operation decisions on <b>simple byte comparisons</b> instead of casing or equivalence tables that are parameterized by culture». <span class="ru-tr">(основывают решения на простом сравнении байтов, а не на таблицах регистра/эквивалентности, зависящих от культуры).</span> Culture-sensitive оставь для сортировки текста, который <b>читает человек</b>.',
      sources: ["ms-sc", "ms-bps"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · три вердикта для i/I", title: "Одна пара строк, три политики — три ответа",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["var tr = new CultureInfo(\"tr-TR\");", "Console.WriteLine(string.Equals(\"i\", \"I\", StringComparison.OrdinalIgnoreCase));                 // True",
        "Console.WriteLine(string.Compare(\"i\", \"I\", tr, CompareOptions.IgnoreCase));                     // 1",
        "Console.WriteLine(string.Compare(\"i\", \"I\", CultureInfo.InvariantCulture, CompareOptions.IgnoreCase)); // 0"],
      predictAt: 1, predictQ: 'Пара <code>"i"</code>/<code>"I"</code>, без учёта регистра. Что даст: <code>Equals(OrdinalIgnoreCase)</code>, <code>Compare(tr-TR)</code>, <code>Compare(invariant)</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<b>OrdinalIgnoreCase</b>: ASCII <code>i</code>/<code>I</code> приравниваются → <code>Equals</code> = <span class="hl">True</span>.', nodes: [{ id: "o", kind: "gate", at: { zone: "pair", row: 0 }, state: "ok", label: "OrdinalIgnoreCase", detail: "Equals → True", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<b>tr-TR</b> IgnoreCase: турецкие <code>i</code>/<code>I</code> — <span class="hl">разные буквы</span> → <code>Compare</code> = <b>1</b> (не равны).', nodes: [{ id: "o", kind: "gate", at: { zone: "pair", row: 0 }, state: "ok", label: "OrdinalIgnoreCase", detail: "True" }, { id: "t", kind: "gate", at: { zone: "verd", row: 0 }, state: "fail", label: "tr-TR IgnoreCase", detail: "Compare → 1", accent: true }], edges: [] },
        { codeLine: 3, out: "True\n1\n0", caption: 'Панель: <span class="hl">True · 1 · 0</span> (реальный прогон) — три политики, три вердикта для <b>одной</b> пары. Вот почему нужна явность.', nodes: [{ id: "res", kind: "gate", at: { zone: "verd", row: 0 }, state: "ok", label: "True / 1 / 0", detail: "OrdIC=eq · tr=≠ · inv=eq", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — одна пара <code>"i"/"I"</code>, снятая через три разные политики. <code>OrdinalIgnoreCase</code> сравнивает по коду с ASCII-схлопыванием регистра → <code>Equals</code> = <code>True</code>. Турецкая культура (<code>tr-TR</code>) трактует <code>i</code>/<code>I</code> как <b>разные</b> буквы (точечная и бесточечная), поэтому даже <code>IgnoreCase</code> даёт <code>Compare</code> = <code>1</code> (не равны). Инвариантная культура возвращает <code>0</code> (равны). Реальный вывод сниппета — <code>True</code>, <code>1</code>, <code>0</code>: три ответа для одной пары. Это и есть «Turkish-I problem» <span class="ru-tr">«проблема турецкой I»</span> в цифрах, и прямое доказательство правила «always call an overload… StringComparison» <span class="ru-tr">«всегда вызывайте перегрузку… StringComparison»</span>. <span class="ru-tr">(всегда вызывайте перегрузку со StringComparison).</span> Практика сеньора: для нелингвистичного сравнения бери <code>Ordinal</code>/<code>OrdinalIgnoreCase</code> — детерминированно, быстро, независимо от локали сервера.',
      sources: ["ms-sc", "ms-bps"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>Console.WriteLine(string.Compare("abc", "ABC", StringComparison.Ordinal)); Console.WriteLine(string.Compare("abc", "ABC", StringComparison.OrdinalIgnoreCase)); Console.WriteLine(string.Equals("abc", "ABC", StringComparison.OrdinalIgnoreCase));</code> — все три? (\'a\'=97, \'A\'=65)',
      options: ["32\\n0\\nTrue", "1\\n0\\nTrue", "32\\n32\\nFalse", "0\\n0\\nTrue"], correctIndex: 0, xp: 10,
      okText: 'Ordinal сравнивает по коду: <code>\'a\'</code>−<code>\'A\'</code> = <b>32</b>. OrdinalIgnoreCase схлопывает ASCII-регистр → <code>Compare</code> = <b>0</b>, <code>Equals</code> = <b>True</b>.',
      noText: '«a comparison based on the numeric value (Unicode code point)» <span class="ru-tr">«сравнение на основе числового значения (Unicode code point)»</span>: разность кодов = 32. Без регистра abc == ABC. Реальный вывод: <b>32 / 0 / True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "32\n0\nTrue" }, sourceRefs: ["ms-sc"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var tr = new CultureInfo("tr-TR"); Console.WriteLine(string.Equals("i", "I", StringComparison.OrdinalIgnoreCase)); Console.WriteLine(string.Compare("i", "I", tr, CompareOptions.IgnoreCase)); Console.WriteLine(string.Compare("i", "I", CultureInfo.InvariantCulture, CompareOptions.IgnoreCase));</code> — все три?',
      options: ["True\\n1\\n0", "True\\n0\\n0", "False\\n1\\n0", "True\\n0\\n1"], correctIndex: 0, xp: 10,
      okText: 'Turkish-I: <code>OrdinalIgnoreCase</code> → <b>True</b> (ASCII i/I). Турецкая культура: i/I — разные буквы, <code>Compare</code> = <b>1</b>. Инвариантная: равны, <code>Compare</code> = <b>0</b>.',
      noText: '«assumptions… about capitalizing "i"… aren\'t valid among all cultures» <span class="ru-tr">«предположения… о переводе "i" в верхний регистр… неверны для всех культур»</span>. Три политики → три вердикта: <b>True / 1 / 0</b> (реальный прогон).',
      verify: { kind: "exec", run: "dotnet run", expect: "True\n1\n0" }, sourceRefs: ["ms-sc", "ms-bps"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var en = new CultureInfo("en-US"); Console.WriteLine(string.Compare("apple", "Apple", StringComparison.Ordinal)); Console.WriteLine(string.Compare("apple", "Apple", en, CompareOptions.None));</code> — обе строки?',
      options: ["32\\n-1", "32\\n32", "-1\\n32", "0\\n-1"], correctIndex: 0, xp: 10,
      okText: 'Ordinal: <code>\'a\'</code>(97) > <code>\'A\'</code>(65) → <b>32</b> (по коду прописная меньше). Но en-US <b>лингвистический</b> word-sort ставит строчную перед прописной → <b>-1</b>. Один и тот же вход — разный знак!',
      noText: 'Ordinal идёт по code point (строчная больше), а culture-sort — по лингвистическим весам (строчная раньше). Реальный вывод: <b>32</b>, затем <b>-1</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "32\n-1" }, sourceRefs: ["ms-sc", "ms-bps"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Два мира", v: 'Ordinal = «comparison based on the numeric value (Unicode code point)… <b>fast but culture-insensitive</b>» <span class="ru-tr">«сравнение на основе числового значения (Unicode code point)… <b>быстрое, но нечувствительно к культуре</b>»</span>. Culture word-sort = «culture-sensitive comparison» <span class="ru-tr">«культурозависимое сравнение»</span> с лингвистическими весами. Разные семантика и вердикты (замер: i/I → True/1/0).' },
    { icon: "cost", k: "Turkish-I", v: '«assumptions… about capitalizing "i"… <b>aren\'t valid among all cultures</b>» <span class="ru-tr">«предположения… о переводе "i" в верхний регистр… <b>неверны для всех культур</b>»</span>. <code>"i"</code>/<code>"I"</code> без регистра равны в invariant, но не в <code>tr-TR</code> (замер: 0 vs 1). Культурозависимое сравнение нелингвистичных строк = баги.' },
    { icon: "avoid", k: "Always StringComparison", v: '«you should <b>always</b> call an overload that includes a parameter of type StringComparison» <span class="ru-tr">«вы должны <b>всегда</b> вызывать перегрузку, которая включает параметр типа StringComparison»</span>. Дефолт для матчинга — <code>Ordinal</code>/<code>OrdinalIgnoreCase</code> (safe default + better performance). Culture — только для текста, что читает человек.' },
  ],

  foot: 'урок · <b>сравнение строк</b> · 5 анимир. разборов · ordinal vs culture · панель Turkish-I (True/1/0) · дизайн <b>mid</b>',
};
