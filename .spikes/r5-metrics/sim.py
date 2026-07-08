"""
R5 spike: (1) desired-retention -> workload tradeoff for an SRS scheduler,
(2) a discriminator that separates a genuine learner from a streak-farmer.

Memory model: exponential forgetting  R(t) = exp(-t / S), S = stability (days).
Stability grows only from GENUINE retrieval of a partly-forgotten item:
    new_S = S * (1 + GAIN * effort * (1 - R_at_review))
- Spacing effect: reviewing when R has decayed (low R) grows S a lot.
- Passive tap / recognition without retrieval: effort ~ 0 -> S barely grows
  (this is the "illusion of competence" / gaming-the-system failure mode).

Archetypes (both keep a 30-day streak, the naive engagement metric):
  LEARNER: does all due items with genuine retrieval (effort=1.0), spaced.
  FARMER : keeps the streak with minimum work -> touches only a few items/day
           and taps "known" without retrieving (effort~0.1). Coverage stays low.

Run: python3 sim.py   (stdlib only, deterministic seed)
"""
import math, random
random.seed(42)

def interval(S, r):            # next interval at desired retention r
    return -S * math.log(r)

# ---------- (1) desired retention -> reviews/day workload ----------
print("=== (1) Desired-retention vs review workload (S=10d, baseline r=0.90) ===")
base_iv = interval(10.0, 0.90)
for r in (0.80, 0.85, 0.90, 0.92, 0.95, 0.97):
    iv = interval(10.0, r)
    print(f"  r={r:.2f}  interval={iv:5.2f}d  workload_x_vs_0.90={base_iv/iv:.2f}")

# ---------- (2) learner vs farmer discriminator ----------
GAIN = 6.0
N_ITEMS = 40
DAYS = 30

def simulate(user):
    S = [1.0] * N_ITEMS
    last = [0.0] * N_ITEMS
    seen = [False] * N_ITEMS
    reviews = 0
    genuine_attempts = 0
    for day in range(1, DAYS + 1):
        if user == "learner":
            # introduce ~2 new items/day, then review everything that is due
            for i in range(N_ITEMS):
                if not seen[i] and sum(seen) < 2 * day:
                    seen[i] = True; last[i] = day
            for i in range(N_ITEMS):
                if not seen[i]:
                    continue
                elapsed = day - last[i]
                R = math.exp(-elapsed / S[i])
                if elapsed >= interval(S[i], 0.90):     # due
                    reviews += 1; genuine_attempts += 1
                    S[i] = S[i] * (1 + GAIN * 1.0 * (1 - R))
                    last[i] = day
        else:  # farmer: minimum to keep streak
            # touches only the first 5 items, taps "known" (effort ~0.1), daily
            for i in range(5):
                seen[i] = True
                elapsed = max(1, day - last[i])
                R = math.exp(-elapsed / S[i])
                reviews += 1                            # counts as a "review"
                S[i] = S[i] * (1 + GAIN * 0.1 * (1 - R))  # passive -> tiny gain
                last[i] = day
    # Delayed retention test 14 days after study window (true memory).
    test_day = DAYS + 14
    recalls, fast_taps = [], 0
    for i in range(N_ITEMS):
        if not seen[i]:
            recalls.append(0.0); continue
        R = math.exp(-(test_day - last[i]) / S[i])
        recalls.append(R)
    coverage = sum(seen) / N_ITEMS
    # mastered = item whose predicted recall at test >= 0.85
    mastered = sum(1 for r in recalls if r >= 0.85)
    latency = 0.6 if user == "farmer" else 2.3   # passive taps are too fast
    return dict(reviews=reviews, coverage=coverage, mastered=mastered,
                delayed_recall=sum(recalls) / N_ITEMS, latency=latency,
                genuine=genuine_attempts)

print("\n=== (2) Learner vs Farmer: both hold a 30-day streak ===")
print(f"  {'user':8s} {'streak':>6} {'reviews':>7} {'coverage':>8} "
      f"{'mastered':>8} {'delayed_recall':>14} {'median_latency':>14}")
for u in ("learner", "farmer"):
    m = simulate(u)
    print(f"  {u:8s} {30:>6} {m['reviews']:>7} {m['coverage']*100:>7.0f}% "
          f"{m['mastered']:>6}/40 {m['delayed_recall']:>13.3f} "
          f"{m['latency']:>12.1f}s")

print("\n  -> streak=30 for BOTH. What separates them: coverage, mastered count,")
print("     delayed_recall (14d), and retrieval latency (too-fast = passive tap).")
print("     Guardrail: dashboards must show these, NOT streak, as 'learning'.")
