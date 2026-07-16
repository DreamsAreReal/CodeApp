# PY.M11.async-await / c2 — gather result order follows the ARGUMENT order.
import asyncio


async def task(name, delay):
    await asyncio.sleep(delay)
    return name


async def main():
    res = await asyncio.gather(task("slow", 0.05), task("fast", 0.01))
    print(res)


asyncio.run(main())
