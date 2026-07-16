# F8 misconception evidence (RS-02 A-2): the md interview example ("learn this
# verbatim") crashes with AttributeError because Circle/Rectangle lack __init__.
# This is the FIXED version — it actually runs.
class Circle:
    def __init__(self, r):
        self.r = r
    def area(self):
        return 3.14 * self.r ** 2

class Rectangle:
    def __init__(self, w, h):
        self.w = w
        self.h = h
    def area(self):
        return self.w * self.h

for shape in [Circle(2), Rectangle(3, 4)]:
    print(shape.area())
