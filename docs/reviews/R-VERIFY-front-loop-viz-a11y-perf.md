# ВЕРДИКТ — VERIFY фаза 5 · Фронт / петля / виз / a11y / перф (живой стек)

Дата: 2026-07-11 · Evaluator (внешний, свежий контекст) · порты :5080 (backend live) + :4173 (fresh preview)

## ВЕРДИКТ — ПРИНЯТО

Все 6 гейтов моего чеклиста — PASS на живом стеке, измерено настоящими инструментами
(vite build + gzip -9, Playwright/Chromium харнесы, @axe-core/playwright, grep dist,
независимый пересчёт по исходникам). Ни одного зелёного не выдумано — только вывод команд.

**Паспорт вкуса: PASS** — доказательство: docs/reviews/evidence/M-verify/mobile-390-01-home.png
+ lesson/progress/profile. Токены совпадают с `design-locked-cream-coral-rubik` и референсом
concepts/mid (evidence/mid/375-home.png): крем #F6F1E9, коралл #F0533A, Rubik 700/800, спарк-знак
заметен, мягкие тёплые тени, радиусы 14/18/22. Анти-слоп соблюдён (нет золота/тёмного-кино/
детсад-зелёного/Inter). Signature (эксперт-плотность: «четыре разбора с анимацией», focus-pull
разбор inline) виден на экране урока.

## Таблица гейтов

| Гейт | Порог | Измерено | Метод | Вердикт |
|---|---|---|---|---|
| build + размер JS gz | чисто; <200КБ TMA | tsc 0 ошибок, vite OK; **JS 53.18КБ gz** (27% бюджета), CSS 7.54КБ | `npm run build` + `gzip -9 -c \| wc -c` (независимо) | PASS |
| viz-fit 6/6 | ALL GREEN + «6/6 fully on at» | ALL GREEN; строка «autolayout: 6/6 lessons fully on at [все 6]»; независимо: 261 нод, 0 ручных x/y | `node verify/viz-fit.mjs` + собств. обход LESSONS | PASS |
| loop (F1–F6) | ALL GREEN, 0 консоль | ALL GREEN F1–F6; Good→interval сдвиг, Again→re-queue 60s, due 7→6, 0 ошибок | `node verify/run.mjs` | PASS |
| progress/profile | реальные данные | ALL GREEN; completed только при 100% сегментов, calibration 100%, home/api согласованы | `node verify/shell.mjs` | PASS |
| a11y | 0 serious/critical Home/Lesson/Progress | Home 0/0 (10 passes), Progress 0/0 (14), Lesson 0/0 (18) | `@axe-core/playwright` WCAG 2a/2aa/21a/21aa в shell.mjs | PASS |
| offline-bundle | контент в dist, не сеть | все 6 уроков FULLY BUNDLED (316 прозаич. строк, 0 missing в dist JS); /api не отдаёт сегменты | grep dist + независимый per-lesson обход + аудит api-эндпойнтов | PASS |

Дополнительно: new-lessons.mjs ALL GREEN (exit 0, не падает); независимый console-смоук по
4 экранам = 0 errors / 0 failed / 0 warnings (прежний «1 консольный 404» устранён).

## Пересчёт количественных под-заявок (урок test2)
Сегменты на урок пересчитаны по исходникам: value-vs-ref=4, boxing=7, gc=6, closures=5,
async=5, hashtable=6 — ВСЕ совпали с заявленными. Registry = 6 уроков. Ручных координат = 0
из 261 нода (bug-proof авторинг реален, не только принт).

## ЧТО ПЛОХО (обязательно ≥3)
1. **viz-fit AUTHORING-PROOF гейтит только `fullyOnAt >= 1`**, хотя печатает 6/6. Строка честна
   (вычислена), но харнес формально пройдёт даже при откате 5 уроков на ручные x/y. Стоит
   поднять порог assert до 6/6, раз миграция завершена. P2 (сейчас факт = 6/6, подтверждён мной).
2. **axe `.include("#app")`** — сканируется только контейнер приложения, а не `<html>`/`<body>`.
   Document-level правила (html-lang, document-title, landmark на уровне body) вне охвата. Для
   TMA в WebView это малорисково, но честнее сканировать документ целиком. P2.
3. **Мои статичные кадры анимации урока (frame0–3) идентичны** — окно съёмки попало на осевший
   финал короткого первого сегмента. Не дефект (run.mjs/new-lessons строго доказали autoplay:
   «segment s1 advanced index=1» + «all segments reach final frame»), но моя визуальная серия
   «≥5 кадров/500мс» здесь не показала разброс фидбека — перцептивную живость анимации я
   подтверждаю через харнес-телеметрию, а не через свои кадры.
4. (доп.) Progress-скриншот моего свежего юзера = empty-state; наполненный Progress (кольцо/
   heatmap 28/upcoming 7/calibration ring) доказан shell.mjs на seeded-юзере, а не моим кадром.

## СОМНЕНИЯ / границы прогона
- Я НЕ проверял: реальный вход из Telegram (initData/HMAC), backend unit-тесты (по условию —
  отработали до меня), деплой/CI, build:deploy same-origin вариант. Это вне моего гейта.
- strings.ts — незакоммичен (M), но mtime 17:38 (до моей сессии) = работа builder-а Wave 4;
  билд собран из этого состояния, продукт я не мутировал (мои записи только .verify/ + docs/reviews/).

## Сырьё
- Скриншоты: docs/reviews/evidence/M-verify/ (16 шт, 3 вьюпорта)
- Скрипты evaluator: /Users/admin/Desktop/test5/.verify/eval-shots.mjs
- viz-fit evidence: docs/evidence/viz-fit/ (13 element-shots, наполнены харнесом)

## Ступень вау (для этого измерения): 3 — на референсе
Продукт собирается чисто, петля FSRS живая и реально сдвигает расписание на сервере, контент
оффлайн-бандлится, a11y чист, дизайн точнее одобренного референса concepts/mid с реальными
данными. Ниже 4 (exceeds) держит: два P2-замечания по строгости гейтов (viz-fit 1/6, axe scope).


ВЕРДИКТ: ПРИНЯТО
