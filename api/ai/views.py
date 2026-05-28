from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import TaskLog

class TaskStatusView(APIView):
    """
    Polls the status and logs of a background task.
    """
    def get(self, request, task_id):
        try:
            task_log = TaskLog.objects.get(task_id=task_id)
            return Response({
                "status": task_log.status,
                "progress": task_log.progress,
                "logs": task_log.logs,
                "result": task_log.result,
                "updated_at": task_log.updated_at
            })
        except TaskLog.DoesNotExist:
            return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
