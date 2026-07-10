// Headless test of the living-diagram engine. Proves the architecture claims.
// Run: node --experimental-strip-types test.mjs   (Node 22+/26 strips TS types)
import { StepPlayer, serialize } from './engine.ts';
import { bubbleSortSteps, boxingSteps } from './demo.ts';

let pass = 0, fail = 0;
const ok = (name, cond) => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`); };

// 1. Determinism: goto(i) always yields byte-identical SVG (needed for SRS thumbnails + tests).
const steps = bubbleSortSteps([5, 3, 8, 1]);
const p1 = new StepPlayer(steps);
const p2 = new StepPlayer(steps);
let deterministic = true;
for (let i = 0; i < steps.length; i++) {
  if (serialize(p1.goto(i).tree) !== serialize(p2.goto(i).tree)) deterministic = false;
}
ok(`deterministic render across ${steps.length} steps`, deterministic);

// 2. Random-access scrub == sequential (drill jump must match play-through).
const seq = new StepPlayer(steps); const rnd = new StepPlayer(steps);
let scrubEq = true;
const order = [0, steps.length - 1, 2, 1, steps.length - 2, 0];
for (const i of order) {
  const a = serialize(rnd.goto(i).tree);
  const b = serialize(new StepPlayer(steps).goto(i).tree);
  if (a !== b) scrubEq = false;
}
ok('random-access scrub equals fresh goto (deterministic seek)', scrubEq);

// 3. Data-join: a swap step produces zero enter/exit (same ids) -> pure FLIP move, no DOM churn.
const play = new StepPlayer(steps);
let swapStepFound = false, swapPureMove = true;
for (let i = 1; i < steps.length; i++) {
  const r = play.goto(i);
  if (steps[i].caption?.includes('FLIP')) {
    swapStepFound = true;
    if (r.diff.enter.length !== 0 || r.diff.exit.length !== 0) swapPureMove = false;
    if (r.flip.length < 2) swapPureMove = false; // both swapped boxes must move
  }
}
ok('swap step = pure FLIP (0 enter/exit, >=2 moves)', swapStepFound && swapPureMove);

// 4. FLIP invert has correct sign/magnitude: swapped boxes move by one slot (64px), opposite dirs.
const bp = new StepPlayer(steps);
let flipMag = null;
for (let i = 1; i < steps.length; i++) {
  const r = bp.goto(i);
  if (steps[i].caption?.includes('FLIP')) {
    const xs = r.flip.map(f => f.dx).sort((a, b) => a - b);
    flipMag = xs;
    break;
  }
}
ok('FLIP dx = [-64, +64] (one slot, opposite)', flipMag && flipMag[0] === -64 && flipMag[flipMag.length - 1] === 64);

// 5. Boxing recipe: enter/exit works — heap object + arrow appear at boxing step.
const bx = boxingSteps();
const bxp = new StepPlayer(bx);
bxp.goto(0);
const d1 = bxp.goto(1).diff;
ok('boxing step introduces heap box + ref (enter includes n:heap_box & e:ref)',
  d1.enter.includes('n:heap_box') && d1.enter.includes('e:ref'));

// 6. prefers-reduced-motion: transitions cut, steps preserved (accessibility).
const rm = new StepPlayer(steps, { reducedMotion: true });
let noFlip = true;
for (let i = 0; i < steps.length; i++) if (rm.goto(i).flip.length !== 0) noFlip = false;
ok('reduced-motion: 0 FLIP moves but full step count reachable', noFlip && rm.length === steps.length);

// 7. SRS cue: single frozen frame serializes without player chrome (thumbnail use).
const frame = bxp.frame(1);
ok('SRS frame() returns standalone SVG snapshot', frame.startsWith('<g') && frame.includes('boxed'));

console.log(`\nSPIKE RESULT: ${fail === 0 ? 'PASS' : 'FAIL'}  (${pass}/${pass + fail})`);
console.log(`bubble-sort trace steps: ${steps.length}  |  boxing steps: ${bx.length}`);
process.exit(fail === 0 ? 0 : 1);
