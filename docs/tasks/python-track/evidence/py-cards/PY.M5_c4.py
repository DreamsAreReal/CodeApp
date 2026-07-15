# Card PY.M5.decorators/c4 (spike c06) — decorators run at DEF-time, not at
# call time: "decorating foo" prints during import, before "done".
def deco(f):
    print("decorating", f.__name__)
    return f

@deco
def foo():
    pass

print("done")
