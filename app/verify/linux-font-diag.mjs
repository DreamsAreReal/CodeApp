/**
 * Linux font DIAGNOSTIC for the viz-fit "FIT: found N" CI failure.
 *
 * Green on macOS, red on the Linux CI runner with the SINGLE failure `FIT: found 4`
 * (WIDTH-ON-LADDER=0, OVERLAP=0). That pattern means: boxes are the RIGHT width per the
 * ladder, but the TEXT overflows on 4 nodes — a text-render vs box-size mismatch that only
 * bites on Linux. This harness runs the SAME lesson walk viz-fit does, then dumps, for every
 * FIT-overflowing <text>:
 *   · how many @font-face faces are actually `status==='loaded'` (and their families);
 *   · `getComputedStyle(text).fontFamily` — is Rubik/Onest/"JetBrains Mono" applied or a fallback?
 *   · whether the intended family is actually being USED for that string (document.fonts.check);
 *   · getComputedTextLength() vs the box's available width;
 *   · any woff2 requests that 404'd (network) — proves whether self-hosted fonts load at all.
 *
 * It NEVER changes the viz-fit verdict; it is a read-only probe. Run it in the Linux container
 * right after viz-fit to see the true cause. Needs backend :5080 + preview :4173 (same as viz-fit).
 */
import { chromium } from "playwright";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
const RUN_USER = 810000 + Math.floor(Math.random() * 90000);

const LESSONS = [
  { id: "T1.M2.value-vs-reference", segs: 4 },
  { id: "T1.M3.boxing", segs: 7 },
  { id: "T1.M4.gc", segs: 6 },
  { id: "T2.M2.closures", segs: 5 },
  { id: "T2.M1.async-await", segs: 5 },
  { id: "T2.M5.hashtable", segs: 6 },
];

const log = (m) => console.log(m);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  await fetch(API + "/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ devUserId: RUN_USER }),
  });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await ctx.addInitScript((uid) => {
    try { localStorage.setItem("codex.devUserId", String(uid)); } catch (e) { void e; }
  }, RUN_USER);

  // ---- network: record every woff2 request + its status (404 => fonts don't load) ----
  const fontReqs = [];
  const page = await ctx.newPage();
  page.on("response", (res) => {
    const u = res.url();
    if (/\.woff2?(\?|$)/i.test(u)) fontReqs.push({ url: u.split("/").pop(), status: res.status() });
  });
  page.on("requestfailed", (req) => {
    const u = req.url();
    if (/\.woff2?(\?|$)/i.test(u)) fontReqs.push({ url: u.split("/").pop(), status: "FAILED:" + (req.failure()?.errorText || "?") });
  });

  await page.goto(APP, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 20000 });

  const allOverflow = [];
  let facesSummary = null;

  for (const L of LESSONS) {
    let ready = false;
    for (let a = 0; a < 40 && !ready; a++) {
      await page.evaluate((x) => window.__app.openLesson(x), L.id);
      await sleep(120);
      ready = await page.evaluate((x) => !!window.__viz && window.__viz.ready && !!window.__lesson && window.__lesson.id === x, L.id);
    }
    if (!ready) { log(`  ! ${L.id}: lesson did not become ready`); continue; }
    await page.evaluate(() => window.__viz.forcePlayAll());
    await sleep(1300);

    const res = await page.evaluate((lid) => {
      // faces actually loaded, grouped by family
      const faces = [...document.fonts];
      const loaded = faces.filter((f) => f.status === "loaded");
      const byFamily = {};
      for (const f of loaded) byFamily[f.family] = (byFamily[f.family] || 0) + 1;

      // For each node <text>, replicate viz-fit's FIT math and, on overflow, dump font info.
      const out = [];
      document.querySelectorAll(".stage").forEach((stage, si) => {
        const svg = stage.querySelector("svg");
        if (!svg) return;
        svg.querySelectorAll("g.node").forEach((g) => {
          const rect = g.querySelector("rect");
          if (!rect) return;
          const w = parseFloat(rect.getAttribute("width") || "0");
          const cls = g.getAttribute("class") || "";
          const divided = /(^|\s)(slot|ref)(\s|$)/.test(cls);
          const nameAvail = 38 - 8;
          const valAvail = w - 38 - 8;
          const fullAvail = w - 10;
          g.querySelectorAll("text").forEach((t) => {
            const tc = t.getAttribute("class") || "";
            let avail;
            if (divided && /(^|\s)vz-name(\s|$)/.test(tc)) avail = nameAvail;
            else if (divided && /(^|\s)(vz-val|vz-reflbl)(\s|$)/.test(tc)) avail = valAvail;
            else avail = fullAvail;
            let len = 0;
            try { len = t.getComputedTextLength(); } catch (e) { void e; return; }
            if (len > 0 && len > avail + 1) {
              const cs = getComputedStyle(t);
              const fam = cs.fontFamily;
              const size = cs.fontSize;
              const weight = cs.fontWeight;
              const txt = (t.textContent || "").slice(0, 40);
              // Which of our families does the browser actually have available for this string?
              const check = {
                rubik: document.fonts.check(`${weight} ${size} Rubik`, txt),
                onest: document.fonts.check(`${weight} ${size} Onest`, txt),
                jbmono: document.fonts.check(`${weight} ${size} "JetBrains Mono"`, txt),
              };
              out.push({
                lesson: lid, seg: si, text: txt,
                len: Math.round(len * 100) / 100, avail: Math.round(avail * 100) / 100,
                over: Math.round((len - avail) * 100) / 100,
                fontFamily: fam, fontSize: size, fontWeight: weight, check,
              });
            }
          });
        });
      });
      return { loadedCount: loaded.length, totalFaces: faces.length, byFamily, out };
    }, L.id);

    if (!facesSummary) facesSummary = { loadedCount: res.loadedCount, totalFaces: res.totalFaces, byFamily: res.byFamily };
    allOverflow.push(...res.out);
  }

  await browser.close();

  // ---- REPORT ----
  log("\n================ LINUX FONT DIAGNOSTIC ================");
  log(`document.fonts: ${facesSummary?.loadedCount ?? "?"} loaded / ${facesSummary?.totalFaces ?? "?"} total faces`);
  log("  loaded by family: " + JSON.stringify(facesSummary?.byFamily ?? {}));

  log(`\nwoff2 network requests: ${fontReqs.length}`);
  const bad = fontReqs.filter((r) => r.status !== 200);
  if (fontReqs.length) {
    const ok = fontReqs.filter((r) => r.status === 200).length;
    log(`  200 OK: ${ok}   non-200/failed: ${bad.length}`);
    for (const r of bad.slice(0, 20)) log(`  ! ${r.status}  ${r.url}`);
  } else {
    log("  (no woff2 requests observed — faces never fetched: text painted in fallback before load)");
  }

  log(`\nFIT-OVERFLOWING <text> nodes: ${allOverflow.length}`);
  for (const o of allOverflow) {
    log(`  • [${o.lesson} seg${o.seg}] "${o.text}"`);
    log(`      len=${o.len} avail=${o.avail} (over by ${o.over}px)  size=${o.fontSize} weight=${o.fontWeight}`);
    log(`      computed font-family: ${o.fontFamily}`);
    log(`      fonts.check → Rubik:${o.check.rubik} Onest:${o.check.onest} JetBrainsMono:${o.check.jbmono}`);
  }
  log("======================================================\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
