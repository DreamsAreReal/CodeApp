# Card PY.M5.decorators/c1 (spike c04) — wrapper order: before -> func -> after,
# and the wrapped call still returns the original result.
def log(func):
    def wrapper(*args, **kwargs):
        print("before")
        result = func(*args, **kwargs)
        print("after")
        return result
    return wrapper

@log
def add(a, b):
    return a + b

print(add(2, 3))
