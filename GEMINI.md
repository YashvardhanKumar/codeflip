# CodeRacer Web

A monorepo for the CodeRacer platform, featuring a Django REST API and a Next.js frontend.

## Project Structure
- `api/`: Django REST Framework backend.
- `web/`: Next.js frontend with Tailwind CSS.
- `runners/`: Dockerized code execution environments for various languages.

## Low-Resource Optimization (e.g., EC2 1GB RAM)

The production environment is optimized for low-resource instances using a unified configuration:
- **Unified Config**: Dockerfiles and Docker Compose are merged. Use `DOCKER_TARGET=production` and `NODE_ENV=production` for production deployments.
- **Static Files**: Nginx serves static/media files directly from volumes in both dev and prod. In development, run `docker compose exec api python manage.py collectstatic` to populate the static volume.
- **Sequential Builds**: Use `./scripts/optimize-deploy.sh` to build services one by one. This prevents OOM crashes during the Next.js build.
- **Standalone Frontend**: The Next.js app uses `output: 'standalone'` to minimize image size and memory footprint.
- **Multi-stage API**: The Django image is built using a multi-stage process to remove build-time dependencies.
- **Resource Limits**: Memory limits are enforced in `docker-compose.yaml` (configured via env vars) to prevent container competition from crashing the host.
- **Swap Space**: For 1GB RAM instances, it is highly recommended to enable at least 2GB of swap space.
