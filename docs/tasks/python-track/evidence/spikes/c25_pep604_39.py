def f(x: int | None) -> int:
    return x or 0
print(f(None))
