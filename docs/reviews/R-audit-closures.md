# R-audit-closures — аудит точности урока closures.ts

Дата: 2026-07-10. Аудитор точности. Корпус правды: learn.microsoft.com (первоисточник)
+ C# language specification (statements). Файл-данные: `src/lessons/closures.ts`.

## Проверенные дословные цитаты (verbatim OK)

1. spec[] «If you capture variables in this way, the lambda expression stores them for
   use even if the variables go out of scope and would normally be garbage collected.»
   — ДОСЛОВНО присутствует на ms-lambda. OK.
2. edgeCases «A variable that you capture isn't garbage collected until the delegate
   that references it becomes eligible for garbage collection». — ДОСЛОВНО. OK.
3. edgeCases «A static lambda can't capture local variables or instance state from
   enclosing scopes, but it can reference static members and constant definitions». —
   ДОСЛОВНО. OK.
4. edgeCases «A lambda expression can't directly capture an in, ref, or out parameter
   from the enclosing method». — ДОСЛОВНО (в доке ссылки на in/ref/out, текст совпадает).
   OK.
5. s1 «Lambdas can refer to outer variables» + «These outer variables are the variables
   that are in scope in the method that defines the lambda expression». — ДОСЛОВНО на
   ms-lambda (раздел Capture of outer variables). OK.
6. s3 «Another lambda observes a new value of captured variable» — ДОСЛОВНО (в примере
   кода на ms-lambda, строка вывода/переменная). OK.
7. s5 «(Note that earlier versions of C# declared v outside of the while loop.)» — спека
   §13.9.5.2: «(Note that earlier versions of C# declared `v` outside of the `while`
   loop.)». ДОСЛОВНО. OK. Также «because each iteration has its own variable v, the one
   captured by f in the first iteration will continue to hold the value» — ДОСЛОВНО.

## НАХОДКИ (несоответствия)

### BLOCKER-1 — выдуманная/мисатрибутированная verbatim-цитата (2 места)
Текст «the lambda expression evaluates the captured variables when it is executed, not
when they were captured» подан в кавычках-ёлочках как дословная цитата Microsoft Learn
(шапка файла: «all English quotes are verbatim from learn.microsoft.com»). Атрибуция:
источник `ms-lambda`. Места: misconceptions.hook (стр. 53) и segments[0] (s1) explain
(стр. 69).
Проверка: этой фразы НЕТ на странице ms-lambda и вообще на learn.microsoft.com. Она
встречается в СТОРОННИХ туториалах (csharptutorial.net и др.), не в Microsoft.
Суть КОНЦЕПЦИИ верна (значение читается при вызове), но как ДОСЛОВНАЯ цитата
первоисточника — сфабрикована/мисатрибутирована.
Коррекция: убрать кавычки и атрибуцию к ms-lambda, либо заменить реальной формулировкой.
На ms-lambda прямой поддержки этой формулировки нет; факт можно опереть на пример
из спеки §13.9.5.2 и общий раздел capture. Severity: blocker (выдуманная цитата, №1 риск).

### MINOR-1 — атрибуция «C# 5» к странице cs-history не поддержана этой страницей
s5 explain и scene: «начиная с C# 5 переменная цикла своя на каждую итерацию»,
источник среди прочих `cs-history` (The history of C#). На странице C# version history
раздел C# 5.0 перечисляет ТОЛЬКО «Asynchronous members» и «Caller info attributes» —
про изменение семантики foreach там НЕ сказано.
Факт сам по себе ВЕРЕН: смена семантики foreach — именно C# 5.0 (подтверждается блогом
Eric Lippert 2009 «Closing over the loop variable considered harmful» + спека фиксирует
«earlier versions… declared v outside»). Проблема только в том, что конкретная
cs-history-страница это утверждение не несёт.
Коррекция: для «C# 5» опереться на первоисточник, где это есть (Lippert / спека-нота +
csharplang), либо снять cs-history из sourceRefs этого утверждения. Severity: minor
(факт верен, ослаблена конкретная атрибуция).

### MINOR-2 — номер раздела спеки неточен
Источник `cs-spec-foreach` назван «The foreach statement (§13.9.5)». Нота о захвате
переменной цикла и цитируемый текст находятся в подразделе §13.9.5.2 «Synchronous
foreach», а не в §13.9.5 напрямую. Сам §13.9.5 «The foreach statement» существует.
Коррекция: уточнить якорь до §13.9.5.2 для цитаты о захвате. Severity: minor.

## Проверенные идентификаторы / факты (OK)
- IL-имена `<>c__DisplayClass…`, `<>b__0` — реальные имена компилятор-генерируемых
  типов/методов замыканий (подтверждено: Roslyn-практики; терминология «DisplayClass»
  от Eric Lippert). Не поданы как doc-цитаты — как IL-представление, корректно.
- IL-опкоды newobj/stfld/ldftn/newobj Func`2::.ctor — реальные CIL-опкоды, применимы
  к сценарию подъёма переменной и создания делегата. OK.
- for-loop capture печатает «333»; foreach (C# 5+) — «012». Факт ВЕРЕН (спека + Lippert).
- Func<int,int>, Action, Func<int>, List<Action> — существующие типы .NET. OK.
- Термин «closure = лямбда + захваченные переменные» — подтверждён ms-delegates-lambdas:
  «The combination of the lambda and the variables it captures is called a closure». OK.

## Источники
- https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions
- https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/delegates-lambdas
- https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/statements (§13.9.5.2)
- https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history (C# 5.0)
- https://ericlippert.com/2009/11/12/closing-over-the-loop-variable-considered-harmful-part-one/


## ЧТО ПЛОХО
- из спеки §13.9.5.2 и общий раздел capture. Severity: blocker (выдуманная цитата, №1 риск).

ВЕРДИКТ: см. построчный разбор выше
