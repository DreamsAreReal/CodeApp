d = {}
d[(1, 2)] = "ok"
try:
    d[[1, 2]] = "no"
except TypeError:
    print("TypeError")
print(d[(1, 2)])
