import dis

def make_mult(factor):
    def mult(x):
        return x * factor
    return mult

print("--- make_mult ---")
dis.dis(make_mult)
print("--- cells ---")
d = make_mult(2)
print(d.__closure__[0].cell_contents)
