# Spike: measured memory of a 1M list-comp vs a genexpr on python3.12 (A-5:
# never quote the md's "~30 MB" — measure).
import sys

lst = [x ** 2 for x in range(1_000_000)]
container = sys.getsizeof(lst)
items = sum(sys.getsizeof(x) for x in lst)
gen = (x ** 2 for x in range(1_000_000))
print("list container bytes:", container)
print("int objects bytes:", items)
print("list total MB:", round((container + items) / 1024 / 1024, 1))
print("genexpr object bytes:", sys.getsizeof(gen))
