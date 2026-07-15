def deco(f):
    def wrapper(*a, **k):
        f(*a, **k)
    return wrapper

@deco
def add(a, b):
    return a + b

print(add(2, 3))
