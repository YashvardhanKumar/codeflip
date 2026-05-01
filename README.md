# CodeRacer Web

A monorepo for the CodeRacer platform, featuring a Django REST API and a Next.js frontend.

## Project Structure
- `api/`: Django REST Framework backend.
- `web/`: Next.js frontend with Tailwind CSS.
- `runners/`: Dockerized code execution environments for various languages.

## Development Tools

### Backend (api)
- **Testing**: We use `pytest` with `pytest-django`.
  - Run tests: `cd api && pytest`
- **Formatting**: We use `black`.
  - Format code: `cd api && black .`

### Frontend (web)
- **Testing**: We use `jest` with React Testing Library.
  - Run tests: `cd web && npm test`
- **Formatting**: We use `prettier`.
  - Format code: `cd web && npm run format`

### Pre-commit Hooks
We use `pre-commit` to ensure code quality.
1. Install pre-commit: `pip install pre-commit`
2. Install hooks: `pre-commit install --install-hooks -t pre-commit -t commit-msg`
3. Run manually: `pre-commit run --all-files`

#### Commit Message Rules
We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
Format: `<type>(<scope>): <description>`

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

## General Guidelines
- **Docker**: The project uses Docker Compose for local development. Always check `docker-compose.yaml` for service definitions.
- **Monorepo**: Be mindful of the separate environments for `api` and `web`. Do not mix dependencies or configurations.
- **Security**: Never commit sensitive data or credentials. Use environment variables.
