// Spike: empirically measure how FSRS interval schedule (and thus review workload)
// scales with desired retention, using the ACTUAL ts-fsrs 5.4.1 already vendored in
// .spikes/srs-scheduler. Goal: verify (not repeat from blogs) the "0.90 -> 0.95 -> 0.97
// workload is strongly nonlinear" claim that feeds our action plan.
//
// Method: for each desired retention R, simulate a card answered "Good" every time it
// comes due over a fixed HORIZON (days). Count how many reviews FSRS demands to keep
// that card at retention R over the horizon. More reviews per card over the same horizon
// == more daily workload for the same knowledge. We report reviews-per-card and the
// ratio vs the 0.90 baseline. Default 21-weight params == FSRS-6.

import { createRequire } from 'module';
const require = createRequire('/Users/admin/Desktop/test5/.spikes/srs-scheduler/');
const { createEmptyCard, fsrs, generatorParameters, Rating } = require('ts-fsrs');

const HORIZON_DAYS = 365 * 2; // 2-year horizon
const DAY = 24 * 60 * 60 * 1000;

function reviewsToCoverHorizon(requestRetention) {
  const f = fsrs(generatorParameters({ request_retention: requestRetention }));
  let card = createEmptyCard(new Date(0));
  let now = new Date(0);
  let reviews = 0;
  const end = new Date(HORIZON_DAYS * DAY);
  // Always answer Good; follow FSRS due dates.
  // Guard against pathological loops.
  for (let i = 0; i < 100000; i++) {
    const rec = f.repeat(card, now);
    const next = rec[Rating.Good];
    card = next.card;
    reviews++;
    now = new Date(card.due);
    if (now >= end) break;
  }
  return reviews;
}

const targets = [0.80, 0.85, 0.90, 0.92, 0.95, 0.97];
const base = reviewsToCoverHorizon(0.90);
console.log(`Horizon: ${HORIZON_DAYS} days, always-Good, ts-fsrs 5.4.1 (FSRS-6 defaults)`);
console.log('retention | reviews/card over horizon | ratio vs 0.90');
for (const r of targets) {
  const n = reviewsToCoverHorizon(r);
  console.log(`  ${r.toFixed(2)}    |            ${String(n).padStart(3)}            |   ${(n / base).toFixed(2)}x`);
}
