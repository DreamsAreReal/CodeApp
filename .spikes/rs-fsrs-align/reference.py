"""
Ground-truth reference vectors from the REAL py-fsrs (FSRS-6).

Runs the DEFAULT Scheduler with DEFAULT parameters (fuzzing OFF for determinism) over the
brief's reference sequences, printing exact intervals (seconds AND days) plus terminal
Difficulty / Stability / State after each review. THESE numbers are the alignment target.

Each review is issued at the card's own `due` datetime, so elapsed time == the previous
interval exactly (the natural "review-when-due" cadence).
"""

import importlib.metadata as meta
from datetime import datetime, timezone
from fsrs import Scheduler, Card, Rating

VERSION = meta.version("fsrs")
RATING = {"Again": Rating.Again, "Hard": Rating.Hard, "Good": Rating.Good, "Easy": Rating.Easy}

SEQUENCES = {
    "Again,Good,Good,Good,Good,Good": ["Again", "Good", "Good", "Good", "Good", "Good"],
    "Good,Good,Good": ["Good", "Good", "Good"],
    "Again,Again,Good": ["Again", "Again", "Good"],
    "Hard,Good,Easy": ["Hard", "Good", "Easy"],
}


def run(seq):
    # Fuzzing OFF so intervals are deterministic and reproducible.
    scheduler = Scheduler(enable_fuzzing=False)
    card = Card()
    start = datetime(2026, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
    now = start
    rows = []
    for grade in seq:
        card, _ = scheduler.review_card(card, RATING[grade], review_datetime=now)
        interval = card.due - now  # timedelta until next review
        rows.append({
            "grade": grade,
            "interval_seconds": interval.total_seconds(),
            "interval_days": interval.total_seconds() / 86400.0,
            "stability": card.stability,
            "difficulty": card.difficulty,
            "state": card.state.name,
            "step": card.step,
        })
        now = card.due  # advance to the card's due time -> review exactly when due
    return rows


def main():
    print(f"py-fsrs version: {VERSION}")
    s = Scheduler()
    print(f"DEFAULT_PARAMETERS ({len(s.parameters)}): {list(s.parameters)}")
    print(f"desired_retention: {s.desired_retention}")
    print(f"learning_steps: {[st.total_seconds() for st in s.learning_steps]} s")
    print(f"relearning_steps: {[st.total_seconds() for st in s.relearning_steps]} s")
    print(f"_DECAY={s._DECAY}  _FACTOR={s._FACTOR}")
    print("=" * 100)
    for name, seq in SEQUENCES.items():
        print(f"\nSEQUENCE [{name}]  (fuzzing OFF, reviewed exactly when due):")
        rows = run(seq)
        print(f"  {'#':>2} {'grade':>6} {'interval_s':>14} {'interval_d':>13} "
              f"{'S':>12} {'D':>9} {'state':>11} {'step':>5}")
        for i, r in enumerate(rows):
            print(f"  {i:>2} {r['grade']:>6} {r['interval_seconds']:>14.4f} "
                  f"{r['interval_days']:>13.6f} {r['stability']:>12.6f} "
                  f"{r['difficulty']:>9.4f} {r['state']:>11} {str(r['step']):>5}")
        term = rows[-1]
        print(f"  TERMINAL: S={term['stability']:.6f}  D={term['difficulty']:.6f}  "
              f"state={term['state']}")
        print(f"  intervals_days = {[round(r['interval_days'], 6) for r in rows]}")


if __name__ == "__main__":
    main()
