# Card PY.M5.decorators/c2 (spike c05) — without functools.wraps the decorated
# function reports the wrapper's name.
def deco(f):
    def wrapper(*args, **kwargs):
        return f(*args, **kwargs)
    return wrapper

@deco
def greet():
    pass

print(greet.__name__)
