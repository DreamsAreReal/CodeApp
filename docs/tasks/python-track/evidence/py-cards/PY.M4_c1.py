# Card PY.M4.closures-scope/c1 (spike c20) — late binding: the lambda captures
# the VARIABLE i (one shared cell), not its value; the default-arg idiom fixes it.
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])
funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])
