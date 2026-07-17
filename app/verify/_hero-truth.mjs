/**
 * HERO-TRUTH probe (final-fix): the "Сессия на сегодня" hero must describe the lesson the
 * session ACTUALLY starts with. The session CTA runs the live due queue in backend order
 * (`ORDER BY (due IS NULL) DESC, due ASC, item_id ASC`), which diverges from the registry's
 * first-unfinished lesson once tracks mix (PY.* item ids sort before T1.*) — the pre-fix
 * hero lied ("Boxing и unboxing" headline, PY.M1 first card).
 *
 * Three learner states, each a REAL user against the live backend:
 *   run 1 — fresh user (nothing reviewed);
 *   run 2 — one lesson's cards fully graded;
 *   run 3 — two lessons' cards fully graded.
 * Each run asserts: hero title == title of the lesson the CTA opens (the queue's first card),
 * and the hero card count == the session's total. Evidence PNG per run.
 */
import { chromium } from "playwright";
import { evidenceDir, preflight } from "./_util.mjs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
const EV = evidenceDir("final-fix-hero");
const VP = { width: 390, height: 844 };

let failed = 0;
const log = (m) => console.log(m);
function assert(cond, msg) {
  if (cond) log("  ✓ " + msg);
  else {
    failed++;
    log("  ✗ FAIL: " + msg);
  }
}

const tokens = new Map();
async function tokenFor(uid) {
  if (tokens.has(uid)) return tokens.get(uid);
  const res = await fetch(API + "/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ devUserId: uid }),
  });
  const j = await res.json();
  tokens.set(uid, j.token);
  return j.token;
}
const apiGet = async (p, uid) =>
  (await fetch(API + p, { headers: { Authorization: `Bearer ${await tokenFor(uid)}` } })).json();
async function apiPost(p, body, uid) {
  return (
    await fetch(API + p, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await tokenFor(uid)}` },
      body: JSON.stringify(body),
    })
  ).json();
}

/** Grade every due card of `lessonId` Good — "one lesson passed" for the next state. */
async function passLesson(uid, lessonId) {
  const due = await apiGet("/api/due", uid);
  const mine = due.items.filter((it) => it.itemId.startsWith(lessonId + "/"));
  for (const it of mine) await apiPost("/api/review", { itemId: it.itemId, grade: 3 }, uid);
  return mine.length;
}

async function run(browser, label, uid, shot) {
  log(`\n== ${label} (devUserId=${uid}) ==`);
  // What the queue REALLY starts with, straight from the live API (ground truth).
  const due = await apiGet("/api/due", uid);
  const firstLessonId = due.items.length ? due.items[0].itemId.slice(0, due.items[0].itemId.lastIndexOf("/")) : null;
  log(`  queue: ${due.items.length} due, first item = ${due.items[0]?.itemId}`);

  const ctx = await browser.newContext({ viewport: VP, deviceScaleFactor: 1 });
  await ctx.addInitScript(
    ([id]) => {
      try {
        localStorage.setItem("codex.devUserId", String(id));
        localStorage.setItem("codex.onboarded", "1"); // skip first-run intro -> session hero
      } catch (e) {
        void e;
      }
    },
    [uid],
  );
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__home && window.__home.state, { timeout: 15000 });
  const hs = await page.evaluate(() => window.__home);
  assert(hs.state === "session", `home state = session (got "${hs.state}")`);

  const heroTitle = (await page.locator("#hero .hero-title").innerText()).trim();
  const heroMeta = (await page.locator("#hero .hero-meta").innerText()).trim();
  await page.screenshot({ path: `${EV}/${shot}`, fullPage: false });

  await page.locator("#heroCta").click();
  await page.waitForFunction(() => window.__lesson && window.__session && window.__session.active, { timeout: 15000 });
  const opened = await page.evaluate(() => ({
    lessonId: window.__lesson.id,
    title: document.querySelector(".lesson-body .lesson-title")?.textContent?.trim(),
    total: window.__session.total,
    position: window.__session.position,
    currentLesson: window.__session.current?.lessonId,
  }));
  log(`  hero: "${heroTitle}" · meta "${heroMeta}"`);
  log(`  CTA opened: ${opened.lessonId} ("${opened.title}") · session ${opened.position}/${opened.total}`);

  assert(opened.lessonId === firstLessonId, `opened lesson == queue's first item lesson (${firstLessonId})`);
  assert(heroTitle === opened.title, `hero title == first opened lesson title ("${heroTitle}")`);
  assert(heroMeta.includes(String(opened.total)), `hero card count ${hs.knownDue} == session total ${opened.total}`);
  assert(hs.knownDue === opened.total, `knownDue (${hs.knownDue}) == session total (${opened.total})`);
  assert(errors.length === 0, `0 page errors (got ${errors.length})`);
  await ctx.close();
}

async function main() {
  await preflight();
  const browser = await chromium.launch();
  const base = 910000 + Math.floor(Math.random() * 80000);

  // run 1 — fresh user
  await run(browser, "run 1: fresh user", base, "390-run1-fresh.png");

  // run 2 — one lesson passed (grade every card of the queue's current first lesson)
  const u2 = base + 1;
  const d2 = await apiGet("/api/due", u2);
  const first2 = d2.items[0].itemId.slice(0, d2.items[0].itemId.lastIndexOf("/"));
  log(`\n  [setup u2] passing lesson ${first2}: ${await passLesson(u2, first2)} cards graded`);
  await run(browser, "run 2: one lesson passed", u2, "390-run2-one-passed.png");

  // run 3 — two lessons passed
  const u3 = base + 2;
  for (let i = 0; i < 2; i++) {
    const d3 = await apiGet("/api/due", u3);
    const first3 = d3.items[0].itemId.slice(0, d3.items[0].itemId.lastIndexOf("/"));
    log(`\n  [setup u3] passing lesson ${first3}: ${await passLesson(u3, first3)} cards graded`);
  }
  await run(browser, "run 3: two lessons passed", u3, "390-run3-two-passed.png");

  await browser.close();
  if (failed > 0) {
    log(`\nHERO-TRUTH: ${failed} FAILED`);
    process.exit(1);
  }
  log("\nHERO-TRUTH: ALL GREEN (hero title == first opened lesson, x3 states)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
