# Card PY.M3.args-unpacking/c1 — packing: extra positionals land in the args
# TUPLE, extra keywords in the kwargs DICT (dict order is guaranteed 3.7+).
def f(a, *args, **kwargs):
    print(a, args, kwargs)

f(1, 2, 3, x=4)
