# F11 s4 + card c2 basis: gather result order follows the ARGUMENT order,
# not the completion order (fast completes first, slow is still first in res).
import asyncio


async def task(name, delay):
    await asyncio.sleep(delay)
    return name


async def main():
    res = await asyncio.gather(task("slow", 0.05), task("fast", 0.01))
    print(res)


asyncio.run(main())
