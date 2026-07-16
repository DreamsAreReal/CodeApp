# F8 s5 evidence: @property reads run through the getter; assignment runs the
# setter, which can validate (raise). Exception surfaced as a name only (RS-03).
class Order:
    def __init__(self, total):
        self._total = total
    @property
    def total(self):
        return self._total
    @total.setter
    def total(self, v):
        if v < 0:
            raise ValueError("negative")
        self._total = v

o = Order(100)
print(o.total)
o.total = 250
print(o.total)
try:
    o.total = -1
except ValueError as e:
    print(type(e).__name__)
