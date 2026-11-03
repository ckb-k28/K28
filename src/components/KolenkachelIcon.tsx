import React from 'react';

interface KolenkachelIconProps {
  className?: string;
  size?: number;
}

/**
 * Kolenkachel (Classic Cast-Iron Coal / Wood Stove) Vector Icon
 * Colored with the official Kolenkachel Kleurenschema:
 * - Nacht (#3A3D40): Cast-iron body & chimney
 * - Dag (#E6E7E9): Metallic edge highlights
 * - Gloeiende Kolen (#D84315): Outer roaring flames & glowing ember rim
 * - Knisperend Vuur (#FF8F00): Inner amber-orange flame body
 * - Hete Vlamkern (#00B4D8): Intense hot blue flame core at the base
 */
export const KolenkachelIcon: React.FC<KolenkachelIconProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        {/* Warm fire glow radial gradient */}
        <radialGradient id="fireGlow" cx="50%" cy="80%" r="65%">
          <stop offset="0%" stopColor="#FF8F00" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#D84315" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#1F120E" stopOpacity="0.95" />
        </radialGradient>

        {/* Body iron subtle gradient (#3A3D40 Nacht) */}
        <linearGradient id="ironBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#464A4E" />
          <stop offset="20%" stopColor="#3A3D40" />
          <stop offset="80%" stopColor="#323538" />
          <stop offset="100%" stopColor="#282A2D" />
        </linearGradient>

        {/* Top mantle ledge gradient */}
        <linearGradient id="mantleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4B4F53" />
          <stop offset="100%" stopColor="#3A3D40" />
        </linearGradient>

        {/* Gloeiende Kolen (#D84315) outer flame gradient */}
        <linearGradient id="outerFlame" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#B9320B" />
          <stop offset="50%" stopColor="#D84315" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>

        {/* Knisperend Vuur (#FF8F00) mid flame gradient */}
        <linearGradient id="midFlame" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#D84315" />
          <stop offset="40%" stopColor="#FF8F00" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>
      </defs>

      {/* 1. Stepped Chimney Flue */}
      <rect x="42" y="7" width="16" height="15" rx="1.5" fill="#3A3D40" />
      <rect x="42" y="7" width="2" height="15" fill="#E6E7E9" opacity="0.25" />
      <rect x="38" y="20" width="24" height="6" rx="1" fill="#323538" />
      <rect x="39" y="20.5" width="22" height="1.5" fill="#E6E7E9" opacity="0.2" />

      {/* 2. Top Mantle / Overhanging Plate */}
      <rect x="27" y="26" width="46" height="6.5" rx="1.5" fill="url(#mantleGrad)" stroke="#232527" strokeWidth="0.8" />
      <line x1="28.5" y1="27" x2="71.5" y2="27" stroke="#E6E7E9" strokeWidth="1" strokeLinecap="round" opacity="0.35" />

      {/* 3. Main Cast-Iron Stove Body (#3A3D40 Nacht) */}
      <rect x="29" y="32.5" width="42" height="54.5" fill="url(#ironBody)" stroke="#232527" strokeWidth="0.8" />
      <rect x="29" y="32.5" width="3" height="54.5" fill="#E6E7E9" opacity="0.12" />
      <rect x="68" y="32.5" width="3" height="54.5" fill="#1E2022" opacity="0.55" />

      {/* 4. Arched Fire Chamber Window */}
      <path
        d="M 35 69 L 35 51 C 35 41.5 65 41.5 65 51 L 65 69 Z"
        fill="#1E1410"
        stroke="#D84315"
        strokeWidth="1.4"
      />
      <path
        d="M 36.2 68 L 36.2 51.5 C 36.2 43 63.8 43 63.8 51.5 L 63.8 68 Z"
        fill="url(#fireGlow)"
      />

      {/* Wood / Coal bed in firebox */}
      <rect x="37" y="63" width="26" height="4.5" rx="2.2" fill="#6D3214" stroke="#3E1B09" strokeWidth="0.6" />
      <circle cx="39" cy="65.2" r="1.8" fill="#D84315" stroke="#3E1B09" strokeWidth="0.4" />
      <circle cx="42.5" cy="65.2" r="1.5" fill="#FF8F00" stroke="#3E1B09" strokeWidth="0.4" />

      {/* 5. Roaring Fire Flames (Gloeiende Kolen #D84315 -> Knisperend Vuur #FF8F00 -> Hete Vlamkern #00B4D8) */}
      <path
        d="M 40 64 C 40 56 42 50 44 47 C 46 51 47 48 50 40 C 52 46 54 48 56 44 C 57 49 59 52 60 55 C 60.5 58 60 64 40 64 Z"
        fill="url(#outerFlame)"
      />
      <path
        d="M 42 64 C 42 57 44 52 46 48 C 47.5 52 49 50 50.5 44 C 52 48 54 50 55 47 C 56.5 51 58 55 58 64 Z"
        fill="url(#midFlame)"
      />
      {/* Hot Flame Core (Hete Vlamkern #00B4D8 + bright center) */}
      <path
        d="M 45.5 64 C 45.5 59.5 47.5 56 49.5 52.5 C 50.8 55 51.5 54 52 51.5 C 53 55 54.5 58 54.5 64 Z"
        fill="#FFE082"
      />
      <path
        d="M 47.5 64 C 47.5 61 48.8 58.8 50.2 56.8 C 51.2 58.8 52.5 61 52.5 64 Z"
        fill="#00B4D8"
        opacity="0.9"
      />

      {/* 6. Lower Rectangular Ash / Draft Door */}
      <rect x="35" y="73" width="30" height="8.5" rx="1" fill="#23120D" stroke="#D84315" strokeWidth="0.7" strokeOpacity="0.6" />
      <rect x="36.5" y="74.2" width="27" height="6.1" rx="0.5" fill="#2B1610" />
      <rect x="47" y="76.2" width="6" height="2" rx="0.8" fill="#3A3D40" />

      {/* 7. Arched Base & Cast Iron Legs */}
      <path
        d="M 31 87 L 31 103 L 37.5 103 L 37.5 99 C 43 93 57 93 62.5 99 L 62.5 103 L 69 103 L 69 87 Z"
        fill="#3A3D40"
        stroke="#232527"
        strokeWidth="0.8"
      />
      <rect x="30" y="101" width="8.5" height="2.5" rx="0.8" fill="#282A2D" />
      <rect x="61.5" y="101" width="8.5" height="2.5" rx="0.8" fill="#282A2D" />
    </svg>
  );
};
