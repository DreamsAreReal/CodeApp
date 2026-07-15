# Card PY.M6.generators/c2 (spike c09) — a generator is single-use: the second
# sum() gets an exhausted iterator and returns 0.
g = (x * x for x in range(3))
print(sum(g))
print(sum(g))
