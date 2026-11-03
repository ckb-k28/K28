# 🔥 K28 - Kolenkachel · Homelab Operations Hub

![Version](https://img.shields.io/badge/version-2026.11.03.4-f59e0b?style=flat-square)
![Dynacat](https://img.shields.io/badge/dynacat-v3.0.2-10b981?style=flat-square)
![Dockhand](https://img.shields.io/badge/dockhand-API%20Proxy-3b82f6?style=flat-square)
![Docker](https://img.shields.io/badge/docker-ready-0ea5e9?style=flat-square)

**K28 - Kolenkachel** is a full-stack homelab dashboard, telemetry monitor, and Docker container controller built around **Dynacat (`v3.0.2`)** and **Dockhand (`10.0.0.100:3866` / `docker.bycamiel.nl`)**.

It provides real-time server metrics, dual-mode service routing (**LAN IP `10.0.0.100`** ↔ **`*.bycamiel.nl` subdomains**), secure server-side container lifecycle management (`start` / `stop` / `restart`), and mobile push alerts via **ntfy.sh** and **PWA Web Push**.

---

## ✨ Key Features

- **Dual-Mode Homelab Directory (19 Services):** Instant 1-click toggle between local LAN URLs (`http://10.0.0.100:<port>`) and reverse-proxied SSL subdomains (`https://<service>.bycamiel.nl`).
- **Secure Dockhand API Proxy (`/api/dockhand/*`):** Server-side Express proxy that authenticates with Dockhand using `DOCKHAND_API_KEY` without ever exposing credentials to the browser.
- **Live Telemetry & Storage Health:** Real-time CPU load, core temperatures, DDR4 memory allocation, network throughput (`eth0`), and ZFS/ext4 disk pool capacity.
- **Mobile Alerts & PWA Support:** Installable on iOS and Android home screens with QR-code pairing for instant `ntfy.sh` and webhook notifications when a container stops or latency spikes.
- **Zero-Manual-Download Updates:** Designed to be added directly as a **Git Repository Stack** in Dockhand so updates deploy automatically whenever changes are pushed to GitHub.

---

## 🔌 Port Architecture

| Service | Host Port | Container Port | Description |
| :--- | :--- | :--- | :--- |
| **K28 - Kolenkachel App** | `3001` | `3001` | React UI + Node/Express Dockhand API Proxy |
| **Dynacat Engine** | `8081` | `8080` | Official `ghcr.io/panonim/dynacat:latest` (`v3.0.2`) |
| **Dockhand Manager** | `3866` | `3866` | Container management API (`10.0.0.100:3866` / `https://docker.bycamiel.nl`) |

---

## 🚀 Automatic Deployment with Dockhand (Recommended)

You do not need to download files manually after updates. Connect this GitHub repository directly to your **Dockhand** server environment:

### 1. Add Repository as a Stack in Dockhand
1. Open **Dockhand** at [`https://docker.bycamiel.nl`](https://docker.bycamiel.nl) or `http://10.0.0.100:3866`.
2. Navigate to **Stacks** → **Create Stack** → choose **Git Repository**.
3. Configure the repository settings:
   - **Stack Name:** `k28-kolenkachel`
   - **Repository URL:** `https://github.com/<your-username>/<your-repo>.git`
   - **Branch:** `main`
   - **Compose Path:** `docker-compose.yml`
4. Enable **Auto-Update (Git Polling / Webhook)** so Dockhand automatically pulls and rebuilds whenever you push a new commit.

### 2. Configure Stack Environment Variables in Dockhand
In Dockhand's **Environment Variables** section for the stack, add:

```env
PORT=3001
DOCKHAND_API_KEY=your_dockhand_api_key_here
DOCKHAND_API_URL=http://10.0.0.100:3866
DOCKHAND_REMOTE_URL=https://docker.bycamiel.nl
```

> 🔒 **Security Note:** Your `DOCKHAND_API_KEY` is never committed to GitHub. It is injected at runtime by Dockhand's stack environment.

### 3. Deploy
Click **Deploy Stack**. Once running:
- **K28 - Kolenkachel Hub:** `http://10.0.0.100:3001`
- **Dynacat Dashboard:** `http://10.0.0.100:8081`

---

## 🐳 Manual Docker Compose Deployment

If you prefer deploying via SSH on `10.0.0.100`:

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Create your local .env file (git-ignored)
cp .env.example .env
nano .env

# 3. Build and start both containers in detached mode
docker compose up -d --build
```

To update later via CLI:
```bash
git pull && docker compose up -d --build
```

---

## 🗂️ Monitored Services (`10.0.0.100` & `bycamiel.nl`)

| Category | Service | LAN Endpoint | Subdomain |
| :--- | :--- | :--- | :--- |
| **Media & Request** | Emby | `10.0.0.100:8096` | `https://emby.bycamiel.nl` |
| | Seer | `10.0.0.100:5055` | `https://seer.bycamiel.nl` |
| |Spotweb | `10.0.0.100:82` | `https://spotweb.bycamiel.nl` |
| **Arr & Usenet Stack** | Sonarr | `10.0.0.100:8989` | `https://series.bycamiel.nl` |
| | Radarr | `10.0.0.100:7878` | `https://films.bycamiel.nl` |
| | Lidarr | `10.0.0.100:8686` | `https://muziek.bycamiel.nl` |
| | Chaptarr | `10.0.0.100:8789` | `https://boeken.bycamiel.nl` |
| | Bazarr | `10.0.0.100:6767` | `https://ondertitels.bycamiel.nl` |
| | Prowlarr | `10.0.0.100:9696` | `https://index.bycamiel.nl` |
| | Sabnzbd | `10.0.0.100:8080` | `https://sabnzbd.bycamiel.nl` |
| **Smart Home & Cloud** | Home Assistant | `10.0.0.100:8123` | `https://home.bycamiel.nl` |
| | Synology NAS | `10.0.0.100:5000` | `https://nas.bycamiel.nl` |
| | Synology Photos | `10.0.0.100:5080` | `https://foto.bycamiel.nl` |
| | Synology Drive | `10.0.0.100:6690` | `https://drive.bycamiel.nl` |
| | Vaultwarden | `10.0.0.100:8545` | `https://vault.bycamiel.nl` |
| **Core Infrastructure** | Dockhand | `10.0.0.100:3866` | `https://docker.bycamiel.nl` |
| | AdGuard Home | `10.0.0.100:3000` | `https://adguard.bycamiel.nl` |
| | Unifi Network | `10.0.0.100:8443` | `https://unifi.bycamiel.nl` |
| | Sessy Thuisbatterij | `10.0.0.100:8880` | `https://sessy.bycamiel.nl` |

---

## 🏷️ Versioning Scheme (`Year.month.day.build#`)

This project uses the **`Year.month.day.build#`** release format:
- **Current Version:** `2026.11.03.4`
- **Source of Truth:** `src/version.ts` and `package.json`
- **API Endpoint:** `GET /api/version` returns JSON build metadata.
- **GitHub Actions:** `.github/workflows/docker-publish.yml` automatically tags and publishes images to GitHub Container Registry (`ghcr.io`) using the version in `package.json`.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run fullstack Express + Vite server (defaults to port 3000 in dev)
npm run dev

# Type-check TypeScript
npm run lint

# Build production client & server bundle into ./dist
npm run build

# Start production server
npm start
```
