def t():
    try:
        return "from try"
    finally:
        return "from finally"

print(t())
