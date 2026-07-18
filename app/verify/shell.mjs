/**
 * Headless verification for the new shell screens — Progress + Profile + shared nav.
 * Reuses run.mjs's browser/dev-auth setup. Against preview :4173 + the live backend it:
 *   (a) loads Home,
 *   (b) seeds real reviews via /api/review, clicks the Progress tab
 *       -> asserts window.__progress is populated + every key section present,
 *   (c) clicks the Profile tab -> asserts window.__profile populated (identity + settings),
 *   (d) toggles reduce-motion -> asserts the <html> class flips + persists,
 *   (e) exercises the empty-Progress state for a brand-new user,
 *   (f) asserts ZERO console/page errors across the whole run.
 * Writes evidence PNGs under docs/evidence/shell.
 */
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { evidenceDir, preflight } from "./_util.mjs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
// CI-portable evidence dir: $EVIDENCE_DIR/shell on CI, else repo-relative (no hardcoded path).
const EV = evidenceDir("shell");
const RUN_USER = 810000 + Math.floor(Math.random() * 80000);
const EMPTY_USER = 890000 + Math.floor(Math.random() * 9000);
const COMPLETE_USER = 870000 + Math.floor(Math.random() * 9000);

const VIEWPORTS = {
  375: { width: 375, height: 812 },
  390: { width: 390, height: 844 },
  768: { width: 768, height: 1024 },
  1440: { width: 1440, height: 900 },
};

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

/**
 * Run an axe-core scan (WCAG 2.0/2.1 level A + AA) on the current page state and FAIL
 * the harness on any serious/critical violation. We scan the live #app screen (not a
 * static fixture) so contrast, names/roles and focus are checked on the real render.
 */
async function axeScan(page, label, { scope = "#app" } = {}) {
  // scope "#app" scans the live app screen (contrast/names/roles on the real render);
  // scope "document" scans the WHOLE page so document-level rules — html-has-lang,
  // document-title, landmark-one-main, region — are actually exercised (they are not
  // reachable when the scan is scoped to #app).
  let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]);
  if (scope === "#app") builder = builder.include("#app");
  const results = await builder.analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  if (blocking.length === 0) {
    log(`  ✓ axe ${label}: 0 serious/critical (${results.passes.length} checks passed)`);
  } else {
    failed++;
    log(`  ✗ FAIL: axe ${label}: ${blocking.length} serious/critical violation(s)`);
    for (const v of blocking) {
      const nodes = v.nodes.slice(0, 4).map((n) => n.target.join(" ")).join(" | ");
      log(`      [${v.impact}] ${v.id} — ${v.help}`);
      log(`        help: ${v.helpUrl}`);
      log(`        at: ${nodes}`);
    }
  }
  return blocking;
}

// The data API now requires a Bearer session token (IDOR fix). Each user gets its own token
// from POST /api/auth {devUserId}; the token is passed on every subsequent call and userId
// is server-derived. tokenFor(user) mints (and caches) that user's token.
const tokens = new Map();
async function tokenFor(devUserId) {
  if (tokens.has(devUserId)) return tokens.get(devUserId);
  const res = await fetch(API + "/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ devUserId }),
  });
  const j = await res.json();
  tokens.set(devUserId, j.token);
  return j.token;
}
const apiGet = async (p, user) =>
  (await fetch(API + p, { headers: { Authorization: `Bearer ${await tokenFor(user)}` } })).json();
async function apiPost(p, body, user) {
  const headers = { "Content-Type": "application/json" };
  if (user !== undefined) headers.Authorization = `Bearer ${await tokenFor(user)}`;
  return (await fetch(API + p, { method: "POST", headers, body: JSON.stringify(body) })).json();
}

/** Dev-auth `user` and grade several distinct due items with varied grades (real data). */
async function seed(user) {
  await tokenFor(user); // mints the token via /api/auth
  const due = await apiGet(`/api/due`, user);
  const grades = [3, 4, 3, 1, 2]; // Good / Easy / Good / Again / Hard -> real grade mix + a lapse
  const items = due.items.slice(0, grades.length);
  for (let i = 0; i < items.length; i++) {
    await apiPost("/api/review", { itemId: items[i].itemId, grade: grades[i] }, user);
  }
  return items.length;
}

async function main() {
  await preflight();

  const seeded = await seed(RUN_USER);
  log(`seeded ${seeded} reviews for runUser=${RUN_USER}`);
  // Confirm the backend itself reflects the seed (numbers are real, not UI-invented).
  const prog = await apiGet(`/api/progress`, RUN_USER);
  assert(prog.reviewsTotal === seeded, `backend reviewsTotal=${prog.reviewsTotal} matches seeded ${seeded}`);
  assert(prog.gradeMix.again >= 1, "backend recorded an Again grade (lapse path)");

  const browser = await chromium.launch();
  const consoleErrors = [];

  async function newCtx(uid, opts = {}) {
    const ctx = await browser.newContext({ viewport: VIEWPORTS[390], deviceScaleFactor: 1, ...opts });
    await ctx.addInitScript((id) => {
      try {
        localStorage.setItem("codex.devUserId", String(id));
        localStorage.removeItem("codex.reducedMotion");
      } catch (e) {
        void e;
      }
    }, uid);
    return ctx;
  }
  function watch(page) {
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text());
    });
    page.on("pageerror", (e) => consoleErrors.push(String(e)));
  }

  // ===================== (a) Home loads =====================
  log("\n== (a) home loads + shared nav ==");
  const ctx = await newCtx(RUN_USER);
  const page = await ctx.newPage();
  watch(page);
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__home && typeof window.__home.userId === "number", { timeout: 15000 });
  const home = await page.evaluate(() => window.__home);
  assert(home.userId === RUN_USER, "home authed as runUser");
  const navCount = await page.locator("nav.nav [data-nav]").count();
  assert(navCount === 3, "shared nav renders 3 tabs (got " + navCount + ")");
  const homeActive = await page.locator('nav.nav .tab.active [aria-hidden], nav.nav .tab.active').first().isVisible();
  assert(homeActive, "a nav tab is marked active on home");
  await page.screenshot({ path: `${EV}/390-home.png`, fullPage: true });
  // a11y: scan the Home screen (WCAG A + AA) — fail on serious/critical. Let the gentle
  // screen-enter fade settle first so axe measures the FINAL (fully-opaque) frame, not a
  // transient mid-fade one (opacity < 1 momentarily lowers computed text contrast).
  await sleep(320);
  await axeScan(page, "Home");
  // Document-level a11y: scan the WHOLE page (not scoped to #app) so html-has-lang,
  // document-title, landmark-one-main and region rules are exercised. index.html sets
  // <html lang="ru">, a meaningful <title>, a skip-link and role="main" on #app to satisfy them.
  await axeScan(page, "Document (html-lang/title/landmarks)", { scope: "document" });

  // ===================== (b) Progress tab =====================
  log("\n== (b) Progress tab -> populated dashboard ==");
  await page.click('nav.nav [data-nav="progress"]');
  await page.waitForFunction(() => window.__progress && window.__progress.empty === false, { timeout: 15000 });
  const pg = await page.evaluate(() => window.__progress);
  log("  __progress: " + JSON.stringify(pg));
  assert(pg.userId === RUN_USER, "progress fetched for runUser");
  assert(pg.reviewsTotal === seeded, `progress reviewsTotal=${pg.reviewsTotal} == seeded ${seeded}`);
  assert(pg.xp === seeded * 10, `xp=${pg.xp} == reviews*10`);
  assert(pg.cards && pg.cards.total > 0, "cards.total present (catalog size)");
  assert(pg.gradeMix.again + pg.gradeMix.hard + pg.gradeMix.good + pg.gradeMix.easy === seeded, "grade mix sums to reviews");
  assert(pg.activityDays === 28, "activity has 28 days (heatmap)");
  assert(pg.upcomingDays === 7, "upcoming has 7 days (forward FSRS)");
  assert(pg.perLesson > 0, "per-lesson list is non-empty");
  assert(Array.isArray(pg.sections) && ["mastery", "completion", "gradeMix", "heatmap", "upcoming", "perLesson"].every((s) => pg.sections.includes(s)), "all 6 progress sections declared (incl. completion)");
  // honest completion rollup is present (seeded reviews did NOT touch lesson-viewing yet)
  assert(typeof pg.lessonsTotal === "number" && pg.lessonsTotal > 0, "lessonsTotal present");
  assert(pg.lessonsCompleted === 0, "lessonsCompleted starts at 0 (reviews != lesson viewing)");
  assert(pg.segmentsViewed === 0, "segmentsViewed starts at 0 for a review-only user (honest)");
  // the DOM actually rendered those sections
  assert(await page.locator(".mastery .ring-lg").count() === 1, "overall mastery ring rendered");
  assert(await page.locator(".gm-bar").count() === 1, "grade-mix bar rendered");
  assert(await page.locator(".heat-grid .heat-cell").count() === 28, "heatmap rendered 28 cells");
  assert(await page.locator(".up-list .up-row").count() === 7, "upcoming rendered 7 rows");
  assert(await page.locator(".lesson-list .topic[data-lesson]").count() > 0, "per-lesson mastery rows rendered");
  // completion section: 3 metrics (Тем пройдено / Начато / Шагов) rendered
  assert(await page.locator(".card").filter({ hasText: "Тем пройдено" }).count() === 1, "completion section rendered (Тем пройдено)");
  const activeProg = await page.locator('nav.nav [data-nav="progress"]').getAttribute("class");
  assert(activeProg.includes("active"), "Progress nav tab is active on the Progress screen");
  // a11y: scan the populated Progress dashboard (rings, grade-mix, heatmap, per-lesson).
  await sleep(320); // let the screen-enter fade settle before measuring contrast (see Home note)
  await axeScan(page, "Progress");
  for (const vp of [375, 768, 1440]) {
    await page.setViewportSize(VIEWPORTS[vp]);
    await sleep(250);
    await page.screenshot({ path: `${EV}/${vp}-progress.png`, fullPage: true });
  }
  await page.setViewportSize(VIEWPORTS[390]);

  // tapping a lesson row opens that lesson (router.showLesson)
  const lessonId = await page.locator(".lesson-list .topic[data-lesson]").first().getAttribute("data-lesson");
  await page.click(".lesson-list .topic[data-lesson]");
  await page.waitForFunction((id) => window.__lesson && window.__lesson.id === id, lessonId, { timeout: 15000 });
  assert(true, "per-lesson row opened lesson " + lessonId);
  // a11y: scan the opened lesson (close/back button, animated segment controls, MCQ, grade strip).
  await page.waitForFunction(() => window.__viz && window.__viz.ready, { timeout: 15000 });
  await sleep(300);
  await axeScan(page, "Lesson (" + lessonId + ")");
  // close the lesson -> home, then hop back to Progress via the shared nav
  await page.click("#btnClose");
  await page.waitForFunction(() => window.__home && typeof window.__home.userId === "number", { timeout: 15000 });
  await page.click('nav.nav [data-nav="progress"]');
  await page.waitForFunction(() => window.__progress && window.__progress.empty === false, { timeout: 15000 });

  // ===================== (c) Profile tab =====================
  log("\n== (c) Profile tab -> identity + settings ==");
  await page.click('nav.nav [data-nav="profile"]');
  await page.waitForFunction(() => window.__profile && typeof window.__profile.userId === "number", { timeout: 15000 });
  const prof = await page.evaluate(() => window.__profile);
  log("  __profile: " + JSON.stringify(prof));
  assert(prof.userId === RUN_USER, "profile fetched for runUser");
  assert(prof.mode === "dev", "profile shows dev mode (no Telegram context)");
  assert(prof.summary.reviews === seeded, "profile summary reviews match backend");
  assert(prof.version === "0.1.0", "about version constant present");
  assert(Array.isArray(prof.sections) && ["identity", "summary", "howItWorks", "settings", "danger", "about"].every((s) => prof.sections.includes(s)), "all 6 profile sections declared");
  assert(await page.locator(".pf-id .pf-avatar").count() === 1, "identity avatar rendered (initials fallback)");
  assert(await page.locator(".pf-how .pf-how-body").count() === 1, "FSRS 'how it works' exhibit rendered");
  assert(await page.locator("#rmToggle").count() === 1, "reduce-motion toggle rendered");
  assert(await page.locator("#resetBtn").count() === 1, "reset-progress action rendered");
  const activeProf = await page.locator('nav.nav [data-nav="profile"]').getAttribute("class");
  assert(activeProf.includes("active"), "Profile nav tab is active on the Profile screen");
  await page.screenshot({ path: `${EV}/390-profile.png`, fullPage: true });

  // ===================== (d) reduce-motion toggle flips the class =====================
  log("\n== (d) reduce-motion toggle flips the <html> class + persists ==");
  const before = await page.evaluate(() => document.documentElement.classList.contains("reduced-motion"));
  assert(before === false, "reduced-motion off initially");
  await page.click("#rmToggle");
  await sleep(120);
  const after = await page.evaluate(() => document.documentElement.classList.contains("reduced-motion"));
  assert(after === true, "reduced-motion class ON after toggle");
  const persisted = await page.evaluate(() => localStorage.getItem("codex.reducedMotion"));
  assert(persisted === "1", "preference persisted to localStorage (=1)");
  const ariaOn = await page.locator("#rmToggle").getAttribute("aria-checked");
  assert(ariaOn === "true", "toggle aria-checked reflects ON");
  await page.screenshot({ path: `${EV}/390-profile-reduced.png`, fullPage: true });
  // toggle back off
  await page.click("#rmToggle");
  await sleep(120);
  const back = await page.evaluate(() => document.documentElement.classList.contains("reduced-motion"));
  assert(back === false, "reduced-motion class OFF after second toggle");

  // reset flow reaches the double-confirm final step (guarded), then cancel (no wipe here)
  await page.click("#resetBtn");
  await page.waitForSelector("#resetNext", { timeout: 5000 });
  await page.click("#resetNext");
  await page.waitForSelector("#resetGo", { timeout: 5000 });
  assert(await page.locator("#resetGo").count() === 1, "reset is double-confirmed (two steps before delete)");
  await page.click("#resetCancel2");
  await page.waitForSelector("#resetBtn", { timeout: 5000 });
  assert(await page.locator("#resetBtn").count() === 1, "cancel returns to the guarded initial state");

  // ===================== (e) empty Progress state =====================
  log("\n== (e) brand-new user sees a tasteful empty Progress state ==");
  const ctx2 = await newCtx(EMPTY_USER);
  const page2 = await ctx2.newPage();
  watch(page2);
  await page2.goto(APP, { waitUntil: "networkidle" });
  await page2.waitForFunction(() => window.__home && typeof window.__home.userId === "number", { timeout: 15000 });
  await page2.click('nav.nav [data-nav="progress"]');
  await page2.waitForFunction(() => window.__progress && window.__progress.empty === true, { timeout: 15000 });
  const emptyState = await page2.evaluate(() => window.__progress);
  assert(emptyState.empty === true && emptyState.reviewsTotal === 0, "empty Progress state for 0-review user");
  assert(await page2.locator(".empty #toLearn").count() === 1, "empty state offers a link back to Learn");
  await page2.screenshot({ path: `${EV}/390-progress-empty.png`, fullPage: true });
  await page2.click(".empty #toLearn");
  await page2.waitForFunction(() => window.__home && typeof window.__home.userId === "number", { timeout: 15000 });
  assert(true, "empty-state CTA returns to Learn");

  // ===================== (g) lesson completion is tracked + reported =====================
  log("\n== (g) open a lesson -> complete it -> POSTs lesson-progress -> /api/progress + home reflect it ==");
  const ctx3 = await newCtx(COMPLETE_USER);
  const page3 = await ctx3.newPage();
  watch(page3);
  await page3.goto(APP, { waitUntil: "networkidle" });
  await page3.waitForFunction(() => window.__home && typeof window.__home.userId === "number", { timeout: 15000 });
  // baseline: brand-new user, nothing completed / viewed
  const homeBefore = await page3.evaluate(() => window.__home);
  assert(homeBefore.lessonsCompleted === 0, "home baseline: 0 lessons completed");
  assert(homeBefore.segmentsViewed === 0, "home baseline: 0 segments viewed");
  const progBefore = await apiGet(`/api/progress`, COMPLETE_USER);
  assert(progBefore.lessonsCompleted === 0 && progBefore.segmentsViewed === 0, "backend baseline: nothing viewed");

  // open value-types-copy (6 segments) and view all of them, then answer + grade
  const VTC_C1_EXPECT = "a=(1,2) b=(99,2)"; // value-types-copy/c1 verify.expect (real dotnet stdout)
  await page3.evaluate(() => window.__app.openLesson("CS.S1.value-types-copy"));
  await page3.waitForFunction(() => window.__viz && window.__viz.ready && window.__lesson && window.__lesson.id === "CS.S1.value-types-copy", { timeout: 15000 });
  const total = await page3.evaluate(() => window.__lesson.segments);
  assert(total === 6, "value-types-copy has 6 segments (segmentsTotal)");
  await page3.evaluate(() => window.__viz.forcePlayAll()); // marks every segment seen -> partial reports
  await sleep(600); // let the debounced partial report flush
  // answer correctly by TYPING the real expected output, tap "уверен", grade Good ->
  // completion report fires (typed generation flow, not MCQ)
  assert(await page3.locator("#qTyped").count() === 1, "value-types-copy card renders typed-answer input (generation)");
  await page3.locator("#qTyped").scrollIntoViewIfNeeded();
  await page3.fill("#qTyped", VTC_C1_EXPECT);
  await page3.click('[data-conf="1"]'); // calibration: уверен
  await page3.click("#qCheck");
  await page3.waitForSelector("#qVerdict", { state: "visible", timeout: 8000 });
  const vtcAnswer = await page3.evaluate(() => window.__lastAnswer);
  assert(vtcAnswer.correct === true && vtcAnswer.confidence === true, "typed ✓ + confidence captured (right+sure = well-calibrated)");
  assert(await page3.locator('.grade-btn[data-g="3"].preselected').count() === 1, "correct -> Good (3) pre-selected");
  await page3.click('.grade-btn[data-g="3"]');
  await page3.waitForFunction(() => window.__lastReview, { timeout: 8000 });
  // wait for the completion report to reach the client hook
  await page3.waitForFunction(
    () => window.__lessonProgress && window.__lessonProgress.completed === true && window.__lessonProgress.lessonId === "CS.S1.value-types-copy",
    { timeout: 8000 },
  );
  const lprog = await page3.evaluate(() => window.__lessonProgress);
  log("  __lessonProgress: " + JSON.stringify(lprog));
  assert(lprog.completed === true, "client saw completion report (completed=true)");
  assert(lprog.segmentsSeen === 6 && lprog.segmentsTotal === 6, "completion report is 6/6 segments");

  // the SERVER now shows the lesson completed + segments seen (real, persisted)
  const progAfter = await apiGet(`/api/progress`, COMPLETE_USER);
  assert(progAfter.lessonsCompleted >= 1, `/api/progress lessonsCompleted>=1 (got ${progAfter.lessonsCompleted})`);
  assert(progAfter.segmentsViewed >= 6, `/api/progress segmentsViewed>=6 (got ${progAfter.segmentsViewed})`);
  const vtcRow = progAfter.perLesson.find((l) => l.lessonId === "CS.S1.value-types-copy");
  assert(vtcRow && vtcRow.completed === true, "per-lesson value-types-copy.completed=true on the server");
  assert(vtcRow.segmentsSeen === 6, "per-lesson value-types-copy.segmentsSeen=6 on the server");

  // returning home reflects it HONESTLY: 1 lesson completed, and value-types-copy shows completed
  await page3.evaluate(() => window.__app.showHome());
  await page3.waitForFunction(() => window.__home && window.__home.lessonsCompleted >= 1, { timeout: 8000 });
  const homeAfter = await page3.evaluate(() => window.__home);
  assert(homeAfter.lessonsCompleted >= 1, `home shows lessonsCompleted>=1 (got ${homeAfter.lessonsCompleted})`);
  assert(homeAfter.segmentsViewed >= 6, "home shows segments viewed after completion");
  const homeVtc = homeAfter.lessons.find((l) => l.id === "CS.S1.value-types-copy");
  assert(homeVtc.completed === true, "home per-lesson value-types-copy.completed=true (honest, not 'not due')");
  assert(homeVtc.viewPct === 100, "home value-types-copy viewPct=100 (segments viewed, honest)");
  // honesty guard: a lesson the user only reviewed a card for (not viewed) must NOT be 'completed'
  const anyOverstated = homeAfter.lessons.some((l) => l.completed && l.viewPct < 100);
  assert(!anyOverstated, "no lesson is marked completed without 100% segments viewed (never overstates)");
  await page3.click('nav.nav [data-nav="progress"]');
  await page3.waitForFunction(() => window.__progress && window.__progress.empty === false, { timeout: 15000 });
  const pgAfter = await page3.evaluate(() => window.__progress);
  assert(pgAfter.lessonsCompleted >= 1, "Progress screen shows lessonsCompleted>=1");
  // calibration is PERSISTED end-to-end: the typed ✓ + "уверен" tap was recorded and surfaces
  // as a real calibration stat on the Progress dashboard (right+sure = well-calibrated = 100%).
  assert(pgAfter.calibration && pgAfter.calibration.answered === 1, "calibration persisted: 1 confidence-rated answer");
  assert(pgAfter.calibration.wellCalibrated === 1 && pgAfter.calibration.overconfident === 0, "right+sure counted as well-calibrated");
  assert(pgAfter.calibrationPct === 100, "calibration stat = 100% (the one answer was well-calibrated)");
  assert(Array.isArray(pgAfter.sections) && pgAfter.sections.includes("calibration"), "Progress declares a calibration section");
  assert(await page3.locator(".sec-label").filter({ hasText: "Калибровка" }).count() === 1, "calibration section label rendered on the Progress screen");
  assert(await page3.locator(".calib-stat .ring-lg .pct").count() === 1, "calibration ring (with %) rendered");
  const calibRingTxt = await page3.locator(".calib-stat .ring-lg .pct").innerText();
  assert(calibRingTxt.trim() === "100%", `calibration ring shows 100% (got "${calibRingTxt.trim()}")`);
  await page3.screenshot({ path: `${EV}/390-progress-completed.png`, fullPage: true });

  // ===================== (f) console errors gate =====================
  log("\n== (f) console errors ==");
  assert(consoleErrors.length === 0, "zero console/page errors across the run" + (consoleErrors.length ? " -> " + JSON.stringify(consoleErrors.slice(0, 5)) : ""));

  await browser.close();
  log(`\n==== ${failed === 0 ? "ALL GREEN" : failed + " FAILED"} · runUser=${RUN_USER} emptyUser=${EMPTY_USER} completeUser=${COMPLETE_USER} ====`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
