import json
import django
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "coderacer.settings")
django.setup()

from problem.utils import generate_code_for_language


class MockVariable:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class MockMethod:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)
        self.is_constructor = kwargs.get("is_constructor", False)
        self.parameters = MockManager()


class MockManager:
    def __init__(self, items=None):
        self.items = items or []

    def all(self):
        return self

    def order_by(self, *args):
        return self.items


m = MockMethod(
    name="solve",
    type="INTEGER",
    custom_type_name="",
    template_type="",
    array_dimensions=1,
)
v = MockVariable(
    name="x", type="INTEGER", custom_type_name="", template_type="", array_dimensions=1
)
m.parameters.items.append(v)

runner, block = generate_code_for_language("PYTHON", [m], "", "")
print("BLOCK:")
print(block)
print("RUNNER:")
print(runner)
