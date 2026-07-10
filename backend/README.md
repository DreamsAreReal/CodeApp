# Codex Backend (skeleton spike)

Working backend skeleton for the "Codex" learning Telegram Mini App.
Role of the backend: **DATA / CONTENT / AUTH** — durable persistence of learner progress + FSRS
schedule, serving lessons-as-data, and Telegram initData authentication.

It does **not** run user code to "prove mastery"; the C# runner here is an **authoring** tool
(compute a card's ground-truth answer), not a user-facing feature.

Stack: C# / ASP.NET Core minimal API, `net10.0` (dotnet 10.0.301). Persistence: SQLite.

## Why a server at all (iOS durability)

On iOS, Telegram runs inside WKWebView. WebKit proactively evicts script-writable storage
(IndexedDB, localStorage) after ~7 days of browser use without interaction (RS-12 §3.1). So the
**source of truth for the FSRS schedule + append-only history is the server (SQLite here)**, which
survives client eviction, reinstall and device changes. The client keeps an offline cache only.

## Run

```bash
cd backend/Codex.Backend
ASPNETCORE_URLS=http://localhost:5080 dotnet run --no-launch-profile
# health check:
curl -s http://localhost:5080/health
```

The SQLite file is created on first start at `backend/Codex.Backend/codex.db` (schema created on
startup, catalog seeded from `seed/lessons/*.json`). Delete the `codex.db*` files to reset.

## Tests

```bash
cd backend/Codex.Backend.Tests
dotnet test
```

12 tests: FSRS-6 scheduler behaviour (Good grows the interval, Again drops it, monotonic grades,
forgetting curve calibration) + end-to-end endpoint tests (dev auth, due→review→due changes,
genuine/tampered initData HMAC, C# runner stdout).

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth` | Validate Telegram `initData` (HMAC), create/return the user. Dev bypass: `{"devUserId": N}`. |
| GET  | `/api/due?userId=` | Items due now for the user (new items are due immediately). |
| POST | `/api/review` | `{userId,itemId,grade}` (grade 1..4) → updates FSRS state, returns next due, appends a `ProgressEvent`. |
| GET  | `/api/lessons` | Lesson catalog (summaries). |
| GET  | `/api/lessons/{id}` | One lesson-as-data, verbatim JSON. |
| POST | `/api/authoring/run-csharp` | **DEV-ONLY** authoring tool: compile+run a C# snippet, return stdout. |
| GET  | `/api/dev/sign-initdata?userId=` | **DEV-ONLY** helper that produces genuinely-signed `initData` for local tests. |
| GET  | `/health` | Liveness. |

Grades: `1=Again, 2=Hard, 3=Good, 4=Easy`.

## Data model (SQLite)

- `users(tg_id, created)`
- `items(item_id, lesson_id, prompt, expected_output)` — review catalog, seeded from lesson cards.
- `review_state(user_id, item_id, difficulty, stability, due, reps, lapses, last_review)` — FSRS state.
- `progress_events(id, user_id, item_id, grade, ts)` — append-only history.

## Telegram initData validation

Per core.telegram.org/bots/webapps (`TelegramAuth.Validate`):

1. `data_check_string` = every field except `hash` (and `signature`), sorted by key, joined
   `key=value` with `\n`.
2. `secret_key = HMAC_SHA256(key="WebAppData", data=bot_token)`.
3. `check_hash = HMAC_SHA256(key=secret_key, data=data_check_string)`.
4. Constant-time compare (`CryptographicOperations.FixedTimeEquals`) with the received `hash`,
   then verify `auth_date` freshness (anti-replay). `initDataUnsafe` is never trusted.

**Dev mode** (`Auth:DevMode`, on by default in Development): allows `{"devUserId": N}` bypass and the
`/api/dev/sign-initdata` helper, so local `curl` exercises the real HMAC path without a live bot.
The bot token lives in `appsettings.json` (`Telegram:BotToken`) — a placeholder dev token; set the
real token via configuration / env (`Telegram__BotToken`) in production.

## FSRS scheduler

Compact **FSRS-6** (DSR model) implemented in `Fsrs.cs`, grounded on open-spaced-repetition
(py-fsrs `DEFAULT_PARAMETERS`, 21 weights, FSRS-6; retrieved 2026-07-09). It implements the
across-day schedule: initial S/D, difficulty update (linear damping + mean reversion), recall- and
forget-stability, and the FSRS-6 power forgetting curve with parameterised decay (w20). With
`desiredRetention = 0.9`, the interval equals stability. The FSRS-6 same-day short-term terms
(w17..w19) are intentionally omitted in this skeleton — they do not affect across-day scheduling
(which drives the due queue). Proven sensible in tests: new Good → ~3.26d, new Again → ~0.22d;
repeated Good after the interval elapses grows stability; Again drops it.

## Sandbox note for `run-csharp` (production)

`/api/authoring/run-csharp` executes arbitrary C# **in-process with no isolation** (Roslyn
`CSharpScript`). It is **DEV-ONLY** and gated by `Auth:DevMode`. In production this MUST run inside a
**sandbox**: a separate process/container, CPU + memory + wall-clock limits, no network, no
filesystem access. The current runner has only a wall-clock timeout (`CSharpRunner:TimeoutSeconds`)
and serialises runs — that is **not** a security boundary.

## Configuration (`appsettings.json`)

- `Telegram:BotToken` — bot token used for HMAC (dev placeholder by default).
- `Auth:DevMode` — enables dev auth bypass + dev helpers + `run-csharp`.
- `Auth:MaxAgeSeconds` — `initData` freshness window (0 disables the check).
- `CSharpRunner:TimeoutSeconds` — wall-clock timeout for the authoring runner.
- `Database:Path` — SQLite file path (relative to content root).
- `Cors:AllowedOrigins` — allowed local frontend origins (empty ⇒ AllowAnyOrigin for dev).

## Packages (existence-checked on NuGet before adding)

- `Microsoft.Data.Sqlite` 10.0.9 (durable persistence).
- `SQLitePCLRaw.bundle_e_sqlite3` 3.0.3 — pinned to supersede the transitive 2.1.11 that carries a
  high-severity advisory (GHSA-2m69-gcr7-jv3q).
- `Microsoft.CodeAnalysis.CSharp.Scripting` 4.14.0 (Roslyn scripting, dev-only runner).
- Tests: `Microsoft.AspNetCore.Mvc.Testing`, `xunit` (SDK-managed).
