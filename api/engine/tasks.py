from celery import shared_task
from .services import submit_to_judge0
from problem.models import Solution, AnswerStatus
from .models import RunTask


@shared_task
def submit_solution_task(solution_id):
    """
    Background task to evaluate a solution.
    """
    try:
        solution = Solution.objects.get(id=solution_id)

        # Prepare evaluation payload
        from problem.models import Codeblock
        from problem.utils import IMPORT_BLOCKS

        codeblock = Codeblock.objects.get(
            problem=solution.problem, language=solution.language
        )
        imports = IMPORT_BLOCKS.get(solution.language, "")
        if "###__CODE_SEPARATOR__###" in codeblock.runner_code:
            before, _, after = codeblock.runner_code.partition(
                "###__CODE_SEPARATOR__###"
            )
            if before.endswith("\n"):
                before = before[:-1]
                if before.endswith("\r"):
                    before = before[:-1]
            if after.startswith("\n"):
                after = after[1:]
            elif after.startswith("\r\n"):
                after = after[2:]
            full_code = f"{imports}\n\n{before}\n\n{solution.code}\n\n{after}"
        else:
            full_code = f"{imports}\n\n{solution.code}\n\n{codeblock.runner_code}"

        from problem.views import JUDGE0_LANGUAGE_MAP

        judge0_lang_id = JUDGE0_LANGUAGE_MAP.get(solution.language, 71)

        evaluation_payload = {
            "problem_id": solution.problem.id,
            "source_code": full_code,
            "language_id": judge0_lang_id,
        }

        if judge0_lang_id == 74:
            evaluation_payload["compiler_options"] = (
                "--target es2020 --lib es2020,dom --module commonjs"
            )

        # Evaluate
        result = submit_to_judge0(evaluation_payload, is_submit=True)

        # Update solution
        from problem.views import JUDGE0_STATUS_MAP

        judge0_id = result.get("status", {}).get("id", 4)
        internal_status = JUDGE0_STATUS_MAP.get(judge0_id, AnswerStatus.WRONG_ANSWER)

        solution.status = internal_status
        solution.testcase_results = result.get("testcase_results", [])
        solution.save()

        return f"Solution {solution_id} evaluated: {internal_status}"

    except Exception as e:
        if "solution" in locals():
            solution.status = AnswerStatus.INTERNAL_ERROR
            solution.save()
        return f"Error evaluating solution {solution_id}: {str(e)}"


@shared_task(bind=True)
def run_code_task(self, payload):
    """
    Background task to run code.
    """
    run_task = RunTask.objects.create(task_id=self.request.id, status="PROCESSING")

    try:
        result = submit_to_judge0(payload, is_submit=False)
        run_task.status = "SUCCESS"
        run_task.result = result
        run_task.save()
        return "Run complete"
    except Exception as e:
        run_task.status = "ERROR"
        run_task.error = str(e)
        run_task.save()
        return f"Run failed: {str(e)}"
