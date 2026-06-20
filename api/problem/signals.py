from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Q
from django.db import transaction, connection
from django.core.signals import request_finished
from .models import Method, Variable, CustomType, CustomTypeLanguage, Problem


@receiver(request_finished)
def clear_connection_queued_problems(sender, **kwargs):
    if hasattr(connection, "_queued_codeblock_problems"):
        connection._queued_codeblock_problems.clear()


def queue_codeblock_generation(problem_id):
    from .tasks import generate_codeblocks_task

    if not connection.in_atomic_block:
        generate_codeblocks_task.delay(problem_id, force=True)
        return

    if not hasattr(connection, "_queued_codeblock_problems"):
        connection._queued_codeblock_problems = set()

    if problem_id in connection._queued_codeblock_problems:
        return

    connection._queued_codeblock_problems.add(problem_id)

    def on_commit_callback():
        if hasattr(connection, "_queued_codeblock_problems"):
            connection._queued_codeblock_problems.discard(problem_id)
        generate_codeblocks_task.delay(problem_id, force=True)

    transaction.on_commit(on_commit_callback)


@receiver(post_save, sender=Method)
@receiver(post_delete, sender=Method)
def on_method_change(sender, instance, **kwargs):
    if instance.problem:
        queue_codeblock_generation(instance.problem.id)


@receiver(post_save, sender=Variable)
@receiver(post_delete, sender=Variable)
def on_variable_change(sender, instance, **kwargs):
    if instance.problem:
        queue_codeblock_generation(instance.problem.id)


@receiver(post_save, sender=CustomTypeLanguage)
@receiver(post_delete, sender=CustomTypeLanguage)
def on_custom_type_language_change(sender, instance, **kwargs):
    if instance.custom_type:
        update_related_problems_by_custom_type_name(instance.custom_type.name)


@receiver(post_save, sender=CustomType)
def on_custom_type_save(sender, instance, **kwargs):
    update_related_problems_by_custom_type_name(instance.name)


def update_related_problems_by_custom_type_name(name):
    if not name:
        return
    problems = Problem.objects.filter(
        Q(methods__type=name)
        | Q(methods__template_type=name)
        | Q(methods__parameters__type=name)
        | Q(methods__parameters__template_type=name)
    ).distinct()

    for problem in problems:
        queue_codeblock_generation(problem.id)


@receiver(post_save, sender=Problem)
def on_problem_save(sender, instance, **kwargs):
    queue_codeblock_generation(instance.id)
