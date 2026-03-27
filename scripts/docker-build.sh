#!/bin/bash
set -e
echo "Building dev-fortune Docker images..."
docker compose build --no-cache
echo "Build complete!"
docker images | grep dev-fortune
