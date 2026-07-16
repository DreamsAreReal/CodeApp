# Spike for PY.M13 deck: empty collections are falsy; a non-empty string "0" is truthy.
for v in ["", [], {}, set(), 0, "0", [0]]:
    print(repr(v), bool(v))
