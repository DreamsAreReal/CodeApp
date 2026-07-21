/**
 * Lesson: Вариантность делегатов (CS.S4.delegate-variance) — expert density, 6 animated
 * deep-dives. Covariance and contravariance give a delegate flexibility beyond an exact
 * signature match: a method may RETURN a more-derived type than the delegate declares
 * (covariance), and a method may ACCEPT a less-derived (base) parameter than the delegate
 * declares (contravariance). The generic Func<out T…>/Action<in T…> encode this with the out/in
 * modifiers, so Func<Dog> converts to Func<Animal> and Action<Animal> converts to Action<Cat>.
 * The senior contrast: delegate variance is type safe (the compiler proves the direction);
 * array covariance is NOT — it defers to a runtime ArrayTypeMismatchException.
 *
 * SIGNATURE machine panel (s5): generic covariance — Func<Dog> assigns to Func<Animal>, and the
 * value produced is really a Dog; the WRONG direction (Func<Animal> -> Func<Dog>) is a COMPILE
 * error CS0266. REAL run-csharp measurement (this file's exec cards): covariant return -> dog/Dog;
 * contravariant param -> handled: animal; Func<Dog>->Func<Animal> -> woof/True; array covariance
 * -> ArrayTypeMismatchException; wrong direction -> CS0266.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the EXACT page in sources[] (fetched + substring-
 *     checked 2026-07-21):
 *       · covariance-contravariance index (ms-variance): "covariance and contravariance enable
 *         implicit reference conversion…", "Covariance preserves assignment compatibility and
 *         contravariance reverses it.", the method-group "assign to delegates not only methods…"
 *         clause, the array-covariance clause + "But this operation is not type safe";
 *       · using-variance-in-delegates (ms-variance-del): "When you assign a method to a
 *         delegate, covariance and contravariance provide flexibility…", "Covariance permits a
 *         method to have return type that is more derived than that defined in the delegate.",
 *         "Contravariance permits a method that has parameter types that are less derived than
 *         those in the delegate type."
 *   - every card's verify.expect is the REAL stdout of the run-csharp exec cards on the app
 *     backend (c1: dog / Dog · c2: handled: animal / contravariance ok · c3: woof / True);
 *   - the s5/s6 machine-panel facts (Func<Dog>->Func<Animal> ok, array ArrayTypeMismatch, wrong
 *     direction CS0266) are OWN measurements of the run-csharp endpoint.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S4.delegate-variance/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the two directions — covariance preserves, contravariance reverses.
const Z_COV: Zone = { id: "cov", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "КОВАРИАНТНОСТЬ", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "возврат: более производный", subCls: "vz-zsub good", subY: 47 };
const Z_CONTRA: Zone = { id: "contra", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "КОНТРАВАРИАНТНОСТЬ", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "параметр: менее производный", subCls: "vz-zsub", subY: 47 };
const DIR_ZONES: Zone[] = [Z_COV, Z_CONTRA];

// s2: covariance on return — method returns Dog, delegate declares Mammal.
const Z_DELRET: Zone = { id: "delret", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Func<Mammal>", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "делегат ждёт Mammal", subCls: "vz-zsub", subY: 47 };
const Z_METHRET: Zone = { id: "methret", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "() => new Dog()", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "метод вернёт Dog", subCls: "vz-zsub good", subY: 47 };
const COVRET_ZONES: Zone[] = [Z_DELRET, Z_METHRET];

// s3: contravariance on parameter — method takes Animal, delegate declares Cat.
const Z_DELPAR: Zone = { id: "delpar", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Action<Cat>", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "делегат даёт Cat", subCls: "vz-zsub", subY: 47 };
const Z_METHPAR: Zone = { id: "methpar", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "void HandleAny(Animal)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "метод берёт Animal", subCls: "vz-zsub good", subY: 47 };
const CONTRAPAR_ZONES: Zone[] = [Z_DELPAR, Z_METHPAR];

// s4: generic variance modifiers out T / in T.
const Z_OUT: Zone = { id: "outz", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Func<out TResult>", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "out → ковариант", subCls: "vz-zsub good", subY: 47 };
const Z_IN: Zone = { id: "inz", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Action<in T>", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "in → контравариант", subCls: "vz-zsub", subY: 47 };
const MOD_ZONES: Zone[] = [Z_OUT, Z_IN];

// s5 (SIGNATURE): generic covariance conversion Func<Dog> -> Func<Animal>.
const Z_SRC: Zone = { id: "src", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Func<Dog>", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "makeDog", subCls: "vz-zsub good", subY: 47 };
const Z_DST: Zone = { id: "dst", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "→ Func<Animal>", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "makeAnimal", subCls: "vz-zsub", subY: 47 };
const CONV_ZONES: Zone[] = [Z_SRC, Z_DST];

// s6: type-safety contrast — delegate variance safe, array covariance not.
const Z_DELSAFE: Zone = { id: "delsafe", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ДЕЛЕГАТ · type safe", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "проверка компилятором", subCls: "vz-zsub good", subY: 47 };
const Z_ARRUNSAFE: Zone = { id: "arrunsafe", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "МАССИВ · НЕ safe", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "падает в рантайме", subCls: "vz-zsub", subY: 47 };
const SAFE_ZONES: Zone[] = [Z_DELSAFE, Z_ARRUNSAFE];

export const delegateVariance: LessonData = {
  id: "CS.S4.delegate-variance",
  track: "CS",
  section: "CS.S4",
  module: "S4.6",
  lang: "csharp",
  title: "Вариантность делегатов: ковариантность и контравариантность",
  kicker: "C# вглубь · S4 · in/out",
  home: { subtitle: "Ковариантность возврата, контравариантность параметра, out/in, type safety", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-variance", kind: "doc", org: "Microsoft Learn", title: "Covariance and Contravariance (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/", date: "2023-03-14" },
    { id: "ms-variance-del", kind: "doc", org: "Microsoft Learn", title: "Using variance in delegates (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/using-variance-in-delegates", date: "2024-06-18" },
  ],

  spec: [
    { text: "«Covariance preserves assignment compatibility and contravariance reverses it.»", source: "ms-variance" },
  ],
  edgeCases: [
    { text: "Ковариантность — про <b>возврат</b>: «Covariance permits a method to have return type that is <b>more derived</b> than that defined in the delegate».", source: "ms-variance-del" },
    { text: "Контравариантность — про <b>параметр</b>: «Contravariance permits a method that has parameter types that are <b>less derived</b> than those in the delegate type».", source: "ms-variance-del" },
    { text: "Вариантность массивов <b>не</b> типобезопасна: «Covariance for arrays… <b>But this operation is not type safe</b>» — реальный прогон даёт <code>ArrayTypeMismatchException</code> в рантайме.", source: "ms-variance" },
  ],

  misconceptions: [
    {
      wrong: "метод должен точно совпадать с сигнатурой делегата — байт в байт",
      hook: 'Точное совпадение <b>не</b> требуется: делегат допускает вариантность. «This enables you to assign to delegates <span class="hl">not only methods that have matching signatures, but also methods that return more derived types (covariance) or that accept parameters that have less derived types (contravariance)</span> than that specified by the delegate type». Направления зеркальны: «<b>Covariance</b> preserves assignment compatibility and <b>contravariance</b> reverses it». Конкретно: «Covariance permits a method to have <b>return type that is more derived</b>… Contravariance permits a method that has <b>parameter types that are less derived</b>». Дальше <b>шесть разборов</b>: две оси, ковариантность возврата (метод вернул <code>Dog</code> вместо <code>Mammal</code>), контравариантность параметра (метод взял <code>Animal</code> вместо <code>Cat</code>), обобщённые <code>out</code>/<code>in</code>, <b>машинная панель</b> — конверсия <code>Func&lt;Dog&gt;</code> → <code>Func&lt;Animal&gt;</code> (реальный прогон), и контраст с небезопасной вариантностью массивов.',
      source: "ms-variance",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Две оси · возврат vs параметр", title: "Ковариантность — по возврату, контравариантность — по параметру",
      viewBox: "0 0 340 210", zones: DIR_ZONES,
      code: ["// Ковариантность: метод возвращает БОЛЕЕ производный тип", "//   delegate: () -> Mammal   ←   method: () -> Dog", "// Контравариантность: метод принимает МЕНЕЕ производный тип", "//   delegate: (Cat) -> void ←   method: (Animal) -> void"],
      scenes: [
        { codeLine: 1, out: "", caption: '<b>Ковариантность</b> — про <span class="hl">возврат</span>: метод может вернуть более производный тип, чем объявил делегат. Dog там, где ждали Mammal.', nodes: [{ id: "cov", kind: "obj", at: { zone: "cov", row: 0 }, typeTag: "return", value: "Dog вместо Mammal", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<b>Контравариантность</b> — про <span class="hl">параметр</span>: метод может принять тип «шире» (менее производный). Animal там, где давали Cat.', nodes: [{ id: "cov", kind: "obj", at: { zone: "cov", row: 0 }, typeTag: "return", value: "Dog вместо Mammal" }, { id: "con", kind: "obj", at: { zone: "contra", row: 0 }, typeTag: "param", value: "Animal вместо Cat", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Направления <b>зеркальны</b>: ковариантность сохраняет совместимость присваивания, контравариантность её обращает. Обе безопасны — их проверяет компилятор.', nodes: [{ id: "cov", kind: "gate", at: { zone: "cov", row: 0 }, state: "ok", label: "возврат ↓", detail: "более произв." }, { id: "con", kind: "gate", at: { zone: "contra", row: 0 }, state: "ok", label: "параметр ↑", detail: "менее произв.", accent: true }], edges: [] },
      ],
      explain: 'Вариантность даёт делегату гибкость сверх точной сигнатуры. Базовое определение: «In C#, covariance and contravariance enable <b>implicit reference conversion</b> for array types, delegate types, and generic type arguments. <span class="hl">Covariance preserves assignment compatibility and contravariance reverses it</span>». Применительно к делегатам: «When you assign a method to a delegate, <b>covariance</b> and <b>contravariance</b> provide flexibility for matching a delegate type with a method signature». Две оси и их направления: «Covariance permits a method to have <b>return type that is more derived</b> than that defined in the delegate. Contravariance permits a method that has <b>parameter types that are less derived</b> than those in the delegate type». Запомнить просто: возврат может «сузиться» (ко-), параметр может «расшириться» (контра-).',
      sources: ["ms-variance", "ms-variance-del"],
    },
    {
      id: "s2", num: "02", kicker: "Ковариантность · возврат", title: "Метод возвращает Dog там, где делегат обещал Mammal",
      viewBox: "0 0 340 210", zones: COVRET_ZONES,
      code: ["class Mammal { public virtual string Name => \"mammal\"; }", "class Dog : Mammal { public override string Name => \"dog\"; }", "Func<Mammal> f = () => new Dog();   // Dog derives from Mammal → ковариантно", "Mammal m = f();  Console.WriteLine(m.Name);  // dog"],
      predictAt: 3, predictQ: '<code>Func&lt;Mammal&gt; f = () =&gt; new Dog();</code> — что напечатает <code>f().Name</code> при <code>Dog.Name = "dog"</code>?', console: true,
      scenes: [
        { codeLine: 2, out: "", caption: '<code>Func&lt;Mammal&gt;</code> обещает вернуть Mammal. Мы присваиваем лямбду, возвращающую <b>Dog</b> — <span class="hl">более производный</span> тип.', nodes: [{ id: "del", kind: "obj", at: { zone: "delret", row: 0 }, typeTag: "Func<Mammal>", value: "ждёт Mammal", accent: true }, { id: "meth", kind: "obj", at: { zone: "methret", row: 0 }, typeTag: "() => Dog", value: "вернёт Dog" }], edges: [{ id: "e", from: "meth", to: "del", accent: true }] },
        { codeLine: 2, out: "", caption: 'Присваивание <span class="hl">компилируется</span>: Dog — это Mammal, значит <b>Dog там, где ждали Mammal</b> безопасно. Это ковариантность возврата.', nodes: [{ id: "del", kind: "obj", at: { zone: "delret", row: 0 }, typeTag: "Func<Mammal>", value: "= () => Dog" }, { id: "meth", kind: "gate", at: { zone: "methret", row: 0 }, state: "ok", label: "Dog → Mammal", detail: "ковариантно ✓", accent: true }], edges: [] },
        { codeLine: 3, out: "dog\nDog", caption: '<code>f()</code> реально создаёт <b>Dog</b>: <code>m.Name</code> → <span class="hl">dog</span> (виртуальный вызов), <code>GetType()</code> → <b>Dog</b> (реальный прогон). Статически видим Mammal, в куче — Dog.', nodes: [{ id: "del", kind: "obj", at: { zone: "delret", row: 0 }, typeTag: "m: Mammal", value: "→ dog" }, { id: "meth", kind: "obj", at: { zone: "methret", row: 0 }, typeTag: "в куче", value: "Dog", accent: true }], edges: [] },
      ],
      explain: 'Ковариантность — гибкость по <b>возврату</b>: «Covariance permits a method to have <b>return type that is more derived</b> than that defined in the delegate». В доках это иллюстрируют так же: делегат объявляет возврат как <code>object</code>, но ему можно присвоить метод, возвращающий <code>string</code>. Здесь <code>Func&lt;Mammal&gt;</code> принимает лямбду <code>() =&gt; new Dog()</code>, потому что <code>Dog</code> происходит от <code>Mammal</code> — <b>Dog там, где ждали Mammal</b> типобезопасно (любой Dog является Mammal). Реальный прогон: статически <code>m</code> — <code>Mammal</code>, но в куче лежит <code>Dog</code>, и виртуальный <code>Name</code> даёт <code>dog</code>. Тот же принцип: более производный возврат сужает тип, оставаясь совместимым.',
      sources: ["ms-variance-del", "ms-variance"],
    },
    {
      id: "s3", num: "03", kicker: "Контравариантность · параметр", title: "Метод берёт Animal там, где делегат даёт Cat",
      viewBox: "0 0 340 210", zones: CONTRAPAR_ZONES,
      code: ["class Animal { public string Kind = \"animal\"; }", "class Cat : Animal { }", "void HandleAny(Animal a) => Console.WriteLine(\"handled: \" + a.Kind);", "Action<Cat> onCat = HandleAny;   // Animal шире Cat → контравариантно", "onCat(new Cat());  // handled: animal"],
      predictAt: 4, predictQ: '<code>Action&lt;Cat&gt; onCat = HandleAny;</code> где <code>HandleAny(Animal a)</code> печатает <code>a.Kind</code>. Что даст <code>onCat(new Cat())</code>?', console: true,
      scenes: [
        { codeLine: 3, out: "", caption: '<code>Action&lt;Cat&gt;</code> обещает передать в метод <b>Cat</b>. Мы присваиваем метод, берущий <span class="hl">Animal</span> — менее производный (широкий) тип.', nodes: [{ id: "del", kind: "obj", at: { zone: "delpar", row: 0 }, typeTag: "Action<Cat>", value: "даёт Cat", accent: true }, { id: "meth", kind: "obj", at: { zone: "methpar", row: 0 }, typeTag: "HandleAny", value: "берёт Animal" }], edges: [{ id: "e", from: "meth", to: "del", accent: true }] },
        { codeLine: 3, out: "", caption: 'Присваивание <span class="hl">компилируется</span>: метод, умеющий обработать любой Animal, справится и с Cat (Cat — это Animal). Это контравариантность параметра.', nodes: [{ id: "del", kind: "obj", at: { zone: "delpar", row: 0 }, typeTag: "Action<Cat>", value: "= HandleAny" }, { id: "meth", kind: "gate", at: { zone: "methpar", row: 0 }, state: "ok", label: "Animal ⊇ Cat", detail: "контравариантно ✓", accent: true }], edges: [] },
        { codeLine: 4, out: "handled: animal", caption: '<code>onCat(new Cat())</code> вызывает <code>HandleAny</code>: Cat спокойно передаётся как Animal, <code>a.Kind</code> = поле базы → <span class="hl">handled: animal</span> (реальный прогон).', nodes: [{ id: "del", kind: "obj", at: { zone: "delpar", row: 0 }, typeTag: "onCat(Cat)", value: "→ HandleAny" }, { id: "meth", kind: "obj", at: { zone: "methpar", row: 0 }, typeTag: "a.Kind", value: "animal", accent: true }], edges: [] },
      ],
      explain: 'Контравариантность — гибкость по <b>параметру</b>: «Contravariance permits a method that has <b>parameter types that are less derived</b> than those in the delegate type». В доках: делегат объявляет параметр как <code>string</code>, но ему можно присвоить метод, берущий <code>object</code>. Здесь <code>Action&lt;Cat&gt;</code> принимает метод <code>HandleAny(Animal)</code>, потому что метод, готовый к <b>любому</b> Animal, тем более обработает Cat. Практический смысл прямой: «With contravariance, you can use one event handler instead of separate handlers» — один обработчик с параметром <code>EventArgs</code> подходит и для <code>KeyEventArgs</code>, и для <code>MouseEventArgs</code>. Реальный прогон: <code>onCat(new Cat())</code> → <code>handled: animal</code> (метод видит Cat через ссылку Animal).',
      sources: ["ms-variance-del", "ms-variance"],
    },
    {
      id: "s4", num: "04", kicker: "Обобщённые · out / in", title: "Func<out T> ковариантен, Action<in T> контравариантен",
      viewBox: "0 0 340 210", zones: MOD_ZONES,
      code: ["public delegate TResult Func<out TResult>();      // out → ковариант по возврату", "public delegate void Action<in T>(T obj);         // in  → контравариант по параметру", "Func<Dog> makeDog = () => new Dog();", "Func<Animal> makeAnimal = makeDog;   // out T: Func<Dog> → Func<Animal>"],
      scenes: [
        { codeLine: 0, out: "", caption: 'У обобщённых делегатов вариантность <span class="hl">закодирована модификатором</span>. <code>out TResult</code> у <code>Func</code> — ковариантность по возврату.', nodes: [{ id: "out", kind: "obj", at: { zone: "outz", row: 0 }, typeTag: "out TResult", value: "ковариант", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>in T</code> у <code>Action</code> — контравариантность по параметру. Мнемоника: <b>out</b> = выходит наружу (возврат), <b>in</b> = входит (параметр).', nodes: [{ id: "out", kind: "obj", at: { zone: "outz", row: 0 }, typeTag: "out TResult", value: "ковариант" }, { id: "in", kind: "obj", at: { zone: "inz", row: 0 }, typeTag: "in T", value: "контравариант", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Потому <code>Func&lt;Dog&gt;</code> неявно конвертируется в <code>Func&lt;Animal&gt;</code> (<code>out</code>), а <code>Action&lt;Animal&gt;</code> — в <code>Action&lt;Cat&gt;</code> (<code>in</code>). Это <span class="hl">generic-вариантность</span>.', nodes: [{ id: "out", kind: "gate", at: { zone: "outz", row: 0 }, state: "ok", label: "Func<Dog>", detail: "→ Func<Animal>" }, { id: "in", kind: "gate", at: { zone: "inz", row: 0 }, state: "ok", label: "Action<Animal>", detail: "→ Action<Cat>", accent: true }], edges: [] },
      ],
      explain: 'С .NET Framework 4 вариантность работает и для обобщённых делегатов: «In .NET Framework 4 and later versions, C# supports <b>covariance and contravariance in generic interfaces and delegates</b> and allows for implicit conversion of generic type parameters». Кодируется это модификаторами в объявлении: <code>Func&lt;out TResult&gt;</code> помечает возврат как ковариантный (<code>out</code>), <code>Action&lt;in T&gt;</code> помечает параметр как контравариантный (<code>in</code>) — это ровно те <code>in</code>/<code>out</code>, что мы видели в объявлениях <code>Func</code>/<code>Action</code>/<code>Predicate</code> в соседнем уроке. Мнемоника: <b>out</b> — тип «выходит» (позиция возврата, ковариантен), <b>in</b> — тип «входит» (позиция параметра, контравариантен). Отсюда неявные конверсии <code>Func&lt;Dog&gt;</code> → <code>Func&lt;Animal&gt;</code> и <code>Action&lt;Animal&gt;</code> → <code>Action&lt;Cat&gt;</code>.',
      sources: ["ms-variance"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · конверсия Func", title: "Func<Dog> присваивается к Func<Animal>; обратно — CS0266",
      viewBox: "0 0 340 210", zones: CONV_ZONES,
      code: ["Func<Dog> makeDog = () => new Dog();", "Func<Animal> makeAnimal = makeDog;   // out T: ковариантно ✓", "Animal a = makeAnimal();", "Console.WriteLine(a.Sound);  // woof   ·   a is Dog → True"],
      predictAt: 1, predictQ: '<code>Func&lt;Animal&gt; makeAnimal = makeDog;</code> (где <code>makeDog: Func&lt;Dog&gt;</code>) — это скомпилируется?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>makeDog</code> — <code>Func&lt;Dog&gt;</code>. Хотим положить его в <code>Func&lt;Animal&gt;</code> — тип возврата «расширяется» Dog → Animal.', nodes: [{ id: "src", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "Func<Dog>", value: "makeDog", accent: true }, { id: "dst", kind: "gate", at: { zone: "dst", row: 0 }, state: "ok", label: "Func<Animal>", detail: "?" }], edges: [{ id: "e", from: "src", to: "dst", accent: true }] },
        { codeLine: 1, out: "", caption: '<code>Func&lt;out TResult&gt;</code> ковариантен → присваивание <span class="hl">компилируется</span>. Верно только в эту сторону: <code>Func&lt;Animal&gt;</code> → <code>Func&lt;Dog&gt;</code> дал бы <b>CS0266</b> (реальный прогон).', nodes: [{ id: "src", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "Func<Dog>", value: "makeDog" }, { id: "dst", kind: "gate", at: { zone: "dst", row: 0 }, state: "ok", label: "Func<Animal>", detail: "присвоено ✓", accent: true }], edges: [{ id: "e", from: "src", to: "dst" }] },
        { codeLine: 3, out: "woof\nTrue", caption: 'Вызов <code>makeAnimal()</code> реально создаёт <b>Dog</b>: <code>a.Sound</code> → <span class="hl">woof</span>, <code>a is Dog</code> → <b>True</b> (реальный прогон). Ковариантность не меняет фактический объект.', nodes: [{ id: "src", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "a: Animal", value: "→ woof" }, { id: "dst", kind: "obj", at: { zone: "dst", row: 0 }, typeTag: "в куче", value: "Dog (is Dog)", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — реально снятая конверсия и её граница. Собственный прогон: <code>Func&lt;Dog&gt;</code> присваивается к <code>Func&lt;Animal&gt;</code> (ковариантность <code>out</code>), а вызов даёт настоящий <code>Dog</code> (<code>a.Sound</code> = <code>woof</code>, <code>a is Dog</code> = <code>True</code>) — вариантность меняет только <b>статический</b> тип ссылки, не объект в куче. Направление <b>строго одно</b>: обратное присваивание <code>Func&lt;Animal&gt; → Func&lt;Dog&gt;</code> — ошибка компиляции (реальный прогон эндпоинта: <code>error CS0266: Cannot implicitly convert type \'System.Func&lt;Animal&gt;\' to \'System.Func&lt;Dog&gt;\'</code>), потому что не всякий Animal — Dog. Компилятор доказывает безопасность направления до рантайма — этим делегатная вариантность и отличается от массивной (следующий разбор).',
      sources: ["ms-variance"],
    },
    {
      id: "s6", num: "06", kicker: "Контраст · массивы не типобезопасны", title: "Вариантность делегата безопасна; ковариантность массива — нет",
      viewBox: "0 0 340 210", zones: SAFE_ZONES,
      code: ["string[] strings = new string[1];", "object[] objects = strings;   // ковариантность массива — компилируется", "objects[0] = 5;               // но 5 не строка → бросок В РАНТАЙМЕ", "// → ArrayTypeMismatchException"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Ковариантность массива <span class="hl">компилируется</span>: <code>string[]</code> присваивается к <code>object[]</code>. Выглядит как «более производный → менее производный».', nodes: [{ id: "safe", kind: "gate", at: { zone: "delsafe", row: 0 }, state: "ok", label: "делегат-вариант", detail: "compile-time ✓" }, { id: "arr", kind: "obj", at: { zone: "arrunsafe", row: 0 }, typeTag: "object[]", value: "= string[]", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Но запись <code>objects[0] = 5</code> кладёт <b>int</b> в массив строк. Компилятор это <span class="hl">пропускает</span> — здесь-то и прячется дыра.', nodes: [{ id: "safe", kind: "gate", at: { zone: "delsafe", row: 0 }, state: "ok", label: "делегат-вариант", detail: "проверен ✓" }, { id: "arr", kind: "gate", at: { zone: "arrunsafe", row: 0 }, state: "fail", label: "objects[0] = 5", detail: "int в string[]", accent: true }], edges: [] },
        { codeLine: 3, out: "ArrayTypeMismatchException", caption: 'Проверка уходит в <b>рантайм</b>: бросок <span class="hl">ArrayTypeMismatchException</span> (реальный прогон). Массивная вариантность НЕ типобезопасна — в отличие от делегатной.', nodes: [{ id: "safe", kind: "gate", at: { zone: "delsafe", row: 0 }, state: "ok", label: "делегат", detail: "safe" }, { id: "arr", kind: "gate", at: { zone: "arrunsafe", row: 0 }, state: "fail", label: "runtime throw", detail: "ArrayTypeMismatch", accent: true }], edges: [] },
      ],
      explain: 'Разбор, отделяющий безопасную вариантность от опасной. Вариантность массивов существует, но небезопасна: «Covariance for arrays enables implicit conversion of an array of a more derived type to an array of a less derived type. <b>But this operation is not type safe</b>». Реальный прогон подтверждает: <code>object[] objects = strings;</code> компилируется, но <code>objects[0] = 5;</code> бросает <b><code>ArrayTypeMismatchException</code></b> — проверка типа откладывается до рантайма. Делегатная вариантность фундаментально иная: она даёт лишь <b>implicit reference conversion</b>, направление которого компилятор доказывает статически (<code>Func&lt;out T&gt;</code>/<code>Action&lt;in T&gt;</code>), — попытка неверного направления не компилируется (CS0266, разбор 05), а не падает в рантайме. Правило: <b>ковариантность возврата</b> и <b>контравариантность параметра</b> у делегатов — type safe; ковариантность массивов — исторический компромисс, которого стоит избегать.',
      sources: ["ms-variance"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Mammal { public virtual string Name =&gt; "mammal"; } class Dog : Mammal { public override string Name =&gt; "dog"; } Func&lt;Mammal&gt; f = () =&gt; new Dog(); Mammal m = f(); Console.WriteLine(m.Name); Console.WriteLine(m.GetType().Name);</code> — обе строки?',
      options: ["dog\\nDog", "mammal\\nMammal", "dog\\nMammal", "mammal\\nDog"], correctIndex: 0, xp: 10,
      okText: '<b>Ковариантность возврата</b>: <code>Func&lt;Mammal&gt;</code> принимает метод, возвращающий <code>Dog</code> (более производный). В куче — реальный <code>Dog</code>: <code>Name</code> → <span class="hl">dog</span>, тип → <b>Dog</b>.',
      noText: 'Статический тип <code>m</code> — <code>Mammal</code>, но объект в куче — <code>Dog</code> (ковариантность возврата). Виртуальный <code>Name</code> → <code>dog</code>, <code>GetType()</code> → <code>Dog</code>. Реальный прогон.',
      verify: { kind: "exec", run: "dotnet run", expect: "dog\nDog" }, sourceRefs: ["ms-variance-del"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Animal { public string Kind = "animal"; } class Cat : Animal { } void HandleAny(Animal a) =&gt; Console.WriteLine("handled: " + a.Kind); Action&lt;Cat&gt; onCat = HandleAny; onCat(new Cat()); Console.WriteLine("contravariance ok");</code> — обе строки?',
      options: ["handled: animal\\ncontravariance ok", "handled: cat\\ncontravariance ok", "contravariance ok\\nhandled: animal", "handled: \\ncontravariance ok"], correctIndex: 0, xp: 10,
      okText: '<b>Контравариантность параметра</b>: <code>Action&lt;Cat&gt;</code> принимает метод, берущий <code>Animal</code> (менее производный). <code>onCat(Cat)</code> вызывает <code>HandleAny</code>, <code>a.Kind</code> — поле базы → <span class="hl">handled: animal</span>.',
      noText: 'Метод с параметром <code>Animal</code> годится там, где ждут <code>Cat</code> (Cat — это Animal). <code>a.Kind</code> = <code>"animal"</code> (поле базового класса). Реальный вывод: <code>handled: animal</code>, затем <code>contravariance ok</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "handled: animal\ncontravariance ok" }, sourceRefs: ["ms-variance-del"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Animal { public virtual string Sound =&gt; "..."; } class Dog : Animal { public override string Sound =&gt; "woof"; } Func&lt;Dog&gt; makeDog = () =&gt; new Dog(); Func&lt;Animal&gt; makeAnimal = makeDog; Animal a = makeAnimal(); Console.WriteLine(a.Sound); Console.WriteLine(a is Dog);</code> — обе строки?',
      options: ["woof\\nTrue", "...\\nFalse", "woof\\nFalse", "...\\nTrue"], correctIndex: 0, xp: 10,
      okText: '<code>Func&lt;out TResult&gt;</code> ковариантен → <code>Func&lt;Dog&gt;</code> присваивается к <code>Func&lt;Animal&gt;</code>. Вызов создаёт <b>настоящий Dog</b>: <code>Sound</code> → <span class="hl">woof</span>, <code>is Dog</code> → <b>True</b>.',
      noText: 'Generic-ковариантность (<code>out</code>) конвертирует <code>Func&lt;Dog&gt;</code> в <code>Func&lt;Animal&gt;</code>, не меняя объект: в куче Dog. <code>woof</code> и <code>True</code>. Обратное присваивание было бы CS0266. Реальный прогон.',
      verify: { kind: "exec", run: "dotnet run", expect: "woof\nTrue" }, sourceRefs: ["ms-variance"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Две оси", v: '<b>Ковариантность</b> — возврат может быть <span class="hl">более производным</span>; <b>контравариантность</b> — параметр может быть <span class="hl">менее производным</span>. «Covariance preserves assignment compatibility and contravariance reverses it». Точное совпадение сигнатуры не обязательно.' },
    { icon: "cost", k: "out / in", v: 'У обобщённых делегатов вариантность в модификаторах: <code>Func&lt;out TResult&gt;</code> (ковариант по возврату), <code>Action&lt;in T&gt;</code> (контравариант по параметру). Отсюда <code>Func&lt;Dog&gt;</code>→<code>Func&lt;Animal&gt;</code> (реальный прогон: <code>woof</code>, <code>True</code>). Обратно — CS0266.' },
    { icon: "avoid", k: "Type safety", v: 'Делегатная вариантность <b>type safe</b> — направление доказывает компилятор. Ковариантность <b>массивов</b> — нет: «But this operation is not type safe» → реальный прогон даёт <span class="hl">ArrayTypeMismatchException</span> в рантайме. Массивной вариантности избегай.' },
  ],

  foot: 'урок · <b>вариантность делегатов</b> · 6 анимир. разборов · ко-/контравариантность · out/in · панель Func<Dog>→Func<Animal> vs ArrayTypeMismatch · дизайн <b>mid</b>',
};
