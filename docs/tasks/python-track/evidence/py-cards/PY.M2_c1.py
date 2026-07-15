# Card PY.M2.collections-hash/c1 (spike c22) — a dict key must be hashable:
# tuple works, list raises TypeError (name printed via except, no traceback text).
d = {}
d[(1, 2)] = "ok"
try:
    d[[1, 2]] = "no"
except TypeError:
    print("TypeError")
print(d[(1, 2)])
