# F11 s7 + card c4 basis: a BLOCKING call inside a coroutine freezes the loop —
# "other" cannot run until time.sleep returns. Deterministic print order.
import asyncio
import time


async def blocker():
    print("block start")
    time.sleep(0.05)            # sync call: the whole loop is stuck
    print("block end")


async def other():
    print("other")


async def main():
    await asyncio.gather(blocker(), other())


asyncio.run(main())
