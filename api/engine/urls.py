# submissions/urls.py
from django.urls import path
from .views import RunCodeView, SubmitCodeView, RunStatusView, SubmitStreamView

urlpatterns = [
    path("submit/", SubmitCodeView.as_view(), name="submit-code"),
    path("submit-stream/", SubmitStreamView.as_view(), name="submit-stream"),
    path("run/", RunCodeView.as_view(), name="run-code"),
    path("status/<str:task_id>/", RunStatusView.as_view(), name="run-status"),
]
