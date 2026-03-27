#!/bin/bash
set -e
MODE=${1:-prod}
if [ "$MODE" = "dev" ]; then
    echo "Starting dev-fortune in development mode..."
    docker compose -f docker-compose.dev.yml up
else
    echo "Starting dev-fortune in production mode..."
    docker compose up -d
    echo "Services running at http://localhost:8080"
fi
