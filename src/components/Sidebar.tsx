import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  Search,
  Plus,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  FolderLock,
  Tv,
  Home,
  Network,
  HardDrive,
  Cpu,
  Layers,
} from 'lucide-react';
import { ServerService, ServiceCategory, ServiceStatus } from '../types/server';
import { getLatencyBadge } from '../utils/formatters';

interface SidebarProps {
  services: ServerService[];
  selectedServiceId: string | null;
  onSelectService: (service: ServerService) => void;
  onAddService: () => void;
  onPingService: (serviceId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  services,
  selectedServiceId,
  onSelectService,
  onAddService,
  onPingService,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'up' | 'warning' | 'down'>('all');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(services.map((s) => s.category)));
    return ['All', ...cats];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchesSearch =
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.port.toString().includes(searchQuery) ||
        srv.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (srv.dockerContainer && srv.dockerContainer.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || srv.category === selectedCategory;
      const matchesStatus = statusFilter === 'all' || srv.status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [services, searchQuery, selectedCategory, statusFilter]);

  // Status counters
  const counts = useMemo(() => {
    const up = services.filter((s) => s.status === 'up').length;
    const warning = services.filter((s) => s.status === 'warning').length;
    const down = services.filter((s) => s.status === 'down').length;
    return { up, warning, down, total: services.length };
  }, [services]);

  const getCategoryIcon = (category: ServiceCategory) => {
    switch (category) {
      case 'Smart Home':
        return <Home className="w-3.5 h-3.5" />;
      case 'Media':
        return <Tv className="w-3.5 h-3.5" />;
      case 'Network & DNS':
        return <Network className="w-3.5 h-3.5" />;
      case 'Storage & Backup':
        return <HardDrive className="w-3.5 h-3.5" />;
      case 'Development':
        return <Cpu className="w-3.5 h-3.5" />;
      case 'Security':
        return <FolderLock className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 h-full">
      {/* Sidebar Header & Summary */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Services ({filteredServices.length})
            </h2>
          </div>
          <button
            onClick={onAddService}
            title="Add new service"
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Minimalist Status Breakdown Dots */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 pb-2.5">
          <button
            onClick={() => setStatusFilter(statusFilter === 'up' ? 'all' : 'up')}
            className={`flex items-center gap-1.5 transition-colors ${statusFilter === 'up' ? 'font-bold text-slate-900 dark:text-slate-100' : 'hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="tabular-nums">{counts.up}</span>
            <span className="text-[10px] text-slate-400 uppercase">Up</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700">·</span>

          <button
            onClick={() => setStatusFilter(statusFilter === 'warning' ? 'all' : 'warning')}
            className={`flex items-center gap-1.5 transition-colors ${statusFilter === 'warning' ? 'font-bold text-slate-900 dark:text-slate-100' : 'hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="tabular-nums">{counts.warning}</span>
            <span className="text-[10px] text-slate-400 uppercase">Degr</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700">·</span>

          <button
            onClick={() => setStatusFilter(statusFilter === 'down' ? 'all' : 'down')}
            className={`flex items-center gap-1.5 transition-colors ${statusFilter === 'down' ? 'font-bold text-slate-900 dark:text-slate-100' : 'hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="tabular-nums">{counts.down}</span>
            <span className="text-[10px] text-slate-400 uppercase">Down</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative mt-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service, port, tag..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ×
            </button>
          )}
        </div>

        {/* Category horizontal scroll tabs */}
        <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'bg-slate-200/70 hover:bg-slate-300/70 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Activity className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No services match filter</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setStatusFilter('all');
              }}
              className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredServices.map((service) => {
            const isSelected = selectedServiceId === service.id;
            const latencyBadge = getLatencyBadge(service.latencyMs);

            return (
              <div
                key={service.id}
                onClick={() => onSelectService(service)}
                className={`group relative flex flex-col p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500/70 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/80'
                }`}
              >
                {/* Top line: Indicator dot + Name + Port + External Link Button */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Color-coded Status Dot */}
                    <span
                      title={`Status: ${service.status.toUpperCase()}`}
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        service.status === 'up'
                          ? 'bg-emerald-500 ring-2 ring-emerald-500/20'
                          : service.status === 'warning'
                          ? 'bg-amber-500 ring-2 ring-amber-500/20 animate-pulse'
                          : 'bg-rose-500 ring-2 ring-rose-500/20 animate-pulse'
                      }`}
                    />

                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {service.name}
                    </span>

                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                      :{service.port}
                    </span>
                  </div>

                  {/* Direct Dashboard Link (Navigates to service dashboard) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPingService(service.id);
                      }}
                      title="Probe / ping service now"
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>

                    <a
                      href={service.dashboardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title={`Open ${service.name} Dashboard ↗`}
                      className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded transition-colors"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                {/* Subtitle: Category icon and label */}
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="text-slate-400">{getCategoryIcon(service.category)}</span>
                  <span>{service.category}</span>
                  {service.dockerContainer && (
                    <>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        {service.dockerContainer}
                      </span>
                    </>
                  )}
                </div>

                {/* Bottom line: Uptime status & Latency indicator */}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/70 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Uptime:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                      {service.uptimePct.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <span className="text-slate-400">Ping:</span>
                    <span className={`font-semibold tabular-nums ${latencyBadge.color}`}>
                      {latencyBadge.text}
                    </span>
                  </div>
                </div>

                {/* Mini 24h health blocks */}
                <div className="grid grid-cols-24 gap-[2px] mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/50">
                  {service.history.slice(-24).map((h, idx) => (
                    <span
                      key={idx}
                      title={`${new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${h.status} (${h.latency}ms)`}
                      className={`h-1.5 rounded-[1px] transition-colors ${
                        h.status === 'up'
                          ? 'bg-emerald-500/70 hover:bg-emerald-400'
                          : h.status === 'warning'
                          ? 'bg-amber-500 hover:bg-amber-400'
                          : 'bg-rose-500 hover:bg-rose-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer Quick Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Health check interval:</span>
          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">10s</span>
        </div>
        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">ALL PROBES OK</span>
      </div>
    </aside>
  );
};
