/**
 * Lesson: GC latency modes — GCLatencyMode, LowLatency vs SustainedLowLatency (CS.S7.latency-modes)
 * — expert density, 5 animated deep-dives. To reclaim objects the GC must stop the executing
 * threads; that active period is the latency, tuned via GCSettings.LatencyMode (GCLatencyMode).
 * LowLatency suppresses gen2 (only gen0/1), short periods, WORKSTATION GC ONLY. SustainedLowLatency
 * suppresses foreground gen2 but does gen0/1 + background gen2, longer periods, WKS AND SERVER,
 * needs background GC on. Suppression is NOT absolute (low-memory OS notification OR explicit
 * GC.Collect(2) still collects). Tradeoff: larger heap + fragmentation; LatencyMode is process-wide.
 *
 * SIGNATURE machine panel (s5): a REAL constraint demonstration — on this Server GC process, setting
 * LowLatency does NOT stick (WKS-only, stays Interactive) while SustainedLowLatency does
 * (lowLatencyStuck=False sustainedStuck=True); and even under SustainedLowLatency an explicit
 * GC.Collect(2) still runs a gen2 (suppression not absolute). evidence/F12/latency-modes-exec.txt.
 *
 * Accuracy contract (G7) — verified against garbage-collection/latency (fetch 2026-07-19) +
 * GT-M5-s7.md (GF F33..F38, MM5/MM6).
 *   - every English quote is VERBATIM from the latency page it cites;
 *   - every card\'s verify.expect is the REAL stdout of run-csharp (evidence/F12/latency-modes-exec.txt:
 *     "default=Interactive"; "lowLatencyStuck=False sustainedStuck=True"; "gen2StillRanOnExplicitCollect=True");
 *   - NO GT-M5 myths: MM5 (low-latency fully disables gen2 / guarantees no pauses) — no, gen2 is only
 *     suppressed and still happens on low memory or explicit GC.Collect(2); MM6 (SustainedLowLatency
 *     is only upside) — no, larger heap + fragmentation, process-wide OOM.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S7.latency-modes/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: latency = GC stops threads; LatencyMode.
const Z_LAT: Zone = { id: "lat", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "LATENCY · GC останавливает потоки", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "период активности GC · GCSettings.LatencyMode", subCls: "vz-zsub", subY: 47 };
const LAT_ZONES: Zone[] = [Z_LAT];

// s2: LowLatency.
const Z_LOW: Zone = { id: "low", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "LowLatency", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "подавляет gen2 · gen0/1", subCls: "vz-zsub good", subY: 47 };
const Z_WKSONLY: Zone = { id: "wksonly", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ТОЛЬКО Workstation", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "короткие периоды", subCls: "vz-zsub heap", subY: 47 };
const LOW_ZONES: Zone[] = [Z_LOW, Z_WKSONLY];

// s3: SustainedLowLatency.
const Z_SUST: Zone = { id: "sust", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "SustainedLowLatency", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "foreground gen2 подавлен", subCls: "vz-zsub good", subY: 47 };
const Z_BOTH: Zone = { id: "both", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "WKS + Server", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "+ background gen2 · нужен background GC", subCls: "vz-zsub good", subY: 47 };
const SUST_ZONES: Zone[] = [Z_SUST, Z_BOTH];

// s4: suppression not absolute + tradeoff.
const Z_NOTABS: Zone = { id: "notabs", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "подавление НЕ абсолютно", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "low-memory OR GC.Collect(2)", subCls: "vz-zsub heap", subY: 47 };
const Z_TRADE: Zone = { id: "trade", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "цена", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "больший heap · фрагментация · OOM", subCls: "vz-zsub heap", subY: 47 };
const NOTABS_ZONES: Zone[] = [Z_NOTABS, Z_TRADE];

// s5 (SIGNATURE): real constraint demonstration.
const Z_STICK: Zone = { id: "stick", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "LowLatency НЕ прилип", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "WKS-only на Server GC", subCls: "vz-zsub good", subY: 47 };
const Z_STILL: Zone = { id: "still", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "gen2 всё равно", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "GC.Collect(2) сработал", subCls: "vz-zsub", subY: 47 };
const SIG_ZONES: Zone[] = [Z_STICK, Z_STILL];

export const latencyModes: LessonData = {
  id: "CS.S7.latency-modes",
  track: "CS",
  section: "CS.S7",
  module: "S7.4",
  lang: "csharp",
  title: "Latency-режимы GC: LowLatency, SustainedLowLatency",
  kicker: "C# вглубь · S7 · пауза сборщика",
  home: { subtitle: "GCLatencyMode, подавление gen2, трейдофы", icon: "gc", estMinutes: 10 },
  prereqs: ["CS.S7.workstation-server"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-latency", kind: "doc", org: "Microsoft Learn", title: "Latency Modes", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/latency", date: "2017-03-30" },
  ],

  spec: [
    { text: "«To reclaim objects, the garbage collector (GC) must stop all the executing threads in an application. The period of time during which the garbage collector is active is referred to as its latency.» <span class=\"ru-tr\">«Чтобы освободить объекты, сборщик мусора (GC) должен остановить все выполняющиеся потоки в приложении. Период времени, в течение которого сборщик мусора активен, называется его latency (задержкой).»</span>", source: "ms-latency" },
  ],
  edgeCases: [
    { text: "LowLatency (verbatim): «GCLatencyMode.LowLatency <span class=\"hl\">suppresses generation 2 collections and performs only generation 0 and 1 collections</span>. It can be used only for short periods of time. … <b>This setting is available only for workstation garbage collection</b>». <span class=\"ru-tr\">«GCLatencyMode.LowLatency подавляет сборки поколения 2 и выполняет только сборки поколений 0 и 1. Его можно использовать только на короткие промежутки времени. … <b>Эта настройка доступна только для workstation-сборки мусора</b>».</span>", source: "ms-latency" },
    { text: "SustainedLowLatency (verbatim): «GCLatencyMode.SustainedLowLatency <span class=\"hl\">suppresses foreground generation 2 collections and performs only generation 0, 1, and background generation 2 collections</span>. It can be used for longer periods of time, and is available for both workstation and server garbage collection. <b>This setting cannot be used if background garbage collection is disabled</b>». <span class=\"ru-tr\">«GCLatencyMode.SustainedLowLatency подавляет foreground-сборки поколения 2 и выполняет только сборки поколений 0, 1 и background-сборки поколения 2. Его можно использовать на более длительные промежутки времени, и он доступен и для workstation-, и для server-сборки мусора. <b>Эту настройку нельзя использовать, если фоновая сборка мусора отключена</b>».</span>", source: "ms-latency" },
    { text: "Подавление НЕ абсолютно (verbatim): «During low latency periods, generation 2 collections are suppressed <span class=\"hl\">unless</span> the following occurs: The system receives a low memory notification from the operating system. Application code induces a collection by calling the GC.Collect method and specifying 2 for the generation parameter». <span class=\"ru-tr\">«В периоды низкой задержки сборки поколения 2 подавляются, если не происходит следующее: система получает уведомление о нехватке памяти от операционной системы. Код приложения инициирует сборку, вызывая метод GC.Collect и указывая 2 в качестве параметра generation».</span>", source: "ms-latency" },
  ],

  misconceptions: [
    {
      wrong: "low-latency режим полностью отключает gen2 / гарантирует отсутствие пауз; SustainedLowLatency — только плюсы",
      hook: 'Два мифа. «<span class="wrong">low-latency полностью отключает gen2 / нет пауз</span>» — нет: gen2 лишь <b>подавляется</b>, «generation 2 collections are suppressed <span class="hl">unless</span>…» <span class="ru-tr">«сборки поколения 2 подавляются, если не…»</span> — случится при low-memory-уведомлении ОС ИЛИ явном <code>GC.Collect(…, 2)</code>. «<span class="wrong">SustainedLowLatency — только плюсы</span>» — нет: «<span class="hl">This mode results in a larger managed heap size</span> than other modes. Because it does not compact the managed heap, higher fragmentation is possible». <span class="ru-tr">«Этот режим приводит к большему размеру управляемой кучи, чем другие режимы. Поскольку он не уплотняет управляемую кучу, возможна более высокая фрагментация».</span> Плюс <code>LatencyMode</code> <b>process-wide</b> → <code>OutOfMemoryException</code> на любом аллоцирующем потоке. Ниже <b>пять разборов</b>: что такое latency, LowLatency (WKS-only), SustainedLowLatency (WKS+SVR), подавление не абсолютно + цена, и <b>машинная панель</b> — реальный замер WKS-only-ограничения.',
      source: "ms-latency",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Что такое latency", title: "Сбор останавливает потоки; период = latency",
      viewBox: "0 0 340 210", zones: LAT_ZONES,
      code: ["// чтобы освободить объекты, GC ОСТАНАВЛИВАЕТ выполняющиеся потоки", "// период активности GC = latency", "GCSettings.LatencyMode = GCLatencyMode.SustainedLowLatency;  // настройка"],
      scenes: [
        { codeLine: 0, caption: 'Чтобы освободить объекты, GC <span class="hl">должен остановить выполняющиеся потоки</span> приложения — это пауза.', nodes: [{ id: "s", kind: "gate", at: { zone: "lat", row: 0 }, state: "fail", label: "GC активен", detail: "потоки стоят", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Период, пока GC активен, называется <span class="hl">latency</span>. Full gen2 в критический момент бьёт по отзывчивости.', nodes: [{ id: "s", kind: "gate", at: { zone: "lat", row: 0 }, state: "fail", label: "GC активен", detail: "пауза" }, { id: "l", kind: "gate", at: { zone: "lat", row: 1 }, state: "ok", label: "latency", detail: "период паузы", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Регулируется свойством <span class="hl"><code>GCSettings.LatencyMode</code></span> (значения <code>GCLatencyMode</code>): просим GC быть менее навязчивым.', nodes: [{ id: "l", kind: "gate", at: { zone: "lat", row: 0 }, state: "ok", label: "GCSettings.LatencyMode", detail: "GCLatencyMode", accent: true }], edges: [] },
      ],
      explain: 'Дословно: «<span class="hl">To reclaim objects, the garbage collector (GC) must stop all the executing threads in an application. The period of time during which the garbage collector is active is referred to as its <i>latency</i></span>. In some situations, such as when an application retrieves data or displays content, a full garbage collection can occur at a critical time and impede performance. You can adjust the intrusiveness of the garbage collector by setting the <code>GCSettings.LatencyMode</code> property to one of the <code>System.Runtime.GCLatencyMode</code> values». <span class="ru-tr">«Чтобы освободить объекты, сборщик мусора (GC) должен остановить все выполняющиеся потоки в приложении. Период времени, в течение которого сборщик мусора активен, называется его <i>latency</i> (задержкой). В некоторых ситуациях, например когда приложение получает данные или отображает содержимое, полная сборка мусора может произойти в критический момент и снизить производительность. Вы можете отрегулировать навязчивость сборщика мусора, задав свойству <code>GCSettings.LatencyMode</code> одно из значений <code>System.Runtime.GCLatencyMode</code>».</span> То есть паузы GC неизбежны (он останавливает потоки), но их <b>навязчивость</b> можно настроить: low-latency-режимы делают GC консервативнее в освобождении памяти. Дефолт — <code>Interactive</code> (замер в панели). Дальше — два low-latency-режима и их ограничения (разборы 02–04).',
      sources: ["ms-latency"],
    },
    {
      id: "s2", num: "02", kicker: "LowLatency", title: "LowLatency: подавляет gen2, только Workstation GC",
      viewBox: "0 0 340 210", zones: LOW_ZONES,
      code: ["GCSettings.LatencyMode = GCLatencyMode.LowLatency;", "// подавляет gen2, делает только gen0 и gen1", "// короткие периоды; ТОЛЬКО workstation GC"],
      scenes: [
        { codeLine: 1, caption: '<code>LowLatency</code> <span class="hl">подавляет gen2-сборы</span> и делает только gen0 и gen1 — меньше дорогих пауз.', nodes: [{ id: "l", kind: "gate", at: { zone: "low", row: 0 }, state: "ok", label: "LowLatency", detail: "gen0/1, gen2 off", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Только на <span class="hl">короткие периоды</span>: на длинных под давлением памяти GC всё равно сработает и прервёт time-critical операцию.', nodes: [{ id: "l", kind: "gate", at: { zone: "low", row: 0 }, state: "ok", label: "LowLatency", detail: "коротко" }, { id: "s", kind: "gate", at: { zone: "low", row: 1 }, state: "fail", label: "долго", detail: "сборка прорвётся", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Важно: <span class="hl">ТОЛЬКО для Workstation GC</span>. На Server GC этот режим недоступен (замер — панель).', nodes: [{ id: "l", kind: "gate", at: { zone: "low", row: 0 }, state: "ok", label: "LowLatency", detail: "gen2 off" }, { id: "w", kind: "gate", at: { zone: "wksonly", row: 0 }, state: "fail", label: "Server GC", detail: "недоступно", accent: true }], edges: [] },
      ],
      explain: 'Дословно: «<code>GCLatencyMode.LowLatency</code> <span class="hl">suppresses generation 2 collections and performs only generation 0 and 1 collections</span>. It can be used only for short periods of time. Over longer periods, if the system is under memory pressure, the garbage collector will trigger a collection, which can briefly pause the application and disrupt a time-critical operation. <span class="hl">This setting is available only for workstation garbage collection</span>». <span class="ru-tr">«<code>GCLatencyMode.LowLatency</code> подавляет сборки поколения 2 и выполняет только сборки поколений 0 и 1. Его можно использовать только на короткие промежутки времени. На более длительных промежутках, если система испытывает нехватку памяти, сборщик мусора запустит сборку, которая может ненадолго приостановить приложение и нарушить критичную по времени операцию. Эта настройка доступна только для workstation-сборки мусора».</span> То есть <code>LowLatency</code> — «тихий режим» для коротких time-sensitive операций (анимация, сбор данных): gen2 подавлен, но не отменён. Два жёстких ограничения: (1) только короткие окна — иначе давление памяти всё равно вызовет сбор; (2) <b>только Workstation GC</b> — на Server GC его нельзя (это увидим замером в панели). Для Server-приложений есть <code>SustainedLowLatency</code> (разбор 03).',
      sources: ["ms-latency"],
    },
    {
      id: "s3", num: "03", kicker: "SustainedLowLatency", title: "SustainedLowLatency: WKS+Server, foreground gen2 подавлен",
      viewBox: "0 0 340 210", zones: SUST_ZONES,
      code: ["GCSettings.LatencyMode = GCLatencyMode.SustainedLowLatency;", "// подавляет FOREGROUND gen2; делает gen0, gen1 И background gen2", "// длительные периоды; WKS И Server; нужен background GC"],
      scenes: [
        { codeLine: 1, caption: '<code>SustainedLowLatency</code> подавляет <span class="hl">foreground gen2</span>, но выполняет gen0, gen1 <b>и background gen2</b> — фоновый сбор старших не блокирует.', nodes: [{ id: "s", kind: "gate", at: { zone: "sust", row: 0 }, state: "ok", label: "SustainedLowLatency", detail: "fg gen2 off, bg gen2 on", accent: true }], edges: [] },
        { codeLine: 2, caption: 'На <span class="hl">длительные периоды</span> и доступен <b>и для Workstation, и для Server GC</b> (в отличие от LowLatency).', nodes: [{ id: "s", kind: "gate", at: { zone: "sust", row: 0 }, state: "ok", label: "Sustained", detail: "долго" }, { id: "b", kind: "gate", at: { zone: "both", row: 0 }, state: "ok", label: "WKS + Server", detail: "оба флейвора", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Условие: <span class="hl">нельзя при отключённом background GC</span> — режим опирается на фоновый gen2.', nodes: [{ id: "s", kind: "gate", at: { zone: "sust", row: 0 }, state: "ok", label: "Sustained", detail: "bg gen2" }, { id: "n", kind: "gate", at: { zone: "both", row: 0 }, state: "fail", label: "background off", detail: "режим недоступен", accent: true }], edges: [] },
      ],
      explain: 'Дословно: «<code>GCLatencyMode.SustainedLowLatency</code> <span class="hl">suppresses foreground generation 2 collections and performs only generation 0, 1, and background generation 2 collections</span>. It can be used for longer periods of time, and is available for both workstation and server garbage collection. <span class="hl">This setting cannot be used if background garbage collection is disabled</span>». <span class="ru-tr">«<code>GCLatencyMode.SustainedLowLatency</code> подавляет foreground-сборки поколения 2 и выполняет только сборки поколений 0, 1 и background-сборки поколения 2. Его можно использовать на более длительные промежутки времени, и он доступен и для workstation-, и для server-сборки мусора. Эту настройку нельзя использовать, если фоновая сборка мусора отключена».</span> Отличие от <code>LowLatency</code>: (1) подавляется только <b>foreground</b> gen2, а <b>background</b> gen2 продолжает освобождать старшее поколение в фоне → можно держать режим <b>дольше</b>; (2) доступен и на <b>Server GC</b> (потому это выбор для серверных low-latency-сценариев, напр. торговые системы). Обязательное условие — включённый background/concurrent GC. Замером в панели убедимся, что на этом Server-процессе Sustained ставится, а LowLatency — нет.',
      sources: ["ms-latency"],
    },
    {
      id: "s4", num: "04", kicker: "Не абсолютно + цена", title: "gen2 всё равно случится; heap больше, фрагментация",
      viewBox: "0 0 340 210", zones: NOTABS_ZONES,
      code: ["// подавление gen2 НЕ абсолютно — сбор случится, ЕСЛИ:", "// 1) low memory notification от ОС", "// 2) явный GC.Collect(gen: 2)", "// цена: больший heap + фрагментация (не уплотняет); OOM — process-wide"],
      scenes: [
        { codeLine: 1, caption: 'Подавление gen2 <span class="hl">не абсолютно</span>: сбор всё равно произойдёт при low-memory-уведомлении ОС.', nodes: [{ id: "n", kind: "gate", at: { zone: "notabs", row: 0 }, state: "fail", label: "low memory", detail: "gen2 прорвётся", accent: true }], edges: [] },
        { codeLine: 2, caption: '…или при <span class="hl">явном <code>GC.Collect(2)</code></span>. Замер: даже под SustainedLowLatency <code>Collect(2)</code> реально запускает gen2.', nodes: [{ id: "n", kind: "gate", at: { zone: "notabs", row: 0 }, state: "fail", label: "low memory", detail: "1" }, { id: "g", kind: "gate", at: { zone: "notabs", row: 1 }, state: "fail", label: "GC.Collect(2)", detail: "gen2 идёт", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Цена SustainedLowLatency: <span class="hl">больший heap + фрагментация</span> (не уплотняет); <code>LatencyMode</code> process-wide → <b>OOM на любом потоке</b>.', nodes: [{ id: "n", kind: "gate", at: { zone: "notabs", row: 0 }, state: "fail", label: "не абсолютно", detail: "gen2 случится" }, { id: "t", kind: "gate", at: { zone: "trade", row: 0 }, state: "fail", label: "цена", detail: "heap↑ · OOM", accent: true }], edges: [] },
      ],
      explain: 'Опровержение мифов MM5/MM6. Подавление не абсолютно (verbatim): «During low latency periods, generation 2 collections are suppressed <span class="hl">unless</span> the following occurs: The system receives a low memory notification from the operating system. Application code induces a collection by calling the <code>GC.Collect</code> method and specifying 2 for the <code>generation</code> parameter». <span class="ru-tr">«В периоды низкой задержки сборки поколения 2 подавляются, если не происходит следующее: система получает уведомление о нехватке памяти от операционной системы. Код приложения инициирует сборку, вызывая метод <code>GC.Collect</code> и указывая 2 в качестве параметра <code>generation</code>».</span> Замер подтверждает: под <code>SustainedLowLatency</code> явный <code>GC.Collect(2)</code> реально поднимает <code>CollectionCount(2)</code>. Цена режима (verbatim): «This mode results in a <span class="hl">larger managed heap size</span> than other modes. Because it does not compact the managed heap, <b>higher fragmentation is possible</b>. Ensure that sufficient memory is available». <span class="ru-tr">«Этот режим приводит к большему размеру управляемой кучи, чем другие режимы. Поскольку он не уплотняет управляемую кучу, <b>возможна более высокая фрагментация</b>. Убедитесь, что доступно достаточно памяти».</span> И критично: «Because the <code>LatencyMode</code> property setting is <span class="hl">process-wide</span>, <code>OutOfMemoryException</code> exceptions can be generated on any thread that is allocating». <span class="ru-tr">«Поскольку настройка свойства <code>LatencyMode</code> действует на весь процесс, исключения <code>OutOfMemoryException</code> могут возникнуть на любом потоке, выполняющем аллокацию».</span> Вывод: low-latency — не «выключить GC», а сместить компромисс в сторону памяти.',
      sources: ["ms-latency"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальное ограничение", title: "LowLatency не прилипает на Server GC; gen2 всё равно на Collect(2)",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["// этот процесс — Server GC:", "LatencyMode = LowLatency;           // НЕ прилипнет (WKS-only) → Interactive", "LatencyMode = SustainedLowLatency;  // прилипнет (WKS+Server)", "// под Sustained: GC.Collect(2) всё равно запускает gen2"],
      predictAt: 1, predictQ: 'Процесс — Server GC. Прилипнет ли <code>LowLatency</code> (WKS-only)? А <code>SustainedLowLatency</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>LowLatency</code> — <span class="hl">workstation-only</span>. На этом Server-процессе он <b>не прилипает</b> (режим остаётся Interactive).', nodes: [{ id: "s", kind: "gate", at: { zone: "stick", row: 0 }, state: "fail", label: "LowLatency", detail: "не прилип", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>SustainedLowLatency</code> — <span class="hl">WKS и Server</span> → на этом Server-процессе <b>прилипает</b>.', nodes: [{ id: "s", kind: "gate", at: { zone: "stick", row: 0 }, state: "fail", label: "LowLatency", detail: "нет" }, { id: "b", kind: "gate", at: { zone: "still", row: 0 }, state: "ok", label: "Sustained", detail: "прилип", accent: true }], edges: [] },
        { codeLine: 3, out: "lowLatencyStuck=False sustainedStuck=True", caption: 'Панель: <b>lowLatencyStuck=False sustainedStuck=True</b> (замер 3/3) — прямое доказательство «This setting is available only for workstation garbage collection» <span class="ru-tr">«Эта настройка доступна только для workstation-сборки мусора»</span>. И <code>GC.Collect(2)</code> под Sustained всё равно даёт gen2.', nodes: [{ id: "s", kind: "gate", at: { zone: "stick", row: 0 }, state: "fail", label: "lowLatencyStuck", detail: "False" }, { id: "b", kind: "gate", at: { zone: "still", row: 0 }, state: "ok", label: "sustainedStuck", detail: "True", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — ограничение «LowLatency — только Workstation», снятое в рантайме на <b>Server GC</b>-процессе бэкенда. Замер: попытка выставить <code>GCSettings.LatencyMode = LowLatency</code> <b>не прилипает</b> (режим остаётся <code>Interactive</code>), а <code>SustainedLowLatency</code> — <b>прилипает</b>: <b>lowLatencyStuck=False sustainedStuck=True</b> (детерминированно 3/3). Это прямое исполняемое подтверждение doc-фразы «This setting is available <b>only for workstation garbage collection</b>» <span class="ru-tr">«Эта настройка доступна <b>только для workstation-сборки мусора</b>»</span> — не пересказ, а поведение рантайма. Второй замер (карточка) подтверждает не-абсолютность подавления: под <code>SustainedLowLatency</code> явный <code>GC.Collect(2)</code> поднимает <code>CollectionCount(2)</code> → <b>gen2StillRanOnExplicitCollect=True</b>. Итог: latency-режимы — это конфигурируемый компромисс, а не выключатель GC; ограничения флейвора и «unless» <span class="ru-tr">«если не»</span>-условия действуют реально.',
      sources: ["ms-latency"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>Console.WriteLine($"default={GCSettings.LatencyMode}");</code> — дефолтный latency-режим этого процесса?',
      options: ["default=Interactive", "default=Batch", "default=LowLatency", "default=SustainedLowLatency"], correctIndex: 0, xp: 10,
      okText: 'Дефолтный режим для workstation и server GC — <span class="hl">Interactive</span> («default mode for workstation and server garbage collection» <span class="ru-tr">«режим по умолчанию для workstation- и server-сборки мусора»</span>). Печать: <b>default=Interactive</b>. (Batch — при отключённом background GC.)',
      noText: 'Дефолт — Interactive (Batch только при disabled background GC). Реальный вывод: <b>default=Interactive</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "default=Interactive" }, sourceRefs: ["ms-latency"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var o = GCSettings.LatencyMode; GCSettings.LatencyMode = GCLatencyMode.LowLatency; var lowResult = GCSettings.LatencyMode; GCSettings.LatencyMode = o; GCSettings.LatencyMode = GCLatencyMode.SustainedLowLatency; var sustResult = GCSettings.LatencyMode; GCSettings.LatencyMode = o; Console.WriteLine($"lowLatencyStuck={lowResult==GCLatencyMode.LowLatency} sustainedStuck={sustResult==GCLatencyMode.SustainedLowLatency}");</code> — процесс Server GC. Что напечатает?',
      options: ["lowLatencyStuck=False sustainedStuck=True", "lowLatencyStuck=True sustainedStuck=True", "lowLatencyStuck=False sustainedStuck=False", "lowLatencyStuck=True sustainedStuck=False"], correctIndex: 0, xp: 10,
      okText: '<code>LowLatency</code> — «available <span class="hl">only for workstation</span> garbage collection» <span class="ru-tr">«доступен только для workstation-сборки мусора»</span> → на Server GC не прилипает; <code>SustainedLowLatency</code> — «for both workstation and server» <span class="ru-tr">«и для workstation, и для server»</span> → прилипает. Печать: <b>lowLatencyStuck=False sustainedStuck=True</b>.',
      noText: 'LowLatency workstation-only; SustainedLowLatency WKS+Server. Реальный вывод: <b>lowLatencyStuck=False sustainedStuck=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "lowLatencyStuck=False sustainedStuck=True" }, sourceRefs: ["ms-latency"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var o = GCSettings.LatencyMode; GCSettings.LatencyMode = GCLatencyMode.SustainedLowLatency; int g2 = GC.CollectionCount(2); GC.Collect(2); int g2b = GC.CollectionCount(2); GCSettings.LatencyMode = o; Console.WriteLine($"gen2StillRanOnExplicitCollect={g2b&gt;g2}");</code> — что напечатает?',
      options: ["gen2StillRanOnExplicitCollect=True", "gen2StillRanOnExplicitCollect=False", "0", "(исключение)"], correctIndex: 0, xp: 10,
      okText: 'Подавление gen2 <span class="hl">не абсолютно</span>: «suppressed <b>unless</b>… GC.Collect… specifying 2» <span class="ru-tr">«подавляются, <b>если не</b>… GC.Collect… с указанием 2»</span>. Явный <code>GC.Collect(2)</code> под Sustained всё равно запускает gen2. Печать: <b>gen2StillRanOnExplicitCollect=True</b>.',
      noText: 'gen2 подавлен, но не при явном <code>GC.Collect(2)</code>. Реальный вывод: <b>gen2StillRanOnExplicitCollect=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "gen2StillRanOnExplicitCollect=True" }, sourceRefs: ["ms-latency"],
    },
  ],

  takeaways: [
    { icon: "why", k: "latency = пауза GC", v: '«To reclaim objects, the garbage collector (GC) <span class="hl">must stop all the executing threads</span> in an application» <span class="ru-tr">«Чтобы освободить объекты, сборщик мусора (GC) должен остановить все выполняющиеся потоки в приложении»</span>; период = latency, регулируется <code>GCSettings.LatencyMode</code>. Дефолт — <b>Interactive</b> (замер). Режим — компромисс, а не выключатель GC.' },
    { icon: "cost", k: "два low-latency режима", v: '<b>LowLatency</b>: подавляет gen2, gen0/1, коротко, <span class="hl">только Workstation</span> (замер: не прилип на Server). <b>SustainedLowLatency</b>: foreground gen2 подавлен + background gen2, дольше, <b>WKS и Server</b>, нужен background GC.' },
    { icon: "avoid", k: "не абсолютно + цена", v: 'gen2 подавлен «<span class="hl">unless</span>» <span class="ru-tr">«если не»</span> low-memory ИЛИ <code>GC.Collect(2)</code> (замер: gen2 всё равно). Sustained → «larger managed heap size» <span class="ru-tr">«больший размер управляемой кучи»</span> + фрагментация; <code>LatencyMode</code> process-wide → <b>OOM на любом потоке</b>.' },
  ],

  foot: 'урок · <b>latency-режимы GC</b> · 5 анимир. разборов · панель реального WKS-only ограничения (замер) · дизайн <b>mid</b>',
};
