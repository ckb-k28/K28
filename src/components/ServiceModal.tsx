import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Layers, Globe, Shield, Activity } from 'lucide-react';
import { ServerService, ServiceCategory, ServiceStatus } from '../types/server';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ServerService) => void;
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

  // Auto-update dashboard URL when port or IP or SSL changes if user hasn't heavily customized
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {serviceToEdit ? 'Edit Monitored Service' : 'Add New Home Server Service'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register web UI, container port, and dashboard link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Service Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jellyfin, Home Assistant, Pi-hole"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Port */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
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
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Dashboard URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Dashboard URL (Target for Direct Link) *
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sslEnabled}
                  onChange={(e) => handleSslToggle(e.target.checked)}
                  className="w-3.5 h-3.5 accent-emerald-500 rounded"
                />
                <Shield className="w-3 h-3 text-emerald-500" />
                <span>HTTPS / SSL</span>
              </label>
            </div>
            <div className="relative">
              <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                required
                value={dashboardUrl}
                onChange={(e) => setDashboardUrl(e.target.value)}
                placeholder="http://192.168.1.120:8123"
                className="w-full pl-8 pr-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              This link is opened when clicking the direct link button in the sidebar or service details.
            </p>
          </div>

          {/* Docker Container Name & IP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Docker Container Name (optional)
              </label>
              <input
                type="text"
                value={dockerContainer}
                onChange={(e) => setDockerContainer(e.target.value)}
                placeholder="e.g. pihole-primary"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Host / Internal IP
              </label>
              <input
                type="text"
                value={internalIp}
                onChange={(e) => setInternalIp(e.target.value)}
                placeholder="192.168.1.120"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. DNS sinkhole with 1.4M ad domains blocked"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{serviceToEdit ? 'Save Changes' : 'Add Service'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
