# PY.M12.strings-flow / c4 (RS-01 c23) — loop else runs when break did not fire.
for x in [1, 2, 3]:
    if x == 99:
        print("found!")
        break
else:
    print("not found")
