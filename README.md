# CodeRacer Web

A professional monorepo for the CodeRacer platform, featuring a Django REST API, a Next.js frontend, and a Judge0-powered code execution engine.

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
Run migrations and create an admin user:
```bash
docker exec -it api python manage.py migrate
docker exec -it api python manage.py createsuperuser
```

---

## Accessing the Platform

- **Frontend**: [http://localhost](http://localhost)
- **API Dashboard (Root Ops)**: [http://api.localhost/rootops/](http://api.localhost/rootops/)
- **Django Admin**: [http://api.localhost/admin/](http://api.localhost/admin/)

---

## Key Features
- **Modern Dashboard**: Custom administrative hub with dynamic sidebar and persistent navigation.
- **AI Testcase Generation**: Automatically generate hundreds of test cases using Gemini (with ChatGPT fallback).
- **Rich Problem Editor**: Support for CKEditor, MathJax (LaTeX), and multi-language starter code.
- **Advanced Execution Engine**: Parallelized test case evaluation with real-time progress tracking and live logs.
- **Detailed Feedback**: Grid-based test results with hidden test case protection.
