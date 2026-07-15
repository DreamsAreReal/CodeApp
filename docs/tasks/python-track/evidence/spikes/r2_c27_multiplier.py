def make_multiplier(n):
    def mul(x):
        return x * n
    return mul

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(5), triple(5))
