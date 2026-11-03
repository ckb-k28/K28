import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wifi,
  HardDrive,
  Cpu,
  Activity,
  Layers,
  Smartphone,
  Plus,
  Download,
  Share,
  X,
  Play,
  RotateCw,
  Square,
  ShieldCheck,
  Tv,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { ServerService, ServerMetrics, QuickLink } from '../types/server';
import { getServiceBrandIcon } from './ServiceIcons';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DynacatDashboardProps {
  services: ServerService[];
  metrics: ServerMetrics;
  quickLinks: QuickLink[];
  onSelectService: (service: ServerService) => void;
  onAddService: () => void;
  onOpenMobileModal: () => void;
  linkMode: 'lan' | 'subdomain';
  onToggleLinkMode: () => void;
}

export const DynacatDashboard: React.FC<DynacatDashboardProps> = ({
  services,
  metrics,
  quickLinks,
  onSelectService,
  onAddService,
  onOpenMobileModal,
  linkMode,
  onToggleLinkMode,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissInstallBanner, setDismissInstallBanner] = useState(false);

  // Categorized service columns
  const infrastructureServices = services.filter(
    (s) => s.category === 'Infrastructure' || s.category === 'Network & DNS' || s.category === 'Security'
  );
  const appsServices = services.filter(
    (s) => s.category === 'Apps' || s.category === 'Smart Home'
  );
  const mediaServices = services.filter((s) => s.category === 'Media');
  const downloadsServices = services.filter(
    (s) => s.category === 'Downloads & Automation' || s.category === 'Development'
  );

  // Health calculations
  const memUsedGib = (metrics.memory.usedBytes / (1024 * 1024 * 1024)).toFixed(1);
  const memTotalGib = (metrics.memory.totalBytes / (1024 * 1024 * 1024)).toFixed(1);
  const memPct = Math.round((metrics.memory.usedBytes / metrics.memory.totalBytes) * 100);

  const sysDisk = metrics.disks.find((d) => d.id === 'disk-system') || metrics.disks[0];
  const vmDisk = metrics.disks.find((d) => d.id === 'disk-vm-storage') || metrics.disks[1] || sysDisk;

  const sysDiskPct = Math.round((sysDisk.usedBytes / sysDisk.totalBytes) * 100);
  const sysDiskAvailGib = ((sysDisk.totalBytes - sysDisk.usedBytes) / (1024 * 1024 * 1024)).toFixed(1);

  const vmDiskPct = Math.round((vmDisk.usedBytes / vmDisk.totalBytes) * 100);
  const vmDiskAvailGib = ((vmDisk.totalBytes - vmDisk.usedBytes) / (1024 * 1024 * 1024)).toFixed(1);

  const getServiceTargetUrl = (service: ServerService) => {
    if (linkMode === 'lan') {
      return `http://${service.internalIp || '10.0.0.100'}:${service.port}`;
    }
    return service.dashboardUrl;
  };

  const renderServiceColumn = (title: string, list: ServerService[]) => (
    <div className="space-y-3">
      <h3 className="text-[11px] font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">
        {title}
      </h3>
      <div className="space-y-2">
        {list.map((service) => {
          const isUp = service.status === 'up';
          const isWarning = service.status === 'warning';
          const targetUrl = getServiceTargetUrl(service);

          return (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className="group relative flex items-center justify-between p-3 rounded-lg border border-slate-200/60 dark:border-[#1e222d] bg-white dark:bg-[#13151b] hover:bg-slate-50 dark:hover:bg-[#181b23] hover:border-slate-300 dark:hover:border-[#282d3c] transition-all cursor-pointer shadow-xs min-h-[48px]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0">{getServiceBrandIcon(service.name, service.category)}</div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                      {service.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                      :{service.port}
                    </span>
                  </div>
                  {service.dockerContainer && (
                    <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
                      {service.dockerContainer}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Indicator & External Open Link */}
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title={`Open ${service.name} (${targetUrl}) ↗`}
                  className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Status Dot / Checkmark Badge */}
                {isUp ? (
                  <div
                    title="Operational (Running)"
                    className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                ) : isWarning ? (
                  <div
                    title="Degraded Performance"
                    className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0"
                  >
                    <span className="text-[10px] font-bold">!</span>
                  </div>
                ) : (
                  <div
                    title="Container Stopped (Offline)"
                    className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0"
                  >
                    <span className="text-[10px] font-bold">×</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 md:pb-12">
      {/* Mobile PWA Install Prompt Banner */}
      {!isInstalled && !dismissInstallBanner && (isInstallable || isIOS) && (
        <div className="sm:hidden flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100">
                Install Dynacat on Phone
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Standalone fullscreen monitor on your home screen
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isInstallable ? (
              <button
                onClick={install}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-amber-400 text-slate-950 rounded-md"
              >
                Install
              </button>
            ) : isIOS ? (
              <button
                onClick={() => setShowIOSPrompt(true)}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-amber-400 text-slate-950 rounded-md"
              >
                Add to Home
              </button>
            ) : null}

            <button
              onClick={() => setDismissInstallBanner(true)}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#15171e] border border-slate-800 p-5 text-xs text-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white">Add Dynacat to iPhone</h4>
              <button onClick={() => setShowIOSPrompt(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
              <li>Tap the <strong className="text-amber-400">Share</strong> button in Safari's toolbar.</li>
              <li>Scroll down and select <strong className="text-amber-400">Add to Home Screen</strong>.</li>
              <li>Tap <strong className="text-amber-400">Add</strong> in the top-right corner.</li>
            </ol>
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg mt-2"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Dynacat Dynamic Homelab Live Widgets Strip (Real-time telemetry signature of Dynacat) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Widget 1: Live AdGuard DNS Sinkhole */}
        <div className="p-3.5 rounded-xl border border-slate-200/60 dark:border-[#1e222d] bg-white dark:bg-[#13151b] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                AdGuard DNS
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                34.2% Blocked
              </div>
            </div>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <div>84.1k reqs</div>
            <span className="text-emerald-500 font-semibold">2ms avg</span>
          </div>
        </div>

        {/* Widget 2: Download Automation Speed */}
        <div className="p-3.5 rounded-xl border border-slate-200/60 dark:border-[#1e222d] bg-white dark:bg-[#13151b] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-xs">
              <ArrowDown className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                Downloads Active
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                14.2 MB/s
              </div>
            </div>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <div>Ubuntu 24.04</div>
            <span className="text-amber-500 font-semibold">ETA 12m</span>
          </div>
        </div>

        {/* Widget 3: Emby Media Transcoding */}
        <div className="p-3.5 rounded-xl border border-slate-200/60 dark:border-[#1e222d] bg-white dark:bg-[#13151b] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <Tv className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                Emby Media
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                2 Active Streams
              </div>
            </div>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <div>Living Room 4K</div>
            <span className="text-emerald-400 font-semibold">Direct Play</span>
          </div>
        </div>
      </div>

      {/* 4 Categorized Columns: Infrastructure, Apps, Media, Downloads & Automation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {renderServiceColumn('INFRASTRUCTURE', infrastructureServices)}
        {renderServiceColumn('APPS', appsServices)}
        {renderServiceColumn('MEDIA', mediaServices)}
        {renderServiceColumn('DOWNLOADS & AUTOMATION', downloadsServices)}
      </div>

      {/* K28 - KOLENKACHEL HOST HEALTH SECTION */}
      <div className="space-y-3 pt-2">
        <h3 className="text-[11px] font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">
          K28 - KOLENKACHEL HOST HEALTH
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200/60 dark:border-[#1e222d] bg-white dark:bg-[#13151b] shadow-xs">
          {/* CPU Metric */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 dark:text-slate-500 font-semibold">CPU</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {metrics.cpu.usagePct.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-400 dark:bg-slate-300 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(2, metrics.cpu.usagePct)}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {metrics.cpu.cores.length} logical cores
            </div>
          </div>

          {/* RAM Metric */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 dark:text-slate-500 font-semibold">RAM</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {memPct}%
              </span>
            </div>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-400 dark:bg-slate-300 transition-all duration-300 rounded-full"
                style={{ width: `${memPct}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {memUsedGib} / {memTotalGib} GiB used
            </div>
          </div>

          {/* SYSTEM DISK Metric */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 dark:text-slate-500 font-semibold">SYSTEM DISK</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {sysDiskPct}%
              </span>
            </div>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-400 dark:bg-slate-300 transition-all duration-300 rounded-full"
                style={{ width: `${sysDiskPct}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {sysDiskAvailGib} GiB available
            </div>
          </div>

          {/* VM / CONTAINER STORAGE Metric */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 dark:text-slate-500 font-semibold">VM / CONTAINER STORAGE</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {vmDiskPct}%
              </span>
            </div>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-400 dark:bg-slate-300 transition-all duration-300 rounded-full"
                style={{ width: `${vmDiskPct}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {vmDiskAvailGib} GiB available
            </div>
          </div>
        </div>
      </div>

      {/* OTHER LINKS SECTION */}
      <div className="space-y-3 pt-2">
        <h3 className="text-[11px] font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">
          OTHER LINKS
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickLinks.map((link) => {
            const isTailscale = link.name.toLowerCase().includes('tailscale');
            const isGithub = link.name.toLowerCase().includes('github');
            const isGdrive = link.name.toLowerCase().includes('drive');
            const isGhome = link.name.toLowerCase().includes('home');
            const isRouter = link.name.toLowerCase().includes('router');

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200/60 dark:border-[#1e222d] bg-white dark:bg-[#13151b] hover:bg-slate-50 dark:hover:bg-[#181b23] hover:border-slate-300 dark:hover:border-[#282d3c] transition-all group min-h-[44px]"
              >
                <div className="text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors shrink-0">
                  {isRouter && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <rect x="2" y="14" width="20" height="8" rx="2" />
                      <line x1="6" y1="6" x2="6" y2="14" />
                      <line x1="18" y1="6" x2="18" y2="14" />
                    </svg>
                  )}
                  {isGdrive && (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M7.71 3.5L1.15 15l3.43 6 6.55-11.5M9.73 15L6.3 21h13.12l3.43-6M22.85 15l-6.55-11.5H9.42L15.98 15" />
                    </svg>
                  )}
                  {isGhome && (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                  )}
                  {isTailscale && (
                    <div className="grid grid-cols-3 gap-0.5 w-3.5 h-3.5">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <span key={i} className={`w-0.5 h-0.5 rounded-full ${[0, 2, 4, 6, 8].includes(i) ? 'bg-current' : 'opacity-20 bg-current'}`} />
                      ))}
                    </div>
                  )}
                  {isGithub && (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  )}
                </div>
                <span className="text-xs font-mono text-slate-800 dark:text-slate-200 group-hover:text-amber-500 transition-colors truncate">
                  {link.name} ↗
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Dynacat Attribution Footer */}
      <div className="pt-6 text-center text-xs font-mono text-slate-400 dark:text-slate-600 flex items-center justify-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-500">
          <path d="M12 5c-4 0-7 2.5-8 6l-1-7 5 3c1.3-.6 2.6-1 4-1s2.7.4 4 1l5-3-1 7c-1-3.5-4-6-8-6z" />
          <path d="M3 11c0 5 4 9 9 9s9-4 9-9" />
          <circle cx="9" cy="13" r="1" fill="currentColor" />
          <circle cx="15" cy="13" r="1" fill="currentColor" />
        </svg>
        <a
          href="https://github.com/Panonim/dynacat/releases/latest"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
        >
          <span>K28 - Kolenkachel</span>
          <span>·</span>
          <span className="text-emerald-500 font-semibold">Dynacat v3.0.2 (Latest Release) ↗</span>
        </a>
      </div>
    </div>
  );
};
