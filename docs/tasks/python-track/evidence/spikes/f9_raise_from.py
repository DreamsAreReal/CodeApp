# F9 s5: `raise X from e` attaches e as __cause__ — the chain survives wrapping.
try:
    try:
        int("x")
    except ValueError as e:
        raise RuntimeError("cfg") from e
except RuntimeError as e:
    print(type(e).__name__)
    print(type(e.__cause__).__name__)
