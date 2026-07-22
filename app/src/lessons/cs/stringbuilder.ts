/**
 * Lesson: StringBuilder (CS.S12.stringbuilder) — expert density, 5 animated deep-dives.
 * StringBuilder is a mutable sequence of characters that appends/replaces/inserts IN a single
 * object instead of allocating a new String each time. The senior nuances: capacity doubles when
 * you overflow it (default 16 → 32), the fluent Append returns the SAME instance (in-place, not a
 * copy), and it is NOT a blanket replacement for String — for a few edits, String wins.
 *
 * SIGNATURE machine panel (s5): a default StringBuilder starts at Capacity 16; appending a 19-char
 * string overflows it, so capacity doubles to 32 while Length becomes 19. REAL run-csharp measurement
 * (this file's exec cards): c1 "16\n19 32" (default cap, doubling) · c2 "True\nabc" (Append returns
 * the same instance, one object mutated) · c3 ">> heLLo worLd\n14" (in-place Append/Replace/Insert).
 *
 * Accuracy contract (G4/G7/G8) — verified against learn.microsoft.com/.../api/system.text.stringbuilder
 * (dotnet-api-docs StringBuilder.xml, substring-checked 2026-07-22):
 *   - every English quote is VERBATIM from the StringBuilder Remarks (mutability, capacity, when-to-use);
 *   - the capacity numbers (16 → 32) are BOTH stated verbatim in the docs AND an OWN DETERMINISTIC
 *     run-csharp measurement (this file's exec cards), never faked;
 *   - every card verify.expect is the REAL stdout of run-csharp: c1 "16\n19 32" · c2 "True\nabc" ·
 *     c3 ">> heLLo worLd\n14".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S12.stringbuilder/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: mutable vs immutable — StringBuilder edits one object.
const Z_IMM: Zone = { id: "imm", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "String · immutable", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "новый объект на шаг", subCls: "vz-zsub", subY: 47 };
const Z_MUT: Zone = { id: "mut", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "StringBuilder · mutable", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "один объект", subCls: "vz-zsub good", subY: 47 };
const MUT_ZONES: Zone[] = [Z_IMM, Z_MUT];

// s2: append in place — same instance grows.
const Z_BUF: Zone = { id: "buf", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "ЕДИНЫЙ БУФЕР · Append пишет В НЕГО", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "operations are performed on a single string", subCls: "vz-zsub good", subY: 47 };
const BUF_ZONES: Zone[] = [Z_BUF];

// s3: capacity + doubling.
const Z_LEN: Zone = { id: "len", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Length · сколько символов", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "растёт при Append", subCls: "vz-zsub", subY: 47 };
const Z_CAP: Zone = { id: "cap", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Capacity · размер буфера", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "удваивается при переполнении", subCls: "vz-zsub heap", subY: 47 };
const CAP_ZONES: Zone[] = [Z_LEN, Z_CAP];

// s4: when NOT to use StringBuilder.
const Z_STRCASE: Zone = { id: "strcase", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "БЕРИ String", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "мало правок / литералы", subCls: "vz-zsub", subY: 47 };
const Z_SBCASE: Zone = { id: "sbcase", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "БЕРИ StringBuilder", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "много / неизвестно правок", subCls: "vz-zsub good", subY: 47 };
const CASE_ZONES: Zone[] = [Z_STRCASE, Z_SBCASE];

// s5 (SIGNATURE): default capacity 16 -> doubles to 32 on a 19-char append.
const Z_START: Zone = { id: "start", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "СТАРТ · Capacity 16", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "default ctor", subCls: "vz-zsub", subY: 47 };
const Z_GROWN: Zone = { id: "grown", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ПОСЛЕ Append(19)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "Length 19 · Capacity 32", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_START, Z_GROWN];

export const stringbuilder: LessonData = {
  id: "CS.S12.stringbuilder",
  track: "CS",
  section: "CS.S12",
  module: "S12.3",
  lang: "csharp",
  title: "StringBuilder: мутабельная сборка строки в один буфер",
  kicker: "C# вглубь · S12 · mutable buffer",
  home: { subtitle: "mutable sequence, Append в один объект, Capacity удваивается, когда брать", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-sb", kind: "doc", org: "Microsoft Learn", title: "StringBuilder Class (System.Text)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.text.stringbuilder", date: "2025-07-01" },
    { id: "ms-string", kind: "doc", org: "Microsoft Learn", title: "String Class (System)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.string", date: "2025-07-01" },
  ],

  spec: [
    { text: "«The StringBuilder class represents a string-like object whose value is a mutable sequence of characters.» <span class=\"ru-tr\">«Класс StringBuilder представляет строкоподобный объект, значение которого — изменяемая последовательность символов.»</span>", source: "ms-sb" },
  ],
  edgeCases: [
    { text: "Мутабельность = правки <b>в одном объекте</b>: «Mutability means that once an instance of the class has been created, it can be modified by <span class=\"hl\">appending, removing, replacing, or inserting characters</span>». <span class=\"ru-tr\">«Изменяемость означает, что после создания экземпляра класса его можно менять добавлением, удалением, заменой или вставкой символов».</span> <code>Append</code> возвращает <b>тот же</b> экземпляр (собственный прогон: <code>ReferenceEquals</code> = <code>True</code>).", source: "ms-sb" },
    { text: "Ёмкость <b>удваивается</b> при переполнении: «the value of the <code>Capacity</code> property is <span class=\"hl\">doubled</span>, new characters are added… and its <code>Length</code> property is adjusted». <span class=\"ru-tr\">«Значение свойства <code>Capacity</code> удваивается, добавляются новые символы… и свойство <code>Length</code> корректируется».</span> Default ctor: «The default capacity of this object is <b>16</b> characters» <span class=\"ru-tr\">«Ёмкость этого объекта по умолчанию — <b>16</b> символов».</span> → после Append 19 символов Capacity = <code>32</code> (собственный прогон).", source: "ms-sb" },
    { text: "StringBuilder — <b>не</b> замена String по умолчанию: «you should not automatically replace <code>String</code> with <code>StringBuilder</code> whenever you want to manipulate strings». <span class=\"ru-tr\">«Не следует автоматически заменять <code>String</code> на <code>StringBuilder</code> всякий раз, когда нужно работать со строками».</span> Для «a fixed number of concatenation operations, particularly with string literals» <span class=\"ru-tr\">«фиксированного числа операций конкатенации, особенно со строковыми литералами»</span> компилятор сам объединит их — бери <code>String</code>.", source: "ms-sb" },
    { text: "Достигнув <code>MaxCapacity</code>, рост <b>останавливается</b>: «trying to add characters or expand it beyond its maximum capacity throws either an <code>ArgumentOutOfRangeException</code> or an <code>OutOfMemoryException</code> exception». <span class=\"ru-tr\">«Попытка добавить символы или расширить его сверх максимальной ёмкости выбрасывает исключение <code>ArgumentOutOfRangeException</code> либо <code>OutOfMemoryException</code>».</span>", source: "ms-sb" },
  ],

  misconceptions: [
    {
      wrong: "StringBuilder — это «быстрая строка»: всегда меняй String на StringBuilder, и любая конкатенация станет быстрее",
      hook: 'Нет — StringBuilder выигрывает не «всегда», а на <b>повторяющихся</b> изменениях, и его нельзя ставить рефлекторно. Суть в мутабельности: «The <b>StringBuilder</b> class represents a string-like object whose value is a <span class="hl">mutable sequence of characters</span>» <span class="ru-tr">(класс <b>StringBuilder</b> представляет строкоподобный объект, значение которого — изменяемая последовательность символов)</span> — «Mutability means that once an instance… has been created, it can be modified by appending, removing, replacing, or inserting characters» <span class="ru-tr">(изменяемость означает, что после создания экземпляра его можно менять добавлением, удалением, заменой или вставкой символов)</span> <b>в одном</b> объекте, без аллокации нового <code>String</code> на каждый шаг. Но: «you should <b>not automatically replace</b> <code>String</code> with <code>StringBuilder</code> whenever you want to manipulate strings». <span class="ru-tr">(не заменяйте String на StringBuilder автоматически при любой работе со строками).</span> Для малого числа правок или «a fixed number of concatenation operations, particularly with string literals» <span class="ru-tr">(фиксированного числа операций конкатенации, особенно со строковыми литералами)</span> компилятор сам всё склеит — <code>StringBuilder</code> даст «negligible or no performance improvement». <span class="ru-tr">(ничтожный прирост или его отсутствие).</span> Дальше <b>пять разборов</b>: mutable vs immutable, Append в единый буфер, Length/Capacity и удвоение, когда брать String vs StringBuilder, и <b>машинная панель</b> — default Capacity 16 удваивается до 32 при Append 19 символов (реальный прогон).',
      source: "ms-sb",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Mutable vs immutable", title: "StringBuilder правит один объект, String плодит новые",
      viewBox: "0 0 340 210", zones: MUT_ZONES,
      code: ["string s = \"a\"; s += \"b\"; s += \"c\";        // 3 новых String", "var sb = new StringBuilder(); sb.Append('a').Append('b').Append('c');  // один объект"],
      scenes: [
        { codeLine: 0, out: "", caption: 'У <code>String</code> «each operation that appears to modify… <span class="hl">actually creates a new string</span>». <span class="ru-tr">(каждая операция, которая как будто изменяет… на деле создаёт новую строку).</span> Три <code>+=</code> — три новых объекта.', nodes: [{ id: "s1", kind: "obj", at: { zone: "imm", row: 0 }, typeTag: "String", value: '"a"' }, { id: "s2", kind: "obj", at: { zone: "imm", row: 1 }, typeTag: "String", value: '"abc"', accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>StringBuilder</code> — <b>mutable</b>: те же три Append правят <span class="hl">один</span> объект, без новых аллокаций.', nodes: [{ id: "sb", kind: "obj", at: { zone: "mut", row: 0 }, typeTag: "StringBuilder", value: '"abc"', accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Разница фундаментальна: String — «immutable type», <span class="ru-tr">(иммутабельный тип),</span> StringBuilder — «a <b>mutable</b> string class». <span class="ru-tr">(изменяемый строковый класс).</span>', nodes: [{ id: "im", kind: "gate", at: { zone: "imm", row: 0 }, state: "fail", label: "immutable", detail: "новый объект на шаг" }, { id: "mu", kind: "gate", at: { zone: "mut", row: 0 }, state: "ok", label: "mutable", detail: "один объект", accent: true }], edges: [] },
      ],
      explain: 'Отправная точка: «The <b>StringBuilder</b> class represents a string-like object whose value is a <span class="hl">mutable sequence of characters</span>». <span class="ru-tr">(класс StringBuilder представляет строкоподобный объект, значение которого — изменяемая последовательность символов).</span> Контраст со строкой прямой: «<code>String</code> is an immutable type. That is, each operation that appears to modify a <code>String</code> object <b>actually creates a new string</b>». <span class="ru-tr">(String — иммутабельный тип; каждая операция, которая как будто изменяет объект String, на деле создаёт новую строку).</span> А StringBuilder «is a <b>mutable</b> string class. Mutability means that once an instance of the class has been created, it can be modified by <b>appending, removing, replacing, or inserting characters</b>». <span class="ru-tr">(изменяемый строковый класс; изменяемость означает, что созданный экземпляр можно менять добавлением, удалением, заменой или вставкой символов).</span> Отсюда весь выигрыш: N правок — один объект вместо N.',
      sources: ["ms-sb"],
    },
    {
      id: "s2", num: "02", kicker: "Append в единый буфер", title: "Все операции идут в один объект",
      viewBox: "0 0 340 210", zones: BUF_ZONES,
      code: ["var sb = new StringBuilder();", "var same = sb.Append(\"ab\").Append(\"c\");   // возвращает ТОТ ЖЕ sb", "Console.WriteLine(object.ReferenceEquals(sb, same));  // True"],
      predictAt: 1, predictQ: '<code>sb.Append("ab").Append("c")</code> присвоено в <code>same</code>. Что напечатает <code>object.ReferenceEquals(sb, same)</code>, затем <code>sb.ToString()</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Пустой <code>StringBuilder</code> — один буфер, в который будем писать.', nodes: [{ id: "sb", kind: "obj", at: { zone: "buf", row: 0 }, typeTag: "StringBuilder", value: '""', accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Append("ab")</code>, затем <code>Append("c")</code> пишут <span class="hl">в тот же</span> объект и <b>возвращают его же</b> (fluent). Новый String не рождается.', nodes: [{ id: "sb", kind: "obj", at: { zone: "buf", row: 0 }, typeTag: "StringBuilder (sb == same)", value: '"abc"', accent: true }], edges: [] },
        { codeLine: 2, out: "True\nabc", caption: 'Панель: <span class="hl">True / abc</span> (реальный прогон) — <code>same</code> и <code>sb</code> это <b>один</b> объект (Append вернул <code>this</code>), значение <code>"abc"</code>.', nodes: [{ id: "g", kind: "gate", at: { zone: "buf", row: 0 }, state: "ok", label: "ReferenceEquals(sb, same)", detail: "True · один объект · \"abc\"", accent: true }], edges: [] },
      ],
      explain: 'Ключевая механика: «when you concatenate, append, or delete substrings from a string, the <span class="hl">operations are performed on a single string</span>». <span class="ru-tr">(при конкатенации, добавлении или удалении подстрок операции выполняются над одной строкой).</span> Метод <code>Append</code> возвращает <b>тот же</b> экземпляр (<code>this</code>), что и даёт fluent-цепочку <code>sb.Append(x).Append(y)</code>: собственный прогон печатает <code>True</code> — <code>same</code> и <code>sb</code> это один объект. Закончив, «you can call its <code>StringBuilder.ToString</code> method to convert it to a string». <span class="ru-tr">(можно вызвать метод ToString, чтобы преобразовать его в строку).</span> Единственная финальная аллокация <code>String</code> — в <code>ToString()</code>, а не на каждом шаге.',
      sources: ["ms-sb", "ms-string"],
    },
    {
      id: "s3", num: "03", kicker: "Length · Capacity · удвоение", title: "Буфер удваивается при переполнении",
      viewBox: "0 0 340 210", zones: CAP_ZONES,
      code: ["var sb = new StringBuilder();     // Capacity 16, Length 0", "sb.Append(\"This is a sentence.\");  // 19 символов > 16", "// Capacity удвоился до 32, Length = 19"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Length</code> — сколько символов сейчас. <code>Capacity</code> — сколько <b>помещается</b> без реаллокации. Default: Capacity <span class="hl">16</span>, Length 0.', nodes: [{ id: "l", kind: "gate", at: { zone: "len", row: 0 }, state: "ok", label: "Length", detail: "0" }, { id: "c", kind: "gate", at: { zone: "cap", row: 0 }, state: "ok", label: "Capacity", detail: "16", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Append 19 символов — <b>больше</b> 16. Length хочет стать 19, но буфер мал → нужна новая память.', nodes: [{ id: "l", kind: "gate", at: { zone: "len", row: 0 }, state: "ok", label: "Length хочет", detail: "19 > 16", accent: true }, { id: "c", kind: "gate", at: { zone: "cap", row: 0 }, state: "ok", label: "Capacity", detail: "16 (мало)" }], edges: [] },
        { codeLine: 2, out: "", caption: 'При переполнении «the value of the <code>Capacity</code> property is <span class="hl">doubled</span>» <span class="ru-tr">(значение свойства <code>Capacity</code> удваивается):</span> 16 → <b>32</b>, Length = 19. Рост амортизирован.', nodes: [{ id: "l", kind: "gate", at: { zone: "len", row: 0 }, state: "ok", label: "Length", detail: "19" }, { id: "c", kind: "gate", at: { zone: "cap", row: 0 }, state: "ok", label: "Capacity", detail: "32 (16×2)", accent: true }], edges: [] },
      ],
      explain: 'Как растёт буфер: «If the number of added characters causes the length of the <code>StringBuilder</code> object to exceed its current capacity, new memory is allocated, the value of the <code>Capacity</code> property is <span class="hl">doubled</span>, new characters are added… and its <code>Length</code> property is adjusted». <span class="ru-tr">(если добавленные символы превышают текущую ёмкость, выделяется новая память, значение Capacity удваивается, символы добавляются, а Length корректируется).</span> Числа из документации и прогона совпадают: «The default capacity of this object is <b>16</b> characters» <span class="ru-tr">(ёмкость этого объекта по умолчанию — <b>16</b> символов)</span> — Append строки в 19 символов «results in a new memory allocation… The capacity of the object <b>doubles to 32</b> characters». <span class="ru-tr">(приводит к новой аллокации памяти… ёмкость объекта удваивается до <b>32</b> символов).</span> Как и у <code>List&lt;T&gt;</code> (S17), это геометрический рост: суммарная стоимость реаллокаций амортизируется в <code>O(n)</code>. Если финальный размер известен — задай <code>new StringBuilder(capacity)</code> и избеги промежуточных удвоений.',
      sources: ["ms-sb"],
    },
    {
      id: "s4", num: "04", kicker: "Когда String, когда StringBuilder", title: "Не заменяй String рефлекторно",
      viewBox: "0 0 340 210", zones: CASE_ZONES,
      code: ["// мало правок / фиксированная конкатенация литералов → String", "// неизвестно/много правок в цикле → StringBuilder"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Бери <b>String</b>, когда правок мало, или это «a fixed number of concatenation operations, particularly with <span class="hl">string literals</span>» <span class="ru-tr">(фиксированное число операций конкатенации, особенно со строковыми литералами)</span> — компилятор сам склеит.', nodes: [{ id: "s", kind: "gate", at: { zone: "strcase", row: 0 }, state: "ok", label: "String", detail: "мало правок / литералы", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Бери <b>StringBuilder</b>, когда «an <span class="hl">unknown number</span> of changes» <span class="ru-tr">(неизвестное число изменений)</span> или «a significant number of changes» <span class="ru-tr">(значительное число изменений)</span> — напр. цикл над вводом.', nodes: [{ id: "s", kind: "gate", at: { zone: "strcase", row: 0 }, state: "ok", label: "String", detail: "мало правок / литералы" }, { id: "sb", kind: "gate", at: { zone: "sbcase", row: 0 }, state: "ok", label: "StringBuilder", detail: "много / неизвестно правок", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Правило: «you should <b>not automatically replace</b> String with StringBuilder». <span class="ru-tr">(не следует автоматически заменять String на StringBuilder).</span> Мерь: для малого числа правок прирост «negligible or no». <span class="ru-tr">(ничтожный или отсутствует).</span>', nodes: [{ id: "warn", kind: "gate", at: { zone: "sbcase", row: 0 }, state: "fail", label: "не подменяй рефлекторно", detail: "test your code", accent: true }], edges: [] },
      ],
      explain: 'StringBuilder — инструмент под конкретный профиль, а не «быстрая строка на всё». Документация прямо предупреждает: «you should <b>not automatically replace</b> <code>String</code> with <code>StringBuilder</code> whenever you want to manipulate strings… You should be prepared to <b>test your code</b>». <span class="ru-tr">(не заменяйте String на StringBuilder автоматически; будьте готовы протестировать код).</span> Бери <code>String</code>: «When the number of changes… is small» <span class="ru-tr">(когда число изменений… невелико)</span> и «When you perform a fixed number of concatenation operations, particularly with string literals. In this case, the <b>compiler might combine</b> the concatenation operations into a single operation». <span class="ru-tr">(компилятор может объединить конкатенации в одну операцию).</span> Бери <code>StringBuilder</code>: «When you expect your code to make an <b>unknown number of changes</b>… (for example, when you use a loop…)» <span class="ru-tr">(когда ожидаешь, что код внесёт неизвестное число изменений… например, при использовании цикла…)</span> и «a <b>significant number</b> of changes». <span class="ru-tr">(значительное число изменений).</span> Ещё нюанс: у StringBuilder нет <code>IndexOf</code>/<code>StartsWith</code> — под поиск конвертируй в <code>String</code>.',
      sources: ["ms-sb"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · Capacity 16 → 32", title: "Default 16 удваивается при Append 19 символов",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["var sb = new StringBuilder();", "Console.WriteLine(sb.Capacity);          // 16", "sb.Append(\"This is a sentence.\");        // 19 символов", "Console.WriteLine($\"{sb.Length} {sb.Capacity}\");   // 19 32"],
      predictAt: 2, predictQ: 'Default <code>StringBuilder</code> имеет Capacity 16. После <code>Append</code> строки в 19 символов — что напечатают <code>sb.Length</code> и <code>sb.Capacity</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Default ctor: «The default capacity of this object is <b>16</b> characters». <span class="ru-tr">(ёмкость этого объекта по умолчанию — <b>16</b> символов).</span> Length 0.', nodes: [{ id: "c", kind: "gate", at: { zone: "start", row: 0 }, state: "ok", label: "Capacity", detail: "16", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Append строки в <b>19</b> символов «exceeds the default capacity» <span class="ru-tr">(превышает ёмкость по умолчанию)</span> → нужна новая память.', nodes: [{ id: "c", kind: "gate", at: { zone: "start", row: 0 }, state: "ok", label: "Capacity", detail: "16" }, { id: "over", kind: "gate", at: { zone: "grown", row: 0 }, state: "ok", label: "19 > 16", detail: "переполнение", accent: true }], edges: [] },
        { codeLine: 3, out: "16\n19 32", caption: 'Панель: <span class="hl">16 · 19 32</span> (реальный прогон) — Capacity удвоился «doubles to <b>32</b>», <span class="ru-tr">(удваивается до <b>32</b>),</span> Length = 19.', nodes: [{ id: "l", kind: "gate", at: { zone: "grown", row: 0, col: 0 }, state: "ok", label: "Length", detail: "19" }, { id: "c2", kind: "gate", at: { zone: "grown", row: 0, col: 1 }, state: "ok", label: "Capacity", detail: "32", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — рост буфера, снятый прогоном. Default <code>StringBuilder()</code> стартует с Capacity 16 («The default capacity of this object is <b>16</b> characters» <span class="ru-tr">(ёмкость этого объекта по умолчанию — <b>16</b> символов)</span>). Appending «"This is a sentence." results in a new memory allocation because the string length (<b>19</b> characters) exceeds the default capacity… The capacity of the object <b>doubles to 32</b> characters, the new string is added, and the length of the object now equals <b>19</b> characters». <span class="ru-tr">(добавление приводит к новой аллокации, т.к. длина строки 19 превышает ёмкость по умолчанию; ёмкость удваивается до 32, строка добавляется, длина становится 19).</span> Реальный вывод сниппета: <code>16</code>, затем <code>19 32</code> — ровно как в доке. Вывод для сеньора: удвоение амортизирует стоимость, но каждое удвоение — это аллокация + копирование буфера; знаешь итоговый размер — задай Capacity в конструкторе и убери промежуточные удвоения.',
      sources: ["ms-sb"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var sb = new StringBuilder(); Console.WriteLine(sb.Capacity); sb.Append("This is a sentence."); Console.WriteLine($"{sb.Length} {sb.Capacity}");</code> — обе строки? (строка = 19 символов)',
      options: ["16\\n19 32", "16\\n19 16", "0\\n19 19", "16\\n19 19"], correctIndex: 0, xp: 10,
      okText: 'Default Capacity = <b>16</b>. 19 символов > 16 → «capacity… doubles to 32». <span class="ru-tr">(ёмкость… удваивается до 32).</span> Length = 19, Capacity = <span class="hl">32</span>.',
      noText: 'Переполнение удваивает Capacity: «the value of the Capacity property is doubled». <span class="ru-tr">(значение свойства Capacity удваивается).</span> 16 → 32, Length 19. Реальный вывод: <b>16</b>, затем <b>19 32</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "16\n19 32" }, sourceRefs: ["ms-sb"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var sb = new StringBuilder(); var same = sb.Append("ab").Append("c");</code><br/><code>Console.WriteLine(object.ReferenceEquals(sb, same)); Console.WriteLine(sb.ToString());</code> — обе строки?',
      options: ["True\\nabc", "False\\nabc", "True\\nc", "False\\nc"], correctIndex: 0, xp: 10,
      okText: '<code>Append</code> пишет «on a single string» <span class="ru-tr">(над одной строкой)</span> и возвращает <b>тот же</b> экземпляр (fluent): <code>same</code> == <code>sb</code> (<b>True</b>), значение <b>abc</b>.',
      noText: 'StringBuilder мутабелен: Append правит один объект и возвращает <code>this</code>. Реальный вывод: <b>True</b>, затем <b>abc</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True\nabc" }, sourceRefs: ["ms-sb"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var sb = new StringBuilder("hello"); sb.Append(" world"); sb.Replace("l", "L"); sb.Insert(0, "&gt;&gt; ");</code><br/><code>Console.WriteLine(sb.ToString()); Console.WriteLine(sb.Length);</code> — обе строки?',
      options: [">> heLLo worLd\\n14", "hello world\\n11", ">> heLLo world\\n14", ">> hello world\\n14"], correctIndex: 0, xp: 10,
      okText: 'Всё <b>в одном</b> объекте: Append → <code>hello world</code>, Replace l→L → <code>heLLo worLd</code>, Insert в начало → <code>&gt;&gt; heLLo worLd</code> (14 символов). «appending, removing, replacing, or inserting characters». <span class="ru-tr">(добавление, удаление, замена или вставка символов).</span>',
      noText: 'Мутации идут в место: Append/Replace/Insert правят единый буфер. Итог — <b>>> heLLo worLd</b>, Length <b>14</b> (реальный прогон).',
      verify: { kind: "exec", run: "dotnet run", expect: ">> heLLo worLd\n14" }, sourceRefs: ["ms-sb"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Mutable sequence", v: '«a string-like object whose value is a <b>mutable sequence of characters</b>». <span class="ru-tr">(изменяемая последовательность символов).</span> Append/Replace/Insert правят <b>один</b> объект (замер: <code>ReferenceEquals</code>=True), финальная аллокация String — только в <code>ToString()</code>.' },
    { icon: "cost", k: "Capacity удваивается", v: 'Default Capacity <b>16</b>; при переполнении «the value of the Capacity property is <b>doubled</b>» <span class="ru-tr">(значение свойства Capacity удваивается)</span> → 32 (замер: Append 19 символов → 19 32). Геометрический рост амортизирован; знаешь размер — задай Capacity в ctor.' },
    { icon: "avoid", k: "Не подменяй рефлекторно", v: '«you should <b>not automatically replace</b> String with StringBuilder». <span class="ru-tr">(не следует автоматически заменять String на StringBuilder).</span> Мало правок / фикс. конкатенация литералов → String (компилятор склеит). Много/неизвестно правок → StringBuilder. Нет <code>IndexOf</code>/<code>StartsWith</code>.' },
  ],

  foot: 'урок · <b>StringBuilder</b> · 5 анимир. разборов · mutable buffer · панель Capacity 16 → 32 · дизайн <b>mid</b>',
};
