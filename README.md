# CodeRacer Web

A professional monorepo for the CodeRacer platform, featuring a Django REST API, a Next.js frontend, and a Judge0-powered code execution engine.

## Project Structure

- `api/`: Django REST Framework backend.
- `web/`: Next.js frontend with Tailwind CSS.
- `runners/`: Dockerized code execution environments for various languages.

---

## Prerequisites

Before starting, ensure you have the following installed on your system:

###  macOS Setup

For macOS, we recommend using **Colima** instead of Docker Desktop for a lightweight and developer-friendly experience.

1.  **Install Homebrew** (if not already installed):
    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```
2.  **Install Colima and Docker CLI**:
    ```bash
    brew install colima docker docker-compose
    ```
3.  **Start Colima**:
    ```bash
    colima start --cpu 4 --memory 8 --disk 100
    ```

### 🐧 Linux Setup (Ubuntu/Debian)

1.  **Install Docker Engine**:
    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    ```
2.  **Install Docker Compose**:
    ```bash
    sudo apt-get update
    sudo apt-get install docker-compose-plugin
    ```
3.  **Manage Docker as non-root user**:
    ```bash
    sudo usermod -aG docker $USER
    newgrp docker
    ```

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/coderacer-web.git
cd coderacer-web
```

### 2. Configure Environment Variables

Create a `.env` file in the `api/` directory:

```bash
touch api/.env
```

Add the following keys to `api/.env`:

```text
# AI Providers
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here

# Django Security
SECRET_KEY=your_secret_key_here
DEBUG=True
```

### 3. Start the Platform

Use Docker Compose to build and start all services (API, Frontend, Database, Nginx):

```bash
docker-compose up -d --build
```

### 4. Initialize Database

Run migrations, load the initial data, and create an admin user:

```bash
# Make and apply database migrations
docker exec -it api python manage.py makemigrations
docker exec -it api python manage.py migrate

# Load the starter dataset (problems, tags, etc.)
docker exec -it api python manage.py loaddata data.yaml

# Create an administrator account
docker exec -it api python manage.py createsuperuser
```

---

## Accessing the Platform

- **Frontend**: [http://localhost](http://localhost)
- **API Dashboard (Root Ops)**: [http://localhost/api/rootops/](http://localhost/api/rootops/)
- **Django Admin**: [http://localhost/api/admin/](http://localhost/api/admin/)

---

## Development Tools

### Backend (`api`)

- **Testing**: We use `pytest` with `pytest-django`.
  - Run tests: `cd api && pytest`
- **Formatting**: We use `black`.
  - Format code: `cd api && black .`

### Frontend (`web`)

- **Testing**: We use `jest` with React Testing Library.
  - Run tests: `cd web && npm test`
- **Formatting**: We use `prettier`.
  - Format code: `cd web && npm run format`

### Pre-commit Hooks

We use `pre-commit` to ensure code quality.

1. Install pre-commit: `pip install pre-commit`
2. Install hooks:

```bash
pre-commit install --install-hooks --hook-type pre-commit
pre-commit install --install-hooks --hook-type commit-msg
```

3. Run manually: `pre-commit run --all-files

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

---

## Key Features

- **Modern Dashboard**: Custom administrative hub with dynamic sidebar and persistent navigation.
- **AI Testcase Generation**: Automatically generate hundreds of test cases using Gemini (with ChatGPT fallback).
- **Rich Problem Editor**: Support for CKEditor, MathJax (LaTeX), and multi-language starter code.
- **Advanced Execution Engine**: Parallelized test case evaluation with real-time progress tracking and live logs.
- **Detailed Feedback**: Grid-based test results with hidden test case protection.

---

## General Guidelines

- **Docker**: The project uses Docker Compose for local development. Always check `docker-compose.yaml` for service definitions.
- **Monorepo**: Be mindful of the separate environments for `api` and `web`. Do not mix dependencies or configurations.
- **Security**: Never commit sensitive data or credentials. Use environment variables.
