import React, { useState } from 'react';
import {
  Play,
  Zap,
  ChevronDown,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { ServerMetrics, MetricHistoryPoint } from '../types/server';
import { formatSpeed, formatUptime } from '../utils/formatters';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#CFD2D6] dark:border-[#4D5156]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold font-mono tracking-tight text-[#232527] dark:text-[#E6E7E9]">
              {metrics.hostname}
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]" />
            <span className="text-xs font-mono text-[#5A5E63] dark:text-[#A5A9AE]">
              {metrics.network.ipAddress}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#5A5E63] dark:text-[#A5A9AE] mt-1 flex-wrap">
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
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#5A5E63] dark:text-[#E6E7E9] hover:text-[#232527] dark:hover:text-white rounded-md hover:bg-white/60 dark:hover:bg-[#3A3D40] transition-colors cursor-pointer"
          >
            {isStreaming ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#00B4D8] animate-pulse" />
                <span>Live</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-[#5A5E63] dark:text-[#A5A9AE]" />
                <span>Paused</span>
              </>
            )}
          </button>

          {/* Interval Selector */}
          <div className="flex items-center text-xs font-mono text-[#5A5E63] dark:text-[#A5A9AE] border border-[#CFD2D6] dark:border-[#4D5156] rounded-md overflow-hidden bg-white/80 dark:bg-[#3A3D40]">
            {[1000, 2000, 5000].map((int) => (
              <button
                key={int}
                onClick={() => onChangeInterval(int)}
                className={`px-2 py-0.5 transition-colors cursor-pointer ${
                  streamIntervalMs === int
                    ? 'bg-[#FF8F00] text-[#232527] font-bold'
                    : 'hover:bg-[#E6E7E9] dark:hover:bg-[#2C2F32]'
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
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                spikeMode !== 'none'
                  ? 'border-[#FF8F00] text-[#D84315] dark:text-[#FF8F00] bg-[#FF8F00]/15'
                  : 'border-[#CFD2D6] dark:border-[#4D5156] bg-white/80 dark:bg-[#3A3D40] text-[#5A5E63] dark:text-[#E6E7E9] hover:border-[#FF8F00]/50'
              }`}
            >
              <Zap className="w-3 h-3 text-[#FF8F00]" />
              <span>Simulate</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showSimulateMenu && (
              <div
                className="absolute right-0 mt-1 w-48 py-1 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-white dark:bg-[#3A3D40] shadow-xl z-20 text-xs"
                onClick={() => setShowSimulateMenu(false)}
              >
                <button
                  onClick={() => onSetSpikeMode('cpu_spike')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#E6E7E9] dark:hover:bg-[#2C2F32] transition-colors cursor-pointer ${
                    spikeMode === 'cpu_spike' ? 'font-bold text-[#D84315]' : 'text-[#232527] dark:text-[#E6E7E9]'
                  }`}
                >
                  Simulate CPU Spike (94%)
                </button>
                <button
                  onClick={() => onSetSpikeMode('service_fail')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#E6E7E9] dark:hover:bg-[#2C2F32] transition-colors cursor-pointer ${
                    spikeMode === 'service_fail' ? 'font-bold text-[#FF8F00]' : 'text-[#232527] dark:text-[#E6E7E9]'
                  }`}
                >
                  Simulate Service Down
                </button>
                <button
                  onClick={() => onSetSpikeMode('none')}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#E6E7E9] dark:hover:bg-[#2C2F32] text-[#5A5E63] dark:text-[#A5A9AE] border-t border-[#CFD2D6] dark:border-[#4D5156] mt-1 cursor-pointer"
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
        <div className="p-4 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-[#5A5E63] dark:text-[#A5A9AE] mb-1">
              CPU Utilization
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold tracking-tight text-[#232527] dark:text-[#E6E7E9] tabular-nums">
                {metrics.cpu.usagePct.toFixed(1)}%
              </span>
              <span className="font-mono text-xs text-[#5A5E63] dark:text-[#A5A9AE]">
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
                stroke={metrics.cpu.usagePct > 80 ? '#D84315' : '#00B4D8'}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#5A5E63] dark:text-[#A5A9AE] font-mono pt-2 border-t border-[#CFD2D6] dark:border-[#4D5156]">
            <span>8 Cores · {metrics.cpu.frequencyGhz} GHz</span>
            <span>{metrics.cpu.fanRpm} RPM</span>
          </div>
        </div>

        {/* Metric 2: Memory */}
        <div className="p-4 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-[#5A5E63] dark:text-[#A5A9AE] mb-1">
              Memory (DDR4)
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold tracking-tight text-[#232527] dark:text-[#E6E7E9] tabular-nums">
                {memUsedGb.toFixed(1)} GB
              </span>
              <span className="font-mono text-xs text-[#5A5E63] dark:text-[#A5A9AE]">
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
                stroke="#FF8F00"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#5A5E63] dark:text-[#A5A9AE] font-mono pt-2 border-t border-[#CFD2D6] dark:border-[#4D5156]">
            <span>Total: {memTotalGb.toFixed(0)} GB</span>
            <span>Cache: {(metrics.memory.cachedBytes / (1024 * 1024 * 1024)).toFixed(1)} GB</span>
          </div>
        </div>

        {/* Metric 3: Network I/O */}
        <div className="p-4 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-[#5A5E63] dark:text-[#A5A9AE] mb-1">
              Network Bandwidth
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-1 font-mono text-xl font-bold text-[#232527] dark:text-[#E6E7E9] tabular-nums">
                <ArrowDown className="w-4 h-4 text-[#00B4D8] shrink-0" />
                <span>{formatSpeed(metrics.network.rxSpeedBytes)}</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs text-[#5A5E63] dark:text-[#A5A9AE]">
                <ArrowUp className="w-3 h-3 text-[#FF8F00] shrink-0" />
                <span>{formatSpeed(metrics.network.txSpeedBytes)}</span>
              </div>
            </div>
          </div>

          {/* Minimal hairline progress track */}
          <div className="my-4">
            <div className="w-full h-1 bg-[#E6E7E9] dark:bg-[#2C2F32] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00B4D8] transition-all duration-300"
                style={{ width: `${Math.min(100, (metrics.network.rxSpeedBytes / (5 * 1024 * 1024)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#5A5E63] dark:text-[#A5A9AE] font-mono pt-2 border-t border-[#CFD2D6] dark:border-[#4D5156]">
            <span>Ping: {metrics.network.pingGatewayMs} ms</span>
            <span>{metrics.network.activeSockets} conns</span>
          </div>
        </div>

        {/* Metric 4: Storage Pools */}
        <div
          onClick={() => onNavigateToTab('disks')}
          className="p-4 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#D84315]/60 transition-colors group"
        >
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-[#5A5E63] dark:text-[#A5A9AE] mb-1">
              <span>ZFS Pools & Disks</span>
              <span className="text-[10px] text-[#00B4D8] font-mono">
                HEALTHY
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold tracking-tight text-[#232527] dark:text-[#E6E7E9] tabular-nums">
                {diskUsedTb.toFixed(1)} TB
              </span>
              <span className="font-mono text-xs text-[#5A5E63] dark:text-[#A5A9AE]">
                {diskPct.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Minimal hairline track */}
          <div className="my-4">
            <div className="w-full h-1 bg-[#E6E7E9] dark:bg-[#2C2F32] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D84315] transition-all duration-300"
                style={{ width: `${diskPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#5A5E63] dark:text-[#A5A9AE] font-mono pt-2 border-t border-[#CFD2D6] dark:border-[#4D5156]">
            <span>Cap: {diskTotalTb.toFixed(1)} TB</span>
            <span className="text-[#D84315] dark:text-[#FF8F00] group-hover:underline">View 3 pools →</span>
          </div>
        </div>
      </div>

      {/* Spacious Minimalist Telemetry History Chart */}
      <div className="p-5 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#232527] dark:text-[#E6E7E9]">
              System Telemetry History
            </h2>
            <p className="text-[11px] text-[#5A5E63] dark:text-[#A5A9AE] mt-0.5">
              Live continuous utilization over the last 30 intervals
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00B4D8]" />
              <span className="text-[#232527] dark:text-[#E6E7E9]">
                CPU {metrics.cpu.usagePct}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF8F00]" />
              <span className="text-[#232527] dark:text-[#E6E7E9]">
                RAM {memPct.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Clean SVG Canvas */}
        <div className="w-full bg-[#E6E7E9]/60 dark:bg-[#2C2F32] rounded-lg p-2 border border-[#CFD2D6] dark:border-[#4D5156]">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-36"
            preserveAspectRatio="none"
          >
            {/* Subtle horizontal grid lines */}
            <line x1={chartPadding} y1={chartPadding} x2={chartWidth - chartPadding} y2={chartPadding} stroke="currentColor" className="text-[#CFD2D6] dark:text-[#4D5156]" strokeWidth="0.75" />
            <line x1={chartPadding} y1={chartHeight / 2} x2={chartWidth - chartPadding} y2={chartHeight / 2} stroke="currentColor" className="text-[#CFD2D6] dark:text-[#4D5156]" strokeWidth="0.75" strokeDasharray="3 3" />
            <line x1={chartPadding} y1={chartHeight - chartPadding} x2={chartWidth - chartPadding} y2={chartHeight - chartPadding} stroke="currentColor" className="text-[#CFD2D6] dark:text-[#4D5156]" strokeWidth="0.75" />

            {/* Memory Line */}
            {memChartPath && (
              <path
                d={memChartPath}
                fill="none"
                stroke="#FF8F00"
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
                stroke={metrics.cpu.usagePct > 80 ? '#D84315' : '#00B4D8'}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>

          <div className="flex justify-between text-[10px] font-mono text-[#5A5E63] dark:text-[#A5A9AE] px-2 mt-1">
            <span>-60s</span>
            <span>-30s</span>
            <span>-15s</span>
            <span className="text-[#00B4D8] font-semibold">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};
