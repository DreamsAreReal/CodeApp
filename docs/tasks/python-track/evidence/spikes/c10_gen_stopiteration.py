def gen():
    yield 1

g = gen()
print(next(g))
try:
    next(g)
except StopIteration:
    print("StopIteration")
