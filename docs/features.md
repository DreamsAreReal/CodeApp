# Фиче-лист — Milestone 1 (walking skeleton, app/)

Источник правды о прогрессе сборки фронта. Статусы: `todo` · `doing` · `self-pass` · `verified`.
`verified` ставит оркестратор по вердикту внешнего оценщика — не строитель.

Продукт: Telegram Mini App обучалки для сеньора-C#. Дизайн mid (крем+коралл+Rubik).
Бэкенд построен и проверен (12/12 тестов, live curl-петля due→review→due работает).

| F | Название | Золотой путь | Как проверить | Статус | Доказательство |
|---|---|---|---|---|---|
| F1 | Walking skeleton: Vite+TS + engine-модуль + home-shell (mid) + API-клиент + Telegram/dev-auth + live due | да (нулевой экран) | build проходит; headless: home грузится, dev-auth ок, `/api/due` отрисован реальными данными | self-pass | см. ниже |
| F2 | Engine hardening + урок boxing как ДАННЫЕ + generic LessonRunner (рендерит любой lesson-as-data, автозапуск анимаций) | да (signature) | headless: открыть boxing → 7 сегментов рендерятся, анимация играет (шаги растут), reduced-motion → финальный кадр | self-pass | см. ниже |
| F3 | Живой daily-loop: MCQ-карточка → оценка → POST /api/review → расписание двигается; возврат на home обновляет due | да | curl due до/после + headless: ответ на карточку + grade шлёт review, due-count падает, «след. повтор через N дн.» | self-pass | см. ниже |
| F4 | Второй урок value-vs-reference (стек/куча) как данные + backend seed добавлен → его карточки в петле | нет | headless: второй урок рендерит сегменты и играет; curl: его itemId в /api/due | self-pass | см. ниже |
| F5 | Полиш: offline-предзагрузка уроков (без SW), responsive 375/768/1440, reduced-motion, README + AUTHORING-AI.md. **МАЙЛСТОУН** | нет | build ok; скриншоты 375/768/1440; уроки бандлятся (не сеть); README + playbook | self-pass | см. ниже |

## Доказательства (команда → вывод / пути скриншотов)
Прогон харнесса: `cd app && node verify/run.mjs` → **ALL GREEN** (backend :5080 + preview :4173).
Бэкенд: `dotnet test` → 12/12 passed. `npm run build` → tsc+vite OK (JS 22.5KB gz, CSS 5.6KB gz).

- **F1** (self-pass): harness «== F1 ==» все ✓ — home грузится, dev-auth (mode=dev, userId=stable),
  live due (knownDue=3), оба урока в пути. Скриншоты: `docs/evidence/F1/{375,768,1440}-home.png`.
- **F2** (self-pass): harness «== F2 ==» ✓ — boxing built 7 segments, s1 autoplay index>0, все 7 сегментов
  доходят до финального кадра. Скриншоты: `docs/evidence/F2/390-boxing-autoplay.png`, `375-boxing-full.png`.
- **F3** (self-pass): harness «== F3 ==» ✓ — card→grade Good→`/api/review` (interval 3.26д), due 4→3,
  boxing/c1 ушёл из очереди, home 3→2, stats reviewsTotal=1/xp=10. Durability (bash): kill+restart бэка →
  due остаётся 3 (SQLite durable). Card-answers сверены реальным `dotnet` (run-csharp): boxing→123, valref→1.
  Скриншот: `docs/evidence/F3/390-graded.png`.
- **F4** (self-pass): harness «== F4 ==» ✓ — value-vs-reference built 4 segments, все доходят до финала;
  его itemId `T1.M2.value-vs-reference/c1` в `/api/due`. Скриншоты: `docs/evidence/F4/{375-valref-full,390-valref-seg}.png`.
- **F5** (self-pass, МАЙЛСТОУН): reduced-motion → финальные кадры без автозапуска ✓; responsive
  `docs/evidence/F5/{375,768,1440}-lesson.png`; уроки БАНДЛЯТСЯ (grep dist: unbox.any/«separate memory
  locations»/«value semantics» в JS; app зовёт только auth/due/stats/lessons/review — не тянет контент).
  README `app/README.md` + playbook `docs/AUTHORING-AI.md` §9. G5: 0 ошибок консоли.

## Заметки
- Дизайн mid ЗАФИКСИРОВАН на фазе 3 (ратифицирован пользователем) → турнир вариантов нулевого экрана
  НЕ проводился: home и signature (эксперт-плотность урока) следуют locked-референсам (mid + lesson-boxing).
- Расширяемость доказана в деле: 2-й урок (value-vs-reference) добавлен как data-файл + seed + строка реестра,
  0 изменений в UI-коде — и отрендерился/сыграл/подключился к петле.
</content>
</invoke>
