# RS-baseline — «как есть» до Python-трека (2026-07-15)

Замер на HEAD 5772ad5 (main, clean), теми же инструментами, что будут проверять гейты:

- `dotnet test backend/Codex.Backend.Tests` → **Passed 65 / Failed 0** (лог /tmp/baseline-dotnet.log).
- `cd app && npm install && npm run build` (tsc --noEmit + vite build) → **EXIT 0**,
  бандл `index-*.js` 222.38 КБ / **59.84 КБ gzip** (лог /tmp/baseline-build2.log).
- CI на HEAD зелёный (история коммитов: deploy graceful-skip при отсутствии VPS-секретов).
- Контент: 6 уроков C#-трека (T1/T2), Python-уроков 0.

Guardrails «не хуже» для этой задачи: dotnet test 65+новые PASS; npm build чистый;
все харнессы (run/shell/new-lessons/viz-fit/loop) зелёные с добавленными уроками;
бандл растёт только на данные уроков (контроль: gzip-размер в отчёте).
