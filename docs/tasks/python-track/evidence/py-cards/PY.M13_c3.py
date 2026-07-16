import json
d = json.loads(json.dumps({1: "a"}))
print(d)
print(d == {1: "a"})
