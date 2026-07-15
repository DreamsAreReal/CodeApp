import asyncio, time

async def task():
    await asyncio.sleep(0.1)

async def main():
    t0 = time.perf_counter()
    await task(); await task(); await task()
    seq = time.perf_counter() - t0
    t0 = time.perf_counter()
    await asyncio.gather(task(), task(), task())
    par = time.perf_counter() - t0
    print(f"seq={seq:.2f}s par={par:.2f}s speedup>{seq/par:.1f}x")

asyncio.run(main())
