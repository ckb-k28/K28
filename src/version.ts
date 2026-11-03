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
  version: '2026.11.03.4',
  year: 2026,
  month: 11,
  day: 3,
  build: 4,
  releaseDate: '2026-11-03',
  format: 'Year.month.day.build#',
  changes: [
    'Fixed GitHub Docker build error on "npm ci --omit=dev" by aligning tailwindcss peer dependencies and using npm install --legacy-peer-deps (Build #4)',
    'Added comprehensive GitHub README.md with Dockhand Git Repository Stack setup, port architecture, and full 19-service directory (Build #3)',
    'Added GitHub Actions CI/CD workflow (.github/workflows/docker-publish.yml) & Dockhand Git Stack support (Build #2)',
    'Sanitized repository files so no API keys are hardcoded when pushing to GitHub',
    'Adopted Year.month.day.build# versioning scheme (2026.11.03.4)',
    'Configured app on port 3001 and Dynacat on port 8081',
    'Dockhand API integration on port 3866 (LAN 10.0.0.100 & https://docker.bycamiel.nl)'
  ]
};

export const APP_VERSION = CURRENT_VERSION.version;
