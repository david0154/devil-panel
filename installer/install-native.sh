#!/bin/bash
# Devil Panel native installer (non-Docker)
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
INSTALL_DIR="/opt/devilpanel"

require_root() { [ "${EUID}" -eq 0 ] || { echo -e "${RED}Run as root.${NC}"; exit 1; }; }

install_base_packages() {
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update -y
    apt-get install -y git curl wget unzip nginx postgresql postgresql-contrib redis-server rabbitmq-server
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y git curl wget unzip nginx postgresql-server redis rabbitmq-server
  else
    echo -e "${RED}Unsupported OS package manager. Use Ubuntu/Debian/RHEL-family.${NC}"; exit 1
  fi
}

clone_repo() {
  if [ -d "$INSTALL_DIR/.git" ]; then
    git -C "$INSTALL_DIR" pull --ff-only
  else
    git clone https://github.com/david0154/devil-panel.git "$INSTALL_DIR"
  fi
}

configure_services() {
  systemctl enable --now postgresql || true
  systemctl enable --now redis-server || systemctl enable --now redis || true
  systemctl enable --now rabbitmq-server || true
  systemctl enable --now nginx || true
}

create_env() {
  cd "$INSTALL_DIR"
  if [ ! -f .env ] && [ -f .env.example ]; then
    cp .env.example .env
  fi
  cat <<EOT
${GREEN}Native base stack prepared.${NC}
Next steps:
  1) Build backend binary and frontend assets.
  2) Configure systemd services for API/WebSocket workers.
  3) Point NGINX server blocks to frontend build and API upstream.
EOT
}

main() {
  require_root
  echo -e "${BLUE}[*] Installing Devil Panel (native mode)...${NC}"
  install_base_packages
  clone_repo
  configure_services
  create_env
  echo -e "${GREEN}✓ Native installation bootstrap completed.${NC}"
}

main "$@"
