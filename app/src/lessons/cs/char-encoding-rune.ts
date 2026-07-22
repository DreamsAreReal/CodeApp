/**
 * Lesson: char, Rune and UTF-16 (CS.S12.char-encoding-rune) — expert density, 5 animated
 * deep-dives. The senior fact: a C# `char` is a 16-bit UTF-16 CODE UNIT, not a "character".
 * A supplementary code point (most emoji) needs TWO chars (a surrogate pair), so string.Length
 * counts code units, not visible characters. System.Text.Rune is a Unicode SCALAR VALUE — the
 * right unit to iterate real code points; one emoji is 2 chars but exactly 1 Rune.
 *
 * SIGNATURE machine panel (s5): the ox emoji "🐂" (U+1F402) has string.Length 2 but yields a
 * single Rune, and its two chars are a high+low surrogate whose ConvertToUtf32 reassembles 128002.
 * REAL run-csharp measurement (this file's exec cards): c1 "2\n1" (emoji: 2 chars, 1 Rune) · c2
 * "4\n3" ("a🐂b": 4 chars, 3 Runes) · c3 "True\nTrue\n128002" (high+low surrogate → code point).
 *
 * Accuracy contract (G4/G7/G8) — verified against learn.microsoft.com/.../standard/base-types/
 * character-encoding-introduction (dotnet/docs, substring-checked 2026-07-22, live rendering
 * confirmed):
 *   - every English quote is VERBATIM from that page (emphasis markers are page italics, text exact);
 *   - the char/Rune counts are OWN DETERMINISTIC run-csharp measurements (this file's exec cards),
 *     also matching the page's own worked examples, never faked;
 *   - every card verify.expect is the REAL stdout of run-csharp: c1 "2\n1" · c2 "4\n3" · c3
 *     "True\nTrue\n128002".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S12.char-encoding-rune/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: char = 16-bit code unit; string.Length counts code units.
const Z_STR: Zone = { id: "strz", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "string · UTF-16", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "последовательность char", subCls: "vz-zsub heap", subY: 47 };
const Z_UNIT: Zone = { id: "unit", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "char = 16-bit code unit", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "не «символ»", subCls: "vz-zsub", subY: 47 };
const UNIT_ZONES: Zone[] = [Z_STR, Z_UNIT];

// s2: BMP vs supplementary — one char vs two chars.
const Z_BMP: Zone = { id: "bmp", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "BMP · U+0000..U+FFFF", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "1 char", subCls: "vz-zsub good", subY: 47 };
const Z_SUP: Zone = { id: "sup", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Supplementary · U+10000+", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "2 char (surrogate pair)", subCls: "vz-zsub heap", subY: 47 };
const PLANE_ZONES: Zone[] = [Z_BMP, Z_SUP];

// s3: surrogate pair mechanics — high + low → one code point.
const Z_PAIR: Zone = { id: "pair", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone heap", label: "SURROGATE PAIR · high (U+D800..U+DBFF) + low (U+DC00..U+DFFF)", labelCls: "vz-zlabel heap", lx: 170, ly: 24, sub: "→ один supplementary code point", subCls: "vz-zsub heap", subY: 47 };
const PAIR_ZONES: Zone[] = [Z_PAIR];

// s4: Rune = scalar value — the right unit to iterate.
const Z_CHAR: Zone = { id: "charz", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "char · code unit", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "половинка суррогата опасна", subCls: "vz-zsub", subY: 47 };
const Z_RUNE: Zone = { id: "rune", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Rune · scalar value", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "целый code point", subCls: "vz-zsub good", subY: 47 };
const RUNE_ZONES: Zone[] = [Z_CHAR, Z_RUNE];

// s5 (SIGNATURE): 🐂 — 2 chars, 1 Rune, ConvertToUtf32 → 128002.
const Z_LEN: Zone = { id: "len", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: '🐂 · string.Length', labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "2 char", subCls: "vz-zsub", subY: 47 };
const Z_RES: Zone = { id: "res", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "1 Rune · U+1F402", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "ConvertToUtf32 = 128002", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_LEN, Z_RES];

export const charEncodingRune: LessonData = {
  id: "CS.S12.char-encoding-rune",
  track: "CS",
  section: "CS.S12",
  module: "S12.5",
  lang: "csharp",
  title: "char, Rune и UTF-16: code unit против code point",
  kicker: "C# вглубь · S12 · UTF-16 внутри",
  home: { subtitle: "char = 16-bit code unit, суррогатные пары, Rune = scalar value, Length врёт", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-enc", kind: "doc", org: "Microsoft Learn", title: "Introduction to character encoding in .NET", url: "https://learn.microsoft.com/en-us/dotnet/standard/base-types/character-encoding-introduction", date: "2024-10-22" },
  ],

  spec: [
    { text: "«A string is logically a sequence of 16-bit values, each of which is an instance of the char struct. The string.Length property returns the number of char instances in the string instance.»", source: "ms-enc" },
  ],
  edgeCases: [
    { text: "<code>char</code> — это <b>code unit</b>, не символ: «.NET uses UTF-16 to encode the text in a string. A <span class=\"hl\">char instance represents a 16-bit code unit</span>». Для supplementary code point нужны <b>два</b> char: «for a code point in the supplementary range, <span class=\"hl\">two char instances are needed</span>».", source: "ms-enc" },
    { text: "Пара char, кодирующая один символ, — <b>surrogate pair</b>: «The char pairs that map to a single character are called <span class=\"hl\">surrogate pairs</span>». Собственный прогон: <code>\"🐂\".Length</code> = 2, но это <b>один</b> Rune.", source: "ms-enc" },
    { text: "<code>Rune</code> — это <b>scalar value</b>, целый code point: «In .NET, the <span class=\"hl\">System.Text.Rune type represents a Unicode scalar value</span>». Собственный прогон: <code>\"a🐂b\"</code> — 4 char, но <b>3</b> Rune (a, 🐂, b).", source: "ms-enc" },
    { text: "Grapheme cluster (то, что человек видит как символ) может быть <b>ещё крупнее</b>: собственный прогон совпадает с примером доки — <code>\"👩🏽‍🚒\"</code> это 7 char, 4 Rune, но <b>1</b> text element. Ни <code>Length</code>, ни число Rune не равны числу видимых символов.", source: "ms-enc" },
  ],

  misconceptions: [
    {
      wrong: "char — это «один символ», а string.Length — это число символов в строке (перебрал по char — перебрал по символам)",
      hook: 'Нет — <code>char</code> в C# это <b>16-битный UTF-16 code unit</b>, а не «символ», и <code>string.Length</code> считает именно code units. «.NET uses UTF-16 to encode the text in a <b>string</b>. A <span class="hl">char instance represents a 16-bit code unit</span>» — и «A <b>string</b> is logically a sequence of 16-bit values… The <b>string.Length</b> property returns the number of <b>char</b> instances». Проблема: символ из supplementary-диапазона (почти все эмодзи) не влезает в 16 бит — «for a code point in the supplementary range, <span class="hl">two char instances are needed</span>», и эта пара называется surrogate pair. Поэтому <code>"🐂".Length == 2</code>, хотя это один визуальный символ. Правильная единица для перебора реальных code point — <code>System.Text.Rune</code> («the <b>Rune</b> type represents a Unicode <b>scalar value</b>»): один эмодзи = 2 char, но ровно <b>1</b> Rune. А то, что человек видит как символ (grapheme cluster / text element), может быть ещё крупнее. Дальше <b>пять разборов</b>: char = code unit, BMP vs supplementary, механика surrogate pair, Rune как scalar value, и <b>машинная панель</b> — 🐂 это 2 char и 1 Rune, ConvertToUtf32 собирает 128002 (реальный прогон).',
      source: "ms-enc",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "char = code unit", title: "char — 16-битный UTF-16 code unit, не «символ»",
      viewBox: "0 0 340 210", zones: UNIT_ZONES,
      code: ["string s = \"Hello\";", "// s — последовательность char (16-битных значений)", "s.Length;   // число char, не число «символов»"],
      scenes: [
        { codeLine: 0, out: "", caption: '.NET кодирует текст в <b>UTF-16</b>: <code>string</code> — «a sequence of 16-bit values», каждое — <code>char</code>.', nodes: [{ id: "s", kind: "obj", at: { zone: "strz", row: 0 }, typeTag: "string (UTF-16)", value: '"Hello"', accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Каждый <code>char</code> — <span class="hl">16-bit code unit</span>. Для ASCII/BMP это удобно совпадает с символом — но это совпадение, не правило.', nodes: [{ id: "s", kind: "obj", at: { zone: "strz", row: 0 }, typeTag: "string", value: '"Hello"' }, { id: "u", kind: "gate", at: { zone: "unit", row: 0 }, state: "ok", label: "char", detail: "16-bit code unit", accent: true }], edges: [{ id: "e", from: "s", to: "u", accent: true }] },
        { codeLine: 2, out: "", caption: '<code>Length</code> возвращает число <b>char</b> (code units), а не число визуальных символов. Для «Hello» это 5 — но не всегда так.', nodes: [{ id: "l", kind: "gate", at: { zone: "unit", row: 0 }, state: "ok", label: "Length", detail: "число char", accent: true }], edges: [] },
      ],
      explain: 'Базовый факт, который сеньоры часто держат неточно: «.NET uses <b>UTF-16</b> to encode the text in a <b>string</b>. A <span class="hl">char instance represents a 16-bit code unit</span>». <span class="ru-tr">(.NET кодирует текст строки в UTF-16; экземпляр char представляет 16-битную единицу кода).</span> И «A <b>string</b> is logically a sequence of 16-bit values, each of which is an instance of the <b>char</b> struct. The <b>string.Length</b> property returns the number of <b>char</b> instances in the <b>string</b> instance». <span class="ru-tr">(строка логически — последовательность 16-битных значений, каждое из которых экземпляр структуры char; свойство Length возвращает число char в строке).</span> Ключевой сдвиг мышления: <code>char</code> — это единица <b>кодировки</b>, не единица <b>смысла</b>. Для латиницы и BMP они совпадают, что и создаёт иллюзию «char = символ» — которую следующие разборы разберут на суррогатных парах.',
      sources: ["ms-enc"],
    },
    {
      id: "s2", num: "02", kicker: "BMP vs supplementary", title: "Один char хватает не всегда — нужен второй",
      viewBox: "0 0 340 210", zones: PLANE_ZONES,
      code: ["// BMP: U+0000..U+FFFF — влезает в один char", "// Supplementary: U+10000..U+10FFFF — нужны ДВА char"],
      scenes: [
        { codeLine: 0, out: "", caption: '<b>BMP</b> (Basic Multilingual Plane, <code>U+0000..U+FFFF</code>) — 16-битный диапазон. Любой его code point = <span class="hl">один</span> char.', nodes: [{ id: "b", kind: "gate", at: { zone: "bmp", row: 0 }, state: "ok", label: "BMP", detail: "1 char", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<b>Supplementary</b> (<code>U+10000..U+10FFFF</code>) — 21-битный диапазон (эмодзи, редкие письменности). В 16 бит не влезает → нужны <span class="hl">два</span> char.', nodes: [{ id: "b", kind: "gate", at: { zone: "bmp", row: 0 }, state: "ok", label: "BMP", detail: "1 char" }, { id: "s", kind: "gate", at: { zone: "sup", row: 0 }, state: "ok", label: "Supplementary", detail: "2 char", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Отсюда расхождение <code>Length</code> и числа символов: 🐂 (U+1F402) — supplementary, значит <code>Length</code> = <b>2</b> при одном визуальном символе.', nodes: [{ id: "s", kind: "gate", at: { zone: "sup", row: 0 }, state: "ok", label: "🐂 (U+1F402)", detail: "Length = 2", accent: true }], edges: [] },
      ],
      explain: 'Почему одного <code>char</code> иногда мало: код-пойнты делятся на два подряда. «The <b>Basic Multilingual Plane (BMP)</b> in the range <code>U+0000..U+FFFF</code>. This 16-bit range provides 65,536 code points». <span class="ru-tr">(базовая многоязычная плоскость в диапазоне U+0000..U+FFFF; этот 16-битный диапазон даёт 65 536 код-пойнтов).</span> И «<b>Supplementary code points</b> in the range <code>U+10000..U+10FFFF</code>». <span class="ru-tr">(дополнительные код-пойнты в диапазоне U+10000..U+10FFFF).</span> Прямое следствие для UTF-16: «A single 16-bit code unit can represent any code point in the 16-bit range of the Basic Multilingual Plane. But for a code point in the supplementary range, <span class="hl">two char instances are needed</span>». <span class="ru-tr">(одна 16-битная единица кода покрывает любой код-пойнт BMP; но для код-пойнта из дополнительного диапазона нужны два экземпляра char).</span> Вот почему <code>string.Length</code> эмодзи почти всегда 2 — это не баг, это UTF-16.',
      sources: ["ms-enc"],
    },
    {
      id: "s3", num: "03", kicker: "Механика surrogate pair", title: "High + low суррогат → один code point",
      viewBox: "0 0 340 210", zones: PAIR_ZONES,
      code: ["\"🐂\"[0] → high surrogate (U+D800..U+DBFF)", "\"🐂\"[1] → low surrogate  (U+DC00..U+DFFF)", "char.ConvertToUtf32(high, low) → U+1F402 (128002)"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Первый char эмодзи — <b>high surrogate</b> из диапазона <code>U+D800..U+DBFF</code>. Сам по себе бессмыслен.', nodes: [{ id: "h", kind: "obj", at: { zone: "pair", row: 0, col: 0 }, typeTag: "s[0]", value: "high (U+D83D)", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Второй char — <b>low surrogate</b> из <code>U+DC00..U+DFFF</code>. Только <span class="hl">пара</span> имеет смысл.', nodes: [{ id: "h", kind: "obj", at: { zone: "pair", row: 0, col: 0 }, typeTag: "s[0]", value: "high (U+D83D)" }, { id: "l", kind: "obj", at: { zone: "pair", row: 0, col: 1 }, typeTag: "s[1]", value: "low (U+DC02)", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Пара по формуле собирается в <span class="hl">один</span> supplementary code point: <code>ConvertToUtf32</code> даёт <b>U+1F402</b> = 128002 (реальный прогон дальше).', nodes: [{ id: "cp", kind: "gate", at: { zone: "pair", row: 0 }, state: "ok", label: "high + low", detail: "→ U+1F402 (128002)", accent: true }], edges: [] },
      ],
      explain: 'Как две 16-битные половинки становятся одним 21-битным code point: «When a <b>high surrogate</b> code point (<code>U+D800..U+DBFF</code>) is immediately followed by a <b>low surrogate</b> code point (<code>U+DC00..U+DFFF</code>), the pair is interpreted as a <span class="hl">supplementary code point</span>». <span class="ru-tr">(когда за старшим суррогатным код-пойнтом (U+D800..U+DBFF) сразу следует младший (U+DC00..U+DFFF), пара интерпретируется как дополнительный код-пойнт).</span> Диапазон <code>U+D800..U+DFFF</code> зарезервирован именно под это — там нет «настоящих» символов. Практический вывод: <b>нельзя</b> резать строку по индексу char вслепую — разрежешь суррогатную пару и получишь ill-formed UTF-16 (в доке это отдельный анти-пример data corruption). Собственный прогон подтвердит: <code>char.IsHighSurrogate(s[0])</code> и <code>char.IsLowSurrogate(s[1])</code> — оба <code>True</code>, а <code>ConvertToUtf32</code> собирает 128002.',
      sources: ["ms-enc"],
    },
    {
      id: "s4", num: "04", kicker: "Rune = scalar value", title: "Rune — правильная единица перебора code point",
      viewBox: "0 0 340 210", zones: RUNE_ZONES,
      code: ["foreach (char c in \"a🐂b\")  { ... }   // 4 итерации (суррогаты порознь — опасно)", "foreach (Rune r in \"a🐂b\".EnumerateRunes()) { ... }  // 3 итерации (a, 🐂, b)"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Перебор по <code>char</code> для <code>"a🐂b"</code> — <b>4</b> шага: <code>a</code>, high, low, <code>b</code>. Половинки суррогата идут <span class="hl">порознь</span> — тут и рождаются баги.', nodes: [{ id: "c", kind: "gate", at: { zone: "charz", row: 0 }, state: "fail", label: "по char", detail: "4 (суррогаты порознь)", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Перебор по <code>Rune</code> — <b>3</b> шага: <code>a</code>, <b>целый</b> 🐂, <code>b</code>. Rune это «Unicode <span class="hl">scalar value</span>» — валидный целый code point.', nodes: [{ id: "c", kind: "gate", at: { zone: "charz", row: 0 }, state: "fail", label: "по char", detail: "4" }, { id: "r", kind: "gate", at: { zone: "rune", row: 0 }, state: "ok", label: "по Rune", detail: "3 (a, 🐂, b)", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Rune-конструктор <b>валидирует</b> scalar value: «validate that the resulting instance is a <span class="hl">valid Unicode scalar value</span>, otherwise they throw». Половинку суррогата в Rune не засунуть.', nodes: [{ id: "v", kind: "gate", at: { zone: "rune", row: 0 }, state: "ok", label: "new Rune(...)", detail: "валидирует scalar value", accent: true }], edges: [] },
      ],
      explain: 'Правильная единица для работы с реальными символами — <code>Rune</code>: «In .NET, the <span class="hl">System.Text.Rune type represents a Unicode scalar value</span>». <span class="ru-tr">(в .NET тип System.Text.Rune представляет скалярное значение Unicode).</span> А scalar value — это «any code point that is assigned a character or can be assigned a character in the future» <span class="ru-tr">(любой код-пойнт, которому назначен символ или может быть назначен в будущем)</span> — то есть всё, кроме суррогатных код-пойнтов. Конструктор жёстко это проверяет: «The <b>Rune</b> constructors <span class="hl">validate that the resulting instance is a valid Unicode scalar value</span>, otherwise they throw an exception». <span class="ru-tr">(конструкторы Rune проверяют, что результат — валидное скалярное значение Unicode, иначе бросают исключение).</span> Поэтому <code>"a🐂b".EnumerateRunes()</code> даёт <b>3</b> элемента (a, 🐂, b), а перебор по <code>char</code> — 4 (с расщеплённой парой). Для смены регистра, подсчёта «настоящих» code point, безопасной обработки — итерируй Rune, не char.',
      sources: ["ms-enc"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · 🐂 = 2 char, 1 Rune", title: "Один эмодзи: Length 2, Rune 1, code point 128002",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["string s = \"🐂\";   // U+1F402", "Console.WriteLine(char.IsHighSurrogate(s[0]));   // True", "Console.WriteLine(char.IsLowSurrogate(s[1]));    // True", "Console.WriteLine(char.ConvertToUtf32(s[0], s[1]));  // 128002"],
      predictAt: 1, predictQ: '<code>"🐂"</code> (U+1F402) — supplementary. Что дадут <code>char.IsHighSurrogate(s[0])</code>, <code>char.IsLowSurrogate(s[1])</code>, <code>char.ConvertToUtf32(s[0], s[1])</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '🐂 — U+1F402, supplementary. В строке это <b>2</b> char (<code>Length</code>=2), но <b>1</b> Rune.', nodes: [{ id: "len", kind: "gate", at: { zone: "len", row: 0 }, state: "ok", label: "string.Length", detail: "2 char", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>s[0]</code> — high surrogate (<code>True</code>), <code>s[1]</code> — low surrogate (<code>True</code>). Классическая пара.', nodes: [{ id: "len", kind: "gate", at: { zone: "len", row: 0 }, state: "ok", label: "Length", detail: "2 char" }, { id: "sur", kind: "gate", at: { zone: "res", row: 0 }, state: "ok", label: "high + low", detail: "True / True", accent: true }], edges: [] },
        { codeLine: 3, out: "True\nTrue\n128002", caption: 'Панель: <span class="hl">True · True · 128002</span> (реальный прогон) — пара суррогатов собирается в <b>U+1F402</b> = 128002 (это один Rune).', nodes: [{ id: "cp", kind: "gate", at: { zone: "res", row: 0 }, state: "ok", label: "ConvertToUtf32", detail: "128002 (U+1F402)", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — снятая на эмодзи 🐂 (U+1F402). Поскольку это supplementary code point, «two char instances are needed»: <code>string.Length</code> = 2, но <code>EnumerateRunes()</code> даёт ровно один Rune. Два char — это классическая surrogate pair: <code>char.IsHighSurrogate(s[0])</code> и <code>char.IsLowSurrogate(s[1])</code> оба <code>True</code>, а <code>char.ConvertToUtf32(s[0], s[1])</code> по формуле собирает <b>128002</b> (= 0x1F402). Реальный вывод сниппета: <code>True</code>, <code>True</code>, <code>128002</code>. Финальный вывод для сеньора: <code>string.Length</code> — это счётчик UTF-16 code units, не символов; для code point итерируй <code>Rune</code>, а для «того, что видит человек» (grapheme cluster) — <code>StringInfo</code> (в доке 🧑‍🚒 это 7 char, 4 Rune, 1 text element). Три разные единицы — три разных счёта.',
      sources: ["ms-enc"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>string s = "\\U0001F402"; // 🐂</code><br/><code>Console.WriteLine(s.Length); Console.WriteLine(s.EnumerateRunes().Count());</code> — обе строки?',
      options: ["2\\n1", "1\\n1", "2\\n2", "1\\n2"], correctIndex: 0, xp: 10,
      okText: '🐂 — supplementary code point, «two char instances are needed» → <code>Length</code> = <b>2</b>. Но это один scalar value → <b>1</b> Rune.',
      noText: '<code>Length</code> считает UTF-16 code units (2 для эмодзи), <code>EnumerateRunes()</code> считает scalar values (1). Реальный вывод: <b>2</b>, затем <b>1</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "2\n1" }, sourceRefs: ["ms-enc"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>string s = "a\\U0001F402b"; // "a🐂b"</code><br/><code>Console.WriteLine(s.Length); Console.WriteLine(s.EnumerateRunes().Count());</code> — обе строки?',
      options: ["4\\n3", "3\\n3", "4\\n4", "3\\n4"], correctIndex: 0, xp: 10,
      okText: '<code>a</code>(1) + 🐂(<b>2</b> char) + <code>b</code>(1) = <b>4</b> char. Но Runes: a, 🐂, b = <b>3</b> scalar values. Length ≠ число символов.',
      noText: 'Эмодзи занимает 2 char, буквы по 1: Length = 4. Rune-перебор схлопывает суррогатную пару в один code point: 3. Реальный вывод: <b>4</b>, <b>3</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "4\n3" }, sourceRefs: ["ms-enc"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>string s = "\\U0001F402"; // 🐂</code><br/><code>Console.WriteLine(char.IsHighSurrogate(s[0])); Console.WriteLine(char.IsLowSurrogate(s[1])); Console.WriteLine(char.ConvertToUtf32(s[0], s[1]));</code> — все три?',
      options: ["True\\nTrue\\n128002", "False\\nFalse\\n128002", "True\\nTrue\\n127474", "True\\nFalse\\n128002"], correctIndex: 0, xp: 10,
      okText: '🐂 = surrogate pair: <code>s[0]</code> high (<b>True</b>), <code>s[1]</code> low (<b>True</b>). <code>ConvertToUtf32</code> собирает пару в U+1F402 = <span class="hl">128002</span>.',
      noText: '«high surrogate… immediately followed by a low surrogate… interpreted as a supplementary code point». Пара → 0x1F402 = 128002. Реальный вывод: <b>True / True / 128002</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True\nTrue\n128002" }, sourceRefs: ["ms-enc"],
    },
  ],

  takeaways: [
    { icon: "why", k: "char = code unit", v: '«A <b>char instance represents a 16-bit code unit</b>»; <code>string.Length</code> — число char, не символов. Для латиницы/BMP совпадает, что и создаёт иллюзию «char = символ».' },
    { icon: "cost", k: "Surrogate pair", v: 'Supplementary code point (эмодзи) → «<b>two char instances are needed</b>» (surrogate pair). <code>"🐂".Length</code> = 2 (замер). Резать строку по индексу char вслепую = ill-formed UTF-16.' },
    { icon: "avoid", k: "Rune = scalar value", v: '«the <b>Rune type represents a Unicode scalar value</b>» — правильная единица перебора code point. <code>"a🐂b"</code>: 4 char, но 3 Rune (замер). Для видимых символов — <code>StringInfo</code> (grapheme cluster).' },
  ],

  foot: 'урок · <b>char, Rune, UTF-16</b> · 5 анимир. разборов · code unit vs code point · панель 🐂 = 2 char / 1 Rune · дизайн <b>mid</b>',
};
