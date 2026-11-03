export interface VersionInfo {
  version: string;
  year: number;
  month: number;
  day: number;
  build: number;
  releaseDate: string;
  format: string;
  changes: string[];
}

export const CURRENT_VERSION: VersionInfo = {
  version: '2026.11.03.1',
  year: 2026,
  month: 11,
  day: 3,
  build: 1,
  releaseDate: '2026-11-03',
  format: 'Year.month.day.build#',
  changes: [
    'Adopted Year.month.day.build# versioning scheme (2026.11.03.1)',
    'Configured app on port 3001 and Dynacat on port 8081',
    'Dockhand API integration on port 3866 (LAN 10.0.0.100 & https://docker.bycamiel.nl)',
    'Full homelab service directory with 19 bycamiel.nl subdomains',
    'PWA home screen install support and ntfy alert pairing'
  ]
};

export const APP_VERSION = CURRENT_VERSION.version;
