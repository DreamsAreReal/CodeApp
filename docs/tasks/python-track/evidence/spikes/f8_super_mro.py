# F8 s3 evidence (RS-02 A-7): super() goes to the NEXT class in the MRO, not to
# "the parent" — in a diamond, B's super() on a D instance lands on sibling C.
class A:
    def who(self):
        return "A"
class B(A):
    def who(self):
        return "B->" + super().who()
class C(A):
    def who(self):
        return "C->" + super().who()
class D(B, C):
    def who(self):
        return "D->" + super().who()

print(D().who())
print([c.__name__ for c in D.__mro__])
