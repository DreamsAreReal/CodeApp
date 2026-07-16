# F11 s4 sequential contrast: consecutive awaits do NOT overlap waits —
# the second coroutine is not even created until the first finishes,
# so "slow" completes before "fast" (no overtaking possible).
import asyncio


async def task(name, delay):
    await asyncio.sleep(delay)
    print("done:", name)
    return name


async def main():
    a = await task("slow", 0.05)
    b = await task("fast", 0.01)
    print([a, b])


asyncio.run(main())
