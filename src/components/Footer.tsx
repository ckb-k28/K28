import React from 'react';
import { Tag } from 'lucide-react';
import { KolenkachelIcon } from './KolenkachelIcon';
import { APP_VERSION } from '../version';

interface FooterProps {
  onOpenVersionModal: () => void;
  linkMode?: 'lan' | 'subdomain';
}

export const Footer: React.FC<FooterProps> = ({ onOpenVersionModal, linkMode = 'lan' }) => {
  return (
    <footer className="w-full rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/85 dark:bg-[#3A3D40] backdrop-blur-md py-4 px-6 text-xs font-mono text-slate-600 dark:text-[#E6E7E9]/75 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand identity & Kolenkachel stove icon */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#3A3D40] dark:bg-[#2C2F32] border border-[#4D5156] flex items-center justify-center p-0.5 shrink-0 shadow-xs">
            <KolenkachelIcon className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <span className="font-bold text-[#232527] dark:text-[#E6E7E9]">K28 - Kolenkachel</span>
            <span className="text-[#CFD2D6] dark:text-[#4D5156]">·</span>
            <span className="text-slate-500 dark:text-[#E6E7E9]/70">Homelab Operations Hub</span>
          </div>
        </div>

        {/* Center: Host info & Link Mode */}
        <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-[#E6E7E9]/75 flex-wrap justify-center">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] animate-pulse" />
            <span>Host: <strong className="text-[#232527] dark:text-[#E6E7E9]">10.0.0.100</strong></span>
          </span>
          <span className="text-[#CFD2D6] dark:text-[#4D5156]">·</span>
          <span>
            Dockhand: <strong className="text-[#00B4D8]">{linkMode === 'lan' ? '10.0.0.100:3866' : 'docker.bycamiel.nl'}</strong>
          </span>
        </div>

        {/* Right: Version numbering button (Gloeiende Kolen #D84315 & Knisperend Vuur #FF8F00) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 dark:text-[#E6E7E9]/60 hidden lg:inline">Version:</span>
          <button
            onClick={onOpenVersionModal}
            className="group px-2.5 py-1 rounded-md bg-[#FF8F00]/15 hover:bg-[#D84315]/25 text-[#D84315] dark:text-[#FF8F00] text-xs font-mono font-semibold border border-[#FF8F00]/35 hover:border-[#D84315] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Click to view detailed version information & changelog"
          >
            <Tag className="w-3.5 h-3.5 text-[#D84315] dark:text-[#FF8F00] group-hover:rotate-12 transition-transform" />
            <span>v{APP_VERSION}</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
