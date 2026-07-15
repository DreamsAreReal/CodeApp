/**
 * Evaluator's OWN F1b probe (independent of builder harnesses).
 * Asserts: (1) track chips render (2 groups, labels per brief decision);
 * (2) the lesson feed shows ONE track at a time; (3) switching to Python
 * swaps the feed; (4) the choice PERSISTS across a full reload;
 * (5) opening a C# lesson flips the persisted default back to csharp.
 */
import { chromium } from "playwright";

const APP = process.env.APP_BASE || "http://localhost:4173";
const RUN_USER = 700000 + Math.floor(Math.random() * 60000);
let failed = 0;
const assert = (c, m) => { if (c) console.log("  ✓ " + m); else { failed++; console.log("  ✗ FAIL: " + m); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const feedState = (page) => page.evaluate(() => {
  const chips = [...document.querySelectorAll("[data-track-tab]")].map((c) => ({
    id: c.getAttribute("data-track-tab"),
    text: c.textContent.trim(),
    active: c.classList.contains("active") || c.getAttribute("aria-pressed") === "true" || c.getAttribute("aria-selected") === "true",
  }));
  const lessons = [...document.querySelectorAll("[data-lesson]")].map((n) => n.getAttribute("data-lesson"));
  const stored = localStorage.getItem("codex.activeTrackGroup");
  return { chips, lessons, stored, home: window.__home };
});

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript((uid) => { try { localStorage.setItem("codex.devUserId", String(uid)); } catch (e) { void e; } }, RUN_USER);
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
page.on("pageerror", (e) => errs.push(String(e)));

await page.goto(APP, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__app?.ready && window.__home, { timeout: 15000 });

console.log("== fresh user: default state ==");
let s = await feedState(page);
assert(s.chips.length === 2, `2 track chips (got ${s.chips.length}: ${JSON.stringify(s.chips.map(c => c.text))})`);
assert(s.chips.some((c) => c.id === "csharp" && /Фундамент C#/.test(c.text)), "csharp chip labelled 'Фундамент C#'");
assert(s.chips.some((c) => c.id === "python" && /Python для AQA/.test(c.text)), "python chip labelled 'Python для AQA'");
const defaultActive = s.chips.find((c) => c.active)?.id;
assert(defaultActive === "csharp", `fresh user default = first group csharp (got ${defaultActive})`);
const py = (ls) => ls.filter((l) => l.startsWith("PY.")).length;
const cs = (ls) => ls.filter((l) => l.startsWith("T1.") || l.startsWith("T2.")).length;
assert(cs(s.lessons) > 0 && py(s.lessons) === 0, `feed shows ONLY C# lessons (cs=${cs(s.lessons)}, py=${py(s.lessons)})`);

console.log("== switch to python ==");
await page.click('[data-track-tab="python"]');
await sleep(400);
s = await feedState(page);
assert(s.chips.find((c) => c.id === "python")?.active, "python chip is now active");
assert(py(s.lessons) > 0 && cs(s.lessons) === 0, `feed shows ONLY PY lessons (py=${py(s.lessons)}, cs=${cs(s.lessons)})`);
assert(s.stored === "python", `choice persisted to localStorage (got ${s.stored})`);
console.log(`  PY lessons in feed: ${s.lessons.join(", ")}`);

console.log("== full reload: persistence ==");
await page.reload({ waitUntil: "networkidle" });
await page.waitForFunction(() => window.__app?.ready && window.__home, { timeout: 15000 });
s = await feedState(page);
assert(s.chips.find((c) => c.id === "python")?.active, "python still active after reload");
assert(py(s.lessons) > 0 && cs(s.lessons) === 0, `feed still ONLY PY after reload (py=${py(s.lessons)}, cs=${cs(s.lessons)})`);

console.log("== opening a C# lesson flips the default ==");
await page.click('[data-track-tab="csharp"]');
await sleep(300);
await page.click('[data-lesson="T1.M3.boxing"]');
await page.waitForFunction(() => window.__viz?.ready, { timeout: 15000 });
await page.goto(APP, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__app?.ready && window.__home, { timeout: 15000 });
const stored2 = await page.evaluate(() => localStorage.getItem("codex.activeTrackGroup"));
assert(stored2 === "csharp", `after opening C# lesson stored group = csharp (got ${stored2})`);

assert(errs.length === 0, `zero console/page errors (got ${errs.length}: ${errs.slice(0, 3).join(" | ")})`);
await browser.close();
console.log(failed === 0 ? "\n==== F1b EVAL: ALL GREEN ====" : `\n==== F1b EVAL: ${failed} FAILURES ====`);
process.exit(failed === 0 ? 0 : 1);
