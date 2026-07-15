# Spike: the frozen generator frame is a real object — locals + instruction
# pointer survive between next() calls (evidence for PY.M6 s2 x-ray).
import inspect

def gen():
    n = 41
    yield 1
    n += 1
    yield n

g = gen()
print(inspect.getgeneratorstate(g))   # GEN_CREATED — body not started
next(g)
print(inspect.getgeneratorstate(g))   # GEN_SUSPENDED — frozen at yield
print(g.gi_frame.f_locals)            # locals kept alive in the frame
print(g.gi_frame.f_lasti >= 0)        # instruction pointer is real
print(next(g))                        # resumes: n += 1 -> 42
print(inspect.getgeneratorstate(g))
