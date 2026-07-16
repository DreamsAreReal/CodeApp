# F10 s1: hints do NOT gate the call — CPython runs add("a", "b") happily
# (PEP 484: "no type checking happens at runtime").
def add(a: int, b: int) -> int:
    return a + b

print(add("a", "b"))
