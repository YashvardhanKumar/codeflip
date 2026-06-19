# engine/services.py
import requests
import base64
import json
import re
from .constants import JUDGE0_URL, DEFAULT_LIMITS
from problem.models import Testcase, AnswerStatus

# Essential fields supported by Judge0 CE
VALID_JUDGE0_FIELDS = {
    "source_code",
    "language_id",
    "stdin",
    "expected_output",
    "cpu_time_limit",
    "cpu_extra_time",
    "wall_time_limit",
    "memory_limit",
    "stack_limit",
    "max_processes_and_or_threads",
    "max_file_size",
    "compiler_options",
}


def encode_base64(text: str) -> str:
    if not text:
        return ""
    try:
        return base64.b64encode(text.encode("utf-8")).decode("utf-8")
    except Exception:
        return ""


def decode_base64(text: str) -> str:
    if not text:
        return ""
    try:
        return base64.b64decode(text).decode("utf-8")
    except Exception:
        return text


def flatten_json_array(arr):
    if not isinstance(arr, list):
        return [arr]
    res = [len(arr)]
    for item in arr:
        res.extend(flatten_json_array(item))
    return res


def _unquote_value(val):
    """
    Strip surrounding double quotes from a value.
    """
    if len(val) >= 2 and val.startswith('"') and val.endswith('"'):
        return val[1:-1]
    return val


def _flatten_for_stdin(item):
    """
    Recursively flatten a parsed JSON value for stdin.
    - Strings are unquoted (returned without surrounding double quotes).
    - null (None) becomes an empty string (true null value).
    - Lists are prefixed with their length then each element is flattened.
    """
    if item is None:
        return ["null"]
    if isinstance(item, str):
        return [item]  # already unquoted by json.loads
    if isinstance(item, (int, float, bool)):
        return [str(item).lower() if isinstance(item, bool) else str(item)]
    if isinstance(item, list):
        res = [str(len(item))]
        for sub in item:
            res.extend(_flatten_for_stdin(sub))
        return res
    return [str(item)]


def format_stdin(raw_input: str, language_id: int = None) -> str:
    if not raw_input:
        return ""
    lines = raw_input.strip().splitlines()
    formatted_lines = []
    for line in lines:
        if "=" in line:
            value = line.split("=", 1)[1].strip()
        else:
            value = line.strip()

        # Bare `null` (without quotes) → treat as null input (empty value)
        if value == "null":
            formatted_lines.append("null")
            continue

        # JSON array – flatten with unquoted strings and null handling
        if (
            language_id in [50, 54, 62]
            and value.startswith("[")
            and value.endswith("]")
        ):
            try:
                arr = json.loads(value)
                if isinstance(arr, list):
                    flat = _flatten_for_stdin(arr)
                    formatted_lines.append("\n".join(flat))
                    continue
            except Exception:
                pass

        # Double-quoted string like "pwwkew" → strip the quotes
        value = _unquote_value(value)

        formatted_lines.append(value)
    return "\n".join(formatted_lines)


def run_testcase_internal(base_payload, tc):
    """
    Core function to evaluate a single testcase against Judge0.
    """
    payload = {**base_payload}
    language_id = payload.get("language_id")
    formatted_stdin = format_stdin(tc.input, language_id)
    if formatted_stdin:
        payload["stdin"] = encode_base64(formatted_stdin)
    if tc.output:
        payload["expected_output"] = encode_base64(tc.output)

    try:
        response = requests.post(
            url=f"{JUDGE0_URL}/submissions?base64_encoded=true&wait=true",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30,
        )
        res = response.json()

        # Robust decoding
        for field in ["stdout", "stderr", "compile_output", "message"]:
            val = res.get(field)
            if val is not None:
                res[field] = decode_base64(val)

        status_obj = res.get("status", {})
        s_id = status_obj.get("id")

        return {
            "status": status_obj,
            "stdout": res.get("stdout") or "",
            "stderr": res.get("stderr") or "",
            "compile_output": res.get("compile_output") or "",
            "message": res.get("message") or "",
            "time": res.get("time"),
            "memory": res.get("memory"),
            "is_accepted": (s_id == 3),
            "is_hidden": not tc.display_testcase,
            "case_id": tc.id,
            "input": tc.input if tc.display_testcase else "Hidden",
            "expected_output": tc.output if tc.display_testcase else "Hidden",
        }
    except Exception as e:
        return {
            "status": {"id": 13, "description": "Internal Error"},
            "message": str(e),
            "is_accepted": False,
            "is_hidden": not tc.display_testcase,
        }


def submit_to_judge0(payload: dict, is_submit: bool) -> dict:
    # Legacy wrapper for synchronous calls
    from concurrent.futures import ThreadPoolExecutor, as_completed

    merged_payload = {**DEFAULT_LIMITS, **payload}
    pid = merged_payload.get("problem_id")

    if is_submit:
        testcases = Testcase.objects.filter(problem_id=pid).order_by("id")
    else:
        testcases = Testcase.objects.filter(
            problem_id=pid, display_testcase=True
        ).order_by("id")

    base_payload = {
        k: v
        for k, v in merged_payload.items()
        if k in VALID_JUDGE0_FIELDS and k not in ["stdin", "expected_output"]
    }
    if merged_payload.get("language_id") == 74:
        base_payload["compiler_options"] = (
            "--target es2020 --lib es2020,dom --module commonjs"
        )

    if "source_code" in base_payload:
        base_payload["source_code"] = encode_base64(base_payload["source_code"])

    results = []
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {
            executor.submit(run_testcase_internal, base_payload, tc): tc
            for tc in testcases
        }
        for future in as_completed(futures):
            results.append(future.result())

    results.sort(
        key=lambda x: x.get("index", 0)
    )  # Note: results need index if we want order here

    if is_submit:
        total_status = {"id": 3, "description": "Accepted"}
        for r in results:
            if not r.get("is_accepted"):
                total_status = r.get("status")
                break
        return {"status": total_status, "testcase_results": results}
    return results
