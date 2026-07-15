# Card PY.M6.generators/c3 (spike c10) — next() past the last yield raises
# StopIteration (name printed via except, no traceback text).
def gen():
    yield 1

g = gen()
print(next(g))
try:
    next(g)
except StopIteration:
    print("StopIteration")
