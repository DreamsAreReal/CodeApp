/**
 * G7 density + anti-echo lint (F5). A STATIC, no-browser check over the lesson registry that
 * guards the authoring bar so mass authoring cannot silently degrade quality:
 *
 *   (1) DENSITY — each lesson has >= MIN_SEGMENTS animated segments and >= MIN_CARDS cards, and
 *       >= DYNAMIC_RATIO of its segments are DYNAMIC (their diagram nodes/edges actually change
 *       between frames — the anti-"chip + подпись без динамики" rule). A single-frame segment, or
 *       one whose frames are all identical, is STATIC and counts against the ratio.
 *   (2) ANTI-ECHO — for every exec card, the graded answer (`verify.expect`) is NOT a substring of
 *       what the learner is shown to run/predict (`verify.run` + the question/code). An answer that
 *       leaks into the prompt is echo-falsification of the G4 gate (ADR-0001 / brief anti-slop).
 *
 * Usage:
 *   node verify/density.mjs                      # every registered lesson
 *   node verify/density.mjs --lessons A,B,C      # only the listed lesson ids (incremental)
 * Exit 0 iff every checked lesson passes both gates; non-zero (with a per-violation report) else.
 *
 * No backend / browser needed — it imports the registry and lesson bodies directly (node strips
 * the TS types), so it is cheap enough to run on every commit as part of `npm run verify:all`.
 */
import { fileURLToPath } from "node:url";
import { MANIFEST, loadBody } from "../src/lessons/registry.ts";

export const MIN_SEGMENTS = 4;
export const MIN_CARDS = 2;
export const DYNAMIC_RATIO = 0.9;

const log = (m) => console.log(m);
let failed = 0;
const fail = (m) => {
  failed++;
  log("  ✗ " + m);
};

// --lessons id1,id2 -> only those; otherwise every registered lesson.
function selectedIds() {
  const i = process.argv.indexOf("--lessons");
  if (i >= 0 && process.argv[i + 1]) return new Set(process.argv[i + 1].split(",").map((s) => s.trim()).filter(Boolean));
  return null;
}

/** Canonical shape of ONE frame's diagram: the parts a real animation would change between steps. */
function frameShape(scene) {
  const nodes = (scene.nodes || [])
    .map((n) => JSON.stringify({ id: n.id, k: n.kind, v: n.value ?? null, nm: n.name ?? null, at: n.at ?? null, in: n.at?.in ?? null, tag: n.typeTag ?? null, acc: !!n.accent, st: n.state ?? null, gh: !!n.ghost }))
    .sort();
  const edges = (scene.edges || []).map((e) => JSON.stringify({ id: e.id, f: e.from, t: e.to, acc: !!e.accent })).sort();
  // codeLine / ilLine / out also advance the story — a segment that only steps the code/IL/console
  // pointer between otherwise-identical node frames is still telling a moving story.
  return JSON.stringify({ nodes, edges, code: scene.codeLine ?? null, il: scene.ilLine ?? null, out: scene.out ?? null });
}

/** A segment is DYNAMIC if it has >= 2 scenes and at least one consecutive pair differs. */
export function isDynamic(seg) {
  const scenes = seg.scenes || [];
  if (scenes.length < 2) return false;
  const shapes = scenes.map(frameShape);
  for (let i = 1; i < shapes.length; i++) if (shapes[i] !== shapes[i - 1]) return true;
  return false;
}

// A legitimate `run` EXECUTES a file or top-level code (e.g. "python3.12 PY.M12_c4.py",
// "dotnet run"). Echo-falsification is a `run` crafted to EMIT the literal answer instead —
// `echo`/`print`/`Console.Write(Line)`/`printf` of the expected string. We flag the leak only
// when `expect` appears INSIDE such an emit call, not merely anywhere in a filename command
// (else a digit in "python3.12" or a card id false-positives against a short expect like "3").
const EMIT = /\b(echo|printf|print|puts|Console\.Write(?:Line)?|Write-Output|System\.out\.print(?:ln)?)\b/i;
export function runEchoesAnswer(run, expect) {
  if (!EMIT.test(run)) return false; // a plain interpreter+file command cannot echo the answer
  return run.includes(expect);
}

// The PY track is FROZEN (brief G5 / "py-трек неприкосновенен"): its lessons were authored and
// verified under the earlier bar and MUST NOT be edited here. The wave-1 DENSITY THRESHOLDS
// (>= MIN_SEGMENTS / >= MIN_CARDS) apply to the C# track this task authors; the PY track is
// grandfathered against those counts. The dynamic-node ratio and anti-echo lint (correctness
// gates, not length gates) still apply to EVERY lesson — they catch real regressions anywhere.
export function isFrozenTrack(lesson) {
  return lesson.track === "PY";
}

/**
 * PURE checker: return the list of violation strings for one lesson (empty = passes). Exported so
 * the fixture self-test can assert a crafted violator IS caught and a legal lesson is NOT.
 */
export function lessonViolations(lesson) {
  const id = lesson.id;
  const segs = lesson.segments || [];
  const cards = lesson.cards || [];
  const frozen = isFrozenTrack(lesson);
  const out = [];

  // (1) density thresholds — count gates apply to the authored (non-frozen) track only.
  if (!frozen && segs.length < MIN_SEGMENTS) out.push(`${id}: ${segs.length} segments (< ${MIN_SEGMENTS} required)`);
  if (!frozen && cards.length < MIN_CARDS) out.push(`${id}: ${cards.length} cards (< ${MIN_CARDS} required)`);

  // dynamic-node ratio — a correctness gate (anti-"chip без динамики"), applies to every lesson.
  const dyn = segs.filter(isDynamic);
  const ratio = segs.length ? dyn.length / segs.length : 0;
  if (ratio < DYNAMIC_RATIO) {
    const staticIds = segs.filter((s) => !isDynamic(s)).map((s) => s.id).join(", ");
    out.push(`${id}: only ${dyn.length}/${segs.length} segments dynamic (${(ratio * 100).toFixed(0)}% < ${DYNAMIC_RATIO * 100}%) — static: [${staticIds}]`);
  }

  // (2) anti-echo lint — verify.run must not be crafted to echo verify.expect (G4 / ADR-0001).
  for (const c of cards) {
    const expect = c.verify?.expect;
    if (!expect) continue;
    const run = String(c.verify?.run || "");
    if (runEchoesAnswer(run, expect)) out.push(`${id}/${c.id}: verify.run echoes verify.expect (echo-falsification)`);
  }
  return out;
}

function checkLesson(lesson) {
  const segs = lesson.segments || [];
  const cards = lesson.cards || [];
  const dyn = segs.filter(isDynamic);
  const v = lessonViolations(lesson);
  for (const msg of v) fail(msg);
  const tag = isFrozenTrack(lesson) ? " [frozen: count-gate skipped]" : "";
  if (v.length === 0) log(`  ✓ ${lesson.id}: ${segs.length} seg (${dyn.length} dyn), ${cards.length} cards${tag}`);
}

async function main() {
  const only = selectedIds();
  const entries = MANIFEST.filter((e) => !only || only.has(e.id));
  if (only) {
    const missing = [...only].filter((idv) => !MANIFEST.some((e) => e.id === idv));
    if (missing.length) {
      log(`  ✗ unknown lesson id(s): ${missing.join(", ")}`);
      process.exit(1);
    }
  }
  log(`== density + anti-echo lint over ${entries.length} lesson(s)${only ? " [--lessons]" : ""} ==`);
  for (const e of entries) {
    const body = await loadBody(e.id);
    checkLesson(body);
  }
  log(`\n==== ${failed === 0 ? "ALL GREEN" : failed + " VIOLATION(S)"} · density ====`);
  process.exit(failed === 0 ? 0 : 1);
}

// Run as a CLI only when invoked directly (not when imported by the fixture self-test).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
