# Spike for PY.M13 s1: the slash operator builds child paths (pure part, no I/O);
# suffix/stem/name/parts anatomy. Mirrors the lesson code panel.
from pathlib import Path

p = Path("tests") / "users.json"
print(p)
print(p.suffix, p.stem)
print(p.name)
print(p.parts)
