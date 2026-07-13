# Design — якорь (индекс)

сверено: 2026-07-13

Дизайн этого продукта разложен по специализированным докам; этот файл — единая точка входа и
штамп сверки с кодом. Продукт — Telegram Mini App, ежедневный обучающий тренажёр для сеньоров
(первый трек — фундамент C#; движок и формат тематически-агностичны — дальше Python, Claude Code).

## Архитектура (одним абзацем)
Фронт — Vite + TypeScript, без UI-фреймворка (статический бандл, offline-first, шрифты self-hosted).
Бэкенд — C#/ASP.NET Core + SQLite, single-origin (тот же хост отдаёт SPA и `/api/*`). Петля повторов —
FSRS-6 (порт py-fsrs 6.3.1). Auth — Telegram initData (HMAC, signature включён в data-check-string) →
stateless session-token (IDOR закрыт). Уроки — «урок-как-данные»: один объект драйвит анимацию + карточки + текст.

## Дизайн-язык (LOCKED)
Крем `#F6F1E9` + коралл `#F0533A` + Rubik (дисплей) / Onest (тело) / JetBrains Mono (код) + спарк-знак.
Здоровая геймификация без streak-shaming. Имени продукта пока нет (топбар = спарк-знак).

## Специализированные доки (источники правды по областям)
- Движок анимаций (living-diagram) + auto-layout `at`: [design/viz-design-spec.md](design/viz-design-spec.md)
- Формат «урок-как-данные»: [design/lesson-format.md](design/lesson-format.md)
- Продуктовая готовность (петля возврата, edge/empty, UX): [design/product-readiness-spec.md](design/product-readiness-spec.md)
- ТЗ-якорь + паспорт вкуса: [brief.md](brief.md)
- Онбординг разработчика (человеку): [GUIDE.md](GUIDE.md)
- Плейбук авторинга уроков (ИИ): [AUTHORING-AI.md](AUTHORING-AI.md)

## Ключевые ADR/решения
- Бэкенд C#/ASP.NET (сеньор-C#, бэк = учебный артефакт) вместо client-only; SQLite (single-writer/личная нагрузка).
- Автолейаут `at` (узел объявляет место, движок считает координаты) → кривой/вылезающий кадр невозможен
  по конструкции; приёмка viz-fit проверяет каждую сцену + mid-transition.
- Шрифты self-hosted (@fontsource) + ждём `fonts.ready` перед измерением (офлайн-first + кросс-платформенная стабильность).

Детальный статус и журнал — в [STATE.md](STATE.md); фичи — в [features.md](features.md).
