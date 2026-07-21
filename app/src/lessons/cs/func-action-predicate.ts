/**
 * Lesson: Func/Action/Predicate (CS.S4.func-action-predicate) — expert density, 6 animated
 * deep-dives. The BCL ships generic delegate families so you rarely declare a custom delegate:
 * Func<...,TResult> encapsulates a method that returns a value (its LAST type argument is the
 * return type), Action<...> encapsulates a method that returns void, and Predicate<T> is a
 * method returning bool that tests one T against a criterion. A lambda's underlying type is one
 * of these Func/Action delegates, which is why LINQ takes lambdas without any custom delegate.
 *
 * SIGNATURE machine panel (s5): Func<int,int,int,int>.GetGenericArguments().Length == 4 — three
 * parameters plus ONE return type; the last type argument is always the return. Predicate<int>
 * behaves like Func<int,bool> but is a distinct named type. REAL run-csharp measurement (this
 * file's exec cards): add(2,3) -> 5; FindAll(isEven) -> 2,4,6, Find -> 2; f(2,3,4) -> 24, arity 4.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the EXACT api page in sources[] (WebFetch-verified
 *     2026-07-21):
 *       · Func<T,TResult> (ms-func): the "encapsulates a method that has one parameter and
 *         returns a value" summary, "You can use this delegate to represent a method that can be
 *         passed as a parameter without explicitly declaring a custom delegate", "it must return
 *         a value", the Action note, "The underlying type of a lambda expression is one of the
 *         generic Func delegates…", the T-contravariant / TResult-covariant clauses;
 *       · Action<T> (ms-action): the "does not return a value" summary, "it must not return a
 *         value. (In C#, the method must return void…)", the Func note;
 *       · Predicate<T> (ms-predicate): the "defines a set of criteria and determines whether the
 *         specified object meets those criteria" summary, the "used by several methods of the
 *         Array and List<T> classes to search for elements" clause, the true/false return clause.
 *   - every card's verify.expect is the REAL stdout of the run-csharp exec cards on the app
 *     backend (c1: 5 / log: hi · c2: 2,4,6 / 2 · c3: 24 / 4);
 *   - the s5 machine-panel numbers (Func arity, last arg = return) are OWN measurements.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S4.func-action-predicate/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the three built-in delegate families as one map.
const Z_FAM: Zone = { id: "fam", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "ВСТРОЕННЫЕ ДЕЛЕГАТЫ BCL", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "не надо объявлять свой delegate", subCls: "vz-zsub", subY: 47 };
const FAM_ZONES: Zone[] = [Z_FAM];

// s2: Func — returns a value.
const Z_FUNC_M: Zone = { id: "funcM", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Func<int,int,int>", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "возвращает значение", subCls: "vz-zsub", subY: 47 };
const Z_FUNC_R: Zone = { id: "funcR", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "РЕЗУЛЬТАТ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "add(2,3)", subCls: "vz-zsub heap", subY: 47 };
const FUNC_ZONES: Zone[] = [Z_FUNC_M, Z_FUNC_R];

// s3: Action — returns void.
const Z_ACT_M: Zone = { id: "actM", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Action<string>", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "возвращает void", subCls: "vz-zsub", subY: 47 };
const Z_ACT_E: Zone = { id: "actE", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ЭФФЕКТ, НЕ ЗНАЧЕНИЕ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "log(\"hi\")", subCls: "vz-zsub heap", subY: 47 };
const ACT_ZONES: Zone[] = [Z_ACT_M, Z_ACT_E];

// s4: Predicate — returns bool, filters a collection.
const Z_PRED: Zone = { id: "pred", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Predicate<int>", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "n => n % 2 == 0", subCls: "vz-zsub", subY: 47 };
const Z_COLL: Zone = { id: "coll", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "FindAll / Find", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "тест true/false", subCls: "vz-zsub good", subY: 47 };
const PRED_ZONES: Zone[] = [Z_PRED, Z_COLL];

// s5 (SIGNATURE): the type-argument layout — last arg is the return type.
const Z_ARGS: Zone = { id: "args", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Func<int,int,int,int>", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "4 тип-аргумента", subCls: "vz-zsub heap", subY: 47 };
const Z_SPLIT: Zone = { id: "split", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ПАРАМ vs ВОЗВРАТ", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "последний = return", subCls: "vz-zsub", subY: 47 };
const ARGS_ZONES: Zone[] = [Z_ARGS, Z_SPLIT];

// s6: variance — Action<object> assignable to Action<string> (in T contravariant).
const Z_WIDE: Zone = { id: "wide", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Action<object>", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "принимает object", subCls: "vz-zsub", subY: 47 };
const Z_NARROW: Zone = { id: "narrow", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "→ Action<string>", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "in T контравариантен", subCls: "vz-zsub good", subY: 47 };
const VAR_ZONES: Zone[] = [Z_WIDE, Z_NARROW];

export const funcActionPredicate: LessonData = {
  id: "CS.S4.func-action-predicate",
  track: "CS",
  section: "CS.S4",
  module: "S4.4",
  lang: "csharp",
  title: "Func, Action, Predicate: встроенные делегаты",
  kicker: "C# вглубь · S4 · без своего delegate",
  home: { subtitle: "Func (возврат), Action (void), Predicate (bool), арность, вариантность", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-func", kind: "doc", org: "Microsoft Learn", title: "Func<T,TResult> Delegate (System)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.func-2", date: "2025-07-01" },
    { id: "ms-action", kind: "doc", org: "Microsoft Learn", title: "Action<T> Delegate (System)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.action-1", date: "2025-07-01" },
    { id: "ms-predicate", kind: "doc", org: "Microsoft Learn", title: "Predicate<T> Delegate (System)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.predicate-1", date: "2025-07-01" },
  ],

  spec: [
    { text: "«You can use this delegate to represent a method that can be passed as a parameter without explicitly declaring a custom delegate.»", source: "ms-func" },
  ],
  edgeCases: [
    { text: "<code>Func</code> обязан вернуть значение: «the encapsulated method must have one parameter that is passed to it by value, and that it must <b>return a value</b>».", source: "ms-func" },
    { text: "<code>Action</code> — только эффект, без результата: «it must <b>not return a value</b>. (In C#, the method must return <code>void</code>…)».", source: "ms-action" },
    { text: "<code>Predicate&lt;T&gt;</code> используют коллекции для поиска: «This delegate is used by several methods of the <code>Array</code> and <code>List&lt;T&gt;</code> classes to search for elements in the collection».", source: "ms-predicate" },
  ],

  misconceptions: [
    {
      wrong: "под каждый callback надо объявлять свой delegate-тип",
      hook: 'Почти никогда — в BCL уже есть <b>обобщённые</b> семейства делегатов. «You can use this delegate to <span class="hl">represent a method that can be passed as a parameter without explicitly declaring a custom delegate</span>». Их три ключевых: <code>Func&lt;…,TResult&gt;</code> — «Encapsulates a method that has one parameter and <b>returns a value</b>»; <code>Action&lt;T&gt;</code> — «Encapsulates a method that has a single parameter and <b>does not return a value</b>»; <code>Predicate&lt;T&gt;</code> — «Represents the method that defines a set of criteria and <b>determines whether the specified object meets those criteria</b>». И лямбда сама компилируется в них: «The <b>underlying type of a lambda expression is one of the generic <code>Func</code> delegates</b>». Дальше <b>шесть разборов</b>: карта семейств, <code>Func</code>=возврат, <code>Action</code>=void, <code>Predicate</code>=bool-фильтр, <b>машинная панель</b> — последний тип-аргумент <code>Func</code> это возврат (реальный прогон: арность <code>4</code>), и вариантность <code>in</code>/<code>out</code>.',
      source: "ms-func",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Карта · три семейства", title: "Func возвращает, Action — void, Predicate — bool",
      viewBox: "0 0 340 210", zones: FAM_ZONES,
      code: ["Func<int,int,int> add = (a,b) => a + b;   // → int", "Action<string>    log = s => Print(s);    // → void", "Predicate<int>    isEven = n => n%2 == 0;  // → bool"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Func</code> — метод, который <span class="hl">возвращает значение</span>. Последний тип-аргумент — тип результата.', nodes: [{ id: "f", kind: "obj", at: { zone: "fam", row: 0, col: 0 }, typeTag: "Func", value: "→ значение", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Action</code> — метод <b>без возврата</b> (<code>void</code>): нужен ради эффекта, не результата.', nodes: [{ id: "f", kind: "obj", at: { zone: "fam", row: 0, col: 0 }, typeTag: "Func", value: "→ значение" }, { id: "a", kind: "obj", at: { zone: "fam", row: 0, col: 1 }, typeTag: "Action", value: "→ void", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>Predicate</code> — метод, возвращающий <b>bool</b>: тест «подходит / нет». Три семейства покрывают почти все callback\'и.', nodes: [{ id: "f", kind: "obj", at: { zone: "fam", row: 0, col: 0 }, typeTag: "Func", value: "→ значение" }, { id: "a", kind: "obj", at: { zone: "fam", row: 0, col: 1 }, typeTag: "Action", value: "→ void" }, { id: "p", kind: "obj", at: { zone: "fam", row: 0, col: 2 }, typeTag: "Predicate", value: "→ bool", accent: true }], edges: [] },
      ],
      explain: 'BCL поставляет <b>обобщённые</b> делегаты, чтобы под callback не плодить свои типы. <code>Func&lt;T,TResult&gt;</code> — «Encapsulates a method that has one parameter and <b>returns a value</b> of the type specified by the <code>TResult</code> parameter» (перегрузки принимают до 16 параметров). <code>Action&lt;T&gt;</code> — «Encapsulates a method that has a single parameter and <b>does not return a value</b>». <code>Predicate&lt;T&gt;</code> — «Represents the method that defines a set of criteria and <b>determines whether the specified object meets those criteria</b>». Официальная развилка: «To reference a method that has one parameter and returns <code>void</code>… use the generic <code>Action&lt;T&gt;</code> delegate instead» и наоборот «To reference a method that has one parameter and returns a value, use the generic <code>Func&lt;T,TResult&gt;</code> delegate instead».',
      sources: ["ms-func", "ms-action", "ms-predicate"],
    },
    {
      id: "s2", num: "02", kicker: "Func · возвращает значение", title: "Func<T…,TResult>: метод с результатом",
      viewBox: "0 0 340 210", zones: FUNC_ZONES,
      code: ["Func<int,int,int> add = (a,b) => a + b;", "int r = add(2, 3);", "Console.WriteLine(r);   // 5"],
      predictAt: 2, predictQ: '<code>Func&lt;int,int,int&gt; add = (a,b) =&gt; a + b;</code> — что напечатает <code>add(2, 3)</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Func&lt;int,int,int&gt;</code>: два <code>int</code>-параметра и <code>int</code>-возврат. Заворачиваем лямбду <code>(a,b) =&gt; a + b</code>.', nodes: [{ id: "f", kind: "obj", at: { zone: "funcM", row: 0 }, typeTag: "add", value: "(a,b)=>a+b", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>add(2, 3)</code> — вызов через делегат: аргументы уходят в лямбду, она <span class="hl">вернёт значение</span>.', nodes: [{ id: "f", kind: "obj", at: { zone: "funcM", row: 0 }, typeTag: "add", value: "(2,3)", accent: true }, { id: "r", kind: "gate", at: { zone: "funcR", row: 0 }, state: "ok", label: "add(2,3)", detail: "…" }], edges: [{ id: "e", from: "f", to: "r", accent: true }] },
        { codeLine: 2, out: "5", caption: 'Результат — <span class="hl">5</span> (реальный прогон). <code>Func</code> обязан вернуть значение — в этом его контракт.', nodes: [{ id: "f", kind: "obj", at: { zone: "funcM", row: 0 }, typeTag: "add", value: "(2,3)" }, { id: "r", kind: "obj", at: { zone: "funcR", row: 0 }, typeTag: "return", value: "5", accent: true }], edges: [{ id: "e", from: "f", to: "r" }] },
      ],
      explain: '<code>Func</code> — делегат для метода <b>с результатом</b>. Контракт дословно: «the encapsulated method must have one parameter that is passed to it by value, and that <b>it must return a value</b>». Главная выгода — не плодить свои типы: «When you use the <code>Func&lt;T,TResult&gt;</code> delegate, you do not have to explicitly define a delegate that encapsulates a method with a single parameter». И именно на <code>Func</code> опирается LINQ: «because many methods of types in the <code>System.Linq</code> namespace have <code>Func&lt;T,TResult&gt;</code> parameters, you can pass these methods a <b>lambda expression</b> without explicitly instantiating a <code>Func&lt;T,TResult&gt;</code> delegate». Реальный прогон: <code>add(2,3)</code> → <code>5</code>.',
      sources: ["ms-func"],
    },
    {
      id: "s3", num: "03", kicker: "Action · возвращает void", title: "Action<T…>: метод ради эффекта, без результата",
      viewBox: "0 0 340 210", zones: ACT_ZONES,
      code: ["Action<string> log = s => Console.WriteLine(\"log: \" + s);", "log(\"hi\");   // печатает, ничего не возвращает"],
      predictAt: 1, predictQ: '<code>Action&lt;string&gt; log = s =&gt; Console.WriteLine("log: " + s); log("hi");</code> — что напечатает?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Action&lt;string&gt;</code>: один <code>string</code>-параметр, возврата <b>нет</b>. Тело работает ради <span class="hl">побочного эффекта</span>.', nodes: [{ id: "a", kind: "obj", at: { zone: "actM", row: 0 }, typeTag: "log", value: "s => Print", accent: true }], edges: [] },
        { codeLine: 1, out: "log: hi", caption: '<code>log("hi")</code> печатает <span class="hl">log: hi</span> и возвращает <code>void</code> (реальный прогон). Значения от <code>Action</code> получить нельзя — только эффект.', nodes: [{ id: "a", kind: "obj", at: { zone: "actM", row: 0 }, typeTag: "log", value: "\"hi\"" }, { id: "e", kind: "gate", at: { zone: "actE", row: 0 }, state: "ok", label: "печать", detail: "log: hi", accent: true }], edges: [{ id: "ed", from: "a", to: "e", accent: true }] },
      ],
      explain: '<code>Action</code> — зеркало <code>Func</code>: метод без результата. «Encapsulates a method that has a single parameter and <b>does not return a value</b>», и контракт: «the encapsulated method must have one parameter that is passed to it by value, and it must <b>not return a value</b>. (In C#, the method must return <code>void</code>. In Visual Basic, it must be defined by the <code>Sub</code>…<code>End Sub</code> construct. It can also be a method that returns a value that is ignored.) <span class="hl">Typically, such a method is used to perform an operation</span>». То есть <code>Action</code> берут для эффекта — логирование, мутация, <code>ForEach</code>: «The <code>ForEach</code>… methods each take an <code>Action&lt;T&gt;</code> delegate as a parameter. The method encapsulated by the delegate allows you to perform an action on each element». Реальный прогон: <code>log("hi")</code> → <code>log: hi</code>.',
      sources: ["ms-action"],
    },
    {
      id: "s4", num: "04", kicker: "Predicate · bool-фильтр", title: "Predicate<T>: тест true/false для поиска и фильтра",
      viewBox: "0 0 340 210", zones: PRED_ZONES,
      code: ["var nums = new List<int>{1,2,3,4,5,6};", "Predicate<int> isEven = n => n % 2 == 0;", "List<int> evens = nums.FindAll(isEven);   // 2,4,6", "int first = nums.Find(isEven);            // 2"],
      predictAt: 2, predictQ: '<code>Predicate&lt;int&gt; isEven = n =&gt; n%2==0;</code> — что даст <code>nums.FindAll(isEven)</code> для 1..6?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>Predicate&lt;int&gt;</code>: берёт один <code>int</code>, возвращает <b>bool</b>. Это критерий «чётное ли число».', nodes: [{ id: "p", kind: "obj", at: { zone: "pred", row: 0 }, typeTag: "isEven", value: "n%2==0 → bool", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>FindAll(isEven)</code> прогоняет <b>каждый</b> элемент через предикат и <span class="hl">оставляет</span> те, где <code>true</code>.', nodes: [{ id: "p", kind: "obj", at: { zone: "pred", row: 0 }, typeTag: "isEven", value: "тест" }, { id: "fa", kind: "gate", at: { zone: "coll", row: 0 }, state: "ok", label: "FindAll →", detail: "2,4,6", accent: true }], edges: [{ id: "e", from: "p", to: "fa", accent: true }] },
        { codeLine: 3, out: "2,4,6\n2", caption: '<code>FindAll</code> → <span class="hl">2,4,6</span>, <code>Find</code> → <b>2</b> (первый подходящий) — реальный прогон. Один предикат, два способа применения.', nodes: [{ id: "p", kind: "obj", at: { zone: "pred", row: 0 }, typeTag: "isEven", value: "тест" }, { id: "fa", kind: "gate", at: { zone: "coll", row: 0 }, state: "ok", label: "FindAll →", detail: "2,4,6" }, { id: "fd", kind: "gate", at: { zone: "coll", row: 1 }, state: "ok", label: "Find →", detail: "2", accent: true }], edges: [] },
      ],
      explain: '<code>Predicate&lt;T&gt;</code> — специализированный делегат «да/нет»: «Represents the method that defines a set of criteria and <b>determines whether the specified object meets those criteria</b>». Возврат — булев: «<code>true</code> if <code>obj</code> meets the criteria defined within the method represented by this delegate; otherwise, <code>false</code>». И под него заточены коллекции: «This delegate is used by several methods of the <code>Array</code> and <code>List&lt;T&gt;</code> classes to <span class="hl">search for elements in the collection</span>» (<code>Find</code>, <code>FindAll</code>, <code>Exists</code>, <code>RemoveAll</code>). По форме <code>Predicate&lt;T&gt;</code> = <code>Func&lt;T,bool&gt;</code>, но это <b>разные именованные типы</b> — LINQ берёт <code>Func&lt;T,bool&gt;</code>, а <code>List&lt;T&gt;.FindAll</code> — именно <code>Predicate&lt;T&gt;</code> (одну лямбду примут оба, а вот переменные напрямую не взаимозаменяемы). Реальный прогон: <code>2,4,6</code> и <code>2</code>.',
      sources: ["ms-predicate"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · тип-аргументы", title: "Последний тип-аргумент Func — это тип возврата",
      viewBox: "0 0 340 210", zones: ARGS_ZONES,
      code: ["Func<int,int,int,int> f = (a,b,c) => a * b * c;", "Console.WriteLine(f(2, 3, 4));                        // 24", "Console.WriteLine(f.GetType().GetGenericArguments().Length); // ?"],
      predictAt: 2, predictQ: 'У <code>Func&lt;int,int,int,int&gt;</code> три параметра. Сколько всего тип-аргументов вернёт <code>GetGenericArguments().Length</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Func&lt;int,int,int,int&gt;</code>: выглядит как «четыре int». Но роли у них <b>разные</b>.', nodes: [{ id: "a", kind: "obj", at: { zone: "args", row: 0 }, typeTag: "Func<...>", value: "int,int,int,int", accent: true }], edges: [] },
        { codeLine: 1, out: "24", caption: 'Первые <b>три</b> — параметры <code>(a,b,c)</code>, последний — <span class="hl">тип возврата</span>. <code>f(2,3,4)</code> = <code>24</code> (реальный прогон).', nodes: [{ id: "a", kind: "obj", at: { zone: "args", row: 0 }, typeTag: "Func<...>", value: "int,int,int,int" }, { id: "p", kind: "chip", at: { zone: "split", row: 0 }, value: "3 параметра", w: 120 }, { id: "r", kind: "chip", at: { zone: "split", row: 1 }, value: "1 возврат ←", w: 120, accent: true }], edges: [] },
        { codeLine: 2, out: "24\n4", caption: 'Всего тип-аргументов — <span class="hl">4</span> (реальный прогон): 3 параметра + 1 возврат. Последний <b>всегда</b> тип результата — вот главное отличие от <code>Action</code>.', nodes: [{ id: "a", kind: "obj", at: { zone: "args", row: 0 }, typeTag: "arity", value: "= 4", accent: true }, { id: "p", kind: "chip", at: { zone: "split", row: 0 }, value: "3 параметра", w: 120 }, { id: "r", kind: "chip", at: { zone: "split", row: 1 }, value: "1 возврат ←", w: 120, accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — реально снятая арность. У <code>Func&lt;T1,…,Tn,TResult&gt;</code> <b>последний</b> тип-аргумент — всегда возврат, а остальные — параметры. Собственный замер: <code>Func&lt;int,int,int,int&gt;.GetGenericArguments().Length</code> = <b>4</b> (три параметра + один возврат), а <code>f(2,3,4)</code> = <code>24</code>. У <code>Action</code> возврата нет, поэтому все его тип-аргументы — параметры. Почему это важно: лямбду можно передать без явного типа именно потому, что «The <b>underlying type of a lambda expression is one of the generic <code>Func</code> delegates</b>. This makes it possible to pass a lambda expression as a parameter without explicitly assigning it to a delegate». Ещё грань: <code>Predicate&lt;int&gt;</code> по форме = <code>Func&lt;int,bool&gt;</code>, но это <b>отдельный тип</b> — совпадение сигнатуры не делает их одним классом.',
      sources: ["ms-func"],
    },
    {
      id: "s6", num: "06", kicker: "Вариантность · in/out", title: "Action<object> подходит там, где ждут Action<string>",
      viewBox: "0 0 340 210", zones: VAR_ZONES,
      code: ["Action<object> printObj = o => Console.WriteLine(o);", "Action<string> printStr = printObj;   // in T контравариантен → ок", "printStr(\"hello\");                    // \"hello\""],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Action&lt;object&gt;</code> умеет печатать <b>любой</b> object — значит, и любую строку.', nodes: [{ id: "w", kind: "obj", at: { zone: "wide", row: 0 }, typeTag: "Action<object>", value: "печать object", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Action&lt;string&gt; printStr = printObj;</code> — присваивание <span class="hl">проходит</span>: параметр <code>in T</code> контравариантен (можно менее производный тип).', nodes: [{ id: "w", kind: "obj", at: { zone: "wide", row: 0 }, typeTag: "Action<object>", value: "печать object" }, { id: "n", kind: "gate", at: { zone: "narrow", row: 0 }, state: "ok", label: "→ Action<string>", detail: "присвоено ✓", accent: true }], edges: [{ id: "e", from: "w", to: "n", accent: true }] },
        { codeLine: 2, out: "hello", caption: '<code>printStr("hello")</code> печатает <span class="hl">hello</span> (реальный прогон): строка спокойно передаётся в метод, ждущий object.', nodes: [{ id: "w", kind: "obj", at: { zone: "wide", row: 0 }, typeTag: "Action<object>", value: "печать object" }, { id: "n", kind: "obj", at: { zone: "narrow", row: 0 }, typeTag: "printStr", value: "→ hello", accent: true }], edges: [] },
      ],
      explain: 'У <code>Func</code>/<code>Action</code>/<code>Predicate</code> тип-параметры <b>вариантны</b>, и это видно в их объявлениях (<code>in</code>/<code>out</code>). Параметр — контравариантен: «The type of the parameter of the method that this delegate encapsulates. This type parameter is <b>contravariant</b>. That is, you can use either the type you specified or <span class="hl">any type that is less derived</span>» — потому <code>Action&lt;object&gt;</code> присваивается к <code>Action&lt;string&gt;</code> (метод, принимающий object, справится и со string). Возврат <code>Func</code> — ковариантен: «The type of the return value… This type parameter is <b>covariant</b>. That is, you can use either the type you specified or <span class="hl">any type that is more derived</span>». Реальный прогон подтверждает присваивание и вызов: <code>printStr("hello")</code> → <code>hello</code>. Механика <code>in</code>/<code>out</code> целиком — в соседнем уроке о вариантности делегатов.',
      sources: ["ms-action", "ms-func"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>Func&lt;int,int,int&gt; add = (a,b) =&gt; a + b; Action&lt;string&gt; log = s =&gt; Console.WriteLine("log: " + s); Console.WriteLine(add(2,3)); log("hi");</code> — обе строки?',
      options: ["5\\nlog: hi", "log: hi\\n5", "5\\nhi", "5\\nlog: 5"], correctIndex: 0, xp: 10,
      okText: '<code>Func</code> <span class="hl">возвращает</span> значение → <code>add(2,3)</code> печатает <code>5</code>. <code>Action</code> — <b>void</b>, работает ради эффекта → <code>log("hi")</code> печатает <code>log: hi</code>.',
      noText: '<code>Func</code> = метод с результатом (<code>5</code>), <code>Action</code> = метод без возврата, ради побочного эффекта (<code>log: hi</code>). Порядок вывода — как в коде. Реальный прогон.',
      verify: { kind: "exec", run: "dotnet run", expect: "5\nlog: hi" }, sourceRefs: ["ms-func", "ms-action"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var nums = new List&lt;int&gt;{1,2,3,4,5,6}; Predicate&lt;int&gt; isEven = n =&gt; n%2==0; Console.WriteLine(string.Join(",", nums.FindAll(isEven))); Console.WriteLine(nums.Find(isEven));</code> — обе строки?',
      options: ["2,4,6\\n2", "1,3,5\\n1", "2,4,6\\n6", "1,2,3,4,5,6\\n2"], correctIndex: 0, xp: 10,
      okText: '<code>Predicate&lt;int&gt;</code> = тест <b>bool</b>. <code>FindAll</code> оставляет все, где <code>true</code> → <span class="hl">2,4,6</span>; <code>Find</code> — первый подходящий → <b>2</b>. «used… to search for elements in the collection».',
      noText: '<code>FindAll</code> возвращает <b>все</b> прошедшие предикат (<code>2,4,6</code>), <code>Find</code> — <b>первый</b> (<code>2</code>). Реальный вывод: <code>2,4,6</code>, затем <code>2</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "2,4,6\n2" }, sourceRefs: ["ms-predicate"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>Func&lt;int,int,int,int&gt; f = (a,b,c) =&gt; a*b*c; Console.WriteLine(f(2,3,4)); Console.WriteLine(f.GetType().GetGenericArguments().Length);</code> — обе строки?',
      options: ["24\\n4", "24\\n3", "9\\n4", "24\\n1"], correctIndex: 0, xp: 10,
      okText: '<code>f(2,3,4)</code> = <code>24</code>. Тип-аргументов <span class="hl">4</span>: три параметра <b>плюс</b> тип возврата — последний тип-аргумент <code>Func</code> всегда результат.',
      noText: 'У <code>Func&lt;T1,T2,T3,TResult&gt;</code> четыре тип-аргумента: 3 параметра + 1 возврат. Не путай с числом параметров (3). Реальный вывод: <code>24</code>, затем <code>4</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "24\n4" }, sourceRefs: ["ms-func"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Три семейства", v: '<code>Func&lt;…,TResult&gt;</code> — метод с результатом, <code>Action&lt;…&gt;</code> — <b>void</b>, <code>Predicate&lt;T&gt;</code> — тест <b>→ bool</b>. «represent a method… <span class="hl">without explicitly declaring a custom delegate</span>». Лямбда сама компилируется в <code>Func</code>/<code>Action</code>.' },
    { icon: "cost", k: "Возврат в типе", v: 'У <code>Func</code> <span class="hl">последний тип-аргумент — возврат</span> (реальный прогон: арность <code>4</code> при 3 параметрах). <code>Action</code> возврата не имеет. <code>Predicate&lt;T&gt;</code> по форме = <code>Func&lt;T,bool&gt;</code>, но это <b>отдельный тип</b> — их не подменить напрямую.' },
    { icon: "avoid", k: "Вариантность", v: 'Параметр <code>in T</code> контравариантен: <code>Action&lt;object&gt;</code> присваивается к <code>Action&lt;string&gt;</code> (реальный прогон: <code>hello</code>). Возврат <code>Func</code> ковариантен (<code>out TResult</code>) — «any type that is more derived».' },
  ],

  foot: 'урок · <b>Func / Action / Predicate</b> · 6 анимир. разборов · возврат/void/bool · панель арности · вариантность · дизайн <b>mid</b>',
};
