// FSRS-6 scheduling demo using the OFFICIAL ts-fsrs library (MIT, open-spaced-repetition).
// All numbers printed are produced by executing the real library, not hand math.
const { fsrs, generatorParameters, Rating, createEmptyCard } = require('ts-fsrs');

const DAY = 24 * 3600 * 1000;

function intervalDays(fromDate, dueDate) {
  return +((dueDate.getTime() - fromDate.getTime()) / DAY).toFixed(2);
}

// Simulate a stream of ratings, advancing "now" to each card's due date.
function simulate(retention, ratings, label) {
  const f = fsrs(generatorParameters({ request_retention: retention }));
  let card = createEmptyCard();
  let now = new Date('2026-07-08T00:00:00Z');
  console.log(`\n=== FSRS-6 | request_retention=${retention} | ${label} ===`);
  console.log(['rev#', 'rating', 'interval(d)', 'stability', 'difficulty'].join('\t'));
  ratings.forEach((r, i) => {
    const rec = f.next(card, now, r);
    const iv = intervalDays(now, rec.card.due);
    console.log([
      i + 1,
      Rating[r],
      iv,
      rec.card.stability.toFixed(2),
      rec.card.difficulty.toFixed(2),
    ].join('\t'));
    card = rec.card;
    now = rec.card.due; // review exactly when due
  });
}

const G = Rating.Good, A = Rating.Again, H = Rating.Hard, E = Rating.Easy;

simulate(0.9, [G, G, G, G, G, G], 'always Good');
simulate(0.9, [G, G, A, G, G, G], 'lapse (Again) at review 3, then recover');
simulate(0.9, [E, E, E, E], 'always Easy');
simulate(0.9, [H, H, H, H, H], 'always Hard');

// Desired-retention trade-off: same rating stream, different targets.
simulate(0.97, [G, G, G, G, G, G], 'always Good (higher target retention)');
simulate(0.80, [G, G, G, G, G, G], 'always Good (lower target retention)');
