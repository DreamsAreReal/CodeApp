# Card PY.M5.decorators/c3 (spike c07) — the MODIFY rung of c1: the wrapper
# forgets `return` -> the decorated call yields None (the classic "decorator
# swallowed my result").
def deco(f):
    def wrapper(*args, **kwargs):
        f(*args, **kwargs)
    return wrapper

@deco
def add(a, b):
    return a + b

print(add(2, 3))
