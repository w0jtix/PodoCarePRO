#!/bin/bash
set -e

DOMAIN="pro.podocare.com.pl"

read -p "Enter your email for Let's Encrypt notifications: " EMAIL

echo "=== Generating SSL certificate (standalone) ==="
docker run --rm -p 80:80 \
  -v letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN

echo "=== Generating dhparam (this may take a moment) ==="
if [ ! -f ./nginx/dhparam.pem ]; then
  openssl dhparam -out ./nginx/dhparam.pem 2048
fi

echo "=== Starting full stack with SSL ==="
docker compose up -d

echo "=== DONE! App available at https://$DOMAIN ==="
