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

    /* ===== ISSUE PAGE: TOP HEADER ===== */
    .issue-top-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .issue-search-bar {
      flex: 1;
      min-width: 260px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0 12px;
      height: 36px;
      transition: border-color 0.2s;
    }

    .issue-search-bar:focus-within {
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 2px rgba(59,130,246,0.12);
    }

    .issue-search-icon { color: var(--text-muted); font-size: 11px; }

    .issue-search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-size: 12px;
      font-family: 'Inter', sans-serif;
    }

    .issue-search-input::placeholder { color: var(--text-muted); }

    .issue-search-clear {
      color: var(--text-muted);
      cursor: pointer;
      font-size: 10px;
      padding: 2px 4px;
      border-radius: 3px;
      transition: color 0.15s;
    }

    .issue-search-clear:hover { color: var(--text-primary); }

    .issue-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .issue-preset-btn {
      font-size: 11px;
      padding: 5px 10px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .issue-preset-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
      border-color: var(--border-bright);
    }

    .issue-header-btn {
      font-size: 11px;
      padding: 5px 10px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
    }

    .issue-header-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .portfolio-link-btn.linked {
      background: rgba(59,130,246,0.12);
      border-color: var(--accent-blue);
      color: var(--accent-blue);
    }

    /* ===== ISSUE 3-COLUMN LAYOUT ===== */
    .issue-layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 16px;
      height: calc(100vh - var(--header-height) - 100px);
      overflow: hidden;
    }

    /* ===== FACET PANEL (LEFT) ===== */
    .facet-panel {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .facet-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      background: var(--bg-secondary);
      z-index: 2;
    }

    .facet-panel-title {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
    }

    .facet-active-count {
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent-blue);
      background: rgba(59,130,246,0.12);
      padding: 2px 6px;
      border-radius: 10px;
    }

    .active-tags-strip {
      padding: 8px 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-tertiary);
    }

    .active-tag-chip {
      font-size: 9px;
      padding: 2px 7px;
      border-radius: 10px;
      background: rgba(59,130,246,0.15);
      border: 1px solid rgba(59,130,246,0.3);
      color: var(--accent-blue);
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }

    .active-tag-chip:hover { background: rgba(59,130,246,0.25); }

    .facet-section { border-bottom: 1px solid var(--border-color); }

    .facet-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 500;
      color: var(--text-secondary);
      user-select: none;
      transition: background 0.15s;
    }

    .facet-section-header:hover { background: var(--bg-hover); }

    .facet-chevron {
      font-size: 9px;
      color: var(--text-muted);
      transition: transform 0.2s;
    }

    .facet-section.collapsed .facet-chevron { transform: rotate(-90deg); }
    .facet-section.collapsed .facet-items { display: none; }

    .facet-items { padding: 2px 0 6px; }

    .facet-item {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 5px 14px;
      cursor: pointer;
      font-size: 11px;
      color: var(--text-secondary);
      transition: background 0.12s, color 0.12s;
      user-select: none;
      position: relative;
    }

    .facet-item:hover { background: var(--bg-hover); color: var(--text-primary); }

    .facet-item input[type="checkbox"] {
      accent-color: var(--accent-blue);
      width: 12px;
      height: 12px;
      flex-shrink: 0;
      cursor: pointer;
    }

    .facet-item:has(input:checked) {
      color: var(--text-primary);
      font-weight: 500;
    }

    .facet-count {
      margin-left: auto;
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
      background: var(--bg-tertiary);
      padding: 1px 5px;
      border-radius: 8px;
    }

    .urgency-dot {
      width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
    }
    .urg-high { background: #FF7B72; box-shadow: 0 0 5px #FF7B72; }
    .urg-mid  { background: #D29922; box-shadow: 0 0 5px #D29922; }
    .urg-low  { background: #484F58; }

    /* ===== MASTER TIMELINE (CENTER) ===== */
    .issue-main-timeline {
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-right: 2px;
    }

    .timeline-stats-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 7px;
      padding: 8px 14px;
      flex-shrink: 0;
    }

    .timeline-result-count { font-size: 11px; color: var(--text-secondary); }
    .timeline-result-count strong { color: var(--text-primary); }

    .timeline-sort-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .timeline-sort-label { font-size: 10px; color: var(--text-muted); margin-right: 2px; }

    .timeline-sort-btn {
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s;
    }

    .timeline-sort-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
    .timeline-sort-btn.active { background: rgba(59,130,246,0.12); border-color: var(--accent-blue); color: var(--accent-blue); }

    /* ===== ISSUE CARD ===== */
    .issue-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.2s;
      flex-shrink: 0;
    }

    .issue-card:hover { border-color: var(--border-bright); }

    /* Portfolio link mode: color-coded border */
    .issue-card.pf-bullish  { border-left: 3px solid #3FB950; }
    .issue-card.pf-bearish  { border-left: 3px solid #F85149; }
    .issue-card.pf-neutral  { border-left: 3px solid #484F58; }

    .issue-card-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px 10px;
      cursor: pointer;
      user-select: none;
    }

    .issue-urgency-bar {
      width: 3px;
      border-radius: 2px;
      align-self: stretch;
      flex-shrink: 0;
      min-height: 40px;
    }

    .urg-bar-high { background: #FF7B72; }
    .urg-bar-mid  { background: #D29922; }
    .urg-bar-low  { background: var(--border-bright); }

    .issue-card-meta {
      flex: 1;
      min-width: 0;
    }

    .issue-card-time-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
    }

    .issue-time-badge {
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
      background: var(--bg-tertiary);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .issue-source-badge {
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
    }

    .src-substack { background: rgba(249,115,22,0.12); color: #F97316; }
    .src-x        { background: rgba(139,92,246,0.12); color: #8B5CF6; }
    .src-sec      { background: rgba(34,211,238,0.12); color: #22D3EE; }
    .src-seeking  { background: rgba(251,191,36,0.12); color: #FBBF24; }
    .src-rss      { background: rgba(59,130,246,0.12); color: #3B82F6; }

    .issue-urgency-badge {
      font-size: 9px;
      padding: 2px 7px;
      border-radius: 10px;
      font-weight: 600;
      margin-left: auto;
      flex-shrink: 0;
    }

    .ubadge-high { background: rgba(255,123,114,0.15); color: #FF7B72; }
    .ubadge-mid  { background: rgba(210,153,34,0.15); color: #D29922; }
    .ubadge-low  { background: rgba(72,79,88,0.15); color: #8B949E; }

    .issue-card-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.4;
      margin-bottom: 6px;
    }

    .issue-card-summary {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 8px;
    }

    /* Tags Row */
    .issue-tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }

    .issue-tag {
      font-size: 9px;
      padding: 2px 7px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      background: var(--bg-tertiary);
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      transition: all 0.15s;
      position: relative;
    }

    .issue-tag:hover {
      border-color: var(--accent-cyan);
      color: var(--accent-cyan);
      background: rgba(34,211,238,0.07);
    }

    .issue-tag.tag-active {
      border-color: var(--accent-blue);
      color: var(--accent-blue);
      background: rgba(59,130,246,0.1);
    }

    /* Macro indicator tags */
    .issue-tag.tag-macro { border-color: rgba(59,130,246,0.3); color: #60A5FA; background: rgba(59,130,246,0.06); }
    .issue-tag.tag-sector { border-color: rgba(167,139,250,0.3); color: #C4B5FD; background: rgba(167,139,250,0.06); }
    .issue-tag.tag-asset { border-color: rgba(34,211,238,0.3); color: #67E8F9; background: rgba(34,211,238,0.06); }

    .issue-card-toggle {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      color: var(--text-muted);
      padding-left: 27px;
      padding-bottom: 10px;
      cursor: pointer;
      transition: color 0.15s;
    }

    .issue-card-toggle:hover { color: var(--accent-blue); }

    .toggle-insight-count {
      background: rgba(59,130,246,0.12);
      border: 1px solid rgba(59,130,246,0.2);
      color: var(--accent-blue);
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 8px;
      font-weight: 600;
    }

    .toggle-arrow {
      font-size: 9px;
      transition: transform 0.25s;
    }

    .toggle-arrow.open { transform: rotate(180deg); }

    /* ===== ACCORDION DETAIL ===== */
    .issue-accordion {
      overflow: hidden;
      max-height: 0;
      transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1);
    }

    .issue-accordion.open { max-height: 3000px; }

    .accordion-inner {
      border-top: 1px solid var(--border-color);
      background: var(--bg-primary);
    }

    /* Semantic Cluster Box */
    .cluster-box {
      margin: 12px 14px;
      border: 1px solid var(--border-color);
      border-radius: 7px;
      overflow: hidden;
    }

    .cluster-header {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 12px;
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
    }

    .cluster-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--accent-cyan);
      font-family: 'JetBrains Mono', monospace;
    }

    .cluster-desc {
      font-size: 10px;
      color: var(--text-secondary);
    }

    .cluster-count-badge {
      margin-left: auto;
      font-size: 9px;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      background: var(--bg-hover);
      padding: 1px 6px;
      border-radius: 8px;
    }

    /* Thread Items */
    .thread-list { padding: 8px 12px; }

    .thread-item {
      display: grid;
      grid-template-columns: 14px 1fr;
      gap: 0 8px;
      margin-bottom: 10px;
      position: relative;
    }

    .thread-item:last-child { margin-bottom: 0; }

    /* Vertical connector line */
    .thread-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 2px;
    }

    .thread-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--accent-blue);
      border: 1.5px solid var(--bg-primary);
      flex-shrink: 0;
      z-index: 1;
    }

    .thread-line {
      flex: 1;
      width: 1px;
      background: var(--border-bright);
      margin-top: 2px;
    }

    .thread-item:last-child .thread-line { display: none; }

    .thread-item-dot-last .thread-dot { background: var(--text-muted); }

    .thread-content {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 9px 11px;
      margin-bottom: 2px;
      transition: border-color 0.15s;
    }

    .thread-content:hover { border-color: var(--border-bright); }

    .thread-content-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 5px;
      flex-wrap: wrap;
    }

    .thread-time {
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
    }

    .thread-source-label {
      font-size: 9px;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 4px;
    }

    .thread-author {
      font-size: 9px;
      color: var(--text-secondary);
      font-style: italic;
    }

    .thread-raw-source {
      margin-left: auto;
      font-size: 9px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 3px;
      cursor: pointer;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      transition: all 0.15s;
    }

    .thread-raw-source:hover { color: var(--accent-cyan); border-color: var(--accent-cyan); }

    .thread-body-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 3px;
      line-height: 1.4;
    }

    .thread-body-summary {
      font-size: 10px;
      color: var(--text-secondary);
      line-height: 1.55;
    }

    .thread-insight-highlight {
      display: flex;
      align-items: flex-start;
      gap: 5px;
      margin-top: 6px;
      padding: 5px 8px;
      background: rgba(59,130,246,0.06);
      border: 1px solid rgba(59,130,246,0.15);
      border-radius: 5px;
    }

    .thread-insight-icon { font-size: 10px; color: var(--accent-blue); flex-shrink: 0; margin-top: 1px; }

    .thread-insight-text {
      font-size: 10px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .thread-insight-text strong { color: var(--accent-cyan); }

    /* Portfolio signal inside thread */
    .thread-pf-signal {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 9px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 10px;
      margin-top: 5px;
    }

    .pf-signal-bull { background: rgba(63,185,80,0.12); color: #3FB950; border: 1px solid rgba(63,185,80,0.25); }
    .pf-signal-bear { background: rgba(248,81,73,0.12); color: #F85149; border: 1px solid rgba(248,81,73,0.25); }

    /* ===== EMPTY STATE ===== */
    .issue-empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-muted);
    }

    /* ===== TAG SPARKLINE POPUP ===== */
    .tag-sparkline-popup {
      position: fixed;
      background: var(--bg-hover);
      border: 1px solid var(--border-bright);
      border-radius: 8px;
      padding: 10px 12px;
      z-index: 9999;
      pointer-events: none;
      min-width: 188px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }

    .sparkline-popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .sparkline-tag-name {
      font-size: 10px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent-cyan);
    }

    .sparkline-current-val {
      font-size: 12px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-accent);
    }

    .sparkline-popup-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
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

        <!-- ===== PAGE: ISSUE INSIGHT THREAD ===== -->
        <div class="page-view fade-in" id="page-issue">

          <!-- Issue Page Top Header -->
          <div class="issue-top-header">
            <div class="issue-search-bar">
              <i class="fas fa-search issue-search-icon"></i>
              <input type="text" id="issue-search-input" class="issue-search-input"
                placeholder="키워드, 티커, 원자료 검색...  예: TGA, SOFR, NVDA"
                oninput="onIssueSearch(this.value)" />
              <div id="issue-search-clear" class="issue-search-clear" style="display:none;" onclick="clearSearch()">
                <i class="fas fa-times"></i>
              </div>
            </div>
            <div class="issue-header-actions">
              <button class="issue-preset-btn" onclick="applyPreset('macro')">📌 매크로 프리셋</button>
              <button class="issue-preset-btn" onclick="applyPreset('sector')">🏭 섹터 프리셋</button>
              <button class="issue-preset-btn" onclick="applyPreset('crypto')">₿ 크립토 프리셋</button>
              <button class="issue-header-btn" onclick="resetAllFilters()" title="필터 초기화">
                <i class="fas fa-undo"></i> 초기화
              </button>
              <button class="issue-header-btn portfolio-link-btn" id="portfolio-link-btn"
                onclick="togglePortfolioLink(this)" title="포트폴리오 연동 뷰">
                <i class="fas fa-link"></i> 포트폴리오 연동
              </button>
            </div>
          </div>

          <!-- 3-Column Layout -->
          <div class="issue-layout">

            <!-- LEFT: Facet Navigation Panel -->
            <aside class="facet-panel" id="facet-panel">
              <div class="facet-panel-header">
                <span class="facet-panel-title">패싯 필터</span>
                <span class="facet-active-count" id="facet-active-count" style="display:none;">0개 활성</span>
              </div>

              <!-- Active filters strip -->
              <div id="active-tags-strip" class="active-tags-strip" style="display:none;"></div>

              <!-- Macro Section -->
              <div class="facet-section">
                <div class="facet-section-header" onclick="toggleFacetSection(this)">
                  <span>📌 매크로 (Macro)</span>
                  <i class="fas fa-chevron-down facet-chevron"></i>
                </div>
                <div class="facet-items">
                  <label class="facet-item" data-tag="TGA">
                    <input type="checkbox" class="facet-cb" value="TGA" onchange="onFacetChange()"> TGA
                    <span class="facet-count">14</span>
                  </label>
                  <label class="facet-item" data-tag="FOMC">
                    <input type="checkbox" class="facet-cb" value="FOMC" onchange="onFacetChange()"> FOMC
                    <span class="facet-count">22</span>
                  </label>
                  <label class="facet-item" data-tag="RRP">
                    <input type="checkbox" class="facet-cb" value="RRP" onchange="onFacetChange()"> RRP
                    <span class="facet-count">9</span>
                  </label>
                  <label class="facet-item" data-tag="SOFR">
                    <input type="checkbox" class="facet-cb" value="SOFR" onchange="onFacetChange()"> SOFR-IORB
                    <span class="facet-count">8</span>
                  </label>
                  <label class="facet-item" data-tag="유동성">
                    <input type="checkbox" class="facet-cb" value="유동성" onchange="onFacetChange()"> 유동성
                    <span class="facet-count">31</span>
                  </label>
                  <label class="facet-item" data-tag="국채">
                    <input type="checkbox" class="facet-cb" value="국채" onchange="onFacetChange()"> 국채·금리
                    <span class="facet-count">18</span>
                  </label>
                  <label class="facet-item" data-tag="CPI">
                    <input type="checkbox" class="facet-cb" value="CPI" onchange="onFacetChange()"> CPI·인플레
                    <span class="facet-count">26</span>
                  </label>
                </div>
              </div>

              <!-- Sector/Theme Section -->
              <div class="facet-section">
                <div class="facet-section-header" onclick="toggleFacetSection(this)">
                  <span>🏭 섹터·테마 (Sector)</span>
                  <i class="fas fa-chevron-down facet-chevron"></i>
                </div>
                <div class="facet-items">
                  <label class="facet-item" data-tag="AI인프라">
                    <input type="checkbox" class="facet-cb" value="AI인프라" onchange="onFacetChange()"> AI 인프라
                    <span class="facet-count">45</span>
                  </label>
                  <label class="facet-item" data-tag="Quantum">
                    <input type="checkbox" class="facet-cb" value="Quantum" onchange="onFacetChange()"> 양자컴퓨팅
                    <span class="facet-count">12</span>
                  </label>
                  <label class="facet-item" data-tag="반도체">
                    <input type="checkbox" class="facet-cb" value="반도체" onchange="onFacetChange()"> 반도체
                    <span class="facet-count">38</span>
                  </label>
                  <label class="facet-item" data-tag="에너지">
                    <input type="checkbox" class="facet-cb" value="에너지" onchange="onFacetChange()"> 에너지
                    <span class="facet-count">17</span>
                  </label>
                  <label class="facet-item" data-tag="고베타">
                    <input type="checkbox" class="facet-cb" value="고베타" onchange="onFacetChange()"> 고베타
                    <span class="facet-count">21</span>
                  </label>
                  <label class="facet-item" data-tag="방어주">
                    <input type="checkbox" class="facet-cb" value="방어주" onchange="onFacetChange()"> 방어주
                    <span class="facet-count">11</span>
                  </label>
                </div>
              </div>

              <!-- Asset/Ticker Section -->
              <div class="facet-section">
                <div class="facet-section-header" onclick="toggleFacetSection(this)">
                  <span>📈 자산·티커 (Asset)</span>
                  <i class="fas fa-chevron-down facet-chevron"></i>
                </div>
                <div class="facet-items">
                  <label class="facet-item" data-tag="NVDA">
                    <input type="checkbox" class="facet-cb" value="NVDA" onchange="onFacetChange()"> NVDA
                    <span class="facet-count">28</span>
                  </label>
                  <label class="facet-item" data-tag="RGTI">
                    <input type="checkbox" class="facet-cb" value="RGTI" onchange="onFacetChange()"> RGTI
                    <span class="facet-count">7</span>
                  </label>
                  <label class="facet-item" data-tag="BTC">
                    <input type="checkbox" class="facet-cb" value="BTC" onchange="onFacetChange()"> BTC
                    <span class="facet-count">30</span>
                  </label>
                  <label class="facet-item" data-tag="TLT">
                    <input type="checkbox" class="facet-cb" value="TLT" onchange="onFacetChange()"> TLT
                    <span class="facet-count">14</span>
                  </label>
                  <label class="facet-item" data-tag="GLD">
                    <input type="checkbox" class="facet-cb" value="GLD" onchange="onFacetChange()"> GLD
                    <span class="facet-count">9</span>
                  </label>
                </div>
              </div>

              <!-- Source Section -->
              <div class="facet-section">
                <div class="facet-section-header" onclick="toggleFacetSection(this)">
                  <span>📡 소스 (Source)</span>
                  <i class="fas fa-chevron-down facet-chevron"></i>
                </div>
                <div class="facet-items">
                  <label class="facet-item" data-tag="src:Substack">
                    <input type="checkbox" class="facet-cb" value="src:Substack" onchange="onFacetChange()">
                    <span class="health-dot healthy" style="margin-right:4px;"></span> Substack
                    <span class="facet-count">41</span>
                  </label>
                  <label class="facet-item" data-tag="src:SEC">
                    <input type="checkbox" class="facet-cb" value="src:SEC" onchange="onFacetChange()">
                    <span class="health-dot healthy" style="margin-right:4px;"></span> SEC EDGAR
                    <span class="facet-count">19</span>
                  </label>
                  <label class="facet-item" data-tag="src:X">
                    <input type="checkbox" class="facet-cb" value="src:X" onchange="onFacetChange()">
                    <span class="health-dot warning" style="margin-right:4px;"></span> X / Twitter
                    <span class="facet-count">55</span>
                  </label>
                  <label class="facet-item" data-tag="src:SeekingAlpha">
                    <input type="checkbox" class="facet-cb" value="src:SeekingAlpha" onchange="onFacetChange()">
                    <span class="health-dot critical" style="margin-right:4px;"></span> Seeking Alpha
                    <span class="facet-count">23</span>
                  </label>
                </div>
              </div>

              <!-- Urgency Section -->
              <div class="facet-section">
                <div class="facet-section-header" onclick="toggleFacetSection(this)">
                  <span>🚨 긴급도 (Urgency)</span>
                  <i class="fas fa-chevron-down facet-chevron"></i>
                </div>
                <div class="facet-items">
                  <label class="facet-item" data-tag="urg:high">
                    <input type="checkbox" class="facet-cb" value="urg:high" onchange="onFacetChange()">
                    <span class="urgency-dot urg-high"></span> 즉시 대응
                    <span class="facet-count">8</span>
                  </label>
                  <label class="facet-item" data-tag="urg:mid">
                    <input type="checkbox" class="facet-cb" value="urg:mid" onchange="onFacetChange()">
                    <span class="urgency-dot urg-mid"></span> 모니터링
                    <span class="facet-count">24</span>
                  </label>
                  <label class="facet-item" data-tag="urg:low">
                    <input type="checkbox" class="facet-cb" value="urg:low" onchange="onFacetChange()">
                    <span class="urgency-dot urg-low"></span> 참고
                    <span class="facet-count">47</span>
                  </label>
                </div>
              </div>

            </aside>

            <!-- CENTER: Master Timeline -->
            <main class="issue-main-timeline" id="issue-main-timeline">

              <!-- Timeline Stats Bar -->
              <div class="timeline-stats-bar">
                <span id="timeline-result-count" class="timeline-result-count">전체 <strong>7</strong>개 이슈</span>
                <div class="timeline-sort-group">
                  <span class="timeline-sort-label">정렬:</span>
                  <button class="timeline-sort-btn active" onclick="setSortMode(this,'recent')">최신순</button>
                  <button class="timeline-sort-btn" onclick="setSortMode(this,'impact')">임팩트순</button>
                  <button class="timeline-sort-btn" onclick="setSortMode(this,'insight')">인사이트수</button>
                </div>
              </div>

              <!-- Issue Cards Container -->
              <div id="issue-cards-container"></div>

              <!-- Empty State -->
              <div id="issue-empty-state" class="issue-empty-state" style="display:none;">
                <i class="fas fa-filter" style="font-size:32px;color:var(--text-muted);"></i>
                <p style="color:var(--text-muted);margin-top:8px;">선택한 필터 조건에 해당하는 이슈가 없습니다.</p>
                <button class="issue-header-btn" onclick="resetAllFilters()" style="margin-top:8px;">
                  <i class="fas fa-undo"></i> 필터 초기화
                </button>
              </div>

            </main>

          </div>
          <!-- /issue-layout -->

          <!-- Tag Hover Sparkline Tooltip -->
          <div id="tag-sparkline-popup" class="tag-sparkline-popup" style="display:none;">
            <div class="sparkline-popup-header">
              <span id="sparkline-tag-name" class="sparkline-tag-name"></span>
              <span id="sparkline-current-val" class="sparkline-current-val"></span>
            </div>
            <canvas id="sparkline-canvas" width="160" height="44"></canvas>
            <div class="sparkline-popup-footer">
              <span id="sparkline-change"></span>
              <span id="sparkline-period" style="color:var(--text-muted);font-size:9px;">7D</span>
            </div>
          </div>

        </div>
        <!-- /page-issue -->

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
      saveSidebarState();
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
    //  ISSUE PAGE — DATA STORE
    // ============================================================
    const ISSUES_DATA = [
      {
        id: 'iss_001',
        urgency: 'high',
        time: '오늘 10:42 AM',
        source: 'SaveTicker',
        srcClass: 'src-rss',
        title: 'Fed, RRP 잔고 급감 및 TGA 채우기 본격화 — 단기 유동성 축소 경계령',
        summary: 'Reverse Repo(RRP) 잔고가 $180B 선을 하향 돌파, 재무부 TGA 재구축이 2주 내 $180B 규모로 예상. 단기 자금시장 SOFR 금리 발작 가능성 고조.',
        tags: ['#TGA','#RRP','#유동성','#SOFR','#단기자금'],
        tagTypes: ['macro','macro','macro','macro','macro'],
        pfImpact: 'bearish',
        insightCount: 3,
        clusters: [
          {
            label: 'CLUSTER A',
            desc: '유동성 축소가 고베타 자산에 미치는 영향',
            threads: [
              {
                time: '+2hr', source: 'Substack', srcClass: 'src-substack', author: 'MacroAlf',
                title: '"TGA 재구축이 촉발할 유동성 공백 — SOFR 발작 시나리오"',
                summary: '2019년 SOFR 금리 발작 사례와 비교. 현재 RRP 고갈 속도가 더 가파름. 단기채 시장 경색 우려.',
                insight: '단기 자금시장 경색 우려. SOFR 금리 급등 시 <strong>TLT 포지션 헷지 필요</strong>.',
                rawSrc: 'FED B/S 데이터', pfSignal: 'bear', pfSignalText: '보유 TLT 위협',
              },
              {
                time: '+5hr', source: 'X/@fedwatch', srcClass: 'src-x', author: '@fedwatch',
                title: '"RRP 고갈 시점과 증시 조정 상관도 — 과거 4회 사례 분석"',
                summary: '과거 RRP 고갈 이후 S&P 500 평균 -4.2% 조정. 잉여 유동성 한계점 도달 차트 첨부.',
                insight: '잉여 유동성 한계점 접근. <strong>고베타 포지션(NVDA, RGTI) 비중 축소 고려</strong>.',
                rawSrc: 'FRED RRP 시계열', pfSignal: 'bear', pfSignalText: 'NVDA·RGTI 노출',
              },
              {
                time: '+12hr', source: 'Seeking Alpha', srcClass: 'src-seeking', author: 'SA Premium',
                title: '"유동성 드레인 시기의 헷징 전략 — 방어적 옵션 롤오버"',
                summary: '고베타(양자컴퓨팅, AI) 포지션 축소 및 방어적 옵션 롤오버 전략 제시. VIX 14선 지지 여부가 관건.',
                insight: '<strong>BTC 일부 차익실현 후 GLD 비중 확대</strong> 권고. VIX 상승 대비 PUT 매수.',
                rawSrc: 'CME VIX 옵션', pfSignal: 'bear', pfSignalText: 'BTC 헷지 권고',
              },
            ]
          }
        ]
      },
      {
        id: 'iss_002',
        urgency: 'high',
        time: '오늘 08:15 AM',
        source: 'X/@fedwatch',
        srcClass: 'src-x',
        title: 'AI 인프라·양자 컴퓨팅 섹터 랠리 지속 — 옵션 체인 과열 신호 포착',
        summary: 'NVDA·RGTI·IonQ 등 AI·양자 관련주 60일 IV(내재변동성) 사상 최고 경신. Call/Put 비율 2.4배 과열. 단기 조정 가능성 경고.',
        tags: ['#AI인프라','#Quantum','#NVDA','#RGTI','#고베타','#옵션체인'],
        tagTypes: ['sector','sector','asset','asset','sector','macro'],
        pfImpact: 'mixed',
        insightCount: 2,
        clusters: [
          {
            label: 'CLUSTER A',
            desc: 'AI 인프라 밸류에이션 적정성 논쟁',
            threads: [
              {
                time: '+1hr', source: 'Substack', srcClass: 'src-substack', author: 'SemiAnalysis',
                title: '"NVDA Blackwell 출하 가속 — 데이터센터 투자 사이클 2026까지 연장 전망"',
                summary: 'CSP(Microsoft, Google, Amazon) 2025년 CAPEX 합산 $340B 돌파. AI 훈련 수요 탄성 재확인. 중기 NVDA 목표주가 상향.',
                insight: '<strong>NVDA 중기 보유 전략 유지</strong>. 단기 변동성 확대 시 분할 매수 기회.',
                rawSrc: 'NVDA 공시 + CSP 실적', pfSignal: 'bull', pfSignalText: 'NVDA 비중 확대 기회',
              },
              {
                time: '+4hr', source: 'Seeking Alpha', srcClass: 'src-seeking', author: 'SA Premium',
                title: '"양자컴퓨팅 주가 선행성 과도 — RGTI 실제 상용화 타임라인 재점검"',
                summary: 'RGTI 현재 주가에 2030년 매출 80배 이상 선반영. 오류 보정율·큐비트 확장 기술 과제 미해결. 현실적 상용화 2028년 이후.',
                insight: '<strong>RGTI 고배율 숏텀 트레이딩 주의</strong>. 기술 발전 이정표 확인 전 신규 진입 자제.',
                rawSrc: 'RGTI 10-Q 파일링', pfSignal: 'bear', pfSignalText: 'RGTI 리스크 경고',
              },
            ]
          }
        ]
      },
      {
        id: 'iss_003',
        urgency: 'mid',
        time: '어제 03:30 PM',
        source: 'SEC EDGAR',
        srcClass: 'src-sec',
        title: 'FOMC 6월 의사록 공개 — "인플레 2차 파고" 우려 명시, 금리 인하 신중론 우세',
        summary: '의사록에서 다수 위원이 인플레이션 재가속 리스크 언급. 9월 인하 기대 약화. 달러·단기 국채 강세 재료.',
        tags: ['#FOMC','#CPI','#국채','#달러','#유동성'],
        tagTypes: ['macro','macro','macro','macro','macro'],
        pfImpact: 'bearish',
        insightCount: 2,
        clusters: [
          {
            label: 'CLUSTER A',
            desc: '금리 경로 재조정이 자산 배분에 미치는 파급',
            threads: [
              {
                time: '+3hr', source: 'Substack', srcClass: 'src-substack', author: 'MacroAlf',
                title: '"9월 인하 기대 소멸 — 채권 포트폴리오 듀레이션 축소 권고"',
                summary: 'CME FedWatch 9월 인하 확률 38%→21%로 급락. 2년물-10년물 역전 심화. 채권 듀레이션 중립 이하 유지 필요.',
                insight: '<strong>TLT 비중 18.6%→12% 하향 조정 검토</strong>. 단기물(SHY) 비중 확대.',
                rawSrc: 'CME FedWatch + 국채 수익률', pfSignal: 'bear', pfSignalText: 'TLT 듀레이션 리스크',
              },
              {
                time: '+8hr', source: 'X/@fedwatch', srcClass: 'src-x', author: '@MacroMaverick',
                title: '"달러 강세 국면 진입 — 신흥국 자산 및 원자재 하방 압력"',
                summary: 'DXY 104.5 돌파 시도. 달러 강세는 GLD, BTC, 원자재에 역풍. 단기 실질금리 상승 지속 시 귀금속 약세 우려.',
                insight: '<strong>GLD 보유 비중 유지하되 추가 매수 보류</strong>. DXY 105 돌파 확인 후 재평가.',
                rawSrc: 'DXY 지수 + CFTC 포지션', pfSignal: 'bear', pfSignalText: 'GLD 상방 제한',
              },
            ]
          }
        ]
      },
      {
        id: 'iss_004',
        urgency: 'mid',
        time: '어제 11:00 AM',
        source: 'Substack',
        srcClass: 'src-substack',
        title: '비트코인 현물 ETF 순유입 재가속 — 기관 포지션 확대 사이클 진입 신호',
        summary: 'BlackRock IBIT 순유입 5거래일 연속 $200M+ 돌파. 총 AUM $55B 경신. 반감기 후 채굴 원가 상승으로 공급 압박 구조적 지속.',
        tags: ['#BTC','#ETF','#반감기','#기관수요'],
        tagTypes: ['asset','macro','macro','macro'],
        pfImpact: 'bullish',
        insightCount: 1,
        clusters: [
          {
            label: 'CLUSTER A',
            desc: 'BTC 중기 수급 구조 분석',
            threads: [
              {
                time: '+6hr', source: 'Substack', srcClass: 'src-substack', author: 'CryptoMacro',
                title: '"기관 ETF 수요 + 반감기 공급 축소 = 구조적 불균형 심화"',
                summary: '일평균 신규 BTC 공급 450→225개로 반감. ETF 일평균 수요 1,800개. 공급 대비 수요 8배 초과 구조 형성.',
                insight: '<strong>BTC 8.1% 비중 10~12%로 단계적 확대 고려</strong>. 유동성 위기 시 헷지 필요.',
                rawSrc: 'Farside ETF 플로우 데이터', pfSignal: 'bull', pfSignalText: 'BTC 비중 확대 기회',
              },
            ]
          }
        ]
      },
      {
        id: 'iss_005',
        urgency: 'low',
        time: '2일 전',
        source: 'SEC EDGAR',
        srcClass: 'src-sec',
        title: '워런 버핏 버크셔해서웨이 13F — AAPL 추가 매도, 에너지주 신규 편입',
        summary: '버크셔 Q1 13F: AAPL 주식 13% 추가 매도. CVX 신규 매수. 현금성 자산 $189B 신기록. "가치투자 관점의 대형 포지션 구축 기회 부재" 언급.',
        tags: ['#AAPL','#에너지','#13F','#방어주','#현금'],
        tagTypes: ['asset','sector','macro','sector','macro'],
        pfImpact: 'neutral',
        insightCount: 1,
        clusters: [
          {
            label: 'CLUSTER A',
            desc: '대형 기관 포지션 변화의 신호',
            threads: [
              {
                time: '+12hr', source: 'Substack', srcClass: 'src-substack', author: 'ValueHedge',
                title: '"버핏의 AAPL 감산은 밸류에이션 경고 — 기술주 비중 재점검 필요"',
                summary: 'AAPL P/E 33배, 역사적 평균 대비 1.8 표준편차 과대평가 구간. 버핏 현금 축적은 시장 전반 고평가 시그널.',
                insight: '<strong>AAPL 14.2% 비중 중립적 유지</strong>. 추가 매수보다 리밸런싱 우선.',
                rawSrc: 'SEC 13F 공시', pfSignal: null,
              },
            ]
          }
        ]
      },
      {
        id: 'iss_006',
        urgency: 'mid',
        time: '3일 전',
        source: 'Substack',
        srcClass: 'src-substack',
        title: '반도체 재고 사이클 바닥 확인 — DRAM·NAND 가격 반등, HBM 공급 부족 심화',
        summary: 'DRAMeXchange DRAM 현물가 +8% MoM. HBM3E 생산 가능 업체 SK하이닉스·삼성·마이크론으로 집중. 메모리 슈퍼사이클 진입 주장 확산.',
        tags: ['#반도체','#NVDA','#AI인프라','#HBM','#메모리'],
        tagTypes: ['sector','asset','sector','sector','sector'],
        pfImpact: 'bullish',
        insightCount: 2,
        clusters: [
          {
            label: 'CLUSTER A',
            desc: 'HBM 공급망 병목 → AI 훈련 인프라 영향',
            threads: [
              {
                time: '+2hr', source: 'Substack', srcClass: 'src-substack', author: 'SemiAnalysis',
                title: '"HBM 수급 병목이 NVDA H100 가용성 제한 — AI 서버 납기 6개월 대기"',
                summary: 'NVDA 차세대 GPU 생산의 HBM3E 의존도 65%. SK하이닉스 독점 공급 구조. 대기 수요 잔고 $40B 추정.',
                insight: '<strong>NVDA 장기 보유 강화 근거</strong>. 공급 병목이 오히려 가격 지배력 유지.',
                rawSrc: 'DRAMeXchange 시황', pfSignal: 'bull', pfSignalText: 'NVDA 장기 강세',
              },
              {
                time: '+18hr', source: 'X/@SemiWatcher', srcClass: 'src-x', author: '@SemiWatcher',
                title: '"삼성 HBM3E 퀄 테스트 통과 지연 — NVDA 공급망 다변화 차질"',
                summary: '삼성 HBM3E 발열·수율 문제로 NVDA 퀄 테스트 3분기까지 지연 가능성. SK하이닉스 독점 심화 우려.',
                insight: 'HBM 공급 불확실성으로 단기 변동성 주의. <strong>추가 NVDA 매수 시 분할 접근 권고</strong>.',
                rawSrc: 'JEDEC HBM 스펙 문서', pfSignal: null,
              },
            ]
          }
        ]
      },
      {
        id: 'iss_007',
        urgency: 'low',
        time: '3일 전',
        source: 'SaveTicker',
        srcClass: 'src-rss',
        title: 'OPEC+ 자발적 감산 9월까지 연장 합의 — WTI 공급 타이트 구조 유지',
        summary: 'OPEC+ 사우디·러시아 주도 자발적 감산 하루 166만배럴 9월까지 연장. WTI $80~85 박스권 유지 전망. 달러 강세 역풍 상존.',
        tags: ['#에너지','#WTI','#OPEC','#인플레'],
        tagTypes: ['sector','asset','macro','macro'],
        pfImpact: 'neutral',
        insightCount: 1,
        clusters: [
          {
            label: 'CLUSTER A',
            desc: '에너지 공급 축소의 인플레 재가속 파급',
            threads: [
              {
                time: '+5hr', source: 'X/@MacroMaverick', srcClass: 'src-x', author: '@MacroMaverick',
                title: '"OPEC 감산 연장 = 에너지 CPI 고착 위험 — FOMC 인하 추가 지연 재료"',
                summary: 'WTI $83 유지 시 에너지 CPI 기여 +0.4%p 예상. Fed 인하 조건 충족 난이도 상승. 에너지주 단기 수혜.',
                insight: '에너지 인플레 고착 시 <strong>FOMC 인하 지연 연동 포지션 유효</strong>. TLT 추가 비중 축소 검토.',
                rawSrc: 'EIA 원유 재고 데이터', pfSignal: 'bear', pfSignalText: 'TLT 추가 하방 압력',
              },
            ]
          }
        ]
      }
    ];

    // ============================================================
    //  ISSUE PAGE — STATE
    // ============================================================
    const IssueState = {
      activeFacets: new Set(),
      searchQuery: '',
      portfolioLinked: false,
      sortMode: 'recent',
      expandedIssues: new Set(),
    };

    // Sparkline data per tag
    const TAG_SPARKLINE = {
      'TGA':    { label: 'TGA잔고', val: '$731B', vals: [820,800,790,760,740,735,731], chg: '-89B', trend: 'neg' },
      'RRP':    { label: 'RRP', val: '$180B', vals: [450,380,310,260,210,190,180], chg: '-270B', trend: 'neg' },
      'SOFR':   { label: 'SOFR', val: '5.31%', vals: [5.05,5.10,5.18,5.22,5.27,5.30,5.31], chg: '+0.26%', trend: 'pos' },
      'FOMC':   { label: '9월인하확률', val: '21%', vals: [55,50,42,38,34,27,21], chg: '-34%p', trend: 'neg' },
      'CPI':    { label: 'CPI YoY', val: '3.4%', vals: [3.1,3.2,3.5,3.5,3.4,3.4,3.4], chg: '+0.3%', trend: 'neg' },
      'NVDA':   { label: 'NVDA', val: '$875', vals: [680,710,750,780,820,850,875], chg: '+$195', trend: 'pos' },
      'BTC':    { label: 'BTC', val: '$68,412', vals: [58000,61000,63000,65000,66800,67900,68412], chg: '+$10.4K', trend: 'pos' },
      'TLT':    { label: 'TLT', val: '$93.2', vals: [98,96.5,95,94.2,93.8,93.5,93.2], chg: '-$4.8', trend: 'neg' },
    };

    // ============================================================
    //  FACET FILTERING
    // ============================================================
    function onFacetChange() {
      const cbs = document.querySelectorAll('.facet-cb');
      IssueState.activeFacets.clear();
      cbs.forEach(cb => { if (cb.checked) IssueState.activeFacets.add(cb.value); });
      updateActiveTagsStrip();
      renderIssueCards();
    }

    function updateActiveTagsStrip() {
      const strip = document.getElementById('active-tags-strip');
      const countBadge = document.getElementById('facet-active-count');
      const n = IssueState.activeFacets.size;

      if (n === 0) {
        strip.style.display = 'none';
        countBadge.style.display = 'none';
        return;
      }

      strip.style.display = 'flex';
      countBadge.style.display = 'inline-flex';
      countBadge.textContent = n + '개 활성';
      strip.innerHTML = '';

      IssueState.activeFacets.forEach(tag => {
        const chip = document.createElement('div');
        chip.className = 'active-tag-chip';
        const displayTag = tag.startsWith('src:') ? tag.replace('src:','') :
                           tag.startsWith('urg:') ? ({ high:'즉시대응', mid:'모니터링', low:'참고' }[tag.split(':')[1]]) : tag;
        chip.innerHTML = \`#\${displayTag} <i class="fas fa-times" style="font-size:8px;"></i>\`;
        chip.onclick = () => {
          IssueState.activeFacets.delete(tag);
          // Uncheck corresponding checkbox
          const cb = document.querySelector(\`.facet-cb[value="\${tag}"]\`);
          if (cb) cb.checked = false;
          updateActiveTagsStrip();
          renderIssueCards();
        };
        strip.appendChild(chip);
      });
    }

    function issueMatchesFacets(issue) {
      if (IssueState.activeFacets.size === 0 && !IssueState.searchQuery) return true;

      const allTags = issue.tags.map(t => t.replace('#',''));
      const srcTag = 'src:' + issue.source.split('/')[0].replace(' ','');
      const urgTag = 'urg:' + issue.urgency;
      const allMatchable = [...allTags, srcTag, urgTag];
      const textBody = (issue.title + ' ' + issue.summary).toLowerCase();

      // Facet intersection
      let facetMatch = true;
      if (IssueState.activeFacets.size > 0) {
        facetMatch = [...IssueState.activeFacets].every(f => allMatchable.some(m => m.includes(f) || f.includes(m)));
      }

      // Search query
      let searchMatch = true;
      if (IssueState.searchQuery) {
        const q = IssueState.searchQuery.toLowerCase();
        searchMatch = textBody.includes(q) || allMatchable.some(m => m.toLowerCase().includes(q));
      }

      return facetMatch && searchMatch;
    }

    function renderIssueCards() {
      const container = document.getElementById('issue-cards-container');
      const emptyState = document.getElementById('issue-empty-state');
      const resultCount = document.getElementById('timeline-result-count');
      if (!container) return;

      const filtered = ISSUES_DATA.filter(issueMatchesFacets);

      // Sort
      if (IssueState.sortMode === 'insight') {
        filtered.sort((a,b) => b.insightCount - a.insightCount);
      } else if (IssueState.sortMode === 'impact') {
        const urgOrder = { high:0, mid:1, low:2 };
        filtered.sort((a,b) => urgOrder[a.urgency] - urgOrder[b.urgency]);
      }

      resultCount.innerHTML = \`필터 결과 <strong>\${filtered.length}</strong>개 이슈\`;

      if (filtered.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
      }
      emptyState.style.display = 'none';

      container.innerHTML = '';
      filtered.forEach(issue => buildIssueCard(issue, container));
    }

    function buildIssueCard(issue, container) {
      const isExpanded = IssueState.expandedIssues.has(issue.id);
      const pfClass = IssueState.portfolioLinked
        ? (issue.pfImpact === 'bullish' ? 'pf-bullish' : issue.pfImpact === 'bearish' ? 'pf-bearish' : 'pf-neutral')
        : '';

      const urgBarClass = { high: 'urg-bar-high', mid: 'urg-bar-mid', low: 'urg-bar-low' }[issue.urgency];
      const urgBadgeClass = { high: 'ubadge-high', mid: 'ubadge-mid', low: 'ubadge-low' }[issue.urgency];
      const urgLabel = { high: '즉시 대응', mid: '모니터링', low: '참고' }[issue.urgency];

      const tagsHtml = issue.tags.map((tag, i) => {
        const tc = { macro:'tag-macro', sector:'tag-sector', asset:'tag-asset' }[issue.tagTypes[i]] || '';
        const bare = tag.replace('#','');
        const hasSparkline = TAG_SPARKLINE[bare] ? \`data-spark="\${bare}"\` : '';
        return \`<span class="issue-tag \${tc}" \${hasSparkline}
          onmouseenter="showSparkline(event, '\${bare}')"
          onmouseleave="hideSparkline()"
          onclick="onTagClick(event, '\${bare}')">\${tag}</span>\`;
      }).join('');

      const pfSignalHtml = IssueState.portfolioLinked && issue.pfImpact !== 'neutral'
        ? \`<div style="margin-top:6px;display:flex;align-items:center;gap:5px;">
            <span style="font-size:9px;color:var(--text-muted);">포트폴리오 영향:</span>
            <span style="font-size:10px;font-weight:600;color:\${issue.pfImpact==='bullish'?'#3FB950':'#F85149'};">
              \${issue.pfImpact==='bullish'?'▲ 우호적':'▼ 불리'}
            </span>
           </div>\` : '';

      // Build clusters HTML
      const clustersHtml = issue.clusters.map(cluster => {
        const threadsHtml = cluster.threads.map((t, ti) => {
          const isLast = ti === cluster.threads.length - 1;
          const pfSig = t.pfSignal
            ? \`<div class="thread-pf-signal \${t.pfSignal==='bull'?'pf-signal-bull':'pf-signal-bear'}">
                <i class="fas fa-\${t.pfSignal==='bull'?'arrow-up':'arrow-down'}"></i> \${t.pfSignalText}
               </div>\`
            : '';
          const pfSigVisible = IssueState.portfolioLinked ? pfSig : '';

          return \`<div class="thread-item \${isLast?'thread-item-dot-last':''}">
            <div class="thread-connector">
              <div class="thread-dot"></div>
              <div class="thread-line"></div>
            </div>
            <div class="thread-content">
              <div class="thread-content-header">
                <span class="thread-time">\${t.time}</span>
                <span class="thread-source-label \${t.srcClass}">\${t.source}</span>
                <span class="thread-author">\${t.author}</span>
                <span class="thread-raw-source" title="원자료 확인">
                  <i class="fas fa-link"></i> \${t.rawSrc}
                </span>
              </div>
              <div class="thread-body-title">\${t.title}</div>
              <div class="thread-body-summary">\${t.summary}</div>
              <div class="thread-insight-highlight">
                <i class="fas fa-lightbulb thread-insight-icon"></i>
                <span class="thread-insight-text">💡 \${t.insight}</span>
              </div>
              \${pfSigVisible}
            </div>
          </div>\`;
        }).join('');

        return \`<div class="cluster-box">
          <div class="cluster-header">
            <i class="fas fa-project-diagram" style="font-size:10px;color:var(--accent-cyan);"></i>
            <span class="cluster-label">\${cluster.label}</span>
            <span class="cluster-desc">\${cluster.desc}</span>
            <span class="cluster-count-badge">\${cluster.threads.length}개</span>
          </div>
          <div class="thread-list">\${threadsHtml}</div>
        </div>\`;
      }).join('');

      const card = document.createElement('div');
      card.className = \`issue-card \${pfClass}\`;
      card.dataset.id = issue.id;
      card.innerHTML = \`
        <div class="issue-card-header" onclick="toggleIssueAccordion('\${issue.id}')">
          <div class="issue-urgency-bar \${urgBarClass}"></div>
          <div class="issue-card-meta">
            <div class="issue-card-time-row">
              <span class="issue-time-badge"><i class="fas fa-clock" style="margin-right:3px;"></i>\${issue.time}</span>
              <span class="issue-source-badge \${issue.srcClass}">\${issue.source}</span>
              <span class="issue-urgency-badge \${urgBadgeClass}">\${urgLabel}</span>
            </div>
            <div class="issue-card-title">\${issue.title}</div>
            <div class="issue-card-summary">\${issue.summary}</div>
            <div class="issue-tags-row">\${tagsHtml}</div>
            \${pfSignalHtml}
          </div>
        </div>
        <div class="issue-card-toggle" onclick="toggleIssueAccordion('\${issue.id}')">
          <i class="fas fa-sitemap" style="font-size:9px;color:var(--accent-cyan);"></i>
          맥락 클러스터 &amp; 인사이트 보기
          <span class="toggle-insight-count">\${issue.insightCount}개 분석</span>
          <i class="fas fa-chevron-down toggle-arrow \${isExpanded?'open':''}"></i>
        </div>
        <div class="issue-accordion \${isExpanded?'open':''}" id="accordion-\${issue.id}">
          <div class="accordion-inner">\${clustersHtml}</div>
        </div>
      \`;

      container.appendChild(card);
    }

    function toggleIssueAccordion(issueId) {
      const accordion = document.getElementById('accordion-' + issueId);
      const arrow = accordion
        ? accordion.closest('.issue-card').querySelector('.toggle-arrow')
        : null;
      if (!accordion) return;

      if (IssueState.expandedIssues.has(issueId)) {
        IssueState.expandedIssues.delete(issueId);
        accordion.classList.remove('open');
        if (arrow) arrow.classList.remove('open');
      } else {
        IssueState.expandedIssues.add(issueId);
        accordion.classList.add('open');
        if (arrow) arrow.classList.add('open');
      }
    }

    // ============================================================
    //  SEARCH
    // ============================================================
    function onIssueSearch(val) {
      IssueState.searchQuery = val.trim();
      document.getElementById('issue-search-clear').style.display = val ? 'flex' : 'none';
      renderIssueCards();
    }

    function clearSearch() {
      document.getElementById('issue-search-input').value = '';
      document.getElementById('issue-search-clear').style.display = 'none';
      IssueState.searchQuery = '';
      renderIssueCards();
    }

    // ============================================================
    //  SORT
    // ============================================================
    function setSortMode(btn, mode) {
      IssueState.sortMode = mode;
      document.querySelectorAll('.timeline-sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderIssueCards();
    }

    // ============================================================
    //  PRESET
    // ============================================================
    function applyPreset(preset) {
      resetAllFilters();
      const presets = {
        macro:  ['TGA','RRP','FOMC','SOFR','유동성'],
        sector: ['AI인프라','Quantum','반도체'],
        crypto: ['BTC'],
      };
      const tags = presets[preset] || [];
      tags.forEach(tag => {
        const cb = document.querySelector(\`.facet-cb[value="\${tag}"]\`);
        if (cb) { cb.checked = true; IssueState.activeFacets.add(tag); }
      });
      updateActiveTagsStrip();
      renderIssueCards();
    }

    function resetAllFilters() {
      IssueState.activeFacets.clear();
      IssueState.searchQuery = '';
      document.querySelectorAll('.facet-cb').forEach(cb => cb.checked = false);
      const inp = document.getElementById('issue-search-input');
      if (inp) inp.value = '';
      const clr = document.getElementById('issue-search-clear');
      if (clr) clr.style.display = 'none';
      updateActiveTagsStrip();
      renderIssueCards();
    }

    // ============================================================
    //  PORTFOLIO LINK TOGGLE
    // ============================================================
    function togglePortfolioLink(btn) {
      IssueState.portfolioLinked = !IssueState.portfolioLinked;
      btn.classList.toggle('linked', IssueState.portfolioLinked);
      btn.innerHTML = IssueState.portfolioLinked
        ? '<i class="fas fa-link"></i> 연동 ON'
        : '<i class="fas fa-link"></i> 포트폴리오 연동';
      renderIssueCards();
    }

    // ============================================================
    //  TAG SPARKLINE POPUP
    // ============================================================
    let sparklineChart = null;

    function showSparkline(event, tagKey) {
      const data = TAG_SPARKLINE[tagKey];
      if (!data) return;

      const popup = document.getElementById('tag-sparkline-popup');
      document.getElementById('sparkline-tag-name').textContent = data.label;
      document.getElementById('sparkline-current-val').textContent = data.val;
      document.getElementById('sparkline-change').textContent = data.chg;
      document.getElementById('sparkline-change').className = data.trend === 'pos' ? 'positive' : 'negative';
      document.getElementById('sparkline-change').style.cssText = 'font-size:10px;font-family:JetBrains Mono,monospace;font-weight:600;';

      // Position popup
      const rect = event.target.getBoundingClientRect();
      let top = rect.top - 90;
      let left = rect.left;
      if (top < 0) top = rect.bottom + 4;
      if (left + 200 > window.innerWidth) left = window.innerWidth - 210;
      popup.style.top = top + 'px';
      popup.style.left = left + 'px';
      popup.style.display = 'block';

      // Draw sparkline
      const ctx = document.getElementById('sparkline-canvas').getContext('2d');
      if (sparklineChart) sparklineChart.destroy();
      const color = data.trend === 'pos' ? '#3FB950' : '#F85149';
      sparklineChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.vals.map((_, i) => i),
          datasets: [{
            data: data.vals,
            borderColor: color,
            backgroundColor: color + '18',
            borderWidth: 1.5,
            pointRadius: 0,
            fill: true,
            tension: 0.4,
          }]
        },
        options: {
          responsive: false,
          animation: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });
    }

    function hideSparkline() {
      document.getElementById('tag-sparkline-popup').style.display = 'none';
      if (sparklineChart) { sparklineChart.destroy(); sparklineChart = null; }
    }

    // ============================================================
    //  TAG CLICK (add to facet filter)
    // ============================================================
    function onTagClick(event, tagKey) {
      event.stopPropagation();
      const cb = document.querySelector(\`.facet-cb[value="\${tagKey}"]\`);
      if (cb) {
        cb.checked = !cb.checked;
        if (cb.checked) IssueState.activeFacets.add(tagKey);
        else IssueState.activeFacets.delete(tagKey);
        updateActiveTagsStrip();
        renderIssueCards();
      }
    }

    // ============================================================
    //  FACET SECTION TOGGLE
    // ============================================================
    function toggleFacetSection(header) {
      header.parentElement.classList.toggle('collapsed');
    }

    // localStorage sidebar state
    function saveSidebarState() {
      try { localStorage.setItem('mq_sidebar_collapsed', AppState.sidebarCollapsed ? '1' : '0'); } catch(e) {}
    }

    function loadSidebarState() {
      try {
        const v = localStorage.getItem('mq_sidebar_collapsed');
        if (v === '1') {
          AppState.sidebarCollapsed = true;
          document.getElementById('sidebar').classList.add('collapsed');
        }
      } catch(e) {}
    }

    // ============================================================
    //  INIT ALL CHARTS
    // ============================================================
    window.addEventListener('DOMContentLoaded', () => {
      loadSidebarState();
      initDonutChart();
      initHeatmap();
      initTimelineChart();
      renderIssueCards();  // Initialize issue page
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
