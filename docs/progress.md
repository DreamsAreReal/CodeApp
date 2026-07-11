# Прогресс — волна «продуктовая готовность» (без контента уроков)

North Star: TMA, куда сеньор C# заходит КАЖДЫЙ ДЕНЬ освежать фундамент. Продукт должен
ощущаться ЗАВЕРШЁННЫМ. Дизайн LOCKED (крем #F6F1E9 + коралл #F0533A + Rubik + спарк).
Здоровая геймификация: 0 streak-shaming, 0 dark patterns.

Спека: docs/design/product-readiness-spec.md.

## Baseline (до правок), зафиксирован
- `npm run build` — чисто. JS gz = 54.69КБ (бюджет <80КБ, ок).
- run.mjs / shell.mjs / new-lessons.mjs / viz-fit.mjs — ВСЕ ALL GREEN, 0 console-ошибок.
- backend :5080 + vite preview :4173 подняты (preview перезапущен на свежий dist).

## Ключевое архитектурное решение — данные КЛИЕНТСКИ
Все новые состояния выводятся из уже существующих ответов, НОВЫЙ бэкенд-филд НЕ нужен:
- home грузит `api.due()` + `api.stats()` + `api.lessons()` + `api.progress()` (уже сейчас).
- `/api/progress` отдаёт: `upcoming[]` (7 дней, [0]=сегодня [1]=завтра — превью «завтра: N карт»),
  `activity[]` (28 дней, последний = сегодня — «был ли активен сегодня»), `streakDays`,
  `reviewsTotal`, `segmentsViewed`, `lessonsCompleted/Total`, `perLesson[].completed/due`.
- Дерево состояний Home:
  - first-run: reviewsTotal===0 && segmentsViewed===0 && !seenOnboarding(localStorage) → онбординг-герой.
  - есть due (knownDue>0): «сессия на сегодня» CTA (число due + минуты).
  - due=0 & есть непройденные уроки: empty-A «нет карт · пройди новый урок» + CTA урока.
  - due=0 & все уроки completed: empty-B «всё повторено · вернись завтра» + превью upcoming[1].
  - session-complete («день закрыт»): due=0 && был активен сегодня (activity today>0 ИЛИ
    reviewsToday) → XP-за-сегодня + стрик + превью «завтра: N».
- Стрик без наказания: тёплый «начни новую серию» при streak===0 но есть история; вехи 3/7/30.

## Статус — M1 + M2 self-pass (всё зелёное)

### M1 — петля возврата (home.ts + strings.ts + onboarding.ts)
- `deriveHomeState()` — ЧИСТАЯ ф-я (экспорт, unit-мыслимая): first-run/session/done/empty-new/empty-all.
  Используется и в render-пути, и в харнессе → «какое состояние» доказуемо изолированно.
- session-hero: CTA «Начать сессию» + «N карточек · ~M минут» (число due + оценка минут).
- done-hero («День закрыт»): due=0 && activity today>0 → XP-за-сегодня + стрик + «завтра: N» + come-back.
- empty-new / empty-all: тёплые, с CTA; empty-all — sage (всё просмотрено, закрепляй).
- first-run: онбординг-герой + starter value-types + skip; флаг `codex.onboarded` (onboarding.ts, localStorage).
- streak-line: рост/веха(3/7/14/30/60/100)/тёплый рестарт при 0 (sage) — 0 shaming, без красного/вины.

### M2 — error/loading/хаптика/переходы (ui.ts + main.ts + nav.ts + lessonRunner.ts + webapp.ts)
- `app/ui.ts`: ЕДИНЫЙ `errorCard()` + `skeleton*()` — home/progress/profile/boot-auth используют одно и то же.
- Хаптика: верно→success / неверно→error; выбор оценки→impact(medium); смена таба→`tg.selection()`;
  завершение урока→success. Dev-fallback молчит (не фейкаем хаптику).
- Переходы: `.screen-enter` (fade+lift 0.26s) на всех экранах; reduced-motion (OS+persisted) → без анимации.

## Верификация (исполнено)
- `npm run build` — чисто, JS 56.75 КБ gz (бюджет <80).
- run.mjs / shell.mjs (axe 0 serious/critical) / new-lessons.mjs / viz-fit.mjs (6/6) / loop.mjs — ВСЕ ALL GREEN.
- loop.mjs (НОВЫЙ) покрывает 9 блоков новых состояний реальными данными бэка.
- Скриншоты: docs/evidence/product-readiness/*.png (390 + reduced-motion).

## Решения / грабли
- Данные КЛИЕНТСКИ: done/empty/first-run выведены из `/api/due`+`/api/progress` (upcoming[1]=завтра,
  activity[последний]=сегодня). Новый бэкенд-филд НЕ добавлял.
- empty-new/empty-all не форсируются на живом бэке за одну сессию (нужен день без активности при due=0),
  поэтому проверяются через `window.__forceHomeHero(state)` — РЕАЛЬНЫЙ render-путь с живым контекстом (не мок).
- `.screen-enter` (opacity 0→1) кратко валит axe color-contrast, если сканировать в середине fade →
  в харнессах `sleep(320)` перед axe (сканируем УСТОЯВШИЙСЯ кадр, не ослабление).
- vite preview кэширует dist — после правки .ts: kill+перезапуск preview на свежий build.
- loop.mjs фильтрует benign `net::ERR_FAILED` из console-gate ТОЛЬКО для намеренного offline-теста (route.abort).

---

## Фикс-волна «механика/корректность потока» (по адверсариальному ревью)

### Recon — карта потока сессии (до правок)
- **Сессия = 1 карта на урок.** `lessonRunner.buildMcq` берёт ЖЁСТКО `lesson.cards[0]` (строка ~522).
  После оценки `wireGrade.post` зовёт `appendNext` → кнопка ведёт `router.showHome()`. Следующей
  due-карты нет → очередь /api/due не пустеет → home крутит «N карточка».
- **Фронт-cards = ровно по 1 карте `c1` на каждый урок** (predict-output). Seed-карты:
  все уроки `c1`, КРОМЕ `T1.M3.boxing` = `c1`+`c2` (c2 — find-the-bug, есть в JSON, НЕ рендерится
  фронтом → due-карта `T1.M3.boxing/c2` недостижима). Это единственный рассинхрон.
- **prefersReducedMotion()** (engine/dom.ts) = OS-медиа ИЛИ `?reduced=1`. НЕ читает
  `codex.reducedMotion` (settings.ts). Тумблер профиля ставит класс на <html> (CSS-переходы гасит),
  но `VizPlayer(reducedMotion=REDUCED)` про него не знает → анимации урока играют.
- **router show\*** без nav-токена: конкурентные async-рендеры пишут в DOM «кто последний».
- **review-fail** (`wireGrade.post` catch): `msg.textContent = Ошибка сохранения: ${e.message}`
  + `done.classList.add("show")` → зелёная галочка #gradeDone показана РЯДОМ с сырой ошибкой.
- **q-check disabled** (lesson.css:921): opacity .5 / not-allowed остаётся видимой после ответа.

### Решение P0-A (где брать «следующую карту»)
Клиент держит очередь due как список `${lessonId}/${cardId}` (session store). runLesson принимает
целевой cardId; buildMcq рендерит ИМЕННО ту карту. После grade → следующий id из очереди →
router.showLesson(lessonId, cardId). Счётчик «N из M», M = длина очереди на старте сессии.
Home/done — только при пустой очереди (естественно, без __forceHomeHero для done).

### Решение P0-B (seed-alignment)
Согласую ВНИЗ: удаляю `c2` из `T1.M3.boxing.json` (фронт-карты `c2` нет; писать новый вопрос —
запрещено контентным ограничением). После этого каждый seed-card.id рендерим фронтом и наоборот.

### СДЕЛАНО (всё доказано прогоном; см. verify/polish-flow.mjs — ALL GREEN)

**P0-A — непрерывная сессия (queue-driven) + естественный «День закрыт».**
- НОВЫЙ `app/sessionQueue.ts`: клиентская очередь due `${lessonId}/${cardId}`, position/total («N из M»).
- `router.ts`: `startSession(itemIds)` строит очередь и открывает 1-ю карту; `advanceSession()`
  после grade → следующая due-карта, при пустой очереди → showHome (там done естественно).
  `showLesson(id, cardId?)`; showHome/Progress/Profile чистят очередь.
- `home.ts`: CTA «Начать сессию» гонит ВСЮ due-очередь; тап по теме — её due-карты сессией.
- `lessonRunner.ts`: рендерит ИМЕННО целевую карту (не всегда cards[0]); чип «N из M» в шапке;
  после grade — primary «Следующая карточка» (+вторичная «На главную») / на последней «Завершить».
- ДОКАЗ (polish-flow A): live-прогон 6 карт, счётчик 1/6…6/6, seen=6, финал state=done
  knownDue=0 `__homeForced=undefined`. Скрин: 390-done-natural.png, 390-session-topbar.png.

**P0-B — достижимость карт.** Удалён `c2` из boxing seed (согласовано ВНИЗ). Т.к. `SeedItem`
делает UPSERT (не удаляет), добавил `Db.ReconcileCatalog(keepIds)` + вызов в Program.cs после сида:
пруним items не из текущего сида + каскад review_state/progress_events. ДОКАЗ: /api/lessons boxing
cards=1; свежий /api/due=6 (по 1 на урок), boxing/c2 нет. id: убрал `T1.M3.boxing/c2`.

**P1-C — reduced-motion тумблер глушит уроки.** `engine/dom.ts prefersReducedMotion()` = OS ИЛИ
?reduced=1 ИЛИ localStorage `codex.reducedMotion`=="1" (ключ читаю прямо, БЕЗ импорта app/ — движок
остаётся standalone). `lessonRunner` перечитывает REDUCED на КАЖДОМ runLesson. ДОКАЗ (polish-flow C):
OS-reduce=false, тумблер-ON → все сегменты index===total-1 (финал-кадр). Скрин: 390-reduced-lesson.png.

**P1-D — guard поколения навигации.** `router.nav++` на каждом show*; render{Home,Progress,Profile}
принимают navToken (дефолт router.nav) и после await делают `if(!router.isCurrent(token)) return`.
ДОКАЗ (polish-flow D): Прогресс(fetch+1.5с)→быстро Профиль → остаётся Профиль, mastery не залился.

**P1-E — провал POST /api/review по-человечески.** gradeStrip: success-check вынесен в `#gradeOk`,
добавлен `#gradeFail` (дружелюбный, из strings: reviewFailTitle/Body). На ошибке: done скрыт, окмарк
hidden, msg пуст (НЕ пробрасываю e.message), fail показан, кнопки активны, notify(error). ДОКАЗ
(polish-flow E): failVisible, !doneShown, okHidden, без raw-текста, ретрай после восстановления → save.
Скрин: 390-review-fail-crop.png.

**P1-F — мёртвая disabled «Проверить ответ».** После answered добавляю класс `.answered`
(lesson.css → display:none) в buildTyped и buildOptions. Кнопка исчезает, вердикт+grade берут верх.

### Верификация (исполнено)
- `npm run build` — чисто, JS gz = 57.71 КБ (<80).
- run.mjs / shell.mjs / new-lessons.mjs / viz-fit.mjs / loop.mjs / **polish-flow.mjs (НОВЫЙ)** —
  ВСЕ ALL GREEN, 0 console-ошибок. Скрины: docs/evidence/polish-flow/.

### Решения / грабли (фикс-волна)
- `SeedItem` = UPSERT без удаления → одно удаление из JSON не убирает stale-карту из catalog/due;
  нужен ReconcileCatalog (пруним items не из сида + каскад). Это wiring сида, не бизнес-логика бэка.
- engine НЕ импортирует app/ (чистый слой) → reduced-motion-флаг читаю по ключу localStorage прямо
  в dom.ts, а не импортом settings.ts.
- polish-flow (B): не полагаюсь на `import("/src/...")` — preview отдаёт СБОРКУ, не исходники;
  проверяю через /api/lessons+/api/due и живой прогон сессии (seen===M).
- Нельзя было ослаблять loop.mjs: он использует `__forceHomeHero` ЛЕГИТИМНО для empty-*, которые
  за одну сессию на живом бэке не сделать. Живой путь к done доказан отдельно в polish-flow.
- Сервисы (backend :5080, preview :4173) во время работы падали — перезапускал (preview после
  build обязательно на свежий dist).

---

## Фикс-волна 2 «копирайт/голос + вовлечение + P2-полиш» (по адверсариальному ревью)

### P0 — единый голос «ты» по всему продукту
Свёл ВСЕ shell-строки к «ты» (короче, по-равному, не корпоративно). Правил strings.ts +
инлайн в home/lessonRunner (контент уроков lessons/*.ts НЕ трогал). Сведено ~14 строк:
progressSub, progressLoading, progressEmptyBody, completionCaption, howItWorksBody, resetHint,
resetConfirm1Body, resetError, gradeMix «Как вы отвечали»→«Как ты отвечаешь», predictTitle
«Сначала предскажите»→«…предскажи», gradeHead «Оцените…»→«Оцени…», gradeHeadObjective «можете»→
«можешь», reviewFailBody «нажмите»→«нажми», calibCaption «по вашим»→«по твоим», onboardSkip
«Осмотреться самому»→«Осмотреться». ДОКАЗ: strict-grep standalone «вы»/ваш-family = 0
(7 хитов `вы` — префиксы вЫвод/вЫдуманных/вЫставлена, не местоимение).

### P1 — терминология (один термин на понятие)
statStreak «Стрик»→«Серия»; home/lessonRunner тултипы «Стрик/Опыт (сервер)»→«Серия/XP (сервер)»,
«Опыт за урок»→«XP за урок». masteryLabel «Освоено»→«Закреплено» (совпало с statMastered).
statXp «Опыт»→«XP». emptyNewKicker «Нет карт»→«Нет карточек к повтору». perLessonDue dead-code
`plural(n,"к повтору"×3)` → `${n} ${plural(n,"карта","карты","карт")} к повтору`. Смягчены:
doneBody «Аккуратная работа»→«Сделано чисто…», calibRightUnsure «доверяй чуть больше»→«можешь
доверять себе спокойнее», onboardSkip. ДОКАЗ: grep Стрик/Освоено/«Опыт» = 0.

### P1 — вовлечение (копирайт + маленькая логика)
1. **done-hero вторичная CTA** «Взять свежий урок →» (id `#heroFresh`, sage-ghost, НЕ давит) —
   только когда есть непройденный урок (`freshLessonId` в HeroCtx = nextUnseen.id); ведёт в него
   через `open()`. ДОКАЗ: forced-done → heroFresh=true.
2. **Forward-hook серии** в done/empty: `doneComeBack(n)` = «Вернись завтра — серия станет N+1
   подряд» (без обратного отсчёта/угроз). В empty-героях — только при streak>0.
3. **XP-всплеск на grade**: `#gradeXp` «+10 XP» рядом с saved-строкой, bump-анимация (reused
   xpBump keyframes; reduced-motion гасит). REVIEW_XP=10 — РЕАЛЬНАЯ серверная модель
   (Program.cs `xp = reviewsTotal*10`), не выдумка. ДОКАЗ: burst text «+10 XP», hidden=false.

### P2 — визуал
- Сырые хексы → токены: progress.css heatmap `#f6b3a3`→`--heat-mid`; lesson.css IL-палитра
  (7 хексов → `--il-bg/border/badge-bg/cap/dim/op/op-cur/arg`) + все 12 `#fff`→`var(--surface)`.
  Новые токены в tokens.css. Визуал НЕ изменился (значения те же) — только дисциплина.
  ДОКАЗ: grep `#[0-9a-f]` в progress.css/lesson.css = 0.
- dangerLabel «Опасная зона»→«Управление данными» (мягче, тёплый голос).
- sessionMeta минуты от числа карт: `min = max(1, round(knownDue))` (~1 мин/карта), не фикс 7.
- topicActive pill скрыт в done/empty (`hasSession = knownDue>0` в topicRow). ДОКАЗ:
  natural-done knownDue=0 → .path pill count=0.
- session-hero: развёл единицы — ведущая метрика «N карточек · ~M минут» (`.hero-meta`, чуть
  жирнее/ink) отделена hairline-дивайдером от блока `.hero-prog` «ТЕМЫ КУРСА X/Y» (вторичный).
- empty-all: seal-медальон (SEAL_ICON) + sage-wash (`.hero-sealed`) — вес завершения, отличный
  от рутинного empty-new. ДОКАЗ: `.hero-sealed .done-seal` present.

### Верификация (исполнено)
- `npm run build` — чисто, JS gz = **57.92 КБ** (+0.21 от 57.71; бюджет <80, ок). CSS gz 8.88.
- run.mjs / shell.mjs (axe 0 serious/critical: Home/Progress/Lesson) / new-lessons.mjs /
  viz-fit.mjs / loop.mjs / polish-flow.mjs — ВСЕ ALL GREEN, 0 console-ошибок.
- НОВЫЙ verify/polish-copy-shots.mjs → docs/evidence/polish-copy/390-*.png (home-session, done,
  done-natural, empty-all, card-grade + clip, progress, profile) — для ревью.

### Решения / грабли (волна 2)
- REVIEW_XP=10 — константа, синхронна с бэком; НЕ роутил через `progress.addXp` (это визуальный
  lesson-счётчик от card.xp — двойной учёт), а отдельный бейдж review-XP.
- `__forceHomeHero` меняет ТОЛЬКО hero-slot, НЕ path → pill-фикс доказуем только на естественном
  done (drained session, knownDue==0). Fresh-CTA доказан forced-done (там freshLessonId set).
- estMin (fixed 7) стал мёртвым после перевода минут на knownDue — удалил поле из HeroCtx.
- ICON_SPARK в profile.ts держит `fill="#fff"` как SVG-атрибут (не CSS) — вне скоупа hex→token
  (задача про progress.css/lesson.css); CSS-var в presentation-атрибут SVG не подставится.
- preview кэширует dist → после правок .ts/.css: kill :4173 + перезапуск на свежий build.

