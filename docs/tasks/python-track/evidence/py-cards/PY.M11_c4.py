# PY.M11.async-await / c4 — a blocking call inside a coroutine freezes the
# whole loop: "other" runs only after time.sleep returns.
import asyncio
import time


async def blocker():
    print("block start")
    time.sleep(0.05)
    print("block end")


async def other():
    print("other")


async def main():
    await asyncio.gather(blocker(), other())


asyncio.run(main())
