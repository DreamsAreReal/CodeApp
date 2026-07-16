# F9 s3: else runs ONLY on the clean path; finally runs on both paths.
try: x = 1
except ValueError: print("err")
else: print("else")
finally: print("finally")

try: raise ValueError("bad")
except ValueError: print("err2")
else: print("else2")
finally: print("finally2")
