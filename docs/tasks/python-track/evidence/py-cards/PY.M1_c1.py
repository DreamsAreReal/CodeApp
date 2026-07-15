# Card PY.M1.names-objects/c1 — mutable default argument (RS-01 spike c01).
# The default list is evaluated ONCE at def-time and shared between calls.
def add_item(item, items=[]):
    items.append(item)
    return items

print(add_item("a"))
print(add_item("b"))
