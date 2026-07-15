def deco(f):
    def wrapper(*a, **k):
        return f(*a, **k)
    return wrapper

@deco
def greet():
    pass

print(greet.__name__)
