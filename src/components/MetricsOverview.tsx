import React, { useState } from 'react';
import {
  Play,
  Pause,
  Zap,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  ArrowDown,
  ArrowUp,
  ExternalLink,
} from 'lucide-react';
import { ServerMetrics, MetricHistoryPoint } from '../types/server';
import { formatBytes, formatSpeed, formatUptime } from '../utils/formatters';

interface MetricsOverviewProps {
  metrics: ServerMetrics;
  history: MetricHistoryPoint[];
  isStreaming: boolean;
  onToggleStreaming: () => void;
  streamIntervalMs: number;
  onChangeInterval: (ms: number) => void;
  spikeMode: 'none' | 'cpu_spike' | 'mem_spike' | 'service_fail';
  onSetSpikeMode: (mode: 'none' | 'cpu_spike' | 'mem_spike' | 'service_fail') => void;
  onNavigateToTab: (tab: 'services' | 'disks' | 'rules' | 'mobile') => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  metrics,
  history,
  isStreaming,
  onToggleStreaming,
  streamIntervalMs,
  onChangeInterval,
  spikeMode,
  onSetSpikeMode,
  onNavigateToTab,
}) => {
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);

  const memUsedGb = metrics.memory.usedBytes / (1024 * 1024 * 1024);
  const memTotalGb = metrics.memory.totalBytes / (1024 * 1024 * 1024);
  const memPct = (metrics.memory.usedBytes / metrics.memory.totalBytes) * 100;

  // Aggregate storage
  const totalDiskUsedBytes = metrics.disks.reduce((acc, d) => acc + d.usedBytes, 0);
  const totalDiskCapacityBytes = metrics.disks.reduce((acc, d) => acc + d.totalBytes, 0);
  const diskUsedTb = totalDiskUsedBytes / (1024 * 1024 * 1024 * 1024);
  const diskTotalTb = totalDiskCapacityBytes / (1024 * 1024 * 1024 * 1024);
  const diskPct = (totalDiskUsedBytes / totalDiskCapacityBytes) * 100;

  // SVG dimensions for clean minimalist sparklines
  const sparkWidth = 240;
  const sparkHeight = 36;
  const generateSparkline = (points: number[], maxVal = 100) => {
    if (points.length < 2) return '';
    const stepX = sparkWidth / (points.length - 1);
    return points
      .map((val, idx) => {
        const x = idx * stepX;
        const norm = Math.min(maxVal, Math.max(0, val));
        const y = sparkHeight - (norm / maxVal) * (sparkHeight - 4) - 2;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const chartWidth = 800;
  const chartHeight = 160;
  const chartPadding = 20;

  const pointsToChartPath = (points: number[], maxVal = 100) => {
    if (points.length < 2) return '';
    const stepX = (chartWidth - chartPadding * 2) / (points.length - 1);
    return points
      .map((val, idx) => {
        const x = chartPadding + idx * stepX;
        const norm = Math.min(maxVal, Math.max(0, val));
        const y = chartHeight - chartPadding - (norm / maxVal) * (chartHeight - chartPadding * 2);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const cpuPoints = history.map((h) => h.cpu);
  const memPoints = history.map((h) => h.memory);
  const cpuSparkPath = generateSparkline(cpuPoints, 100);
  const memSparkPath = generateSparkline(memPoints, 100);
  const cpuChartPath = pointsToChartPath(cpuPoints, 100);
  const memChartPath = pointsToChartPath(memPoints, 100);

  return (
    <div className="space-y-6">
      {/* Minimalist Node Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">
              {metrics.hostname}
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {metrics.network.ipAddress}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
            <span>{metrics.os}</span>
            <span aria-hidden="true">·</span>
            <span>Uptime {formatUptime(metrics.uptimeSeconds)}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">
              Load {metrics.loadAverage[0]} · {metrics.loadAverage[1]} · {metrics.loadAverage[2]}
            </span>
          </div>
        </div>

        {/* Minimalist Stream & Simulation Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Pause / Play */}
          <button
            onClick={onToggleStreaming}
            title={isStreaming ? 'Pause live stream' : 'Resume live stream'}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            {isStreaming ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-slate-400" />
                <span>Paused</span>
              </>
            )}
          </button>

          {/* Interval Selector */}
          <div className="flex items-center text-xs font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
            {[1000, 2000, 5000].map((int) => (
              <button
                key={int}
                onClick={() => onChangeInterval(int)}
                className={`px-2 py-0.5 transition-colors ${
                  streamIntervalMs === int
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {int / 1000}s
              </button>
            ))}
          </div>

          {/* Discreet Simulation Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSimulateMenu(!showSimulateMenu)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border transition-colors ${
                spikeMode !== 'none'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Simulate</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showSimulateMenu && (
              <div
                className="absolute right-0 mt-1 w-48 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-20 text-xs"
                onClick={() => setShowSimulateMenu(false)}
              >
                <button
                  onClick={() => onSetSpikeMode('cpu_spike')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    spikeMode === 'cpu_spike' ? 'font-bold text-rose-500' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Simulate CPU Spike (94%)
                </button>
                <button
                  onClick={() => onSetSpikeMode('service_fail')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    spikeMode === 'service_fail' ? 'font-bold text-amber-500' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Simulate Service Down
                </button>
                <button
                  onClick={() => onSetSpikeMode('none')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 mt-1"
                >
                  Reset to Nominal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Clean Minimalist Metric Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: CPU */}
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-1">
              CPU Utilization
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {metrics.cpu.usagePct.toFixed(1)}%
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {metrics.cpu.tempC}°C
              </span>
            </div>
          </div>

          {/* Quiet Sparkline */}
          <div className="my-3 h-8 flex items-center">
            <svg viewBox={`0 0 ${sparkWidth} ${sparkHeight}`} className="w-full h-7 overflow-visible">
              <path
                d={cpuSparkPath}
                fill="none"
                stroke={metrics.cpu.usagePct > 80 ? '#f43f5e' : '#10b981'}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <span>8 Cores · {metrics.cpu.frequencyGhz} GHz</span>
            <span>{metrics.cpu.fanRpm} RPM</span>
          </div>
        </div>

        {/* Metric 2: Memory */}
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-1">
              Memory (DDR4)
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {memUsedGb.toFixed(1)} GB
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {memPct.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Quiet Sparkline */}
          <div className="my-3 h-8 flex items-center">
            <svg viewBox={`0 0 ${sparkWidth} ${sparkHeight}`} className="w-full h-7 overflow-visible">
              <path
                d={memSparkPath}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <span>Total: {memTotalGb.toFixed(0)} GB</span>
            <span>Cache: {(metrics.memory.cachedBytes / (1024 * 1024 * 1024)).toFixed(1)} GB</span>
          </div>
        </div>

        {/* Metric 3: Network I/O */}
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-1">
              Network Bandwidth
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-1 font-mono text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                <ArrowDown className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{formatSpeed(metrics.network.rxSpeedBytes)}</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs text-slate-500">
                <ArrowUp className="w-3 h-3 text-blue-500 shrink-0" />
                <span>{formatSpeed(metrics.network.txSpeedBytes)}</span>
              </div>
            </div>
          </div>

          {/* Minimal hairline progress track */}
          <div className="my-4">
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (metrics.network.rxSpeedBytes / (5 * 1024 * 1024)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <span>Ping: {metrics.network.pingGatewayMs} ms</span>
            <span>{metrics.network.activeSockets} conns</span>
          </div>
        </div>

        {/* Metric 4: Storage Pools */}
        <div
          onClick={() => onNavigateToTab('disks')}
          className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors group"
        >
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-1">
              <span>ZFS Pools & Disks</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                HEALTHY
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {diskUsedTb.toFixed(1)} TB
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {diskPct.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Minimal hairline track */}
          <div className="my-4">
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${diskPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <span>Cap: {diskTotalTb.toFixed(1)} TB</span>
            <span className="text-purple-600 dark:text-purple-400 group-hover:underline">View 3 pools →</span>
          </div>
        </div>
      </div>

      {/* Spacious Minimalist Telemetry History Chart */}
      <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              System Telemetry History
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Live continuous utilization over the last 30 intervals
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">
                CPU {metrics.cpu.usagePct}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="text-slate-600 dark:text-slate-300">
                RAM {memPct.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Clean SVG Canvas */}
        <div className="w-full bg-slate-50/50 dark:bg-slate-950/40 rounded-lg p-2 border border-slate-100 dark:border-slate-800/50">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-36"
            preserveAspectRatio="none"
          >
            {/* Subtle horizontal grid lines */}
            <line x1={chartPadding} y1={chartPadding} x2={chartWidth - chartPadding} y2={chartPadding} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="0.75" />
            <line x1={chartPadding} y1={chartHeight / 2} x2={chartWidth - chartPadding} y2={chartHeight / 2} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="0.75" strokeDasharray="3 3" />
            <line x1={chartPadding} y1={chartHeight - chartPadding} x2={chartWidth - chartPadding} y2={chartHeight - chartPadding} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="0.75" />

            {/* Memory Line */}
            {memChartPath && (
              <path
                d={memChartPath}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* CPU Line */}
            {cpuChartPath && (
              <path
                d={cpuChartPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>

          <div className="flex justify-between text-[10px] font-mono text-slate-400 px-2 mt-1">
            <span>-60s</span>
            <span>-30s</span>
            <span>-15s</span>
            <span className="text-emerald-500 font-semibold">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};
