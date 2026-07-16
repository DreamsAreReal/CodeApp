class Counter:
    total = 0
    def __init__(self):
        self.count = 0

c1 = Counter()
c2 = Counter()
c1.total = 5
print(c1.total, c2.total, Counter.total)
