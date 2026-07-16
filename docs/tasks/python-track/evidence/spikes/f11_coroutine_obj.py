# F11 s2 + card c1 basis (RS-01 c19): calling an async def does NOT run the body.
# The never-awaited coroutine emits RuntimeWarning on GC — to STDERR (RS-03).
import asyncio


async def fetch():
    return 42


print(type(fetch()).__name__)   # coroutine object created, body not run
print(asyncio.run(fetch()))     # the loop drives a fresh coroutine -> 42
