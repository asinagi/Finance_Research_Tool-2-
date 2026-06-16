import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Serve static assets
app.use('/static/*', serveStatic({ root: './' }))

// Main route — serves the full SPA shell
app.get('*', (c) => {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MACROQUANT — Unified Analytics Platform</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    /* ===== CSS RESET & ROOT VARIABLES ===== */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    :root {
      /* Color Palette */
      --bg-primary:    #0B0E14;
      --bg-secondary:  #12161F;
      --bg-tertiary:   #181D28;
      --bg-hover:      #1C2232;
      --border-color:  #21262D;
      --border-bright: #2D3444;

      /* Text */
      --text-primary:  #E6EDF3;
      --text-secondary:#8B949E;
      --text-muted:    #484F58;
      --text-accent:   #FFFFFF;

      /* Brand Accent */
      --accent-blue:   #3B82F6;
      --accent-cyan:   #22D3EE;
      --accent-purple: #A78BFA;
      --accent-teal:   #14B8A6;

      /* Status Colors */
      --green-neon:    #2EA043;
      --yellow-neon:   #D29922;
      --red-neon:      #FF7B72;
      --green-light:   #3FB950;
      --red-light:     #F85149;

      /* Chart Colors */
      --chart-1: #3B82F6;
      --chart-2: #22D3EE;
      --chart-3: #A78BFA;
      --chart-4: #F59E0B;
      --chart-5: #10B981;
      --chart-6: #F43F5E;

      /* Layout */
      --sidebar-width: 260px;
      --sidebar-collapsed: 64px;
      --header-height: 56px;
      --transition-speed: 0.3s;
    }

    html, body {
      height: 100%;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 13px;
    }

    /* ===== SCROLLBAR STYLING ===== */
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 2px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

    /* ===== MAIN SHELL ===== */
    #app-shell {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }

    /* ===== SIDEBAR ===== */
    #sidebar {
      width: var(--sidebar-width);
      min-width: var(--sidebar-width);
      height: 100vh;
      background-color: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: width var(--transition-speed) ease-in-out,
                  min-width var(--transition-speed) ease-in-out;
      z-index: 100;
      flex-shrink: 0;
    }

    #sidebar.collapsed {
      width: var(--sidebar-collapsed);
      min-width: var(--sidebar-collapsed);
    }

    /* Brand Header */
    .sidebar-brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--header-height);
      padding: 0 16px;
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
      min-width: 0;
    }

    .brand-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
    }

    .brand-title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: var(--text-accent);
      white-space: nowrap;
      overflow: hidden;
      opacity: 1;
      transition: opacity var(--transition-speed) ease-in-out;
    }

    #sidebar.collapsed .brand-title {
      opacity: 0;
      width: 0;
    }

    .sidebar-toggle-btn {
      width: 28px;
      height: 28px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      flex-shrink: 0;
      transition: all 0.2s;
    }

    .sidebar-toggle-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    /* Sidebar Navigation */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 8px 0;
    }

    .nav-section {
      margin-bottom: 4px;
    }

    .nav-section-title {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1px;
      color: var(--text-muted);
      text-transform: uppercase;
      padding: 8px 16px 4px;
      white-space: nowrap;
      overflow: hidden;
      opacity: 1;
      transition: opacity var(--transition-speed) ease-in-out;
    }

    #sidebar.collapsed .nav-section-title {
      opacity: 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      cursor: pointer;
      border-radius: 6px;
      margin: 1px 8px;
      transition: background 0.15s, color 0.15s;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      position: relative;
      user-select: none;
    }

    .nav-item:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: rgba(59, 130, 246, 0.12);
      color: var(--text-accent);
      font-weight: 600;
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 3px;
      background: var(--accent-blue);
      border-radius: 0 2px 2px 0;
      margin-left: 0;
    }

    .nav-item-index {
      font-size: 10px;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      width: 14px;
      flex-shrink: 0;
    }

    .nav-item-icon {
      font-size: 12px;
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }

    .nav-item-label {
      font-size: 12px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      opacity: 1;
      transition: opacity var(--transition-speed) ease-in-out;
    }

    #sidebar.collapsed .nav-item-label,
    #sidebar.collapsed .nav-item-index {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    /* Status badge */
    .nav-status-badge {
      margin-left: auto;
      font-size: 9px;
      padding: 1px 5px;
      border-radius: 10px;
      font-weight: 600;
      letter-spacing: 0.5px;
      flex-shrink: 0;
      transition: opacity var(--transition-speed) ease-in-out;
    }

    #sidebar.collapsed .nav-status-badge { opacity: 0; }

    .badge-active { background: rgba(46, 160, 67, 0.2); color: var(--green-neon); }
    .badge-focus  { background: rgba(59, 130, 246, 0.2); color: var(--accent-blue); }

    /* Health dot */
    .health-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
      position: relative;
    }

    .health-dot.healthy  { background: var(--green-neon); box-shadow: 0 0 6px var(--green-neon); }
    .health-dot.warning  { background: var(--yellow-neon); box-shadow: 0 0 6px var(--yellow-neon); }
    .health-dot.critical { background: var(--red-neon); box-shadow: 0 0 6px var(--red-neon); animation: pulse-red 1.5s infinite; }

    @keyframes pulse-red {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    /* Sidebar Footer */
    .sidebar-footer {
      border-top: 1px solid var(--border-color);
      padding: 10px 16px;
      flex-shrink: 0;
    }

    .sidebar-footer-info {
      font-size: 10px;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      white-space: nowrap;
      overflow: hidden;
      opacity: 1;
      transition: opacity var(--transition-speed) ease-in-out;
    }

    #sidebar.collapsed .sidebar-footer-info { opacity: 0; }

    /* ===== MAIN CONTENT AREA ===== */
    #main-area {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    /* Global Header */
    #global-header {
      height: var(--header-height);
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-secondary);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      flex-shrink: 0;
      gap: 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .header-breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .breadcrumb-module {
      font-size: 11px;
      color: var(--text-muted);
    }

    .breadcrumb-sep {
      color: var(--text-muted);
      font-size: 10px;
    }

    .breadcrumb-page {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-accent);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .sync-status {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 5px 10px;
    }

    .sync-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--green-neon);
      box-shadow: 0 0 6px var(--green-neon);
      animation: blink 2s infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .sync-text {
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-secondary);
    }

    .header-btn {
      width: 32px;
      height: 32px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      transition: all 0.2s;
    }

    .header-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
      border-color: var(--border-bright);
    }

    /* ===== WORKSPACE CONTENT ===== */
    #workspace {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      background: var(--bg-primary);
    }

    /* ===== PAGE VIEWS ===== */
    .page-view { display: none; }
    .page-view.active { display: block; }

    /* ===== CARD COMPONENT ===== */
    .card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-bottom: 1px solid var(--border-color);
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .card-title-icon {
      font-size: 12px;
      color: var(--accent-blue);
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-btn {
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s;
    }

    .card-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
    .card-btn.active { background: rgba(59,130,246,0.15); border-color: var(--accent-blue); color: var(--accent-blue); }

    .card-body { padding: 18px; }

    /* ===== PORTFOLIO & RISK PAGE ===== */
    .portfolio-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    /* Widget 1: Portfolio Summary */
    .portfolio-summary-widget .card-body {
      padding: 0;
    }

    .widget-inner-layout {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    /* Donut + KPI row */
    .donut-kpi-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      border-bottom: 1px solid var(--border-color);
    }

    .donut-panel {
      padding: 20px;
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .donut-container {
      position: relative;
      width: 140px;
      height: 140px;
    }

    .donut-center-label {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .donut-center-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-accent);
      font-family: 'JetBrains Mono', monospace;
      line-height: 1;
    }

    .donut-center-sub {
      font-size: 9px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .donut-legend {
      display: flex;
      flex-direction: column;
      gap: 5px;
      width: 100%;
    }

    .legend-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }

    .legend-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .legend-name {
      flex: 1;
      font-size: 10px;
      color: var(--text-secondary);
    }

    .legend-pct {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-primary);
      font-weight: 500;
    }

    .kpi-panel {
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
    }

    .kpi-card {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 10px 12px;
    }

    .kpi-label {
      font-size: 9px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }

    .kpi-value {
      font-size: 20px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-accent);
      line-height: 1;
    }

    .kpi-change {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      margin-top: 3px;
    }

    .positive { color: var(--green-light); }
    .negative { color: var(--red-light); }
    .neutral  { color: var(--text-secondary); }

    /* Risk Bars */
    .risk-panel {
      padding: 16px 20px;
    }

    .risk-title {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 12px;
    }

    .risk-bar-item {
      margin-bottom: 10px;
    }

    .risk-bar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .risk-bar-label {
      font-size: 10px;
      color: var(--text-secondary);
    }

    .risk-bar-value {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-primary);
    }

    .risk-bar-track {
      height: 5px;
      background: var(--bg-tertiary);
      border-radius: 3px;
      overflow: hidden;
    }

    .risk-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 1s ease-out;
    }

    .risk-fill-low    { background: linear-gradient(90deg, #2EA043, #3FB950); }
    .risk-fill-mid    { background: linear-gradient(90deg, #D29922, #F0B429); }
    .risk-fill-high   { background: linear-gradient(90deg, #F85149, #FF7B72); }

    /* Holdings table */
    .holdings-panel {
      padding: 16px 20px;
      border-top: 1px solid var(--border-color);
    }

    .holdings-table {
      width: 100%;
      border-collapse: collapse;
    }

    .holdings-table th {
      font-size: 9px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.7px;
      padding: 0 4px 6px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }

    .holdings-table th:not(:first-child) { text-align: right; }

    .holdings-table td {
      padding: 6px 4px;
      font-size: 11px;
      border-bottom: 1px solid rgba(33, 38, 45, 0.5);
    }

    .holdings-table tr:last-child td { border-bottom: none; }

    .holdings-table td:not(:first-child) {
      text-align: right;
      font-family: 'JetBrains Mono', monospace;
    }

    .asset-ticker {
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent-cyan);
    }

    .asset-name {
      font-size: 9px;
      color: var(--text-muted);
      margin-top: 1px;
    }

    /* Widget 2: Correlation Analysis */
    .correlation-widget .card-body { padding: 0; }

    .corr-inner-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
    }

    .heatmap-panel {
      padding: 20px;
      border-right: 1px solid var(--border-color);
    }

    .heatmap-panel-title {
      font-size: 10px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 12px;
    }

    .heatmap-grid {
      display: grid;
      gap: 2px;
    }

    .heatmap-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      border-radius: 3px;
      cursor: pointer;
      transition: transform 0.1s;
      aspect-ratio: 1;
    }

    .heatmap-cell:hover { transform: scale(1.1); z-index: 1; }

    .heatmap-header-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: 600;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .heatmap-label-cell {
      display: flex;
      align-items: center;
      font-size: 9px;
      font-weight: 600;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .timeline-panel {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .timeline-panel-title {
      font-size: 10px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .period-selector {
      display: flex;
      gap: 4px;
    }

    .period-btn {
      font-size: 9px;
      padding: 3px 7px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      transition: all 0.15s;
    }

    .period-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
    .period-btn.active { background: rgba(59,130,246,0.15); border-color: var(--accent-blue); color: var(--accent-blue); }

    .timeline-chart-container { flex: 1; min-height: 200px; }

    /* Heatmap full-width row */
    .heatmap-correlation-row {
      border-top: 1px solid var(--border-color);
    }

    /* ===== PLACEHOLDER PAGES ===== */
    .placeholder-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: calc(100vh - 56px - 48px);
      gap: 16px;
      color: var(--text-muted);
    }

    .placeholder-icon {
      font-size: 48px;
      opacity: 0.3;
    }

    .placeholder-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .placeholder-desc {
      font-size: 12px;
      color: var(--text-muted);
      text-align: center;
      max-width: 320px;
      line-height: 1.6;
    }

    .placeholder-badge {
      font-size: 10px;
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid var(--border-bright);
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    /* ===== TOOLTIP ===== */
    .tooltip-container { position: relative; }
    .tooltip-popup {
      display: none;
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-hover);
      border: 1px solid var(--border-bright);
      border-radius: 5px;
      padding: 5px 9px;
      font-size: 10px;
      color: var(--text-primary);
      white-space: nowrap;
      z-index: 999;
      pointer-events: none;
      font-family: 'JetBrains Mono', monospace;
    }
    .tooltip-container:hover .tooltip-popup { display: block; }

    /* ===== SEPARATOR ===== */
    .section-divider {
      height: 1px;
      background: var(--border-color);
      margin: 4px 0;
    }

    /* ===== SCROLLABLE CONTENT AREA ===== */
    .scroll-area { overflow-y: auto; }

    /* ===== RESPONSIVE ADJUSTMENTS ===== */
    @media (max-width: 1280px) {
      .portfolio-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 900px) {
      .donut-kpi-row { grid-template-columns: 1fr; }
      .corr-inner-layout { grid-template-columns: 1fr; }
    }

    /* ===== ANIMATED ENTRY ===== */
    .fade-in {
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ===== MARKET PULSE STRIP ===== */
    .market-pulse-strip {
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 14px;
      margin-bottom: 20px;
      overflow-x: auto;
    }

    .pulse-item {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .pulse-ticker {
      font-size: 10px;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-secondary);
    }

    .pulse-value {
      font-size: 11px;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }

    .pulse-chg {
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
    }

    .pulse-sep {
      width: 1px;
      height: 16px;
      background: var(--border-color);
      flex-shrink: 0;
    }

    /* ===== NAV ITEM TOOLTIP FOR COLLAPSED ===== */
    #sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 8px;
    }
    #sidebar.collapsed .nav-item-icon { width: auto; }
  </style>
</head>
<body>
  <div id="app-shell">

    <!-- ===== LEFT SIDEBAR ===== -->
    <nav id="sidebar">
      <!-- Brand -->
      <div class="sidebar-brand">
        <div class="brand-logo">
          <div class="brand-icon">⚡</div>
          <span class="brand-title">MACROQUANT</span>
        </div>
        <button class="sidebar-toggle-btn" id="sidebar-toggle" title="사이드바 토글">
          <i class="fas fa-bars"></i>
        </button>
      </div>

      <!-- Navigation -->
      <div class="sidebar-nav" id="sidebar-nav">

        <!-- Module Section -->
        <div class="nav-section">
          <div class="nav-section-title">모듈</div>

          <div class="nav-item" data-page="issue" data-label="이슈 수집·요약·태깅">
            <span class="nav-item-index">01</span>
            <span class="nav-item-icon"><i class="fas fa-rss"></i></span>
            <span class="nav-item-label">이슈 수집·요약·태깅</span>
            <span class="nav-status-badge badge-active">LIVE</span>
          </div>

          <div class="nav-item" data-page="research" data-label="리서치 클러스터">
            <span class="nav-item-index">02</span>
            <span class="nav-item-icon"><i class="fas fa-network-wired"></i></span>
            <span class="nav-item-label">리서치 클러스터</span>
          </div>

          <div class="nav-item" data-page="calendar" data-label="매크로 캘린더">
            <span class="nav-item-index">03</span>
            <span class="nav-item-icon"><i class="fas fa-calendar-alt"></i></span>
            <span class="nav-item-label">매크로 캘린더</span>
          </div>

          <div class="nav-item" data-page="regime" data-label="국면 모니터">
            <span class="nav-item-index">04</span>
            <span class="nav-item-icon"><i class="fas fa-chart-radar"></i></span>
            <span class="nav-item-label">국면 모니터</span>
          </div>

          <div class="nav-item active" data-page="portfolio" data-label="포트폴리오·리스크">
            <span class="nav-item-index">05</span>
            <span class="nav-item-icon"><i class="fas fa-briefcase"></i></span>
            <span class="nav-item-label">포트폴리오·리스크</span>
            <span class="nav-status-badge badge-focus">NOW</span>
          </div>

          <div class="nav-item" data-page="screener" data-label="자산 스크리너">
            <span class="nav-item-index">06</span>
            <span class="nav-item-icon"><i class="fas fa-filter"></i></span>
            <span class="nav-item-label">자산 스크리너</span>
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- Operator Section -->
        <div class="nav-section">
          <div class="nav-section-title">운영자</div>

          <div class="nav-item" data-page="docs" data-label="문서 목록">
            <span class="nav-item-icon"><i class="fas fa-file-alt"></i></span>
            <span class="nav-item-label">문서 목록</span>
          </div>

          <div class="nav-item" data-page="sources" data-label="수집원 관리">
            <span class="nav-item-icon"><i class="fas fa-database"></i></span>
            <span class="nav-item-label">수집원 관리</span>
          </div>

          <div class="nav-item" data-page="calibration" data-label="데이터 보정">
            <span class="nav-item-icon"><i class="fas fa-sliders-h"></i></span>
            <span class="nav-item-label">데이터 보정</span>
          </div>

          <div class="nav-item" data-page="logs" data-label="수집 로그">
            <span class="nav-item-icon"><i class="fas fa-terminal"></i></span>
            <span class="nav-item-label">수집 로그</span>
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- Source Status Section -->
        <div class="nav-section">
          <div class="nav-section-title">수집원 상태</div>

          <div class="nav-item" style="cursor:default;" data-label="SaveTicker RSS">
            <span class="health-dot healthy"></span>
            <span class="nav-item-label" style="font-size:11px;">SaveTicker RSS</span>
          </div>

          <div class="nav-item" style="cursor:default;" data-label="SEC EDGAR">
            <span class="health-dot healthy"></span>
            <span class="nav-item-label" style="font-size:11px;">SEC EDGAR</span>
          </div>

          <div class="nav-item" style="cursor:default;" data-label="Substack · MacroAlf">
            <span class="health-dot healthy"></span>
            <span class="nav-item-label" style="font-size:11px;">Substack · MacroAlf</span>
          </div>

          <div class="nav-item" style="cursor:default;" data-label="X / @fedwatch">
            <span class="health-dot warning"></span>
            <span class="nav-item-label" style="font-size:11px;">X / @fedwatch</span>
          </div>

          <div class="nav-item" style="cursor:default;" data-label="Seeking Alpha">
            <span class="health-dot critical"></span>
            <span class="nav-item-label" style="font-size:11px;">Seeking Alpha</span>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="sidebar-footer">
        <div class="sidebar-footer-info" id="sidebar-time">v0.1.0 · MACROQUANT</div>
      </div>
    </nav>

    <!-- ===== RIGHT MAIN AREA ===== -->
    <div id="main-area">

      <!-- Global Header -->
      <header id="global-header">
        <div class="header-left">
          <div class="header-breadcrumb">
            <span class="breadcrumb-module" id="breadcrumb-module">모듈</span>
            <span class="breadcrumb-sep"><i class="fas fa-chevron-right" style="font-size:8px;"></i></span>
            <span class="breadcrumb-page" id="breadcrumb-page">포트폴리오·리스크</span>
          </div>
        </div>
        <div class="header-right">
          <div class="sync-status">
            <div class="sync-dot"></div>
            <span class="sync-text" id="sync-time">SYNC 00:00:00</span>
          </div>
          <button class="header-btn" title="새로고침"><i class="fas fa-sync-alt"></i></button>
          <button class="header-btn" title="알림"><i class="fas fa-bell"></i></button>
          <button class="header-btn" title="설정"><i class="fas fa-cog"></i></button>
        </div>
      </header>

      <!-- Workspace -->
      <main id="workspace">

        <!-- ===== PAGE: PORTFOLIO & RISK ===== -->
        <div class="page-view active fade-in" id="page-portfolio">

          <!-- Market Pulse Strip -->
          <div class="market-pulse-strip">
            <div class="pulse-item">
              <span class="pulse-ticker">SPX</span>
              <span class="pulse-value positive">5,421.8</span>
              <span class="pulse-chg positive">▲ +0.43%</span>
            </div>
            <div class="pulse-sep"></div>
            <div class="pulse-item">
              <span class="pulse-ticker">NDX</span>
              <span class="pulse-value positive">19,284.1</span>
              <span class="pulse-chg positive">▲ +0.71%</span>
            </div>
            <div class="pulse-sep"></div>
            <div class="pulse-item">
              <span class="pulse-ticker">US10Y</span>
              <span class="pulse-value negative">4.218%</span>
              <span class="pulse-chg negative">▼ -0.032</span>
            </div>
            <div class="pulse-sep"></div>
            <div class="pulse-item">
              <span class="pulse-ticker">DXY</span>
              <span class="pulse-value negative">104.42</span>
              <span class="pulse-chg negative">▼ -0.18%</span>
            </div>
            <div class="pulse-sep"></div>
            <div class="pulse-item">
              <span class="pulse-ticker">GOLD</span>
              <span class="pulse-value positive">2,384.5</span>
              <span class="pulse-chg positive">▲ +0.29%</span>
            </div>
            <div class="pulse-sep"></div>
            <div class="pulse-item">
              <span class="pulse-ticker">BTC</span>
              <span class="pulse-value positive">68,412</span>
              <span class="pulse-chg positive">▲ +1.24%</span>
            </div>
            <div class="pulse-sep"></div>
            <div class="pulse-item">
              <span class="pulse-ticker">VIX</span>
              <span class="pulse-value neutral">13.84</span>
              <span class="pulse-chg negative">▼ -0.92%</span>
            </div>
            <div class="pulse-sep"></div>
            <div class="pulse-item">
              <span class="pulse-ticker">WTI</span>
              <span class="pulse-value positive">82.16</span>
              <span class="pulse-chg positive">▲ +0.57%</span>
            </div>
          </div>

          <!-- 2-Column Grid -->
          <div class="portfolio-grid">

            <!-- ===== Widget 1: Portfolio Summary ===== -->
            <div class="card portfolio-summary-widget">
              <div class="card-header">
                <div class="card-title">
                  <i class="fas fa-chart-pie card-title-icon"></i>
                  포트폴리오 통합 요약
                </div>
                <div class="card-actions">
                  <button class="card-btn active" id="toggle-asset" onclick="toggleAssetView(this)">자산군</button>
                  <button class="card-btn" id="toggle-ticker" onclick="toggleTickerView(this)">종목</button>
                  <button class="card-btn">내보내기 <i class="fas fa-download" style="font-size:9px;margin-left:2px;"></i></button>
                </div>
              </div>
              <div class="card-body">
                <div class="widget-inner-layout">

                  <!-- Donut + KPI Row -->
                  <div class="donut-kpi-row">
                    <!-- Donut Chart -->
                    <div class="donut-panel">
                      <div class="donut-container">
                        <canvas id="portfolioDonut"></canvas>
                        <div class="donut-center-label">
                          <div class="donut-center-value">$1.24M</div>
                          <div class="donut-center-sub">총 AUM</div>
                        </div>
                      </div>
                      <div class="donut-legend" id="donut-legend"></div>
                    </div>

                    <!-- KPI Cards -->
                    <div class="kpi-panel">
                      <div class="kpi-card">
                        <div class="kpi-label">YTD 수익률</div>
                        <div class="kpi-value positive">+14.8%</div>
                        <div class="kpi-change positive">▲ 벤치마크 +3.2%p 초과</div>
                      </div>
                      <div class="kpi-card">
                        <div class="kpi-label">샤프 지수</div>
                        <div class="kpi-value neutral">1.64</div>
                        <div class="kpi-change neutral">최근 252일 기준</div>
                      </div>
                      <div class="kpi-card">
                        <div class="kpi-label">최대 낙폭 (MDD)</div>
                        <div class="kpi-value negative">-7.3%</div>
                        <div class="kpi-change neutral">2024.01.15 ~ 2024.02.03</div>
                      </div>
                    </div>
                  </div>

                  <!-- Risk Bars -->
                  <div class="risk-panel">
                    <div class="risk-title">심화 리스크 관리</div>

                    <div class="risk-bar-item">
                      <div class="risk-bar-header">
                        <span class="risk-bar-label">포트폴리오 VaR (95%, 1D)</span>
                        <span class="risk-bar-value negative">-$8,420</span>
                      </div>
                      <div class="risk-bar-track">
                        <div class="risk-bar-fill risk-fill-mid" style="width: 34%;"></div>
                      </div>
                    </div>

                    <div class="risk-bar-item">
                      <div class="risk-bar-header">
                        <span class="risk-bar-label">베타 (vs S&amp;P 500)</span>
                        <span class="risk-bar-value neutral">0.82</span>
                      </div>
                      <div class="risk-bar-track">
                        <div class="risk-bar-fill risk-fill-low" style="width: 41%;"></div>
                      </div>
                    </div>

                    <div class="risk-bar-item">
                      <div class="risk-bar-header">
                        <span class="risk-bar-label">포트폴리오 변동성 (연환산)</span>
                        <span class="risk-bar-value neutral">12.4%</span>
                      </div>
                      <div class="risk-bar-track">
                        <div class="risk-bar-fill risk-fill-low" style="width: 28%;"></div>
                      </div>
                    </div>

                    <div class="risk-bar-item">
                      <div class="risk-bar-header">
                        <span class="risk-bar-label">집중도 리스크 (허핀달 지수)</span>
                        <span class="risk-bar-value negative">0.18</span>
                      </div>
                      <div class="risk-bar-track">
                        <div class="risk-bar-fill risk-fill-high" style="width: 58%;"></div>
                      </div>
                    </div>

                    <div class="risk-bar-item">
                      <div class="risk-bar-header">
                        <span class="risk-bar-label">유동성 스코어</span>
                        <span class="risk-bar-value positive">87/100</span>
                      </div>
                      <div class="risk-bar-track">
                        <div class="risk-bar-fill risk-fill-low" style="width: 87%;"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Holdings Table -->
                  <div class="holdings-panel">
                    <table class="holdings-table">
                      <thead>
                        <tr>
                          <th>종목 / 자산</th>
                          <th>비중</th>
                          <th>평가금액</th>
                          <th>수익률</th>
                          <th>1D 변동</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div class="asset-ticker">AAPL</div>
                            <div class="asset-name">Apple Inc.</div>
                          </td>
                          <td class="neutral">14.2%</td>
                          <td class="neutral">$176,080</td>
                          <td class="positive">+18.4%</td>
                          <td class="positive">+0.92%</td>
                        </tr>
                        <tr>
                          <td>
                            <div class="asset-ticker">NVDA</div>
                            <div class="asset-name">NVIDIA Corp.</div>
                          </td>
                          <td class="neutral">11.8%</td>
                          <td class="neutral">$146,320</td>
                          <td class="positive">+42.1%</td>
                          <td class="positive">+2.14%</td>
                        </tr>
                        <tr>
                          <td>
                            <div class="asset-ticker">TLT</div>
                            <div class="asset-name">iShares 20Y+ Bond</div>
                          </td>
                          <td class="neutral">18.6%</td>
                          <td class="neutral">$230,640</td>
                          <td class="negative">-8.2%</td>
                          <td class="positive">+0.31%</td>
                        </tr>
                        <tr>
                          <td>
                            <div class="asset-ticker">GLD</div>
                            <div class="asset-name">SPDR Gold Shares</div>
                          </td>
                          <td class="neutral">12.4%</td>
                          <td class="neutral">$153,760</td>
                          <td class="positive">+9.7%</td>
                          <td class="positive">+0.28%</td>
                        </tr>
                        <tr>
                          <td>
                            <div class="asset-ticker">BTC</div>
                            <div class="asset-name">Bitcoin</div>
                          </td>
                          <td class="neutral">8.1%</td>
                          <td class="neutral">$100,440</td>
                          <td class="positive">+56.3%</td>
                          <td class="positive">+1.24%</td>
                        </tr>
                        <tr>
                          <td>
                            <div class="asset-ticker">CASH</div>
                            <div class="asset-name">USD / MMKT</div>
                          </td>
                          <td class="neutral">34.9%</td>
                          <td class="neutral">$432,760</td>
                          <td class="neutral">+5.1%</td>
                          <td class="neutral">+0.01%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>
            </div>

            <!-- ===== Widget 2: Correlation Analysis ===== -->
            <div class="card correlation-widget">
              <div class="card-header">
                <div class="card-title">
                  <i class="fas fa-th card-title-icon"></i>
                  자산 상관성 분석
                </div>
                <div class="card-actions">
                  <button class="card-btn active" onclick="setPreset(this,'1Y')">1Y</button>
                  <button class="card-btn" onclick="setPreset(this,'3Y')">3Y</button>
                  <button class="card-btn" onclick="setPreset(this,'5Y')">5Y</button>
                  <button class="card-btn" onclick="setPreset(this,'ALL')">ALL</button>
                </div>
              </div>
              <div class="card-body">
                <div class="corr-inner-layout">

                  <!-- Heatmap Panel -->
                  <div class="heatmap-panel">
                    <div class="heatmap-panel-title">피어슨 상관계수 히트맵 (5×5)</div>
                    <div id="heatmap-container"></div>
                    <div style="margin-top:10px; display:flex; align-items:center; gap:6px;">
                      <span style="font-size:9px;color:var(--text-muted);">-1.0</span>
                      <div style="flex:1;height:6px;border-radius:3px;background:linear-gradient(90deg,#3B82F6,#6B7280,#F85149);"></div>
                      <span style="font-size:9px;color:var(--text-muted);">+1.0</span>
                    </div>
                  </div>

                  <!-- Timeline Panel -->
                  <div class="timeline-panel">
                    <div class="timeline-panel-title">롤링 상관계수 시계열</div>
                    <div class="period-selector" id="rolling-period">
                      <button class="period-btn active" onclick="setRolling(this, 30)">30D</button>
                      <button class="period-btn" onclick="setRolling(this, 60)">60D</button>
                      <button class="period-btn" onclick="setRolling(this, 90)">90D</button>
                      <button class="period-btn" onclick="setRolling(this, 180)">180D</button>
                    </div>
                    <div class="timeline-chart-container">
                      <canvas id="correlationTimeline"></canvas>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
          <!-- /portfolio-grid -->
        </div>

        <!-- ===== PLACEHOLDER PAGES ===== -->
        <div class="page-view fade-in" id="page-issue">
          <div class="placeholder-page">
            <div class="placeholder-icon"><i class="fas fa-rss"></i></div>
            <div class="placeholder-title">이슈 수집·요약·태깅</div>
            <div class="placeholder-desc">AI 기반 뉴스·리서치 수집 및 자동 태깅 파이프라인. 후속 사양서에 따라 구현 예정.</div>
            <div class="placeholder-badge">MOD_ISSUE · SCHEDULED</div>
          </div>
        </div>

        <div class="page-view fade-in" id="page-research">
          <div class="placeholder-page">
            <div class="placeholder-icon"><i class="fas fa-network-wired"></i></div>
            <div class="placeholder-title">리서치 클러스터</div>
            <div class="placeholder-desc">토픽 클러스터링 및 키워드 지식 그래프 시각화. 후속 사양서에 따라 구현 예정.</div>
            <div class="placeholder-badge">MOD_RESEARCH · SCHEDULED</div>
          </div>
        </div>

        <div class="page-view fade-in" id="page-calendar">
          <div class="placeholder-page">
            <div class="placeholder-icon"><i class="fas fa-calendar-alt"></i></div>
            <div class="placeholder-title">매크로 캘린더</div>
            <div class="placeholder-desc">FOMC·CPI·NFP 등 글로벌 경제지표 이벤트 타임라인. 후속 사양서에 따라 구현 예정.</div>
            <div class="placeholder-badge">MOD_CALENDAR · SCHEDULED</div>
          </div>
        </div>

        <div class="page-view fade-in" id="page-regime">
          <div class="placeholder-page">
            <div class="placeholder-icon"><i class="fas fa-radar"></i></div>
            <div class="placeholder-title">국면 모니터</div>
            <div class="placeholder-desc">경기 사이클 레이더 차트 및 국면 전환 신호 감지. 후속 사양서에 따라 구현 예정.</div>
            <div class="placeholder-badge">MOD_REGIME · SCHEDULED</div>
          </div>
        </div>

        <div class="page-view fade-in" id="page-screener">
          <div class="placeholder-page">
            <div class="placeholder-icon"><i class="fas fa-filter"></i></div>
            <div class="placeholder-title">자산 스크리너</div>
            <div class="placeholder-desc">멀티팩터 자산 필터링 및 퀀트 스크리닝 엔진. 후속 사양서에 따라 구현 예정.</div>
            <div class="placeholder-badge">MOD_SCREENER · SCHEDULED</div>
          </div>
        </div>

        <div class="page-view fade-in" id="page-docs">
          <div class="placeholder-page">
            <div class="placeholder-icon"><i class="fas fa-file-alt"></i></div>
            <div class="placeholder-title">문서 목록</div>
            <div class="placeholder-desc">수집된 리포트·문서 아카이브 관리 페이지. 후속 사양서에 따라 구현 예정.</div>
            <div class="placeholder-badge">ADMIN_DOCS · SCHEDULED</div>
          </div>
        </div>

        <div class="page-view fade-in" id="page-sources">
          <div class="placeholder-page">
            <div class="placeholder-icon"><i class="fas fa-database"></i></div>
            <div class="placeholder-title">수집원 관리</div>
            <div class="placeholder-desc">데이터 수집원 등록·설정 및 헬스 모니터링 패널. 후속 사양서에 따라 구현 예정.</div>
            <div class="placeholder-badge">ADMIN_SOURCES · SCHEDULED</div>
          </div>
        </div>

        <div class="page-view fade-in" id="page-calibration">
          <div class="placeholder-page">
            <div class="placeholder-icon"><i class="fas fa-sliders-h"></i></div>
            <div class="placeholder-title">데이터 보정</div>
            <div class="placeholder-desc">수집 데이터 이상치 보정 및 정규화 파이프라인. 후속 사양서에 따라 구현 예정.</div>
            <div class="placeholder-badge">ADMIN_CALIBRATION · SCHEDULED</div>
          </div>
        </div>

        <div class="page-view fade-in" id="page-logs">
          <div class="placeholder-page">
            <div class="placeholder-icon"><i class="fas fa-terminal"></i></div>
            <div class="placeholder-title">수집 로그</div>
            <div class="placeholder-desc">수집 파이프라인 실행 로그 및 에러 트래킹 콘솔. 후속 사양서에 따라 구현 예정.</div>
            <div class="placeholder-badge">ADMIN_LOGS · SCHEDULED</div>
          </div>
        </div>

      </main>
    </div>
    <!-- /main-area -->

  </div>
  <!-- /app-shell -->

  <script>
    // ============================================================
    //  STATE MANAGEMENT (Vanilla JS Global Store)
    // ============================================================
    const AppState = {
      activePage: 'portfolio',
      sidebarCollapsed: false,
      portfolioView: 'asset',   // 'asset' | 'ticker'
      corrPreset: '1Y',
      rollingWindow: 30,

      // Page metadata
      pagesMeta: {
        'issue':        { label: '이슈 수집·요약·태깅',  section: '모듈' },
        'research':     { label: '리서치 클러스터',       section: '모듈' },
        'calendar':     { label: '매크로 캘린더',         section: '모듈' },
        'regime':       { label: '국면 모니터',            section: '모듈' },
        'portfolio':    { label: '포트폴리오·리스크',      section: '모듈' },
        'screener':     { label: '자산 스크리너',          section: '모듈' },
        'docs':         { label: '문서 목록',              section: '운영자' },
        'sources':      { label: '수집원 관리',            section: '운영자' },
        'calibration':  { label: '데이터 보정',            section: '운영자' },
        'logs':         { label: '수집 로그',              section: '운영자' },
      }
    };

    // ============================================================
    //  ROUTING
    // ============================================================
    function navigate(page) {
      if (AppState.activePage === page) return;
      AppState.activePage = page;

      // Hide all pages
      document.querySelectorAll('.page-view').forEach(el => {
        el.classList.remove('active');
      });

      // Show target page
      const target = document.getElementById('page-' + page);
      if (target) {
        target.classList.add('active');
        // Re-trigger animation
        target.classList.remove('fade-in');
        void target.offsetWidth; // reflow
        target.classList.add('fade-in');
      }

      // Update nav active state
      document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) item.classList.add('active');
      });

      // Update breadcrumb
      const meta = AppState.pagesMeta[page];
      if (meta) {
        document.getElementById('breadcrumb-module').textContent = meta.section;
        document.getElementById('breadcrumb-page').textContent = meta.label;
      }
    }

    // Bind nav items
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      item.addEventListener('click', () => {
        navigate(item.dataset.page);
      });
    });

    // ============================================================
    //  SIDEBAR TOGGLE
    // ============================================================
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
      AppState.sidebarCollapsed = !AppState.sidebarCollapsed;
      const sidebar = document.getElementById('sidebar');
      sidebar.classList.toggle('collapsed', AppState.sidebarCollapsed);
    });

    // ============================================================
    //  CLOCK
    // ============================================================
    function updateClock() {
      const now = new Date();
      const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
      const et  = new Date(utc.getTime() - 5 * 3600000); // UTC-5 approximate
      const pad = n => String(n).padStart(2, '0');
      const timeStr = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
      document.getElementById('sync-time').textContent = 'SYNC ' + timeStr;
      document.getElementById('sidebar-time').textContent = 'v0.1.0 · ' + timeStr;
    }

    setInterval(updateClock, 1000);
    updateClock();

    // ============================================================
    //  PORTFOLIO TOGGLE SWITCH
    // ============================================================
    function toggleAssetView(btn) {
      AppState.portfolioView = 'asset';
      btn.classList.add('active');
      document.getElementById('toggle-ticker').classList.remove('active');
      updateDonutChart('asset');
    }

    function toggleTickerView(btn) {
      AppState.portfolioView = 'ticker';
      btn.classList.add('active');
      document.getElementById('toggle-asset').classList.remove('active');
      updateDonutChart('ticker');
    }

    // ============================================================
    //  CORRELATION PRESET SELECTOR (local state)
    // ============================================================
    function setPreset(btn, preset) {
      AppState.corrPreset = preset;
      document.querySelectorAll('.card-actions .card-btn').forEach(b => {
        if (['1Y','3Y','5Y','ALL'].includes(b.textContent)) b.classList.remove('active');
      });
      btn.classList.add('active');
      updateTimelineChart(preset, AppState.rollingWindow);
    }

    function setRolling(btn, days) {
      AppState.rollingWindow = days;
      document.querySelectorAll('#rolling-period .period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateTimelineChart(AppState.corrPreset, days);
    }

    // ============================================================
    //  CHART DATA
    // ============================================================
    const ASSET_DATA = {
      asset: {
        labels: ['미국 주식', '채권', '실물 자산', '크립토', '현금성'],
        values: [26.0, 18.6, 12.4, 8.1, 34.9],
        colors: ['#3B82F6','#22D3EE','#F59E0B','#A78BFA','#6B7280']
      },
      ticker: {
        labels: ['AAPL','NVDA','TLT','GLD','BTC','CASH'],
        values: [14.2, 11.8, 18.6, 12.4, 8.1, 34.9],
        colors: ['#3B82F6','#10B981','#22D3EE','#F59E0B','#A78BFA','#6B7280']
      }
    };

    // Correlation Matrix Data
    const ASSETS = ['SPX','TLT','GLD','BTC','DXY'];
    const CORR_MATRIX = [
      [ 1.00,  -0.62,  0.14,  0.41, -0.52],
      [-0.62,   1.00, -0.05, -0.18,  0.34],
      [ 0.14,  -0.05,  1.00,  0.22, -0.67],
      [ 0.41,  -0.18,  0.22,  1.00, -0.21],
      [-0.52,   0.34, -0.67, -0.21,  1.00],
    ];

    // ============================================================
    //  DONUT CHART
    // ============================================================
    let donutChart = null;

    function buildDonutLegend(data) {
      const legend = document.getElementById('donut-legend');
      legend.innerHTML = '';
      data.labels.forEach((label, i) => {
        const row = document.createElement('div');
        row.className = 'legend-item';
        row.innerHTML = \`
          <div class="legend-dot" style="background:\${data.colors[i]};"></div>
          <span class="legend-name">\${label}</span>
          <span class="legend-pct">\${data.values[i]}%</span>
        \`;
        legend.appendChild(row);
      });
    }

    function updateDonutChart(viewType) {
      const data = ASSET_DATA[viewType];
      if (donutChart) {
        donutChart.data.labels = data.labels;
        donutChart.data.datasets[0].data = data.values;
        donutChart.data.datasets[0].backgroundColor = data.colors;
        donutChart.update();
      }
      buildDonutLegend(data);
    }

    function initDonutChart() {
      const ctx = document.getElementById('portfolioDonut').getContext('2d');
      const data = ASSET_DATA.asset;
      donutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.values,
            backgroundColor: data.colors,
            borderColor: '#12161F',
            borderWidth: 2,
            hoverBorderWidth: 3,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '68%',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => \` \${ctx.label}: \${ctx.raw}%\`
              },
              backgroundColor: '#1C2232',
              borderColor: '#2D3444',
              borderWidth: 1,
              titleColor: '#E6EDF3',
              bodyColor: '#8B949E',
            }
          }
        }
      });
      buildDonutLegend(data);
    }

    // ============================================================
    //  CORRELATION HEATMAP
    // ============================================================
    function corrToColor(val) {
      // val: -1 to +1
      // negative → blue, zero → gray, positive → red
      if (val >= 0) {
        const t = val;
        const r = Math.round(248 + (248 - 59) * 0);  // simplify
        // interpolate from gray(107,114,128) to red(248,81,73)
        const gray = [40, 42, 54];
        const red  = [248, 81, 73];
        const R = Math.round(gray[0] + (red[0]-gray[0]) * t);
        const G = Math.round(gray[1] + (red[1]-gray[1]) * t);
        const B = Math.round(gray[2] + (red[2]-gray[2]) * t);
        return { bg: \`rgba(\${R},\${G},\${B},\${0.15 + t * 0.6})\`, text: t > 0.5 ? '#FBBCBB' : '#E6EDF3' };
      } else {
        const t = Math.abs(val);
        const gray = [40, 42, 54];
        const blue = [59, 130, 246];
        const R = Math.round(gray[0] + (blue[0]-gray[0]) * t);
        const G = Math.round(gray[1] + (blue[1]-gray[1]) * t);
        const B = Math.round(gray[2] + (blue[2]-gray[2]) * t);
        return { bg: \`rgba(\${R},\${G},\${B},\${0.15 + t * 0.6})\`, text: t > 0.5 ? '#93C5FD' : '#E6EDF3' };
      }
    }

    function initHeatmap() {
      const container = document.getElementById('heatmap-container');
      const n = ASSETS.length;
      const cellSize = 36;
      const headerSize = 28;

      // Grid: (n+1) × (n+1)
      const grid = document.createElement('div');
      grid.style.cssText = \`
        display: grid;
        grid-template-columns: \${headerSize}px \${Array(n).fill(cellSize+'px').join(' ')};
        grid-template-rows:    \${headerSize}px \${Array(n).fill(cellSize+'px').join(' ')};
        gap: 2px;
      \`;

      // Top-left empty corner
      const corner = document.createElement('div');
      grid.appendChild(corner);

      // Column headers
      ASSETS.forEach(a => {
        const h = document.createElement('div');
        h.className = 'heatmap-header-cell';
        h.textContent = a;
        grid.appendChild(h);
      });

      // Rows
      for (let i = 0; i < n; i++) {
        // Row label
        const rowLabel = document.createElement('div');
        rowLabel.className = 'heatmap-label-cell';
        rowLabel.textContent = ASSETS[i];
        grid.appendChild(rowLabel);

        for (let j = 0; j < n; j++) {
          const val = CORR_MATRIX[i][j];
          const { bg, text } = corrToColor(val);
          const cell = document.createElement('div');
          cell.className = 'heatmap-cell tooltip-container';
          cell.style.background = bg;
          cell.style.color = text;
          cell.style.fontSize = '9px';
          const disp = i === j ? '—' : val.toFixed(2);
          cell.innerHTML = \`\${disp}<div class="tooltip-popup">\${ASSETS[i]} × \${ASSETS[j]}: \${val.toFixed(3)}</div>\`;
          grid.appendChild(cell);
        }
      }

      container.appendChild(grid);
    }

    // ============================================================
    //  CORRELATION TIMELINE CHART
    // ============================================================
    let timelineChart = null;

    function generateRollingData(points, seed) {
      const data = [];
      let val = (seed * 2 - 1) * 0.5;
      for (let i = 0; i < points; i++) {
        val += (Math.random() - 0.5) * 0.08;
        val = Math.max(-0.95, Math.min(0.95, val));
        data.push(parseFloat(val.toFixed(3)));
      }
      return data;
    }

    function generateLabels(points) {
      const labels = [];
      const now = new Date();
      for (let i = points - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 3600000);
        labels.push((d.getMonth()+1) + '/' + d.getDate());
      }
      return labels;
    }

    function initTimelineChart() {
      const ctx = document.getElementById('correlationTimeline').getContext('2d');
      const points = 90;
      const labels = generateLabels(points);

      timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'SPX / TLT',
              data: generateRollingData(points, 0.1),
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59,130,246,0.05)',
              borderWidth: 1.5,
              pointRadius: 0,
              tension: 0.3,
              fill: false,
            },
            {
              label: 'SPX / GLD',
              data: generateRollingData(points, 0.5),
              borderColor: '#F59E0B',
              backgroundColor: 'rgba(245,158,11,0.05)',
              borderWidth: 1.5,
              pointRadius: 0,
              tension: 0.3,
              fill: false,
            },
            {
              label: 'SPX / BTC',
              data: generateRollingData(points, 0.7),
              borderColor: '#A78BFA',
              backgroundColor: 'rgba(167,139,250,0.05)',
              borderWidth: 1.5,
              pointRadius: 0,
              tension: 0.3,
              fill: false,
            },
            {
              label: 'GLD / DXY',
              data: generateRollingData(points, 0.1),
              borderColor: '#F43F5E',
              backgroundColor: 'rgba(244,63,94,0.05)',
              borderWidth: 1.5,
              pointRadius: 0,
              tension: 0.3,
              fill: false,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          scales: {
            x: {
              grid: { color: 'rgba(33,38,45,0.8)', drawBorder: false },
              ticks: {
                color: '#484F58',
                font: { size: 9, family: 'JetBrains Mono' },
                maxTicksLimit: 8,
                maxRotation: 0,
              },
              border: { display: false }
            },
            y: {
              min: -1,
              max: 1,
              grid: { color: 'rgba(33,38,45,0.8)', drawBorder: false },
              ticks: {
                color: '#484F58',
                font: { size: 9, family: 'JetBrains Mono' },
                stepSize: 0.25,
                callback: v => v.toFixed(2),
              },
              border: { display: false }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                color: '#8B949E',
                font: { size: 9, family: 'JetBrains Mono' },
                boxWidth: 12,
                padding: 8,
              }
            },
            tooltip: {
              backgroundColor: '#1C2232',
              borderColor: '#2D3444',
              borderWidth: 1,
              titleColor: '#E6EDF3',
              bodyColor: '#8B949E',
              titleFont: { family: 'JetBrains Mono', size: 10 },
              bodyFont: { family: 'JetBrains Mono', size: 10 },
            }
          }
        }
      });
    }

    function updateTimelineChart(preset, rolling) {
      if (!timelineChart) return;

      const pointsMap = { '1Y': 252, '3Y': 756, '5Y': 1260, 'ALL': 1500 };
      const points = Math.min(pointsMap[preset] || 252, 300); // cap for perf
      const labels = generateLabels(points);

      timelineChart.data.labels = labels;
      timelineChart.data.datasets.forEach((ds, i) => {
        ds.data = generateRollingData(points, (i + 1) * 0.2);
      });
      timelineChart.update();
    }

    // ============================================================
    //  INIT ALL CHARTS
    // ============================================================
    window.addEventListener('DOMContentLoaded', () => {
      initDonutChart();
      initHeatmap();
      initTimelineChart();
    });

    // Resize handling
    window.addEventListener('resize', () => {
      if (donutChart) donutChart.resize();
      if (timelineChart) timelineChart.resize();
    });
  </script>
</body>
</html>`

  return c.html(html)
})

export default app
