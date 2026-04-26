# submissions/services.py
import requests
import base64
import json
import re
from .constants import JUDGE0_URL, DEFAULT_LIMITS
from problem.models import Testcase, AnswerStatus

# Essential fields supported by Judge0 CE
VALID_JUDGE0_FIELDS = {
    'source_code', 'language_id', 'stdin', 'expected_output',
    'cpu_time_limit', 'cpu_extra_time', 'wall_time_limit',
    'memory_limit', 'stack_limit', 'max_processes_and_or_threads',
    'max_file_size'
}

def encode_base64(text: str) -> str:
    if not text:
        return ""
    try:
        return base64.b64encode(text.encode("utf-8")).decode("utf-8")
    except Exception:
        return ""

def format_stdin(raw_input: str) -> str:
    """
    Normalizes descriptive testcase inputs into raw data for stdin.
    Example: 'nums = [2,7,11,15]\ntarget = 9' -> '4 2 7 11 15\n9'
    """
    if not raw_input:
        return ""
    
    lines = raw_input.strip().splitlines()
    formatted_lines = []
    
    for line in lines:
        if '=' in line:
            value = line.split('=', 1)[1].strip()
        else:
            value = line.strip()
            
        # Handle array format [1,2,3] -> "3 1 2 3"
        if value.startswith('[') and value.endswith(']'):
            try:
                arr = json.loads(value)
                if isinstance(arr, list):
                    formatted_lines.append(f"{len(arr)} {' '.join(map(str, arr))}")
                    continue
            except Exception:
                pass
        
        formatted_lines.append(value)
        
    return "\n".join(formatted_lines)

def submit_to_judge0(payload: dict, is_submit: bool) -> dict:
    # Merge with default limits
    merged_payload = {**DEFAULT_LIMITS, **payload}
    pid = merged_payload.get('problem_id')

    # Determine test cases to run, ordered by ID for consistency
    if is_submit:
        testcases = Testcase.objects.filter(problem_id=pid).order_by('id')
    else:
        testcases = Testcase.objects.filter(problem_id=pid, display_testcase=True).order_by('id')

    # Prepare base payload (without stdin/expected_output)
    base_judge0_payload = {
        k: v for k, v in merged_payload.items() 
        if k in VALID_JUDGE0_FIELDS and k not in ['stdin', 'expected_output'] and v is not None
    }
    
    # Pre-encode source code
    if 'source_code' in base_judge0_payload:
        base_judge0_payload['source_code'] = encode_base64(base_judge0_payload['source_code'])

    # If a specific stdin was provided in payload, we ONLY run that
    specific_stdin = merged_payload.get('stdin')
    if specific_stdin is not None:
        # Normalize and encode the provided stdin
        formatted_stdin = format_stdin(specific_stdin)
        
        judge0_payload = {**base_judge0_payload}
        if formatted_stdin:
            judge0_payload['stdin'] = encode_base64(formatted_stdin)
            
        response = requests.post(
            url=f'{JUDGE0_URL}/submissions?base64_encoded=true&wait=true',
            json=judge0_payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        res = response.json()
        
        # Decode results
        for field in ['stdout', 'stderr', 'compile_output', 'message']:
            if res.get(field):
                try:
                    res[field] = base64.b64decode(res[field]).decode("utf-8")
                except Exception: pass
        return res

    # Otherwise, run all testcases
    results = []
    for tc in testcases:
        # Create fresh payload for each case
        judge0_payload = {**base_judge0_payload}
        
        # Format and encode stdin from testcase
        formatted_tc_stdin = format_stdin(tc.input)
        if formatted_tc_stdin:
            judge0_payload['stdin'] = encode_base64(formatted_tc_stdin)
            
        # Add expected output from testcase
        if tc.output:
            judge0_payload['expected_output'] = encode_base64(tc.output)

        response = requests.post(
            url=f'{JUDGE0_URL}/submissions?base64_encoded=true&wait=true',
            json=judge0_payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        res = response.json()

        # Decode base64 outputs from Judge0 if they exist
        for field in ['stdout', 'stderr', 'compile_output', 'message', 'expected_output']:
            if res.get(field):
                try:
                    res[field] = base64.b64decode(res[field]).decode("utf-8")
                except Exception:
                    pass
        
        # Ensure expected_output is present and matches the original tc.output
        res['expected_output'] = tc.output

        if is_submit:
            # For submissions, return immediately on failure
            if res.get("status", {}).get("id") != 3:
                return {**res, "status_name": res.get("status", {}).get("description")}
        else:
            results.append(res)

    if is_submit:
        return {"status": {"id": 3, "description": "Accepted"}, "description": "All testcases passed"}
    return results