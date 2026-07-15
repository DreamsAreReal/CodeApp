# Card PY.M6.generators/c4 — the MODIFY rung of c2: materialise a LIST when the
# data is needed twice; a list can be summed repeatedly.
g = [x * x for x in range(3)]
print(sum(g))
print(sum(g))
