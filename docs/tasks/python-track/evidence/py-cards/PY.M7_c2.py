class CM:
    def __enter__(self):
        print("enter")
        return self
    def __exit__(self, *exc):
        print("exit")
        return False

try:
    with CM():
        print("body")
        raise ValueError("boom")
    print("after")
except ValueError as e:
    print(type(e).__name__)
