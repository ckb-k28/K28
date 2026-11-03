import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Container, FileText, Layers, ExternalLink, Sparkles, Key, RefreshCw, ShieldCheck, CheckCircle2, AlertCircle, Tag, GitBranch } from 'lucide-react';
import { checkDockhandStatus, DockhandStatusResponse } from '../services/dockhandApi';
import { APP_VERSION } from '../version';

interface DockerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DOCKER_COMPOSE_SNIPPET = `services:
  # 1. K28 - Kolenkachel Web App & Dockhand Proxy (Port 3001)
  k28-kolenkachel:
    build:
      context: .
      dockerfile: Dockerfile
    image: k28-kolenkachel:${APP_VERSION}
    container_name: k28-kolenkachel
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - APP_VERSION=${APP_VERSION}
      - DOCKHAND_API_KEY=\${DOCKHAND_API_KEY}
      - DOCKHAND_API_URL=\${DOCKHAND_API_URL:-http://10.0.0.100:3866}
      - DOCKHAND_REMOTE_URL=\${DOCKHAND_REMOTE_URL:-https://docker.bycamiel.nl}

  # 2. Official Panonim/dynacat (Port 8081)
  dynacat:
    image: ghcr.io/panonim/dynacat:latest
    container_name: dynacat
    restart: unless-stopped
    ports:
      - "8081:8080"
    volumes:
      - ./config:/app/config
      - ./assets:/app/assets
      - /etc/localtime:/etc/localtime:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      - TZ=Europe/Amsterdam`;

const DOCKER_RUN_SNIPPET = `# Option A: Build image directly from Git URL (no git clone required)
docker build -t k28-kolenkachel:${APP_VERSION} -t k28-kolenkachel:latest \\
  https://github.com/<YOUR_GITHUB_USER>/<YOUR_REPO>.git#main

# Option B: Clone repository from Git & build locally
git clone https://github.com/<YOUR_GITHUB_USER>/<YOUR_REPO>.git k28-kolenkachel
cd k28-kolenkachel
docker build -t k28-kolenkachel:${APP_VERSION} -t k28-kolenkachel:latest .

# 1. Run K28 - Kolenkachel App (Port 3001)
docker run -d \\
  --name k28-kolenkachel \\
  --restart unless-stopped \\
  -p 3001:3001 \\
  -e PORT=3001 \\
  -e APP_VERSION="${APP_VERSION}" \\
  -e DOCKHAND_API_KEY="\${DOCKHAND_API_KEY}" \\
  -e DOCKHAND_API_URL="http://10.0.0.100:3866" \\
  -e DOCKHAND_REMOTE_URL="https://docker.bycamiel.nl" \\
  k28-kolenkachel:latest

# 2. Run Dynacat on Port 8081
docker run -d \\
  --name dynacat \\
  --restart unless-stopped \\
  -p 8081:8080 \\
  -v $(pwd)/config:/app/config \\
  -v $(pwd)/assets:/app/assets \\
  -v /etc/localtime:/etc/localtime:ro \\
  -v /var/run/docker.sock:/var/run/docker.sock:ro \\
  -e TZ=Europe/Amsterdam \\
  ghcr.io/panonim/dynacat:latest`;

const DYNACAT_CONFIG_YAML = `# Dynacat Configuration for K28 - Kolenkachel
# Documentation: https://dynacat.artur.zone
# Source: https://github.com/Panonim/dynacat (v3.0.2)

theme:
  background: "#0b0c0e"
  contrast-multiplier: 1.1
  primary-color: "#f59e0b"

pages:
  - name: Home
    columns:
      # Infrastructure Column
      - size: small
        widgets:
          - type: group
            title: INFRASTRUCTURE
            widgets:
              - type: service
                name: Synology NAS
                url: https://nas.bycamiel.nl
                icon: synology
              - type: service
                name: Dockhand
                url: https://docker.bycamiel.nl
                icon: docker
              - type: service
                name: Adguard
                url: https://adguard.bycamiel.nl
                icon: adguard-home

      # Apps Column
      - size: small
        widgets:
          - type: group
            title: APPS
            widgets:
              - type: service
                name: Actual Budget
                url: https://centen.bycamiel.nl
                icon: budget
              - type: service
                name: Norish
                url: https://recepten.bycamiel.nl
                icon: recipes
              - type: service
                name: Dawarich
                url: https://tijdlijn.bycamiel.nl
                icon: timeline
              - type: service
                name: Evershelf
                url: https://voorraad.bycamiel.nl
                icon: shelf

      # Media Column
      - size: small
        widgets:
          - type: group
            title: MEDIA
            widgets:
              - type: service
                name: Emby
                url: https://emby.bycamiel.nl
                icon: emby
              - type: service
                name: Seerr
                url: https://verzoekjes.bycamiel.nl
                icon: overseerr
              - type: service
                name: Synology Photos
                url: https://photos.bycamiel.nl
                icon: photos
              - type: service
                name: Bookorbit
                url: https://boeken.bycamiel.nl
                icon: book
              - type: service
                name: Deadair
                url: https://radio.bycamiel.nl
                icon: radio

      # Downloads & Automation Column
      - size: small
        widgets:
          - type: group
            title: DOWNLOADS & AUTOMATION
            widgets:
              - type: service
                name: Sabnzbd
                url: https://downloads.bycamiel.nl
                icon: sabnzbd
              - type: service
                name: Spotweb
                url: https://spotweb.bycamiel.nl
                icon: spotweb
              - type: service
                name: Prowlarr
                url: https://servers.bycamiel.nl
                icon: prowlarr
              - type: service
                name: Radarr
                url: https://films.bycamiel.nl
                icon: radarr
              - type: service
                name: Radarr4k
                url: https://films4k.bycamiel.nl
                icon: radarr-4k
              - type: service
                name: Sonarr
                url: https://series.bycamiel.nl
                icon: sonarr
              - type: service
                name: Bazarr
                url: https://ondertitels.bycamiel.nl
                icon: bazarr`;

export const DockerModal: React.FC<DockerModalProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'github' | 'dockhand' | 'compose' | 'yaml' | 'cli' | 'portainer'>('github');
  const [statusResult, setStatusResult] = useState<DockhandStatusResponse | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleTestConnection = async () => {
    setIsCheckingStatus(true);
    try {
      const res = await checkDockhandStatus();
      setStatusResult(res);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12141a] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Container className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  K28 - Kolenkachel Container Management
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full">
                  v{APP_VERSION}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                GitHub Auto-Deploy & Dockhand Integration (<code className="font-mono text-blue-500">10.0.0.100:3866</code>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 gap-2 bg-slate-50/50 dark:bg-slate-950/40 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('github')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'github'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub + Dockhand</span>
          </button>

          <button
            onClick={() => setActiveTab('dockhand')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'dockhand'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Dockhand API</span>
          </button>

          <button
            onClick={() => setActiveTab('compose')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'compose'
                ? 'border-amber-400 text-slate-900 dark:text-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>docker-compose.yml</span>
          </button>

          <button
            onClick={() => setActiveTab('yaml')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'yaml'
                ? 'border-amber-400 text-slate-900 dark:text-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>config/dynacat.yaml</span>
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'cli'
                ? 'border-amber-400 text-slate-900 dark:text-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Docker CLI</span>
          </button>

          <button
            onClick={() => setActiveTab('portainer')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'portainer'
                ? 'border-amber-400 text-slate-900 dark:text-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Container className="w-3.5 h-3.5" />
            <span>Portainer / TrueNAS</span>
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'github' && (
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Fixing: <code className="font-mono">Head &quot;https://ghcr.io/v2/ckb-k28/k28/manifests/main&quot;: unauthorized</code></span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded font-semibold">
                    Quick Fix
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  GitHub Container Registry returns <code className="font-mono text-amber-600 dark:text-amber-400">unauthorized</code> for two reasons: (1) new packages on GitHub default to <strong>Private</strong> even when the repository is public, or (2) the <code className="font-mono">:main</code> tag hasn&apos;t finished building in GitHub Actions yet.
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300 pt-1">
                  <li>
                    <strong>Push this update to GitHub</strong> and wait ~60s for the <strong>Actions</strong> tab (<code className="font-mono">Build &amp; Publish Docker Image (GHCR)</code>) to turn green (it now publishes both <code className="font-mono">:main</code> and <code className="font-mono">:latest</code>).
                  </li>
                  <li>
                    Open your package settings at{' '}
                    <a
                      href="https://github.com/users/ckb-k28/packages/container/package/k28/settings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-mono"
                    >
                      github.com/users/ckb-k28/packages/container/package/k28/settings
                    </a>
                    {' '}→ scroll down to <strong>Danger Zone</strong> → click <strong>Change visibility</strong> → set to <strong>Public</strong>.
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-mono text-[11px] flex items-center justify-center">1</span>
                      <span>Pull <code className="font-mono text-emerald-500">ghcr.io/ckb-k28/k28:main</code> in Dockhand Web UI</span>
                    </h4>
                    <button
                      onClick={() => handleCopy(`services:\n  k28-kolenkachel:\n    image: ghcr.io/ckb-k28/k28:main\n    pull_policy: always\n    container_name: k28-kolenkachel\n    restart: unless-stopped\n    ports:\n      - "3001:3001"\n    environment:\n      - NODE_ENV=production\n      - PORT=3001\n      - DOCKHAND_API_KEY=\${DOCKHAND_API_KEY}\n      - DOCKHAND_API_URL=http://10.0.0.100:3866\n      - DOCKHAND_REMOTE_URL=https://docker.bycamiel.nl`, 'ghcr-compose')}
                      className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-mono text-[11px]"
                    >
                      {copiedType === 'ghcr-compose' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'ghcr-compose' ? 'Copied!' : 'Copy GHCR Stack'}</span>
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 pl-7 leading-relaxed">
                    In Dockhand (<a href="https://docker.bycamiel.nl" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-mono">https://docker.bycamiel.nl</a>), deploy this pre-built image:
                  </p>
                  <pre className="ml-7 p-3 rounded-lg bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto border border-slate-800">
{`services:
  k28-kolenkachel:
    image: ghcr.io/ckb-k28/k28:main
    pull_policy: always
    container_name: k28-kolenkachel
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DOCKHAND_API_KEY=\${DOCKHAND_API_KEY}
      - DOCKHAND_API_URL=http://10.0.0.100:3866
      - DOCKHAND_REMOTE_URL=https://docker.bycamiel.nl`}
                  </pre>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-mono text-[11px] flex items-center justify-center">2</span>
                      <span>Set Environment Variables in Dockhand Stack UI</span>
                    </h4>
                    <button
                      onClick={() => handleCopy(`PORT=3001\nDOCKHAND_API_KEY=your_dockhand_api_key_here\nDOCKHAND_API_URL=http://10.0.0.100:3866\nDOCKHAND_REMOTE_URL=https://docker.bycamiel.nl`, 'env')}
                      className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-mono text-[11px]"
                    >
                      {copiedType === 'env' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'env' ? 'Copied!' : 'Copy Env Vars'}</span>
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 pl-7">
                    Add these in Dockhand&apos;s <strong>Environment Variables</strong> section so your API key stays safely on your home server and out of GitHub:
                  </p>
                  <pre className="ml-7 p-3 rounded-lg bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto border border-slate-800">
{`PORT=3001
DOCKHAND_API_KEY=<paste-your-dh-key-here>
DOCKHAND_API_URL=http://10.0.0.100:3866
DOCKHAND_REMOTE_URL=https://docker.bycamiel.nl`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dockhand' && (
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              {/* Security Banner */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Dockhand API Integration Active</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded font-semibold">
                    Server Proxy Secured
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Your Dockhand API key (<code className="font-mono text-blue-600 dark:text-blue-400">dh_vUZ8...2aA</code>) is stored exclusively in server environment variables (<code className="font-mono">DOCKHAND_API_KEY</code>). All container start/stop/restart commands route securely through <code className="font-mono">/api/dockhand/*</code> so your raw credentials never leak to the client browser.
                </p>
              </div>

              {/* Endpoints & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-mono">LOCAL LAN HOST</span>
                  <div className="font-mono font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                    <span>10.0.0.100:3866</span>
                    <a
                      href="http://10.0.0.100:3866"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <span className="text-[10px] text-slate-500">Direct on-premise Docker manager</span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-mono">SUBDOMAIN ENDPOINT</span>
                  <div className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                    <span>docker.bycamiel.nl</span>
                    <a
                      href="https://docker.bycamiel.nl"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <span className="text-[10px] text-slate-500">TLS/SSL secured reverse proxy</span>
                </div>
              </div>

              {/* Interactive Connection Tester */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161922] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">
                      Test Dockhand API Connection
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Query backend proxy to test authentication and reachability to Dockhand
                    </p>
                  </div>
                  <button
                    onClick={handleTestConnection}
                    disabled={isCheckingStatus}
                    className="flex items-center gap-1.5 px-3 py-1.5 font-mono font-semibold text-xs rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-colors shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                    <span>{isCheckingStatus ? 'Checking...' : 'Test Probe'}</span>
                  </button>
                </div>

                {statusResult && (
                  <div className={`p-3 rounded-lg border font-mono text-xs space-y-1.5 ${
                    statusResult.connected
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-500/30 text-amber-800 dark:text-amber-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        {statusResult.connected ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                        <span>{statusResult.connected ? 'Dockhand Live Connected' : 'LAN Proxy Ready'}</span>
                      </span>
                      <span className="text-[10px] opacity-80">
                        Key: {statusResult.keyMasked}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-90 leading-relaxed font-sans">
                      {statusResult.connected
                        ? `Connected to ${statusResult.targetUsed} using API key.`
                        : (statusResult.details || statusResult.networkNotice || 'Host is on private LAN (10.0.0.100). Safe proxy handles container lifecycle events.')}
                    </p>
                  </div>
                )}
              </div>

              {/* How Container Control Works */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-slate-100">
                  Container Management Across Your 19 Services:
                </h4>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                  Each service in K28 - Kolenkachel (Radarr, Sonarr, Sabnzbd, Emby, Synology NAS, Adguard, etc.) is mapped to its Docker container. Clicking a service opens the drawer where you can:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-1">
                  <li><strong className="text-slate-800 dark:text-slate-200">Start / Stop / Restart:</strong> Executes the command via Dockhand REST API using your credentials.</li>
                  <li><strong className="text-slate-800 dark:text-slate-200">Automatic Status Updates:</strong> Stopping a container immediately toggles its status to OFFLINE (0ms latency) and triggers a critical notification.</li>
                  <li><strong className="text-slate-800 dark:text-slate-200">Fallback Resilience:</strong> When testing outside your LAN, the proxy gracefully dispatches and records commands without crashing.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'compose' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500">docker-compose.yml</span>
                <button
                  onClick={() => handleCopy(DOCKER_COMPOSE_SNIPPET, 'compose')}
                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-mono"
                >
                  {copiedType === 'compose' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'compose' ? 'Copied!' : 'Copy YAML'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                {DOCKER_COMPOSE_SNIPPET}
              </pre>

              <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Panonim/dynacat Latest Release (v3.0.2):</span>
                </div>
                <p>
                  Create a <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">config/dynacat.yaml</code> file (from the config tab above) and start the container with <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">docker compose up -d</code>. Access Dynacat at <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">http://&lt;server-ip&gt;:8081</code> and the K28 App at <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">http://&lt;server-ip&gt;:3001</code>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'yaml' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500">config/dynacat.yaml (Pre-configured for K28 - Kolenkachel)</span>
                <button
                  onClick={() => handleCopy(DYNACAT_CONFIG_YAML, 'yaml')}
                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-mono"
                >
                  {copiedType === 'yaml' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'yaml' ? 'Copied!' : 'Copy Config'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed max-h-[300px]">
                {DYNACAT_CONFIG_YAML}
              </pre>

              <p className="text-[11px] text-slate-400">
                Dynacat features live hot-reloading: changes made to <code className="font-mono">config/dynacat.yaml</code> reflect instantly on your dashboard without needing to restart the Docker container.
              </p>
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500">Terminal Shell Commands</span>
                <button
                  onClick={() => handleCopy(DOCKER_RUN_SNIPPET, 'cli')}
                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-mono"
                >
                  {copiedType === 'cli' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'cli' ? 'Copied!' : 'Copy Commands'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                {DOCKER_RUN_SNIPPET}
              </pre>
            </div>
          )}

          {activeTab === 'portainer' && (
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">
                Deploying K28 - Kolenkachel in Portainer:
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                <li>Open your Portainer dashboard (e.g. <code className="font-mono">https://192.168.1.120:9443</code>).</li>
                <li>Navigate to <strong>Stacks</strong> → <strong>Add stack</strong>.</li>
                <li>Name the stack <code className="font-mono font-semibold">k28-kolenkachel</code>.</li>
                <li>Paste the Dynacat <code className="font-mono">docker-compose.yml</code> content into the Web Editor.</li>
                <li>Click <strong>Deploy the stack</strong>.</li>
                <li>Navigate to <code className="font-mono">http://&lt;your-server-ip&gt;:8081</code> for Dynacat or <code className="font-mono">http://&lt;your-server-ip&gt;:3001</code> for K28 App.</li>
              </ol>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Official registry: <code className="font-mono text-amber-500">ghcr.io/panonim/dynacat:latest</code></span>
                <a
                  href="https://github.com/Panonim/dynacat/releases/latest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-500 hover:underline flex items-center gap-1"
                >
                  <span>Releases</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <a
              href="http://10.0.0.100:3866"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Dockhand (10.0.0.100:3866)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-400">·</span>
            <a
              href="https://github.com/Panonim/dynacat/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <span>Dynacat v3.0.2</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
