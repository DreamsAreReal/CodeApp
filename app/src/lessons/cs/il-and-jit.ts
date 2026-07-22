/**
 * Lesson: IL and JIT (CS.S13.il-and-jit) — expert density, 5 animated deep-dives. Book-sourced
 * (Richter, CLR via C#, 4th ed., ch. 1). The zoom-in on the two runtime facts the pipeline lesson
 * (CS.S13.clr-execution-model) named: (1) IL is the CLR's OWN instruction set — a stack-based,
 * CPU-independent, object-oriented machine language; (2) the JIT compiler turns a method's IL into
 * native processor instructions the FIRST time the method is called, then patches the call site so
 * later calls run native directly. COMPLEMENTS the pipeline lesson (which framed source→IL→JIT→native
 * at a high level) by going down to actual IL opcodes and the JIT's first-call mechanics.
 *
 * SIGNATURE machine panel (s5): the real IL of a method, byte for byte. Add(a,b)=>a+b compiles to
 * 4 IL bytes — ldarg.0 (2), ldarg.1 (3), add (88=0x58), ret (42=0x2A) — a textbook stack program:
 * push arg0, push arg1, add pops two & pushes the sum, ret. Swap the source operator to `*` and only
 * ONE byte changes (add 88 → mul 90=0x5A): 2 3 90 42. REAL run-csharp measurement (this file's exec
 * cards, app backend :5080). The JIT's native output is internal and not readable; we prove the IL
 * INPUT side (bytes, maxstack) by exec and teach the native/first-call side from the book.
 *
 * BOOK PROVENANCE (replaces the URL-verbatim rule):
 *   - Every « » passage is VERBATIM RUSSIAN from clr-book.txt (ch. 1 «Модель выполнения кода в среде
 *     CLR», section «IL-код и верификация» + JIT section), substring-checked (wrap/soft-hyphen normalized).
 *   - Exec-card expects are REAL, DETERMINISTIC run-csharp stdout:
 *     c1 "2 3 88 42" (Add IL: ldarg.0 ldarg.1 add ret) ·
 *     c2 "2 3 90 42" (Mul IL: same shape, one opcode swapped — mul 90 instead of add 88) ·
 *     c3 "maxstack=8 il=4" (the method body carries a MaxStackSize — IL is a STACK language).
 *   - The JIT's produced native code and the JITCompiler patch are taught FROM THE BOOK (quoted) —
 *     they are internal and not directly readable; the IL side is proven by exec. No fabricated opcode.
 *   - .NET 10 note: IL as a stack-based CPU-independent instruction set and per-method JIT-on-first-call
 *     are TIMELESS and still hold in .NET 10. The book's dated NGen/ProfileOptimization asides are not
 *     taught here (tiered JIT / ReadyToRun exist in modern .NET but are out of this lesson's scope).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S13.il-and-jit/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: IL is stack-based — operands are pushed onto and popped off an evaluation stack.
const Z_EVAL: Zone = { id: "eval", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "СТЕК ВЫЧИСЛЕНИЙ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "IL кладёт/снимает операнды", subCls: "vz-zsub", subY: 47 };
const Z_OP: Zone = { id: "op", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ИНСТРУКЦИЯ IL", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "add снимает два, кладёт сумму", subCls: "vz-zsub heap", subY: 47 };
const EVAL_ZONES: Zone[] = [Z_EVAL, Z_OP];

// s2: IL is untyped-per-op + CPU-independent — one `add` figures out operand types at run time.
const Z_IL: Zone = { id: "il", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "IL (не привязан к CPU)", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "одна add на все типы", subCls: "vz-zsub", subY: 47 };
const Z_CPU: Zone = { id: "cpu", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ЦЕЛЕВОЙ CPU", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "x86 / x64 / ARM", subCls: "vz-zsub good", subY: 47 };
const CPU_ZONES: Zone[] = [Z_IL, Z_CPU];

// s3: JIT on first call — the method's entry points at JITCompiler; it compiles IL → native.
const Z_METH: Zone = { id: "meth", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ЗАПИСЬ МЕТОДА", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "в таблице методов типа", subCls: "vz-zsub", subY: 47 };
const Z_NAT: Zone = { id: "nat", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "МАШИННЫЙ КОД", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "динамическая память", subCls: "vz-zsub good", subY: 47 };
const JIT_ZONES: Zone[] = [Z_METH, Z_NAT];

// s4: second call runs native directly — no JIT, no re-verification.
const Z_CALL: Zone = { id: "call", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ВЫЗОВ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "первый vs повторный", subCls: "vz-zsub", subY: 47 };
const Z_TGT: Zone = { id: "tgt", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "КУДА ПОПАДАЕТ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "JIT или готовый native", subCls: "vz-zsub good", subY: 47 };
const CALL_ZONES: Zone[] = [Z_CALL, Z_TGT];

// s5 (SIGNATURE): the real IL bytes of a method — a stack program, one opcode per source operator.
const Z_SRC: Zone = { id: "src", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ИСХОДНИК", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "a + b", subCls: "vz-zsub", subY: 47 };
const Z_BYTES: Zone = { id: "bytes", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "БАЙТЫ IL", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "GetILAsByteArray()", subCls: "vz-zsub heap", subY: 47 };
const BYTES_ZONES: Zone[] = [Z_SRC, Z_BYTES];

export const ilAndJit: LessonData = {
  id: "CS.S13.il-and-jit",
  track: "CS",
  section: "CS.S13",
  module: "S13.2",
  lang: "csharp",
  title: "IL и JIT: набор инструкций CLR и компиляция метода при первом вызове",
  kicker: "CLR внутри · S13 · инструкции и JIT",
  home: { subtitle: "IL — стековый CPU-независимый язык; JIT метода в native на первом вызове", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "clr-ch1", kind: "book", org: "Джеффри Рихтер", title: "CLR via C#, 4-е изд., гл. 1 «Модель выполнения кода в среде CLR»", url: "", date: "2013" },
  ],

  spec: [
    { text: "IL — стековая машина: «IL является стековым языком; это означает, что все его инструкции заносят операнды в исполнительный стек и извлекают результаты из стека». Регистров у него нет: «IL не содержит инструкций для работы с регистрами».", source: "clr-ch1" },
  ],
  edgeCases: [
    { text: "Инструкции IL <b>нетипизованы</b>: «в IL имеется инструкция для сложения двух последних операндов, занесенных в стек. У инструкции сложения нет двух раздельных версий (32-разрядной и 64-разрядной)». При выполнении она «определяет типы операндов, хранящихся в стеке, и выполняет соответствующую операцию» (собственный прогон: <code>add</code> = байт 88, <code>mul</code> = 90).", source: "clr-ch1" },
    { text: "JIT платится один раз: «Рассмотрим повторное обращение метода Main к методу WriteLine. К этому моменту код метода WriteLine уже проверен и скомпилирован, так что обращение к блоку памяти производится <b>напрямую, без вызова JITCompiler</b>».", source: "clr-ch1" },
    { text: "IL хранит и <b>верификацию</b>: в процессе JIT-компиляции «CLR выполняется процедура, называемая верификацией — анализ высокоуровневого кода IL и проверка безопасности всех операций» (верификация и компиляция — один совмещённый шаг, не до неё). Вся нужная для неё информация «хранится в метаданных управляемого модуля».", source: "clr-ch1" },
  ],

  misconceptions: [
    {
      wrong: "IL — это как ассемблер под конкретный процессор, а JIT просто «интерпретирует» его команда за командой",
      hook: 'Нет по обоим пунктам. IL — <b>собственный набор инструкций CLR</b>, не привязанный к CPU: это <span class="hl">стековая</span> машина без регистров. «IL является стековым языком; это означает, что все его инструкции заносят операнды в исполнительный стек и извлекают результаты из стека». И его инструкции нетипизованы: одна <code>add</code> на все типы — «У инструкции сложения нет двух раздельных версий (32-разрядной и 64-разрядной)». А JIT — это <b>компиляция в нативный код</b>, а не интерпретация: при первом вызове метода «JITCompiler <span class="hl">проверяет и компилирует IL-код в машинные команды</span>, которые сохраняются в динамически выделенном блоке памяти», после чего запись метода патчится на этот native-блок, и второй вызов идёт «напрямую, без вызова JITCompiler». Дальше <b>пять разборов</b>: стек вычислений, нетипизованность + CPU-независимость, JIT на первом вызове, повторный вызов без JIT, и <b>машинная панель</b> — реальные байты IL метода <code>Add</code> (реальный прогон: <code>2 3 88 42</code> — ldarg.0, ldarg.1, add, ret).',
      source: "clr-ch1",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Стек вычислений", title: "IL — стековый язык: операнды в стек, результат из стека",
      viewBox: "0 0 340 210", zones: EVAL_ZONES,
      code: ["// int r = a + b;  во что это превращается в IL:", "ldarg.0   // положить a в стек вычислений", "ldarg.1   // положить b в стек вычислений", "add       // снять два, сложить, положить сумму", "ret       // вернуть верхушку стека"],
      il: [{ off: "0", op: "ldarg.0", arg: "", cmt: "push a" }, { off: "1", op: "ldarg.1", arg: "", cmt: "push b" }, { off: "2", op: "add", arg: "", cmt: "pop 2 → push sum" }, { off: "3", op: "ret", arg: "", cmt: "return top" }],
      scenes: [
        { codeLine: 1, ilLine: 0, out: "", caption: '<code>ldarg.0</code> кладёт <code>a</code> на <b>стек вычислений</b> — у IL нет регистров, только этот стек.', nodes: [{ id: "a", kind: "slot", at: { zone: "eval", row: 0 }, name: "стек[0]", value: "a", accent: true }], edges: [] },
        { codeLine: 2, ilLine: 1, out: "", caption: '<code>ldarg.1</code> кладёт сверху <code>b</code>. Теперь на стеке два операнда — инструкция <code>add</code> возьмёт именно их.', nodes: [{ id: "a", kind: "slot", at: { zone: "eval", row: 1 }, name: "стек[0]", value: "a" }, { id: "b", kind: "slot", at: { zone: "eval", row: 0 }, name: "стек[1]", value: "b", accent: true }], edges: [] },
        { codeLine: 3, ilLine: 2, out: "", caption: '<code>add</code> <span class="hl">снимает два верхних</span> операнда, складывает и кладёт сумму обратно: «заносят операнды в исполнительный стек и извлекают результаты из стека».', nodes: [{ id: "sum", kind: "slot", at: { zone: "eval", row: 0 }, name: "стек[0]", value: "a+b", accent: true }, { id: "add", kind: "gate", at: { zone: "op", row: 0 }, state: "ok", label: "add", detail: "pop 2 → push 1", accent: true }], edges: [{ id: "e", from: "add", to: "sum", accent: true }] },
        { codeLine: 4, ilLine: 3, out: "", caption: '<code>ret</code> возвращает верхушку стека. Весь метод — это <b>программа над стеком</b>, без единого регистра.', nodes: [{ id: "sum", kind: "slot", at: { zone: "eval", row: 0 }, name: "результат", value: "a+b" }, { id: "ret", kind: "gate", at: { zone: "op", row: 0 }, state: "ok", label: "ret", detail: "вернуть top", accent: true }], edges: [] },
      ],
      explain: 'IL — не абстрактный байт-код вообще, а конкретная <b>стековая</b> машина. Дословно: «IL является стековым языком; это означает, что все его инструкции <span class="hl">заносят операнды в исполнительный стек и извлекают результаты из стека</span>. IL не содержит инструкций для работы с регистрами, и это упрощает создание новых языков и компиляторов, генерирующих код для CLR». Поэтому <code>a + b</code> компилируется в четыре инструкции: <code>ldarg.0</code> (push a), <code>ldarg.1</code> (push b), <code>add</code> (pop два, push сумму), <code>ret</code>. Никаких регистров — только один стек вычислений на метод. Отсутствие регистров сделано намеренно: так проще писать компилятор нового языка под CLR (ему не надо распределять регистры — это сделает JIT под конкретный CPU). Глубина IL шире арифметики: «Он позволяет работать с объектами и имеет команды для создания» — а ещё «и инициализации объектов, вызова виртуальных методов и непосредственного манипулирования элементами массивов».',
      sources: ["clr-ch1"],
    },
    {
      id: "s2", num: "02", kicker: "Нетипизовано · CPU-независимо", title: "Одна add на все типы; IL не знает про x86/ARM",
      viewBox: "0 0 340 210", zones: CPU_ZONES,
      code: ["// в IL НЕТ отдельной add32 и add64:", "add   // при выполнении сама определит типы операндов", "// и сам IL не знает целевой процессор —", "// команды x86/x64/ARM выдаст JIT на целевой машине"],
      scenes: [
        { codeLine: 1, out: "", caption: 'У <code>add</code> <span class="hl">нет</span> отдельных 32/64-битных версий: «У инструкции сложения нет двух раздельных версий (32-разрядной и 64-разрядной)».', nodes: [{ id: "add", kind: "obj", at: { zone: "il", row: 0 }, typeTag: "add", value: "одна на все типы", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Тип операндов инструкция <b>определяет при выполнении</b>: «определяет типы операндов, хранящихся в стеке, и выполняет соответствующую операцию».', nodes: [{ id: "add", kind: "obj", at: { zone: "il", row: 0 }, typeTag: "add", value: "одна на все типы" }, { id: "meta", kind: "gate", at: { zone: "il", row: 1 }, state: "ok", label: "типы", detail: "из стека", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'И сам IL <b>не привязан к CPU</b>: команды под x86/x64/ARM выдаст <span class="hl">JIT на целевой машине</span> — «В отличие от этого, все CLR-совместимые компиляторы генерируют IL-код».', nodes: [{ id: "add", kind: "obj", at: { zone: "il", row: 0 }, typeTag: "add", value: "одна на все типы" }, { id: "x86", kind: "chip", at: { zone: "cpu", row: 0 }, value: "x86" }, { id: "x64", kind: "chip", at: { zone: "cpu", row: 1, col: 0 }, value: "x64" }, { id: "arm", kind: "chip", at: { zone: "cpu", row: 1, col: 1 }, value: "ARM", accent: true }], edges: [{ id: "e", from: "add", to: "arm", accent: true }] },
      ],
      explain: 'Два свойства делают IL <b>переносимым</b> набором инструкций. Первое — нетипизованность инструкций: «Инструкции IL также являются нетипизованными. Например, в IL имеется инструкция для сложения двух последних операндов, занесенных в стек. <span class="hl">У инструкции сложения нет двух раздельных версий (32-разрядной и 64-разрядной)</span>. При выполнении инструкция сложения определяет типы операндов, хранящихся в стеке, и выполняет соответствующую операцию». Второе — независимость от процессора: IL это «не зависящий от процессора машинный язык», и «все CLR-совместимые компиляторы генерируют IL-код». Конкретные команды процессора появляются только на целевой машине, их генерирует JIT: на x64-хосте — команды x64, на ARM64 — инструкции ARM64, и так на любой ОС (Windows/Linux/macOS). Отсюда и кросс-платформенность одного и того же <code>.dll</code>: внутри IL, а нативный код — уже забота JIT (разбор 03).',
      sources: ["clr-ch1"],
    },
    {
      id: "s3", num: "03", kicker: "JIT · первый вызов", title: "Первый вызов: JITCompiler компилирует IL метода в native",
      viewBox: "0 0 340 210", zones: JIT_ZONES,
      code: ["// запись метода в таблице методов типа поначалу", "// указывает на внутреннюю функцию JITCompiler", "obj.WriteLine(...)   // первый вызов →", "//   JITCompiler находит IL в метаданных,", "//   проверяет и компилирует его в машинный код"],
      predictAt: 2, predictQ: 'Метод вызывается впервые. Запись метода в таблице типа указывает на <code>JITCompiler</code>. Что произойдёт — IL проинтерпретируется, или скомпилируется в машинный код?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Изначально запись метода в таблице методов типа указывает на внутреннюю функцию <code>JITCompiler</code>, а не на готовый код.', nodes: [{ id: "rec", kind: "obj", at: { zone: "meth", row: 0 }, typeTag: "запись метода", value: "→ JITCompiler", accent: true }, { id: "empty", kind: "chip", at: { zone: "nat", row: 0 }, value: "native пусто" }], edges: [] },
        { codeLine: 3, out: "", caption: 'Первый вызов зовёт <code>JITCompiler</code>: «JITCompiler ищет в метаданных соответствующей сборки IL-код вызываемого метода».', nodes: [{ id: "rec", kind: "obj", at: { zone: "meth", row: 0 }, typeTag: "запись метода", value: "→ JITCompiler" }, { id: "jit", kind: "gate", at: { zone: "nat", row: 0 }, state: "ok", label: "JITCompiler", detail: "нашёл IL", accent: true }], edges: [{ id: "e1", from: "rec", to: "jit", accent: true }] },
        { codeLine: 4, out: "", caption: 'JIT «<span class="hl">проверяет и компилирует IL-код в машинные команды</span>, которые сохраняются в динамически выделенном блоке памяти» — это компиляция, не интерпретация.', nodes: [{ id: "rec", kind: "obj", at: { zone: "meth", row: 0 }, typeTag: "запись метода", value: "→ JITCompiler" }, { id: "nat", kind: "obj", at: { zone: "nat", row: 0 }, typeTag: "Native", value: "машинные команды", accent: true }], edges: [{ id: "e1", from: "rec", to: "nat", accent: true }] },
      ],
      explain: 'JIT — это <b>компилятор</b>, срабатывающий лениво при первом обращении к методу, а не интерпретатор. Механика: изначально «При инициализации этой структуры CLR заносит в каждую запись адрес внутренней недокументированной функции, содержащейся в самой среде CLR. Я обозначаю эту функцию JITCompiler». При первом вызове «JITCompiler ищет в метаданных соответствующей сборки IL-код вызываемого метода. Затем JITCompiler <span class="hl">проверяет и компилирует IL-код в машинные команды</span>, которые сохраняются в динамически выделенном блоке памяти. После этого JITCompiler возвращается к структуре внутренних данных типа… и <b>заменяет адрес вызываемого метода адресом блока памяти, содержащего готовые машинные команды</b>». Слово «компилирует» здесь буквальное: на выходе — команды процессора в динамической памяти, а не пошаговое исполнение IL. Что именно компилируется — тот IL, чьи байты снимет машинная панель (разбор 05).',
      sources: ["clr-ch1"],
    },
    {
      id: "s4", num: "04", kicker: "Повторный вызов · без JIT", title: "Второй вызов идёт прямо в native — JIT не повторяется",
      viewBox: "0 0 340 210", zones: CALL_ZONES,
      code: ["obj.WriteLine(...)   // первый вызов: JIT (медленно один раз)", "obj.WriteLine(...)   // второй вызов: сразу в машинный код", "// запись метода уже указывает на native-блок"],
      predictAt: 1, predictQ: 'Метод уже был вызван раньше (JIT отработал). При <b>втором</b> вызове CLR снова гоняет JITCompiler, или бьёт прямо в готовый машинный код?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Первый вызов заплатил за JIT: запись метода <b>пропатчена</b> на адрес native-блока с готовыми командами.', nodes: [{ id: "c1", kind: "gate", at: { zone: "call", row: 0 }, state: "ok", label: "1-й вызов", detail: "JIT отработал", accent: true }, { id: "nat", kind: "obj", at: { zone: "tgt", row: 0 }, typeTag: "Native", value: "готовый код", accent: true }], edges: [{ id: "e1", from: "c1", to: "nat" }] },
        { codeLine: 1, out: "", caption: 'Второй вызов идёт <span class="hl">напрямую</span>: «обращение к блоку памяти производится напрямую, <b>без вызова JITCompiler</b>».', nodes: [{ id: "c2", kind: "gate", at: { zone: "call", row: 0 }, state: "ok", label: "2-й вызов", detail: "без JIT", accent: true }, { id: "nat", kind: "obj", at: { zone: "tgt", row: 0 }, typeTag: "Native", value: "готовый код" }], edges: [{ id: "e2", from: "c2", to: "nat", accent: true }] },
        { codeLine: 2, out: "", caption: 'Итог: «Снижение производительности наблюдается только при <span class="hl">первом вызове метода</span>» — дальше на максимальной скорости.', nodes: [{ id: "c2", kind: "gate", at: { zone: "call", row: 0 }, state: "ok", label: "2-й+ вызов", detail: "native" }, { id: "fast", kind: "obj", at: { zone: "tgt", row: 0 }, typeTag: "скорость", value: "как native C++", accent: true }], edges: [] },
      ],
      explain: 'JIT — это <b>одноразовая</b> плата за метод, не за вызов. Дословно: «Рассмотрим повторное обращение метода Main к методу WriteLine. К этому моменту код метода WriteLine уже проверен и скомпилирован, так что <span class="hl">обращение к блоку памяти производится напрямую, без вызова JITCompiler</span>». Следствие для производительности: «Снижение производительности наблюдается только при первом вызове метода». Все последующие обращения выполняются на максимальной скорости, «потому что повторная верификация и компиляция не производятся». Более того, поскольку JIT видит реальную машину, он может оптимизировать под неё: «в тот момент, когда JIT-компилятор компилирует IL-код в машинный код во время выполнения, он знает о среде выполнения больше, чем может знать неуправляемый компилятор» — например, использовать инструкции конкретного процессора или выкинуть заведомо ложную ветку. <b>.NET 10</b>: современный рантайм добавил tiered JIT и ReadyToRun (предкомпиляция), но базовая модель — первый вызов JIT, дальше native напрямую — осталась.',
      sources: ["clr-ch1"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · байты IL", title: "Реальные байты IL: a+b → ldarg.0 ldarg.1 add ret",
      viewBox: "0 0 340 210", zones: BYTES_ZONES,
      code: ["class C { public static int Add(int a,int b)=>a+b; }", "var il = typeof(C).GetMethod(\"Add\")", "          .GetMethodBody().GetILAsByteArray();", "Console.WriteLine(string.Join(\" \", il));"],
      predictAt: 1, predictQ: 'Сколько байт IL у <code>Add(a,b)=&gt;a+b</code> и какие? Подсказка: push a, push b, add, ret — по одному байту на инструкцию.', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'В исходнике — одно выражение <code>a + b</code>. Компилятор превратил его в стековую программу IL (не в машинный код).', nodes: [{ id: "src", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "C#", value: "a + b", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>GetILAsByteArray()</code> достаёт <b>реальные байты IL</b> метода прямо из метаданных сборки — то, что JIT будет компилировать.', nodes: [{ id: "src", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "C#", value: "a + b" }, { id: "read", kind: "gate", at: { zone: "bytes", row: 0 }, state: "ok", label: "GetIL…", detail: "читаю", accent: true }], edges: [{ id: "e", from: "src", to: "read", accent: true }] },
        { codeLine: 3, out: "2 3 88 42", caption: 'Панель: <b>2 3 88 42</b> — <code>ldarg.0</code>(2), <code>ldarg.1</code>(3), <code>add</code>(88=0x58), <code>ret</code>(42=0x2A). Ровно та <span class="hl">стековая программа</span> из разбора 01 (реальный прогон).', nodes: [{ id: "b0", kind: "chip", at: { zone: "bytes", row: 0, col: 0 }, value: "2 ldarg.0" }, { id: "b1", kind: "chip", at: { zone: "bytes", row: 0, col: 1 }, value: "3 ldarg.1" }, { id: "b2", kind: "chip", at: { zone: "bytes", row: 1, col: 0 }, value: "88 add", accent: true }, { id: "b3", kind: "chip", at: { zone: "bytes", row: 1, col: 1 }, value: "42 ret" }], edges: [] },
      ],
      explain: 'Это машинная панель урока — IL метода, снятый побайтно. <code>Add(a,b)=>a+b</code> компилируется в <b>четыре байта</b>: <code>2 3 88 42</code>. Каждый байт — опкод: <code>ldarg.0</code> = 0x02 (push arg0), <code>ldarg.1</code> = 0x03 (push arg1), <code>add</code> = 0x58 = 88 (pop два, push сумму), <code>ret</code> = 0x2A = 42. Это ровно тот стековый порядок из разбора 01 — «заносят операнды в исполнительный стек и извлекают результаты из стека». И нетипизованность видна прямо в опкодах: поменяй в исходнике <code>+</code> на <code>*</code> — изменится <span class="hl">ровно один байт</span> (<code>add</code> 88 → <code>mul</code> 90=0x5A), IL станет <code>2 3 90 42</code>. Один опкод на операцию — это и есть набор инструкций CLR. Именно эти байты <code>JITCompiler</code> превратит в команды процессора при первом вызове; сам native из sandbox не прочитать, но его вход — вот он.',
      sources: ["clr-ch1"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>class C { public static int Add(int a,int b)=&gt;a+b; }</code><br/><code>var il = typeof(C).GetMethod("Add").GetMethodBody().GetILAsByteArray();</code><br/><code>Console.WriteLine(string.Join(" ", il));</code> — что напечатает (байты IL)?',
      options: ["2 3 88 42", "88 42", "0 2 3 88 42", "2 3 42"], correctIndex: 0, xp: 10,
      okText: 'Стековая программа: <code>ldarg.0</code>(2) push a, <code>ldarg.1</code>(3) push b, <code>add</code>(88=0x58) pop два & push сумму, <code>ret</code>(42=0x2A). «<span class="hl">заносят операнды в исполнительный стек и извлекают результаты из стека</span>».',
      noText: 'IL — стековый язык из 4 инструкций для <code>a+b</code>: <code>2 3 88 42</code>. Expression-bodied метод даёт чистый IL <b>без nop</b>. Это вход JIT, а не машинный код.',
      verify: { kind: "exec", run: "dotnet run", expect: "2 3 88 42" }, sourceRefs: ["clr-ch1"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class C { public static int Mul(int a,int b)=&gt;a*b; }</code><br/><code>var il = typeof(C).GetMethod("Mul").GetMethodBody().GetILAsByteArray();</code><br/><code>Console.WriteLine(string.Join(" ", il));</code> — что напечатает (сравни с Add = 2 3 88 42)?',
      options: ["2 3 90 42", "2 3 88 42", "2 3 89 42", "2 3 42 90"], correctIndex: 0, xp: 10,
      okText: 'Та же форма стековой программы — меняется <b>один опкод</b>: <code>mul</code>=90 (0x5A) вместо <code>add</code>=88 (0x58). Каждый оператор исходника ↦ своя IL-инструкция. Это и есть <span class="hl">набор инструкций CLR</span>.',
      noText: 'push a, push b, <b>операция</b>, ret. Для <code>*</code> операция — <code>mul</code> (90), а не <code>add</code> (88): <code>2 3 90 42</code>. Один байт отличается от Add — доказывает, что IL это реальный набор опкодов.',
      verify: { kind: "exec", run: "dotnet run", expect: "2 3 90 42" }, sourceRefs: ["clr-ch1"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>class C { public static int Add(int a,int b)=&gt;a+b; }</code><br/><code>var b = typeof(C).GetMethod("Add").GetMethodBody();</code><br/><code>Console.WriteLine($"maxstack={b.MaxStackSize} il={b.GetILAsByteArray().Length}");</code> — что напечатает?',
      options: ["maxstack=8 il=4", "maxstack=2 il=4", "maxstack=0 il=0", "maxstack=8 il=88"], correctIndex: 0, xp: 10,
      okText: 'У тела метода есть <b>MaxStackSize</b> — глубина стека вычислений, потому что «<span class="hl">IL является стековым языком</span>». Здесь <code>maxstack=8</code> (запас компилятора) и <code>il=4</code> байта. Метаданные метода несут размер стека, а не регистров.',
      noText: 'IL — стековая машина, поэтому у тела есть <code>MaxStackSize</code> (макс. глубина стека вычислений), а не регистры. Реальный прогон: <code>maxstack=8 il=4</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "maxstack=8 il=4" }, sourceRefs: ["clr-ch1"],
    },
  ],

  takeaways: [
    { icon: "why", k: "IL = набор инструкций CLR", v: 'Стековый, без регистров, CPU-независимый: «IL является стековым языком; это означает, что все его инструкции <span class="hl">заносят операнды в исполнительный стек и извлекают результаты из стека</span>». Один опкод на операцию (замер: <code>a+b</code> → <code>2 3 88 42</code>, <code>a*b</code> → <code>2 3 90 42</code>).' },
    { icon: "cost", k: "JIT = компиляция, не интерпретация", v: 'Первый вызов: «JITCompiler <b>проверяет и компилирует IL-код в машинные команды</b>… заменяет адрес вызываемого метода адресом блока памяти». Второй — «напрямую, без вызова JITCompiler». «Снижение производительности наблюдается только при первом вызове метода».' },
    { icon: "avoid", k: "Нетипизовано + верификация", v: 'Одна <code>add</code> на все типы («нет двух раздельных версий») определяет типы операндов в рантайме. Перед компиляцией — верификация: «анализ высокоуровневого кода IL и проверка безопасности всех операций» по метаданным модуля.' },
  ],

  foot: 'урок · <b>IL и JIT</b> · 5 анимир. разборов · стек вычислений · JIT на первом вызове · панель байты-IL(add/mul) · источник <b>Рихтер, CLR via C#, гл.1</b> · дизайн <b>mid</b>',
};
