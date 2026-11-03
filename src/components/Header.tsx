import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, Plus, Moon, Sun, MoreHorizontal, Container, Zap, QrCode, Tag } from 'lucide-react';
import { APP_VERSION } from '../version';
import { VersionModal } from './VersionModal';

interface HeaderProps {
  activeTab: 'home' | 'sidebar' | 'feeds' | 'mobile';
  setActiveTab: (tab: 'home' | 'sidebar' | 'feeds' | 'mobile') => void;
  onAddService: () => void;
  onOpenMobileModal: () => void;
  onOpenDockerModal: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  unreadAlertCount: number;
  linkMode: 'lan' | 'subdomain';
  onToggleLinkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onAddService,
  onOpenMobileModal,
  onOpenDockerModal,
  isDark,
  toggleTheme,
  unreadAlertCount,
  linkMode,
  onToggleLinkMode,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-slate-200/60 dark:border-[#1a1d26] bg-white/95 dark:bg-[#0e1015]/95 backdrop-blur-md">
      {/* Zone 1: Dynacat brand icon & wordmark + Nav tabs */}
      <div className="flex items-center gap-6 shrink-0">
        {/* Dynacat Cat Logo Squircle & K28 - Kolenkachel Title */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-[#1a1d26] border border-slate-800 dark:border-[#272c3b] flex items-center justify-center group-hover:border-amber-500/50 transition-colors shadow-xs shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-400">
              <path d="M12 5c-4 0-7 2.5-8 6l-1-7 5 3c1.3-.6 2.6-1 4-1s2.7.4 4 1l5-3-1 7c-1-3.5-4-6-8-6z" />
              <path d="M3 11c0 5 4 9 9 9s9-4 9-9" />
              <circle cx="9" cy="13" r="1" fill="currentColor" />
              <circle cx="15" cy="13" r="1" fill="currentColor" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-amber-400 transition-colors leading-tight">
                K28 - Kolenkachel
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVersionModalOpen(true);
                }}
                className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-[10px] font-mono font-semibold border border-amber-500/25 transition-colors"
                title="Click for Version & Build details"
              >
                v{APP_VERSION}
              </button>
            </div>
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 leading-none mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>dynacat v3.0.2</span>
            </span>
          </div>
        </div>

        {/* Clean Tabs with Amber Underline for Active Tab */}
        <nav className="flex items-center gap-5 text-xs font-mono font-medium">
          <button
            onClick={() => setActiveTab('home')}
            className={`pb-1 transition-colors relative ${
              activeTab === 'home'
                ? 'text-slate-900 dark:text-slate-100 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span>Home</span>
            {activeTab === 'home' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 dark:bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('feeds')}
            className={`pb-1 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'feeds'
                ? 'text-slate-900 dark:text-slate-100 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span>Feeds & Alerts</span>
            {unreadAlertCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            )}
            {activeTab === 'feeds' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 dark:bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('sidebar')}
            className={`pb-1 transition-colors relative flex items-center gap-1 ${
              activeTab === 'sidebar'
                ? 'text-slate-900 dark:text-slate-100 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span>Detailed Telemetry</span>
            {activeTab === 'sidebar' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 dark:bg-amber-400 rounded-full" />
            )}
          </button>
        </nav>
      </div>

      {/* Zone 3: Minimalist Utility Actions & Menu */}
      <div className="flex items-center gap-3 shrink-0">
        {/* URL Routing Mode Quick Switcher */}
        <button
          onClick={onToggleLinkMode}
          title={`Click to switch between LAN IP (10.0.0.100:port) and Domain (*.bycamiel.nl)`}
          className="flex items-center gap-1 px-2 py-1 text-xs font-mono rounded border transition-colors bg-slate-100 hover:bg-slate-200 dark:bg-[#161922] dark:hover:bg-[#1e2330] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
        >
          <span className="text-[10px] text-slate-400 hidden sm:inline">URL:</span>
          <span className="font-bold text-amber-500">
            {linkMode === 'lan' ? '10.0.0.100' : 'bycamiel.nl'}
          </span>
        </button>

        {/* Direct Link to Dockhand (Containers) */}
        <a
          href={linkMode === 'lan' ? 'http://10.0.0.100:3866' : 'https://docker.bycamiel.nl'}
          target="_blank"
          rel="noopener noreferrer"
          title={`Dockhand API Connected • Click to open ${linkMode === 'lan' ? '10.0.0.100:3866' : 'docker.bycamiel.nl'} ↗`}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded border border-blue-200/60 dark:border-blue-900/40 transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <Container className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dockhand</span>
          <span className="text-[10px]">↗</span>
        </a>

        <button
          onClick={onOpenMobileModal}
          title="Mobile Alert Setup & QR Pairing"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Mobile Alerts</span>
        </button>

        <button
          onClick={onOpenDockerModal}
          title="Docker Setup & Compose Configuration"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
        >
          <Container className="w-3.5 h-3.5 text-slate-400" />
          <span>Compose</span>
        </button>

        <button
          onClick={onAddService}
          title="Add Monitored Service"
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add</span>
        </button>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* 3 dots menu button matching the top-right of the user screenshot */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            title="Options & Settings"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-56 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15171e] shadow-xl z-50 text-xs font-mono">
              <a
                href={linkMode === 'lan' ? 'http://10.0.0.100:3666' : 'https://docker.bycamiel.nl'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center justify-between text-blue-600 dark:text-blue-400"
              >
                <div className="flex items-center gap-2">
                  <Container className="w-3.5 h-3.5" />
                  <span>Open Dockhand (Containers)</span>
                </div>
                <span>↗</span>
              </a>

              <button
                onClick={() => {
                  onToggleLinkMode();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center justify-between text-slate-700 dark:text-slate-200"
              >
                <span>URL Mode:</span>
                <span className="font-bold text-amber-500">{linkMode === 'lan' ? 'LAN (10.0.0.100)' : 'bycamiel.nl'}</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenDockerModal();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center gap-2 text-slate-700 dark:text-slate-200"
              >
                <Container className="w-3.5 h-3.5 text-slate-400" />
                <span>Docker Compose Config</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenMobileModal();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center gap-2 text-slate-700 dark:text-slate-200"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Pair Mobile Device (QR)</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onAddService();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center gap-2 text-slate-700 dark:text-slate-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Monitored Service</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  setIsVersionModalOpen(true);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center justify-between text-slate-700 dark:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  <span>Version & Build</span>
                </div>
                <span className="text-[10px] font-mono text-amber-500 font-semibold">v{APP_VERSION}</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              <a
                href="https://github.com/Panonim/dynacat/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center justify-between text-slate-400 hover:text-amber-400"
              >
                <span>Dynacat Latest</span>
                <span className="text-[10px] text-emerald-500 font-semibold">v3.0.2 ↗</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Version & Build Modal */}
      <VersionModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
      />
    </header>
  );
};
