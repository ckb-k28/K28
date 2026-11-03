import { ServerMetrics, ServerService, AlertRule, AlertEvent } from '../types/server';

export interface TelemetryStateUpdate {
  metrics: ServerMetrics;
  services: ServerService[];
  newAlerts: AlertEvent[];
}

export class TelemetryEngine {
  private spikeMode: 'none' | 'cpu_spike' | 'mem_spike' | 'service_fail' = 'none';
  private consecutiveTriggers: Record<string, number> = {};

  setSpikeMode(mode: 'none' | 'cpu_spike' | 'mem_spike' | 'service_fail') {
    this.spikeMode = mode;
  }

  getSpikeMode() {
    return this.spikeMode;
  }

  tick(
    currentMetrics: ServerMetrics,
    currentServices: ServerService[],
    rules: AlertRule[]
  ): TelemetryStateUpdate {
    const now = Date.now();
    const newAlerts: AlertEvent[] = [];

    // 1. Calculate CPU metrics based on mode
    let targetCpuPct = 26 + (Math.random() * 12 - 6);
    let targetTemp = 43 + Math.random() * 4;

    if (this.spikeMode === 'cpu_spike') {
      targetCpuPct = 91.5 + Math.random() * 6;
      targetTemp = 82.0 + Math.random() * 3;
    }

    const cpuPct = Math.min(100, Math.max(5, Number(targetCpuPct.toFixed(1))));
    const cpuTemp = Number(targetTemp.toFixed(1));

    // Cores with natural variance
    const cores = currentMetrics.cpu.cores.map(() => {
      if (this.spikeMode === 'cpu_spike') {
        return Math.min(100, Math.floor(88 + Math.random() * 12));
      }
      return Math.min(100, Math.max(4, Math.floor(cpuPct + (Math.random() * 20 - 10))));
    });

    // 2. Memory metrics
    let targetMemUsed = 19.4 * 1024 * 1024 * 1024 + (Math.random() * 0.4 - 0.2) * 1024 * 1024 * 1024;
    if (this.spikeMode === 'mem_spike') {
      targetMemUsed = 60.8 * 1024 * 1024 * 1024; // 95% of 64GB
    }
    const memTotal = currentMetrics.memory.totalBytes;
    const memPct = (targetMemUsed / memTotal) * 100;

    // 3. Network speeds with realistic fluctuation
    const rxDelta = Math.floor(900 * 1024 + Math.random() * 1200 * 1024);
    const txDelta = Math.floor(450 * 1024 + Math.random() * 800 * 1024);
    const totalRx = currentMetrics.network.totalRxBytes + rxDelta * 2;
    const totalTx = currentMetrics.network.totalTxBytes + txDelta * 2;

    // 4. Disks I/O
    const updatedDisks = currentMetrics.disks.map((d) => ({
      ...d,
      readSpeedBytes: Math.floor(Math.random() * 8 * 1024 * 1024),
      writeSpeedBytes: Math.floor(Math.random() * 14 * 1024 * 1024),
    }));

    // 5. Build updated metrics
    const updatedMetrics: ServerMetrics = {
      ...currentMetrics,
      uptimeSeconds: currentMetrics.uptimeSeconds + 2,
      timestamp: now,
      loadAverage: [
        Number(((cpuPct / 100) * 4 + 0.4).toFixed(2)),
        Number((currentMetrics.loadAverage[1] * 0.95 + (cpuPct / 100) * 0.05 * 4).toFixed(2)),
        currentMetrics.loadAverage[2],
      ],
      cpu: {
        ...currentMetrics.cpu,
        usagePct: cpuPct,
        cores,
        tempC: cpuTemp,
        fanRpm: cpuTemp > 75 ? 1800 : cpuTemp > 60 ? 1200 : 840,
      },
      memory: {
        ...currentMetrics.memory,
        usedBytes: targetMemUsed,
      },
      disks: updatedDisks,
      network: {
        ...currentMetrics.network,
        rxSpeedBytes: rxDelta,
        txSpeedBytes: txDelta,
        totalRxBytes: totalRx,
        totalTxBytes: totalTx,
        pingGatewayMs: Number((1.1 + Math.random() * 0.4).toFixed(1)),
      },
    };

    // 6. Update Services (preserve stopped status and 0ms latency)
    const updatedServices: ServerService[] = currentServices.map((service) => {
      let status = service.status;
      let latency = 0;

      if (status === 'down') {
        latency = 0;
      } else if (status === 'warning') {
        latency = Math.max(120, Math.floor(service.latencyMs + (Math.random() * 20 - 10)));
      } else {
        latency = Math.max(1, Math.floor(service.latencyMs + (Math.random() * 4 - 2)));
      }

      if (this.spikeMode === 'service_fail' && (service.id === 'srv-radarr' || service.id === 'srv-nextcloud')) {
        status = 'down';
        latency = 0;
      }

      const history = [
        ...service.history.slice(-23),
        { timestamp: now, latency, status },
      ];

      return {
        ...service,
        status,
        latencyMs: latency,
        lastChecked: now,
        history,
      };
    });

    // 7. Check Alert Rules
    rules.forEach((rule) => {
      if (!rule.enabled) return;

      let isTriggered = false;
      let alertTitle = '';
      let alertMessage = '';
      let serviceRef: ServerService | undefined;

      if (rule.metric === 'cpu') {
        if (rule.operator === '>' && cpuPct > rule.threshold) {
          isTriggered = true;
          alertTitle = `High CPU Usage: ${cpuPct}%`;
          alertMessage = `Host CPU load is currently at ${cpuPct}% (Threshold: ${rule.threshold}%).`;
        }
      } else if (rule.metric === 'memory') {
        if (rule.operator === '>' && memPct > rule.threshold) {
          isTriggered = true;
          alertTitle = `High RAM Usage: ${memPct.toFixed(1)}%`;
          alertMessage = `System memory utilization reached ${memPct.toFixed(1)}% of 64GB total.`;
        }
      } else if (rule.metric === 'temp') {
        if (rule.operator === '>' && cpuTemp > rule.threshold) {
          isTriggered = true;
          alertTitle = `Thermal Warning: ${cpuTemp}°C`;
          alertMessage = `CPU package temperature reached ${cpuTemp}°C (Threshold: ${rule.threshold}°C).`;
        }
      } else if (rule.metric === 'service_down') {
        const downService = updatedServices.find((s) => s.status === 'down');
        if (downService) {
          isTriggered = true;
          serviceRef = downService;
          alertTitle = `Service Offline: ${downService.name}`;
          alertMessage = `${downService.name} on port :${downService.port} is unreachable. Health probe failed.`;
        }
      } else if (rule.metric === 'latency') {
        const slowService = updatedServices.find((s) => s.latencyMs > rule.threshold);
        if (slowService && slowService.status !== 'down') {
          isTriggered = true;
          serviceRef = slowService;
          alertTitle = `High Latency: ${slowService.name} (${slowService.latencyMs}ms)`;
          alertMessage = `${slowService.name} response time is ${slowService.latencyMs}ms, exceeding ${rule.threshold}ms threshold.`;
        }
      }

      const counterKey = `${rule.id}_${serviceRef ? serviceRef.id : 'host'}`;
      if (isTriggered) {
        this.consecutiveTriggers[counterKey] = (this.consecutiveTriggers[counterKey] || 0) + 1;
        // Check duration requirement (each tick is ~2 seconds)
        const requiredTicks = Math.max(1, Math.floor(rule.durationSeconds / 2));
        if (this.consecutiveTriggers[counterKey] === requiredTicks) {
          newAlerts.push({
            id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            ruleId: rule.id,
            serviceId: serviceRef?.id,
            serviceName: serviceRef?.name,
            title: alertTitle,
            message: alertMessage,
            severity: rule.severity,
            timestamp: now,
            acknowledged: false,
            channel: rule.mobilePush ? ['Web Push', 'ntfy.sh'] : [],
          });
        }
      } else {
        this.consecutiveTriggers[counterKey] = 0;
      }
    });

    return {
      metrics: updatedMetrics,
      services: updatedServices,
      newAlerts,
    };
  }
}
