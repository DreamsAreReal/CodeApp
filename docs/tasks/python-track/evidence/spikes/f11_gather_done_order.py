# F11 s4 + card c3 (modify rung): done-prints expose the COMPLETION order
# (fast overtakes slow) while the result list keeps the argument order.
import asyncio


async def task(name, delay):
    await asyncio.sleep(delay)
    print("done:", name)
    return name


async def main():
    res = await asyncio.gather(task("slow", 0.05), task("fast", 0.01))
    print(res)


asyncio.run(main())
