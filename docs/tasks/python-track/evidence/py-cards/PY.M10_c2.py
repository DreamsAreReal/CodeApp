def f(x: int) -> str: return str(x)

a = f.__annotations__
print(a['x'].__name__)
print(a['return'].__name__)
