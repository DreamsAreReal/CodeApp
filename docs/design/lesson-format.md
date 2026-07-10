# Единый формат занятия (lesson-as-data v1)

Цель: добавить урок с ЛЮБОЙ анимацией/визуализацией = заполнить ОДИН объект-данные.
Движок анимации (RS-08, 1.3 КБ) и дизайн-токены (mid: крем+коралл+Rubik) — общие и
подключаются автоматически. Одни и те же данные драйвят СРАЗУ: анимацию, SRS-карточки и текст.
Схема и гейты точности — исполнены в RS-10 (§3, §5, §6); здесь — рабочая выжимка.

## 1. Урок = один объект `lesson`
```jsonc
{
  "id": "T1.M3.boxing",            // T<трек>.M<модуль>.<slug>
  "track": "T1", "module": "M1.3",
  "title": "Boxing и unboxing",
  "prereqs": ["T1.M2.value-vs-reference"],   // рёбра concept-DAG (разблокировка/интерливинг)
  "depth": 2,                       // 1 интуиция · 2 механика · 3 спека/edge · 4 эксперт
  "version": "1", "status": "verified",

  // ИСТОЧНИК — обязательное поле у КАЖДОГО утверждения (иначе гейт G-CITE не пускает)
  "sources": [
    { "id":"ms-boxing", "kind":"doc",
      "url":"https://learn.microsoft.com/dotnet/csharp/programming-guide/types/boxing-and-unboxing",
      "date":"2025-10-13" }
  ],

  // КОНТЕНТ по слоям глубины (claim = {text, source, status})
  "intuition":   [ { "text":"Boxing — «завернуть» значимый тип в объект на куче…", "source":"ms-boxing" } ],
  "mechanics":   [ { "text":"CLR оборачивает значение в System.Object и кладёт на кучу, КОПИРУЯ…", "source":"ms-boxing" } ],
  "spec":        [ { "text":"«Boxing is implicit; unboxing is explicit… copies the value.» (дословно)", "source":"ms-boxing" } ],
  "edgeCases":   [ { "text":"Unbox null → NullReferenceException.", "source":"ms-boxing" },
                   { "text":"Unbox в несовместимый тип → InvalidCastException, не тихое приведение.", "source":"ms-boxing" } ],
  "misconceptions":[ { "wrong":"object b = a делает b ССЫЛКОЙ на переменную a.",
                       "correction":"b хранит ссылку на НЕЗАВИСИМУЮ упакованную КОПИЮ значения на куче.",
                       "source":"ms-boxing" } ],
  "rationale":   { "text":"Boxing существует ради единой системы типов: значение любого типа — как object.", "source":"ms-boxing" },

  // ВИЗУАЛИЗАЦИЯ — декларативные сцены из общих ПРИМИТИВОВ (см. §3); predictAt = где «предскажи»
  "viz": {
    "template": "memory-model",
    "scenes": [ /* массив снимков из примитивов, см. §3 */ ],
    "predictAt": [3]                // перед этим шагом — гейт «предскажи вывод»
  },

  // SRS-КАРТОЧКИ — verify детерминирован (исполнение/компиляция), sourceRefs обязательны
  "cards": [
    { "id":"c1", "type":"predict-output", "engagementLevel":"responding",
      "verify":{ "kind":"exec", "run":"dotnet run", "expect":"5" },   // ответ = реальный stdout
      "sourceRefs":["ms-boxing"] },
    { "id":"c2", "type":"write-missing", "engagementLevel":"generating",
      "verify":{ "kind":"tests", "hidden":"BoxingTests.cs" }, "sourceRefs":["ms-boxing"] }
  ],

  "verification": { "existence":"pass", "build":"pass", "answerExec":"pass" }  // гейты RS-10 §3
}
```

## 2. Как добавить новый урок (4 шага)
1. Заполнить `intuition/mechanics/spec/edgeCases/misconceptions/rationale` — каждый claim с `source`.
2. Собрать `viz.scenes` из примитивов (§3): взять готовый `template` (memory-model / hash-table /
   async-timeline / graph) ИЛИ скомпоновать сцены вручную. Новый ТИП визуализации = добавить один
   примитив ОДИН раз → он переиспользуем во всех уроках.
3. Прописать `cards` с детерминированным `verify` (exec/tests/compile).
4. Прогнать гейты: existence-check (NuGet/API), build, answer-exec. `status:"verified"` ставится
   ТОЛЬКО когда все три green. → урок рендерится единым движком в едином дизайне.

## 3. Каталог примитивов визуализации (общий словарь движка)
Сцена = снимок, собранный из примитивов; движок диффит сцены (enter/update/exit) + FLIP.
| Примитив | Что рисует | Где нужен |
|---|---|---|
| `stack{thread}` | кадр стека (LIFO), привязан к потоку | память, рекурсия, вызовы |
| `heap` | общая управляемая куча (GC) | ссылочные типы, boxing, аллокации |
| `thread{name}` | поток, ВЛАДЕЕТ своим стеком | конкурентность, «у каждого потока свой стек» |
| `box{name,value,type}` | ячейка значение/переменная | везде |
| `ref{from→to}` | стрелка-ссылка | указатели, aliasing, boxing |
| `buckets{n}` + `chain` | массив бакетов + цепочка коллизий | хеш-таблицы |
| `timeline{events}` | ось событий | async/await, планировщик |
| `pointer`, `label`, `highlight` | указатель/подпись/фокус | акценты шага |
Подложка: SVG по умолчанию; Canvas — для «густых» сцен (сортировка сотен элементов, GC-heap,
attention-heatmap). Переходы: WAAPI + FLIP (только transform/opacity). `prefers-reduced-motion`
режет переходы, сохраняя шаги.

## 4. Один источник правды
`lesson` драйвит ТРИ вещи разом: (а) анимацию (`viz.scenes`), (б) SRS-карточки (`cards.verify`),
(в) текст урока (`intuition…rationale` + `sources`). Правишь данные — меняется всё согласованно.
Это и делает формат «удобно добавлять с разными анимациями», не ломая единый дизайн и точность.
