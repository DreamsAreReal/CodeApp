d = {"role": "qa"}
print(d.get("name", "Anonymous"))
try:
    print(d["name"])
except KeyError as e:
    print(type(e).__name__)
