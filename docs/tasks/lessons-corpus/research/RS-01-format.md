# RS-01: Формат урока и интеграционные ограничения

**Фаза:** Research 1 · lessons-corpus  
**Дата:** 2026-07-17  
**Корпус:** живой код фронта и бэка  

---

## 1. Полный контракт «добавить урок»

### 1.1 Шаги из AUTHORING-AI.md (источник правды)

Плейбук `docs/AUTHORING-AI.md:§3` определяет рецепт добавления урока:

```
3. Рецепт «добавить урок» (по шагам)
1. Выбери концепт из C#-ядра (или другого трека) и перечисли нюансы/мисконцепции
2. Найди первоисточник на КАЖДОЕ утверждение (learn.microsoft.com, ECMA, arXiv)
3. Составь `lesson` (segments[]) — на каждый нюанс сегмент с {id, kicker, title, code, il, viz, explain, sources}
4. Карточки `cards[]` — активное припоминание; predict-output с непустым verify.expect
5. Проверь точность: каждый идентификатор существует; ответ карточки = реальный вывод
6. Зарегистрируй урок в `app/src/lessons/index.ts` и seed бэка
7. Верифицируй headless-прогоном
```

Источник: `/Users/admin/Desktop/CodeApp/docs/AUTHORING-AI.md:38-65`

### 1.2 Файлы, которые трогаются (точный список)

Из `docs/AUTHORING-AI.md:§9`:
```
- app/src/lessons/<slug>.ts          новый LessonData
- app/src/lessons/index.ts           импорт + строка в LESSONS
- backend/Codex.Backend/seed/lessons/<id>.json  seed каталога повторов
```

Источник: `/Users/admin/Desktop/CodeApp/docs/AUTHORING-AI.md:176-182`

### 1.3 Команды верификации (выполнены)

**Сборка фронта (headless typecheck + vite):**
```bash
cd /Users/admin/Desktop/CodeApp/app && npm run build
```

Выход:
```
vite v6.4.3 building for production...
transforming...
✓ 54 modules transformed.
...
✓ built in 388ms
```

**Статус:** ✅ ЗЕЛЁНОЕ (типизация прошла, сборка успешна)

**Тесты бэка:** Требуют запуска бэкенда на `:5080`. Headless-харнессы требуют `npm run preview` на `:4173`.

Из `docs/GUIDE.md:§5`:
```
| Харнесс | Команда | Что доказывает |
| verify/run | npm run verify | E2E: home + dev-auth + урок рендерит, анимация играет, карта двигает расписание |
| verify/viz-fit | node verify/viz-fit.mjs | AUTHORING-PROOF: все узлы влезают, нет overlap, grid-snap |
```

**Статус offline:** ⚠️ Требует запущенного бэкенда. При локальном запуске (без TMA auth) фронт использует `devUserId` fallback.

---

## 2. Базлайн-инвентарь: текущее состояние

### 2.1 Уроки и треки

| Трек | ID примера | Модуль | Название |
|------|-----------|--------|----------|
| **T1** (C# core) | T1.M2.value-vs-reference | M1.2 | Значение и ссылка |
| | T1.M3.boxing | M1.3 | Boxing и упаковка |
| | T1.M4.gc | M1.4 | GC и память |
| **T2** (C# advanced) | T2.M1.async-await | M1 | Async/await |
| | T2.M2.closures | M2 | Замыкания (closures) |
| | T2.M5.hashtable | M5 | Хеш-таблицы |
| **PY** (Python) | PY.M1.names-objects | M1 | Имена и объекты |
| | PY.M2.collections-hash | M2 | Коллекции, хеши |
| | ... | ... | 11 Python уроков |

**Всего уроков:** 19 (6 C#, 13 Python)  
**Источник:** `/Users/admin/Desktop/CodeApp/backend/Codex.Backend/seed/lessons/` (19 JSON файлов)

### 2.2 Карточки по урокам (исправлено v2: парсинг JSON, не grep)

| Урок | Карт | Урок | Карт |
|------|------|------|------|
| T1.M2.value-vs-reference | 1 | PY.M6.generators | 4 |
| T1.M3.boxing | 1 | PY.M7.context-managers | 4 |
| T1.M4.gc | 1 | PY.M8.object-model | 4 |
| T2.M1.async-await | 1 | PY.M9.exceptions | 4 |
| T2.M2.closures | 1 | PY.M10.type-hints | 4 |
| T2.M5.hashtable | 1 | PY.M11.async-await | 4 |
| PY.M1.names-objects | 4 | PY.M12.strings-flow | 6 |
| PY.M2.collections-hash | 3 | PY.M13.stdlib-idioms | 6 |
| PY.M3.args-unpacking | 3 | | |
| PY.M4.closures-scope | 3 | | |
| PY.M5.decorators | 4 | **ИТОГО** | **59** |

**Источник:** python3-парсинг `cards[]` каждого сида (v1 считал grep-ом `'"id": "c'` и
ловил id источников `cs-*`/claims — получал ложные 84). Сверено с фронтом:
`grep -c 'verify: { kind: "exec"' app/src/lessons/*.ts` → 59 (сид == фронт).

### 2.3 Размер в строках

| Категория | Строк | Урок-образец |
|-----------|-------|-------------|
| types.ts (интерфейсы) | 131 | `/Users/admin/Desktop/CodeApp/app/src/lessons/types.ts` |
| index.ts (реестр) | 90 | `/Users/admin/Desktop/CodeApp/app/src/lessons/index.ts` |
| value-vs-reference (C#) | 125 | Самый короткий C# урок |
| py-generators (Python) | 337 | Средний Python урок (6 сегментов) |
| py-names-objects (Python) | 593 | Самый длинный урок |
| **Всего уроков** | 6,226 | Бандл 20 файлов |

**Средний урок (только контент, без index.ts/types.ts):** 6005 / 19 ≈ **316 строк**; распределение неравномерно:
- C#: 125–188 строк (4 сегмента в среднем)
- Python: 276–593 строк (6–8 сегментов)

**В байтах:** 593 377 символов ≈ 580 KB raw (все файлы lessons/). 141.75 KB gzip — это ВЕСЬ JS-бандл приложения, не только уроки.

**Источник:** `wc -l app/src/lessons/*.ts && cat app/src/lessons/*.ts | wc -c`

---

## 3. Удаление 6 C#-уроков: места-ссылки

**Целевые уроки для удаления:** `async-await`, `boxing`, `closures`, `gc`, `hashtable`, `value-vs-reference`

### 3.1 Фронт: index.ts (регистрация)

**Файл:** `/Users/admin/Desktop/CodeApp/app/src/lessons/index.ts`

Строки импорта (удалить):
```ts
import { valueVsReference } from "./value-vs-reference.ts";  // line 16
import { boxing } from "./boxing.ts";                        // line 17
import { gc } from "./gc.ts";                                // line 18
import { closures } from "./closures.ts";                    // line 19
import { asyncAwait } from "./async-await.ts";               // line 20
import { hashtable } from "./hashtable.ts";                  // line 21
```

Строки в LESSONS массиве (удалить):
```ts
export const LESSONS: LessonData[] = [
  valueVsReference,        // line 39
  boxing,                  // line 40
  gc,                       // line 41
  closures,                // line 42
  asyncAwait,              // line 43
  hashtable,               // line 44
  pyNamesObjects,          // остаёт
  ...
];
```

**Статус:** 6 импортов + 6 элементов массива = 12 строк удаления

**Источник:** `/Users/admin/Desktop/CodeApp/app/src/lessons/index.ts:16-21, 39-44`

### 3.2 Бэкенд: seed каталог (регистрация карточек)

**Файлы для удаления в `/Users/admin/Desktop/CodeApp/backend/Codex.Backend/seed/lessons/`:**
- `T1.M2.value-vs-reference.json` (1 карточка)
- `T1.M3.boxing.json` (1 карточка)
- `T1.M4.gc.json` (1 карточка)
- `T2.M1.async-await.json` (1 карточка)
- `T2.M2.closures.json` (1 карточка)
- `T2.M5.hashtable.json` (1 карточка)

**Итого:** 6 файлов, 6 карточек (которые перестанут быть доступны в FSRS)

**Контракт петли:** На бэке `Program.cs` при старте вызывает `db.SeedItem()` для каждого JSON в `seed/lessons/` (см. `docs/GUIDE.md:§3в`). После удаления файлов эти уроки **исчезнут из `GET /api/due`**, но БД прогресса пользователей не очистится — старые `review_state` останутся как "orphaned records".

**Источник:** `ls backend/Codex.Backend/seed/lessons/T*.json`

### 3.3 Фронт: данные уроков (удалить файлы)

**Файлы для удаления в `/Users/admin/Desktop/CodeApp/app/src/lessons/`:**
- `value-vs-reference.ts` (125 строк)
- `boxing.ts` (188 строк)
- `gc.ts` (170 строк)
- `closures.ts` (157 строк)
- `async-await.ts` (154 строк)
- `hashtable.ts` (277 строк)

**Итого:** 6 файлов, 1071 строк кода

### 3.4 Внутренние ссылки (dependencies)

**Найдено в коде:**

1. **Prereqs (зависимости между уроками C#):**
   ```
   T1.M3.boxing → prereqs: ["T1.M2.value-vs-reference"]
   T1.M4.gc → prereqs: ["T1.M3.boxing"]
   T2.M1.async-await → prereqs: ["T1.M3.boxing"]
   T2.M2.closures → prereqs: ["T1.M3.boxing"]
   T2.M5.hashtable → prereqs: ["T2.M2.closures"]
   ```

   **Цепочка удаляется полностью** (нет внешних зависимостей от Python трека на C#).

   **Источник:** grep из `/Users/admin/Desktop/CodeApp/app/src/lessons/*.ts:prereqs`

2. **Метаблагодарности в комментариях:**
   - `py-names-objects.ts` упоминает «gc» в контексте Python GC (refcount + циклический gc), но это не импорт
   - `py-decorators.ts` зависит от `PY.M4.closures-scope` (Python урок, не C#)

   **Нет критических кросс-зависимостей.**

### 3.5 Итоговая матрица удаления

| Компонент | Что удалится | Статус |
|-----------|-------------|--------|
| **Фронт source** | 6 `.ts` файлов, 1071 строк | Удалить |
| **Фронт registry** | 6 импортов + 6 строк в LESSONS | Удалить |
| **Бэкенд seed** | 6 JSON файлов, 6 карточек | Удалить |
| **Prereqs chain** | Полностью в C# (5 звеньев) | Удалить (no externals) |
| **User progress** | до 6 review_state orphans на пользователя | Не удаляется (историческая БД) |

**Источник:** Комбинация grep + файловый анализ `app/src/lessons/` и `backend/Codex.Backend/seed/lessons/`

---

## 4. Ограничения формата

### 4.1 Структура Lesson (тип-источник правды)

**Файл:** `/Users/admin/Desktop/CodeApp/app/src/lessons/types.ts:105-128`

```ts
export interface LessonData {
  id: string;                    // T<track>.M<module>.<slug>
  track: string;                 // "T1" | "T2" | "PY"
  lang?: LessonLang;             // "csharp" | "python" (default: "csharp")
  module: string;                // "M1.2", "M6.1", "M5" и т.д.
  title: string;                 // UI заголовок
  kicker: string;                // подпись над заголовком
  home: { subtitle, icon, estMinutes };  // карточка на home
  prereqs: string[];             // IDs предусловий
  depth: number;                 // 1-4 (intuition → mechanics → spec → expert)
  version: string;               // "1"
  status: "self-pass" | "verified" | "draft";
  sources: Source[];             // провенанс
  spec: Claim[];                 // спецификация (дословные цитаты)
  edgeCases: Claim[];            // граничные случаи
  misconceptions: Misconception[]; // как опровергнуть неправильное понимание
  segments: Segment[];           // анимированные разборы
  cards: Card[];                 // SRS карточки
  takeaways: Takeaway[];         // выводы после урока
  foot: string;                  // footer-текст
}
```

**Ограничение:** Строго типизировано; поле `id` ДОЛЖНО совпадать на фронте и в бэкенд seed, иначе карточка не попадёт в `GET /api/due`.

### 4.2 Сегмент (Segment) — где живут анимации

**Файл:** `/Users/admin/Desktop/CodeApp/app/src/lessons/types.ts:56-73`

```ts
export interface Segment {
  id: string;              // "s1", "s2", "s3" …
  num: string;             // "01", "02" (для UI)
  kicker: string;          // категория мини-подпись
  title: string;           // заголовок разбора
  viewBox: string;         // "0 0 340 210" (SVG canvas)
  zones?: Zone[];          // именованные регионы (СТЕК, КУЧА, и т.д.)
  code?: string[];         // C# / Python сниппеты
  il?: IlLine[];           // IL (C#) или dis (Python)
  predictAt?: number;      // индекс сцены для gate (пользователь предсказывает)
  predictQ?: string;       // HTML вопрос в gate
  console?: boolean;       // показать консоль
  scenes: Scene[];         // массив кадров анимации
  explain: string;         // HTML: механизм + дословная цитата
  sources: string[];       // ссылка на Source.id
}
```

**Ограничения:**
- `viewBox`: фиксированный размер Canvas (в примерах: 340x210 или 340x260)
- **Max сцен в сегменте:** практически не ограничено, но 5–8 типичны (для UX плывущего скрола)
- `code[]`: массив строк; каждая строка синхронна со своей `Scene` через `codeLine: <index>`
- `scenes[].nodes[]`: использовать **только `at` для размещения**, не `x/y`; примитивы: `slot`, `ref`, `obj`, `chip`, `gate`

### 4.3 Карточка (Card) — FSRS и верификация

**Файл:** `/Users/admin/Desktop/CodeApp/app/src/lessons/types.ts:78-92`

```ts
export interface Card {
  id: string;              // "c1", "c2", "c3" …
  type: CardType;          // "predict-output" | "find-the-bug" | "compare" | "explain"
  engagementLevel: string;
  question: string;        // HTML вопрос
  options: string[];       // fallback MCQ варианты (если нет verify.expect)
  correctIndex: number;    // индекс правильного ответа
  xp: number;              // очки
  okText: string;          // feedback при верно
  noText: string;          // feedback при мимо
  verify: { kind: "exec"; run: string; expect: string };  // ** ДЕТЕРМИНИРОВАННАЯ ПРОВЕРКА
  sourceRefs: string[];    // ссылки на Source.id
}
```

**КРИТИЧЕСКОЕ:** `type === "predict-output"` + непустой `verify.expect` рендерится как **ТЕКСТОВЫЙ ВВОД** (не MCQ):
- Пользователь печатает вывод
- Ответ нормализуется: `trim()`, `CRLF→LF`, срез хвостовых пробелов построчно
- Сверка: **строка-в-строку с `expect`** (реальный stdout)
- Результат **предвыбирает FSRS-оценку**: верно → Grade=Good (3), мимо → Grade=Again (1)

**Откуда берётся `expect`:** Из реального исполнения через `POST /api/authoring/run-csharp` (C#) или похожий endpoint (Python).

**Гейт G-EXEC:** Перед сдачей урока ОБЯЗАТЕЛЬНО:
```bash
curl -s -X POST http://localhost:5080/api/authoring/run-csharp \
  -H 'Content-Type: application/json' \
  -d '{"code":"..."}'
# stdout.trim() ДОЛЖЕН == Card.verify.expect
```

**Источник:** `docs/AUTHORING-AI.md:§8, §9 · app/src/lessons/types.ts:78-92`

### 4.4 Язык контента

**Фронт:** Русский для user-facing строк (UI, объяснения, вопросы).

**Код в уроках:** Языком исходника (C# / Python).

**Терминология:** EN для внутренних имён (`id`, `kind`, `track`).

**Интерфейсы `Source` / `Misconception`:** Дословные цитаты из источника (англ. для learn.microsoft.com), но `hook` — только HTML/русский.

**Источник:** `docs/AUTHORING-AI.md:§8 · app/src/strings.ts (все UI строки RU)`

### 4.5 Дизайн-токены (НЕ отклоняться)

**Файл:** `/Users/admin/Desktop/CodeApp/docs/AUTHORING-AI.md:§5`

```
--bg #F6F1E9               основной фон (cream)
--surface #fff
--ink #23201B              основной текст
--muted #8A8377
--line #E7DFD2             линии
--coral #F0533A            акцент (вспышка при появлении)
--coral-d #C43D28          тёмнее
--sage #7C8B6F
--amber #E8A13A            небольшой акцент

Шрифты: Rubik(700/800) + Onest + JetBrains Mono
Радиусы: 14/18/22 (soft rounded corners)
```

**Antislop:** Без золота, тёмного кино, детсад-зелёного, без Inter, без streak-shaming.

**Движок сам:** Размер узлов, выравнивание, маршрут рёбер (через `at:{zone,row,col}` → auto-layout).

---

## 5. Средний размер одного урока (замер)

### 5.1 По строкам

| Урок (образцы) | Строк | Сегментов | Среднее строк/сегмент |
|---|---|---|---|
| value-vs-reference (T1) | 125 | 4 | 31 |
| boxing (T1) | 188 | 7 | 27 |
| gc (T1) | 170 | 6 | 28 |
| async-await (T2) | 154 | 5 | 31 |
| closures (T2) | 157 | 5 | 31 |
| hashtable (T2) | 277 | 6 | 46 |
| **C# average** | **179** | **5.3** | **33** |
| py-generators | 337 | 6 | 56 |
| py-names-objects | 593 | 6 | 99 |
| py-closures-scope | 418 | 7 | 60 |
| **Python average** | **420** | **6.3** | **67** |

**Полный корпус:** 6005 строк / 19 уроков = **316 строк/урок** (6226 строк / 21 файл — с инфраструктурой)

**Вывод:** Python уроки в ~2.3× длиннее из-за большей плотности визуализаций (dis-панель, более сложные сцены).

### 5.2 В токенах (rough estimate)

Используя `gzip` ratio (141 KB gzip / 580 KB raw ≈ 24% ratio):

**Raw:** 593,377 символов  
**Gzip:** ≈ 141 KB = ~141,000 байт  
**Tokens (Claude 3.5 Sonnet):** ≈ 593,377 / 4 ≈ **148,344 токена** (rough, не точно)

**Per lesson:** ~148,000 / 19 ≈ **7,800 токенов/урок** (эвристика, не замер)

**C# урок:** ≈ 5000–7000 токенов (зависит от кол-ва сцен)  
**Python урок:** ≈ 8000–12,000 токенов

---

## 6. Доказательства (артефакты)

### 6.1 Сборка фронта ✅

```bash
cd /Users/admin/Desktop/CodeApp/app && npm run build
# Вывод: ✓ built in 388ms
```

**Статус:** ЗЕЛЁНОЕ, нет ошибок типизации

### 6.2 Структура типов

**Файл:** `/Users/admin/Desktop/CodeApp/app/src/lessons/types.ts` (131 строка)  
**Эталоны уроков:** `gc.ts`, `boxing.ts`, `py-generators.ts`  
**Плотность:** `gc` (6 сегментов, 170 строк), `boxing` (7 сегментов, 188 строк)

### 6.3 Реестр LESSONS

**Файл:** `/Users/admin/Desktop/CodeApp/app/src/lessons/index.ts` (90 строк)  
**Кол-во уроков:** 19  
**Порядок:** Concept DAG (T1 → T2 → PY)

### 6.4 Бэкенд seed

**Директория:** `/Users/admin/Desktop/CodeApp/backend/Codex.Backend/seed/lessons/`  
**Файлов:** 19 JSON  
**Контракт:** lesson.id + card.id должны совпадать на фронте и бэке  
**Пример:** `T1.M4.gc.json` содержит `{ "id": "T1.M4.gc", "cards": [{ "id": "c1" }] }`

### 6.5 Команды верификации

```bash
# Сборка (typecheck + bundling) ✅
cd app && npm run build

# Headless verify (требует бэк на :5080 + preview на :4173) ⚠️
cd app && npm run verify

# Бэк-тесты (xUnit)
dotnet test backend/Codex.Backend.Tests/Codex.Backend.Tests.csproj
```

---

## Выводы

1. **Контракт добавления урока:** 3 файла трогаются (фронт `.ts` + реестр + бэк JSON), 7 шагов по AUTHORING-AI.md
2. **Формат жёсткий:** LessonData типизирована, `id` должна совпадать на фронте и бэке, `verify.expect` детерминирована
3. **Удаление 6 C#-уроков:** 1071 строка кода + 6 JSON + 12 строк реестра; нет внешних зависимостей
4. **Размер:** C# ≈ 180 строк/урок (33 строк/сегмент), Python ≈ 420 строк/урок (67 строк/сегмент)
5. **Средний урок:** 316 строк ≈ 7,800 токенов (эвристика); Python в ~2× дороже C#
6. **Анимационные примитивы:** `slot`, `ref`, `obj`, `chip`, `gate` через `at:{zone,row,col}` (auto-layout v2)
7. **Ограничения:** viewBox фиксирован (340×210/260), max сцен ~8, язык контента RU, код в исходнике

---

**Следующая фаза:** Базлайн-замер (RS-baseline.md) — инструменты, метрики, бенчмарки жанра.
