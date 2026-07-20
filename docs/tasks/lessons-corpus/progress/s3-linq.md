# S3 LINQ — прогресс билдера (ветка section/s3-linq)

База worktree: HEAD c4ab8d6 (после S7 merge). В worktree реально 29 уроков (S1/S2/S7),
registry содержит только CS_S1/CS_S2/CS_S7 (S17/S18/S4 — у других агентов, не смёрджены).
Мой раздел S3 (LINQ) добавляется как новая секция CS_S3, order 3, prereqs ['CS.S1'].
Order карт: 30..37 (после 29). Icon: `collections` (LessonIcon не расширяю).

Бэкенд: свой на :5101 (health OK). run-csharp работает (проверено: Where → "2,4").
Seed-схема (LessonStore.cs): {id,track,section,module,title,status,order,sources[],
cards[{id,type,engagementLevel,prompt,code,expectedOutput,verify:"execute",sourceRefs[]}]}.

## VERBATIM-цитаты залочены (прямой fetch страниц, source-id == URL):
- linq/ (ms-linq): query expression declarative query syntax; "There's no semantic or performance
  difference between the two different forms"; IEnumerable→delegates, IQueryable→expression trees;
  provider complexity (simple/medium/complex EF Core→SQL).
- introduction-to-linq-queries (ms-intro): "All LINQ query operations consist of three distinct
  actions"; "the query variable itself takes no action and returns no data"; Immediate/Deferred/
  Streaming/Nonstreaming defs; "Because the query variable itself never holds the query results".
- standard-query-operators/ (ms-sqo): "The standard query operators are the keywords and methods
  that form the LINQ pattern"; "extension members ... receiver type is either IEnumerable<T> or
  IQueryable<T>"; filter/order/group/join/project keywords.
- extension-methods (ms-ext, title "Extension members"): "Extension members enable you to \"add\"
  methods to existing types without ..."; "static methods, but they're called as if they were
  instance methods"; "The most common extension members are the LINQ standard query operators";
  "extension members always have lower priority than instance ... members".
- iqueryable-1 API (ms-iqueryable): "intended for implementation by query providers"; "inherits the
  IEnumerable<T> interface"; "Enumeration forces the expression tree ... to be executed"; polymorphic.
- introduction-to-plinq (ms-plinq): "Parallel LINQ (PLINQ) is a parallel implementation of the ...
  LINQ ... pattern"; "partitioning the data source into segments"; AsParallel opt-in; conservative;
  AsOrdered "buffered and sorted"; ForAll "does not perform this final merge step".

## Уроки (todo→self-pass):
1. CS.S3.linq-query-syntax — self-pass (tsc0/layoutGREEN/exec 97 92 81·50,80,90·10; IL Where/Select)
2. CS.S3.linq-execution — self-pass (tsc0/layoutGREEN/exec 0 2 4 6·2,5,9·2 4)
3. CS.S3.standard-operators — self-pass (tsc0/layoutGREEN/exec 9,16,25,36·3:2 5:2·Join order)
4. CS.S3.deferred-execution — self-pass (tsc0/layoutGREEN 6seg/exec before=0 after=3·first=7 seen=7·first=10 seen=10) FLAGSHIP
5. CS.S3.ienumerable-iqueryable — self-pass (tsc0/layoutGREEN/exec 7·hits=2·count=3; IL Func vs Expression; NOTE: runner lacks Queryable/Expressions asm — IQueryable proven by IL only)
6. CS.S3.linq-providers — self-pass (tsc0/layoutGREEN/exec 3,4,5·3,6,9,12·55; infinite-source panel)
7. CS.S3.plinq — self-pass (tsc0/layoutGREEN 6seg/exec 20..200·100000·dopSum=5050; REAL PLINQ compiled-app: threadsUsed>=2 True, AsOrdered order; runner lacks Parallel asm)
8. CS.S3.custom-operators — todo
