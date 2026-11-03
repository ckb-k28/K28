import { ServiceStatus } from '../types/server';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatSpeed(bytesPerSec: number): string {
  return `${formatBytes(bytesPerSec, 1)}/s`;
}

export function formatUptime(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function getStatusColor(status: ServiceStatus): {
  dot: string;
  badgeBg: string;
  badgeText: string;
  label: string;
} {
  switch (status) {
    case 'up':
      return {
        dot: 'bg-emerald-500',
        badgeBg: 'bg-emerald-500/10 border-emerald-500/20',
        badgeText: 'text-emerald-400',
        label: 'Operational',
      };
    case 'warning':
      return {
        dot: 'bg-amber-500',
        badgeBg: 'bg-amber-500/10 border-amber-500/20',
        badgeText: 'text-amber-400',
        label: 'Degraded',
      };
    case 'down':
      return {
        dot: 'bg-rose-500',
        badgeBg: 'bg-rose-500/10 border-rose-500/20',
        badgeText: 'text-rose-400',
        label: 'Offline',
      };
    case 'maintenance':
      return {
        dot: 'bg-slate-400',
        badgeBg: 'bg-slate-500/10 border-slate-500/20',
        badgeText: 'text-slate-400',
        label: 'Maintenance',
      };
  }
}

export function getLatencyBadge(latencyMs: number): { text: string; color: string } {
  if (latencyMs === 0) return { text: 'timeout', color: 'text-rose-400' };
  if (latencyMs < 30) return { text: `${latencyMs}ms`, color: 'text-emerald-400' };
  if (latencyMs < 100) return { text: `${latencyMs}ms`, color: 'text-amber-400' };
  return { text: `${latencyMs}ms`, color: 'text-rose-400' };
}
