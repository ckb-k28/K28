import React from 'react';

export function getServiceBrandIcon(name: string, category?: string): React.ReactNode {
  const n = name.toLowerCase();

  // 1. Synology Photos (Check before synology nas)
  if (n.includes('synology photos') || n.includes('photos')) {
    return (
      <div className="w-6 h-6 rounded bg-[#ff7a00]/15 flex items-center justify-center text-[#ff7a00]" title="Synology Photos">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      </div>
    );
  }

  // 2. Synology NAS
  if (n.includes('synology') || n.includes('nas')) {
    return (
      <div className="w-6 h-6 rounded bg-[#0066b3]/20 flex items-center justify-center text-[#38bdf8]" title="Synology DSM">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm0 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3zm3-7.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10-9h-4v2h4V7.5zm0 9h-4v2h4v-2z" />
        </svg>
      </div>
    );
  }

  // 3. Dockhand / Docker
  if (n.includes('dockhand') || n.includes('docker')) {
    return (
      <div className="w-6 h-6 rounded bg-[#0db7ed]/20 flex items-center justify-center text-[#0db7ed]" title="Dockhand Docker Manager">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M13.98 10.15h2.46v2.34h-2.46v-2.34zm-3.23 0h2.46v2.34h-2.46v-2.34zm-3.23 0h2.46v2.34H7.52v-2.34zm-3.23 0h2.46v2.34H4.29v-2.34zm9.69-3.23h2.46v2.34h-2.46V6.92zm-3.23 0h2.46v2.34h-2.46V6.92zm-3.23 0h2.46v2.34H7.52V6.92zm6.46-3.23h2.46v2.34h-2.46V3.69zM1 12.87c.36 4.7 4.18 8.44 8.9 8.44 5.92 0 9.87-4.04 10.74-9.35.7.07 1.94-.13 2.56-.99.5-.7.54-1.63.13-2.38-.6-.17-1.39-.12-1.89.17-.19.11-.34.27-.47.45-.63-.22-1.57-.3-2.61-.16-.06-.11-.13-.21-.21-.31-1.07-1.37-3.1-1.6-4.6-.52-.39.28-.68.64-.88 1.05H1.36c-.23.6-.36 1.25-.36 1.93v2.12z" />
        </svg>
      </div>
    );
  }

  // 4. Adguard
  if (n.includes('adguard') || n.includes('dns')) {
    return (
      <div className="w-6 h-6 rounded bg-[#68bc71]/20 flex items-center justify-center text-[#68bc71]" title="AdGuard Home">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
        </svg>
      </div>
    );
  }

  // 5. Emby
  if (n.includes('emby')) {
    return (
      <div className="w-6 h-6 rounded bg-[#52B54B]/20 flex items-center justify-center text-[#52B54B]" title="Emby Server">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M11.02 4.41L2.24 9.48a1.5 1.5 0 0 0 0 2.6l8.78 5.07c.93.54 2.07-.13 2.07-1.2V5.61c0-1.07-1.14-1.74-2.07-1.2zm8.56 6.29l-3.52-2.03v6.66l3.52-2.03a1.5 1.5 0 0 0 0-2.6z" />
        </svg>
      </div>
    );
  }

  // 6. Seerr / Jellyseerr / Overseerr
  if (n.includes('seerr') || n.includes('verzoekjes') || n.includes('seer')) {
    return (
      <div className="w-6 h-6 rounded bg-[#8553c2]/20 flex items-center justify-center text-[#a172df]" title="Seerr Requests">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
      </div>
    );
  }

  // 7. Bookorbit
  if (n.includes('bookorbit') || n.includes('boeken') || n.includes('book')) {
    return (
      <div className="w-6 h-6 rounded bg-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8]" title="Bookorbit">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <circle cx="12" cy="10" r="2" />
        </svg>
      </div>
    );
  }

  // 8. Deadair
  if (n.includes('deadair') || n.includes('radio')) {
    return (
      <div className="w-6 h-6 rounded bg-[#ec4899]/20 flex items-center justify-center text-[#f472b6]" title="Deadair Radio">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
          <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
          <circle cx="12" cy="12" r="2" />
          <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
          <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
        </svg>
      </div>
    );
  }

  // 9. Actual Budget
  if (n.includes('actual') || n.includes('centen') || n.includes('budget')) {
    return (
      <div className="w-6 h-6 rounded bg-[#22c55e]/20 flex items-center justify-center text-[#4ade80]" title="Actual Budget">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5h-2v-1.1a3.5 3.5 0 0 1-2.1-1.2l1.4-1.4a2 2 0 0 0 1.4.9c.7 0 1.3-.4 1.3-.9s-.4-.8-1.5-1.1c-1.8-.4-2.7-1.1-2.7-2.3 0-1.1.8-2 2.2-2.3V6h2v1.1a3.2 3.2 0 0 1 1.7.9l-1.4 1.4a1.8 1.8 0 0 0-1.1-.6c-.6 0-1.1.3-1.1.8s.4.7 1.5 1c1.8.4 2.7 1.2 2.7 2.4 0 1.2-.8 2.1-2.4 2.4z" />
        </svg>
      </div>
    );
  }

  // 10. Norish (Recipes)
  if (n.includes('norish') || n.includes('recepten')) {
    return (
      <div className="w-6 h-6 rounded bg-[#f97316]/20 flex items-center justify-center text-[#fb923c]" title="Norish Recipes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M18 2h-3a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
          <path d="M6 2v7a3 3 0 0 0 3 3v8" />
          <path d="M9 2v4" />
          <path d="M3 2v4" />
        </svg>
      </div>
    );
  }

  // 11. Dawarich (Timeline / GPS)
  if (n.includes('dawarich') || n.includes('tijdlijn')) {
    return (
      <div className="w-6 h-6 rounded bg-[#06b6d4]/20 flex items-center justify-center text-[#22d3ee]" title="Dawarich Timeline">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <circle cx="12" cy="10" r="3" />
          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
        </svg>
      </div>
    );
  }

  // 12. Evershelf (Pantry / Stock)
  if (n.includes('evershelf') || n.includes('voorraad')) {
    return (
      <div className="w-6 h-6 rounded bg-[#a855f7]/20 flex items-center justify-center text-[#c084fc]" title="Evershelf Inventory">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M3 3h18v4H3z" />
          <path d="M3 10h18v4H3z" />
          <path d="M3 17h18v4H3z" />
        </svg>
      </div>
    );
  }

  // 13. Sabnzbd
  if (n.includes('sabnzbd') || n.includes('downloads')) {
    return (
      <div className="w-6 h-6 rounded bg-[#d97706]/20 flex items-center justify-center text-[#f59e0b] font-mono font-extrabold text-[10px]" title="SABnzbd">
        sab
      </div>
    );
  }

  // 14. Spotweb
  if (n.includes('spotweb')) {
    return (
      <div className="w-6 h-6 rounded bg-[#2563eb]/20 flex items-center justify-center text-[#60a5fa]" title="Spotweb">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" fill="#0b0c0e" />
        </svg>
      </div>
    );
  }

  // 15. Prowlarr
  if (n.includes('prowlarr') || n.includes('servers')) {
    return (
      <div className="w-6 h-6 rounded bg-[#e11d48]/20 flex items-center justify-center text-[#fb7185]" title="Prowlarr Indexer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="3" x2="12" y2="7" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <line x1="3" y1="12" x2="7" y2="12" />
          <line x1="17" y1="12" x2="21" y2="12" />
        </svg>
      </div>
    );
  }

  // 16. Radarr 4K (Check before radarr)
  if (n.includes('radarr4k') || n.includes('films4k') || n.includes('4k')) {
    return (
      <div className="w-6 h-6 rounded bg-[#f59e0b]/25 flex items-center justify-center text-[#fbbf24] font-black text-[9px] border border-amber-500/40" title="Radarr 4K UHD">
        4K
      </div>
    );
  }

  // 17. Radarr
  if (n.includes('radarr') || n.includes('films')) {
    return (
      <div className="w-6 h-6 rounded bg-[#eab308]/20 flex items-center justify-center text-[#eab308]" title="Radarr">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
        </svg>
      </div>
    );
  }

  // 18. Sonarr
  if (n.includes('sonarr') || n.includes('series')) {
    return (
      <div className="w-6 h-6 rounded bg-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9]" title="Sonarr">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A6 6 0 0 1 6.07 12H7a1 1 0 0 1 0-2h-.93A6 6 0 0 1 11 5.07V6a1 1 0 0 1 2 0v-.93A6 6 0 0 1 17.93 10H17a1 1 0 0 1 0 2h.93A6 6 0 0 1 13 16.93z" />
        </svg>
      </div>
    );
  }

  // 19. Bazarr
  if (n.includes('bazarr') || n.includes('ondertitels')) {
    return (
      <div className="w-6 h-6 rounded bg-slate-700/40 flex items-center justify-center text-slate-300" title="Bazarr Subtitles">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h4v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-4-4h6v2h-6z" />
        </svg>
      </div>
    );
  }

  // Fallback icon based on name initials
  return (
    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-400 font-mono text-[10px] font-semibold">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}
