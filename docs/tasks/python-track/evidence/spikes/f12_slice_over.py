# F12 edge fact: slice bounds are clamped silently — no IndexError,
# unlike single-index access which raises.
s = "Test"
print(s[1:100])
try:
    print(s[100])
except IndexError as e:
    print(type(e).__name__)
