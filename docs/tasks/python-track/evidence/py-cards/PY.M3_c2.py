# Card PY.M3.args-unpacking/c2 — the MODIFY rung: the same call as c1 built
# from containers via * and ** unpacking produces the same binding.
def f(a, *args, **kwargs):
    print(a, args, kwargs)

pos = [2, 3]
kw = {"x": 4}
f(1, *pos, **kw)
