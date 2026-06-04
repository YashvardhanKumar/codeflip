# syntax=docker/dockerfile:1

# --- Base Stage ---
FROM python:3.13-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /home/codeflip/api

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# --- Development Stage ---
FROM base AS development
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY . .
RUN uv pip install --system -r requirements.txt

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# --- Builder Stage (for Production) ---
FROM base AS builder
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml uv.lock ./
RUN uv export --no-dev --no-emit-project --format requirements-txt > requirements.txt && \
    uv pip install --system --no-cache -r requirements.txt

# --- Production Stage ---
FROM base AS production
COPY --from=builder /usr/local/lib/python3.13/site-packages/ /usr/local/lib/python3.13/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

COPY . .
RUN chmod +x entrypoint.prod.sh

EXPOSE 8000
ENTRYPOINT ["/home/codeflip/api/entrypoint.prod.sh"]
