from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.admin.views.decorators import staff_member_required
from .models import Problem, Codeblock, Testcase, DataType
from django import forms
import json
import os
from django.contrib import messages
from django.contrib import admin
from django.contrib.auth import get_user_model, login
from django.http import StreamingHttpResponse, JsonResponse
from django.forms import inlineformset_factory
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from user.models import CodingLanguage
from ai.services import AIService
from ai.tasks import generate_testcases_task

User = get_user_model()


@staff_member_required
def rootops(request):
    return render(
        request,
        "problem/rootops.html",
        {
            "user": request.user,
            "is_superuser": request.user.is_superuser,
            "languages": [
                (lang_code, lang_name)
                for lang_code, lang_name in CodingLanguage.choices
            ],
        },
    )


def root_login(request):
    return redirect("moderator_login")


class ModeratorLoginForm(forms.Form):
    email = forms.EmailField(
        widget=forms.EmailInput(
            attrs={"class": "custom-input", "placeholder": "Enter moderator email"}
        )
    )


def moderator_login(request):
    if request.method == "POST":
        form = ModeratorLoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data["email"]
            user = User.objects.filter(email=email, is_staff=True).first()
            if user:
                login(
                    request, user, backend="django.contrib.auth.backends.ModelBackend"
                )
                messages.success(request, f"Logged in as moderator: {user.username}")
                return redirect("rootops")
            else:
                messages.error(request, "No moderator found with this email.")
    else:
        form = ModeratorLoginForm()
    return render(request, "admin/moderator_login.html", {"form": form})


class CustomProblemForm(forms.ModelForm):
    problem_description = forms.CharField(widget=CKEditorUploadingWidget())

    class Meta:
        model = Problem
        fields = ["name", "problem_description", "difficulty"]
        widgets = {
            "name": forms.TextInput(
                attrs={"class": "custom-input", "placeholder": "Problem Title"}
            ),
            "difficulty": forms.Select(attrs={"class": "custom-input"}),
        }

    class Media:
        js = ("admin/js/codeblock_updater.js", "admin/js/cm6_loader.js")


CodeBlockFormSet = inlineformset_factory(
    Problem,
    Codeblock,
    fields=["language", "block", "runner_code"],
    extra=0,
    can_delete=True,
    widgets={
        "language": forms.Select(attrs={"class": "custom-input"}),
        "block": forms.Textarea(
            attrs={
                "class": "custom-input",
                "rows": 10,
                "placeholder": "Boilerplate code for the user",
            }
        ),
        "runner_code": forms.Textarea(
            attrs={
                "class": "custom-input",
                "rows": 10,
                "placeholder": "Runner code for execution",
            }
        ),
    },
)

from .models import Variable, Method


class TypeSelectForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .models import VariableType, CustomType

        choices = list(VariableType.choices)
        custom_types = CustomType.objects.all()
        for ct in custom_types:
            choices.append((ct.name, f"Custom: {ct.name}"))

        type_choices = [("", "---------")] + choices

        if "type" in self.fields:
            old_field = self.fields["type"]
            self.fields["type"] = forms.ChoiceField(
                label=old_field.label,
                help_text=old_field.help_text,
                choices=type_choices,
                widget=forms.Select(attrs={"class": "custom-input"}),
            )
        if "template_type" in self.fields:
            old_field = self.fields["template_type"]
            temp_choices = [("", "---------")] + choices
            self.fields["template_type"] = forms.ChoiceField(
                label=old_field.label,
                help_text=old_field.help_text,
                choices=temp_choices,
                required=False,
                widget=forms.Select(attrs={"class": "custom-input"}),
            )


MethodFormSet = inlineformset_factory(
    Problem,
    Method,
    form=TypeSelectForm,
    fields=["name", "is_constructor", "type", "template_type", "array_dimensions"],
    extra=1,
    can_delete=True,
    widgets={
        "name": forms.TextInput(
            attrs={"class": "custom-input", "placeholder": "Method Name"}
        ),
        "is_constructor": forms.CheckboxInput(
            attrs={"style": "margin-left: 10px; transform: scale(1.2);"}
        ),
        "array_dimensions": forms.NumberInput(
            attrs={"class": "custom-input", "min": 1}
        ),
    },
)

VariableFormSet = inlineformset_factory(
    Problem,
    Variable,
    form=TypeSelectForm,
    fields=["method", "name", "type", "template_type", "array_dimensions"],
    extra=1,
    can_delete=True,
    widgets={
        "method": forms.Select(attrs={"class": "custom-input"}),
        "name": forms.TextInput(
            attrs={"class": "custom-input", "placeholder": "Variable Name"}
        ),
        "array_dimensions": forms.NumberInput(
            attrs={"class": "custom-input", "min": 1}
        ),
    },
)

from .models import ProblemTags

ProblemTagsFormSet = inlineformset_factory(
    Problem,
    ProblemTags,
    fields=["tag"],
    extra=1,
    can_delete=True,
    widgets={
        "tag": forms.Select(attrs={"class": "custom-input"}),
    },
)


class CustomTypeForm(forms.ModelForm):
    class Meta:
        from .models import CustomType

        model = CustomType
        fields = ["name"]
        widgets = {
            "name": forms.TextInput(
                attrs={"class": "custom-input", "placeholder": "e.g., ListNode"}
            )
        }


from .models import CustomType, CustomTypeLanguage

CustomTypeLanguageFormSet = inlineformset_factory(
    CustomType,
    CustomTypeLanguage,
    fields=["language", "class_declaration", "input_output_function"],
    extra=1,
    can_delete=True,
    widgets={
        "language": forms.Select(attrs={"class": "custom-input"}),
        "class_declaration": forms.Textarea(attrs={"class": "custom-input", "rows": 4}),
        "input_output_function": forms.Textarea(
            attrs={"class": "custom-input", "rows": 4}
        ),
    },
)


class CustomTestcaseForm(forms.ModelForm):
    class Meta:
        model = Testcase
        fields = ["problem", "input", "output", "display_testcase"]
        widgets = {
            "problem": forms.Select(attrs={"class": "custom-input"}),
            "input": forms.Textarea(
                attrs={
                    "class": "custom-input",
                    "rows": 3,
                    "placeholder": "Test input...",
                }
            ),
            "output": forms.Textarea(
                attrs={
                    "class": "custom-input",
                    "rows": 3,
                    "placeholder": "Expected output...",
                }
            ),
            "display_testcase": forms.CheckboxInput(attrs={"class": "custom-checkbox"}),
        }


@staff_member_required
def generate_testcases_async(request):
    """
    Starts a background task to generate test cases.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid method"}, status=405)

    problem_id = request.POST.get("problem")
    count = int(request.POST.get("count", 100))

    # Start Celery task
    task = generate_testcases_task.delay(problem_id, count)

    return JsonResponse({"status": "pending", "task_id": task.id})


import json
from .utils import generate_code_for_language
from user.models import CodingLanguage
from django.views.decorators.csrf import csrf_exempt


@staff_member_required
@csrf_exempt
def generate_codeblocks_preview(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid method"}, status=405)

    try:
        data = json.loads(request.body)
        variables_data = data.get("variables", [])
        object_declarations = data.get("object_declarations", {})
        input_functions = data.get(
            "input_output_functions", data.get("input_functions", {})
        )

        # We need to construct mock variable objects
        class MockVariable:
            def __init__(self, **kwargs):
                self.__dict__.update(kwargs)

        class MockManager:
            def __init__(self, items=None):
                self.items = items or []

            def all(self):
                return self

            def order_by(self, *args):
                return self.items

        class MockMethod:
            def __init__(self, **kwargs):
                self.__dict__.update(kwargs)
                self.parameters = MockManager()

        variables = []
        for v in variables_data:
            if not v.get("name") or not v.get("type"):
                continue
            variables.append(
                MockVariable(
                    name=v.get("name"),
                    type=v.get("type"),
                    custom_type_name=v.get("custom_type_name", ""),
                    template_type=v.get("template_type", ""),
                    array_dimensions=int(v.get("array_dimensions") or 1),
                )
            )

        if not variables:
            return JsonResponse({"error": "No variables defined"}, status=400)

        dummy_method = MockMethod(name="solve", type="void", array_dimensions=1)
        dummy_method.parameters.items = variables

        results = {}
        for lang_code, lang_name in CodingLanguage.choices:
            obj_decl = object_declarations.get(lang_code, "")
            inp_func = input_functions.get(lang_code, "")
            runner_code, block = generate_code_for_language(
                lang_code, [dummy_method], obj_decl, inp_func
            )
            results[lang_code] = {"runner_code": runner_code, "block": block}

        return JsonResponse({"success": True, "codeblocks": results})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@staff_member_required
def add_problem_custom(request):
    step = int(request.GET.get("step", 1))
    problem_id = request.GET.get("problem_id")
    problem = None
    if problem_id:
        from django.shortcuts import get_object_or_404
        from .models import Problem

        problem = get_object_or_404(Problem, id=problem_id)

    form = CustomProblemForm(instance=problem)
    tags_formset = ProblemTagsFormSet(instance=problem)

    ct_form = CustomTypeForm()
    ctl_formset = CustomTypeLanguageFormSet()

    method_formset = MethodFormSet(instance=problem)
    var_formset = VariableFormSet(instance=problem)
    formset = CodeBlockFormSet(instance=problem)

    if request.method == "POST":
        post_data = request.POST.copy()
        if step == 1:
            form = CustomProblemForm(post_data, instance=problem)
            if form.is_valid():
                problem = form.save()
                return redirect(
                    f"/api/rootops/add-problem/?step=2&problem_id={problem.id}"
                )
        elif step == 2:
            if not problem:
                return redirect("/api/rootops/add-problem/?step=1")
            tags_formset = ProblemTagsFormSet(post_data, instance=problem)
            if tags_formset.is_valid():
                tags_formset.save()

                new_tags_str = post_data.get("new_tags", "")
                if new_tags_str:
                    from .models import Tags, ProblemTags

                    tag_names = [
                        t.strip() for t in new_tags_str.split(",") if t.strip()
                    ]
                    for t_name in tag_names:
                        tag, created = Tags.objects.get_or_create(tags=t_name)
                        ProblemTags.objects.get_or_create(problem=problem, tag=tag)

                return redirect(
                    f"/api/rootops/add-problem/?step=3&problem_id={problem.id}"
                )
        elif step == 3:
            if not problem:
                return redirect("/api/rootops/add-problem/?step=1")

            if "skip" in post_data:
                return redirect(
                    f"/api/rootops/add-problem/?step=4&problem_id={problem.id}"
                )

            ct_form = CustomTypeForm(post_data)
            if ct_form.is_valid():
                ct = ct_form.save()
                ctl_formset = CustomTypeLanguageFormSet(post_data, instance=ct)
                if ctl_formset.is_valid():
                    ctl_formset.save()
                    return redirect(
                        f"/api/rootops/add-problem/?step=4&problem_id={problem.id}"
                    )
        elif step == 4:
            if not problem:
                return redirect("/api/rootops/add-problem/?step=1")
            method_formset = MethodFormSet(post_data, instance=problem)
            if method_formset.is_valid():
                method_formset.save()
                return redirect(
                    f"/api/rootops/add-problem/?step=5&problem_id={problem.id}"
                )
        elif step == 5:
            if not problem:
                return redirect("/api/rootops/add-problem/?step=1")
            var_formset = VariableFormSet(post_data, instance=problem)
            # Ensure method queryset is correct for validation
            for f in var_formset.forms:
                if "method" in f.fields:
                    f.fields["method"].queryset = problem.methods.all()
            if var_formset.is_valid():
                var_formset.save()
                from .utils import generate_codeblocks_for_problem

                generate_codeblocks_for_problem(problem, force=True)
                return redirect(
                    f"/api/rootops/add-problem/?step=6&problem_id={problem.id}"
                )
        elif step == 6:
            if not problem:
                return redirect("/api/rootops/add-problem/?step=1")
            formset = CodeBlockFormSet(post_data, instance=problem)
            if formset.is_valid():
                formset.save()
                messages.success(
                    request,
                    f"Problem '{problem.name}' created successfully with its methods, variables, and code blocks! Now add some test cases.",
                )
                return redirect(
                    f"/api/rootops/add-problem/?step=7&problem_id={problem.id}"
                )
        elif step == 7:
            if not problem:
                return redirect("/api/rootops/add-problem/?step=1")

            # Step 6 allows submitting either a manual testcase or starting AI generation
            if "add_manual" in post_data:
                manual_form = CustomTestcaseForm(post_data)
                if manual_form.is_valid():
                    tc = manual_form.save(commit=False)
                    tc.problem = problem
                    tc.save()
                    messages.success(request, "Manual testcase added successfully!")
                else:
                    messages.error(request, "Failed to add manual testcase.")
            elif "generate_ai" in post_data:
                ai_form = AITestCaseForm(post_data)
                if ai_form.is_valid():
                    count = ai_form.cleaned_data["count"]
                    from ai.tasks import generate_testcases_task

                    task = generate_testcases_task.delay(problem.id, count)
                    messages.success(
                        request,
                        f"AI generation started for {count} testcases. Task ID: {task.id}",
                    )
                else:
                    messages.error(request, "Invalid AI testcase parameters.")
            elif "finish" in post_data:
                return redirect("admin:problem_problem_change", problem.id)

            return redirect(f"/api/rootops/add-problem/?step=7&problem_id={problem.id}")

    # GET or invalid POST handling
    if step == 5 and problem:
        for f in var_formset.forms:
            if "method" in f.fields:
                f.fields["method"].queryset = problem.methods.all()

    if step == 6 and problem and request.method == "GET":
        from .utils import generate_codeblocks_for_problem

        if not problem.codeblocks.exists():
            generate_codeblocks_for_problem(problem)
            formset = CodeBlockFormSet(instance=problem)

    manual_form = None
    ai_form = None
    if step == 7 and problem:
        manual_form = CustomTestcaseForm(initial={"problem": problem})
        # AI Form defaults to 10 count. We can set problem initial here too
        ai_form = AITestCaseForm(initial={"problem": problem, "count": 10})

    empty_var_form = var_formset.empty_form
    if problem:
        if "method" in empty_var_form.fields:
            empty_var_form.fields["method"].queryset = problem.methods.all()
        for f in var_formset.forms:
            if "method" in f.fields:
                f.fields["method"].queryset = problem.methods.all()

    return render(
        request,
        "problem/add_problem_custom.html",
        {
            "step": step,
            "problem": problem,
            "form": form,
            "tags_formset": tags_formset,
            "ct_form": ct_form,
            "ctl_formset": ctl_formset,
            "method_formset": method_formset,
            "var_formset": var_formset,
            "empty_var_form": empty_var_form,
            "formset": formset,
            "manual_form": manual_form,
            "ai_form": ai_form,
            "languages": CodingLanguage.choices,
        },
    )


@staff_member_required
def add_testcase_custom(request):
    manual_form = CustomTestcaseForm()
    ai_form = AITestCaseForm()

    if request.method == "POST":
        manual_form = CustomTestcaseForm(request.POST)
        if manual_form.is_valid():
            testcase = manual_form.save()
            messages.success(
                request, f"Testcase for '{testcase.problem.name}' added successfully!"
            )
            return redirect("admin:problem_testcase_changelist")

    return render(
        request,
        "problem/add_testcase_custom.html",
        {"form": manual_form, "ai_form": ai_form},
    )


class AITestCaseForm(forms.Form):
    problem = forms.ModelChoiceField(
        queryset=Problem.objects.all(), label="Select Problem"
    )
    count = forms.IntegerField(
        min_value=1, max_value=200, initial=100, label="Number of Test Cases"
    )


@staff_member_required
def add_ai_testcases(request):
    if request.method == "POST":
        form = AITestCaseForm(request.POST)
        if form.is_valid():
            problem = form.cleaned_data["problem"]
            count = form.cleaned_data["count"]
            messages.info(request, "Starting AI generation process...")
            return redirect("add_testcase_custom")
    else:
        form = AITestCaseForm()
    return render(request, "problem/add_ai_testcases.html", {"form": form})
