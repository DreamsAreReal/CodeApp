# Card PY.M1.names-objects/c3 — tuple immutability is shallow (RS-01 spike c03).
# The tuple's slots are frozen; the list OBJECT behind slot 1 stays mutable.
t = (1, [2, 3])
t[1].append(4)
print(t)
