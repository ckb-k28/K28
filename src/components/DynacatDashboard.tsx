import React, { useState } from 'react';
import {
  ExternalLink,
  Smartphone,
  X,
  ShieldCheck,
  Tv,
  ArrowDown,
  Container,
  Server,
  Clock,
  Thermometer,
  Activity,
  Plus,
  Sliders,
  Trash2,
  EyeOff,
} from 'lucide-react';
import {
  ServerService,
  ServerMetrics,
  QuickLink,
  DynacatLayoutConfig,
  DynacatWidget,
} from '../types/server';
import { getServiceBrandIcon } from './ServiceIcons';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Footer } from './Footer';

interface DynacatDashboardProps {
  services: ServerService[];
  metrics: ServerMetrics;
  quickLinks: QuickLink[];
  layout: DynacatLayoutConfig;
  onUpdateLayout: (layout: DynacatLayoutConfig) => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenDynacatEditor: () => void;
  onSelectService: (service: ServerService) => void;
  onAddService: () => void;
  onOpenMobileModal: () => void;
  linkMode: 'lan' | 'subdomain';
  onToggleLinkMode: () => void;
  onOpenVersionModal?: () => void;
}

export const DynacatDashboard: React.FC<DynacatDashboardProps> = ({
  services,
  metrics,
  quickLinks,
  layout,
  onUpdateLayout,
  isEditMode,
  onToggleEditMode,
  onOpenDynacatEditor,
  onSelectService,
  onAddService,
  linkMode,
  onOpenVersionModal,
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

  // Filter out Tailscale from Other Links
  const filteredQuickLinks = quickLinks.filter(
    (l) => l.id !== 'ql-tailscale' && !l.name.toLowerCase().includes('tailscale')
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

  const renderWidgetIcon = (widget: DynacatWidget, hexColor: string) => {
    switch (widget.type) {
      case 'adguard-dns':
        return <ShieldCheck className="w-4 h-4" style={{ color: hexColor }} />;
      case 'downloads-queue':
        return <ArrowDown className="w-4 h-4" style={{ color: hexColor }} />;
      case 'emby-streams':
        return <Tv className="w-4 h-4" style={{ color: hexColor }} />;
      case 'dockhand-containers':
        return <Container className="w-4 h-4" style={{ color: hexColor }} />;
      case 'system-clock':
        return <Clock className="w-4 h-4" style={{ color: hexColor }} />;
      case 'weather':
        return <Thermometer className="w-4 h-4" style={{ color: hexColor }} />;
      default:
        return <Activity className="w-4 h-4" style={{ color: hexColor }} />;
    }
  };

  const handleRemoveWidgetInline = (widgetId: string) => {
    onUpdateLayout({
      ...layout,
      widgets: layout.widgets.map((w) => (w.id === widgetId ? { ...w, enabled: false } : w)),
    });
  };

  const renderServiceColumn = (title: string, list: ServerService[]) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-mono font-bold tracking-wider text-slate-600 dark:text-[#E6E7E9]/70 uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D84315]" />
          <span>{title}</span>
        </h3>
        {isEditMode && (
          <button
            onClick={onAddService}
            className="text-[10px] font-mono text-[#FF8F00] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        )}
      </div>
      <div className="space-y-2">
        {list.map((service) => {
          const isUp = service.status === 'up';
          const isWarning = service.status === 'warning';
          const targetUrl = getServiceTargetUrl(service);

          return (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className="group relative flex items-center justify-between p-3 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] hover:bg-white dark:hover:bg-[#43474B] hover:border-[#FF8F00] dark:hover:border-[#FF8F00] transition-all cursor-pointer shadow-xs min-h-[48px]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0">{getServiceBrandIcon(service.name, service.category)}</div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-[#232527] dark:text-[#E6E7E9] group-hover:text-[#D84315] dark:group-hover:text-[#FF8F00] transition-colors truncate">
                      {service.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-[#E6E7E9]/55 truncate">
                    <span className="truncate">{service.dockerContainer || service.name.toLowerCase()}</span>
                    <span className="text-[#D84315] dark:text-[#FF8F00] font-semibold shrink-0">:{service.port}</span>
                  </div>
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
                  className="p-1.5 text-slate-400 dark:text-[#E6E7E9]/60 hover:text-[#FF8F00] hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Status Dot / Checkmark Badge */}
                {isUp ? (
                  <div
                    title="Operational (Running)"
                    className="w-5 h-5 rounded-full bg-[#00B4D8]/15 text-[#0096B4] dark:text-[#00B4D8] flex items-center justify-center shrink-0"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                ) : isWarning ? (
                  <div
                    title="Degraded Performance"
                    className="w-5 h-5 rounded-full bg-[#FF8F00]/20 text-[#FF8F00] flex items-center justify-center shrink-0"
                  >
                    <span className="text-[10px] font-bold">!</span>
                  </div>
                ) : (
                  <div
                    title="Container Stopped (Offline)"
                    className="w-5 h-5 rounded-full bg-[#D84315]/20 text-[#D84315] flex items-center justify-center shrink-0"
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

  const enabledWidgets = layout.widgets.filter((w) => w.enabled);
  const sortedSections = [...layout.sections].sort((a, b) => a.order - b.order);

  const renderSection = (sectionId: 'live-widgets' | 'service-columns' | 'host-health' | 'quick-links') => {
    const secConfig = layout.sections.find((s) => s.id === sectionId);
    if (!secConfig || (!secConfig.enabled && !isEditMode)) return null;

    if (sectionId === 'live-widgets') {
      return (
        <div key="live-widgets" className="space-y-2.5">
          {isEditMode && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono font-bold uppercase text-[#FF8F00]">
                Dynacat Live Widgets Strip
              </span>
              <button
                onClick={onOpenDynacatEditor}
                className="text-[11px] font-mono text-[#00B4D8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add / Edit Widgets</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {enabledWidgets.map((widget) => {
              const hexColor =
                widget.accentColor === 'ember'
                  ? '#D84315'
                  : widget.accentColor === 'amber'
                  ? '#FF8F00'
                  : '#00B4D8';

              return (
                <div
                  key={widget.id}
                  className={`relative p-3.5 rounded-xl border bg-white/90 dark:bg-[#3A3D40] shadow-xs flex items-center justify-between transition-all ${
                    isEditMode
                      ? 'border-dashed border-[#FF8F00]'
                      : 'border-[#CFD2D6] dark:border-[#4D5156]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: `${hexColor}26` }}
                    >
                      {renderWidgetIcon(widget, hexColor)}
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-[#E6E7E9]/60 uppercase font-semibold">
                        {widget.title}
                      </div>
                      <div className="text-xs font-bold text-[#232527] dark:text-[#E6E7E9] font-mono">
                        {widget.primaryValue}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right text-[11px] font-mono text-slate-500 dark:text-[#E6E7E9]/70">
                      <div>{widget.secondaryTop}</div>
                      <span className="font-semibold" style={{ color: hexColor }}>
                        {widget.secondaryBottom}
                      </span>
                    </div>

                    {isEditMode && (
                      <button
                        onClick={() => handleRemoveWidgetInline(widget.id)}
                        title="Hide widget from dashboard"
                        className="p-1.5 rounded-lg bg-[#D84315]/15 text-[#D84315] hover:bg-[#D84315]/25 cursor-pointer"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isEditMode && (
              <button
                onClick={onOpenDynacatEditor}
                className="p-3.5 rounded-xl border border-dashed border-[#FF8F00]/60 bg-[#FF8F00]/5 hover:bg-[#FF8F00]/15 text-[#D84315] dark:text-[#FF8F00] font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[64px]"
              >
                <Plus className="w-4 h-4" />
                <span>Add / Configure Dynacat Widget</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    if (sectionId === 'service-columns') {
      return (
        <div
          key="service-columns"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {renderServiceColumn('INFRASTRUCTURE', infrastructureServices)}
          {renderServiceColumn('APPS', appsServices)}
          {renderServiceColumn('MEDIA', mediaServices)}
          {renderServiceColumn('DOWNLOADS & AUTOMATION', downloadsServices)}
        </div>
      );
    }

    if (sectionId === 'host-health') {
      return (
        <div key="host-health" className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-mono font-bold tracking-wider text-slate-600 dark:text-[#E6E7E9]/70 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF8F00]" />
              <span>K28 - KOLENKACHEL HOST HEALTH</span>
            </h3>
            {isEditMode && (
              <button
                onClick={onOpenDynacatEditor}
                className="text-[10px] font-mono text-[#FF8F00] hover:underline cursor-pointer"
              >
                Configure Gauges →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] shadow-xs">
            {/* CPU Metric */}
            {layout.hostHealth.showCpu && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-[#E6E7E9]/60 font-semibold">CPU</span>
                  <span className="font-bold text-[#232527] dark:text-[#E6E7E9] tabular-nums">
                    {metrics.cpu.usagePct.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#E6E7E9] dark:bg-[#2C2F32] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00B4D8] transition-all duration-300 rounded-full"
                    style={{ width: `${Math.max(3, metrics.cpu.usagePct)}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-[#E6E7E9]/60">
                  {metrics.cpu.cores.length} logical cores · {metrics.cpu.tempC.toFixed(1)}°C
                </div>
              </div>
            )}

            {/* RAM Metric */}
            {layout.hostHealth.showRam && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-[#E6E7E9]/60 font-semibold">RAM</span>
                  <span className="font-bold text-[#232527] dark:text-[#E6E7E9] tabular-nums">
                    {memPct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#E6E7E9] dark:bg-[#2C2F32] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF8F00] transition-all duration-300 rounded-full"
                    style={{ width: `${memPct}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-[#E6E7E9]/60">
                  {memUsedGib} / {memTotalGib} GiB used
                </div>
              </div>
            )}

            {/* SYSTEM DISK Metric */}
            {layout.hostHealth.showSystemDisk && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-[#E6E7E9]/60 font-semibold">SYSTEM DISK</span>
                  <span className="font-bold text-[#232527] dark:text-[#E6E7E9] tabular-nums">
                    {sysDiskPct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#E6E7E9] dark:bg-[#2C2F32] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#D84315] transition-all duration-300 rounded-full"
                    style={{ width: `${sysDiskPct}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-[#E6E7E9]/60">
                  {sysDiskAvailGib} GiB available
                </div>
              </div>
            )}

            {/* VM / CONTAINER STORAGE Metric */}
            {layout.hostHealth.showVmStorage && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-[#E6E7E9]/60 font-semibold">
                    VM / CONTAINER STORAGE
                  </span>
                  <span className="font-bold text-[#232527] dark:text-[#E6E7E9] tabular-nums">
                    {vmDiskPct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#E6E7E9] dark:bg-[#2C2F32] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D84315] to-[#FF8F00] transition-all duration-300 rounded-full"
                    style={{ width: `${vmDiskPct}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-[#E6E7E9]/60">
                  {vmDiskAvailGib} GiB available
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (sectionId === 'quick-links') {
      return (
        <div key="quick-links" className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-mono font-bold tracking-wider text-slate-600 dark:text-[#E6E7E9]/70 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]" />
              <span>OTHER LINKS</span>
            </h3>
            {isEditMode && (
              <button
                onClick={onOpenDynacatEditor}
                className="text-[10px] font-mono text-[#00B4D8] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Manage Links</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {filteredQuickLinks.map((link) => {
              const isGithub = link.name.toLowerCase().includes('github');
              const isGdrive = link.name.toLowerCase().includes('drive');
              const isGhome = link.name.toLowerCase().includes('home');
              const isRouter =
                link.name.toLowerCase().includes('router') ||
                link.name.toLowerCase().includes('gateway');
              const isDocker =
                link.name.toLowerCase().includes('dockhand') ||
                link.name.toLowerCase().includes('docker');
              const isNas =
                link.name.toLowerCase().includes('synology') || link.name.toLowerCase().includes('nas');
              const isAdguard = link.name.toLowerCase().includes('adguard');

              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] hover:bg-white dark:hover:bg-[#43474B] hover:border-[#FF8F00] dark:hover:border-[#FF8F00] transition-all group min-h-[44px]"
                >
                  <div className="text-slate-500 dark:text-[#E6E7E9]/70 group-hover:text-[#FF8F00] transition-colors shrink-0">
                    {isRouter && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-4 h-4 text-[#FF8F00]"
                      >
                        <rect x="2" y="14" width="20" height="8" rx="2" />
                        <line x1="6" y1="6" x2="6" y2="14" />
                        <line x1="18" y1="6" x2="18" y2="14" />
                      </svg>
                    )}
                    {isDocker && <Container className="w-4 h-4 text-[#00B4D8]" />}
                    {isNas && <Server className="w-4 h-4 text-[#D84315]" />}
                    {isAdguard && <ShieldCheck className="w-4 h-4 text-[#00B4D8]" />}
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
                    {isGithub && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs font-mono text-[#232527] dark:text-[#E6E7E9] group-hover:text-[#D84315] dark:group-hover:text-[#FF8F00] transition-colors truncate">
                    {link.name} ↗
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 md:pb-12">
      {/* Dynacat Interactive Edit Mode Control Bar (when active) */}
      {isEditMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#FF8F00] bg-[#FF8F00]/10 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-[#FF8F00] shrink-0" />
            <div>
              <span className="font-bold text-[#232527] dark:text-[#E6E7E9]">
                Dynacat v3.0.2 Dashboard Edit Mode Active
              </span>
              <span className="hidden md:inline text-[#5A5E63] dark:text-[#A5A9AE] ml-2">
                — Customize widgets, toggle components, or sync directly with config/dynacat.yaml
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDynacatEditor}
              className="px-3 py-1.5 rounded-lg bg-[#FF8F00] text-[#232527] font-bold hover:bg-[#e68100] transition-colors cursor-pointer"
            >
              Open Dynacat Studio
            </button>
            <button
              onClick={onToggleEditMode}
              className="px-3 py-1.5 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-white dark:bg-[#3A3D40] text-[#232527] dark:text-[#E6E7E9] font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Mobile PWA Install Prompt Banner */}
      {!isInstalled && !dismissInstallBanner && (isInstallable || isIOS) && (
        <div className="sm:hidden flex items-center justify-between p-3 rounded-xl bg-[#FF8F00]/15 border border-[#FF8F00]/30 text-xs">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-[#FF8F00] shrink-0" />
            <div>
              <div className="font-bold text-[#232527] dark:text-[#E6E7E9]">
                Install K28 - Kolenkachel on Phone
              </div>
              <div className="text-[11px] text-slate-600 dark:text-[#E6E7E9]/70">
                Standalone fullscreen monitor on your home screen
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isInstallable ? (
              <button
                onClick={install}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-[#FF8F00] text-[#232527] rounded-md"
              >
                Install
              </button>
            ) : isIOS ? (
              <button
                onClick={() => setShowIOSPrompt(true)}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-[#FF8F00] text-[#232527] rounded-md"
              >
                Add to Home
              </button>
            ) : null}

            <button
              onClick={() => setDismissInstallBanner(true)}
              className="p-1 text-slate-500 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#3A3D40] border border-[#4D5156] p-5 text-xs text-[#E6E7E9] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white">Add K28 to iPhone</h4>
              <button onClick={() => setShowIOSPrompt(false)} className="text-[#E6E7E9]/70">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-[#E6E7E9]/90 leading-relaxed">
              <li>Tap the <strong className="text-[#FF8F00]">Share</strong> button in Safari&apos;s toolbar.</li>
              <li>Scroll down and select <strong className="text-[#FF8F00]">Add to Home Screen</strong>.</li>
              <li>Tap <strong className="text-[#FF8F00]">Add</strong> in the top-right corner.</li>
            </ol>
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full py-2 bg-[#D84315] hover:bg-[#FF8F00] text-white font-semibold rounded-lg mt-2 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Dynamically Ordered & Configurable Dynacat Sections */}
      {sortedSections.map((sec) => renderSection(sec.id))}

      {/* Kolenkachel Operations Hub Footer with Version Numbering */}
      <div className="pt-8">
        <Footer
          onOpenVersionModal={onOpenVersionModal || (() => {})}
          linkMode={linkMode}
        />
      </div>
    </div>
  );
};
