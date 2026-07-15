# Card PY.M1.names-objects/c4 — the MODIFY rung of the ladder (fix from segment s5):
# the sentinel-default repair of c1's buggy code. None is evaluated once at def-time,
# but a FRESH list is created in the body on every call — state no longer leaks.
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

print(add_item("a"))
print(add_item("b"))
