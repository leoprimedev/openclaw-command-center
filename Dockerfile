# ── Stage 1: Build React frontend ──────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder

WORKDIR /build

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --prefer-offline

COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python runtime ────────────────────────────────────────────────────
FROM python:3.12-slim

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY pyproject.toml ./
RUN pip install --no-cache-dir .

# Copy server code
COPY server/ ./server/

# Copy built frontend
COPY --from=frontend-builder /dist ./static

# Runtime dirs
RUN mkdir -p /app/data

EXPOSE 3200

ENV PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=3200

CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "3200", "--no-access-log"]
