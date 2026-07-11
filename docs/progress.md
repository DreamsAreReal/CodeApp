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
</content>
</invoke>
