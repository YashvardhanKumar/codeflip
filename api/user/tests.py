import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user_data():
    return {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password123',
        'password2': 'password123',
        'name': 'Test User'
    }

@pytest.mark.django_db
class TestUserAPI:
    def test_user_registration(self, api_client, user_data):
        url = reverse('register-list')
        response = api_client.post(url, user_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'token' in response.data
        assert response.data['user']['username'] == 'testuser'

    def test_user_login(self, api_client, user_data):
        # First register
        User.objects.create_user(username=user_data['username'], password=user_data['password'])
        
        url = reverse('login')
        response = api_client.post(url, {
            'username': user_data['username'],
            'password': user_data['password']
        })
        
        assert response.status_code == status.HTTP_200_OK
        assert 'token' in response.data

    def test_get_me(self, api_client, user_data):
        user = User.objects.create_user(username=user_data['username'], password=user_data['password'])
        api_client.force_authenticate(user=user)
        
        url = reverse('user-me')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == user_data['username']

    def test_update_profile(self, api_client, user_data):
        user = User.objects.create_user(username=user_data['username'], password=user_data['password'])
        api_client.force_authenticate(user=user)
        
        url = reverse('user-update-profile')
        response = api_client.patch(url, {'name': 'Updated Name'})
        
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.name == 'Updated Name'
