import React, { useState } from 'react';
import { X, Tag, Calendar, Check, Copy, Sparkles, Server, ArrowUpRight } from 'lucide-react';
import { CURRENT_VERSION } from '../version';

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionModal: React.FC<VersionModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(CURRENT_VERSION.version);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#12151c] w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Project Version
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Format: {CURRENT_VERSION.format}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Version Box */}
          <div className="p-4 rounded-xl bg-slate-900 dark:bg-[#0c0e12] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 font-semibold mb-1">
                Current Release
              </div>
              <div className="text-2xl font-mono font-bold text-white tracking-tight flex items-baseline gap-2">
                <span>v{CURRENT_VERSION.version}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>Released: {CURRENT_VERSION.releaseDate} (Build #{CURRENT_VERSION.build})</span>
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-mono flex items-center gap-1.5 border border-slate-700/60"
              title="Copy version string"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Breakdown Explanation */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-mono text-slate-400">YEAR</div>
              <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">{CURRENT_VERSION.year}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-mono text-slate-400">MONTH</div>
              <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">{CURRENT_VERSION.month}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-mono text-slate-400">DAY</div>
              <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">{CURRENT_VERSION.day}</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
              <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400">BUILD</div>
              <div className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">#{CURRENT_VERSION.build}</div>
            </div>
          </div>

          {/* Highlights in this build */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Highlights in Build #{CURRENT_VERSION.build}:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              {CURRENT_VERSION.changes.map((change, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Docker Tag Hint */}
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
              <span className="flex items-center gap-1">
                <Server className="w-3 h-3 text-emerald-500" />
                <span>Docker Image Tag:</span>
              </span>
              <span className="text-amber-500">k28-kolenkachel:{CURRENT_VERSION.version}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white text-xs font-mono font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
