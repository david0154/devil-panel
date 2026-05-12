#!/bin/bash
# ===========================================================
# Devil Panel - One-Click Installer (NO DOCKER)
# Devil One Pvt Ltd
# Supports: Ubuntu 20.04, 22.04, 24.04 | Debian 11, 12
# ===========================================================
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'

INSTALL_DIR="/opt/devilpanel"
NODE_VERSION="20"
PG_VERSION="16"

BANNER="
${RED}
 ____  _______     _______ _       ____   _    _   _ _____ _
|  _ \| ____\ \   / /_ _| |     |  _ \ / \  | \ | | ____| |
| | | |  _|  \ \ / / | || |     | |_) / _ \ |  \| |  _| | |
| |_| | |___  \ V /  | || |___  |  __/ ___ \| |\  | |___| |___
|____/|_____|  \_/  |___|_____| |_| /_/   \_\_| \_|_____|_____|
${NC}
${CYAN}    Powering Fast, Secure & Intelligent Hosting${NC}
${YELLOW}    Devil One Pvt Ltd | v1.0.0 | NO DOCKER MODE${NC}
"
echo -e "$BANNER"

check_root() {
  [ "$EUID" -ne 0 ] && echo -e "${RED}Run as root: sudo bash install.sh${NC}" && exit 1
  echo -e "${GREEN}✓ Root access confirmed${NC}"
}

detect_os() {
  [ -f /etc/os-release ] && . /etc/os-release || (echo -e "${RED}Cannot detect OS${NC}" && exit 1)
  OS_ID=$ID; OS_VERSION=$VERSION_ID
  echo -e "${GREEN}✓ OS: $NAME $OS_VERSION${NC}"
}

check_requirements() {
  echo -e "\n${BLUE}[*] Checking requirements...${NC}"
  CPU=$(nproc); RAM=$(free -m | awk '/^Mem:/{print $2}'); DISK=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')
  [ "$RAM" -lt 1800 ] && echo -e "${RED}✗ Min 2GB RAM required (found ${RAM}MB)${NC}" && exit 1
  [ "$DISK" -lt 10 ]  && echo -e "${RED}✗ Min 10GB disk required (found ${DISK}GB)${NC}" && exit 1
  echo -e "${GREEN}✓ CPU: $CPU cores | RAM: ${RAM}MB | Disk: ${DISK}GB${NC}"
}

install_base_deps() {
  echo -e "\n${BLUE}[*] Installing base dependencies...${NC}"
  apt-get update -qq
  apt-get install -y -qq curl wget git unzip tar openssl ufw fail2ban \
    build-essential ca-certificates gnupg lsb-release net-tools htop certbot
  echo -e "${GREEN}✓ Base deps installed${NC}"
}

install_node() {
  echo -e "\n${BLUE}[*] Installing Node.js $NODE_VERSION...${NC}"
  if command -v node &>/dev/null; then
    echo -e "${YELLOW}⚡ Node.js already installed: $(node -v)${NC}"
    return
  fi
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
  echo -e "${GREEN}✓ Node.js $(node -v) | npm $(npm -v)${NC}"
}

install_postgres() {
  echo -e "\n${BLUE}[*] Installing PostgreSQL...${NC}"
  if command -v psql &>/dev/null; then
    echo -e "${YELLOW}⚡ PostgreSQL already installed${NC}"
  else
    apt-get install -y postgresql postgresql-contrib
    systemctl enable postgresql && systemctl start postgresql
  fi
  DB_PASS=$(openssl rand -hex 20)
  sudo -u postgres psql -c "CREATE USER devilpanel WITH PASSWORD '${DB_PASS}';" 2>/dev/null || true
  sudo -u postgres psql -c "CREATE DATABASE devilpanel OWNER devilpanel;" 2>/dev/null || true
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE devilpanel TO devilpanel;" 2>/dev/null || true
  sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${DB_PASS}/" "${INSTALL_DIR}/.env" 2>/dev/null || echo "DB_PASSWORD=${DB_PASS}" >> "${INSTALL_DIR}/.env"
  echo -e "${GREEN}✓ PostgreSQL ready${NC}"
}

install_redis() {
  echo -e "\n${BLUE}[*] Installing Redis...${NC}"
  if command -v redis-cli &>/dev/null; then
    echo -e "${YELLOW}⚡ Redis already installed${NC}"
  else
    apt-get install -y redis-server
    # Secure Redis
    REDIS_PASS=$(openssl rand -hex 16)
    sed -i "s/# requirepass foobared/requirepass ${REDIS_PASS}/" /etc/redis/redis.conf
    sed -i "s/bind 127.0.0.1 ::1/bind 127.0.0.1/" /etc/redis/redis.conf
    systemctl enable redis-server && systemctl restart redis-server
    sed -i "s/^REDIS_PASSWORD=.*/REDIS_PASSWORD=${REDIS_PASS}/" "${INSTALL_DIR}/.env" 2>/dev/null || echo "REDIS_PASSWORD=${REDIS_PASS}" >> "${INSTALL_DIR}/.env"
  fi
  echo -e "${GREEN}✓ Redis running (password-protected)${NC}"
}

install_nginx() {
  echo -e "\n${BLUE}[*] Installing Nginx...${NC}"
  if ! command -v nginx &>/dev/null; then
    apt-get install -y nginx
  fi
  SERVER_IP=$(curl -s https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
  cat > /etc/nginx/sites-available/devilpanel <<NGINXCONF
server {
    listen 80;
    server_name _ $SERVER_IP;
    client_max_body_size 100M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Panel frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }

    # API backend (Express)
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        # Rate limit at nginx level too
        limit_req zone=api burst=20 nodelay;
    }

    location /health {
        proxy_pass http://127.0.0.1:8080;
    }
}
NGINXCONF

  # Add rate limit zone to nginx.conf if not present
  grep -q 'limit_req_zone' /etc/nginx/nginx.conf || \
    sed -i '/http {/a\\n    limit_req_zone \$binary_remote_addr zone=api:10m rate=60r/m;' /etc/nginx/nginx.conf

  ln -sf /etc/nginx/sites-available/devilpanel /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl enable nginx && systemctl restart nginx
  echo -e "${GREEN}✓ Nginx configured with security headers${NC}"
}

install_pm2() {
  echo -e "\n${BLUE}[*] Installing PM2 process manager...${NC}"
  command -v pm2 &>/dev/null || npm install -g pm2
  echo -e "${GREEN}✓ PM2 $(pm2 --version) installed${NC}"
}

install_ollama() {
  echo -e "\n${BLUE}[*] Setting up AI (Ollama)...${NC}"
  echo -e "${CYAN}Choose AI model:${NC}"
  echo -e "  1) TinyLlama 1.1B (~600MB) — Ultra lightweight"
  echo -e "  2) Phi-3 Mini 3.8B (~2.2GB) — Recommended"
  echo -e "  3) Qwen2 0.5B (~300MB)      — Smallest"
  echo -e "  4) Skip (configure later)"
  read -rp "Enter choice [1-4]: " AI_CHOICE

  if ! command -v ollama &>/dev/null; then
    curl -fsSL https://ollama.ai/install.sh | sh
    systemctl enable ollama && systemctl start ollama
  fi

  case $AI_CHOICE in
    1) MODEL=tinyllama ;;
    2) MODEL=phi3:mini  ;;
    3) MODEL=qwen2:0.5b ;;
    4) echo -e "${YELLOW}⚡ Skipping AI model${NC}"; return ;;
    *) MODEL=tinyllama  ;;
  esac

  ollama pull $MODEL &
  sed -i "s/^OLLAMA_MODEL=.*/OLLAMA_MODEL=${MODEL}/" "${INSTALL_DIR}/.env" 2>/dev/null || echo "OLLAMA_MODEL=${MODEL}" >> "${INSTALL_DIR}/.env"
  echo -e "${GREEN}✓ Ollama installed, pulling $MODEL in background${NC}"
}

setup_panel() {
  echo -e "\n${BLUE}[*] Setting up Devil Panel...${NC}"
  mkdir -p "$INSTALL_DIR" /var/log/devilpanel /var/backups/devilpanel

  if [ -d "$INSTALL_DIR/.git" ]; then
    cd "$INSTALL_DIR" && git pull
  else
    git clone https://github.com/david0154/devil-panel.git "$INSTALL_DIR"
  fi

  cd "$INSTALL_DIR"
  [ ! -f .env ] && cp .env.example .env

  # Generate secure JWT secret
  JWT_SECRET=$(openssl rand -hex 32)
  sed -i "s/^JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env 2>/dev/null || echo "JWT_SECRET=${JWT_SECRET}" >> .env

  # Set environment
  sed -i 's/^APP_ENV=.*/APP_ENV=production/' .env
  sed -i "s/^OLLAMA_URL=.*/OLLAMA_URL=http:\/\/localhost:11434/" .env 2>/dev/null || echo 'OLLAMA_URL=http://localhost:11434' >> .env

  echo -e "${BLUE}[*] Installing API dependencies...${NC}"
  cd "$INSTALL_DIR/api" && npm install --production

  echo -e "${BLUE}[*] Running database migrations...${NC}"
  cd "$INSTALL_DIR/api" && node db/migrate.js || true

  echo -e "${BLUE}[*] Building frontend...${NC}"
  cd "$INSTALL_DIR" && npm install && npm run build

  echo -e "${GREEN}✓ Panel setup complete${NC}"
}

configure_firewall() {
  echo -e "\n${BLUE}[*] Configuring UFW firewall...${NC}"
  ufw --force reset
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow ssh
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw allow 53/tcp
  ufw allow 53/udp
  ufw allow 25/tcp
  ufw allow 465/tcp
  ufw allow 587/tcp
  ufw allow 993/tcp
  ufw allow 995/tcp
  ufw --force enable
  echo -e "${GREEN}✓ Firewall configured${NC}"
}

configure_fail2ban() {
  echo -e "\n${BLUE}[*] Configuring Fail2Ban...${NC}"
  cat > /etc/fail2ban/jail.local <<'F2B'
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5
destemail = root@localhost

[sshd]
enabled = true

[nginx-http-auth]
enabled  = true

[nginx-limit-req]
enabled  = true
filter   = nginx-limit-req
logpath  = /var/log/nginx/error.log
maxretry = 10

[devilpanel-auth]
enabled  = true
filter   = devilpanel-auth
logpath  = /var/log/devilpanel/*.log
maxretry = 5
bantime  = 7200
F2B
  systemctl enable fail2ban && systemctl restart fail2ban
  echo -e "${GREEN}✓ Fail2Ban configured${NC}"
}

start_services() {
  echo -e "\n${BLUE}[*] Starting services with PM2...${NC}"
  cd "$INSTALL_DIR"

  pm2 delete devil-api   2>/dev/null || true
  pm2 delete devil-panel 2>/dev/null || true

  # Start API
  pm2 start api/server.js \
    --name devil-api \
    --env production \
    --max-memory-restart 512M \
    --log /var/log/devilpanel/api.log \
    --error /var/log/devilpanel/api-error.log

  # Start Next.js frontend
  pm2 start npm \
    --name devil-panel \
    -- start \
    --log /var/log/devilpanel/panel.log

  pm2 save
  pm2 startup | grep 'sudo' | bash || true

  echo -e "${GREEN}✓ All services started via PM2${NC}"
}

post_install() {
  SERVER_IP=$(curl -s https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
  echo -e "\n${GREEN}╔══════════════════════════════════════════════════════╗"
  echo -e "║       😈 DEVIL PANEL INSTALLED SUCCESSFULLY!         ║"
  echo -e "╚══════════════════════════════════════════════════════╝${NC}"
  echo -e ""
  echo -e "${CYAN}📌 Access URLs:${NC}"
  echo -e "   Panel:  ${GREEN}http://$SERVER_IP${NC}"
  echo -e "   API:    ${GREEN}http://$SERVER_IP/api/v1/health${NC}"
  echo -e ""
  echo -e "${CYAN}🔑 Default Login:${NC}"
  echo -e "   Username: admin"
  echo -e "   Password: Devil@Admin123"
  echo -e "   ${RED}⚠  CHANGE THIS IMMEDIATELY!${NC}"
  echo -e ""
  echo -e "${CYAN}📁 Install Dir:  /opt/devilpanel${NC}"
  echo -e "${CYAN}📄 Config:       /opt/devilpanel/.env${NC}"
  echo -e "${CYAN}📊 PM2 Status:   pm2 status${NC}"
  echo -e "${CYAN}📜 API Logs:     pm2 logs devil-api${NC}"
  echo -e "${CYAN}📜 Panel Logs:   pm2 logs devil-panel${NC}"
  echo -e ""
  echo -e "${CYAN}🔧 Useful Commands:${NC}"
  echo -e "   pm2 restart devil-api     # Restart API"
  echo -e "   pm2 restart devil-panel   # Restart Panel"
  echo -e "   pm2 logs                  # View all logs"
  echo -e "   cd /opt/devilpanel && git pull  # Update panel"
  echo -e ""
  echo -e "${RED}😈 Fast. Secure. Lightweight. No Docker Needed.${NC}"
}

main() {
  check_root
  detect_os
  check_requirements
  install_base_deps
  install_node
  install_postgres
  install_redis
  install_nginx
  install_pm2
  install_ollama
  setup_panel
  configure_firewall
  configure_fail2ban
  start_services
  post_install
}

main "$@"
