# Spike for PY.M13 s3: LBYL vs EAFP vs dict.get default — mirrors the lesson
# code panel (single-line try/except suites are valid syntax); plus the exception
# name printed via type(e).__name__ per the RS-03 checklist.
d = {"role": "qa"}

if "name" in d: ...  # LBYL: the check fails, nothing runs
try: print(d["name"])       # EAFP
except KeyError: print("Anonymous")
print(d.get("name", "Anonymous"))

try: d["name"]
except KeyError as e: print(type(e).__name__)
