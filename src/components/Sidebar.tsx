import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  Search,
  Plus,
  Activity,
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
import { ServerService, ServiceCategory } from '../types/server';
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
    <aside className="w-full lg:w-80 shrink-0 flex flex-col border-r border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/80 dark:bg-[#2E3134] h-full">
      {/* Sidebar Header & Summary */}
      <div className="p-4 border-b border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#232527] dark:text-[#E6E7E9]">
              Services ({filteredServices.length})
            </h2>
          </div>
          <button
            onClick={onAddService}
            title="Add new service"
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-[#D84315] dark:text-[#FF8F00] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Minimalist Status Breakdown Dots */}
        <div className="flex items-center gap-3 text-xs font-mono text-[#5A5E63] dark:text-[#A5A9AE] pb-2.5">
          <button
            onClick={() => setStatusFilter(statusFilter === 'up' ? 'all' : 'up')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              statusFilter === 'up' ? 'font-bold text-[#232527] dark:text-[#E6E7E9]' : 'hover:text-[#232527] dark:hover:text-[#E6E7E9]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00B4D8]" />
            <span className="tabular-nums">{counts.up}</span>
            <span className="text-[10px] text-[#5A5E63] dark:text-[#A5A9AE] uppercase">Up</span>
          </button>

          <span className="text-[#CFD2D6] dark:text-[#4D5156]">·</span>

          <button
            onClick={() => setStatusFilter(statusFilter === 'warning' ? 'all' : 'warning')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              statusFilter === 'warning' ? 'font-bold text-[#232527] dark:text-[#E6E7E9]' : 'hover:text-[#232527] dark:hover:text-[#E6E7E9]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF8F00]" />
            <span className="tabular-nums">{counts.warning}</span>
            <span className="text-[10px] text-[#5A5E63] dark:text-[#A5A9AE] uppercase">Degr</span>
          </button>

          <span className="text-[#CFD2D6] dark:text-[#4D5156]">·</span>

          <button
            onClick={() => setStatusFilter(statusFilter === 'down' ? 'all' : 'down')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              statusFilter === 'down' ? 'font-bold text-[#232527] dark:text-[#E6E7E9]' : 'hover:text-[#232527] dark:hover:text-[#E6E7E9]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#D84315]" />
            <span className="tabular-nums">{counts.down}</span>
            <span className="text-[10px] text-[#5A5E63] dark:text-[#A5A9AE] uppercase">Down</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative mt-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5E63] dark:text-[#A5A9AE]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service, port, tag..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/70 dark:bg-[#2C2F32] text-[#232527] dark:text-[#E6E7E9] placeholder-[#5A5E63] dark:placeholder-[#A5A9AE] focus:outline-none focus:ring-1 focus:ring-[#FF8F00] focus:border-[#FF8F00] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#232527] dark:hover:text-[#E6E7E9]"
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
              className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#FF8F00] text-[#232527] font-bold'
                  : 'bg-[#E6E7E9] hover:bg-[#CFD2D6] dark:bg-[#2C2F32] dark:hover:bg-[#43474B] text-[#5A5E63] dark:text-[#A5A9AE]'
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
            <Activity className="w-8 h-8 text-[#CFD2D6] dark:text-[#4D5156] mx-auto mb-2" />
            <p className="text-xs font-medium text-[#5A5E63] dark:text-[#A5A9AE]">No services match filter</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setStatusFilter('all');
              }}
              className="mt-2 text-xs text-[#D84315] dark:text-[#FF8F00] hover:underline cursor-pointer"
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
                    ? 'border-[#FF8F00] bg-white dark:bg-[#3A3D40] shadow-sm ring-1 ring-[#FF8F00]/30'
                    : 'border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] hover:border-[#FF8F00]/50 hover:bg-white dark:hover:bg-[#43474B]'
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
                          ? 'bg-[#00B4D8] ring-2 ring-[#00B4D8]/20'
                          : service.status === 'warning'
                          ? 'bg-[#FF8F00] ring-2 ring-[#FF8F00]/20 animate-pulse'
                          : 'bg-[#D84315] ring-2 ring-[#D84315]/20 animate-pulse'
                      }`}
                    />

                    <span className="text-xs font-bold text-[#232527] dark:text-[#E6E7E9] truncate">
                      {service.name}
                    </span>

                    <span className="font-mono text-[10px] text-[#5A5E63] dark:text-[#A5A9AE] shrink-0">
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
                      className="p-1 text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#232527] dark:hover:text-[#E6E7E9] hover:bg-[#E6E7E9] dark:hover:bg-[#2C2F32] rounded transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>

                    <a
                      href={service.dashboardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title={`Open ${service.name} Dashboard ↗`}
                      className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-semibold text-[#D84315] dark:text-[#FF8F00] bg-[#FF8F00]/10 hover:bg-[#FF8F00]/20 border border-[#FF8F00]/30 rounded transition-colors"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                {/* Subtitle: Category icon and label */}
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#5A5E63] dark:text-[#A5A9AE]">
                  <span className="text-[#FF8F00]">{getCategoryIcon(service.category)}</span>
                  <span>{service.category}</span>
                  {service.dockerContainer && (
                    <>
                      <span aria-hidden="true" className="text-[#CFD2D6] dark:text-[#4D5156]">·</span>
                      <span className="font-mono text-[10px] text-[#5A5E63] dark:text-[#A5A9AE] truncate">
                        {service.dockerContainer}
                      </span>
                    </>
                  )}
                </div>

                {/* Bottom line: Uptime status & Latency indicator */}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#CFD2D6] dark:border-[#4D5156] text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#5A5E63] dark:text-[#A5A9AE]">Uptime:</span>
                    <span className="font-mono font-semibold text-[#232527] dark:text-[#E6E7E9] tabular-nums">
                      {service.uptimePct.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <span className="text-[#5A5E63] dark:text-[#A5A9AE]">Ping:</span>
                    <span className={`font-semibold tabular-nums ${latencyBadge.color}`}>
                      {latencyBadge.text}
                    </span>
                  </div>
                </div>

                {/* Mini 24h health blocks */}
                <div className="grid grid-cols-24 gap-[2px] mt-2 pt-1 border-t border-[#CFD2D6]/60 dark:border-[#4D5156]/60">
                  {service.history.slice(-24).map((h, idx) => (
                    <span
                      key={idx}
                      title={`${new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${h.status} (${h.latency}ms)`}
                      className={`h-1.5 rounded-[1px] transition-colors ${
                        h.status === 'up'
                          ? 'bg-[#00B4D8]/80 hover:bg-[#00B4D8]'
                          : h.status === 'warning'
                          ? 'bg-[#FF8F00] hover:bg-[#FF8F00]/80'
                          : 'bg-[#D84315] hover:bg-[#D84315]/80'
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
      <div className="p-3 border-t border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] text-[11px] text-[#5A5E63] dark:text-[#A5A9AE] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#FF8F00]" />
          <span>Health check interval:</span>
          <span className="font-mono font-semibold text-[#232527] dark:text-[#E6E7E9]">10s</span>
        </div>
        <span className="font-mono text-[#00B4D8] font-semibold">ALL PROBES OK</span>
      </div>
    </aside>
  );
};
