# F8 s6 evidence: classmethod receives the class (factory pattern), staticmethod
# receives nothing implicit (plain function in the class namespace).
class ApiClient:
    @classmethod
    def from_env(cls):
        return cls()
    @staticmethod
    def ping():
        return "pong"

print(type(ApiClient.from_env()).__name__)
print(ApiClient.ping())
