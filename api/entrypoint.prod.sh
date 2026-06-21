#!/bin/bash
set -e

# Use defaults if not provided
DB_HOST=${POSTGRES_HOST:-cdb}
DB_PORT=${POSTGRES_PORT:-5432}

echo "Waiting for postgres at $DB_HOST:$DB_PORT..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.1
done
echo "PostgreSQL started"

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Applying database migrations..."
python manage.py migrate --noinput

# If a command is provided, execute it. Otherwise, start gunicorn.
if [ -z "$1" ]; then
    WORKERS=${GUNICORN_WORKERS:-1}
    echo "Starting Gunicorn + Uvicorn worker (workers: $WORKERS)..."
    exec gunicorn apps.asgi:application -k uvicorn.workers.UvicornWorker --workers $WORKERS --timeout 120 --bind 0.0.0.0:8000
else
    echo "Running custom command: $@"
    exec "$@"
fi
