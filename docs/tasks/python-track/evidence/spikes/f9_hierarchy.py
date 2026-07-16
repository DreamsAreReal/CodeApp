# F9 s1: FileNotFoundError / ConnectionError are subclasses of OSError (md A-3 fix):
# one `except OSError` catches both the file branch and the network branch.
for boom in (FileNotFoundError, ConnectionError):
    try:
        raise boom("boom")
    except OSError as e:
        print(type(e).__name__)
print([c.__name__ for c in FileNotFoundError.__mro__])
print([c.__name__ for c in ConnectionError.__mro__])
