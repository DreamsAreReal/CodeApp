# Spike for PY.M13 s1: glob filters by pattern. Files are created in a temp dir
# so the run is reproducible; glob order is not guaranteed -> sorted() for determinism.
import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as td:
    root = Path(td)
    for name in ["test_login.py", "test_cart.py", "conftest.py", "readme.md"]:
        (root / name).write_text("")
    print(sorted(f.name for f in root.glob("test_*.py")))
