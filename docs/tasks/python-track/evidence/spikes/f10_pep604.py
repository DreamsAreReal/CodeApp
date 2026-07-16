# F10 s3: PEP 604 union syntax (3.10+) works at runtime AND builds a real
# runtime object (types.UnionType); `is None` check treats 0 as a value.
def label(x: int | None = None):
    if x is None: return "default"
    return "found"

print(label(), label(0))
print(type(int | None).__name__)
