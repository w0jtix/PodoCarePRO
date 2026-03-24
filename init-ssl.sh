#!/bin/bash
set -e

DOMAIN="pro.podocare.com.pl"

read -p "Enter your email for Let's Encrypt notifications: " EMAIL

echo "=== Starting nginx in init mode (HTTP only) ==="
docker compose stop nginx 2>/dev/null || true
docker compose run --rm -p 80:80 \
  -v $(pwd)/nginx/nginx-init.conf:/etc/nginx/nginx.conf:ro \
  --mount type=volume,source=certbot_www,target=/var/www/certbot \
  nginx nginx -g "daemon off;" &
NGINX_PID=$!

sleep 3

echo "=== Generating SSL certificate ==="
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN

echo "=== Stopping temporary nginx ==="
kill $NGINX_PID 2>/dev/null || true

echo "=== Generating dhparam (this may take a moment) ==="
if [ ! -f ./nginx/dhparam.pem ]; then
  openssl dhparam -out ./nginx/dhparam.pem 2048
fi

echo "=== Starting full stack with SSL ==="
docker compose up -d

echo "=== DONE! App available at https://$DOMAIN ==="
