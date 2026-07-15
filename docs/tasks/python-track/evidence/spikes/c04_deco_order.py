def log(func):
    def wrapper(*a, **k):
        print("before")
        r = func(*a, **k)
        print("after")
        return r
    return wrapper

@log
def add(a, b):
    return a + b

print(add(2, 3))
