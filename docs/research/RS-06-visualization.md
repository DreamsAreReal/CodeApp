# RS-06 — Визуализация CS/алгоритмов + внутренний корпус переиспользования

Линза R6. Дата: 2026-07-08. Автор: researcher фазы 1.
Продукт: Telegram Mini App для ежедневного изучения C#/.NET, CS-фундамента, алгоритмов и
внутренностей LLM. Явное требование пользователя: «визуализация и понятные объяснения,
но БЕЗ скрытия деталей».

Код/идентификаторы/команды — на английском; текст — русский.

---

## 1. TL;DR

1. **Главный научный вывод (доказан мета-исследованием 24 экспериментов):** педагогическую
   эффективность визуализации определяет НЕ красота картинки, а то, ЧТО ДЕЛАЕТ учащийся.
   Пассивный просмотр анимации почти не даёт прироста; значимый прирост — там, где учащийся
   ПРЕДСКАЗЫВАЕТ следующий шаг, ОТВЕЧАЕТ на вопросы по ходу, МЕНЯЕТ вход, СТРОИТ структуру
   (Hundhausen/Douglas/Stasko 2002). Это прямо ложится на North Star «активное припоминание»:
   визуализация обязана быть ИНТЕРАКТИВНОЙ механикой, а не видеороликом.
2. **Каркас «уровней вовлечения» (Naps 2002):** no viewing → viewing → responding → changing →
   constructing → presenting. Дизайн-правило: каждая тема должна дотягивать учащегося минимум
   до уровня *responding* (предсказать/ответить), топовые — до *changing/constructing* (свой вход,
   собрать структуру).
3. **Что делает визуализацию педагогичной, а не eye-candy** (Mayer, эмпирические принципы):
   сигналинг (подсветка активного элемента/строки), сегментация (шаги под управлением
   пользователя, а не автоплей), временна́я смежность (слово и картинка одновременно),
   когерентность (убрать украшательство, «seductive details» вредят). Темп ВСЕГДА под контролем
   пользователя (step/back/speed), а не заданный.
4. **Деконструкция эталонов** дала повторяемый паттерн «алгоритм-степпер»: панель управления
   play/pause · step ◄/► · skip · speed-slider · полная навигация по истории; синхронная подсветка
   строки псевдокода; пользовательский вход. Референсы по типам концептов:
   USF/Galles (canvas-степпер), VisuAlgo (псевдокод+e-Lecture), Python Tutor (память/указатели
   boxes-and-arrows), Loupe (event loop/конкурентность), bbycroft.net/llm + Transformer Explainer +
   BertViz (LLM/attention).
5. **Инструменты для TMA — измерено спайком (real min+gzip, не README):** для WebView с лимитом
   бандла лучший выбор — **vanilla Canvas/SVG для схем + anime.js v4 (13.3 KB gzip) для твинов**;
   `d3` брать ТОЛЬКО модульно (18.3 KB), не целиком (93 KB); маркетинговые «2.6 KB» у Motion
   относятся лишь к subpath `motion/mini` — реальный дефолт `motion` = 22 KB gzip. Lottie (77 KB) —
   только под готовые дизайнерские микроанимации, не под алгоритмы.
6. **Внутренний корпус переиспользования — беден по существу.** Дома только портфолио-сайты
   (Next/React/Tailwind, «звук+моушн» эстетика) и Python-CLI. Токенов вкуса / ассетов /
   алгоритм-viz кода под учебный TMA НЕТ. Переносимы лишь два ХАРНЕССА: (а) Vite+TS spike-скелет
   (test4/.spikes/probe) и (б) Lighthouse+Puppeteer perf/бандл-харнесс (test3 devDeps) — оба прямо
   полезны из-за критичности бандла. Подробно — §6.

---

## 2. Находки по под-темам

### 2.1 Педагогика визуализации: что реально работает (доказательная база)

**A. Мета-исследование эффективности алгоритм-визуализации.**
Hundhausen, Douglas, Stasko, «A Meta-Study of Algorithm Visualization Effectiveness», *Journal
of Visual Languages & Computing*, 2002. Систематический разбор **24 экспериментальных
исследований**. Ключевой вывод дословно по смыслу: «how students USE AV technology has a
greater impact on effectiveness than WHAT AV technology shows them» — значимые различия в
обучении кластеризуются в тех экспериментах, где была активная деятельность (предсказание
следующего состояния, ответы на вопросы, конструирование входа/визуализации), а не пассивный
просмотр. Технология «красивой анимации сама по себе» в CS-образование так и не «взлетела»
именно из-за смешанных результатов пассивных сценариев.
Источник (первичка, faculty-страница автора): https://faculty.cc.gatech.edu/~stasko/papers/jvlc02.pdf
(доступ 2026-07-08). Уверенность: **высокая** (рецензируемое, первоисточник).

**B. Таксономия вовлечения (engagement taxonomy).**
Naps et al., «Exploring the Role of Visualization and Engagement in Computer Science Education»,
ITiCSE working group, 2002/2003. Шесть уровней от низшего к высшему: **no viewing → viewing →
responding → changing → constructing → presenting**. Myller et al. (2009) расширили промежуточными
уровнями (controlled viewing, entering input, modifying, reviewing). Практический смысл: чем выше
уровень, тем сильнее (в среднем) обучение — это операционализация вывода мета-исследования.
Источники: ResearchGate (Naps 2002) https://www.researchgate.net/publication/220613467 ;
расширение Myller 2009 (PDF) http://cs.joensuu.fi/pages/int/pub/myller09.pdf (доступ 2026-07-08).
Уверенность: **высокая** (рецензируемое; каскад из ≥2 независимых групп).

**C. Мультимедийные принципы Mayer (что отличает педагогику от eye-candy).**
Релевантные линзе принципы:
- **Signaling** — выделять ключевое (подсветка активного узла/сравниваемой пары/текущей строки).
- **Segmenting** — подавать порциями под управлением пользователя; при контроле темпа лучше recall
  и transfer. Прямая директива: НЕ автоплей, а «шаг по тапу».
- **Temporal contiguity** — слово и соответствующая картинка одновременно, не последовательно.
- **Coherence** — убрать лишнее; декоративные детали («seductive details») мешают. Это научное
  основание правила «без eye-candy».
Источники: Mayer, «Applying the Science of Learning» (pressbooks компиляция)
https://pressbooks.pub/learningenvironmentsdesign/chapter/mayer-applying-the-science-of-learning-evidence-based-principles-for-the-design-of-multimedia-instruction/ ;
Mayer 2017, *J. Computer Assisted Learning* (DOI 10.1111/jcal.12197)
https://onlinelibrary.wiley.com/doi/abs/10.1111/jcal.12197 (доступ 2026-07-08).
Уверенность: **высокая** (первичка Mayer + рецензируемое).

**D. Dual coding (почему текст+визуал > только текст).**
Paivio (конец 1960-х): два независимых, но связанных канала — вербальный и образный;
одновременная подача слова и релевантной картинки усиливает удержание. Это фундамент требования
«dual coding» в North Star.
Источники: Wikipedia (обзор + ссылки на первички Paivio)
https://en.wikipedia.org/wiki/Dual-coding_theory ; Clark & Paivio 1991 «Dual Coding Theory and
Education» (ResearchGate) https://www.researchgate.net/publication/225249172 (доступ 2026-07-08).
Уверенность: **высокая** для теории; **средняя** для количественных эффект-сайзов (варьируют по мета-анализам).

> ⚠️ Возможная манипуляция/слоп-риск источников: часть выдач — SEO-агрегаторы (edume, waterbearlearning,
> structural-learning, grokipedia). В отчёт брались только факты, подтверждаемые первичкой Mayer/Paivio
> или рецензируемыми PDF; агрегаторы — лишь наводка. Доверие агрегаторам: **низкое**.

### 2.2 Деконструкция эталонных инструментов (КАК они это делают)

**USF Data Structure Visualizations (David Galles, University of San Francisco, 2011).**
Технология: **HTML5 Canvas + собственный JS-фреймворк анимации** (не SVG, не D3). Осознанный
выбор canvas ради совместимости с мобильными/слабыми браузерами (iPhone/iPad/Kindle). Модель
управления — **пошаговая**: Play/Pause, Step ◄/►, Skip ◄/►, регулятор скорости (сохраняется в
cookie), полная навигация назад по истории команд. Лицензия FreeBSD (переиспользуемо). Легаси —
Java/Swing и Flash (заброшены). Это КАНОНИЧЕСКИЙ паттерн «алгоритм-степпера».
Источник: https://www.cs.usfca.edu/~galles/visualization/about.html (доступ 2026-07-08).
Уверенность: **высокая** (первичка — страница автора инструмента).

**VisuAlgo (Steven Halim, NUS, с 2011; статья 2015).**
Технология: HTML5/CSS3/JavaScript; исходно Canvas, затем миграция части визуализаций на **SVG**.
Отличия от USF: **синхронная подсветка строки псевдокода** рядом с анимацией; режим **e-Lecture**
(слайды-объяснения); пользователь задаёт СВОЙ вход; единый интерфейс для десятков структур/алгоритмов.
Источники: статья VisuAlgo 2015 (ResearchGate) https://www.researchgate.net/publication/282210883 ;
сайт https://visualgo.net/en (доступ 2026-07-08). Уверенность: **высокая** (рецензируемая статья + сайт).

**algorithm-visualizer.org (open source).**
Технология: **React** (JS 83.9%/SCSS 13%). Архитектура — **tracer-based**: библиотеки-трейсеры
на разных языках (`tracers.*`) извлекают «команды визуализации» из кода алгоритма, фронт их
интерпретирует. Есть backend (компиляция/выполнение, GitHub-auth). Важный урок: разделение
«алгоритм эмитит события трассировки» ↔ «рендер проигрывает события» — то же, что у Python Tutor.
Источник (репозиторий): https://github.com/algorithm-visualizer/algorithm-visualizer (доступ 2026-07-08).
Уверенность: **высокая** (исходники).

**Python Tutor (Philip Guo; 25M+ пользователей) — эталон «память/указатели».**
Технология: хук в штатный отладчик языка (Python `bdb`, Java JDI, Ruby debug_inspector, JS —
Node debugger); код исполняется по одной строке, обходится граф объектов от globals и локальных
переменных, **записывается полный trace состояния stack+heap на каждом шаге**, trace уходит на
фронт и рендерится как интерактивная диаграмма. Память показывается **boxes-and-arrows**: объекты
раскладываются сеткой (вертикально в порядке создания, структурно одинаковые — горизонтально),
указатели/алиасинг — стрелками. Пользователь ходит вперёд/назад по шагам; фреймы стека с
локальными переменными + куча объектов. Прямо ложится на C#-темы: стек-фреймы, ссылки vs
значимые типы, boxing, aliasing.
Источники: pythontutor.com/visualize.html ; IEEE Software Blog «How Python Tutor Uses Debugger
Hooks» http://blog.ieeesoftware.org/2019/02/python-tutor.html ; UIST 2021 paper (PDF)
https://pg.ucsd.edu/publications/Python-Tutor-scalable-sustainable-research-software_UIST-2021.pdf
(доступ 2026-07-08). Уверенность: **высокая** (первичка автора + рецензируемое).

**Loupe (Philip Roberts, latentflip.com/loupe) — эталон «конкурентность/event loop».**
Визуализирует JS-рантайм в рантайме: **call stack + Web APIs + callback queue + event loop** как
связанные «дорожки», по которым «ездят» кадры выполнения. Родился из знаменитого доклада JSConf
EU 2014 «What the heck is the event loop anyway?». Паттерн **swimlane/таймлайн** переносится на
C# async/await (Task, конечный автомат, thread pool), даже если сам Loupe — про JS.
Источники: http://latentflip.com/loupe/ ; https://github.com/latentflip/loupe ;
доклад https://2014.jsconf.eu/speakers/philip-roberts-what-the-heck-is-the-event-loop-anyway.html
(доступ 2026-07-08). Уверенность: **высокая** (инструмент + исходники + доклад).

**LLM/attention — кластер эталонов «как работает трансформер».**
- **bbycroft.net/llm** — 3D-прогулка по nano-GPT (~85K параметров; демо сортирует буквы
  «C B A B B C» → «ABBBCC», модель из minGPT Карпатого); можно зумиться в каждый слой, attention-head,
  матричное умножение. Источник: https://bbycroft.net/llm (доступ 2026-07-08).
- **Transformer Explainer** (arXiv 2408.04619) — запускает **живой GPT-2 прямо в браузере** через
  **ONNX Runtime + Transformers.js**; фронт на **Svelte + D3**; визуализация — **Sankey-диаграмма
  «потока»** данных от токенов к предсказанию; **temperature-слайдер** в реальном времени;
  **multi-level abstraction** (высокоуровневые операции свёрнуты, разворачиваются анимацией до
  математики) — эталон «progressive disclosure без потери глубины». Источник:
  https://arxiv.org/html/2408.04619v1 (доступ 2026-07-08).
- **BertViz** (Jesse Vig) — attention как линии токен→токен, толщина = вес внимания; три вида:
  head / model (птичий обзор всех слоёв·голов) / neuron (query·key покомпонентно). Источники:
  https://github.com/jessevig/bertviz ; arXiv 1904.02679 (доступ 2026-07-08).
- **3Blue1Brown** «Attention»/«Transformers» — эталон визуального ОБЪЯСНЕНИЯ (не инструмент):
  https://www.3blue1brown.com/lessons/attention/ (доступ 2026-07-08).
Уверенность: **высокая** (инструменты живые + arXiv-статьи + исходники).

### 2.3 Лёгкие инструменты для TMA — измерено спайком (real numbers)

Артефакт: `/Users/admin/Desktop/test5/.spikes/r6-viz-bundle/` (`measure.mjs`, `PROBE-NOTES.md`,
`entries/`). Метод: esbuild 0.28.1 `--bundle --minify --format=esm --tree-shaking`, gzip level 9,
Node v26.4.0. Импорты — реалистичные (что реально нужно для степпера/boxes-and-arrows). Таблица — §3.3.
Уверенность в числах: **высокая** (исполненный код; сходятся с независимыми веб-репортами на ±5–10%).

Ограничения WebView Telegram (первичка + практики):
- Mini App работает в WebView; тяжёлые анимации и ресурсоёмкие задачи проседают на слабых
  устройствах. CloudStorage — до **1024 items на пользователя** (для дерева SRS этого может не
  хватить → бэкенд, см. §4/открытые вопросы). Практики советуют держать бандл небольшим (называют
  ориентир ~650 KB до публикации), lazy-load, WebP/сжатие.
  Источники: https://core.telegram.org/bots/webapps ; Habr обзор
  https://habr.com/en/articles/990338/ (доступ 2026-07-08). Уверенность: **высокая** (офдок) /
  **средняя** (числовой ориентир 650 KB — из практик, не из офдока).

### 2.4 Canvas vs SVG vs DOM — как рендерить

Перекрёстный бенчмарк (PMC, рецензируемое) + практические сводки: **Canvas** держит ~60 FPS на
тысячах объектов, деградация плавная/предсказуемая; **SVG/DOM** удобнее на МАЛОМ числе объектов
(≤ сотен) и дают доступность/searchability/hit-testing «из коробки», но деградируют выше ~1000
элементов; **WebGL** — только для 5000–10000+ (нам не нужно). Паттерны консистентны desktop/iOS/Android.
Вывод для нас: у алгоритм-визуализаций число элементов МАЛОЕ (массив на 20–50 ячеек, дерево,
граф) → **SVG/DOM выигрывает** (проще интерактив, подсветка, доступность, анимация через CSS);
Canvas — резерв для «густых» сцен (сортировка сотен столбиков, particles). Именно так и сделано в
эталонах: USF — Canvas (много состояний), VisuAlgo — миграция на SVG (интерактивность).
Источники: PMC бенчмарк https://pmc.ncbi.nlm.nih.gov/articles/PMC12843483/ ; JointJS
https://www.jointjs.com/blog/svg-versus-canvas (доступ 2026-07-08).
Уверенность: **высокая** (рецензируемый бенчмарк) / **средняя** (пороги в «элементах» ориентировочны).

---

## 3. Сравнительные таблицы

### 3.1 Уровень вовлечения → механика в TMA (операционализация Naps/Hundhausen)

| Уровень (Naps) | Что делает учащийся | Механика в приложении | Стоимость реализации |
|---|---|---|---|
| viewing | смотрит анимацию | автопрогон шага | низкая — но слабый эффект, НЕ базовый уровень |
| responding | отвечает по ходу | «какой элемент сравнится следующим?», «куда встанет pivot?» | низкая-средняя — **обязательный минимум** |
| changing | меняет вход | свой массив/строка/ключ → та же виз-механика | средняя — целевой для ключевых тем |
| constructing | строит структуру | «собери BST из вставок», «расставь узлы кучи» | высокая — для топ-тем/мастерства |
| presenting | объясняет | «объясни шаг своими словами» (в C# — комментарий/quiz) | средняя — мощно для метапамяти |

### 3.2 Тип концепта → техника → эталон → реализация в TMA

| Концепт | Техника визуализации | Эталон (деконструирован) | Реализация в TMA |
|---|---|---|---|
| Алгоритм (sort/search/graph) | пошаговый прогон + подсветка активных элементов + псевдокод-строка | USF/Galles, VisuAlgo, algorithm-visualizer | SVG-схема + степпер-контрол; **trace-события** отдельно от рендера |
| Структура данных (list/tree/heap/hash) | интерактивная диаграмма, анимация вставки/удаления | VisuAlgo, USF | SVG-узлы + CSS/anime.js твины переходов |
| Память: stack/heap/указатели | boxes-and-arrows, стрелки алиасинга, фреймы стека | **Python Tutor** | предзаписанный trace → SVG boxes+arrows; шаги ◄/► |
| Конкурентность: async/await, event loop, Task | swimlane-таймлайн: стек · очередь · пул | **Loupe** | дорожки-таймлайн (SVG) + подсветка перехода; для C# — конечный автомат async |
| LLM: токены/attention/поток | Sankey-поток, attention-линии (толщина=вес), progressive disclosure | Transformer Explainer, BertViz, bbycroft | SVG Sankey + heatmap-линии; свернуть/развернуть слои |

### 3.3 Инструменты анимации/виз для WebView — ИЗМЕРЕНО (min/gzip, KB)

| Библиотека (реалистичный импорт) | MIN | GZIP | Роль | Вердикт для TMA |
|---|---|---|---|---|
| vanilla Canvas/SVG (0 deps) | 0.1 | 0.1 | схемы, boxes-and-arrows, степпер | **база** — большинство виз делать так |
| motion/mini (animate only) | 7.7 | 3.0 | простые твины | ок, но без timeline/spring |
| **anime.js v4** (animate+timeline) | 33.5 | **13.3** | твины+таймлайны | **рекомендуемая аним-либа** |
| d3-modular (select/scale/transition/shape/array) | 52.8 | 18.3 | data-binding, шкалы, линии | брать при активной data-driven виз |
| motion (дефолт `motion`) | 61.7 | 22.1 | твины+spring+scroll | ок, но тяжелее anime |
| gsap (core) | 68.5 | 26.8 | мощные таймлайны | избыточно/тяжеловато |
| two.js (full) | 201.6 | 48.6 | 2D-сцена абстракция | не нужно |
| lottie-web (full) | 301.5 | 76.7 | проигрывание AE-анимаций | только под готовые микроанимации |
| d3 v7 (полный `import * as d3`) | 277.1 | 93.2 | — | **запрещено** (берём модульно) |

Проверка провенанса: gsap 26.8 (web-репорт 26.7), d3-full 93.2 (web 90.7), lottie 76.7 (web 75.0)
— сходятся → числам доверяем. КОРРЕКЦИЯ: заявленные Motion «2.6 KB» относятся к `motion/mini`
(измерено 3.0), а НЕ к дефолтному `motion` (22.1). README-цифру брать было бы ошибкой.

### 3.4 Canvas vs SVG/DOM — когда что

| Критерий | Canvas | SVG/DOM |
|---|---|---|
| Много объектов (>1000) | **лучше** (60 FPS, плавная деградация) | деградирует |
| Мало объектов (десятки) — наш случай | ок, но всё руками | **лучше**: hit-test, hover, CSS-анимация |
| Интерактив/подсветка/доступность | вручную | **встроено** (DOM-события, ARIA) |
| Ретина/масштаб | следить за DPR | **вектор из коробки** |
| Пример-эталон | USF/Galles | VisuAlgo (миграция на SVG) |

---

## 4. Конкретные рекомендации для ТЗ / дизайна

**R1 — Визуализация = интерактивная механика, а не ролик (доказательно).** Каждая
виз-единица обязана требовать действия учащегося минимум уровня *responding* (предсказать
следующий шаг / ответить). Автоплей-«кино» без действия запретить как научно неэффективное
(Hundhausen 2002; Naps 2002). Это одновременно закрывает North Star «активное припоминание».

**R2 — Единый компонент «StepPlayer» (переиспользуемый примитив).** Реализовать один
контрол: play/pause · step ◄/► · skip · speed · навигация по истории (паттерн USF/Galles).
Разделить **модель trace-событий** (алгоритм эмитит шаги: compare/swap/visit/insert) и **рендер**
(проигрывает шаги) — как у Python Tutor и algorithm-visualizer. Это даёт: детерминированное
воспроизведение, дешёвое добавление алгоритмов, тестируемость (проверять trace-события кодом).

**R3 — Рендер: SVG/DOM по умолчанию, Canvas — как исключение.** Для схем структур/памяти/потоков
брать SVG (интерактив, доступность, ретина). Canvas включать точечно для «густых» сцен (сортировка
сотен столбиков). Соответствует и требованию доступности из брейншторма (угол 5 — плохое зрение/
контраст: SVG легко масштабировать и озвучивать).

**R4 — Анимация: vanilla + anime.js v4 (13.3 KB gzip). D3 — только модульно.** Большинство
переходов — CSS/SVG-анимации без либы; там где нужны сложные таймлайны — anime.js v4. Полный
`d3` под запретом; при data-driven виз — точечные `d3-*` модули (≤18 KB). Motion — допустим, если
команда предпочтёт его API, но помнить: реальный вес 22 KB, а «2.6 KB» — только `motion/mini`.
Lottie — исключительно под заранее сделанные дизайнерские микроанимации (награды/празднование
стрика), не под алгоритмы. Бюджет виз-слоя: держать суммарно в пределах десятков KB gzip.

**R5 — Progressive disclosure как в Transformer Explainer.** Три слоя глубины из брейншторма
(угол 6: интуиция → механика → первоисточник) реализовать буквально по образцу Transformer
Explainer: высокоуровневая операция свёрнута, тап разворачивает анимацией до математики/кода.
Это единственный виденный эталон, который «не прячет детали» и не перегружает новичка одновременно.

**R6 — Библиотека эталонных виз-паттернов по типам концептов** (см. таблицу 3.2): степпер
(алгоритмы), boxes-and-arrows (память C#: стек/куча/ссылки/boxing — по Python Tutor), swimlane
(async/await/Task — по Loupe), Sankey+attention (LLM — по Transformer Explainer/BertViz). Каждый
паттерн — один переиспользуемый компонент, наполняемый данными темы.

**R7 — Сигналинг/сегментация/когерентность в дизайн-систему.** Подсветка активного элемента
(один акцентный цвет), «шаг по тапу» (не автоплей), слово+картинка одновременно, минимум декора.
Внести как жёсткие правила паспорта вкуса, а не пожелания (Mayer — эмпирические принципы).

**R8 — Бандл и перф под WebView — верифицировать харнессом.** Из-за WebView-ограничений завести
CI-проверку размера бандла и перфа (переиспользовать Lighthouse+Puppeteer-харнесс из test3, §6).
Порог бандла зафиксировать на гейте; ориентир практиков ~650 KB, но для «минуты смерти» в метро с
плохой сетью целиться существенно ниже.

**R9 — Персистентность SRS.** CloudStorage (1024 items/user) вероятно НЕ вместит дерево интервальных
повторений всего curriculum → вопрос бэкенда решать на гейте (пересекается с линзой TMA-стек).

---

## 5. Открытые вопросы

- **O1.** Точный числовой результат мета-исследования «сколько из 24 экспериментов дали значимый
  эффект» не извлечён (PDF не распарсился в среде: нет poppler/pdftotext). Качественный вывод
  (engagement > representation) — надёжен; конкретную дробь при необходимости добрать из полного текста.
- **O2.** Эффект-сайзы dual coding / segmenting в ЦИФРАХ (Cohen's d) варьируют по мета-анализам —
  для ТЗ хватает направления, но если понадобятся пороги — отдельный запрос к R1 (наука памяти).
- **O3.** Насколько агрессивно WebView Telegram троттлит `requestAnimationFrame`/тяжёлый SVG на
  реальных бюджетных Android — не измерено на устройстве; нужен полевой прогон (вне спайка).
- **O4.** Числовой ориентир бандла ~650 KB — из практик/блогов, не из офдока Telegram; уточнить
  собственным бюджетом на гейте.
- **O5.** Доступность (screen reader в WebView, `prefers-reduced-motion`) для виз-компонентов —
  не углублялся; связать с линзой доступности/UX.

---

## 6. Внутренний корпус переиспользования (честная оценка)

Прочитано: `~/.claude/portfolio/PORTFOLIO.md`; инспектированы `test3/`, `test4/`, Python-CLI.

| Проект дома | Что это | Стек | Переиспользуемо под TMA-виз? |
|---|---|---|---|
| test3 (Hero-макет) | портфолио «звук+моушн лаборатория» | Next 14 · React 18 · Tailwind 3 · Web Audio · Lighthouse+Puppeteer | **токены/ассеты — нет** (эстетика портфолио, палитра #1a1a2e/#8B5CF6 не для учебного продукта). **Харнесс Lighthouse+Puppeteer — ДА** (perf/бандл-проверка, прямо нужна, R8) |
| test4 (Портфолио wow) | ресёрч + probe | Vite + TS spike-скелет; refs Bruno Simon (three.js), Brittany Chiang | **Vite+TS spike-скелет — ДА** (скелет для viz-прототипов). Контент/референсы (three.js WebGL) — не про наш кейс |
| md2csv, wordfreq | Python CLI | stdlib-only Python | **нет** (не тот домен/модальность) |

**Вывод (честно): по существу переиспользовать почти нечего.** Нет ни одного алгоритм-viz
компонента, ни токенов вкуса под учебный TMA, ни ассетов. Портфолио-сайты — другая эстетика и
задача; Python-CLI — другая модальность. Переносимы ТОЛЬКО два инженерных ХАРНЕССА, и оба
кстати релевантны из-за критичности бандла/перфа:
1. **Lighthouse + Puppeteer** perf/бандл-харнесс (test3 devDeps: `lighthouse ^13.4.0`,
   `puppeteer ^25.3.0`) → переиспользовать как CI-проверку размера бандла и FPS/перфа (R8).
2. **Vite + TypeScript spike-скелет** (`test4/.spikes/probe/`: vite.config.ts, tsconfig, package)
   → как готовый скелет для дешёвых viz-спайков.
Плюс собственный спайк этой линзы `test5/.spikes/r6-viz-bundle/` (esbuild+gzip замер) — оставить
как переиспользуемый инструмент бюджетирования бандла.

Уверенность: **высокая** (прямая инспекция файлов, не память).

---

## 7. Источники (URL + дата доступа 2026-07-08)

Первичка / рецензируемое (A):
1. Hundhausen, Douglas, Stasko. A Meta-Study of Algorithm Visualization Effectiveness, JVLC 2002 —
   https://faculty.cc.gatech.edu/~stasko/papers/jvlc02.pdf
2. Naps et al. Exploring the Role of Visualization and Engagement in CS Education, 2002 —
   https://www.researchgate.net/publication/220613467
3. Myller et al. Extending the Engagement Taxonomy, 2009 (PDF) —
   http://cs.joensuu.fi/pages/int/pub/myller09.pdf
4. Mayer. Applying the Science of Learning (принципы) —
   https://pressbooks.pub/learningenvironmentsdesign/chapter/mayer-applying-the-science-of-learning-evidence-based-principles-for-the-design-of-multimedia-instruction/
5. Mayer 2017, J. Computer Assisted Learning, DOI 10.1111/jcal.12197 —
   https://onlinelibrary.wiley.com/doi/abs/10.1111/jcal.12197
6. Clark & Paivio 1991, Dual Coding Theory and Education —
   https://www.researchgate.net/publication/225249172
7. Python Tutor — UIST 2021 (PDF) —
   https://pg.ucsd.edu/publications/Python-Tutor-scalable-sustainable-research-software_UIST-2021.pdf
8. IEEE Software Blog: How Python Tutor Uses Debugger Hooks —
   http://blog.ieeesoftware.org/2019/02/python-tutor.html
9. Transformer Explainer, arXiv 2408.04619 — https://arxiv.org/html/2408.04619v1
10. BertViz, arXiv 1904.02679 — https://arxiv.org/pdf/1904.02679 ; https://github.com/jessevig/bertviz
11. Cross-Device Benchmark of Web Animation Systems (PMC) —
    https://pmc.ncbi.nlm.nih.gov/articles/PMC12843483/

Инструменты-эталоны / исходники (A/B):
12. USF Data Structure Visualizations — https://www.cs.usfca.edu/~galles/visualization/about.html
13. VisuAlgo — https://visualgo.net/en ; статья https://www.researchgate.net/publication/282210883
14. algorithm-visualizer — https://github.com/algorithm-visualizer/algorithm-visualizer
15. Loupe — http://latentflip.com/loupe/ ; https://github.com/latentflip/loupe ;
    доклад https://2014.jsconf.eu/speakers/philip-roberts-what-the-heck-is-the-event-loop-anyway.html
16. bbycroft LLM Visualization — https://bbycroft.net/llm
17. 3Blue1Brown Attention — https://www.3blue1brown.com/lessons/attention/

Платформа / инструменты (A/C):
18. Telegram Mini Apps (офдок) — https://core.telegram.org/bots/webapps
19. Habr: обзор Telegram Mini Apps — https://habr.com/en/articles/990338/
20. Motion feature comparison (размеры) — https://motion.dev/docs/feature-comparison
21. bundlephobia (d3 v7.9.0, gsap) — https://bundlephobia.com/package/d3
22. GSAP Vault сравнение (практики, C) — https://gsapvault.com/blog/gsap-vs-animejs-vs-motion
23. JointJS: SVG vs Canvas — https://www.jointjs.com/blog/svg-versus-canvas

Спайк (первичный артефакт этой линзы): `/Users/admin/Desktop/test5/.spikes/r6-viz-bundle/`
(measure.mjs + PROBE-NOTES.md + entries/; esbuild 0.28.1, Node v26.4.0).
