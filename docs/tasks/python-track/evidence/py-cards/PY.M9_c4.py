try:
    raise ConnectionError("api down")
except FileNotFoundError:
    print("file")
except OSError as e:
    print("os:", type(e).__name__)
except Exception:
    print("exc")
