# Progress — Python-трек, волна 1 (builder-журнал)

## 2026-07-15 · F1 walking skeleton → self-pass (МАЙЛСТОУН M1)

**Сделано.** Мультитрек-UI (generic): `lang` в LessonData; `TRACK_GROUPS` в lessons/index.ts;
home сгруппирован на две секции по образцу турнира A1 (лейблы из strings.ts + сабтайтл Python
+ бейдж «новый трек»); хардкоды «Путь · Ядро C#»/greetSub нейтрализованы; `hlCode(line, lang)`
с python-веткой (keywords/builtins/#/строки+f-строки), C#-ветка не тронута; бейдж код-панели
по языку «IL» ↔ «dis · байткод» (+caption). Урок PY.M1.names-objects (8 сегментов: карта хребта
§0 → привязка имён → mutable/immutable → aliasing (predict) → mutable default (predict) →
refcount+GC → int("257")-кэш → signature dis-кадр по B1) + 3 карточки predict-output + seed.
Харнессы: build чисто, viz-fit ALL GREEN, verify ALL GREEN, new-lessons (расширен PY.M1 + новый
блок typed-карты PY: due 7→6) ALL GREEN, shell ALL GREEN, dotnet test 65/65. Скрины F1 в
evidence/F1/ — смотрел глазами.

**Решения.**
- Зоны Python-урока: «ИМЕНА (frame · только ссылки)» / «ОБЪЕКТЫ (куча CPython)» — осознанный
  контраст со «стек/куча» C#-трека (RS-01 §4).
- refs-чип (грефт B3) — отдельным рядом ПОД объектом, не вложенным: вложенный чип пересекает
  baseline value-текста obj-ноды. Coral-вспышка = accent-флаг чипа.
- Бейдж «новый трек»: solid coral + белый провалил axe AA → заменён на AA-пару токенов
  coral-text/coral-tint (паттерн существующего .pill).
- `.tok-str` (новый CSS-класс подсветки строк python) = var(--amber-text) — токен, без хардкода.
- s7 малые int: только конструкция `int("257")` (запрет RS-03), exec-карточки на identity нет.
- s8 dis: опкоды дословно из `python3.12 -m dis` (RESUME/LOAD_CONST/STORE_NAME/LOAD_NAME/
  RETURN_CONST), лог evidence/F1/dis-s8.txt; в explain оговорка «implementation detail».
- **Отклонение от общей приёмки (и) — на решение оркестратора/чекпойнта M1:** контракт F1 задал
  ровно карточки c1–c3 predict-output (D-3 RS-01), лесенка predict→modify→explain для M1 не
  собрана. Если гейт G9-прокси требует лесенку у КАЖДОГО механизм-урока — добавлю c4 (modify)
  / c5 (explain) отдельным тактом после вердикта (это правка урок+seed, ~30 мин).
- verify/_py-track-shots.mjs — переиспользуемый скрипт evidence-скринов PY-уроков (390×844).

**Грабли.**
- Узкая зона (w=138, inner 120) НЕ вмещает 2 колонки узлов (56+16+56=128 → layout throw) —
  для карты s1 использованы две полноширинные зоны-полосы (312) с grid-колонками.
- /api/lessons требует Bearer-токен (IDOR-фикс) — прямой curl без /api/auth вернёт 401.
- Скрипты со scratchpad не резолвят playwright — evidence-скрипты класть в app/verify/.
