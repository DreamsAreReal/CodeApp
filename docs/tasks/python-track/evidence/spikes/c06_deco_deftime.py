def deco(f):
    print("decorating", f.__name__)
    return f

@deco
def foo():
    pass

print("done")
