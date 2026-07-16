# F10 s4: Pydantic turns the SAME hints into a runtime gate: "1" is coerced
# to int 1, "abc" fails with ValidationError. Run inside the authoring venv
# (python3.12 + pydantic; versions logged in f10_pydantic_out.txt).
from pydantic import BaseModel, ValidationError

class User(BaseModel):
    id: int

u = User(id="1")
print(type(u.id).__name__, u.id)
try:
    User(id="abc")
except ValidationError as e:
    print(type(e).__name__)
