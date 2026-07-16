from contextlib import contextmanager

@contextmanager
def cm():
    print("setup")
    yield 42
    print("teardown")

try:
    with cm() as v:
        raise ValueError("boom")
except ValueError as e:
    print(type(e).__name__)
