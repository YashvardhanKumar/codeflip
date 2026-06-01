import os
import json
from celery import shared_task
from .models import TaskLog
from .services import AIService
from problem.models import Problem, Testcase, DataType

@shared_task(bind=True)
def generate_testcases_task(self, problem_id, count):
    """
    Background task to generate test cases using AI.
    """
    task_log = TaskLog.objects.create(
        task_id=self.request.id,
        name=f"AI Testcase Generation - Problem #{problem_id}",
        status='PROCESSING'
    )
    
    try:
        problem = Problem.objects.get(id=problem_id)
        codeblock = problem.codeblocks.first()
        
        if not codeblock:
            task_log.status = 'ERROR'
            task_log.add_log("No codeblock found.")
            return "Failed: No codeblock"

        task_log.add_log(f"Starting generation for problem: {problem.name}")
        
        batch_size = 50
        remaining = count
        all_testcases = []
        providers = ['gemini', 'openai']
        
        while remaining > 0:
            current_batch = min(batch_size, remaining)
            
            prompt = f"""
            You are an expert competitive programmer. Generate exactly {current_batch} unique test cases for the following problem.
            Problem Description: {problem.problem_description}
            Code Template: {codeblock.block}
            Output MUST be a raw JSON array of objects.
            Format: [ {{"input": "...", "output": "..."}}, ... ]
            """
            
            try:
                content, used_provider = AIService.generate_with_fallback(prompt, providers)
                task_log.add_log(f"Requesting batch of {current_batch} from {used_provider}...")
                
                content = AIService.clean_json_string(content)
                batch_data = json.loads(content)
                
                if isinstance(batch_data, list) and len(batch_data) > 0:
                    task_log.add_log(f"Successfully parsed {len(batch_data)} test cases from {used_provider}.")
                    for data in batch_data:
                        all_testcases.append(Testcase(
                            problem=problem,
                            input=str(data.get('input', '')),
                            output=str(data.get('output', '')),
                            output_type=DataType.STRING,
                            display_testcase=False
                        ))
                    remaining -= len(batch_data)
                    percent = int(((count - remaining) / count) * 100)
                    task_log.progress = percent
                    task_log.save()
                else:
                    task_log.add_log(f"{used_provider} returned invalid format. Retrying...")
                    
            except Exception as e:
                task_log.add_log(f"Batch Error: {str(e)}")
                # We can choose to fail or continue. Let's try once more or fail if fatal.
                if "429" in str(e) and used_provider == 'openai':
                    raise e # Fatal if OpenAI also fails

        if all_testcases:
            task_log.add_log(f"Saving {len(all_testcases)} test cases to database...")
            Testcase.objects.bulk_create(all_testcases)
            task_log.add_log("Database sync complete.")
            
        task_log.status = 'SUCCESS'
        task_log.progress = 100
        task_log.save()
        return f"Successfully generated {len(all_testcases)} test cases."

    except Exception as e:
        task_log.status = 'ERROR'
        task_log.add_log(f"FATAL ERROR: {str(e)}")
        task_log.save()
        return f"Failed: {str(e)}"
