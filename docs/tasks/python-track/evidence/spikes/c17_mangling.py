class P:
    def __init__(self):
        self.__x = 1

p = P()
print(p._P__x)
try:
    print(p.__x)
except AttributeError:
    print("AttributeError")
