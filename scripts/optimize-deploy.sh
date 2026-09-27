#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting optimized zero-downtime deployment for coderacer-web..."

# 0. Sync codebase with GitHub
echo "📥 Syncing codebase with GitHub..."
git stash 2>/dev/null || true
git pull origin master

export API_IMAGE="${API_IMAGE:-ghcr.io/yashvardhankumar/coderacer-web-api:latest}"
export WEB_IMAGE="${WEB_IMAGE:-ghcr.io/yashvardhankumar/coderacer-web-web:latest}"
export API_BIND_MOUNT="${API_BIND_MOUNT:-./empty_dir:/tmp/ignore_api}"
export WEB_BIND_MOUNT="${WEB_BIND_MOUNT:-./empty_dir:/tmp/ignore_web}"
export NGINX_BIND_IP="${NGINX_BIND_IP:-127.0.0.1}"
export NGINX_HOST_PORT="${NGINX_HOST_PORT:-8080}"
export DOCKER_TARGET="production"
export NODE_ENV="production"

# 1. Pull pre-built images from GitHub Container Registry (zero load on EC2)
echo "📥 Pulling latest pre-built images from GitHub Container Registry..."
if docker compose --project-name coderacer-web pull; then
  echo "✅ Pre-built images pulled successfully from GHCR."
else
  echo "⚠️ GHCR pull failed, falling back to sequential local build..."
  docker compose --project-name coderacer-web build api
  docker compose --project-name coderacer-web build web
fi

# 2. Swap containers with ZERO DOWNTIME (existing containers keep running until new ones start)
echo "🆙 Starting and updating coderacer-web services..."
docker compose --project-name coderacer-web up -d --remove-orphans

echo "⚙️ Regenerating codeblocks for all problems..."
docker compose --project-name coderacer-web exec -T api python manage.py shell -c "from problem.models import Problem; from problem.utils import generate_codeblocks_for_problem; [generate_codeblocks_for_problem(p, force=True) for p in Problem.objects.all()]" || echo "⚠️ Warning: Failed to regenerate codeblocks."

echo "🔄 Restarting Nginx to refresh DNS and container IPs..."
docker compose --project-name coderacer-web restart nginx

# 3. Safe cleanup of dangling build artifacts
echo "🧹 Safe cleanup of dangling build artifacts..."
docker image prune -f
docker builder prune -f --keep-storage 2GB 2>/dev/null || true

echo "✅ Coderacer deployment complete with zero downtime!"
