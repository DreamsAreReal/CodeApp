# F10 s2: hints are DATA stored on the function object (__annotations__ dict).
def f(x: int) -> str: return str(x)

a = f.__annotations__
print(a['x'].__name__)
print(a['return'].__name__)
print(a)
