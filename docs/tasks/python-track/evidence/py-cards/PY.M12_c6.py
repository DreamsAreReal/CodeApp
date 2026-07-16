# PY.M12.strings-flow / c6 — walrus binds AND returns the value.
items = [1, 2, 3]
if (n := len(items)) > 2:
    print(n)
