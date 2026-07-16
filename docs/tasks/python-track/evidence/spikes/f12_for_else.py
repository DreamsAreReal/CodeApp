# F12 s3 + card c4 (RS-01 c23): loop else runs when break did NOT fire.
for x in [1, 2, 3]:
    if x == 99:
        print("found!")
        break
else:
    print("not found")
