# Card PY.M1.names-objects/c2 — aliasing (RS-01 spike c02).
# b = a binds a second NAME to the same list object; mutation is visible via both.
a = [1, 2, 3]
b = a
b.append(4)
print(a)
print(a is b)
