/**
 * Lesson: Статика в generic-типе (CS.S10.generic-static-members) — expert density, 5 animated
 * deep-dives. The counter-intuitive fact senior devs get wrong: a static field of a generic type
 * is NOT shared across all instantiations — each CLOSED constructed type gets its OWN copy.
 * Counter<int>.Count and Counter<string>.Count are independent; the static constructor runs ONCE
 * PER closed type; instances of the SAME closed type share their static. Grounded on the
 * generic-classes page's "closed constructed type" terminology (verbatim) + DETERMINISTIC
 * own measurements that prove the per-closed-type isolation.
 *
 * SIGNATURE machine panel (s5): Counter<int> and Counter<string> keep independent Count — three
 * bumps to int + one to string yields Count = 3 and 1. REAL run-csharp measurement (this file's
 * exec cards): c1 "1 2 1\n2 1" · c2 "1 2 1" (static ctor per closed type) · c3 "2 2" (same closed
 * type shares).
 *
 * Accuracy contract (G4/G7/G8) — verified against
 * learn.microsoft.com/.../generics/generic-classes (fetched + substring-checked 2026-07-21,
 * ms.date 2015-07-20):
 *   - the verbatim quotes are the "closed constructed type"/"open constructed type" terminology
 *     and the invariance sentence from that page;
 *   - the "static member is per closed constructed type" FACT is an OWN, DETERMINISTIC measurement
 *     (not a verbatim MS sentence on that page) — presented as such and PROVEN by the exec cards,
 *     never faked;
 *   - every card verify.expect is the REAL stdout of run-csharp (this file's exec cards): c1
 *     "1 2 1\n2 1" · c2 "1 2 1" · c3 "2 2".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S10.generic-static-members/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the misconception vs reality — one static field, but per closed type.
const Z_MYTH: Zone = { id: "myth", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "МИФ · один общий", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "Count на все List<>", subCls: "vz-zsub heap", subY: 47 };
const Z_REAL: Zone = { id: "real", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "РЕАЛЬНОСТЬ · свой", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "по закрытому типу", subCls: "vz-zsub good", subY: 47 };
const MYTH_ZONES: Zone[] = [Z_MYTH, Z_REAL];

// s2: closed constructed type = a distinct type, with its own statics.
const Z_INT: Zone = { id: "intz", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Counter<int>", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "свой Count", subCls: "vz-zsub good", subY: 47 };
const Z_STR: Zone = { id: "strz", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Counter<string>", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "свой Count", subCls: "vz-zsub", subY: 47 };
const CLOSED_ZONES: Zone[] = [Z_INT, Z_STR];

// s3: static constructor runs once PER closed type.
const Z_CTOR: Zone = { id: "ctor", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "СТАТИЧЕСКИЙ КОНСТРУКТОР · раз на КАЖДЫЙ закрытый тип", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "Marker<int> ctor ≠ Marker<string> ctor", subCls: "vz-zsub", subY: 47 };
const CTOR_ZONES: Zone[] = [Z_CTOR];

// s4: same closed type shares static across all its instances.
const Z_INSTS: Zone = { id: "insts", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "3 экземпляра Box<int>", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "a, b, c", subCls: "vz-zsub", subY: 47 };
const Z_SHARED: Zone = { id: "shared", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ОДИН Total", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "общий для Box<int>", subCls: "vz-zsub good", subY: 47 };
const SHARE_ZONES: Zone[] = [Z_INSTS, Z_SHARED];

// s5 (SIGNATURE): Counter<int> vs Counter<string> diverge — measured.
const Z_CINT: Zone = { id: "cint", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Counter<int>.Count", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "3 инкремента", subCls: "vz-zsub good", subY: 47 };
const Z_CSTR: Zone = { id: "cstr", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Counter<string>.Count", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "1 инкремент", subCls: "vz-zsub heap", subY: 47 };
const DIVERGE_ZONES: Zone[] = [Z_CINT, Z_CSTR];

export const genericStaticMembers: LessonData = {
  id: "CS.S10.generic-static-members",
  track: "CS",
  section: "CS.S10",
  module: "S10.6",
  lang: "csharp",
  title: "Статика в generic-типе: своя на каждый закрытый тип",
  kicker: "C# вглубь · S10 · static per closed type",
  home: { subtitle: "Counter<int> ≠ Counter<string>, static ctor per closed type, замер", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-gen-classes", kind: "doc", org: "Microsoft Learn", title: "Generic Classes (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/generic-classes", date: "2015-07-20" },
  ],

  spec: [
    { text: "«client code can reference the class either by specifying a type argument - to create a closed constructed type (Node<int>); or by leaving the type parameter unspecified - for example when you specify a generic base class, to create an open constructed type (Node<T>).» <span class=\"ru-tr\">«клиентский код может ссылаться на класс либо указав аргумент типа — чтобы создать закрытый сконструированный тип (Node<int>); либо оставив параметр типа неуказанным — например, когда вы указываете обобщённый базовый класс, — чтобы создать открытый сконструированный тип (Node<T>).»</span>", source: "ms-gen-classes" },
  ],
  edgeCases: [
    { text: "Каждый <b>закрытый</b> тип — отдельный: «to create a <span class=\"hl\">closed constructed type</span> (<code>Node&lt;int&gt;</code>)» <span class=\"ru-tr\">«чтобы создать закрытый сконструированный тип (<code>Node&lt;int&gt;</code>)»</span>. Его статика независима от <code>Node&lt;string&gt;</code> — собственный прогон: <code>Counter&lt;int&gt;.Count</code>=2, <code>Counter&lt;string&gt;.Count</code>=1.", source: "ms-gen-classes" },
    { text: "Статический конструктор выполняется <b>один раз на каждый закрытый тип</b> — не один раз на определение. Собственный прогон: <code>Marker&lt;int&gt;</code> и <code>Marker&lt;string&gt;</code> получают разные <code>Id</code> (1 и 2).", source: "ms-gen-classes" },
    { text: "Инвариантность закрытых типов: «Generic classes are <span class=\"hl\">invariant</span>. In other words, if an input parameter specifies a <code>List&lt;BaseClass&gt;</code>, you will get a compile-time error if you try to provide a <code>List&lt;DerivedClass&gt;</code>» <span class=\"ru-tr\">«Обобщённые классы инвариантны. Иными словами, если входной параметр задаёт <code>List&lt;BaseClass&gt;</code>, вы получите ошибку компиляции при попытке передать <code>List&lt;DerivedClass&gt;</code>»</span>.", source: "ms-gen-classes" },
  ],

  misconceptions: [
    {
      wrong: "static-поле generic-класса общее для ВСЕХ инстанциаций: Counter<int>.Count и Counter<string>.Count — один счётчик",
      hook: 'Нет — <b>каждый закрытый тип</b> получает свою копию статики. Почему: <code>Counter&lt;int&gt;</code> и <code>Counter&lt;string&gt;</code> — <span class="hl">разные типы</span> (это «a <b>closed constructed type</b> (<code>Node&lt;int&gt;</code>)» <span class="ru-tr">«<b>закрытый сконструированный тип</b> (<code>Node&lt;int&gt;</code>)»</span> из определения), а у разных типов — своя static-область. Так что <code>Counter&lt;int&gt;.Count</code> и <code>Counter&lt;string&gt;.Count</code> живут <b>независимо</b>, и статический конструктор выполняется <b>по одному разу на каждый</b> закрытый тип. Это прямое следствие реификации из первого урока секции: раз типы разные в рантайме, разной будет и их статика. Дальше <b>пять разборов</b>: миф vs реальность, закрытый тип как отдельный, static-ctor per closed type, общий static внутри одного закрытого типа, и <b>машинная панель</b> — <code>Counter&lt;int&gt;</code> и <code>Counter&lt;string&gt;</code> расходятся (реальный прогон: 2 и 1).',
      source: "ms-gen-classes",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Миф vs реальность", title: "Static generic-типа — не общий, а по закрытому типу",
      viewBox: "0 0 340 210", zones: MYTH_ZONES,
      code: ["class Counter<T> { public static int Count; }", "Counter<int>.Count++;      // трогает Count для Counter<int>", "Counter<string>.Count;     // ДРУГОЙ Count, свой у Counter<string>"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Интуиция подсказывает: «<code>static int Count</code> — <b>один</b> на всё определение <code>Counter&lt;T&gt;</code>». Это <span class="hl">миф</span>.', nodes: [{ id: "m", kind: "gate", at: { zone: "myth", row: 0 }, state: "fail", label: "один Count", detail: "на все <T>", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Counter&lt;int&gt;</code> — <b>отдельный закрытый тип</b>. Его <code>Count</code> — <span class="hl">своя</span> static-ячейка, не общая.', nodes: [{ id: "m", kind: "gate", at: { zone: "myth", row: 0 }, state: "fail", label: "один Count", detail: "на все <T>" }, { id: "r", kind: "gate", at: { zone: "real", row: 0 }, state: "ok", label: "Counter<int>.Count", detail: "свой", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>Counter&lt;string&gt;.Count</code> — <b>ещё одна</b>, независимая ячейка. Столько статик, сколько разных закрытых типов.', nodes: [{ id: "r", kind: "gate", at: { zone: "real", row: 0 }, state: "ok", label: "Counter<int>.Count", detail: "свой" }, { id: "r2", kind: "gate", at: { zone: "real", row: 1 }, state: "ok", label: "Counter<string>.Count", detail: "свой", accent: true }], edges: [] },
      ],
      explain: 'Ключевой факт: static-член generic-типа принадлежит <b>закрытому</b> типу, а не определению. Причина в терминологии: клиентский код «can reference the class either by specifying a type argument - to create a <span class="hl">closed constructed type</span> (<code>Node&lt;int&gt;</code>)» <span class="ru-tr">«может ссылаться на класс, указав аргумент типа, — чтобы создать закрытый сконструированный тип (<code>Node&lt;int&gt;</code>)»</span>. <code>Counter&lt;int&gt;</code> и <code>Counter&lt;string&gt;</code> — два <b>разных</b> закрытых типа, а у каждого типа своя область статики. Это логично вытекает из реификации (первый урок секции): типы различимы в рантайме → различима и их static-память. Собственный детерминированный прогон подтверждает: инкременты <code>Counter&lt;int&gt;.Count</code> не видны в <code>Counter&lt;string&gt;.Count</code>. Практический вывод: обобщённый static — удобный способ иметь <b>по счётчику/кэшу на тип</b> (частый приём в <code>Cache&lt;T&gt;</code>-хелперах).',
      sources: ["ms-gen-classes"],
    },
    {
      id: "s2", num: "02", kicker: "Закрытый тип = отдельный", title: "Counter<int> и Counter<string> — разные типы, разная статика",
      viewBox: "0 0 340 210", zones: CLOSED_ZONES,
      code: ["Counter<int>.Bump(); Counter<int>.Bump(); Counter<int>.Bump();  // int: 3 раза", "Counter<string>.Bump();                                          // string: 1 раз", "// Counter<int>.Count == 3, Counter<string>.Count == 1"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Три вызова <code>Counter&lt;int&gt;.Bump()</code> инкрементируют <b>только</b> <code>int</code>-счётчик. Строковый счётчик <span class="hl">не трогается</span>.', nodes: [{ id: "i", kind: "gate", at: { zone: "intz", row: 0 }, state: "ok", label: "Counter<int>", detail: "Count → 3", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Один <code>Counter&lt;string&gt;.Bump()</code> — свой, независимый счётчик. Начинает с нуля, не с трёх.', nodes: [{ id: "i", kind: "gate", at: { zone: "intz", row: 0 }, state: "ok", label: "Counter<int>", detail: "Count → 3" }, { id: "s", kind: "gate", at: { zone: "strz", row: 0 }, state: "ok", label: "Counter<string>", detail: "Count → 1", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Итог: <code>Counter&lt;int&gt;.Count == 3</code>, <code>Counter&lt;string&gt;.Count == 1</code> — <span class="hl">две</span> независимые static-ячейки под одним определением.', nodes: [{ id: "i", kind: "gate", at: { zone: "intz", row: 0 }, state: "ok", label: "int.Count", detail: "3" }, { id: "s", kind: "gate", at: { zone: "strz", row: 0 }, state: "ok", label: "string.Count", detail: "1", accent: true }], edges: [] },
      ],
      explain: 'Здесь мы подтверждаем изоляцию статики через раздельные счётчики. <code>Counter&lt;int&gt;</code> и <code>Counter&lt;string&gt;</code> — это два «closed constructed type» <span class="ru-tr">«закрытый сконструированный тип»</span> из определения, поэтому у каждого своя <code>static int Count</code>. Три <code>Bump()</code> на <code>int</code> и один на <code>string</code> дают <code>3</code> и <code>1</code>, а не <code>4</code> в общем счётчике. Это тот же принцип, что делает <code>typeof(Counter&lt;int&gt;) != typeof(Counter&lt;string&gt;)</code>: раздельные типы → раздельная статика. Важное для отладки следствие: если ты завёл <code>static</code>-поле в generic-классе, помни, что оно <b>размножается</b> по числу реально использованных закрытых типов — это и фича (кэш на тип), и ловушка (неожиданно раздельное состояние).',
      sources: ["ms-gen-classes"],
    },
    {
      id: "s3", num: "03", kicker: "Static ctor · per closed type", title: "Статический конструктор — раз на каждый закрытый тип",
      viewBox: "0 0 340 210", zones: CTOR_ZONES,
      code: ["class Marker<T> { public static readonly int Id; static Marker() => Id = ++Global.N; }", "var a = Marker<int>.Id;    var b = Marker<string>.Id;", "// static ctor выполнился ДВАЖДЫ: для Marker<int> и Marker<string> отдельно"],
      predictAt: 1, predictQ: 'Static-ctor присваивает <code>Id = ++Global.N</code>. Что даст <code>Marker&lt;int&gt;.Id</code> и <code>Marker&lt;string&gt;.Id</code>, если оба закрытых типа используются?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'У <code>Marker&lt;T&gt;</code> — статический конструктор, присваивающий <code>Id</code> из глобального счётчика при <span class="hl">первом обращении</span> к типу.', nodes: [{ id: "c", kind: "obj", at: { zone: "ctor", row: 0 }, typeTag: "static Marker()", value: "Id = ++N", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Обращение к <code>Marker&lt;int&gt;</code> запускает ctor <b>для int</b> → <code>Id=1</code>. Обращение к <code>Marker&lt;string&gt;</code> — <span class="hl">отдельный</span> ctor → <code>Id=2</code>.', nodes: [{ id: "c", kind: "obj", at: { zone: "ctor", row: 0 }, typeTag: "static Marker()", value: "Id = ++N" }, { id: "i", kind: "gate", at: { zone: "ctor", row: 1, col: 0 }, state: "ok", label: "Marker<int>", detail: "Id=1", accent: true }, { id: "s", kind: "gate", at: { zone: "ctor", row: 1, col: 1 }, state: "ok", label: "Marker<string>", detail: "Id=2" }], edges: [] },
        { codeLine: 2, out: "1 2 1", caption: 'Панель: <span class="hl">1 2 1</span> (реальный прогон) — <code>Marker&lt;int&gt;.Id</code>=1, <code>Marker&lt;string&gt;.Id</code>=2, повторное обращение к int — тот же 1 (ctor не перезапускается).', nodes: [{ id: "i", kind: "gate", at: { zone: "ctor", row: 0, col: 0 }, state: "ok", label: "int.Id", detail: "1" }, { id: "s", kind: "gate", at: { zone: "ctor", row: 0, col: 1 }, state: "ok", label: "string.Id", detail: "2", accent: true }], edges: [] },
      ],
      explain: 'Раз у каждого закрытого типа своя статика, то и <b>статический конструктор</b> выполняется отдельно для каждого — по одному разу на закрытый тип, при первом обращении к нему. <code>Marker&lt;int&gt;</code> и <code>Marker&lt;string&gt;</code> инициализируют свои <code>Id</code> независимо: собственный прогон даёт <code>Marker&lt;int&gt;.Id=1</code> и <code>Marker&lt;string&gt;.Id=2</code> (глобальный счётчик увеличился дважды). Повторное обращение к <code>Marker&lt;int&gt;</code> уже <b>не</b> запускает ctor — гарантия «один раз» действует в пределах закрытого типа, и <code>Id</code> остаётся <code>1</code>. Это делает generic static-ctor удобным для <b>ленивой инициализации на тип</b> (например, компиляция делегата-конвертера для <code>T</code> при первом использовании) — каждый <code>T</code> платит за инициализацию ровно раз.',
      sources: ["ms-gen-classes"],
    },
    {
      id: "s4", num: "04", kicker: "Внутри одного закрытого типа · общий", title: "Все экземпляры Box<int> делят один Total",
      viewBox: "0 0 340 210", zones: SHARE_ZONES,
      code: ["class Box<T> { public static int Total; public void Inc() => Total++; }", "var a = new Box<int>(); var b = new Box<int>(); var c = new Box<string>();", "a.Inc(); b.Inc(); c.Inc(); c.Inc();   // Box<int>.Total=2, Box<string>.Total=2"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Три экземпляра: два <code>Box&lt;int&gt;</code> (<code>a</code>, <code>b</code>) и один <code>Box&lt;string&gt;</code> (<code>c</code>). Static <b>не</b> per-instance.', nodes: [{ id: "in", kind: "obj", at: { zone: "insts", row: 0 }, typeTag: "a, b : Box<int>", value: "2 экз.", accent: true }, { id: "c", kind: "obj", at: { zone: "insts", row: 1 }, typeTag: "c : Box<string>", value: "1 экз." }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>a.Inc()</code> и <code>b.Inc()</code> трогают <span class="hl">один и тот же</span> <code>Box&lt;int&gt;.Total</code> — экземпляры одного закрытого типа делят статику. Итог <code>Total=2</code>.', nodes: [{ id: "in", kind: "obj", at: { zone: "insts", row: 0 }, typeTag: "a, b : Box<int>", value: "2 экз." }, { id: "sh", kind: "gate", at: { zone: "shared", row: 0 }, state: "ok", label: "Box<int>.Total", detail: "2 (a+b)", accent: true }], edges: [{ id: "e", from: "in", to: "sh", accent: true }] },
        { codeLine: 2, out: "2 2", caption: 'Панель: <span class="hl">2 2</span> (реальный прогон) — <code>Box&lt;int&gt;.Total=2</code> (a+b), <code>Box&lt;string&gt;.Total=2</code> (c дважды). Общий в пределах закрытого типа, раздельный между типами.', nodes: [{ id: "sh", kind: "gate", at: { zone: "shared", row: 0 }, state: "ok", label: "Box<int>", detail: "2" }, { id: "sh2", kind: "gate", at: { zone: "shared", row: 1 }, state: "ok", label: "Box<string>", detail: "2", accent: true }], edges: [] },
      ],
      explain: 'Полная картина: static-поле <b>общее для всех экземпляров одного закрытого типа</b>, но <b>раздельное между разными закрытыми типами</b>. Два экземпляра <code>Box&lt;int&gt;</code> (<code>a</code> и <code>b</code>) делят один <code>Box&lt;int&gt;.Total</code>: <code>a.Inc()</code> + <code>b.Inc()</code> дают <code>2</code>. Экземпляр <code>Box&lt;string&gt;</code> (<code>c</code>), инкрементированный дважды, наполняет <b>свой</b> <code>Box&lt;string&gt;.Total</code> до <code>2</code>. Собственный прогон печатает <code>2 2</code>. Это классическая семантика static — «одно на тип» — просто «тип» здесь означает <b>закрытый</b> тип. Отсюда практика: обобщённое static-поле = per-<code>T</code>-синглтон; если нужен один экземпляр на всё определение (а не на каждый <code>T</code>), выноси поле в необобщённый статический класс-компаньон.',
      sources: ["ms-gen-classes"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · счётчики расходятся", title: "Counter<int>.Count и Counter<string>.Count независимы",
      viewBox: "0 0 340 210", zones: DIVERGE_ZONES,
      code: ["class Counter<T> { public static int Count; public static int Bump() => ++Count; }", "Counter<int>.Bump(); Counter<int>.Bump(); Counter<int>.Bump();  // int × 3", "Counter<string>.Bump();                                          // string × 1", "Console.WriteLine($\"{Counter<int>.Count} {Counter<string>.Count}\");"],
      predictAt: 2, predictQ: '<code>Counter&lt;int&gt;.Bump()</code> вызван 3 раза, <code>Counter&lt;string&gt;.Bump()</code> — 1 раз. Что напечатает <code>$"{Counter&lt;int&gt;.Count} {Counter&lt;string&gt;.Count}"</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Три <code>Bump()</code> на <code>Counter&lt;int&gt;</code>: его <code>Count</code> растёт до <b>3</b>. Это <span class="hl">изолированная</span> ячейка int-типа.', nodes: [{ id: "i", kind: "gate", at: { zone: "cint", row: 0 }, state: "ok", label: "Counter<int>.Count", detail: "3", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Один <code>Bump()</code> на <code>Counter&lt;string&gt;</code>: его <code>Count</code> = <b>1</b>, независимо от int. Не 4, не 3+1 в общем счётчике.', nodes: [{ id: "i", kind: "gate", at: { zone: "cint", row: 0 }, state: "ok", label: "Counter<int>.Count", detail: "3" }, { id: "s", kind: "gate", at: { zone: "cstr", row: 0 }, state: "ok", label: "Counter<string>.Count", detail: "1", accent: true }], edges: [] },
        { codeLine: 3, out: "3 1", caption: 'Панель: <span class="hl">3 1</span> (реальный прогон) — <code>Counter&lt;int&gt;.Count</code>=3 (три Bump), <code>Counter&lt;string&gt;.Count</code>=1 (один Bump). Счётчики строго <b>раздельны</b>.', nodes: [{ id: "i", kind: "gate", at: { zone: "cint", row: 0 }, state: "ok", label: "int", detail: "свой Count" }, { id: "s", kind: "gate", at: { zone: "cstr", row: 0 }, state: "ok", label: "string", detail: "свой Count", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — расхождение static-счётчиков, снятое прогоном. <code>Counter&lt;int&gt;</code> и <code>Counter&lt;string&gt;</code> — разные закрытые типы, поэтому <code>Count</code> у каждого свой. Три <code>Bump()</code> на <code>Counter&lt;int&gt;</code> и один на <code>Counter&lt;string&gt;</code>, затем <code>WriteLine</code> читает оба <code>Count</code> — реальный вывод сниппета <code>3 1</code>: <b>раздельные</b> ячейки, ни разу не смешавшиеся (не 4 в общем счётчике). Общий вывод: static generic-типа = «одно на <b>закрытый</b> тип». Это надёжный, детерминированный способ держать состояние per-<code>T</code>; но если ждёшь единый счётчик на все <code>T</code> — получишь сюрприз, потому что реификация делает каждый <code>Counter&lt;T&gt;</code> отдельным типом со своей статикой.',
      sources: ["ms-gen-classes"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Counter&lt;T&gt; { public static int Count; public static int Bump() =&gt; ++Count; } Console.WriteLine($"{Counter&lt;int&gt;.Bump()} {Counter&lt;int&gt;.Bump()} {Counter&lt;string&gt;.Bump()}"); Console.WriteLine($"{Counter&lt;int&gt;.Count} {Counter&lt;string&gt;.Count}");</code> — обе строки?',
      options: ["1 2 1\\n2 1", "1 2 3\\n2 1", "1 2 1\\n3 1", "1 2 3\\n3 3"], correctIndex: 0, xp: 10,
      okText: 'Каждый закрытый тип — свой <code>Count</code>. <code>int</code>-<code>Bump</code> дважды → 1,2; <code>string</code>-<code>Bump</code> раз → 1. Итог: <code>Counter&lt;int&gt;.Count</code>=<b>2</b>, <code>Counter&lt;string&gt;.Count</code>=<span class="hl">1</span>. Вывод: <b>1 2 1 / 2 1</b>.',
      noText: '<code>Counter&lt;int&gt;</code> и <code>Counter&lt;string&gt;</code> — разные закрытые типы, статика раздельна. Реальный вывод: <b>1 2 1</b>, затем <b>2 1</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "1 2 1\n2 1" }, sourceRefs: ["ms-gen-classes"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Marker&lt;T&gt; { public static readonly int Id; public static int Inits; static Marker(){ Id = ++GlobalCtorCount.N; Inits++; } } static class GlobalCtorCount { public static int N; } var _ = Marker&lt;int&gt;.Id; var __ = Marker&lt;string&gt;.Id; var ___ = Marker&lt;int&gt;.Id; Console.WriteLine($"{Marker&lt;int&gt;.Id} {Marker&lt;string&gt;.Id} {Marker&lt;int&gt;.Inits}");</code> — что напечатает?',
      options: ["1 2 1", "1 1 1", "1 2 2", "2 1 1"], correctIndex: 0, xp: 10,
      okText: 'Static-ctor выполняется <b>раз на каждый закрытый тип</b>: <code>Marker&lt;int&gt;.Id</code>=1, <code>Marker&lt;string&gt;.Id</code>=2. Повторное обращение к int ctor не запускает → <code>Inits</code>=<span class="hl">1</span>. Вывод: <b>1 2 1</b>.',
      noText: 'Каждый закрытый тип инициализируется отдельно и один раз. int получил Id=1, string Id=2, а int-ctor выполнился ровно 1 раз (Inits=1). Реальный вывод: <b>1 2 1</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "1 2 1" }, sourceRefs: ["ms-gen-classes"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Box&lt;T&gt; { public static int Total; public void Inc() =&gt; Total++; } var a = new Box&lt;int&gt;(); var b = new Box&lt;int&gt;(); var c = new Box&lt;string&gt;(); a.Inc(); b.Inc(); c.Inc(); c.Inc(); Console.WriteLine($"{Box&lt;int&gt;.Total} {Box&lt;string&gt;.Total}");</code> — что напечатает?',
      options: ["2 2", "4 0", "1 2", "2 0"], correctIndex: 0, xp: 10,
      okText: 'Экземпляры <b>одного</b> закрытого типа делят static: <code>a</code>+<code>b</code> (оба <code>Box&lt;int&gt;</code>) → <code>Total</code>=2; <code>c</code> дважды (<code>Box&lt;string&gt;</code>) → <code>Total</code>=<span class="hl">2</span>. Между типами — раздельно. Вывод: <b>2 2</b>.',
      noText: 'Static «одно на закрытый тип»: общее среди экземпляров <code>Box&lt;int&gt;</code>, отдельное у <code>Box&lt;string&gt;</code>. a+b=2, c×2=2. Реальный вывод: <b>2 2</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "2 2" }, sourceRefs: ["ms-gen-classes"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Static per closed type", v: 'Static-поле generic-типа принадлежит <b>закрытому</b> типу («a <span class="hl">closed constructed type</span> (<code>Node&lt;int&gt;</code>)» <span class="ru-tr">«<b>закрытый сконструированный тип</b> (<code>Node&lt;int&gt;</code>)»</span>), не определению. <code>Counter&lt;int&gt;.Count</code> и <code>Counter&lt;string&gt;.Count</code> независимы (замер: 2 и 1).' },
    { icon: "cost", k: "Static ctor раз на тип", v: 'Статический конструктор выполняется <b>по одному разу на каждый закрытый тип</b> при первом обращении. <code>Marker&lt;int&gt;.Id</code>=1, <code>Marker&lt;string&gt;.Id</code>=2 (замер: 1 2 1). Удобно для ленивой инициализации per-<code>T</code>.' },
    { icon: "avoid", k: "Общий внутри типа", v: 'Все экземпляры <b>одного</b> закрытого типа делят static (замер: <code>Box&lt;int&gt;.Total</code>=2 от a+b). Нужен один счётчик на ВСЕ <code>T</code> → выноси в необобщённый static-компаньон, иначе получишь per-<code>T</code>-состояние.' },
  ],

  foot: 'урок · <b>статика в generic-типе</b> · 5 анимир. разборов · per closed type · панель Counter<int> ≠ Counter<string> · дизайн <b>mid</b>',
};
