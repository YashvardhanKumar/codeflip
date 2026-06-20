from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Q
from .models import Method, Variable, CustomType, CustomTypeLanguage, Problem
from .utils import generate_codeblocks_for_problem


@receiver(post_save, sender=Method)
@receiver(post_delete, sender=Method)
def on_method_change(sender, instance, **kwargs):
    if instance.problem:
        generate_codeblocks_for_problem(instance.problem, force=True)


@receiver(post_save, sender=Variable)
@receiver(post_delete, sender=Variable)
def on_variable_change(sender, instance, **kwargs):
    if instance.problem:
        generate_codeblocks_for_problem(instance.problem, force=True)


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
        generate_codeblocks_for_problem(problem, force=True)
