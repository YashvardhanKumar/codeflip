from django.urls import path
from .views import GenerateExplanationView, TaskStatusView

urlpatterns = [
    path('generate-explanation/', GenerateExplanationView.as_view(), name='generate_explanation'),
    path('task-status/<str:task_id>/', TaskStatusView.as_view(), name='task_status'),
]
