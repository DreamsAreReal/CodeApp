/**
 * FINAL CONSUMER walk — a busy C# senior on a phone, fresh eyes, no docs.
 * Full daily-loop path against preview :4173 + live backend :5080, 390px:
 *   first-run onboarding -> start session -> card 1 -> answer -> grade
 *   -> NEXT card (assert session is CONTINUOUS + "N из M" grows) -> drain
 *   the whole queue -> land on "День закрыт" -> Progress tab -> Profile tab.
 * One PNG per meaningful screen into docs/evidence/final-consumer/.
 * Prints a fact log (counter values, continuity, console errors) for the human.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { evidenceDir } from "./_util.mjs";

const APP = process.env.APP_BASE || "http://localhost:4173";
// CI-portable evidence dir (no hardcoded path): $EVIDENCE_DIR/final-consumer on CI, else repo-relative.
const EV = evidenceDir("final-consumer");
const VP = { width: 390, height: 844 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (m) => console.log(m);
const RUN_USER = 770000 + Math.floor(Math.random() * 90000);

async function main() {
  mkdirSync(EV, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VP, deviceScaleFactor: 2 });
  // A brand-new device: set devUserId but do NOT set codex.onboarded -> first-run hero must show.
  await ctx.addInitScript((uid) => {
    try {
      localStorage.setItem("codex.devUserId", String(uid));
      localStorage.removeItem("codex.onboarded");
    } catch (e) { void e; }
  }, RUN_USER);
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  const shot = (n) => page.screenshot({ path: `${EV}/${n}.png`, fullPage: true });
  const shotV = (n) => page.screenshot({ path: `${EV}/${n}.png`, fullPage: false });

  // ---- 1) FIRST RUN (what a brand-new senior sees) ----------------------
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 20000 });
  await page.waitForFunction(() => window.__home && window.__home.state, { timeout: 20000 });
  const home0 = await page.evaluate(() => window.__home);
  log(`FIRST-RUN home: state=${home0.state} knownDue=${home0.knownDue} lessons=${home0.lessons.length}`);
  const heroTitle = await page.locator(".hero-title").first().textContent().catch(() => "");
  const ctaText = await page.locator("#heroCta").first().textContent().catch(() => "");
  log(`  hero title=${JSON.stringify(heroTitle?.trim())} cta=${JSON.stringify(ctaText?.trim())}`);
  await shot("01-first-run");

  // ---- 2) START THE SESSION (the daily loop, not one lesson) ------------
  // The first-run CTA opens a single lesson (onboarding). To exercise the CONTINUOUS
  // session (N из M) we start it the way the hero "Начать сессию" does: from the live due list.
  // Dismiss onboarding first (tap "Осмотреться") so the returning-user hero with the session CTA shows.
  const hasSkip = await page.locator("#onboardSkip").count();
  if (hasSkip) {
    log("  first-run: tapping 'Осмотреться' to reach the session hero");
    await page.locator("#onboardSkip").click();
    await page.waitForFunction(() => window.__home && window.__home.state && window.__home.state !== "first-run", { timeout: 10000 });
  }
  const home1 = await page.evaluate(() => window.__home);
  log(`RETURNING home: state=${home1.state} knownDue=${home1.knownDue}`);
  await shot("02-home-session-ready");

  // Start the real continuous session via the hero CTA.
  await page.locator("#heroCta").click();
  await page.waitForFunction(() => window.__session && window.__session.active, { timeout: 15000 });
  const s0 = await page.evaluate(() => window.__session);
  log(`SESSION START: active=${s0.active} position=${s0.position} total=${s0.total} current=${JSON.stringify(s0.current)}`);
  const M = s0.total;

  // ---- 3) DRAIN THE WHOLE QUEUE, card by card --------------------------
  const seenLessons = [];
  const positions = [];
  let guard = 0;
  let firstCardShot = false, secondCardShot = false;
  while (guard++ < 30) {
    await page.waitForFunction(() => window.__lesson, { timeout: 15000 });
    const sess = await page.evaluate(() => window.__session);
    positions.push(sess.position);
    const cur = sess.current;
    seenLessons.push(cur.lessonId + "/" + cur.cardId);
    const posLabel = await page.locator("#sessCount").textContent().catch(() => "(no counter)");
    log(`  CARD ${sess.position}/${sess.total}: ${cur.lessonId}/${cur.cardId}  counter="${(posLabel || "").trim()}"`);

    if (!firstCardShot) { await sleep(400); await shotV("03-card-1-prompt"); firstCardShot = true; }

    // answer the card (typed or MCQ) then reveal the verdict + grade buttons
    const typed = await page.locator("#qTyped").count();
    if (typed) {
      await page.locator("#qTyped").fill("123");
    } else {
      await page.locator(".opt").first().click();
    }
    // some cards ask a calibration "уверен?" before check
    const conf = await page.locator('[data-conf="1"]').count();
    if (conf) await page.locator('[data-conf="1"]').click();
    await page.locator("#qCheck").click();
    await page.waitForSelector('.grade-btn', { state: "visible", timeout: 10000 });

    if (sess.position === 1) { await sleep(300); await shotV("04-card-1-feedback"); }

    // confirm a grade -> unlocks the "Следующая карточка" / "Завершить сессию" primary
    const good = await page.locator('.grade-btn[data-g="3"]').count();
    await page.locator(good ? '.grade-btn[data-g="3"]' : '.grade-btn').first().click();
    await page.waitForSelector("#btnNext", { state: "visible", timeout: 10000 });
    const nextLabel = (await page.locator("#btnNext").textContent().catch(() => "")).trim();
    const review = await page.evaluate(() => window.__lastReview).catch(() => null);
    log(`    graded -> review interval=${review ? review.intervalDays : "?"}d, next-btn="${nextLabel}"`);

    // advance to the NEXT card (or finish)
    const before = sess.position;
    await page.locator("#btnNext").click();

    if (before < M) {
      // expect a next card with a HIGHER position, same session (continuity check)
      await page.waitForFunction((p) => window.__session && window.__session.active && window.__session.position > p, before, { timeout: 15000 }).catch(() => {});
      const after = await page.evaluate(() => window.__session);
      log(`    -> advanced: position ${before} -> ${after.position} (active=${after.active})`);
      if (!secondCardShot && after.position === 2) { await sleep(400); await shotV("05-card-2-continuous"); secondCardShot = true; }
    } else {
      // last card graded -> session drains -> home "День закрыт"
      await page.waitForFunction(() => window.__home && window.__home.state, { timeout: 15000 });
      break;
    }
  }

  // ---- 4) "День закрыт" close-out --------------------------------------
  const homeDone = await page.evaluate(() => window.__home);
  const sessAfter = await page.evaluate(() => window.__session);
  log(`AFTER DRAIN: home.state=${homeDone.state} knownDue=${homeDone.knownDue} session.active=${sessAfter.active} session.remaining=${sessAfter.remaining}`);
  const doneTitle = await page.locator(".hero-done .hero-title, .hero .hero-title").first().textContent().catch(() => "");
  log(`  done hero title=${JSON.stringify((doneTitle || "").trim())}`);
  await sleep(300);
  await shot("06-day-closed");

  // ---- 5) PROGRESS tab (via the real bottom-nav) -----------------------
  await page.locator('[data-nav="progress"]').click();
  await page.waitForFunction(() => window.__progress, { timeout: 10000 });
  const prog = await page.evaluate(() => window.__progress);
  log(`PROGRESS: ${JSON.stringify(prog).slice(0, 300)}`);
  await sleep(400);
  await shot("07-progress");

  // ---- 6) PROFILE tab ---------------------------------------------------
  await page.locator('[data-nav="profile"]').click();
  await page.waitForFunction(() => window.__profile, { timeout: 10000 });
  const prof = await page.evaluate(() => window.__profile);
  log(`PROFILE: ${JSON.stringify(prof).slice(0, 300)}`);
  await sleep(400);
  await shot("08-profile");

  // ---- summary ----------------------------------------------------------
  log("\n==== WALK SUMMARY ====");
  log("positions seen (should be 1..M strictly increasing): " + positions.join(","));
  const strictlyInc = positions.every((p, i) => i === 0 || p === positions[i - 1] + 1);
  const reachedM = positions.includes(M);
  log("continuity strictly increasing 1..M? " + strictlyInc + "  reached M=" + M + "? " + reachedM);
  log("cards drained: " + seenLessons.length + " -> " + seenLessons.join(" | "));
  log("landed on 'День закрыт' (state=done)? " + (homeDone.state === "done"));
  log("console/page errors: " + consoleErrors.length + (consoleErrors.length ? " -> " + JSON.stringify(consoleErrors.slice(0, 6)) : ""));
  await browser.close();
  log("DONE runUser=" + RUN_USER + " -> " + EV);
}
main().catch((e) => { console.error(e); process.exit(1); });
