# Card PY.M2.collections-hash/c2 — the MODIFY rung: c1's failing list key is
# frozen into a tuple, so the same data becomes a legal (hashable) dict key.
lst = [1, 2]
d = {}
d[tuple(lst)] = "ok"
print(d[(1, 2)])
print((1, 2) in d)
