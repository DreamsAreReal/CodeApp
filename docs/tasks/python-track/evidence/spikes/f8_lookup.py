# F8 s1 evidence: reading an attribute walks instance __dict__ -> class __dict__;
# a fresh instance has an empty __dict__, so c1.total is found on the class.
class Counter:
    total = 0

c1 = Counter()
c2 = Counter()
print(c1.total)
print(c1.__dict__)
