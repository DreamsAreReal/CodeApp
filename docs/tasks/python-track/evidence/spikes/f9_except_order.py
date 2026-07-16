# F9 s2: handlers are tried in the order written; the FIRST match wins,
# so a general clause before a specific one makes the specific one unreachable.
try:
    raise FileNotFoundError("no cfg")
except OSError:
    print("A")
except FileNotFoundError:
    print("B")
