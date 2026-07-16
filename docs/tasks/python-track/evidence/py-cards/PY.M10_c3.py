def add(a: int, b: int) -> int:
    if not isinstance(a, int) or not isinstance(b, int):
        raise TypeError("int required")
    return a + b

print(add(2, 3))
try:
    print(add("a", "b"))
except TypeError as e:
    print(type(e).__name__)
