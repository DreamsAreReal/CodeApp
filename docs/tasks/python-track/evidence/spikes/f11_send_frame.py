# F11 s5: a coroutine is driven by the SAME protocol as a generator:
# send(None) runs it to the first suspension; cr_frame mirrors gi_frame;
# the return value arrives as StopIteration.value (how the loop gets results).
import asyncio


async def f():
    n = 41
    await asyncio.sleep(0)
    n += 1
    return n


c = f()
c.send(None)                    # like next(g): run to the await suspension
print(c.cr_frame.f_locals)      # frozen locals, exactly like gi_frame
try:
    c.send(None)                # resume from the pause point
except StopIteration as e:
    print("StopIteration:", e.value)
