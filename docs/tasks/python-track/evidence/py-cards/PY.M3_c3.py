# Card PY.M3.args-unpacking/c3 — starred assignment: first grabs the head,
# *rest collects the tail into a LIST (not a tuple).
first, *rest = [1, 2, 3, 4]
print(first)
print(rest)
