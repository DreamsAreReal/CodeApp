/**
 * Headless verification for the FIX WAVE (mechanics / flow correctness). Against preview :4173
 * + the live backend it proves, with REAL data and a LIVE run through the UI (not mocks):
 *
 *   (A) continuous session  — starting a session runs the WHOLE due queue card-to-card: the
 *                             "N из M" counter climbs, each grade advances to the next due card
 *                             (its lesson, its card — not always cards[0]), and only when the
 *                             queue drains does the flow return home showing "День закрыт" —
 *                             reached NATURALLY (window.__homeForced is undefined; no test hook).
 *   (B) seed alignment      — every due itemId maps to a front-renderable card (no unreachable
 *                             card such as the old boxing/c2); the session can grade every one.
 *   (C) reduced-motion tgl  — with ONLY the in-app "Меньше движения" flag on (no OS media),
 *                             a lesson's segments render at their FINAL frame (no animation).
 *   (D) nav race guard      — Progress (slow fetch) then quickly Profile => Profile stays; the
 *                             stale Progress render does NOT paint over the later screen.
 *   (E) review-fail humane  — a failed POST /api/review shows a friendly failure line (from
 *                             strings.ts), HIDES the success check, leaks NO raw error, keeps the
 *                             grade buttons active; a retry after recovery saves cleanly.
 *
 * Writes 390px evidence PNGs under docs/evidence/polish-flow.
 */
import { chromium } from "playwright";
import { evidenceDir, preflight } from "./_util.mjs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
// CI-portable evidence dir: $EVIDENCE_DIR/polish-flow on CI, else repo-relative (no hardcoded path).
const EV = evidenceDir("polish-flow");
const VP = { width: 390, height: 844 };

const log = (m) => console.log(m);
let failed = 0;
function assert(cond, msg) {
  if (cond) log("  ✓ " + msg);
  else {
    failed++;
    log("  ✗ FAIL: " + msg);
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FRESH = () => 750000 + Math.floor(Math.random() * 90000);

async function main() {
  await preflight();
  const browser = await chromium.launch();
  const consoleErrors = [];
  const IGNORE = /net::ERR_FAILED|Failed to load resource/i; // benign for the intentional review-abort test

  async function newCtx(uid, opts = {}) {
    const ctx = await browser.newContext({ viewport: VP, deviceScaleFactor: 1, ...opts });
    await ctx.addInitScript(
      ([id, onboarded, reduced]) => {
        try {
          localStorage.setItem("codex.devUserId", String(id));
          if (onboarded) localStorage.setItem("codex.onboarded", "1");
          if (reduced) localStorage.setItem("codex.reducedMotion", "1");
        } catch (e) {
          void e;
        }
      },
      [uid, opts.onboarded === true, opts.reducedToggle === true],
    );
    return ctx;
  }
  function watch(page) {
    page.on("console", (m) => {
      if (m.type() === "error" && !IGNORE.test(m.text())) consoleErrors.push(m.text());
    });
    page.on("pageerror", (e) => consoleErrors.push(String(e)));
  }

  /** Answer the current card (typed or MCQ) and grade it Good, then wait for the post-grade CTA. */
  async function answerAndGrade(page) {
    await page.waitForFunction(() => window.__lesson, { timeout: 15000 });
    if (await page.locator("#qTyped").count()) {
      await page.locator("#qTyped").fill("42"); // value is irrelevant — we only need to reach the grade strip
      await page.click("#qCheck");
    } else {
      await page.locator(".opt").first().click();
      await page.click("#qCheck");
    }
    await page.waitForSelector('.grade-btn[data-g="3"]', { timeout: 8000 });
    await page.click('.grade-btn[data-g="3"]');
    await page.waitForSelector("#btnNext", { timeout: 8000 });
  }

  // ===================== (A) + (B) continuous session -> natural done =====================
  log("\n== (A) continuous session: run the whole due queue card-to-card -> natural 'День закрыт' ==");
  const sessUser = FRESH();
  const ctxA = await newCtx(sessUser, { onboarded: true });
  const pageA = await ctxA.newPage();
  watch(pageA);
  await pageA.goto(APP, { waitUntil: "networkidle" });
  await pageA.waitForFunction(() => window.__home && window.__home.state, { timeout: 15000 });
  const startHome = await pageA.evaluate(() => window.__home);
  assert(startHome.state === "session", `starts in 'session' state (got "${startHome.state}")`);
  assert(startHome.knownDue > 1, `more than one card is due for a real session (knownDue=${startHome.knownDue})`);
  const M = startHome.knownDue;

  await pageA.click("#heroCta");
  await pageA.waitForFunction(() => window.__session, { timeout: 15000 });
  const s0 = await pageA.evaluate(() => window.__session);
  assert(s0.total === M, `session snapshot M = due count at start (total=${s0.total}, knownDue=${M})`);
  assert(s0.position === 1, "session opens at card 1");
  assert((await pageA.locator("#sessCount").count()) === 1, "'N из M' session counter is shown in the lesson chrome");

  const seen = new Set();
  let lastCounter = "";
  for (let i = 0; i < M + 2; i++) {
    const s = await pageA.evaluate(() => window.__session);
    if (!s || !s.active) break;
    lastCounter = (await pageA.locator("#sessCount").innerText()).trim();
    const expect = `${s.position} из ${s.total}`;
    assert(lastCounter === expect, `counter reads "${expect}" at card ${s.position}`);
    seen.add(`${s.current.lessonId}/${s.current.cardId}`);
    await answerAndGrade(pageA);
    const cta = (await pageA.locator("#btnNext").innerText()).trim();
    const isLast = s.position === s.total;
    if (isLast) {
      assert(/Заверш/.test(cta), `last card's primary CTA finishes the session (got "${cta}")`);
      // screenshot the final "N из M" session card before finishing
      await pageA.screenshot({ path: `${EV}/390-session-counter.png`, fullPage: true });
    } else {
      assert(/Следующ/.test(cta), `mid-session primary CTA advances to the next card (got "${cta}")`);
      assert((await pageA.locator("#btnHome").count()) === 1, "mid-session offers 'На главную' as a SECONDARY link");
    }
    await pageA.click("#btnNext");
    await sleep(300);
  }
  assert(seen.size === M, `session graded every one of the ${M} due cards (distinct cards seen=${seen.size})`);

  await pageA.waitForFunction(() => window.__home && window.__home.state, { timeout: 15000 });
  const endHome = await pageA.evaluate(() => window.__home);
  assert(endHome.state === "done", `queue drained -> 'День закрыт' reached (state="${endHome.state}")`);
  assert(endHome.knownDue === 0, "no cards remain due after the session");
  assert((await pageA.evaluate(() => window.__homeForced)) === undefined, "done was reached NATURALLY (no __forceHomeHero)");
  assert((await pageA.locator(".hero-done").count()) === 1, "day-closed hero rendered by a live run");
  await pageA.screenshot({ path: `${EV}/390-done-natural.png`, fullPage: true });

  // ===================== (B) seed alignment: no unreachable due card =====================
  log("\n== (B) seed alignment: every due itemId maps to a front card (no unreachable card) ==");
  // A fresh user's due queue must contain exactly one reviewable card per lesson id, and the old
  // unreachable boxing/c2 must be gone (it would surface here forever if the catalog still held it).
  const alignUser = FRESH();
  const authRes = await (await fetch(API + "/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ devUserId: alignUser }) })).json();
  const dueRes = await (await fetch(API + "/api/due", { headers: { Authorization: `Bearer ${authRes.token}` } })).json();
  const catalog = await (await fetch(API + "/api/lessons", { headers: { Authorization: `Bearer ${authRes.token}` } })).json();
  const ids = dueRes.items.map((it) => it.itemId);
  assert(!ids.some((id) => id.endsWith("boxing/c2")), "removed boxing/c2 is NOT in the due queue");
  // The catalog's card COUNT per lesson must equal the front cards[].length (proved live in test A by
  // grading every due card). Here assert boxing is aligned to a single card, and that the whole due
  // queue drained cleanly for sessUser above (seen.size === M) — i.e. no card was unreachable.
  const boxing = catalog.find((l) => l.id.endsWith("boxing"));
  assert(boxing && boxing.cards === 1, `boxing catalog is aligned to 1 card (cards=${boxing?.cards})`);
  assert(ids.length === catalog.length, `a fresh user's due queue = exactly one card per lesson (due=${ids.length}, lessons=${catalog.length})`);

  // ===================== (C) reduced-motion toggle silences a lesson =====================
  log("\n== (C) reduced-motion toggle (app flag, no OS media): lesson segments show FINAL frame ==");
  const rmUser = FRESH();
  const ctxC = await newCtx(rmUser, { onboarded: true, reducedToggle: true }); // NO reducedMotion OS context
  const pageC = await ctxC.newPage();
  watch(pageC);
  await pageC.goto(APP, { waitUntil: "networkidle" });
  await pageC.waitForFunction(() => window.__home && window.__home.state, { timeout: 15000 });
  const osReduce = await pageC.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  assert(osReduce === false, "OS prefers-reduced-motion is OFF (the toggle alone must drive it)");
  await pageC.evaluate(() => window.__app.openLesson("T1.M2.value-vs-reference"));
  await pageC.waitForFunction(() => window.__viz && window.__viz.ready, { timeout: 15000 });
  await sleep(700); // give any (unwanted) animation time to visibly start
  const viz = await pageC.evaluate(() => {
    const vk = window.__viz.vizByKey;
    return Object.keys(vk).map((k) => ({ k, index: vk[k].state.index, total: vk[k].state.total }));
  });
  const allFinal = viz.every((v) => v.index === v.total - 1);
  assert(allFinal, `every segment is at its final frame under the toggle (states=${JSON.stringify(viz)})`);
  await pageC.screenshot({ path: `${EV}/390-reduced-lesson.png`, fullPage: true });

  // ===================== (D) nav race guard =====================
  log("\n== (D) nav race: Progress (slow fetch) then quickly Profile -> Profile stays ==");
  const raceUser = FRESH();
  const ctxD = await newCtx(raceUser, { onboarded: true });
  const pageD = await ctxD.newPage();
  watch(pageD);
  await pageD.goto(APP, { waitUntil: "networkidle" });
  await pageD.waitForFunction(() => window.__home && window.__home.state, { timeout: 15000 });
  let delayed = false;
  await pageD.route("**/api/progress", async (route) => {
    if (!delayed) {
      delayed = true;
      await sleep(1500);
    }
    await route.continue();
  });
  await pageD.locator('[data-nav="progress"]').click();
  await sleep(60);
  await pageD.locator('[data-nav="profile"]').click();
  await sleep(2200); // let the slow Progress fetch resolve well AFTER Profile was chosen
  const raced = await pageD.evaluate(() => ({
    hasProfile: !!document.querySelector(".pf-id"),
    hasProgressMastery: !!document.querySelector(".mastery"),
    title: document.querySelector(".screen-title")?.textContent?.trim(),
  }));
  assert(raced.hasProfile && raced.title === "Профиль", `Profile stayed on screen (title="${raced.title}")`);
  assert(!raced.hasProgressMastery, "the slow Progress render did NOT paint over Profile");

  // ===================== (E) review-fail humane =====================
  log("\n== (E) review POST fails -> friendly line, no success check, no raw error, retry recovers ==");
  const failUser = FRESH();
  const ctxE = await newCtx(failUser, { onboarded: true });
  const pageE = await ctxE.newPage();
  watch(pageE);
  await pageE.goto(APP, { waitUntil: "networkidle" });
  await pageE.waitForFunction(() => window.__home && window.__home.state, { timeout: 15000 });
  await pageE.evaluate(() => window.__app.openLesson("T1.M2.value-vs-reference"));
  await pageE.waitForFunction(() => window.__lesson, { timeout: 15000 });
  await pageE.locator("#qTyped").fill("xxx");
  await pageE.click("#qCheck");
  await pageE.waitForSelector('.grade-btn[data-g="1"]', { timeout: 8000 });
  await pageE.route("**/api/review", (route) => route.abort());
  await pageE.click('.grade-btn[data-g="1"]');
  await pageE.waitForSelector("#gradeFail:not([hidden])", { timeout: 8000 });
  const fe = await pageE.evaluate(() => {
    const fail = document.querySelector("#gradeFail");
    const done = document.querySelector("#gradeDone");
    const ok = document.querySelector("#gradeOk");
    const msg = document.querySelector("#gradeMsg");
    const btns = Array.from(document.querySelectorAll(".grade-btn"));
    return {
      failVisible: fail && !fail.hasAttribute("hidden"),
      failText: (fail?.textContent || "").trim(),
      doneShown: done?.classList.contains("show"),
      okHidden: ok?.hasAttribute("hidden"),
      msgText: (msg?.textContent || "").trim(),
      btnsEnabled: btns.every((b) => !b.disabled),
    };
  });
  assert(fe.failVisible, "friendly failure line is shown");
  assert(!fe.doneShown, "the success line (#gradeDone with its check) is NOT shown on failure");
  assert(fe.okHidden, "the success check icon is hidden on failure");
  assert(!/network|Failed to fetch|undefined|\[object|Error:/i.test(fe.failText + fe.msgText), `no raw error text leaks (fail="${fe.failText}")`);
  assert(fe.btnsEnabled, "grade buttons stay active for a retry");
  await pageE.screenshot({ path: `${EV}/390-review-fail.png`, fullPage: true });
  // retry after recovery
  await pageE.unroute("**/api/review");
  await pageE.click('.grade-btn[data-g="1"]');
  await pageE.waitForSelector("#btnNext", { timeout: 8000 });
  const rec = await pageE.evaluate(() => ({
    done: document.querySelector("#gradeDone")?.classList.contains("show"),
    fail: !document.querySelector("#gradeFail").hasAttribute("hidden"),
  }));
  assert(rec.done && !rec.fail, "a retry after recovery saves cleanly (success shown, failure cleared)");

  // ===================== console errors gate =====================
  log("\n== console errors ==");
  assert(consoleErrors.length === 0, "zero console/page errors across the run" + (consoleErrors.length ? " -> " + JSON.stringify(consoleErrors.slice(0, 6)) : ""));

  await browser.close();
  log(`\n==== ${failed === 0 ? "ALL GREEN" : failed + " FAILED"} · sessUser=${sessUser} M=${M} counter="${lastCounter}" ====`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
