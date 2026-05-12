#!/bin/bash
# ===========================================================
# Devil Panel - One-Click Installer
# Devil One Pvt Ltd
# Supports: Ubuntu 20.04, 22.04, 24.04 | Debian 11, 12
#           AlmaLinux 8/9 | Rocky Linux 8/9 | CentOS Stream
# ===========================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

BANNER="
${RED}
 ____  _______     _______ _       ____   _    _   _ _____ _     
|  _ \| ____\ \   / /_ _| |     |  _ \ / \  | \ | | ____| |    
| | | |  _|  \ \ / / | || |     | |_) / _ \ |  \| |  _| | |    
| |_| | |___  \ V /  | || |___  |  __/ ___ \| |\  | |___| |___  
|____/|_____|  \_/  |___|_____| |_| /_/   \_\_| \_|_____|_____| 
${NC}
${CYAN}    Powering Fast, Secure & Intelligent Hosting${NC}
${YELLOW}    Devil One Pvt Ltd | v1.0.0${NC}
"

echo -e "$BANNER"

# ===========================================================
# DETECT OS
# ===========================================================
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        OS_VERSION=$VERSION_ID
        OS_ID=$ID
    else
        echo -e "${RED}Cannot detect OS. Exiting.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Detected OS: $OS $OS_VERSION${NC}"
}

# ===========================================================
# CHECK ROOT
# ===========================================================
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}✗ Please run as root: sudo bash install.sh${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Root access confirmed${NC}"
}

# ===========================================================
# CHECK SYSTEM REQUIREMENTS
# ===========================================================
check_requirements() {
    echo -e "\n${BLUE}[*] Checking system requirements...${NC}"

    CPU_CORES=$(nproc)
    RAM_MB=$(free -m | awk '/^Mem:/{print $2}')
    DISK_GB=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')

    if [ "$CPU_CORES" -lt 1 ]; then
        echo -e "${RED}✗ Minimum 2 CPU cores required. Found: $CPU_CORES${NC}"
        exit 1
    fi

    if [ "$RAM_MB" -lt 1800 ]; then
        echo -e "${RED}✗ Minimum 2GB RAM required. Found: ${RAM_MB}MB${NC}"
        exit 1
    fi

    if [ "$DISK_GB" -lt 15 ]; then
        echo -e "${RED}✗ Minimum 20GB disk space required. Found: ${DISK_GB}GB${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ CPU: $CPU_CORES cores | RAM: ${RAM_MB}MB | Disk: ${DISK_GB}GB free${NC}"
}

# ===========================================================
# INSTALL DEPENDENCIES (UBUNTU/DEBIAN)
# ===========================================================
install_deps_debian() {
    echo -e "\n${BLUE}[*] Updating system packages...${NC}"
    apt-get update -qq
    apt-get upgrade -y -qq

    echo -e "${BLUE}[*] Installing dependencies...${NC}"
    apt-get install -y -qq \
        curl wget git unzip tar \
        ca-certificates gnupg lsb-release \
        software-properties-common apt-transport-https \
        openssl ufw fail2ban \
        net-tools htop iotop \
        build-essential

    echo -e "${GREEN}✓ Dependencies installed${NC}"
}

# ===========================================================
# INSTALL DEPENDENCIES (RHEL/CENTOS/ALMA/ROCKY)
# ===========================================================
install_deps_rhel() {
    echo -e "\n${BLUE}[*] Updating system packages...${NC}"
    if command -v dnf &>/dev/null; then
        dnf update -y -q
        dnf install -y -q curl wget git unzip tar openssl firewalld fail2ban net-tools htop
    else
        yum update -y -q
        yum install -y -q curl wget git unzip tar openssl firewalld fail2ban net-tools htop
    fi
    echo -e "${GREEN}✓ Dependencies installed${NC}"
}

# ===========================================================
# INSTALL DOCKER
# ===========================================================
install_docker() {
    echo -e "\n${BLUE}[*] Installing Docker...${NC}"

    if command -v docker &>/dev/null; then
        echo -e "${YELLOW}⚡ Docker already installed: $(docker --version)${NC}"
        return
    fi

    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker

    # Install Docker Compose
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d '"' -f 4)
    curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

    echo -e "${GREEN}✓ Docker installed: $(docker --version)${NC}"
    echo -e "${GREEN}✓ Docker Compose: $(docker-compose --version)${NC}"
}

# ===========================================================
# CONFIGURE FIREWALL
# ===========================================================
configure_firewall() {
    echo -e "\n${BLUE}[*] Configuring firewall...${NC}"

    if [ "$OS_ID" = "ubuntu" ] || [ "$OS_ID" = "debian" ]; then
        ufw --force reset
        ufw default deny incoming
        ufw default allow outgoing
        ufw allow ssh
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 8443/tcp   # Panel port
        ufw allow 8080/tcp   # API port
        ufw allow 53/tcp
        ufw allow 53/udp
        ufw allow 25/tcp     # SMTP
        ufw allow 465/tcp    # SMTPS
        ufw allow 587/tcp    # Submission
        ufw allow 993/tcp    # IMAPS
        ufw allow 995/tcp    # POP3S
        ufw --force enable
        echo -e "${GREEN}✓ UFW firewall configured${NC}"
    fi
}

# ===========================================================
# DOWNLOAD AND INSTALL DEVIL PANEL
# ===========================================================
install_devilpanel() {
    echo -e "\n${BLUE}[*] Downloading Devil Panel...${NC}"

    INSTALL_DIR="/opt/devilpanel"
    mkdir -p "$INSTALL_DIR"

    if [ -d "$INSTALL_DIR/.git" ]; then
        echo -e "${YELLOW}⚡ Devil Panel already cloned. Pulling latest...${NC}"
        cd "$INSTALL_DIR" && git pull
    else
        git clone https://github.com/david0154/devil-panel.git "$INSTALL_DIR"
    fi

    cd "$INSTALL_DIR"

    # Setup environment
    if [ ! -f .env ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚡ .env file created. Please edit /opt/devilpanel/.env before continuing.${NC}"
        echo -e "${CYAN}   nano /opt/devilpanel/.env${NC}"
    fi

    # Create AI models directory
    mkdir -p ai/models
    mkdir -p logs

    echo -e "${GREEN}✓ Devil Panel downloaded to $INSTALL_DIR${NC}"
}

# ===========================================================
# DOWNLOAD AI MODEL
# ===========================================================
setup_ai_model() {
    echo -e "\n${BLUE}[*] Setting up AI model...${NC}"
    echo -e "${CYAN}Choose AI model (lightweight options):${NC}"
    echo -e "  1) TinyLlama 1.1B (~600MB) - Ultra lightweight"
    echo -e "  2) Phi-3 Mini 3.8B (~2.2GB) - Recommended"
    echo -e "  3) Qwen2 0.5B (~300MB) - Smallest"
    echo -e "  4) Skip (configure later)"
    echo -n "Enter choice [1-4]: "
    read -r AI_CHOICE

    case $AI_CHOICE in
        1)
            echo -e "${BLUE}[*] Will pull TinyLlama via Ollama on first start...${NC}"
            echo "OLLAMA_MODEL=tinyllama" >> /opt/devilpanel/.env
            ;;
        2)
            echo -e "${BLUE}[*] Will pull Phi-3 Mini via Ollama on first start...${NC}"
            echo "OLLAMA_MODEL=phi3:mini" >> /opt/devilpanel/.env
            ;;
        3)
            echo -e "${BLUE}[*] Will pull Qwen2 0.5B via Ollama on first start...${NC}"
            echo "OLLAMA_MODEL=qwen2:0.5b" >> /opt/devilpanel/.env
            ;;
        4)
            echo -e "${YELLOW}⚡ Skipping AI model setup${NC}"
            ;;
        *)
            echo -e "${YELLOW}⚡ Invalid choice, defaulting to TinyLlama${NC}"
            echo "OLLAMA_MODEL=tinyllama" >> /opt/devilpanel/.env
            ;;
    esac
}

# ===========================================================
# START SERVICES
# ===========================================================
start_services() {
    echo -e "\n${BLUE}[*] Starting Devil Panel services...${NC}"
    cd /opt/devilpanel
    docker-compose pull
    docker-compose up -d
    echo -e "${GREEN}✓ All services started${NC}"
}

# ===========================================================
# POST INSTALL INFO
# ===========================================================
post_install() {
    SERVER_IP=$(curl -s https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')

    echo -e "\n${GREEN}╔══════════════════════════════════════════════════════╗"
    echo -e "║          DEVIL PANEL INSTALLED SUCCESSFULLY!         ║"
    echo -e "╚══════════════════════════════════════════════════════╝${NC}"
    echo -e ""
    echo -e "${CYAN}📌 Access URLs:${NC}"
    echo -e "   Panel:       ${GREEN}https://$SERVER_IP:8443${NC}"
    echo -e "   API:         ${GREEN}http://$SERVER_IP:8080${NC}"
    echo -e "   Monitoring:  ${GREEN}http://$SERVER_IP:3001${NC} (Grafana)"
    echo -e "   MinIO:       ${GREEN}http://$SERVER_IP:9001${NC}"
    echo -e ""
    echo -e "${CYAN}🔑 Default Credentials:${NC}"
    echo -e "   Username: admin"
    echo -e "   Password: (set in /opt/devilpanel/.env)"
    echo -e ""
    echo -e "${CYAN}📁 Installation Directory: /opt/devilpanel${NC}"
    echo -e "${CYAN}📄 Config: /opt/devilpanel/.env${NC}"
    echo -e ""
    echo -e "${YELLOW}⚠  Please edit /opt/devilpanel/.env with your domain and credentials!${NC}"
    echo -e ""
    echo -e "${RED}😈 Fast. Secure. Lightweight. — Hosting Reimagined${NC}"
}

# ===========================================================
# MAIN
# ===========================================================
main() {
    check_root
    detect_os
    check_requirements

    case "$OS_ID" in
        ubuntu|debian|linuxmint|pop)
            install_deps_debian
            ;;
        almalinux|rocky|centos|rhel|fedora)
            install_deps_rhel
            ;;
        *)
            echo -e "${YELLOW}⚠ Unknown OS, attempting Debian-style install${NC}"
            install_deps_debian
            ;;
    esac

    install_docker
    configure_firewall
    install_devilpanel
    setup_ai_model
    start_services
    post_install
}

main "$@"
