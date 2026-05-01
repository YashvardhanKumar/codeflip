import pytest
from unittest.mock import patch
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
class TestEngineAPI:
    @patch('engine.views.submit_to_judge0')
    def test_run_code(self, mock_submit, api_client):
        # Mock successful response from Judge0
        mock_submit.return_value = {
            'stdout': '4\n',
            'status': {'id': 3, 'description': 'Accepted'},
            'time': '0.05',
            'memory': 1024
        }
        
        url = reverse('run_code')
        payload = {
            'problem_id': 1,
            'source_code': 'print(2+2)',
            'language_id': 71
        }
        
        response = api_client.post(url, payload)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['stdout'] == '4\n'
        mock_submit.assert_called_once()

    @patch('engine.views.submit_to_judge0')
    def test_submit_code(self, mock_submit, api_client):
        mock_submit.return_value = {
            'status': {'id': 3, 'description': 'Accepted'},
            'time': '0.05'
        }
        
        url = reverse('submit_code')
        payload = {
            'problem_id': 1,
            'source_code': 'print(2+2)',
            'language_id': 71
        }
        
        response = api_client.post(url, payload)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status']['description'] == 'Accepted'
        mock_submit.assert_called_once()

    def test_run_code_invalid_payload(self, api_client):
        url = reverse('run_code')
        response = api_client.post(url, {}) # Missing required fields
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
