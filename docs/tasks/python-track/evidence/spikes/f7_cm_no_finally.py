# F7 s4 evidence (RS-02 B-9 half): in a @contextmanager WITHOUT try/finally the
# code after `yield` is unreachable when the with-body raises — the exception is
# reraised INSIDE the generator at the yield point. The try/finally variant keeps
# the teardown. Exception surfaced as a name only (RS-03: no traceback text).
from contextlib import contextmanager

@contextmanager
def timer_bad():
    print("start")
    yield
    print("elapsed")  # lost on exception

@contextmanager
def timer_good():
    print("start")
    try:
        yield
    finally:
        print("elapsed")

try:
    with timer_bad():
        raise ValueError("boom")
except ValueError as e:
    print("bad:", type(e).__name__)

try:
    with timer_good():
        raise ValueError("boom")
except ValueError as e:
    print("good:", type(e).__name__)
