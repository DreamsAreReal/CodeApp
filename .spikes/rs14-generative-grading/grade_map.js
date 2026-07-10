// RS-14 spike: (1) deterministic grade-mapping for GENERATIVE items -> FSRS Rating,
// (2) expertise-reversal-aware scheduler using FSRS stability S as expertise proxy.
// Uses the OFFICIAL ts-fsrs (MIT) already installed in ../srs-scheduler/node_modules.
// Every number printed is produced by executing the real library, not hand math.

const { fsrs, generatorParameters, Rating, createEmptyCard } = require('../srs-scheduler/node_modules/ts-fsrs');

const DAY = 24 * 3600 * 1000;
const iv = (from, due) => +((due.getTime() - from.getTime()) / DAY).toFixed(2);
const G = Rating.Good, A = Rating.Again, H = Rating.Hard, E = Rating.Easy;
const RN = r => ['', 'Again', 'Hard', 'Good', 'Easy'][r];

// ---------------------------------------------------------------------------
// PART 1. Grade-mapping: turn an OBJECTIVE generative outcome into an FSRS Rating.
// FSRS semantics (py-fsrs/ts-fsrs docs): Again=1 fail; Hard=2/Good=3/Easy=4 = pass.
// For generative items correctness is the PRIMARY axis; latency/attempts/hints
// only *modulate* pass into Hard vs Good vs Easy. We never let speed alone pass a
// wrong answer (RS-01: recall, not recognition; RS-05: don't reward passive tapping).
//
// outcome = {
//   correct: bool,        // objective: exec/hidden-tests pass, exact-match, or cloze-correct
//   firstTry: bool,       // solved on first submission (no retry)
//   hints: int,           // scaffold reveals used
//   attempts: int,        // submissions until correct
//   overLatency: bool,    // answered slower than the item's soft time budget (struggle)
// }
function gradeFromGenerative(o) {
  if (!o.correct) return A;                       // fail is fail, regardless of effort
  // correct below:
  if (o.hints >= 1 || o.attempts >= 3) return H;  // needed scaffold / many tries = shaky pass
  if (o.attempts === 2 || o.overLatency) return H;// one retry OR slow = Hard (desirable-difficulty honest)
  if (o.firstTry && !o.overLatency) return G;     // clean first-try = Good (NOT Easy by default)
  return G;
}
// Easy is intentionally NOT auto-assigned from generative outcomes: "trivially easy" is a
// metacognitive self-report the learner presses, not something we infer (avoids inflating S).

const cases = [
  { correct: true,  firstTry: true,  hints: 0, attempts: 1, overLatency: false },
  { correct: true,  firstTry: true,  hints: 0, attempts: 1, overLatency: true  },
  { correct: true,  firstTry: false, hints: 0, attempts: 2, overLatency: false },
  { correct: true,  firstTry: false, hints: 1, attempts: 2, overLatency: false },
  { correct: true,  firstTry: false, hints: 0, attempts: 3, overLatency: true  },
  { correct: false, firstTry: false, hints: 2, attempts: 3, overLatency: true  },
];
console.log('=== PART 1: generative outcome -> FSRS Rating ===');
console.log(['correct','firstTry','hints','attempts','slow','=> Rating'].join('\t'));
for (const c of cases) {
  console.log([c.correct, c.firstTry, c.hints, c.attempts, c.overLatency, RN(gradeFromGenerative(c))].join('\t'));
}

// ---------------------------------------------------------------------------
// PART 2. Expertise-reversal-aware support level from FSRS stability S (days).
// RS-09 hypothesis: reduce scaffolding as mastery (proxy: S) grows.
// Ladder of reconstruction: predict -> modify -> write (support DECREASES).
// Thresholds are DESIGN KNOBS to be tuned by sim/AB (RS-09 open Q4), not constants.
const S_MODIFY = 7;    // below: predict (most support: worked-example + predict-the-output)
const S_WRITE  = 21;   // below: modify (faded / find-the-bug / completion); above: write-missing (least support)
function supportLevel(S) {
  if (S < S_MODIFY) return 'predict';
  if (S < S_WRITE)  return 'modify';
  return 'write';
}

// Simulate a concept-atom across reviews. The learner's rating is a function of the
// CURRENT support level (harder support -> more likely Hard/lapse) — this is the honest
// coupling: as we fade support, difficulty rises, which is the point (deliberate practice).
function outcomeFor(level, streak) {
  // crude behavioural model for the sim: more support => easier pass; long streak => steadier.
  if (level === 'predict') return { correct: true, firstTry: true, hints: 0, attempts: 1, overLatency: false };
  if (level === 'modify')  return streak >= 1
      ? { correct: true, firstTry: true, hints: 0, attempts: 1, overLatency: false }
      : { correct: true, firstTry: false, hints: 0, attempts: 2, overLatency: true };
  // write (least support): first exposure at this level tends to be shaky, then stabilises
  return streak >= 2
      ? { correct: true, firstTry: true, hints: 0, attempts: 1, overLatency: false }
      : { correct: false, firstTry: false, hints: 1, attempts: 2, overLatency: true };
}

function simulateAtom(label, injectLapseAt) {
  const f = fsrs(generatorParameters({ request_retention: 0.9 }));
  let card = createEmptyCard();
  let now = new Date('2026-07-09T00:00:00Z');
  let streakAtLevel = 0, lastLevel = null;
  console.log(`\n=== PART 2: expertise-reversal-aware ladder | ${label} ===`);
  console.log(['rev#','S(before)','support','outcome->Rating','interval(d)','S(after)'].join('\t'));
  for (let i = 1; i <= 8; i++) {
    const S = card.stability || 0;
    const level = supportLevel(S);
    if (level !== lastLevel) { streakAtLevel = 0; lastLevel = level; }
    let o = outcomeFor(level, streakAtLevel);
    if (injectLapseAt === i) o = { correct: false, firstTry: false, hints: 0, attempts: 1, overLatency: true };
    const rating = gradeFromGenerative(o);
    const rec = f.next(card, now, rating);
    console.log([
      i, S.toFixed(2), level, `${o.correct ? 'pass' : 'FAIL'}->${RN(rating)}`,
      iv(now, rec.card.due), rec.card.stability.toFixed(2),
    ].join('\t'));
    streakAtLevel = o.correct ? streakAtLevel + 1 : 0;
    card = rec.card; now = rec.card.due;
  }
}

simulateAtom('clean growth (support fades predict->modify->write as S rises)');
simulateAtom('lapse at review 5 -> S collapses -> support should RE-INFLATE', 5);
