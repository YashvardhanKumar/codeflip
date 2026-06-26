import re


def has_custom_print(input_output_code, ret_type, lang_name):
    if not input_output_code:
        return False
    # Clean comments to avoid false matches
    code_clean = re.sub(r"//.*", "", input_output_code)
    if lang_name == "PYTHON":
        code_clean = re.sub(r"#.*", "", code_clean)
    code_clean = re.sub(r"/\*.*?\*/", "", code_clean, flags=re.DOTALL)

    if lang_name == "PYTHON":
        return bool(re.search(r"\bdef\s+printOutput\s*\(", code_clean))
    elif lang_name in ["JAVASCRIPT", "TYPESCRIPT"]:
        return bool(re.search(r"\bfunction\s+print\s*\(", code_clean))
    elif lang_name == "CPP":
        pattern = (
            r"\bprint\s*\(\s*(const\s+)?(struct\s+)?\b" + re.escape(ret_type) + r"\b"
        )
        return bool(re.search(pattern, code_clean))
    elif lang_name == "JAVA":
        pattern = r"\bprint\s*\(\s*(final\s+)?" + re.escape(ret_type) + r"\b"
        return bool(re.search(pattern, code_clean))
    return False
