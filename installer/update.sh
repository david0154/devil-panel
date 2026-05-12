#!/bin/bash
# Devil Panel Updater

set -e
GREEN='\033[0;32m' BLUE='\033[0;34m' NC='\033[0m'

echo -e "${BLUE}[*] Updating Devil Panel...${NC}"
cd /opt/devilpanel

git pull origin main
docker-compose pull
docker-compose up -d --force-recreate

echo -e "${GREEN}✓ Devil Panel updated successfully!${NC}"
