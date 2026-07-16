def read():
    try:
        raise ValueError("bad")
    finally:
        print("cleanup")

try:
    print(read())
except ValueError as e:
    print(type(e).__name__)
