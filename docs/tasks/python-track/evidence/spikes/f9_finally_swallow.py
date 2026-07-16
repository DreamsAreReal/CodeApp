# F9 s4: a return inside finally DISCARDS the in-flight exception (and also
# overrides a return from try) — reference/compound_stmts: "the saved exception
# is discarded".
def read():
    try:
        raise ValueError("bad")
    finally:
        return "done"

def pick():
    try:
        return "from try"
    finally:
        return "from finally"

print(read())
print(pick())
