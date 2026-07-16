# F12 edge/card c6: assignment expression binds AND returns the value.
items = [1, 2, 3]
if (n := len(items)) > 2:
    print(n)
