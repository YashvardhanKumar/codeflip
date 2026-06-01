from django.contrib import admin


def rootops_context(request):
    """
    Context processor to provide admin app_list to all Root Ops templates.
    """
    if request.path.startswith("/rootops/"):
        return {"app_list": admin.site.get_app_list(request)}
    return {}
