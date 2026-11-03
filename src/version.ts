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
  version: '2026.11.03.10',
  year: 2026,
  month: 11,
  day: 3,
  build: 10,
  releaseDate: '2026-11-03',
  format: 'Year.month.day.build#',
  changes: [
    'Changed service cards to open links directly in a new tab on click and added a Pencil button to edit services (Build #10)',
    'Moved port numbers next to container names and redesigned all 19 service logos in the Kolenkachel Kleurenschema (Build #9)',
    'Moved dynacat v3.0.2 component from footer to sidebar menu and added full Dynacat Widgets, Components & Live YAML Studio (Build #8)',
    'Extended Kolenkachel Kleurenschema (#3A3D40, #E6E7E9, #D84315, #FF8F00, #00B4D8) across Feeds & Alerts and Detailed Telemetry tabs (Build #7)',
    'Applied official Kolenkachel Kleurenschema: Nacht (#3A3D40), Dag (#E6E7E9), Gloeiende Kolen (#D84315), Knisperend Vuur (#FF8F00), and Hete Vlamkern (#00B4D8) (Build #6)',
    'Moved header utility controls into a slide-out Hamburger Menu sidebar drawer and removed Tailscale from Other Links (Build #6)',
    'Replaced brand icon with custom Kolenkachel cast-iron coal/wood stove vector and moved version numbering to the footer (Build #5)'
  ]
};

export const APP_VERSION = CURRENT_VERSION.version;
