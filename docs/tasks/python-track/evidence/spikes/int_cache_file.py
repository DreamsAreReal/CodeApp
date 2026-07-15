a = 257
b = 257
print(a is b)          # in one file/compile unit: co_consts folding possible
c = 256; d = 256
print(c is d)
x = int("257"); y = int("257")
print(x is y)          # runtime-created: cache only -5..256
x2 = int("256"); y2 = int("256")
print(x2 is y2)
