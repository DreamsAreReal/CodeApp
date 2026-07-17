# R-FINAL-E1 — «ГЕЙТЫ»: машинные ворота ТЗ, финальный VERIFY волны «Python-трек»

Дата: 2026-07-17 · HEAD: 7330743 (рабочее дерево чистое по продукту, изменены только docs)
Оценщик: E1 (внешний, свежий контекст). Метод: каждый гейт перемерен заново своими
командами; заявлениям features.md не верил. Сырые выводы — `reviews/evidence/E1/`.
Скоуп E1: ТОЛЬКО машинные гейты (G1–G5, G-MT, G8, G9, базлайн-дельта). G7 (деплой/CI)
вне моего чеклиста — F15 в features.md имеет статус `todo`, деплой ещё не выполнен;
визуальные рубрики и детали — у параллельных прогонов E2/E3.

## ВЕРДИКТ: ПРИНЯТО (по чеклисту E1; чеклист выполнен на 100%)

Паспорт вкуса: N/A для E1 (визуальная рубрика — прогон E2; в моём чеклисте её нет.
Косвенно: viz-fit ALL GREEN 316 сцен, axe AA 0 serious/critical — токены/вёрстка
машинно не регрессировали).

## Сводная таблица гейтов

| Гейт | Порог (дословно из ТЗ) | Измерено | Метод (команда) | PASS/FAIL |
|---|---|---|---|---|
| G1 | due→review двигает расписание, 0 ошибок консоли; рестарт бэка не теряет | due 59→58 после POST /api/review (grade 3, interval 0.0069d, state Learning); после kill+restart бэка due=58, карта не вернулась; new-lessons ALL GREEN, 0 конс. ошибок | свой curl-цикл (auth devUserId=911111 → GET /api/due → POST /api/review → kill PID → dotnet run → GET /api/due); `node verify/new-lessons.mjs` | **PASS** |
| G2 | 100% expect = реальный stdout python3.12; census по каждой карточке | 53/53 exec-карточек волны из lessons/py-*.ts найдены в census-log.txt (×2 прогона каждая, stderr отдельной строкой; лишних/пропущенных 0); СВОЙ перегон ВСЕХ 53 карточек python3.12.13 ×2: FAILURES 0, недетерминизма 0, stdout==expect байт-в-байт | `.verify/e1-census-crosscheck.py` (парсинг TS-карточек + census + собственный ×2-прогон; вывод в evidence/E1/census-crosscheck-out.txt) | **PASS** |
| G2a | чеклист RS-03 100% карточек; MCQ-fallback ≤25% | grep по исходникам и expect всех 53: set-печати 0, таймингов 0, id() 0, traceback-текстов 0 (2 grep-хита «traceback» — комментарии «no traceback text»), адресов в expect 0; `is` только на None-страже и на одном объекте (identity гарантирована — глазами по 10 файлам); stderr пуст везде, кроме PY.M11_c1 (RuntimeWarning BY DESIGN, аннотирован, в expect не входит); MCQ-fallback = 0/53 = **0%** ≤ 25% | тот же скрипт + ручной просмотр `is`-карточек | **PASS** |
| G3 | каждый механизм-урок ≥4 разборов; флагманы names-objects/decorators/async ≥6; шпаргалки ≥2–3 | names 8, decorators 8, async 7 (≥6 ✓); collections 5, args 4, closures 6, generators 6, context 5, object-model 8, exceptions 5, type-hints 4 (все ≥4 ✓); шпаргалки strings-flow 3, stdlib-idioms 3 (≥2 ✓). Лесенка predict+modify: MODIFY-ступень найдена во всех 11 механизм-уроках (в closures — predict+modify в одной карточке c1: «починка» `lambda i=i` прямо в коде карточки, проверено глазами и прогоном) | `grep -cE 'id: "s[0-9]+", num:'` по 13 файлам; grep MODIFY-маркеров + ручная сверка PY.M4_c1 | **PASS** |
| G4 | viz-fit + new-lessons headless + axe: ALL GREEN; AA; 0 конс. ошибок | viz-fit ALL GREEN (316 сцен, 633 mid-samples, 0 нарушений, 0 конс. ошибок); new-lessons ALL GREEN (13 PY-уроков, автоплей, reduced-motion, 0 конс. ошибок); shell: axe Home/Document/Progress/Lesson 0 serious/critical | `node verify/viz-fit.mjs` · `node verify/new-lessons.mjs` · `node verify/shell.mjs` | **PASS** |
| G5 | все 5 харнессов + dotnet test: ALL GREEN, 65+ PASS | `npm run verify` ALL GREEN · new-lessons ALL GREEN · shell ALL GREEN · loop ALL GREEN · multicard-session ALL GREEN · viz-fit ALL GREEN · dotnet test **65/65 PASS** (Failed 0) | прогоны всех харнессов на свежем билде + `dotnet test backend/Codex.Backend.Tests` | **PASS** |
| G-MT | home: 2 трека раздельно; grep хардкодов «Ядро C#» = 0 | `grep -rn "Ядро C#" app/src` вне lessons/ = 0 (внутри — только кикеры 5 C#-уроков, допустимо по приёмке F1); headless: чипы «Фундамент C#»/«Python для AQA», лента одного трека (cs=6/py=0 → py=13/cs=0), персист через reload | grep + `.verify/eval-m2-f1b-switcher.mjs` (прогон E1) | **PASS** |
| G8 | python-урок открывается и играет без сети (уроки в бандле, шрифты self-hosted) | сценарий «в поездке» (сеть умирает ПОСЛЕ старта, блок ВСЕХ запросов включая статику/шрифты/api): PY.M6.generators открылся, 6 сегментов, s1 index 0→1 сам (автоплей), forcePlayAll — все сегменты дошли до финального кадра, 0 ошибок консоли, 24 запроса заблокировано | `.verify/e1-offline-tunnel.mjs` (вывод в evidence/E1/g8-offline-tunnel-out.txt) | **PASS** (с оговоркой ниже) |
| G9 | лесенка у 100% механизм-уроков; estMinutes проставлен; флагман ≤12 мин | estMinutes у всех 13 (5–10 мин); флагманы: names-objects 10, decorators 9, async 10 — все ≤12; лесенка 11/11 (см. G3) | grep estMinutes по 13 файлам | **PASS** |
| G7 | CI зелёный + прод-смоук | **НЕ МЕРЯЛ** — вне чеклиста E1; F15 = `todo`, деплой не выполнен | — | **N/A (E1)** |

## Дельта-таблица (improvement против RS-baseline)

| Метрика | Базлайн (RS-baseline, HEAD 5772ad5) | Стало (HEAD 7330743) | Δ | Гейт |
|---|---|---|---|---|
| dotnet test | 65/65 PASS | 65/65 PASS | 0 (порог шума 0) | не просело ✓ |
| npm build JS gzip | 59.84 КБ | 141.78 КБ | +81.94 КБ (13 data-уроков + малый мультитрек-UI) | < 200 КБ ✓ |
| Уроки | 6 (C#), Python 0 | 19 (6 C# + 13 PY) | +13 | = N волны (11 механизм + 2 шпаргалки) ✓ |
| Карточки волны | 0 | 53 (все exec, из /api/due свежего пользователя: 59 total = 6 C# + 53 PY) | +53 | петля двигается ✓ |
| Харнессы | зелёные | зелёные (все 6 + viz-fit 316 сцен) | 0 регрессий | ✓ |

## ЧТО ПЛОХО (обязательная секция — и при ПРИНЯТО)

1. **G8 «оффлайн» верен только для тёплого старта.** Холодный старт без сети =
   экран «Нет связи с сервером» с retry: без первого /api/auth уроки недостижимы,
   хотя лежат в бандле. Заявленный кейс «в поездке» выдержан лишь если приложение
   открыто до потери сети. Формулировка гейта (образец loop.mjs no-network) это
   допускает, поэтому PASS, но «оффлайн-первый» продукт это НЕ делает — честно
   зафиксировать в докладе пользователю (evidence/E1/g8-offline-tunnel-out.txt;
   холодный прогон — 3 FAIL, лог в транскрипте E1).
2. **POST /api/review с нечисловым grade отвечает 500, а не 400.** Невалидное тело
   (`"grade":"Good"`) роняет запрос в ExceptionHandler (stack в backend.log) вместо
   аккуратного 400 Bad Request. Клиенту всё равно, но это заусенец API-контракта
   и шум в логах прода (Models.cs:45 ReviewRequest.Grade int).
3. **G7/F15 не закрыт на момент финального VERIFY**: деплой — единственная
   незакрытая P0-строка ТЗ («затем задеплой»); волна не «в проде», DONE волны до
   зелёного CI-прогона и прод-смоука выдавать нельзя.
4. **dotnet test так и остался 65/65** — на волну не добавлено ни одного
   бэкенд-теста (сид 13 новых уроков, track-группировка — без серверных тестов).
   Базлайн не просел, гейт формально «65+», но покрытие нового seed-пути нулевое.
5. Мелочь: старый зонд оценщика M2 (.verify/eval-m2-f1b-switcher.mjs) падает на
   финальном необязательном шаге (SecurityError localStorage после навигации) —
   все обязательные ассерты зелёные до падения; зонд, не продукт.

## Проверка доказательств строителя

- census-log.txt (2026-07-16): покрытие подтверждено независимым парсером —
  53/53, ×2, stderr отдельно; мой собственный перегон всех 53 карточек ×2 дал
  0 расхождений → лог честный.
- features.md «53 карты, MCQ 0%» — пересчитано: верно (53 exec, 0 MCQ).
- features.md «сегменты: M1 8, M5 8, M11 7…» — пересчитано grep-ом: верно.
- «бандл 141.53 KB gz» (F13) — фактически 141.78 KB на HEAD (после 0105f39/7330743);
  расхождение 0.25 KB объяснимо более поздними коммитами, гейту не угрожает.

## СОМНЕНИЯ

- Семантику «лесенки» я мерил маркерами MODIFY + одной ручной сверкой (PY.M4_c1);
  полноту методической лесенки (predict→modify→explain по качеству, не по счёту)
  оценивает E2 глазами.
- «0 упоминаний вместо анимации» (G3-хвост) — визуальный критерий, вне E1;
  счётные пороги G3 закрыты, визуальную плотность подтверждает E2.
- Preview :4173 обслуживал свежий dist (пересобран мной перед прогонами), но тот же
  процесс vite preview поднят давно — риска для результатов нет (статика читается
  с диска), отмечаю для воспроизводимости.

## Файлы

- Отчёт: docs/tasks/python-track/reviews/R-final-E1-gates.md (этот файл)
- Сырьё: docs/tasks/python-track/reviews/evidence/E1/ (census-crosscheck-out.txt,
  g8-offline-tunnel-out.txt, build-size.txt, due1/due2/due3.json, review1.json)
- Скрипты оценщика: .verify/e1-census-crosscheck.py, .verify/e1-offline-tunnel.mjs,
  .verify/e1-offline-probe.mjs (холодный старт, FAIL-лог в транскрипте)
