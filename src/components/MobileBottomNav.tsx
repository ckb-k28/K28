import React from 'react';
import { Home, Activity, Bell, Smartphone, Container } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'sidebar' | 'feeds' | 'mobile';
  setActiveTab: (tab: 'home' | 'sidebar' | 'feeds' | 'mobile') => void;
  onOpenMobileModal: () => void;
  unreadAlertCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileModal,
  unreadAlertCount,
}) => {
  return (
    <nav
      aria-label="Mobile thumb navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0e1015]/95 backdrop-blur-lg border-t border-slate-200/40 dark:border-[#1a1d26] px-2 py-1 flex items-center justify-around h-14"
      style={{ paddingBottom: 'max(4px, env(safe-area-inset-bottom))' }}
    >
      {/* Tab 1: Home (Dynacat) */}
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
          activeTab === 'home'
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-200'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-mono tracking-tight mt-0.5">Home</span>
      </button>

      {/* Tab 2: Detailed Telemetry */}
      <button
        onClick={() => setActiveTab('sidebar')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
          activeTab === 'sidebar'
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-200'
        }`}
      >
        <Activity className="w-5 h-5" />
        <span className="text-[10px] font-mono tracking-tight mt-0.5">Telemetry</span>
      </button>

      {/* Tab 3: Feeds & Alerts */}
      <button
        onClick={() => setActiveTab('feeds')}
        className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
          activeTab === 'feeds'
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-200'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadAlertCount > 0 && (
          <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0e1015]" />
        )}
        <span className="text-[10px] font-mono tracking-tight mt-0.5">Alerts</span>
      </button>

      {/* Tab 4: Mobile & ntfy Pairing */}
      <button
        onClick={onOpenMobileModal}
        className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-slate-400 dark:text-slate-500 hover:text-amber-400 transition-colors"
      >
        <Smartphone className="w-5 h-5" />
        <span className="text-[10px] font-mono tracking-tight mt-0.5">ntfy Push</span>
      </button>
    </nav>
  );
};
