/**
 * FINISH-SESSION reproducibility probe (final-fix, breaker finding "д"): one run of
 * "Завершить сессию" silently failed for the consumer-breaker (no completion screen).
 * Hypothesis: 429 from the fixed-window rate limiter at machine pace, not an app bug.
 *
 * This probe drives the 4-card PY.M1 topic session end-to-end at HUMAN pace (1.2-2s
 * pauses between actions) for THREE fresh users, clicks "Завершить сессию" on the last
 * card, and asserts the app actually returns home (a rendered hero + __home state).
 * Every non-OK API response and page error is logged — so if a silent failure happens
 * we see exactly what the network said.
 */
import { chromium } from "playwright";
import { preflight } from "./_util.mjs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (m) => console.log(m);
let failed = 0;
function assert(cond, msg) {
  if (cond) log("  ✓ " + msg);
  else { failed++; log("  ✗ FAIL: " + msg); }
}

const LESSON = "PY.M1.names-objects";
const RIGHT = { c1: "['a']\n['a', 'b']", c2: "[1, 2, 3, 4]\nTrue", c3: "(1, [2, 3, 4])", c4: "['a']\n['b']" };

async function run(browser, n) {
  const uid = 970000 + Math.floor(Math.random() * 20000) + n;
  log(`\n== finish run ${n}/3 (devUserId=${uid}, human pace) ==`);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript((id) => { try { localStorage.setItem("codex.devUserId", String(id)); localStorage.setItem("codex.onboarded", "1"); } catch (e) { void e; } }, uid);
  const page = await ctx.newPage();
  const badResponses = [];
  const pageErrors = [];
  page.on("response", (r) => { if (r.url().includes("/api/") && !r.ok()) badResponses.push(`${r.status()} ${r.request().method()} ${new URL(r.url()).pathname}`); });
  page.on("pageerror", (e) => pageErrors.push(String(e)));

  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__home && window.__home.state, { timeout: 15000 });
  await sleep(1500); // human: reads the home screen
  await page.click('[data-track-tab="python"]');
  await sleep(1200);
  await page.click(`[data-lesson="${LESSON}"]`);
  await page.waitForFunction(() => window.__viz && window.__viz.ready, { timeout: 15000 });

  for (const [pos, cid] of [[1, "c1"], [2, "c2"], [3, "c3"], [4, "c4"]]) {
    await sleep(1800); // human: reads the card
    await page.locator("#qTyped").scrollIntoViewIfNeeded();
    await page.fill("#qTyped", RIGHT[cid]);
    await sleep(600);
    await page.click("#qCheck");
    await page.waitForSelector("#qVerdict", { state: "visible", timeout: 8000 });
    await sleep(1200); // human: reads the verdict
    await page.click('.grade-btn[data-g="3"]');
    await page.waitForFunction(() => window.__lastReview, { timeout: 8000 });
    await page.evaluate(() => { window.__lastReview = null; });
    await sleep(1200);
    const cta = await page.evaluate(() => document.querySelector("#btnNext")?.textContent?.trim() ?? "<none>");
    if (pos < 4) {
      assert(cta.includes("Следующая"), `card ${pos}: next-card CTA (got "${cta}")`);
      await page.click("#btnNext");
      await sleep(800);
    } else {
      assert(cta.includes("Завершить"), `card 4: finish CTA present (got "${cta}")`);
      await page.click("#btnNext");
    }
  }

  // The finish click must LAND: home re-renders with a hero and a fresh __home snapshot.
  await page.waitForFunction(() => window.__home && window.__home.state && document.querySelector("#hero"), { timeout: 15000 })
    .catch(() => { failed++; log("  ✗ FAIL: home never rendered after finish (silent fall)"); });
  const st = await page.evaluate(() => window.__home?.state ?? "<none>");
  assert(st !== "<none>", `after finish: home rendered, state="${st}"`);
  if (badResponses.length) log("  ! non-OK API responses: " + badResponses.join(" | "));
  else log("  · zero non-OK API responses (no 429 at human pace)");
  assert(pageErrors.length === 0, `0 page errors (got: ${pageErrors.join("; ") || "none"})`);
  await ctx.close();
}

async function main() {
  await preflight();
  const browser = await chromium.launch();
  for (const n of [1, 2, 3]) await run(browser, n);
  await browser.close();
  log(`\n==== FINISH-X3: ${failed === 0 ? "ALL GREEN (finish landed 3/3)" : failed + " FAILED"} ====`);
  process.exit(failed === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
