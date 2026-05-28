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
    return render(request, 'problem/rootops.html', {
        'user': request.user,
        'is_superuser': request.user.is_superuser,
        'languages': CodingLanguage.choices
    })

def root_login(request):
    return redirect('moderator_login')

class ModeratorLoginForm(forms.Form):
    email = forms.EmailField(widget=forms.EmailInput(attrs={'class': 'custom-input', 'placeholder': 'Enter moderator email'}))

def moderator_login(request):
    if request.method == 'POST':
        form = ModeratorLoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            user = User.objects.filter(email=email, is_staff=True).first()
            if user:
                login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                messages.success(request, f"Logged in as moderator: {user.username}")
                return redirect('rootops')
            else:
                messages.error(request, "No moderator found with this email.")
    else:
        form = ModeratorLoginForm()
    return render(request, 'admin/moderator_login.html', {'form': form})

class CustomProblemForm(forms.ModelForm):
    problem_description = forms.CharField(widget=CKEditorUploadingWidget())
    class Meta:
        model = Problem
        fields = ['name', 'problem_description', 'difficulty']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'custom-input', 'placeholder': 'Problem Title'}),
            'difficulty': forms.Select(attrs={'class': 'custom-input'}),
        }

CodeBlockFormSet = inlineformset_factory(
    Problem, Codeblock,
    fields=['language', 'imports', 'block', 'runner_code'],
    extra=0,
    can_delete=True,
    widgets={
        'language': forms.Select(attrs={'class': 'custom-input'}),
        'imports': forms.Textarea(attrs={'class': 'custom-input', 'rows': 2, 'placeholder': 'Imports...'}),
        'block': forms.Textarea(attrs={'class': 'custom-input', 'rows': 5, 'placeholder': 'Main code block...'}),
        'runner_code': forms.Textarea(attrs={'class': 'custom-input', 'rows': 3, 'placeholder': 'Runner/Test code...'}),
    }
)

class CustomTestcaseForm(forms.ModelForm):
    class Meta:
        model = Testcase
        fields = ['problem', 'input', 'output', 'output_type', 'display_testcase']
        widgets = {
            'problem': forms.Select(attrs={'class': 'custom-input'}),
            'input': forms.Textarea(attrs={'class': 'custom-input', 'rows': 3, 'placeholder': 'Test input...'}),
            'output': forms.Textarea(attrs={'class': 'custom-input', 'rows': 3, 'placeholder': 'Expected output...'}),
            'output_type': forms.Select(attrs={'class': 'custom-input'}),
            'display_testcase': forms.CheckboxInput(attrs={'class': 'custom-checkbox'}),
        }

@staff_member_required
def generate_testcases_async(request):
    """
    Starts a background task to generate test cases.
    """
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid method"}, status=405)
        
    problem_id = request.POST.get('problem')
    count = int(request.POST.get('count', 100))
    
    # Start Celery task
    task = generate_testcases_task.delay(problem_id, count)
    
    return JsonResponse({
        "status": "pending",
        "task_id": task.id
    })

@staff_member_required
def add_problem_custom(request):
    if request.method == 'POST':
        form = CustomProblemForm(request.POST)
        formset = CodeBlockFormSet(request.POST)
        if form.is_valid() and formset.is_valid():
            problem = form.save()
            formset.instance = problem
            formset.save()
            messages.success(request, f"Problem '{problem.name}' and code blocks created successfully!")
            return redirect('admin:problem_problem_change', problem.id)
    else:
        form = CustomProblemForm()
        formset = CodeBlockFormSet()
    
    return render(request, 'problem/add_problem_custom.html', {
        'form': form,
        'formset': formset,
        'languages': CodingLanguage.choices
    })

@staff_member_required
def add_testcase_custom(request):
    manual_form = CustomTestcaseForm()
    ai_form = AITestCaseForm()
    
    if request.method == 'POST':
        manual_form = CustomTestcaseForm(request.POST)
        if manual_form.is_valid():
            testcase = manual_form.save()
            messages.success(request, f"Testcase for '{testcase.problem.name}' added successfully!")
            return redirect('admin:problem_testcase_changelist')
                
    return render(request, 'problem/add_testcase_custom.html', {
        'form': manual_form,
        'ai_form': ai_form
    })

class AITestCaseForm(forms.Form):
    problem = forms.ModelChoiceField(queryset=Problem.objects.all(), label="Select Problem")
    count = forms.IntegerField(min_value=1, max_value=200, initial=100, label="Number of Test Cases")

@staff_member_required
def add_ai_testcases(request):
    if request.method == 'POST':
        form = AITestCaseForm(request.POST)
        if form.is_valid():
            problem = form.cleaned_data['problem']
            count = form.cleaned_data['count']
            messages.info(request, "Starting AI generation process...")
            return redirect('add_testcase_custom')
    else:
        form = AITestCaseForm()
    return render(request, 'problem/add_ai_testcases.html', {'form': form})
