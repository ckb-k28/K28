export type ServiceStatus = 'up' | 'warning' | 'down' | 'maintenance';

export type ServiceCategory =
  | 'Infrastructure'
  | 'Apps'
  | 'Media'
  | 'Downloads & Automation'
  | 'Smart Home'
  | 'Network & DNS'
  | 'Storage & Backup'
  | 'Development'
  | 'Security'
  | 'Other';

export interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

export interface ServerService {
  id: string;
  name: string;
  category: ServiceCategory;
  url: string;
  dashboardUrl: string;
  port: number;
  status: ServiceStatus;
  uptimePct: number;
  latencyMs: number;
  lastChecked: number;
  description: string;
  dockerContainer?: string;
  internalIp?: string;
  sslEnabled?: boolean;
  history: Array<{ timestamp: number; latency: number; status: ServiceStatus }>;
}

export interface DiskVolume {
  id: string;
  name: string;
  mountPoint: string;
  filesystem: string;
  usedBytes: number;
  totalBytes: number;
  readSpeedBytes: number;
  writeSpeedBytes: number;
  tempC: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface CpuMetrics {
  usagePct: number;
  cores: number[];
  tempC: number;
  fanRpm: number;
  frequencyGhz: number;
  governor: string;
}

export interface MemoryMetrics {
  usedBytes: number;
  totalBytes: number;
  cachedBytes: number;
  swapUsedBytes: number;
  swapTotalBytes: number;
}

export interface NetworkMetrics {
  interfaceName: string;
  rxSpeedBytes: number;
  txSpeedBytes: number;
  totalRxBytes: number;
  totalTxBytes: number;
  pingGatewayMs: number;
  activeSockets: number;
  ipAddress: string;
}

export interface ServerMetrics {
  hostname: string;
  os: string;
  kernel: string;
  architecture: string;
  uptimeSeconds: number;
  loadAverage: [number, number, number];
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disks: DiskVolume[];
  network: NetworkMetrics;
  timestamp: number;
}

export interface MetricHistoryPoint {
  time: string;
  timestamp: number;
  cpu: number;
  memory: number;
  networkRxKb: number;
  networkTxKb: number;
  tempC: number;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertRule {
  id: string;
  name: string;
  metric: 'cpu' | 'memory' | 'disk' | 'temp' | 'service_down' | 'latency';
  operator: '>' | '<' | '==';
  threshold: number;
  durationSeconds: number;
  severity: AlertSeverity;
  enabled: boolean;
  mobilePush: boolean;
}

export interface AlertEvent {
  id: string;
  ruleId?: string;
  serviceId?: string;
  serviceName?: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: number;
  acknowledged: boolean;
  channel: string[];
}

export interface MobileAlertConfig {
  webPushEnabled: boolean;
  webPushPermission: 'default' | 'granted' | 'denied';
  ntfyEnabled: boolean;
  ntfyTopic: string;
  ntfyServer: string;
  soundAlertsEnabled: boolean;
  vibrateEnabled: boolean;
  discordWebhookEnabled: boolean;
  discordWebhookUrl: string;
  telegramEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
}
