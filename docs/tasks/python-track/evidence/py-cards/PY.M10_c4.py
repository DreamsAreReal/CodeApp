def label(x: int | None = None):
    if x is None: return "default"
    return "found"

print(label())
print(label(0))
