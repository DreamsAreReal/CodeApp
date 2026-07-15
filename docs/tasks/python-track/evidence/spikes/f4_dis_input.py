def make_multiplier(factor):
    def multiply(x):
        return x * factor
    return multiply
