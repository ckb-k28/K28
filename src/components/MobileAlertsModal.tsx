import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Bell,
  Radio,
  Volume2,
  Copy,
  Check,
  Send,
  ExternalLink,
  ShieldAlert,
  X,
  MessageSquare,
  QrCode,
  Zap,
} from 'lucide-react';
import { MobileAlertConfig } from '../types/server';
import { requestWebPushPermission, dispatchAlert, soundSynth } from '../services/alertDispatcher';

interface MobileAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MobileAlertConfig;
  onUpdateConfig: (newConfig: MobileAlertConfig) => void;
}

export const MobileAlertsModal: React.FC<MobileAlertsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'ntfy' | 'browser' | 'qr' | 'webhooks'>('ntfy');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedTopic, setCopiedTopic] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Generate QR code for mobile pairing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      QRCode.toDataURL(currentUrl, { width: 220, margin: 1 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('QR code generation failed:', err));
    }
  }, []);

  if (!isOpen) return null;

  const handleRequestPush = async () => {
    const perm = await requestWebPushPermission();
    onUpdateConfig({
      ...config,
      webPushPermission: perm,
      webPushEnabled: perm === 'granted',
    });
  };

  const handleCopyTopic = () => {
    navigator.clipboard.writeText(config.ntfyTopic);
    setCopiedTopic(true);
    setTimeout(() => setCopiedTopic(false), 2000);
  };

  const handleSendTestAlert = async (severity: 'critical' | 'warning' = 'critical') => {
    setIsSendingTest(true);
    setTestStatus('Dispatching alert...');

    const testEvent = {
      id: `test-${Date.now()}`,
      title: severity === 'critical' ? 'High Temperature Alert (82°C)' : 'Service Latency Warning',
      message:
        severity === 'critical'
          ? 'CPU package temperature reached 82.4°C on hydra-server-node1. Fans running at 1800 RPM.'
          : 'Plex Media Server response time spiked to 195ms. Transcoder load high.',
      severity,
      timestamp: Date.now(),
      acknowledged: false,
      channel: [],
    };

    try {
      const dispatched = await dispatchAlert(testEvent, config);
      setTestStatus(`Alert dispatched to: ${dispatched.join(', ') || 'Sound/Local'}`);
    } catch {
      setTestStatus('Failed to dispatch alert. Check your network/topic.');
    } finally {
      setIsSendingTest(false);
      setTimeout(() => setTestStatus(null), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Mobile Device Alert Configuration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive instant home server notifications directly on your smartphone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 gap-2 bg-slate-50/60 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveTab('ntfy')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ntfy'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Instant Mobile Push (ntfy)</span>
          </button>
          <button
            onClick={() => setActiveTab('browser')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'browser'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Web Push & Audio</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Pair Phone (QR)</span>
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'webhooks'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Discord & Telegram</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: ntfy.sh (The Homelab Gold Standard for Mobile Push) */}
          {activeTab === 'ntfy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                  <Radio className="w-4 h-4 text-emerald-500" />
                  <span>How ntfy.sh Direct Mobile Push Works</span>
                </div>
                <p className="text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  ntfy is a free, open-source HTTP-based notification service with native iOS and Android apps.
                  No accounts or API keys required! Whenever an alert triggers on your server, a message is immediately pushed to your mobile device lock screen.
                </p>
              </div>

              {/* Step 1: Install App */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Step 1: Install free ntfy mobile app
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <a
                    href="https://apps.apple.com/app/ntfy/id1625396347"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <span>App Store (iOS)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=io.heckel.ntfy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <span>Google Play (Android)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-xs text-slate-400">or open ntfy.sh in mobile browser</span>
                </div>
              </div>

              {/* Step 2: Configure Topic */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Step 2: Your Private Alert Topic
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      ntfy.sh/
                    </span>
                    <input
                      type="text"
                      value={config.ntfyTopic}
                      onChange={(e) => onUpdateConfig({ ...config, ntfyTopic: e.target.value })}
                      placeholder="homeserver-alerts-xyz"
                      className="w-full pl-18 pr-3 py-2 text-xs font-mono font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    onClick={handleCopyTopic}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
                  >
                    {copiedTopic ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedTopic ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  In your phone's ntfy app, tap <strong>+ (Subscribe)</strong> and enter this topic name, or tap below to open immediately:
                </p>

                <a
                  href={`https://ntfy.sh/${encodeURIComponent(config.ntfyTopic.trim())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 rounded-lg transition-colors shadow-xs"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>1-Tap Subscribe on This Phone</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Step 3: Trigger Live Mobile Push Test */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Step 3: Test Push Notification on Phone
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendTestAlert('critical')}
                    disabled={isSendingTest || !config.ntfyTopic.trim()}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Critical Test Alert</span>
                  </button>
                  <button
                    onClick={() => handleSendTestAlert('warning')}
                    disabled={isSendingTest || !config.ntfyTopic.trim()}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 rounded-lg transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Send Warning Alert</span>
                  </button>
                </div>
                {testStatus && (
                  <p className="mt-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    {testStatus}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Web Push & Hardware Audio */}
          {activeTab === 'browser' && (
            <div className="space-y-5">
              {/* Web Push Permission Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Browser Native Notifications
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                      config.webPushPermission === 'granted'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : config.webPushPermission === 'denied'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Permission: {config.webPushPermission.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Allows notifications even when this browser tab is running in the background or minimized.
                </p>

                {config.webPushPermission !== 'granted' ? (
                  <button
                    onClick={handleRequestPush}
                    className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Enable Browser Push Notifications</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendTestAlert('critical')}
                    className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Browser Test Push</span>
                  </button>
                )}
              </div>

              {/* Hardware Sound & Vibration */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Audio & Vibration
                </h4>

                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Synthesizer Sound Alerts
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Plays hardware beacon chimes on critical errors or thresholds
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => soundSynth.playAlert('critical')}
                      className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-300 dark:border-slate-700"
                    >
                      Test Audio
                    </button>
                    <input
                      type="checkbox"
                      checked={config.soundAlertsEnabled}
                      onChange={(e) => onUpdateConfig({ ...config, soundAlertsEnabled: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Mobile Hardware Haptic Vibration
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Vibrates phone when viewing on mobile device (250ms pulse)
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.vibrateEnabled}
                    onChange={(e) => onUpdateConfig({ ...config, vibrateEnabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Pair Phone with QR Code */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200 inline-block">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Scan to pair mobile device" className="w-48 h-48 rounded-lg" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                    Generating QR code...
                  </div>
                )}
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Scan with your Phone Camera
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Open this monitoring dashboard on your mobile phone. You can install it directly to your home screen
                  (iOS: Share → "Add to Home Screen"; Android: "Install App") for a native fullscreen monitoring experience!
                </p>
              </div>

              <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 max-w-full overflow-hidden">
                <span className="truncate">{typeof window !== 'undefined' ? window.location.href : ''}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedTopic(true);
                    setTimeout(() => setCopiedTopic(false), 2000);
                  }}
                  className="shrink-0 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  {copiedTopic ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Discord & Telegram Webhooks */}
          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              {/* Discord Webhook */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Discord Channel Webhook
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.discordWebhookEnabled}
                    onChange={(e) => onUpdateConfig({ ...config, discordWebhookEnabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
                <input
                  type="url"
                  value={config.discordWebhookUrl}
                  onChange={(e) => onUpdateConfig({ ...config, discordWebhookUrl: e.target.value })}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Telegram Bot */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Telegram Bot Alerts
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.telegramEnabled}
                    onChange={(e) => onUpdateConfig({ ...config, telegramEnabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={config.telegramBotToken}
                    onChange={(e) => onUpdateConfig({ ...config, telegramBotToken: e.target.value })}
                    placeholder="Bot API Token (123456:ABC-DEF...)"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={config.telegramChatId}
                    onChange={(e) => onUpdateConfig({ ...config, telegramChatId: e.target.value })}
                    placeholder="Target Chat ID"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="text-[11px] text-slate-500">
            Alerts delivered with &lt;100ms latency to all enabled targets.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
