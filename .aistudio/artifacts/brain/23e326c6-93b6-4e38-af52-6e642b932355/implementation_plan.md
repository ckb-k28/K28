# Mobile-First PWA Experience & ntfy Lock-Screen Telemetry

Enhance PulseNOC with responsive mobile ergonomics, standalone Progressive Web App (PWA) installation for iOS and Android home screens, thumb-zone navigation, and instant lock-screen alerts powered by ntfy.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following choices were confirmed based on your preferences:
> - **Primary Access Model**: Responsive Web App with PWA Home Screen Installation (standalone display mode, offline cache, native home screen launcher icon).
> - **Primary Alert Delivery**: Free instant lock screen push notifications via **ntfy** (zero account setup required, native sound and vibration).
> - **Ergonomic Design**: Sticky mobile bottom navigation bar in natural thumb reach zone with 44px+ hitboxes, adaptive 1-to-2 column Glance grid, and slide-up touch drawers.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms PulseNOC from a desktop-centric homelab dashboard into a responsive, touch-ergonomic mobile application that can be added to an iPhone or Android home screen as a standalone app.
- **Target Audience / Persona**: Self-hosters, homelab enthusiasts, and server administrators who need to monitor server telemetry and respond to service downtime directly on their smartphones while away from their desks.
- **Key Value**:
  - Immediate notification on phone lock screen within &lt;100ms when any service fails or metric threshold is breached.
  - Zero-friction mobile access with 1-tap launcher icon on home screen (no browser address bar or bottom chrome taking up screen space).
  - One-handed thumb control for navigating services, triggering ping probes, and launching dashboards.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Mobile Pairing & Discovery Flow**:
   - User opens the desktop monitor or scans the pairing QR code with their phone camera.
   - Dashboard detects mobile viewport (`max-width: 768px`) or standalone PWA launch.
   - Discreet floating/header prompt: **"Install App"** (or iOS Safari "Add to Home Screen" guided sheet).
2. **Glance Monitoring on Smartphone**:
   - Top Bar: Compact header showing server status (`hydra-server-node1 · live`) and quick search trigger.
   - Main Canvas: 1-to-2 column responsive Glance grid with large touch targets ($48\text{px}$ row height), authentic service brand icons, and clear status checkmarks.
   - Proxmox Health Strip: Horizontal swipe/stack displaying CPU %, RAM %, and Storage available with clean progress bars.
   - One-handed Bottom Navigation Bar: Anchored in the natural thumb zone (`Home`, `Services`, `Feeds`, `Alerts`, `Settings`).
3. **ntfy Lock-Screen Push Notification Flow**:
   - A dedicated 1-tap "Connect ntfy to this phone" button that deep-links directly into the ntfy app with the server's unique topic subscribed automatically (`ntfy://subscribe?...` or instant web link).
   - Test button to verify phone ring/vibrate immediately.
   - Alerts contain high-priority tags and direct click actions linking back to the failing service.

### Visual Identity & Theme (Glance Obsidian Dark)

- **Canvas & Surfaces**: Pitch obsidian background (`#0b0c0e`) with surface cards (`#13151b`) and subtle borders (`#1e222d`).
- **Typography & Proportions**:
  - Monospace telemetry figures in `JetBrains Mono` (`tabular-nums`) for jitter-free live numbers.
  - Display titles in `Plus Jakarta Sans`.
  - Amber `#f59e0b` active tab indicator and high-contrast green `#22c55e` status checkmarks.
- **Touch Ergonomics & Thumb Zone**:
  - Touch hitboxes: $\ge 44 \times 44\text{px}$ across all buttons and service cards.
  - Mobile bottom navigation bar ($56\text{px}$) keeping critical tabs within natural reach.
  - Service detail view renders as a smooth slide-up **bottom sheet** with a drag-handle indicator rather than a desktop right-hand panel.

---

## 3. Key Product Decisions & Trade-Offs

- **PWA vs Native App Store Build**:
  - *Chosen*: Progressive Web App (PWA) with Web App Manifest, Service Worker caching, and iOS `apple-touch-icon`.
  - *Why*: Installs directly from your self-hosted server onto iOS and Android with zero App Store review delays or developer account fees, running standalone without browser chrome.
- **Alert Dispatch Engine (ntfy First)**:
  - *Chosen*: ntfy HTTP push API as the primary channel, backed by browser Web Push as secondary fallback.
  - *Why*: Web Push on iOS Safari requires explicit user gestures, HTTPS certificates, and iOS 16.4+ standalone installs, whereas ntfy delivers guaranteed lock-screen push notifications with custom priorities, sound, and vibration across all mobile OS versions.
- **Responsive Layout Strategy**:
  - *Chosen*: Adaptive CSS grid (4 columns on desktop `lg:`, 2 columns on tablet `sm:`, 1 column on mobile) with fixed thumb-zone bottom navigation bar visible only on `<768px` viewports.

---

## 4. Technical Architecture & Data Strategy

### System Component Architecture

```
┌────────────────────────────────────────────────────────┐
│                      Mobile PWA                        │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Mobile Header (Hostname, Live Dot, Install CTA)  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Adaptive Glance View (1-Col Touch Cards)         │  │
│  │  • INFRASTRUCTURE (Proxmox, AdGuard, Vault...)   │  │
│  │  • APPS (Home Assistant, Hermes, Budget Flow)    │  │
│  │  • MEDIA (Jellyfin, Seer, Calibre, Watcharr)     │  │
│  │  • DOWNLOADS (SABnzbd, MeTube, Radarr, Sonarr)   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ System Health Bars (CPU, RAM, Disks)             │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Fixed Thumb-Zone Bottom Tab Bar (Home/Feed/Alert)│  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
    ┌───────────────────┐       ┌──────────────────┐
    │  Web App Manifest │       │  ntfy Push API   │
    │  & Service Worker │       │  (Lock-Screen)   │
    └───────────────────┘       └──────────────────┘
```

### Key Implementation Sub-Tasks

1. **Web App Manifest & PWA Assets**:
   - Configure `public/manifest.json` with `display: 'standalone'`, theme color `#0b0c0e`, and responsive icons.
   - Configure `index.html` with iOS viewport fit (`viewport-fit=cover`), `apple-touch-icon`, and status bar style.
2. **Mobile Navigation & Bottom Bar**:
   - Create `MobileBottomNav.tsx` active on viewports `< md` (Home, Feeds, Telemetry, Alerts).
   - Ensure sticky elements consume $<15\%$ of vertical mobile viewport.
3. **Mobile Touch Adjustments for GlanceDashboard**:
   - Single-column / two-column fluid card layout on smaller viewports with $48\text{px}$ touch targets.
   - Transform `ServiceDetailDrawer.tsx` into a bottom sheet on mobile screens.
4. **ntfy Deep-Linking & One-Tap Subscription**:
   - Direct link button `ntfy://subscribe?topic=...` to automatically open the ntfy app and subscribe on mobile.
