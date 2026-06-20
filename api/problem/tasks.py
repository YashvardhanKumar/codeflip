from celery import shared_task
from .models import Problem
from .utils import generate_codeblocks_for_problem


@shared_task
def generate_codeblocks_task(problem_id, force=True):
    try:
        problem = Problem.objects.get(id=problem_id)
        generate_codeblocks_for_problem(problem, force=force)
    except Problem.DoesNotExist:
        pass
