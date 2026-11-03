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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#FF8F00]" />
            <h2 className="text-base font-bold text-[#232527] dark:text-[#E6E7E9]">
              Alert Rules & Mobile Dispatch
            </h2>
          </div>
          <p className="text-xs text-[#5A5E63] dark:text-[#A5A9AE] mt-0.5">
            Automatic evaluation every 2 seconds with instant push to your smartphone
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMobileModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#D84315] dark:text-[#FF8F00] bg-[#FF8F00]/10 hover:bg-[#FF8F00]/20 border border-[#FF8F00]/40 rounded-lg transition-colors cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-[#FF8F00]" />
            <span>Configure Mobile Device</span>
          </button>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="p-5 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#232527] dark:text-[#E6E7E9]">
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
                    ? 'border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/60 dark:bg-[#2C2F32]'
                    : 'border-[#CFD2D6]/60 dark:border-[#4D5156]/50 bg-[#E6E7E9]/30 dark:bg-[#2C2F32]/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      rule.severity === 'critical'
                        ? 'bg-[#D84315]/15 text-[#D84315] border-[#D84315]/30'
                        : 'bg-[#FF8F00]/15 text-[#D84315] dark:text-[#FF8F00] border-[#FF8F00]/30'
                    }`}
                  >
                    {rule.severity}
                  </span>

                  {/* Enable Switch */}
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <span className="text-[11px] text-[#5A5E63] dark:text-[#A5A9AE]">
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => onToggleRule(rule.id, e.target.checked)}
                      className="w-4 h-4 accent-[#FF8F00] rounded"
                    />
                  </label>
                </div>

                <h4 className="text-xs font-bold text-[#232527] dark:text-[#E6E7E9]">
                  {rule.name}
                </h4>

                <div className="my-2.5 text-xs text-[#5A5E63] dark:text-[#A5A9AE] flex items-center justify-between">
                  <span>Trigger Condition:</span>
                  <span className="font-mono font-semibold text-[#232527] dark:text-[#E6E7E9]">
                    {rule.metric.toUpperCase()} {rule.operator} {rule.threshold}
                    {rule.metric === 'temp' ? '°C' : rule.metric === 'latency' ? 'ms' : '%'}
                  </span>
                </div>

                {/* Mobile push toggle & Test dispatch */}
                <div className="pt-2.5 border-t border-[#CFD2D6] dark:border-[#4D5156] flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[#5A5E63] dark:text-[#A5A9AE]">
                    <Smartphone className="w-3.5 h-3.5 text-[#00B4D8]" />
                    <span className="text-[11px]">Push to Phone</span>
                    <input
                      type="checkbox"
                      checked={rule.mobilePush}
                      onChange={(e) => onToggleRuleMobile(rule.id, e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#00B4D8] rounded"
                    />
                  </label>

                  <button
                    onClick={() => handleTestRuleDispatch(rule)}
                    disabled={isDispatched}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#5A5E63] hover:text-[#232527] dark:text-[#A5A9AE] dark:hover:text-[#E6E7E9] cursor-pointer"
                  >
                    <Send className="w-3 h-3 text-[#FF8F00]" />
                    <span>{isDispatched ? 'Sent!' : 'Test'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incident & Alert Event History */}
      <div className="p-5 rounded-xl border border-[#CFD2D6] dark:border-[#4D5156] bg-white/90 dark:bg-[#3A3D40] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#232527] dark:text-[#E6E7E9]">
              Alert Incident Log ({alerts.length})
            </h3>
            <p className="text-xs text-[#5A5E63] dark:text-[#A5A9AE]">
              Historical record of metric breaches and service outages
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter segmented buttons */}
            <div className="flex items-center border border-[#CFD2D6] dark:border-[#4D5156] rounded-lg p-0.5 text-xs bg-[#E6E7E9]/70 dark:bg-[#2C2F32]">
              {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded capitalize font-medium transition-colors cursor-pointer ${
                    filterSeverity === sev
                      ? 'bg-[#FF8F00] text-[#232527] font-bold shadow-xs'
                      : 'text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#232527] dark:hover:text-[#E6E7E9]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {alerts.length > 0 && (
              <button
                onClick={onClearAlertHistory}
                className="p-1.5 text-[#5A5E63] dark:text-[#A5A9AE] hover:text-[#D84315] hover:bg-[#E6E7E9] dark:hover:bg-[#2C2F32] rounded-lg transition-colors cursor-pointer"
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
            <div className="text-center py-8 border border-dashed border-[#CFD2D6] dark:border-[#4D5156] rounded-lg bg-[#E6E7E9]/30 dark:bg-[#2C2F32]/40">
              <CheckCircle2 className="w-6 h-6 text-[#00B4D8] mx-auto mb-1.5" />
              <p className="text-xs text-[#5A5E63] dark:text-[#A5A9AE] font-medium">
                No active or historical alerts matching filter
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border text-xs transition-colors ${
                  !alert.acknowledged
                    ? 'border-[#D84315]/50 bg-[#D84315]/10'
                    : 'border-[#CFD2D6] dark:border-[#4D5156] bg-[#E6E7E9]/50 dark:bg-[#2C2F32]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 p-1 rounded shrink-0 ${
                      alert.severity === 'critical'
                        ? 'bg-[#D84315]/20 text-[#D84315]'
                        : alert.severity === 'warning'
                        ? 'bg-[#FF8F00]/20 text-[#FF8F00]'
                        : 'bg-[#00B4D8]/20 text-[#00B4D8]'
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
                      <strong className="text-[#232527] dark:text-[#E6E7E9] font-semibold">
                        {alert.title}
                      </strong>
                      {alert.serviceName && (
                        <span className="font-mono text-[10px] px-1.5 py-0.2 bg-white dark:bg-[#3A3D40] border border-[#CFD2D6] dark:border-[#4D5156] rounded text-[#5A5E63] dark:text-[#A5A9AE]">
                          {alert.serviceName}
                        </span>
                      )}
                      <span className="text-[10px] text-[#5A5E63] dark:text-[#A5A9AE] font-mono">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[#5A5E63] dark:text-[#A5A9AE] mt-0.5 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="flex items-center gap-1 text-[10px] text-[#5A5E63] dark:text-[#A5A9AE] font-mono">
                    <Smartphone className="w-3 h-3 text-[#00B4D8]" />
                    <span>{alert.channel.join(', ') || 'Web Push'}</span>
                  </div>

                  {!alert.acknowledged ? (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-[#D84315] hover:bg-[#bf3910] rounded-md transition-colors cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-[#00B4D8] flex items-center gap-1">
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
