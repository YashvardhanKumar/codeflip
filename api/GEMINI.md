# API Backend (Django)

This directory contains the Django REST Framework backend for CodeFlip.

## Tech Stack
- **Python**: 3.13+
- **Django**: 5.2.x
- **Django REST Framework**: 3.16.x
- **Dependency Management**: `uv`

## Development Standards
- **Package Manager**: Use `uv` for managing dependencies (`uv add`, `uv sync`).
- **Migrations**: Always run `python manage.py makemigrations` and `python manage.py migrate` when changing models. Check migration files for sanity before committing.
- **Serialization**: Use DRF serializers for all API inputs and outputs.
- **App Structure**: Keep logic in `services.py` within apps, and keep `views.py` lean.
- **Testing**: Add tests in `tests.py` for new features or bug fixes. Run tests using `python manage.py test`.

## Run Commands
- `python manage.py runserver` (local dev)
- `uv run manage.py ...` (using uv)
