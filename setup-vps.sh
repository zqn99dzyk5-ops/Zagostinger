#!/bin/bash

# Continental Academy - VPS Setup Script
# Pokreni kao root: sudo bash setup-vps.sh

set -e

echo "=========================================="
echo "Continental Academy VPS Setup"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Molimo pokrenite kao root (sudo bash setup-vps.sh)${NC}"
  exit 1
fi

echo -e "${YELLOW}[1/7] Ažuriranje sistema...${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}[2/7] Instalacija Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

echo -e "${YELLOW}[3/7] Instalacija Yarn i PM2...${NC}"
npm install -g yarn pm2

echo -e "${YELLOW}[4/7] Instalacija Nginx...${NC}"
apt install -y nginx

echo -e "${YELLOW}[5/7] Instalacija Git...${NC}"
apt install -y git

echo -e "${YELLOW}[6/7] Instalacija Certbot (SSL)...${NC}"
apt install -y certbot python3-certbot-nginx

echo -e "${YELLOW}[7/7] Kreiranje direktorija...${NC}"
mkdir -p /var/www
mkdir -p /var/log/pm2

echo ""
echo -e "${GREEN}=========================================="
echo "Setup Završen!"
echo "==========================================${NC}"
echo ""
echo "Sljedeći koraci:"
echo "1. Klonirajte repo: cd /var/www && git clone VASA_REPO continental-academy"
echo "2. Konfigurišite backend/.env"
echo "3. Konfigurišite frontend/.env"
echo "4. Pokrenite: cd backend && yarn install && pm2 start server.js --name continental-backend"
echo "5. Buildajte frontend: cd frontend && yarn install && yarn build"
echo "6. Konfigurišite Nginx (vidi HOSTINGER_VPS_DEPLOYMENT.md)"
echo ""
echo "Verzije:"
node -v
npm -v
yarn -v
pm2 -v
nginx -v
