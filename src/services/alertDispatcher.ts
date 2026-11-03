import { AlertEvent, MobileAlertConfig, AlertSeverity } from '../types/server';

// Web Audio sound synthesizer for instant hardware alerts
class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playAlert(severity: AlertSeverity) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (severity === 'critical') {
        // High-low-high alert beacon
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(440, now + 0.12);
        osc.frequency.setValueAtTime(880, now + 0.24);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (severity === 'warning') {
        // Double warning beep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        // Info chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  }
}

export const soundSynth = new SoundSynthesizer();

/**
 * Request browser push notification permission
 */
export async function requestWebPushPermission(): Promise<'default' | 'granted' | 'denied'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

/**
 * Dispatch an alert across all active channels: Browser Web Push, Mobile Vibration,
 * ntfy.sh direct push to phone, Discord Webhook, Telegram
 */
export async function dispatchAlert(
  alert: AlertEvent,
  config: MobileAlertConfig
): Promise<string[]> {
  const dispatchedChannels: string[] = [];

  // 1. Audio chime if enabled
  if (config.soundAlertsEnabled) {
    soundSynth.playAlert(alert.severity);
  }

  // 2. Mobile hardware vibration if supported
  if (config.vibrateEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (alert.severity === 'critical') {
        navigator.vibrate([250, 100, 250, 100, 400]);
      } else {
        navigator.vibrate([200, 100, 200]);
      }
    } catch {
      // Ignored if vibration not permitted
    }
  }

  // 3. Browser Push Notification
  if (
    config.webPushEnabled &&
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    try {
      const notif = new Notification(`[${alert.severity.toUpperCase()}] ${alert.title}`, {
        body: alert.message,
        icon: '/icon.svg',
        tag: alert.id,
      });
      notif.onclick = () => {
        window.focus();
      };
      dispatchedChannels.push('Web Push');
    } catch (e) {
      console.warn('Browser push notification failed:', e);
    }
  }

  // 4. ntfy.sh Direct Mobile Push (Delivers directly to user phone lock screen)
  if (config.ntfyEnabled && config.ntfyTopic.trim()) {
    try {
      const topic = config.ntfyTopic.trim().replace(/^https?:\/\/[^/]+\//, '');
      const server = config.ntfyServer.trim().replace(/\/$/, '') || 'https://ntfy.sh';
      const endpoint = `${server}/${encodeURIComponent(topic)}`;

      const priority = alert.severity === 'critical' ? 'urgent' : alert.severity === 'warning' ? 'high' : 'default';
      const tags = alert.severity === 'critical' ? 'rotating_light,fire' : alert.severity === 'warning' ? 'warning' : 'information_source';

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Title': `[${alert.severity.toUpperCase()}] ${alert.title}`,
          'Priority': priority,
          'Tags': tags,
        },
        body: alert.message,
      });
      dispatchedChannels.push('ntfy.sh (Mobile)');
    } catch (e) {
      console.warn('ntfy push failed:', e);
    }
  }

  // 5. Discord Webhook integration
  if (config.discordWebhookEnabled && config.discordWebhookUrl.trim()) {
    try {
      const color = alert.severity === 'critical' ? 14423100 : alert.severity === 'warning' ? 14251782 : 3066993;
      await fetch(config.discordWebhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: `🚨 Server Alert: ${alert.title}`,
              description: alert.message,
              color,
              timestamp: new Date(alert.timestamp).toISOString(),
              fields: [
                { name: 'Severity', value: alert.severity.toUpperCase(), inline: true },
                { name: 'Service', value: alert.serviceName || 'Host Node', inline: true },
              ],
            },
          ],
        }),
      });
      dispatchedChannels.push('Discord');
    } catch (e) {
      console.warn('Discord webhook dispatch failed:', e);
    }
  }

  // 6. Telegram Bot integration
  if (config.telegramEnabled && config.telegramBotToken.trim() && config.telegramChatId.trim()) {
    try {
      const token = config.telegramBotToken.trim();
      const chatId = config.telegramChatId.trim();
      const text = `🚨 *Server Alert: ${alert.title}*\nSeverity: \`${alert.severity.toUpperCase()}\`\nService: ${alert.serviceName || 'System'}\n${alert.message}`;

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
        }),
      });
      dispatchedChannels.push('Telegram');
    } catch (e) {
      console.warn('Telegram alert dispatch failed:', e);
    }
  }

  return dispatchedChannels;
}
