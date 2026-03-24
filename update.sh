#!/bin/bash
set -e

if [ ! -f ./nginx/dhparam.pem ] || [ ! -d /etc/letsencrypt/live/pro.podocare.com.pl ]; then
  echo "SSL not initialized. Run ./init-ssl.sh first."
  exit 1
fi

echo "Pulling latest code..."
git pull

echo "Building and starting containers..."
docker compose up --build -d

echo "Pruning old images..."
docker system prune -a -f

echo "Done!"
