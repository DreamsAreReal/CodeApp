# F11 s7 fixed variant: await asyncio.sleep yields control to the loop —
# "other" runs DURING the pause. Deterministic print order.
import asyncio


async def blocker():
    print("block start")
    await asyncio.sleep(0.05)   # suspension point: loop runs other tasks
    print("block end")


async def other():
    print("other")


async def main():
    await asyncio.gather(blocker(), other())


asyncio.run(main())
