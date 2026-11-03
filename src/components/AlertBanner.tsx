import React from 'react';
import { AlertTriangle, AlertCircle, Info, X, Smartphone, Check } from 'lucide-react';
import { AlertEvent } from '../types/server';

interface AlertBannerProps {
  alerts: AlertEvent[];
  onAcknowledge: (alertId: string) => void;
  onOpenMobileModal: () => void;
  onNavigateToRules: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alerts,
  onAcknowledge,
  onOpenMobileModal,
  onNavigateToRules,
}) => {
  const unacknowledged = alerts.filter((a) => !a.acknowledged);

  if (unacknowledged.length === 0) return null;

  const activeAlert = unacknowledged[0];
  const count = unacknowledged.length;

  const isCritical = activeAlert.severity === 'critical';
  const isWarning = activeAlert.severity === 'warning';

  return (
    <div
      className={`relative z-20 flex items-center justify-between px-4 py-2 text-xs transition-colors ${
        isCritical
          ? 'bg-rose-500 text-white'
          : isWarning
          ? 'bg-amber-500 text-slate-950 font-medium'
          : 'bg-sky-600 text-white'
      }`}
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        {isCritical ? (
          <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
        ) : isWarning ? (
          <AlertTriangle className="w-4 h-4 shrink-0" />
        ) : (
          <Info className="w-4 h-4 shrink-0" />
        )}

        <div className="flex items-center gap-2 truncate">
          <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.2 rounded bg-black/20">
            {activeAlert.severity}
          </span>
          <span className="font-semibold truncate">{activeAlert.title}:</span>
          <span className="hidden sm:inline truncate opacity-90">{activeAlert.message}</span>
          {count > 1 && (
            <button
              onClick={onNavigateToRules}
              className="text-[11px] underline font-bold shrink-0 hover:opacity-80"
            >
              +{count - 1} more alert{count > 2 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenMobileModal}
          className="hidden md:flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-black/20 hover:bg-black/30 transition-colors"
        >
          <Smartphone className="w-3 h-3" />
          <span>Mobile Alerts</span>
        </button>

        <button
          onClick={() => onAcknowledge(activeAlert.id)}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-black/25 hover:bg-black/40 transition-colors"
        >
          <Check className="w-3 h-3" />
          <span>Acknowledge</span>
        </button>
      </div>
    </div>
  );
};
