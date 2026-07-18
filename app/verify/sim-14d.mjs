/**
 * 14-day FSRS queue simulation (F3 / G9, ADR-0002 daily new-card limit).
 *
 * Drives a fresh user through 14 virtual days against the LIVE backend, using the DEV-ONLY
 * `X-Sim-Now` header so BOTH the new-card limiter (/api/due) and the FSRS schedule (/api/review)
 * advance on the same simulated clock. Each day: GET /api/due -> assert (new cards <= NEW_PER_DAY,
 * total due <= DUE_CAP) -> grade every due card "Good" (3) -> next day. This proves the day-N queue
 * stays humane at any catalog size: no day floods the learner with new cards or an oversized due pile.
 *
 * Requires: backend on :5080 in DEV mode (X-Sim-Now is ignored in production).
 * Exit 0 iff every day satisfies both caps; non-zero (and a printed failure) otherwise.
 */
const API = process.env.VITE_API_BASE || "http://localhost:5080";
const NEW_PER_DAY = Number(process.env.SIM_NEW_PER_DAY || 10); // ADR-0002 default budget
const DUE_CAP = Number(process.env.SIM_DUE_CAP || 25); // G9 counter-metric
const DAYS = 14;
const BASE = "2026-09-01"; // simulation start date (UTC)

const log = (m) => console.log(m);
let failed = 0;
function assert(cond, msg) {
  if (cond) log("  ✓ " + msg);
  else {
    failed++;
    log("  ✗ FAIL: " + msg);
  }
}

// Each virtual day is BASE + d days at 09:00Z. A fixed time-of-day keeps the UTC calendar date
// (which the new-card limiter keys on) unambiguous.
function simNow(dayIndex) {
  const base = new Date(`${BASE}T09:00:00Z`);
  base.setUTCDate(base.getUTCDate() + dayIndex);
  return base.toISOString();
}

async function authToken(devUserId) {
  const res = await fetch(API + "/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ devUserId }),
  });
  return (await res.json()).token;
}

async function getDue(token, nowIso) {
  const res = await fetch(API + "/api/due", {
    headers: { Authorization: `Bearer ${token}`, "X-Sim-Now": nowIso },
  });
  return res.json();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// POST /api/review is rate-limited (RateLimit:PermitPerMinute, default 60/min). Pace every grade
// at ~1.05s so a 14-day burst stays under the window, and retry once on a 429 — a silently-dropped
// grade would leave a card ungraded (still "new"), inflating later days and masking the real behaviour.
async function grade(token, itemId, nowIso) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(API + "/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "X-Sim-Now": nowIso },
      body: JSON.stringify({ itemId, grade: 3 }), // Good
    });
    if (res.status === 429) {
      await sleep(1100);
      continue;
    }
    const j = await res.json();
    if (j.itemId !== itemId) throw new Error(`grade failed for ${itemId}: ${JSON.stringify(j)}`);
    await sleep(1050); // pace under the mutating rate limit
    return j;
  }
  throw new Error(`grade for ${itemId} still rate-limited after retries`);
}

async function main() {
  const user = 600000 + Math.floor(Math.random() * 90000);
  const token = await authToken(user);
  log(`== sim-14d: fresh user ${user}, ${DAYS} days from ${BASE}, caps new<=${NEW_PER_DAY} due<=${DUE_CAP} ==`);

  for (let d = 0; d < DAYS; d++) {
    const now = simNow(d);
    const due = await getDue(token, now);
    const items = due.items || [];
    const newCount = items.filter((i) => i.isNew).length;
    const dayLabel = `day ${String(d + 1).padStart(2, "0")} (${now.slice(0, 10)})`;
    assert(newCount <= NEW_PER_DAY, `${dayLabel}: new cards ${newCount} <= ${NEW_PER_DAY}`);
    assert(due.count <= DUE_CAP, `${dayLabel}: total due ${due.count} <= ${DUE_CAP}`);
    // Grade every due card Good, on the SAME simulated clock, so the schedule advances coherently.
    for (const it of items) await grade(token, it.itemId, now);
  }

  log(`\n==== ${failed === 0 ? "ALL GREEN" : failed + " FAILED"} · sim-14d · user=${user} ====`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
