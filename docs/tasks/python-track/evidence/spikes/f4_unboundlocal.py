count = 0
def inc():
    try:
        count += 1
    except UnboundLocalError as e:
        print(type(e).__name__)
        print(e)
inc()
