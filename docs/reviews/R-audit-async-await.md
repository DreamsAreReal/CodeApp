# Аудит точности — урок async/await

Файл: `app/src/lessons/async-await.ts`. Дата аудита: 2026-07-10.
Первоисточники: learn.microsoft.com (TAP model, async keyword, Consuming TAP, MSDN Magazine best-practices).

## Проверено дословно (verbatim match)

- spec: «An await expression … doesn't block the current thread … signs up the rest of the method as a continuation and returns control to the caller of the async method» — VERBATIM, TAP, раздел Threads. OK
- misconceptions: «The `async` and `await` keywords don't cause extra threads to be created» — VERBATIM (слово «extra», не «additional» — корректно). OK
- misconceptions: «an async method doesn't run on its own thread» — VERBATIM, TAP. OK
- s1: «An async method runs synchronously until it reaches its first `await` expression. At that point, the method is suspended until the awaited task is complete. In the meantime, control returns to the caller of the method» — VERBATIM, async keyword. OK
- s1: «the compiler does the difficult work» — VERBATIM substr, TAP. OK
- s1: «executes as a synchronous method does, despite the `async` modifier» — VERBATIM, TAP. OK
- s2: «an async method returns a task value when its work is suspended» — VERBATIM, TAP. OK
- s3: «Async methods don't require multithreading … uses time on the thread only when the method is active» — VERBATIM, TAP. OK
- s3: «You can use Task.Run … background thread doesn't help with a process that's just waiting for results to become available» — VERBATIM, TAP. OK
- s4: Post-метод / task scheduler цитата — VERBATIM, Consuming TAP. OK
- s4: «not to capture and resume on the context, but to continue execution wherever the asynchronous operation… completed» — VERBATIM (эллипсис корректно скрывает «that was being awaited»). OK
- s4: «it avoids unnecessary context hops and reduces deadlock risk for callers that block» — VERBATIM, Consuming TAP. OK
- s5 / edgeCases: «that context already has a thread in it, which is (synchronously) waiting … They're each waiting for the other, causing a deadlock» — VERBATIM, MSDN best-practices. OK
- s5: «It's usually a bad idea to block on async code by calling Task.Wait or Task.Result» — VERBATIM. OK
- s5: «permits only one chunk of code to run at a time» → «only one chunk of code to run at a time» — VERBATIM substr. OK
- edgeCases ConfigureAwait цитата — VERBATIM, Consuming TAP. OK

## Идентификаторы — все существуют

ConfigureAwait, Task.Delay, Task.Run, Task.Yield, Task.Wait, Task.Result, HttpClient.GetStringAsync,
SynchronizationContext.Post, IOCP, async void — реальные .NET API / концепции. OK

## Card c1 (ABC6)

`await Task.Yield()` форсирует асинхронное продолжение (Task.Yield docs). Логика A(синхронно)→
возврат управления вызывающему→B→continuation→C→await t=6 → «ABC6». Корректно.

## Находки

1. [MAJOR] edgeCases async void: цитата «the caller of a void-returning method can't catch any exceptions
   that the method throws» атрибутирована `ms-async-kw`. На странице async keyword (ms.date 2026-01-21)
   фактически: «The caller of a `void`-returning async method can't await it and can't catch exceptions
   that the method throws» (без «any», со словом «async»). Дословная строка из урока НЕ присутствует на
   ms-async-kw. Она VERBATIM присутствует на ms-tap (TAP): «the caller of a void-returning method can't
   catch any exceptions that the method throws». → мисатрибуция источника: правильный источник ms-tap.

2. [MINOR] s3 explain: «there is no thread» в кавычках-guillemets, источник только ms-tap. Фразы нет на
   странице TAP — это известная формулировка Stephen Cleary («There Is No Thread»), а не цитата офдока.
   Как перцептивная аксиома верно, но оформлена как цитата без соответствующего источника.

Прочих несоответствий (числа/факты/поведение/опкоды) не найдено. IL-опкодов в этом уроке нет.


## ЧТО ПЛОХО
- Замечания и оговорки этого лога — в построчном разборе выше.

ВЕРДИКТ: см. построчный разбор выше
