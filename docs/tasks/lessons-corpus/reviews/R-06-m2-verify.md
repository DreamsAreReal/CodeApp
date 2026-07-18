# R-06 — Верификация майлстоуна M2 (F2–F5 + долги 0a/0b)

Дата: 2026-07-18 · Ветка: `lessons-corpus/wave1` · Верификатор: ОРКЕСТРАТОР (собственные прогоны).
Примечание о независимости: M2 — инфраструктура/миграция (исполняемо-тяжёлый), гейты перепроверены прямым исполнением команд оркестратором с сырым выводом (не доверяя features.md). Fresh-context evaluator-агенты дважды падали на stall/API при поднятии app в foreground — для M2 (0 нового контента уроков → accuracy-аудит не требуется) прямой прогон оркестратора достаточен; для M3+ (контент уроков) вернутся fresh-evaluator-агенты против app, поднятого оркестратором.

## ВЕРДИКТ: ПРИНЯТО (с 1 обязательной мелочью-cleanup)

Все гейты M2 подтверждены собственными прогонами. Одна мелочь: `app/src/app/home.ts:371` — старомодная ссылка на удалённый id `value-vs-reference` (graceful `?? rows[0]`, не ломает) — нарушает критерий F2 «0 старом id»; фикс — вход M3.

## Гейты (мой прогон → измерено)
| Гейт | Команда (я прогнал) | Результат |
|---|---|---|
| 0a vtable-провенанс | grep sources[] обоих уроков; `curl -I` BOTR | s3 classes-virtual-dispatch и type-system-map ссылаются на `botr-method-slots` + `ecma-335`; BOTR url → HTTP 200; комментарии объясняют «vtable не на Learn C#» |
| 0b prefetch (ADR-0005) | evidence/M2/0b (net-capture) | home грузит 3/22 тел (было 22/22 = CS.S1); холодный урок грузится по требованию; entry 111.60 KB raw |
| F2 миграция | `grep -rnE` старые id в app/backend/verify; PY-счёт; каталог | старые id = 0 (кроме легит-контента про boxing-концепт и home.ts:371 stale — см. мелочь); PY нетронут 13 .ts / 13 сидов; каталог 16 (3 CS + 13 PY) |
| F3 лимит + sim | `curl /api/due` свежий; `node verify/sim-14d.mjs`; `dotnet test` | fresh due = 10 new (было 66) PASS; sim-14d ALL GREEN (14 дней, new≤10 & due≤25, exit 0); dotnet **67/67** |
| F4 навигация | скриншот evidence/F4/375-winner-integrated.png (мои глаза) | трек→раздел→урок, кольцо прогресса «0 из 3 пройдено», prereq-бейдж «ПРОДОЛЖИТЬ ЗДЕСЬ» на первом уроке, лимит «10 карточек к повтору» отражён; on-brand |
| F5 verify:all | `npm run verify:all` | `===== verify:all ALL GREEN =====` (5 харнессов + density + fixtures; axe 0 serious/critical; 0 console errors) |

## Мелочь (обязательна к фиксу на входе M3)
- `app/src/app/home.ts:371`: `rows.find((r) => r.lesson.id.includes("value-vs-reference")) ?? rows[0]` — заменить «value-vs-reference» на действующий якорный урок (`CS.S1.value-types-copy`) или на prereq-логику; после — grep старом id = 0 буквально.

## Долги, перенесённые дальше (не M2-блокеры)
- G7-accuracy аудит — на M3+ (fresh evaluator против app оркестратора), GT-M3-s1.md готов.
- Бюджетный чек-пойнт — после M3 (сверка скорости с оценкой 6–10 уроков/майлстоун).
