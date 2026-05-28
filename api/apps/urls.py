"""
URL configuration for apps project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from problem.admin_views import (
    rootops, add_ai_testcases, root_login, 
    add_problem_custom, add_testcase_custom, 
    moderator_login, generate_testcases_async
)
from ai.views import TaskStatusView

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('ckeditor/', include('ckeditor_uploader.urls')),
    path('rootops/', rootops, name='rootops'),
    path('rootops/add-problem/', add_problem_custom, name='add_problem_custom'),
    path('rootops/add-testcase/', add_testcase_custom, name='add_testcase_custom'),
    path('rootops/generate-ai-async/', generate_testcases_async, name='generate_ai_async'),
    path('rootops/task-status/<str:task_id>/', TaskStatusView.as_view(), name='task_status'),
    path('rootops/add-ai-testcases/', add_ai_testcases, name='add_ai_testcases'),
    path('rootops/login/', root_login, name='root_login'),
    path('rootops/moderator-login/', moderator_login, name='moderator_login'),
    path('auth/', include('user.urls')),
    path('api/', include('problem.urls')),
    path("engine/", include("engine.urls")),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Optional UI:
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
