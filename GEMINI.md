# CodeRacer Web

A monorepo for the CodeRacer platform, featuring a Django REST API and a Next.js frontend.

## Project Structure
- `api/`: Django REST Framework backend.
- `web/`: Next.js frontend with Tailwind CSS.
- `runners/`: Dockerized code execution environments for various languages.

## General Guidelines
- **Docker**: The project uses Docker Compose for local development. Always check `docker-compose.yaml` for service definitions.
- **Monorepo**: Be mindful of the separate environments for `api` and `web`. Do not mix dependencies or configurations.
- **Security**: Never commit sensitive data or credentials. Use environment variables.
