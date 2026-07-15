def make_multiplier(factor):
    def multiply(x):
        return x * factor
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
print(double.__closure__)
print(double.__closure__[0].cell_contents, triple.__closure__[0].cell_contents)
print(multiply_freevars := double.__code__.co_freevars)
