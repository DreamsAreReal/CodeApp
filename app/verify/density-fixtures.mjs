/**
 * Fixture self-test for the G7 density + anti-echo lint (F5): proves the checker CATCHES crafted
 * violators and PASSES legal lessons. Pure (no backend/browser) — imports the checker from
 * density.mjs and runs it on synthetic lesson objects. Part of `npm run verify:all`.
 */
import { lessonViolations } from "./density.mjs";

const log = (m) => console.log(m);
let failed = 0;
const assert = (cond, msg) => {
  if (cond) log("  ✓ " + msg);
  else {
    failed++;
    log("  ✗ FAIL: " + msg);
  }
};

// A dynamic segment: nodes change between two frames.
const dynSeg = (id) => ({
  id,
  scenes: [
    { nodes: [{ id: "n", kind: "slot", value: "1", at: { zone: "z", row: 0 } }], edges: [] },
    { nodes: [{ id: "n", kind: "slot", value: "2", at: { zone: "z", row: 0 } }], edges: [] },
  ],
});
// A STATIC segment: two identical frames (the "chip без динамики" anti-pattern).
const staticSeg = (id) => ({
  id,
  scenes: [
    { nodes: [{ id: "n", kind: "chip", value: "x", at: { zone: "z", row: 0 } }], edges: [] },
    { nodes: [{ id: "n", kind: "chip", value: "x", at: { zone: "z", row: 0 } }], edges: [] },
  ],
});
const card = (id, run, expect) => ({ id, verify: { kind: "exec", run, expect } });

// FIXTURE 1 — a LEGAL lesson (4 dynamic segments, 2 exec cards, run does not echo expect).
const legal = {
  id: "FIX.legal",
  track: "CS",
  segments: [dynSeg("s1"), dynSeg("s2"), dynSeg("s3"), dynSeg("s4")],
  cards: [card("c1", "dotnet run", "42"), card("c2", "dotnet run", "hello")],
};
assert(lessonViolations(legal).length === 0, "a legal lesson (4 dyn seg, 2 exec cards, no echo) passes clean");

// FIXTURE 2 — ECHO-FALSIFICATION: verify.run is crafted to emit the answer (`echo 42`, expect 42).
const echo = {
  id: "FIX.echo",
  track: "CS",
  segments: [dynSeg("s1"), dynSeg("s2"), dynSeg("s3"), dynSeg("s4")],
  cards: [card("c1", "echo 42", "42"), card("c2", "dotnet run", "ok")],
};
const echoV = lessonViolations(echo);
assert(echoV.some((v) => /echoes verify\.expect/.test(v)), "an echo card (run: 'echo 42', expect: '42') is caught by the anti-echo lint");
// Control: a filename-exec run that merely CONTAINS the expect substring is NOT a false positive.
const notEcho = { id: "FIX.notecho", track: "PY", segments: [dynSeg("s1"), dynSeg("s2")], cards: [card("c1", "python3.12 X_c3.py", "3")] };
assert(!lessonViolations(notEcho).some((v) => /echoes/.test(v)), "a filename-exec run containing the digit is NOT flagged (no false positive)");

// FIXTURE 3 — STATIC SEGMENT: one of the segments never changes between frames (density < 90%).
const staticFix = {
  id: "FIX.static",
  track: "CS",
  segments: [dynSeg("s1"), dynSeg("s2"), dynSeg("s3"), staticSeg("s4")],
  cards: [card("c1", "dotnet run", "1"), card("c2", "dotnet run", "2")],
};
const staticV = lessonViolations(staticFix);
assert(staticV.some((v) => /segments dynamic/.test(v) && /s4/.test(v)), "a static segment (identical frames) is caught by the dynamic-ratio gate");

// FIXTURE 4 — TOO FEW SEGMENTS/CARDS on the authored track (count gate).
const thin = { id: "FIX.thin", track: "CS", segments: [dynSeg("s1"), dynSeg("s2")], cards: [card("c1", "dotnet run", "1")] };
const thinV = lessonViolations(thin);
assert(thinV.some((v) => /segments \(< 4/.test(v)), "a <4-segment authored lesson is caught by the count gate");
assert(thinV.some((v) => /cards \(< 2/.test(v)), "a <2-card authored lesson is caught by the count gate");

log(`\n==== ${failed === 0 ? "ALL GREEN" : failed + " FAILED"} · density-fixtures ====`);
process.exit(failed === 0 ? 0 : 1);
