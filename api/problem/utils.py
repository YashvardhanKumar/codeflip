from .models import Codeblock, VariableType
from user.models import CodingLanguage
from django.utils.html import strip_tags
import html
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


IMPORT_BLOCKS = {
    CodingLanguage.CPP: '#include <bits/stdc++.h>\nusing namespace std;\n\ntemplate<typename T> void _print_res(const T& val) { cout << val; }\nvoid _print_res(const string& val) { cout << "\\"" << val << "\\""; }\ntemplate<typename T> void _print_res(const vector<T>& val) { cout << "["; for(size_t i=0; i<val.size(); i++) { if(i>0) cout << ","; _print_res(val[i]); } cout << "]"; }',
    CodingLanguage.JAVA: "import java.util.*;\nimport java.io.*;",
    CodingLanguage.PYTHON: "import sys\nimport math\nimport collections\nimport itertools\nimport bisect\nimport heapq\nimport json\n\nclass CustomEncoder(json.JSONEncoder):\n    def default(self, obj):\n        if hasattr(obj, '__str__'):\n            try:\n                return json.loads(str(obj))\n            except:\n                return str(obj)\n        return super().default(obj)",
    CodingLanguage.JAVASCRIPT: "const fs = require('fs');",
    CodingLanguage.TYPESCRIPT: "declare var require: any;\nconst fs = require('fs');",
}


def generate_codeblocks_for_problem(problem, force=False):
    # Determine methods
    methods = list(problem.methods.all().order_by("id"))

    if not methods:
        return  # Cannot generate without methods

    from .models import CustomType, CustomTypeLanguage

    custom_type_names = set()
    for m in methods:
        if (
            m.type
            and m.type not in dict(VariableType.choices)
            and m.type != VariableType.ARRAY
        ):
            custom_type_names.add(m.type)
        if (
            m.template_type
            and m.template_type not in dict(VariableType.choices)
            and m.template_type != VariableType.ARRAY
        ):
            custom_type_names.add(m.template_type)
        for v in m.parameters.all():
            if (
                v.type
                and v.type not in dict(VariableType.choices)
                and v.type != VariableType.ARRAY
            ):
                custom_type_names.add(v.type)
            if (
                v.template_type
                and v.template_type not in dict(VariableType.choices)
                and v.template_type != VariableType.ARRAY
            ):
                custom_type_names.add(v.template_type)

    for lang_code, lang_name in CodingLanguage.choices:
        obj_decl = ""
        inp_func = ""
        if custom_type_names:
            ctl = CustomTypeLanguage.objects.filter(
                custom_type__name__in=custom_type_names, language=lang_code
            )
            obj_decl = "\n".join(
                [c.class_declaration for c in ctl if c.class_declaration]
            )
            inp_func = "\n".join(
                [c.input_output_function for c in ctl if c.input_output_function]
            )

        codeblock = Codeblock.objects.filter(
            problem=problem, language=lang_code
        ).first()
        is_multi = len(methods) > 1 or any(m.is_constructor for m in methods)
        runner_code, block = generate_code_for_language(
            lang_code,
            methods,
            obj_decl,
            inp_func,
            is_multi,
            problem.problem_description,
        )

        if codeblock:
            codeblock.runner_code = runner_code
            if force or not codeblock.block.strip():
                codeblock.block = block
            elif "class Solution" in codeblock.block and "class Solution" in block:
                new_prefix = block.split("class Solution")[0]
                old_suffix = (
                    "class Solution" + codeblock.block.split("class Solution", 1)[1]
                )
                codeblock.block = new_prefix + old_suffix
            else:
                codeblock.block = block
            codeblock.save()
        else:
            Codeblock.objects.create(
                problem=problem,
                language=lang_code,
                runner_code=runner_code,
                block=block,
            )


def get_cpp_type(var_type, template_type=None, dimensions=1):
    mapping = {
        VariableType.INTEGER: "int",
        VariableType.STRING: "string",
        VariableType.BOOLEAN: "bool",
        VariableType.CHAR: "char",
        VariableType.FLOAT: "double",
        VariableType.LONG: "long long",
    }
    if var_type == VariableType.ARRAY:
        inner = get_cpp_type(template_type)
        for _ in range(dimensions):
            inner = f"vector<{inner}>"
        return inner
    if var_type not in mapping and var_type:
        return f"{var_type}*" if var_type.endswith("Node") else var_type
    return mapping.get(var_type, "int")


def get_java_type(var_type, template_type=None, dimensions=1):
    mapping = {
        VariableType.INTEGER: "int",
        VariableType.STRING: "String",
        VariableType.BOOLEAN: "boolean",
        VariableType.CHAR: "char",
        VariableType.FLOAT: "double",
        VariableType.LONG: "long",
    }
    if var_type == VariableType.ARRAY:
        inner = get_java_type(template_type)
        return f"{inner}{'[]' * dimensions}"
    if var_type not in mapping and var_type:
        return var_type
    return mapping.get(var_type, "int")


def get_ts_type(var_type, template_type=None, dimensions=1):
    mapping = {
        VariableType.INTEGER: "number",
        VariableType.STRING: "string",
        VariableType.BOOLEAN: "boolean",
        VariableType.CHAR: "string",
        VariableType.FLOAT: "number",
        VariableType.LONG: "number",
    }
    if var_type == VariableType.ARRAY:
        inner = get_ts_type(template_type)
        if " | null" in inner:
            inner = f"({inner})"
        return f"{inner}{'[]' * dimensions}"
    if var_type not in mapping and var_type and var_type not in ["void", "VOID"]:
        return f"{var_type} | null"
    return mapping.get(var_type, "any")


def generate_cpp_reader(var_name, template_type, dimensions, indent="    "):
    if dimensions == 0:
        return f"{indent}cin >> {var_name};\n"

    code = ""
    safe_name = var_name.replace("[", "_").replace("]", "_")

    code += f"{indent}int n_{safe_name};\n"
    code += f"{indent}cin >> n_{safe_name};\n"

    # If this is the outermost, we don't need to resize as we already declared it with no size,
    # wait, if we declared `vector<...> var;`, we need to resize it here!
    # Wait, the outermost array declaration is `vector<...> var;` before calling this.
    code += f"{indent}{var_name}.resize(n_{safe_name});\n"

    loop_var = f"i{dimensions}"
    code += (
        f"{indent}for(int {loop_var}=0; {loop_var}<n_{safe_name}; {loop_var}++) {{\n"
    )

    if dimensions == 1:
        if template_type == VariableType.STRING:
            code += f"{indent}    getline(cin >> ws, {var_name}[{loop_var}]);\n"
        else:
            code += f"{indent}    cin >> {var_name}[{loop_var}];\n"
    else:
        code += generate_cpp_reader(
            f"{var_name}[{loop_var}]", template_type, dimensions - 1, indent + "    "
        )

    code += f"{indent}}}\n"
    return code


def generate_java_reader(
    var_name, template_type, dimensions, indent="        ", is_root=True
):
    if dimensions == 0:
        if template_type == VariableType.INTEGER:
            return f"{indent}{var_name} = sc.nextInt();\n"
        elif template_type == VariableType.STRING:
            return f'{indent}sc.skip("\\\\s*");\n{indent}{var_name} = sc.nextLine();\n'
        else:
            return f"{indent}{var_name} = sc.next();\n"

    code = ""
    safe_name = var_name.replace("[", "_").replace("]", "_")
    code += f"{indent}int n_{safe_name} = sc.nextInt();\n"

    if is_root:
        code += f"{indent}{var_name} = new {get_java_type(template_type)}[n_{safe_name}]{'[]' * (dimensions-1)};\n"
    else:
        code += f"{indent}{var_name} = new {get_java_type(template_type)}[n_{safe_name}]{'[]' * (dimensions-1)};\n"

    loop_var = f"i{dimensions}"
    code += (
        f"{indent}for(int {loop_var}=0; {loop_var}<n_{safe_name}; {loop_var}++) {{\n"
    )

    if dimensions == 1:
        if template_type == VariableType.INTEGER:
            code += f"{indent}    {var_name}[{loop_var}] = sc.nextInt();\n"
        elif template_type == VariableType.STRING:
            code += f'{indent}    sc.skip("\\\\s*");\n'
            code += f"{indent}    {var_name}[{loop_var}] = sc.nextLine();\n"
        else:
            code += f"{indent}    {var_name}[{loop_var}] = sc.next();\n"
    else:
        code += generate_java_reader(
            f"{var_name}[{loop_var}]", template_type, dimensions - 1
        )

    code += f"{indent}}}\n"
    return code


def generate_code_for_language(
    lang_name,
    methods,
    class_declaration="",
    input_output_function="",
    is_multi=False,
    description="",
):
    block = ""
    if class_declaration:
        if lang_name in ["CPP", "JAVA", "JAVASCRIPT", "TYPESCRIPT"]:
            block += "/*\n"
            for line in class_declaration.splitlines():
                block += f"{line}\n"
            block += "*/\n\n"
        elif lang_name == "PYTHON":
            block += '"""\n'
            for line in class_declaration.splitlines():
                block += f"{line}\n"
            block += '"""\n\n'

    constructor_method = next((m for m in methods if m.is_constructor), None)
    class_name = constructor_method.name if constructor_method else "Solution"

    if lang_name == "CPP":
        block += f"class {class_name} {{\npublic:\n"
        if is_multi:
            if constructor_method:
                c_inputs = list(constructor_method.parameters.all().order_by("id"))
                c_args = ", ".join(
                    [
                        f"{get_cpp_type(v.type, v.template_type, v.array_dimensions)} {v.name}"
                        for v in c_inputs
                    ]
                )
                block += f"    {class_name}({c_args}) {{\n        \n    }}\n\n"
            else:
                block += f"    {class_name}() {{\n        \n    }}\n\n"

        for method in methods:
            if method.is_constructor:
                continue
            inputs = list(method.parameters.all().order_by("id"))
            ret_type = get_cpp_type(
                method.type, method.template_type, method.array_dimensions
            )
            args = ", ".join(
                [
                    f"{get_cpp_type(v.type, v.template_type, v.array_dimensions)} {v.name}"
                    for v in inputs
                ]
            )
            block += f"    {ret_type} {method.name}({args}) {{\n        // add your method calls here\n        \n    }}\n"
        block += "};\n"

        if not is_multi and methods:
            method = methods[0]
            inputs = list(method.parameters.all().order_by("id"))
            ret_type = get_cpp_type(
                method.type, method.template_type, method.array_dimensions
            )
            runner_code = (
                "int main() {\n"
                "    int T;\n"
                "    if (!(cin >> T)) return 0;\n"
                "    for (int _tc = 0; _tc < T; _tc++) {\n"
            )
            for v in inputs:
                if v.type == VariableType.ARRAY:
                    t = get_cpp_type(
                        VariableType.ARRAY, v.template_type, v.array_dimensions
                    )
                    runner_code += f"        {t} {v.name};\n"
                    runner_code += generate_cpp_reader(
                        v.name, v.template_type, v.array_dimensions, "        "
                    )
                elif (
                    v.type not in dict(VariableType.choices)
                    and v.type != VariableType.ARRAY
                ):
                    t = get_cpp_type(v.type)
                    if input_output_function.strip():
                        runner_code += f"        {t} {v.name} = input();\n"
                    else:
                        runner_code += f"        {t} {v.name};\n        // TODO: Implement parsing logic for custom type {v.type}\n"
                else:
                    t_cpp = get_cpp_type(v.type, v.template_type, v.array_dimensions)
                    runner_code += f"        {t_cpp} {v.name};\n"
                    if v.type == VariableType.STRING:
                        runner_code += f"        getline(cin >> ws, {v.name});\n"
                    else:
                        runner_code += f"        cin >> {v.name};\n"

            runner_code += f"\n        {class_name} sol;\n"
            call = f"sol.{method.name}({', '.join([v.name for v in inputs])})"
            runner_code += '        cout << "___USER_PRINT_START___" << endl;\n'
            if method.type != "void" and method.type != "VOID" and ret_type != "void":
                runner_code += f"        {ret_type} result = {call};\n"
                runner_code += '        cout << "___USER_PRINT_END___" << endl;\n'
                if has_custom_print(input_output_function, method.type, "CPP"):
                    runner_code += f"        print(result);\n        cout << endl;\n"
                else:
                    runner_code += (
                        f"        _print_res(result);\n        cout << endl;\n"
                    )
            else:
                runner_code += f"        {call};\n"
                runner_code += '        cout << "___USER_PRINT_END___" << endl;\n'
            runner_code += '        cout << "___CODERACER_TC_SEP___" << endl;\n'
            runner_code += "    }\n    return 0;\n}\n"
        elif is_multi:
            runner_code = (
                "int main() {\n"
                "    int T;\n"
                "    if (!(cin >> T)) return 0;\n"
                "    for (int _tc = 0; _tc < T; _tc++) {\n"
                "        int num_cmds; if (!(cin >> num_cmds)) return 0;\n"
                "        vector<string> commands(num_cmds);\n"
                "        for(int i=0; i<num_cmds; i++) getline(cin >> ws, commands[i]);\n"
                "        int num_outer_args; cin >> num_outer_args;\n"
                "        vector<string> outputs;\n"
                f"        {class_name}* obj = nullptr;\n"
                '        cout << "___USER_PRINT_START___" << endl;\n'
                "        for(int i=0; i<num_cmds; i++) {\n"
                "            string cmd = commands[i];\n"
                "            int arg_len; cin >> arg_len;\n"
            )

            if constructor_method:
                c_inputs = list(constructor_method.parameters.all().order_by("id"))
                runner_code += f'            if (cmd == "{class_name}") {{\n'
                for v in c_inputs:
                    if v.type == VariableType.ARRAY:
                        runner_code += f"                {get_cpp_type(v.type, v.template_type, v.array_dimensions)} {v.name};\n"
                        runner_code += generate_cpp_reader(
                            v.name,
                            v.template_type,
                            v.array_dimensions,
                            "                ",
                        )
                    elif v.type == VariableType.STRING:
                        runner_code += f"                {get_cpp_type(v.type)} {v.name}; getline(cin >> ws, {v.name});\n"
                    else:
                        runner_code += f"                {get_cpp_type(v.type)} {v.name}; cin >> {v.name};\n"
                c_args = ", ".join([v.name for v in c_inputs])
                runner_code += f"                obj = new {class_name}({c_args});\n"
                runner_code += (
                    '                outputs.push_back("null");\n            }\n'
                )
            else:
                runner_code += f'            if (cmd == "{class_name}") {{\n'
                runner_code += f"                obj = new {class_name}();\n"
                runner_code += (
                    '                outputs.push_back("null");\n            }\n'
                )

            for method in methods:
                if method.is_constructor:
                    continue
                inputs = list(method.parameters.all().order_by("id"))
                runner_code += f'            else if (cmd == "{method.name}") {{\n'
                for v in inputs:
                    if v.type == VariableType.ARRAY:
                        runner_code += f"                {get_cpp_type(v.type, v.template_type, v.array_dimensions)} {v.name};\n"
                        runner_code += generate_cpp_reader(
                            v.name,
                            v.template_type,
                            v.array_dimensions,
                            "                ",
                        )
                    elif v.type == VariableType.STRING:
                        runner_code += f"                {get_cpp_type(v.type)} {v.name}; getline(cin >> ws, {v.name});\n"
                    else:
                        runner_code += f"                {get_cpp_type(v.type)} {v.name}; cin >> {v.name};\n"
                call = f"obj->{method.name}({', '.join([v.name for v in inputs])})"
                if method.type != "void" and method.type != "VOID":
                    runner_code += f"                auto res = {call};\n"
                    runner_code += "                stringstream ss;\n"
                    runner_code += (
                        "                auto old_buf = cout.rdbuf(ss.rdbuf());\n"
                    )
                    if has_custom_print(input_output_function, method.type, "CPP"):
                        runner_code += "                print(res);\n"
                    else:
                        runner_code += "                _print_res(res);\n"
                    runner_code += "                cout.rdbuf(old_buf);\n"
                    runner_code += "                outputs.push_back(ss.str());\n"
                else:
                    runner_code += f"                {call};\n"
                    runner_code += '                outputs.push_back("null");\n'
                runner_code += "            }\n"

            runner_code += "        }\n"
            runner_code += '        cout << "___USER_PRINT_END___" << endl;\n'
            runner_code += '        cout << "[";\n'
            runner_code += "        for(size_t i=0; i<outputs.size(); i++) {\n"
            runner_code += '            if (i > 0) cout << ",";\n'
            runner_code += "            cout << outputs[i];\n"
            runner_code += "        }\n"
            runner_code += '        cout << "]" << endl;\n'
            runner_code += "        if (obj) { delete obj; obj = nullptr; }\n"
            runner_code += '        cout << "___CODERACER_TC_SEP___" << endl;\n'
            runner_code += "    }\n    return 0;\n}\n"
        else:
            runner_code = "int main() { return 0; }"

    elif lang_name == "PYTHON":
        if is_multi:
            block += f"class {class_name}:\n"
            if constructor_method:
                c_inputs = list(constructor_method.parameters.all().order_by("id"))
                c_args = ", ".join([v.name for v in c_inputs])
                c_args_str = f", {c_args}" if c_args else ""
                block += f"    def __init__(self{c_args_str}):\n        pass\n\n"
            else:
                block += "    def __init__(self):\n        pass\n\n"

            for method in methods:
                if method.is_constructor:
                    continue
                inputs = list(method.parameters.all().order_by("id"))
                args = ", ".join([v.name for v in inputs])
                args_str = f", {args}" if args else ""
                block += f"    def {method.name}(self{args_str}):\n        # add your method calls here\n        pass\n\n"
            if not methods:
                block += "    pass\n"
        else:
            block += "class Solution:\n"
            for method in methods:
                inputs = list(method.parameters.all().order_by("id"))
                args = ", ".join([v.name for v in inputs])
                args_str = f", {args}" if args else ""
                block += f"    def {method.name}(self{args_str}):\n        # add your method calls here\n        pass\n\n"
            if not methods:
                block += "    pass\n"

        if not is_multi and methods:
            method = methods[0]
            inputs = list(method.parameters.all().order_by("id"))
            runner_code = (
                "def main():\n"
                "    input_data = sys.stdin.read().splitlines()\n"
                "    if not input_data: return\n"
                "    T = int(input_data[0].strip())\n"
                "    idx = 1\n"
                "    for _tc in range(T):\n"
            )
            for v in inputs:
                if (
                    v.type not in dict(VariableType.choices)
                    and v.type != VariableType.ARRAY
                ):
                    if input_output_function.strip():
                        runner_code += (
                            f"        {v.name} = input(input_data[idx]); idx += 1\n"
                        )
                    else:
                        runner_code += f"        {v.name} = None; idx += 1 # TODO: Implement parsing logic for custom type {v.type}\n"
                else:
                    runner_code += f"        {v.name} = json.loads(input_data[idx].strip()); idx += 1\n"

            runner_code += "\n        sol = Solution()\n"
            call = f"sol.{method.name}({', '.join([v.name for v in inputs])})"
            runner_code += '        print("___USER_PRINT_START___")\n'
            if method.type != "void" and method.type != "VOID" and method.type:
                runner_code += f"        result = {call}\n"
                runner_code += '        print("___USER_PRINT_END___")\n'
                if has_custom_print(input_output_function, method.type, "PYTHON"):
                    runner_code += f"        printOutput(result)\n"
                else:
                    runner_code += f"        print(json.dumps(result, separators=(',', ':'), cls=CustomEncoder))\n"
            else:
                runner_code += f"        {call}\n"
                runner_code += '        print("___USER_PRINT_END___")\n'
            runner_code += '        print("___CODERACER_TC_SEP___")\n'
            runner_code += "\nif __name__ == '__main__':\n    main()\n"
        elif is_multi:
            runner_code = (
                "def main():\n"
                "    input_data = sys.stdin.read().splitlines()\n"
                "    if not input_data: return\n"
                "    T = int(input_data[0].strip())\n"
                "    idx = 1\n"
                "    for _tc in range(T):\n"
                "        commands = json.loads(input_data[idx].strip()); idx += 1\n"
                "        args_list = json.loads(input_data[idx].strip()); idx += 1\n"
                "        outputs = []\n"
                "        obj = None\n"
                "        print('___USER_PRINT_START___')\n"
                "        for cmd, args in zip(commands, args_list):\n"
            )

            if constructor_method:
                runner_code += f"            if cmd == '{class_name}':\n"
                runner_code += f"                obj = {class_name}(*args)\n"
                runner_code += f"                outputs.append(None)\n"
            else:
                runner_code += f"            if cmd == '{class_name}':\n"
                runner_code += f"                obj = {class_name}()\n"
                runner_code += f"                outputs.append(None)\n"

            for method in methods:
                if method.is_constructor:
                    continue
                runner_code += f"            elif cmd == '{method.name}':\n"
                if method.type != "void" and method.type != "VOID" and method.type:
                    runner_code += f"                res = obj.{method.name}(*args)\n"
                    runner_code += f"                outputs.append(res)\n"
                else:
                    runner_code += f"                obj.{method.name}(*args)\n"
                    runner_code += f"                outputs.append(None)\n"

            runner_code += "        print('___USER_PRINT_END___')\n"
            runner_code += "        print(json.dumps(outputs, separators=(',', ':'), cls=CustomEncoder))\n"
            runner_code += '        print("___CODERACER_TC_SEP___")\n\n'
            runner_code += "if __name__ == '__main__':\n    main()\n"
        else:
            runner_code = (
                "def main():\n    pass\n\nif __name__ == '__main__':\n    main()\n"
            )

    elif lang_name in ["JAVASCRIPT", "TYPESCRIPT"]:
        block += f"class {class_name} {{\n"
        if is_multi:
            if constructor_method:
                c_inputs = list(constructor_method.parameters.all().order_by("id"))
                if lang_name == "TYPESCRIPT":
                    c_args = ", ".join(
                        [
                            f"{v.name}: {get_ts_type(v.type, v.template_type, v.array_dimensions)}"
                            for v in c_inputs
                        ]
                    )
                else:
                    c_args = ", ".join([v.name for v in c_inputs])
                block += f"    constructor({c_args}) {{\n        \n    }}\n\n"
            else:
                block += "    constructor() {\n        \n    }\n\n"

        for method in methods:
            if method.is_constructor:
                continue
            inputs = list(method.parameters.all().order_by("id"))
            if lang_name == "TYPESCRIPT":
                ret_type = f": {get_ts_type(method.type, method.template_type, method.array_dimensions)}"
                args = ", ".join(
                    [
                        f"{v.name}: {get_ts_type(v.type, v.template_type, v.array_dimensions)}"
                        for v in inputs
                    ]
                )
            else:
                ret_type = ""
                args = ", ".join([v.name for v in inputs])

                jsdoc = "    /**\n"
                for v in inputs:
                    t = (
                        get_ts_type(v.type, v.template_type, v.array_dimensions)
                        .replace(" | null", "")
                        .replace("(", "")
                        .replace(")", "")
                    )
                    jsdoc += f"     * @param {{{t}}} {v.name}\n"
                ret_t = (
                    get_ts_type(
                        method.type, method.template_type, method.array_dimensions
                    )
                    .replace(" | null", "")
                    .replace("(", "")
                    .replace(")", "")
                )
                if method.type not in ["void", "VOID"] and method.type:
                    jsdoc += f"     * @return {{{ret_t}}}\n"
                jsdoc += "     */\n"
                block += jsdoc

            block += f"    {method.name}({args}){ret_type} {{\n        // add your method calls here\n        \n    }}\n"
        block += "}\n"

        if not is_multi and methods:
            method = methods[0]
            inputs = list(method.parameters.all().order_by("id"))
            runner_code = ""
            if lang_name == "TYPESCRIPT":
                runner_code += "declare var require: any;\n"
            runner_code += (
                "\nconst input_data = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n"
                "if (input_data.length > 0) {\n"
                "    const T = parseInt(input_data[0].trim());\n"
                "    let idx = 1;\n"
                "    for (let _tc = 0; _tc < T; _tc++) {\n"
            )
            for i, v in enumerate(inputs):
                if (
                    v.type not in dict(VariableType.choices)
                    and v.type != VariableType.ARRAY
                ):
                    if input_output_function.strip():
                        runner_code += (
                            f"        const {v.name} = input(input_data[idx++]);\n"
                        )
                    else:
                        runner_code += f"        const {v.name} = null; idx++; // TODO: Implement parsing logic for custom type {v.type}\n"
                else:
                    runner_code += f"        const {v.name} = JSON.parse(input_data[idx++].trim());\n"

            runner_code += f"        const solution = new {class_name}();\n"
            call = f"solution.{method.name}({', '.join([v.name for v in inputs])})"
            runner_code += '        console.log("___USER_PRINT_START___");\n'
            if method.type != "void" and method.type != "VOID":
                runner_code += f"        const result = {call};\n"
                runner_code += '        console.log("___USER_PRINT_END___");\n'
                if has_custom_print(input_output_function, method.type, lang_name):
                    runner_code += f"        print(result);\n"
                else:
                    runner_code += f"        console.log(JSON.stringify(result));\n"
            else:
                runner_code += f"        {call};\n"
                runner_code += '        console.log("___USER_PRINT_END___");\n'
            runner_code += '        console.log("___CODERACER_TC_SEP___");\n'
            runner_code += "    }\n}\n"
        elif is_multi:
            runner_code = ""
            if lang_name == "TYPESCRIPT":
                runner_code += "declare var require: any;\n"
            runner_code += (
                "\nconst input_data = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n"
                "if (input_data.length > 0) {\n"
                "    const T = parseInt(input_data[0].trim());\n"
                "    let idx = 1;\n"
                "    for (let _tc = 0; _tc < T; _tc++) {\n"
                "        const commands = JSON.parse(input_data[idx++].trim());\n"
                "        const args_list = JSON.parse(input_data[idx++].trim());\n"
                "        const outputs = [];\n"
                "        let obj = null;\n"
                '        console.log("___USER_PRINT_START___");\n'
                "        for(let i=0; i<commands.length; i++) {\n"
                "            const cmd = commands[i];\n"
                "            const args = args_list[i];\n"
            )

            if constructor_method:
                runner_code += f"            if (cmd === '{class_name}') {{\n"
                runner_code += f"                obj = new {class_name}(...args);\n"
                runner_code += f"                outputs.push(null);\n"
                runner_code += f"            }}\n"
            else:
                runner_code += f"            if (cmd === '{class_name}') {{\n"
                runner_code += f"                obj = new {class_name}();\n"
                runner_code += f"                outputs.push(null);\n"
                runner_code += f"            }}\n"

            for method in methods:
                if method.is_constructor:
                    continue
                runner_code += f"            else if (cmd === '{method.name}') {{\n"
                if method.type != "void" and method.type != "VOID" and method.type:
                    runner_code += (
                        f"                const res = obj.{method.name}(...args);\n"
                        f"                outputs.push(res);\n"
                    )
                else:
                    runner_code += (
                        f"                obj.{method.name}(...args);\n"
                        f"                outputs.push(null);\n"
                    )
                runner_code += f"            }}\n"

            runner_code += "        }\n"
            runner_code += '        console.log("___USER_PRINT_END___");\n'
            runner_code += "        console.log(JSON.stringify(outputs));\n"
            runner_code += '        console.log("___CODERACER_TC_SEP___");\n'
            runner_code += "    }\n}\n"
        else:
            runner_code = ""
            if lang_name == "TYPESCRIPT":
                runner_code += "declare var require: any;\n"

    elif lang_name == "JAVA":
        block += f"class {class_name} {{\n"
        if is_multi:
            if constructor_method:
                c_inputs = list(constructor_method.parameters.all().order_by("id"))
                c_args = ", ".join(
                    [
                        f"{get_java_type(v.type, v.template_type, v.array_dimensions)} {v.name}"
                        for v in c_inputs
                    ]
                )
                block += f"    public {class_name}({c_args}) {{\n        \n    }}\n\n"
            else:
                block += f"    public {class_name}() {{\n        \n    }}\n\n"

        for method in methods:
            if method.is_constructor:
                continue
            inputs = list(method.parameters.all().order_by("id"))
            ret_type = get_java_type(
                method.type, method.template_type, method.array_dimensions
            )
            args = ", ".join(
                [
                    f"{get_java_type(v.type, v.template_type, v.array_dimensions)} {v.name}"
                    for v in inputs
                ]
            )
            block += f"    public {ret_type} {method.name}({args}) {{\n        // add your method calls here\n        \n    }}\n"
        block += "}\n"

        if not is_multi and methods:
            method = methods[0]
            inputs = list(method.parameters.all().order_by("id"))
            ret_type = get_java_type(
                method.type, method.template_type, method.array_dimensions
            )
            runner_code = (
                "public class Main {\n"
                "    static void _print_res(Object val) {\n"
                '        if (val == null) { System.out.print("null"); }\n'
                '        else if (val instanceof String) { System.out.print("\\"" + val + "\\""); }\n'
                "        else if (val.getClass().isArray()) {\n"
                '            System.out.print("[");\n'
                "            int len = java.lang.reflect.Array.getLength(val);\n"
                "            for(int i=0; i<len; i++) {\n"
                '                if(i>0) System.out.print(",");\n'
                "                _print_res(java.lang.reflect.Array.get(val, i));\n"
                "            }\n"
                '            System.out.print("]");\n'
                "        }\n"
                "        else { System.out.print(val); }\n"
                "    }\n"
                "    public static void main(String[] args) {\n"
                "        Scanner sc = new Scanner(System.in);\n"
                "        if (!sc.hasNextInt()) return;\n"
                "        int T = sc.nextInt();\n"
                "        for (int _tc = 0; _tc < T; _tc++) {\n"
            )
            for v in inputs:
                if v.type == VariableType.ARRAY:
                    runner_code += f"            {get_java_type(v.type, v.template_type, v.array_dimensions)} {v.name};\n"
                    runner_code += generate_java_reader(
                        v.name,
                        v.template_type,
                        v.array_dimensions,
                        "            ",
                        is_root=True,
                    )
                elif (
                    v.type not in dict(VariableType.choices)
                    and v.type != VariableType.ARRAY
                ):
                    t = get_java_type(v.type)
                    if input_output_function.strip():
                        runner_code += f"            {t} {v.name} = Parser.input(sc);\n"
                    else:
                        runner_code += f"            {t} {v.name} = null; // TODO: Implement parsing logic\n"
                else:
                    t_java = get_java_type(v.type, v.template_type, v.array_dimensions)
                    if v.type == VariableType.INTEGER:
                        runner_code += (
                            f"            {t_java} {v.name} = sc.nextInt();\n"
                        )
                    elif v.type == VariableType.STRING:
                        runner_code += f'            sc.skip("\\\\s*");\n'
                        runner_code += (
                            f"            {t_java} {v.name} = sc.nextLine();\n"
                        )
                    else:
                        runner_code += f"            {t_java} {v.name} = sc.next();\n"

            runner_code += f"\n            {class_name} sol = new {class_name}();\n"
            call = f"sol.{method.name}({', '.join([v.name for v in inputs])})"
            runner_code += '            System.out.println("___USER_PRINT_START___");\n'
            if method.type != "void" and method.type != "VOID" and ret_type != "void":
                runner_code += f"            {ret_type} result = {call};\n"
                runner_code += (
                    '            System.out.println("___USER_PRINT_END___");\n'
                )
                if has_custom_print(input_output_function, method.type, "JAVA"):
                    runner_code += "            Parser.print(result);\n            System.out.println();\n"
                else:
                    runner_code += "            _print_res(result);\n            System.out.println();\n"
            else:
                runner_code += f"            {call};\n"
                runner_code += (
                    '            System.out.println("___USER_PRINT_END___");\n'
                )
            runner_code += '            System.out.println("___CODERACER_TC_SEP___");\n'
            runner_code += "        }\n"
            runner_code += "    }\n}\n"
        elif is_multi:
            runner_code = (
                "public class Main {\n"
                "    static void _print_res(Object val) {\n"
                '        if (val == null) { System.out.print("null"); }\n'
                '        else if (val instanceof String) { System.out.print("\\"" + val + "\\""); }\n'
                "        else if (val.getClass().isArray()) {\n"
                '            System.out.print("[");\n'
                "            int len = java.lang.reflect.Array.getLength(val);\n"
                "            for(int i=0; i<len; i++) {\n"
                '                if(i>0) System.out.print(",");\n'
                "                _print_res(java.lang.reflect.Array.get(val, i));\n"
                "            }\n"
                '            System.out.print("]");\n'
                "        }\n"
                "        else { System.out.print(val); }\n"
                "    }\n"
                "    public static void main(String[] args) {\n"
                "        Scanner sc = new Scanner(System.in);\n"
                "        if (!sc.hasNextInt()) return;\n"
                "        int T = sc.nextInt();\n"
                "        for (int _tc = 0; _tc < T; _tc++) {\n"
                "            if (!sc.hasNextInt()) break;\n"
                "            int num_cmds = sc.nextInt();\n"
                "            String[] commands = new String[num_cmds];\n"
                '            sc.skip("\\\\s*");\n'
                "            for(int i=0; i<num_cmds; i++) commands[i] = sc.nextLine();\n"
                "            int num_outer_args = sc.nextInt();\n"
                "            List<String> outputs = new ArrayList<>();\n"
                f"            {class_name} obj = null;\n"
                '            System.out.println("___USER_PRINT_START___");\n'
                "            for(int i=0; i<num_cmds; i++) {\n"
                "                String cmd = commands[i];\n"
                "                int arg_len = sc.nextInt();\n"
            )

            if constructor_method:
                c_inputs = list(constructor_method.parameters.all().order_by("id"))
                runner_code += f'                if (cmd.equals("{class_name}")) {{\n'
                for v in c_inputs:
                    if v.type == VariableType.ARRAY:
                        runner_code += f"                    {get_java_type(v.type, v.template_type, v.array_dimensions)} {v.name};\n"
                        runner_code += generate_java_reader(
                            v.name,
                            v.template_type,
                            v.array_dimensions,
                            "                    ",
                            is_root=True,
                        )
                    elif v.type == VariableType.STRING:
                        runner_code += f'                    sc.skip("\\\\s*");\n                    {get_java_type(v.type)} {v.name} = sc.nextLine();\n'
                    elif v.type == VariableType.INTEGER:
                        runner_code += f"                    {get_java_type(v.type)} {v.name} = sc.nextInt();\n"
                    else:
                        runner_code += f"                    {get_java_type(v.type)} {v.name} = sc.next();\n"
                c_args = ", ".join([v.name for v in c_inputs])
                runner_code += (
                    f"                    obj = new {class_name}({c_args});\n"
                )
                runner_code += (
                    '                    outputs.add("null");\n                }\n'
                )
            else:
                runner_code += f'                if (cmd.equals("{class_name}")) {{\n'
                runner_code += f"                    obj = new {class_name}();\n"
                runner_code += (
                    '                    outputs.add("null");\n                }\n'
                )

            for method in methods:
                if method.is_constructor:
                    continue
                inputs = list(method.parameters.all().order_by("id"))
                runner_code += (
                    f'                else if (cmd.equals("{method.name}")) {{\n'
                )
                for v in inputs:
                    if v.type == VariableType.ARRAY:
                        runner_code += f"                    {get_java_type(v.type, v.template_type, v.array_dimensions)} {v.name};\n"
                        runner_code += generate_java_reader(
                            v.name,
                            v.template_type,
                            v.array_dimensions,
                            "                    ",
                            is_root=True,
                        )
                    elif v.type == VariableType.STRING:
                        runner_code += f'                    sc.skip("\\\\s*");\n                    {get_java_type(v.type)} {v.name} = sc.nextLine();\n'
                    elif v.type == VariableType.INTEGER:
                        runner_code += f"                    {get_java_type(v.type)} {v.name} = sc.nextInt();\n"
                    else:
                        runner_code += f"                    {get_java_type(v.type)} {v.name} = sc.next();\n"
                call = f"obj.{method.name}({', '.join([v.name for v in inputs])})"
                if method.type != "void" and method.type != "VOID":
                    runner_code += f"                    {get_java_type(method.type, method.template_type, method.array_dimensions)} res = {call};\n"
                    runner_code += "                    java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();\n"
                    runner_code += "                    java.io.PrintStream ps = new java.io.PrintStream(baos);\n"
                    runner_code += (
                        "                    java.io.PrintStream old = System.out;\n"
                    )
                    runner_code += "                    System.setOut(ps);\n"
                    if has_custom_print(input_output_function, method.type, "JAVA"):
                        runner_code += "                    Parser.print(res);\n"
                    else:
                        runner_code += "                    _print_res(res);\n"
                    runner_code += "                    System.out.flush();\n"
                    runner_code += "                    System.setOut(old);\n"
                    runner_code += "                    outputs.add(baos.toString());\n"
                else:
                    runner_code += f"                    {call};\n"
                    runner_code += '                    outputs.add("null");\n'
                runner_code += "                }\n"

            runner_code += "            }\n"
            runner_code += '            System.out.println("___USER_PRINT_END___");\n'
            runner_code += '            System.out.print("[");\n'
            runner_code += "            for (int i = 0; i < outputs.size(); i++) {\n"
            runner_code += '                if (i > 0) System.out.print(",");\n'
            runner_code += "                System.out.print(outputs.get(i));\n"
            runner_code += "            }\n"
            runner_code += '            System.out.println("]");\n'
            runner_code += '            System.out.println("___CODERACER_TC_SEP___");\n'
            runner_code += "        }\n"
            runner_code += "    }\n}\n"
        else:
            runner_code = (
                "public class Main { public static void main(String[] args) {} }"
            )

    return runner_code, block


def clean_js_ts_fs_imports(code, language):
    if not code:
        return code
    from user.models import CodingLanguage

    if language == CodingLanguage.JAVASCRIPT:
        code = re.sub(r"const\s+fs\s*=\s*require\(['\"]fs['\"]\);?", "", code)
    elif language == CodingLanguage.TYPESCRIPT:
        pattern1 = r"const\s+fs\s*=\s*require\(['\"]fs['\"]\);?"
        pattern2 = r"import\s+(\*\s+as\s+)?fs\s+from\s+['\"]fs['\"];?"
        pattern3 = r"import\s+fs\s*=\s*require\(['\"]fs['\"]\);?"
        pattern4 = r"declare\s+var\s+require\s*:\s*any;?"
        for p in [pattern1, pattern2, pattern3, pattern4]:
            code = re.sub(p, "", code)
    return code


def assemble_full_code(problem, language, user_code):
    from problem.models import Codeblock, CustomTypeLanguage, VariableType
    from problem.utils import IMPORT_BLOCKS

    codeblock = Codeblock.objects.filter(problem=problem, language=language).first()
    if not codeblock:
        return user_code

    imports = IMPORT_BLOCKS.get(language, "")

    # Retrieve custom type names used by the problem
    methods = list(problem.methods.all().order_by("id"))
    custom_type_names = set()
    for m in methods:
        if (
            m.type
            and m.type not in dict(VariableType.choices)
            and m.type != VariableType.ARRAY
        ):
            custom_type_names.add(m.type)
        if (
            m.template_type
            and m.template_type not in dict(VariableType.choices)
            and m.template_type != VariableType.ARRAY
        ):
            custom_type_names.add(m.template_type)
        for v in m.parameters.all():
            if (
                v.type
                and v.type not in dict(VariableType.choices)
                and v.type != VariableType.ARRAY
            ):
                custom_type_names.add(v.type)
            if (
                v.template_type
                and v.template_type not in dict(VariableType.choices)
                and v.template_type != VariableType.ARRAY
            ):
                custom_type_names.add(v.template_type)

    ctl_qs = CustomTypeLanguage.objects.filter(
        custom_type__name__in=custom_type_names, language=language
    )
    class_declaration = "\n".join(
        [c.class_declaration for c in ctl_qs if c.class_declaration]
    )
    input_output_function = "\n".join(
        [c.input_output_function for c in ctl_qs if c.input_output_function]
    )

    runner_code = codeblock.runner_code
    if "###__CODE_SEPARATOR__###" in runner_code:
        parts = runner_code.split("###__CODE_SEPARATOR__###")
        runner_code = parts[-1]

    runner_code = runner_code.strip()

    # Clean duplicates of global fs declaration
    class_declaration = clean_js_ts_fs_imports(class_declaration, language)
    input_output_function = clean_js_ts_fs_imports(input_output_function, language)
    user_code = clean_js_ts_fs_imports(user_code, language)
    runner_code = clean_js_ts_fs_imports(runner_code, language)

    parts = []
    if imports.strip():
        parts.append(imports.strip())
    if class_declaration.strip():
        parts.append(class_declaration.strip())
    if input_output_function.strip():
        parts.append(input_output_function.strip())
    if user_code.strip():
        parts.append(user_code.strip())
    if runner_code.strip():
        parts.append(runner_code)

    return "\n\n".join(parts)
