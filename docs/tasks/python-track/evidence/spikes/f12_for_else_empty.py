# F12 hook fact: the loop else ALSO runs for an empty iterable —
# the loop finished (zero iterations) without executing break.
for x in []:
    print("body")
else:
    print("else ran")
