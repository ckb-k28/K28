import React, { useState } from 'react';
import {
  Bell,
  Smartphone,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Send,
  Zap,
  Clock,
  Filter,
} from 'lucide-react';
import { AlertRule, AlertEvent, MobileAlertConfig } from '../types/server';
import { dispatchAlert } from '../services/alertDispatcher';

interface AlertRulesViewProps {
  rules: AlertRule[];
  alerts: AlertEvent[];
  config: MobileAlertConfig;
  onToggleRule: (ruleId: string, enabled: boolean) => void;
  onToggleRuleMobile: (ruleId: string, mobilePush: boolean) => void;
  onUpdateRuleThreshold: (ruleId: string, threshold: number) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onClearAlertHistory: () => void;
  onOpenMobileModal: () => void;
}

export const AlertRulesView: React.FC<AlertRulesViewProps> = ({
  rules,
  alerts,
  config,
  onToggleRule,
  onToggleRuleMobile,
  onUpdateRuleThreshold,
  onAcknowledgeAlert,
  onClearAlertHistory,
  onOpenMobileModal,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [testDispatchedId, setTestDispatchedId] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  const handleTestRuleDispatch = async (rule: AlertRule) => {
    setTestDispatchedId(rule.id);
    const mockEvent: AlertEvent = {
      id: `manual-${Date.now()}`,
      ruleId: rule.id,
      title: `Rule Test: ${rule.name}`,
      message: `Simulated threshold breach for ${rule.metric.toUpperCase()} (${rule.threshold}${rule.metric === 'temp' ? '°C' : '%'}).`,
      severity: rule.severity,
      timestamp: Date.now(),
      acknowledged: false,
      channel: rule.mobilePush ? ['Mobile Push'] : [],
    };
    await dispatchAlert(mockEvent, config);
    setTimeout(() => setTestDispatchedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header and Mobile Alert Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Alert Rules & Mobile Dispatch
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automatic evaluation every 2 seconds with instant push to your smartphone
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMobileModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-lg transition-colors"
          >
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span>Configure Mobile Device</span>
          </button>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Threshold Triggers & Conditions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rules.map((rule) => {
            const isDispatched = testDispatchedId === rule.id;

            return (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border transition-all ${
                  rule.enabled
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40'
                    : 'border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/30 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      rule.severity === 'critical'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}
                  >
                    {rule.severity}
                  </span>

                  {/* Enable Switch */}
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <span className="text-[11px] text-slate-400">
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => onToggleRule(rule.id, e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                  </label>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {rule.name}
                </h4>

                <div className="my-2.5 text-xs text-slate-500 flex items-center justify-between">
                  <span>Trigger Condition:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {rule.metric.toUpperCase()} {rule.operator} {rule.threshold}
                    {rule.metric === 'temp' ? '°C' : rule.metric === 'latency' ? 'ms' : '%'}
                  </span>
                </div>

                {/* Mobile push toggle & Test dispatch */}
                <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px]">Push to Phone</span>
                    <input
                      type="checkbox"
                      checked={rule.mobilePush}
                      onChange={(e) => onToggleRuleMobile(rule.id, e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-500 rounded"
                    />
                  </label>

                  <button
                    onClick={() => handleTestRuleDispatch(rule)}
                    disabled={isDispatched}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <Send className="w-3 h-3 text-emerald-500" />
                    <span>{isDispatched ? 'Sent!' : 'Test'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incident & Alert Event History */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Alert Incident Log ({alerts.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Historical record of metric breaches and service outages
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter segmented buttons */}
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs bg-slate-50 dark:bg-slate-800/60">
              {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                    filterSeverity === sev
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {alerts.length > 0 && (
              <button
                onClick={onClearAlertHistory}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Clear incident log"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-2">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                No active or historical alerts matching filter
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border text-xs transition-colors ${
                  !alert.acknowledged
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 p-1 rounded shrink-0 ${
                      alert.severity === 'critical'
                        ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'
                        : alert.severity === 'warning'
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                        : 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400'
                    }`}
                  >
                    {alert.severity === 'critical' ? (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    ) : alert.severity === 'warning' ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <Info className="w-3.5 h-3.5" />
                    )}
                  </span>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                        {alert.title}
                      </strong>
                      {alert.serviceName && (
                        <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                          {alert.serviceName}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <Smartphone className="w-3 h-3 text-emerald-500" />
                    <span>{alert.channel.join(', ') || 'Web Push'}</span>
                  </div>

                  {!alert.acknowledged ? (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 rounded-md transition-colors"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
