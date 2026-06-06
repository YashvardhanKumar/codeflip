#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting optimized deployment for low-resource environment..."

# 1. Clean up storage before build
echo "🧹 Cleaning up unused Docker data..."
docker system prune -f

# 2. Build images one by one to save RAM
# Building everything at once with 'docker-compose build' can trigger OOM on 1GB RAM.
echo "🏗️ Building API image sequentially..."
DOCKER_TARGET=production docker compose build api

echo "🏗️ Building Web image sequentially..."
# This is the most memory-intensive part.
DOCKER_TARGET=production NODE_ENV=production docker compose build web

echo "🏗️ Building remaining services..."
DOCKER_TARGET=production docker compose build --parallel=false

# 3. Start services
echo "🆙 Starting services..."
# Override bind mounts to harmless paths for production
API_BIND_MOUNT=./empty_dir:/tmp/ignore_api WEB_BIND_MOUNT=./empty_dir:/tmp/ignore_web DOCKER_TARGET=production NODE_ENV=production docker compose up -d

# 4. Final cleanup
echo "🧹 Final storage cleanup..."
docker system prune -f

echo "✅ Deployment complete!"
echo "💡 Tip: If you still experience OOM, ensure you have a swap file enabled."
echo "   Create a 2GB swap file: sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile"
