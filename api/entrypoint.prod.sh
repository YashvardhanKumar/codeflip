#!/bin/bash
set -e

echo "Waiting for postgres..."
while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  sleep 0.1
done
echo "PostgreSQL started"

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Starting Gunicorn + Uvicorn worker..."
exec gunicorn apps.asgi:application -k uvicorn.workers.UvicornWorker --workers 2 --bind 0.0.0.0:8000
