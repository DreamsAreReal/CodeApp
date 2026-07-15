# Card PY.M4.closures-scope/c3 (spike r2_c27) — each factory call creates its
# own scope: double and triple hold DIFFERENT cells for factor.
def make_multiplier(factor):
    def multiply(x):
        return x * factor
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(5), triple(5))
