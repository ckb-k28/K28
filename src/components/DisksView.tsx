import React from 'react';
import { HardDrive, ShieldCheck, Database, Thermometer, ArrowDown, ArrowUp } from 'lucide-react';
import { DiskVolume } from '../types/server';
import { formatSpeed } from '../utils/formatters';

interface DisksViewProps {
  disks: DiskVolume[];
}

export const DisksView: React.FC<DisksViewProps> = ({ disks }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#D84315]" />
            <h2 className="text-base font-bold text-[#232527] dark:text-[#E6E7E9]">
              Storage Volumes & ZFS Pools
            </h2>
          </div>
          <p className="text-xs text-[#5A5E63] dark:text-[#A5A9AE] mt-0.5">
            Real-time pool capacity, I/O bandwidth, SMART drive telemetry, and mount points
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-[#00B4D8] bg-[#00B4D8]/10 border border-[#00B4D8]/30 rounded-lg">
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
              className="p-5 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#D84315]/15 text-[#D84315] dark:text-[#FF8F00] border border-[#D84315]/30">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#232527] dark:text-[#E6E7E9]">
                        {disk.name}
                      </h3>
                      <div className="font-mono text-[11px] text-[#5A5E63] dark:text-[#A5A9AE]">
                        {disk.mountPoint} · {disk.filesystem}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-[#232527] dark:text-[#E6E7E9] tabular-nums">
                    {pct.toFixed(1)}%
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-[#E6E7E9] dark:bg-[#2C2F32] overflow-hidden my-3">
                  <div
                    className={`h-full transition-all duration-300 ${
                      pct > 85 ? 'bg-[#D84315]' : pct > 65 ? 'bg-[#FF8F00]' : 'bg-[#00B4D8]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Storage breakdown numbers */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#E6E7E9]/70 dark:bg-[#2C2F32] border border-[#CFD2D6]/60 dark:border-[#4D5156]/60 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#5A5E63] dark:text-[#A5A9AE] uppercase block">Used</span>
                    <strong className="text-[#232527] dark:text-[#E6E7E9]">
                      {usedGb > 1000 ? `${(usedGb / 1024).toFixed(1)} TB` : `${usedGb.toFixed(0)} GB`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5A5E63] dark:text-[#A5A9AE] uppercase block">Free</span>
                    <strong className="text-[#00B4D8]">
                      {freeGb > 1000 ? `${(freeGb / 1024).toFixed(1)} TB` : `${freeGb.toFixed(0)} GB`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5A5E63] dark:text-[#A5A9AE] uppercase block">Total</span>
                    <strong className="text-[#232527] dark:text-[#E6E7E9]">
                      {totalGb > 1000 ? `${(totalGb / 1024).toFixed(0)} TB` : `${totalGb.toFixed(0)} GB`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* I/O Speeds and Thermals */}
              <div className="pt-3 border-t border-[#CFD2D6] dark:border-[#4D5156] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3 text-[#5A5E63] dark:text-[#A5A9AE]">
                  <div className="flex items-center gap-1">
                    <ArrowDown className="w-3 h-3 text-[#00B4D8]" />
                    <span>R: {formatSpeed(disk.readSpeedBytes)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowUp className="w-3 h-3 text-[#FF8F00]" />
                    <span>W: {formatSpeed(disk.writeSpeedBytes)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#5A5E63] dark:text-[#A5A9AE]">
                  <Thermometer className="w-3 h-3 text-[#D84315]" />
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
