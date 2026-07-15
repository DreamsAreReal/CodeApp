# Card PY.M2.collections-hash/c3 — dict preserves INSERTION order (guaranteed
# by the language spec since 3.7), not alphabetical order.
d = {}
d["b"] = 1
d["a"] = 2
d["c"] = 3
print(list(d))
