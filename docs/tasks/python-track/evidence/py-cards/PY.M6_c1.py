# Card PY.M6.generators/c1 (spike c08) — calling a generator function does NOT
# run its body: "created" prints before "start"; each next() runs to the yield.
def gen():
    print("start")
    yield 1
    print("middle")
    yield 2

g = gen()
print("created")
print(next(g))
print(next(g))
