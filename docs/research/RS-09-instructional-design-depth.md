# RS-09 — Инструкционный дизайн для ЭКСПЕРТНОЙ ГЛУБИНЫ (анти-упрощение)

Дата: 2026-07-08. Автор: researcher фазы 1 (линза RS-09). Языки: отчёт — RU, код/идентификаторы — EN.
Доступ к источникам: accessed 2026-07-08.
Статус доказательности: рецензируемая первичка (журналы с DOI, семинальные работы,
CS-education-исследования ACM/Springer) + практик-первичка (Cleary). Веб-корпус доступен —
`ДЕГРАДИРОВАНО` не объявляется. PubMed/Context7/MS-Learn MCP не понадобились: линза когнитивно-
педагогическая, первичка живёт в Educational-Psychology / CS-education журналах (доставал вебом
до первоисточника). Class-D блоги в источники НЕ брались.

Связь с корпусом: RS-01 покрыл ПАМЯТЬ (FSRS, spacing, testing/retrieval, generation, dual coding,
worked-example/CLT — кратко, calibration). RS-09 идёт ГЛУБЖЕ в КОНЦЕПТУАЛЬНУЮ глубину и экспертизу:
как строить понимание «на атомы» и как ПРЯМО ломать мисконцепции, не упрощая. Пересечения с RS-01
не дублируются, а надстраиваются.

---

## 1. Вопросы линзы (что закрываем)

1. Worked-example effect + faded worked examples/scaffolding; self-explanation; contrasting cases +
   productive failure / preparation for future learning; expertise-reversal.
2. Notional machine и мисконцепции новичков; refutation texts / conceptual change; elaborative
   interrogation; deliberate practice.
3. Как учить НЮАНСАМ без упрощенчества: прогрессивное раскрытие глубины; predict-then-run; edge
   cases/gotchas как первоклассный контент; design rationale.
4. Конкретный ШАБЛОН СТРУКТУРЫ УРОКА для экспертной глубины + связь с типами карточек app и FSRS.
5. Как измерять ЭКСПЕРТНОЕ понимание (генерация, перенос/transfer, калибровка).

---

## 2. Корпусы и классы источников

| Вопрос | Корпус | Классы источников | Покрыто |
|---|---|---|---|
| Worked examples / fading / self-explanation | нормативная база науки | A: Renkl&Atkinson 2003, Chi 1989/1994, Atkinson&Renkl&Merrill 2003 | да |
| Productive failure / PFL / contrasting cases | нормативная база науки | A: Kapur 2008/2016, Sinha&Kapur 2021 (мета), Schwartz&Bransford 1998, Schwartz&Martin 2004 | да |
| Expertise reversal | нормативная база науки | A: Kalyuga et al. 2003, Kalyuga 2007 (обзор) | да |
| Notional machine / мисконцепции | нормативная база (CS-education) | A: Sorva 2012/2013, du Boulay 1986, Qian&Lehman 2017 | да |
| Refutation texts / conceptual change | нормативная база науки | A: Tippett 2010 (обзор), мета-анализ EdPsych 2025, KReC-framework | да |
| Elaborative interrogation | нормативная база науки | A: Dunlosky et al. 2013 (PSPI) | да |
| Deliberate practice | нормативная база науки | A: Ericsson, Krampe & Tesch-Römer 1993 | да |
| Predict-then-run / engagement | нормативная база (CS-education) | A: Naps et al. 2002, Myller et al. 2009 | да |
| CS-worked-examples (subgoal labeling) | нормативная база (CS-education) | A: Morrison/Margulieux/Catrambone; STEM Ed J 2020 | да (числа — частично, пейволл) |
| Assistance dilemma (когда давать/скрывать помощь) | нормативная база науки | A: Koedinger & Aleven 2007 | да |
| C#-специфичные «правильные концепции» (для refutation-карт) | мир/нормативная (MS Learn) | наводка — уточняется в контент-пайплайне RS-10/G3 | частично (см. §7, флаг) |
| Измерение понимания (concept inventory) | нормативная база (CS-education) | A/B: Tew&Guzdial FCS1/SCS1 | да |

Не покрыто первичкой в этой сессии: точные числовые эффект-сайзы subgoal-labeling (пейволл Springer),
детальный список из Qian&Lehman (ACM 403) — взяты по вторичным сводкам, помечены уверенностью
«средняя», окончательная сверка — в контент-пайплайне (RS-10) под гейт G3.

---

## 3. Находки (утверждение + источник + дата + уверенность)

### 3.1 Worked-example effect и его ГРАНИЦА — expertise reversal (ядро анти-упрощения)

- **Worked-example effect** (Sweller/CLT; в RS-01 §2.2): новичку изучение разобранного примера
  эффективнее самостоятельного решения — меньше element interactivity, рабочая память не тратится
  на поиск. Уверенность: высокая.
- **Expertise reversal effect** (Kalyuga, Ayres, Chandler, Sweller 2003, *Educational Psychologist*
  38(1):23–31; обзор Kalyuga 2007, *Educational Psychology Review* 19:509–539): приёмы, снижающие
  extraneous load у НОВИЧКА (worked examples, подробные подсказки, дублирующие пояснения), теряют
  эффект и НАЧИНАЮТ ВРЕДИТЬ по мере роста экспертизы (redundancy effect — эксперт вынужден
  «интегрировать» уже известное). **Прямое следствие для нашего app**: одна и та же карточка не может
  быть оптимальной на всём пути. Нужна АДАПТАЦИЯ уровня поддержки под текущую экспертизу учащегося ПО
  ДАННОЙ теме. Уверенность: высокая (эффект многократно реплицирован).
- **КЛЮЧЕВОЙ синтез для North Star «не упрощать»**: «экспертная глубина» = не «больше текста», а
  СНЯТИЕ лесов по мере роста мастерства. Упрощенчество = держать новичковый worked-example, когда
  учащийся уже готов генерировать. Именно expertise-reversal научно обосновывает нашу «лестницу
  реконструкции» (predict → modify → write) и fading.

### 3.2 Faded worked examples (мост «пример → задача») — центральный механизм

- Renkl & Atkinson 2003 (*Educational Psychologist* 38(1):15–22, «Structuring the transition from
  example study to problem solving…»): вместо пар «пример–задача» ПОСЛЕДОВАТЕЛЬНО убирать (fade)
  решённые шаги. Надёжно улучшает **near transfer** относительно пар пример–задача. Уверенность: высокая.
- Atkinson, Renkl & Merrill 2003 (*JEP*, «Transitioning From Studying Examples to Solving Problems:
  Effects of Self-Explanation Prompts and Fading Worked-Out Steps»): fading САМ по себе не тянет
  **far transfer**; но **fading + prompts «назови принцип этого шага»** дал medium–large эффект на
  near И far transfer БЕЗ увеличения времени. Уверенность: высокая. Это прямой рецепт нашей карточки:
  на faded-шаге спрашивать не только «что за код», а «КАКОЙ ПРИНЦИП здесь применяется».
- Renkl & Atkinson, «How Fading Worked Solution Steps Works — A Cognitive Load Perspective»
  (*Instructional Science*): механизм — fading переносит нагрузку на germane-обработку постепенно,
  не обрушивая её разом (как при резком переходе «пример → полная задача»). Уверенность: высокая.
- **Backward fading** (убирать сначала ПОСЛЕДНИЙ шаг, потом предпоследний…) — самый изученный вариант:
  учащийся всегда завершает решение, имея перед глазами начало. Уверенность: высокая (в рамках линии
  Renkl/Atkinson).

### 3.3 Self-explanation effect (двигатель глубины)

- Chi, Bassok, Lewis, Reimann, Glaser 1989 (*Cognitive Science* 13(2):145–182): «хорошие» ученики,
  изучая worked examples по механике, генерировали ГОРАЗДО больше само-объяснений (уточняли условия
  применения шага, связывали с принципами текста), чем «слабые». Выгода от примера зависит от
  качества само-объяснения. Уверенность: высокая.
- Chi, de Leeuw, Chiu, Lavancher 1994 (*Cognitive Science* 18(3):439–477): ПЕРВЫЙ экспериментальный
  интервент — простое требование «объясни каждое предложение себе» подняло recall И transfer против
  контроля (двойное чтение, время уравнено). Уверенность: высокая.
- Механика для app: карточка «объясни своими словами» (в brief уже есть, self-graded) — это не
  «мягкий» формат, а научно самый глубинообразующий; но эффект зависит от того, что учащийся объясняет
  ПРИНЦИП/причину, а не пересказывает. → prompt должен подталкивать к «почему», не к «что».

### 3.4 Elaborative interrogation («почему?») — и её ГРАНИЦА

- Dunlosky, Rawson, Marsh, Nathan, Willingham 2013 (*Psychological Science in the Public Interest*
  14(1):4–58): elaborative interrogation (генерация «почему это так/почему это осмысленно») —
  **moderate utility**. Эффект СИЛЬНЕЕ при: точных (не размытых) элаборациях, ВЫСОКОМ prior knowledge,
  само-генерации (не выданных ответах). Уверенность: высокая.
- **ГРАНИЦА (важно для анти-упрощения наоборот)**: EI сильнее для surface-фактов, чем для deep-
  понимания; при НЕВЕРНЫХ элаборациях учащийся с низким prior knowledge может стать ХУЖЕ контроля.
  → «почему?»-карточки безопасны на РАННЕЙ теме только с немедленной сверкой ответа с первоисточником
  (у нас это встроено: у каждой карточки source). Уверенность: высокая.

### 3.5 Productive failure / PFL / contrasting cases (генерация ДО объяснения)

- Kapur 2008 («Productive Failure», *Cognition and Instruction* 26(3):379–424) и Kapur 2016:
  дизайн = фаза генерации/исследования (учащийся сам придумывает решения новой сложной задачи,
  обычно «проваливается») → фаза консолидации (прямое обучение). Начальная борьба активирует prior
  knowledge и различает признаки → готовит к глубокому усвоению. Уверенность: высокая.
- Sinha & Kapur 2021 (*Review of Educational Research* 91(5):761–798, мета-анализ): 53 исследования,
  166 сравнений, >12 000 участников. **Problem-Solving-before-Instruction (PS-I)** превосходит
  instruction-first по **conceptual understanding и transfer, Cohen's d ≈ 0.36**, БЕЗ ущерба
  procedural knowledge. Уверенность: высокая (крупный мета-анализ).
- **ГРАНИЦЫ PS-I / когда «провал» НЕ продуктивен** (Sinha&Kapur 2021; «When failure fails…»,
  *Instructional Science* 2021): (а) нужен минимальный prior knowledge; (б) генерация ОБЯЗАНА
  завершаться сильным прямым обучением (чистое discovery без объяснения — проваливается); (в) сильнее
  для STEM и для более старших/зрелых учащихся. Уверенность: высокая. Наш пользователь — взрослый
  джун с prior knowledge → PS-I применим.
- Schwartz & Bransford 1998 («A Time for Telling», *Cognition and Instruction* 16(4):475–522):
  анализ **contrasting cases** (сравнение упрощённых близких вариантов) до лекции создаёт «время для
  рассказа» — через неделю такие студенты предсказывали исход НОВОГО эксперимента заметно лучше тех,
  кто читал текст/суммировал/анализировал кейсы БЕЗ последующей лекции. Уверенность: высокая.
- Schwartz & Martin 2004 («Inventing to Prepare for Future Learning», *Cognition and Instruction*
  22(2):129–184): различение **SPS** (sequestered problem solving — реши сам без опоры) vs **PFL**
  (preparation for future learning — готов ли учиться дальше). «Double transfer»-парадигма ловит
  уровни знания, которые обычный тест не видит. Уверенность: высокая. → прямое следствие для §6
  (как измерять).

### 3.6 Assistance dilemma (общая рамка «сколько помощи»)

- Koedinger & Aleven 2007 (*Educational Psychology Review* 19(3):239–264): фундаментальный компромисс —
  СЛИШКОМ много помощи (готовые примеры, подсказки) вредит; СЛИШКОМ мало — не поддерживает. Оптимум
  зависит от учащегося и момента. Уверенность: высокая. Это зонтик над §3.1–3.5: worked-example
  (много помощи) ↔ productive failure (мало помощи) — не спор, а два конца ОДНОЙ оси, регулируемой
  экспертизой (expertise-reversal) и prior knowledge.

### 3.7 Notional machine и мисконцепции новичков (специфика программирования)

- du Boulay 1986 («Some Difficulties of Learning to Program») ввёл термин **notional machine** —
  идеализированная абстрактная машина, чьи свойства ПОДРАЗУМЕВАЮТСЯ конструкциями языка; ученик должен
  построить её ментальную модель, чтобы рассуждать об исполнении. Уверенность: высокая.
- Sorva 2012 (докт. дисс. «Visual Program Simulation in Introductory Programming Education», Aalto
  University, ISBN 978-952-60-4626-6) и Sorva 2013 («Notional Machines and Introductory Programming
  Education», *ACM Transactions on Computing Education* 13(2), DOI 10.1145/2483710.2483713):
  - **Visual Program Simulation (VPS)**: учащийся ИГРАЕТ роль компьютера — сам двигает исполнение по
    визуализации notional machine (что происходит в памяти шаг за шагом). Это доводит engagement до
    уровня выше пассивного просмотра. Уверенность: высокая.
  - Мисконцепции новичков в программировании часто = дефекты ментальной модели notional machine
    (что «на самом деле» делает присваивание, ссылка, вызов). Уверенность: высокая.
- Qian & Lehman 2017 («Students' Misconceptions and Other Difficulties in Introductory Programming:
  A Literature Review», *ACM TOCE* 18(1):1–24): каталог мисконцепций — variable «хранит выражение, а
  не вычисленное значение», симметрия присваивания (`a = b` путают с `b = a`), имя переменной вместо
  значения, неверные модели ссылок/объектов, потока управления. Знание разделено на syntactic /
  conceptual / strategic. Уверенность: высокая для существования каталога; конкретные формулировки —
  средняя (взято по сводке, ACM-первичка под пейволлом; финальная сверка — RS-10/G3).

### 3.8 Refutation texts / conceptual change (как ПРЯМО ломать мисконцепцию)

- Tippett 2010 («Refutation Text in Science Education: A Review of Two Decades of Research»,
  *International Journal of Science and Mathematics Education*, DOI 10.1007/s10763-010-9203-x):
  refutation-текст (структура: назвать распространённое НЕВЕРНОЕ убеждение → явно его опровергнуть →
  дать верную модель с причинным объяснением) надёжнее обычного экспозиторного текста вызывает
  conceptual change. Уверенность: высокая (обзор двух десятилетий).
- Мета-анализ «The effectiveness of refutation text in confronting scientific misconceptions»
  (*Educational Psychologist* 60(1), 2025): устойчивое и статистически значимое преимущество
  refutation-текстов над non-refutation в контролируемых экспериментах. Уверенность: высокая.
- KReC framework (Knowledge Revision Components): refutation работает, создавая КОНКУРЕНЦИЮ верной и
  неверной информации в памяти (со-активация), а не «стирая» старое; поэтому неверную модель надо
  ЯВНО назвать, а не молча дать правильную. **Refutation с причинным + аналогическим объяснением
  сильнее, чем только причинное.** Уверенность: высокая.
- **ГРАНИЦА**: у кого мисконцепции ещё НЕТ (совсем новичок), refutation-текст не даёт преимущества
  над экспозиторным (нечего менять) и может слегка мешать (лишний контраст). → refutation-карту
  показывать там, где мисконцепция ЛИКВИДНА и распространена (value/ref, async≠thread, GC — см. §7),
  не на всём подряд. Уверенность: высокая.

### 3.9 Deliberate practice (структура «глубокой» практики)

- Ericsson, Krampe & Tesch-Römer 1993 (*Psychological Review* 100(3):363–406): экспертиза = НЕ просто
  опыт/время, а **deliberate practice** — целенаправленные усилия на КРАЕВЫХ (чуть выше текущего
  уровня) задачах, с немедленной обратной связью, повторением и коррекцией, вниманием к критическим
  аспектам. «10-летнее правило» — про длительность, «10 000 часов» (Гладуэлл) — популяризация, а не
  результат статьи (магического числа нет). Уверенность: высокая.
- Следствие для app: карточка должна давать (а) немедленный точный feedback (у нас predict/find-bug/
  write детерминированно проверяемы — идеально), (б) держать сложность у грани (desirable difficulty,
  таргет ~85% из RS-01), (в) фокус на конкретной слабости. FSRS + генеративные карты — это движок
  deliberate practice, а не просто «повторение».

### 3.10 Predict-then-run и уровни вовлечённости (для живых визуализаций)

- Naps et al. 2002 (engagement taxonomy): 6 уровней — No Viewing → Viewing → **Responding
  (предсказание)** → Changing (свой ввод) → Constructing (построй визуализацию) → Presenting. Гипотеза:
  обучение растёт с уровнем. Myller et al. 2009 расширили (Extended Engagement Taxonomy). Уверенность:
  высокая для таксономии.
- Эмпирика: стратегия **«предскажи, потом смотри» (Responding)** давала статистически значимо более
  высокую активную вовлечённость и восприятие обучения, чем пассивный просмотр с комментарием
  (Viewing) — исследование активного обучения с program visualization (RPTEL / PMC6302837).
  Уверенность: высокая (одно RCT-подобное исследование; согласуется с generation/testing effect).
- **Прямое следствие**: наша «живая визуализация алгоритма» (hash-таблица, стек/куча) НЕ должна быть
  просто анимацией «нажми play». Перед каждым нетривиальным шагом — микро-предсказание: «Куда ляжет
  этот ключ?», «Что выведется?», «Сработает ли resize?». Это поднимает визуализацию с Viewing на
  Responding и превращает её в retrieval-практику, а не пассив.

### 3.11 CS-специфичные worked examples: subgoal labeling

- Morrison, Margulieux, Catrambone и соавт. (SIGCSE/ICER; проект cs1subgoals.org): **subgoal labels** —
  структурные метки, группирующие шаги решения по функциональной подцели («что делает этот блок для
  задачи»). Новички усваивают ФУНКЦИЮ шагов, а не привязку к конкретному примеру → лучше переносят на
  новые задачи того же типа. Уверенность: высокая для эффекта.
- «Reducing withdrawal and failure rates in introductory programming with subgoal labeled worked
  examples» (*International Journal of STEM Education*, 2020, DOI 10.1186/s40594-020-00222-7):
  subgoal-метки в вводном программировании снижали отсев/провал. Точные числа — под пейволлом
  (Springer auth-wall), в отчёт как факт-константа НЕ берём (уверенность: средняя, «эффект есть,
  величина не прослежена первичкой в этой сессии»).
- **Given vs self-generated labels** (Morrison et al.): выданные метки лучше для contextual transfer,
  само-сгенерированные — для isomorphic transfer. → app может сначала ДАВАТЬ subgoal-метки (новичок),
  потом ПРОСИТЬ их сгенерировать (рост экспертизы) — это ещё одна ось fading. Уверенность: средняя.

### 3.12 Измерение понимания: concept inventory

- Tew & Guzdial 2010/2011 (FCS1 → SCS1): язык-НЕЗАВИСИМЫЙ валидированный тест CS1-концепций
  (переменные, условия, циклы, рекурсия, логика, возвраты). Показано: студенты переносят понимание
  фундаментальных концепций на псевдокод-нотацию (это и есть near-transfer-доказательство). Уверенность:
  высокая. Уточнение: IRT-валидация SCS1 нашла ~3 вопроса, меряющих «не то», и 4 слишком трудных —
  инвентарь не идеален, но это лучший валидированный ориентир для «понимания, а не узнавания».

---

## 4. Синтез: как всё складывается в «глубину без упрощения»

Кажущиеся противоречия (worked-example «дай пример сразу» vs productive failure «пусть помучается
сначала»; elaborative interrogation «полезно» vs «вредит при низком prior knowledge») разрешаются
ОДНОЙ рамкой — **assistance dilemma, регулируемый экспертизой (expertise-reversal) и prior knowledge**:

- Правильный уровень помощи — функция текущей экспертизы ученика ПО ДАННОЙ теме.
- Для НОВОЙ темы у взрослого джуна с базой: короткая ГЕНЕРАТИВНАЯ завязка (predict/contrasting-cases →
  «time for telling» + активация prior knowledge, PS-I) → worked-example (снять load) → self-explanation
  и «почему» → faded practice → полная реконструкция → edge cases → первоисточник.
- По мере роста мастерства (в наших терминах — рост FSRS-stability на концепте): убирать worked-пример,
  повышать долю write-missing и far-transfer, снимать subgoal-метки. Это НЕ упрощение — это анти-
  упрощение: удержание новичкового примера = и есть упрощенчество (redundancy, потолок).

«Глубина на атомы» операционализируется как **прогрессивное раскрытие**:
интуиция (1 слой) → механика / notional machine (2) → спека + edge cases / gotchas (3) →
«почему так спроектировано» — design rationale (4). Слои 3–4 — не «продвинутый бонус», а обязательный
контент для экспертной оси (у brief уже есть требование «слой первоисточник присутствует»).

---

## 5. ШАБЛОН УРОКА для экспертной глубины (концепт-атом) + карты app + FSRS

Единица = **концепт-атом** (напр. «boxing», «value vs reference», «hash-collision + resize»). Урок =
последовательность фаз; каждая фаза порождает карточки конкретного типа, которые дальше живут в FSRS
раздельно. Фазы 0–3 — ПЕРВОЕ знакомство (learning), фазы 4–6 — то, что реально планируется FSRS
(retrieval во времени). Порядок обоснован §3–4.

| # | Фаза | Что происходит | Наука (§) | Тип карточки app | Роль в FSRS |
|---|---|---|---|---|---|
| 0 | **Хук / мисконцепция** | Назвать распространённое НЕВЕРНОЕ убеждение + микро-предсказание («что выведет этот код?») — учащийся, скорее всего, ошибётся | refutation §3.8; PS-I/PFL §3.5; predict §3.10 | predict-the-output (как «ловушка»); контраст-пара | вводит атом; ответ логируется как первый сигнал |
| 1 | **Refutation + notional machine** | ЯВНО опровергнуть миф → показать верную модель на визуализации notional machine (что в памяти/стеке/куче на самом деле) | refutation §3.8; notional machine §3.7; dual coding | живая визуализация с predict-шагами (Responding) | не карточка recall, а «конструктор модели» перед recall |
| 2 | **Worked-example + subgoal labels** | Полный разобранный пример с метками подцелей и причинами каждого шага | worked-example §3.1; subgoal §3.11 | code-reading; «объясни шаг» (self-explain prompt) | заземляет; self-explain — генеративная |
| 3 | **Predict-the-machine** | «Прогони машину в голове»: предскажи состояние памяти/вывод на новом входе, ПОТОМ проверь визуализацией | predict-then-run §3.10; generation | predict-the-output; predict-state (viz) | первая полноценная recall-карта атома |
| 4 | **Faded practice (лестница реконструкции)** | Backward fading: заполни пропущенный шаг → допиши метод по сигнатуре. Каждый faded-шаг сопровождается prompt «назови ПРИНЦИП» | faded WE §3.2; expertise-reversal §3.1; deliberate practice §3.9 | write-missing-method (скрытые тесты); cloze; find-the-bug | ядро FSRS-очереди; сложность растёт → desirable difficulty |
| 5 | **Edge cases / gotchas** | Первоклассный контент: где модель ломается (overflow, коллизия, GC-финализатор, `struct` copy, closure над переменной цикла) | anti-упрощение §4; deliberate practice (краевые) §3.9 | find-the-bug; сравнение «какой X где»; predict на краевом входе | отдельные атомы-карты; ловят «иллюзию понимания» |
| 6 | **Reconstruct + rationale + первоисточник** | Собери целое своими словами + «почему так СПРОЕКТИРОВАНО» (design rationale) → ссылка на спеку/CLRS/MS Learn | self-explanation §3.3; elaborative interrogation §3.4; слой-4 глубины §4 | «объясни своими словами» (self-graded); «почему так» | самая глубинообразующая карта; source обязателен |

Правила применения шаблона:
- **Адаптивная поддержка (expertise-reversal-aware)**: использовать FSRS-**stability** атома как прокси
  экспертизы. Низкая S → показывать фазы 2–3 чаще (worked/predict, subgoal-метки given). Высокая S →
  чаще фазы 4–6 (write-missing, far-transfer, метки self-generated, edge cases). Это превращает
  expertise-reversal из теории в конкретное правило планировщика. (Гипотеза-дизайн; проверить sim-harness.)
- **Interleaving (RS-01)**: в одной сессии мешать атомы/фазы разных концептов, не блоками.
- **Каждая faded-карта → prompt на ПРИНЦИП**, не только «что за код» (Atkinson&Renkl&Merrill 2003 —
  условие far-transfer).
- **Refutation-фаза (0–1) — только для концептов с ликвидной мисконцепцией** (§3.8 граница); для
  «нейтральных» атомов начинать с фазы 2.
- **PS-I-доза**: фаза 0 короткая (одна ловушка), не «час мучений» — у нас взрослый с базой; главное,
  чтобы генерация ВСЕГДА завершалась сильным объяснением (фазы 1–2), иначе «провал» непродуктивен (§3.5).

---

## 6. Как измерять ЭКСПЕРТНОЕ понимание (не узнавание)

Три оси, все реализуемы на клиентских логах app (совместимо с честными метриками RS-01 §2.4):

1. **Генерация (produce, не recognize)**: доля правильных на write-missing-method / find-the-bug /
   «объясни» — самые высокие в иерархии recall. MCQ/cloze — только вход, НЕ мерило экспертизы
   (Chi §3.3, generation §RS-01). Метрика: accuracy по типам карт, взвешенная к генеративным.
2. **Transfer (перенос)**:
   - *near transfer* — тот же концепт, новый вход/контекст (faded → полная задача). Ожидаем от faded
     WE (§3.2).
   - *far transfer* — концепт в новой обёртке / сравнение «какой алгоритм где» (карты-сравнения в brief).
     Условие: subgoal-метки + prompt-на-принцип (§3.2, §3.11).
   - *PFL / double-transfer* (Schwartz&Martin §3.5): не «реши сам без опоры» (SPS), а «дай новый
     мини-материал и проверь, БЫСТРЕЕ ли учащийся его освоил». Практично для app: изредка показывать
     новый под-концепт и мерить скорость выхода на мастерство — ловит готовность учиться, которую
     обычный тест не видит. (P1/P2-метрика, требует трассировки.)
   - Ориентир жанра: **язык-независимая** проверка концепта (перенос на псевдокод / другой синтаксис),
     по образцу FCS1/SCS1 (§3.12) — сильный сигнал «понял концепт, а не заучил синтаксис C#».
3. **Калибровка (metacognition)**: уверенность ДО ответа → Brier score / надёжность (RS-01 §2.4 уже
   заложил). Экспертное понимание = не только высокая точность, но и точная САМООЦЕНКА (борьба с
   illusion of competence, Karpicke). Показать учащемуся его калибровку — само по себе учит.

Анти-Goodhart (согласовано с brief guardrails): узнавание/MCQ-accuracy и стрик НЕ считать за понимание;
приоритет — генеративная accuracy + отложенный (≥14д) transfer + калибровка.

---

## 7. C#-специфичный каталог мисконцепций → refutation-карты (для среза A «ядро C#»)

Прямое сырьё для фазы 0–1 шаблона на темах T1/T2 из brief. Формат: миф → верная модель (notional
machine) → тип карты. **Флаг G3**: «верная модель» ниже — педагогический скелет; каждая формулировка
ОБЯЗАНА быть сверена с первоисточником (MS Learn / C# language spec / CLRS) в контент-пайплайне RS-10
(риск №1 = точность). Ниже — что ЯВНО опровергать, не финальный текст карт.

| Концепт (T1/T2) | Распространённый миф | Верная модель (сверить в RS-10/G3) | Карта |
|---|---|---|---|
| value vs reference | «объект/переменная = коробка со значением; присваивание копирует объект» | reference-тип: переменная хранит ССЫЛКУ; `b = a` копирует ссылку, не объект; value-тип (`struct`) копирует значение | predict + refutation + viz стек/куча |
| boxing | «boxing бесплатен / это просто каст» | value-тип оборачивается в объект на КУЧЕ, копия; распаковка — новая копия; аллокация + GC-давление | predict-the-output + find-bug (в цикле) |
| GC / финализаторы | «GC освобождает сразу, когда переменная выходит из области; `~Finalizer` = деструктор C++» | недетерминированный сбор; финализатор вызывается недетерминированно, отдельным потоком; `IDisposable`/`using` для детерминизма | refutation-текст + «почему так спроектировано» |
| async/await | «`async` создаёт поток / `await` блокирует поток / async = параллелизм» | asynchrony ≠ thread: I/O-await освобождает поток (IOCP «There is no thread», Cleary); concurrency ≠ parallelism | refutation + async-таймлайн viz (P1) |
| `string` immutability | «изменение строки меняет её на месте» | строки неизменяемы; конкатенация создаёт новые объекты; `StringBuilder` для множественных изменений | predict + edge (аллокации в цикле) |
| `struct` copy / mutable struct | «struct ведёт себя как класс» | копирование по значению при передаче/присваивании; mutable struct — классический gotcha | find-the-bug (edge) |
| Big-O интуиция | «O(1) всегда быстрее O(n); константы не важны на практике» | асимптотика ≠ реальное время на малых n; hash O(1) амортизированный, resize — O(n) всплеск; cache-локальность массива vs список | сравнение «какой где» + viz resize |
| closure над переменной цикла | «замыкание захватывает значение переменной» | захватывается ПЕРЕМЕННАЯ (её слот), не снимок значения — классический gotcha | find-the-bug + predict |
| generics | «generic = Object + касты под капотом (как в старой Java-erasure модели)» | reified generics в .NET: специализация по типу, без боксинга value-типов; спека — сверить | сравнение + «почему так» |

Практик-первоисточник для async-мифа: Stephen Cleary, «There Is No Thread» (blog.stephencleary.com,
2013) — эталон refutation-текста от практика с историей (ключевой тезис: во время I/O-await «нет
потока, который ждёт»; ожидание — на уровне драйвера/IOCP). Уверенность: высокая как практик-первичка;
техническую формулировку карты всё равно сверить с MS Learn (G3).

---

## 8. Варианты и трейдофы (дизайн-решения)

| Решение | Вариант A | Вариант B | Рекомендация |
|---|---|---|---|
| Стартовая поддержка на новой теме | worked-example first (мало генерации) | productive-failure first (генерация → объяснение) | **Гибрид**: короткая predict/refutation-ловушка (PS-I доза) → worked-example. Взрослый с prior knowledge (§3.5) + «time for telling» (§3.5). Проверить sim-harness. |
| Fading | пары «пример–задача» | faded (backward) + prompt-на-принцип | **Faded + prompt** (§3.2): единственный дал far-transfer. |
| Subgoal-метки | всегда given | всегда self-generated | **Fade**: given → self-generated по мере роста S (§3.11). |
| Refutation | на каждом атоме | только на ликвидных мифах | **Только ликвидные** (§3.8 граница), иначе шум для чистых новичков. |
| Адаптация под экспертизу | статичная колода | expertise-reversal-aware (S как прокси) | **Адаптивная** (§3.1, §5): но это гипотеза-дизайн → спайк/sim-harness до заявления «лучше». |
| Мерило понимания | MCQ-accuracy + стрик | генеративная accuracy + transfer + калибровка | **Второе** (§6); первое — анти-guardrail. |

Кандидатов-ИНСТРУМЕНТОВ (библиотек) эта линза не вводит → правило спайка п.5 не активируется здесь
(движок = FSRS, спайкнут в RS-01; визуализация-стек — линза RS-08). Единственная эмпирическая проверка,
которую ТРЕБУЕТ RS-09 — **sim-harness / A-B на реальных учащихся** для (а) дозы PS-I-ловушки и
(б) expertise-reversal-aware планирования: это ЭМПИРИЧЕСКИЕ гейты, не константы (согласовано с G6).

---

## 9. Реестр покрытия (единица × статус)

| Единица линзы | Покрыто | Первоисточник |
|---|---|---|
| worked-example effect | да (надстройка над RS-01) | Kalyuga 2007; Sweller/CLT |
| faded worked examples / scaffolding | да | Renkl&Atkinson 2003; Atkinson&Renkl&Merrill 2003 |
| self-explanation effect | да | Chi 1989; Chi et al. 1994 |
| contrasting cases | да | Schwartz&Bransford 1998 |
| productive failure / PS-I | да | Kapur 2008/2016; Sinha&Kapur 2021 (мета) |
| preparation for future learning | да | Schwartz&Martin 2004 |
| expertise-reversal | да | Kalyuga et al. 2003; Kalyuga 2007 |
| notional machine | да | du Boulay 1986; Sorva 2012/2013 |
| novice misconceptions (каталог) | да (формулировки — средняя) | Qian&Lehman 2017; Sorva 2012 |
| refutation texts / conceptual change | да | Tippett 2010; EdPsych мета 2025; KReC |
| elaborative interrogation | да | Dunlosky et al. 2013 |
| deliberate practice | да | Ericsson et al. 1993 |
| predict-then-run / engagement | да | Naps et al. 2002; Myller et al. 2009; RPTEL |
| subgoal labeling (CS) | да (числа — частично) | Morrison/Margulieux/Catrambone; STEM Ed J 2020 |
| assistance dilemma | да | Koedinger&Aleven 2007 |
| прогрессивное раскрытие / rationale / edge cases | да (синтез §4–5) | производная от expertise-reversal + CLT |
| шаблон урока + карты + FSRS | да | синтез §5 |
| измерение понимания (generation/transfer/calibration) | да | §6; Schwartz&Martin; Tew&Guzdial; RS-01 |
| C#-каталог для refutation-карт | да (скелет; тексты → G3) | §7 + флаг RS-10 |

Насыщение: все явно запрошенные единицы линзы закрыты ≥1 A-источником. Открытые хвосты — в §11.
Мисконцепции C# и subgoal-числа — единственные со средней уверенностью, оба вынесены на сверку в
контент-пайплайн (RS-10) под гейт точности G3.

---

## 10. Противоречия источников

1. **Worked-example «дай пример» vs productive failure «пусть помучается»**: не противоречие —
   разные точки оси assistance (§3.6) под разный prior knowledge/экспертизу. Разрешено гибридом (§4, §8).
2. **Elaborative interrogation «полезно» (Dunlosky) vs «вредит» при неверных элаборациях/низком prior
   knowledge**: оба верны — модератор prior knowledge (§3.4). Разрешено: «почему»-карты с немедленной
   сверкой с source и на теме, где база уже есть.
3. **Refutation «всегда лучше» vs «не помогает без мисконцепции»**: разрешено границей (§3.8) —
   применять только на ликвидных мифах.
4. **Deliberate practice «10 000 часов»**: популяризация Гладуэлла ≠ статья Ericsson 1993 (магического
   числа нет). В отчёт взята первичка, миф помечен.
5. Манипуляций/инъекций в источниках не обнаружено. Class-D блоги (структура «10 tips…») в источники
   не брались; веб-сводки WebSearch использованы только как наводка к A-первичке, факты приписаны
   первоисточникам с DOI/годом.

---

## 11. Что не удалось выяснить (открытые вопросы)

1. Точные эффект-сайзы subgoal-labeling в CS1 (Springer-пейволл) — величина не прослежена первичкой;
   для ТЗ — «эффект есть», не число.
2. Дословный каталог Qian&Lehman 2017 (ACM 403) — взят по сводке; полная сверка формулировок C#-
   мисконцепций — задача RS-10/G3 (риск №1).
3. Оптимальная ДОЗА PS-I-ловушки (сколько «провала» до объяснения) для взрослого джуна и
   концептуального материала — нет прямого числа; эмпирический гейт (sim-harness / A-B).
4. Работоспособность «expertise-reversal-aware планирования по FSRS-stability» — гипотеза-дизайн,
   не проверена; нужен спайк/симуляция до заявления «лучше статичной колоды».
5. Надёжный авто-грейдинг «объясни своими словами» (самый глубинообразующий формат) — общий с RS-01 §5
   открытый вопрос (LLM-судья vs self-grade); без него риск скатывания к recognition.
6. Валидность самодельного «concept-inventory» app как язык-независимого transfer-мерила (в отличие от
   валидированного SCS1) — потребует пилота.

---

## 12. Рекомендация (почему лучше альтернатив, с опорой на §)

Строить контент НЕ как «карточки-факты», а как **урок-атом по шаблону §5** (хук/refutation →
notional-machine-viz → worked-example+subgoal → predict-the-machine → faded practice+prompt-на-принцип
→ edge cases → reconstruct+rationale+первоисточник), где типы карт brief (predict/find-bug/write-missing/
сравнение/cloze/объясни) — это НЕ разные форматы ради разнообразия, а ФАЗЫ роста экспертизы, и уровень
поддержки СНИЖАЕТСЯ по мере роста FSRS-stability (expertise-reversal-aware).

Почему это лучше «просто хороших объяснений + SRS» (наивная альтернатива, к которой тяготеет жанр):
- Наивный подход даёт worked-example на всём пути → **expertise reversal**: у растущего джуна он
  упирается в потолок и это и есть упрощенчество (§3.1). Наш fading (§3.2) — единственный путь к
  far-transfer.
- Наивный подход молча даёт «правильное объяснение» → мисконцепции (value/ref, async≠thread, GC)
  выживают. **Refutation** (§3.8) их ЛОМАЕТ явно; **notional machine** (§3.7) даёт механику, а не
  метафору.
- Наивный подход мерит узнавание/стрик. Мы мерим **генерацию + transfer + калибровку** (§6) —
  экспертизу, а не иллюзию (Karpicke/Schwartz&Martin).
- Всё держится на рецензируемой первичке (Kapur/Renkl/Chi/Kalyuga/Sorva/Ericsson/Dunlosky), а не на
  маркетинге edtech. Единственные «средней» уверенности узлы (C#-мисконцепции формулировки, subgoal-
  числа) явно вынесены под гейт точности G3 — то есть анти-slop-дисциплина сохранена.

Это прямой ответ на North Star «до ЭКСПЕРТНОГО уровня, как будто я сам написал, НЕ упрощая»:
экспертность = снятие лесов + краевые случаи + rationale + перенос, а не больше текста.

---

## Источники (URL + accessed 2026-07-08)

Worked examples / fading / self-explanation:
- Renkl & Atkinson 2003, *Educational Psychologist* 38(1):15–22: https://link.springer.com/article/10.1023/B:TRUC.0000021815.74806.f6 (связанный «How Fading Worked Solution Steps Works», Instructional Science)
- Atkinson, Renkl & Merrill 2003 (self-explanation prompts + fading): https://asu.elsevierpure.com/en/publications/transitioning-from-studying-examples-to-solving-problems-effects-/ ; https://www.semanticscholar.org/paper/5057f7decd1e13fc2ab90cf65ca6cc1f79026a6a
- Chi et al. 1989, *Cognitive Science* 13(2):145–182: https://onlinelibrary.wiley.com/doi/abs/10.1207/s15516709cog1302_1
- Chi, de Leeuw, Chiu & Lavancher 1994, *Cognitive Science* 18(3):439–477: https://onlinelibrary.wiley.com/doi/10.1207/s15516709cog1803_3

Productive failure / PFL / contrasting cases / expertise-reversal / assistance dilemma:
- Kapur, «Designing for Productive Failure» / «Productive Failure»: https://www.manukapur.com/productive-failure/ ; https://docdrop.org/static/drop-pdf/Kapur---Designing-for-Productive-Failure-oaAJc.pdf
- Sinha & Kapur 2021, *Review of Educational Research* 91(5):761–798: https://journals.sagepub.com/doi/full/10.3102/00346543211019105 ; https://janfasen.nl/wp-content/uploads/2023/05/Sinha-and-Kapur-PS-I.pdf
- «When failure fails to be productive», *Instructional Science* 2021: https://link.springer.com/article/10.1007/s11251-020-09525-2
- Schwartz & Bransford 1998, «A Time for Telling», *Cognition and Instruction* 16(4):475–522: http://aaalab.stanford.edu/assets/papers/earlier/A_time_for_telling.pdf
- Schwartz & Martin 2004, «Inventing to Prepare for Future Learning», *Cognition and Instruction* 22(2):129–184: https://aaalab.stanford.edu/assets/papers/2004/Inventing_to_prepare_for_future_learning.pdf
- Kalyuga, Ayres, Chandler & Sweller 2003 / Kalyuga 2007 обзор, *Educational Psychology Review* 19:509–539: https://link.springer.com/article/10.1007/s10648-007-9054-3 ; https://www.uky.edu/~gmswan3/EDC608/Kalyuga2007_Article_ExpertiseReversalEffectAndItsI.pdf
- Koedinger & Aleven 2007, *Educational Psychology Review* 19(3):239–264: https://link.springer.com/article/10.1007/s10648-007-9049-0 ; https://eric.ed.gov/?id=EJ785065

Notional machine / мисконцепции / CS-education:
- du Boulay 1986 (через Sorva 2013, обзор термина)
- Sorva 2012 диссертация (Aalto, ISBN 978-952-60-4626-6): http://lib.tkk.fi/Diss/2012/isbn9789526046266/ ; https://aaltodoc.aalto.fi/items/d982d1ce-af44-465d-83b4-56a558fe9f26
- Sorva 2013, «Notional Machines…», *ACM TOCE* 13(2), DOI 10.1145/2483710.2483713: https://dl.acm.org/doi/10.1145/2483710.2483713
- Qian & Lehman 2017, *ACM TOCE* 18(1):1–24: https://dl.acm.org/doi/pdf/10.1145/3077618 ; Qian & Lehman 2019 targeted feedback: https://journals.sagepub.com/doi/full/10.1177/2158244019885136
- Naps et al. 2002 engagement taxonomy / Myller et al. 2009 EET: https://dl.acm.org/doi/10.1145/1513593.1513600
- Predict-then-run active learning (RPTEL): https://pmc.ncbi.nlm.nih.gov/articles/PMC6302837/
- Subgoal labeling: https://www.cs1subgoals.org/publications/ ; STEM Ed J 2020: https://link.springer.com/article/10.1186/s40594-020-00222-7 ; design: https://files.eric.ed.gov/fulltext/EJ1233924.pdf
- FCS1/SCS1 concept inventory (Tew & Guzdial): https://dl.acm.org/doi/abs/10.1145/1734263.1734297 ; ревизия/IRT: https://dl.acm.org/doi/10.1145/3446871.3469744

Refutation / conceptual change / elaborative interrogation / deliberate practice:
- Tippett 2010, *IJSME*, DOI 10.1007/s10763-010-9203-x: https://link.springer.com/article/10.1007/s10763-010-9203-x ; https://eric.ed.gov/?id=EJ905216
- Мета-анализ refutation, *Educational Psychologist* 60(1) 2025: https://www.tandfonline.com/doi/full/10.1080/00461520.2024.2365628
- Dunlosky et al. 2013, *PSPI* 14(1):4–58: https://journals.sagepub.com/doi/abs/10.1177/1529100612453266
- Ericsson, Krampe & Tesch-Römer 1993, *Psychological Review* 100(3):363–406: https://pmc.ncbi.nlm.nih.gov/articles/PMC6731745/ ; https://www.researchgate.net/publication/224827585

Практик-первичка (async-миф):
- Stephen Cleary, «There Is No Thread» (2013): https://blog.stephencleary.com/2013/11/there-is-no-thread.html ; «Async and Await» (2012): https://blog.stephencleary.com/2012/02/async-and-await.html

Class-D (НЕ источник, факты не брались; только наводка): edtech-блоги-своды, structural-learning,
mrbartonmaths (агрегаторы PDF первички — сами PDF первичны, обёртка — нет).
