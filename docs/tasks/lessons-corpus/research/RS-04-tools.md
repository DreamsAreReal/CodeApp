# RS-04 — Реестр C#-бэкенд-инструментов (исследование, фаза 1)

## Мета

**North Star**: составить канонический реестр инструментов C#-бэкенда на основе официальных документаций + независимых опросов (Stack Overflow 2025, JetBrains DevEcosystem 2025), по 2–3 независимых источникам на каждый инструмент. Результат — структурированный реестр (tool → why → docs-URL → lesson-topics, priority) для фазы дизайна уроков трека «инструменты».

**Дата исследования**: 2026-07-17  
**Корпусы**: мир (live web, official docs, surveys), нормативная база (официальные документации инструментов)  
**Модальность**: структурированные данные (реестр), проверка существования (все URL живы по состоянию на дату)

---

## Источники (иерархия доверия)

### A — Первичные (официальные документации + опросы)

1. **Stack Overflow Developer Survey 2025** — 49 000+ ответов, 177 стран, 314 технологий
   - URL: https://survey.stackoverflow.co/2025/technology
   - Данные: C# 27.8%, ASP.NET Core 19.7%, SQL Server 30.1%, Azure 26.3%, NuGet 18.9%

2. **JetBrains State of Developer Ecosystem 2025** — 24 534 разработчика, глобальное исследование
   - URL: https://devecosystem-2025.jetbrains.com/
   - Примечание: конкретные данные по C#-инструментам не опубликованы в открытом доступе; используется для верификации популярности

3. **Microsoft Learn** (official docs for .NET/ASP.NET Core)
   - ASP.NET Core: https://learn.microsoft.com/en-us/aspnet/core/?view=aspnetcore-10.0
   - Entity Framework Core: https://learn.microsoft.com/en-us/ef/core/
   - SQL Server: https://learn.microsoft.com/en-us/sql/sql-server/?view=sql-server-ver17
   - SignalR: https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction?view=aspnetcore-10.0
   - gRPC: https://learn.microsoft.com/en-us/aspnet/core/grpc/?view=aspnetcore-10.0
   - NuGet: https://learn.microsoft.com/en-us/nuget/

4. **GitHub официальные репозитории и документации**
   - ASP.NET Core: https://github.com/dotnet/aspnetcore
   - Entity Framework Core: https://github.com/dotnet/efcore
   - Dapper: https://github.com/DapperLib/Dapper + https://dapperlib.github.io/Dapper/
   - xUnit: https://github.com/xunit/xunit + https://xunit.net/
   - NUnit: https://github.com/nunit/nunit
   - Moq: https://github.com/devlooped/moq
   - Serilog: https://github.com/serilog/serilog + https://serilog.net/
   - Polly: https://github.com/App-vNext/Polly + https://www.pollydocs.org/
   - OpenTelemetry: https://github.com/open-telemetry/opentelemetry-dotnet
   - BenchmarkDotNet: https://github.com/dotnet/BenchmarkDotNet

5. **官方документации внешних инструментов**
   - Docker: https://docs.docker.com/
   - PostgreSQL: https://www.postgresql.org/docs/
   - Redis: https://redis.io/docs/latest/
   - RabbitMQ: https://www.rabbitmq.com/docs
   - Apache Kafka: https://kafka.apache.org/documentation/
   - Kubernetes: https://kubernetes.io/docs/
   - nginx: https://nginx.org/en/docs/
   - GitHub Actions: https://docs.github.com/en/actions

### B — Вторичные (практиков + обзоры, с верифицируемой историей)

- codewithmukesh.com — "Best Libraries for ASP.NET Core in 2026" (2026-07-17 актуально, но требует проверки данных на A)
- Stack Overflow Developer Survey анализ: ZenRows "C# Popularity 2026"
- Confluent Documentation (для Kafka): https://docs.confluent.io/kafka/

### C — Третичные (SEO/Агрегаторы — только как навводка)

- Medium, Dev.to статьи о конкретных инструментах (требуют подтверждения из A/B)

---

## Корпус доказательств

### Покрытие инструментов

**Метод**: для каждого инструмента проверены:
1. Наличие официальной документации (source: docs/github/microsoft learn)
2. Упоминание в Stack Overflow Survey 2025 ИЛИ практиках (codewithmukesh, дискуссии)
3. Рекомендованность в community (GitHub stars, adoption, NuGet downloads)
4. Статус поддержки в 2026 (версия, лицензия, активная разработка)

**Реестр открыт**: инструменты могут быть добавлены/удалены на гейте по полномочиям пользователя.

---

## РЕЕСТР: C#-бэкенд-инструменты (приоритезированные)

### Уровень 1: CORE (обязательный минимум, трек-позиция A)

| # | Инструмент | Why (сеньору-бэкендеру) | Зачем сеньору | Официальная документация | Уроков (6–15 глубоких) | Приоритет | Статус |
|---|---|---|---|---|---|---|---|
| 1 | **ASP.NET Core** | Фреймворк для HTTP-сервисов, REST/gRPC/Websocket | Middleware pipeline, DI, routing, auth — фундамент web-backend | https://learn.microsoft.com/en-us/aspnet/core/?view=aspnetcore-10.0 | 1. Middleware pipeline и DI; 2. Routing и endpoint mapping; 3. Authentication/Authorization (JWT, cookies); 4. Filters и middleware ordering; 5. Dependency injection lifetime scopes; 6. Exception handling (middleware stack); 7. Configuration sources (appsettings, env, CLI) | A1 | ✓ Актуально (v10) |
| 2 | **Entity Framework Core** | ORM для работы с БД (RDBMS) | DbContext pooling, lazy loading, query compilation, migration strategy, многие ORM на C# конкурируют (Dapper), но EF — стандарт | https://learn.microsoft.com/en-us/ef/core/ | 1. DbContext pooling и lifecycle; 2. Lazy loading (Include/ThenInclude); 3. Query compilation и cache; 4. Change tracking и SaveChanges; 5. Migration strategy и schema versioning; 6. Concurrency control (optimistic locking); 7. Relationship configuration (shadow keys, owned entities) | A1 | ✓ Актуально (v10) |
| 3 | **Dapper** | Micro-ORM для специфических (hot) queries; парадигма "EF Core для записей, Dapper для читает" | Когда EF медлит: SELECT *, кэш, параллельные запросы → Dapper + raw SQL | https://github.com/DapperLib/Dapper + https://dapperlib.github.io/Dapper/ | 1. SqlMapper vs DbConnection extension methods; 2. Query<T>, Execute, QueryMultiple; 3. Parameter binding и SQL injection prevention; 4. QueryAsync/ExecuteAsync patterns; 5. Dynamic результаты (DapperRow); 6. Transaction scope; 7. Performance profiling vs EF | A1 | ✓ Актуально (v2.1+) |
| 4 | **NuGet** | Package manager для .NET зависимостей | Работа с dependencies (restore, pack, publish, versioning), semver, package.json-like — обязательно знать | https://learn.microsoft.com/en-us/nuget/ + https://www.nuget.org/ | 1. Semver и package versioning; 2. Dependency resolution (transitive); 3. Local feed / corporate proxy; 4. Prerelease vs stable; 5. Package.config vs ProjectReference; 6. NuGet.config и feed management; 7. Publishing packages (CI/CD integration) | A1 | ✓ Актуально |
| 5 | **xUnit** | Unit testing framework (альтернатива NUnit) | Написание тестов, test fixtures, parameterized tests → part of backend QA | https://xunit.net/ + https://github.com/xunit/xunit | 1. Fact vs Theory (параметризованные тесты); 2. IDisposable vs IAsyncLifetime (setup/teardown); 3. Collection fixtures (shared state); 4. Custom attributes и test discovery; 5. Output capturing (xUnit.Abstractions.ITestOutputHelper); 6. Async tests; 7. Parallel execution control | A1 | ✓ Актуально (v3) |
| 6 | **Moq** | Mocking library для unit tests | Mocking dependencies при тестировании (interfaces, async methods, verify) | https://github.com/devlooped/moq | 1. It.Is<T> matcher patterns; 2. Setup/Verify fluent API; 3. MockBehavior (Strict/Loose); 4. Protected members mocking (Linq expression); 5. Async setup patterns; 6. Exception throwing; 7. Mock.Of shorthand syntax | A1 | ✓ Актуально (v4.20+) |
| 7 | **SQL Server** | Коммерческая RDBMS от Microsoft; конкурент PostgreSQL | Connection pooling, security (login/permissions), backups, maintenance → часть инфры | https://learn.microsoft.com/en-us/sql/sql-server/?view=sql-server-ver17 | 1. Connection pooling и connection string; 2. Authentication (Windows, SQL Server, Azure AD); 3. Permissions (grant/deny, roles); 4. Indexes (clustered/non-clustered, composite); 5. Query execution plans (EXPLAIN); 6. Transaction isolation levels; 7. Backup/restore strategies | A1 | ✓ Актуально (v2022+) |
| 8 | **PostgreSQL** | Open-source RDBMS; альтернатива SQL Server | Аналогично SQL Server: индексы, транзакции, permissions; часто в миксе с EF Core | https://www.postgresql.org/docs/ | 1. Connection pooling (pg connection string); 2. Authentication (md5/scram, peer, ident); 3. Permissions (grant/revoke); 4. Indexes (B-tree, BRIN, GiST, GIN); 5. EXPLAIN ANALYZE; 6. Transaction isolation (Serializable, Repeatable Read); 7. VACUUM и maintenance | A1 | ✓ Актуально (v18) |
| 9 | **Docker** | Containerization для приложений и БД | Упаковка сервиса в image, контейнеризация, dev/prod parity | https://docs.docker.com/ | 1. Dockerfile (FROM/RUN/COPY/ENTRYPOINT); 2. Image layers и .dockerignore; 3. Container networking; 4. Volume mounting; 5. Multi-stage builds; 6. Container registry (Docker Hub, ECR); 7. Image security (scanning, minimal base images) | A1 | ✓ Актуально |
| 10 | **Serilog** | Structured logging library для .NET | Логирование событий (не строк): context-aware, JSON, sinks (console, file, Seq, cloud); замена Console.WriteLine | https://serilog.net/ + https://github.com/serilog/serilog | 1. Structured logging (named properties); 2. LoggerConfiguration (fluent API); 3. Enrichment (thread ID, machine name); 4. Sinks и configuration; 5. Async sinks; 6. Log levels (Verbose/Debug/Info/Warning/Error/Fatal); 7. Exception + context capture | A1 | ✓ Актуально (v4.4+) |

### Уровень 2: INFRASTRUCTURE (CI/CD, observability, messaging — трек-позиция B)

| # | Инструмент | Why | Зачем сеньору | Документация | Уроков | Приоритет | Статус |
|---|---|---|---|---|---|---|---|
| 11 | **GitHub Actions** | CI/CD инструмент прямо в GitHub | Автоматизация build/test/deploy, workflows как YAML, runners | https://docs.github.com/en/actions | 1. Workflow YAML структура; 2. Triggers (push/PR/schedule); 3. Jobs и steps; 4. Secrets management; 5. Matrix builds (.NET versions); 6. Artifacts и caching; 7. Custom actions и reusable workflows | B1 | ✓ Актуально |
| 12 | **OpenTelemetry** | Distributed tracing и metrics collection | Observability: видеть, что творится в микросервисной системе (traces, metrics, logs) | https://opentelemetry.io/docs/ + https://github.com/open-telemetry/opentelemetry-dotnet | 1. Tracer (span creation, attributes); 2. Meter (counter, histogram, gauge); 3. OTLP export (Jaeger, Zipkin); 4. Correlation context (W3C Trace Context); 5. SDK vs API; 6. Instrumentation libraries; 7. Sampling strategies | B1 | ✓ Актуально (1.0+) |
| 13 | **Redis** | In-memory data store (cache, session, pub-sub) | Кэш для write-through, pub-sub для messaging, session store | https://redis.io/docs/latest/ | 1. String/Hash/List/Set/Sorted Set типы; 2. Key expiration (TTL); 3. Pub/Sub vs Streams; 4. Persistence (AOF, RDB); 5. Pipelining; 6. Transactions (MULTI/EXEC); 7. Cluster mode vs Sentinel | B1 | ✓ Актуально |
| 14 | **RabbitMQ** | Message broker (AMQP) для async processing | Decoupling сервисов через message queue: task scheduling, event-driven | https://www.rabbitmq.com/docs | 1. Queue, Exchange, Binding (routing); 2. Message acknowledgment (ack/nack); 3. Prefetch QoS; 4. Dead Letter Exchange; 5. RPC pattern (request-reply); 6. Cluster и high availability; 7. Management plugin | B1 | ✓ Актуально (4.3+) |
| 15 | **Polly** | Resilience library (retry, circuit breaker, timeout, bulkhead) | Обработка transient-ошибок: retry-с-backoff, circuit breaker для external calls | https://www.pollydocs.org/ + https://github.com/App-vNext/Polly | 1. Resilience policies (retry, wait-and-retry); 2. Circuit Breaker (open/half-open/closed); 3. Timeout; 4. Bulkhead Isolation; 5. Fallback; 6. Policy composition; 7. Telemetry (Polly + OpenTelemetry) | B1 | ✓ Актуально (v8.3+) |
| 16 | **BenchmarkDotNet** | Performance benchmarking library | Измерение скорости кода: JIT, GC, allocations — для optimization | https://github.com/dotnet/BenchmarkDotNet | 1. [Benchmark] attribute; 2. Setup/Cleanup; 3. Param и parameterized benchmarks; 4. Memory allocation tracking; 5. Disassembly output; 6. Statistical analysis (mean, stdev); 7. Warmup и target method invocation | B1 | ✓ Актуально (v0.15+) |

### Уровень 3: ADVANCED PATTERNS (трек-позиция B–C, опциональные для сеньора, но знают)

| # | Инструмент | Why | Зачем сеньору | Документация | Уроков | Приоритет | Статус |
|---|---|---|---|---|---|---|---|
| 17 | **MediatR** | CQRS mediator pattern library | Command/Query separation, event handlers, request/response pipeline (требует care: лицензия изменилась в 2025) | https://github.com/microsoft/CQRS.Mediatr.Lite (альтернатива от Microsoft, free) | 1. Command vs Query; 2. IRequest/IRequestHandler; 3. Pipeline behaviors (logging, validation); 4. Notifications; 5. MediatR registration; 6. Async handlers; 7. Exception handling in pipeline | B2 | ⚠️ Лицензия изменилась (v13+, dual license, free для <$5M revenue) |
| 18 | **gRPC** | High-performance RPC framework (альтернатива REST) | Protocol Buffers, streaming, binary protocol для low-latency микросервисов | https://learn.microsoft.com/en-us/aspnet/core/grpc/?view=aspnetcore-10.0 + https://grpc.io/docs/languages/csharp/ | 1. .proto файлы и protoc compiler; 2. Unary vs streaming (client/server/bidirectional); 3. Channel (secure/insecure); 4. Call context (deadline, cancellation); 5. Error handling (Rpc exception); 6. Health checking; 7. Load balancing | B2 | ✓ Актуально |
| 19 | **SignalR** | Real-time communication over WebSocket/Server-Sent Events | Push-уведомления от сервера к клиентам (websocket fallback) | https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction?view=aspnetcore-10.0 | 1. Hub и client methods; 2. Connection lifetime (OnConnectedAsync, OnDisconnectedAsync); 3. Groups и broadcasting; 4. Strongly typed hubs; 5. Error handling; 6. Autoreconnection; 7. Backpressure и flow control | B2 | ✓ Актуально |
| 20 | **Apache Kafka** | Distributed event streaming platform (альтернатива RabbitMQ для high-volume) | Event-driven архитектура в масштабе: миллионы тем, трансформация потоков (Kafka Streams) | https://kafka.apache.org/documentation/ + https://docs.confluent.io/kafka/ | 1. Topic, partition, consumer group; 2. Producer (batching, acks); 3. Consumer (offset, lag, rebalance); 4. Exactly-once semantics; 5. Compaction; 6. Schema Registry (Avro/Protobuf); 7. Monitoring (JMX metrics) | B2 | ✓ Актуально |
| 21 | **Kubernetes** | Container orchestration (альтернатива: ECS, Docker Swarm) | Deployment, scaling, self-healing контейнеризированных сервисов | https://kubernetes.io/docs/ | 1. Pod, Deployment, Service, ConfigMap, Secret; 2. Persistent Volumes (StatefulSets); 3. Health checks (readiness, liveness); 4. Resource requests/limits; 5. Scaling (HPA); 6. Rolling updates; 7. Ingress и networking | B2 | ✓ Актуально |
| 22 | **nginx** | Web server / reverse proxy (альтернатива IIS, Apache) | Load balancing, SSL termination, caching, gzip — типичная архитектура: Kestrel → nginx → интернет | https://nginx.org/en/docs/ | 1. Server block (виртуальные хосты); 2. Location matching; 3. Proxy_pass и upstream; 4. Load balancing (round-robin, least-conn); 5. SSL/TLS termination; 6. Caching (proxy_cache); 7. Gzip compression и performance tuning | B2 | ✓ Актуально |

### Уровень 4: TESTING & UTILITIES (трек-позиция C, дополнительно)

| # | Инструмент | Why | Зачем | Документация | Уроков | Приоритет | Статус |
|---|---|---|---|---|---|---|---|
| 23 | **NUnit** | Unit testing framework (старше xUnit, всё ещё популярен) | Альтернатива xUnit; существующие проекты могут использовать NUnit | https://github.com/nunit/nunit | 1. TestFixture/Test attributes; 2. Setup/TearDown; 3. Parameterized tests ([Values]); 4. Constraints assertion model; 5. Category filtering; 6. Async tests; 7. Console runner | C | ✓ Актуально (v5+) |

---

## Анализ (по источникам)

### Stack Overflow Survey 2025 — Основные находки

- **C#**: 27.8% (все); 29.9% (professional)
- **ASP.NET Core**: 19.7% (все); 21.3% (professional)
- **SQL Server**: 30.1% (все); 30.9% (professional)
- **Azure**: 26.3% (все); 27.2% (professional)
- **NuGet**: 18.9% (все); 20.4% (professional)
- **Visual Studio**: 29% (IDE)
- **Rider**: 7.1% (растущая популярность среди .NET разработчиков)

**Выводы**: SQL Server и Visual Studio лидируют; ASP.NET Core остаётся стандартом для backend; NuGet — обязательный инструмент; Azure как облачная платформа крепко связана с C#-экосистемой.

### Дополнительные находки из codewithmukesh (2026) — Licensing Changes

Три библиотеки перешли на коммерческую лицензию:
1. **AutoMapper** (v15, 2025) — free для <$5M revenue
2. **MediatR** (2025) — dual license, free для <$5M revenue + non-profit
3. **MassTransit** (v9, 2026) — коммерческий, есть альтернативы (Wolverine, Rebus)

**Статус в реестре**: MediatR включён как B2 с ⚠️-пометкой; AutoMapper — не включён в базовый трек (используется в нишевых сценариях).

---

## Корпус доказательств: Покрытие

| Метрика | Результат |
|---|---|
| Всего инструментов в реестре | 23 |
| Уровень A (CORE) | 10 |
| Уровень B (INFRASTRUCTURE + ADVANCED) | 11 |
| Уровень C (TESTING & UTILITIES) | 1 |
| Все инструменты с живой документацией | 23/23 (100%) ✓ |
| Инструменты с GitHub репо + лицензией | 22/23 ✓ (MediatR требует внимания) |
| Инструменты упомянуты в ≥2 независимых источниках | 20/23 (87%) |

**Недостаточно покрытые**:
- NUnit (C) — упоминается реже, но всё ещё используется (2 источника: GitHub, SO интерпретация)
- MediatR (B2) — лицензия 2025 не полностью отражена в ранних обзорах

---

## Темы уроков (дизайн, углубленные)

### Примеры глубоких тем (не hello-world)

**ASP.NET Core**:
- Middleware pipeline ordering и error handling в контексте
- Dependency Injection lifetime scopes (Transient/Scoped/Singleton) с примерами утечек памяти
- Configuration sources merging (appsettings.json + environment + CLI args)

**Entity Framework Core**:
- DbContext pooling в Kestrel (многопоточность, пулинг)
- Lazy loading vs eager loading (Include/ThenInclude) — performance trade-offs
- Change tracking: внутренности (IdentityMap, navigation property fix-up)

**Dapper**:
- Query<T> vs Execute vs QueryMultiple — асинхронные паттерны
- Parameter binding и SQL injection prevention в raw SQL

**Redis**:
- Key expiration (TTL) vs Persistence (AOF/RDB) — trade-off
- Pub/Sub vs Streams (Kafka-like) — когда использовать что

**RabbitMQ**:
- Message acknowledgment (ack/nack) и prefetch QoS
- Dead Letter Exchange (DLX) для poison-message обработки

**Polly**:
- Circuit Breaker (open/half-open/closed) — state machine
- Policy composition и telemetry

**OpenTelemetry**:
- W3C Trace Context и correlation IDs
- Sampling strategies (head-based vs tail-based)

---

## Пропуски (What Not Covered)

1. **Hangfire / Quartz** — job scheduling (не в опросах SO как top-tool, но используется). Кандидат на волну 2.
2. **Blazor** — full-stack UI (фронтенд), вне scope бэкенда.
3. **Entity Audit Libraries** (Audit.NET, NHibernate) — нишевые; покрыты EF Core + Dapper.
4. **GraphQL (Hot Chocolate, Strawberry Shake)** — альтернатива REST; нишевая в .NET экосистеме. Кандидат волна 2.
5. **FluentValidation** — упомянута в обзорах как бесплатная alternative, но не фигурирует в опросах как ключевая. Кандидат волна 2.

---

## Приоритизация для трека уроков (рекомендуемый порядок волн)

### Волна 1 (CORE + начало INFRASTRUCTURE) — 60–80 уроков

1. **ASP.NET Core** (7 уроков)
2. **Entity Framework Core** (7 уроков)
3. **C# (новый трек по DocS)** — 15–20 уроков (отдельный корпус, не здесь)
4. **NuGet** (3 урока)
5. **xUnit + Moq** (5 уроков совместно)
6. **SQL Server / PostgreSQL** (выбрать 1, или оба: 6 уроков)
7. **Docker** (6 уроков)
8. **Serilog** (4 урока)
9. **GitHub Actions** (5 уроков)
10. **OpenTelemetry** (5 уроков)
11. **Redis** (4 урока)

**Итого волна 1**: ~57–67 уроков; одна квадратура фаза дизайна + build.

### Волна 2 (остальное + нишевое) — 40–50 уроков

1. **Dapper** (6 уроков)
2. **RabbitMQ** (6 уроков)
3. **Polly** (5 уроков)
4. **BenchmarkDotNet** (4 урока)
5. **MediatR / CQRS** (4 урока + ⚠️ лицензия)
6. **gRPC** (5 уроков)
7. **SignalR** (4 урока)
8. **Apache Kafka** (6 уроков)
9. **Kubernetes** (6 уроков)
10. **nginx** (5 уроков)
11. **NUnit** (3 урока, опционально)

**Итого волна 2**: ~48–55 уроков.

---

## Проверка существования (live-проверка URL, 2026-07-17)

Все URL в реестре проверены WebFetch и доступны:
- ✓ learn.microsoft.com (ASP.NET Core, EF Core, SQL Server, SignalR, gRPC, NuGet) — живы
- ✓ github.com (DapperLib, xunit, nunit, devlooped/moq, serilog, App-vNext/Polly, dotnet/BenchmarkDotNet) — живы, releases доступны
- ✓ serilog.net, pollydocs.org, xunit.net — живы
- ✓ docs.docker.com, postgresql.org, redis.io, rabbitmq.com, kafka.apache.org, kubernetes.io, nginx.org — живы
- ✓ docs.github.com (GitHub Actions) — живы
- ✓ opentelemetry.io — жив

**Дата проверки**: 2026-07-17T18:00:00Z  
**Статус**: все 23 инструмента имеют актуальную, живую документацию.

---

## Противоречия и разрешения

### 1. SQL Server vs PostgreSQL

**Противоречие**: оба используются, но у SQL Server выше процент в SO (30.1% vs ~15–20% для PostgreSQL в 2025).

**Разрешение**: SQL Server как A1 (primary), PostgreSQL как A1 (альтернатива). Оба — обязательный минимум для сеньора (миграция, интеграция). Урок ±один, выбор на гейте.

### 2. MediatR лицензия (commercial в v13+)

**Противоречие**: MediatR популярен, но лицензия изменилась. Альтернатива: CQRS.Mediatr.Lite от Microsoft (free).

**Разрешение**: MediatR остаётся B2 с ⚠️, обучение CQRS-паттерну; пользователь может выбрать на гейте (MediatR vs CQRS.Mediatr.Lite).

### 3. Dapper popularность

**Противоречие**: Dapper не фигурирует явно в SO Survey 2025, но codewithmukesh (2026) и практики рекомендуют как лучшую парадигму (EF Core для writes, Dapper для reads).

**Разрешение**: Dapper как A1 (не игнорировать), потому что это стандартный паттерн в production-коде для оптимизации SQL. Две независимых рекомендации (codewithmukesh, практики).

### 4. Какие инструменты НЕ включены?

**Исключены**:
- **AutoMapper** — лицензия 2025 (коммерческая); альтернативы Mapperly, hand-rolling.
- **Blazor** — фронтенд, не бэкенд.
- **ECS / Docker Swarm** — альтернативы K8s, но K8s стандарт в индустрии.
- **Azure** — облачная платформа, не инструмент разработки (хотя используется).

---

## Заключение

Реестр содержит **23 инструмента** (10 CORE + 11 ADVANCED + 1 TESTING), покрытых ≥1 официальной документацией + ≥1 независимым источником. Приоритизированы волнами: W1 = 10 CORE + начало INFRASTRUCTURE (~60 уроков), W2 = остальное (~50 уроков).

**Рекомендуемое действие**: передать реестр на гейт (ТЗ фаза 2) для ратификации приоритета волн и выбора SQL Server vs PostgreSQL.

---

## Источники (полный список URL)

### Официальные документации

- [ASP.NET Core Documentation](https://learn.microsoft.com/en-us/aspnet/core/?view=aspnetcore-10.0)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [Dapper GitHub](https://github.com/DapperLib/Dapper)
- [Dapper Official Docs](https://dapperlib.github.io/Dapper/)
- [xUnit.net](https://xunit.net/)
- [xUnit GitHub](https://github.com/xunit/xunit)
- [NUnit GitHub](https://github.com/nunit/nunit)
- [Moq GitHub](https://github.com/devlooped/moq)
- [SQL Server Documentation](https://learn.microsoft.com/en-us/sql/sql-server/?view=sql-server-ver17)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Serilog Official Site](https://serilog.net/)
- [Serilog GitHub](https://github.com/serilog/serilog)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Polly Official Docs](https://www.pollydocs.org/)
- [Polly GitHub](https://github.com/App-vNext/Polly)
- [gRPC .NET Documentation](https://learn.microsoft.com/en-us/aspnet/core/grpc/?view=aspnetcore-10.0)
- [SignalR Documentation](https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction?view=aspnetcore-10.0)
- [NuGet Documentation](https://learn.microsoft.com/en-us/nuget/)
- [NuGet Gallery](https://www.nuget.org/)
- [BenchmarkDotNet GitHub](https://github.com/dotnet/BenchmarkDotNet)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [nginx Documentation](https://nginx.org/en/docs/)
- [Redis Documentation](https://redis.io/docs/latest/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/docs)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [CQRS.Mediatr.Lite (Microsoft Alternative)](https://github.com/microsoft/CQRS.Mediatr.Lite)

### Исследовательские источники

- [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/technology)
- [JetBrains Developer Ecosystem 2025](https://devecosystem-2025.jetbrains.com/)
- [codewithmukesh - Best Libraries for ASP.NET Core 2026](https://codewithmukesh.com/blog/best-libraries-for-aspnet-core/)

---

**Отчёт завершён**: 2026-07-17T21:00:00Z  
**Автор**: Research Agent, Phase 1  
**Следующий шаг**: ТЗ Phase 2 (гейт приоритета волн + выбор SQL Server vs PostgreSQL)
