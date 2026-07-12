# ВЕРДИКТ — ФИНАЛЬНЫЙ VERIFY · Фронт / петля / виз / a11y / перф + регрессия докрутки

Дата: 2026-07-12 · Evaluator (внешний, свежий контекст) · порты :5080 (backend live) + :4173 (fresh preview)
Раунд ≥2 — сверено с предыдущим вердиктом R-VERIFY-front-loop-viz-a11y-perf.md (2026-07-11, ПРИНЯТО).

## ВЕРДИКТ: ПРИНЯТО

Все гейты моего чеклиста — PASS на живом стеке, измерено настоящими инструментами
(vite build + gzip -9, Playwright/Chromium харнесы, @axe-core/playwright, Lighthouse 13.4.0,
grep dist/исходников, независимый пересчёт сегментов). Плюс 6 регрессий докрутки (a–f)
подтверждены ЖИВЫМ прогоном И чтением исходного кода. Ни одного зелёного не выдумано.

**Паспорт вкуса: PASS** — доказательство: docs/evidence/p2-final/390-first-run.png (home),
390-done.png, 390-progress.png, 390-profile.png (свежие, сняты после моего build 10:16–10:21),
+ docs/evidence/viz-fit/hashtable-s5-resize.png (виз-кадр). Токены точно совпадают с
`design-locked-cream-coral-rubik`: крем `--bg #f6f1e9`, коралл `--coral #f0533a`, Rubik display.
Золото — только третичный amber «sparingly» (не primary — «цыганский» отвод соблюдён).
Signature soft-3D коралловый CTA присутствует и заметен на home. Анти-слоп чист:
нет Inter/тёмного-кино/детсад-зелёного/золотого-ковра. Экраны держат соседство с референсом.

## Таблица гейтов

| Гейт | Порог | Измерено | Метод | Вердикт |
|---|---|---|---|---|
| build + JS gz | tsc чисто; <200КБ | tsc 0 ош.; vite OK; **JS 217.9КБ raw / 58.47КБ gz** (build) = **56.94КБ** независимо (`gzip -9`); CSS 9.06КБ gz | `npm run build` + `gzip -9 -c \| wc -c` | PASS |
| viz-fit 6/6 | ALL GREEN + «6/6 fully on at» | ALL GREEN; «autolayout: 6/6 lessons fully on `at` [все 6]»; 12 гео-инвариантов 0 нарушений × 6 уроков | `node verify/viz-fit.mjs` (exit=0) | PASS |
| петля F1–F6 | ALL GREEN, 0 консоль | ALL GREEN; Good→interval 0.0069d, Again→re-queue 60s, due 6→5, server stats reviewsTotal=1 xp=10, 0 ошибок | `node verify/run.mjs` (exit=0) | PASS |
| progress/profile | реальные данные | ALL GREEN; completed только при 100% сегментов (7/7), calibration ring 100%, home/api согласованы | `node verify/shell.mjs` (exit=0) | PASS |
| axe a11y | 0 serious/critical, +DOCUMENT | Home 0, **Document (html-lang/title/landmarks) 0/19**, Progress 0, Lesson 0, session/done/empty 0 | `node verify/shell.mjs`+`loop.mjs`, real AxeBuilder wcag2a/2aa/21a/21aa | PASS |
| петля состояний | ALL GREEN | ALL GREEN; session «6 карточек ~6 минут», done knownDue=0 xpToday=60, error+retry, skeleton не спиннер | `node verify/loop.mjs` (exit=0) | PASS |
| polish-flow | ALL GREEN | ALL GREEN; counter 1→6 из 6, done НАТУРАЛЬНО (no __forceHomeHero), nav-race, review-fail | `node verify/polish-flow.mjs` (exit=0) | PASS |
| новые уроки | ALL GREEN | ALL GREEN; closures 5, async-await 5, hashtable 6 сегм., gc/hashtable петля | `node verify/new-lessons.mjs` (exit=0) | PASS |
| перф (Lighthouse) | смоук | **performance 96**, FCP 0.8s, LCP 1.3s, TBT 0ms, CLS 0 | `lighthouse :4173 --preset=desktop` + Playwright FCP-проба (median 1032ms, 3 прогона) | PASS |

Пересчёт сегментов независимо из исходников: value-vs-ref=4, boxing=7, gc=6, closures=5,
async-await=5, hashtable=6 — совпадает с рантайм-ассертами (числа не приукрашены).

## Регрессия докрутки (живой прогон + чтение кода)

- (a) Непрерывная сессия — PASS. polish-flow: counter «1 из 6»…«6 из 6», grade→следующая
  («Следующая карточка»→«Завершить сессию»), 6 distinct cards, «День закрыт» достигнут
  ПУСТОЙ ОЧЕРЕДЬЮ и НАТУРАЛЬНО. Код: home.ts:78 `if (knownDue>0) return "session"; if (todayCount>0) return "done"` — done = чистая функция от `/api/due`, хук невозможен. sessionQueue.position/total.
- (b) Reduced-motion — PASS. shell.mjs: класс на `<html>`, persist localStorage=1, aria-checked.
  Код: settings.ts app-wide класс `.reduced-motion`; stepPlayer.ts:27 FLIP пропущен при reducedMotion;
  lesson.css + home.css `.reduced-motion` правила; polish-flow (C): сегменты на FINAL frame при OS-media OFF.
- (c) Nav generation-guard — PASS. polish-flow (D): Profile остался поверх медленного Progress.
  Код: home/profile/progress.ts дважды `if (!router.isCurrent(navToken)) return` (до и после fetch).
- (d) Review-fail дружелюбный — PASS. polish-flow (E): friendly line, #gradeDone скрыт, галочка скрыта,
  0 сырого текста, кнопки активны для retry, retry восстанавливает.
- (e) Единый голос «ты» — PASS. Строгий word-boundary grep standalone «вы»-местоимений в strings.ts = 0
  (8 «хитов» — substrings выдуманных/Выключено/вывод/выставлена). Термины Стрик/Освоено/«Опыт» = 0.
- (f) Сырые хексы вне tokens.css — PASS. progress.css 0 hex / 60 var(); lesson.css 0 hex / 321 var();
  home.css 0; profile.css 0; tokens.css 32 (единственный источник).

Оффлайн-бандлинг: PASS — 6 уроков статически импортированы в LESSONS, 0 runtime-fetch контента,
ID уроков запечены в dist JS.

## ЧТО ПЛОХО (обязательно, даже при ПРИНЯТО)

1. **Lighthouse хрупок к среде.** Новый headless (`--headless=new`) даёт NO_FCP (perf 0) — прогон
   зелёный только на legacy `--headless`. Продукт паинтит (Playwright median FCP 1032ms, 3/3 boot ok),
   но CI-гейт на Lighthouse может ложно краснеть. Тяжесть: средняя (риск ложного бэйджа, не дефект UX).
2. **Verify-скрипты не самоподнимают preview.** Требуют внешний `vite preview :4173`; без него —
   ERR_CONNECTION_REFUSED и exit=1 без единого «✗» (крэш, не провал гейта). Хрупкость харнесса:
   легко принять инфра-сбой за регресс. Тяжесть: низкая (мой teardown, не продукт).
3. **API base `http://localhost:5080` запечён в preview-бандл.** Для прод-деплоя есть отдельный
   `build:deploy` c `VITE_API_BASE=`, но preview-артефакт cross-origin — если кто-то отгрузит `dist/`
   (не `dist-deploy/`), получит битый API. Тяжесть: низкая (процессная ловушка).
4. Bundle gz вырос 53.18КБ→56.94КБ vs прошлого раунда (+3.8КБ). Порог <200КБ не тронут (28%),
   но тренд роста стоит держать в поле зрения.

## Анти-зацикливание (раунд ≥2)

Прошлый вердикт (2026-07-11) — ПРИНЯТО, 6 гейтов PASS. Сегодня: все прежние гейты PASS повторно
на свежем стеке, планка НЕ снижена. Новое требование раунда — 6 регрессий докрутки (a–f) +
DOCUMENT-scope axe — все PASS. Регрессий против прошлого verified-состояния нет
(gz +3.8КБ — в пределах бюджета, не регресс порога). Планка держится.

## СОМНЕНИЯ

- Перцептивный «вкус» подтверждён визуально (мои свежие скриншоты 390px × 4 экрана + виз-кадр),
  но снято только на 390px из одного прогона; серию ≥5 кадров/500мс за событие я не гонял на этом
  раунде (промежуточные золотые кадры покрыты harness-ами до меня). Финальный перцептивный вердикт
  многовьюпортной анимации — на пользователе.
- Backend-тесты отработали до меня (не в моём скоупе); я проверял фронт против ЖИВОГО backend,
  доверяя, что серверная сторона верифицирована отдельным прогоном.

## Сырой вывод замеров

Сохранён: /private/tmp/.../scratchpad/{viz-fit,run,shell,loop,polish-flow,new-lessons}.txt,
lh2.json (Lighthouse), FCP-проба (verify/_eval-fcp-probe.mjs, удалён после прогона).
