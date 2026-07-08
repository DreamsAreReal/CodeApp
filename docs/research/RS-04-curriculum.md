# RS-04 — Curriculum: тело знаний, порядок изучения (линза R4)

> **ПОПРАВКА (critic R1, 2026-07-08):** «−20–30% меньше повторений vs SM-2» (§1, §4.4, §7.2) —
> МОДЕЛЬНАЯ/сообществ. оценка, НЕ первоисточник. ДОКАЗУЕМО: FSRS ТОЧНЕЕ SM-2 (ниже log-loss) в
> ~99% коллекций (srs-benchmark). Выбор движка FSRS обоснован ТОЧНОСТЬЮ; число повторений — не
> факт-первичка.

Дата: 2026-07-08. Исследователь фазы 1. Все внешние ссылки проверены (accessed 2026-07-08).
Корпус правды: «мир» (авторитетные первоисточники — Microsoft Learn, arXiv/рецензируемое,
офиц. доки PostgreSQL/Anthropic/llama.cpp, каноничные книги CLRS/DDIA/GoF). Для C#/.NET —
привязка к learn.microsoft.com (актуальная ветка net-10.0). Память модели источником НЕ является.

ВАЖНО про MCP: инструментальные функции MCP (Microsoft Learn / Context7 / PubMed) в этом
прогоне НЕ были доступны как вызываемые функции — привязка к learn.microsoft.com выполнена
через прямой веб-доступ к тем же официальным страницам (эквивалентный первоисточник). Это
не деградация корпуса (нужный корпус — офиц. доки — доступен), но зафиксировано для честности.

---

## 1. TL;DR

- Весь запрошенный охват укладывается в **7 треков (T1–T7) → ~55 модулей → ~290 тем → ~1900–2400
  карточек** (оценка планирования, не измерение). Это БОЛЬШОЙ корпус: «весь curriculum сразу» —
  это ~1.5–2 года ежедневных занятий по 15–20 карточек. Ключевой вход для гейта: **вертикальный
  срез (1 трек до конца) vs горизонтальный минимум (по 1 модулю на трек) vs всё сразу**.
- Секвенция построена на **пререквизитах + спиральном подходе**: базовый «хребет» (типы данных →
  C# механики → структуры/алгоритмы → БД → архитектура), а T6/T7 (LLM) — параллельная ветка,
  которой достаточно T1-lite; спираль возвращает к темам на растущей глубине.
- Каждая тема имеет **авторитетный первоисточник**. Для «какой алгоритм/структура где» составлены
  9 сравнительных таблиц (раздел 4) — это ЯВНЫЙ запрос пользователя.
- Сам алгоритм приложения (SRS) — тоже единица curriculum: рекомендуется **FSRS** (не SM-2) и
  включить его разбор в трек как «мета-урок про то, как работает это приложение» (20–30% меньше
  повторений при той же удержке, точнее SM-2 в 99.6% коллекций — раздел 4.4).
- Волатильные факты (версии/тулинг T6/T7) привязаны к 2025–2026: .NET 10 LTS (ноя 2025),
  FSRS-6, AWQ (MLSys 2024), QLoRA (NeurIPS 2023), vLLM PagedAttention (SOSP 2023).

---

## 2. Корпусы и классы источников (что покрыто / нет)

| Трек | Корпус правды | Класс источника (иерархия) | Покрытие |
|---|---|---|---|
| T1 C#/.NET | офиц. доки | A — learn.microsoft.com (net-10.0) | высокое |
| T2 CS-фундамент | каноника | A — CLRS 4th ed (2022), learn.microsoft.com для .NET-специфики | высокое |
| T3 БД | офиц. доки + каноника | A — PostgreSQL docs (v18/current), B — DDIA (Kleppmann) | высокое |
| T4 Очереди/конкур. | офиц. доки | A — learn.microsoft.com (Channels), C — AWS/CloudAMQP (RabbitMQ↔Kafka) | среднее-высокое |
| T5 Дизайн ПО | каноника + курсы | A — GoF (1994), B — refactoring.guru, learn.microsoft.com (design-guidelines) | высокое |
| T6 Как работают LLM | рецензируемое + офиц. | A — arXiv (Transformer/RAG), Anthropic docs, B — Karpathy Zero-to-Hero | высокое |
| T7 Тюнинг локальных | рецензируемое + репо | A — arXiv (LoRA/QLoRA/AWQ), llama.cpp/vLLM repos+docs | высокое |
| SRS приложения | репо + бенчмарки | A — open-spaced-repetition (GitHub), B — Anki FAQ | высокое |

Не покрыто/слабо (см. раздел 7): точная перцептивная «сочность» геймификации (другая линза);
глубокая внутренняя механика конкретных индексов SQL Server vs PostgreSQL (взято на уровне
концепции B-tree, без вендор-специфики); свежие версии Ollama/vLLM на июль-2026 (концепции
стабильны, точные номера релизов — волатильны, не критичны для curriculum-структуры).

---

## 3. Дерево curriculum (треки → модули → темы) с секвенцией и источником

Обозначения: **[P]** — пререквизит; **[S]** — точка спирали (тема встречается повторно глубже).
Источник указан на уровне модуля (на темах — где отличается).

### T1 — C#/.NET (фундамент языка и рантайма)
Источник трека: Microsoft Learn, C# guide + .NET fundamentals (learn.microsoft.com), ветка net-10.0.
Актуальность: **.NET 10 = текущий LTS**, выпущен ноя 2025, поддержка до ноя 2028; .NET 8/9 EOS
10 ноя 2026 (devblogs.microsoft.com/dotnet/dotnet-8-9-end-of-support/).

- **M1.1 Программа на C#: типы, переменные, компиляция** — что такое CLR/IL/JIT, сборка, namespace.
  [P нет] Источник: learn.microsoft.com/dotnet/csharp/tour-of-csharp/.
- **M1.2 Система типов: value vs reference** — стек vs куча, где что живёт, копирование по значению
  vs по ссылке, `struct` vs `class`, nullable. [P M1.1] [S — вернётся в M1.7 span].
  Источник: learn.microsoft.com/dotnet/csharp/language-reference/builtin-types/value-types +
  .../reference-types.
- **M1.3 Boxing/unboxing** — упаковка value→object на куче (implicit), распаковка (explicit),
  цена (аллокация+копия), как generics это убирают. [P M1.2].
  Источник: learn.microsoft.com/dotnet/csharp/programming-guide/types/boxing-and-unboxing.
- **M1.4 Управление памятью и GC** — управляемая куча, поколения Gen0/1/2, LOH (≥85 000 байт,
  «gen3»), полная сборка = Gen2, IDisposable/using, финализаторы. [P M1.2, M1.3].
  Источник: learn.microsoft.com/dotnet/standard/garbage-collection/fundamentals +
  .../large-object-heap.
- **M1.5 Generics** — типобезопасность, отсутствие boxing, constraints, вариантность. [P M1.3].
  Источник: learn.microsoft.com/dotnet/csharp/fundamentals/types/generics.
- **M1.6 Делегаты, события, лямбды, функциональные интерфейсы** — Func/Action, замыкания.
  [P M1.5] Источник: learn.microsoft.com/dotnet/csharp/programming-guide/delegates/.
- **M1.7 Span<T>/Memory<T>, stackalloc** — работа без аллокаций, срезы. [P M1.4] [S от M1.2].
  Источник: learn.microsoft.com/dotnet/standard/memory-and-spans/.
- **M1.8 Исключения** — try/catch/finally, иерархия Exception, when-фильтры, best practices.
  [P M1.1] Источник: learn.microsoft.com/dotnet/csharp/fundamentals/exceptions/.
- **M1.9 Асинхронность: async/await (TAP)** — Task/Task<T>, «await не создаёт поток», контекст,
  дедлоки, ValueTask. [P M1.8, M4.* базово]. Источник:
  learn.microsoft.com/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model.
- **M1.10 LINQ** — отложенное выполнение, IEnumerable/IQueryable, методы vs синтаксис. [P M1.5, M1.6].
  Источник: learn.microsoft.com/dotnet/csharp/linq/.
- **M1.11 Records, pattern matching, современный C#** — immutability, value-equality, `with`,
  switch-expressions. [P M1.2]. Источник: learn.microsoft.com/dotnet/csharp/fundamentals/types/records.
- **M1.12 Конвенции именования и код-стайл** — PascalCase (типы/публичные члены), camelCase
  (параметры/локальные), `_camelCase` (приватные поля), `s_` (статические), `I`-префикс интерфейсов.
  [P — сквозной]. Источник: learn.microsoft.com/dotnet/csharp/fundamentals/coding-style/identifier-names
  + learn.microsoft.com/dotnet/standard/design-guidelines/capitalization-conventions.

### T2 — CS-фундамент (структуры данных, алгоритмы, сложность)
Источник трека: CLRS «Introduction to Algorithms», 4th ed., 2022, ISBN 9780262046305 (Cormen,
Leiserson, Rivest, Stein). Для .NET-реализаций — learn.microsoft.com (System.Collections.Generic).

- **M2.1 Big-O и анализ сложности** — асимптотика, худший/средний/амортизированный, время vs память.
  [P нет; изучать ПЕРВЫМ в T2]. Источник: CLRS ch.3 «Characterizing Running Times».
- **M2.2 Массивы и динамические массивы (List<T>)** — непрерывная память, амортизированный O(1)
  append, ресайз. [P M2.1]. Источник: learn.microsoft.com/dotnet/api/system.collections.generic.list-1.
- **M2.3 Связные списки** — одно/двусвязные, O(1) вставка/O(n) поиск, LinkedList<T>. [P M2.2].
  Источник: CLRS ch.10.
- **M2.4 Стеки и ОЧЕРЕДИ** — LIFO/FIFO, Stack<T>/Queue<T>, deque, кольцевой буфер, где применяются
  (undo, обход, планировщики). [P M2.3]. Источник: CLRS ch.10 + learn.microsoft.com/dotnet/api/
  system.collections.generic.queue-1.
- **M2.5 Хеш-таблицы** — хеш-функция, коллизии (цепочки vs открытая адресация/линейное
  пробирование), Dictionary<K,V>/HashSet<T>, O(1) средн. [P M2.1]. Источник: CLRS ch.11.
- **M2.6 Деревья: BST, сбалансированные (AVL, красно-чёрные)** — O(log n) при балансе, деградация
  до O(n). [P M2.5]. Источник: CLRS ch.12–13.
- **M2.7 B-деревья / B+-деревья** — многопутевые, оптимизированы под блочный I/O — мост к T3.
  [P M2.6] [S — раскрывается в T3 M3.4]. Источник: CLRS ch.18.
- **M2.8 Кучи и приоритетные очереди** — бинарная куча, heapify, PriorityQueue<TElement,TPriority>
  (.NET 6+). [P M2.6]. Источник: CLRS ch.6 + learn.microsoft.com/dotnet/api/
  system.collections.generic.priorityqueue-2.
- **M2.9 Tries (префиксные деревья)** — автодополнение, словари. [P M2.6]. Источник: CLRS
  (radix/строки) / Sedgewick Algorithms 4th (tries).
- **M2.10 Графы: представления и обходы (BFS/DFS)** — матрица/список смежности. [P M2.4, M2.8].
  Источник: CLRS ch.20–22.
- **M2.11 Кратчайшие пути: Dijkstra, (A*, Bellman-Ford)** — где: роутинг/навигация/сети. [P M2.10].
  Источник: CLRS ch.22 (Dijkstra), ch.24.
- **M2.12 Сортировки: Insertion, Merge, Quick, Heap, TimSort, Introsort** — стабильность,
  in-place, где применяются. [P M2.1, M2.8]. Источник: CLRS ch.2,6,7 + learn.microsoft.com/dotnet/
  api/system.array.sort (Introsort в .NET).
- **M2.13 Поиск: линейный, бинарный** — предусловия (сортированность). [P M2.1]. Источник: CLRS ch.2.
- **M2.14 Парадигмы: Divide & Conquer, жадные, динамическое программирование (DP)** — когда какая.
  [P M2.12]. Источник: CLRS ch.4,14,15.

### T3 — Базы данных
Источник трека: PostgreSQL Documentation (postgresql.org/docs/current, v18) + Kleppmann
«Designing Data-Intensive Applications» (DDIA, O'Reilly).

- **M3.1 Реляционная модель** — отношения, ключи (PK/FK), связи. [P нет]. Источник: DDIA ch.2.
- **M3.2 SQL: DDL/DML, JOIN, агрегаты, подзапросы** — [P M3.1]. Источник: postgresql.org/docs/current/
  tutorial-sql.html.
- **M3.3 Нормализация (1NF–3NF/BCNF)** и денормализация — когда нарушать. [P M3.1]. Источник: DDIA ch.2–3.
- **M3.4 Индексы (B-tree по умолчанию), hash/GIN/GiST** — как ускоряют, цена на запись, покрывающие
  индексы. [P M2.7, M3.2]. Источник: postgresql.org/docs/current/indexes.html + DDIA ch.3.
- **M3.5 Транзакции и ACID** — атомарность/консистентность/изоляция/долговечность. [P M3.2]. Источник:
  postgresql.org/docs/current/tutorial-transactions.html + DDIA ch.7.
- **M3.6 Уровни изоляции и аномалии** — Read Committed (снимок на statement), Repeatable Read
  (снимок на транзакцию, MVCC SI), Serializable (SSI); dirty/non-repeatable/phantom. [P M3.5].
  Источник: postgresql.org/docs/current/transaction-iso.html.
- **M3.7 MVCC и конкурентность** — версии строк, блокировки. [P M3.6]. Источник: DDIA ch.7 +
  postgresql.org/docs/current/mvcc.html.
- **M3.8 Планировщик запросов, EXPLAIN** — seq scan vs index scan, стоимость. [P M3.4]. Источник:
  postgresql.org/docs/current/using-explain.html.
- **M3.9 NoSQL и когда что** — key-value/document/wide-column/graph, CAP, репликация/шардинг. [P M3.7].
  Источник: DDIA ch.5–6,9.

### T4 — Очереди, сообщения, конкурентность
Источник трека: learn.microsoft.com (threading, Channels) + офиц. доки RabbitMQ/Kafka.

- **M4.1 Потоки, Task, пул потоков** — Thread vs Task, планирование, context switch. [P M1.9 связан].
  Источник: learn.microsoft.com/dotnet/standard/threading/.
- **M4.2 Синхронизация: lock/Monitor, Mutex, Semaphore, Interlocked** — гонки, дедлоки. [P M4.1].
  Источник: learn.microsoft.com/dotnet/standard/threading/overview-of-synchronization-primitives.
- **M4.3 Producer/Consumer и in-memory очереди: System.Threading.Channels** — bounded/unbounded,
  backpressure через WriteAsync, `Complete()`. [P M4.1, M2.4]. Источник:
  learn.microsoft.com/dotnet/core/extensions/channels.
- **M4.4 Брокеры сообщений: RabbitMQ** — очереди, exchange, роутинг, ack, push-модель. [P M4.3].
  Источник: rabbitmq.com/tutorials.
- **M4.5 Стриминг: Apache Kafka** — лог, партиции, offset, retention, pull-модель. [P M4.4].
  Источник: kafka.apache.org/documentation/.
- **M4.6 Паттерны: backpressure, idempotency, at-least/at-most/exactly-once, DLQ** — [P M4.5].
  Источник: DDIA ch.11 (streams).

### T5 — Дизайн ПО
Источник трека: GoF «Design Patterns» (1994) + refactoring.guru + learn.microsoft.com design-guidelines.

- **M5.1 SOLID** — SRP/OCP/LSP/ISP/DIP с C#-примерами. [P M1.5, M1.6]. Источник:
  refactoring.guru/design-patterns/... (SOLID) + оригинальные статьи Мартина.
- **M5.2 GoF порождающие** — Factory Method, Abstract Factory, Builder, Prototype, Singleton. [P M5.1].
  Источник: refactoring.guru/design-patterns/creational-patterns.
- **M5.3 GoF структурные** — Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy. [P M5.2].
  Источник: refactoring.guru/design-patterns/structural-patterns.
- **M5.4 GoF поведенческие** — Strategy, Observer, Command, State, Template Method, Iterator,
  Mediator, Chain of Responsibility, Visitor, Memento, ... [P M5.2]. Источник:
  refactoring.guru/design-patterns/behavioral-patterns.
- **M5.5 Чистая архитектура, слои, зависимости** — ports/adapters, DI-контейнер. [P M5.1]. Источник:
  learn.microsoft.com/dotnet/architecture/... + Martin «Clean Architecture».
- **M5.6 DDD (базово)** — сущности, value-объекты, агрегаты, bounded context. [P M5.5]. Источник:
  learn.microsoft.com/dotnet/architecture/microservices/... (DDD/CQRS) + Evans DDD.
- **M5.7 Тестирование и рефакторинг** — пирамида тестов, xUnit/NUnit, TDD, code smells. [P M5.1].
  Источник: refactoring.guru/refactoring + learn.microsoft.com/dotnet/core/testing/.

### T6 — Как работают LLM (Claude/Codex/копайлоты)
Источник трека: arXiv (Transformer/RAG), docs.anthropic.com, Karpathy «Neural Networks: Zero to Hero».

- **M6.1 Токенизация (BPE)** — subword, byte-level BPE, tiktoken, vocab GPT-2 ≈50 257, 256 базовых
  байт-токенов. [P нет]. Источник: github.com/openai/tiktoken + Karpathy «Let's build the GPT Tokenizer».
- **M6.2 Эмбеддинги и векторные пространства** — dense-векторы, косинусная близость. [P M6.1].
  Источник: Karpathy Zero-to-Hero (makemore) + оригинальные работы по word embeddings.
- **M6.3 Архитектура трансформера и self-attention** — Q/K/V, multi-head, позиционные кодировки,
  декодер. [P M6.2, M2.1]. Источник: «Attention Is All You Need», arXiv:1706.03762 (2017, NeurIPS).
- **M6.4 Обучение vs инференс** — предобучение, дообучение, forward pass, backprop (концептуально).
  [P M6.3]. Источник: Karpathy «Let's build GPT» + build-nanogpt.
- **M6.5 Контекстное окно и семплинг** — токены-окно (до 1M у Claude), temperature/top-p/top-k,
  greedy. [P M6.4]. Источник: docs.anthropic.com/en/docs/build-with-claude/context-windows.
- **M6.6 KV-кэш и prompt caching** — переиспользование префикса (не семантический кэш; кэш-чтение
  ~10% цены, запись +25% для 5-мин TTL у Anthropic). [P M6.5, M3.4-аналогия]. Источник:
  platform.claude.com/docs/en/build-with-claude/prompt-caching.
- **M6.7 RAG** — параметрическая vs непараметрическая память, retriever+generator (DPR+BART).
  [P M6.2, M3.9]. Источник: Lewis et al., arXiv:2005.11401 (NeurIPS 2020).
- **M6.8 Агенты и tool use** — планирование, вызовы инструментов, как устроены Claude Code/Codex/
  копайлоты (концептуально). [P M6.6, M6.7]. Источник: anthropic.com/engineering + docs.anthropic.com.

### T7 — Тюнинг локальных моделей
Источник трека: arXiv (LoRA/QLoRA/GPTQ/AWQ/PagedAttention) + репозитории llama.cpp/vLLM/Ollama.

- **M7.1 Железо и память: VRAM, что влезет** — параметры×байт/параметр, KV-кэш, оценка бюджета.
  [P M6.4]. Источник: docs vLLM/llama.cpp + QLoRA-статья (65B на 48GB).
- **M7.2 Квантизация: зачем и как** — FP16→INT8/INT4, потеря точности vs память. [P M7.1].
  Источник: AWQ arXiv:2306.00978; QLoRA arXiv:2305.14314.
- **M7.3 Форматы квантизации: GGUF vs GPTQ vs AWQ vs NF4** — GGUF (llama.cpp, авг 2023; Q4_K/Q5_K/
  Q6_K/Q8_0/IQ*); GPTQ (ICLR 2023); AWQ (MLSys 2024, «защита 1% salient весов»); NF4 (QLoRA). [P M7.2].
  Источник: github.com/ggml-org/ggml/blob/master/docs/gguf.md + arXiv:2306.00978.
- **M7.4 PEFT: LoRA и QLoRA** — низкоранговые адаптеры, NF4+double-quant+paged-optimizers. [P M7.2].
  Источник: LoRA arXiv:2106.09685 (ICLR 2022); QLoRA arXiv:2305.14314 (NeurIPS 2023).
- **M7.5 Fine-tune vs prompt/RAG — когда что** — цена/данные/цель. [P M7.4, M6.7]. Источник:
  сравнение fine-tune vs retrieval (напр. arXiv:2312.05934) + QLoRA/LoRA.
- **M7.6 Инференс-рантаймы: llama.cpp vs Ollama vs vLLM** — CPU/edge vs удобство vs серверный
  throughput (PagedAttention). [P M7.3]. Источник: github.com/ggml-org/llama.cpp; ollama.com;
  vLLM PagedAttention (SOSP 2023).

### Мета-модуль (сам продукт как объект изучения)
- **M0.1 Как работает ЭТО приложение: SRS (FSRS)** — активное припоминание, интервальные повторения,
  модель DSR (difficulty/stability/retrievability). Пользователь учит алгоритм, которым сам
  занимается. Источник: github.com/open-spaced-repetition/free-spaced-repetition-scheduler.
  (Полная научная база памяти — в отдельной линзе; здесь только SRS-алгоритм как единица curriculum.)

---

## 4. Сравнительные таблицы (ЯВНЫЙ запрос: «какой алгоритм/структура где»)

### 4.1 Структуры поиска: Hash-таблица vs BST/сбаланс. дерево vs B-дерево
| Свойство | Hash-таблица | Сбаланс. BST (RB/AVL) | B/B+-дерево |
|---|---|---|---|
| Поиск | O(1) средн., O(n) худш. | O(log n) | O(log n), мало обращений к диску |
| Упорядоченный обход / range | Нет (произвольный порядок) | Да, O(n) | Да — оптимально для диапазонов |
| Локальность/блочный I/O | Плохая | Средняя | Отличная (узел = блок диска) |
| .NET/типичная реализация | Dictionary<K,V>, HashSet<T> | SortedDictionary/SortedSet | — (внутри СУБД) |
| ГДЕ ИСПОЛЬЗУЕТСЯ | in-memory словари, кэши, дедуп, индексы по равенству | упорядоченные множества, диапазоны в памяти | **индексы СУБД (PostgreSQL default)**, файловые системы |
Источники: CLRS ch.11–13,18; postgresql.org/docs/current/indexes.html; learn.microsoft.com (System.Collections.Generic).

### 4.2 Сортировки: где какая
| Алгоритм | Сложность (средн./худш.) | Стабильна | In-place | ГДЕ ИСПОЛЬЗУЕТСЯ |
|---|---|---|---|---|
| Insertion sort | O(n²)/O(n²), O(n) на почти отсорт. | Да | Да | Малые массивы (≤16 в Introsort), «дошлифовка» |
| Merge sort | O(n log n) | Да | Нет (O(n) память) | Внешняя сортировка, где нужна стабильность; связные списки |
| Quick sort | O(n log n)/O(n²) | Нет | Да | Общий случай in-memory, база Introsort |
| Heap sort | O(n log n) | Нет | Да | Гарантия worst-case; fallback в Introsort |
| TimSort | O(n log n), O(n) на runs | Да | Нет | **Python `sorted`, Java `Arrays.sort` (объекты)** |
| **Introsort** | O(n log n) гарант. | Нет | Да | **.NET `Array.Sort`/`List.Sort`**: insertion ≤16 элементов, heapsort если разбиений > 2·LogN, иначе quicksort |
Источники: CLRS ch.2,6,7; learn.microsoft.com/dotnet/api/system.array.sort (net-10.0); en.wikipedia.org/wiki/Introsort.

### 4.3 Структура данных → где в стеке разработки
| Структура/алгоритм | Каноничное применение |
|---|---|
| Очередь (FIFO) | Брокеры сообщений (RabbitMQ), планировщики задач, BFS |
| Стек (LIFO) | Стек вызовов, undo/redo, DFS, разбор выражений |
| Куча (heap) | **Приоритетные очереди**, Dijkstra, top-K, планировщики ОС |
| Hash-таблица | Словари/кэши, индексы по равенству, дедупликация |
| B-дерево | **Индексы БД**, файловые системы (NTFS/ext4) |
| Trie | Автодополнение, роутинг по префиксу, спелчекер |
| Граф + Dijkstra | **Маршрутизация/навигация, сетевые протоколы (OSPF)** |
| DP | Diff, выравнивание, оптимальный раскрой, редакционное расстояние |
Источники: CLRS (соотв. главы); postgresql.org/docs/current/indexes.html.

### 4.4 SRS-алгоритм самого приложения: FSRS vs SM-2
| Свойство | SM-2 (SuperMemo, 1987) | FSRS (2022, open-spaced-repetition) |
|---|---|---|
| Модель | Фикс. формула, ease-factor ~2.5 | ML-модель DSR (difficulty/stability/retrievability) |
| Адаптивность | Одинаковая кривая для всех | Обучается на истории повторений пользователя |
| Параметры | Ease/интервалы вручную | ~21 параметр (FSRS-6), оптимизатор подбирает |
| Эффективность | база | **−20…30% повторений** при той же удержке; точнее в **99.6%** коллекций |
| Внедрение | классические Anki/SuperMemo | **default в Anki с v23.10 (ноя 2023)**, RemNote и др. |
Источники: github.com/open-spaced-repetition/free-spaced-repetition-scheduler (accessed 2026-07-08);
faqs.ankiweb.net/what-spaced-repetition-algorithm. РЕКОМЕНДАЦИЯ: строить движок приложения на FSRS.

### 4.5 Транспорт сообщений: in-memory Channels vs RabbitMQ vs Kafka
| Критерий | System.Threading.Channels | RabbitMQ | Apache Kafka |
|---|---|---|---|
| Область | В рамках одного процесса | Распределённый брокер очередей | Распределённый лог/стриминг |
| Модель доставки | in-proc await | push, удаляет после ack | pull, retention по времени |
| Пропускная способность | очень высокая (память) | ~4K–10K msg/s | до ~1M msg/s (sequential disk I/O) |
| Переигрывание | нет | нет (после ack) | да (в пределах retention) |
| Backpressure | bounded + WriteAsync | prefetch/QoS | consumer lag |
| ГДЕ | producer/consumer внутри app | таск-очереди, RPC, роутинг | ивент-пайплайны, аналитика, event sourcing |
Источники: learn.microsoft.com/dotnet/core/extensions/channels; aws.amazon.com/compare/the-difference-between-rabbitmq-and-kafka/ (класс C — сверено с офиц. позиционированием обоих проектов).

### 4.6 Квантизация: GGUF vs GPTQ vs AWQ vs NF4(QLoRA)
| Формат | Тип | Ключевая идея | Экосистема / где |
|---|---|---|---|
| GGUF (Q4_K,Q5_K,Q6_K,Q8_0,IQ*) | weight-only, пост-трен. | контейнер + смешанная квантизация | **llama.cpp/Ollama, CPU/edge** (введён авг 2023) |
| GPTQ | weight-only, пост-трен. | послойная реконструкция (2-й порядок) | GPU-инференс (ICLR 2023) |
| AWQ | weight-only, пост-трен. | защита ~1% salient весов через activation-aware scaling; без backprop | GPU, **MLSys 2024 Best Paper**, ~3× ускорение (TinyChat) |
| NF4 (QLoRA) | 4-bit для дообучения | инфо-теор. оптимально для нормальных весов + double-quant | **дообучение** на 1 GPU (NeurIPS 2023) |
Источники: github.com/ggml-org/ggml/blob/master/docs/gguf.md; AWQ arXiv:2306.00978; QLoRA arXiv:2305.14314; GPTQ arXiv:2210.17323.

### 4.7 Адаптация модели: prompting/RAG vs LoRA vs QLoRA vs full fine-tune
| Подход | Меняет веса | Память/цена | Когда |
|---|---|---|---|
| Prompting / few-shot | нет | минимум | быстрые правки поведения, нет данных |
| RAG | нет | инфраструктура retriever | нужны свежие/приватные ФАКТЫ |
| LoRA | адаптеры (низкий ранг) | средняя (базовая модель в FP16) | стиль/домен, есть GPU и данные |
| QLoRA | адаптеры поверх 4-bit | **низкая (65B на 48GB)** | дообучение при ограниченной VRAM |
| Full fine-tune | все веса | максимум | максимум качества, есть кластер/данные |
Источники: LoRA arXiv:2106.09685; QLoRA arXiv:2305.14314; RAG arXiv:2005.11401.

### 4.8 Инференс-рантаймы локальных моделей
| Рантайм | Сильная сторона | Формат | Типичное использование |
|---|---|---|---|
| llama.cpp | CPU/Apple Silicon/edge, минимум зависимостей | GGUF | локальный запуск на ноутбуке |
| Ollama | простота (pull/run), обёртка над llama.cpp | GGUF | «поставил и работает» локально |
| vLLM | серверный throughput, **PagedAttention** (потери KV-кэша <4% vs 60–80%, до 24× throughput) | HF/safetensors | продакшн-сервинг на GPU |
Источники: github.com/ggml-org/llama.cpp; ollama.com; PagedAttention SOSP 2023 (arXiv:2309.06180).

### 4.9 Уровни изоляции транзакций (T3) и аномалии
| Уровень | Dirty read | Non-repeatable | Phantom | Реализация PostgreSQL |
|---|---|---|---|---|
| Read Uncommitted | (в PG = RC) | — | — | как Read Committed |
| Read Committed (default) | нет | возможен | возможен | снимок на каждый statement |
| Repeatable Read | нет | нет | нет (в PG) | снимок на транзакцию (MVCC SI) |
| Serializable | нет | нет | нет | SSI (обнаружение конфликтов сериализации) |
Источник: postgresql.org/docs/current/transaction-iso.html (accessed 2026-07-08).

---

## 5. Оценка объёма контента на трек (вход для гейта режим/срез)

Оценка планирования (единица «карточка» = атом активного припоминания; «тема» = 4–10 карточек +
объяснение). Это ПРОГНОЗ, не измерение исполненным кодом.

| Трек | Модулей | Тем | Карточек (оценка) | Приоритет для джуна-C# |
|---|---|---|---|---|
| T1 C#/.NET | 12 | ~62 | ~380–460 | наивысший (ядро роли) |
| T2 CS-фундамент | 14 | ~60 | ~420–520 | высокий (алгоритмы/структуры — явный запрос) |
| T3 БД | 9 | ~42 | ~260–320 | высокий |
| T4 Очереди/конкур. | 6 | ~30 | ~180–230 | средний-высокий |
| T5 Дизайн ПО | 7 | ~48 | ~300–380 | высокий (23 GoF + SOLID + arch) |
| T6 LLM | 8 | ~40 | ~250–320 | средний (интерес пользователя) |
| T7 Тюнинг локальных | 6 | ~28 | ~170–220 | средний |
| M0 SRS-мета | 1 | ~4 | ~20–30 | низкий, но «вкусный» хук |
| **ИТОГО** | **~63** | **~314** | **~1980–2480** | — |

Интерпретация для гейта: при 15–20 карточках/день полный охват (первичное прохождение, без учёта
повторений) ≈ 110–165 дней ЧИСТОГО нового материала; с интервальными повторениями реальный
календарный срок до «всё пройдено и удержано» ≈ **12–20 месяцев**. Это подтверждает риск из STATE.md
(широта vs глубина). Отсюда варианты среза — раздел 8.

---

## 6. Секвенция: пререквизиты и спираль

**Глобальный «хребет» (критический путь):**
M2.1 Big-O → T1 (M1.2 типы → M1.3 boxing → M1.4 GC → M1.5 generics) → T2 структуры (M2.2→M2.12) →
T3 БД (индексы M3.4 опираются на B-деревья M2.7) → T5 дизайн (SOLID опирается на M1.5/M1.6).

**Параллельные ветки (можно вести одновременно, минимальный T1-пререквизит):**
- T4 конкурентность подключается после M1.9 async и M2.4 очередей.
- T6 LLM требует только M2.1 (Big-O) + базовую математику; НЕ требует остального C#. Может идти
  как «интересная ветка мотивации» с ранних дней.
- T7 тюнинг требует T6 (M6.4 обучение/инференс) как пререквизит.

**Спиральный подход** (принцип: возвращаться к теме на растущей глубине — снижает когнитивную
нагрузку и совпадает с интервальными повторениями приложения):
- Пример спирали «память»: M1.2 (стек/куча) → M1.3 (boxing как аллокация) → M1.4 (GC поколения) →
  M1.7 (Span для без-аллокаций) → M6.6 (KV-кэш как аналог кэширования).
- Пример спирали «деревья»: M2.6 (BST) → M2.7 (B-дерево) → M3.4 (B-tree индекс в СУБД) →
  M3.8 (планировщик выбирает index scan).
- Пример спирали «очереди»: M2.4 (Queue<T>) → M4.3 (Channels) → M4.4/4.5 (RabbitMQ/Kafka).

Обоснование секвенции опирается на пререквизитную структуру CLRS (сложность → структуры →
алгоритмы) и на порядок C#-guide Microsoft Learn (типы → память → generics → async).

---

## 7. Конкретные рекомендации для ТЗ/дизайна

1. **Модель контента = трек → модуль → тема → карточка.** Карточка — атом активного припоминания
   (вопрос/ответ, «объясни своими словами», «найди баг», код-ридинг). Тема несёт объяснение +
   визуал + 4–10 карточек. Это ложится и на геймификацию, и на FSRS-планировщик.
2. **Движок повторений — FSRS, не SM-2** (раздел 4.4): −20…30% повторений, точнее в 99.6% коллекций,
   есть готовые реализации (в т.ч. `fsrs-rs`, TS-FSRS, FSRS-Kotlin) под лицензиями OSS. Это снижает
   «боль» (меньше лишних повторов) — прямо отвечает цели «не больно».
3. **Не тащить весь curriculum в первую волну.** Рекомендуемый MVP-срез (см. раздел 8): вертикаль
   **T1 (M1.1–M1.6) + T2 (M2.1–M2.5, M2.12) + M0.1 SRS-мета** — это «ядро джуна-C#» + мотивационный
   мета-урок про само приложение. ~5 модулей-эквивалентов, ~180–230 карточек — реалистично наполнить
   качественно и проверить пейсинг.
4. **Каждая карточка → авторитетный источник в метаданных** (URL+раздел). Это (а) анти-slop для
   генерации контента, (б) даёт пользователю «нырнуть глубже» — совпадает с целью «без потери деталей».
5. **Сравнения — первоклассный тип контента.** Пользователь явно просил «какой алгоритм где». Ввести
   специальный формат карточки «Сравнение» (таблица + «когда X, когда Y») на базе таблиц раздела 4.
6. **Код-ридинг как жанр карточки** (особенно если сам app на C#/Blazor — открытый вопрос гейта):
   «прочитай этот кусок кодовой базы, что делает GC здесь». Прямо служит цели «как будто я сам написал».
7. **Волатильные треки (T6/T7) требуют версионирования контента** — версии тулинга/квантизаций
   меняются; помечать карточки датой факта и источником, ревизия раз в ~6–12 мес.
8. **Мета-урок M0.1** («как работает это приложение») — сильный ретенционный хук: пользователь-джун
   учится на инструменте, который сам изучает (рефлексивная петля), плюс объясняет геймификацию научно.

---

## 8. Варианты среза curriculum для гейта (трейдоф широта/глубина)

| Вариант | Что входит | Объём (карточки) | Плюсы | Минусы |
|---|---|---|---|---|
| A. Вертикаль-ядро (реком. MVP) | T1 M1.1–M1.6 + T2 базовые + M0.1 | ~180–230 | Глубоко, проверяемо, «ядро роли» | Узко: нет БД/LLM в 1-й волне |
| B. Горизонт-минимум | по 1–2 модуля из КАЖДОГО T1–T7 | ~350–450 | Широкий обзор всего охвата | Поверхностно, риск «слоя гугла» |
| C. Две вертикали | T1 полностью + T2 полностью | ~800–980 | C#-эксперт-трек | Долго до первого релиза |
| D. Всё сразу | T1–T7 целиком | ~1980–2480 | Полный охват | 12–20 мес; риск качества/пейсинга |

Рекомендация исследователя: **A на первую волну**, затем расширять волнами (T3→T5→T4→T6→T7). Это
соответствует и «интерактивный продукт» (ценность во времени — лучше глубокое ядро, чем широкий
тонкий слой), и риску из STATE.md.

---

## 9. Противоречия и оговорки источников

- **RabbitMQ↔Kafka числа пропускной способности** взяты из сравнительной страницы AWS (класс C,
  вендор-нейтральная, но не первоисточник-бенчмарк). Порядки величин (тысячи vs миллионы msg/s)
  согласуются с позиционированием обоих проектов, но точные цифры зависят от конфигурации —
  использовать как «порядок», не абсолют. Для ТЗ этого достаточно (концептуальное сравнение).
- **«Gen3»/LOH**: LOH логически собирается как часть Gen2; называть его «поколением 3» — упрощение
  из офиц. доки (LOH ≥85 000 байт). В карточках подавать аккуратно.
- **FSRS «−20…30%»**: цифра из бенчмарков сообщества open-spaced-repetition на >500M повторений
  Anki; это B-уровень (сообщество с верифицируемой историей + открытый датасет), не рецензируемая
  публикация. Для выбора движка достаточно, но пометить уровень.
- **Volatile T7**: точные имена квантов GGUF (IQ*-семейство) и номера релизов Ollama/vLLM меняются;
  в отчёте зафиксированы концепции и якорные статьи, не «последняя версия на сегодня».

## 10. Что не удалось выяснить / открытые вопросы

- Точный формат геймификации и «сочность» (перцептивная планка) — это ДРУГАЯ линза (эталоны
  обучающих продуктов); здесь только структура тела знаний.
- Нужен ли бэкенд/персистентность FSRS-параметров на сервере vs локально в Mini App — решение
  архитектуры/гейта, не curriculum.
- Язык контента (по умолчанию русский) и глубина каждого трека (сколько «атомов» реально писать) —
  зависят от выбранного среза на гейте.
- Стоит ли включать математический пререквизит (линейная алгебра для T6) как отдельный микро-трек —
  открытый вопрос: можно давать «интуицию без матана» или полноценно.
- Вендор-специфика БД (SQL Server vs PostgreSQL vs SQLite для Mini App) — B-tree концепция покрыта,
  но конкретный движок для примеров зависит от стека приложения (открытый вопрос гейта).

---

## 11. Источники (URL + дата доступа 2026-07-08)

C#/.NET (T1) — Microsoft Learn:
- learn.microsoft.com/dotnet/csharp/programming-guide/types/boxing-and-unboxing
- learn.microsoft.com/dotnet/standard/garbage-collection/fundamentals
- learn.microsoft.com/dotnet/standard/garbage-collection/large-object-heap
- learn.microsoft.com/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model
- learn.microsoft.com/dotnet/csharp/fundamentals/coding-style/identifier-names
- learn.microsoft.com/dotnet/standard/design-guidelines/capitalization-conventions
- learn.microsoft.com/dotnet/api/system.array.sort?view=net-10.0
- dotnet.microsoft.com/platform/support/policy ; devblogs.microsoft.com/dotnet/dotnet-8-9-end-of-support/

CS-фундамент (T2):
- CLRS «Introduction to Algorithms», 4th ed., 2022, ISBN 9780262046305 (MIT Press)
- learn.microsoft.com/dotnet/api/system.collections.generic.priorityqueue-2
- en.wikipedia.org/wiki/Introsort (вторично, к офиц. Array.Sort)

Базы данных (T3):
- postgresql.org/docs/current/transaction-iso.html
- postgresql.org/docs/current/indexes.html ; .../using-explain.html ; .../mvcc.html
- Kleppmann «Designing Data-Intensive Applications» (O'Reilly, DDIA)

Очереди/конкурентность (T4):
- learn.microsoft.com/dotnet/core/extensions/channels
- learn.microsoft.com/dotnet/standard/threading/
- aws.amazon.com/compare/the-difference-between-rabbitmq-and-kafka/ ; rabbitmq.com/tutorials ; kafka.apache.org/documentation/

Дизайн ПО (T5):
- refactoring.guru/design-patterns ; refactoring.guru/refactoring
- GoF «Design Patterns: Elements of Reusable OO Software» (1994)
- learn.microsoft.com/dotnet/architecture/

Как работают LLM (T6):
- arxiv.org/abs/1706.03762 — «Attention Is All You Need» (2017)
- arxiv.org/abs/2005.11401 — RAG, Lewis et al. (NeurIPS 2020)
- github.com/openai/tiktoken (BPE)
- docs.anthropic.com/en/docs/build-with-claude/context-windows
- platform.claude.com/docs/en/build-with-claude/prompt-caching
- karpathy.ai/zero-to-hero.html ; github.com/karpathy/nn-zero-to-hero ; github.com/karpathy/build-nanogpt

Тюнинг локальных (T7):
- arxiv.org/abs/2106.09685 — LoRA (ICLR 2022)
- arxiv.org/abs/2305.14314 — QLoRA (NeurIPS 2023)
- arxiv.org/abs/2306.00978 — AWQ (MLSys 2024 Best Paper)
- arxiv.org/abs/2210.17323 — GPTQ (ICLR 2023)
- arxiv.org/abs/2309.06180 — PagedAttention/vLLM (SOSP 2023)
- github.com/ggml-org/llama.cpp ; github.com/ggml-org/ggml/blob/master/docs/gguf.md ; ollama.com

SRS приложения (M0):
- github.com/open-spaced-repetition/free-spaced-repetition-scheduler
- faqs.ankiweb.net/what-spaced-repetition-algorithm
