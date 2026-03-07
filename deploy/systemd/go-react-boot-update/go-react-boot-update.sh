#!/usr/bin/env bash
set -euo pipefail

export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
APP_DIR=/opt/apps/go-react
COMPOSE_FILE="$APP_DIR/docker-compose.prod.yml"
HEALTH_URL="http://127.0.0.1:8080/api/health"

cd "$APP_DIR"

git config --global --add safe.directory "$APP_DIR" >/dev/null 2>&1 || true

echo "[go-react-deploy] $(date -Is) starting deploy in $APP_DIR"
echo "[go-react-deploy] current commit: $(git rev-parse --short HEAD)"
echo "[go-react-deploy] git status before pull:"
git status --short || true

git fetch origin main
git pull --ff-only origin main

echo "[go-react-deploy] updated commit: $(git rev-parse --short HEAD)"

docker compose -f "$COMPOSE_FILE" up -d --build backend

for attempt in $(seq 1 30); do
  if curl -fsS "$HEALTH_URL" >/dev/null; then
    echo "[go-react-deploy] health check passed on attempt $attempt"
    exit 0
  fi
  echo "[go-react-deploy] waiting for health endpoint ($attempt/30)"
  sleep 2
done

echo "[go-react-deploy] health check failed after 30 attempts"
exit 1
