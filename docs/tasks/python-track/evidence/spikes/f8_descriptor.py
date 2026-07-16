# F8 s4 evidence (RS-02 B-5): a function in a class body is a descriptor; the dot
# turns it into a bound method via __get__. Printed values are type NAMES and
# equality checks only (RS-03: no memory addresses in output).
class User:
    def greet(self):
        return "hi"

u = User()
raw = User.__dict__["greet"]
bound = raw.__get__(u, User)
print(type(raw).__name__)
print(type(bound).__name__)
print(bound() == u.greet())
print(User.greet(u) == u.greet())
