# R-M3 — Вердикт evaluator-а: майлстоун M3 (уроки F7–F10: context-managers, object-model, exceptions, type-hints)

Дата: 2026-07-16 · Раунд: 1 · Оценщик: СВЕЖИЙ внешний evaluator (не тот, что принимал M1/M2;
R-M1/R-M2 прочитаны как контекст — что там сверено, не пересверяю, фокус на НОВОМ)
Проверено против: brief.md (ворота G1–G9), features.md (приёмки F7–F10), design.md,
RS-02 (банк источников), RS-03 (чеклист expect / py3.12).
Метод: ВСЁ перепрогнано моими руками в ИЗОЛИРОВАННОМ worktree `/tmp/m3-verify`
(commit 29e7770; бэк :5081 + `Database__Path=/tmp/m3-verify-codex.db`, preview :4174,
`Cors__AllowedOrigins__0` — env-override, прод-файлы главного дерева не тронуты).
Заявления builder-а доказательствами не считались. Мои скрипты:
`verify/_eval-m3-g1-exceptions.mjs`, `_eval-fit-margins.mjs`, `_eval-m3-shot.mjs`
(в worktree); мои скрины: worktree `docs/reviews-eval-m3/`.
Примечание среды: `CODEX_DB` бэком НЕ читается — путь БД задаётся `Database:Path`
(appsettings/env `Database__Path`), что я и использовал.

---

## 1. Сборка и харнессы — мой прогон (чеклист п.1)

| Проверка | Команда | Результат |
|---|---|---|
| Сборка фронта | `VITE_API_BASE=:5081 npm run build` | ЧИСТО; JS 496.29 KB → **123.04 KB gz** (< 200 KB гейт; заявка builder-а 123.05 — сходится) |
| viz-fit | `node verify/viz-fit.mjs` (env-порты) | **ALL GREEN по 16 урокам**: 273 settled-сцены + 543 mid-transition проб; 0 FIT/CLIP/OVERLAP/ROW-BASELINE/GRID-SNAP/…; autolayout 16/16 на `at`; 0 ошибок консоли |
| new-lessons | `node verify/new-lessons.mjs` | **ALL GREEN** (полный лог перечитан, не tail): PY.M7 «built 5 animated segments», M8 — 8, M9 — 5, M10 — 4; все «all segments reach their final frame»; M7–M10 в home path; reduced-motion статика по всем 16; PY.M1 typed-такт due 41→40; 0 конс. ошибок |
| multicard-session | `node verify/multicard-session.mjs` | **ALL GREEN**: счётчики 1..4 из 4 честные, finish-CTA только на последней, 0 конс. ошибок |
| shell | `node verify/shell.mjs` | **ALL GREEN**; axe 0 serious/critical (Home 13, Document 19, Progress 14, Lesson PY.M1 18 checks); смоук ранее verified экранов (прогресс/калибровка/completion) — регресса нет |
| Бэкенд-тесты | `dotnet test …Codex.Backend.Tests.csproj` | **65/65 PASS** (= базлайн, порог шума 0) |

Среда-нюанс (не продукт): первый прогон viz-fit упал таймаутом — CORS, потому что
мой origin :4174 не в дефолтном списке appsettings; вылечено env-override. В дефолтной
конфигурации (:4173) продукт чист — подтверждено зелёными прогонами после фикса среды.

## 2. G3 — плотность F7–F10 (все 4 файла py-*.ts прочитаны целиком)

| Урок | Сегм (заявка/факт) | Гейты (predictAt) | Лесенка modify (exec) | Собес-блок | Takeaway «где встречаешь» | est |
|---|---|---|---|---|---|---|
| F7 context-managers | 5/5 ✓ (заявка ТЗ ≥4) | s2, s4 | c2 (False → reraised), c4 (raise без finally) | «зачем with, если try/finally» | httpx/testcontainers/allure.step/pytest.raises ✓ | 7 |
| F8 object-model | 8/8 ✓ (≥6) | s2, s8 | c2 (запись через класс → 2 2 2) | полиморфизм «выучить дословно» (A-2 фикс) + s7 classmethod/staticmethod | BasePage/mixins-MRO/from_env/property ✓ | 10 |
| F9 exceptions | 5/5 ✓ | s2, s4 | c2 (finally починен → cleanup\nValueError) | finally-return (§11 md) | pytest.raises(match)/retry OSError/raise from ✓ | 7 |
| F10 type-hints | 4/4 ✓ | s3, s4 | c3 (isinstance-гейт → 5\nTypeError) | «хинты = проверка» (§10 md) | Pydantic-контракт/mypy CI/хинты фикстур ✓ | 5 |

Каждый сегмент — мультикадровая сцена (2–4 кадра, каждый кадр меняет состояние узлов) +
explain + sources. Gate-примитивы по заявкам на месте (F7 s2 ok/fail «подавлено/reraised»,
s4 fail «elapsed не напечатан»→ok «finally»; F9 s1 «ловит подклассы», s2 «первый · совпал»
+ мёртвая ветка ghost, s4 fail «исключение стёрто»; F10 s1 «проверки типов нет», s4
ok «приведено: 1 (int)» / fail «ValidationError»). «Невидимое»: xray-зоны — F8 s5
«РЕНТГЕН · __get__», F10 s2 «РЕНТГЕН · __annotations__»; пауза кадра генератора в F7 s3/s4.
**`grep -c "C#"` по всем 4 файлам = 0** (в контенте и в комментариях). 0 «упоминаний
вместо анимации» на моём чтении: каждый заявленный нюанс показан сценами.
MCQ-fallback волны: `grep 'kind: "exec"'` по 10 py-уроков = **37/37 exec, 0% MCQ** ✓.

## 3. G2 — ТОЧНОСТЬ: 60+ независимых проверок, 0 ошибок

### 3.1 Дословность EN-цитат против ЖИВЫХ URL (мой WebFetch) — 25/25 VERBATIM
- compound_stmts (×7): гарантия __enter__/__exit__ · false→reraised/true→suppressed ·
  «inspects the except clauses in turn» · «class or a non-virtual base class» ·
  else-условие · «the saved exception is discarded» · «re-raised at the end of the
  finally clause» — все дословно.
- contextlib (×3): «At the point where the generator yields…» · «must yield exactly one
  value…» · «reraised inside the generator at the point where the yield occurred» ✓.
- PEP 343: «factor out standard uses of try/finally statements» ✓.
- exceptions (×2 цитаты + дерево): «All built-in, non-system-exiting…» · OSError
  «system-related error… "file not found" or "disk full"» · ConnectionError «A base
  class for connection-related issues» ✓.
- tutorial/classes (×3): instance/class variables · mangling «textually replaced with
  _classname__spam…» · «nothing in Python makes it possible to enforce data hiding» ✓.
- mro-howto (×2): C3-линеаризация · «resolution order of attributes, not only of methods» ✓.
- descriptor-howto (×3): «It is how functions turn into bound methods» · «Functions stored
  in class dictionaries get turned into methods when invoked» · «Common tools like
  classmethod()… are all implemented as descriptors» ✓.
- functions (×3): super «parent or sibling class of type» · classmethod «receives the
  class as an implicit first argument…» · staticmethod «does not receive an implicit
  first argument» ✓.
- simple_stmts raise (×3): from-chaining · __cause__ (which is writable) · «both
  exceptions will be printed» ✓.
- PEP 765: статус **Final**, Python 3.14, «This PEP proposes to withdraw support…»,
  SyntaxWarning в 3.14 — все три клейма урока подтверждены ✓.
- PEP 484 (×2): «no type checking happens at runtime» · «authors have no desire to ever
  make type hints mandatory» ✓. typing (×3): Optional[X] эквивалент · «not the same
  concept as an optional argument» · «third party tools such as type checkers, IDEs,
  linters» ✓. PEP 604: Abstract-цитата, Final/3.10 ✓.
- pydantic.dev (×3, URL из урока живой): «Models are simply classes which inherit from
  BaseModel…» · «the string '123' was coerced to an integer…» · «Pydantic's
  ValidationError is raised when data cannot be successfully parsed…» ✓.

### 3.2 ИЕРАРХИЯ ИСКЛЮЧЕНИЙ F9 (фикс A-3) — живой exception-hierarchy + мой python3.12
Живая страница docs.python.org/3/library/exceptions.html: в дереве **FileNotFoundError
и ConnectionError — дети OSError** (поддерево процитировано в моём фетче). Мой прогон
3.12.13: `__mro__` обоих = `[…, 'OSError', 'Exception', 'BaseException', 'object']`,
`issubclass(..., OSError)` → True/True. Фикс конспекта воспроизведён верно, урок
не повторяет ошибку md. ✓

### 3.3 MRO-пример F8 — мой СОБСТВЕННЫЙ python3.12 (не спайк builder-а)
Diamond D(B, C): `D().hello()` → **B**; `[c.__name__ for c in D.__mro__]` →
**['D', 'B', 'C', 'A', 'object']**; кооперативная цепочка super() → **D->B->C->A**
(super() из B ушёл к sibling C, не к родителю A) — все три клейма s3/s4 совпали
байт-в-байт. Дескриптор s5: `function` → `method`, `bound() == u.greet()` → True ✓.
UnionType s3 F10: `type(int | None).__name__` → `UnionType`, `is types.UnionType` → True ✓.

### 3.4 Карточки evidence/py-cards — мой прогон ×2 ВСЕХ 16 карт M7–M10
python3.12.13, каждый файл дважды: **детерминизм 16/16, stderr пуст 16/16,
stdout == verify.expect фронта байт-в-байт 16/16**. Мой скрипт сверки трёх сторон:
**front(ts) == seed(json) == stdout: 16/16 OK, 0 расхождений**. Чеклист RS-03:
stdout-only ✓; без set-порядка ✓; без таймингов/id()/адресов ✓; `is` — только `is None`
(гарантия языка, не рантайм-identity) ✓; имена исключений через `type(e).__name__`
(F9 c2/c4, F7 c2/c4, F10 c3) ✓ — одно исключение-буквоедство: PY.M8_c4 печатает литерал
`"AttributeError"` в except-ветке (см. ПРОБЛЕМЫ). census-log.txt: 37 карт, ×2, версия
3.12.13, stderr отдельно — согласован с моими прогонами.

### 3.5 Pydantic-клейм F10 — спайк-лог + МОЁ независимое воспроизведение
Лог `evidence/spikes/f10_pydantic_out.txt`: **версии зафиксированы** («Python 3.12.13 +
pydantic 2.13.4», run 1/run 2, stderr пуст). Я собрал СВОЙ venv (python3.12 -m venv +
`pip install pydantic==2.13.4`) и прогнал спайк ×2: `int 1` / `ValidationError` —
байт-в-байт с логом и содержанием s4. ✓
Прочие спайки моим прогоном: f8_polymorphism_fixed → `12.56`/`12` (A-2 фикс живой);
f9_flow_paths → else/finally + err2/finally2; f10_pep604 → `default found`/`UnionType`;
f7_cm_no_finally → `start`+ValueError без elapsed vs `start`/`elapsed` с finally ✓.

### 3.6 Замер лейблов (заявки headroom) — мой прогон `_eval-fit-margins`
M7 худший = **6.8px** («teardown жив») ≥ 6; M8 худший = **6.9px** («нет неявного») ≥ 6;
M9 — ни одного лейбла с margin <10 (пусто в отчёте); M10 худший = **7px** («found»).
Все четыре числа builder-а совпали с моим замером; правило «natural ≥6px» (урок M2)
в M3 соблюдено без исключений.

## 4. G1 — такт петли на НОВОМ уроке (PY.M9.exceptions), мой собственный прогон

`verify/_eval-m3-g1-exceptions.mjs`, свежий пользователь 895357, путь ПОЛЬЗОВАТЕЛЯ
(home → чип python → урок из ленты, не deep-link), изолированная БД — **ALL GREEN**:
1. `/api/due` ДО: **43** карты (= 6 C# + 37 PY — все карты M7–M10 вошли в очередь),
   `PY.M9.exceptions/c1` в очереди.
2. ACT: typed-ввод `done` (= мой собственный python3.12-прогон PY.M9_c1.py ×2) →
   verdict ✓ (objective) → Good предвыбран → POST /api/review →
   `{"grade":"Good","stability":2.3065,"state":"Learning","reps":1,…}`.
3. OBSERVE: due 43→42, c1 ушла из очереди.
4. PERSIST: полный reload — due остаётся 42, c1 отсутствует; прямой запрос в SQLite
   (/tmp/m3-verify-codex.db): `895357|PY.M9.exceptions/c1|2.3065|1|1` — строка в
   review_state. Эффект реален, не display-only.
5. 0 ошибок консоли.

## 5. Глазами — скрины evidence/F7..F10 (56 PNG builder-а, смотрел выборкой 10) + мои 2

- F7 s2: ValueError-чип → пара гейтов «return True · подавлено» / «return False ·
  reraised», консоль `enter body exit after` — контраст читается. s4: fail-путь
  («elapsed # ← ?», teardown-гейт) читаем.
- F8 s4: MRO-чипы D→B→C→A + консоль `D->B->C->A`; s5: «РЕНТГЕН · __get__», u+greet →
  method, консоль `function method` — signature-«невидимое» на месте и заметно. s3:
  MRO-порядок с `D.__mro__`-консолью.
- F9 s1: дерево Exception→OSError→{ConnectionError, FileNotFoundError} + гейт «except
  OSError · ловит подклассы»; s4: «return в finally · исключение стёрто», консоль `done`.
- F10 s2: рентген `'x': int / 'return': str` на объекте функции; s4: два входа
  `id="1"`/`id="abc"` → ok/fail гейт с ValidationError.
- Карточка M8 c1 (390-card-after): typed-ввод «НАПЕЧАТАЙ ВЫВОД», моно, вердикт ✓,
  «По результату — Хорошо», кнопки оценки — паттерн продукта.
- МОИ снимки (worktree docs/reviews-eval-m3/): eval-390-home-python-m3.png — лента
  python с 10 уроками, 4 новых M3-урока видны с бейджами «4 новых», чипы треков живы;
  eval-390-m7-s4-final.png — финальный кадр s4 с ok-гейтом «finally: teardown жив».
- Кадры не пустые, лейблы не режутся (сверено глазами + margin-замером §3.6), бренд
  выдержан: cream #F6F1E9, белые карточки, коралловые акценты, Rubik/JetBrains Mono,
  xray-штриховка/консоль-паттерн как в эталоне boxing/closures; анти-слоп ✓.

**Паспорт вкуса: PASS** (доказательства: мой снимок docs/reviews-eval-m3/
eval-390-home-python-m3.png — токены/чипы/лента с 4 новыми уроками; builder-овы
F8/390-seg-s5-final.png — xray-«РЕНТГЕН · __get__» signature, F9/390-seg-s1-final.png —
дерево и гейт; соседство с эталоном boxing выдерживает — та же плотность кадра
код-панель + зоны + консоль + механизм).

## 6. Пересчёт количественных под-заявок

| Заявка builder-а | Пересчитано мной | Вердикт |
|---|---|---|
| Сегменты F7..F10 = 5/8/5/4 | harness «built N animated segments» 5/8/5/4 + чтение файлов | ✓ |
| Карточки 4/4/4/4, все exec | grep exec = 16; front==seed==stdout 16/16 | ✓ |
| MCQ волны 0% (37/37 exec) | grep по 10 py-уроков: 37 exec / 37 карт | ✓ |
| «viz-fit ALL GREEN 273 сцены, 16 уроков» | мой прогон: дословно 273/16, 0 нарушений | ✓ |
| «build 123.05 KB gz» | мой build: 123.04 KB gz (< 200) | ✓ |
| dotnet 65/65 | 65/65 | ✓ |
| headroom 6.8 / 6.9 / «<10 нет» / 7 | мой замер: 6.8 / 6.9 / пусто / 7 | ✓ |
| «/api/due свежего пользователя содержит все 8 карт M9+M10» | due=43 = 6+37, c1 M9 в очереди (G1-прогон) | ✓ |
| «13 PNG» evidence F8 | фактически 19 PNG (s1–s8 ×2 + head + card ×2) | ⚠ число в заявке занижено, по сути лучше |
| pydantic «версии в out-логе» | 3.12.13 + 2.13.4 в логе; воспроизведено моим venv | ✓ |

---

## ВЕРДИКТ: ПРИНЯТО-С-ЗАМЕЧАНИЯМИ

(0 БЛОКЕРОВ; для бинарного контракта оркестратора = ПРИНЯТО; замечания — в backlog M4)

## ПРОБЛЕМЫ:
- [МЕЛОЧЬ] PY.M8_c4.py печатает литерал `print("AttributeError")` вместо
  `type(e).__name__` — буква RS-03 §6 («имя исключения, печатаемое через
  type(e).__name__») нарушена, дух (детерминизм, без traceback-текста) соблюдён,
  и код в вопросе карточки честно показан. Одна строка правки для единообразия.
- [МЕЛОЧЬ] F9 s2 explain обрывает цитату «…base class of the exception object» без
  многоточия (в источнике дальше «, or to a tuple that contains such a class») —
  тот же класс гигиены цитирования, что PEP 492-нюанс из R-M2: содержание дословно,
  маркировки усечения нет.
- [МЕЛОЧЬ] features.md заявляет «скрины evidence/F8/ (13 PNG)» — фактически 19;
  счётчики в приёмках должны быть точными даже когда реальность лучше заявки.
- [МЕЛОЧЬ] `verify/_fit-margins.mjs` хардкодит `:4173` (не читает APP_BASE) —
  единственный инструмент набора, который нельзя направить на другой стек без правки;
  я гонял патченную копию.

## ЧТО ПЛОХО:
- Signature-ось «байткод-панель dis» в M3 не использована ни разу (grep il[]-панелей
  по 4 урокам = 0; последний dis-кадр — M5). «Невидимое» честно несут xray-зоны
  (__get__, __annotations__) и пауза кадра, но вторая половина фирменной оси ставки
  простаивает три урока подряд — в F11 (async/GIL) её стоит вернуть.
- Очередь свежего пользователя — уже 43 new-карты разом; риск brief-а «due-очередь дня
  не взрывается» продолжает расти, замер ДО/ПОСЛЕ в F15 теперь не формальность,
  а обязательное доказательство.
- Ghost-узлы на reduced-motion финалах почти невидимы (мой пересъём M7 s4: ghost
  ValueError в «ТЕЛО WITH» практически неотличим от пустой зоны) — для пользователя
  со static-предпочтением часть нарратива кадра теряется; viz-fit это не меряет.
- Нижняя граница плотности: F7 s5 (2 сцены чипов «вручную vs with») и F10 s1 —
  концептуально оправданные, но самые плоские кадры M3; доля таких сегментов
  не выросла против M2, следить в M4.
- Бандл 123 KB gz при 16 из 18 уроков волны — гейт 200 KB пока с запасом, но траектория
  (+24 KB за M3) делает вопрос code-splitting данных уроков на M4–M5 практическим.

## ПРОВЕРКА ДОКАЗАТЕЛЬСТВ (заявления builder-а против моих прогонов):
- «build чисто 123.05 gz» → мой build: 123.04 gz ✓
- «viz-fit ALL GREEN 273 сцены / 16 уроков» → мой прогон: дословно ✓
- «new-lessons ALL GREEN: M7=5, M8=8, M9=5, M10=4, autoplay s1, reduced-motion» →
  мой прогон, полный лог: дословно ✓
- «multicard/shell/verify ALL GREEN, axe AA» → мои прогоны multicard+shell: ✓
  (npm run verify не перегонял — его пути покрыты new-lessons/multicard моих прогонов)
- «dotnet 65/65» → мой прогон: 65/65 ✓
- «EN-цитаты перепроверены фетчем, дословны» → 25 цитат моим фетчем: 25/25 VERBATIM ✓
  (+1 нюанс усечения без маркировки, F9 s2)
- «expect = stdout python3.12 ×2, front==seed==census» → все 16 карт M7–M10 перегнал
  сам ×2 + трёхсторонняя сверка скриптом: 16/16 ✓
- «спайки ×2, stderr пуст» → 4 спайка перегнал сам + pydantic в собственном venv ✓
- «иерархия A-3, MRO C3, super→sibling» → мой python3.12 + живая docs-страница ✓
- «headroom M7 6.8 / M8 6.9 / M9 ≥10 / M10 7» → мой замер: совпало ✓
- «0 ошибок консоли» → 0 во всех моих прогонах (viz-fit/new-lessons/multicard/shell/G1) ✓

## СОМНЕНИЯ:
- F7 s2 сцена 3 держит консоль `enter body exit after` (сценарий True) при показе
  контраста return False — caption честно оговаривает «консоль выше — сценарий True»,
  но невнимательный читатель может привязать вывод к False-ветке.
- F8 s7 консоль `ApiClient` — вывод `cls.__name__` фабрики; в коде сегмента строка
  `return cls()` без print — консольный вывод собран из спайка f8_cls_static, а не из
  4 строк кода на экране (паттерн «код-иллюстрация + консоль-факт» в продукте принят,
  G2-риска нет: карточек на этом нет).
- «Каждое утверждение — первоисточник»: мой аудит — выборка (25 цитат + все exec-факты),
  полный CENSUS остаётся на финальном VERIFY; на моей выборке 0 расхождений.

РЕЗЮМЕ: M3 реален и доказан моими прогонами в изолированном worktree. 5 харнессов +
65 тестов зелёные моим запуском; плотность F7–F10 = 5/8/5/4 сегментов фактом (каждый —
мультикадровая сцена+explain+sources, лесенка predict+modify exec в каждом уроке,
0 упоминаний C#); точность — 60+ независимых проверок (25 цитат живым фетчем, иерархия
исключений против живой exception-hierarchy, MRO/super/дескриптор/UnionType моим
python3.12, 16/16 карточек ×2 с трёхсторонней сверкой front==seed==stdout, pydantic
2.13.4 в моём собственном venv); G1-такт на PY.M9 доказан до строки в SQLite; глазами —
10 кадров builder-а + 2 моих, паспорт вкуса PASS. Блокеров нет; замечания (литерал
в M8_c4, гигиена усечения цитат, простой dis-оси, ghost на reduced-motion) — в M4.
