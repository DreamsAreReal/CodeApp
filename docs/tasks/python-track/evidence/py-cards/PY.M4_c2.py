# Card PY.M4.closures-scope/c2 (spike c21) — nonlocal rebinds the ENCLOSING n;
# without it the assignment would make n local (UnboundLocalError).
def make_counter():
    n = 0
    def inc():
        nonlocal n
        n += 1
        return n
    return inc

c = make_counter()
print(c(), c(), c())
