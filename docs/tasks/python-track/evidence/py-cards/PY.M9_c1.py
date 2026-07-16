def read():
    try:
        raise ValueError("bad")
    finally:
        return "done"

print(read())
