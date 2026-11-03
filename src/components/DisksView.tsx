import React from 'react';
import { HardDrive, ShieldCheck, Database, RefreshCw, Thermometer, ArrowDown, ArrowUp } from 'lucide-react';
import { DiskVolume } from '../types/server';
import { formatBytes, formatSpeed } from '../utils/formatters';

interface DisksViewProps {
  disks: DiskVolume[];
}

export const DisksView: React.FC<DisksViewProps> = ({ disks }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Storage Volumes & ZFS Pools
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time pool capacity, I/O bandwidth, SMART drive telemetry, and mount points
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
            ZFS HEALTH: ONLINE (NO FAULTS)
          </span>
        </div>
      </div>

      {/* Disks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {disks.map((disk) => {
          const usedGb = disk.usedBytes / (1024 * 1024 * 1024);
          const totalGb = disk.totalBytes / (1024 * 1024 * 1024);
          const freeGb = totalGb - usedGb;
          const pct = (disk.usedBytes / disk.totalBytes) * 100;

          return (
            <div
              key={disk.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {disk.name}
                      </h3>
                      <div className="font-mono text-[11px] text-slate-500">
                        {disk.mountPoint} · {disk.filesystem}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {pct.toFixed(1)}%
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden my-3">
                  <div
                    className={`h-full transition-all duration-300 ${
                      pct > 88 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-purple-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Storage breakdown numbers */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Used</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {usedGb > 1000 ? `${(usedGb / 1024).toFixed(1)} TB` : `${usedGb.toFixed(0)} GB`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Free</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {freeGb > 1000 ? `${(freeGb / 1024).toFixed(1)} TB` : `${freeGb.toFixed(0)} GB`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Total</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {totalGb > 1000 ? `${(totalGb / 1024).toFixed(0)} TB` : `${totalGb.toFixed(0)} GB`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* I/O Speeds and Thermals */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <ArrowDown className="w-3 h-3 text-emerald-500" />
                    <span>R: {formatSpeed(disk.readSpeedBytes)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowUp className="w-3 h-3 text-blue-500" />
                    <span>W: {formatSpeed(disk.writeSpeedBytes)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-500">
                  <Thermometer className="w-3 h-3 text-amber-500" />
                  <span>{disk.tempC}°C</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
