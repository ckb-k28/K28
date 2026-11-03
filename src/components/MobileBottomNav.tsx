import React from 'react';
import { Home, Activity, Bell, Smartphone } from 'lucide-react';

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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#E6E7E9]/95 dark:bg-[#3A3D40]/95 backdrop-blur-lg border-t border-[#CFD2D6] dark:border-[#4D5156] px-2 py-1 flex items-center justify-around h-14"
      style={{ paddingBottom: 'max(4px, env(safe-area-inset-bottom))' }}
    >
      {/* Tab 1: Home (Dynacat) */}
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors cursor-pointer ${
          activeTab === 'home'
            ? 'text-[#D84315] dark:text-[#FF8F00] font-bold'
            : 'text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#232527] dark:hover:text-[#E6E7E9]'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-mono tracking-tight mt-0.5">Home</span>
      </button>

      {/* Tab 2: Detailed Telemetry */}
      <button
        onClick={() => setActiveTab('sidebar')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors cursor-pointer ${
          activeTab === 'sidebar'
            ? 'text-[#D84315] dark:text-[#FF8F00] font-bold'
            : 'text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#232527] dark:hover:text-[#E6E7E9]'
        }`}
      >
        <Activity className="w-5 h-5" />
        <span className="text-[10px] font-mono tracking-tight mt-0.5">Telemetry</span>
      </button>

      {/* Tab 3: Feeds & Alerts */}
      <button
        onClick={() => setActiveTab('feeds')}
        className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors cursor-pointer ${
          activeTab === 'feeds'
            ? 'text-[#D84315] dark:text-[#FF8F00] font-bold'
            : 'text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#232527] dark:hover:text-[#E6E7E9]'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadAlertCount > 0 && (
          <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#D84315] ring-2 ring-[#E6E7E9] dark:ring-[#3A3D40]" />
        )}
        <span className="text-[10px] font-mono tracking-tight mt-0.5">Alerts</span>
      </button>

      {/* Tab 4: Mobile & ntfy Pairing */}
      <button
        onClick={onOpenMobileModal}
        className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#D84315] dark:hover:text-[#FF8F00] transition-colors cursor-pointer"
      >
        <Smartphone className="w-5 h-5" />
        <span className="text-[10px] font-mono tracking-tight mt-0.5">ntfy Push</span>
      </button>
    </nav>
  );
};
