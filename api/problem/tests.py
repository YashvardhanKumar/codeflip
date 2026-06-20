import pytest
from django.urls import reverse
from rest_framework import status
from .models import Problem, Tags, Difficulty


@pytest.mark.django_db
class TestProblemAPI:
    def test_list_problems(self, client):
        # Create a sample problem
        tag = Tags.objects.create(tags="Array")
        problem = Problem.objects.create(
            name="Two Sum",
            problem_description="Solve two sum",
            difficulty=Difficulty.EASY,
        )
        problem.tags.add(tag)

        url = reverse("problem-list")
        response = client.get(url)

        assert response.status_code == status.HTTP_200_OK
        # Check if the problem is in the results
        # Assuming PaginatedResponse based on viewset
        assert len(response.data["results"]) >= 1
        assert response.data["results"][0]["name"] == "Two Sum"

    def test_get_problem_detail(self, client):
        problem = Problem.objects.create(
            name="Unique Problem",
            problem_description="Detail check",
            difficulty=Difficulty.MEDIUM,
        )
        url = reverse("problem-detail", args=[problem.id])
        response = client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Unique Problem"

    def test_filter_by_tag(self, client):
        tag = Tags.objects.create(tags="Recursion")
        p1 = Problem.objects.create(name="Fibonacci", difficulty=Difficulty.EASY)
        p1.tags.add(tag)
        Problem.objects.create(name="Merge Sort", difficulty=Difficulty.MEDIUM)

        url = reverse("problem-by-tag")
        response = client.get(url, {"tag": "Recursion"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == "Fibonacci"


@pytest.mark.django_db
def test_generate_codeblocks_for_problem_force():
    from django.db.models.signals import post_save, post_delete
    from .signals import on_method_change, on_variable_change
    from .models import Problem, Method, Variable, Codeblock
    from .utils import generate_codeblocks_for_problem

    # Disconnect signals to test raw generation function isolation
    post_save.disconnect(on_method_change, sender=Method)
    post_save.disconnect(on_variable_change, sender=Variable)

    try:
        problem = Problem.objects.create(
            name="Add Two Numbers",
            problem_description="Add two numbers",
            difficulty=Difficulty.EASY,
        )
        method = Method.objects.create(
            problem=problem,
            name="add",
            type="INTEGER",
            array_dimensions=0,
        )
        Variable.objects.create(
            problem=problem,
            method=method,
            name="a",
            type="INTEGER",
            array_dimensions=0,
        )

        # Initial generation
        generate_codeblocks_for_problem(problem)
        assert problem.codeblocks.exists()
        cpp_cb = problem.codeblocks.get(language="CPP")
        initial_block = cpp_cb.block

        # Change the method name to "sum_values"
        method.name = "sum_values"
        method.save()

        # Generate without force: block should retain the old suffix (the "add" signature)
        generate_codeblocks_for_problem(problem, force=False)
        cpp_cb.refresh_from_db()
        assert "add(" in cpp_cb.block
        assert "sum_values(" not in cpp_cb.block

        # Generate with force=True: block should be updated to have "sum_values" signature
        generate_codeblocks_for_problem(problem, force=True)
        cpp_cb.refresh_from_db()
        assert "sum_values(" in cpp_cb.block
        assert "add(" not in cpp_cb.block
    finally:
        # Reconnect signals
        post_save.connect(on_method_change, sender=Method)
        post_save.connect(on_variable_change, sender=Variable)


@pytest.mark.django_db
def test_custom_type_parsing_and_printing():
    from .models import Problem, Method, Variable, CustomType, CustomTypeLanguage
    from .utils import generate_codeblocks_for_problem

    problem = Problem.objects.create(
        name="Custom Type Problem",
        problem_description="Check custom type features",
        difficulty=Difficulty.EASY,
    )
    # Method returns custom type ListNode and accepts ListNode
    method = Method.objects.create(
        problem=problem,
        name="solve",
        type="ListNode",
        array_dimensions=0,
    )
    Variable.objects.create(
        problem=problem,
        method=method,
        name="head",
        type="ListNode",
        array_dimensions=0,
    )

    # Set up CustomType and CustomTypeLanguage
    ct = CustomType.objects.create(name="ListNode")

    # C++ Custom Type Language with input and print
    CustomTypeLanguage.objects.create(
        custom_type=ct,
        language="CPP",
        class_declaration="struct ListNode { int val; ListNode* next; };",
        input_output_function="ListNode* input() { return nullptr; }\nvoid print(ListNode* head) { }",
    )

    # Java Custom Type Language with input and print
    CustomTypeLanguage.objects.create(
        custom_type=ct,
        language="JAVA",
        class_declaration="class ListNode { int val; ListNode next; }",
        input_output_function="class Parser {\n    static ListNode input(Scanner sc) { return null; }\n    static void print(ListNode head) {}\n}",
    )

    # Generate code blocks
    generate_codeblocks_for_problem(problem, force=True)

    # Check CPP
    from .utils import assemble_full_code

    cpp_cb = problem.codeblocks.get(language="CPP")

    # In database:
    assert "ListNode* head = input();" in cpp_cb.runner_code
    assert "print(result);" in cpp_cb.runner_code
    assert "struct ListNode" not in cpp_cb.runner_code
    assert "struct ListNode" in cpp_cb.block
    assert "ListNode* input()" not in cpp_cb.runner_code

    # Assembled for Judge0:
    cpp_assembled = assemble_full_code(problem, "CPP", "class Solution {};")
    assert "struct ListNode { int val; ListNode* next; };" in cpp_assembled
    assert "ListNode* input() { return nullptr; }" in cpp_assembled
    assert "class Solution {};" in cpp_assembled
    assert "ListNode* head = input();" in cpp_assembled

    # Check Java
    java_cb = problem.codeblocks.get(language="JAVA")

    # In database:
    assert "ListNode head = Parser.input(sc);" in java_cb.runner_code
    assert "Parser.print(result);" in java_cb.runner_code
    assert "class ListNode" not in java_cb.runner_code
    assert "class ListNode" in java_cb.block
    assert "class Parser" not in java_cb.runner_code

    # Assembled for Judge0:
    java_assembled = assemble_full_code(problem, "JAVA", "class Solution {}")
    assert "class ListNode { int val; ListNode next; }" in java_assembled
    assert "class Parser {" in java_assembled
    assert "class Solution {}" in java_assembled
    assert "ListNode head = Parser.input(sc);" in java_assembled


@pytest.mark.django_db(transaction=True)
def test_signals_auto_regenerate_codeblocks():
    from .models import Problem, Method, Variable, Codeblock
    from .utils import generate_codeblocks_for_problem

    problem = Problem.objects.create(
        name="Signal Test Problem",
        problem_description="Verify signals run",
        difficulty=Difficulty.EASY,
    )
    method = Method.objects.create(
        problem=problem,
        name="old_method_name",
        type="INTEGER",
        array_dimensions=0,
    )
    Variable.objects.create(
        problem=problem,
        method=method,
        name="a",
        type="INTEGER",
        array_dimensions=0,
    )

    # Initial generation (we trigger it manually once)
    generate_codeblocks_for_problem(problem)
    cpp_cb = problem.codeblocks.get(language="CPP")
    assert "old_method_name(" in cpp_cb.block

    # Update Method name and save: should trigger post_save signal and regenerate
    method.name = "new_method_name"
    method.save()

    cpp_cb.refresh_from_db()
    assert "new_method_name(" in cpp_cb.block
    assert "old_method_name(" not in cpp_cb.block


def test_clean_js_ts_fs_imports():
    from .utils import clean_js_ts_fs_imports
    from user.models import CodingLanguage

    js_code = "const fs = require('fs');\nconst data = fs.readFileSync(0);\nconsole.log(data);"
    cleaned_js = clean_js_ts_fs_imports(js_code, CodingLanguage.JAVASCRIPT)
    assert "const fs = require('fs');" not in cleaned_js
    assert "const data = fs.readFileSync(0);" in cleaned_js

    ts_code = "import * as fs from 'fs';\ndeclare var require: any;\nconst fs = require('fs');\nconst x = 42;"
    cleaned_ts = clean_js_ts_fs_imports(ts_code, CodingLanguage.TYPESCRIPT)
    assert "import * as fs from 'fs';" not in cleaned_ts
    assert "const fs = require('fs');" not in cleaned_ts
    assert "declare var require: any;" not in cleaned_ts
    assert "const x = 42;" in cleaned_ts
