# RS-08 — Архитектура построения интерактивных анимаций/визуализаций в уроках

Линза RS-08. Дата: 2026-07-08 (accessed). Автор: researcher.
Продукт: Telegram Mini App, ежедневное экспертное изучение C#/.NET/CS/LLM через интерактивные
визуализации. Дизайн-язык зафиксирован (STATE): `concepts/mid` — крем #F6F1E9 + коралл #F0533A,
Rubik/Onest. Эта линза — про ТЕХНИКУ ПОСТРОЕНИЯ, не про стиль.

Отношение к RS-06: RS-06 закрыл ПЕДАГОГИКУ (engagement-таксономия, Mayer) и дал верхнеуровневую
деконструкцию + замер бандлов аним-либ. RS-08 идёт ГЛУБЖЕ В РЕАЛИЗАЦИЮ: как именно устроен
step-render внутри эталонов, и даёт ПРОВЕРЕННУЮ СПАЙКОМ архитектуру переиспользуемого «живого
диаграммного движка» (модель→шаги→рендер) с рабочим API.

Код/идентификаторы — английский; текст — русский.

---

## 1. TL;DR

1. **Два инженерных паттерна step-visualization, оба деконструированы из исходников.**
   (а) **State-snapshot** (Python Tutor): на каждом шаге пишется ПОЛНОЕ сериализуемое состояние
   (stack+heap), рендер = чистая функция состояния, «прокрутка» = переход между двумя снимками.
   (б) **Command-log / delta** (algorithm-visualizer): алгоритм инструментируется, каждый вызов
   трейсера пушит команду `{key,method,args}` в плоский лог, маркер `delay` = граница шага, фронт
   ПРОИГРЫВАЕТ команды. Проверено по исходникам `Commander.ts`/`Tracer.ts` и тесту `Array1DTracer`.
2. **Рекомендуемая архитектура = гибрид, лучший для нашего кейса:** декларативная МОДЕЛЬ-снимок
   (`Scene`) на шаг → чистый `render(Scene)→SVG` → **keyed data-join** (D3 enter/update/exit) для
   реконсиляции → **FLIP** (First-Last-Invert-Play, только transform/opacity) для переходов →
   **детерминированный скраббер** (индекс = единственный источник правды). Один `Scene[]` обслуживает
   урок (predict-режим), дрилл (прыжок к шагу) и SRS-cue (замороженный кадр-миниатюра) — это и есть
   «living mental model».
3. **Спайк доказал архитектуру и её цену.** `/.spikes/rs08-living-diagram/` — рабочий движок (0 deps),
   `node test.mjs → PASS 7/7`: детерминизм рендера, random-access scrub == последовательный, swap =
   чистый FLIP `dx=[-64,+64]`, boxing = enter нового heap-узла+стрелки, reduced-motion режет переходы
   но сохраняет шаги, SRS-кадр сериализуется автономно. **Вес движка: 1.28 KB gz** (2.7 KB min);
   движок+2 рецепта — 2.0 KB gz. Практически бесплатно относительно бюджета <200 KB.
4. **Rive — измерен и отклонён для алгоритм-виз.** Brilliant использует Rive (не Lottie) ради
   State-Machine и малого веса .riv-файлов — НО для МОТИВАЦИОННЫХ микроанимаций (стрик/награды),
   которые рисует дизайнер. Реальный рантайм `@rive-app/canvas@2.38.5`: rive.wasm 1.94 MB
   (**716 KB gz**) + rive.js 336 KB (73 KB gz) = **~789 KB gz** и WASM грузится с unpkg CDN в рантайме
   (сетевая зависимость — плохо для оффлайн-поездки). Это ~600× нашего движка и в 4× превышает весь
   бюджет TMA. Вывод: Rive/Lottie — максимум под 1–2 наградные микроанимации, НЕ под пошаговые
   объяснения; ядро виз — код-движок на SVG.
5. **Мобильная механика переходов = WAAPI + FLIP, а не «толстая» либа.** `Element.animate()`
   (WAAPI, baseline с 2020) даёт `currentTime`-скраббинг и `playbackRate` нативно, GPU-ускоряет
   transform/opacity. Для детерминированного степпера этого + FLIP хватает без anime.js в большинстве
   сцен; anime.js v4 (13.3 KB gz, RS-06) — резерв для сложных таймлайнов. `prefers-reduced-motion` —
   первый класс: движок умеет резать переходы, сохраняя шаги (проверено спайком).
6. **Рендер-подложка: SVG/DOM по умолчанию** (десятки элементов, hit-test/подсветка/ARIA/ретина из
   коробки), Canvas — точечно для «густых» сцен (сортировка сотен столбиков, GC-heap с тысячами ячеек,
   attention-heatmap). Подтверждает RS-06 §2.4 и практику эталонов (USF=Canvas, VisuAlgo→SVG).

---

## 2. Корпусы и классы источников

| Вопрос | Корпус | Первоисточник (класс) | Покрытие |
|---|---|---|---|
| Внутр. устройство step-render эталонов | мир (исходники) | AV `Commander.ts`/`Tracer.ts` (A, код), PT trace-формат (A/C) | покрыто |
| Python Tutor: снимок stack/heap, REF | мир (первичка) | IEEE Software Blog + UIST 2021 (A), поля из вторички (C) | покрыто (REF-теги — средняя) |
| manim: сценирование | мир (офдок) | docs.manim.community building_blocks (A) | покрыто |
| D3 data-join enter/update/exit | мир (первичка автора) | bost.ocks.org/mike/join (A, Bostock) | покрыто |
| FLIP-техника | мир (первичка практика) | aerotwist.com (Paul Lewis, Google) (B) | покрыто |
| WAAPI scrubbing/currentTime | мир (офдок) | MDN Animation.currentTime (A) | покрыто |
| Rive vs Lottie у Brilliant + размеры | мир (кейс+пакет) | rive.app blog (C, вендор) + npm/unpkg замер (A) | покрыто; кейс-текст = вендор |
| Архитектура нашего движка + цена | артефакт | СПАЙК `rs08-living-diagram` (A, PASS 7/7) | покрыто, доказано |

PII-предохранитель: людей в корпусе нет — неприменимо.

> Слоп-риск: rive.app-блог — вендорский маркетинг (доверие C): фактические УТВЕРЖДЕНИЯ о преимуществах
> Rive не берём как истину; берём только (1) что Brilliant выбрал Rive для мотивационных анимаций и
> (2) независимо ИЗМЕРЕННЫЙ размер рантайма. Инъекций/манипуляций во внешнем контенте не обнаружено.

---

## 3. Находки: КАК технически построены эталоны (деконструкция реализации)

### 3.1 algorithm-visualizer.org — command-log / delta (по исходникам, класс A)

Ядро — `src/Commander.ts` и `src/Tracer.ts` (`algorithm-visualizer/tracers.js`, TypeScript).
Механика дословно из кода:
- Глобальный статический буфер `Commander.commands: Command[]`, `Command = {key, method, args}`.
- У каждого трейсера (`Array1DTracer`, `Array2DTracer`, `GraphTracer`, `ChartTracer`, `LogTracer`)
  — случайный 8-символьный `key`. Любой вызов метода делает `this.command(method, arguments)` →
  `Commander.command(key, method, JSON.parse(JSON.stringify(args)))`. Аргументы **глубоко клонируются
  через JSON** — гарантирует сериализуемость и детерминированный снимок значения на момент вызова.
- Методы-мутаторы (из теста `test/Array1DTracer.js`): `set`, `patch(i, value)`, `depatch(i)`,
  `select(i, j)`, `deselect(i, j)`, `selectRow/deselectRow`, `chart`, `reset`, `destroy`.
- **Граница шага = `Tracer.delay(lineNumber?)`** — статическая команда `{key:null, method:'delay'}`.
  Комментарий в коде: «Pause to show changes in all tracers». Т.е. между двумя `delay` накапливается
  пачка команд-дельт; фронт проигрывает их и на `delay` фиксирует кадр + подсвечивает строку кода.
- Лимиты-предохранители: `MAX_COMMANDS = 1_000_000`, `MAX_OBJECTS = 100`. Весь лог POST-ится JSON-ом
  на бэкенд (`/api/visualizations`), фронт (React) его интерпретирует.
Ключевой урок: **алгоритм не знает о рендере — он лишь эмитит команды-дельты; `delay` = тик степпера.**
Источник: https://github.com/algorithm-visualizer/tracers.js (`src/Commander.ts`, `src/Tracer.ts`,
`test/Array1DTracer.js`), доступ 2026-07-08. Уверенность: **высокая** (прямое чтение исходников).

### 3.2 Python Tutor — full state-snapshot (boxes-and-arrows)

Механика (RS-06 + уточнение): бэкенд хукается в штатный отладчик языка (Python `bdb`, Java JDI,
JS Node-debugger), исполняет по строке и на КАЖДОМ шаге пишет ПОЛНЫЙ снимок в JSON-трейс.
- Верхний уровень: `{ code, trace }`. `trace` — массив шагов.
- Поля шага (из вторичной документации формата, класс C): `line`, `event` (`step_line`/`call`/
  `return`/`exception`), `func_name`, `file_name`, `globals` (имя→значение), `ordered_globals`
  (порядок объявления — чтобы UI не прыгал), **`stack_to_render`** (массив фреймов: имя функции,
  `is_parent`, `frame_id`, локальные + `ordered_varnames`), **`heap`** (id→объект), `stdout`.
- **Кодирование объектов кучи — типизированные массивы с тегом первым элементом** (класс C/по
  первичке-описанию): `["LIST", e1, e2, ...]`, `["TUPLE", ...]`, `["DICT", [k,v], ...]`,
  `["INSTANCE", className, [attr, val], ...]`, `["FUNCTION", name, parentFrameId]`. Примитивы — инлайн.
- **Ссылки/алиасинг — `["REF", heapId]`**: значение переменной или элемента, указывающее на объект
  кучи, кодируется REF-ом; фронт рисует его СТРЕЛКОЙ к боксу объекта. Так рисуются aliasing, ссылки
  vs значения, циклы.
- **Раскладка**: heap-объекты сеткой (вертикально в порядке создания, структурно однотипные —
  горизонтально), стрелки — указатели. Фронт ходит вперёд/назад по массиву `trace` — весь UI есть
  чистая функция от одного элемента трейса.
Прямая проекция на C#: стек-фреймы, значимые vs ссылочные типы, boxing (значение уезжает в heap, на
стеке остаётся REF-бокс со стрелкой), aliasing двух переменных на один объект.
Источники: IEEE Software Blog «How Python Tutor Uses Debugger Hooks»
http://blog.ieeesoftware.org/2019/02/python-tutor.html ; UIST 2021 (PDF)
https://pg.ucsd.edu/publications/Python-Tutor-scalable-sustainable-research-software_UIST-2021.pdf ;
формат полей — вторичка (Runestone codelens / okpy/pytutor). Доступ 2026-07-08.
Уверенность: механика хук+полный снимок — **высокая**; точные REF/типовые теги — **средняя**
(первичный `pg_encoder.py` в этом прогоне не удалось вытащить — см. §7).

### 3.3 manim (3Blue1Brown) — императивный timeline-сценарий

Из офдока building_blocks (класс A): три класса — **Mobject** (визуальный примитив), **Animation**
(интерполятор между двумя состояниями mobject), **Scene** (оркестратор). Весь ролик — в
`construct()` подкласса Scene. Секвенсирование:
- `self.add(mobject)` — статически показать; `self.play(animation, run_time=...)` — проиграть
  анимацию (по умолчанию 1 с); `self.wait(t)` — пауза.
- Анимации: `Create` (прорисовка), `FadeIn/FadeOut` (opacity), **`Transform(a, b)`** (морфинг точек
  a→b), и `.animate`-синтаксис: `mob.animate.shift(...)` анимирует любой вызов метода.
Урок для нас: manim — АВТОРСКИЙ линейный таймлайн (для видео, не для интерактива), но паттерн
«Transform(from, to)» == наш FLIP-переход между двумя снимками. Мы берём модель Transform, но
управление отдаём ПОЛЬЗОВАТЕЛЮ (скраб), а не `run_time`.
Источник: https://docs.manim.community/en/stable/tutorials/building_blocks.html (2026-07-08).
Уверенность: **высокая**.

### 3.4 D3 data-join — декларативная реконсиляция состояния (Bostock, класс A)

`selection.data(array)` соединяет данные с DOM/SVG-узлами и даёт три подвыборки:
**enter** (данные без узлов → создать), **update** (совпавшие → обновить), **exit** (узлы без
данных → удалить). Один кодовый путь обрабатывает добавление/изменение/удаление без if-ов. Это
КАНОНИЧЕСКАЯ модель «состояние→DOM» и точный механизм, который мы применяем при переходе между
двумя шагами (какие узлы появились/исчезли/остались-и-двигаются). В нашем движке реализовано как
`diff(prev, next) → {enter, update, exit}` по стабильным `key`.
Источник: https://bost.ocks.org/mike/join/ (Mike Bostock, автор D3), доступ 2026-07-08.
Уверенность: **высокая**.

### 3.5 FLIP — производительные переходы позиции (Paul Lewis/Google, класс B)

**F**irst (замерить `getBoundingClientRect()` в старом состоянии) → **L**ast (применить конечный
класс, замерить) → **I**nvert (наложить обратный `transform: translate(-dx,-dy)`, визуально вернув
элемент на старое место) → **P**lay (включить transition/WAAPI, снять инверсию — элемент едет в
финал). Анимируются ТОЛЬКО compositor-свойства **transform/opacity** (GPU-поток), а не
layout-триггеры (`width/height/left/top`). Это ключ к 60fps на слабом мобиле. В нашем движке
`planFlip(prev,next,diff)` вычисляет `{key,dx,dy}` чисто (без DOM), DOM-адаптер накладывает инверсию
и играет через WAAPI.
Источник: https://aerotwist.com/blog/flip-your-animations/ (2026-07-08). Уверенность: **высокая**.

### 3.6 WAAPI — нативный детерминированный скраббер (MDN, класс A)

`Element.animate(keyframes, timing)` → `Animation`. Для степпера критично: **`animation.currentTime`
можно ПРИСВАИВАТЬ** — прыжок к произвольной точке (скраб/дрилл-jump); `playbackRate` — скорость;
`pause()/play()`; `persist()`. Baseline с марта 2020 во всех крупных браузерах. Оговорка: точность
`currentTime` может округляться приватностью браузера (Firefox 2ms, resistFingerprinting 100ms) —
для перцептивной анимации несущественно. Вывод: для скраббера НЕ нужен внешний timeline-движок —
WAAPI + FLIP закрывают детерминированную прокрутку нативно.
Источник: https://developer.mozilla.org/en-US/docs/Web/API/Animation/currentTime (2026-07-08).
Уверенность: **высокая**.

### 3.7 Rive у Brilliant — измерено (кейс C, размеры A)

Brilliant выбрал **Rive** (не Lottie) ради **State Machine** (переходы между состояниями без доп.
инженерии) и малого размера .riv; применяет для стрик/наградных микроанимаций (событийные триггеры
под счётчик стрика). Это подтверждает наш принцип «мотивационная анимация ≠ обучающая виз».
НО рантайм тяжёл (измерено на unpkg, класс A): `@rive-app/canvas@2.38.5` rive.wasm
1,941,759 B (**715,778 B gz**) + rive.js 336,005 B (72,847 B gz) ≈ **789 KB gz**, WASM тянется с
CDN в рантайме. Для алгоритм-виз под <200 KB TMA — неприемлемо.
Источники: https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations (кейс, C);
размеры — unpkg `@rive-app/canvas@2.38.5` (замер, A). Доступ 2026-07-08.
Уверенность: кейс — **средняя** (вендор); размеры — **высокая** (прямой замер).

### 3.8 Explorable Explanations / Bret Victor (контекст жанра)

Explorable explanations (Bret Victor «Learnable Programming»/«Up and Down the Ladder of Abstraction»,
каталог explorabl.es, Idyll, Tangle.js) — жанр «читатель МАНИПУЛИРУЕТ параметром и видит следствие»
(slider→живой пересчёт). Это операционализация уровня *changing* из RS-06 (Naps). Технически —
реактивная привязка «параметр→модель→рендер» (та же связка, что у нас: изменение входа = новый
`Scene[]`). Observable/D3 — тот же реактивный runtime для data-driven вариантов.
Уверенность: **средняя** (жанровый контекст; конкретные реализации Tangle/Idyll не деконструированы
в этом прогоне — наводка, не источник порогов).

---

## 4. Рекомендуемая архитектура: переиспользуемый «живой диаграммный движок»

Гибрид лучшего из эталонов, **проверен спайком** `/.spikes/rs08-living-diagram/` (PASS 7/7, 1.28 KB gz).

### 4.1 Слои (модель → шаги → рендер → переход → скраббер)

```
ДЕКЛАРАТИВНАЯ МОДЕЛЬ (снимок шага)      RENDER (чистая ф-я)        РЕКОНСИЛЯЦИЯ + ПЕРЕХОД
Scene {                                 render(Scene): VNode        diff(prev,next):
  nodes: DNode[]  // id,kind,x,y,text,     (SVG-дерево, детерм.)       {enter,update,exit}  // D3-join
         accent,ghost                   serialize(VNode): string    planFlip(prev,next,diff):
  edges: DEdge[]  // id,from,to,accent     (headless/SRS-кадр)         {key,dx,dy}[]        // FLIP
  caption?        // temporal contiguity
  codeLine?       // подсветка кода (VisuAlgo)      СКРАББЕР (индекс = единственный источник правды)
  predict?        // вопрос ПЕРЕД шагом (Naps>=responding)   StepPlayer(steps).goto(i)/next()/prev()
}                                                            .frame(i) -> SVG-строка (SRS-миниатюра)
Steps = Scene[]                                              opts.reducedMotion -> режет FLIP, шаги целы
```

### 4.2 API (из работающего `engine.ts`)

- `render(scene: Scene): VNode` — чистая, детерминированная (тот же Scene ⇒ байт-идентичный SVG).
  Позиция узла ТОЛЬКО через `transform: translate(x,y)` → FLIP-дружелюбно.
- `diff(prev, next): {enter, update, exit}` — keyed data-join по стабильным `key` (`n:<id>`, `e:<id>`).
- `planFlip(prev, next, diff): {key, dx, dy}[]` — чистый расчёт инверсии (без DOM); DOM-адаптер
  накладывает `translate(dx,dy)` и играет через `el.animate(..., {duration})` (WAAPI).
- `class StepPlayer(steps, {reducedMotion})` — `goto(i)`, `next()`, `prev()`, `frame(i)`; индекс —
  единственный стейт; `goto` для любого i детерминирован (дрилл-jump == последовательный проход).
- `class Recorder(nodes)` — command-log паттерн algorithm-visualizer: `set/swapPos/clearAccents` +
  `snapshot(scene?)` (== `delay`), `done(): Steps`. Автор инструментирует обычный код алгоритма.

### 4.3 Как ОДИН объект обслуживает урок + дрилл + SRS-cue (living mental model)

| Режим | Использование того же `Scene[]` |
|---|---|
| Урок (teach) | `next()` по тапу; на шаге с `predict` — сначала спросить, потом раскрыть (Naps *responding*) |
| Дрилл | `goto(random i)` и «что произойдёт на следующем шаге?» / «куда встанет pivot?» |
| Свой вход (*changing*) | пользователь меняет массив → `bubbleSortSteps(newArr)` → тот же движок, новый `Steps` |
| SRS-cue карточка | `frame(i)` = автономный SVG-снимок как миниатюра на карточке повторения |
| Тест контента | `serialize(render(scene))` в снапшот-тесте → регрессии виз ловятся кодом |

### 4.4 Когда какой рендер и какая либа

- **SVG/DOM по умолчанию** (наши сцены — десятки узлов): hit-test, hover, ARIA, ретина, CSS/WAAPI —
  из коробки. **Canvas** — точечно: сортировка сотен столбиков, GC-heap с тысячами ячеек,
  attention-heatmap большого размера (RS-06 §2.4: Canvas 60fps на тысячах, SVG деградирует >~1000).
- **Аним-либа**: в большинстве сцен — vanilla + WAAPI + FLIP (0 KB сверх движка). Сложные таймлайны
  (несколько параллельных дорожек с задержками) — **anime.js v4 (13.3 KB gz, RS-06)**. D3 — только
  модульно (`d3-scale`/`d3-shape`, ≤18 KB) под data-driven виз (Sankey attention, гистограммы).
  **Rive/Lottie — максимум 1–2 наградные микроанимации**, не ядро (Rive-рантайм 789 KB gz — §3.7).
- **`prefers-reduced-motion`**: `matchMedia('(prefers-reduced-motion: reduce)')` → `reducedMotion:true`
  → переходы мгновенные, шаги и подсветка целы (проверено спайком).

---

## 5. Конкретные рецепты визуализации по типам концептов охвата

Для каждого: ЧТО моделируем (`Scene`-узлы) и ЧТО анимируем (переход), какой эталон-паттерн, какой рендер.

| Концепт (наш охват) | Модель (nodes/edges) | Что анимируем (переход) | Паттерн-эталон | Рендер |
|---|---|---|---|---|
| **Стек/куча + указатели** | box-узлы стека (фреймы, локальные), box-узлы кучи, edge=REF-стрелка | появление heap-объекта (enter+fade), проведение стрелки, снятие фрейма при return (exit) | Python Tutor (§3.2) | SVG |
| **Boxing (C#)** | стек: `int i` (значение), `object o` (REF); куча: `[boxed] 5`; edge o→boxed | на `o=i` — enter boxed-узла + enter стрелки (проверено спайком, рецепт B) | Python Tutor | SVG |
| **Hash-таблица (коллизии/resize)** | массив-бакеты (box), цепочки (box+edge next) | insert: highlight бакета → enter узла в цепочку; **resize**: пересчёт слотов = массовый FLIP-переезд узлов в новые бакеты | AV-степпер + FLIP | SVG (Canvas если >1000 ячеек) |
| **Сортировки / обходы графов** | элементы-box (позиция=слот), для графа circle-узлы+edge | compare: accent пары; swap: FLIP-обмен позициями (dx=[-w,+w], проверено); visit: accent+галка | USF/Galles, VisuAlgo, AV | SVG; Canvas для сотен столбиков |
| **async/await state-machine (C#)** | swimlane-дорожки: call stack · Task/awaiter · thread pool; узел-«кадр» на дорожке | переход кадра между дорожками при `await` (FLIP-переезд), enter продолжения при завершении Task | Loupe (RS-06) | SVG (дорожки=линии) |
| **GC mark-sweep / поколения** | сетка heap-ячеек (объекты), корни, edge-ссылки; поколения = зоны | mark: волна accent по достижимым (обход рёбер); sweep: exit недостижимых (fade-out); promote: FLIP-переезд Gen0→Gen1 | Python Tutor heap + AV | SVG до ~сотен; Canvas для тысяч ячеек |
| **Трансформер attention** | токены (label-узлы), связи токен→токен (edge, вес=толщина/alpha) | slider температуры/головы → пересчёт весов = update-переход толщины (data-join); Sankey-поток | BertViz / Transformer Explainer (RS-06) | SVG + d3-shape (Sankey), Canvas/heatmap если крупно |

Общий инвариант всех рецептов: **автор пишет `Scene[]` (руками или через `Recorder`), движок один и
тот же.** Новый концепт = новые данные, не новый рендер-код.

---

## 6. Спайк-кандидаты и числа бандла

| Кандидат | Что доказывает | Статус / число |
|---|---|---|
| **`rs08-living-diagram` (наш движок)** | архитектура модель→шаги→рендер→FLIP→скраббер, детерминизм, reduced-motion, SRS-кадр | **PASS 7/7**, движок **1.28 KB gz** / +2 рецепта 2.0 KB gz |
| vanilla+WAAPI+FLIP | переходы 60fps без либы | WAAPI baseline 2020, FLIP=transform/opacity |
| anime.js v4 (RS-06) | сложные таймлайны | 13.3 KB gz — резерв |
| d3-modular (RS-06) | data-driven (Sankey/шкалы) | 18.3 KB gz — под attention/гистограммы |
| Rive `@rive-app/canvas` | designer-state-machine микроанимации | **789 KB gz рантайм + CDN-WASM → отклонён для ядра** |
| lottie-web (RS-06) | AE-микроанимации | 76.7 KB gz — только награды, если вообще |

Суммарный виз-слой при рекомендации: движок (1.3) + опц. anime (13.3) + опц. d3-модули (18.3) ≈
**<35 KB gz** на всё — с огромным запасом под бюджет <200 KB. Оставляет место контенту/шрифтам.

Не измерено (нужен браузер/устройство): реальные 60fps FLIP в WebView Telegram на бюджетном Android;
screen-reader по SVG в WebView. Вынесено в §7.

---

## 7. Что не удалось выяснить

- **O1.** Точный первичный `pg_encoder.py` Python Tutor (REF/типовые теги дословно) в этом прогоне не
  вытащен (GitHub API/raw отдавали пусто/404). Механика (хук+полный снимок+REF-стрелки) — надёжна;
  точные строковые теги (`"LIST"`/`"INSTANCE"`/`"REF"`) — уверенность средняя, добрать при реализации.
- **O2.** Реальный FPS FLIP-переходов и троттлинг `requestAnimationFrame`/WAAPI в WebView Telegram на
  среднем Android — только на устройстве (совпадает с RS-06 O3).
- **O3.** Доступность SVG-виз для screen-reader внутри Telegram WebView + корректность
  `prefers-reduced-motion` там же — не проверено на клиенте.
- **O4.** Tangle.js/Idyll (explorable explanations) не деконструированы по исходникам — жанровый
  контекст есть, конкретный API — нет (наводка).
- **O5.** Rive State-Machine как формат интерактивной анимации оценён только по вендор-кейсу+размеру;
  перцептивное качество не проверялось (и не нужно — отклонён по весу).

---

## 8. Рекомендация (почему лучше альтернатив)

**Строить собственный «живой диаграммный движок» на SVG по архитектуре §4** (модель-снимок → чистый
render → keyed data-join → FLIP-переход → детерминированный скраббер; `Recorder` в стиле
algorithm-visualizer для алгоритмов; boxes-and-arrows в стиле Python Tutor для памяти/boxing).

Почему это, а не готовые решения:
1. **Цена доказана**: движок 1.28 KB gz против 789 KB gz у Rive и десятков-сотен KB у тяжёлых либ —
   при жёстком бюджете TMA и кейсе «оффлайн в поездке» это решающе (Rive ещё и тянет WASM с CDN).
2. **Переиспользование доказано спайком**: один `Scene[]` = урок + дрилл + SRS-cue + снапшот-тест —
   прямо реализует «living mental model» из ТЗ; готовые аним-либы этого не дают (они про твины, не про
   декларативную модель состояния урока).
3. **Педагогика встроена в тип**: `predict` (Naps *responding*), `caption` (temporal contiguity),
   `accent` (signaling), `codeLine` (синхронная подсветка VisuAlgo), `reducedMotion` — не «поверх», а в
   модели. Соответствует доказательной базе RS-06.
4. **Детерминизм** (проверен): нужен и для скраба/дрилла (random-access == проход), и для тестируемости
   контента (снапшот SVG), и для SRS-миниатюр.
5. **Эталоны подтверждают паттерн**: разделение «эмиттер шагов ↔ проигрыватель» — общий инвариант
   Python Tutor и algorithm-visualizer (оба класса A, исходники/первичка).

Готовые инструменты — на своих местах: **anime.js v4** (13.3 KB) для редких сложных таймлайнов,
**d3-модули** (≤18 KB) для data-driven attention/гистограмм, **Rive/Lottie** — максимум под 1–2
наградные микроанимации (как у Brilliant), НЕ под обучающие пошаговые объяснения.

---

## 9. Источники (URL + accessed 2026-07-08)

Исходники / первичка (A):
1. algorithm-visualizer tracers — https://github.com/algorithm-visualizer/tracers.js
   (`src/Commander.ts`, `src/Tracer.ts`, `test/Array1DTracer.js`)
2. Python Tutor — IEEE Software Blog http://blog.ieeesoftware.org/2019/02/python-tutor.html ;
   UIST 2021 https://pg.ucsd.edu/publications/Python-Tutor-scalable-sustainable-research-software_UIST-2021.pdf
3. D3 data-join (Bostock) — https://bost.ocks.org/mike/join/
4. manim building blocks — https://docs.manim.community/en/stable/tutorials/building_blocks.html
5. WAAPI Animation.currentTime (MDN) — https://developer.mozilla.org/en-US/docs/Web/API/Animation/currentTime

Практики / кейсы (B/C):
6. FLIP (Paul Lewis, Google) — https://aerotwist.com/blog/flip-your-animations/
7. Rive у Brilliant (вендор-кейс, C) — https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations
8. Rive web runtimes — https://github.com/rive-app/rive-wasm ; размеры — unpkg `@rive-app/canvas@2.38.5`

Опора на RS-06 (эталоны USF/VisuAlgo/Loupe/BertViz/Transformer Explainer, замеры аним-либ, Mayer/Naps):
`/Users/admin/Desktop/test5/docs/research/RS-06-visualization.md`

Артефакт-спайк (первичный, этой линзы):
`/Users/admin/Desktop/test5/.spikes/rs08-living-diagram/` (`engine.ts`, `demo.ts`, `test.mjs`,
`PROBE-NOTES.md`; `node --experimental-strip-types test.mjs` → PASS 7/7; esbuild-замер 1.28 KB gz).
