import React, { useState } from 'react';
import {
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { ServerService, ServiceCategory, ServiceStatus } from '../types/server';
import { getStatusColor, getLatencyBadge } from '../utils/formatters';

interface ServicesTableViewProps {
  services: ServerService[];
  onSelectService: (service: ServerService) => void;
  onAddService: () => void;
  onPingService: (serviceId: string) => void;
  onPingAll: () => void;
}

export const ServicesTableView: React.FC<ServicesTableViewProps> = ({
  services,
  onSelectService,
  onAddService,
  onPingService,
  onPingAll,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [isPingingAll, setIsPingingAll] = useState(false);

  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category)))];

  const filtered = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.port.toString().includes(search) ||
      (s.dockerContainer && s.dockerContainer.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === 'All' || s.category === category;
    const matchesStatus = status === 'All' || s.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handlePingAllClick = () => {
    setIsPingingAll(true);
    onPingAll();
    setTimeout(() => setIsPingingAll(false), 800);
  };

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Monitored Services Directory ({services.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full inventory of running containers, ports, uptime records, and direct dashboard URLs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePingAllClick}
            disabled={isPingingAll}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPingingAll ? 'animate-spin' : ''}`} />
            <span>Ping All Services</span>
          </button>

          <button
            onClick={onAddService}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by service name, container, or port..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="All">Status: All</option>
            <option value="up">Operational (Up)</option>
            <option value="warning">Degraded</option>
            <option value="down">Offline (Down)</option>
          </select>
        </div>
      </div>

      {/* Main High-Density Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Service & Container</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Port / Endpoint</th>
                <th className="py-3 px-4">30d Uptime</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4 text-right">Dashboard Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((service) => {
                const statusStyle = getStatusColor(service.status);
                const latencyBadge = getLatencyBadge(service.latencyMs);

                return (
                  <tr
                    key={service.id}
                    onClick={() => onSelectService(service)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    {/* Service Name & Container */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusStyle.dot}`} />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {service.name}
                          </div>
                          {service.dockerContainer && (
                            <div className="font-mono text-[11px] text-slate-400">
                              {service.dockerContainer}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {service.category}
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${statusStyle.badgeBg} ${statusStyle.badgeText}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                        {statusStyle.label}
                      </span>
                    </td>

                    {/* Port & Endpoint */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      :{service.port}
                      {service.sslEnabled && (
                        <span className="ml-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-sans">
                          (TLS)
                        </span>
                      )}
                    </td>

                    {/* Uptime */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                      {service.uptimePct.toFixed(2)}%
                    </td>

                    {/* Latency */}
                    <td className="py-3.5 px-4 font-mono tabular-nums">
                      <span className={`font-semibold ${latencyBadge.color}`}>
                        {latencyBadge.text}
                      </span>
                    </td>

                    {/* Dashboard Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onPingService(service.id)}
                          title="Ping now"
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={service.dashboardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Open ${service.name} in new tab`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded-md transition-colors"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
