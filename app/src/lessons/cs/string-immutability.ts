/**
 * Lesson: System.String immutability (CS.S12.string-immutability) — expert density, 5 animated
 * deep-dives. The senior-level fact: System.String is a REFERENCE type whose value is read-only;
 * every method that "changes" a string returns a NEW String object, and the old one is untouched.
 * This is the STRING angle on allocation (references CS.S7 memory), NOT a rehash of GC: the focus
 * is object identity (ReferenceEquals) and the per-operation allocation that immutability forces.
 *
 * SIGNATURE machine panel (s5): `s += "c"` does not mutate `s` — after the concat, `s` points at a
 * NEW object and the aliased `t` still holds the original. REAL run-csharp measurement (this file's
 * exec cards): c1 "False\nab" (concat re-points, alias untouched) · c2 "hello\nheLLo\nFalse"
 * (Replace returns a new object) · c3 "cat CAT False" (ToUpper allocates each call).
 *
 * Accuracy contract (G4/G7/G8) — verified against learn.microsoft.com/.../api/system.string
 * (dotnet-api-docs String.xml, substring-checked 2026-07-22):
 *   - every English quote is VERBATIM from the String Remarks (immutability + StringBuilder section);
 *   - the object-identity FACTS are OWN, DETERMINISTIC run-csharp measurements (this file's exec
 *     cards), presented as such and PROVEN by the exec cards, never faked;
 *   - every card verify.expect is the REAL stdout of run-csharp: c1 "False\nab" · c2
 *     "hello\nheLLo\nFalse" · c3 "cat CAT False".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S12.string-immutability/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: what a String IS — a sequential collection of char (UTF-16) whose value is read-only.
const Z_STR: Zone = { id: "strz", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "String в куче", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "коллекция char (UTF-16)", subCls: "vz-zsub heap", subY: 47 };
const Z_LOCK: Zone = { id: "lock", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ЗНАЧЕНИЕ · read-only", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "нельзя изменить", subCls: "vz-zsub", subY: 47 };
const WHAT_ZONES: Zone[] = [Z_STR, Z_LOCK];

// s2: a "modifying" method returns a NEW object; the old one stays.
const Z_OLD: Zone = { id: "old", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "СТАРЫЙ объект", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "не тронут", subCls: "vz-zsub", subY: 47 };
const Z_NEW: Zone = { id: "new", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "НОВЫЙ объект", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "с модификацией", subCls: "vz-zsub good", subY: 47 };
const RETURN_ZONES: Zone[] = [Z_OLD, Z_NEW];

// s3: aliasing — two names, one object; re-assigning one re-points, doesn't mutate.
const Z_NAMES: Zone = { id: "names", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ИМЕНА (стек)", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "s, t", subCls: "vz-zsub", subY: 47 };
const Z_OBJS: Zone = { id: "objs", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ОБЪЕКТЫ (куча)", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: '"ab" · "abc"', subCls: "vz-zsub heap", subY: 47 };
const ALIAS_ZONES: Zone[] = [Z_NAMES, Z_OBJS];

// s4: the cost — a loop of += allocates a fresh String each turn.
const Z_LOOP: Zone = { id: "loop", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone heap", label: "ЦЕНА · += в цикле аллоцирует каждый раз", labelCls: "vz-zlabel heap", lx: 170, ly: 24, sub: "significant performance penalty", subCls: "vz-zsub heap", subY: 47 };
const LOOP_ZONES: Zone[] = [Z_LOOP];

// s5 (SIGNATURE): s += "c" — re-points s, alias t keeps the original (measured False / ab).
const Z_BEFORE: Zone = { id: "before", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "s, t → один объект", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: 'оба на "ab"', subCls: "vz-zsub", subY: 47 };
const Z_AFTER: Zone = { id: "after", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: 'после s += "c"', labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "s → новый, t → старый", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_BEFORE, Z_AFTER];

export const stringImmutability: LessonData = {
  id: "CS.S12.string-immutability",
  track: "CS",
  section: "CS.S12",
  module: "S12.1",
  lang: "csharp",
  title: "String иммутабельна: «изменение» аллоцирует новый объект",
  kicker: "C# вглубь · S12 · read-only value",
  home: { subtitle: "value read-only, метод возвращает новый объект, цена += в цикле", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-string", kind: "doc", org: "Microsoft Learn", title: "String Class (System)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.string", date: "2025-07-01" },
  ],

  spec: [
    { text: "«A String object is called immutable (read-only), because its value cannot be modified after it has been created. Methods that appear to modify a String object actually return a new String object that contains the modification.»", source: "ms-string" },
  ],
  edgeCases: [
    { text: "«Изменение» — это <b>новый объект</b>: «Methods that appear to modify a <span class=\"hl\">String</span> object actually return a new <span class=\"hl\">String</span> object that contains the modification». Собственный прогон: <code>s.ToUpper()</code> ≠ <code>s</code> по ссылке (<code>ReferenceEquals</code> = <code>False</code>).", source: "ms-string" },
    { text: "String — <b>ссылочный</b> тип, но значение read-only: «its value cannot be modified after it has been created». Присваивание <code>s += \"c\"</code> не мутирует объект, а <b>переставляет ссылку</b> <code>s</code> на новый; алиас <code>t</code> держит старый.", source: "ms-string" },
    { text: "Конкатенация в цикле бьёт по производительности: «string manipulation routines that perform repeated additions or deletions to what appears to be a single string can exact a <span class=\"hl\">significant performance penalty</span>» — каждый шаг создаёт новый <code>String</code>.", source: "ms-string" },
  ],

  misconceptions: [
    {
      wrong: "s += \"c\" дописывает символ В ТОТ ЖЕ строковый объект — string мутабельна, просто это медленно",
      hook: 'Нет — <code>String</code> <b>иммутабельна</b>, и «дописать» в неё нельзя в принципе: «A <b>String</b> object is called <span class="hl">immutable (read-only)</span>, because its value cannot be modified after it has been created». Любой метод, который «меняет» строку, на деле <b>возвращает новый объект</b>: «Methods that appear to modify a <b>String</b> object actually return a <span class="hl">new String object</span> that contains the modification». То есть <code>s += "c"</code> не трогает старый объект, а создаёт новый и <b>переставляет ссылку</b> <code>s</code> — а алиас, указывавший на старый, продолжает видеть исходное значение. Отсюда и цена: «repeated additions or deletions… can exact a <b>significant performance penalty</b>» <span class="ru-tr">(значимый штраф по производительности)</span>. Это <b>строковый</b> угол на аллокацию из секции памяти (S7): не «GC вообще», а конкретно — сколько мусорных <code>String</code> рождает наивный <code>+=</code>. Дальше <b>пять разборов</b>: что такое String, метод возвращает новый объект, алиасинг и переустановка ссылки, цена += в цикле, и <b>машинная панель</b> — <code>ReferenceEquals</code> до/после <code>+=</code> (реальный прогон: <code>False</code>, старое значение цело).',
      source: "ms-string",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Что такое String", title: "Коллекция char, значение read-only",
      viewBox: "0 0 340 210", zones: WHAT_ZONES,
      code: ["string s = \"ab\";", "// s — ссылка на объект String в куче", "// его значение НЕЛЬЗЯ изменить после создания"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>String</code> — <b>последовательность char</b> (каждый char = UTF-16 code unit). Объект живёт в куче, <code>s</code> — ссылка на него.', nodes: [{ id: "obj", kind: "obj", at: { zone: "strz", row: 0 }, typeTag: "String", value: '"ab"', accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Ключевое: значение объекта — <span class="hl">read-only</span>. «its value cannot be modified after it has been created». <span class="ru-tr">(значение нельзя изменить после создания)</span>', nodes: [{ id: "obj", kind: "obj", at: { zone: "strz", row: 0 }, typeTag: "String", value: '"ab"' }, { id: "lk", kind: "gate", at: { zone: "lock", row: 0 }, state: "ok", label: "read-only", detail: "value заморожено", accent: true }], edges: [{ id: "e", from: "obj", to: "lk", accent: true }] },
        { codeLine: 2, out: "", caption: 'Значит, «изменить» существующий объект нельзя — можно только <b>создать новый</b>. Это меняет всю модель работы со строками.', nodes: [{ id: "obj", kind: "obj", at: { zone: "strz", row: 0 }, typeTag: "String", value: '"ab"' }, { id: "lk", kind: "gate", at: { zone: "lock", row: 0 }, state: "ok", label: "read-only", detail: "value заморожено" }], edges: [{ id: "e", from: "obj", to: "lk" }] },
      ],
      explain: 'Отправная точка: «A <b>String</b> object is a sequential collection of <b>System.Char</b> objects that represent a string; a <b>System.Char</b> object corresponds to a UTF-16 code unit». <span class="ru-tr">(объект String — последовательная коллекция объектов System.Char; каждый System.Char соответствует одному UTF-16 code unit).</span> И это значение <b>read-only</b>: «A <b>String</b> object is called <span class="hl">immutable (read-only)</span>, because its value cannot be modified after it has been created». <span class="ru-tr">(объект String называют иммутабельным (только для чтения), потому что его значение нельзя изменить после создания).</span> Практический смысл для сеньора: строку можно свободно шарить между потоками и структурами без защитных копий — она физически не изменится под тобой. Плата за это — аллокации при каждом «изменении», что мы и разберём дальше.',
      sources: ["ms-string"],
    },
    {
      id: "s2", num: "02", kicker: "Метод возвращает новый объект", title: "«Изменяющий» метод создаёт новый String",
      viewBox: "0 0 340 210", zones: RETURN_ZONES,
      code: ["string a = \"hello\";", "string b = a.Replace(\"l\", \"L\");   // НЕ меняет a", "// a == \"hello\", b == \"heLLo\", это РАЗНЫЕ объекты"],
      predictAt: 1, predictQ: '<code>a.Replace("l", "L")</code> вернул <code>b</code>. Что напечатает <code>a</code>, затем <code>b</code>, затем <code>object.ReferenceEquals(a, b)</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>a</code> ссылается на объект <code>"hello"</code>. Дальше вызовем «изменяющий» метод <code>Replace</code>.', nodes: [{ id: "a", kind: "obj", at: { zone: "old", row: 0 }, typeTag: "a : String", value: '"hello"', accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Replace</code> не трогает <code>a</code>: он <span class="hl">возвращает новый объект</span> <code>b</code> с изменением. Старый <code>"hello"</code> цел.', nodes: [{ id: "a", kind: "obj", at: { zone: "old", row: 0 }, typeTag: "a : String", value: '"hello"' }, { id: "b", kind: "obj", at: { zone: "new", row: 0 }, typeTag: "b : String", value: '"heLLo"', accent: true }], edges: [] },
        { codeLine: 2, out: "hello\nheLLo\nFalse", caption: 'Панель: <span class="hl">hello / heLLo / False</span> (реальный прогон) — <code>a</code> не изменился, <code>b</code> — другой объект, <code>ReferenceEquals</code> = <code>False</code>.', nodes: [{ id: "a", kind: "obj", at: { zone: "old", row: 0 }, typeTag: "a", value: '"hello"' }, { id: "b", kind: "obj", at: { zone: "new", row: 0 }, typeTag: "b", value: '"heLLo"', accent: true }], edges: [] },
      ],
      explain: 'Здесь прибиваем главный источник заблуждений: «Methods that appear to modify a <b>String</b> object actually return a <span class="hl">new String object</span> that contains the modification». <span class="ru-tr">(методы, которые как будто изменяют объект String, на самом деле возвращают новый объект String с модификацией).</span> <code>Replace</code>, <code>ToUpper</code>, <code>Substring</code>, <code>Trim</code>, <code>Insert</code> — все они не мутируют получателя, а порождают новый <code>String</code>. Собственный прогон печатает <code>hello / heLLo / False</code>: исходный <code>a</code> нетронут, а <code>b</code> — <b>другой объект</b> в куче (<code>ReferenceEquals</code> = <code>False</code>). Отладочный вывод: если ты написал <code>s.Trim();</code> и не присвоил результат — операция «потерялась», потому что менять <code>s</code> на месте она не может по определению.',
      sources: ["ms-string"],
    },
    {
      id: "s3", num: "03", kicker: "Алиасинг · переустановка ссылки", title: "s += \"c\" переставляет ссылку, а не мутирует объект",
      viewBox: "0 0 340 210", zones: ALIAS_ZONES,
      code: ["string s = \"ab\";", "string t = s;        // t и s — на ОДИН объект \"ab\"", "s += \"c\";            // s → НОВЫЙ объект \"abc\", t всё ещё на \"ab\""],
      scenes: [
        { codeLine: 1, out: "", caption: '<code>t = s</code> — оба имени указывают на <span class="hl">один</span> объект <code>"ab"</code>. Копируется ссылка, не значение.', nodes: [{ id: "s", kind: "ref", at: { zone: "names", row: 0 }, name: "s", accent: true }, { id: "t", kind: "ref", at: { zone: "names", row: 1 }, name: "t" }, { id: "ab", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "String", value: '"ab"' }], edges: [{ id: "es", from: "s", to: "ab", accent: true }, { id: "et", from: "t", to: "ab" }] },
        { codeLine: 2, out: "", caption: '<code>s += "c"</code> создаёт <b>новый</b> объект <code>"abc"</code> и <span class="hl">переставляет</span> ссылку <code>s</code> на него. Старый <code>"ab"</code> не изменился.', nodes: [{ id: "s", kind: "ref", at: { zone: "names", row: 0 }, name: "s", accent: true }, { id: "t", kind: "ref", at: { zone: "names", row: 1 }, name: "t" }, { id: "ab", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "String", value: '"ab"' }, { id: "abc", kind: "obj", at: { zone: "objs", row: 1 }, typeTag: "String", value: '"abc"', accent: true }], edges: [{ id: "es", from: "s", to: "abc", accent: true }, { id: "et", from: "t", to: "ab" }] },
        { codeLine: 2, out: "", caption: 'Итог: <code>t</code> по-прежнему видит <code>"ab"</code>. Иммутабельность = <b>алиас нельзя испортить</b> чужой мутацией.', nodes: [{ id: "t", kind: "ref", at: { zone: "names", row: 0 }, name: "t", accent: true }, { id: "ab", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "String", value: '"ab"', accent: true }, { id: "abc", kind: "obj", at: { zone: "objs", row: 1 }, typeTag: "String (s)", value: '"abc"' }], edges: [{ id: "et", from: "t", to: "ab", accent: true }] },
      ],
      explain: '<code>String</code> — ссылочный тип, поэтому <code>t = s</code> копирует <b>ссылку</b>: два имени, один объект. Но раз значение «cannot be modified after it has been created», <span class="ru-tr">(нельзя изменить после создания)</span> присваивание <code>s += "c"</code> не может дописать в общий объект — оно <b>создаёт новый</b> и переставляет только <code>s</code>. Алиас <code>t</code> остаётся на исходном <code>"ab"</code>. Это фундаментальное отличие от мутабельных ссылочных типов (<code>List&lt;T&gt;</code>, массив): там <code>t.Add(x)</code> увидит и <code>s</code>. Со строкой такой «сюрприз через алиас» невозможен — почему строки и делают идеальными ключами словарей и безопасными для шаринга между потоками.',
      sources: ["ms-string"],
    },
    {
      id: "s4", num: "04", kicker: "Цена · += в цикле", title: "Наивная конкатенация аллоцирует на каждом шаге",
      viewBox: "0 0 340 210", zones: LOOP_ZONES,
      code: ["string str = \"\";", "for (int i = 0; i < 1000; i++)", "    str += (char)rnd.Next(0x1, 0x52F);   // НОВЫЙ String каждый раз"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Цикл «дописывает» символ к строке. Выглядит как одна строка, растущая на месте — но это <span class="hl">иллюзия</span>.', nodes: [{ id: "s0", kind: "obj", at: { zone: "loop", row: 0 }, typeTag: "итерация 1", value: '"a"', accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Каждый <code>+=</code> создаёт <b>новый</b> <code>String</code> и копирует туда всё старое содержимое. 1000 итераций → сотни аллокаций и копий.', nodes: [{ id: "s0", kind: "obj", at: { zone: "loop", row: 0, col: 0 }, typeTag: "итер 1", value: '"a"' }, { id: "s1", kind: "obj", at: { zone: "loop", row: 0, col: 1 }, typeTag: "итер 2", value: '"ab"' }, { id: "s2", kind: "obj", at: { zone: "loop", row: 0, col: 2 }, typeTag: "итер 3", value: '"abc"', accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Отсюда «significant performance penalty». <span class="ru-tr">(значимый штраф).</span> Для повторяющихся изменений — <code>StringBuilder</code> (следующий урок секции).', nodes: [{ id: "pen", kind: "gate", at: { zone: "loop", row: 0 }, state: "fail", label: "significant performance penalty", detail: "мусорные String на каждом шаге", accent: true }], edges: [] },
      ],
      explain: 'Иммутабельность имеет цену в горячем цикле: «string manipulation routines that perform repeated additions or deletions to what appears to be a single string can exact a <span class="hl">significant performance penalty</span>». <span class="ru-tr">(процедуры, выполняющие повторяющиеся добавления или удаления к тому, что выглядит как одна строка, могут повлечь значимый штраф по производительности).</span> Хотя код «appears to use string concatenation to append a new character to the existing string… it actually <b>creates a new String object for each concatenation</b> operation». <span class="ru-tr">(на самом деле создаёт новый объект String на каждую операцию конкатенации).</span> Это квадратичное поведение: на шаге <code>i</code> копируется <code>i</code> символов, итого ~n²/2. Здесь смыкается угол памяти из S7: строки — частый источник gen0-мусора в наивных билдерах логов/JSON. Лечение — <code>StringBuilder</code>, который «объекты… mutable» и пишет в <b>единый</b> буфер.',
      sources: ["ms-string"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · ReferenceEquals до/после", title: "s += \"c\" — новый объект, алиас держит старое",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["string s = \"ab\";", "string t = s;", "s += \"c\";", "Console.WriteLine(object.ReferenceEquals(s, t));", "Console.WriteLine(t);"],
      predictAt: 2, predictQ: '<code>t = s</code>, затем <code>s += "c"</code>. Что напечатает <code>object.ReferenceEquals(s, t)</code>, а затем <code>t</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>s</code> и <code>t</code> — на <span class="hl">один</span> объект <code>"ab"</code>. Пока <code>ReferenceEquals(s, t)</code> был бы <code>True</code>.', nodes: [{ id: "s", kind: "ref", at: { zone: "before", row: 0 }, name: "s", accent: true }, { id: "t", kind: "ref", at: { zone: "before", row: 1 }, name: "t", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>s += "c"</code> переставляет <code>s</code> на <b>новый</b> объект <code>"abc"</code>. <code>t</code> остаётся на старом <code>"ab"</code>.', nodes: [{ id: "s", kind: "ref", at: { zone: "before", row: 0 }, name: "s" }, { id: "t", kind: "ref", at: { zone: "before", row: 1 }, name: "t" }, { id: "sn", kind: "obj", at: { zone: "after", row: 0 }, typeTag: "s → new", value: '"abc"', accent: true }], edges: [] },
        { codeLine: 4, out: "False\nab", caption: 'Панель: <span class="hl">False / ab</span> (реальный прогон) — разные объекты (<code>False</code>), и <code>t</code> всё ещё <code>"ab"</code>: мутации не было, была переустановка ссылки.', nodes: [{ id: "rq", kind: "gate", at: { zone: "before", row: 0 }, state: "ok", label: "ReferenceEquals(s,t)", detail: "False" }, { id: "tv", kind: "obj", at: { zone: "after", row: 0 }, typeTag: "t", value: '"ab"', accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — снятая через идентичность объектов. <code>t = s</code> даёт два имени на один объект; будь строка мутабельной, <code>s += "c"</code> увидели бы оба. Но «its value cannot be modified after it has been created», <span class="ru-tr">(значение нельзя изменить после создания)</span> поэтому <code>+=</code> «actually return a new String object» <span class="ru-tr">(на деле возвращает новый объект String)</span> и переставляет <b>только</b> <code>s</code>. Реальный вывод сниппета — <code>False</code> (разные объекты) и <code>ab</code> (<code>t</code> держит исходное значение). Вывод для сеньора: иммутабельность = гарантия, что чужой код с алиасом на твою строку никогда её не испортит; цена — новый объект на каждое «изменение», которую в горячем пути снимает <code>StringBuilder</code>.',
      sources: ["ms-string"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>string s = "ab"; string t = s; s += "c";</code><br/><code>Console.WriteLine(object.ReferenceEquals(s, t)); Console.WriteLine(t);</code> — обе строки?',
      options: ["False\\nab", "True\\nabc", "False\\nabc", "True\\nab"], correctIndex: 0, xp: 10,
      okText: '<code>s += "c"</code> не мутирует объект, а создаёт <span class="hl">новый</span> и переставляет <code>s</code>. Алиас <code>t</code> держит старый <code>"ab"</code>: <code>ReferenceEquals</code> = <b>False</b>, <code>t</code> = <b>ab</b>.',
      noText: 'String иммутабельна: «actually return a new String object». <code>s</code> ушёл на новый объект, <code>t</code> остался на <code>"ab"</code>. Реальный вывод: <b>False</b>, затем <b>ab</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "False\nab" }, sourceRefs: ["ms-string"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>string a = "hello"; string b = a.Replace("l", "L");</code><br/><code>Console.WriteLine(a); Console.WriteLine(b); Console.WriteLine(object.ReferenceEquals(a, b));</code> — все три строки?',
      options: ["hello\\nheLLo\\nFalse", "heLLo\\nheLLo\\nTrue", "hello\\nheLLo\\nTrue", "heLLo\\nhello\\nFalse"], correctIndex: 0, xp: 10,
      okText: '<code>Replace</code> «appear to modify… actually return a new String object». <code>a</code> цел (<b>hello</b>), <code>b</code> — новый (<b>heLLo</b>), это <span class="hl">разные</span> объекты (<b>False</b>).',
      noText: 'Метод не мутирует получателя. <code>a</code> = <b>hello</b>, <code>b</code> = <b>heLLo</b>, <code>ReferenceEquals</code> = <b>False</b> — реальный прогон.',
      verify: { kind: "exec", run: "dotnet run", expect: "hello\nheLLo\nFalse" }, sourceRefs: ["ms-string"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>string s = "cat"; string u = s.ToUpper();</code><br/><code>Console.WriteLine($"{s} {u} {object.ReferenceEquals(s, s.ToUpper())}");</code> — что напечатает?',
      options: ["cat CAT False", "CAT CAT True", "cat CAT True", "CAT cat False"], correctIndex: 0, xp: 10,
      okText: '<code>ToUpper</code> возвращает <span class="hl">новый</span> объект — исходный <code>s</code> = <b>cat</b>, <code>u</code> = <b>CAT</b>. И даже два вызова <code>ToUpper</code> дают разные объекты: <code>ReferenceEquals</code> = <b>False</b>.',
      noText: 'Каждый «изменяющий» вызов аллоцирует новый String. <code>s</code> не меняется, а <code>s.ToUpper()</code> ≠ <code>s</code> по ссылке. Реальный вывод: <b>cat CAT False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "cat CAT False" }, sourceRefs: ["ms-string"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Value read-only", v: 'Значение <code>String</code> «cannot be modified after it has been created». <span class="ru-tr">(нельзя изменить после создания).</span> String — ссылочный тип с иммутабельным значением: шарить безопасно, защитные копии не нужны.' },
    { icon: "cost", k: "Метод → новый объект", v: '«Methods that appear to modify a String object actually return a <b>new String object</b>». <code>Replace</code>/<code>ToUpper</code>/<code>Trim</code> не мутируют получателя (замер: <code>ReferenceEquals</code> = False). Не присвоил результат — изменение потеряно.' },
    { icon: "avoid", k: "Цена += в цикле", v: 'Повторяющаяся конкатенация = «significant performance penalty» <span class="ru-tr">(значимый штраф)</span>: новый String + копия на каждом шаге (~n²). Для многих изменений — <code>StringBuilder</code> (следующий урок).' },
  ],

  foot: 'урок · <b>String иммутабельна</b> · 5 анимир. разборов · read-only value · панель ReferenceEquals до/после += · дизайн <b>mid</b>',
};
