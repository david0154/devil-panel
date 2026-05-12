#!/bin/bash
# Devil Panel Uninstaller

set -e
RED='\033[0;31m' GREEN='\033[0;32m' YELLOW='\033[1;33m' NC='\033[0m'

echo -e "${RED}WARNING: This will remove Devil Panel and all data!${NC}"
read -rp "Type 'CONFIRM' to proceed: " CONFIRM
if [ "$CONFIRM" != "CONFIRM" ]; then
    echo -e "${YELLOW}Uninstall cancelled.${NC}"
    exit 0
fi

echo -e "${YELLOW}Stopping and removing Docker containers...${NC}"
cd /opt/devilpanel && docker-compose down -v 2>/dev/null || true

echo -e "${YELLOW}Removing installation directory...${NC}"
rm -rf /opt/devilpanel

echo -e "${GREEN}Devil Panel has been removed.${NC}"
