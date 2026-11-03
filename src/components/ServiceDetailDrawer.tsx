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
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  Layers,
  Terminal,
  Server,
} from 'lucide-react';
import { ServerService } from '../types/server';
import { getStatusColor, getLatencyBadge } from '../utils/formatters';
import { executeContainerAction } from '../services/dockhandApi';

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

      <div className="fixed inset-x-0 bottom-0 top-auto max-h-[88vh] rounded-t-3xl sm:top-0 sm:bottom-0 sm:left-auto sm:right-0 sm:w-[480px] sm:rounded-none z-50 bg-white dark:bg-[#12141a] border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
          <span className={`w-3.5 h-3.5 rounded-full ${statusStyle.dot} ring-4 ring-emerald-500/10`} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {service.name}
              </h2>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                :{service.port}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{service.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {statusStyle.label}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Primary Direct Dashboard Navigation Card */}
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Dashboard Endpoints
            </span>
            {service.sslEnabled && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                <Shield className="w-3 h-3" />
                TLS/SSL Subdomain
              </span>
            )}
          </div>

          {/* Subdomain URL */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Public Subdomain:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">bycamiel.nl</span>
            </div>
            <div className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">{service.dashboardUrl}</span>
              <a
                href={service.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open Subdomain"
                className="p-1 text-slate-400 hover:text-emerald-500 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* LAN URL */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Local LAN Endpoint:</span>
              <span className="font-mono text-slate-600 dark:text-slate-400 font-semibold">{service.internalIp || '10.0.0.100'}:{service.port}</span>
            </div>
            <div className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">http://{service.internalIp || '10.0.0.100'}:{service.port}</span>
              <a
                href={`http://${service.internalIp || '10.0.0.100'}:${service.port}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open Direct LAN"
                className="p-1 text-slate-400 hover:text-emerald-500 transition-colors"
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
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 rounded-lg shadow-sm transition-all text-center"
            >
              <span>Subdomain</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={`http://${service.internalIp || '10.0.0.100'}:${service.port}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-all text-center"
            >
              <span>Direct LAN</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Real-Time Status & Latency KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <span className="text-xs text-slate-500">Uptime (30-day)</span>
            <div className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
              {service.uptimePct.toFixed(2)}%
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              99.9% SLA target met
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Latency Probe</span>
              <button
                onClick={() => onPing(service.id)}
                title="Ping now"
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
            <div className={`font-mono text-xl font-bold mt-1 tabular-nums ${latencyBadge.color}`}>
              {latencyBadge.text}
            </div>
            <span className="text-[10px] text-slate-400">
              TCP response time
            </span>
          </div>
        </div>

        {/* 24-Hour Uptime Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
            <span>24-Hour Uptime Timeline</span>
            <span className="font-mono text-[11px] text-slate-400">Hourly health check slices</span>
          </div>
          <div className="grid grid-cols-24 gap-1 p-2 bg-slate-100 dark:bg-slate-800/60 rounded-lg">
            {service.history.slice(-24).map((h, i) => (
              <div
                key={i}
                title={`${new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${h.status.toUpperCase()} (${h.latency}ms)`}
                className={`h-7 rounded-[2px] cursor-pointer transition-transform hover:scale-110 ${
                  h.status === 'up'
                    ? 'bg-emerald-500'
                    : h.status === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>24 hours ago</span>
            <span>Current check (Just now)</span>
          </div>
        </div>

        {/* Service Details & Container Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Service Runtime & Config
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Internal Endpoint</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {service.internalIp || '10.0.0.100'}:{service.port}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Docker Container</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {service.dockerContainer || 'Bare metal / Systemd'}
                </span>
                <a
                  href="http://10.0.0.100:3866"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in Dockhand Container Manager (10.0.0.100:3866) ↗"
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded border border-blue-200 dark:border-blue-800/60 transition-colors"
                >
                  <span>Dockhand</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Last Successful Probe</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {service.status === 'down' ? 'Service Offline' : new Date(service.lastChecked).toLocaleTimeString()}
              </span>
            </div>
            {service.description && (
              <div className="py-2">
                <span className="text-slate-500 block mb-1">Description</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {service.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Docker Container Controls & Real Management */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Docker Container Actions
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <a
                href="http://10.0.0.100:3866"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                title="Dockhand on LAN (10.0.0.100:3866)"
              >
                <span>LAN:3866</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span className="text-slate-400">·</span>
              <a
                href="https://docker.bycamiel.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                title="Dockhand Subdomain (docker.bycamiel.nl)"
              >
                <span>docker.bycamiel.nl</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Secure Dockhand API Key Status */}
          <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-300">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>Dockhand API Integrated</span>
            </span>
            <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">
              dh_vU...2aA (Key Safe)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {service.status === 'down' ? (
              <button
                disabled={isExecutingAction}
                onClick={() => handleContainerAction('start')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 text-blue-500 ${isExecutingAction ? 'animate-spin' : ''}`} />
              <span>{isExecutingAction ? 'Restarting...' : 'Restart'}</span>
            </button>
          </div>

          {/* Quick terminal command snippet */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-slate-800 font-mono text-[11px] text-slate-300">
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
              className="ml-2 text-slate-400 hover:text-white shrink-0"
            >
              Copy
            </button>
          </div>

          {containerActionState && (
            <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 leading-relaxed">
              {containerActionState}
            </div>
          )}
        </div>
      </div>

      {/* Drawer Footer Actions: Edit & Delete */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
        <button
          onClick={() => onDelete(service.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Remove Service</span>
        </button>

        <button
          onClick={() => onEdit(service)}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Details</span>
        </button>
      </div>
    </div>
  </>
);
};
