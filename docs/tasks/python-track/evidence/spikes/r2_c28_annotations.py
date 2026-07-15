def f(x: int) -> str:
    return str(x)

print(f.__annotations__['x'].__name__)
print(f.__annotations__['return'].__name__)
