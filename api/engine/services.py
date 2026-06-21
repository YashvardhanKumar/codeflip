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


def format_batch_stdin(testcases, language_id=None):
    """
    Concatenate all test case inputs with T (count) header.
    Format: T\n<tc1_input>\n<tc2_input>\n...
    """
    parts = [str(len(testcases))]
    for tc in testcases:
        tc_input = tc.input if hasattr(tc, "input") else tc.get("input", "")
        formatted = format_stdin(tc_input, language_id)
        parts.append(formatted)
    return "\n".join(parts)


def parse_batch_stdout(stdout, num_testcases):
    """
    Parse batch stdout split by TC_SEPARATOR.
    Returns a list of output strings, one per test case.
    """
    from .constants import TC_SEPARATOR

    if not stdout:
        return [""] * num_testcases
    blocks = stdout.split(TC_SEPARATOR)
    results = []
    for i in range(num_testcases):
        if i < len(blocks):
            results.append(blocks[i].strip())
        else:
            results.append("")
    return results


def run_batch_submission(base_payload, testcases, language_id=None):
    """
    Run ALL test cases in a single Judge0 submission.
    Returns a list of per-test-case result dicts.
    """
    from .constants import TC_SEPARATOR, get_scaled_limits

    # Build batch stdin
    batch_stdin = format_batch_stdin(testcases, language_id)

    # Scale resource limits
    scaled_limits = get_scaled_limits(len(testcases))
    payload = {**scaled_limits, **base_payload}

    # Set stdin
    payload["stdin"] = encode_base64(batch_stdin)

    # Remove expected_output (we compare manually)
    payload.pop("expected_output", None)

    try:
        response = requests.post(
            url=f"{JUDGE0_URL}/submissions?base64_encoded=true&wait=true",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=120,  # Higher timeout for batch
        )
        res = response.json()

        # Decode base64 fields
        for field in ["stdout", "stderr", "compile_output", "message"]:
            val = res.get(field)
            if val is not None:
                res[field] = decode_base64(val)

        status_obj = res.get("status", {})
        status_id = status_obj.get("id")

        # Handle compilation error or runtime error that affects ALL test cases
        if status_id == 6:  # Compilation Error
            return [
                {
                    "status": status_obj,
                    "stdout": "",
                    "stderr": res.get("stderr") or "",
                    "compile_output": res.get("compile_output") or "",
                    "message": res.get("message") or "",
                    "time": res.get("time"),
                    "memory": res.get("memory"),
                    "is_accepted": False,
                    "is_hidden": not (
                        hasattr(tc, "display_testcase") and tc.display_testcase
                        if hasattr(tc, "display_testcase")
                        else True
                    ),
                    "case_id": getattr(tc, "id", i),
                    "input": (
                        (tc.input if hasattr(tc, "input") else tc.get("input", ""))
                        if (
                            hasattr(tc, "display_testcase") and tc.display_testcase
                            if hasattr(tc, "display_testcase")
                            else True
                        )
                        else "Hidden"
                    ),
                    "expected_output": (
                        (tc.output if hasattr(tc, "output") else tc.get("output", ""))
                        if (
                            hasattr(tc, "display_testcase") and tc.display_testcase
                            if hasattr(tc, "display_testcase")
                            else True
                        )
                        else "Hidden"
                    ),
                    "index": i,
                }
                for i, tc in enumerate(testcases)
            ]

        # Parse stdout into per-test-case outputs
        stdout = res.get("stdout") or ""
        stderr = res.get("stderr") or ""
        actual_outputs = parse_batch_stdout(stdout, len(testcases))

        # Build per-test-case results
        results = []
        for i, tc in enumerate(testcases):
            tc_input = tc.input if hasattr(tc, "input") else tc.get("input", "")
            tc_output = tc.output if hasattr(tc, "output") else tc.get("output", "")
            is_display = (
                tc.display_testcase
                if hasattr(tc, "display_testcase")
                else tc.get("display_testcase", True)
            )
            tc_id = getattr(tc, "id", i)

            block_text = actual_outputs[i]

            # Extract user prints and clean output
            pattern = (
                r"___USER_PRINT_START___[\r\n]*(.*?)[\r\n]*___USER_PRINT_END___[\r\n]*"
            )
            matches = re.findall(pattern, block_text, re.DOTALL)
            user_prints = "\n".join(m.strip() for m in matches if m.strip())
            actual = re.sub(pattern, "", block_text, flags=re.DOTALL).strip()

            expected = tc_output.strip()

            # Check if this test case got output (runtime error might cut execution short)
            if status_id not in (None, 3) and status_id > 4 and not actual:
                # Runtime error occurred before this test case completed
                is_accepted = False
                case_status = status_obj
            elif actual == expected:
                is_accepted = True
                case_status = {"id": 3, "description": "Accepted"}
            else:
                is_accepted = False
                case_status = {"id": 4, "description": "Wrong Answer"}

            judge0_compile_output = res.get("compile_output") or ""
            compile_out = judge0_compile_output
            if user_prints:
                if compile_out:
                    compile_out += "\n" + user_prints
                else:
                    compile_out = user_prints

            results.append(
                {
                    "status": case_status,
                    "stdout": actual if is_display else "",
                    "stderr": stderr if not is_accepted else "",
                    "compile_output": compile_out if is_display else "",
                    "message": res.get("message") or "",
                    "time": res.get("time"),
                    "memory": res.get("memory"),
                    "is_accepted": is_accepted,
                    "is_hidden": not is_display,
                    "case_id": tc_id,
                    "input": tc_input if is_display else "Hidden",
                    "expected_output": expected if is_display else "Hidden",
                    "index": i,
                }
            )

        # If runtime error (status 5-14) and some test cases completed,
        # mark completed ones appropriately and rest as runtime error
        if status_id and status_id > 4:
            for i, r in enumerate(results):
                if not actual_outputs[i]:  # No output = didn't complete
                    r["status"] = status_obj
                    r["is_accepted"] = False

        return results

    except Exception as e:
        return [
            {
                "status": {"id": 13, "description": "Internal Error"},
                "message": str(e),
                "is_accepted": False,
                "is_hidden": not (
                    hasattr(tc, "display_testcase") and tc.display_testcase
                    if hasattr(tc, "display_testcase")
                    else True
                ),
                "index": i,
            }
            for i, tc in enumerate(testcases)
        ]


def submit_to_judge0(payload: dict, is_submit: bool) -> dict:
    """
    Updated wrapper that uses batch single-submission approach.
    Maintains backward compatibility with the existing API.
    """
    merged_payload = {**DEFAULT_LIMITS, **payload}
    pid = merged_payload.get("problem_id")
    language_id = merged_payload.get("language_id")

    if is_submit:
        testcases = list(Testcase.objects.filter(problem_id=pid).order_by("id"))
    else:
        testcases = list(
            Testcase.objects.filter(problem_id=pid, display_testcase=True).order_by(
                "id"
            )
        )

    base_payload = {
        k: v
        for k, v in merged_payload.items()
        if k in VALID_JUDGE0_FIELDS and k not in ["stdin", "expected_output"]
    }
    if language_id == 74:
        base_payload["compiler_options"] = (
            "--target es2020 --lib es2020,dom --module commonjs"
        )

    if "source_code" in base_payload:
        base_payload["source_code"] = encode_base64(base_payload["source_code"])

    results = run_batch_submission(base_payload, testcases, language_id)
    results.sort(key=lambda x: x.get("index", 0))

    if is_submit:
        total_status = {"id": 3, "description": "Accepted"}
        for r in results:
            if not r.get("is_accepted"):
                total_status = r.get("status")
                break
        return {"status": total_status, "testcase_results": results}
    return results
