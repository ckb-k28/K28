import React from 'react';

/**
 * K28 - Kolenkachel Service Brand Icons
 * Strictly styled with the Kolenkachel Kleurenschema:
 * - Nacht (Donker): #3A3D40 / #2C2F32
 * - Dag (Licht): #E6E7E9
 * - Gloeiende Kolen (Warm Roodoranje): #D84315
 * - Knisperend Vuur (Amber Oranje): #FF8F00
 * - Hete Vlamkern (Helder Blauw): #00B4D8
 *
 * Each icon preserves the recognizable brand logo silhouette of the service.
 */
export function getServiceBrandIcon(name: string, _category?: string): React.ReactNode {
  const n = name.toLowerCase();

  const badgeBase =
    'w-7 h-7 rounded-lg bg-[#E6E7E9] dark:bg-[#2C2F32] border border-[#CFD2D6] dark:border-[#4D5156] group-hover:border-[#FF8F00]/60 flex items-center justify-center shrink-0 shadow-2xs transition-colors';

  // 1. Synology Photos (Check before Synology NAS) — Pinwheel aperture + camera frame
  if (n.includes('synology photos') || n.includes('photos') || n.includes('foto')) {
    return (
      <div className={badgeBase} title="Synology Photos">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <rect
            x="2.5"
            y="5.5"
            width="19"
            height="14"
            rx="3"
            stroke="#FF8F00"
            strokeWidth="1.75"
          />
          <path
            d="M8.5 5.5L10 3.5h4l1.5 2"
            stroke="#D84315"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Synology Photos 4-color pinwheel blades in Kolenkachel palette */}
          <path d="M12 8.5A4 4 0 0 1 16 12.5H12V8.5Z" fill="#FF8F00" />
          <path d="M16 12.5A4 4 0 0 1 12 16.5V12.5H16Z" fill="#D84315" />
          <path d="M12 16.5A4 4 0 0 1 8 12.5H12V16.5Z" fill="#00B4D8" />
          <path d="M8 12.5A4 4 0 0 1 12 8.5V12.5H8Z" fill="#FF8F00" fillOpacity="0.65" />
          <circle cx="17.5" cy="8.5" r="1" fill="#00B4D8" />
        </svg>
      </div>
    );
  }

  // 2. Synology Drive
  if (n.includes('synology drive') || n.includes('drive')) {
    return (
      <div className={badgeBase} title="Synology Drive">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path
            d="M8.5 4h7l5.5 9.5H14L8.5 4z"
            fill="#00B4D8"
          />
          <path
            d="M8.5 4L3 13.5l3.5 6 5.5-9.5L8.5 4z"
            fill="#FF8F00"
          />
          <path
            d="M6.5 19.5h11l3.5-6H10l-3.5 6z"
            fill="#D84315"
          />
        </svg>
      </div>
    );
  }

  // 3. Synology NAS (DSM) — Recognizable dual-bay NAS tower/rack with status LEDs
  if (n.includes('synology') || n.includes('nas')) {
    return (
      <div className={badgeBase} title="Synology DSM NAS">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <rect
            x="3"
            y="4"
            width="18"
            height="6.5"
            rx="1.75"
            stroke="#00B4D8"
            strokeWidth="1.75"
          />
          <rect
            x="3"
            y="13.5"
            width="18"
            height="6.5"
            rx="1.75"
            stroke="#00B4D8"
            strokeWidth="1.75"
          />
          <circle cx="6.5" cy="7.25" r="1.2" fill="#FF8F00" />
          <circle cx="6.5" cy="16.75" r="1.2" fill="#FF8F00" />
          <path
            d="M11 7.25h6.5M11 16.75h6.5"
            stroke="#D84315"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // 4. Dockhand / Docker — Iconic Docker whale + stacked containers
  if (n.includes('dockhand') || n.includes('docker')) {
    return (
      <div className={badgeBase} title="Dockhand Container Manager">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          {/* Container blocks on whale back */}
          <rect x="5" y="8.2" width="2.3" height="2.2" rx="0.3" fill="#FF8F00" />
          <rect x="8" y="8.2" width="2.3" height="2.2" rx="0.3" fill="#00B4D8" />
          <rect x="11" y="8.2" width="2.3" height="2.2" rx="0.3" fill="#FF8F00" />
          <rect x="14" y="8.2" width="2.3" height="2.2" rx="0.3" fill="#00B4D8" />
          <rect x="8" y="5.4" width="2.3" height="2.2" rx="0.3" fill="#00B4D8" />
          <rect x="11" y="5.4" width="2.3" height="2.2" rx="0.3" fill="#D84315" />
          <rect x="11" y="2.6" width="2.3" height="2.2" rx="0.3" fill="#FF8F00" />
          {/* Docker Whale Hull */}
          <path
            d="M2.2 12.2h14.6c.45-1.1 1.35-1.65 2.55-1.5-.3.95-.1 1.75.55 2.2.8.05 1.55-.15 2.1-.6-.25 1.35-1.1 2.2-2.45 2.35C18.3 18.2 14.8 20.4 9.8 20.4c-4.4 0-7.2-2.3-7.6-8.2z"
            fill="#00B4D8"
          />
          <circle cx="6.5" cy="15.2" r="0.9" fill="#E6E7E9" />
        </svg>
      </div>
    );
  }

  // 5. AdGuard Home — Iconic AdGuard Shield with checkmark
  if (n.includes('adguard') || n.includes('dns')) {
    return (
      <div className={badgeBase} title="AdGuard Home DNS">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path
            d="M12 2.2L4 5.6v5.6c0 5.1 3.4 9.85 8 11.1 4.6-1.25 8-6 8-11.1V5.6L12 2.2z"
            fill="#00B4D8"
            fillOpacity="0.2"
            stroke="#00B4D8"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 12.3l2.3 2.3 4.8-4.9"
            stroke="#FF8F00"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // 6. Emby — Iconic Emby layered play-crystal / staggered triangles
  if (n.includes('emby')) {
    return (
      <div className={badgeBase} title="Emby Media Server">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path
            d="M11 3.5L3.5 11l3.2 3.2L11 19.5l7.5-7.5-3.2-3.2L11 3.5z"
            fill="#00B4D8"
            fillOpacity="0.2"
            stroke="#00B4D8"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 8.2v7.6l6.2-3.8-6.2-3.8z"
            fill="#FF8F00"
          />
        </svg>
      </div>
    );
  }

  // 7. Seerr / Jellyseerr / Overseerr — Iconic Seerr Eye logo with iris & glint
  if (n.includes('seerr') || n.includes('verzoekjes') || n.includes('seer')) {
    return (
      <div className={badgeBase} title="Seerr Media Requests">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path
            d="M2.2 12C4 7.6 7.6 5 12 5s8 2.6 9.8 7c-1.8 4.4-5.4 7-9.8 7s-8-2.6-9.8-7z"
            stroke="#00B4D8"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3.8" fill="#D84315" />
          <circle cx="12" cy="12" r="1.8" fill="#FF8F00" />
          <circle cx="13.4" cy="10.6" r="0.8" fill="#E6E7E9" />
        </svg>
      </div>
    );
  }

  // 8. Bookorbit / Chaptarr — Open Book with orbital ring
  if (n.includes('bookorbit') || n.includes('boeken') || n.includes('book') || n.includes('chaptarr')) {
    return (
      <div className={badgeBase} title="Bookorbit">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path
            d="M5.5 3.5H18.5v16H6.5a2 2 0 0 1-2-2V5.5a2 2 0 0 1 1-1.7z"
            stroke="#00B4D8"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 16.5H18.5"
            stroke="#00B4D8"
            strokeWidth="1.5"
          />
          {/* Orbit ellipse & planet dot */}
          <ellipse
            cx="12"
            cy="10"
            rx="4.2"
            ry="2"
            transform="rotate(-24 12 10)"
            stroke="#FF8F00"
            strokeWidth="1.6"
          />
          <circle cx="12" cy="10" r="1.4" fill="#D84315" />
        </svg>
      </div>
    );
  }

  // 9. Deadair / Lidarr — Radio / Audio broadcast waves & transmitter
  if (n.includes('deadair') || n.includes('radio') || n.includes('lidarr') || n.includes('muziek')) {
    return (
      <div className={badgeBase} title="Deadair Radio">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path
            d="M5.2 18.8a9.6 9.6 0 0 1 0-13.6M18.8 5.2a9.6 9.6 0 0 1 0 13.6"
            stroke="#D84315"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M8.2 15.8a5.4 5.4 0 0 1 0-7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6"
            stroke="#FF8F00"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="2.2" fill="#00B4D8" />
        </svg>
      </div>
    );
  }

  // 10. Actual Budget — Stylized Actual "A" delta triangle & currency coin ring
  if (n.includes('actual') || n.includes('centen') || n.includes('budget')) {
    return (
      <div className={badgeBase} title="Actual Budget">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="#00B4D8"
            strokeWidth="1.75"
          />
          <path
            d="M12 6.5L7.8 16.5h2.2l.8-2.1h2.4l.8 2.1h2.2L12 6.5zm-.5 5.8l.5-1.5.5 1.5h-1z"
            fill="#FF8F00"
          />
        </svg>
      </div>
    );
  }

  // 11. Norish — Culinary Fork, Knife & Recipe Leaf logo
  if (n.includes('norish') || n.includes('recepten')) {
    return (
      <div className={badgeBase} title="Norish Recipes">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          {/* Fork */}
          <path
            d="M6 3v5.5a2.5 2.5 0 0 0 2.5 2.5H9v9M6 3v3.5M9 3v3.5M11.5 3v5.5A2.5 2.5 0 0 1 9 11"
            stroke="#FF8F00"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Chef knife / recipe leaf */}
          <path
            d="M17.5 3c-2 2-2.5 5.5-2.5 9h2.5v8"
            stroke="#D84315"
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // 12. Dawarich — GPS Map Pin & Timeline Trajectory
  if (n.includes('dawarich') || n.includes('tijdlijn')) {
    return (
      <div className={badgeBase} title="Dawarich GPS Timeline">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path
            d="M12 2.5a7 7 0 0 0-7 7c0 4.8 7 11.5 7 11.5s7-6.7 7-11.5a7 7 0 0 0-7-7z"
            fill="#00B4D8"
            fillOpacity="0.18"
            stroke="#00B4D8"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="9.5" r="2.6" fill="#FF8F00" />
        </svg>
      </div>
    );
  }

  // 13. Evershelf — Stacked Pantry Shelves & Inventory Jars
  if (n.includes('evershelf') || n.includes('voorraad')) {
    return (
      <div className={badgeBase} title="Evershelf Pantry & Stock">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          {/* Shelves */}
          <path
            d="M3.5 9.5h17M3.5 19.5h17"
            stroke="#FF8F00"
            strokeWidth="1.85"
            strokeLinecap="round"
          />
          {/* Top shelf jars */}
          <rect x="5.5" y="4" width="4" height="5.5" rx="1" fill="#00B4D8" />
          <rect x="11.5" y="5" width="4.5" height="4.5" rx="1" fill="#D84315" />
          {/* Bottom shelf boxes */}
          <rect x="6" y="13" width="5.5" height="6.5" rx="1" fill="#FF8F00" />
          <rect x="13.5" y="14" width="4" height="5.5" rx="1" fill="#00B4D8" />
        </svg>
      </div>
    );
  }

  // 14. SABnzbd — Recognizable SABnzbd Usenet hexagon + bold downward arrow logo
  if (n.includes('sabnzbd') || n.includes('downloads')) {
    return (
      <div className={badgeBase} title="SABnzbd Usenet Downloader">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path
            d="M12 2.3L20.2 7v10L12 21.7 3.8 17V7L12 2.3z"
            fill="#FF8F00"
            fillOpacity="0.18"
            stroke="#FF8F00"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M12 7v8.2M8.5 12.2L12 15.8l3.5-3.6"
            stroke="#D84315"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // 15. Spotweb — Concentric Usenet Spot Radar / Bullseye
  if (n.includes('spotweb')) {
    return (
      <div className={badgeBase} title="Spotweb">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="#00B4D8"
            strokeWidth="1.75"
          />
          <circle
            cx="12"
            cy="12"
            r="5.2"
            stroke="#FF8F00"
            strokeWidth="1.6"
            strokeDasharray="6 3"
          />
          <circle cx="12" cy="12" r="2.2" fill="#D84315" />
        </svg>
      </div>
    );
  }

  // 16. Prowlarr — Recognizable Prowlarr Indexer Prowler / Target Crosshair Crest
  if (n.includes('prowlarr') || n.includes('servers') || n.includes('index')) {
    return (
      <div className={badgeBase} title="Prowlarr Indexer Manager">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          {/* Prowler cat-ear / shield silhouette + radar */}
          <path
            d="M5 4.5l3.5 2.3a7.5 7.5 0 0 1 7 0L19 4.5l.8 4.8A7.8 7.8 0 0 1 12 19.8 7.8 7.8 0 0 1 4.2 9.3L5 4.5z"
            fill="#D84315"
            fillOpacity="0.2"
            stroke="#D84315"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle cx="9.3" cy="11.5" r="1.3" fill="#FF8F00" />
          <circle cx="14.7" cy="11.5" r="1.3" fill="#FF8F00" />
          <path d="M10.8 14.8L12 16l1.2-1.2" stroke="#00B4D8" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 17. Radarr 4K (Check before Radarr) — Radarr Film Beacon + crisp 4K badge
  if (n.includes('radarr4k') || n.includes('films4k') || n.includes('4k')) {
    return (
      <div className={badgeBase} title="Radarr 4K UHD">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <circle
            cx="11"
            cy="11"
            r="7.8"
            stroke="#FF8F00"
            strokeWidth="1.75"
          />
          <path d="M9.2 7.8v6.4l5.2-3.2-5.2-3.2z" fill="#D84315" />
          {/* 4K Pill Badge in bottom-right */}
          <rect x="11.5" y="13.8" width="10" height="7" rx="1.5" fill="#FF8F00" />
          <text
            x="16.5"
            y="18.8"
            textAnchor="middle"
            fill="#232527"
            fontSize="5.8"
            fontFamily="monospace"
            fontWeight="900"
          >
            4K
          </text>
        </svg>
      </div>
    );
  }

  // 18. Radarr — Recognizable Radarr film-reel / radar play beacon
  if (n.includes('radarr') || n.includes('films')) {
    return (
      <div className={badgeBase} title="Radarr Movies">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="#FF8F00"
            fillOpacity="0.16"
            stroke="#FF8F00"
            strokeWidth="1.75"
          />
          <path d="M9.8 8v8l6.8-4-6.8-4z" fill="#D84315" />
        </svg>
      </div>
    );
  }

  // 19. Sonarr — Recognizable Sonarr broadcast TV ring + sonar target
  if (n.includes('sonarr') || n.includes('series')) {
    return (
      <div className={badgeBase} title="Sonarr TV Series">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="#00B4D8"
            fillOpacity="0.16"
            stroke="#00B4D8"
            strokeWidth="1.75"
          />
          <circle
            cx="12"
            cy="12"
            r="4.8"
            stroke="#FF8F00"
            strokeWidth="1.65"
          />
          <circle cx="12" cy="12" r="1.8" fill="#00B4D8" />
        </svg>
      </div>
    );
  }

  // 20. Bazarr — Recognizable Bazarr subtitle caption frame with text lines
  if (n.includes('bazarr') || n.includes('ondertitels')) {
    return (
      <div className={badgeBase} title="Bazarr Subtitles">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2.5"
            fill="#00B4D8"
            fillOpacity="0.14"
            stroke="#00B4D8"
            strokeWidth="1.75"
          />
          <path
            d="M6.5 11.5h4.5M13.5 11.5h4M6.5 15h7M15.5 15h2"
            stroke="#FF8F00"
            strokeWidth="1.85"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // Fallback icon based on name initials in Kolenkachel Kleurenschema
  return (
    <div className={`${badgeBase} text-[#FF8F00] font-mono text-[10px] font-bold`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}
