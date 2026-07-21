/**
 * Lesson: Workstation vs Server GC + concurrent/background (CS.S7.workstation-server) — expert
 * density, 5 animated deep-dives. The CLR offers two GC flavors: Workstation GC (client apps, the
 * default for standalone apps) and Server GC (server apps needing high throughput and scalability).
 * Server GC provides a heap + a dedicated GC thread PER logical CPU, collected simultaneously;
 * Workstation GC collects on the user thread that triggered it. Concurrent (= background) GC lets
 * managed threads keep running during a collection; background replaced concurrent in .NET Fx 4+.
 * Anti-myth (MM4): Server GC is faster only "on the same size heap" and is resource-intensive — for
 * hundreds of instances the docs recommend Workstation GC with concurrent GC disabled.
 *
 * SIGNATURE machine panel (s5): a REAL flavor/latency measurement of the running process
 * (GCSettings.IsServerGC / LatencyMode). This deployment runs Server GC (isServerGC=True
 * latencyMode=Interactive) — a real config readout; a standalone client app would default to
 * Workstation. Latency mode is a real process-wide settable property (set/restore SustainedLowLatency).
 * evidence/F12/workstation-server-exec.txt.
 *
 * Accuracy contract (G7) — verified against workstation-server-gc (fetch 2026-07-19) + GT-M5-s7.md
 * (GF F25..F31, MM4).
 *   - every English quote is VERBATIM from the workstation-server-gc page it cites;
 *   - every card\'s verify.expect is the REAL stdout of run-csharp (evidence/F12/workstation-server-exec.txt:
 *     "isServerGC=True latencyMode=Interactive"; "server=True logicalCpus>=1=True"; "set=SustainedLowLatency restored=True");
 *   - NO GT-M5 myths: MM4 (Server GC is always faster / always better) — no, faster only on the same
 *     size heap, resource-intensive; workstation recommended for hundreds of instances.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S7.workstation-server/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: two flavors.
const Z_WKS: Zone = { id: "wks", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Workstation GC", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "клиентские · дефолт standalone", subCls: "vz-zsub good", subY: 47 };
const Z_SVR: Zone = { id: "svr", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Server GC", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "серверные · throughput/scalability", subCls: "vz-zsub", subY: 47 };
const FLAVOR_ZONES: Zone[] = [Z_WKS, Z_SVR];

// s2: server = heap+thread per CPU.
const Z_CPU: Zone = { id: "cpu", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "SERVER GC · heap + поток на КАЖДЫЙ логический CPU", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "heap-ы собираются одновременно · каждый = SOH + LOH", subCls: "vz-zsub", subY: 47 };
const CPU_ZONES: Zone[] = [Z_CPU];

// s3: workstation = user thread; always on 1-CPU.
const Z_USER: Zone = { id: "user", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "WKS · пользовательский поток", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "инициировавший сбор · normal priority", subCls: "vz-zsub good", subY: 47 };
const Z_ONE: Zone = { id: "one", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "1 логический CPU", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "ВСЕГДА Workstation GC", subCls: "vz-zsub good", subY: 47 };
const USER_ZONES: Zone[] = [Z_USER, Z_ONE];

// s4: concurrent / background.
const Z_CONC: Zone = { id: "conc", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "CONCURRENT (= BACKGROUND) GC", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "managed-потоки работают ВО ВРЕМЯ сбора", subCls: "vz-zsub good", subY: 47 };
const CONC_ZONES: Zone[] = [Z_CONC];

// s5 (SIGNATURE): real flavor/latency measurement.
const Z_FLAVOR: Zone = { id: "flavor", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "IsServerGC", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "флейвор процесса", subCls: "vz-zsub", subY: 47 };
const Z_LAT: Zone = { id: "lat", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "LatencyMode", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "process-wide · settable", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_FLAVOR, Z_LAT];

export const workstationServer: LessonData = {
  id: "CS.S7.workstation-server",
  track: "CS",
  section: "CS.S7",
  module: "S7.3",
  lang: "csharp",
  title: "Workstation vs Server GC, concurrent/background",
  kicker: "C# вглубь · S7 · флейворы GC",
  home: { subtitle: "два флейвора, heap на CPU, concurrent/background", icon: "gc", estMinutes: 10 },
  prereqs: ["CS.S7.gc-overview"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-wks-svr", kind: "doc", org: "Microsoft Learn", title: "Workstation vs. server garbage collection (GC)", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/workstation-server-gc", date: "2023-03-03" },
  ],

  spec: [
    { text: "«Workstation garbage collection (GC), which is designed for client apps. It\'s the default GC flavor for standalone apps.» <span class=\"ru-tr\">«Сборка мусора Workstation (GC), которая рассчитана на клиентские приложения. Это дефолтный флейвор GC для standalone-приложений.»</span> / «Server garbage collection, which is intended for server applications that need high throughput and scalability.» <span class=\"ru-tr\">«Сборка мусора Server, которая предназначена для серверных приложений, которым нужны высокая пропускная способность и масштабируемость.»</span>", source: "ms-wks-svr" },
  ],
  edgeCases: [
    { text: "Server GC (verbatim): «<span class=\"hl\">A heap and a dedicated thread to perform garbage collection are provided for each logical CPU, and the heaps are collected at the same time</span>. Each heap contains a small object heap and a large object heap, and all heaps can be accessed by user code». <span class=\"ru-tr\">«Для каждого логического CPU предоставляются heap и выделенный поток для сборки мусора, и heap-ы собираются одновременно. Каждый heap содержит small object heap и large object heap, и все heap-ы доступны из пользовательского кода».</span>", source: "ms-wks-svr" },
    { text: "Concurrent = background (verbatim): «<span class=\"hl\">Concurrent (or <i>background</i>) garbage collection enables managed threads to continue operations during a garbage collection</span>. Background garbage collection replaces concurrent garbage collection in .NET Framework 4 and later versions». <span class=\"ru-tr\">«Конкурентная (или фоновая, background) сборка мусора позволяет управляемым потокам продолжать работу во время сборки мусора. Фоновая (background) сборка мусора заменяет конкурентную сборку мусора в .NET Framework 4 и более поздних версиях».</span>", source: "ms-wks-svr" },
    { text: "На 1 CPU (verbatim): «<span class=\"hl\">Workstation garbage collection is always used on a computer that has only one logical CPU</span>, regardless of the configuration setting». <span class=\"ru-tr\">«Сборка мусора Workstation всегда используется на компьютере, у которого только один логический CPU, независимо от настройки конфигурации».</span> Независимо от конфигурации.", source: "ms-wks-svr" },
  ],

  misconceptions: [
    {
      wrong: "Server GC всегда быстрее и всегда лучше Workstation — включай его везде",
      hook: 'Миф: «<span class="wrong">Server GC всегда быстрее / всегда лучше</span>». Реальность узкая: «<span class="hl">server garbage collection is faster than workstation garbage collection <b>on the same size heap</b></span>» <span class="ru-tr">«серверная сборка мусора быстрее сборки мусора Workstation <b>на heap того же размера</b>»</span> — и только за счёт ресурсов: «Server garbage collection <span class="hl">can be resource-intensive</span>» <span class="ru-tr">«Серверная сборка мусора может быть ресурсоёмкой»</span>. Доки прямо предупреждают: «If you\'re running <b>hundreds of instances</b> of an application, consider using <span class="hl">workstation garbage collection with concurrent garbage collection disabled</span>» <span class="ru-tr">«Если вы запускаете <b>сотни экземпляров</b> приложения, рассмотрите использование сборки мусора Workstation с отключённой конкурентной сборкой мусора»</span>. Ниже <b>пять разборов</b>: два флейвора, server = heap+поток на каждый CPU, workstation = пользовательский поток (и всегда на 1-CPU), concurrent/background, и <b>машинная панель</b> — реальный флейвор и latency-режим текущего процесса.',
      source: "ms-wks-svr",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Два флейвора", title: "Workstation (клиент) и Server (высокий throughput)",
      viewBox: "0 0 340 210", zones: FLAVOR_ZONES,
      code: ["// CLR предлагает два «вкуса» GC:", "// Workstation GC — клиентские приложения (дефолт для standalone)", "// Server GC — серверные, high throughput / scalability", "// для hosted (ASP.NET) дефолт задаёт хост"],
      scenes: [
        { codeLine: 1, caption: '<b>Workstation GC</b> — для клиентских приложений; <span class="hl">дефолт для standalone</span>-приложений.', nodes: [{ id: "w", kind: "gate", at: { zone: "wks", row: 0 }, state: "ok", label: "Workstation", detail: "клиент · дефолт", accent: true }], edges: [] },
        { codeLine: 2, caption: '<b>Server GC</b> — для серверных приложений, которым нужны <span class="hl">high throughput и scalability</span>.', nodes: [{ id: "w", kind: "gate", at: { zone: "wks", row: 0 }, state: "ok", label: "Workstation", detail: "клиент" }, { id: "s", kind: "gate", at: { zone: "svr", row: 0 }, state: "ok", label: "Server", detail: "throughput", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Для hosted-приложений (напр. ASP.NET) дефолтный флейвор <span class="hl">определяет хост</span>, а не сам процесс.', nodes: [{ id: "w", kind: "gate", at: { zone: "wks", row: 0 }, state: "ok", label: "Workstation", detail: "standalone" }, { id: "s", kind: "gate", at: { zone: "svr", row: 0 }, state: "ok", label: "Server", detail: "hosted → хост решает", accent: true }], edges: [] },
      ],
      explain: 'Дословно: «The CLR provides the following types of garbage collection: … <span class="hl">Workstation garbage collection (GC), which is designed for client apps. It\'s the default GC flavor for standalone apps</span>. For hosted apps, for example, those hosted by ASP.NET, the host determines the default GC flavor. … <span class="hl">Server garbage collection, which is intended for server applications that need high throughput and scalability</span>» <span class="ru-tr">«CLR предоставляет следующие типы сборки мусора: … Сборка мусора Workstation (GC), которая рассчитана на клиентские приложения. Это дефолтный флейвор GC для standalone-приложений. Для hosted-приложений, например размещённых в ASP.NET, дефолтный флейвор GC определяет хост. … Сборка мусора Server, которая предназначена для серверных приложений, которым нужны высокая пропускная способность и масштабируемость»</span>. Итого два флейвора: <b>Workstation</b> — клиентские, дефолт для standalone; <b>Server</b> — серверные, ради пропускной способности и масштабируемости; для hosted-приложений выбор за хостом. Флейвор задаётся конфигурацией рантайма (см. runtime-config), а не переключается на лету. Дальше — чем именно они отличаются по потокам и heap-ам (разборы 02–03).',
      sources: ["ms-wks-svr"],
    },
    {
      id: "s2", num: "02", kicker: "Server · heap на CPU", title: "Server GC: heap + выделенный поток на каждый логический CPU",
      viewBox: "0 0 340 210", zones: CPU_ZONES,
      code: ["// Server GC на машине с N логическими CPU:", "// N heap-ов + N выделенных GC-потоков (THREAD_PRIORITY_HIGHEST)", "// heap-ы собираются ОДНОВРЕМЕННО; каждый = SOH + LOH"],
      scenes: [
        { codeLine: 1, caption: 'Server GC даёт <span class="hl">heap И выделенный GC-поток на КАЖДЫЙ логический CPU</span>. Потоки — высокого приоритета.', nodes: [{ id: "h", kind: "gate", at: { zone: "cpu", row: 0 }, state: "ok", label: "heap + поток / CPU", detail: "N heap-ов", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Все heap-ы собираются <span class="hl">одновременно</span> (несколько GC-потоков работают вместе) → выше throughput.', nodes: [{ id: "h", kind: "gate", at: { zone: "cpu", row: 0 }, state: "ok", label: "heaps", detail: "N × параллельно" }, { id: "p", kind: "gate", at: { zone: "cpu", row: 1 }, state: "ok", label: "одновременно", detail: "все heap-ы", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Каждый heap содержит <b>SOH + LOH</b>; все heap-ы доступны из user-кода, объекты на разных heap-ах могут ссылаться друг на друга.', nodes: [{ id: "h", kind: "gate", at: { zone: "cpu", row: 0 }, state: "ok", label: "heap", detail: "SOH + LOH" }, { id: "r", kind: "gate", at: { zone: "cpu", row: 1 }, state: "ok", label: "cross-heap refs", detail: "разрешены", accent: true }], edges: [] },
      ],
      explain: 'Дословно про Server GC: «The collection occurs on <b>multiple dedicated threads</b>. On Windows, these threads run at <code>THREAD_PRIORITY_HIGHEST</code> priority level. <span class="hl">A heap and a dedicated thread to perform garbage collection are provided for each logical CPU, and the heaps are collected at the same time</span>. Each heap contains a small object heap and a large object heap, and all heaps can be accessed by user code. Objects on different heaps can refer to each other» <span class="ru-tr">«Сборка происходит на <b>нескольких выделенных потоках</b>. В Windows эти потоки работают на уровне приоритета <code>THREAD_PRIORITY_HIGHEST</code>. Для каждого логического CPU предоставляются heap и выделенный поток для сборки мусора, и heap-ы собираются одновременно. Каждый heap содержит small object heap и large object heap, и все heap-ы доступны из пользовательского кода. Объекты на разных heap-ах могут ссылаться друг на друга»</span>. Отсюда «один heap на процесс» из S7.2 — упрощение для Workstation; при Server GC heap-ов <b>столько, сколько логических CPU</b>, и они собираются параллельно (потому throughput выше). Замером панели (разбор 05) увидим реальный флейвор процесса и число CPU.',
      sources: ["ms-wks-svr"],
    },
    {
      id: "s3", num: "03", kicker: "Workstation · user thread", title: "WKS собирает на потоке-инициаторе; на 1 CPU — всегда WKS",
      viewBox: "0 0 340 210", zones: USER_ZONES,
      code: ["// Workstation GC:", "// сбор на ПОЛЬЗОВАТЕЛЬСКОМ потоке, что его инициировал (normal priority)", "// → конкурирует с приложением за CPU", "// на машине с 1 логическим CPU — ВСЕГДА Workstation, независимо от конфига"],
      scenes: [
        { codeLine: 1, caption: 'Workstation GC собирает <span class="hl">на пользовательском потоке, инициировавшем сбор</span>, с тем же (normal) приоритетом.', nodes: [{ id: "u", kind: "gate", at: { zone: "user", row: 0 }, state: "ok", label: "user thread", detail: "инициатор", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Этот поток <span class="hl">конкурирует с приложением за CPU</span> (нет выделенных GC-потоков, как у Server).', nodes: [{ id: "u", kind: "gate", at: { zone: "user", row: 0 }, state: "ok", label: "user thread", detail: "normal priority" }, { id: "c", kind: "gate", at: { zone: "user", row: 1 }, state: "ok", label: "конкурирует", detail: "за CPU", accent: true }], edges: [] },
        { codeLine: 3, caption: 'На машине с <span class="hl">одним логическим CPU — ВСЕГДА Workstation GC</span>, независимо от настройки конфигурации.', nodes: [{ id: "u", kind: "gate", at: { zone: "user", row: 0 }, state: "ok", label: "user thread", detail: "WKS" }, { id: "o", kind: "gate", at: { zone: "one", row: 0 }, state: "ok", label: "1 CPU", detail: "форс WKS", accent: true }], edges: [] },
      ],
      explain: 'Дословно про Workstation GC: «The collection occurs <span class="hl">on the user thread that triggered the garbage collection</span> and remains at the same priority. Because user threads typically run at normal priority, the garbage collector (which runs on a normal priority thread) must compete with other threads for CPU time» <span class="ru-tr">«Сборка происходит на пользовательском потоке, инициировавшем сборку мусора, и остаётся на том же приоритете. Поскольку пользовательские потоки обычно работают на нормальном приоритете, сборщик мусора (который выполняется на потоке с нормальным приоритетом) вынужден конкурировать с другими потоками за время CPU»</span>. И жёсткое правило: «<span class="hl">Workstation garbage collection is always used on a computer that has only one logical CPU, regardless of the configuration setting</span>» <span class="ru-tr">«Сборка мусора Workstation всегда используется на компьютере, у которого только один логический CPU, независимо от настройки конфигурации»</span>. То есть на одноядерной машине включить Server GC нельзя — рантайм всё равно возьмёт Workstation. Отличие от Server (разбор 02): у WKS нет выделенных GC-потоков и нескольких heap-ов, сбор идёт на потоке приложения и конкурирует с ним за процессор.',
      sources: ["ms-wks-svr"],
    },
    {
      id: "s4", num: "04", kicker: "Concurrent / background", title: "Background GC: managed-потоки работают во время сбора",
      viewBox: "0 0 340 210", zones: CONC_ZONES,
      code: ["// concurrent (= background) GC:", "// managed-потоки ПРОДОЛЖАЮТ работу во время сбора", "// background заменил concurrent в .NET Framework 4+", "// .NET Core: server GC — non-concurrent ИЛИ background"],
      scenes: [
        { codeLine: 1, caption: 'Concurrent (он же <span class="hl">background</span>) GC позволяет managed-потокам <b>продолжать работу во время сбора</b> — меньше пауз.', nodes: [{ id: "c", kind: "gate", at: { zone: "conc", row: 0 }, state: "ok", label: "background GC", detail: "потоки работают", accent: true }], edges: [] },
        { codeLine: 2, caption: '<b>Background</b> GC <span class="hl">заменил concurrent</span> в .NET Framework 4 и позже — это эволюция того же механизма.', nodes: [{ id: "c", kind: "gate", at: { zone: "conc", row: 0 }, state: "ok", label: "background", detail: "во время сбора" }, { id: "r", kind: "gate", at: { zone: "conc", row: 1 }, state: "ok", label: "заменил concurrent", detail: ".NET Fx 4+", accent: true }], edges: [] },
        { codeLine: 3, caption: 'В .NET Core Server GC бывает <span class="hl">non-concurrent или background</span>; Workstation GC — тоже concurrent или non-concurrent.', nodes: [{ id: "c", kind: "gate", at: { zone: "conc", row: 0 }, state: "ok", label: "background", detail: "меньше пауз" }, { id: "n", kind: "gate", at: { zone: "conc", row: 1 }, state: "ok", label: "или non-concurrent", detail: "WKS и SVR", accent: true }], edges: [] },
      ],
      explain: 'Дословно: «Workstation garbage collection can be concurrent or non-concurrent. <span class="hl">Concurrent (or <i>background</i>) garbage collection enables managed threads to continue operations during a garbage collection</span>. Background garbage collection replaces concurrent garbage collection in .NET Framework 4 and later versions» <span class="ru-tr">«Сборка мусора Workstation может быть конкурентной или неконкурентной. Конкурентная (или фоновая, background) сборка мусора позволяет управляемым потокам продолжать работу во время сборки мусора. Фоновая (background) сборка мусора заменяет конкурентную сборку мусора в .NET Framework 4 и более поздних версиях»</span>. И про Server: «In .NET Core, server garbage collection can be non-concurrent or background» <span class="ru-tr">«В .NET Core серверная сборка мусора может быть неконкурентной или фоновой (background)»</span>. Смысл background/concurrent — уменьшить паузы: пока GC работает в фоне, потоки приложения не полностью остановлены (важная оговорка: «Threads that run native code are not suspended on either server or workstation garbage collection» <span class="ru-tr">«Потоки, выполняющие нативный код, не приостанавливаются ни при серверной, ни при Workstation-сборке мусора»</span>). Практика: отключение concurrent (для сотен инстансов) уменьшает context switching (разбор мифа) — то есть у режима есть и цена.',
      sources: ["ms-wks-svr"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный флейвор", title: "IsServerGC и LatencyMode текущего процесса",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["GCSettings.IsServerGC          // флейвор процесса (bool)", "GCSettings.LatencyMode         // process-wide, settable", "// этот бэкенд: isServerGC=True, latencyMode=Interactive"],
      predictAt: 1, predictQ: 'Этот процесс сконфигурирован под Server GC. Что вернут <code>GCSettings.IsServerGC</code> и дефолтный <code>GCSettings.LatencyMode</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>GCSettings.IsServerGC</code> — <span class="hl">реальный флейвор процесса</span> (bool из runtime-config). Этот бэкенд — Server GC.', nodes: [{ id: "f", kind: "gate", at: { zone: "flavor", row: 0 }, state: "ok", label: "IsServerGC", detail: "True (здесь)", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>GCSettings.LatencyMode</code> — <span class="hl">process-wide</span> настраиваемый режим; дефолт — <code>Interactive</code> (детали — S7.4).', nodes: [{ id: "f", kind: "gate", at: { zone: "flavor", row: 0 }, state: "ok", label: "IsServerGC", detail: "True" }, { id: "l", kind: "gate", at: { zone: "lat", row: 0 }, state: "ok", label: "LatencyMode", detail: "Interactive", accent: true }], edges: [] },
        { codeLine: 2, out: "isServerGC=True latencyMode=Interactive", caption: 'Панель: <b>isServerGC=True latencyMode=Interactive</b> (реальный замер этого процесса). У standalone-клиента дефолт был бы <b>Workstation</b> — флейвор зависит от конфигурации.', nodes: [{ id: "f", kind: "gate", at: { zone: "flavor", row: 0 }, state: "ok", label: "isServerGC", detail: "True" }, { id: "l", kind: "gate", at: { zone: "lat", row: 0 }, state: "ok", label: "latencyMode", detail: "Interactive", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — реальный флейвор и latency-режим <b>этого</b> процесса, снятые через <code>System.Runtime.GCSettings</code>. Замер: <code>GCSettings.IsServerGC</code> → <b>True</b> (бэкенд сконфигурирован под Server GC), <code>GCSettings.LatencyMode</code> → <b>Interactive</b> (дефолтный режим). Это честный readout конфигурации: на другой машине/конфиге <code>IsServerGC</code> вернул бы <b>False</b> (Workstation) — флейвор определяется runtime-config и хостом, а не кодом. Второй замер (в карточке) подтверждает, что <code>LatencyMode</code> — <b>process-wide settable</b> свойство: можно выставить <code>SustainedLowLatency</code> и вернуть обратно (мост к S7.4). Панель показывает не «как должно быть в теории», а что реально выбрал рантайм здесь.',
      sources: ["ms-wks-svr"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>Console.WriteLine($"isServerGC={GCSettings.IsServerGC} latencyMode={GCSettings.LatencyMode}");</code> — этот процесс сконфигурирован под Server GC. Что напечатает?',
      options: ["isServerGC=True latencyMode=Interactive", "isServerGC=False latencyMode=Interactive", "isServerGC=True latencyMode=LowLatency", "isServerGC=False latencyMode=Batch"], correctIndex: 0, xp: 10,
      okText: 'Этот бэкенд под <b>Server GC</b> → <code>IsServerGC</code> = True; дефолтный latency-режим — <span class="hl">Interactive</span>. Печать: <b>isServerGC=True latencyMode=Interactive</b>. На standalone-клиенте было бы <code>False</code> (Workstation).',
      noText: 'Флейвор — из runtime-config (здесь Server); дефолтный latency — Interactive. Реальный вывод: <b>isServerGC=True latencyMode=Interactive</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "isServerGC=True latencyMode=Interactive" }, sourceRefs: ["ms-wks-svr"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>bool server = GCSettings.IsServerGC; int cpus = Environment.ProcessorCount; Console.WriteLine($"server={server} logicalCpus&gt;=1={cpus&gt;=1}");</code> — что напечатает (Server GC даёт heap+поток на каждый логический CPU)?',
      options: ["server=True logicalCpus>=1=True", "server=False logicalCpus>=1=True", "server=True logicalCpus>=1=False", "server=False logicalCpus>=1=False"], correctIndex: 0, xp: 10,
      okText: 'Server GC даёт <span class="hl">heap + выделенный поток на каждый логический CPU</span>; процесс видит свои CPU (>=1). Печать: <b>server=True logicalCpus>=1=True</b>.',
      noText: '«A heap and a dedicated thread… for each logical CPU» <span class="ru-tr">«Heap и выделенный поток… для каждого логического CPU»</span>. Реальный вывод: <b>server=True logicalCpus>=1=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "server=True logicalCpus>=1=True" }, sourceRefs: ["ms-wks-svr"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var orig = GCSettings.LatencyMode; GCSettings.LatencyMode = GCLatencyMode.SustainedLowLatency; var now = GCSettings.LatencyMode; GCSettings.LatencyMode = orig; Console.WriteLine($"set={now} restored={GCSettings.LatencyMode==orig}");</code> — что напечатает?',
      options: ["set=SustainedLowLatency restored=True", "set=Interactive restored=True", "set=SustainedLowLatency restored=False", "(исключение)"], correctIndex: 0, xp: 10,
      okText: '<code>LatencyMode</code> — <span class="hl">process-wide settable</span> свойство: выставили <code>SustainedLowLatency</code> (работает и на WKS, и на SVR), затем вернули. Печать: <b>set=SustainedLowLatency restored=True</b>.',
      noText: 'Latency-режим настраивается на уровне процесса и читается обратно. Реальный вывод: <b>set=SustainedLowLatency restored=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "set=SustainedLowLatency restored=True" }, sourceRefs: ["ms-wks-svr"],
    },
  ],

  takeaways: [
    { icon: "why", k: "два флейвора", v: '<b>Workstation</b> — клиентские, «default GC flavor for standalone apps» <span class="ru-tr">«дефолтный флейвор GC для standalone-приложений»</span>; <b>Server</b> — «high throughput and scalability» <span class="ru-tr">«высокая пропускная способность и масштабируемость»</span>. Для hosted (ASP.NET) флейвор задаёт хост. Замер: этот процесс — <code>IsServerGC=True</code>.' },
    { icon: "cost", k: "server = heap на CPU", v: 'Server GC: «a heap and a dedicated thread… for each logical CPU» <span class="ru-tr">«heap и выделенный поток… для каждого логического CPU»</span>, собираются одновременно (throughput). WKS: сбор на пользовательском потоке, конкурирует за CPU; на <b>1 CPU — всегда Workstation</b>.' },
    { icon: "avoid", k: "не «всегда лучше»", v: 'Server быстрее лишь «on the same size heap» <span class="ru-tr">«на heap того же размера»</span> и «can be resource-intensive» <span class="ru-tr">«может быть ресурсоёмкой»</span>. Для <b>сотен инстансов</b> доки советуют Workstation + concurrent disabled (меньше context switching). Background/concurrent — managed-потоки работают во время сбора.' },
  ],

  foot: 'урок · <b>Workstation vs Server GC</b> · 5 анимир. разборов · панель реального флейвора процесса (IsServerGC/LatencyMode) · дизайн <b>mid</b>',
};
