class Counter:
    total = 0
    def inc(self):
        Counter.total += 1

c1 = Counter()
c2 = Counter()
c1.inc()
c2.inc()
print(c1.total, c2.total, Counter.total)
