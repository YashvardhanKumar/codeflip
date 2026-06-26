import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestEngineAPI:
    @patch("engine.services.submit_to_judge0")
    def test_run_code(self, mock_submit, api_client):
        # Mock successful response from Judge0
        mock_submit.return_value = {
            "stdout": "4\n",
            "status": {"id": 3, "description": "Accepted"},
            "time": "0.05",
            "memory": 1024,
        }

        url = reverse("run-code")
        payload = {"problem_id": 1, "source_code": "print(2+2)", "language_id": 71}

        response = api_client.post(url, payload)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["stdout"] == "4\n"
        mock_submit.assert_called_once()

    @patch("engine.services.submit_to_judge0")
    def test_submit_code(self, mock_submit, api_client):
        mock_submit.return_value = {
            "status": {"id": 3, "description": "Accepted"},
            "time": "0.05",
        }

        url = reverse("submit-code")
        payload = {"problem_id": 1, "source_code": "print(2+2)", "language_id": 71}

        response = api_client.post(url, payload)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"]["description"] == "Accepted"
        mock_submit.assert_called_once()

    def test_run_code_invalid_payload(self, api_client):
        url = reverse("run-code")
        response = api_client.post(url, {})  # Missing required fields

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_parse_batch_stdout(self):
        from engine.services import parse_batch_stdout
        from engine.constants import TC_SEPARATOR

        stdout = f"res1\n{TC_SEPARATOR}\nres2\n{TC_SEPARATOR}\n"
        results = parse_batch_stdout(stdout, 2)
        assert results == ["res1", "res2"]

        stdout_partial = f"res1\n{TC_SEPARATOR}"
        results_partial = parse_batch_stdout(stdout_partial, 2)
        assert results_partial == ["res1", ""]

    def test_format_batch_stdin(self):
        from engine.services import format_batch_stdin

        class MockTestCase:
            def __init__(self, input_val):
                self.input = input_val

        tcs = [MockTestCase("5\n6"), MockTestCase("7\n8")]
        # For non-array language, format_stdin returns raw input lines
        formatted = format_batch_stdin(tcs, language_id=71)
        assert formatted == "2\n5\n6\n7\n8"

    @patch("requests.post")
    def test_run_batch_submission_success(self, mock_post):
        from engine.services import run_batch_submission
        from engine.constants import TC_SEPARATOR

        # Mock Response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "stdout": "YQ==\n___CODERACER_TC_SEP___\nYg==",  # base64 encoded "a" and "b" split by sep
            "status": {"id": 3, "description": "Accepted"},
            "time": "0.1",
            "memory": 2048,
        }
        mock_post.return_value = mock_response

        class MockTestCase:
            def __init__(self, id, input_val, output_val):
                self.id = id
                self.input = input_val
                self.output = output_val
                self.display_testcase = True

        tcs = [MockTestCase(1, "in1", "a"), MockTestCase(2, "in2", "b")]
        payload = {"source_code": "some code", "language_id": 71}

        # Mock output returned by Judge0 CE wait request has already split stdout
        # But wait, our mock_response.json is base64 encoded.
        # Wait! The stdout in response from Judge0 CE wait endpoint is base64 encoded as a WHOLE.
        # So "a\n___CODERACER_TC_SEP___\nb" encoded in base64 is:
        # base64("a\n___CODERACER_TC_SEP___\nb") = "YQpfX19DT0RFUkFDRVJfVENfU0VQX19fCmI="
        import base64

        full_stdout = (
            f"_USER_PRINT_START_\nhello printed\n_USER_PRINT_END_\na\n{TC_SEPARATOR}\n"
            f"_USER_PRINT_START_\nworld printed\n_USER_PRINT_END_\nb"
        )
        mock_response.json.return_value = {
            "stdout": base64.b64encode(full_stdout.encode("utf-8")).decode("utf-8"),
            "status": {"id": 3, "description": "Accepted"},
            "time": "0.1",
            "memory": 2048,
        }

        results = run_batch_submission(payload, tcs, language_id=71)

        assert len(results) == 2
        assert results[0]["is_accepted"] is True
        assert results[0]["stdout"] == "a"
        assert results[0]["compile_output"] == "hello printed"
        assert results[1]["is_accepted"] is True
        assert results[1]["stdout"] == "b"
        assert results[1]["compile_output"] == "world printed"


from django.test import TestCase


class TestValidateCaseOutput(TestCase):
    def setUp(self):
        from problem.models import Problem

        self.problem = Problem.objects.create(name="Test Problem")

    def test_exact_match(self):
        from engine.services import validate_case_output

        self.problem.validator_type = "EXACT"
        self.problem.save()
        assert (
            validate_case_output(self.problem, " [0, 1] ", "[0, 1]", "any-input")
            is True
        )
        assert (
            validate_case_output(self.problem, "[0, 2]", "[0, 1]", "any-input") is False
        )

    def test_any_order_match_json_array(self):
        from engine.services import validate_case_output

        self.problem.validator_type = "ANY_ORDER"
        self.problem.save()
        # Order of elements in list
        assert (
            validate_case_output(self.problem, "[2, 1]", "[1, 2]", "any-input") is True
        )
        # Nested list order of elements
        assert (
            validate_case_output(
                self.problem, "[[3, 4], [1, 2]]", "[[1, 2], [3, 4]]", "any-input"
            )
            is True
        )
        # Dict representation
        assert (
            validate_case_output(
                self.problem, '{"b": 2, "a": 1}', '{"a": 1, "b": 2}', "any-input"
            )
            is True
        )
        # Not a match
        assert (
            validate_case_output(self.problem, "[[1, 3]]", "[[1, 2]]", "any-input")
            is False
        )

    def test_any_order_match_text_lines(self):
        from engine.services import validate_case_output

        self.problem.validator_type = "ANY_ORDER"
        self.problem.save()
        # Plain text lines
        assert (
            validate_case_output(
                self.problem, "line1\nline2", "line2\nline1", "any-input"
            )
            is True
        )
        assert (
            validate_case_output(
                self.problem, "line1\nline2", "line1\nline3", "any-input"
            )
            is False
        )

    def test_custom_validator(self):
        from engine.services import validate_case_output

        self.problem.validator_type = "CUSTOM"
        self.problem.custom_validator = (
            "def validate(actual, expected, tc_input):\n"
            "    # Accepts output if it's double the expected value\n"
            "    return int(actual.strip()) == int(expected.strip()) * 2\n"
        )
        self.problem.save()
        assert validate_case_output(self.problem, "10", "5", "any-input") is True
        assert validate_case_output(self.problem, "9", "5", "any-input") is False
