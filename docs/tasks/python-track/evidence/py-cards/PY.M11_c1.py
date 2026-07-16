# PY.M11.async-await / c1 — calling an async def builds a coroutine object;
# only the loop runs it. NOTE: the first fetch() is never awaited BY DESIGN —
# its RuntimeWarning goes to STDERR (RS-03: expect compares stdout only).
import asyncio


async def fetch():
    return 42


print(type(fetch()).__name__)
print(asyncio.run(fetch()))
