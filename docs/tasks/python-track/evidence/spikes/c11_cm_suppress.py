class CM:
    def __enter__(self):
        print("enter")
        return self
    def __exit__(self, *exc):
        print("exit")
        return True

with CM():
    print("body")
    raise ValueError("boom")
print("after")
