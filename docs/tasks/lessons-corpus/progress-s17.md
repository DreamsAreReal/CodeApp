# Прогресс S17 «Внутренности коллекций» (worktree section/s17-collections)

Раздел-билдер S17. 7 уроков. Ветка `section/s17-collections` (worktree, HEAD от ebae98d — M4:
S1+S2 готовы, S7 в этом worktree ещё нет; регистрирую только CS.S17).

## Статус уроков
| # | slug | segs | cards | tsc | layout | exec-cards | коммит |
|---|------|------|-------|-----|--------|-----------|--------|
| 1 | collections-overview | 5 | 3 | ✅ | ✅ 15 сцен | ✅ 6 6 / 3+True / 4056 | 508028c |
| 2 | choosing-collection | 4 | 3 | ✅ | ✅ 12 сцен | ✅ 1000 0 / 501 1 / 9+2 | 84469fc |
| 3 | dictionary-internals | 5 | 3 | ✅ | ✅ 15 сцен | ✅ True True / True False / 1 2 | e66cdcf |
| 4 | list-internals | 5 | 3 | ✅ | ✅ 15 сцен | ✅ 8/5 / 9 реаллок/1024 / 0 | 2e82c0a |
| 5 | hashset | 4 | 3 | ✅ | ✅ 12 сцен | ✅ True False 1 / union=6.. / Contains=1 | 40c9151 |
| 6 | concurrent-collections | 4 | 3 | ✅ | ✅ 12 сцен | ✅ 100 100 f=1 / snap 3 vs 4 / IsSync=False | (commit) |
| 7 | immutable-collections | 4 | 3 | ✅ | ✅ 12 сцен | c1 ✅ a=3 b=4 same=False; c2/c3 pending re-verify | (commit) |

## Реально снятые панельные числа (из http://localhost:5090/api/authoring/run-csharp)
- L1 боксинг: ArrayList 1000 int = **32056 байт** vs List<int> = **4056 байт**.
- L2 сравнения: List.Contains(absent) = **1000** Equals vs HashSet = **0**; found@500 = **501** vs **1**.
- L3 Dictionary resize (рефлексия private `_buckets`): **0 → 3 → 7 → 17 → 37** (простые числа, деталь реализации .NET 10); коллизия picnic=630, basket=634, stressed=877=desserts=877.
- L4 List Capacity: **0 → 4 → 8 → 16 → 32**; 1000 Add = **9 реаллокаций** (Cap 1024); prealloc = 0.
- L5 HashSet O(1): в 100k элементов Contains @50000 = **1** Equals vs List **50001**.
- L6 GetOrAdd (1 поток): 100 100 factoryRuns=1; ConcurrentQueue снимок = **3** пока live = **4**; IsSynchronized=False.
- L7 ImmutableList.Add: a.Count=**3** b.Count=**4** ReferenceEquals=**False** (через рефлексию — см. находку).

## Находки (карантин/провенанс)
1. **SyncRoot .NET 10 бросает** `NotSupportedException` при чтении на concurrent-коллекции —
   старые доки пишут «SyncRoot is always null». Урок L6 НЕ утверждает «SyncRoot==null» как
   текущее поведение рантайма; цитирует `IsSynchronized==false` (проверено) и подаёт SyncRoot
   как «нерелевантно / нельзя использовать для синхронизации». Инъекций в источниках нет.
2. **Exec-сэндбокс (Roslyn CSharpScript) НЕ ссылается на `System.Collections.Immutable`,
   `System.Threading.Tasks.Parallel`, `dynamic`, LINQ** для компиляции. Для L7 (immutable)
   exec-карты исполняются через `Assembly.Load("System.Collections.Immutable")` + рефлексию
   (сборка в рантайме есть, только не референсится компилятором) — stdout настоящий; `question`
   карточки показывает идиоматичный `ImmutableList` сниппет, который код точно воспроизводит.
   Для L6 race-панель GetOrAdd мерил через raw-`Thread` (Parallel недоступен).
3. **Множитель роста ×2** (List) и **простые числа бакетов** (Dictionary) поданы как ДЕТАЛЬ
   РЕАЛИЗАЦИИ (List.cs / Dictionary.cs), НЕ как цитата документации (GT M8).

## Инфра-заметка
- worktree node_modules пуст → `npm install` + `npm approve-scripts esbuild`; tsc: `node node_modules/typescript/bin/tsc --noEmit`.
- self-check раскладки — pure-прогон `layoutScene` (scratchpad/layoutcheck.mjs), зеркалит verify/viz-fit authoringProof.
- **Общий exec-бэкенд :5090 НЕСТАБИЛЕН** в ходе сессии: up → down → up-no-auth → down (несколько раз).
  Все панельные числа сняты в окна доступности; L7 c2/c3 ждут повторного подтверждения при возврате бэкенда.

## VERBATIM-дисциплина
Каждая « »-англ-цитата сверена прямым fetch процитированной страницы (2026-07-21):
collections index, selecting-a-collection-class, hashtable-and-dictionary, dictionary-2,
list-1(+.capacity), hashset-1(+.contains), thread-safe/, concurrentdictionary.getoradd,
concurrentqueue.getenumerator, immutable namespace, immutablelist-1. 0 мифов GT в утвердительной форме.
