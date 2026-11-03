import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { DynacatDashboard } from './components/DynacatDashboard';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Sidebar } from './components/Sidebar';
import { MetricsOverview } from './components/MetricsOverview';
import { ServicesTableView } from './components/ServicesTableView';
import { DisksView } from './components/DisksView';
import { AlertRulesView } from './components/AlertRulesView';
import { MobileAlertsModal } from './components/MobileAlertsModal';
import { ServiceModal } from './components/ServiceModal';
import { DockerModal } from './components/DockerModal';
import { ServiceDetailDrawer } from './components/ServiceDetailDrawer';
import { AlertBanner } from './components/AlertBanner';
import {
  INITIAL_SERVICES,
  INITIAL_QUICK_LINKS,
  INITIAL_METRICS,
  INITIAL_ALERT_RULES,
  INITIAL_MOBILE_CONFIG,
  INITIAL_ALERTS,
} from './data/defaultData';
import {
  ServerService,
  ServerMetrics,
  AlertRule,
  MobileAlertConfig,
  AlertEvent,
  MetricHistoryPoint,
  QuickLink,
} from './types/server';
import { TelemetryEngine } from './services/telemetryEngine';
import { dispatchAlert } from './services/alertDispatcher';

export default function App() {
  // Theme state (defaults to dark for authentic Dynacat homelab feel)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulse_noc_theme');
      if (saved) return saved === 'dark';
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pulse_noc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pulse_noc_theme', 'light');
    }
  }, [isDark]);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'home' | 'sidebar' | 'feeds' | 'mobile'>('home');

  // URL Routing Mode: 'lan' (http://10.0.0.100:port) or 'subdomain' (https://subdomain.bycamiel.nl)
  const [linkMode, setLinkMode] = useState<'lan' | 'subdomain'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('k28_link_mode');
      if (saved === 'subdomain' || saved === 'lan') return saved;
    }
    return 'lan';
  });

  useEffect(() => {
    localStorage.setItem('k28_link_mode', linkMode);
  }, [linkMode]);

  // Core Data States with localStorage persistence
  const [services, setServices] = useState<ServerService[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('k28_services_v4');
      if (saved) {
        try {
          const parsed: ServerService[] = JSON.parse(saved);
          return parsed.map((s) => s.id === 'srv-dockhand' && s.port === 3666 ? { ...s, port: 3866 } : s);
        } catch {}
      }
    }
    return INITIAL_SERVICES;
  });

  useEffect(() => {
    localStorage.setItem('k28_services_v4', JSON.stringify(services));
  }, [services]);

  const [quickLinks, setQuickLinks] = useState<QuickLink[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('k28_quick_links_v4');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_QUICK_LINKS;
  });

  useEffect(() => {
    localStorage.setItem('k28_quick_links_v4', JSON.stringify(quickLinks));
  }, [quickLinks]);

  const [metrics, setMetrics] = useState<ServerMetrics>(INITIAL_METRICS);

  const [alertRules, setAlertRules] = useState<AlertRule[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulse_noc_rules');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_ALERT_RULES;
  });

  useEffect(() => {
    localStorage.setItem('pulse_noc_rules', JSON.stringify(alertRules));
  }, [alertRules]);

  const [mobileConfig, setMobileConfig] = useState<MobileAlertConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulse_noc_mobile_config');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_MOBILE_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('pulse_noc_mobile_config', JSON.stringify(mobileConfig));
  }, [mobileConfig]);

  const [alerts, setAlerts] = useState<AlertEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulse_noc_alerts');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_ALERTS;
  });

  useEffect(() => {
    localStorage.setItem('pulse_noc_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Telemetry stream controls & history buffer
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamIntervalMs, setStreamIntervalMs] = useState(2000);
  const [spikeMode, setSpikeMode] = useState<'none' | 'cpu_spike' | 'mem_spike' | 'service_fail'>('none');

  const [history, setHistory] = useState<MetricHistoryPoint[]>(() => {
    const points: MetricHistoryPoint[] = [];
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      points.push({
        time: new Date(now - i * 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp: now - i * 2000,
        cpu: Number((1.8 + Math.random() * 0.8).toFixed(1)),
        memory: Number((65 + Math.random() * 1).toFixed(1)),
        networkRxKb: Math.floor(400 + Math.random() * 200),
        networkTxKb: Math.floor(200 + Math.random() * 100),
        tempC: Number((36.5 + Math.random() * 0.5).toFixed(1)),
      });
    }
    return points;
  });

  // Modals & Drawers
  const [selectedService, setSelectedService] = useState<ServerService | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<ServerService | null>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isDockerModalOpen, setIsDockerModalOpen] = useState(false);

  // Engine ref
  const engineRef = useRef<TelemetryEngine>(new TelemetryEngine());

  useEffect(() => {
    engineRef.current.setSpikeMode(spikeMode);
  }, [spikeMode]);

  // Main real-time telemetry loop
  useEffect(() => {
    if (!isStreaming) return;

    const timer = setInterval(() => {
      setMetrics((prevMetrics) => {
        setServices((prevServices) => {
          const update = engineRef.current.tick(prevMetrics, prevServices, alertRules);

          if (update.newAlerts.length > 0) {
            update.newAlerts.forEach((alert) => {
              dispatchAlert(alert, mobileConfig);
            });
            setAlerts((prevAlerts) => [...update.newAlerts, ...prevAlerts]);
          }

          setHistory((prevHistory) => {
            const newPoint: MetricHistoryPoint = {
              time: new Date(update.metrics.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }),
              timestamp: update.metrics.timestamp,
              cpu: update.metrics.cpu.usagePct,
              memory: Number(
                ((update.metrics.memory.usedBytes / update.metrics.memory.totalBytes) * 100).toFixed(1)
              ),
              networkRxKb: Math.floor(update.metrics.network.rxSpeedBytes / 1024),
              networkTxKb: Math.floor(update.metrics.network.txSpeedBytes / 1024),
              tempC: update.metrics.cpu.tempC,
            };
            return [...prevHistory.slice(-29), newPoint];
          });

          if (selectedService) {
            const updatedSelected = update.services.find((s) => s.id === selectedService.id);
            if (updatedSelected) {
              setSelectedService(updatedSelected);
            }
          }

          return update.services;
        });

        return prevMetrics;
      });
    }, streamIntervalMs);

    return () => clearInterval(timer);
  }, [isStreaming, streamIntervalMs, alertRules, mobileConfig, selectedService]);

  // Service Management Handlers
  const handleSaveService = (service: ServerService) => {
    setServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.map((s) => (s.id === service.id ? service : s));
      }
      return [service, ...prev];
    });
    if (selectedService && selectedService.id === service.id) {
      setSelectedService(service);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    if (selectedService?.id === serviceId) {
      setSelectedService(null);
    }
  };

  const handlePingService = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        const newLatency = Math.floor(3 + Math.random() * 8);
        const newPoint = {
          timestamp: Date.now(),
          latency: newLatency,
          status: s.status,
        };
        const updated = {
          ...s,
          latencyMs: newLatency,
          lastChecked: Date.now(),
          history: [...s.history.slice(-23), newPoint],
        };
        if (selectedService?.id === serviceId) {
          setSelectedService(updated);
        }
        return updated;
      })
    );
  };

  const handleToggleServiceStatus = (serviceId: string, status: ServerService['status']) => {
    const now = Date.now();
    const newLatency = status === 'down' ? 0 : Math.floor(2 + Math.random() * 4);

    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        return {
          ...s,
          status,
          latencyMs: newLatency,
          lastChecked: now,
          history: [...s.history.slice(-23), { timestamp: now, latency: newLatency, status }],
        };
      })
    );

    setSelectedService((prevSelected) => {
      if (prevSelected && prevSelected.id === serviceId) {
        return {
          ...prevSelected,
          status,
          latencyMs: newLatency,
          lastChecked: now,
          history: [...prevSelected.history.slice(-23), { timestamp: now, latency: newLatency, status }],
        };
      }
      return prevSelected;
    });

    if (status === 'down') {
      const srv = services.find((s) => s.id === serviceId);
      const newAlert: AlertEvent = {
        id: `alert-down-${Date.now()}`,
        serviceId,
        serviceName: srv?.name || serviceId,
        title: `Service Stopped: ${srv?.name || serviceId}`,
        message: `Docker container ${srv?.dockerContainer || srv?.name} was stopped. Service is now OFFLINE.`,
        severity: 'critical',
        timestamp: now,
        acknowledged: false,
        channel: ['Web Push', 'ntfy'],
      };
      setAlerts((prev) => [newAlert, ...prev]);
      dispatchAlert(newAlert, mobileConfig);
    }
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    setAlertRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, enabled } : r)));
  };

  const handleToggleRuleMobile = (ruleId: string, mobilePush: boolean) => {
    setAlertRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, mobilePush } : r)));
  };

  const handleUpdateRuleThreshold = (ruleId: string, threshold: number) => {
    setAlertRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, threshold } : r)));
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const unreadAlertCount = useMemo(() => {
    return alerts.filter((a) => !a.acknowledged).length;
  }, [alerts]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0b0c0e] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Live Alert Notification Strip */}
      <AlertBanner
        alerts={alerts}
        onAcknowledge={handleAcknowledgeAlert}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
        onNavigateToRules={() => setActiveTab('feeds')}
      />

      {/* Dynacat Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'mobile') {
            setIsMobileModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onAddService={() => {
          setServiceToEdit(null);
          setIsServiceModalOpen(true);
        }}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
        onOpenDockerModal={() => setIsDockerModalOpen(true)}
        isDark={isDark}
        toggleTheme={() => setIsDark((prev) => !prev)}
        unreadAlertCount={unreadAlertCount}
        linkMode={linkMode}
        onToggleLinkMode={() => setLinkMode((prev) => (prev === 'lan' ? 'subdomain' : 'lan'))}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex overflow-hidden pb-16 md:pb-0">
        {/* Render Tab 1: Authentic Minimalist Dynacat Dashboard */}
        {activeTab === 'home' && (
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-12">
            <DynacatDashboard
              services={services}
              metrics={metrics}
              quickLinks={quickLinks}
              onSelectService={(service) => setSelectedService(service)}
              onAddService={() => {
                setServiceToEdit(null);
                setIsServiceModalOpen(true);
              }}
              onOpenMobileModal={() => setIsMobileModalOpen(true)}
              linkMode={linkMode}
              onToggleLinkMode={() => setLinkMode((prev) => (prev === 'lan' ? 'subdomain' : 'lan'))}
            />
          </main>
        )}

        {/* Render Tab 2: Detailed Telemetry View with Services Sidebar */}
        {activeTab === 'sidebar' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <Sidebar
              services={services}
              selectedServiceId={selectedService?.id || null}
              onSelectService={(service) => setSelectedService(service)}
              onAddService={() => {
                setServiceToEdit(null);
                setIsServiceModalOpen(true);
              }}
              onPingService={handlePingService}
            />

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="max-w-5xl mx-auto space-y-6">
                <MetricsOverview
                  metrics={metrics}
                  history={history}
                  isStreaming={isStreaming}
                  onToggleStreaming={() => setIsStreaming((prev) => !prev)}
                  streamIntervalMs={streamIntervalMs}
                  onChangeInterval={(ms) => setStreamIntervalMs(ms)}
                  spikeMode={spikeMode}
                  onSetSpikeMode={(mode) => setSpikeMode(mode)}
                  onNavigateToTab={(tab) => {
                    if (tab === 'mobile') setIsMobileModalOpen(true);
                    else if (tab === 'rules') setActiveTab('feeds');
                  }}
                />

                <DisksView disks={metrics.disks} />
              </div>
            </main>
          </div>
        )}

        {/* Render Tab 3: Feeds & Mobile Alerts Configuration */}
        {activeTab === 'feeds' && (
          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
              <AlertRulesView
                rules={alertRules}
                alerts={alerts}
                config={mobileConfig}
                onToggleRule={handleToggleRule}
                onToggleRuleMobile={handleToggleRuleMobile}
                onUpdateRuleThreshold={handleUpdateRuleThreshold}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onClearAlertHistory={() => setAlerts([])}
                onOpenMobileModal={() => setIsMobileModalOpen(true)}
              />
            </div>
          </main>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
        unreadAlertCount={unreadAlertCount}
      />

      {/* Service Detail Drawer */}
      <ServiceDetailDrawer
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onEdit={(srv) => {
          setServiceToEdit(srv);
          setIsServiceModalOpen(true);
        }}
        onDelete={handleDeleteService}
        onPing={handlePingService}
        onToggleStatus={handleToggleServiceStatus}
      />

      {/* Add / Edit Service Modal */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => {
          setIsServiceModalOpen(false);
          setServiceToEdit(null);
        }}
        onSave={handleSaveService}
        serviceToEdit={serviceToEdit}
        serverIp={metrics.network.ipAddress}
      />

      {/* Mobile Alerts & Pairing Modal */}
      <MobileAlertsModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        config={mobileConfig}
        onUpdateConfig={(newConfig) => setMobileConfig(newConfig)}
      />

      {/* Docker Deployment Modal */}
      <DockerModal
        isOpen={isDockerModalOpen}
        onClose={() => setIsDockerModalOpen(false)}
      />
    </div>
  );
}
