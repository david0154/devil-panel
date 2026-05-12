# 😈 Devil Panel

> **Powering Fast, Secure & Intelligent Hosting**

![Devil Panel](https://img.shields.io/badge/Devil%20Panel-v1.0.0-red?style=for-the-badge&logo=linux)
![Go](https://img.shields.io/badge/Go-1.22-blue?style=for-the-badge&logo=go)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🚀 What is Devil Panel?

Devil Panel is a **next-generation, lightweight, AI-powered hosting control panel** built by **Devil One Pvt Ltd**. It combines:

- ⚡ **Lightweight** like CyberPanel
- 🧩 **Modular** like Plesk  
- 💪 **Powerful** like cPanel
- ☁️ **Cloud-ready** like AWS Lightsail
- 🤖 **AI-assisted** like modern SaaS platforms
- 🇮🇳 **Optimized for India** & low-resource servers
- 🌐 **Fully multilingual** for Indian users

---

## 🎯 Target Markets

| Hosting Type | Supported |
|---|---|
| VPS Hosting | ✅ |
| Shared Hosting | ✅ |
| Dedicated Servers | ✅ |
| Cloud Hosting | ✅ |
| WordPress Hosting | ✅ |
| Reseller Hosting | ✅ |
| Developer Hosting | ✅ |
| AI Hosting Infrastructure | ✅ |

---

## 🏗️ Architecture

```
Backend:      Golang (main) + Rust (services)
API:          FastAPI (Python)
Frontend:     React + Next.js (3D dark UI)
Database:     PostgreSQL
Cache:        Redis
Queue:        RabbitMQ
Web Server:   NGINX + OpenLiteSpeed
DNS:          PowerDNS
Mail:         Postfix + Dovecot
Firewall:     CSF + nftables
Monitoring:   Prometheus + Grafana
Storage:      MinIO
SSL:          Let's Encrypt
Auth:         JWT + OAuth2
AI:           Local Tiny LLM (Phi-3 Mini / TinyLlama)
Containers:   Docker + Kubernetes (future)
```

---

## 📦 Quick Install (Ubuntu 22.04 / 24.04)

```bash
curl -fsSL https://raw.githubusercontent.com/david0154/devil-panel/main/installer/install.sh | bash
```

### Or manual clone:

```bash
git clone https://github.com/david0154/devil-panel.git
cd devil-panel
chmod +x installer/install.sh
sudo bash installer/install.sh
```

---

## 🐳 Docker Installation

```bash
git clone https://github.com/david0154/devil-panel.git
cd devil-panel
cp .env.example .env
# Edit .env with your settings
docker compose up -d
```

Access panel at: `https://your-server-ip:8443`

---


## 🧱 Part-by-Part Development Plan (GitHub)

To build safely in milestones, push in this order:

1. **foundation/phase-1-core**: auth, users, domains, SSL, file manager skeleton.
2. **foundation/phase-2-vps**: VPS lifecycle, Docker orchestration, snapshots.
3. **foundation/phase-3-cloud-ai**: clustering primitives, AI assistant service integration.
4. **foundation/phase-4-enterprise**: multi-region DNS, CDN hooks, Kubernetes adapters.

Recommended workflow:

```bash
git checkout -b foundation/phase-1-core
git add .
git commit -m "feat: scaffold phase 1 core panel"
git push -u origin foundation/phase-1-core
```

---

## 🤖 Lightweight Open-Source AI Models (Download URLs)

- TinyLlama 1.1B (GGUF/HF): https://huggingface.co/TinyLlama
- Phi-3 Mini: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Qwen2 0.5B: https://huggingface.co/Qwen/Qwen2-0.5B-Instruct
- Ollama model library (easy pull): https://ollama.com/library

Example:

```bash
ollama pull tinyllama
ollama pull phi3:mini
ollama pull qwen2:0.5b
```

---

## 🧰 Installation Modes

### 1) Docker (recommended for fastest setup)
Use `installer/install.sh`.

### 2) Native install without Docker (CyberPanel-like host install)
Use:

```bash
sudo bash installer/install-native.sh
```

This bootstrap installs host-level dependencies (NGINX, PostgreSQL, Redis, RabbitMQ) and prepares `/opt/devilpanel` for direct service deployment.

---
## 🖥️ System Requirements

### Minimum
| Resource | Requirement |
|---|---|
| CPU | 2 Cores |
| RAM | 2 GB |
| Storage | 20 GB SSD |
| OS | Ubuntu 20.04+ / Debian 11+ / AlmaLinux 8+ |

### Recommended
| Resource | Requirement |
|---|---|
| CPU | 4 Cores |
| RAM | 8 GB |
| Storage | 100 GB NVMe |

---

## ✨ Features

### 🌐 Hosting Management
- Shared, VPS, Dedicated, Cloud hosting
- One-click WordPress install + manager
- PHP version selector
- Node.js / Python / Ruby apps

### 🔒 SSL & Security
- Free Let's Encrypt SSL (wildcard)
- WAF, DDoS protection, Fail2Ban, CrowdSec
- Malware scanner (ClamAV + ImunifyAV-style)
- ModSecurity rules

### 📧 Email Hosting
- Postfix + Dovecot + Roundcube
- DKIM/SPF/DMARC
- Rspamd anti-spam

### 🔧 Developer Tools
- Git deploy + GitHub/GitLab webhooks
- Docker container management
- Full REST API + WebSocket API
- MySQL / MariaDB / PostgreSQL / Redis / MongoDB

### 🤖 AI Assistant (Devil AI)
- Server issue detection
- Auto optimization suggestions
- Security threat detection
- AI chat support (Local LLM, no cloud dependency)

### 📊 Monitoring
- Grafana + Prometheus dashboards
- CPU/RAM/Disk/Network real-time metrics
- MySQL usage + website analytics

### 🌍 Multilingual Support
English, हिन्दी, বাংলা, தமிழ், తెలుగు, ગુજરાતી, ಕನ್ನಡ, മലയാളം, ਪੰਜਾਬੀ, অসমীয়া, मराठी

### 💰 Billing System
- Stripe, Razorpay, PayPal, UPI, Crypto
- WHMCS / Blesta integration
- Auto suspend, renew, invoice

### 📱 Mobile App
- Flutter (Android + iOS)
- Reboot VPS, monitor servers, billing, AI assistant

---

## 📁 Project Structure

```
/devil-panel
├── api/              # Golang main backend
├── frontend/         # Next.js 14 frontend
├── dns/              # PowerDNS integration
├── mail/             # Postfix + Dovecot config
├── ai/               # Local LLM AI assistant
├── monitoring/       # Prometheus + Grafana
├── backup/           # Restic backup system
├── installer/        # One-click install scripts
├── docker/           # Docker configs
├── logs/             # System logs
├── websocket/        # WebSocket server
├── billing/          # Billing integrations
└── modules/          # Plugin modules
```

---

## 🗺️ Development Roadmap

| Phase | Features | Status |
|---|---|---|
| Phase 1 | Core Panel (Login, Hosting, DNS, SSL, File Manager) | 🔄 In Progress |
| Phase 2 | VPS, Docker, Monitoring, Backups | 📅 Planned |
| Phase 3 | Cloud, AI System, Auto Scaling | 📅 Planned |
| Phase 4 | Kubernetes, CDN, Global DNS | 📅 Planned |

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License — © 2025 Devil One Pvt Ltd

---

<p align="center">
  <strong>Fast. Secure. Lightweight.</strong><br/>
  <em>Hosting Reimagined 😈</em>
</p>
