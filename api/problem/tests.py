import pytest
from django.urls import reverse
from rest_framework import status
from .models import Problem, Tags, Difficulty


@pytest.mark.django_db
class TestProblemAPI:
    def test_list_problems(self, client):
        # Create a sample problem
        tag = Tags.objects.create(tags="Array")
        problem = Problem.objects.create(
            name="Two Sum",
            problem_description="Solve two sum",
            difficulty=Difficulty.EASY,
        )
        problem.tags.add(tag)

        url = reverse("problem-list")
        response = client.get(url)

        assert response.status_code == status.HTTP_200_OK
        # Check if the problem is in the results
        # Assuming PaginatedResponse based on viewset
        assert len(response.data["results"]) >= 1
        assert response.data["results"][0]["name"] == "Two Sum"

    def test_get_problem_detail(self, client):
        problem = Problem.objects.create(
            name="Unique Problem",
            problem_description="Detail check",
            difficulty=Difficulty.MEDIUM,
        )
        url = reverse("problem-detail", args=[problem.id])
        response = client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Unique Problem"

    def test_filter_by_tag(self, client):
        tag = Tags.objects.create(tags="Recursion")
        p1 = Problem.objects.create(name="Fibonacci", difficulty=Difficulty.EASY)
        p1.tags.add(tag)
        Problem.objects.create(name="Merge Sort", difficulty=Difficulty.MEDIUM)

        url = reverse("problem-by-tag")
        response = client.get(url, {"tag": "Recursion"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == "Fibonacci"
