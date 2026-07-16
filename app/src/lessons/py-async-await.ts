/**
 * Lesson: async/await (PY.M11.async-await) — the event loop juggles tasks on ONE
 * thread, calling an async def builds a coroutine object without running the body
 * (the never-awaited RuntimeWarning is shown as a FRAME — it lives in stderr, so
 * it is never part of a card's expect, RS-03), await is a control-transfer point
 * (not a thread), gather starts awaitables concurrently and keeps ARGUMENT order
 * in results, a coroutine is driven by the generator protocol (send/StopIteration,
 * cr_frame mirrors gi_frame — bridge to PY.M6), the GIL is a lock token passed
 * between threads (RS-02 B-1), and a blocking call inside the loop freezes ALL
 * tasks (time.sleep vs asyncio.sleep).
 *
 * Accuracy contract (G2/G2a):
 *   - every English quote is VERBATIM from the RS-02 source bank (PEP 492,
 *     asyncio-task, glossary GIL/coroutine, free-threading HOWTO); all passages
 *     re-fetch-verified against the live pages on 2026-07-16;
 *   - every card's `verify.expect` is the REAL stdout of python3.12 (3.12.13),
 *     run twice as a file — see evidence/py-cards/census-log.txt (card c1's
 *     RuntimeWarning goes to stderr BY DESIGN and is annotated there);
 *   - all console outputs and ordering facts come from executed spikes:
 *     evidence/spikes/f11_{coroutine_obj,send_frame,blocking_loop,async_sleep,
 *     gather_order,gather_done_order,await_sequential}_out.txt (each run x2);
 *   - NO timing/speedup numbers are claimed anywhere (critic's c24 ban): only
 *     deterministic print ORDER proves overlap/no-overlap.
 *
 * Loop: cards c1..c4 map to backend review items `PY.M11.async-await/c{1..4}`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// s1: the loop band (one thread) over the network band (waiting I/O).
const Z_LOOP: Zone = { id: "loop", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "EVENT LOOP · ОДИН ПОТОК", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_NET: Zone = { id: "net", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone heap", label: "СЕТЬ · I/O В ПОЛЁТЕ", labelCls: "vz-zlabel heap", lx: 170, ly: 148 };
const LOOP_ZONES: Zone[] = [Z_LOOP, Z_NET];

// s2: calling code on the left, the coroutine object on the right (M6 s1 mirror).
const Z_CALL: Zone = { id: "callz", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ВЫЗЫВАЮЩИЙ КОД", labelCls: "vz-zlabel", lx: 83, ly: 24 };
const Z_CORO: Zone = { id: "coro", x: 14 + 174, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "КОРУТИНА", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "объект в куче", subCls: "vz-zsub heap", subY: 47 };
const CORO_ZONES: Zone[] = [Z_CALL, Z_CORO];

// s3: the suspended coroutine over the loop that keeps the thread busy.
const Z_SUSP: Zone = { id: "susp", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "КОРУТИНА · НА AWAIT", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_BUSY: Zone = { id: "busy", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "EVENT LOOP · ПОТОК ЗАНЯТ", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const AWAIT_ZONES: Zone[] = [Z_SUSP, Z_BUSY];

// s4: consecutive awaits (no overlap) over gather (all in flight at once).
const Z_SEQ: Zone = { id: "seq", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "AWAIT ПОДРЯД · ПО ОЧЕРЕДИ", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_GAT: Zone = { id: "gat", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "GATHER · В ПОЛЁТЕ РАЗОМ", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const GATHER_ZONES: Zone[] = [Z_SEQ, Z_GAT];

// s5: the coroutine next to an X-RAY of its frame (M6 s2 gi_frame mirror).
const Z_C5: Zone = { id: "kin", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "КОРУТИНА", labelCls: "vz-zlabel heap", lx: 83, ly: 24 };
const Z_XRAY: Zone = { id: "xray", x: 14 + 174, y: 34, w: 138, h: 168, cls: "vz-zone xray", label: "РЕНТГЕН · cr_frame", labelCls: "vz-zlabel xray", lx: 257, ly: 24, sub: "кадр — как у генератора", subCls: "vz-zsub", subY: 47 };
const KIN_ZONES: Zone[] = [Z_C5, Z_XRAY];

// s6: two OS threads; the GIL token travels between the bands.
const Z_TH1: Zone = { id: "th1", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "ПОТОК 1", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_TH2: Zone = { id: "th2", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone heap", label: "ПОТОК 2", labelCls: "vz-zlabel heap", lx: 170, ly: 148 };
const GIL_ZONES: Zone[] = [Z_TH1, Z_TH2];

// s7: the blocked coroutine over the rest of the loop's queue.
const Z_BLK: Zone = { id: "blk", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "КОРУТИНА blocker", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_REST: Zone = { id: "rest", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "ОСТАЛЬНОЙ ЛУП · задача other", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const BLOCK_ZONES: Zone[] = [Z_BLK, Z_REST];

export const pyAsyncAwait: LessonData = {
  id: "PY.M11.async-await",
  track: "PY",
  lang: "python",
  module: "M11.1",
  title: "async/await: один поток, который не ждёт",
  kicker: "Python · асинхронность · механизм",
  home: { subtitle: "Event loop, корутина-объект, gather, GIL", icon: "async", estMinutes: 10 },
  prereqs: ["PY.M6.generators"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "pep-492", kind: "pep", org: "peps.python.org", title: "PEP 492 — Coroutines with async and await syntax", url: "https://peps.python.org/pep-0492/", date: "2026-07-16" },
    { id: "py-asyncio-task", kind: "doc", org: "docs.python.org", title: "asyncio · Coroutines and Tasks", url: "https://docs.python.org/3/library/asyncio-task.html", date: "2026-07-16" },
    { id: "py-gloss-gil", kind: "doc", org: "docs.python.org", title: "Glossary · global interpreter lock", url: "https://docs.python.org/3/glossary.html#term-global-interpreter-lock", date: "2026-07-16" },
    { id: "py-gloss-coro", kind: "doc", org: "docs.python.org", title: "Glossary · coroutine", url: "https://docs.python.org/3/glossary.html#term-coroutine", date: "2026-07-16" },
    { id: "py-free-threading", kind: "doc", org: "docs.python.org", title: "HOWTO · Python support for free threading", url: "https://docs.python.org/3/howto/free-threading-python.html", date: "2026-07-16" },
  ],

  spec: [
    { text: "«await, similarly to yield from, suspends execution of read_data coroutine until db.fetch awaitable completes and returns the result data.» (пример из PEP 492: read_data ждёт db.fetch)", source: "pep-492" },
  ],
  edgeCases: [
    { text: "Корутина, которую никто не await-нул, при смерти пишет в <b>stderr</b>: <code>RuntimeWarning: coroutine 'fetch' was never awaited</code> (реальный лог спайка) — главный симптом забытого <code>await</code> в CI.", source: "py-asyncio-task" },
    { text: "Порядок результатов <code>gather</code> — гарантия: «The order of result values corresponds to the order of awaitables in aws.» Кто завершился первым — на список не влияет.", source: "py-asyncio-task" },
    { text: "GIL отпускается на ожидании: «the GIL is always released when doing I/O.» Потоки для I/O работают; упирается в замок только CPU-счёт.", source: "py-gloss-gil" },
  ],

  misconceptions: [
    {
      wrong: "await — это «подожди здесь», можно писать в любой функции",
      hook: 'Собес-вопрос из конспекта: <code>def get_users()</code>, внутри <code>async with</code> и <code>await</code> — «объясни, почему не работает, и почини». Багов два. Первый: «It is a <code>SyntaxError</code> to use <code>await</code> outside of an <code>async def</code> function» (PEP 492 дословно). Второй тоньше: даже после замены на <code>async def</code> вызов вернёт <span class="wrong">coroutine-объект, а не результат</span> — «Note that simply calling a coroutine will not schedule it to be executed». И всё это — <b>один поток</b>. Ниже семь разборов: от диспетчера до замка GIL.',
      source: "pep-492",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Event loop · диспетчер", title: "Один поток жонглирует задачами",
      viewBox: "0 0 340 260", zones: LOOP_ZONES,
      code: ["async def fetch(uid):", "    r = await client.get(f\"/u/{uid}\")", "    return r.json()"],
      scenes: [
        {
          codeLine: 0,
          caption: 'Луп держит список задач и исполняет ровно <b>одну</b>: поток один. <code>fetch(1)</code> бежит, <code>fetch(2)</code> ждёт своей очереди.',
          nodes: [
            { id: "f1", kind: "chip", at: { zone: "loop", row: 0, col: 0 }, value: "fetch(1)", w: 96, accent: true },
            { id: "f2", kind: "chip", at: { zone: "loop", row: 0, col: 1 }, value: "fetch(2)", w: 96, ghost: true },
          ],
          edges: [],
        },
        {
          codeLine: 1,
          caption: '<code>fetch(1)</code> дошла до <code>await</code> — запрос улетел в сеть, задача <span class="hl">отдала управление</span>. Луп тут же занимает поток задачей <code>fetch(2)</code>.',
          nodes: [
            { id: "f2", kind: "chip", at: { zone: "loop", row: 0, col: 0 }, value: "fetch(2)", w: 96, accent: true },
            { id: "f1", kind: "chip", at: { zone: "net", row: 0, col: 0 }, value: "fetch(1)", w: 96 },
            { id: "io", kind: "chip", at: { zone: "net", row: 0, col: 1 }, value: "ждёт сеть", w: 96, accent: true },
          ],
          edges: [{ id: "e1", from: "f1", to: "io", accent: true }],
        },
        {
          codeLine: 2,
          caption: 'ОС сообщила «ответ пришёл» — луп будит <code>fetch(1)</code> <b>ровно с места паузы</b>. Ожидание сети не жгло процессор ни такта.',
          nodes: [
            { id: "f1", kind: "chip", at: { zone: "loop", row: 0, col: 0 }, value: "fetch(1)", w: 96, accent: true },
            { id: "f2", kind: "chip", at: { zone: "loop", row: 0, col: 1 }, value: "fetch(2)", w: 96, ghost: true },
            { id: "done", kind: "chip", at: { zone: "net", row: 0, col: 0 }, value: "ответ готов", w: 120, accent: true },
          ],
          edges: [{ id: "e2", from: "done", to: "f1", accent: true }],
        },
      ],
      explain: 'Event loop — диспетчер на одном потоке: список задач, из которого исполняется одна, пока не отдаст управление на <code>await</code>. Это <b>конкурентность, а не параллельность</b>: задачи перекрывают друг друга только там, где они ждут (сеть, диск, БД) — I/O-bound профиль API-тестов. Считать быстрее async не умеет: пока корутина крутит CPU, луп не переключится — для счёта нужен <code>multiprocessing</code>. Awaitable-объекты, которыми луп управляет, бывают трёх видов: «There are three main types of awaitable objects: coroutines, Tasks, and Futures.»',
      sources: ["py-asyncio-task"],
    },

    {
      id: "s2", num: "02", kicker: "Корутина-объект · тело не бежит", title: "fetch() без await — это объект, не результат",
      viewBox: "0 0 340 260", zones: CORO_ZONES,
      code: ["async def fetch(): return 42", "c = fetch()   # тело НЕ бежит", "print(type(c).__name__)", "print(asyncio.run(fetch()))"],
      console: true,
      predictAt: 1,
      predictQ: "fetch() вызвана как обычная функция, без await. Что напечатает type(c).__name__ — int (уже 42) или что-то другое?",
      scenes: [
        {
          codeLine: 1, out: "",
          caption: 'Вызов <code>async def</code> <b>не исполняет тело</b> — создаётся coroutine-объект. Ровно как у генератора: <code>g = gen()</code> тоже ничего не запускал.',
          nodes: [
            { id: "call", kind: "chip", at: { zone: "callz", row: 0 }, value: "c = fetch()", w: 120, accent: true },
            { id: "cob", kind: "obj", at: { zone: "coro", row: 0 }, typeTag: "coroutine", value: "created", w: 96, accent: true },
          ],
          edges: [{ id: "e1", from: "call", to: "cob", accent: true }],
        },
        {
          codeLine: 2, out: "coroutine",
          caption: 'В консоли — <code>coroutine</code>, не <code>42</code>: «Note that simply calling a coroutine will not schedule it to be executed». Результата ещё не существует.',
          nodes: [
            { id: "call", kind: "chip", at: { zone: "callz", row: 0 }, value: "c = fetch()", w: 120, ghost: true },
            { id: "notr", kind: "chip", at: { zone: "callz", row: 1 }, value: "не результат", w: 120, accent: true },
            { id: "cob", kind: "obj", at: { zone: "coro", row: 0 }, typeTag: "coroutine", value: "created", w: 96 },
          ],
          edges: [],
        },
        {
          codeLine: 2, out: "coroutine",
          caption: 'Кадр-предупреждение: корутину без <code>await</code> добьёт сборщик, и в <b>stderr</b> упадёт <code>RuntimeWarning: coroutine \'fetch\' was never awaited</code> (реальный лог спайка). Так забытый await выглядит в CI.',
          nodes: [
            { id: "cob", kind: "obj", at: { zone: "coro", row: 0 }, typeTag: "coroutine", value: "created", w: 96, ghost: true },
            { id: "warn", kind: "gate", at: { zone: "coro", row: 1 }, state: "fail", label: "не awaited", detail: "RuntimeWarning" },
          ],
          edges: [],
        },
        {
          codeLine: 3, out: "coroutine\n42",
          caption: '<code>asyncio.run(fetch())</code> отдаёт свежую корутину лупу — тот прогоняет тело и возвращает <code>42</code>. Реальный прогон 3.12: <code>coroutine</code>, затем <code>42</code>.',
          nodes: [
            { id: "run", kind: "chip", at: { zone: "callz", row: 0 }, value: "asyncio.run", w: 120, accent: true },
            { id: "cob2", kind: "obj", at: { zone: "coro", row: 0 }, typeTag: "coroutine", value: "42", w: 96, accent: true },
          ],
          edges: [{ id: "e2", from: "run", to: "cob2", accent: true }],
        },
      ],
      explain: '<code>async def</code> определяет функцию, чей вызов строит <b>объект-корутину</b> — исполнение начнёт только event loop (<code>await</code>, <code>asyncio.run</code>, Task). Дословно из asyncio: «Note that simply calling a coroutine will not schedule it to be executed». Симптом забытого <code>await</code> двойной: вместо результата — coroutine-объект (у <code>Response</code>-методов его нет → <code>AttributeError</code>), а в stderr CI — <code>RuntimeWarning: coroutine … was never awaited</code>. В карточку-эталон урока предупреждение не входит: он живёт в stderr, а сверяется только stdout.',
      sources: ["py-asyncio-task"],
    },

    {
      id: "s3", num: "03", kicker: "await · точка передачи", title: "await отдаёт управление, а не блокирует поток",
      viewBox: "0 0 340 260", zones: AWAIT_ZONES,
      code: ["r = await client.get(url)", "# пауза: управление → event loop", "# поток свободен для других задач"],
      scenes: [
        {
          codeLine: 0,
          caption: 'На <code>await</code> корутина <span class="hl">приостановлена</span> — управление уходит лупу. Никакого второго потока не появилось.',
          nodes: [
            { id: "co", kind: "obj", at: { zone: "susp", row: 0 }, typeTag: "coroutine", value: "⏸ await", w: 96, accent: true },
            { id: "ctl", kind: "chip", at: { zone: "busy", row: 0 }, value: "управление → луп", w: 168, accent: true },
          ],
          edges: [{ id: "e1", from: "co", to: "ctl", accent: true }],
        },
        {
          codeLine: 1,
          caption: 'Пока awaitable не готов, луп занимает <b>тот же поток</b> другой корутиной. await — передача управления, не ожидание «вхолостую».',
          nodes: [
            { id: "co", kind: "obj", at: { zone: "susp", row: 0 }, typeTag: "coroutine", value: "⏸ await", w: 96, ghost: true },
            { id: "tb", kind: "chip", at: { zone: "busy", row: 0, col: 0 }, value: "task B · бежит", w: 144, accent: true },
            { id: "tc", kind: "chip", at: { zone: "busy", row: 0, col: 1 }, value: "task C · ждёт", w: 144, ghost: true },
          ],
          edges: [],
        },
        {
          codeLine: 2,
          caption: 'Awaitable завершился — корутина возобновлена <b>с точки await</b>. Await принимает три вида awaitable: <code>coroutine</code>, <code>Task</code>, <code>Future</code>.',
          nodes: [
            { id: "co", kind: "obj", at: { zone: "susp", row: 0 }, typeTag: "coroutine", value: "running", w: 96, accent: true },
            { id: "aw1", kind: "chip", at: { zone: "busy", row: 0, col: 0 }, value: "coroutine", w: 96 },
            { id: "aw2", kind: "chip", at: { zone: "busy", row: 0, col: 1 }, value: "Task", w: 72 },
            { id: "aw3", kind: "chip", at: { zone: "busy", row: 0, col: 2 }, value: "Future", w: 72 },
          ],
          edges: [],
        },
      ],
      explain: 'Семантика <code>await</code> в PEP 492 описана на примере <code>read_data</code>/<code>db.fetch</code>: «await, similarly to yield from, suspends execution of read_data coroutine until db.fetch awaitable completes and returns the result data». Приостановка — не блокировка: поток отдан лупу, и тот исполняет готовые задачи; корутина продолжит с того же места, когда awaitable довезёт результат. Из глоссария: «Coroutines can be entered, exited, and resumed at many different points.» Писать <code>await</code> можно только внутри <code>async def</code> — снаружи это <code>SyntaxError</code> (PEP 492, разбор в хуке урока).',
      sources: ["pep-492", "py-gloss-coro"],
    },

    {
      id: "s4", num: "04", kicker: "gather · порядок результатов", title: "Завершились fast→slow, в списке — slow→fast",
      viewBox: "0 0 340 260", zones: GATHER_ZONES,
      code: ["a = await slow(); b = await fast()", "res = await asyncio.gather(", "    slow(), fast())", "print(res)"],
      console: true,
      predictAt: 3,
      predictQ: "fast завершилась ПЕРВОЙ (done: fast раньше). print(res) — ['fast', 'slow'] или ['slow', 'fast']?",
      scenes: [
        {
          codeLine: 0, out: "",
          caption: '<code>await</code> подряд ожидания <b>не перекрывает</b>: пока <code>slow()</code> не дожат, <code>fast()</code> даже не создана. Реальный прогон: <code>done: slow</code>, потом <code>done: fast</code> — обгона нет.',
          nodes: [
            { id: "sq1", kind: "chip", at: { zone: "seq", row: 0, col: 0 }, value: "slow", w: 72, accent: true },
            { id: "sq2", kind: "chip", at: { zone: "seq", row: 0, col: 1 }, value: "fast", w: 72, ghost: true },
          ],
          edges: [],
        },
        {
          codeLine: 1, out: "",
          caption: '<code>gather</code> стартует обе корутины <span class="hl">разом</span>: «Run awaitable objects in the aws sequence concurrently.» Теперь ожидания перекрываются.',
          nodes: [
            { id: "sq1", kind: "chip", at: { zone: "seq", row: 0, col: 0 }, value: "slow", w: 72, ghost: true },
            { id: "sq2", kind: "chip", at: { zone: "seq", row: 0, col: 1 }, value: "fast", w: 72, ghost: true },
            { id: "g1", kind: "chip", at: { zone: "gat", row: 0, col: 0 }, value: "slow", w: 72, accent: true },
            { id: "g2", kind: "chip", at: { zone: "gat", row: 0, col: 1 }, value: "fast", w: 72, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 2, out: "done: fast\ndone: slow",
          caption: 'Внутри <code>task</code> стоит <code>print("done", …)</code>: первой финиширует <code>fast</code> — порядок <b>завершения</b> определяют ожидания, не порядок аргументов.',
          nodes: [
            { id: "sq1", kind: "chip", at: { zone: "seq", row: 0, col: 0 }, value: "slow", w: 72, ghost: true },
            { id: "sq2", kind: "chip", at: { zone: "seq", row: 0, col: 1 }, value: "fast", w: 72, ghost: true },
            { id: "g1", kind: "chip", at: { zone: "gat", row: 0, col: 0 }, value: "slow", w: 72 },
            { id: "g2", kind: "chip", at: { zone: "gat", row: 0, col: 1 }, value: "fast", w: 72, accent: true },
            { id: "fin", kind: "chip", at: { zone: "gat", row: 1 }, value: "fast финишировала", w: 168, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 3, out: "done: fast\ndone: slow\n['slow', 'fast']",
          caption: 'А <code>res</code> — в порядке <b>аргументов</b>: «The order of result values corresponds to the order of awaitables in aws.» Реальный вывод: <code>[\'slow\', \'fast\']</code>.',
          nodes: [
            { id: "sq1", kind: "chip", at: { zone: "seq", row: 0, col: 0 }, value: "slow", w: 72, ghost: true },
            { id: "sq2", kind: "chip", at: { zone: "seq", row: 0, col: 1 }, value: "fast", w: 72, ghost: true },
            { id: "ord", kind: "gate", at: { zone: "gat", row: 0 }, state: "ok", label: "порядок аргументов", detail: "['slow', 'fast']" },
          ],
          edges: [],
        },
      ],
      explain: 'Два разных порядка, и оба детерминированы: <b>завершаются</b> задачи по своим ожиданиям (в спайке <code>fast</code> финиширует первой), а <b>результаты</b> <code>gather</code> кладёт строго по позициям аргументов — «The order of result values corresponds to the order of awaitables in aws». Поэтому <code>res[0]</code> — всегда ответ первой корутины из вызова, и распаковка <code>users, orders = await gather(...)</code> безопасна. Современная альтернатива для группы задач — «The asyncio.TaskGroup class provides a more modern alternative to create_task()». Ускорение даёт только конкурентный старт: <code>await</code> подряд — это очередь.',
      sources: ["py-asyncio-task"],
    },

    {
      id: "s5", num: "05", kicker: "Мост к генераторам · невидимое", title: "Корутину можно вести как генератор: send()",
      viewBox: "0 0 340 260", zones: KIN_ZONES,
      code: ["c = f()          # n = 41 внутри", "c.send(None)     # как next(g)!", "print(c.cr_frame.f_locals)", "c.send(None)     # ?"],
      console: true,
      scenes: [
        {
          codeLine: 1, out: "",
          caption: '<code>c.send(None)</code> — <b>генераторный</b> протокол — прогнал тело до <code>await asyncio.sleep(0)</code> и заморозил кадр. Луп не понадобился.',
          nodes: [
            { id: "cob", kind: "obj", at: { zone: "kin", row: 0 }, typeTag: "coroutine", value: "paused", w: 96, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 2, out: "{'n': 41}",
          caption: 'Рентген: <code>c.cr_frame.f_locals</code> → <code>{\'n\': 41}</code> — та же пара «locals + указатель инструкции», что у <code>gi_frame</code> генератора.',
          nodes: [
            { id: "cob", kind: "obj", at: { zone: "kin", row: 0 }, typeTag: "coroutine", value: "paused", w: 96 },
            { id: "loc", kind: "chip", at: { zone: "xray", row: 0 }, value: "n = 41", accent: true },
            { id: "ip", kind: "chip", at: { zone: "xray", row: 1 }, value: "IP · на await", w: 120, accent: true },
          ],
          edges: [{ id: "x1", from: "cob", to: "loc", accent: true }],
        },
        {
          codeLine: 3, out: "{'n': 41}\nStopIteration: 42",
          caption: 'Второй <code>send</code> будит кадр: <code>n += 1</code>, и результат приезжает как <code>StopIteration.value</code> → <code>42</code>. Именно так его забирает event loop.',
          nodes: [
            { id: "cob", kind: "obj", at: { zone: "kin", row: 0 }, typeTag: "coroutine", value: "done", w: 96, accent: true },
            { id: "loc", kind: "chip", at: { zone: "xray", row: 0 }, value: "n = 42", accent: true },
            { id: "ip", kind: "chip", at: { zone: "xray", row: 1 }, value: "IP · дальше", w: 120 },
          ],
          edges: [{ id: "x2", from: "cob", to: "loc", accent: true }],
        },
      ],
      explain: 'Родство — не метафора, а реализация: «Since, internally, coroutines are a special kind of generators, every await is suspended by a yield somewhere down the chain of await calls (please refer to PEP 3156 for a detailed explanation)». Отсюда весь спайк: <code>send(None)</code> ведёт корутину без всякого лупа, <code>cr_frame.f_locals</code> показывает замороженные локальные (зеркало <code>gi_frame</code> из урока о генераторах), а возврат приезжает в <code>StopIteration.value</code> — так event loop и получает результаты. Разница в семантике паузы: <code>yield</code> отдаёт <b>значение наружу</b>, <code>await</code> — <b>управление лупу</b>.',
      sources: ["pep-492"],
    },

    {
      id: "s6", num: "06", kicker: "GIL · замок на байткоде", title: "Почему threading не ускоряет CPU-счёт",
      viewBox: "0 0 340 260", zones: GIL_ZONES,
      code: ["t1 = Thread(target=hash_all)", "t2 = Thread(target=hash_all)", "t1.start(); t2.start()  # раза в 2?"],
      scenes: [
        {
          codeLine: 2,
          caption: 'GIL — «The mechanism used by the CPython interpreter to assure that <b>only one thread executes Python bytecode at a time</b>». Замок у потока 1 — поток 2 стоит.',
          nodes: [
            { id: "gil", kind: "chip", at: { zone: "th1", row: 0, col: 0 }, value: "GIL · замок", w: 120, accent: true },
            { id: "b1", kind: "chip", at: { zone: "th1", row: 0, col: 1 }, value: "байткод", w: 96, accent: true },
            { id: "w2", kind: "chip", at: { zone: "th2", row: 0 }, value: "ждёт GIL", w: 96, ghost: true },
          ],
          edges: [],
        },
        {
          codeLine: 2,
          caption: 'Замок переехал: теперь байткод исполняет поток 2, а поток 1 ждёт. Два потока на двух ядрах <b>чередуются</b>, а не считают одновременно.',
          nodes: [
            { id: "w1", kind: "chip", at: { zone: "th1", row: 0 }, value: "ждёт GIL", w: 96, ghost: true },
            { id: "gil", kind: "chip", at: { zone: "th2", row: 0, col: 0 }, value: "GIL · замок", w: 120, accent: true },
            { id: "b2", kind: "chip", at: { zone: "th2", row: 0, col: 1 }, value: "байткод", w: 96, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 2,
          caption: 'Итог для CPU-bound: <span class="hl">параллельности нет</span> — «at the expense of much of the parallelism afforded by multi-processor machines». Нужен счёт на все ядра — это <code>multiprocessing</code>.',
          nodes: [
            { id: "no", kind: "gate", at: { zone: "th1", row: 0 }, state: "fail", label: "CPU-bound", detail: "потоки чередуются" },
            { id: "w1", kind: "chip", at: { zone: "th2", row: 0 }, value: "ждёт GIL", w: 96, ghost: true },
          ],
          edges: [],
        },
        {
          codeLine: 2,
          caption: 'А на ожидании замок отпускается: «the GIL is always released when doing I/O». Потоки для I/O живут; async-у GIL вообще не соперник — он и так один поток (разбор 01).',
          nodes: [
            { id: "ok", kind: "gate", at: { zone: "th1", row: 0 }, state: "ok", label: "I/O", detail: "GIL отпущен" },
            { id: "b2", kind: "chip", at: { zone: "th2", row: 0 }, value: "байткод", w: 96, accent: true },
          ],
          edges: [],
        },
      ],
      explain: 'GIL держит инварианты интерпретатора: «This simplifies the CPython implementation by making the object model (including critical built-in types such as dict) implicitly safe against concurrent access». Цена — параллельность байткода: CPU-bound код в потоках чередуется на одном замке, и «раза в 2» не случается. На I/O замок отпущен, поэтому и threading, и async закрывают ожидания; частый вопрос «зачем async, если есть GIL» перепутан по слоям — event loop не борется с GIL, он живёт в одном потоке. Хук на будущее: «Starting with the 3.13 release, CPython has support for a build of Python called free threading where the global interpreter lock (GIL) is disabled.»',
      sources: ["py-gloss-gil", "py-free-threading"],
    },

    {
      id: "s7", num: "07", kicker: "Антипаттерн · блокирующий вызов", title: "time.sleep в корутине морозит ВЕСЬ луп",
      viewBox: "0 0 340 260", zones: BLOCK_ZONES,
      code: ["async def blocker():", "    print(\"block start\")", "    time.sleep(0.05)   # sync-вызов!", "    print(\"block end\")"],
      console: true,
      predictAt: 1,
      predictQ: "time.sleep — обычный синхронный вызов внутри корутины. Успеет ли задача other напечататься, пока blocker «спит»?",
      scenes: [
        {
          codeLine: 2, out: "block start",
          caption: '<code>time.sleep</code> не знает про луп: это обычный вызов, он <b>держит поток</b>. Точки передачи управления нет — весь луп заморожен.',
          nodes: [
            { id: "frz", kind: "gate", at: { zone: "blk", row: 0 }, state: "fail", label: "time.sleep", detail: "луп заморожен" },
            { id: "oth", kind: "chip", at: { zone: "rest", row: 0, col: 0 }, value: "other", w: 72, ghost: true },
            { id: "st1", kind: "chip", at: { zone: "rest", row: 0, col: 1 }, value: "не бежит", w: 96, ghost: true },
          ],
          edges: [],
        },
        {
          codeLine: 3, out: "block start\nblock end\nother",
          caption: '<code>other</code> дождалась конца сна: реальный порядок — <code>block start</code>, <code>block end</code>, <code>other</code>. Один блокирующий вызов украл конкурентность у всех задач.',
          nodes: [
            { id: "frz", kind: "gate", at: { zone: "blk", row: 0 }, state: "fail", label: "time.sleep", detail: "луп заморожен" },
            { id: "oth", kind: "chip", at: { zone: "rest", row: 0, col: 0 }, value: "other", w: 72, accent: true },
            { id: "st2", kind: "chip", at: { zone: "rest", row: 0, col: 1 }, value: "после сна", w: 96, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 2, out: "block start\nother\nblock end",
          caption: 'Починка — одна строка: <code>await asyncio.sleep(0.05)</code>. Пауза стала <span class="hl">точкой передачи</span> — <code>other</code> напечаталась ВО ВРЕМЯ сна: <code>block start</code>, <code>other</code>, <code>block end</code>.',
          nodes: [
            { id: "fix", kind: "gate", at: { zone: "blk", row: 0 }, state: "ok", label: "asyncio.sleep", detail: "пауза отдаёт луп" },
            { id: "oth", kind: "chip", at: { zone: "rest", row: 0, col: 0 }, value: "other", w: 72, accent: true },
            { id: "st3", kind: "chip", at: { zone: "rest", row: 0, col: 1 }, value: "во время сна", w: 120, accent: true },
          ],
          edges: [],
        },
      ],
      explain: 'Event loop переключает задачи <b>только в точках await</b> — блокирующий вызов (<code>time.sleep</code>, <code>requests.get</code>, sync-драйвер БД) не отдаёт управление, и все корутины стоят вместе с ним. Доказательство — порядок печати (спайк ×2): с <code>time.sleep</code> — <code>block start / block end / other</code>, с <code>await asyncio.sleep</code> — <code>block start / other / block end</code>. Правило для async-тестов: внутри <code>async def</code> — только async-клиенты (<code>httpx.AsyncClient</code>, не <code>requests</code>) и <code>asyncio.sleep</code>, не <code>time.sleep</code>.',
      sources: ["py-asyncio-task"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>async def fetch(): return 42</code><br/><code>print(type(fetch()).__name__)</code>, затем <code>print(asyncio.run(fetch()))</code> — что напечатают обе строки?',
      options: ["coroutine и 42", "42 и 42", "int и 42", "function и coroutine"], correctIndex: 0, xp: 10,
      okText: 'Вызов <code>async def</code> строит coroutine-объект, тело не бежит — <code>type</code> видит <code>coroutine</code>. Запускает только луп: <code>asyncio.run</code> довозит <code>42</code>. (Первая корутина умерла без await — её <code>RuntimeWarning</code> уйдёт в stderr, не в вывод.)',
      noText: 'Ключ — как у генераторов: вызов создаёт объект, исполняет луп. «Note that simply calling a coroutine will not schedule it to be executed». Реальный stdout python3.12: <code>coroutine</code>, затем <code>42</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M11_c1.py", expect: "coroutine\n42" },
      sourceRefs: ["py-asyncio-task"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>async def task(name, delay): await asyncio.sleep(delay); return name</code><br/><code>res = await asyncio.gather(task("slow", 0.05), task("fast", 0.01))</code><br/><code>print(res)</code> — что напечатает?',
      options: ["['slow', 'fast']", "['fast', 'slow']", "('slow', 'fast')", "{'slow', 'fast'}"], correctIndex: 0, xp: 10,
      okText: '<code>gather</code> кладёт результаты по позициям <b>аргументов</b>: «The order of result values corresponds to the order of awaitables in aws». Кто финишировал первым — неважно.',
      noText: 'Порядок завершения (fast первей) на список не влияет — гарантия asyncio: результаты в порядке awaitables в вызове. Реальный вывод python3.12: <code>[\'slow\', \'fast\']</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M11_c2.py", expect: "['slow', 'fast']" },
      sourceRefs: ["py-asyncio-task"],
    },
    {
      // MODIFY rung: c2's tasks now PRINT on completion — completion order becomes visible.
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: 'Код из c2 <b>дополнили печатью</b>: перед <code>return name</code> теперь <code>print("done:", name)</code>. Тот же <code>gather(task("slow", 0.05), task("fast", 0.01))</code> и <code>print(res)</code>.<br/>Что напечатают все три строки, по порядку?',
      options: ["done: fast · done: slow · ['slow', 'fast']", "done: slow · done: fast · ['slow', 'fast']", "done: fast · done: slow · ['fast', 'slow']", "done: slow · done: fast · ['fast', 'slow']"], correctIndex: 0, xp: 10,
      okText: 'Два порядка разошлись, и оба правильные: <b>завершение</b> — по ожиданиям (<code>fast</code> первой), <b>результаты</b> — по аргументам (<code>slow</code> первым в списке).',
      noText: 'Печать происходит в момент финиша задачи: <code>fast</code> (0.01) обгоняет <code>slow</code> (0.05). А список <code>gather</code> собирает по позициям вызова. Реальный вывод python3.12: <code>done: fast</code>, <code>done: slow</code>, <code>[\'slow\', \'fast\']</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M11_c3.py", expect: "done: fast\ndone: slow\n['slow', 'fast']" },
      sourceRefs: ["py-asyncio-task"],
    },
    {
      id: "c4", type: "predict-output", engagementLevel: "responding",
      question: '<code>async def blocker(): print("block start"); time.sleep(0.05); print("block end")</code><br/><code>async def other(): print("other")</code><br/><code>await asyncio.gather(blocker(), other())</code> — в каком порядке напечатаются три строки?',
      options: ["block start · block end · other", "block start · other · block end", "other · block start · block end", "порядок недетерминирован"], correctIndex: 0, xp: 10,
      okText: '<code>time.sleep</code> — блокирующий вызов: точки передачи управления нет, луп стоит вместе с ним. <code>other</code> получает поток только после <code>block end</code>.',
      noText: 'Луп переключает задачи только на <code>await</code>: синхронный <code>time.sleep</code> держит поток, и <code>other</code> ждёт весь сон. С <code>await asyncio.sleep</code> порядок стал бы <code>start / other / end</code>. Реальный вывод python3.12: <code>block start</code>, <code>block end</code>, <code>other</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M11_c4.py", expect: "block start\nblock end\nother" },
      sourceRefs: ["py-asyncio-task"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Где это в твоих инструментах", v: 'API-тесты с <code>httpx.AsyncClient</code>: <code>async with</code> + <code>await client.get</code>, пачка запросов — <code>asyncio.gather</code> (результаты в порядке аргументов). pytest-asyncio гоняет <code>async def</code>-тесты; нагрузочные юзеры Locust — та же конкурентность задач на ожидании.' },
    { icon: "cost", k: "Забытый await", v: 'Вызов корутины без <code>await</code> — объект, не результат: дальше <code>AttributeError</code> на «ответе», а в stderr CI — <code>RuntimeWarning: coroutine … was never awaited</code>. Увидел такой warning в логах — ищи потерянный <code>await</code>.' },
    { icon: "avoid", k: "Sync-вызов в лупе", v: 'Один <code>requests.get</code> или <code>time.sleep</code> внутри <code>async def</code> морозит ВСЕ задачи лупа — конкурентность исчезает молча. В async-коде только async-клиенты и <code>asyncio.sleep</code>; и не жди от async ускорения CPU-счёта — это про ожидания (и GIL про то же).' },
  ],

  foot: 'урок · <b>async/await</b> · 7 анимир. разборов · event loop, gather, GIL · дизайн <b>mid</b>',
};
