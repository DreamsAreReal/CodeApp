# R-05 — Вердикт evaluator-а по майлстоуну M1 (F1 + F6: скелет + первые 3 урока C#)

Дата: 2026-07-18 · Ветка: `lessons-corpus/wave1` · Раунд: 1 (первый eval M1)
Оценщик: внешний скептичный EVALUATOR (свежий контекст). Всё перепроверено собственными
прогонами; заявкам features.md/build-chunks.txt не доверял — перегонял.

## ВЕРДИКТ: ПРИНЯТО

M1 (F1 walking skeleton + F6 два урока) реально работает: сборка зелёная с code-splitting,
все 5 харнессов ALL GREEN, dotnet 65/65, exec-истина всех 7 карточек трёх уроков подтверждена
моим run-csharp (stdout == expect дословно, включая `\n`), точность уроков сверена ДОСЛОВНО с
живыми страницами Microsoft Learn (0 мифов из 15), паспорт вкуса выдержан с реально снятыми
числами в signature-панелях. Два СУЩЕСТВЕННЫХ замечания (vtable-провенанс, жадный prefetch) —
не блокеры M1-гейта, но обязательны к решению ADR до массового авторинга (M2+).

**Паспорт вкуса: PASS** — доказательство: `reviews/evidence/M1/SIG-CS.S1.value-types-copy-svg4.png`
(панель «struct copy: 0 байт» sage vs «class new: 24 байта / gen0 аллокация» coral — оба числа
я перепроверил run-csharp), `SIG-CS.S1.type-system-map-svg2.png` (overload/dispatch),
`SIG-CS.S1.classes-virtual-dispatch-svg2.png` (vtable-slot → Derived.V), `home-375/768/1280.png`
(токены cream/coral/sage, Rubik+JetBrains Mono, line-SVG иконки, 0 эмодзи, signature-обещание
«Уровень ниже абстракции» на home). Signature-элемент существует и заметен в каждом уроке.

---

## Таблица гейтов (гейт → метод → измерено мной → PASS/FAIL)

| Гейт | Метод (мой прогон) | Измерено | Вердикт |
|---|---|---|---|
| G1 Сборка + code-split | `npm run build`, `wc -c dist/assets/index-*.js` | зелёный 353ms; entry **111.30 KB raw / 34.88 KB gzip** (111298 байт); чанк на КАЖДЫЙ урок (value-types-copy 22.34/type-system-map 19.30/classes-virtual-dispatch 19.50 KB); базлайн 571.88 KB → **−80.5%**, ≤ базлайн+10% с огромным запасом | PASS |
| G2 Харнессы (5) | run.mjs, viz-fit.mjs, shell.mjs, new-lessons.mjs, loop.mjs | ВСЕ ALL GREEN; viz-fit **359 сцен, 0 нарушений** (растёт с 316 базлайна — 3 новых урока покрыты); shell axe 0 serious/critical; 0 console errors везде | PASS |
| G3 Бэкенд | `dotnet test` | **65/65 Passed, 0 Failed** | PASS |
| G4 Exec-истина | POST /api/authoring/run-csharp по 7 карточкам + панельные числа | **7/7 stdout==expect дословно**; anti-echo 7/7 (run="dotnet run" ∌ expect); панельные числа (0/24 байта, object/string overload, Derived.V/Base.N, Area=12.57, System.String) — все реальны | PASS |
| G5 Целостность (sanity) | seed card.id vs фронт; /api/due fresh user | card.id совпадают (c1/c2/c3, c1/c2, c1/c2); fresh due=66 (59+7), 7 CS.S1-item'ов с корректным `lesson/card` id | PASS (F2/F5 полная миграция — M2) |
| G7 Точность (trace-to-original) | WebFetch 5 живых страниц Learn + сверка ≥5 утверждений/урок + 15 мифов | Все ключевые цитаты ДОСЛОВНЫ; **0 из 15 мифов** как факт; см. аудит ниже | PASS |
| G7 Плотность (пересчёт) | grep-подсчёт сегментов/карточек/takeaways | value-copy 6сег/3карт; type-map 5сег/2карт; virtual 5сег/2карт — все ≥4 сег/≥2 карт; takeaways ровно 3 (why/cost/avoid); misconception 1; viz-fit динамика подтверждена | PASS |
| G8 Провенанс | sources[] каждого урока — URL живой | Все URL резолвятся (fetch-verified); **исключение: vtable-механика s3 → только ms-poly, который vtable НЕ содержит** — см. замечание | PASS с оговоркой |

Сырой вывод замеров: см. `evidence/F1/*`, мои прогоны в теле вердикта, скриншоты в
`reviews/evidence/M1/`.

---

## Аудит точности G7 (закрытый корпус GT-M1 + живая сверка Learn)

Сверил ДОСЛОВНО против живых страниц (fetch 2026-07-18):

**value-types-copy** (все цитаты verbatim подтверждены на learn.microsoft.com/.../value-types):
- B1 «A variable of a value type contains an instance of the type…» ✓ дословно
- A4/B «By default, on assignment, passing an argument…, you copy the corresponding type instances» ✓
- «operations on a value-type variable affect only that instance…» ✓
- B3 (shallow) «you copy only the reference… Both the copy and original… have access to the same reference-type instance» ✓
- Пример доки даёт `0 [A, B]`/`7 [A, B]` и MutateAndDisplay → ровно c2 и s6. Числа 0/24 байта — мой run-csharp.

**type-system-map** (verbatim на .../fundamentals/types/):
- A6/A7 «The compile-time type controls overload resolution… The run-time type controls virtual method dispatch, is expressions, switch expressions» ✓ дословно
- «compile-time type is the declared or inferred type… run-time type is the actual type of the instance» ✓
- A2 «All types ultimately derive from System.Object… ValueType, which derives from object… Common Type System (CTS)» ✓
- A8 «boxed has a compile-time type of object but a run-time type of string. The assignment works because string derives from object» ✓
- «Value types hold their data directly… Reference types hold a reference… both variables point to the same object» ✓

**classes-virtual-dispatch** (verbatim на .../polymorphism и .../object-oriented/):
- C4 «At run-time… the CLR looks up the run-time type of the object, and invokes that override…» ✓
- C3 «A derived class can override… only if… virtual or abstract. The derived member must use the override keyword» ✓
- «that member is called even when an instance of that class is being accessed as an instance of the base class» ✓
- C5 «you're creating a method that hides… rather than overriding… the method that gets called depends on the compile-time type of the variable» ✓; «the variable's declared type» ✓
- C1 «automatically contains all the public, protected, and internal members… except its constructors and finalizers» ✓ (object-oriented/ index)
- base-keyword цитата ✓

### 15 мифов — проверка (grep + ручной разбор):
- «value всегда на стеке» — **отсутствует**. Урок точен: «inline — на стеке для локальной переменной, или внутри содержащего объекта для поля». Формулировки «на стеке» контекстны (локальная переменная / кадр метода) — ровно то, что разрешает GT-M1.
- «строки — value type» — **отсутствует** (string корректно reference-тип).
- «deep copy struct» — **отсутствует** (shallow показан явно).
- «оригинал и бокс — одна память» — **отсутствует**.
- «unbox по совместимости» — тема не в скоупе этих 3 уроков.
- «выдуманные числа боксинга» — **отсутствует** (число 24 байта = class new аллокация, мой замер; боксинг только качественно).
- «все методы виртуальны по умолчанию» — **отсутствует**.
- «new переопределяет» — **отсутствует** (контраст override/new показан).
- «виртуальный вызов по типу переменной» — **отсутствует** (корректно по run-time типу).
- «структуры можно наследовать» — **отсутствует**.
- «поля virtual» — **отсутствует**.
Итог: **0 мифов из 15**.

---

## ЧТО ПЛОХО (обязательная секция, ≥3)

1. **[СУЩЕСТВЕННОЕ · G8-провенанс] vtable/метод-таблица без источника.** Урок
   `classes-virtual-dispatch` строит signature-панель «МЕТОД-ТАБЛИЦА / vtable» (s3) и активно
   использует термин «vtable» (kicker, home.subtitle, foot, takeaways). GT-M1 красный флаг прямо
   предупреждает: на страницах Learn C# fundamentals термина «method table / vtable» НЕТ (я
   подтвердил fetch-ем polymorphism и object-oriented — слово отсутствует). Механика vtable-slot-
   indexing верна (ECMA-335 §I.8.10), и урок НЕ атрибутирует слово «vtable» к цитате (цитаты в
   explain касаются только «CLR looks up run-time type» — это дословно). НО единственный источник
   сегмента — `ms-poly`, который эту механику не покрывает. **Требование: добавить ECMA-335
   §I.8.10 / dotnet BOTR в sources[] сегмента s3 (и type-system-map s4, где тоже gate «vtable →»).**
   Пока источник для vtable-панели отсутствует — это дыра провенанса на signature-элементе.

2. **[СУЩЕСТВЕННОЕ · архитектура/цель G1 на горизонте] жадный boot-prefetch подрывает смысл
   code-splitting при масштабе.** Измерил сетью: `prefetchAll()` на boot грузит **все 22 тела
   уроков** сразу после home (`Promise.allSettled(MANIFEST.map(e=>e.load()))`). Метрику ГЕЙТА G1
   (начальный чанк) это не ломает — тела в отдельных чанках, entry остаётся 111 KB. Но ЦЕЛЬ
   инфраструктуры («не тянуть весь корпус») сводится на нет: при 100+ уроках это ~2-3 MB фоновой
   загрузки на КАЖДЫЙ старт. **Требование: ADR о стратегии prefetch по масштабу (текущий раздел /
   первые N по prereq / on-hover) до массового авторинга M2+.** См. prefetch_assessment.

3. **[МЕЛКОЕ · устаревший evidence] build-chunks.txt в F1 не соответствует текущей сборке.**
   Заявлено entry 110.20 KB, я намерил **111.30 KB (111298 байт)**. Причина: снимок build-chunks.txt
   сделан ДО добавления 2 уроков F6 (в нём нет type-system-map/classes-virtual-dispatch, entry-хеш
   другой: D0gXX6Iu vs текущий 7n2S7Pld). Расхождение +1.1 KB (2 урока метаданных) — гейт проходит
   с запасом, но «НОВЫЙ базлайн G1 = 110.20 KB» в features.md неточен. **Зафиксировать реальный
   базлайн G1 = 111.30 KB raw / 34.88 KB gzip.**

4. **[МЕЛКОЕ] anti-echo lint структурно слабый.** `run: "dotnet run"` — заглушка, а не реальный
   код карточки, поэтому lint «expect ∌ run» тривиально проходит (в run нет ничего). Реальную
   защиту от echo даёт не lint, а мой exec-прогон + G7-аудит. Это осознанный компромисс design.md
   («литеральный чек; обходится вычислением, компенсация G7-аудитом») — но при массовом авторинге
   lint даёт ложное чувство защиты. F5 (density/lint, M2) должен усилить.

5. **[МЕЛКОЕ] IL-offset'ы в value-types-copy s4 упрощены.** Урок показывает `IL_0006: stfld`,
   реальный ilspycmd — `IL_0006: stfld` после `IL_0004: ldc.i4.s 99` (урок пропускает ldc). Опкоды
   подлинные (сверил с evidence IL-дампом), но offset'ы дидактически причёсаны. Не искажение, но
   строго «реальный IL» — с оговоркой «показаны ключевые опкоды».

---

## Проверка доказательств builder-а (перепроверял, не верил)

- «entry 110.20 KB» → **опровергнуто моим замером: 111.30 KB** (устаревший снимок; гейт всё равно PASS).
- «5 харнессов ALL GREEN + dotnet 65/65» → **подтверждено** моими прогонами.
- «все exec-числа реальны (run-csharp)» → **подтверждено** — сам прогнал 7 карточек + панели, stdout==expect.
- «IL из реальной компиляции (ilspycmd)» → **подтверждено** — опкоды совпадают с IL-дампом evidence.
- «type-system-map 5 сегментов, classes-virtual-dispatch 5 сегментов» → **подтверждено** grep-подсчётом.
- «viz-fit 22/22 lessons, 0 нарушений» → **подтверждено** (359 сцен, 0).
- Скриншоты builder-а (375-signature-panel-s5.png) сняты на НЕ-финальном кадре («замер…») —
  я снял свои финальные кадры с реальными числами (reviews/evidence/M1/).

## СОМНЕНИЯ

- vtable-панель — концептуально глубокая и корректная, но это САМОЕ смелое место урока и оно
  без первоисточника. Разрешаю на M1 (утверждения истинны, не выданы за цитату Learn), но помечаю
  как долг провенанса — на финале волны должен быть закрыт источником.
- prefetch: для дня-1 с малым каталогом это UX-плюс (мгновенное открытие). Риск строго на горизонте
  масштаба. Не блокирую M1, но это классический «сейчас ок, через 3 майлстоуна катастрофа».
- G9 (лимит новых карт ≤10/день): fresh due=66 без лимита. Это НЕ гейт M1 (F3 в M2), но фиксирую
  как открытый долг — на M2 лимитер обязателен, иначе день-1 = весь каталог.

## Анти-зацикливание
Раунд 1 для M1 — прошлых блокеров M1 нет. Планка НЕ снижена: применял полную бинарную рубрику
качества + trace-to-original + пересчёт под-заявок числом + собственные exec-прогоны.
