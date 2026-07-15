import asyncio

async def f():
    return 42

print(type(f()).__name__)
print(asyncio.run(f()))
