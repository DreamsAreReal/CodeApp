# Spike for PY.M13 deck: zip stops at the shortest iterable; enumerate numbers from start.
for i, (a, b) in enumerate(zip([1, 2, 3], "ab"), start=1):
    print(i, a, b)
