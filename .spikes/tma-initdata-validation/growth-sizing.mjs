// RS-12: Where does client-only persistence BREAK for a LONG-TERM senior?
// Distinguishes BOUNDED state (FSRS scheduling, ~#cards) from UNBOUNDED append-only
// history (generative attempts + calibration), which is what actually overflows.
//
// Primary limits (core.telegram.org/bots/webapps, verified 2026-07-09):
//   CloudStorage : 1024 keys/user, value 0-4096 chars, key 1-128 chars  -> ~4.0 MB char ceiling
//   DeviceStorage: ~5 MB/user (Bot API 9.0+, local, offline)
//   IndexedDB    : hundreds of MB, BUT best-effort/evictable (WebKit 7-day rule on iOS)

const CS_KEYS = 1024, CS_VALUE = 4096;
const CS_CEIL_BYTES = CS_KEYS * CS_VALUE;            // ~4.19 MB (1 char ~1 byte packed ASCII)
const DEVICE_BYTES = 5 * 1024 * 1024;

// --- 1. BOUNDED: FSRS scheduling state (survives forever, size ~ #cards) ---
const perCardChars = 29;                              // from srs-sizing.mjs (compact CSV)
const curriculumCards = 2480;                         // RS-04 upper bound, all 7 tracks
const fsrsStateBytes = curriculumCards * perCardChars;
const fsrsStateKeys = Math.ceil(fsrsStateBytes / CS_VALUE);

// --- 2. UNBOUNDED: append-only history (the real question) ---
// Per review we may log: ts, cardId, rating(1-4), elapsedDays, newStab, newDiff,
// responseLatencyMs, confidence(0-1, for calibration/Brier), variant(predict/bug/write).
// Compact CSV row, e.g. "20185,1734,3,20,12.34,5.67,2300,0.8,w"
const perReviewChars = 42;                            // measured on the sample row below
const sampleRow = '20185,1734,3,20,12.34,5.67,2300,0.8,w';
const measured = sampleRow.length + 1;               // +1 delimiter

// Senior daily load. Mature FSRS corpus: reviews/day grows then plateaus.
// Conservative daily-active senior: ~120 reviews/day (due repeats + new).
const reviewsPerDay = 120;
for (const years of [1, 3, 5]) {
  const reviews = reviewsPerDay * 365 * years;
  const bytes = reviews * measured;
  console.log(`history @${years}y: ${reviews.toLocaleString()} reviews = ${(bytes/1e6).toFixed(1)} MB`
    + ` | CloudStorage ceil ${(CS_CEIL_BYTES/1e6).toFixed(1)}MB -> ${(bytes/CS_CEIL_BYTES*100).toFixed(0)}%`
    + ` | DeviceStorage 5MB -> ${(bytes/DEVICE_BYTES*100).toFixed(0)}%`);
}

// When does append-only history alone exhaust each client store?
const bytesPerYear = reviewsPerDay * 365 * measured;
console.log('\n--- break points (history only, no headroom for FSRS state) ---');
console.log('CloudStorage 4.19MB char-ceiling exhausted in ~',
  (CS_CEIL_BYTES / bytesPerYear).toFixed(1), 'years');
console.log('DeviceStorage 5MB exhausted in ~',
  (DEVICE_BYTES / bytesPerYear).toFixed(1), 'years');

console.log('\n--- bounded FSRS state (source of truth) ---');
console.log('all', curriculumCards, 'cards compact =', (fsrsStateBytes/1024).toFixed(0),
  'KB =', fsrsStateKeys, 'CloudStorage keys of', CS_KEYS, '('+ (fsrsStateKeys/CS_KEYS*100).toFixed(1) +'% of key budget)');
console.log('=> FSRS SCHEDULING STATE fits CloudStorage with huge headroom, indefinitely.');
console.log('=> APPEND-ONLY HISTORY is the overflow: fine in IndexedDB (evictable!) but');
console.log('   CloudStorage/DeviceStorage run out in a few years for a daily senior.');
