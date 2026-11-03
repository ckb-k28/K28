import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Copy,
  Save,
  RotateCcw,
  Sliders,
  Layers,
  FileCode,
  Link2,
  Activity,
  ExternalLink,
} from 'lucide-react';
import {
  DynacatLayoutConfig,
  DynacatWidget,
  DynacatWidgetType,
  QuickLink,
  ServerService,
} from '../types/server';
import { generateDynacatYaml, INITIAL_DYNACAT_LAYOUT } from '../data/defaultData';

interface DynacatEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout: DynacatLayoutConfig;
  onUpdateLayout: (newLayout: DynacatLayoutConfig) => void;
  services: ServerService[];
  onAddService: () => void;
  onEditService: (service: ServerService) => void;
  onDeleteService: (serviceId: string) => void;
  quickLinks: QuickLink[];
  onUpdateQuickLinks: (links: QuickLink[]) => void;
}

export const DynacatEditorModal: React.FC<DynacatEditorModalProps> = ({
  isOpen,
  onClose,
  layout,
  onUpdateLayout,
  services,
  onAddService,
  onEditService,
  onDeleteService,
  quickLinks,
  onUpdateQuickLinks,
}) => {
  const [activeTab, setActiveTab] = useState<'widgets' | 'components' | 'services' | 'links' | 'yaml'>('widgets');
  const [yamlText, setYamlText] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedYaml, setCopiedYaml] = useState(false);

  // New Widget Form
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newWidgetType, setNewWidgetType] = useState<DynacatWidgetType>('custom-stat');
  const [newWidgetPrimary, setNewWidgetPrimary] = useState('');
  const [newWidgetTop, setNewWidgetTop] = useState('');
  const [newWidgetBottom, setNewWidgetBottom] = useState('');
  const [newWidgetAccent, setNewWidgetAccent] = useState<'ember' | 'amber' | 'flame'>('amber');

  // New Quick Link Form
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      const generated = generateDynacatYaml(services, quickLinks, layout);
      setYamlText(generated);
    }
  }, [isOpen, services, quickLinks, layout]);

  if (!isOpen) return null;

  const syncToDisk = async (nextLayout: DynacatLayoutConfig, nextLinks = quickLinks) => {
    const generatedYaml = generateDynacatYaml(services, nextLinks, nextLayout);
    setYamlText(generatedYaml);
    try {
      const res = await fetch('/api/dynacat/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yaml: generatedYaml }),
      });
      const data = await res.json();
      if (data.ok) {
        setSyncStatus('Synced to config/dynacat.yaml (Dynacat v3.0.2 hot-reloaded)');
      } else {
        setSyncStatus('Saved to dashboard layout');
      }
    } catch {
      setSyncStatus('Saved to dashboard layout');
    }
    setTimeout(() => setSyncStatus(null), 3500);
  };

  const handleToggleWidget = (widgetId: string) => {
    const updatedWidgets = layout.widgets.map((w) =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    const next = { ...layout, widgets: updatedWidgets };
    onUpdateLayout(next);
    syncToDisk(next);
  };

  const handleUpdateWidgetField = (
    widgetId: string,
    field: keyof DynacatWidget,
    value: string | boolean
  ) => {
    const updatedWidgets = layout.widgets.map((w) =>
      w.id === widgetId ? { ...w, [field]: value } : w
    );
    const next = { ...layout, widgets: updatedWidgets };
    onUpdateLayout(next);
  };

  const handleMoveWidget = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= layout.widgets.length) return;
    const items = [...layout.widgets];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    const next = { ...layout, widgets: items };
    onUpdateLayout(next);
    syncToDisk(next);
  };

  const handleDeleteWidget = (widgetId: string) => {
    const next = {
      ...layout,
      widgets: layout.widgets.filter((w) => w.id !== widgetId),
    };
    onUpdateLayout(next);
    syncToDisk(next);
  };

  const handleAddWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWidgetTitle.trim()) return;
    const newWidget: DynacatWidget = {
      id: `wid-${Date.now()}`,
      type: newWidgetType,
      title: newWidgetTitle.trim(),
      primaryValue: newWidgetPrimary.trim() || 'Active',
      secondaryTop: newWidgetTop.trim() || 'Node 10.0.0.100',
      secondaryBottom: newWidgetBottom.trim() || 'Live',
      accentColor: newWidgetAccent,
      enabled: true,
    };
    const next = { ...layout, widgets: [...layout.widgets, newWidget] };
    onUpdateLayout(next);
    syncToDisk(next);
    setNewWidgetTitle('');
    setNewWidgetPrimary('');
    setNewWidgetTop('');
    setNewWidgetBottom('');
  };

  const handleToggleSection = (sectionId: 'live-widgets' | 'service-columns' | 'host-health' | 'quick-links') => {
    const updatedSections = layout.sections.map((s) =>
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    );
    const next = { ...layout, sections: updatedSections };
    onUpdateLayout(next);
    syncToDisk(next);
  };

  const handleMoveSection = (index: number, direction: -1 | 1) => {
    const sorted = [...layout.sections].sort((a, b) => a.order - b.order);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const [moved] = sorted.splice(index, 1);
    sorted.splice(targetIndex, 0, moved);
    const reindexed = sorted.map((s, idx) => ({ ...s, order: idx }));
    const next = { ...layout, sections: reindexed };
    onUpdateLayout(next);
    syncToDisk(next);
  };

  const handleToggleHostHealth = (key: keyof DynacatLayoutConfig['hostHealth']) => {
    const next = {
      ...layout,
      hostHealth: {
        ...layout.hostHealth,
        [key]: !layout.hostHealth[key],
      },
    };
    onUpdateLayout(next);
    syncToDisk(next);
  };

  const handleAddQuickLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkName.trim() || !newLinkUrl.trim()) return;
    const nextLinks: QuickLink[] = [
      ...quickLinks,
      {
        id: `ql-${Date.now()}`,
        name: newLinkName.trim(),
        url: newLinkUrl.trim(),
      },
    ];
    onUpdateQuickLinks(nextLinks);
    syncToDisk(layout, nextLinks);
    setNewLinkName('');
    setNewLinkUrl('');
  };

  const handleDeleteQuickLink = (linkId: string) => {
    const nextLinks = quickLinks.filter((l) => l.id !== linkId);
    onUpdateQuickLinks(nextLinks);
    syncToDisk(layout, nextLinks);
  };

  const handleSaveRawYaml = async () => {
    try {
      const res = await fetch('/api/dynacat/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yaml: yamlText }),
      });
      const data = await res.json();
      if (data.ok) {
        setSyncStatus('Saved raw YAML directly to config/dynacat.yaml!');
      } else {
        setSyncStatus('Updated YAML configuration');
      }
      onUpdateLayout({ ...layout, customYaml: yamlText });
    } catch {
      onUpdateLayout({ ...layout, customYaml: yamlText });
      setSyncStatus('Updated YAML configuration');
    }
    setTimeout(() => setSyncStatus(null), 3500);
  };

  const handleResetDefaults = () => {
    onUpdateLayout(INITIAL_DYNACAT_LAYOUT);
    syncToDisk(INITIAL_DYNACAT_LAYOUT);
  };

  const sortedSections = [...layout.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9] dark:bg-[#2E3134] shadow-2xl overflow-hidden text-[#232527] dark:text-[#E6E7E9]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF8F00]/15 border border-[#FF8F00]/40 flex items-center justify-center text-[#FF8F00]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold">
                  Dynacat v3.0.2 · Dashboard Widgets & Components Studio
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#00B4D8]/15 text-[#00B4D8] border border-[#00B4D8]/30 rounded-full">
                  Live YAML Sync
                </span>
              </div>
              <p className="text-xs text-[#5A5E63] dark:text-[#A5A9AE]">
                Add, reorder, or customize Dynacat widgets, dashboard components, services, and <code className="font-mono text-[#FF8F00]">config/dynacat.yaml</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#D84315] hover:bg-[#E6E7E9] dark:hover:bg-[#2C2F32] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#CFD2D6] dark:border-[#4D5156] px-6 gap-2 bg-white/60 dark:bg-[#2C2F32] text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('widgets')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'widgets'
                ? 'border-[#FF8F00] text-[#D84315] dark:text-[#FF8F00]'
                : 'border-transparent text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#232527] dark:hover:text-[#E6E7E9]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Dynacat Widgets ({layout.widgets.filter((w) => w.enabled).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('components')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'components'
                ? 'border-[#FF8F00] text-[#D84315] dark:text-[#FF8F00]'
                : 'border-transparent text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#232527] dark:hover:text-[#E6E7E9]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Layout & Host Gauges</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'services'
                ? 'border-[#FF8F00] text-[#D84315] dark:text-[#FF8F00]'
                : 'border-transparent text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#232527] dark:hover:text-[#E6E7E9]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Service Cards ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'links'
                ? 'border-[#FF8F00] text-[#D84315] dark:text-[#FF8F00]'
                : 'border-transparent text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#232527] dark:hover:text-[#E6E7E9]'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Other Links ({quickLinks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('yaml')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'yaml'
                ? 'border-[#00B4D8] text-[#00B4D8]'
                : 'border-transparent text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#232527] dark:hover:text-[#E6E7E9]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>config/dynacat.yaml</span>
          </button>
        </div>

        {/* Status Toast */}
        {syncStatus && (
          <div className="px-6 py-2 bg-[#00B4D8]/15 border-b border-[#00B4D8]/30 text-xs font-mono text-[#00B4D8] flex items-center justify-between">
            <span>✓ {syncStatus}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* TAB 1: DYNACAT WIDGETS */}
          {activeTab === 'widgets' && (
            <div className="space-y-5">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono font-bold uppercase tracking-wider text-[#232527] dark:text-[#E6E7E9]">
                    Configured Dynacat Widgets
                  </h3>
                  <button
                    onClick={() => syncToDisk(layout)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00B4D8] text-[#232527] font-mono font-bold text-[11px] hover:opacity-90 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Sync Widgets to YAML</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {layout.widgets.map((widget, idx) => (
                    <div
                      key={widget.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        widget.enabled
                          ? 'border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40]'
                          : 'border-[#CFD2D6]/60 dark:border-[#4D5156]/50 bg-white/40 dark:bg-[#3A3D40]/40 opacity-65'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={widget.enabled}
                            onChange={() => handleToggleWidget(widget.id)}
                            className="w-4 h-4 accent-[#FF8F00] rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={widget.title}
                            onChange={(e) => handleUpdateWidgetField(widget.id, 'title', e.target.value)}
                            className="font-mono font-bold text-xs px-2 py-1 rounded border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/70 dark:bg-[#2C2F32] text-[#232527] dark:text-[#E6E7E9]"
                            placeholder="Widget Title"
                          />
                          <select
                            value={widget.accentColor}
                            onChange={(e) =>
                              handleUpdateWidgetField(
                                widget.id,
                                'accentColor',
                                e.target.value as 'ember' | 'amber' | 'flame'
                              )
                            }
                            className="font-mono text-[11px] px-2 py-1 rounded border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/70 dark:bg-[#2C2F32] text-[#232527] dark:text-[#E6E7E9]"
                          >
                            <option value="flame">Hete Vlamkern (#00B4D8)</option>
                            <option value="amber">Knisperend Vuur (#FF8F00)</option>
                            <option value="ember">Gloeiende Kolen (#D84315)</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1 self-end sm:self-center">
                          <button
                            onClick={() => handleMoveWidget(idx, -1)}
                            disabled={idx === 0}
                            title="Move widget up"
                            className="p-1 rounded hover:bg-[#E6E7E9] dark:hover:bg-[#2C2F32] disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveWidget(idx, 1)}
                            disabled={idx === layout.widgets.length - 1}
                            title="Move widget down"
                            className="p-1 rounded hover:bg-[#E6E7E9] dark:hover:bg-[#2C2F32] disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteWidget(widget.id)}
                            title="Delete widget"
                            className="p-1 rounded text-[#D84315] hover:bg-[#D84315]/15 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2.5">
                        <div>
                          <label className="block text-[10px] font-mono text-[#5A5E63] dark:text-[#A5A9AE] mb-0.5">
                            Primary Value / Metric
                          </label>
                          <input
                            type="text"
                            value={widget.primaryValue}
                            onChange={(e) =>
                              handleUpdateWidgetField(widget.id, 'primaryValue', e.target.value)
                            }
                            className="w-full font-mono text-xs px-2 py-1 rounded border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/50 dark:bg-[#2C2F32]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-[#5A5E63] dark:text-[#A5A9AE] mb-0.5">
                            Right Label (Top)
                          </label>
                          <input
                            type="text"
                            value={widget.secondaryTop}
                            onChange={(e) =>
                              handleUpdateWidgetField(widget.id, 'secondaryTop', e.target.value)
                            }
                            className="w-full font-mono text-xs px-2 py-1 rounded border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/50 dark:bg-[#2C2F32]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-[#5A5E63] dark:text-[#A5A9AE] mb-0.5">
                            Right Badge (Bottom)
                          </label>
                          <input
                            type="text"
                            value={widget.secondaryBottom}
                            onChange={(e) =>
                              handleUpdateWidgetField(widget.id, 'secondaryBottom', e.target.value)
                            }
                            className="w-full font-mono text-xs px-2 py-1 rounded border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/50 dark:bg-[#2C2F32]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Dynacat Widget Form */}
              <form
                onSubmit={handleAddWidget}
                className="p-4 rounded-xl border border-[#FF8F00]/40 bg-white/90 dark:bg-[#3A3D40] space-y-3"
              >
                <h4 className="font-mono font-bold text-xs text-[#D84315] dark:text-[#FF8F00] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Add New Dynacat Widget</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    required
                    value={newWidgetTitle}
                    onChange={(e) => setNewWidgetTitle(e.target.value)}
                    placeholder="Widget Title (e.g. Prowlarr Indexers)"
                    className="px-2.5 py-1.5 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/70 dark:bg-[#2C2F32] font-mono text-xs"
                  />
                  <select
                    value={newWidgetType}
                    onChange={(e) => setNewWidgetType(e.target.value as DynacatWidgetType)}
                    className="px-2.5 py-1.5 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/70 dark:bg-[#2C2F32] font-mono text-xs"
                  >
                    <option value="custom-stat">Custom Telemetry Widget</option>
                    <option value="adguard-dns">AdGuard DNS Widget</option>
                    <option value="downloads-queue">Downloads Queue Widget</option>
                    <option value="emby-streams">Emby Media Widget</option>
                    <option value="dockhand-containers">Dockhand Containers Widget</option>
                    <option value="system-clock">Homelab Clock Widget</option>
                    <option value="weather">Environment / Thermal Widget</option>
                  </select>
                  <select
                    value={newWidgetAccent}
                    onChange={(e) => setNewWidgetAccent(e.target.value as 'ember' | 'amber' | 'flame')}
                    className="px-2.5 py-1.5 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/70 dark:bg-[#2C2F32] font-mono text-xs"
                  >
                    <option value="amber">Knisperend Vuur (#FF8F00)</option>
                    <option value="ember">Gloeiende Kolen (#D84315)</option>
                    <option value="flame">Hete Vlamkern (#00B4D8)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={newWidgetPrimary}
                    onChange={(e) => setNewWidgetPrimary(e.target.value)}
                    placeholder="Primary Value (e.g. 14 Indexers OK)"
                    className="px-2.5 py-1.5 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/70 dark:bg-[#2C2F32] font-mono text-xs"
                  />
                  <input
                    type="text"
                    value={newWidgetTop}
                    onChange={(e) => setNewWidgetTop(e.target.value)}
                    placeholder="Subtitle Top (e.g. Usenet + Torrents)"
                    className="px-2.5 py-1.5 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/70 dark:bg-[#2C2F32] font-mono text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newWidgetBottom}
                      onChange={(e) => setNewWidgetBottom(e.target.value)}
                      placeholder="Badge (e.g. 100% Healthy)"
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/70 dark:bg-[#2C2F32] font-mono text-xs"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg bg-[#FF8F00] hover:bg-[#e68100] text-[#232527] font-mono font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: LAYOUT & HOST HEALTH COMPONENTS */}
          {activeTab === 'components' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] space-y-3">
                <h3 className="font-mono font-bold uppercase tracking-wider">
                  Dashboard Component Sections (Reorder or Toggle)
                </h3>
                <div className="space-y-2">
                  {sortedSections.map((sec, idx) => (
                    <div
                      key={sec.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/60 dark:bg-[#2C2F32]"
                    >
                      <label className="flex items-center gap-2.5 font-mono font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sec.enabled}
                          onChange={() => handleToggleSection(sec.id)}
                          className="w-4 h-4 accent-[#FF8F00] rounded"
                        />
                        <span>{sec.title}</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveSection(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-white dark:hover:bg-[#3A3D40] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveSection(idx, 1)}
                          disabled={idx === sortedSections.length - 1}
                          className="p-1 rounded hover:bg-white dark:hover:bg-[#3A3D40] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] space-y-3">
                <h3 className="font-mono font-bold uppercase tracking-wider">
                  K28 Host Health Telemetry Gauges
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono">
                  {(
                    [
                      ['showCpu', 'CPU Usage & Core Thermal Gauge'],
                      ['showRam', 'DDR4 Memory Allocation Gauge'],
                      ['showSystemDisk', 'System Disk (/) Capacity Gauge'],
                      ['showVmStorage', 'VM / Container Storage Pool Gauge'],
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2.5 p-3 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/60 dark:bg-[#2C2F32] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={layout.hostHealth[key]}
                        onChange={() => handleToggleHostHealth(key)}
                        className="w-4 h-4 accent-[#FF8F00] rounded"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICE CARDS */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[#5A5E63] dark:text-[#A5A9AE]">
                  Manage services across your 4 Dynacat columns (Infrastructure, Apps, Media, Downloads & Automation).
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onAddService();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF8F00] text-[#232527] font-mono font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40]"
                  >
                    <div className="min-w-0">
                      <div className="font-mono font-bold truncate">
                        {srv.name} <span className="text-[#5A5E63] dark:text-[#A5A9AE]">:{srv.port}</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#FF8F00] truncate">
                        {srv.category} · {srv.dashboardUrl}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          onClose();
                          onEditService(srv);
                        }}
                        className="px-2 py-1 rounded bg-[#E6E7E9] dark:bg-[#2C2F32] hover:border-[#FF8F00] border border-[#CFD2D6] dark:border-[#4D5156] font-mono text-[11px] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteService(srv.id)}
                        className="p-1 text-[#D84315] hover:bg-[#D84315]/15 rounded cursor-pointer"
                        title="Remove service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: QUICK LINKS */}
          {activeTab === 'links' && (
            <div className="space-y-4">
              <form
                onSubmit={handleAddQuickLink}
                className="p-4 rounded-xl border border-[#FF8F00]/40 bg-white/90 dark:bg-[#3A3D40] space-y-3"
              >
                <h4 className="font-mono font-bold text-[#D84315] dark:text-[#FF8F00] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Add Link to "OTHER LINKS"</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    required
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    placeholder="Label (e.g. Proxmox VE)"
                    className="px-2.5 py-1.5 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/70 dark:bg-[#2C2F32] font-mono"
                  />
                  <input
                    type="url"
                    required
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="https://proxmox.bycamiel.nl"
                    className="px-2.5 py-1.5 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/70 dark:bg-[#2C2F32] font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-[#FF8F00] hover:bg-[#e68100] text-[#232527] font-mono font-bold cursor-pointer"
                  >
                    Add Link
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {quickLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40]"
                  >
                    <div className="min-w-0">
                      <div className="font-mono font-bold truncate">{link.name}</div>
                      <div className="text-[10px] font-mono text-[#00B4D8] truncate">{link.url}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteQuickLink(link.id)}
                      className="p-1.5 text-[#D84315] hover:bg-[#D84315]/15 rounded cursor-pointer"
                      title="Delete quick link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LIVE CONFIG/DYNACAT.YAML EDITOR */}
          {activeTab === 'yaml' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-[#232527] dark:text-[#E6E7E9]">
                    config/dynacat.yaml
                  </span>
                  <span className="ml-2 text-[11px] text-[#5A5E63] dark:text-[#A5A9AE]">
                    Mounted at <code className="font-mono">./config:/app/config</code> for Dynacat (:8081)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(yamlText);
                      setCopiedYaml(true);
                      setTimeout(() => setCopiedYaml(false), 2000);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#CFD2D6] dark:border-[#4D5156] bg-white dark:bg-[#3A3D40] font-mono text-[11px] cursor-pointer"
                  >
                    {copiedYaml ? <Check className="w-3.5 h-3.5 text-[#00B4D8]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedYaml ? 'Copied' : 'Copy YAML'}</span>
                  </button>
                  <button
                    onClick={handleSaveRawYaml}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#FF8F00] text-[#232527] font-mono font-bold text-[11px] cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to config/dynacat.yaml</span>
                  </button>
                </div>
              </div>

              <textarea
                value={yamlText}
                onChange={(e) => setYamlText(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full p-4 rounded-xl bg-[#232527] text-[#E6E7E9] font-mono text-xs border border-[#4D5156] focus:outline-none focus:border-[#FF8F00] leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] text-xs font-mono">
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1 text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#D84315] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default Layout</span>
            </button>
            <span className="text-[#CFD2D6] dark:text-[#4D5156]">·</span>
            <a
              href="http://10.0.0.100:8081"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00B4D8] hover:underline flex items-center gap-1"
            >
              <span>Dynacat Container (:8081)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#FF8F00] text-[#232527] font-bold hover:bg-[#e68100] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
