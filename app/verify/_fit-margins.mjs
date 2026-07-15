/** Probe: FIT margins (avail - len) for every PY-lesson node label, mirroring
 *  viz-fit's regions. Prints anything with margin < 10px so labels can be made
 *  compact BEFORE Linux CI (FreeType renders mono ~3-4px wider than mac). */
import { chromium } from "playwright";
import { LESSONS as LESSON_DATA } from "../src/lessons/index.ts";

const APP = "http://localhost:4173";
const PY = LESSON_DATA.filter((l) => l.track === "PY").map((l) => ({ id: l.id, segs: l.segments.length }));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(() => { try { localStorage.setItem("codex.devUserId", "926777"); } catch (e) { void e; } });
const page = await ctx.newPage();
await page.goto(APP, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });
await page.evaluate(() => document.fonts.ready);
for (const L of PY) {
  await page.evaluate((id) => window.__app.openLesson(id), L.id);
  await page.waitForFunction(() => window.__viz && window.__viz.ready, { timeout: 15000 });
  await page.evaluate(() => window.__viz.forcePlayAll());
  await sleep(500);
  const rows = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll(".stage svg").forEach((svg, si) => {
      svg.querySelectorAll("g.node").forEach((g) => {
        const rect = g.querySelector("rect");
        if (!rect) return;
        const w = parseFloat(rect.getAttribute("width") || "0");
        g.querySelectorAll("text").forEach((t) => {
          // NATURAL length: strip the fitLabels shrink so we see the raw metric
          t.removeAttribute("textLength");
          t.removeAttribute("lengthAdjust");
          t.style.removeProperty("font-size");
          const len = t.getComputedTextLength();
          const cls = t.getAttribute("class") || "";
          // mirror viz-fit regions: name (left region) vs value (right) on slots; full span otherwise
          let avail = w - 10;
          if (cls.includes("vz-name")) avail = 38 - 8;
          else if (cls.includes("vz-val") && g.getAttribute("class")?.includes("slot")) avail = w - 38 - 8;
          out.push({ seg: si, text: t.textContent, len: +len.toFixed(1), avail, margin: +(avail - len).toFixed(1) });
        });
      });
    });
    return out;
  });
  console.log(`\n== ${L.id}`);
  rows.filter((r) => r.margin < 10).sort((a, b) => a.margin - b.margin).forEach((r) => console.log(`  seg#${r.seg} "${r.text}" len=${r.len} avail=${r.avail} margin=${r.margin}`));
}
await browser.close();
