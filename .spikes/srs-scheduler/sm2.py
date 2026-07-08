#!/usr/bin/env python3
"""SM-2 reference implementation (Wozniak 1987/1990).
Source of formulas: https://super-memory.com/english/ol/sm2.htm
Numbers printed below are produced by executing this code (stdlib only).
Purpose: show how SM-2 schedules intervals given a stream of quality grades q in 0..5.
"""

def sm2_schedule(grades):
    """grades: list of quality ratings q (0..5). Returns per-review (n, q, EF, interval_days)."""
    EF = 2.5          # initial ease factor
    n = 0             # number of successful repetitions in a row
    interval = 0
    rows = []
    for q in grades:
        if q < 3:
            # failed recall -> restart repetitions, interval back to 1 day
            n = 0
            interval = 1
        else:
            n += 1
            if n == 1:
                interval = 1
            elif n == 2:
                interval = 6
            else:
                interval = round(interval * EF, 2)
        # EF update applies every review (grade 0..5)
        EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        if EF < 1.3:
            EF = 1.3
        rows.append((n, q, round(EF, 3), interval))
    return rows

if __name__ == "__main__":
    print("=== SM-2 scenario A: consistently good recall (q=4 every time) ===")
    print(f"{'rep#':>4} {'grade':>5} {'EF':>6} {'interval(d)':>12}")
    for (n, q, ef, iv) in sm2_schedule([4, 4, 4, 4, 4, 4, 4]):
        print(f"{n:>4} {q:>5} {ef:>6} {iv:>12}")

    print("\n=== SM-2 scenario B: a lapse at review 4 (q=2), then recovery ===")
    print(f"{'rep#':>4} {'grade':>5} {'EF':>6} {'interval(d)':>12}")
    for (n, q, ef, iv) in sm2_schedule([4, 4, 4, 2, 4, 4, 5]):
        print(f"{n:>4} {q:>5} {ef:>6} {iv:>12}")

    print("\n=== SM-2 scenario C: hard card (q=3 every time, EF floors at 1.3) ===")
    print(f"{'rep#':>4} {'grade':>5} {'EF':>6} {'interval(d)':>12}")
    for (n, q, ef, iv) in sm2_schedule([3, 3, 3, 3, 3, 3]):
        print(f"{n:>4} {q:>5} {ef:>6} {iv:>12}")
