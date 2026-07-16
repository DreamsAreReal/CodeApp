# Spike for PY.M13 s2: dumps -> loads round trip; True -> true, None -> null;
# a non-string dict key is coerced to str, so loads(dumps(x)) != x.
import json

s = json.dumps({"id": 1, "ok": True, "err": None})
print(s)
d = json.loads(s)
print(d["id"] + 1)

d2 = json.loads(json.dumps({1: "a"}))
print(d2)
print(d2 == {1: "a"})
