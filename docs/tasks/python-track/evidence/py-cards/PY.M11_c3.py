# PY.M11.async-await / c3 (modify rung of c2) — done-prints expose the
# completion order (fast first) while the result list keeps argument order.
import asyncio


async def task(name, delay):
    await asyncio.sleep(delay)
    print("done:", name)
    return name


async def main():
    res = await asyncio.gather(task("slow", 0.05), task("fast", 0.01))
    print(res)


asyncio.run(main())
