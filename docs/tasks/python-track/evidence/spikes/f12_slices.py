# F12 s1: slice semantics on "Test" — half-open interval, negative index,
# reverse via step -1, every-second via step 2.
s = "Test"
print(s[1:3]); print(s[-1])
print(s[::-1])
print(s[::2])
