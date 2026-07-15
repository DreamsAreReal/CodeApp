/**
 * Multicard-lesson session honesty (consumer M1 finding). Against the LIVE backend
 * (:5080) + preview (:4173), on a fresh dev user, drives the 3-card PY.M1 lesson
 * session end-to-end and asserts:
 *   (1) the "N из M" counter walks 1/3 -> 2/3 -> 3/3 with a STABLE M on the happy path;
 *   (2) the finish CTA ("Завершить сессию") appears ONLY on the session's last card —
 *       every earlier card offers "Следующая карточка";
 *   (3) a card graded AGAIN is RE-QUEUED at the end of the SAME session (the FSRS
 *       ~1-min learning-step promise): M grows 3 -> 4, the missed card returns as
 *       card 4, and only after it is graded does the finish CTA appear;
 *   (4) the re-queue is capped at once per card (failing it again does NOT grow M).
 * Requires: backend on :5080, `npm run build && npm run preview` on :4173.
 */
import { chromium } from "playwright";
import { preflight } from "./_util.mjs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const RUN_USER = 930000 + Math.floor(Math.random() * 60000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (m) => console.log(m);
let failed = 0;
function assert(cond, msg) {
  if (cond) log("  ✓ " + msg);
  else { failed++; log("  ✗ FAIL: " + msg); }
}

const LESSON = "PY.M1.names-objects";
const RIGHT = { c1: "['a']\n['a', 'b']", c2: "[1, 2, 3, 4]\nTrue", c3: "(1, [2, 3, 4])", c4: "['a']\n['b']" };

async function main() {
  await preflight();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript((uid) => { try { localStorage.setItem("codex.devUserId", String(uid)); } catch (e) { void e; } }, RUN_USER);
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__app && window.__app.ready && window.__home, { timeout: 15000 });

  const counter = () => page.evaluate(() => document.querySelector("#sessCount")?.textContent ?? "<none>");
  const currentCard = () => page.evaluate(() => window.__session?.current?.cardId ?? null);
  const primaryCta = () => page.evaluate(() => document.querySelector("#btnNext")?.textContent?.trim() ?? "<none>");
  const grade = async (text, g) => {
    await page.locator("#qTyped").scrollIntoViewIfNeeded();
    await page.fill("#qTyped", text);
    await page.click("#qCheck");
    await page.waitForSelector("#qVerdict", { state: "visible", timeout: 8000 });
    await page.click(`.grade-btn[data-g="${g}"]`);
    await page.waitForFunction(() => window.__lastReview, { timeout: 8000 });
    await page.evaluate(() => { window.__lastReview = null; });
    await sleep(300);
  };

  log(`\n== ${LESSON}: 4-card session — honest counter + finish only on the last card ==`);
  // home shows ONE track at a time — switch the path to the Python group first
  await page.click('[data-track-tab="python"]');
  await page.click(`[data-lesson="${LESSON}"]`);
  await page.waitForFunction(() => window.__viz && window.__viz.ready, { timeout: 15000 });
  assert((await counter()) === "1 из 4", `card 1 counter reads "1 из 4" (got "${await counter()}")`);

  // card 1: grade AGAIN -> the card must RE-QUEUE (M grows to 5), CTA stays "next"
  await grade("wrong-on-purpose", 1);
  assert((await counter()) === "1 из 5", `AGAIN re-queues the card: counter now "1 из 5" (got "${await counter()}")`);
  const cta1 = await primaryCta();
  assert(cta1.includes("Следующая"), `after AGAIN on card 1 the primary CTA is next-card (got "${cta1}")`);
  await page.click("#btnNext");
  await sleep(400);

  // cards 2..4 (c2..c4): honest positions over the grown queue, never a premature finish
  for (const [pos, cid] of [[2, "c2"], [3, "c3"], [4, "c4"]]) {
    assert((await currentCard()) === cid, `card ${pos} is ${cid} (got ${await currentCard()})`);
    assert((await counter()) === `${pos} из 5`, `card ${pos} counter reads "${pos} из 5" (got "${await counter()}")`);
    await grade(RIGHT[cid], 3);
    const cta = await primaryCta();
    assert(cta.includes("Следующая"), `card ${pos} is NOT the last (re-queued c1 pending) — CTA is next-card (got "${cta}")`);
    await page.click("#btnNext");
    await sleep(400);
  }

  // card 5 = the re-queued c1 (same-session return)
  assert((await currentCard()) === "c1", `the missed c1 returned within the SAME session (got ${await currentCard()})`);
  assert((await counter()) === "5 из 5", `re-queued card counter reads "5 из 5" (got "${await counter()}")`);
  // fail it AGAIN: the once-per-card cap must hold (M stays 5, session can finish)
  await grade("wrong-again", 1);
  assert((await counter()) === "5 из 5", `re-queue is capped at once per card — M stays 5 (got "${await counter()}")`);
  const cta5 = await primaryCta();
  assert(cta5.includes("Завершить"), `finish CTA appears ONLY on the true last card (got "${cta5}")`);
  await page.click("#btnNext");
  await sleep(600);
  const backHome = await page.evaluate(() => !!window.__home);
  assert(backHome, "finishing the session returns home");

  log("\n== console errors ==");
  assert(consoleErrors.length === 0, "zero console/page errors" + (consoleErrors.length ? " -> " + JSON.stringify(consoleErrors.slice(0, 3)) : ""));

  await browser.close();
  log(`\n==== ${failed === 0 ? "ALL GREEN" : failed + " FAILED"} · runUser=${RUN_USER} ====`);
  process.exit(failed === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
