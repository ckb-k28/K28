import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Plus,
  Moon,
  Sun,
  Menu,
  X,
  Container,
  QrCode,
  Tag,
  Globe,
  ExternalLink,
  Sliders,
  Edit3,
} from 'lucide-react';
import { APP_VERSION } from '../version';
import { VersionModal } from './VersionModal';
import { KolenkachelIcon } from './KolenkachelIcon';

interface HeaderProps {
  activeTab: 'home' | 'sidebar' | 'feeds' | 'mobile';
  setActiveTab: (tab: 'home' | 'sidebar' | 'feeds' | 'mobile') => void;
  onAddService: () => void;
  onOpenMobileModal: () => void;
  onOpenDockerModal: () => void;
  onOpenDynacatEditor: () => void;
  isDynacatEditMode: boolean;
  onToggleDynacatEditMode: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  unreadAlertCount: number;
  linkMode: 'lan' | 'subdomain';
  onToggleLinkMode: () => void;
  onOpenVersionModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onAddService,
  onOpenMobileModal,
  onOpenDockerModal,
  onOpenDynacatEditor,
  isDynacatEditMode,
  onToggleDynacatEditMode,
  isDark,
  toggleTheme,
  unreadAlertCount,
  linkMode,
  onToggleLinkMode,
  onOpenVersionModal,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenVersion = () => {
    setIsDrawerOpen(false);
    if (onOpenVersionModal) {
      onOpenVersionModal();
    } else {
      setIsVersionModalOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/95 dark:bg-[#3A3D40]/95 backdrop-blur-md transition-colors">
        {/* Zone 1: Kolenkachel brand icon & wordmark + Nav tabs */}
        <div className="flex items-center gap-6 shrink-0">
          {/* Kolenkachel Stove Logo Squircle & Title */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#3A3D40] dark:bg-[#2C2F32] border border-[#4D5156] flex items-center justify-center group-hover:border-[#FF8F00] transition-colors shadow-xs shrink-0 p-1">
              <KolenkachelIcon className="w-5 h-5 transition-transform group-hover:scale-105" />
            </div>
            <div className="flex items-center">
              <span className="font-mono font-bold text-sm text-[#232527] dark:text-[#E6E7E9] tracking-tight group-hover:text-[#FF8F00] transition-colors leading-tight">
                K28 - Kolenkachel
              </span>
            </div>
          </div>

          {/* Clean Tabs with Knisperend Vuur (#FF8F00) & Gloeiende Kolen (#D84315) Underline */}
          <nav className="flex items-center gap-5 text-xs font-mono font-medium">
            <button
              onClick={() => setActiveTab('home')}
              className={`pb-1 transition-colors relative cursor-pointer ${
                activeTab === 'home'
                  ? 'text-[#232527] dark:text-[#E6E7E9] font-bold'
                  : 'text-slate-500 dark:text-[#E6E7E9]/60 hover:text-[#D84315] dark:hover:text-[#FF8F00]'
              }`}
            >
              <span>Home</span>
              {activeTab === 'home' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D84315] to-[#FF8F00] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('feeds')}
              className={`pb-1 transition-colors relative flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'feeds'
                  ? 'text-[#232527] dark:text-[#E6E7E9] font-bold'
                  : 'text-slate-500 dark:text-[#E6E7E9]/60 hover:text-[#D84315] dark:hover:text-[#FF8F00]'
              }`}
            >
              <span>Feeds & Alerts</span>
              {unreadAlertCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#D84315]" />
              )}
              {activeTab === 'feeds' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D84315] to-[#FF8F00] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('sidebar')}
              className={`pb-1 transition-colors relative flex items-center gap-1 cursor-pointer ${
                activeTab === 'sidebar'
                  ? 'text-[#232527] dark:text-[#E6E7E9] font-bold'
                  : 'text-slate-500 dark:text-[#E6E7E9]/60 hover:text-[#D84315] dark:hover:text-[#FF8F00]'
              }`}
            >
              <span>Detailed Telemetry</span>
              {activeTab === 'sidebar' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D84315] to-[#FF8F00] rounded-full" />
              )}
            </button>
          </nav>
        </div>

        {/* Zone 2: Hamburger Menu Button to open Utility Sidebar */}
        <div className="flex items-center gap-2 shrink-0">
          {isDynacatEditMode && (
            <button
              onClick={onToggleDynacatEditMode}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FF8F00] text-[#232527] text-xs font-mono font-bold shadow-xs cursor-pointer"
              title="Exit Dynacat Edit Mode"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Done Editing</span>
            </button>
          )}

          <button
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu sidebar"
            title="Open K28 Controls & Actions Sidebar"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-white/80 dark:bg-[#2C2F32] hover:border-[#FF8F00] dark:hover:border-[#FF8F00] text-[#232527] dark:text-[#E6E7E9] transition-all cursor-pointer shadow-xs"
          >
            <Menu className="w-4 h-4 text-[#FF8F00]" />
            <span className="text-xs font-mono font-semibold hidden sm:inline">Menu</span>
          </button>
        </div>

        {/* Version & Build Modal fallback */}
        <VersionModal
          isOpen={isVersionModalOpen}
          onClose={() => setIsVersionModalOpen(false)}
        />
      </header>

      {/* Slide-out Hamburger Sidebar Drawer containing the moved Header utility actions & dynacat v3.0.2 component */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Sidebar Panel */}
          <aside className="relative z-10 w-80 max-w-[85vw] h-full bg-[#E6E7E9] dark:bg-[#3A3D40] border-l border-[#CFD2D6] dark:border-[#4D5156] shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Top section */}
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#CFD2D6] dark:border-[#4D5156] bg-white/50 dark:bg-[#2C2F32]/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#3A3D40] dark:bg-[#232527] border border-[#4D5156] flex items-center justify-center p-1">
                    <KolenkachelIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-[#232527] dark:text-[#E6E7E9]">
                      K28 Controls & Actions
                    </h3>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-[#E6E7E9]/60">
                      Node 10.0.0.100 · bycamiel.nl
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Close sidebar"
                  className="p-1.5 rounded-lg text-slate-500 dark:text-[#E6E7E9]/70 hover:text-[#D84315] dark:hover:text-[#FF8F00] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Moved Utility Controls List */}
              <div className="p-4 space-y-3 font-mono text-xs">
                {/* 1. Moved dynacat v3.0.2 Component + Dashboard Widget & Component Editor */}
                <div className="p-3 rounded-xl border border-[#FF8F00]/40 bg-white/90 dark:bg-[#2C2F32] space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF8F00] animate-pulse" />
                      <span className="font-bold text-[#232527] dark:text-[#E6E7E9]">
                        dynacat v3.0.2
                      </span>
                    </div>
                    <a
                      href="https://github.com/Panonim/dynacat/releases/latest"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open Panonim/dynacat v3.0.2 on GitHub"
                      className="hover:text-[#FF8F00] transition-colors flex items-center gap-1 text-[10px] text-[#00B4D8] font-semibold"
                    >
                      <span>Release</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <p className="text-[10px] text-[#5A5E63] dark:text-[#A5A9AE] leading-relaxed font-sans">
                    Customize widgets, components, service columns, and sync live with <code className="font-mono text-[#FF8F00]">config/dynacat.yaml</code> (:8081).
                  </p>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        setActiveTab('home');
                        onOpenDynacatEditor();
                      }}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#FF8F00] hover:bg-[#e68100] text-[#232527] font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Widgets & YAML</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        setActiveTab('home');
                        onToggleDynacatEditMode();
                      }}
                      className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                        isDynacatEditMode
                          ? 'bg-[#D84315] text-white border-[#D84315]'
                          : 'bg-[#E6E7E9] dark:bg-[#3A3D40] text-[#232527] dark:text-[#E6E7E9] border-[#CFD2D6] dark:border-[#4D5156] hover:border-[#FF8F00]'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isDynacatEditMode ? 'Exit Edit' : 'Inline Edit'}</span>
                    </button>
                  </div>

                  <a
                    href="http://10.0.0.100:8081"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#E6E7E9]/70 dark:bg-[#3A3D40] border border-[#CFD2D6] dark:border-[#4D5156] hover:border-[#00B4D8] text-[10px] text-[#5A5E63] dark:text-[#E6E7E9]/80 transition-colors"
                  >
                    <span>Open Live Dynacat (:8081)</span>
                    <ExternalLink className="w-3 h-3 text-[#00B4D8]" />
                  </a>
                </div>

                {/* 2. URL Routing Mode Quick Switcher */}
                <div className="p-3 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/80 dark:bg-[#2C2F32] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#E6E7E9]/70">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#FF8F00]" />
                      <span>URL Routing Mode</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF8F00]/15 text-[#FF8F00] font-bold">
                      {linkMode === 'lan' ? 'LAN IP' : 'Subdomain'}
                    </span>
                  </div>
                  <button
                    onClick={onToggleLinkMode}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/70 dark:bg-[#3A3D40] hover:border-[#FF8F00] transition-colors cursor-pointer"
                  >
                    <span className="text-[11px] text-[#232527] dark:text-[#E6E7E9]">Active Target:</span>
                    <span className="font-bold text-[#FF8F00]">
                      {linkMode === 'lan' ? '10.0.0.100:port' : '*.bycamiel.nl'}
                    </span>
                  </button>
                </div>

                {/* 3. Direct Link to Dockhand (Hete Vlamkern #00B4D8) */}
                <a
                  href={linkMode === 'lan' ? 'http://10.0.0.100:3866' : 'https://docker.bycamiel.nl'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#00B4D8]/40 bg-[#00B4D8]/10 hover:bg-[#00B4D8]/20 text-[#007791] dark:text-[#00B4D8] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#00B4D8] animate-pulse shrink-0" />
                    <Container className="w-4 h-4 text-[#00B4D8]" />
                    <div>
                      <div className="font-bold">Open Dockhand</div>
                      <div className="text-[10px] opacity-80">
                        {linkMode === 'lan' ? '10.0.0.100:3866' : 'docker.bycamiel.nl'}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* 4. Mobile Alerts & QR Pairing */}
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenMobileModal();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/80 dark:bg-[#2C2F32] hover:border-[#FF8F00] text-[#232527] dark:text-[#E6E7E9] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-[#FF8F00]" />
                    <span>Mobile Alerts & QR Pairing</span>
                  </div>
                  <QrCode className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* 5. Docker Compose & Stack Config */}
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenDockerModal();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/80 dark:bg-[#2C2F32] hover:border-[#FF8F00] text-[#232527] dark:text-[#E6E7E9] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Container className="w-4 h-4 text-[#00B4D8]" />
                    <span>Docker Compose & GitHub Stack</span>
                  </div>
                </button>

                {/* 6. Add Monitored Service */}
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onAddService();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#D84315]/40 bg-[#D84315]/10 hover:bg-[#D84315]/20 text-[#D84315] dark:text-[#FF8F00] font-semibold transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Plus className="w-4 h-4 text-[#D84315] dark:text-[#FF8F00]" />
                    <span>Add Monitored Service</span>
                  </div>
                </button>

                {/* 7. Theme Switcher: Nacht (#3A3D40) / Dag (#E6E7E9) */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/80 dark:bg-[#2C2F32] hover:border-[#FF8F00] text-[#232527] dark:text-[#E6E7E9] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {isDark ? (
                      <Sun className="w-4 h-4 text-[#FF8F00]" />
                    ) : (
                      <Moon className="w-4 h-4 text-[#3A3D40]" />
                    )}
                    <span>Kleurenschema Modus</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#3A3D40] text-[#E6E7E9] dark:bg-[#E6E7E9] dark:text-[#3A3D40] font-bold">
                    {isDark ? 'Nacht (#3A3D40)' : 'Dag (#E6E7E9)'}
                  </span>
                </button>

                {/* 8. Version & Build Info */}
                <button
                  onClick={handleOpenVersion}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/80 dark:bg-[#2C2F32] hover:border-[#FF8F00] text-[#232527] dark:text-[#E6E7E9] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4 text-[#FF8F00]" />
                    <span>Version & Build</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#FF8F00]">v{APP_VERSION}</span>
                </button>
              </div>
            </div>

            {/* Bottom Section: Kolenkachel Kleurenschema Swatch Bar */}
            <div className="p-4 border-t border-[#CFD2D6] dark:border-[#4D5156] bg-white/40 dark:bg-[#2C2F32]/50 space-y-2 font-mono text-xs">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#E6E7E9]/60 font-semibold">
                Kolenkachel Kleurenschema
              </div>
              <div className="grid grid-cols-5 gap-1.5 h-5 rounded-md overflow-hidden border border-[#CFD2D6] dark:border-[#4D5156] p-0.5 bg-white/50 dark:bg-[#232527]">
                <div title="Nacht (#3A3D40)" className="rounded-xs bg-[#3A3D40]" />
                <div title="Dag (#E6E7E9)" className="rounded-xs bg-[#E6E7E9]" />
                <div title="Gloeiende Kolen (#D84315)" className="rounded-xs bg-[#D84315]" />
                <div title="Knisperend Vuur (#FF8F00)" className="rounded-xs bg-[#FF8F00]" />
                <div title="Hete Vlamkern (#00B4D8)" className="rounded-xs bg-[#00B4D8]" />
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
