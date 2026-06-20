import os
import django


def pytest_configure():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "apps.settings")
    django.setup()
    from django.conf import settings

    settings.CELERY_TASK_ALWAYS_EAGER = True
