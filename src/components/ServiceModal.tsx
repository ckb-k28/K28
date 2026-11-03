import React, { useState, useEffect } from 'react';
import { X, Save, Layers, Globe, Shield, Trash2, Terminal } from 'lucide-react';
import { ServerService, ServiceCategory, ServiceStatus } from '../types/server';
import { getServiceBrandIcon } from './ServiceIcons';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ServerService) => void;
  onDelete?: (serviceId: string) => void;
  onOpenDetails?: (service: ServerService) => void;
  serviceToEdit?: ServerService | null;
  serverIp: string;
}

const CATEGORIES: ServiceCategory[] = [
  'Infrastructure',
  'Apps',
  'Media',
  'Downloads & Automation',
  'Smart Home',
  'Network & DNS',
  'Storage & Backup',
  'Development',
  'Security',
  'Other',
];

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  onOpenDetails,
  serviceToEdit,
  serverIp,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Smart Home');
  const [port, setPort] = useState<number>(8080);
  const [dashboardUrl, setDashboardUrl] = useState('');
  const [description, setDescription] = useState('');
  const [dockerContainer, setDockerContainer] = useState('');
  const [sslEnabled, setSslEnabled] = useState(false);
  const [internalIp, setInternalIp] = useState(serverIp);

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name);
      setCategory(serviceToEdit.category);
      setPort(serviceToEdit.port);
      setDashboardUrl(serviceToEdit.dashboardUrl);
      setDescription(serviceToEdit.description);
      setDockerContainer(serviceToEdit.dockerContainer || '');
      setSslEnabled(!!serviceToEdit.sslEnabled);
      setInternalIp(serviceToEdit.internalIp || serverIp);
    } else {
      setName('');
      setCategory('Smart Home');
      setPort(8123);
      setDashboardUrl(`http://${serverIp}:8123`);
      setDescription('');
      setDockerContainer('');
      setSslEnabled(false);
      setInternalIp(serverIp);
    }
  }, [serviceToEdit, isOpen, serverIp]);

  const handlePortChange = (newPort: number) => {
    setPort(newPort);
    if (!serviceToEdit || dashboardUrl.includes(serverIp)) {
      const proto = sslEnabled ? 'https' : 'http';
      setDashboardUrl(`${proto}://${internalIp}:${newPort}`);
    }
  };

  const handleSslToggle = (checked: boolean) => {
    setSslEnabled(checked);
    const proto = checked ? 'https' : 'http';
    if (!serviceToEdit || dashboardUrl.includes(serverIp)) {
      setDashboardUrl(`${proto}://${internalIp}:${port}`);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalService: ServerService = {
      id: serviceToEdit ? serviceToEdit.id : `srv-${Date.now()}`,
      name: name.trim(),
      category,
      port: Number(port),
      url: dashboardUrl.trim() || `http://${internalIp}:${port}`,
      dashboardUrl: dashboardUrl.trim() || `http://${internalIp}:${port}`,
      status: serviceToEdit ? serviceToEdit.status : 'up',
      uptimePct: serviceToEdit ? serviceToEdit.uptimePct : 100.0,
      latencyMs: serviceToEdit ? serviceToEdit.latencyMs : 14,
      lastChecked: Date.now(),
      description: description.trim(),
      dockerContainer: dockerContainer.trim() || undefined,
      internalIp: internalIp.trim(),
      sslEnabled,
      history: serviceToEdit
        ? serviceToEdit.history
        : Array.from({ length: 24 }).map((_, i) => ({
            timestamp: Date.now() - (23 - i) * 3600000,
            latency: Math.floor(10 + Math.random() * 8),
            status: 'up' as ServiceStatus,
          })),
    };

    onSave(finalService);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9] dark:bg-[#2E3134] shadow-2xl overflow-hidden text-[#232527] dark:text-[#E6E7E9]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40]">
          <div className="flex items-center gap-3">
            {serviceToEdit ? (
              getServiceBrandIcon(name || serviceToEdit.name, category)
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#FF8F00]/15 text-[#FF8F00] border border-[#FF8F00]/40 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="text-sm font-mono font-bold text-[#232527] dark:text-[#E6E7E9]">
                {serviceToEdit ? `Edit Service · ${serviceToEdit.name}` : 'Add New Home Server Service'}
              </h2>
              <p className="text-xs text-[#5A5E63] dark:text-[#A5A9AE]">
                Configure container name, port number, and target URL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#D84315] rounded-lg hover:bg-[#E6E7E9] dark:hover:bg-[#2C2F32] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Service Name */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#232527] dark:text-[#E6E7E9] mb-1">
              Service Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emby, Radarr, AdGuard"
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-white dark:bg-[#3A3D40] text-[#232527] dark:text-[#E6E7E9] focus:outline-none focus:ring-1 focus:ring-[#FF8F00] focus:border-[#FF8F00]"
            />
          </div>

          {/* Category & Port */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-[#232527] dark:text-[#E6E7E9] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-white dark:bg-[#3A3D40] text-[#232527] dark:text-[#E6E7E9] focus:outline-none focus:ring-1 focus:ring-[#FF8F00]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#232527] dark:text-[#E6E7E9] mb-1">
                Port Number *
              </label>
              <input
                type="number"
                required
                min={1}
                max={65535}
                value={port}
                onChange={(e) => handlePortChange(Number(e.target.value))}
                placeholder="8080"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-white dark:bg-[#3A3D40] text-[#232527] dark:text-[#E6E7E9] focus:outline-none focus:ring-1 focus:ring-[#FF8F00]"
              />
            </div>
          </div>

          {/* Dashboard URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono font-bold text-[#232527] dark:text-[#E6E7E9]">
                Subdomain / Dashboard URL *
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-[#5A5E63] dark:text-[#A5A9AE] cursor-pointer">
                <input
                  type="checkbox"
                  checked={sslEnabled}
                  onChange={(e) => handleSslToggle(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#FF8F00] rounded"
                />
                <Shield className="w-3 h-3 text-[#00B4D8]" />
                <span>HTTPS / SSL</span>
              </label>
            </div>
            <div className="relative">
              <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5E63] dark:text-[#A5A9AE]" />
              <input
                type="url"
                required
                value={dashboardUrl}
                onChange={(e) => setDashboardUrl(e.target.value)}
                placeholder="https://emby.bycamiel.nl"
                className="w-full pl-8 pr-3 py-2 text-xs font-mono rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-white dark:bg-[#3A3D40] text-[#232527] dark:text-[#E6E7E9] focus:outline-none focus:ring-1 focus:ring-[#FF8F00]"
              />
            </div>
          </div>

          {/* Docker Container Name & IP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-[#232527] dark:text-[#E6E7E9] mb-1">
                Docker Container Name
              </label>
              <input
                type="text"
                value={dockerContainer}
                onChange={(e) => setDockerContainer(e.target.value)}
                placeholder="e.g. emby"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-white dark:bg-[#3A3D40] text-[#232527] dark:text-[#E6E7E9] focus:outline-none focus:ring-1 focus:ring-[#FF8F00]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#232527] dark:text-[#E6E7E9] mb-1">
                Host / LAN IP
              </label>
              <input
                type="text"
                value={internalIp}
                onChange={(e) => setInternalIp(e.target.value)}
                placeholder="10.0.0.100"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-white dark:bg-[#3A3D40] text-[#232527] dark:text-[#E6E7E9] focus:outline-none focus:ring-1 focus:ring-[#FF8F00]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#232527] dark:text-[#E6E7E9] mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Media streaming server on K28"
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-white dark:bg-[#3A3D40] text-[#232527] dark:text-[#E6E7E9] focus:outline-none focus:ring-1 focus:ring-[#FF8F00] resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#CFD2D6] dark:border-[#4D5156]">
            <div className="flex items-center gap-2">
              {serviceToEdit && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(serviceToEdit.id);
                    onClose();
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-semibold text-[#D84315] hover:bg-[#D84315]/15 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
              {serviceToEdit && onOpenDetails && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDetails(serviceToEdit);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-semibold text-[#00B4D8] bg-[#00B4D8]/10 hover:bg-[#00B4D8]/20 border border-[#00B4D8]/30 rounded-lg transition-colors cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Container Controls</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-mono font-semibold text-[#5A5E63] dark:text-[#A5A9AE] hover:bg-white/60 dark:hover:bg-[#3A3D40] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-bold text-[#232527] bg-[#FF8F00] hover:bg-[#e68100] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{serviceToEdit ? 'Save Changes' : 'Add Service'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
