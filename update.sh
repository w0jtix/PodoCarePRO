#!/bin/bash
set -e

echo "Pulling latest code..."
git pull

echo "Building and starting containers..."
docker-compose up --build -d

echo "Pruning old images..."
docker system prune -a -f

echo "Done!"
