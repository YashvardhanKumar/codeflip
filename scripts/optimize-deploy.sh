#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting optimized deployment for coderacer-web..."

# 0. Sync codebase with GitHub
echo "📥 Syncing codebase with GitHub..."
git stash 2>/dev/null || true
git pull origin master

# 1. Clean up legacy un-prefixed containers from older coderacer deployments (if any exist)
for legacy in nginx api celery_worker web redis postgresql; do
  if docker ps -a --format '{{.Names}}' | grep -Eq "^${legacy}\$"; then
    if docker inspect "$legacy" 2>/dev/null | grep -qi "coderacer"; then
      echo "🧹 Removing legacy coderacer container: $legacy..."
      docker stop "$legacy" 2>/dev/null || true
      docker rm "$legacy" 2>/dev/null || true
    fi
  fi
done

# 2. Safe cleanup of dangling images before build (does NOT delete stopped containers from other projects)
echo "🧹 Cleaning up dangling images..."
docker image prune -f

# 3. Build images one by one to save RAM
echo "🏗️ Building API image sequentially..."
DOCKER_TARGET=production docker compose --project-name coderacer-web build api

echo "🏗️ Building Web image sequentially..."
DOCKER_TARGET=production NODE_ENV=production docker compose --project-name coderacer-web build web

echo "🏗️ Building remaining services..."
DOCKER_TARGET=production docker compose --project-name coderacer-web build --parallel=false

# 4. Start & reset ONLY coderacer-web containers
echo "🆙 Starting and resetting coderacer-web services..."
# Override bind mounts to harmless paths for production
API_BIND_MOUNT=./empty_dir:/tmp/ignore_api WEB_BIND_MOUNT=./empty_dir:/tmp/ignore_web DOCKER_TARGET=production NODE_ENV=production docker compose --project-name coderacer-web up -d --remove-orphans

echo "⚙️ Regenerating codeblocks for all problems..."
docker compose --project-name coderacer-web exec -T api python manage.py shell -c "from problem.models import Problem; from problem.utils import generate_codeblocks_for_problem; [generate_codeblocks_for_problem(p, force=True) for p in Problem.objects.all()]" || echo "⚠️ Warning: Failed to regenerate codeblocks."

echo "🔄 Restarting Nginx to refresh DNS and container IPs..."
docker compose --project-name coderacer-web restart nginx

# 5. Final safe cleanup (removes only dangling untagged images and old build cache)
echo "🧹 Safe cleanup of dangling build artifacts..."
docker image prune -f
docker builder prune -f --keep-storage 2GB 2>/dev/null || true

echo "✅ Coderacer deployment complete!"
echo "💡 Tip: If you still experience OOM, ensure you have a swap file enabled."
echo "   Create a 2GB swap file: sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile"
