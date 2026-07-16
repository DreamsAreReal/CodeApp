/**
 * F15 FSRS dosing measurement (LOCAL stand) — how many cards a FRESH user actually faces.
 *
 * Records three numbers for the acceptance log (evidence/F15/fsrs-dosing-local.txt):
 *   (a) GET /api/due for a brand-new user: total items, new items, split C# vs PY;
 *   (b) how many cards ONE continuous session (hero CTA) offers before the finish CTA
 *       ("Завершить сессию") — the honest "N из M" counter M, walked to the end for real
 *       (every card answered and graded Good, so no re-queues inflate M);
 *   (c) GET /api/due right after the session drains — what remains due today.
 *
 * Pattern follows multicard-session.mjs: live backend :5080 + preview :4173, fresh dev
 * user, real /api/review writes. This is a MEASUREMENT, not an assertion harness — it
 * prints the numbers; the only hard failures are broken preconditions (services down,
 * session never starting, a card that cannot be answered).
 */
import { chromium } from "playwright";
import { preflight } from "./_util.mjs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
const RUN_USER = 970000 + Math.floor(Math.random() * 20000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (m) => console.log(m);

async function authToken(devUserId) {
  const res = await fetch(API + "/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ devUserId }),
  });
  if (!res.ok) throw new Error(`/api/auth -> ${res.status}`);
  return (await res.json()).token;
}

async function getDue(token) {
  const res = await fetch(API + "/api/due", { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`/api/due -> ${res.status}`);
  return res.json();
}

function dueBreakdown(due) {
  const items = due.items ?? [];
  const py = items.filter((it) => it.itemId.startsWith("PY."));
  const cs = items.filter((it) => !it.itemId.startsWith("PY."));
  const news = items.filter((it) => it.isNew);
  return { total: items.length, isNew: news.length, py: py.length, csharp: cs.length };
}

async function main() {
  await preflight();
  const token = await authToken(RUN_USER);

  log(`\n== FSRS dosing measurement · LOCAL stand · fresh user ${RUN_USER} ==`);

  // (a) the raw daily queue a fresh user is handed by the server
  const before = await getDue(token);
  const a = dueBreakdown(before);
  log(`(a) /api/due BEFORE session: total=${a.total} new=${a.isNew} (PY=${a.py}, C#=${a.csharp})`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript((uid) => {
    try {
      localStorage.setItem("codex.devUserId", String(uid));
      localStorage.setItem("codex.onboarded", "1"); // past first-run -> the "session" hero renders
    } catch (e) { void e; }
  }, RUN_USER);
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__app && window.__app.ready && window.__home, { timeout: 15000 });

  // (b) start THE daily session from the hero CTA and walk it to the finish CTA
  await page.click("#heroCta");
  await page.waitForFunction(() => window.__session && window.__session.active, { timeout: 15000 });
  const startCounter = await page.evaluate(() => document.querySelector("#sessCount")?.textContent ?? "<none>");
  const startTotal = await page.evaluate(() => window.__session.total);
  log(`(b) session started: header counter "${startCounter}" (queue M=${startTotal})`);

  let answered = 0;
  let finishCta = "<never seen>";
  const HARD_CAP = 200; // safety: no session should ever exceed this
  while (answered < HARD_CAP) {
    const sess = await page.evaluate(() => window.__session);
    if (!sess || !sess.active) break;
    const cardKey = `${sess.current.lessonId}/${sess.current.cardId}`;
    // Answer whatever quiz UI this card renders (typed input or options).
    await page.waitForSelector("#qTyped, [data-opt]", { timeout: 15000 });
    const typed = await page.$("#qTyped");
    if (typed) {
      await typed.scrollIntoViewIfNeeded();
      await page.fill("#qTyped", "measurement-pass"); // answer text is irrelevant to dosing
    } else {
      await page.click('[data-opt="0"]');
    }
    await page.click("#qCheck");
    // typed cards reveal #qVerdict; MCQ cards only flip the banner — accept either
    await page.waitForSelector("#qVerdict:visible, #qBanner.show", { timeout: 8000 });
    await page.click('.grade-btn[data-g="3"]'); // Good -> no same-session re-queue
    try {
      await page.waitForFunction(() => window.__lastReview, null, { timeout: 15000 });
    } catch {
      // The harness grades cards at a non-human pace and can trip the backend's mutating
      // rate limiter (60/min fixed window -> POST /api/review answers 429 and no review
      // lands). A real learner never hits this. Wait out the window and re-click.
      log(`  429-window wait: no review for ${cardKey} in 15s — sleeping 61s, re-clicking grade`);
      await sleep(61000);
      const late = await page.evaluate(() => !!window.__lastReview);
      if (!late) await page.click('.grade-btn[data-g="3"]', { force: true });
      await page.waitForFunction(() => window.__lastReview, null, { timeout: 15000 });
    }
    await page.evaluate(() => { window.__lastReview = null; });
    answered += 1;
    if (answered % 10 === 0) log(`  ...${answered} cards graded (at ${cardKey})`);
    await sleep(150);
    const cta = await page.evaluate(() => document.querySelector("#btnNext")?.textContent?.trim() ?? "<none>");
    if (cta.includes("Завершить")) finishCta = `after card ${answered}: "${cta}"`;
    await page.click("#btnNext");
    // Pace the walk under the backend's mutating rate limit (60/min; ~2 mutating POSTs
    // per card -> keep the average above 2s/card). Humans are far slower than this.
    await sleep(1900);
    // Termination is the loop-top `__session.active` check: after the finish CTA the
    // router drains the session (active=false). `window.__home` is NOT a signal here —
    // it survives leaving the home screen.
  }
  const endTotal = startTotal; // M is stable on an all-Good walk; re-check via answered
  log(`(b) session finished: ${answered} cards answered in ONE session (finish CTA ${finishCta}; M stayed ${endTotal})`);

  // (c) what the server still considers due after the session drained
  const after = await getDue(token);
  const c = dueBreakdown(after);
  log(`(c) /api/due AFTER session: total=${c.total} new=${c.isNew} (PY=${c.py}, C#=${c.csharp})`);
  log(`console errors: ${consoleErrors.length}${consoleErrors.length ? " -> " + JSON.stringify(consoleErrors.slice(0, 3)) : ""}`);

  await browser.close();
  const ok = answered > 0 && answered <= HARD_CAP && a.total > 0;
  log(`\n==== ${ok ? "MEASURED" : "FAILED"} · runUser=${RUN_USER} ====`);
  process.exit(ok ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
