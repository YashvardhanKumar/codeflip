from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import TaskLog
from .services import AIService

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

class GenerateExplanationView(APIView):
    """
    Generates a solution explanation using AI.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        problem_description = request.data.get('problem_description', '')
        current_text = request.data.get('current_text', '')
        code = request.data.get('code', '')

        if not problem_description or not code:
            return Response(
                {"error": "problem_description and code are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        prompt = f"""
        You are an expert competitive programmer. Help me write a high-quality solution explanation for a coding problem.
        
        Problem Description:
        {problem_description}
        
        My current draft/template for the explanation:
        {current_text}
        
        My accepted code for this problem:
        {code}
        
        Task:
        1. Review the code and the problem description.
        2. Fill in the 'Intuition', 'Approach', and 'Complexity' sections of my draft.
        3. Make the explanation clear, professional, and insightful.
        4. Return ONLY the updated markdown content. Do not include any meta-commentary.
        5. Preserve the structure of my draft.
        """

        try:
            explanation, provider = AIService.generate_with_fallback(prompt)
            return Response({
                "explanation": explanation,
                "provider": provider
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
