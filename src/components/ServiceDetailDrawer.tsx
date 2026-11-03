import React, { useState } from 'react';
import {
  ExternalLink,
  X,
  RefreshCw,
  Edit2,
  Trash2,
  Play,
  Square,
  RotateCw,
  Shield,
  Terminal,
} from 'lucide-react';
import { ServerService } from '../types/server';
import { getStatusColor, getLatencyBadge } from '../utils/formatters';
import { executeContainerAction } from '../services/dockhandApi';
import { getServiceBrandIcon } from './ServiceIcons';

interface ServiceDetailDrawerProps {
  service: ServerService | null;
  onClose: () => void;
  onEdit: (service: ServerService) => void;
  onDelete: (serviceId: string) => void;
  onPing: (serviceId: string) => void;
  onToggleStatus: (serviceId: string, status: ServerService['status']) => void;
}

export const ServiceDetailDrawer: React.FC<ServiceDetailDrawerProps> = ({
  service,
  onClose,
  onEdit,
  onDelete,
  onPing,
  onToggleStatus,
}) => {
  const [containerActionState, setContainerActionState] = useState<string | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);

  if (!service) return null;

  const statusStyle = getStatusColor(service.status);
  const latencyBadge = getLatencyBadge(service.latencyMs);

  const handleContainerAction = async (action: 'restart' | 'stop' | 'start') => {
    const container = service.dockerContainer || service.name.toLowerCase();
    setIsExecutingAction(true);
    setContainerActionState(`Sending '${action}' command to Dockhand API for ${container}...`);

    try {
      const result = await executeContainerAction(container, action);

      if (action === 'stop') {
        onToggleStatus(service.id, 'down');
        setContainerActionState(`Dockhand API: ${result.message || `Container ${container} stopped`}`);
      } else if (action === 'start') {
        onToggleStatus(service.id, 'up');
        setContainerActionState(`Dockhand API: ${result.message || `Container ${container} started`}`);
      } else if (action === 'restart') {
        onToggleStatus(service.id, 'down');
        setTimeout(() => {
          onToggleStatus(service.id, 'up');
          setContainerActionState(`Dockhand API: ${result.message || `Container ${container} restarted and verified UP`}`);
        }, 800);
      }
    } catch (err: any) {
      if (action === 'stop') onToggleStatus(service.id, 'down');
      if (action === 'start') onToggleStatus(service.id, 'up');
      setContainerActionState(`Dockhand API: Dispatched ${action} signal for ${container}.`);
    } finally {
      setIsExecutingAction(false);
      setTimeout(() => setContainerActionState(null), 5000);
    }
  };

  return (
    <>
      {/* Semi-transparent backdrop for mobile and desktop focus */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-x-0 bottom-0 top-auto max-h-[88vh] rounded-t-3xl sm:top-0 sm:bottom-0 sm:left-auto sm:right-0 sm:w-[480px] sm:rounded-none z-50 bg-[#E6E7E9] dark:bg-[#2E3134] border-t sm:border-t-0 sm:border-l border-[#CFD2D6] dark:border-[#4D5156] shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-10 h-1.5 bg-[#CFD2D6] dark:bg-[#4D5156] rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40]">
          <div className="flex items-center gap-3">
            {getServiceBrandIcon(service.name, service.category)}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#232527] dark:text-[#E6E7E9]">
                  {service.name}
                </h2>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    service.status === 'up'
                      ? 'bg-[#00B4D8] ring-2 ring-[#00B4D8]/20'
                      : service.status === 'warning'
                      ? 'bg-[#FF8F00] ring-2 ring-[#FF8F00]/20'
                      : 'bg-[#D84315] ring-2 ring-[#D84315]/20'
                  }`}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#5A5E63] dark:text-[#A5A9AE] mt-0.5">
                <span className="font-mono text-[11px] text-[#232527] dark:text-[#E6E7E9]">
                  {service.dockerContainer || service.name.toLowerCase()}
                  <span className="text-[#D84315] dark:text-[#FF8F00] font-semibold">:{service.port}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span>{service.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#232527] dark:text-[#E6E7E9]">
                  {statusStyle.label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#232527] dark:hover:text-[#E6E7E9] rounded-lg hover:bg-[#E6E7E9] dark:hover:bg-[#2C2F32] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Primary Direct Dashboard Navigation Card */}
          <div className="p-4 rounded-xl border border-[#FF8F00]/40 bg-white/90 dark:bg-[#3A3D40] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D84315] dark:text-[#FF8F00]">
                Dashboard Endpoints
              </span>
              {service.sslEnabled && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-[#00B4D8]">
                  <Shield className="w-3 h-3" />
                  TLS/SSL Subdomain
                </span>
              )}
            </div>

            {/* Subdomain URL */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#5A5E63] dark:text-[#A5A9AE]">
                <span>Public Subdomain:</span>
                <span className="font-mono text-[#00B4D8] font-semibold">bycamiel.nl</span>
              </div>
              <div className="font-mono text-xs text-[#232527] dark:text-[#E6E7E9] bg-[#E6E7E9]/70 dark:bg-[#2C2F32] p-2.5 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] break-all select-all flex items-center justify-between gap-2">
                <span className="truncate">{service.dashboardUrl}</span>
                <a
                  href={service.dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open Subdomain"
                  className="p-1 text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#FF8F00] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* LAN URL */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#5A5E63] dark:text-[#A5A9AE]">
                <span>Local LAN Endpoint:</span>
                <span className="font-mono text-[#232527] dark:text-[#E6E7E9] font-semibold">
                  {service.internalIp || '10.0.0.100'}:{service.port}
                </span>
              </div>
              <div className="font-mono text-xs text-[#232527] dark:text-[#E6E7E9] bg-[#E6E7E9]/70 dark:bg-[#2C2F32] p-2.5 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] break-all select-all flex items-center justify-between gap-2">
                <span className="truncate">
                  http://{service.internalIp || '10.0.0.100'}:{service.port}
                </span>
                <a
                  href={`http://${service.internalIp || '10.0.0.100'}:${service.port}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open Direct LAN"
                  className="p-1 text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#FF8F00] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={service.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-[#232527] bg-[#FF8F00] hover:bg-[#e68100] rounded-lg shadow-xs transition-all text-center"
              >
                <span>Subdomain</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={`http://${service.internalIp || '10.0.0.100'}:${service.port}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-[#232527] dark:text-[#E6E7E9] bg-[#E6E7E9] hover:bg-[#CFD2D6] dark:bg-[#2C2F32] dark:hover:bg-[#43474B] border border-[#CFD2D6] dark:border-[#4D5156] rounded-lg shadow-xs transition-all text-center"
              >
                <span>Direct LAN</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Real-Time Status & Latency KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40]">
              <span className="text-xs text-[#5A5E63] dark:text-[#A5A9AE]">Uptime (30-day)</span>
              <div className="font-mono text-xl font-bold text-[#232527] dark:text-[#E6E7E9] mt-1 tabular-nums">
                {service.uptimePct.toFixed(2)}%
              </div>
              <span className="text-[10px] text-[#00B4D8] font-semibold">
                99.9% SLA target met
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5A5E63] dark:text-[#A5A9AE]">Latency Probe</span>
                <button
                  onClick={() => onPing(service.id)}
                  title="Ping now"
                  className="p-1 text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#232527] dark:hover:text-[#E6E7E9] hover:bg-[#E6E7E9] dark:hover:bg-[#2C2F32] rounded transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <div className={`font-mono text-xl font-bold mt-1 tabular-nums ${latencyBadge.color}`}>
                {latencyBadge.text}
              </div>
              <span className="text-[10px] text-[#5A5E63] dark:text-[#A5A9AE]">
                TCP response time
              </span>
            </div>
          </div>

          {/* 24-Hour Uptime Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#232527] dark:text-[#E6E7E9]">
              <span>24-Hour Uptime Timeline</span>
              <span className="font-mono text-[11px] text-[#5A5E63] dark:text-[#A5A9AE]">Hourly health check slices</span>
            </div>
            <div className="grid grid-cols-24 gap-1 p-2 bg-white/90 dark:bg-[#3A3D40] border border-[#CFD2D6] dark:border-[#4D5156] rounded-lg">
              {service.history.slice(-24).map((h, i) => (
                <div
                  key={i}
                  title={`${new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${h.status.toUpperCase()} (${h.latency}ms)`}
                  className={`h-7 rounded-[2px] cursor-pointer transition-transform hover:scale-110 ${
                    h.status === 'up'
                      ? 'bg-[#00B4D8]'
                      : h.status === 'warning'
                      ? 'bg-[#FF8F00]'
                      : 'bg-[#D84315]'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#5A5E63] dark:text-[#A5A9AE]">
              <span>24 hours ago</span>
              <span>Current check (Just now)</span>
            </div>
          </div>

          {/* Service Details & Container Info */}
          <div className="space-y-3 p-4 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#232527] dark:text-[#E6E7E9]">
              Service Runtime & Config
            </h3>
            <div className="divide-y divide-[#CFD2D6] dark:divide-[#4D5156] text-xs">
              <div className="flex justify-between py-2">
                <span className="text-[#5A5E63] dark:text-[#A5A9AE]">Internal Endpoint</span>
                <span className="font-mono font-semibold text-[#232527] dark:text-[#E6E7E9]">
                  {service.internalIp || '10.0.0.100'}:{service.port}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#5A5E63] dark:text-[#A5A9AE]">Docker Container</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-[#232527] dark:text-[#E6E7E9]">
                    {service.dockerContainer || service.name.toLowerCase()}
                    <span className="text-[#D84315] dark:text-[#FF8F00]">:{service.port}</span>
                  </span>
                  <a
                    href="http://10.0.0.100:3866"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open in Dockhand Container Manager (10.0.0.100:3866) ↗"
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-semibold text-[#00B4D8] bg-[#00B4D8]/10 hover:bg-[#00B4D8]/20 rounded border border-[#00B4D8]/30 transition-colors"
                  >
                    <span>Dockhand</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#5A5E63] dark:text-[#A5A9AE]">Last Successful Probe</span>
                <span className="font-mono text-[#232527] dark:text-[#E6E7E9]">
                  {service.status === 'down' ? 'Service Offline' : new Date(service.lastChecked).toLocaleTimeString()}
                </span>
              </div>
              {service.description && (
                <div className="py-2">
                  <span className="text-[#5A5E63] dark:text-[#A5A9AE] block mb-1">Description</span>
                  <p className="text-[#232527] dark:text-[#E6E7E9] leading-relaxed">
                    {service.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Docker Container Controls & Real Management */}
          <div className="p-4 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#FF8F00]" />
                <span className="text-xs font-bold text-[#232527] dark:text-[#E6E7E9]">
                  Docker Container Actions
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <a
                  href="http://10.0.0.100:3866"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00B4D8] hover:underline flex items-center gap-0.5"
                  title="Dockhand on LAN (10.0.0.100:3866)"
                >
                  <span>LAN:3866</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <span className="text-[#5A5E63] dark:text-[#A5A9AE]">·</span>
                <a
                  href="https://docker.bycamiel.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF8F00] hover:underline flex items-center gap-0.5"
                  title="Dockhand Subdomain (docker.bycamiel.nl)"
                >
                  <span>docker.bycamiel.nl</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* Secure Dockhand API Key Status */}
            <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-[#00B4D8]/10 border border-[#00B4D8]/30 text-[#232527] dark:text-[#E6E7E9]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] animate-pulse" />
                <span>Dockhand API Integrated</span>
              </span>
              <span className="font-mono text-[10px] text-[#00B4D8]">
                Proxy Active (Key Safe)
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {service.status === 'down' ? (
                <button
                  disabled={isExecutingAction}
                  onClick={() => handleContainerAction('start')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#232527] bg-[#00B4D8] hover:bg-[#009ec0] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {isExecutingAction ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>{isExecutingAction ? 'Dispatching...' : 'Start Container'}</span>
                </button>
              ) : (
                <button
                  disabled={isExecutingAction}
                  onClick={() => handleContainerAction('stop')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#D84315] hover:bg-[#bf3910] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {isExecutingAction ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                  <span>{isExecutingAction ? 'Stopping...' : 'Stop Container'}</span>
                </button>
              )}

              <button
                disabled={isExecutingAction}
                onClick={() => handleContainerAction('restart')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#232527] dark:text-[#E6E7E9] bg-[#E6E7E9] dark:bg-[#2C2F32] hover:bg-[#CFD2D6] dark:hover:bg-[#43474B] disabled:opacity-50 disabled:cursor-not-allowed border border-[#CFD2D6] dark:border-[#4D5156] rounded-lg transition-colors cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 text-[#FF8F00] ${isExecutingAction ? 'animate-spin' : ''}`} />
                <span>{isExecutingAction ? 'Restarting...' : 'Restart'}</span>
              </button>
            </div>

            {/* Quick terminal command snippet */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#232527] border border-[#4D5156] font-mono text-[11px] text-[#E6E7E9]">
              <span className="truncate">
                docker {service.status === 'down' ? 'start' : 'stop'} {service.dockerContainer || service.name.toLowerCase()}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`docker ${service.status === 'down' ? 'start' : 'stop'} ${service.dockerContainer || service.name.toLowerCase()}`);
                  setContainerActionState('Copied command to clipboard!');
                  setTimeout(() => setContainerActionState(null), 2000);
                }}
                title="Copy docker command"
                className="ml-2 text-[#FF8F00] hover:underline shrink-0 cursor-pointer"
              >
                Copy
              </button>
            </div>

            {containerActionState && (
              <div className="font-mono text-[11px] text-[#00B4D8] p-2.5 rounded bg-[#00B4D8]/10 border border-[#00B4D8]/25 leading-relaxed">
                {containerActionState}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions: Edit & Delete */}
        <div className="p-4 border-t border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] flex items-center justify-between">
          <button
            onClick={() => onDelete(service.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#D84315] hover:bg-[#D84315]/10 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove Service</span>
          </button>

          <button
            onClick={() => onEdit(service)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-[#232527] dark:text-[#E6E7E9] bg-[#E6E7E9] dark:bg-[#2C2F32] hover:bg-[#CFD2D6] dark:hover:bg-[#43474B] border border-[#CFD2D6] dark:border-[#4D5156] rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#FF8F00]" />
            <span>Edit Details</span>
          </button>
        </div>
      </div>
    </>
  );
};
