/**
 * Evidence screenshots for the copy/voice + engagement + P2 polish wave (390px).
 * Captures, against preview :4173 + the live backend:
 *   - home-session : session hero (leading "N карточек" split from the topic-progress block;
 *                    minutes scale with the card count).
 *   - done         : "День закрыт" reached via __forceHomeHero on a REAL session user, showing
 *                    the streak forward-hook + the optional "Взять свежий урок" secondary CTA,
 *                    with NO "Активна" pill on the path (knownDue==0).
 *   - empty-all    : "Фундамент пройден целиком" with the completion seal medallion.
 *   - card-grade   : a graded card showing the "+10 XP" review burst next to the saved line.
 *   - progress     : the progress dashboard (terms: Серия / Закреплено / XP).
 *   - profile      : the profile (soft "Управление данными" danger label).
 *
 * Writes to docs/evidence/polish-copy/390-*.png for human review.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { evidenceDir } from "./_util.mjs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
// CI-portable evidence dir (no hardcoded path): $EVIDENCE_DIR/polish-copy on CI, else repo-relative.
const EV = evidenceDir("polish-copy");
const VP = { width: 390, height: 844 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FRESH = () => 860000 + Math.floor(Math.random() * 90000);
const log = (m) => console.log(m);

async function main() {
  mkdirSync(EV, { recursive: true });
  const browser = await chromium.launch();

  async function ctxFor(uid, onboarded = true) {
    const ctx = await browser.newContext({ viewport: VP, deviceScaleFactor: 2 });
    await ctx.addInitScript(
      ([id, ob]) => {
        try {
          localStorage.setItem("codex.devUserId", String(id));
          if (ob) localStorage.setItem("codex.onboarded", "1");
        } catch (e) {
          void e;
        }
      },
      [uid, onboarded],
    );
    return ctx;
  }

  async function answerAndGrade(page) {
    await page.waitForFunction(() => window.__lesson, { timeout: 15000 });
    if (await page.locator("#qTyped").count()) {
      await page.locator("#qTyped").fill("42");
      await page.click("#qCheck");
    } else {
      await page.locator(".opt").first().click();
      await page.click("#qCheck");
    }
    await page.waitForSelector('.grade-btn[data-g="3"]', { timeout: 8000 });
    await page.click('.grade-btn[data-g="3"]');
    await page.waitForSelector("#btnNext", { timeout: 8000 });
  }

  // ---- home-session ----
  log("home-session");
  const uA = FRESH();
  const cA = await ctxFor(uA);
  const pA = await cA.newPage();
  await pA.goto(APP, { waitUntil: "networkidle" });
  await pA.waitForFunction(() => window.__home && window.__home.state === "session", { timeout: 15000 });
  await sleep(600);
  await pA.screenshot({ path: `${EV}/390-home-session.png`, fullPage: true });

  // ---- done (forced hero on the FRESH user): freshLessonId is set (unseen lessons remain), so the
  //       optional "Взять свежий урок" secondary CTA + the streak forward-hook are both visible.
  //       This is the real render path with the live context — only the hero slot is swapped. ----
  log("done (forced hero, fresh CTA visible)");
  await pA.evaluate(() => window.__forceHomeHero("done"));
  await sleep(400);
  const fFresh = await pA.evaluate(() => !!document.querySelector("#heroFresh"));
  const fComeback = await pA.evaluate(() => document.querySelector(".done-comeback")?.textContent?.trim());
  log(`  done(forced): heroFresh=${fFresh} · come-back=${JSON.stringify(fComeback)}`);
  await pA.screenshot({ path: `${EV}/390-done.png`, fullPage: true });

  // ---- done pill proof: drain the WHOLE due session so 'День закрыт' is reached NATURALLY
  //       (knownDue==0) — the only faithful test that the "Активна" pill is hidden on the path.
  //       Reload first to restore the REAL session hero (the forced hero swapped the slot). ----
  log("done (natural, drained session -> pill hidden proof)");
  await pA.reload({ waitUntil: "networkidle" });
  await pA.waitForFunction(() => window.__home && window.__home.state === "session", { timeout: 15000 });
  await pA.click("#heroCta");
  await pA.waitForFunction(() => window.__session, { timeout: 15000 });
  for (let i = 0; i < 20; i++) {
    const s = await pA.evaluate(() => window.__session);
    if (!s || !s.active) break;
    await answerAndGrade(pA);
    await pA.click("#btnNext");
    await sleep(250);
  }
  await pA.waitForFunction(() => window.__home && window.__home.state === "done", { timeout: 15000 });
  await sleep(500);
  const donePill = await pA.evaluate(() => document.querySelectorAll(".path .pill").length);
  const knownDue = await pA.evaluate(() => window.__home.knownDue);
  const comeback = await pA.evaluate(() => document.querySelector(".done-comeback")?.textContent?.trim());
  log(`  done(natural): knownDue=${knownDue} · .path pill count=${donePill} (expect 0) · come-back=${JSON.stringify(comeback)}`);
  await pA.screenshot({ path: `${EV}/390-done-natural.png`, fullPage: true });

  // ---- empty-all (seal): reachable only by forcing the hero (a live backend can't produce a
  //       no-activity all-viewed day in one session). The seal medallion is the evidence. ----
  log("empty-all");
  await pA.evaluate(() => window.__forceHomeHero("empty-all"));
  await sleep(400);
  const seal = await pA.evaluate(() => !!document.querySelector(".hero-sealed .done-seal"));
  log("  empty-all: sealed seal present = " + seal);
  await pA.screenshot({ path: `${EV}/390-empty-all.png`, fullPage: true });

  // ---- card-grade (XP burst) ----
  log("card-grade");
  const uB = FRESH();
  const cB = await ctxFor(uB);
  const pB = await cB.newPage();
  await pB.goto(APP, { waitUntil: "networkidle" });
  await pB.waitForFunction(() => window.__home && window.__home.state, { timeout: 15000 });
  await pB.evaluate(() => window.__app.openLesson("T1.M2.value-vs-reference"));
  await answerAndGrade(pB);
  await sleep(500);
  const xpBurst = await pB.evaluate(() => {
    const el = document.querySelector("#gradeXp");
    return { hidden: el?.hasAttribute("hidden"), text: el?.textContent?.trim() };
  });
  log("  card-grade: XP burst = " + JSON.stringify(xpBurst));
  // scroll the grade strip into view for the shot
  await pB.evaluate(() => document.querySelector("#gradeDone")?.scrollIntoView({ block: "center" }));
  await sleep(300);
  await pB.screenshot({ path: `${EV}/390-card-grade.png`, fullPage: true });
  // tight clip of the grade strip so the "+10 XP" burst is legible in review
  const gradeEl = pB.locator("#grade");
  await gradeEl.scrollIntoViewIfNeeded();
  await sleep(200);
  await gradeEl.screenshot({ path: `${EV}/390-card-grade-clip.png` });

  // return home from the lesson (the nav bar lives on home/progress/profile, not in the runner)
  await pB.click("#btnNext");
  await pB.waitForFunction(() => window.__home && window.__home.state, { timeout: 15000 });
  await sleep(300);

  // ---- progress ----
  log("progress");
  await pB.locator('[data-nav="progress"]').click();
  await pB.waitForFunction(() => window.__progress && window.__progress.empty === false, { timeout: 15000 });
  await sleep(500);
  await pB.screenshot({ path: `${EV}/390-progress.png`, fullPage: true });

  // ---- profile ----
  log("profile");
  await pB.locator('[data-nav="profile"]').click();
  await pB.waitForFunction(() => window.__profile && window.__profile.sections, { timeout: 15000 });
  await sleep(400);
  const danger = await pB.evaluate(() => document.querySelector(".sec-danger")?.textContent?.trim());
  log("  profile: danger label = " + JSON.stringify(danger));
  await pB.screenshot({ path: `${EV}/390-profile.png`, fullPage: true });

  await browser.close();
  log("\n==== SHOTS DONE -> " + EV + " ====");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
