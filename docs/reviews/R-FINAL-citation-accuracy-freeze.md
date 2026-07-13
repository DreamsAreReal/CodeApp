# R-FINAL — Точность контента + целостность заморозки цитат (внешний VERIFY)

Дата: 2026-07-12. Скоуп: verbatim-точность цитат в `app/src/lessons/*.ts`,
резолв archived-URL, честность пометки 5 незамороженных, наличие композит-маркеров.
Метод: curl-фетч archived/live страниц + машинная сверка текста цитаты с текстом
источника (Python-греп по нормализованному тексту). WebFetch к web.archive.org в
этом окружении заблокирован → сверка через curl.

## ВЕРДИКТ — ВОЗВРАТ (accuracy-регресс на ms-lambda)

Заморозка механически честна по числам (25 уник. URL, 20 archived, 24 occurrences,
5 незамороженных — всё пересчитано и сходится), архивы резолвятся, композит-маркеры
на месте. НО сама цель заморозки — «пришпилить дословную формулировку» — на источнике
`ms-lambda` НЕ достигнута: две цитаты в `closures.ts`, поданные в «…» как verbatim,
НЕ являются дословными и НЕ совпадают ни с одним снапшотом источника (2020/2022/2026).
Пришпиленный архив АКТИВНО противоречит цитате. Это ровно тот дрейф, который заморозка
заявляла закрытой (риск №1).

## Паспорт вкуса: N/A (задача — точность метаданных/цитат, не визуал)

## Гейты

| Гейт | Результат | Доказательство |
|------|-----------|----------------|
| Архивы резолвятся | PASS | 8/8 curl → HTTP 200 (value-types, boxing, struct, gc, loh, idisposable, spec-foreach, dict-src) |
| value-vs-reference verbatim | PARTIAL | «contains an instance…» точна; copy-quote переписана в активный залог |
| boxing verbatim | PASS | все проверенные (boxing-def, separate memory, object reference o, IL box, stack 1MB) — дословно |
| gc verbatim | PASS | 13 проб — все дословно в архиве 20251030 |
| closures verbatim | FAIL | 2 цитаты ms-lambda — парафраз под видом verbatim, архив не совпадает |
| async-await verbatim | PASS | все проверенные дословно; мульти-источник корректен (ms-tap/ms-async-kw) |
| hashtable verbatim | PASS | все ms-dictionary дословно на live; CLRS корректно помечен как КОНЦЕПТ |
| 5 незамороженных честно | PASS | file-level отсутствие archived точно = 5 ID из отчёта; их цитаты ещё совпадают с live |
| композит-маркеры | PASS | 6/6 контентных файлов имеют `// COMPOSITE-QUOTES:` |

## ЧТО ПЛОХО

1. **[БЛОКЕР] `closures.ts` — 2 цитаты ms-lambda не verbatim, архив их опровергает.**
   Урок: `spec[0]` = «If you capture variables in this way, the lambda expression stores
   them for use even if the variables go out of scope and would normally be garbage
   collected.» и `edgeCases[0]` = «A variable that you capture isn't garbage collected
   until the delegate that references it becomes eligible for garbage collection».
   Источник (lambda-expressions, снапшоты 2020-09-03 / 2022-09-18 / 2026-01-13, все три):
   "Variables that are captured in this manner are stored for use in the lambda expression
   even if the variables would otherwise go out of scope and be garbage collected." и
   "A variable that is captured isn't garbage-collected until the delegate that references
   it becomes eligible for garbage collection." Формулировка урока не существовала НИ В
   ОДНОЙ версии. Также нет на delegates-lambdas. Смысл сохранён, но подано как дословная
   цитата в «…» — это мисрепрезентация, и пришпиленный archived (2026-01-13) её опровергает.
   Чинить: либо заменить текст на дословный из источника, либо снять «…» и переформатировать
   как пересказ (без guillemets). `spec[0]` даже НЕ помечен как композит.

2. **[СРЕДНЕ] `value-vs-reference.ts` seg copy explain — залоговый парафраз в guillemets.**
   Урок: «on assignment… you copy variable values. In the case of value-type variables,
   you copy the corresponding type instances» и «Structure types have value semantics…
   the system copies variable values on assignment». Источник (value-types 20240926 /
   struct 20241116): "variable values are copied… the corresponding type instances are
   copied" и "Structure types have value semantics… variable values are copied on
   assignment". Урок сменил пассив→актив и добавил «you»/«the system», которых в источнике
   нет. Смысл идентичен, но это не дословно внутри «…».

3. **[СРЕДНЕ] Отчёт `citation-freeze.md` умалчивает о п.1–2.** Отчёт утверждает «Тексты
   цитат… НЕ менялись». Проверка показывает, что как минимум 4 guillemet-фрагмента
   (2 ms-lambda + 2 в value-vs-reference) — парафраз, а не verbatim. Отчёт не выделяет
   это как риск; заявление о неизменности текста вводит в заблуждение.

## Дополнительно (не блокеры)

- `ms-lambda` date=2026-01-20, archived=2026-01-13 — заморозили на ТЕКУЩУЮ (переписанную)
  версию, а не на ту, откуда бралась старая формулировка. Здесь пин бесполезен.
- Мелкая вставка «but it can reference» (урок) vs «but can reference» (источник, static
  lambda) — минорно, смысл тот же.
- Числа заморозки пересчитаны механически и ПОДТВЕРЖДЕНЫ: 25 уник. URL, 20 уник. archived,
  24 occurrences, 5 незамороженных = ровно {ms-thread-ctor, ms-il-box, ms-il-unbox,
  ms-delegates-lambdas, ms-dictionary}.

## СОМНЕНИЯ

- Проверена репрезентативная выборка (≥2 на урок, всего ~40 проб), не 100% цитат.
  ms-lambda-класс дефекта мог просочиться и в непроверенные guillemet-фрагменты —
  рекомендуется сплошная машинная сверка КАЖДОЙ «…»-цитаты против archived перед DONE.
- delegates-lambdas и dictionary — live (не архив); их текст сегодня совпадает, но пин
  отсутствует, дрейф впереди возможен (это отчёт признаёт честно).


ВЕРДИКТ: ВОЗВРАТ (accuracy-регресс на ms-lambda)
