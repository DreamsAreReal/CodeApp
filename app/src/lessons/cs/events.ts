/**
 * Lesson: События (CS.S4.events) — expert density, 6 animated deep-dives. An event is a
 * member built ON a multicast delegate but with an encapsulation guard: outside code may only
 * subscribe/unsubscribe (+=/-=), never assign (=) or raise (Invoke) it. That single restriction
 * turns a public delegate field into a safe publish/subscribe channel (the observer pattern):
 * the publisher raises, every subscribed handler runs. The BCL standardizes the handler shape as
 * EventHandler / EventHandler<TEventArgs> — (object sender, TEventArgs e), no return value.
 *
 * SIGNATURE machine panel (s6): the compiler enforces encapsulation — from outside the declaring
 * type, `p.E = ...` and `p.E.Invoke(...)` are BOTH compile error CS0070 ("can only appear on the
 * left hand side of += or -= (except when used from within the type 'P')"). REAL run-csharp
 * measurement (this file's exec cards): raise fires handlers A then B; a 0-subscriber event is
 * null (?.Invoke is null-safe); EventHandler<TempArgs> delivers e.Value == 42.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the EXACT page in sources[] (fetched + substring-
 *     checked 2026-07-21):
 *       · event keyword (ms-event-kw): the "An event is a member…"/"event keyword declares an
 *         event"/"of a delegate type"/"invokes all supplied event handlers" clauses, and the
 *         "Events are multicast delegates that you can only invoke from within the class… (the
 *         publisher class)" clause;
 *       · events guide (ms-events): the observer/delegate-model clause, "An event is a message
 *         sent by an object to signal the occurrence of an action", the event-sender clause,
 *         the EventHandler / EventHandler`1 clause and "no return type value and take two
 *         parameters", the "acts as an event dispatcher… maintaining a list of registered event
 *         handlers" clause.
 *   - every card's verify.expect is the REAL stdout of the run-csharp exec cards on the app
 *     backend (c1: handler A / handler B · c2: no subscribers / has subscribers · c3: temp = 42);
 *   - the s6 machine-panel error (CS0070) is an OWN measurement of the run-csharp endpoint.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S4.events/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the event member sitting on top of a delegate type.
const Z_EVMEMBER: Zone = { id: "evm", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "event-ЧЛЕН", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "event EventHandler Clicked", subCls: "vz-zsub", subY: 47 };
const Z_UNDERDEL: Zone = { id: "under", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ДЕЛЕГАТ ПОД НИМ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "multicast-делегат", subCls: "vz-zsub heap", subY: 47 };
const MEMBER_ZONES: Zone[] = [Z_EVMEMBER, Z_UNDERDEL];

// s2: publisher (left) and subscribers (right) — the observer pattern.
const Z_PUB: Zone = { id: "pub", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "PUBLISHER", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "источник события", subCls: "vz-zsub", subY: 47 };
const Z_SUBS: Zone = { id: "subs", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "SUBSCRIBERS", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "подписчики (+=)", subCls: "vz-zsub heap", subY: 47 };
const OBSERVER_ZONES: Zone[] = [Z_PUB, Z_SUBS];

// s3: raising fires every subscribed handler.
const Z_RAISE: Zone = { id: "raise", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "Click() → raise", labelCls: "vz-zlabel sm", lx: 83, ly: 24, sub: "издатель поднимает", subCls: "vz-zsub", subY: 47 };
const Z_HANDLERS: Zone = { id: "handlers", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone good", label: "ОБРАБОТЧИКИ", labelCls: "vz-zlabel good sm", lx: 257, ly: 24, sub: "все по порядку", subCls: "vz-zsub good", subY: 47 };
const RAISE_ZONES: Zone[] = [Z_RAISE, Z_HANDLERS];

// s4: the EventHandler signature — sender + EventArgs, void return.
const Z_SIG: Zone = { id: "sig", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "СТАНДАРТНАЯ СИГНАТУРА ОБРАБОТЧИКА", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "void (object sender, EventArgs e)", subCls: "vz-zsub", subY: 47 };
const SIG_ZONES: Zone[] = [Z_SIG];

// s5: EventHandler<T> carries typed data.
const Z_TYPED: Zone = { id: "typed", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "EventHandler<TempArgs>", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "типизированные данные", subCls: "vz-zsub", subY: 47 };
const Z_DATA: Zone = { id: "data", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ДАННЫЕ СОБЫТИЯ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "e.Value", subCls: "vz-zsub heap", subY: 47 };
const TYPED_ZONES: Zone[] = [Z_TYPED, Z_DATA];

// s6 (SIGNATURE): the encapsulation guard — CS0070 outside the declaring type.
const Z_INSIDE: Zone = { id: "inside", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ВНУТРИ КЛАССА P", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "= и raise можно", subCls: "vz-zsub good", subY: 47 };
const Z_OUTSIDE: Zone = { id: "outside", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "СНАРУЖИ", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "только += / -=", subCls: "vz-zsub", subY: 47 };
const GUARD_ZONES: Zone[] = [Z_INSIDE, Z_OUTSIDE];

export const events: LessonData = {
  id: "CS.S4.events",
  track: "CS",
  section: "CS.S4",
  module: "S4.5",
  lang: "csharp",
  title: "События: event, EventHandler, publish/subscribe",
  kicker: "C# вглубь · S4 · observer",
  home: { subtitle: "event поверх делегата, publisher/subscriber, EventHandler, инкапсуляция", icon: "types", estMinutes: 11 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-event-kw", kind: "doc", org: "Microsoft Learn", title: "event keyword (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/event", date: "2023-03-14" },
    { id: "ms-events", kind: "doc", org: "Microsoft Learn", title: "Handle and raise events (.NET)", url: "https://learn.microsoft.com/en-us/dotnet/standard/events/", date: "2023-05-04" },
  ],

  spec: [
    { text: "«The <code>event</code> keyword declares an event.»", source: "ms-event-kw" },
  ],
  edgeCases: [
    { text: "Событие — это multicast-делегат с оградой: «Events are multicast delegates that you can only invoke from within the class (or derived classes) or struct where you declare them (the publisher class)» — реальный прогон подтверждает <code>CS0070</code> при вызове снаружи.", source: "ms-event-kw" },
    { text: "Издатель не знает получателя: «The event sender doesn\'t know the object or method that receives (handles) the events it raises».", source: "ms-events" },
    { text: "Событие можно объявить статическим: «Use the <code>static</code> keyword to declare an event as a static event. Static events are available to callers at any time, even if no instance of the class exists».", source: "ms-event-kw" },
  ],

  misconceptions: [
    {
      wrong: "событие — это отдельная сущность, а публичный делегат-поле сделал бы то же самое",
      hook: 'Событие <b>построено на делегате</b>, но добавляет ключевое — <span class="hl">инкапсуляцию</span>. «An <b>event</b> is a member that enables an object to trigger notifications… The <code>event</code> keyword declares an <b>event</b>. The event is of a <b>delegate type</b>. While an object triggers an event, the event invokes all supplied event handlers». Публичный делегат-поле кто угодно мог бы обнулить или вызвать; событие — нет: «Events are multicast delegates that you can <span class="hl">only invoke from within the class</span> (or derived classes) or struct where you declare them (the <b>publisher class</b>)». Это паттерн «наблюдатель»: «The delegate model follows the <b>observer design pattern</b>, which enables a <b>subscriber</b> to register with and receive notifications from a <b>provider</b>». Дальше <b>шесть разборов</b>: event поверх делегата, publisher/subscriber, raise → все обработчики, стандартная сигнатура <code>EventHandler</code>, <code>EventHandler&lt;T&gt;</code> с данными, и <b>машинная панель</b> — ограда компилятора (реальный прогон: <code>CS0070</code> снаружи).',
      source: ["ms-event-kw", "ms-events"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Что это · event поверх делегата", title: "event — член класса, построенный на делегатном типе",
      viewBox: "0 0 340 210", zones: MEMBER_ZONES,
      code: ["class Button {", "  public event EventHandler Clicked;  // event поверх делегата", "  public void Click() => Clicked?.Invoke(this, EventArgs.Empty);", "}"],
      scenes: [
        { codeLine: 1, out: "", caption: '<code>event EventHandler Clicked;</code> — объявляем <b>член-событие</b>. Ключевое слово <code>event</code> и <span class="hl">делегатный тип</span> под ним.', nodes: [{ id: "ev", kind: "obj", at: { zone: "evm", row: 0 }, typeTag: "event", value: "Clicked", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Под событием — обычный <b>делегат</b> (тут <code>EventHandler</code>). Событие — это надстройка над ним, а не новая сущность в вакууме.', nodes: [{ id: "ev", kind: "obj", at: { zone: "evm", row: 0 }, typeTag: "event", value: "Clicked" }, { id: "del", kind: "obj", at: { zone: "under", row: 0 }, typeTag: "EventHandler", value: "multicast-делегат", accent: true }], edges: [{ id: "e1", from: "ev", to: "del", accent: true }] },
        { codeLine: 2, out: "", caption: '«Поднять» событие — значит <span class="hl">вызвать делегат</span> под ним: <code>Clicked?.Invoke(...)</code>. Все подписанные обработчики выполнятся.', nodes: [{ id: "ev", kind: "obj", at: { zone: "evm", row: 0 }, typeTag: "event", value: "Clicked" }, { id: "del", kind: "obj", at: { zone: "under", row: 0 }, typeTag: "EventHandler", value: "Invoke →", accent: true }, { id: "raise", kind: "chip", at: { zone: "evm", row: 1 }, value: "Click() → raise", w: 132 }], edges: [{ id: "e1", from: "ev", to: "del" }] },
      ],
      explain: 'Событие — это <b>член</b>, дающий объекту слать уведомления, поверх делегатного типа: «An <b>event</b> is a member that enables an object to trigger notifications. Event users can attach executable code for events by supplying <b>event handlers</b>. The <code>event</code> keyword declares an event. The <span class="hl">event is of a delegate type</span>. While an object triggers an event, the event invokes all supplied event handlers. <b>Event handlers are delegate instances</b> added to the event and executed when the event is raised». То есть <code>Clicked</code> — не магия, а фасад над multicast-делегатом: «Delegates are <b>multicast</b> class objects, which means they can hold references to more than one event-handling method». Поднять событие = вызвать этот делегат (обычно через <code>?.Invoke</code> — защита от отсутствия подписчиков, разбор 03).',
      sources: ["ms-event-kw", "ms-events"],
    },
    {
      id: "s2", num: "02", kicker: "Наблюдатель · publisher/subscriber", title: "Издатель не знает подписчиков — они регистрируются сами",
      viewBox: "0 0 340 210", zones: OBSERVER_ZONES,
      code: ["var b = new Button();            // publisher", "b.Clicked += OnClickA;           // subscriber A подписался", "b.Clicked += OnClickB;           // subscriber B подписался", "// b НЕ знает, кто именно подписан"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Button</code> — <b>publisher</b>: он объявил событие <code>Clicked</code>. О будущих подписчиках он ничего не знает.', nodes: [{ id: "pub", kind: "obj", at: { zone: "pub", row: 0 }, typeTag: "publisher", value: "Button.Clicked", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>b.Clicked += OnClickA</code> — подписчик <span class="hl">сам регистрируется</span> оператором <code>+=</code>. Издатель не вызывал его.', nodes: [{ id: "pub", kind: "obj", at: { zone: "pub", row: 0 }, typeTag: "publisher", value: "Button.Clicked" }, { id: "sa", kind: "chip", at: { zone: "subs", row: 0 }, value: "OnClickA", w: 108, accent: true }], edges: [{ id: "e1", from: "pub", to: "sa", accent: true }] },
        { codeLine: 2, out: "", caption: 'Второй подписчик тоже через <code>+=</code>. Их может быть сколько угодно; издатель держит <b>список</b>, но не знает их природы.', nodes: [{ id: "pub", kind: "obj", at: { zone: "pub", row: 0 }, typeTag: "publisher", value: "Button.Clicked" }, { id: "sa", kind: "chip", at: { zone: "subs", row: 0 }, value: "OnClickA", w: 108 }, { id: "sb", kind: "chip", at: { zone: "subs", row: 1 }, value: "OnClickB", w: 108, accent: true }], edges: [{ id: "e2", from: "pub", to: "sb", accent: true }] },
      ],
      explain: 'События реализуют паттерн «наблюдатель» через делегатную модель: «Events in .NET are based on the <b>delegate model</b>. The delegate model follows the <b>observer design pattern</b>, which enables a <span class="hl">subscriber to register with and receive notifications from a provider</span>. An event sender pushes a notification when an event occurs. An event receiver defines the response». Ключевое свойство развязки: «The <b>event sender doesn\'t know the object or method that receives</b> (handles) the events it raises». Подписка — оператором <code>+=</code>, и делегат под событием ведёт список: «A delegate acts as an event dispatcher for the class that raises the event by <b>maintaining a list of registered event handlers</b> for the event». Так издатель и подписчики не связаны напрямую — это и есть развязка через событие.',
      sources: ["ms-events"],
    },
    {
      id: "s3", num: "03", kicker: "Raise · все обработчики", title: "Поднять событие — выполнить всех подписчиков по порядку",
      viewBox: "0 0 340 210", zones: RAISE_ZONES,
      code: ["b.Clicked += (s, e) => Console.WriteLine(\"handler A\");", "b.Clicked += (s, e) => Console.WriteLine(\"handler B\");", "b.Click();   // Clicked?.Invoke(...) → оба обработчика", "// → handler A, затем handler B"],
      predictAt: 2, predictQ: 'Два обработчика подписаны на <code>Clicked</code>. Что напечатает один <code>b.Click()</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Два обработчика в списке события: A и B. Пока не вызвано — просто зарегистрированы.', nodes: [{ id: "click", kind: "chip", at: { zone: "raise", row: 0 }, value: "Click()", w: 96 }, { id: "ha", kind: "chip", at: { zone: "handlers", row: 0 }, value: "handler A", w: 108 }, { id: "hb", kind: "chip", at: { zone: "handlers", row: 1 }, value: "handler B", w: 108, accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>b.Click()</code> внутри поднимает событие: <code>Clicked?.Invoke(this, ...)</code> — вызов multicast-делегата <span class="hl">по всему списку</span>.', nodes: [{ id: "click", kind: "obj", at: { zone: "raise", row: 0 }, typeTag: "raise", value: "Invoke →", accent: true }, { id: "ha", kind: "chip", at: { zone: "handlers", row: 0 }, value: "handler A", w: 108 }, { id: "hb", kind: "chip", at: { zone: "handlers", row: 1 }, value: "handler B", w: 108 }], edges: [{ id: "e", from: "click", to: "ha", accent: true }] },
        { codeLine: 3, out: "handler A\nhandler B", caption: 'Оба обработчика выполнились <b>по порядку подписки</b> → <span class="hl">handler A</span>, затем <span class="hl">handler B</span> (реальный прогон).', nodes: [{ id: "click", kind: "obj", at: { zone: "raise", row: 0 }, typeTag: "raise", value: "→ done" }, { id: "ha", kind: "chip", at: { zone: "handlers", row: 0 }, value: "handler A ✓", w: 120 }, { id: "hb", kind: "chip", at: { zone: "handlers", row: 1 }, value: "handler B ✓", w: 120, accent: true }], edges: [] },
      ],
      explain: 'Поднять событие — вызвать делегат, и «While an object triggers an event, the event <b>invokes all supplied event handlers</b>». Издатель обычно оборачивает вызов в защищённый метод: «To raise an event, invoke the delegate associated with the event. The event sender typically wraps the invocation in a <code>protected virtual</code> method… named <code>On&lt;EventName&gt;</code>». Реальный прогон: два обработчика → <code>handler A</code>, <code>handler B</code> (порядок подписки; это multicast invocation list из соседнего урока). Важно про <code>?.Invoke</code>: если подписчиков нет, событие равно <code>null</code>, и вызов без <code>?.</code> кинул бы <code>NullReferenceException</code> — реальный прогон подтверждает, что при нуле подписчиков событие <code>is null</code>.',
      sources: ["ms-event-kw", "ms-events"],
    },
    {
      id: "s4", num: "04", kicker: "EventHandler · стандартная форма", title: "Обработчик: (object sender, EventArgs e), без возврата",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["public delegate void EventHandler(object? sender, EventArgs e);", "// sender — кто поднял событие", "// e       — данные события (EventArgs.Empty, если данных нет)", "b.Clicked += (sender, e) => { /* обработка */ };"],
      scenes: [
        { codeLine: 0, out: "", caption: 'BCL даёт готовый делегат <code>EventHandler</code>: <b>два параметра</b> и <span class="hl">без возврата</span>. Свой delegate объявлять не нужно.', nodes: [{ id: "sig", kind: "obj", at: { zone: "sig", row: 0 }, typeTag: "void", value: "(object sender, EventArgs e)", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Первый параметр — <code>sender</code>: <b>источник</b> события (обычно сам publisher, <code>this</code>).', nodes: [{ id: "sig", kind: "obj", at: { zone: "sig", row: 0 }, typeTag: "void", value: "(object sender, EventArgs e)" }, { id: "snd", kind: "chip", at: { zone: "sig", row: 1, col: 0 }, value: "sender = источник", w: 156, accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Второй — <code>e</code>: <b>данные события</b>. Если данных нет — <code>EventArgs.Empty</code>. Возврата у обработчика <span class="hl">нет</span> (void).', nodes: [{ id: "sig", kind: "obj", at: { zone: "sig", row: 0 }, typeTag: "void", value: "(object sender, EventArgs e)" }, { id: "snd", kind: "chip", at: { zone: "sig", row: 1, col: 0 }, value: "sender = источник", w: 156 }, { id: "args", kind: "chip", at: { zone: "sig", row: 1, col: 1 }, value: "e = данные", w: 120, accent: true }], edges: [] },
      ],
      explain: 'BCL стандартизует форму обработчика, чтобы не плодить свои делегаты: «.NET provides the <code>EventHandler</code> and <code>EventHandler&lt;TEventArgs&gt;</code> delegates to support most event scenarios. <b>Use the <code>EventHandler</code> delegate for all events that don\'t include event data</b>. Use the <code>EventHandler&lt;TEventArgs&gt;</code> delegate for events that include data about the event. These delegates have <span class="hl">no return type value and take two parameters</span> (an object for the source of the event and an object for event data)». Первый параметр — <code>sender</code> (кто поднял), второй — данные: «The <code>EventArgs</code> class is typically the base type for event data classes. You also use this class if an event doesn\'t have any data associated with it… You can pass the <code>EventArgs.Empty</code> value when no data is provided». Возврата нет — обработчик реагирует, а не отвечает.',
      sources: ["ms-events"],
    },
    {
      id: "s5", num: "05", kicker: "EventHandler<T> · данные события", title: "EventHandler<TEventArgs> несёт типизированные данные",
      viewBox: "0 0 340 210", zones: TYPED_ZONES,
      code: ["class TempArgs : EventArgs { public int Value; }", "class Sensor { public event EventHandler<TempArgs> Changed; ... }", "s.Changed += (sender, e) => Console.WriteLine(\"temp = \" + e.Value);", "s.Set(42);   // Changed?.Invoke(this, new TempArgs{Value=42})"],
      predictAt: 3, predictQ: '<code>EventHandler&lt;TempArgs&gt;</code> с <code>e.Value</code>. Что напечатает <code>s.Set(42)</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Данные события — свой класс, наследник <code>EventArgs</code>: <code>TempArgs</code> с полем <code>Value</code>.', nodes: [{ id: "ta", kind: "obj", at: { zone: "data", row: 0 }, typeTag: "TempArgs : EventArgs", value: "Value", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>event EventHandler&lt;TempArgs&gt; Changed</code> — <span class="hl">типизированное</span> событие: второй параметр обработчика будет именно <code>TempArgs</code>.', nodes: [{ id: "ev", kind: "obj", at: { zone: "typed", row: 0 }, typeTag: "event", value: "EventHandler<TempArgs>", accent: true }, { id: "ta", kind: "obj", at: { zone: "data", row: 0 }, typeTag: "TempArgs", value: "Value" }], edges: [{ id: "e1", from: "ev", to: "ta" }] },
        { codeLine: 3, out: "temp = 42", caption: '<code>s.Set(42)</code> поднимает событие с <code>new TempArgs{Value=42}</code> → обработчик читает <code>e.Value</code> → <span class="hl">temp = 42</span> (реальный прогон).', nodes: [{ id: "ev", kind: "obj", at: { zone: "typed", row: 0 }, typeTag: "event", value: "Set(42) →" }, { id: "ta", kind: "obj", at: { zone: "data", row: 0 }, typeTag: "e.Value", value: "42", accent: true }], edges: [{ id: "e2", from: "ev", to: "ta", accent: true }] },
      ],
      explain: 'Когда событию есть что сообщить, берут обобщённый вариант: «Use the <code>EventHandler&lt;TEventArgs&gt;</code> delegate for events that include <b>data about the event</b>». Данные оформляют классом-наследником <code>EventArgs</code>: «Data associated with an event can be provided through an event data class… <b>.NET follows a naming pattern where all event data classes end with the <code>EventArgs</code> suffix</b>». Обработчик получает эти данные вторым параметром (<code>e.Value</code>) — реальный прогон: <code>s.Set(42)</code> → <code>temp = 42</code>. Так подписчик узнаёт не только «что-то случилось», но и <b>детали</b>: какое значение, какой источник (<code>sender</code>), — не завися при этом от кода издателя.',
      sources: ["ms-events"],
    },
    {
      id: "s6", num: "06", kicker: "Машинная панель · ограда компилятора", title: "Снаружи класса событие можно только += / -=, не = и не raise",
      viewBox: "0 0 340 210", zones: GUARD_ZONES,
      code: ["class P { public event EventHandler E; }", "var p = new P();", "p.E += handler;   // ✓ подписка снаружи разрешена", "p.E = handler;    // ✗ CS0070", "p.E.Invoke(...);  // ✗ CS0070 — raise только внутри P"],
      scenes: [
        { codeLine: 2, out: "", caption: 'Снаружи класса <b>подписка разрешена</b>: <code>p.E += handler</code> и <code>p.E -= handler</code> компилируются.', nodes: [{ id: "out", kind: "gate", at: { zone: "outside", row: 0 }, state: "ok", label: "p.E += handler", detail: "✓ можно", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>p.E = handler</code> снаружи — <span class="hl">ошибка</span>: нельзя обнулить/переприсвоить чужой список подписчиков.', nodes: [{ id: "out", kind: "gate", at: { zone: "outside", row: 0 }, state: "ok", label: "p.E += / -=", detail: "✓" }, { id: "assign", kind: "gate", at: { zone: "outside", row: 1 }, state: "fail", label: "p.E = handler", detail: "CS0070", accent: true }], edges: [] },
        { codeLine: 4, out: "", caption: '<code>p.E.Invoke(...)</code> снаружи — тоже <span class="hl">CS0070</span> (реальный прогон): поднять событие можно <b>только внутри</b> P. Внутри — и <code>=</code>, и raise доступны.', nodes: [{ id: "in", kind: "gate", at: { zone: "inside", row: 0 }, state: "ok", label: "внутри P", detail: "= и raise ✓" }, { id: "assign", kind: "gate", at: { zone: "outside", row: 0 }, state: "fail", label: "p.E = ...", detail: "CS0070" }, { id: "inv", kind: "gate", at: { zone: "outside", row: 1 }, state: "fail", label: "p.E.Invoke()", detail: "CS0070", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — реально снятая ошибка компилятора. Именно ограда отличает событие от публичного делегат-поля: «Events are multicast delegates that you can <b>only invoke from within the class</b> (or derived classes) or struct where you declare them (the <b>publisher class</b>)». Собственный прогон эндпоинта: снаружи <code>p.E = handler</code> и <code>p.E.Invoke(...)</code> дают <b>error CS0070: The event \'P.E\' can only appear on the left hand side of <code>+=</code> or <code>-=</code> (except when used from within the type \'P\')</b>. То есть снаружи подписчик может лишь <b>подписаться/отписаться</b> (<code>+=</code>/<code>-=</code>), но не переприсвоить список и не поднять событие. Публичный делегат-поле такой защиты не даёт — любой мог бы его обнулить или вызвать. Событие делает канал publish/subscribe <span class="hl">безопасным по инкапсуляции</span>.',
      sources: ["ms-event-kw"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Button { public event EventHandler Clicked; public void Click() =&gt; Clicked?.Invoke(this, EventArgs.Empty); } var b = new Button(); b.Clicked += (s,e) =&gt; Console.WriteLine("handler A"); b.Clicked += (s,e) =&gt; Console.WriteLine("handler B"); b.Click();</code> — что напечатает?',
      options: ["handler A\\nhandler B", "handler B\\nhandler A", "handler B", "handler A"], correctIndex: 0, xp: 10,
      okText: 'Поднять событие = вызвать multicast-делегат под ним → <span class="hl">все</span> обработчики по порядку подписки: <code>handler A</code>, затем <code>handler B</code>. «the event invokes all supplied event handlers».',
      noText: 'Событие вызывает <b>всех</b> подписчиков, в порядке подписки. <code>Click()</code> поднимает <code>Clicked</code> → A, затем B. Реальный вывод: <code>handler A</code>, <code>handler B</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "handler A\nhandler B" }, sourceRefs: ["ms-event-kw", "ms-events"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Bell { public event EventHandler Rang; public void Ring() { Console.WriteLine(Rang is null ? "no subscribers" : "has subscribers"); Rang?.Invoke(this, EventArgs.Empty); } } var bell = new Bell(); bell.Ring(); bell.Rang += (s,e) =&gt; {}; bell.Ring();</code> — обе строки?',
      options: ["no subscribers\\nhas subscribers", "has subscribers\\nhas subscribers", "no subscribers\\nno subscribers", "has subscribers\\nno subscribers"], correctIndex: 0, xp: 10,
      okText: 'Без подписчиков событие равно <span class="hl">null</span> → <code>no subscribers</code>, а <code>?.Invoke</code> null-безопасен. После <code>+=</code> оно не null → <code>has subscribers</code>.',
      noText: 'Событие с нулём подписчиков — <code>null</code> (потому raise делают через <code>?.Invoke</code>). Первый <code>Ring()</code> → no subscribers, после <code>+=</code> → has subscribers. Реальный прогон.',
      verify: { kind: "exec", run: "dotnet run", expect: "no subscribers\nhas subscribers" }, sourceRefs: ["ms-event-kw"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>class TempArgs : EventArgs { public int Value; } class Sensor { public event EventHandler&lt;TempArgs&gt; Changed; public void Set(int v) =&gt; Changed?.Invoke(this, new TempArgs{Value=v}); } var s = new Sensor(); s.Changed += (sender,e) =&gt; Console.WriteLine("temp = " + e.Value); s.Set(42);</code> — что напечатает?',
      options: ["temp = 42", "temp = 0", "42", "temp = "], correctIndex: 0, xp: 10,
      okText: '<code>EventHandler&lt;TempArgs&gt;</code> несёт <span class="hl">типизированные данные</span>: <code>Set(42)</code> поднимает событие с <code>Value=42</code>, обработчик читает <code>e.Value</code> → <code>temp = 42</code>.',
      noText: 'Обобщённый <code>EventHandler&lt;T&gt;</code> передаёт данные события вторым параметром (<code>e.Value</code>). <code>Set(42)</code> → <code>temp = 42</code>. Реальный прогон.',
      verify: { kind: "exec", run: "dotnet run", expect: "temp = 42" }, sourceRefs: ["ms-events"],
    },
  ],

  takeaways: [
    { icon: "why", k: "event = делегат + ограда", v: 'Событие — член поверх multicast-делегата: «The <code>event</code> keyword declares an event. The event is of a <span class="hl">delegate type</span>». Поднять = вызвать делегат → «invokes all supplied event handlers» (реальный прогон: A, B).' },
    { icon: "cost", k: "Observer / publish-subscribe", v: 'Паттерн «наблюдатель»: подписчик сам регистрируется (<code>+=</code>), издатель <b>не знает</b> получателя. «The event sender doesn\'t know the object or method that receives… the events it raises». Форма обработчика — <code>EventHandler</code>: <code>(object sender, EventArgs e)</code>, без возврата.' },
    { icon: "avoid", k: "Инкапсуляция (CS0070)", v: 'Снаружи класса событие можно <span class="hl">только += / -=</span>, не <code>=</code> и не raise: «only invoke from within the class… (the publisher class)» — реальный прогон даёт <code>CS0070</code>. Это и отличает событие от публичного делегат-поля. Raise — через <code>?.Invoke</code> (0 подписчиков = null).' },
  ],

  foot: 'урок · <b>события: event, EventHandler, publish/subscribe</b> · 6 анимир. разборов · observer · панель CS0070 · дизайн <b>mid</b>',
};
