/**
 * Evaluator's OWN G1 probe on a NEW lesson (PY.M6.generators): a full loop tact
 * as a user — open home -> python chip -> lesson -> TYPE the real stdout for c1
 * -> verdict -> Good -> POST /api/review -> due count drops -> RELOAD -> the
 * schedule effect persists (c1 still gone from /api/due on a fresh page load).
 */
import { chromium } from "playwright";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = "http://localhost:5080";
const RUN_USER = 810000 + Math.floor(Math.random() * 60000);
let failed = 0;
const assert = (c, m) => { if (c) console.log("  ✓ " + m); else { failed++; console.log("  ✗ FAIL: " + m); } };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript((uid) => { try { localStorage.setItem("codex.devUserId", String(uid)); } catch (e) { void e; } }, RUN_USER);
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
page.on("pageerror", (e) => errs.push(String(e)));

let apiToken = null;
async function mintToken() {
  const res = await fetch(API + "/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ devUserId: RUN_USER }) });
  apiToken = (await res.json()).token;
}
const apiGet = async (p) => (await fetch(API + p, { headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {} })).json();

await mintToken();
await page.goto(APP, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__app?.ready && window.__home, { timeout: 15000 });

console.log("== user path: home -> python chip -> PY.M6.generators ==");
await page.click('[data-track-tab="python"]');
await page.click('[data-lesson="PY.M6.generators"]');
await page.waitForFunction(() => window.__viz?.ready && window.__lesson?.id === "PY.M6.generators", { timeout: 15000 });
assert(true, "lesson opened from the home feed (not a scripted deep link)");

const before = await apiGet("/api/due");
assert(before.items.some((i) => i.itemId === "PY.M6.generators/c1"), "generators/c1 is due before review");
const countBefore = before.count;

console.log("== ACT: type the real python3.12 stdout for c1 ==");
assert(await page.locator("#qTyped").count() === 1, "typed-answer input rendered (generation, not MCQ)");
await page.locator("#qTyped").scrollIntoViewIfNeeded();
await page.fill("#qTyped", "created\nstart\n1\nmiddle\n2"); // my own python3.12 rerun of PY.M6_c1.py
await page.click("#qCheck");
await page.waitForSelector("#qVerdict", { state: "visible", timeout: 8000 });
const ans = await page.evaluate(() => window.__lastAnswer);
assert(ans?.correct === true, "exact stdout graded objectively correct");
assert(await page.locator('.grade-btn[data-g="3"].preselected').count() === 1, "Good pre-selected after correct");
await page.click('.grade-btn[data-g="3"]');
await page.waitForFunction(() => window.__lastReview?.itemId === "PY.M6.generators/c1", { timeout: 8000 });
const review = await page.evaluate(() => window.__lastReview);
console.log("  review response: " + JSON.stringify(review));
assert(review.grade === "Good" && review.state === "Learning" && review.reps === 1, "FSRS state created (Good, Learning, reps=1)");

console.log("== OBSERVE: due queue moved ==");
const after = await apiGet("/api/due");
assert(after.count === countBefore - 1, `due count dropped ${countBefore} -> ${after.count}`);
assert(!after.items.some((i) => i.itemId === "PY.M6.generators/c1"), "generators/c1 left the due queue");

console.log("== PERSIST: full reload, fresh page -> effect survives ==");
await page.goto(APP, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__app?.ready && window.__home, { timeout: 15000 });
const afterReload = await apiGet("/api/due");
assert(afterReload.count === countBefore - 1, `due count still ${afterReload.count} after reload`);
assert(!afterReload.items.some((i) => i.itemId === "PY.M6.generators/c1"), "c1 still scheduled out after reload (persisted server-side)");

assert(errs.length === 0, `zero console/page errors (got ${errs.length}: ${errs.slice(0, 3).join(" | ")})`);
await browser.close();
console.log(failed === 0 ? `\n==== G1 EVAL (PY.M6): ALL GREEN · user=${RUN_USER} ====` : `\n==== G1 EVAL: ${failed} FAILURES ====`);
process.exit(failed === 0 ? 0 : 1);
