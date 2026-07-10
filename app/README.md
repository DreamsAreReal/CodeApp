# Фундамент C# — Telegram Mini App (walking skeleton)

A deep C#/.NET fundamentals refresher for **senior** engineers, delivered as a
Telegram Mini App: expert-density lessons with **autoplaying animations** wired to
a real **FSRS spaced-repetition loop** on the server. This is Milestone 1 — a
walking skeleton that runs end to end, plus an architecture where **adding a
lesson = adding one file**.

Stack: Vite + TypeScript, zero UI framework (static bundle, RS-02). Backend:
C#/ASP.NET Core + SQLite + FSRS-6 (already built, see `../backend`).

---

## Run it

Two processes: the backend (durable schedule + auth + catalog) and the frontend.

### 1. Backend (port 5080)

```bash
cd ../backend/Codex.Backend
ASPNETCORE_ENVIRONMENT=Development ASPNETCORE_URLS=http://localhost:5080 dotnet run --no-launch-profile
# sanity: curl -s http://localhost:5080/health
```

### 2. Frontend

```bash
cd app
npm install
npm run dev          # dev server -> http://localhost:5173
# or, to serve the production build:
npm run build && npm run preview   # -> http://localhost:4173
```

Open the URL in a normal browser: with no Telegram present the app uses a **dev
fallback** (a stable `devUserId`), so the whole loop works locally. Both `5173`
and `4173` are in the backend's local CORS allowlist.

The API base defaults to `http://localhost:5080`; override with `VITE_API_BASE`.

### 3. Verify (headless proof)

With the backend running and `npm run preview` up on `4173`:

```bash
npm run verify   # Playwright/Chromium; writes screenshots to ../docs/evidence/F*
```

It proves, against the live backend: home loads + dev-auth + live due (F1),
a lesson renders 7 segments and the animation plays (F2), answering a card and
grading it posts `/api/review` and the schedule moves — the due count drops (F3),
the second lesson renders (F4), and reduced-motion shows static final frames (F5).

---

## The daily loop (real, not display-only)

```
boot → Telegram initData (or dev devUserId) → POST /api/auth
home → GET /api/due  (server-truth queue)  +  GET /api/stats (streak/XP)
open lesson → animated segments + predict MCQ → grade (Again/Hard/Good/Easy)
             → POST /api/review  → FSRS-6 moves the due date on the server (SQLite)
back to home → GET /api/due again → the reviewed card is gone until it's due
```

The schedule is durable on the server, so it survives a client wipe (iOS WebKit
evicts storage, RS-12/RS-15) and even a backend restart.

---

## Architecture (extensibility is the point)

```
src/
  engine/       Living-diagram animation engine (RS-08), extracted as a reusable module.
                Scene (data) → render → keyed data-join diff (enter/update/exit)
                → FLIP (transform-only) → StepPlayer → VizPlayer (DOM/SVG adapter).
                Typed, zero-dependency. The SAME engine drives every animation.
  lessons/      Lessons AS DATA — one file per lesson (segments[]). index.ts is the registry.
                boxing.ts (7 animated deep-dives, IL), value-vs-reference.ts (4).
  app/          shell/home (mid design) + generic LessonRunner + tiny router + session.
  api/          Typed backend client (auth / due / stats / review / lessons).
  telegram/     Telegram WebApp integration (initData, theme, haptics) + dev fallback.
  styles/       mid design tokens (cream + coral + Rubik) + component CSS.
  strings.ts    All shell/runner user-facing strings (product language: ru).
```

**Engine extraction.** The proven exemplar (`docs/research/concepts/lesson-boxing`)
was a single HTML file. Its engine became typed ES modules under `src/engine`
(`render`, `diff`/`planFlip`, `StepPlayer`, `VizPlayer`), decoupled from globals:
UI strings and per-segment state are injected via config, so it renders any lesson.

**LessonRunner is generic.** `src/app/lessonRunner.ts` knows nothing about boxing
or value-vs-reference. It walks `lesson.segments[]`, mounts each as its own animated
card (with synced code/IL/console panels and an optional predict-then-run gate),
then renders the MCQ and the FSRS grade strip that closes the loop, then the
"reconstruct" + sources. Add a lesson and it renders here with **zero UI code**.

**Telegram + dev fallback.** `src/telegram/webapp.ts` uses `window.Telegram.WebApp`
when present (`ready`/`expand`, blend native chrome, `HapticFeedback`, and the
signed `initData` for auth); otherwise it falls back to a stable `devUserId` in
localStorage so the app runs in a plain browser.

**Offline.** Lessons are **bundled** (imported, not fetched) — no service worker
(RS-15: none in iOS WebView). A session runs offline; progress truth stays on the server.

---

## How to add a lesson

1. Create `src/lessons/<slug>.ts` exporting a `LessonData` object (segments,
   cards, sources — every claim with a source id).
2. Add a matching backend seed `backend/Codex.Backend/seed/lessons/<id>.json`
   with the **same `id` and card ids**, so its cards enter the FSRS due queue.
3. Register it: import and append to `LESSONS` in `src/lessons/index.ts`.

That's it — no UI changes. The full step-by-step playbook (schema, the shared
viz primitives, the accuracy gates, examples) is in **`../docs/AUTHORING-AI.md`**.
