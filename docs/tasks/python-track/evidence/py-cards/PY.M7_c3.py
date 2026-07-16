from contextlib import contextmanager

@contextmanager
def cm():
    print("setup")
    yield 42
    print("teardown")

with cm() as v:
    print(v)
