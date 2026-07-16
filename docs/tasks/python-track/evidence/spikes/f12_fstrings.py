# F12 s2 panel run: format specs (:.2f, :04d), !r conversion, = debug.
name = "Alice"
print(f"{99.5:.2f}", f"{7:04d}")
print(f"{name!r}")
print(f"{name=}")
