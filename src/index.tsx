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
  <script src="https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
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
    /* 터미널 모드: 전체 높이 고정, 스크롤 없음 */
    #workspace {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      background: var(--bg-primary);
      display: flex;
      flex-direction: column;
    }

    /* ===== PAGE VIEWS ===== */
    /* 모든 page-view는 workspace 전체를 차지하며 내부만 스크롤 */
    .page-view {
      display: none;
      width: 100%;
      height: 100%;
      overflow: hidden;
      flex-direction: column;
    }
    .page-view.active {
      display: flex;
      flex-direction: column;
    }
    /* 일반 페이지 (portfolio 등): 내부 콘텐츠 영역만 스크롤 */
    .page-view.active .page-scroll-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      min-height: 0;
    }

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

    /* 커닥트 모드: 카드 헤더/바디 패딩 최소화 */
    .card-header {
      padding: 7px 12px !important;
    }
    .card-body { padding: 10px 12px; }

    /* ===== PORTFOLIO & RISK PAGE ===== */
    /* 터미널 모드: page 전체 구조 */
    #page-portfolio {
      display: none;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      padding: 0;
    }
    #page-portfolio.active { display: flex; }

    .portfolio-grid {
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr;
      gap: 8px;
      padding: 8px;
      overflow: hidden;
    }
    /* 카드 자체가 그리드 셀을 채우도록 */
    .portfolio-grid > .card {
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .portfolio-grid > .card .card-body {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    /* Widget 1: Portfolio Summary */
    .portfolio-summary-widget .card-body {
      padding: 0;
    }

    .widget-inner-layout {
      display: flex;
      flex-direction: column;
      gap: 0;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    }

    /* Donut + KPI row */
    .donut-kpi-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      border-bottom: 1px solid var(--border-color);
    }

    .donut-panel {
      padding: 10px 12px;
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .donut-container {
      position: relative;
      width: 110px;
      height: 110px;
    }

    .donut-center-label {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .donut-center-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-accent);
      font-family: 'JetBrains Mono', monospace;
      line-height: 1;
    }

    .donut-center-sub {
      font-size: 8px;
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
      padding: 8px 12px;
    }

    .risk-title {
      font-size: 9px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
    }

    .risk-bar-item {
      margin-bottom: 6px;
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
      padding: 6px 10px;
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
      padding: 4px 4px;
      font-size: 10px;
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
    .correlation-widget .card-body { padding: 0; overflow: hidden; }

    .corr-inner-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      height: 100%;
      overflow: hidden;
    }

    .heatmap-panel {
      padding: 10px 12px;
      border-right: 1px solid var(--border-color);
      overflow-y: auto;
      overflow-x: hidden;
    }

    .heatmap-panel-title {
      font-size: 9px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
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
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow: hidden;
      min-height: 0;
    }

    .timeline-panel-title {
      font-size: 9px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      flex-shrink: 0;
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

    .timeline-chart-container { flex: 1; min-height: 0; overflow: hidden; }

    /* Heatmap full-width row */
    .heatmap-correlation-row {
      border-top: 1px solid var(--border-color);
    }

    /* ══════════════════════════════════════════════
       MC — 매크로 차트 페이지
    ══════════════════════════════════════════════ */
    #page-chart {
      padding: 0;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    /* 루트: 컨트롤바 + 바디 */
    .mc-root { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }

    /* ── A. 상단 컨트롤 헤더 ── */
    .mc-top-bar {
      display: flex; align-items: center; gap: 0;
      height: 42px; flex-shrink: 0;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      padding: 0 10px; gap: 8px;
    }
    .mc-top-left  { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .mc-top-center{ display: flex; align-items: center; gap: 5px; flex: 1; justify-content: center; overflow: hidden; }
    .mc-top-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .mc-divider-v { width: 1px; height: 20px; background: var(--border-color); margin: 0 2px; }

    /* 타임프레임 버튼 */
    .mc-tf-group { display: flex; gap: 2px; }
    .mc-tf-btn {
      background: none; border: 1px solid transparent; border-radius: 3px;
      color: var(--text-muted); font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      padding: 3px 8px; cursor: pointer; transition: all 0.13s;
      letter-spacing: 0.04em;
    }
    .mc-tf-btn:hover { border-color: var(--border-color); color: var(--text-primary); }
    .mc-tf-btn.active { background: rgba(88,166,255,0.15); border-color: var(--accent-blue); color: var(--accent-blue); }

    /* 차트 스타일 버튼 */
    .mc-style-group { display: flex; gap: 2px; }
    .mc-style-btn {
      background: none; border: 1px solid transparent; border-radius: 3px;
      color: var(--text-muted); font-size: 11px;
      width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.13s;
    }
    .mc-style-btn:hover { border-color: var(--border-color); color: var(--text-primary); }
    .mc-style-btn.active { background: rgba(88,166,255,0.15); border-color: var(--accent-blue); color: var(--accent-blue); }

    /* 아이콘 버튼 */
    .mc-icon-btn {
      background: none; border: 1px solid transparent; border-radius: 3px;
      color: var(--text-muted); font-size: 11px;
      width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.13s;
    }
    .mc-icon-btn:hover { border-color: var(--border-color); color: var(--text-primary); }
    .mc-icon-btn.active { background: rgba(88,166,255,0.15); border-color: var(--accent-blue); color: var(--accent-blue); }

    /* 프리셋 드롭다운 */
    .mc-preset-wrap {
      position: relative; display: flex; align-items: center;
    }
    .mc-preset-trigger {
      background: var(--bg-card); border: 1px solid var(--border-color);
      border-radius: 4px; color: var(--text-muted); font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      padding: 4px 10px; cursor: pointer; transition: all 0.15s;
      white-space: nowrap; letter-spacing: 0.06em; font-weight: 700;
      display: flex; align-items: center; gap: 6px; height: 26px;
    }
    .mc-preset-trigger:hover { border-color: rgba(88,166,255,0.4); color: var(--text-primary); background: rgba(88,166,255,0.06); }
    .mc-preset-trigger.active { border-color: var(--accent-blue); color: var(--accent-blue); background: rgba(88,166,255,0.12); }
    .mc-preset-trigger .mc-preset-caret { font-size: 8px; transition: transform 0.18s; }
    .mc-preset-trigger.open .mc-preset-caret { transform: rotate(180deg); }
    .mc-preset-active-name {
      font-size: 9px; color: var(--text-muted); letter-spacing: 0.03em;
      max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .mc-preset-dropdown {
      position: absolute; top: calc(100% + 4px); left: 0; z-index: 900;
      background: var(--bg-secondary); border: 1px solid var(--border-color);
      border-radius: 6px; padding: 4px 0;
      min-width: 180px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      display: none;
    }
    .mc-preset-dropdown.open { display: block; }
    .mc-preset-item {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 12px; cursor: pointer; transition: background 0.12s;
      font-size: 10px; font-family: 'JetBrains Mono', monospace;
      color: var(--text-secondary); white-space: nowrap;
    }
    .mc-preset-item i { font-size: 9px; width: 12px; text-align: center; color: var(--text-muted); }
    .mc-preset-item:hover { background: rgba(88,166,255,0.07); color: var(--text-primary); }
    .mc-preset-item.active { color: var(--accent-blue); background: rgba(88,166,255,0.08); }
    .mc-preset-item.active i { color: var(--accent-blue); }
    .mc-preset-divider { height: 1px; background: var(--border-color); margin: 4px 0; }
    /* 기존 호환 (JS에서 .mc-preset-btn 쿼리 사용) */
    .mc-preset-btn { display: none; }

    /* 라이브 인디케이터 */
    .mc-live-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #3FB950; animation: pulse-green 2s infinite;
    }
    @keyframes pulse-green {
      0%,100% { opacity:1; box-shadow: 0 0 0 0 rgba(63,185,80,0.5); }
      50%      { opacity:0.7; box-shadow: 0 0 0 4px rgba(63,185,80,0); }
    }
    .mc-live-label { font-size: 9px; font-family: 'JetBrains Mono', monospace; color: #3FB950; letter-spacing: 0.08em; }

    /* ── B. 바디 (사이드바 + 캔버스) ── */
    .mc-body { flex: 1; display: flex; min-height: 0; overflow: hidden; }

    /* 사이드바 */
    .mc-sidebar {
      width: 200px; min-width: 200px; flex-shrink: 0;
      border-right: 1px solid var(--border-color);
      background: var(--bg-secondary);
      display: flex; flex-direction: column; overflow: hidden;
      transition: width 0.22s ease, min-width 0.22s ease;
    }
    .mc-sidebar.collapsed { width: 0; min-width: 0; border-right: none; }
    .mc-sb-inner {
      flex: 1; overflow-y: auto; overflow-x: hidden;
      display: flex; flex-direction: column;
    }
    .mc-sb-inner::-webkit-scrollbar { width: 3px; }
    .mc-sb-inner::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 2px; }
    .mc-sb-search-wrap {
      position: relative; padding: 8px 10px 6px; flex-shrink: 0;
      border-bottom: 1px solid var(--border-color);
    }
    .mc-sb-search-icon {
      position: absolute; left: 18px; top: 50%; transform: translateY(-50%);
      font-size: 9px; color: var(--text-muted); pointer-events: none;
    }
    .mc-sb-search {
      width: 100%; background: var(--bg-card);
      border: 1px solid var(--border-color); border-radius: 4px;
      color: var(--text-primary); font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      padding: 4px 8px 4px 22px; outline: none; box-sizing: border-box;
      transition: border-color 0.15s;
    }
    .mc-sb-search:focus { border-color: var(--accent-blue); }
    .mc-sb-search::placeholder { color: var(--text-muted); opacity: 0.6; }

    /* 사이드바 아코디언 그룹 */
    .mc-sb-group { border-bottom: 1px solid var(--border-color); }
    .mc-sb-group-hdr {
      display: flex; align-items: center; gap: 7px;
      padding: 7px 10px; cursor: pointer;
      font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
      color: var(--text-muted); text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
      transition: background 0.12s; user-select: none;
    }
    .mc-sb-group-hdr:hover { background: rgba(88,166,255,0.04); }
    .mc-sb-chevron { font-size: 8px; transition: transform 0.2s; }
    .mc-sb-group.collapsed .mc-sb-chevron { transform: rotate(-90deg); }
    .mc-sb-items { overflow: hidden; }
    .mc-sb-group.collapsed .mc-sb-items { display: none; }
    .mc-sb-item {
      display: flex; align-items: center; gap: 7px;
      padding: 5px 10px; cursor: pointer; transition: background 0.12s;
    }
    .mc-sb-item:hover { background: rgba(88,166,255,0.05); }
    .mc-cb { accent-color: var(--accent-blue); width: 11px; height: 11px; cursor: pointer; flex-shrink: 0; }
    .mc-cb-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .mc-sb-name { flex: 1; font-size: 10px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mc-sb-val { font-size: 9px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; flex-shrink: 0; }

    /* ── C. 캔버스 영역 ── */
    .mc-canvas-wrap {
      flex: 1; display: flex; flex-direction: column;
      min-width: 0; overflow: hidden; position: relative;
      background: var(--bg-primary);
    }

    /* 플로팅 범례 */
    .mc-legend {
      position: absolute; top: 10px; left: 12px;
      z-index: 10; display: flex; flex-direction: column; gap: 3px;
      pointer-events: none;
    }
    .mc-legend-item {
      display: flex; align-items: center; gap: 6px;
      background: rgba(13,17,23,0.82);
      border: 1px solid var(--border-color);
      border-radius: 4px; padding: 3px 8px;
      pointer-events: all;
    }
    .mc-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .mc-legend-name { font-size: 10px; font-family: 'JetBrains Mono', monospace; color: var(--text-secondary); }
    .mc-legend-val  { font-size: 10px; font-family: 'JetBrains Mono', monospace; color: var(--text-primary); font-weight: 600; }
    .mc-legend-chg  { font-size: 9px;  font-family: 'JetBrains Mono', monospace; }
    .mc-legend-chg.pos { color: #3FB950; }
    .mc-legend-chg.neg { color: #F85149; }
    .mc-legend-actions { display: flex; gap: 3px; opacity: 0; transition: opacity 0.15s; }
    .mc-legend-item:hover .mc-legend-actions { opacity: 1; }
    .mc-legend-act-btn {
      background: none; border: none; color: var(--text-muted);
      font-size: 9px; cursor: pointer; padding: 0 2px;
      transition: color 0.12s;
    }
    .mc-legend-act-btn:hover { color: var(--text-primary); }

    /* 메인 차트 */
    .mc-chart-main {
      flex: 1; min-height: 0;
      position: relative; overflow: hidden;
    }
    /* Crosshair 말풍선 (커스텀) */
    .mc-crosshair-x, .mc-crosshair-y {
      position: absolute; pointer-events: none; z-index: 20;
      background: rgba(13,17,23,0.9);
      border: 1px solid var(--border-color);
      border-radius: 3px; padding: 2px 6px;
      font-size: 9px; font-family: 'JetBrains Mono', monospace;
      color: var(--text-primary); white-space: nowrap;
    }

    /* 서브 패널 그룹 */
    .mc-sub-panels {
      display: flex; flex-direction: column; gap: 0;
      border-top: 1px solid var(--border-color);
      height: 200px; flex-shrink: 0;
      transition: height 0.22s ease, opacity 0.22s ease;
    }
    .mc-sub-panels.hidden { height: 0; opacity: 0; overflow: hidden; }
    .mc-sub-panel {
      flex: 1; display: flex; flex-direction: column;
      border-bottom: 1px solid var(--border-color);
      overflow: hidden;
    }
    .mc-sub-panel:last-child { border-bottom: none; }
    .mc-sub-panel-label {
      font-size: 8px; font-weight: 700; letter-spacing: 0.1em;
      color: var(--text-muted); font-family: 'JetBrains Mono', monospace;
      padding: 4px 8px; flex-shrink: 0;
      border-bottom: 1px solid var(--border-color);
    }
    .mc-sub-chart { flex: 1; min-height: 0; overflow: hidden; }

    /* RSI 레벨 라인 색 */
    .mc-rsi-ob { color: #F85149; }
    .mc-rsi-os { color: #3FB950; }

    /* ===== MAIN DASHBOARD LAYOUT ===== */
    #page-dashboard {
      padding: 0;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .db-ticker-strip {
      display: flex;
      align-items: center;
      gap: 0;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      padding: 0 16px;
      height: 32px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .db-ticker-item {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 0 12px;
      border-right: 1px solid var(--border-color);
      height: 100%;
      flex-shrink: 0;
    }

    .db-ticker-sym { font-size: 10px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text-secondary); }
    .db-ticker-val { font-size: 11px; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
    .db-ticker-chg { font-size: 9px; font-family: 'JetBrains Mono', monospace; }

    .db-body {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: row;
      min-height: 0;
    }

    /* IIT 패널 (좌측 60%) */
    .db-iit-panel {
      flex: 0 0 60%;
      min-width: 0;
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Radar 패널 (우측 40%) */
    .db-radar-panel {
      flex: 0 0 40%;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--bg-primary);
    }

    /* ══════════════════════════════════════════════
       MPR — 매크로 국면 나침반 (Macro Phase Radar)
    ══════════════════════════════════════════════ */
    .mpr-root {
      flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden;
    }
    .mpr-header {
      height: 38px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 14px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-secondary);
    }
    .mpr-title {
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
      font-family: 'JetBrains Mono', monospace; color: var(--text-secondary);
      display: flex; align-items: center; gap: 7px;
    }
    .mpr-title-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #58A6FF;
      box-shadow: 0 0 6px #58A6FF, 0 0 12px rgba(88,166,255,0.4);
    }
    .mpr-meta {
      font-size: 9px; font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted); letter-spacing: 0.04em;
    }
    .mpr-body {
      flex: 1; display: flex; flex-direction: column; min-height: 0; position: relative;
    }
    .mpr-chart-wrap {
      flex: 1; min-height: 0; position: relative;
    }
    #mpr-chart {
      width: 100%; height: 100%;
    }
    /* 툴팁 */
    .mpr-tooltip {
      position: fixed; z-index: 9999;
      background: rgba(18,22,31,0.97);
      border: 1px solid rgba(88,166,255,0.3);
      border-radius: 8px; padding: 12px 14px;
      min-width: 220px; max-width: 280px;
      pointer-events: none; display: none;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    }
    .mpr-tooltip.visible { display: block; }
    .mpr-tt-title {
      font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
      color: #58A6FF; font-family: 'JetBrains Mono', monospace;
      margin-bottom: 10px; text-transform: uppercase;
    }
    .mpr-tt-item {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 6px;
    }
    .mpr-tt-label {
      font-size: 9px; color: var(--text-secondary);
      font-family: 'Inter', sans-serif; flex: 0 0 auto; width: 110px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .mpr-tt-bar-wrap {
      flex: 1; height: 4px; background: rgba(255,255,255,0.06);
      border-radius: 2px; overflow: hidden;
    }
    .mpr-tt-bar {
      height: 100%; border-radius: 2px;
      background: linear-gradient(90deg, rgba(88,166,255,0.5), #58A6FF);
      transition: width 0.3s;
    }
    .mpr-tt-pct {
      font-size: 9px; font-family: 'JetBrains Mono', monospace;
      color: var(--text-primary); flex-shrink: 0; width: 30px; text-align: right;
    }
    /* 하단 범례 스트립 */
    .mpr-legend-strip {
      flex-shrink: 0; height: 32px;
      display: flex; align-items: center; gap: 0;
      border-top: 1px solid var(--border-color);
      background: var(--bg-secondary);
      padding: 0 10px; overflow: hidden;
    }
    .mpr-legend-item {
      display: flex; align-items: center; gap: 4px;
      padding: 0 8px; font-size: 8.5px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted); white-space: nowrap; flex-shrink: 0;
    }
    .mpr-legend-dot {
      width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
    }

    /* ══════════════════════════════════════════════
       IIT — 이슈-인사이트 스레드 (Issue-Insight Thread)
    ══════════════════════════════════════════════ */
    .iit-root {
      flex: 1; display: flex; min-height: 0; overflow: hidden;
    }
    /* ── A. 사이드바 ── */
    .iit-sidebar {
      width: 210px; min-width: 210px;
      border-right: 1px solid var(--border-color);
      background: var(--bg-secondary);
      display: flex; flex-direction: column; overflow: hidden;
      transition: width 0.22s ease, min-width 0.22s ease;
    }
    .iit-sidebar.collapsed { width: 0; min-width: 0; border-right: none; }
    .iit-sb-inner {
      flex: 1; overflow-y: auto; overflow-x: hidden;
      padding: 10px 0 16px;
      display: flex; flex-direction: column; gap: 0;
    }
    .iit-sb-inner::-webkit-scrollbar { width: 3px; }
    .iit-sb-inner::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 2px; }
    .iit-sb-search { position: relative; margin: 0 10px 8px; }
    .iit-sb-search-icon {
      position: absolute; left: 8px; top: 50%; transform: translateY(-50%);
      font-size: 9px; color: var(--text-muted); pointer-events: none;
    }
    .iit-sb-input {
      width: 100%; background: var(--bg-card);
      border: 1px solid var(--border-color); border-radius: 4px;
      color: var(--text-primary); font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      padding: 5px 8px 5px 24px; outline: none; box-sizing: border-box;
      transition: border-color 0.15s;
    }
    .iit-sb-input:focus { border-color: var(--accent-blue); }
    .iit-sb-input::placeholder { color: var(--text-muted); opacity: 0.6; }
    .iit-reset-btn {
      margin: 0 10px 10px; background: none;
      border: 1px solid var(--border-color); border-radius: 4px;
      color: var(--text-muted); font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      padding: 4px 8px; cursor: pointer; text-align: left;
      transition: border-color 0.15s, color 0.15s; letter-spacing: 0.04em;
    }
    .iit-reset-btn:hover { border-color: var(--accent-blue); color: var(--accent-blue); }
    .iit-pf-toggle {
      margin: 0 10px 12px; display: flex; align-items: center;
      justify-content: space-between; cursor: pointer;
      padding: 6px 8px; background: var(--bg-card);
      border: 1px solid var(--border-color); border-radius: 4px;
      transition: border-color 0.15s;
    }
    .iit-pf-toggle:hover { border-color: var(--accent-blue); }
    .iit-pf-label { font-size: 9px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em; }
    .iit-pf-label i { color: var(--accent-blue); margin-right: 5px; }
    .iit-toggle-switch {
      width: 28px; height: 14px; background: var(--border-color);
      border-radius: 7px; position: relative; transition: background 0.2s; flex-shrink: 0;
    }
    .iit-toggle-switch.on { background: var(--accent-blue); }
    .iit-toggle-knob {
      width: 10px; height: 10px; background: #fff; border-radius: 50%;
      position: absolute; top: 2px; left: 2px; transition: left 0.2s;
    }
    .iit-toggle-switch.on .iit-toggle-knob { left: 16px; }
    .iit-facet-group { padding: 0 0 8px; border-bottom: 1px solid var(--border-color); margin-bottom: 4px; }
    .iit-facet-group:last-child { border-bottom: none; }
    .iit-facet-title {
      font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--text-muted); padding: 6px 10px 4px; font-family: 'JetBrains Mono', monospace;
    }
    .iit-facet-title i { color: var(--accent-blue); margin-right: 5px; font-size: 8px; }
    .iit-facet-item {
      display: flex; align-items: center; gap: 6px;
      padding: 3px 10px; cursor: pointer; transition: background 0.12s;
    }
    .iit-facet-item:hover { background: rgba(88,166,255,0.05); }
    .iit-cb { accent-color: var(--accent-blue); width: 11px; height: 11px; cursor: pointer; flex-shrink: 0; }
    .iit-facet-name { flex: 1; font-size: 10px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
    .iit-facet-cnt {
      font-size: 9px; color: var(--text-muted); background: var(--bg-card);
      border: 1px solid var(--border-color); border-radius: 8px;
      padding: 0 5px; font-family: 'JetBrains Mono', monospace;
    }
    /* ── B. 메인 ── */
    .iit-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
    .iit-ctrl-hdr {
      display: flex; align-items: center; gap: 12px;
      padding: 7px 14px; border-bottom: 1px solid var(--border-color);
      background: var(--bg-secondary); flex-shrink: 0;
    }
    .iit-ctrl-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .iit-sidebar-toggle {
      background: none; border: 1px solid var(--border-color); border-radius: 4px;
      color: var(--text-muted); font-size: 11px;
      width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: border-color 0.15s, color 0.15s; flex-shrink: 0;
    }
    .iit-sidebar-toggle:hover { border-color: var(--accent-blue); color: var(--accent-blue); }
    .iit-ctrl-title { font-size: 11px; font-weight: 700; color: var(--text-primary); white-space: nowrap; letter-spacing: 0.03em; }
    .iit-ctrl-sub { font-size: 9px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; white-space: nowrap; }
    .iit-ctrl-center { display: flex; align-items: center; gap: 4px; flex: 1; justify-content: center; }
    .iit-preset-btn {
      background: none; border: 1px solid var(--border-color); border-radius: 4px;
      color: var(--text-muted); font-size: 9px; font-family: 'JetBrains Mono', monospace;
      padding: 3px 10px; cursor: pointer; letter-spacing: 0.04em;
      transition: all 0.15s; white-space: nowrap;
    }
    .iit-preset-btn:hover, .iit-preset-btn.active {
      background: rgba(88,166,255,0.12); border-color: var(--accent-blue); color: var(--accent-blue);
    }
    .iit-ctrl-right { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
    .iit-sort-label { font-size: 9px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .iit-sort-btn {
      background: none; border: 1px solid transparent; border-radius: 3px;
      color: var(--text-muted); font-size: 9px; font-family: 'JetBrains Mono', monospace;
      padding: 2px 7px; cursor: pointer; transition: all 0.15s;
    }
    .iit-sort-btn:hover, .iit-sort-btn.active { border-color: var(--border-color); color: var(--text-primary); }
    /* 타임라인 */
    .iit-timeline {
      flex: 1; overflow-y: auto; padding: 12px 16px;
      display: flex; flex-direction: column; gap: 0;
    }
    .iit-timeline::-webkit-scrollbar { width: 4px; }
    .iit-timeline::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 2px; }
    .iit-date-divider { display: flex; align-items: center; gap: 8px; margin: 14px 0 8px; }
    .iit-date-divider:first-child { margin-top: 0; }
    .iit-date-line { flex: 1; height: 1px; background: var(--border-color); }
    .iit-date-label {
      font-size: 9px; font-weight: 700; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; letter-spacing: 0.1em;
      text-transform: uppercase; white-space: nowrap;
    }
    /* 이슈 카드 */
    .iit-issue {
      border: 1px solid var(--border-color); border-radius: 6px;
      margin-bottom: 8px; background: var(--bg-card); overflow: hidden;
      transition: border-color 0.15s;
    }
    .iit-issue:hover { border-color: rgba(88,166,255,0.3); }
    .iit-issue.pf-positive { border-left: 3px solid #3FB950; }
    .iit-issue.pf-negative { border-left: 3px solid #F85149; }
    .iit-issue.pf-neutral  { border-left: 3px solid #D29922; }
    .iit-issue-hdr {
      padding: 10px 12px; cursor: pointer;
      display: flex; flex-direction: column; gap: 6px; transition: background 0.12s;
    }
    .iit-issue-hdr:hover { background: rgba(88,166,255,0.03); }
    .iit-issue-meta { display: flex; align-items: center; gap: 6px; }
    .iit-urgency { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .iit-urgency.high   { background: #F85149; box-shadow: 0 0 5px rgba(248,81,73,0.5); }
    .iit-urgency.medium { background: #D29922; }
    .iit-urgency.low    { background: #3FB950; }
    .iit-issue-time { font-size: 9px; font-family: 'JetBrains Mono', monospace; color: var(--text-muted); }
    .iit-issue-type {
      font-size: 8px; font-weight: 700; letter-spacing: 0.06em;
      padding: 1px 6px; border-radius: 3px; text-transform: uppercase;
    }
    .iit-type-issue   { background: rgba(88,166,255,0.15); color: #58A6FF; }
    .iit-type-alert   { background: rgba(248,81,73,0.15);  color: #F85149; }
    .iit-type-insight { background: rgba(63,185,80,0.15);  color: #3FB950; }
    .iit-issue-headline {
      font-size: 12px; font-weight: 600; color: var(--text-primary);
      line-height: 1.45; letter-spacing: 0.01em;
    }
    .iit-tag-row { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
    .iit-tag {
      font-size: 9px; font-family: 'JetBrains Mono', monospace;
      padding: 1px 6px; border-radius: 3px;
      background: rgba(139,148,158,0.1); color: var(--text-muted);
      border: 1px solid var(--border-color); cursor: pointer;
      transition: background 0.12s, color 0.12s;
    }
    .iit-tag:hover, .iit-tag.active {
      background: rgba(88,166,255,0.12); color: var(--accent-blue); border-color: var(--accent-blue);
    }
    .iit-expand-row { display: flex; align-items: center; gap: 6px; padding: 0 12px 10px; cursor: pointer; }
    .iit-expand-btn {
      font-size: 9px; font-family: 'JetBrains Mono', monospace; color: var(--accent-blue);
      background: rgba(88,166,255,0.08); border: 1px solid rgba(88,166,255,0.2);
      border-radius: 3px; padding: 2px 8px; cursor: pointer;
      transition: background 0.12s; display: flex; align-items: center; gap: 4px;
    }
    .iit-expand-btn:hover { background: rgba(88,166,255,0.16); }
    .iit-expand-arrow { transition: transform 0.22s; display: inline-block; }
    .iit-expand-btn.open .iit-expand-arrow { transform: rotate(180deg); }
    /* 아코디언 스레드 */
    .iit-thread { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
    .iit-thread.open { max-height: 800px; border-top: 1px solid var(--border-color); }
    .iit-cluster { margin: 10px 12px; border: 1px solid var(--border-color); border-radius: 5px; overflow: hidden; }
    .iit-cluster-hdr {
      background: rgba(88,166,255,0.05); padding: 5px 10px;
      font-size: 9px; font-weight: 700; color: var(--accent-blue);
      font-family: 'JetBrains Mono', monospace; letter-spacing: 0.06em;
      border-bottom: 1px solid var(--border-color);
      display: flex; align-items: center; gap: 5px;
    }
    /* 인사이트 아이템 */
    .iit-insight-item {
      display: flex; gap: 10px; padding: 8px 10px;
      border-bottom: 1px solid var(--border-color);
      transition: background 0.12s;
    }
    .iit-insight-item:last-child { border-bottom: none; }
    .iit-insight-item:hover { background: rgba(88,166,255,0.03); }
    .iit-tree-line { display: flex; flex-direction: column; align-items: center; width: 14px; flex-shrink: 0; padding-top: 2px; }
    .iit-tree-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border-color); flex-shrink: 0; }
    .iit-tree-stem { flex: 1; width: 1px; background: var(--border-color); min-height: 12px; }
    .iit-insight-item:last-child .iit-tree-stem { display: none; }
    .iit-insight-body { flex: 1; min-width: 0; }
    .iit-insight-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; flex-wrap: wrap; }
    .iit-insight-time { font-size: 8px; font-family: 'JetBrains Mono', monospace; color: var(--text-muted); }
    .iit-insight-src {
      font-size: 8px; font-weight: 600; letter-spacing: 0.04em;
      padding: 1px 5px; border-radius: 2px;
      border: 1px solid var(--border-color); color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }
    .iit-src-x        { border-color: rgba(29,161,242,0.4);  color: #1DA1F2; }
    .iit-src-substack { border-color: rgba(255,104,25,0.4);   color: #FF6819; }
    .iit-src-bloomberg{ border-color: rgba(230,57,70,0.4);    color: #E63946; }
    .iit-src-seeking  { border-color: rgba(88,166,255,0.4);   color: #58A6FF; }
    .iit-src-internal { border-color: rgba(63,185,80,0.4);    color: #3FB950; }
    .iit-rawdata-badge {
      font-size: 8px; padding: 1px 5px; border-radius: 2px;
      background: rgba(210,153,34,0.12); border: 1px solid rgba(210,153,34,0.3);
      color: #D29922; font-family: 'JetBrains Mono', monospace;
      cursor: pointer; transition: background 0.12s;
    }
    .iit-rawdata-badge:hover { background: rgba(210,153,34,0.22); }
    .iit-insight-headline { font-size: 11px; color: var(--text-primary); line-height: 1.4; margin-bottom: 3px; }
    .iit-insight-summary {
      font-size: 10px; color: var(--text-secondary); line-height: 1.45;
      padding: 4px 8px; background: rgba(139,148,158,0.06);
      border-left: 2px solid var(--border-color); border-radius: 0 3px 3px 0;
    }
    .iit-insight-summary strong { color: var(--accent-blue); font-weight: 600; }
    /* 빈 상태 */
    .iit-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 10px; flex: 1;
      color: var(--text-muted); font-family: 'JetBrains Mono', monospace;
    }
    .iit-empty i { font-size: 28px; opacity: 0.2; }
    .iit-empty-msg { font-size: 11px; opacity: 0.5; }

    /* ── MASTER SLOT GRID (3 × 3) ── */
    .slot-master-grid {
      flex: 1; display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: 1fr 1fr 1fr;
      gap: 0; min-height: 0;
    }

    /* ── LEFT COLUMN ── */
    .db-col-left {
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ── CENTER COLUMN ── */
    .db-col-center {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-right: 1px solid var(--border-color);
    }

    /* ── RIGHT COLUMN ── */
    .db-col-right {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ── PANEL CARD ── */
    .db-panel {
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      flex-shrink: 0;
    }

    .db-panel.flex-grow { flex: 1; overflow: hidden; }

    .db-panel-hdr {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 12px;
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
      height: 30px;
    }

    .db-panel-title {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .db-panel-title i { font-size: 9px; color: var(--accent-blue); }

    .db-panel-acts { display: flex; align-items: center; gap: 4px; }

    .db-mini-btn {
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 3px;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      transition: all 0.15s;
    }

    .db-mini-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
    .db-mini-btn.active { background: rgba(59,130,246,0.12); border-color: var(--accent-blue); color: var(--accent-blue); }

    .db-panel-body {
      flex: 1;
      overflow: hidden;
      padding: 8px 10px;
      position: relative;
    }

    .db-panel-body.no-pad { padding: 0; }

    /* ── MARKET PULSE (ARC GAUGE) ── */
    .market-pulse-panel .db-panel-body {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
    }

    .arc-gauge-wrap {
      position: relative;
      width: 90px;
      height: 52px;
      flex-shrink: 0;
    }

    .arc-gauge-wrap canvas { position: absolute; top: 0; left: 0; }

    .arc-center-label {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
    }

    .arc-score { font-size: 16px; font-weight: 700; font-family: 'JetBrains Mono', monospace; line-height: 1; }
    .arc-sub   { font-size: 8px; color: var(--text-muted); margin-top: 1px; }

    .pulse-meta { flex: 1; }
    .pulse-status-label {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      margin-bottom: 5px;
      display: inline-block;
    }

    .pulse-risk-on  { background: rgba(63,185,80,0.15); color: #3FB950; border: 1px solid rgba(63,185,80,0.3); }
    .pulse-risk-off { background: rgba(248,81,73,0.15); color: #F85149; border: 1px solid rgba(248,81,73,0.3); }
    .pulse-neutral  { background: rgba(210,153,34,0.15); color: #D29922; border: 1px solid rgba(210,153,34,0.3); }

    .pulse-metrics { display: flex; flex-direction: column; gap: 3px; }
    .pulse-metric-row { display: flex; justify-content: space-between; align-items: center; }
    .pulse-metric-label { font-size: 9px; color: var(--text-muted); }
    .pulse-metric-val { font-size: 9px; font-family: 'JetBrains Mono', monospace; font-weight: 600; }

    /* ── REGIME MATRIX ── */
    .regime-quadrant {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 2px;
      height: 100%;
    }

    .regime-cell {
      border-radius: 4px;
      padding: 5px 7px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
      transition: filter 0.15s;
      position: relative;
      overflow: hidden;
    }

    .regime-cell:hover { filter: brightness(1.2); }

    .regime-cell.active-cell::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 4px;
    }

    .regime-label { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 0.5px; }
    .regime-sub   { font-size: 8px; color: rgba(255,255,255,0.5); }
    .regime-dot   { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.8); align-self: flex-end; }

    .rc-expansion   { background: rgba(63,185,80,0.2);  border: 1px solid rgba(63,185,80,0.3); }
    .rc-slowdown    { background: rgba(210,153,34,0.2); border: 1px solid rgba(210,153,34,0.3); }
    .rc-contraction { background: rgba(248,81,73,0.2);  border: 1px solid rgba(248,81,73,0.3); }
    .rc-recovery    { background: rgba(34,211,238,0.2); border: 1px solid rgba(34,211,238,0.3); }

    /* ── SECTOR MOMENTUM ── */
    .sector-bar-list { display: flex; flex-direction: column; gap: 4px; }

    .sector-bar-row {
      display: grid;
      grid-template-columns: 46px 1fr 36px;
      align-items: center;
      gap: 5px;
    }

    .sector-name { font-size: 9px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sector-bar-track { height: 5px; background: var(--bg-tertiary); border-radius: 2px; overflow: hidden; }
    .sector-bar-fill  { height: 100%; border-radius: 2px; transition: width 1s ease-out; }
    .sector-pct { font-size: 9px; font-family: 'JetBrains Mono', monospace; text-align: right; }

    /* ── TREEMAP (Stock Heatmap) ── */
    .treemap-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      gap: 1px;
      overflow: hidden;
    }

    .treemap-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      cursor: pointer;
      transition: filter 0.15s;
      min-width: 0;
      overflow: hidden;
    }

    .treemap-cell:hover { filter: brightness(1.3); }
    .treemap-ticker { font-size: 9px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: rgba(255,255,255,0.9); }
    .treemap-pct    { font-size: 8px; font-family: 'JetBrains Mono', monospace; color: rgba(255,255,255,0.7); }

    /* ── CENTER: OVERLAY CHART ── */
    .db-center-top {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .overlay-chart-controls {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-bottom: 1px solid var(--border-color);
      flex-wrap: wrap;
      flex-shrink: 0;
    }

    .overlay-series-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      background: var(--bg-tertiary);
      cursor: pointer;
      transition: all 0.15s;
      color: var(--text-secondary);
    }

    .overlay-series-badge.active { border-color: currentColor; }
    .overlay-series-badge .swatch { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

    /* ── YIELD CURVE ── */
    .yield-kpi-row {
      display: flex;
      gap: 0;
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .yield-kpi {
      flex: 1;
      text-align: center;
      padding: 5px 4px;
      border-right: 1px solid var(--border-color);
    }

    .yield-kpi:last-child { border-right: none; }
    .yield-kpi-label { font-size: 8px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .yield-kpi-val   { font-size: 12px; font-weight: 700; font-family: 'JetBrains Mono', monospace; margin: 1px 0; }
    .yield-kpi-chg   { font-size: 8px; font-family: 'JetBrains Mono', monospace; }

    /* ── CENTER BOTTOM GRID ── */
    .db-center-bottom {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      overflow: hidden;
      border-top: 1px solid var(--border-color);
    }

    /* ── PANEL SLOT SYSTEM ── */
    .panel-slot-grid {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 0;
      overflow: hidden;
      border-top: 1px solid var(--border-color);
      min-height: 0;
    }
    .panel-slot {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-right: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-card);
      cursor: pointer;
      transition: background 0.18s, border-color 0.18s;
      position: relative;
      overflow: hidden;
      min-height: 0;
    }
    /* 3열 기준: 오른쪽 끝(3번째) 슬롯 border-right 제거 */
    .panel-slot:nth-child(3n) { border-right: none; }
    /* 마지막 3개 슬롯 border-bottom 제거 */
    .panel-slot:nth-last-child(-n+3) { border-bottom: none; }
    .panel-slot:hover {
      background: rgba(88,166,255,0.04);
      border-color: rgba(88,166,255,0.25);
    }
    .panel-slot:hover .slot-icon { color: #58A6FF; }
    .panel-slot:hover .slot-label { color: #58A6FF; }
    .panel-slot:hover .slot-ring { border-color: rgba(88,166,255,0.35); }
    /* slot icon ring */
    .slot-ring {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 1.5px dashed rgba(139,148,158,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.18s;
    }
    .slot-icon {
      font-size: 18px;
      color: rgba(139,148,158,0.35);
      transition: color 0.18s;
    }
    .slot-label {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(139,148,158,0.4);
      font-family: 'JetBrains Mono', monospace;
      transition: color 0.18s;
    }
    .slot-hint {
      font-size: 8px;
      color: rgba(139,148,158,0.25);
      font-family: 'JetBrains Mono', monospace;
      position: absolute;
      bottom: 8px;
      letter-spacing: 0.05em;
    }
    /* slot ID badge (top-left) */
    .slot-id {
      position: absolute;
      top: 6px;
      left: 8px;
      font-size: 8px;
      font-family: 'JetBrains Mono', monospace;
      color: rgba(139,148,158,0.2);
      font-weight: 700;
      letter-spacing: 0.06em;
    }
    /* subtle grid lines in background */
    .panel-slot::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(139,148,158,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139,148,158,0.03) 1px, transparent 1px);
      background-size: 20px 20px;
      pointer-events: none;
    }

    /* ── NEWS FEED ── */
    .news-feed-list { overflow-y: auto; height: 100%; }

    .news-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
      padding: 7px 10px;
      border-bottom: 1px solid var(--border-color);
      cursor: pointer;
      transition: background 0.15s;
    }

    .news-item:hover { background: var(--bg-hover); }

    .news-item-meta { display: flex; align-items: center; gap: 5px; }
    .news-time   { font-size: 9px; font-family: 'JetBrains Mono', monospace; color: var(--text-muted); }
    .news-badge  { font-size: 8px; padding: 1px 5px; border-radius: 3px; font-weight: 600; }
    .nb-macro    { background: rgba(59,130,246,0.15); color: #60A5FA; }
    .nb-sector   { background: rgba(167,139,250,0.15); color: #C4B5FD; }
    .nb-alert    { background: rgba(255,123,114,0.15); color: #FF7B72; }
    .nb-crypto   { background: rgba(245,158,11,0.15); color: #FCD34D; }

    .news-headline { font-size: 11px; color: var(--text-primary); line-height: 1.4; font-weight: 500; }
    .news-sub      { font-size: 9px; color: var(--text-muted); }

    /* ── CORR HEATMAP (small) ── */
    .small-heatmap-grid {
      display: grid;
      gap: 1px;
      height: 100%;
      align-content: start;
    }

    /* ── RIGHT: MACRO SCOREBOARD ── */
    .macro-board-list { overflow-y: auto; height: 100%; }

    .macro-board-row {
      display: grid;
      grid-template-columns: 56px 1fr 44px 32px;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-bottom: 1px solid rgba(33,38,45,0.6);
      transition: background 0.12s;
    }

    .macro-board-row:hover { background: var(--bg-hover); }

    .mb-sym  { font-size: 9px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: var(--text-secondary); }
    .mb-bar-track { height: 4px; background: var(--bg-tertiary); border-radius: 2px; overflow: hidden; }
    .mb-bar-fill  { height: 100%; border-radius: 2px; }
    .mb-val  { font-size: 9px; font-family: 'JetBrains Mono', monospace; text-align: right; }
    .mb-chg  { font-size: 8px; font-family: 'JetBrains Mono', monospace; text-align: right; font-weight: 600; }

    /* ── RIGHT: PORTFOLIO MINI ── */
    .pf-mini-layout {
      display: grid;
      grid-template-columns: 80px 1fr;
      gap: 8px;
      height: 100%;
      align-items: start;
    }

    .pf-mini-donut { position: relative; width: 80px; height: 80px; }

    .pf-mini-donut-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
      text-align: center;
    }

    .pf-mini-aum   { font-size: 9px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text-accent); line-height: 1.1; }
    .pf-mini-label { font-size: 7px; color: var(--text-muted); }

    .pf-mini-table { overflow-y: auto; max-height: 100%; }

    .pf-mini-row {
      display: grid;
      grid-template-columns: 30px 1fr 36px 36px;
      gap: 4px;
      padding: 2px 0;
      border-bottom: 1px solid rgba(33,38,45,0.6);
      align-items: center;
    }

    .pf-mini-ticker { font-size: 9px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: var(--accent-cyan); }
    .pf-mini-wgt    { font-size: 8px; color: var(--text-muted); }
    .pf-mini-ret    { font-size: 9px; font-family: 'JetBrains Mono', monospace; text-align: right; font-weight: 600; }
    .pf-mini-1d     { font-size: 8px; font-family: 'JetBrains Mono', monospace; text-align: right; }

    /* ── RIGHT: CALENDAR ── */
    .db-calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      font-size: 9px;
    }

    .cal-dow { text-align: center; font-size: 8px; color: var(--text-muted); padding: 2px 0; font-weight: 600; }

    .cal-day {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
      cursor: pointer;
      transition: background 0.12s;
      position: relative;
      gap: 1px;
    }

    .cal-day:hover { background: var(--bg-hover); }
    .cal-day.today { background: rgba(59,130,246,0.2); color: var(--accent-blue); font-weight: 700; }
    .cal-day.has-event::after { content: ''; width: 3px; height: 3px; border-radius: 50%; background: var(--accent-blue); }
    .cal-day.has-high::after  { background: #FF7B72; }

    .cal-event-dot { width: 3px; height: 3px; border-radius: 50%; }

    /* ── RIGHT: UPCOMING EVENTS ── */
    .event-list { overflow-y: auto; height: 100%; }

    .event-item {
      display: flex;
      align-items: flex-start;
      gap: 7px;
      padding: 5px 10px;
      border-bottom: 1px solid rgba(33,38,45,0.6);
      cursor: pointer;
      transition: background 0.12s;
    }

    .event-item:hover { background: var(--bg-hover); }

    .event-date-badge {
      font-size: 8px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent-blue);
      background: rgba(59,130,246,0.1);
      padding: 2px 5px;
      border-radius: 3px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .event-title { font-size: 10px; color: var(--text-primary); line-height: 1.3; font-weight: 500; }
    .event-sub   { font-size: 8px; color: var(--text-muted); }

    .event-impact {
      margin-left: auto;
      flex-shrink: 0;
      font-size: 8px;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
    }

    .impact-hi  { background: rgba(255,123,114,0.15); color: #FF7B72; }
    .impact-mid { background: rgba(210,153,34,0.15);  color: #D29922; }
    .impact-lo  { background: rgba(72,79,88,0.15);    color: #8B949E; }

    /* ===== ISSUE PAGE: TOP HEADER ===== */
    /* page-issue 터미널 모드 */
    #page-issue {
      padding: 0;
      overflow: hidden;
    }

    .issue-top-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      flex-shrink: 0;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      flex-wrap: nowrap;
    }

    .issue-search-bar {
      flex: 1;
      min-width: 200px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 5px;
      padding: 0 10px;
      height: 28px;
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
      grid-template-columns: 200px 1fr;
      gap: 8px;
      flex: 1;
      min-height: 0;
      overflow: hidden;
      padding: 8px;
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

    /* ===== RESPONSIVE ADJUSTMENTS (DISABLED — terminal-mode FHD+ fixed layout) ===== */
    /* @media (max-width: 1280px) {
      .portfolio-grid { grid-template-columns: 1fr; }
    } */

    /* @media (max-width: 900px) {
      .donut-kpi-row { grid-template-columns: 1fr; }
      .corr-inner-layout { grid-template-columns: 1fr; }
    } */

    /* ══════════════════════════════════════════════
       TREEMAP (SCREENER PAGE) — Wheel-Zoom Heatmap
    ══════════════════════════════════════════════ */
    #page-screener {
      padding: 0;
      overflow: hidden;
    }
    .tm-root {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      background: #000;
    }
    /* ── 상단 브레드크럼 헤더 ── */
    .tm-header {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 30px;
      flex-shrink: 0;
      background: #0B0E14;
      border-bottom: 1px solid #1E2738;
      padding: 0 10px;
    }
    .tm-breadcrumb {
      display: flex;
      align-items: center;
      gap: 0;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }
    .tm-bc-item {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      color: #58A6FF;
      cursor: pointer;
      white-space: nowrap;
      padding: 0 4px;
      border-radius: 3px;
      transition: background 0.15s;
    }
    .tm-bc-item:hover { background: rgba(88,166,255,0.12); }
    .tm-bc-item.active { color: #E6EDF3; cursor: default; }
    .tm-bc-sep {
      font-size: 10px;
      color: #3D4452;
      margin: 0 1px;
    }
    .tm-header-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .tm-hdr-btn {
      background: none;
      border: 1px solid #1E2738;
      border-radius: 3px;
      color: #8B949E;
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      padding: 2px 7px;
      cursor: pointer;
      height: 20px;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: border-color 0.15s, color 0.15s;
    }
    .tm-hdr-btn:hover { border-color: #58A6FF; color: #58A6FF; }
    .tm-depth-badge {
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      color: #3D4452;
      background: #0D1117;
      border: 1px solid #1E2738;
      border-radius: 3px;
      padding: 1px 6px;
      white-space: nowrap;
    }
    .tm-depth-badge span { color: #58A6FF; }

    /* ── 메인 바디 ── */
    .tm-body {
      display: flex;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    /* ── 좌측 컨트롤 사이드바 ── */
    .tm-sidebar {
      width: 180px;
      min-width: 180px;
      flex-shrink: 0;
      background: #0B0E14;
      border-right: 1px solid #1E2738;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: width 0.2s ease, min-width 0.2s ease;
    }
    .tm-sidebar.collapsed {
      width: 0;
      min-width: 0;
      overflow: hidden;
    }
    .tm-sb-inner {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
      scrollbar-width: thin;
      scrollbar-color: #1E2738 transparent;
    }
    .tm-sb-section {
      padding: 0 10px 8px;
      border-bottom: 1px solid #1E2738;
      margin-bottom: 8px;
    }
    .tm-sb-section:last-child { border-bottom: none; margin-bottom: 0; }
    .tm-sb-label {
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      color: #3D4452;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }
    /* Radio size metric */
    .tm-radio-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 3px 0;
      cursor: pointer;
    }
    .tm-radio-row input[type=radio] {
      accent-color: #58A6FF;
      width: 11px;
      height: 11px;
    }
    .tm-radio-row span {
      font-size: 10px;
      color: #8B949E;
      font-family: 'JetBrains Mono', monospace;
    }
    /* Checkbox asset filter */
    .tm-check-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 3px 0;
      cursor: pointer;
    }
    .tm-check-row input[type=checkbox] {
      accent-color: #58A6FF;
      width: 11px;
      height: 11px;
    }
    .tm-check-row span {
      font-size: 10px;
      color: #8B949E;
      font-family: 'JetBrains Mono', monospace;
    }
    .tm-check-row .tm-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    /* Search input */
    .tm-search-wrap {
      position: relative;
      margin-bottom: 2px;
    }
    .tm-search-icon {
      position: absolute;
      left: 7px;
      top: 50%;
      transform: translateY(-50%);
      color: #3D4452;
      font-size: 9px;
    }
    .tm-search-input {
      width: 100%;
      box-sizing: border-box;
      background: #0D1117;
      border: 1px solid #1E2738;
      border-radius: 3px;
      color: #E6EDF3;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      padding: 3px 6px 3px 22px;
      height: 24px;
      outline: none;
      transition: border-color 0.15s;
    }
    .tm-search-input:focus { border-color: #58A6FF; }
    .tm-search-input::placeholder { color: #3D4452; }
    /* Color legend */
    .tm-legend-bar {
      height: 10px;
      border-radius: 3px;
      background: linear-gradient(to right, #FF1A1A 0%, #CC0000 25%, #141414 50%, #006400 75%, #00CC44 100%);
      margin: 4px 0 2px;
    }
    .tm-legend-labels {
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      font-family: 'JetBrains Mono', monospace;
      color: #3D4452;
    }
    /* Sidebar toggle tab */
    .tm-sb-toggle {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 14px;
      height: 40px;
      background: #1E2738;
      border: none;
      border-radius: 0 4px 4px 0;
      color: #8B949E;
      font-size: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: background 0.15s;
    }
    .tm-sb-toggle:hover { background: #58A6FF; color: #000; }

    /* ── 캔버스 영역 ── */
    .tm-canvas-wrap {
      position: relative;
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .tm-chart-container {
      flex: 1;
      min-height: 0;
      position: relative;
      background: #000;
    }
    #tm-echarts {
      width: 100%;
      height: 100%;
    }

    /* ── 휠 힌트 오버레이 ── */
    .tm-wheel-hint {
      position: absolute;
      bottom: 10px;
      right: 12px;
      background: rgba(0,0,0,0.7);
      border: 1px solid #1E2738;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      color: #3D4452;
      pointer-events: none;
      z-index: 50;
    }
    .tm-wheel-hint .tm-hint-key {
      color: #58A6FF;
    }

    /* ── 드릴다운 락 오버레이 (애니메이션 중 입력 차단) ── */
    .tm-lock-overlay {
      position: absolute;
      inset: 0;
      z-index: 100;
      display: none;
      pointer-events: all;
    }
    .tm-lock-overlay.active { display: block; }

    /* ── bounce 애니메이션 (리프 노드 피드백) ── */
    @keyframes tmBounce {
      0%   { transform: scale(1); }
      30%  { transform: scale(1.04); }
      60%  { transform: scale(0.97); }
      100% { transform: scale(1); }
    }
    .tm-bounce { animation: tmBounce 0.35s ease; }

    /* ===== ANIMATED ENTRY ===== */
    .fade-in {
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes toastFadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(8px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    /* ===== MARKET PULSE STRIP ===== */
    .market-pulse-strip {
      display: flex;
      align-items: center;
      gap: 0;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      padding: 0 12px;
      height: 28px;
      flex-shrink: 0;
      overflow-x: hidden;
    }
    .market-pulse-strip .pulse-item {
      padding: 0 10px;
      border-right: 1px solid var(--border-color);
      height: 100%;
      display: flex;
      align-items: center;
      gap: 5px;
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

        <!-- Dashboard Home -->
        <div class="nav-section">
          <div class="nav-item active" data-page="dashboard" data-label="대시보드">
            <span class="nav-item-icon"><i class="fas fa-th-large"></i></span>
            <span class="nav-item-label" style="font-weight:600;">대시보드</span>
            <span class="nav-status-badge badge-focus">HOME</span>
          </div>
        </div>

        <div class="section-divider"></div>

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

          <div class="nav-item" data-page="portfolio" data-label="포트폴리오·리스크">
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

          <div class="nav-item" data-page="chart" data-label="매크로 차트">
            <span class="nav-item-index">07</span>
            <span class="nav-item-icon"><i class="fas fa-chart-area"></i></span>
            <span class="nav-item-label">매크로 차트</span>
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

        <!-- ===== PAGE: MAIN DASHBOARD ===== -->
        <div class="page-view active fade-in" id="page-dashboard">
          <!-- Dashboard content injected by JS -->
        </div>

        <!-- ===== PAGE: PORTFOLIO & RISK ===== -->
        <div class="page-view fade-in" id="page-portfolio">

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

        <div class="page-view fade-in" id="page-research"></div>

        <div class="page-view fade-in" id="page-calendar"></div>

        <div class="page-view fade-in" id="page-regime"></div>

        <!-- ════════════════════════════════════════════
             PAGE: 글로벌 크로스에셋 휠-줌 히트맵 대시보드
        ════════════════════════════════════════════ -->
        <div class="page-view fade-in" id="page-screener">
          <div class="tm-root" id="tm-root">

            <!-- ── 상단 브레드크럼 헤더 ── -->
            <div class="tm-header">
              <div class="tm-breadcrumb" id="tm-breadcrumb">
                <span class="tm-bc-item active" data-depth="-1" onclick="tmNavTo(-1)">전체자산시장</span>
              </div>
              <div class="tm-header-right">
                <div class="tm-depth-badge">DEPTH <span id="tm-depth-num">1</span></div>
                <button class="tm-hdr-btn" onclick="tmNavTo(-1)" title="최상위로 돌아가기">
                  <i class="fas fa-home"></i> 루트
                </button>
                <button class="tm-hdr-btn" onclick="tmDrillUp()" title="한 단계 올라가기">
                  <i class="fas fa-level-up-alt"></i> UP
                </button>
                <button class="tm-hdr-btn" id="tm-sidebar-toggle" onclick="tmToggleSidebar()" title="사이드바 토글">
                  <i class="fas fa-sliders-h"></i>
                </button>
              </div>
            </div>

            <!-- ── 메인 바디 ── -->
            <div class="tm-body">

              <!-- 좌측 컨트롤 사이드바 -->
              <aside class="tm-sidebar" id="tm-sidebar">
                <div class="tm-sb-inner">

                  <!-- 1. 사각형 크기(면적) 기준 -->
                  <div class="tm-sb-section">
                    <div class="tm-sb-label">사각형 크기 기준</div>
                    <label class="tm-radio-row">
                      <input type="radio" name="tm-metric" value="volume" checked onchange="tmSetMetric('volume')">
                      <span>실시간 거래대금</span>
                    </label>
                    <label class="tm-radio-row">
                      <input type="radio" name="tm-metric" value="mcap" onchange="tmSetMetric('mcap')">
                      <span>시가총액</span>
                    </label>
                  </div>

                  <!-- 2. 자산군 필터 -->
                  <div class="tm-sb-section">
                    <div class="tm-sb-label">자산군 필터</div>
                    <label class="tm-check-row">
                      <input type="checkbox" class="tm-asset-cb" value="equity" checked onchange="tmFilterChanged()">
                      <span class="tm-dot" style="background:#3FB950"></span>
                      <span>주식</span>
                    </label>
                    <label class="tm-check-row">
                      <input type="checkbox" class="tm-asset-cb" value="bond" checked onchange="tmFilterChanged()">
                      <span class="tm-dot" style="background:#58A6FF"></span>
                      <span>채권</span>
                    </label>
                    <label class="tm-check-row">
                      <input type="checkbox" class="tm-asset-cb" value="commodity" checked onchange="tmFilterChanged()">
                      <span class="tm-dot" style="background:#F0C050"></span>
                      <span>원자재</span>
                    </label>
                    <label class="tm-check-row">
                      <input type="checkbox" class="tm-asset-cb" value="fx" checked onchange="tmFilterChanged()">
                      <span class="tm-dot" style="background:#CE93D8"></span>
                      <span>통화</span>
                    </label>
                    <label class="tm-check-row">
                      <input type="checkbox" class="tm-asset-cb" value="crypto" checked onchange="tmFilterChanged()">
                      <span class="tm-dot" style="background:#F78166"></span>
                      <span>대체투자(크립토)</span>
                    </label>
                  </div>

                  <!-- 3. 검색 (하이라이팅) -->
                  <div class="tm-sb-section">
                    <div class="tm-sb-label">티커 하이라이팅</div>
                    <div class="tm-search-wrap">
                      <i class="fas fa-search tm-search-icon"></i>
                      <input class="tm-search-input" id="tm-search" placeholder="티커, 섹터 검색..." oninput="tmOnSearch(this.value)">
                    </div>
                  </div>

                  <!-- 4. 등락률 색상 범례 -->
                  <div class="tm-sb-section">
                    <div class="tm-sb-label">등락률 색상 범례</div>
                    <div class="tm-legend-bar"></div>
                    <div class="tm-legend-labels">
                      <span>-3%</span><span>0%</span><span>+3%</span>
                    </div>
                  </div>

                </div>
              </aside>

              <!-- 캔버스 영역 -->
              <div class="tm-canvas-wrap" id="tm-canvas-wrap">
                <div class="tm-chart-container">
                  <div id="tm-echarts"></div>
                  <div class="tm-lock-overlay" id="tm-lock"></div>
                </div>
                <div class="tm-wheel-hint">
                  <span class="tm-hint-key">↓ 휠 다운</span> = Drill-In &nbsp;|&nbsp; <span class="tm-hint-key">↑ 휠 업</span> = Drill-Out
                </div>
              </div>

            </div>
            <!-- /tm-body -->
          </div>
          <!-- /tm-root -->
        </div>
        <!-- /page-screener -->

        <!-- ════════════════════════════════════════════
             PAGE: 매크로 차트 (Macro Chart)
        ════════════════════════════════════════════ -->
        <div class="page-view fade-in" id="page-chart">
          <div class="mc-root" id="mc-root">

            <!-- ── A. 상단 컨트롤 헤더 ── -->
            <div class="mc-top-bar" id="mc-top-bar">

              <!-- A-1. 좌측: 사이드바 토글 + 타임프레임 -->
              <div class="mc-top-left">
                <button class="mc-icon-btn" id="mc-sb-toggle" onclick="mcToggleSidebar()" title="지표 사이드바">
                  <i class="fas fa-bars"></i>
                </button>
                <div class="mc-tf-group">
                  <button class="mc-tf-btn" onclick="mcSetTf(this,'15m')">15m</button>
                  <button class="mc-tf-btn" onclick="mcSetTf(this,'1h')">1h</button>
                  <button class="mc-tf-btn active" onclick="mcSetTf(this,'1D')">1D</button>
                  <button class="mc-tf-btn" onclick="mcSetTf(this,'1W')">1W</button>
                  <button class="mc-tf-btn" onclick="mcSetTf(this,'1M')">1M</button>
                </div>
                <div class="mc-divider-v"></div>
                <div class="mc-style-group">
                  <button class="mc-style-btn active" onclick="mcSetStyle(this,'line')" title="라인 차트"><i class="fas fa-chart-line"></i></button>
                  <button class="mc-style-btn" onclick="mcSetStyle(this,'candle')" title="캔들 차트"><i class="fas fa-chart-bar"></i></button>
                  <button class="mc-style-btn" onclick="mcSetStyle(this,'area')" title="영역 차트"><i class="fas fa-wave-square"></i></button>
                </div>
              </div>

              <!-- A-2. 중앙: 프리셋 드롭다운 -->
              <div class="mc-top-center">
                <div class="mc-preset-wrap" id="mc-preset-wrap">
                  <button class="mc-preset-trigger active" id="mc-preset-trigger" onclick="mcTogglePresetDropdown(event)">
                    <i class="fas fa-bookmark" style="font-size:9px;"></i>
                    PRESET
                    <span class="mc-preset-active-name" id="mc-preset-active-name">연준 순유동성</span>
                    <i class="fas fa-chevron-down mc-preset-caret"></i>
                  </button>
                  <div class="mc-preset-dropdown" id="mc-preset-dropdown">
                    <div class="mc-preset-item active" data-preset="fed_liq" onclick="mcApplyPresetDrop(this,'fed_liq')">
                      <i class="fas fa-water"></i> 연준 순유동성
                    </div>
                    <div class="mc-preset-item" data-preset="risk_on" onclick="mcApplyPresetDrop(this,'risk_on')">
                      <i class="fas fa-rocket"></i> 고베타 위험자산
                    </div>
                    <div class="mc-preset-item" data-preset="rates" onclick="mcApplyPresetDrop(this,'rates')">
                      <i class="fas fa-percentage"></i> 금리 커브
                    </div>
                    <div class="mc-preset-item" data-preset="macro_trio" onclick="mcApplyPresetDrop(this,'macro_trio')">
                      <i class="fas fa-globe"></i> 매크로 3대 지표
                    </div>
                    <div class="mc-preset-divider"></div>
                    <div class="mc-preset-item" data-preset="custom1" onclick="mcApplyPresetDrop(this,'custom1')">
                      <i class="fas fa-star"></i> 나의 즐겨찾기
                    </div>
                  </div>
                </div>
              </div>

              <!-- A-3. 우측: 전역 도구 -->
              <div class="mc-top-right">
                <button class="mc-icon-btn" onclick="mcToggleCrosshair(this)" title="크로스헤어" id="mc-xhair-btn">
                  <i class="fas fa-crosshairs"></i>
                </button>
                <button class="mc-icon-btn" onclick="mcToggleSubPanel(this)" title="보조 패널 (RSI/Vol)" id="mc-sub-btn">
                  <i class="fas fa-layer-group"></i>
                </button>
                <button class="mc-icon-btn" onclick="mcResetZoom()" title="줌 초기화">
                  <i class="fas fa-compress-alt"></i>
                </button>
                <div class="mc-divider-v"></div>
                <div class="mc-live-dot"></div>
                <span class="mc-live-label">LIVE</span>
              </div>
            </div>
            <!-- /mc-top-bar -->

            <!-- ── B. 좌측 지표 사이드바 ── -->
            <div class="mc-body">
              <aside class="mc-sidebar" id="mc-sidebar">
                <div class="mc-sb-inner">

                  <!-- 검색 -->
                  <div class="mc-sb-search-wrap">
                    <i class="fas fa-search mc-sb-search-icon"></i>
                    <input class="mc-sb-search" id="mc-sb-search" placeholder="지표 검색…" oninput="mcSbFilter()">
                  </div>

                  <!-- 주가지수 -->
                  <div class="mc-sb-group" id="mcg-index">
                    <div class="mc-sb-group-hdr" onclick="mcToggleGroup('mcg-index')">
                      <i class="fas fa-chevron-down mc-sb-chevron"></i>
                      <span>주가지수</span>
                    </div>
                    <div class="mc-sb-items">
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="SPX" onchange="mcToggleIndicator('SPX')"><span class="mc-cb-dot" style="background:#58A6FF"></span><span class="mc-sb-name">S&amp;P 500</span><span class="mc-sb-val">5,421</span></label>
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="NDX" onchange="mcToggleIndicator('NDX')"><span class="mc-cb-dot" style="background:#F78166"></span><span class="mc-sb-name">NASDAQ 100</span><span class="mc-sb-val">19,284</span></label>
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="RUT" onchange="mcToggleIndicator('RUT')"><span class="mc-cb-dot" style="background:#D29922"></span><span class="mc-sb-name">Russell 2000</span><span class="mc-sb-val">2,014</span></label>
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="VIX" onchange="mcToggleIndicator('VIX')"><span class="mc-cb-dot" style="background:#F85149"></span><span class="mc-sb-name">VIX</span><span class="mc-sb-val">13.84</span></label>
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="KOSPI" onchange="mcToggleIndicator('KOSPI')"><span class="mc-cb-dot" style="background:#3FB950"></span><span class="mc-sb-name">KOSPI</span><span class="mc-sb-val">2,782</span></label>
                    </div>
                  </div>

                  <!-- 금리/유동성 -->
                  <div class="mc-sb-group" id="mcg-rates">
                    <div class="mc-sb-group-hdr" onclick="mcToggleGroup('mcg-rates')">
                      <i class="fas fa-chevron-down mc-sb-chevron"></i>
                      <span>금리 / 유동성</span>
                    </div>
                    <div class="mc-sb-items">
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="US10Y" onchange="mcToggleIndicator('US10Y')"><span class="mc-cb-dot" style="background:#FF7B72"></span><span class="mc-sb-name">US 10Y 국채</span><span class="mc-sb-val">4.218%</span></label>
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="US2Y" onchange="mcToggleIndicator('US2Y')"><span class="mc-cb-dot" style="background:#FFA657"></span><span class="mc-sb-name">US 2Y 국채</span><span class="mc-sb-val">4.832%</span></label>
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="SOFR" onchange="mcToggleIndicator('SOFR')"><span class="mc-cb-dot" style="background:#E3B341"></span><span class="mc-sb-name">SOFR</span><span class="mc-sb-val">5.30%</span></label>
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="RRP" onchange="mcToggleIndicator('RRP')"><span class="mc-cb-dot" style="background:#A5D6FF"></span><span class="mc-sb-name">연준 RRP 잔고</span><span class="mc-sb-val">$412B</span></label>
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="TGA" onchange="mcToggleIndicator('TGA')"><span class="mc-cb-dot" style="background:#7EE787"></span><span class="mc-sb-name">재무부 TGA</span><span class="mc-sb-val">$738B</span></label>
                    </div>
                  </div>

                  <!-- 원자재/FX -->
                  <div class="mc-sb-group" id="mcg-cmdty">
                    <div class="mc-sb-group-hdr" onclick="mcToggleGroup('mcg-cmdty')">
                      <i class="fas fa-chevron-down mc-sb-chevron"></i>
                      <span>원자재 / FX</span>
                    </div>
                    <div class="mc-sb-items">
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="GOLD" onchange="mcToggleIndicator('GOLD')"><span class="mc-cb-dot" style="background:#F0C050"></span><span class="mc-sb-name">Gold (XAU/USD)</span><span class="mc-sb-val">2,384</span></label>
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="WTI" onchange="mcToggleIndicator('WTI')"><span class="mc-cb-dot" style="background:#79C0FF"></span><span class="mc-sb-name">WTI 원유</span><span class="mc-sb-val">82.16</span></label>
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="DXY" onchange="mcToggleIndicator('DXY')"><span class="mc-cb-dot" style="background:#CE93D8"></span><span class="mc-sb-name">달러 인덱스 DXY</span><span class="mc-sb-val">104.4</span></label>
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="USDKRW" onchange="mcToggleIndicator('USDKRW')"><span class="mc-cb-dot" style="background:#80DEEA"></span><span class="mc-sb-name">USD/KRW</span><span class="mc-sb-val">1,381</span></label>
                    </div>
                  </div>

                  <!-- 암호화폐 -->
                  <div class="mc-sb-group" id="mcg-crypto">
                    <div class="mc-sb-group-hdr" onclick="mcToggleGroup('mcg-crypto')">
                      <i class="fas fa-chevron-down mc-sb-chevron"></i>
                      <span>암호화폐</span>
                    </div>
                    <div class="mc-sb-items">
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="BTC" onchange="mcToggleIndicator('BTC')"><span class="mc-cb-dot" style="background:#F78166"></span><span class="mc-sb-name">Bitcoin (BTC)</span><span class="mc-sb-val">68,412</span></label>
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="ETH" onchange="mcToggleIndicator('ETH')"><span class="mc-cb-dot" style="background:#A5D6FF"></span><span class="mc-sb-name">Ethereum (ETH)</span><span class="mc-sb-val">3,641</span></label>
                      <label class="mc-sb-item"><input type="checkbox" class="mc-cb" data-id="RGTI" onchange="mcToggleIndicator('RGTI')"><span class="mc-cb-dot" style="background:#FFA657"></span><span class="mc-sb-name">RGTI (양자)</span><span class="mc-sb-val">12.84</span></label>
                    </div>
                  </div>

                </div>
              </aside>
              <!-- /mc-sidebar -->

              <!-- ── C. 메인 캔버스 영역 ── -->
              <div class="mc-canvas-wrap" id="mc-canvas-wrap">

                <!-- C-1. 플로팅 범례 -->
                <div class="mc-legend" id="mc-legend"></div>

                <!-- C-2. 메인 차트 -->
                <div class="mc-chart-main" id="mc-chart-main"></div>

                <!-- C-3. 서브 패널 (RSI + Volume) -->
                <div class="mc-sub-panels" id="mc-sub-panels">
                  <div class="mc-sub-panel" id="mc-rsi-panel">
                    <div class="mc-sub-panel-label">RSI (14)</div>
                    <div class="mc-sub-chart" id="mc-rsi-chart"></div>
                  </div>
                  <div class="mc-sub-panel" id="mc-vol-panel">
                    <div class="mc-sub-panel-label">VOLUME</div>
                    <div class="mc-sub-chart" id="mc-vol-chart"></div>
                  </div>
                </div>

              </div>
              <!-- /mc-canvas-wrap -->
            </div>
            <!-- /mc-body -->

          </div>
          <!-- /mc-root -->
        </div>
        <!-- /page-chart -->

        <div class="page-view fade-in" id="page-docs"></div>

        <div class="page-view fade-in" id="page-sources"></div>

        <div class="page-view fade-in" id="page-calibration"></div>

        <div class="page-view fade-in" id="page-logs"></div>

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
      activePage: 'dashboard',
      sidebarCollapsed: false,
      portfolioView: 'asset',   // 'asset' | 'ticker'
      corrPreset: '1Y',
      rollingWindow: 30,

      // Page metadata
      pagesMeta: {
        'dashboard':    { label: '통합 관제 대시보드',    section: '홈' },
        'issue':        { label: '이슈 수집·요약·태깅',  section: '모듈' },
        'research':     { label: '리서치 클러스터',       section: '모듈' },
        'calendar':     { label: '매크로 캘린더',         section: '모듈' },
        'regime':       { label: '국면 모니터',            section: '모듈' },
        'portfolio':    { label: '포트폴리오·리스크',      section: '모듈' },
        'screener':     { label: '자산 스크리너',          section: '모듈' },
        'chart':        { label: '매크로 차트',            section: '모듈' },
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

      // ── 페이지별 후처리 초기화 ──
      if (page === 'chart') {
        // DOM 레이아웃이 완전히 적용된 후 차트 초기화
        requestAnimationFrame(() => setTimeout(() => {
          if (typeof initMC === 'function') {
            if (!MC_STATE.chart) { initMC(); }
            else { mcHandleResize(); }
          }
        }, 50));
      }
      if (page === 'screener') {
        requestAnimationFrame(() => setTimeout(() => {
          if (typeof initTM === 'function' && !TM_STATE.chart) { initTM(); }
          else if (typeof tmHandleResize === 'function') { tmHandleResize(); }
        }, 50));
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
    //  MAIN DASHBOARD — BUILD & CHARTS
    // ============================================================
    let dbCharts = {};

    function buildDashboard() {
      const el = document.getElementById('page-dashboard');
      if (!el || el.dataset.built) return;
      el.dataset.built = '1';

      el.innerHTML = \`
        <!-- Ticker Strip -->
        <div class="db-ticker-strip">
          <div class="db-ticker-item"><span class="db-ticker-sym">SPX</span><span class="db-ticker-val positive">5,421.8</span><span class="db-ticker-chg positive">▲+0.43%</span></div>
          <div class="db-ticker-item"><span class="db-ticker-sym">NDX</span><span class="db-ticker-val positive">19,284</span><span class="db-ticker-chg positive">▲+0.71%</span></div>
          <div class="db-ticker-item"><span class="db-ticker-sym">DJI</span><span class="db-ticker-val positive">38,742</span><span class="db-ticker-chg positive">▲+0.22%</span></div>
          <div class="db-ticker-item"><span class="db-ticker-sym">RUT</span><span class="db-ticker-val negative">2,014</span><span class="db-ticker-chg negative">▼-0.31%</span></div>
          <div class="db-ticker-item"><span class="db-ticker-sym">VIX</span><span class="db-ticker-val neutral">13.84</span><span class="db-ticker-chg negative">▼-0.92%</span></div>
          <div class="db-ticker-item"><span class="db-ticker-sym">US10Y</span><span class="db-ticker-val negative">4.218%</span><span class="db-ticker-chg negative">▼-3.2bp</span></div>
          <div class="db-ticker-item"><span class="db-ticker-sym">DXY</span><span class="db-ticker-val negative">104.42</span><span class="db-ticker-chg negative">▼-0.18%</span></div>
          <div class="db-ticker-item"><span class="db-ticker-sym">GOLD</span><span class="db-ticker-val positive">2,384</span><span class="db-ticker-chg positive">▲+0.29%</span></div>
          <div class="db-ticker-item"><span class="db-ticker-sym">WTI</span><span class="db-ticker-val positive">82.16</span><span class="db-ticker-chg positive">▲+0.57%</span></div>
          <div class="db-ticker-item"><span class="db-ticker-sym">BTC</span><span class="db-ticker-val positive">68,412</span><span class="db-ticker-chg positive">▲+1.24%</span></div>
          <div class="db-ticker-item"><span class="db-ticker-sym">ETH</span><span class="db-ticker-val positive">3,641</span><span class="db-ticker-chg positive">▲+0.88%</span></div>
          <div class="db-ticker-item"><span class="db-ticker-sym">USD/KRW</span><span class="db-ticker-val neutral">1,381</span><span class="db-ticker-chg positive">▲+0.12%</span></div>
        </div>

        <!-- Main Body — 2패널: IIT(좌) + Radar(우) -->
        <div class="db-body">

          <!-- ═══ 좌측 60%: 이슈-인사이트 스레드 ═══ -->
          <div class="db-iit-panel">
            <div class="iit-root" id="iit-root">

              <!-- ══ A. 좌측 패싯 내비게이션 사이드바 ══ -->
              <aside class="iit-sidebar" id="iit-sidebar">
                <div class="iit-sb-inner">

                  <!-- 검색 -->
                  <div class="iit-sb-search">
                    <i class="fas fa-search iit-sb-search-icon"></i>
                    <input class="iit-sb-input" id="iit-search" placeholder="키워드, 티커, 원자료…" oninput="iitFilter()">
                  </div>

                  <!-- 필터 초기화 -->
                  <button class="iit-reset-btn" onclick="iitResetAll()">
                    <i class="fas fa-undo"></i> 필터 초기화
                  </button>

                  <!-- 포트폴리오 연동 토글 -->
                  <div class="iit-pf-toggle" onclick="iitTogglePf(this)">
                    <span class="iit-pf-label"><i class="fas fa-briefcase"></i> 포트폴리오 연동 뷰</span>
                    <div class="iit-toggle-switch" id="iit-pf-switch"><div class="iit-toggle-knob"></div></div>
                  </div>

                  <!-- 패싯: 매크로 -->
                  <div class="iit-facet-group">
                    <div class="iit-facet-title"><i class="fas fa-globe"></i> 매크로</div>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="TGA" onchange="iitFilter()"><span class="iit-facet-name">TGA</span><span class="iit-facet-cnt">14</span></label>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="SOFR" onchange="iitFilter()"><span class="iit-facet-name">SOFR-IORB</span><span class="iit-facet-cnt">8</span></label>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="FOMC" onchange="iitFilter()"><span class="iit-facet-name">FOMC</span><span class="iit-facet-cnt">22</span></label>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="RRP" onchange="iitFilter()"><span class="iit-facet-name">RRP</span><span class="iit-facet-cnt">11</span></label>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="인플레이션" onchange="iitFilter()"><span class="iit-facet-name">인플레이션</span><span class="iit-facet-cnt">31</span></label>
                  </div>

                  <!-- 패싯: 섹터/테마 -->
                  <div class="iit-facet-group">
                    <div class="iit-facet-title"><i class="fas fa-microchip"></i> 섹터/테마</div>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="AI인프라" onchange="iitFilter()"><span class="iit-facet-name">AI 인프라</span><span class="iit-facet-cnt">45</span></label>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="양자컴퓨팅" onchange="iitFilter()"><span class="iit-facet-name">양자컴퓨팅</span><span class="iit-facet-cnt">12</span></label>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="Crypto" onchange="iitFilter()"><span class="iit-facet-name">Crypto</span><span class="iit-facet-cnt">30</span></label>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="에너지" onchange="iitFilter()"><span class="iit-facet-name">에너지</span><span class="iit-facet-cnt">19</span></label>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="방어주" onchange="iitFilter()"><span class="iit-facet-name">방어주</span><span class="iit-facet-cnt">9</span></label>
                  </div>

                  <!-- 패싯: 자산/티커 -->
                  <div class="iit-facet-group">
                    <div class="iit-facet-title"><i class="fas fa-chart-line"></i> 자산/티커</div>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="RGTI" onchange="iitFilter()"><span class="iit-facet-name">RGTI</span><span class="iit-facet-cnt">7</span></label>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="IonQ" onchange="iitFilter()"><span class="iit-facet-name">IonQ</span><span class="iit-facet-cnt">5</span></label>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="BTC" onchange="iitFilter()"><span class="iit-facet-name">BTC</span><span class="iit-facet-cnt">18</span></label>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="SPX" onchange="iitFilter()"><span class="iit-facet-name">S&P 500</span><span class="iit-facet-cnt">24</span></label>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="TLT" onchange="iitFilter()"><span class="iit-facet-name">TLT</span><span class="iit-facet-cnt">13</span></label>
                  </div>

                  <!-- 패싯: 소스 -->
                  <div class="iit-facet-group">
                    <div class="iit-facet-title"><i class="fas fa-rss"></i> 소스</div>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="X" onchange="iitFilter()"><span class="iit-facet-name">X (Twitter)</span><span class="iit-facet-cnt">38</span></label>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="Substack" onchange="iitFilter()"><span class="iit-facet-name">Substack</span><span class="iit-facet-cnt">26</span></label>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="Bloomberg" onchange="iitFilter()"><span class="iit-facet-name">Bloomberg</span><span class="iit-facet-cnt">41</span></label>
                    <label class="iit-facet-item"><input type="checkbox" class="iit-cb" data-tag="SeekingAlpha" onchange="iitFilter()"><span class="iit-facet-name">Seeking Alpha</span><span class="iit-facet-cnt">17</span></label>
                  </div>

                </div>
              </aside>
              <!-- /iit-sidebar -->

              <!-- ══ B. 중앙 메인 패널 (헤더 + 타임라인) ══ -->
              <div class="iit-main" id="iit-main">

                <!-- B-1. 고정 상단 컨트롤 헤더 -->
                <div class="iit-ctrl-hdr">
                  <div class="iit-ctrl-left">
                    <button class="iit-sidebar-toggle" id="iit-sb-toggle" onclick="iitToggleSidebar()" title="사이드바 토글">
                      <i class="fas fa-bars"></i>
                    </button>
                    <span class="iit-ctrl-title">이슈-인사이트 스레드</span>
                    <span class="iit-ctrl-sub" id="iit-result-cnt">전체 7개 이슈</span>
                  </div>
                  <div class="iit-ctrl-center">
                    <button class="iit-preset-btn active" onclick="iitPreset(this,'all')">전체</button>
                    <button class="iit-preset-btn" onclick="iitPreset(this,'macro')">매크로</button>
                    <button class="iit-preset-btn" onclick="iitPreset(this,'sector')">섹터/테마</button>
                    <button class="iit-preset-btn" onclick="iitPreset(this,'pf')">내 포트폴리오</button>
                  </div>
                  <div class="iit-ctrl-right">
                    <span class="iit-sort-label">정렬:</span>
                    <button class="iit-sort-btn active" onclick="iitSort(this,'time')">최신순</button>
                    <button class="iit-sort-btn" onclick="iitSort(this,'rel')">관련도순</button>
                  </div>
                </div>

                <!-- B-2. 마스터 타임라인 -->
                <div class="iit-timeline" id="iit-timeline">
                  <!-- JS로 렌더링 -->
                </div>

              </div>
              <!-- /iit-main -->

            </div>
            <!-- /iit-root -->
          </div>
          <!-- /db-iit-panel -->

          <!-- ═══ 우측 40%: 매크로 국면 나침반 ═══ -->
          <div class="db-radar-panel">
            <div class="mpr-root" id="mpr-root">

              <!-- 헤더 -->
              <div class="mpr-header">
                <div class="mpr-title">
                  <span class="mpr-title-dot"></span>
                  MACRO PHASE RADAR
                </div>
                <span class="mpr-meta" id="mpr-date">2026-06-17 · N=10</span>
              </div>

              <!-- 차트 바디 -->
              <div class="mpr-body">
                <div class="mpr-chart-wrap">
                  <div id="mpr-chart"></div>
                </div>
              </div>

              <!-- 하단 범례 스트립 -->
              <div class="mpr-legend-strip" id="mpr-legend-strip"></div>

            </div>
            <!-- /mpr-root -->

            <!-- 툴팁 (fixed 포지셔닝) -->
            <div class="mpr-tooltip" id="mpr-tooltip"></div>
          </div>
          <!-- /db-radar-panel -->

        </div>
        <!-- /db-body -->
      \`;

      // IIT + MPR 위젯 초기화
      requestAnimationFrame(() => {
        initIIT();
        initMPR();
      });
    }

    // ══════════════════════════════════════════════════════════════
    //  MPR — 10축 매크로 국면 나침반 (Macro Phase Radar)
    // ══════════════════════════════════════════════════════════════

    // 10개 축 정의 (순서 = θ_i = 2π·i/10 방향)
    const MPR_AXES = [
      { id: 'growth',      label: '성장기',                       color: '#3FB950' },
      { id: 'overheat',    label: '과열기',                       color: '#F78166' },
      { id: 'sideways',    label: '횡보',                         color: '#8B949E' },
      { id: 'stagflation', label: '스태그플레이션',              color: '#D29922' },
      { id: 'deflation',   label: '디플레이션',                   color: '#79C0FF' },
      { id: 'liq_crush',   label: '유동성 크러시',               color: '#F85149' },
      { id: 'reflation',   label: '플레이션',                     color: '#FFA657' },
      { id: 'fin_repr',    label: '금융억압',          color: '#CE93D8' },
      { id: 'goldilocks',  label: '골디락스',                     color: '#58A6FF' },
      { id: 'geofrag',     label: 'Geo Fragmentation',   color: '#E3B341' },
    ];

    // 샘플 가중치 데이터 (정규화 합=1)
    // 실제 구현 시 수식 엔진 결과로 교체
    const MPR_WEIGHTS_HISTORY = [
      // trail: 과거 → 현재 순서
      [0.05, 0.08, 0.12, 0.10, 0.06, 0.14, 0.09, 0.11, 0.15, 0.10],
      [0.06, 0.09, 0.11, 0.11, 0.05, 0.13, 0.10, 0.10, 0.16, 0.09],
      [0.07, 0.10, 0.10, 0.12, 0.05, 0.12, 0.11, 0.09, 0.17, 0.07],
      [0.08, 0.11, 0.09, 0.13, 0.04, 0.11, 0.12, 0.08, 0.18, 0.06],
      // 현재값
      [0.09, 0.12, 0.08, 0.14, 0.04, 0.10, 0.13, 0.07, 0.19, 0.04],
    ];

    // Barycentric 좌표 계산
    // θ_i = 2π·i/N, X = Σ(W_i·cos(θ_i)), Y = Σ(W_i·sin(θ_i))
    function mprBarycentricXY(weights, N) {
      let x = 0, y = 0;
      for (let i = 0; i < N; i++) {
        const theta = (2 * Math.PI * i) / N;
        x += weights[i] * Math.cos(theta);
        y += weights[i] * Math.sin(theta);
      }
      return [x, y];
    }

    // ECharts 좌표계: radar 반지름 = 1 (max), 중심 = [0, 0]
    // ECharts radar는 내부적으로 [0,100] 척도 — scatter는 별도 좌표계 필요
    // → custom 방식 대신: radar(배경) + grid+scatter(포인트) 오버레이 방식
    // → radar의 center/radius 를 알고, scatter에서 픽셀 좌표 직접 계산
    let mprChart = null;
    let mprResizeObs = null;

    function initMPR() {
      const wrap = document.getElementById('mpr-chart');
      if (!wrap) return;
      if (typeof echarts === 'undefined') {
        // ECharts 미로드 시 재시도
        setTimeout(initMPR, 300);
        return;
      }
      if (mprChart) { mprChart.dispose(); mprChart = null; }

      mprChart = echarts.init(wrap, null, { renderer: 'canvas' });
      mprRenderChart();
      mprRenderLegend();

      // 렌더 완료 후 Barycentric Dot 배치
      mprChart.on('finished', function() {
        mprPlaceDot();
      });

      // ResizeObserver
      if (mprResizeObs) mprResizeObs.disconnect();
      mprResizeObs = new ResizeObserver(() => {
        if (mprChart) {
          mprChart.resize();
          setTimeout(mprPlaceDot, 50);
        }
      });
      mprResizeObs.observe(wrap);
    }

    function mprRenderChart() {
      if (!mprChart) return;
      const N = 10;

      // ── Barycentric 좌표를 radar 좌표계 값으로 변환 ──
      // ECharts radar 좌표계에서 각 indicator 방향의 단위벡터는:
      //   θ_i = startAngle - (2π·i/N) (ECharts는 시계방향, startAngle=90°)
      // Barycentric 점 (bx, by)를 각 indicator의 투영값으로 역산:
      //   value_i = dot([bx,by], [cos(θ_i), sin(θ_i)]) * max
      // 단, 값이 음수면 0으로 클램프

      function barycentricToRadarValues(weights) {
        // Barycentric 좌표 계산 (단위벡터 기준 θ_i = 2π·i/N, 시작 0=우측)
        // ECharts radar startAngle=90 → θ_i_echarts = 90° - 360°·i/N (도 단위)
        let bx = 0, by = 0;
        for (let i = 0; i < N; i++) {
          const theta = (2 * Math.PI * i) / N; // 0 = 우측부터 시계방향과 반시계방향
          bx += weights[i] * Math.cos(theta);
          by += weights[i] * Math.sin(theta);
        }
        // 각 indicator 방향으로 투영 → radar 값 (0~max)
        // ECharts startAngle=90 → 첫 번째 축이 위쪽(90°)
        const vals = [];
        for (let i = 0; i < N; i++) {
          const thetaDeg = 90 - (360 * i) / N;
          const thetaRad = thetaDeg * Math.PI / 180;
          const proj = bx * Math.cos(thetaRad) + by * Math.sin(thetaRad);
          vals.push(Math.max(0, proj));
        }
        return vals;
      }

      const currentW = MPR_WEIGHTS_HISTORY[MPR_WEIGHTS_HISTORY.length - 1];

      // Trail 시리즈: 각 히스토리 포인트를 radar 값으로 변환
      const trailSeries = MPR_WEIGHTS_HISTORY.slice(0, -1).map((w, idx) => {
        const vals = barycentricToRadarValues(w);
        const alpha = 0.08 + (idx / MPR_WEIGHTS_HISTORY.length) * 0.25;
        return {
          type: 'radar',
          data: [{
            value: vals,
            areaStyle: { color: \`rgba(88,166,255,\${(alpha * 0.4).toFixed(2)})\` },
            lineStyle: { color: \`rgba(88,166,255,\${alpha.toFixed(2)})\`, width: 1 },
            symbol: 'circle',
            symbolSize: 3,
            itemStyle: { color: \`rgba(88,166,255,\${(alpha * 1.5).toFixed(2)})\` },
          }],
          silent: true,
          z: 3 + idx,
        };
      });

      // 현재 상태 시리즈
      const currentVals = barycentricToRadarValues(currentW);

      const option = {
        backgroundColor: '#0B0E14',
        animation: true,
        animationDuration: 900,
        animationEasing: 'cubicOut',

        tooltip: {
          show: false, // 커스텀 툴팁 사용
        },

        radar: {
          center: ['50%', '50%'],
          radius: '58%',
          startAngle: 90,
          splitNumber: 4,
          shape: 'polygon',
          indicator: MPR_AXES.map(a => ({
            name: a.label,
            max: 0.35,
          })),
          splitArea: {
            areaStyle: {
              color: [
                'rgba(42,46,57,0.3)', 'rgba(42,46,57,0.5)',
                'rgba(42,46,57,0.3)', 'rgba(42,46,57,0.5)',
              ],
            },
          },
          splitLine: {
            lineStyle: { color: '#2A2E39', width: 1 },
          },
          axisLine: {
            lineStyle: { color: '#2A2E39', width: 1 },
          },
          axisName: {
            color: '#8B949E',
            fontSize: 9,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 13,
            padding: [2, 4],
            rich: {
              a: { color: '#8B949E', fontSize: 9 },
            },
          },
        },

        series: [
          // ── Trail (과거 궤적) ──
          ...trailSeries,

          // ── 현재 국면 영역 ──
          {
            type: 'radar',
            data: [{
              value: currentVals,
              name: '현재 국면',
              areaStyle: {
                color: {
                  type: 'radial',
                  x: 0.5, y: 0.5, r: 0.5,
                  colorStops: [
                    { offset: 0,   color: 'rgba(88,166,255,0.35)' },
                    { offset: 1,   color: 'rgba(88,166,255,0.05)' },
                  ],
                },
              },
              lineStyle: {
                color: '#58A6FF',
                width: 1.5,
                shadowBlur: 8,
                shadowColor: 'rgba(88,166,255,0.5)',
              },
              symbol: 'circle',
              symbolSize: 4,
              itemStyle: {
                color: '#58A6FF',
                shadowBlur: 6,
                shadowColor: 'rgba(88,166,255,0.6)',
              },
            }],
            emphasis: {
              lineStyle: { width: 2 },
              areaStyle: { color: 'rgba(88,166,255,0.4)' },
            },
            z: 8,
          },

          // ── 무게중심 포인터 (Barycentric Dot) ──
          // radar 좌표계에서 중심 방향 투영이 가장 큰 indicator 쪽으로 단일 점 표시
          // → 별도 scatter를 쓰되, graphic으로 오버레이
        ],

        // 무게중심 점을 graphic 엘리먼트로 직접 렌더링
        graphic: mprBuildDot(currentW),
      };

      mprChart.setOption(option, true);

      // 마우스 이벤트 갱신
      mprChart.off('mouseover');
      mprChart.off('mouseout');
      mprChart.off('mousemove');
      mprChart.on('mouseover', function(p) {
        if (p.seriesIndex !== undefined) {
          mprShowTooltip(p.event.event, currentW);
        }
      });
      mprChart.on('mouseout', function() { mprHideTooltip(); });
      mprChart.on('mousemove', function(p) {
        if (p.event) mprMoveTooltip(p.event.event);
      });
    }

    // 무게중심 좌표를 ECharts graphic 좌표(픽셀)로 변환
    function mprBuildDot(weights) {
      // graphic은 차트 렌더 직후 픽셀 위치를 계산해야 함
      // 여기서는 afterRender 타이밍에 좌표를 주입
      // 렌더 전엔 placeholder로 설정, afterRender에서 갱신
      return [];
    }

    // 렌더 완료 후 Barycentric Dot를 graphic으로 추가
    function mprPlaceDot() {
      if (!mprChart) return;
      const N = 10;
      const currentW = MPR_WEIGHTS_HISTORY[MPR_WEIGHTS_HISTORY.length - 1];

      // radar center/radius를 px로 계산
      const width  = mprChart.getWidth();
      const height = mprChart.getHeight();
      const cx_px  = width  * 0.5;
      const cy_px  = height * 0.5;
      const r_px   = Math.min(width, height) * 0.58 / 2; // radius=58%, 반지름

      // Barycentric 좌표 (단위: 정규화 반경 기준)
      // 각 축의 ECharts 실제 각도: θ_i = 90° - (360°·i/N) = startAngle 기준
      let bx = 0, by = 0;
      for (let i = 0; i < N; i++) {
        const thetaDeg = 90 - (360 * i) / N;
        const thetaRad = thetaDeg * Math.PI / 180;
        bx += currentW[i] * Math.cos(thetaRad);
        by += currentW[i] * Math.sin(thetaRad);
      }

      // 픽셀 좌표 (max=0.35 스케일에 맞춰 r_px 조정)
      const scale = r_px / 0.35;
      const dot_x = cx_px + bx * scale;
      const dot_y = cy_px - by * scale; // ECharts y축은 아래가 +

      mprChart.setOption({
        graphic: [
          // Glow ring
          {
            type: 'circle',
            shape: { cx: dot_x, cy: dot_y, r: 10 },
            style: {
              fill: 'rgba(88,166,255,0)',
              stroke: 'rgba(88,166,255,0.25)',
              lineWidth: 8,
            },
            silent: true,
            z: 9,
          },
          // Outer glow
          {
            type: 'circle',
            shape: { cx: dot_x, cy: dot_y, r: 7 },
            style: {
              fill: 'rgba(88,166,255,0)',
              stroke: 'rgba(88,166,255,0.45)',
              lineWidth: 4,
            },
            silent: true,
            z: 10,
          },
          // 메인 포인터
          {
            type: 'circle',
            shape: { cx: dot_x, cy: dot_y, r: 5 },
            style: {
              fill: '#58A6FF',
              shadowBlur: 18,
              shadowColor: 'rgba(88,166,255,0.9)',
            },
            cursor: 'pointer',
            z: 11,
            onmouseover: function() {
              const fakeEvt = { clientX: dot_x + mprChart.getDom().getBoundingClientRect().left,
                                clientY: dot_y + mprChart.getDom().getBoundingClientRect().top };
              mprShowTooltip(fakeEvt, currentW);
            },
            onmouseout: function() { mprHideTooltip(); },
            onmousemove: function(e) { mprMoveTooltip(e.event || e); },
          },
        ],
      }, false);
    }

    function mprRenderLegend() {
      const strip = document.getElementById('mpr-legend-strip');
      if (!strip) return;
      const currentW = MPR_WEIGHTS_HISTORY[MPR_WEIGHTS_HISTORY.length - 1];
      // 상위 3개 가중치 축만 하단 범례에 표시
      const sorted = MPR_AXES.map((a, i) => ({ ...a, w: currentW[i] }))
                              .sort((a, b) => b.w - a.w)
                              .slice(0, 5);
      strip.innerHTML = sorted.map(a =>
        \`<div class="mpr-legend-item">
          <span class="mpr-legend-dot" style="background:\${a.color};"></span>
          \${a.label}
          <span style="color:#E6EDF3;margin-left:3px;">\${(a.w * 100).toFixed(1)}%</span>
        </div>\`
      ).join('');
    }

    function mprShowTooltip(evt, weights) {
      const tt = document.getElementById('mpr-tooltip');
      if (!tt) return;
      const sorted = MPR_AXES.map((a, i) => ({ ...a, w: weights[i] }))
                              .sort((a, b) => b.w - a.w);
      tt.innerHTML = \`
        <div class="mpr-tt-title">▸ 국면 가중치 분포</div>
        \${sorted.map(a => \`
          <div class="mpr-tt-item">
            <span class="mpr-tt-label" title="\${a.label}">\${a.label}</span>
            <div class="mpr-tt-bar-wrap">
              <div class="mpr-tt-bar" style="width:\${(a.w*100).toFixed(1)}%;background:\${a.color}40;border-right:2px solid \${a.color};"></div>
            </div>
            <span class="mpr-tt-pct" style="color:\${a.color};">\${(a.w*100).toFixed(1)}%</span>
          </div>
        \`).join('')}
      \`;
      tt.classList.add('visible');
      mprMoveTooltip(evt);
    }

    function mprMoveTooltip(evt) {
      const tt = document.getElementById('mpr-tooltip');
      if (!tt || !tt.classList.contains('visible')) return;
      const vw = window.innerWidth, vh = window.innerHeight;
      let x = evt.clientX + 14, y = evt.clientY - 10;
      if (x + 290 > vw) x = evt.clientX - 294;
      if (y + 400 > vh) y = evt.clientY - 400;
      tt.style.left = x + 'px';
      tt.style.top  = y + 'px';
    }

    function mprHideTooltip() {
      const tt = document.getElementById('mpr-tooltip');
      if (tt) tt.classList.remove('visible');
    }

    // ── ARC GAUGE ──
    function initArcGauge() {
      const canvas = document.getElementById('arcGauge');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = 90, h = 52;
      canvas.width = w; canvas.height = h;
      const cx = w/2, cy = h - 4;
      const r = 38, lw = 8;
      const score = 72; // 0-100
      const startAngle = Math.PI;
      const endAngle   = 2 * Math.PI;
      const valAngle   = startAngle + (score / 100) * Math.PI;

      // BG arc
      ctx.beginPath(); ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.strokeStyle = '#1C2232'; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();

      // Value arc — gradient from red → yellow → green
      const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
      grad.addColorStop(0,   '#F85149');
      grad.addColorStop(0.5, '#D29922');
      grad.addColorStop(1,   '#3FB950');
      ctx.beginPath(); ctx.arc(cx, cy, r, startAngle, valAngle);
      ctx.strokeStyle = grad; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
    }

    // ── SECTOR BARS ──
    const SECTOR_DATA = {
      '1D': [
        { name:'기술', pct:+1.42 }, { name:'헬스케어', pct:+0.83 }, { name:'커뮤니케이션', pct:+0.71 },
        { name:'임의소비재', pct:+0.54 }, { name:'금융', pct:+0.32 }, { name:'산업재', pct:+0.18 },
        { name:'필수소비재', pct:-0.12 }, { name:'유틸리티', pct:-0.34 }, { name:'에너지', pct:-0.41 },
        { name:'소재', pct:-0.58 }, { name:'부동산', pct:-0.92 },
      ],
      '1W': [
        { name:'기술', pct:+3.21 }, { name:'커뮤니케이션', pct:+2.44 }, { name:'임의소비재', pct:+1.87 },
        { name:'헬스케어', pct:+1.12 }, { name:'금융', pct:+0.74 }, { name:'산업재', pct:+0.43 },
        { name:'소재', pct:-0.28 }, { name:'필수소비재', pct:-0.51 }, { name:'에너지', pct:-0.84 },
        { name:'유틸리티', pct:-1.12 }, { name:'부동산', pct:-2.14 },
      ],
      '1M': [
        { name:'기술', pct:+8.41 }, { name:'임의소비재', pct:+5.88 }, { name:'커뮤니케이션', pct:+4.72 },
        { name:'헬스케어', pct:+2.11 }, { name:'금융', pct:+1.43 }, { name:'산업재', pct:+0.92 },
        { name:'소재', pct:-0.64 }, { name:'필수소비재', pct:-1.22 }, { name:'부동산', pct:-3.14 },
        { name:'에너지', pct:-3.88 }, { name:'유틸리티', pct:-4.51 },
      ],
    };

    function setSectorPeriod(btn, period) {
      document.querySelectorAll('#sector-bar-panel').forEach(() => {});
      document.querySelectorAll('.db-panel-acts .db-mini-btn').forEach(b => {
        if (['1D','1W','1M'].includes(b.textContent)) b.classList.remove('active');
      });
      btn.classList.add('active');
      renderSectorBars(period);
    }

    function renderSectorBars(period) {
      const container = document.getElementById('sector-bar-panel');
      if (!container) return;
      const rows = SECTOR_DATA[period] || SECTOR_DATA['1D'];
      const maxAbs = Math.max(...rows.map(r => Math.abs(r.pct)));
      container.innerHTML = '<div class="sector-bar-list">' +
        rows.map(r => {
          const pct = r.pct;
          const w = Math.round((Math.abs(pct) / maxAbs) * 100);
          const color = pct >= 0 ? '#3FB950' : '#F85149';
          const cl = pct >= 0 ? 'positive' : 'negative';
          return \`<div class="sector-bar-row">
            <span class="sector-name">\${r.name}</span>
            <div class="sector-bar-track"><div class="sector-bar-fill" style="width:\${w}%;background:\${color};"></div></div>
            <span class="sector-pct \${cl}">\${pct>0?'+':''}\${pct.toFixed(2)}%</span>
          </div>\`;
        }).join('') + '</div>';
    }

    function initSectorBars() { renderSectorBars('1D'); }

    // ── TREEMAP ──
    const TREEMAP_DATA = [
      { sym:'NVDA', pct:+2.14, size:9 }, { sym:'AAPL', pct:+0.92, size:11 }, { sym:'MSFT', pct:+0.71, size:10 },
      { sym:'AMZN', pct:+1.34, size:8 }, { sym:'META', pct:+1.88, size:7 }, { sym:'GOOGL', pct:+0.44, size:8 },
      { sym:'BRK.B', pct:+0.18, size:6 }, { sym:'TSM', pct:+1.21, size:5 },
      { sym:'TSLA', pct:-0.84, size:6 }, { sym:'AMGN', pct:-0.54, size:4 },
      { sym:'XOM', pct:-0.41, size:5 }, { sym:'CVX', pct:-0.38, size:4 },
      { sym:'BTC', pct:+1.24, size:4 }, { sym:'GLD', pct:+0.28, size:3 },
      { sym:'TLT', pct:+0.31, size:3 }, { sym:'SPY', pct:+0.43, size:3 },
      { sym:'LLY', pct:+0.83, size:4 }, { sym:'JPM', pct:+0.52, size:4 },
    ];

    function initTreemap() {
      const container = document.getElementById('treemap-panel');
      if (!container) return;
      const total = TREEMAP_DATA.reduce((s, d) => s + d.size, 0);
      container.innerHTML = '<div class="treemap-container" id="treemap-inner"></div>';
      const inner = document.getElementById('treemap-inner');
      TREEMAP_DATA.forEach(d => {
        const cell = document.createElement('div');
        cell.className = 'treemap-cell';
        const flexBasis = Math.max(((d.size / total) * 100 * 1.8), 10);
        cell.style.cssText = \`
          flex: \${d.size} \${d.size} \${flexBasis}%;
          background: \${d.pct >= 0
            ? \`rgba(63,185,80,\${Math.min(0.15 + Math.abs(d.pct)*0.12, 0.6)})\`
            : \`rgba(248,81,73,\${Math.min(0.15 + Math.abs(d.pct)*0.12, 0.6)})\`
          };
          border: 1px solid \${d.pct >= 0 ? 'rgba(63,185,80,0.2)' : 'rgba(248,81,73,0.2)'};
        \`;
        cell.innerHTML = \`<span class="treemap-ticker">\${d.sym}</span><span class="treemap-pct">\${d.pct>0?'+':''}\${d.pct.toFixed(2)}%</span>\`;
        inner.appendChild(cell);
      });
    }

    // ── OVERLAY CHART ──
    function genOverlayData(n, seed, amp) {
      const arr = [0];
      let v = 0;
      for (let i = 1; i < n; i++) {
        v += (Math.random() - 0.48 + seed * 0.005) * amp;
        arr.push(parseFloat(v.toFixed(2)));
      }
      return arr;
    }

    function makeOverlayLabels(n) {
      const labels = [];
      const now = new Date();
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        labels.push((d.getMonth()+1)+'/'+d.getDate());
      }
      return labels;
    }

    const OVERLAY_SERIES = [
      { id:'spy',  label:'S&P 500',    color:'#3B82F6', seed:0.6, amp:0.8 },
      { id:'qqq',  label:'NASDAQ',     color:'#22D3EE', seed:0.8, amp:1.1 },
      { id:'tlt',  label:'TLT (채권)', color:'#F59E0B', seed:-0.2, amp:0.6 },
      { id:'gld',  label:'GOLD',       color:'#10B981', seed:0.3, amp:0.5 },
      { id:'btc',  label:'BTC',        color:'#A78BFA', seed:1.2, amp:2.0 },
    ];

    let overlayActiveIds = new Set(['spy','qqq','tlt','gld','btc']);
    let overlayChart2 = null;

    function buildOverlaySeriesBadges() {
      const row = document.getElementById('overlay-series-row');
      if (!row) return;
      row.innerHTML = '';
      OVERLAY_SERIES.forEach(s => {
        const badge = document.createElement('div');
        badge.className = 'overlay-series-badge' + (overlayActiveIds.has(s.id) ? ' active' : '');
        badge.style.color = overlayActiveIds.has(s.id) ? s.color : 'var(--text-muted)';
        badge.innerHTML = \`<span class="swatch" style="background:\${s.color};"></span>\${s.label}\`;
        badge.onclick = () => {
          if (overlayActiveIds.has(s.id)) overlayActiveIds.delete(s.id);
          else overlayActiveIds.add(s.id);
          buildOverlaySeriesBadges();
          if (overlayChart2) {
            overlayChart2.data.datasets.forEach(ds => {
              const sid = ds._sid;
              ds.hidden = !overlayActiveIds.has(sid);
            });
            overlayChart2.update();
          }
        };
        row.appendChild(badge);
      });
    }

    function initOverlayChart() {
      buildOverlaySeriesBadges();
      const canvas = document.getElementById('overlayChart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const n = 252;
      const labels = makeOverlayLabels(n);
      const datasets = OVERLAY_SERIES.map(s => ({
        label: s.label,
        data: genOverlayData(n, parseFloat(s.seed), s.amp),
        borderColor: s.color,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.3,
        fill: false,
        _sid: s.id,
      }));

      overlayChart2 = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          animation: false,
          scales: {
            x: {
              grid: { color: 'rgba(33,38,45,0.6)', drawBorder: false },
              ticks: { color: '#484F58', font: { size: 8, family: 'JetBrains Mono' }, maxTicksLimit: 10, maxRotation: 0 },
              border: { display: false }
            },
            y: {
              grid: { color: 'rgba(33,38,45,0.6)', drawBorder: false },
              ticks: { color: '#484F58', font: { size: 8, family: 'JetBrains Mono' }, callback: v => v+'%' },
              border: { display: false }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1C2232', borderColor: '#2D3444', borderWidth: 1,
              titleColor: '#E6EDF3', bodyColor: '#8B949E',
              titleFont: { family: 'JetBrains Mono', size: 9 },
              bodyFont: { family: 'JetBrains Mono', size: 9 },
              callbacks: { label: c => \` \${c.dataset.label}: \${c.raw>0?'+':''}\${c.raw}%\` }
            }
          }
        }
      });
      dbCharts.overlay = overlayChart2;
    }

    function setOverlayPeriod(btn, period) {
      document.querySelectorAll('.db-panel-acts .db-mini-btn').forEach(b => {
        if (['3M','1Y','3Y','5Y'].includes(b.textContent)) b.classList.remove('active');
      });
      btn.classList.add('active');
      const nMap = { '3M':63, '1Y':252, '3Y':756, '5Y':1260 };
      const n = Math.min(nMap[period] || 252, 252);
      if (overlayChart2) {
        const lbl = makeOverlayLabels(n);
        overlayChart2.data.labels = lbl;
        overlayChart2.data.datasets.forEach((ds, i) => {
          ds.data = genOverlayData(n, OVERLAY_SERIES[i].seed, OVERLAY_SERIES[i].amp);
        });
        overlayChart2.update();
      }
    }

    // ── YIELD CURVE CHART ──
    function initYieldChart() {
      const canvas = document.getElementById('yieldChart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const n = 252;
      const labels = makeOverlayLabels(n);
      const TENORS = [
        { label:'2Y',  color:'#F85149', base: 4.83 },
        { label:'5Y',  color:'#F59E0B', base: 4.51 },
        { label:'10Y', color:'#3B82F6', base: 4.22 },
        { label:'30Y', color:'#A78BFA', base: 4.42 },
      ];
      const datasets = TENORS.map(t => {
        let v = t.base;
        const data = Array.from({ length: n }, () => {
          v += (Math.random() - 0.5) * 0.04;
          return parseFloat(Math.max(0.5, v).toFixed(3));
        });
        return { label: t.label, data, borderColor: t.color, borderWidth: 1.5, pointRadius: 0, tension: 0.3, fill: false };
      });

      const yc = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          interaction: { mode: 'index', intersect: false },
          scales: {
            x: { grid: { color: 'rgba(33,38,45,0.5)', drawBorder: false }, ticks: { color: '#484F58', font: { size: 8, family: 'JetBrains Mono' }, maxTicksLimit: 8, maxRotation: 0 }, border: { display: false } },
            y: { grid: { color: 'rgba(33,38,45,0.5)', drawBorder: false }, ticks: { color: '#484F58', font: { size: 8, family: 'JetBrains Mono' }, callback: v => v.toFixed(2)+'%' }, border: { display: false } }
          },
          plugins: {
            legend: { display: true, position: 'top', align: 'end', labels: { color: '#8B949E', font: { size: 8, family: 'JetBrains Mono' }, boxWidth: 10, padding: 6 } },
            tooltip: { backgroundColor: '#1C2232', borderColor: '#2D3444', borderWidth: 1, titleColor: '#E6EDF3', bodyColor: '#8B949E', titleFont: { family: 'JetBrains Mono', size: 9 }, bodyFont: { family: 'JetBrains Mono', size: 9 } }
          }
        }
      });
      dbCharts.yield = yc;
    }

    function setYieldPeriod(btn, period) {
      document.querySelectorAll('.db-panel-acts .db-mini-btn').forEach(b => {
        if (['1Y','3Y'].includes(b.textContent) && b.closest('.db-panel-hdr')?.querySelector('.db-panel-title')?.textContent.includes('국채')) b.classList.remove('active');
      });
      btn.classList.add('active');
    }

    // ── NEWS FEED ──
    const NEWS_FEED = [
      { time:'10:42', badge:'nb-alert', badgeText:'긴급', headline:'Fed RRP 잔고 $180B 하향 — TGA 재구축 2주 내 $180B 예상', sub:'단기자금시장 SOFR 발작 가능성 고조' },
      { time:'10:15', badge:'nb-macro', badgeText:'매크로', headline:'FOMC 6월 의사록 — 인플레 2차 파고 우려 명시, 9월 인하 확률 21%로 급락', sub:'CME FedWatch 업데이트' },
      { time:'09:38', badge:'nb-sector', badgeText:'섹터', headline:'AI 인프라·양자컴퓨팅 섹터 옵션 체인 과열 — 60일 IV 사상 최고 경신', sub:'NVDA·RGTI·IonQ Call/Put 비율 2.4배' },
      { time:'09:12', badge:'nb-crypto', badgeText:'크립토', headline:'BlackRock IBIT 5일 연속 $200M+ 순유입 — BTC ETF 총 AUM $55B 경신', sub:'반감기 후 채굴 원가 상승으로 공급 압박' },
      { time:'08:55', badge:'nb-macro', badgeText:'매크로', headline:'OPEC+ 자발적 감산 9월까지 연장 합의 — WTI $80~85 박스권 유지', sub:'사우디·러시아 주도 하루 166만배럴 감산' },
      { time:'어제', badge:'nb-sector', badgeText:'섹터', headline:'DRAM·NAND 가격 반등 MoM +8% — HBM3E 공급 병목 심화', sub:'SK하이닉스·삼성·마이크론으로 공급 집중' },
      { time:'어제', badge:'nb-macro', badgeText:'매크로', headline:'버크셔해서웨이 13F: AAPL 13% 추가 매도, 현금 $189B 신기록', sub:'CVX 신규 편입. 가치투자 기회 부재 언급' },
    ];

    // ══════════════════════════════════════════════
    // MC — 매크로 차트 (Macro Chart) JS
    // ══════════════════════════════════════════════

    // ── 지표 메타 ──
    const MC_META = {
      SPX:    { name:'S&P 500',         color:'#58A6FF', unit:'pt',  val:'5,421',   chg:'+0.43%', pos:true  },
      NDX:    { name:'NASDAQ 100',      color:'#F78166', unit:'pt',  val:'19,284',  chg:'+0.71%', pos:true  },
      RUT:    { name:'Russell 2000',    color:'#D29922', unit:'pt',  val:'2,014',   chg:'-0.31%', pos:false },
      VIX:    { name:'VIX',             color:'#F85149', unit:'',    val:'13.84',   chg:'-0.92%', pos:false },
      KOSPI:  { name:'KOSPI',           color:'#3FB950', unit:'pt',  val:'2,782',   chg:'-0.31%', pos:false },
      US10Y:  { name:'US 10Y',          color:'#FF7B72', unit:'%',   val:'4.218',   chg:'-3.2bp', pos:false },
      US2Y:   { name:'US 2Y',           color:'#FFA657', unit:'%',   val:'4.832',   chg:'-5.1bp', pos:false },
      SOFR:   { name:'SOFR',            color:'#E3B341', unit:'%',   val:'5.30',    chg:'0.0bp',  pos:true  },
      RRP:    { name:'연준 RRP',         color:'#A5D6FF', unit:'$B',  val:'412',     chg:'-8.2B',  pos:false },
      TGA:    { name:'재무부 TGA',       color:'#7EE787', unit:'$B',  val:'738',     chg:'+24B',   pos:true  },
      GOLD:   { name:'Gold',            color:'#F0C050', unit:'$',   val:'2,384',   chg:'+0.29%', pos:true  },
      WTI:    { name:'WTI 원유',         color:'#79C0FF', unit:'$',   val:'82.16',   chg:'+0.57%', pos:true  },
      DXY:    { name:'DXY',             color:'#CE93D8', unit:'',    val:'104.4',   chg:'-0.18%', pos:false },
      USDKRW: { name:'USD/KRW',         color:'#80DEEA', unit:'₩',   val:'1,381',   chg:'+0.12%', pos:true  },
      BTC:    { name:'Bitcoin',         color:'#F78166', unit:'$',   val:'68,412',  chg:'+1.24%', pos:true  },
      ETH:    { name:'Ethereum',        color:'#A5D6FF', unit:'$',   val:'3,641',   chg:'+0.88%', pos:true  },
      RGTI:   { name:'RGTI',            color:'#FFA657', unit:'$',   val:'12.84',   chg:'+4.21%', pos:true  },
    };

    // ── 프리셋 정의 ──
    const MC_PRESETS = {
      fed_liq:   ['RRP','TGA','SOFR'],
      risk_on:   ['RGTI','BTC','NDX'],
      rates:     ['US10Y','US2Y','SOFR'],
      macro_trio:['SPX','DXY','GOLD'],
      custom1:   ['SPX','BTC','GOLD','US10Y'],
    };

    // ── 전역 상태 ──
    const MC_STATE = {
      active: new Set(),        // 현재 활성 지표 ID Set
      tf: '1D',
      style: 'line',
      subPanelOpen: true,
      crosshairOn: true,
      chart: null,              // LightweightCharts 인스턴스
      rsiChart: null,
      volChart: null,
      series: {},               // id → series 인스턴스
      rsiSeries: null,
      volSeries: null,
      resizeObs: null,
    };

    // ── 시뮬레이션 데이터 생성 ──
    function mcGenData(seed, baseVal, vol, days) {
      const data = [];
      let v = baseVal;
      const now = new Date();
      for (let i = days; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0,10);
        const rng = Math.sin(seed * i * 0.37 + seed) * vol + (Math.random() - 0.49) * vol * 0.6;
        v = Math.max(v + rng, baseVal * 0.3);
        data.push({ time: ds, value: parseFloat(v.toFixed(4)) });
      }
      return data;
    }

    function mcGenOHLC(seed, base, vol, days) {
      const data = [];
      let v = base;
      const now = new Date();
      for (let i = days; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0,10);
        const chg = (Math.sin(seed * i * 0.41) * vol + (Math.random()-0.48)*vol);
        const o = v;
        v = Math.max(v + chg, base * 0.3);
        const hi = Math.max(o,v) * (1 + Math.random()*0.003);
        const lo = Math.min(o,v) * (1 - Math.random()*0.003);
        data.push({ time:ds, open:parseFloat(o.toFixed(2)), high:parseFloat(hi.toFixed(2)), low:parseFloat(lo.toFixed(2)), close:parseFloat(v.toFixed(2)) });
      }
      return data;
    }

    function mcGenRSI(days) {
      const data = [];
      const now = new Date();
      for (let i = days; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0,10);
        const rsi = 40 + Math.sin(i*0.18)*25 + (Math.random()-0.5)*8;
        data.push({ time:ds, value: parseFloat(Math.min(95,Math.max(5,rsi)).toFixed(1)) });
      }
      return data;
    }

    function mcGenVol(days) {
      const data = [];
      const now = new Date();
      for (let i = days; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0,10);
        const vol = 50 + Math.abs(Math.sin(i*0.22))*120 + Math.random()*30;
        const isUp = Math.random() > 0.45;
        data.push({ time:ds, value: parseFloat(vol.toFixed(0)), color: isUp ? 'rgba(63,185,80,0.6)' : 'rgba(248,81,73,0.6)' });
      }
      return data;
    }

    // 지표별 기준값
    const MC_BASE = {
      SPX:5000, NDX:18000, RUT:1900, VIX:15, KOSPI:2700,
      US10Y:4.2, US2Y:4.8, SOFR:5.3, RRP:500, TGA:650,
      GOLD:2200, WTI:78, DXY:104, USDKRW:1360,
      BTC:60000, ETH:3200, RGTI:9,
    };
    const MC_VOL = {
      SPX:30, NDX:80, RUT:15, VIX:0.8, KOSPI:25,
      US10Y:0.04, US2Y:0.03, SOFR:0.01, RRP:15, TGA:20,
      GOLD:18, WTI:1.2, DXY:0.4, USDKRW:8,
      BTC:1200, ETH:90, RGTI:0.8,
    };

    // ── 초기화 ──
    function initMC() {
      const wrap = document.getElementById('mc-chart-main');
      const rsiEl = document.getElementById('mc-rsi-chart');
      const volEl = document.getElementById('mc-vol-chart');
      if (!wrap || !LightweightCharts) return;

      const opts = {
        layout: { background:{ color:'#0D1117' }, textColor:'#8B949E' },
        grid: { vertLines:{ color:'rgba(139,148,158,0.1)' }, horzLines:{ color:'rgba(139,148,158,0.1)' } },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        rightPriceScale: { borderColor:'rgba(139,148,158,0.2)', mode: LightweightCharts.PriceScaleMode.Percentage },
        timeScale: { borderColor:'rgba(139,148,158,0.2)', timeVisible:true },
        handleScroll: true, handleScale: true,
      };

      MC_STATE.chart = LightweightCharts.createChart(wrap, opts);

      // RSI 서브차트
      MC_STATE.rsiChart = LightweightCharts.createChart(rsiEl, {
        layout: { background:{ color:'#0D1117' }, textColor:'#8B949E' },
        grid: { vertLines:{ color:'rgba(139,148,158,0.06)' }, horzLines:{ color:'rgba(139,148,158,0.06)' } },
        rightPriceScale: { borderColor:'rgba(139,148,158,0.2)', scaleMargins:{ top:0.1, bottom:0.1 } },
        timeScale: { visible:false },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      });
      MC_STATE.rsiSeries = MC_STATE.rsiChart.addLineSeries({ color:'#58A6FF', lineWidth:1.5 });
      MC_STATE.rsiSeries.setData(mcGenRSI(365));
      // RSI 레벨 라인
      MC_STATE.rsiChart.addLineSeries({ color:'rgba(248,81,73,0.4)', lineWidth:1, lineStyle:2 }).setData(
        mcGenRSI(365).map(d=>({time:d.time, value:70}))
      );
      MC_STATE.rsiChart.addLineSeries({ color:'rgba(63,185,80,0.4)', lineWidth:1, lineStyle:2 }).setData(
        mcGenRSI(365).map(d=>({time:d.time, value:30}))
      );

      // Volume 서브차트
      MC_STATE.volChart = LightweightCharts.createChart(volEl, {
        layout: { background:{ color:'#0D1117' }, textColor:'#8B949E' },
        grid: { vertLines:{ color:'rgba(139,148,158,0.06)' }, horzLines:{ color:'rgba(139,148,158,0.06)' } },
        rightPriceScale: { borderColor:'rgba(139,148,158,0.2)', scaleMargins:{ top:0.1, bottom:0 } },
        timeScale: { visible:false },
      });
      MC_STATE.volSeries = MC_STATE.volChart.addHistogramSeries({ priceFormat:{ type:'volume' } });
      MC_STATE.volSeries.setData(mcGenVol(365));

      // 크로스헤어 시간 동기화 (메인 → 서브)
      MC_STATE.chart.subscribeCrosshairMove(param => {
        if (param.time) {
          MC_STATE.rsiChart.setCrosshairPosition(0, param.time, MC_STATE.rsiSeries);
          MC_STATE.volChart.setCrosshairPosition(0, param.time, MC_STATE.volSeries);
        }
      });

      // ResizeObserver
      if (MC_STATE.resizeObs) MC_STATE.resizeObs.disconnect();
      MC_STATE.resizeObs = new ResizeObserver(() => mcHandleResize());
      MC_STATE.resizeObs.observe(wrap);
      MC_STATE.resizeObs.observe(rsiEl);
      MC_STATE.resizeObs.observe(volEl);

      // 기본 프리셋 적용
      mcApplyPreset(document.querySelector('[data-preset="fed_liq"]'), 'fed_liq');
    }

    // ── 리사이즈 핸들러 ──
    function mcHandleResize() {
      const wrap = document.getElementById('mc-chart-main');
      const rsiEl = document.getElementById('mc-rsi-chart');
      const volEl = document.getElementById('mc-vol-chart');
      if (MC_STATE.chart && wrap) {
        MC_STATE.chart.resize(wrap.clientWidth, wrap.clientHeight);
      }
      if (MC_STATE.rsiChart && rsiEl) {
        MC_STATE.rsiChart.resize(rsiEl.clientWidth, rsiEl.clientHeight);
      }
      if (MC_STATE.volChart && volEl) {
        MC_STATE.volChart.resize(volEl.clientWidth, volEl.clientHeight);
      }
    }

    // ── 지표 토글 (체크박스 ↔ 차트 ↔ 범례 동기화) ──
    function mcToggleIndicator(id) {
      if (!MC_STATE.chart) return;
      if (MC_STATE.active.has(id)) {
        mcRemoveIndicator(id);
      } else {
        mcAddIndicator(id);
      }
      mcSyncCheckboxes();
      mcRenderLegend();
    }

    function mcAddIndicator(id) {
      if (MC_STATE.active.has(id) || MC_STATE.series[id]) return;
      const meta = MC_META[id];
      if (!meta) return;
      const days = 365;
      let s;
      if (MC_STATE.style === 'candle') {
        s = MC_STATE.chart.addCandlestickSeries({
          upColor:'#3FB950', downColor:'#F85149',
          borderUpColor:'#3FB950', borderDownColor:'#F85149',
          wickUpColor:'#3FB950', wickDownColor:'#F85149',
        });
        s.setData(mcGenOHLC(id.charCodeAt(0), MC_BASE[id]||100, MC_VOL[id]||5, days));
      } else if (MC_STATE.style === 'area') {
        s = MC_STATE.chart.addAreaSeries({
          lineColor: meta.color, topColor: meta.color+'44', bottomColor: meta.color+'05',
          lineWidth: 2,
        });
        s.setData(mcGenData(id.charCodeAt(0), MC_BASE[id]||100, MC_VOL[id]||5, days));
      } else {
        s = MC_STATE.chart.addLineSeries({ color: meta.color, lineWidth: 2, priceLineVisible: false });
        s.setData(mcGenData(id.charCodeAt(0), MC_BASE[id]||100, MC_VOL[id]||5, days));
      }
      MC_STATE.series[id] = s;
      MC_STATE.active.add(id);
    }

    function mcRemoveIndicator(id) {
      if (!MC_STATE.active.has(id)) return;
      if (MC_STATE.series[id] && MC_STATE.chart) {
        try { MC_STATE.chart.removeSeries(MC_STATE.series[id]); } catch(e){}
        delete MC_STATE.series[id];
      }
      MC_STATE.active.delete(id);
    }

    // ── 범례 렌더링 ──
    function mcRenderLegend() {
      const el = document.getElementById('mc-legend');
      if (!el) return;
      el.innerHTML = [...MC_STATE.active].map(id => {
        const m = MC_META[id];
        if (!m) return '';
        return \`<div class="mc-legend-item">
          <div class="mc-legend-dot" style="background:\${m.color}"></div>
          <span class="mc-legend-name">\${m.name}</span>
          <span class="mc-legend-val">\${m.val}</span>
          <span class="mc-legend-chg \${m.pos?'pos':'neg'}">\${m.chg}</span>
          <div class="mc-legend-actions">
            <button class="mc-legend-act-btn" title="숨기기" onclick="mcHideSeries('\${id}')"><i class="fas fa-eye-slash"></i></button>
            <button class="mc-legend-act-btn" title="제거" onclick="mcRemoveFromLegend('\${id}')"><i class="fas fa-times"></i></button>
          </div>
        </div>\`;
      }).join('');
    }

    function mcHideSeries(id) {
      if (MC_STATE.series[id]) {
        const s = MC_STATE.series[id];
        // visible 토글
        const opts = s.options();
        s.applyOptions({ visible: !(opts.visible !== false) });
      }
    }

    function mcRemoveFromLegend(id) {
      mcRemoveIndicator(id);
      mcSyncCheckboxes();
      mcRenderLegend();
    }

    // ── 체크박스 동기화 ──
    function mcSyncCheckboxes() {
      document.querySelectorAll('.mc-cb').forEach(cb => {
        cb.checked = MC_STATE.active.has(cb.dataset.id);
      });
    }

    // ── 프리셋 드롭다운 토글 ──
    function mcTogglePresetDropdown(e) {
      e.stopPropagation();
      const trigger = document.getElementById('mc-preset-trigger');
      const dropdown = document.getElementById('mc-preset-dropdown');
      if (!trigger || !dropdown) return;
      const isOpen = dropdown.classList.contains('open');
      dropdown.classList.toggle('open', !isOpen);
      trigger.classList.toggle('open', !isOpen);
    }

    // ── 드롭다운 아이템 클릭으로 프리셋 적용 ──
    function mcApplyPresetDrop(el, presetId) {
      // 드롭다운 닫기
      const trigger = document.getElementById('mc-preset-trigger');
      const dropdown = document.getElementById('mc-preset-dropdown');
      if (dropdown) dropdown.classList.remove('open');
      if (trigger) { trigger.classList.remove('open'); trigger.classList.add('active'); }
      // active 표시
      document.querySelectorAll('.mc-preset-item').forEach(b => b.classList.remove('active'));
      if (el) el.classList.add('active');
      // 선택된 이름 표시
      const nameEl = document.getElementById('mc-preset-active-name');
      if (nameEl && el) nameEl.textContent = el.textContent.trim();
      // 프리셋 데이터 적용
      mcApplyPreset(null, presetId);
    }

    // ── 외부 클릭 시 드롭다운 닫기 ──
    document.addEventListener('click', function(e) {
      const wrap = document.getElementById('mc-preset-wrap');
      if (wrap && !wrap.contains(e.target)) {
        const dropdown = document.getElementById('mc-preset-dropdown');
        const trigger = document.getElementById('mc-preset-trigger');
        if (dropdown) dropdown.classList.remove('open');
        if (trigger) trigger.classList.remove('open');
      }
    });

    // ── 프리셋 적용 (내부) ──
    function mcApplyPreset(btn, presetId) {
      const preset = MC_PRESETS[presetId];
      if (!preset) return;
      // 기존 지표 전부 제거
      [...MC_STATE.active].forEach(id => mcRemoveIndicator(id));
      // 프리셋 지표 추가
      preset.forEach(id => mcAddIndicator(id));
      mcSyncCheckboxes();
      mcRenderLegend();
      // 레거시 .mc-preset-btn 호환
      document.querySelectorAll('.mc-preset-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
    }

    // ── 타임프레임 ──
    function mcSetTf(btn, tf) {
      MC_STATE.tf = tf;
      document.querySelectorAll('.mc-tf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // 데이터 재생성 (실제 구현 시 API 호출로 교체)
      const days = tf==='15m'?7 : tf==='1h'?30 : tf==='1D'?365 : tf==='1W'?365*2 : 365*5;
      [...MC_STATE.active].forEach(id => {
        if (!MC_STATE.series[id]) return;
        if (MC_STATE.style === 'candle') {
          MC_STATE.series[id].setData(mcGenOHLC(id.charCodeAt(0), MC_BASE[id]||100, MC_VOL[id]||5, days));
        } else {
          MC_STATE.series[id].setData(mcGenData(id.charCodeAt(0), MC_BASE[id]||100, MC_VOL[id]||5, days));
        }
      });
      MC_STATE.rsiSeries.setData(mcGenRSI(days));
      MC_STATE.volSeries.setData(mcGenVol(days));
    }

    // ── 차트 스타일 ──
    function mcSetStyle(btn, style) {
      MC_STATE.style = style;
      document.querySelectorAll('.mc-style-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // 모든 시리즈 재생성
      const activeIds = [...MC_STATE.active];
      activeIds.forEach(id => mcRemoveIndicator(id));
      activeIds.forEach(id => mcAddIndicator(id));
      mcRenderLegend();
    }

    // ── 사이드바 토글 ──
    function mcToggleSidebar() {
      const sb = document.getElementById('mc-sidebar');
      if (!sb) return;
      sb.classList.toggle('collapsed');
      // 사이드바 전환 후 차트 리사이즈 (transition 0.22s 후)
      setTimeout(() => mcHandleResize(), 240);
    }

    // ── 서브 패널 토글 ──
    function mcToggleSubPanel(btn) {
      MC_STATE.subPanelOpen = !MC_STATE.subPanelOpen;
      const el = document.getElementById('mc-sub-panels');
      if (el) el.classList.toggle('hidden', !MC_STATE.subPanelOpen);
      btn.classList.toggle('active', MC_STATE.subPanelOpen);
      setTimeout(() => mcHandleResize(), 240);
    }

    // ── 크로스헤어 토글 ──
    function mcToggleCrosshair(btn) {
      MC_STATE.crosshairOn = !MC_STATE.crosshairOn;
      btn.classList.toggle('active', MC_STATE.crosshairOn);
      if (MC_STATE.chart) {
        MC_STATE.chart.applyOptions({
          crosshair: { mode: MC_STATE.crosshairOn
            ? LightweightCharts.CrosshairMode.Normal
            : LightweightCharts.CrosshairMode.Hidden }
        });
      }
    }

    // ── 줌 초기화 ──
    function mcResetZoom() {
      if (MC_STATE.chart) MC_STATE.chart.timeScale().fitContent();
      if (MC_STATE.rsiChart) MC_STATE.rsiChart.timeScale().fitContent();
      if (MC_STATE.volChart) MC_STATE.volChart.timeScale().fitContent();
    }

    // ── 사이드바 검색 필터 ──
    function mcSbFilter() {
      const kw = (document.getElementById('mc-sb-search')?.value || '').toLowerCase();
      document.querySelectorAll('.mc-sb-item').forEach(item => {
        const nm = item.querySelector('.mc-sb-name')?.textContent.toLowerCase() || '';
        item.style.display = nm.includes(kw) ? '' : 'none';
      });
    }

    // ── 아코디언 그룹 토글 ──
    function mcToggleGroup(id) {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('collapsed');
    }

    // ── MC 초기화는 navigate() 훅에서 처리 (위 navigate 함수 내 page==='chart' 분기 참조) ──

    // ══════════════════════════════════════════════
    // TM — 글로벌 크로스에셋 휠-줌 히트맵 트리맵
    // ══════════════════════════════════════════════

    // ── 색상 보간 유틸 ──
    function tmLerpColor(pct) {
      // pct: -1(풀레드) ~ 0(블랙) ~ +1(풀그린)
      const t = Math.max(-1, Math.min(1, pct));
      if (t < 0) {
        // 레드: #FF1A1A(t=-1) → #141414(t=0)
        const r = Math.round(20 + (255-20) * (-t));
        const g = Math.round(20 * (1+t));
        const b = Math.round(20 * (1+t));
        return 'rgb(' + r + ',' + g + ',' + b + ')';
      } else {
        // 그린: #141414(t=0) → #00DD44(t=1)
        const r = Math.round(20 * (1-t));
        const g = Math.round(20 + (221-20) * t);
        const b = Math.round(20 + (68-20) * t);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
      }
    }

    // ── 계층 데이터 (Depth 1→2→3) ──
    // 각 노드: { id, name, chg(%), volume, mcap, assetClass, children? }
    const TM_DATA = {
      id: 'root', name: '전체자산시장',
      children: [
        // ────────────── 주식 ──────────────
        { id: 'equity', name: '주식', assetClass: 'equity',
          children: [
            { id: 'tech', name: '기술주', assetClass: 'equity', chg: 1.24,
              children: [
                { id: 'NVDA', name: 'NVDA', ticker: true, assetClass: 'equity', chg: 3.82, volume: 4800, mcap: 24000 },
                { id: 'AAPL', name: 'AAPL', ticker: true, assetClass: 'equity', chg: 0.54, volume: 3200, mcap: 31000 },
                { id: 'MSFT', name: 'MSFT', ticker: true, assetClass: 'equity', chg: 0.91, volume: 2800, mcap: 29000 },
                { id: 'META', name: 'META', ticker: true, assetClass: 'equity', chg: 2.17, volume: 2100, mcap: 13500 },
                { id: 'GOOGL', name: 'GOOGL', ticker: true, assetClass: 'equity', chg: 1.05, volume: 1900, mcap: 21000 },
                { id: 'AVGO', name: 'AVGO', ticker: true, assetClass: 'equity', chg: 2.66, volume: 1700, mcap: 8200 },
                { id: 'AMD', name: 'AMD', ticker: true, assetClass: 'equity', chg: -0.88, volume: 1500, mcap: 2800 },
                { id: 'QCOM', name: 'QCOM', ticker: true, assetClass: 'equity', chg: 0.33, volume: 980, mcap: 1900 },
                { id: 'INTC', name: 'INTC', ticker: true, assetClass: 'equity', chg: -2.14, volume: 820, mcap: 850 },
                { id: 'TSM', name: 'TSM', ticker: true, assetClass: 'equity', chg: 1.77, volume: 760, mcap: 9200 },
              ]
            },
            { id: 'fin', name: '금융주', assetClass: 'equity', chg: -0.31,
              children: [
                { id: 'JPM', name: 'JPM', ticker: true, assetClass: 'equity', chg: -0.52, volume: 2100, mcap: 5600 },
                { id: 'GS', name: 'GS', ticker: true, assetClass: 'equity', chg: 0.18, volume: 1400, mcap: 1900 },
                { id: 'BAC', name: 'BAC', ticker: true, assetClass: 'equity', chg: -0.77, volume: 1800, mcap: 3100 },
                { id: 'MS', name: 'MS', ticker: true, assetClass: 'equity', chg: -0.33, volume: 1100, mcap: 1700 },
                { id: 'WFC', name: 'WFC', ticker: true, assetClass: 'equity', chg: 0.41, volume: 900, mcap: 2200 },
                { id: 'BRK', name: 'BRK.B', ticker: true, assetClass: 'equity', chg: -0.12, volume: 780, mcap: 8800 },
              ]
            },
            { id: 'health', name: '헬스케어', assetClass: 'equity', chg: 0.67,
              children: [
                { id: 'LLY', name: 'LLY', ticker: true, assetClass: 'equity', chg: 2.34, volume: 1600, mcap: 8200 },
                { id: 'JNJ', name: 'JNJ', ticker: true, assetClass: 'equity', chg: -0.22, volume: 1000, mcap: 3800 },
                { id: 'UNH', name: 'UNH', ticker: true, assetClass: 'equity', chg: 1.05, volume: 920, mcap: 4900 },
                { id: 'PFE', name: 'PFE', ticker: true, assetClass: 'equity', chg: -1.44, volume: 850, mcap: 1600 },
              ]
            },
            { id: 'energy', name: '에너지', assetClass: 'equity', chg: -1.08,
              children: [
                { id: 'XOM', name: 'XOM', ticker: true, assetClass: 'equity', chg: -1.22, volume: 1800, mcap: 5100 },
                { id: 'CVX', name: 'CVX', ticker: true, assetClass: 'equity', chg: -0.88, volume: 1200, mcap: 2900 },
                { id: 'COP', name: 'COP', ticker: true, assetClass: 'equity', chg: -1.55, volume: 900, mcap: 1400 },
              ]
            },
            { id: 'consdisc', name: '경기소비재', assetClass: 'equity', chg: 0.44,
              children: [
                { id: 'AMZN', name: 'AMZN', ticker: true, assetClass: 'equity', chg: 1.21, volume: 2800, mcap: 19800 },
                { id: 'TSLA', name: 'TSLA', ticker: true, assetClass: 'equity', chg: -0.55, volume: 3100, mcap: 7200 },
                { id: 'HD', name: 'HD', ticker: true, assetClass: 'equity', chg: 0.31, volume: 820, mcap: 3700 },
              ]
            },
            { id: 'kospi', name: '한국 KOSPI', assetClass: 'equity', chg: 0.82,
              children: [
                { id: '005930', name: '삼성전자', ticker: true, assetClass: 'equity', chg: 1.12, volume: 1900, mcap: 4200 },
                { id: '000660', name: 'SK하이닉스', ticker: true, assetClass: 'equity', chg: 2.44, volume: 1200, mcap: 1100 },
                { id: '035720', name: '카카오', ticker: true, assetClass: 'equity', chg: -0.88, volume: 680, mcap: 320 },
                { id: '005380', name: '현대차', ticker: true, assetClass: 'equity', chg: 0.55, volume: 540, mcap: 560 },
              ]
            },
          ]
        },
        // ────────────── 채권 ──────────────
        { id: 'bond', name: '채권', assetClass: 'bond',
          children: [
            { id: 'us_gov', name: '미국 국채', assetClass: 'bond', chg: 0.08,
              children: [
                { id: 'TLT', name: 'TLT (20Y+)', ticker: true, assetClass: 'bond', chg: 0.21, volume: 1800, mcap: 4800 },
                { id: 'IEF', name: 'IEF (7-10Y)', ticker: true, assetClass: 'bond', chg: 0.12, volume: 1100, mcap: 2900 },
                { id: 'SHY', name: 'SHY (1-3Y)', ticker: true, assetClass: 'bond', chg: 0.04, volume: 800, mcap: 2100 },
                { id: 'VGIT', name: 'VGIT (3-10Y)', ticker: true, assetClass: 'bond', chg: 0.09, volume: 620, mcap: 1700 },
              ]
            },
            { id: 'corp', name: '회사채', assetClass: 'bond', chg: -0.14,
              children: [
                { id: 'LQD', name: 'LQD (IG)', ticker: true, assetClass: 'bond', chg: -0.09, volume: 1200, mcap: 3600 },
                { id: 'HYG', name: 'HYG (HY)', ticker: true, assetClass: 'bond', chg: -0.22, volume: 1500, mcap: 1900 },
                { id: 'JNK', name: 'JNK (HY)', ticker: true, assetClass: 'bond', chg: -0.18, volume: 880, mcap: 1600 },
              ]
            },
            { id: 'em_bond', name: 'EM 채권', assetClass: 'bond', chg: -0.44,
              children: [
                { id: 'EMB', name: 'EMB', ticker: true, assetClass: 'bond', chg: -0.48, volume: 720, mcap: 1400 },
                { id: 'PCY', name: 'PCY', ticker: true, assetClass: 'bond', chg: -0.38, volume: 380, mcap: 480 },
              ]
            },
          ]
        },
        // ────────────── 원자재 ──────────────
        { id: 'commodity', name: '원자재', assetClass: 'commodity',
          children: [
            { id: 'precious', name: '귀금속', assetClass: 'commodity', chg: 0.88,
              children: [
                { id: 'GOLD_F', name: 'Gold', ticker: true, assetClass: 'commodity', chg: 0.92, volume: 2200, mcap: 14000 },
                { id: 'SLV', name: 'Silver', ticker: true, assetClass: 'commodity', chg: 1.44, volume: 900, mcap: 1400 },
                { id: 'PLAT', name: 'Platinum', ticker: true, assetClass: 'commodity', chg: 0.31, volume: 420, mcap: 520 },
              ]
            },
            { id: 'energy_cmd', name: '에너지(원자재)', assetClass: 'commodity', chg: -1.22,
              children: [
                { id: 'WTI_F', name: 'WTI 원유', ticker: true, assetClass: 'commodity', chg: -1.38, volume: 3100, mcap: 8800 },
                { id: 'BRENT', name: 'Brent', ticker: true, assetClass: 'commodity', chg: -1.12, volume: 2400, mcap: 7200 },
                { id: 'NG', name: 'Nat. Gas', ticker: true, assetClass: 'commodity', chg: -2.44, volume: 1100, mcap: 1200 },
              ]
            },
            { id: 'agri', name: '농산물', assetClass: 'commodity', chg: 0.22,
              children: [
                { id: 'CORN', name: 'Corn', ticker: true, assetClass: 'commodity', chg: 0.44, volume: 480, mcap: 620 },
                { id: 'WHEAT', name: 'Wheat', ticker: true, assetClass: 'commodity', chg: -0.11, volume: 380, mcap: 480 },
                { id: 'SOYB', name: 'Soybean', ticker: true, assetClass: 'commodity', chg: 0.28, volume: 340, mcap: 410 },
              ]
            },
          ]
        },
        // ────────────── 통화 ──────────────
        { id: 'fx', name: '통화(FX)', assetClass: 'fx',
          children: [
            { id: 'dxy', name: 'USD 인덱스', assetClass: 'fx', chg: 0.18,
              children: [
                { id: 'EURUSD', name: 'EUR/USD', ticker: true, assetClass: 'fx', chg: -0.22, volume: 2800, mcap: 6200 },
                { id: 'USDJPY', name: 'USD/JPY', ticker: true, assetClass: 'fx', chg: 0.44, volume: 2400, mcap: 5100 },
                { id: 'GBPUSD', name: 'GBP/USD', ticker: true, assetClass: 'fx', chg: -0.08, volume: 1200, mcap: 2800 },
                { id: 'USDKRW', name: 'USD/KRW', ticker: true, assetClass: 'fx', chg: 0.31, volume: 880, mcap: 1400 },
                { id: 'USDCNH', name: 'USD/CNH', ticker: true, assetClass: 'fx', chg: 0.12, volume: 740, mcap: 1800 },
              ]
            },
          ]
        },
        // ────────────── 크립토 ──────────────
        { id: 'crypto', name: '크립토(대체)', assetClass: 'crypto',
          children: [
            { id: 'btc_seg', name: 'BTC 생태계', assetClass: 'crypto', chg: 1.88,
              children: [
                { id: 'BTC', name: 'BTC', ticker: true, assetClass: 'crypto', chg: 1.94, volume: 4200, mcap: 13000 },
                { id: 'MSTR', name: 'MSTR', ticker: true, assetClass: 'crypto', chg: 3.44, volume: 1800, mcap: 1400 },
                { id: 'IBIT', name: 'IBIT ETF', ticker: true, assetClass: 'crypto', chg: 1.78, volume: 1400, mcap: 2200 },
              ]
            },
            { id: 'eth_seg', name: 'ETH 생태계', assetClass: 'crypto', chg: 2.44,
              children: [
                { id: 'ETH', name: 'ETH', ticker: true, assetClass: 'crypto', chg: 2.55, volume: 2800, mcap: 5800 },
                { id: 'LDO', name: 'Lido (LDO)', ticker: true, assetClass: 'crypto', chg: 3.88, volume: 620, mcap: 420 },
                { id: 'AAVE', name: 'Aave', ticker: true, assetClass: 'crypto', chg: 2.11, volume: 480, mcap: 280 },
              ]
            },
            { id: 'alt_seg', name: '알트코인', assetClass: 'crypto', chg: 1.22,
              children: [
                { id: 'SOL', name: 'Solana', ticker: true, assetClass: 'crypto', chg: 2.88, volume: 1900, mcap: 2800 },
                { id: 'BNB', name: 'BNB', ticker: true, assetClass: 'crypto', chg: 0.88, volume: 1100, mcap: 1400 },
                { id: 'XRP', name: 'XRP', ticker: true, assetClass: 'crypto', chg: 1.44, volume: 1400, mcap: 2200 },
                { id: 'RGTI', name: 'RGTI', ticker: true, assetClass: 'crypto', chg: 4.88, volume: 820, mcap: 280 },
                { id: 'DOGE', name: 'DOGE', ticker: true, assetClass: 'crypto', chg: 0.44, volume: 680, mcap: 440 },
              ]
            },
          ]
        },
      ]
    };

    // ── 상태 ──
    const TM_STATE = {
      chart: null,
      resizeObs: null,
      metric: 'volume',       // 'volume' | 'mcap'
      enabledAssets: new Set(['equity','bond','commodity','fx','crypto']),
      searchKw: '',
      path: [],               // 드릴다운 경로 [{id, name}, ...]
      currentData: null,      // 현재 렌더링 중인 데이터 노드
      locked: false,          // 애니메이션 락
      lockTimer: null,
    };

    // ── 노드를 path로부터 찾기 ──
    function tmFindNode(root, idArr) {
      if (!idArr || idArr.length === 0) return root;
      let node = root;
      for (const id of idArr) {
        const found = (node.children || []).find(c => c.id === id);
        if (!found) return node;
        node = found;
      }
      return node;
    }

    // ── 자산군 필터 적용 후 현재 뷰 데이터 생성 ──
    function tmGetCurrentNode() {
      const node = tmFindNode(TM_DATA, TM_STATE.path);
      return node;
    }

    // ── ECharts 옵션 생성 ──
    function tmBuildOption(node) {
      const metric = TM_STATE.metric;
      const enabled = TM_STATE.enabledAssets;

      // 자식 필터링 (depth1만 자산군 필터 적용)
      let children = node.children || [];
      if (node.id === 'root') {
        children = children.filter(c => enabled.has(c.assetClass));
      }

      // 색상 맵 per assetClass (레이블용 테두리색)
      const assetColors = {
        equity:'#3FB950', bond:'#58A6FF', commodity:'#F0C050',
        fx:'#CE93D8', crypto:'#F78166',
      };

      // 재귀 변환
      function toENode(n) {
        const val = metric === 'volume' ? (n.volume || 0) : (n.mcap || 0);
        // 자식 합산 (섹터/클래스 레벨)
        const kids = (n.children || []).map(toENode);
        const computedVal = kids.length > 0
          ? kids.reduce((s, k) => s + (k.value || 0), 0)
          : val;
        const chgPct = n.chg || 0;
        const bgColor = tmLerpColor(chgPct / 3); // ±3%가 풀스케일
        const isHighlighted = TM_STATE.searchKw && n.name.toLowerCase().includes(TM_STATE.searchKw) ||
                              TM_STATE.searchKw && (n.id || '').toLowerCase().includes(TM_STATE.searchKw);
        return {
          id: n.id,
          name: n.name,
          value: computedVal,
          rawChg: chgPct,
          assetClass: n.assetClass,
          hasChildren: (n.children || []).length > 0,
          itemStyle: {
            color: bgColor,
            borderColor: isHighlighted ? '#FFFF00' : '#000',
            borderWidth: isHighlighted ? 3 : 0.5,
            gapWidth: isHighlighted ? 3 : 1,
            shadowBlur: isHighlighted ? 10 : 0,
            shadowColor: isHighlighted ? '#FFFF00' : 'transparent',
          },
          label: {
            show: computedVal > 0,
            formatter: function(p) {
              const d = p.data;
              const chgStr = (d.rawChg >= 0 ? '+' : '') + (d.rawChg || 0).toFixed(2) + '%';
              return '{name|' + d.name + '}\\n{chg|' + chgStr + '}';
            },
          },
          children: kids,
        };
      }

      const treeData = children.map(toENode);

      return {
        series: [{
          type: 'treemap',
          id: 'tm-series',
          animationDurationUpdate: 600,
          animationEasingUpdate: 'cubicInOut',
          roam: false,
          nodeClick: false,
          data: treeData,
          width: '100%',
          height: '100%',
          top: 0, bottom: 0, left: 0, right: 0,
          squareRatio: 1.4,
          leafDepth: null,
          drillDownIcon: '',
          levels: [
            {
              itemStyle: { borderColor: '#000', borderWidth: 2, gapWidth: 2 },
              upperLabel: { show: false },
            },
            {
              itemStyle: { borderColor: '#000', borderWidth: 1, gapWidth: 1 },
              emphasis: { itemStyle: { borderColor: '#58A6FF', borderWidth: 2 } },
            },
            {
              itemStyle: { borderColor: '#000', borderWidth: 0.5, gapWidth: 1 },
            },
          ],
          label: {
            show: true,
            position: 'inside',
            align: 'center',
            verticalAlign: 'middle',
            overflow: 'truncate',
            rich: {
              name: {
                fontSize: 11,
                fontFamily: 'Inter, sans-serif',
                color: 'rgba(230,237,243,0.9)',
                fontWeight: '700',
                lineHeight: 14,
              },
              chg: {
                fontSize: 9,
                fontFamily: 'JetBrains Mono, monospace',
                color: 'rgba(230,237,243,0.65)',
                lineHeight: 12,
              },
            },
          },
          upperLabel: { show: false },
          breadcrumb: { show: false },
          tooltip: { show: false },
        }],
        tooltip: {
          show: true,
          trigger: 'item',
          backgroundColor: 'rgba(13,17,23,0.95)',
          borderColor: '#1E2738',
          borderWidth: 1,
          padding: [6, 10],
          textStyle: { color: '#E6EDF3', fontSize: 11, fontFamily: 'Inter, sans-serif' },
          formatter: function(p) {
            if (!p.data) return '';
            const d = p.data;
            const chg = d.rawChg || 0;
            const chgStr = (chg >= 0 ? '<span style="color:#3FB950">+' : '<span style="color:#F85149">') + chg.toFixed(2) + '%</span>';
            const valStr = (TM_STATE.metric === 'volume'
              ? '$' + (d.value/1000).toFixed(1) + 'B 거래대금'
              : '$' + (d.value/1000).toFixed(1) + 'T 시가총액');
            return '<div style="font-weight:700;font-size:12px;margin-bottom:3px">' + d.name + '</div>' +
                   '<div style="font-size:11px;color:#8B949E">당일 등락률: ' + chgStr + '</div>' +
                   '<div style="font-size:10px;color:#3D4452;margin-top:2px">' + valStr + '</div>' +
                   (d.hasChildren ? '<div style="font-size:9px;color:#3D4452;margin-top:3px">↓ 휠 다운으로 상세 보기</div>' : '');
          },
        },
        backgroundColor: '#000',
      };
    }

    // ── ECharts 초기화 ──
    function initTM() {
      const el = document.getElementById('tm-echarts');
      if (!el || TM_STATE.chart) return;
      if (typeof echarts === 'undefined') return;

      TM_STATE.chart = echarts.init(el, null, { renderer: 'canvas', useDirtyRect: true });
      TM_STATE.currentData = TM_DATA;
      tmRender();
      tmSetupWheel();

      // ResizeObserver
      if (TM_STATE.resizeObs) TM_STATE.resizeObs.disconnect();
      TM_STATE.resizeObs = new ResizeObserver(() => tmHandleResize());
      TM_STATE.resizeObs.observe(el);
    }

    function tmHandleResize() {
      if (TM_STATE.chart) TM_STATE.chart.resize();
    }

    // ── 현재 뷰 렌더 ──
    function tmRender() {
      if (!TM_STATE.chart) return;
      const node = tmGetCurrentNode();
      TM_STATE.currentData = node;
      const opt = tmBuildOption(node);
      TM_STATE.chart.setOption(opt, true);
      tmUpdateBreadcrumb();
      tmUpdateDepthBadge();
    }

    // ── 브레드크럼 업데이트 ──
    function tmUpdateBreadcrumb() {
      const el = document.getElementById('tm-breadcrumb');
      if (!el) return;
      const items = [{ id: -1, name: '전체자산시장' }];
      TM_STATE.path.forEach((id, i) => {
        const pathSoFar = TM_STATE.path.slice(0, i + 1);
        const node = tmFindNode(TM_DATA, pathSoFar);
        items.push({ id: i, name: node.name });
      });
      el.innerHTML = items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (i > 0 ? '<span class="tm-bc-sep">›</span>' : '') +
          '<span class="tm-bc-item' + (isLast ? ' active' : '') + '" ' +
          'onclick="tmNavTo(' + (item.id) + ')">' + item.name + '</span>';
      }).join('');
    }

    // ── DEPTH 배지 업데이트 ──
    function tmUpdateDepthBadge() {
      const el = document.getElementById('tm-depth-num');
      if (el) el.textContent = TM_STATE.path.length + 1;
    }

    // ── 브레드크럼 클릭으로 네비게이션 ──
    function tmNavTo(depthIdx) {
      if (depthIdx < 0) {
        TM_STATE.path = [];
      } else {
        TM_STATE.path = TM_STATE.path.slice(0, depthIdx + 1);
      }
      tmRender();
    }

    // ── 드릴다운 (휠다운) ──
    function tmDrillDown(nodeId) {
      if (TM_STATE.locked) return;
      const nextPath = [...TM_STATE.path, nodeId];
      const node = tmFindNode(TM_DATA, nextPath);
      if (!node || !node.children || node.children.length === 0) {
        // 리프: bounce 피드백
        tmBounceNode(nodeId);
        return;
      }
      TM_STATE.locked = true;
      TM_STATE.path = nextPath;
      tmRender();
      clearTimeout(TM_STATE.lockTimer);
      TM_STATE.lockTimer = setTimeout(() => { TM_STATE.locked = false; }, 700);
    }

    // ── 드릴업 (휠업) ──
    function tmDrillUp() {
      if (TM_STATE.locked) return;
      if (TM_STATE.path.length === 0) return; // 이미 루트
      TM_STATE.locked = true;
      TM_STATE.path.pop();
      tmRender();
      clearTimeout(TM_STATE.lockTimer);
      TM_STATE.lockTimer = setTimeout(() => { TM_STATE.locked = false; }, 700);
    }

    // ── 리프 노드 bounce 피드백 ──
    function tmBounceNode(nodeId) {
      const container = document.getElementById('tm-echarts');
      if (!container) return;
      container.classList.remove('tm-bounce');
      void container.offsetWidth;
      container.classList.add('tm-bounce');
      setTimeout(() => container.classList.remove('tm-bounce'), 400);
    }

    // ── 마우스 위치 기반 노드 찾기 ──
    function tmGetNodeUnderCursor(e) {
      if (!TM_STATE.chart) return null;
      const pt = TM_STATE.chart.convertFromPixel('series', [e.offsetX, e.offsetY]);
      return null; // ECharts doesn't expose this directly; use ZRender event instead
    }

    // ── 휠 이벤트 세팅 ──
    function tmSetupWheel() {
      const container = document.getElementById('tm-canvas-wrap');
      if (!container) return;

      let _hoveredNodeId = null;
      let _lastWheelTime = 0;
      const THROTTLE_MS = 400;

      // ZRender mousemove로 hovering 노드 추적
      if (TM_STATE.chart) {
        TM_STATE.chart.on('mouseover', function(params) {
          if (params.data) _hoveredNodeId = params.data.id;
        });
        TM_STATE.chart.on('mouseout', function() {
          _hoveredNodeId = null;
        });
      }

      container.addEventListener('wheel', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const now = Date.now();
        if (now - _lastWheelTime < THROTTLE_MS) return;
        _lastWheelTime = now;

        if (e.deltaY > 0) {
          // Scroll Down → Drill-In
          if (_hoveredNodeId) {
            tmDrillDown(_hoveredNodeId);
          }
        } else {
          // Scroll Up → Drill-Out
          tmDrillUp();
        }
      }, { passive: false });
    }

    // ── 메트릭 변경 ──
    function tmSetMetric(val) {
      TM_STATE.metric = val;
      tmRender();
    }

    // ── 자산군 필터 변경 ──
    function tmFilterChanged() {
      const cbs = document.querySelectorAll('.tm-asset-cb');
      TM_STATE.enabledAssets.clear();
      cbs.forEach(cb => { if (cb.checked) TM_STATE.enabledAssets.add(cb.value); });
      // 현재 path가 필터된 자산군이면 루트로 복귀
      if (TM_STATE.path.length > 0) {
        const topNode = TM_DATA.children.find(c => c.id === TM_STATE.path[0]);
        if (topNode && !TM_STATE.enabledAssets.has(topNode.assetClass)) {
          TM_STATE.path = [];
        }
      }
      tmRender();
    }

    // ── 검색 하이라이팅 ──
    function tmOnSearch(val) {
      TM_STATE.searchKw = val.trim().toLowerCase();
      tmRender();
    }

    // ── 사이드바 토글 ──
    function tmToggleSidebar() {
      const sb = document.getElementById('tm-sidebar');
      if (!sb) return;
      sb.classList.toggle('collapsed');
      setTimeout(() => tmHandleResize(), 220);
    }

    // ══════════════════════════════════════════════
    // IIT — 이슈-인사이트 스레드 JS
    // ══════════════════════════════════════════════

    // ── 데이터 ──
    const IIT_DATA = [
      {
        id: 'i1', date: 'TODAY', time: '10:22', urgency: 'high',
        type: 'alert', typeLabel: 'ALERT',
        headline: 'Fed RRP 잔고 급감 & TGA 재구축 본격화 — 단기 유동성 드레인 신호',
        tags: ['TGA','RRP','SOFR','유동성'],
        pfClass: 'pf-negative',
        clusters: [
          {
            label: '맥락 클러스터: 유동성 축소가 고베타 자산에 미치는 영향',
            insights: [
              { time:'+2h',  src:'Substack',    srcClass:'iit-src-substack', rawdata:'FED 대차대조표',
                headline:'"TGA 재구축이 촉발할 단기 자금시장 경색 시나리오"',
                summary:'단기 자금 시장 경색 우려. <strong>SOFR 금리 발작 가능성</strong> 내포. 잉여 준비금 감소 속도 예상치 상회.' },
              { time:'+5h',  src:'X/매크로계정', srcClass:'iit-src-x', rawdata:'RRP 잔고 일별 데이터',
                headline:'"RRP 고갈 시점과 증시 조정 상관도 — 과거 3회 비교"',
                summary:'과거 사례 비교 차트 첨부. <strong>잉여 유동성 한계점</strong> 도달 임박. 2019년 레포 사태와 구조적 유사.' },
              { time:'+12h', src:'Seeking Alpha', srcClass:'iit-src-seeking', rawdata:'',
                headline:'"유동성 드레인 시기의 헷징 전략 — 방어적 옵션 롤오버"',
                summary:'고베타(양자, AI) 포지션 축소 권고. <strong>방어적 옵션 롤오버</strong> 전략 제시. SPX 풋 스프레드 비용 분석 포함.' },
            ]
          }
        ]
      },
      {
        id: 'i2', date: 'TODAY', time: '08:47', urgency: 'high',
        type: 'issue', typeLabel: 'ISSUE',
        headline: 'FOMC 회의록 — "더 높은 기간 프리미엄 용인" 발언 재확인, 장기금리 상방 압력',
        tags: ['FOMC','TLT','금리','인플레이션'],
        pfClass: 'pf-negative',
        clusters: [
          {
            label: '맥락 클러스터: 기간 프리미엄 확대가 채권/주식에 미치는 영향',
            insights: [
              { time:'+1h',  src:'Bloomberg',   srcClass:'iit-src-bloomberg', rawdata:'FOMC Minutes PDF',
                headline:'"회의록 전문 분석 — 매파 기조 지속 5개 핵심 문장"',
                summary:'고용 시장 탄력성 재확인. <strong>인플레이션 목표 달성 자신감 하락</strong>. 연내 2회 인하 컨센서스 흔들림.' },
              { time:'+3h',  src:'Substack',    srcClass:'iit-src-substack', rawdata:'ACM 기간프리미엄 지수',
                headline:'"ACM 기간 프리미엄 +48bp 돌파 — TLT 추가 하락 여지"',
                summary:'ACM 모델 기준 <strong>10년물 적정금리 4.8%~5.1%</strong> 밴드 진입. TLT 포지션 비중 축소 권고.' },
            ]
          }
        ]
      },
      {
        id: 'i3', date: 'TODAY', time: '07:15', urgency: 'medium',
        type: 'insight', typeLabel: 'INSIGHT',
        headline: 'AI 인프라 섹터 랠리 — NVDA 옵션 내재변동성 급등, 고베타 양자컴퓨팅 동반 과열',
        tags: ['AI인프라','양자컴퓨팅','RGTI','IonQ'],
        pfClass: 'pf-positive',
        clusters: [
          {
            label: '맥락 클러스터: AI 인프라 수요 구조 vs. 밸류에이션 리스크',
            insights: [
              { time:'+2h',  src:'X/반도체계정', srcClass:'iit-src-x', rawdata:'NVDA 옵션체인',
                headline:'"NVDA IV Rank 89% — 단기 평균회귀 가능성"',
                summary:'IV Rank 과거 80% 초과 시점 이후 <strong>2주 내 조정 확률 68%</strong>. 콜 스프레드 매도 전략 유효.' },
              { time:'+6h',  src:'Seeking Alpha', srcClass:'iit-src-seeking', rawdata:'',
                headline:'"양자컴퓨팅 ETF — 기초자산 대비 300% 프리미엄 구조 경고"',
                summary:'RGTI, IonQ 등 소형 양자주 <strong>실적 기반 없는 내러티브 드리븐 랠리</strong>. 테마 ETF 유입 자금 분석 첨부.' },
            ]
          }
        ]
      },
      {
        id: 'i4', date: 'YESTERDAY', time: '18:30', urgency: 'medium',
        type: 'issue', typeLabel: 'ISSUE',
        headline: 'OPEC+ 자발적 감산 9월 연장 합의 — WTI $80~$85 박스권 지지, 에너지 섹터 상방 리스크',
        tags: ['에너지','WTI','OPEC','인플레이션'],
        pfClass: 'pf-neutral',
        clusters: [
          {
            label: '맥락 클러스터: 유가 안정이 인플레이션·연준 경로에 미치는 영향',
            insights: [
              { time:'+4h',  src:'Bloomberg', srcClass:'iit-src-bloomberg', rawdata:'EIA 주간 재고 데이터',
                headline:'"감산 연장 — 에너지 섹터 XLE 추가 매수 vs. 헷지 판단"',
                summary:'에너지 섹터 <strong>FCF 수익률 8.2%</strong>로 밸류에이션 매력. 단, 달러 강세 구간에서 상승 제한적.' },
            ]
          }
        ]
      },
      {
        id: 'i5', date: 'YESTERDAY', time: '14:10', urgency: 'low',
        type: 'insight', typeLabel: 'INSIGHT',
        headline: '버크셔해서웨이 13F — AAPL 추가 13% 매도, 현금 $189B 신기록 / CVX 신규 편입',
        tags: ['SPX','BTC','방어주','Substack'],
        pfClass: 'pf-neutral',
        clusters: [
          {
            label: '맥락 클러스터: 버핏 현금 축적의 시장 해석',
            insights: [
              { time:'+1h',  src:'X/가치투자', srcClass:'iit-src-x', rawdata:'버크셔 13F SEC 공시',
                headline:'"현금 $189B — 1987년 이후 최고치, 기회 부재인가 리스크 관리인가"',
                summary:'역사적으로 버핏 현금 비중 <strong>20% 초과 시 이후 12개월 수익률 평균 +18.4%</strong>. 저가 매수 기회 탐색 국면.' },
              { time:'+5h',  src:'Substack', srcClass:'iit-src-substack', rawdata:'',
                headline:'"CVX 편입 의미 — 에너지 섹터 재평가 vs. 인플레이션 헷지"',
                summary:'CVX 편입은 <strong>실물 자산 헷지 포지션</strong> 강화 신호. 장기 인플레이션 구조 변화에 대한 버핏식 배팅 해석.' },
            ]
          }
        ]
      },
      {
        id: 'i6', date: '2일 전', time: '11:05', urgency: 'low',
        type: 'issue', typeLabel: 'ISSUE',
        headline: 'DRAM·NAND 가격 반등 MoM +8% — HBM3E 공급 병목 심화, SK하이닉스·삼성 집중',
        tags: ['AI인프라','반도체','SPX'],
        pfClass: 'pf-positive',
        clusters: [
          {
            label: '맥락 클러스터: HBM 공급망 병목과 수혜 기업',
            insights: [
              { time:'+3h',  src:'Bloomberg', srcClass:'iit-src-bloomberg', rawdata:'DRAMeXchange 가격 데이터',
                headline:'"HBM3E 12단 수율 문제 — NVDA GB200 납기 지연 가능성"',
                summary:'SK하이닉스 <strong>HBM3E 단독 공급자 지위</strong> 유지. 삼성 수율 개선 2025 Q1 이전 어려울 전망.' },
            ]
          }
        ]
      },
      {
        id: 'i7', date: '2일 전', time: '09:30', urgency: 'medium',
        type: 'alert', typeLabel: 'ALERT',
        headline: 'BTC 현물 ETF 일일 순유입 $892M 신기록 — 기관 수요 급증, 온체인 공급 압박',
        tags: ['BTC','Crypto','기관투자자'],
        pfClass: 'pf-positive',
        clusters: [
          {
            label: '맥락 클러스터: BTC ETF 수요 vs. 마이너 공급 동학',
            insights: [
              { time:'+2h',  src:'X/크립토', srcClass:'iit-src-x', rawdata:'ETF 플로우 데이터',
                headline:'"IBIT 단독 $612M 유입 — 골드 ETF GLD 대체 수요 가속화"',
                summary:'기관 포트폴리오 내 <strong>금 대체 자산으로서 BTC</strong> 수요 구조적 증가. 60/40 포트에 1~3% 편입 사례 급증.' },
              { time:'+8h',  src:'Substack', srcClass:'iit-src-substack', rawdata:'온체인 UTXO 데이터',
                headline:'"반감기 후 마이너 매도 압력 — 단기 조정 시 $58K 지지선 테스트"',
                summary:'반감기 후 <strong>마이너 수익성 BEP $52K~$56K</strong>. 현물 ETF 수요가 매도 흡수 여부가 관건.' },
            ]
          }
        ]
      },
    ];

    // ── 상태 ──
    let iitPfMode = false;
    let iitSearchKw = '';
    let iitActiveTags = new Set();
    let iitPresetMode = 'all';
    let iitSortMode = 'time';
    let iitOpenIds = new Set();

    // ── 초기화 ──
    function initIIT() {
      iitRender();
    }

    // ── 필터링 ──
    function iitGetFiltered() {
      let items = IIT_DATA;
      // 프리셋
      if (iitPresetMode === 'macro')  items = items.filter(d => d.tags.some(t => ['TGA','RRP','SOFR','FOMC','인플레이션','금리'].includes(t)));
      if (iitPresetMode === 'sector') items = items.filter(d => d.tags.some(t => ['AI인프라','양자컴퓨팅','에너지','반도체','방어주'].includes(t)));
      if (iitPresetMode === 'pf')     items = items.filter(d => d.pfClass !== 'pf-neutral');
      // 체크박스 태그
      if (iitActiveTags.size > 0) {
        items = items.filter(d => [...iitActiveTags].every(t => d.tags.includes(t)));
      }
      // 검색어
      if (iitSearchKw) {
        const kw = iitSearchKw.toLowerCase();
        items = items.filter(d =>
          d.headline.toLowerCase().includes(kw) ||
          d.tags.some(t => t.toLowerCase().includes(kw))
        );
      }
      return items;
    }

    // ── 렌더 ──
    function iitRender() {
      const tl = document.getElementById('iit-timeline');
      if (!tl) return;
      const items = iitGetFiltered();
      document.getElementById('iit-result-cnt').textContent = \`전체 \${items.length}개 이슈\`;
      if (!items.length) {
        tl.innerHTML = \`<div class="iit-empty"><i class="fas fa-filter"></i><span class="iit-empty-msg">조건에 맞는 이슈가 없습니다</span></div>\`;
        return;
      }
      // 날짜 그룹핑
      const groups = {};
      items.forEach(d => { (groups[d.date] = groups[d.date] || []).push(d); });
      tl.innerHTML = Object.entries(groups).map(([date, list]) => \`
        <div class="iit-date-divider">
          <div class="iit-date-line"></div>
          <div class="iit-date-label">\${date}</div>
          <div class="iit-date-line"></div>
        </div>
        \${list.map(d => iitRenderIssue(d)).join('')}
      \`).join('');
    }

    function iitRenderIssue(d) {
      const pfStyle = iitPfMode ? d.pfClass : '';
      const isOpen = iitOpenIds.has(d.id);
      const totalInsights = d.clusters.reduce((s,c) => s + c.insights.length, 0);
      return \`
        <div class="iit-issue \${pfStyle}" id="issue-\${d.id}">
          <div class="iit-issue-hdr" onclick="iitToggleThread('\${d.id}')">
            <div class="iit-issue-meta">
              <div class="iit-urgency \${d.urgency}"></div>
              <span class="iit-issue-time">\${d.time}</span>
              <span class="iit-issue-type iit-type-\${d.type}">\${d.typeLabel}</span>
            </div>
            <div class="iit-issue-headline">\${d.headline}</div>
            <div class="iit-tag-row">\${d.tags.map(t => \`<span class="iit-tag \${iitActiveTags.has(t)?'active':''}" onclick="iitTagClick(event,'\${t}')">#\${t}</span>\`).join('')}</div>
          </div>
          <div class="iit-expand-row" onclick="iitToggleThread('\${d.id}')">
            <button class="iit-expand-btn \${isOpen?'open':''}" id="expbtn-\${d.id}">
              <i class="fas fa-layer-group"></i>
              \${totalInsights}개의 맥락 분석 보기
              <span class="iit-expand-arrow">▾</span>
            </button>
          </div>
          <div class="iit-thread \${isOpen?'open':''}" id="thread-\${d.id}">
            \${d.clusters.map(c => iitRenderCluster(c)).join('')}
          </div>
        </div>
      \`;
    }

    function iitRenderCluster(c) {
      return \`
        <div class="iit-cluster">
          <div class="iit-cluster-hdr"><i class="fas fa-project-diagram"></i>\${c.label}</div>
          \${c.insights.map(ins => iitRenderInsight(ins)).join('')}
        </div>
      \`;
    }

    function iitRenderInsight(ins) {
      const rawBadge = ins.rawdata
        ? \`<span class="iit-rawdata-badge" title="원자료 확인"><i class="fas fa-database"></i> \${ins.rawdata}</span>\`
        : '';
      return \`
        <div class="iit-insight-item">
          <div class="iit-tree-line"><div class="iit-tree-dot"></div><div class="iit-tree-stem"></div></div>
          <div class="iit-insight-body">
            <div class="iit-insight-meta">
              <span class="iit-insight-time">\${ins.time}</span>
              <span class="iit-insight-src \${ins.srcClass}">\${ins.src}</span>
              \${rawBadge}
            </div>
            <div class="iit-insight-headline">\${ins.headline}</div>
            <div class="iit-insight-summary">💡 \${ins.summary}</div>
          </div>
        </div>
      \`;
    }

    // ── 인터랙션 ──
    function iitToggleThread(id) {
      if (iitOpenIds.has(id)) iitOpenIds.delete(id);
      else iitOpenIds.add(id);
      iitRender();
      // 스크롤 유지
      requestAnimationFrame(() => {
        const el = document.getElementById('issue-' + id);
        if (el) el.scrollIntoView({ behavior:'smooth', block:'nearest' });
      });
    }

    function iitToggleSidebar() {
      const sb = document.getElementById('iit-sidebar');
      if (sb) sb.classList.toggle('collapsed');
    }

    function iitTogglePf(el) {
      iitPfMode = !iitPfMode;
      const sw = document.getElementById('iit-pf-switch');
      if (sw) sw.classList.toggle('on', iitPfMode);
      iitRender();
    }

    function iitFilter() {
      iitSearchKw = document.getElementById('iit-search')?.value || '';
      iitActiveTags = new Set(
        [...document.querySelectorAll('.iit-cb:checked')].map(cb => cb.dataset.tag)
      );
      iitRender();
    }

    function iitResetAll() {
      document.querySelectorAll('.iit-cb').forEach(cb => cb.checked = false);
      const inp = document.getElementById('iit-search');
      if (inp) inp.value = '';
      iitSearchKw = '';
      iitActiveTags = new Set();
      iitPresetMode = 'all';
      document.querySelectorAll('.iit-preset-btn').forEach((b,i) => b.classList.toggle('active', i===0));
      iitRender();
    }

    function iitTagClick(e, tag) {
      e.stopPropagation();
      if (iitActiveTags.has(tag)) iitActiveTags.delete(tag);
      else iitActiveTags.add(tag);
      // 체크박스 동기화
      document.querySelectorAll(\`.iit-cb[data-tag="\${tag}"]\`).forEach(cb => cb.checked = iitActiveTags.has(tag));
      iitRender();
    }

    function iitPreset(btn, mode) {
      iitPresetMode = mode;
      document.querySelectorAll('.iit-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      iitRender();
    }

    function iitSort(btn, mode) {
      iitSortMode = mode;
      document.querySelectorAll('.iit-sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    // ── PANEL SLOT SYSTEM ──
    function onSlotClick(slotId) {
      // 슬롯 클릭 시 토스트 알림 (향후 패널 연결 예정)
      const slot = document.getElementById('slot-' + slotId);
      if (!slot) return;
      // 잠깐 하이라이트 효과
      slot.style.transition = 'background 0.12s';
      slot.style.background = 'rgba(88,166,255,0.08)';
      setTimeout(() => { slot.style.background = ''; }, 400);
      // 현재는 안내 알림만 표시
      showSlotToast(slotId);
    }

    function showSlotToast(slotId) {
      // 기존 토스트 제거
      const prev = document.getElementById('slot-toast');
      if (prev) prev.remove();
      const toast = document.createElement('div');
      toast.id = 'slot-toast';
      toast.style.cssText = \`
        position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
        background: #161b22; border: 1px solid rgba(88,166,255,0.35);
        color: #e6edf3; font-family: 'JetBrains Mono', monospace;
        font-size: 11px; padding: 8px 18px; border-radius: 6px;
        z-index: 9999; pointer-events: none;
        box-shadow: 0 0 16px rgba(88,166,255,0.15);
        animation: toastFadeIn 0.2s ease;
      \`;
      toast.innerHTML = \`<i class="fas fa-info-circle" style="color:#58A6FF;margin-right:7px;"></i>SLOT · \${slotId} — 패널 요청서를 전달해 주시면 조립하겠습니다.\`;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.transition = 'opacity 0.3s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 350);
      }, 2800);
    }

    function buildNewsFeed() {
      const el = document.getElementById('news-feed-list');
      if (!el) return;
      el.innerHTML = NEWS_FEED.map(n => \`
        <div class="news-item">
          <div class="news-item-meta">
            <span class="news-time">\${n.time}</span>
            <span class="news-badge \${n.badge}">\${n.badgeText}</span>
          </div>
          <div class="news-headline">\${n.headline}</div>
          <div class="news-sub">\${n.sub}</div>
        </div>
      \`).join('');
    }

    // ── CORRELATION HEATMAP (small) ──
    function buildDbCorrHeatmap() {
      const el = document.getElementById('db-corr-heatmap');
      if (!el) return;
      const ASSETS6 = ['SPX','TLT','GLD','BTC','DXY','WTI'];
      const M6 = [
        [ 1.00, -0.62,  0.14,  0.41, -0.52,  0.28],
        [-0.62,  1.00, -0.05, -0.18,  0.34, -0.21],
        [ 0.14, -0.05,  1.00,  0.22, -0.67,  0.41],
        [ 0.41, -0.18,  0.22,  1.00, -0.21,  0.18],
        [-0.52,  0.34, -0.67, -0.21,  1.00, -0.38],
        [ 0.28, -0.21,  0.41,  0.18, -0.38,  1.00],
      ];
      const n = ASSETS6.length;
      const cellPx = Math.floor((el.offsetWidth - 28) / (n + 1)) || 24;
      const headerPx = 24;
      const grid = document.createElement('div');
      grid.style.cssText = \`display:grid;grid-template-columns:\${headerPx}px \${Array(n).fill(cellPx+'px').join(' ')};grid-template-rows:\${headerPx}px \${Array(n).fill(cellPx+'px').join(' ')};gap:1px;\`;

      // corner
      grid.appendChild(Object.assign(document.createElement('div'), {}));
      // col headers
      ASSETS6.forEach(a => {
        const h = document.createElement('div');
        h.style.cssText = 'display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:600;color:var(--text-muted);font-family:JetBrains Mono,monospace;';
        h.textContent = a;
        grid.appendChild(h);
      });
      // rows
      for (let i = 0; i < n; i++) {
        const rl = document.createElement('div');
        rl.style.cssText = 'display:flex;align-items:center;font-size:8px;font-weight:600;color:var(--text-muted);font-family:JetBrains Mono,monospace;';
        rl.textContent = ASSETS6[i];
        grid.appendChild(rl);
        for (let j = 0; j < n; j++) {
          const val = M6[i][j];
          const { bg } = corrToColor(val);
          const cell = document.createElement('div');
          cell.style.cssText = \`background:\${bg};border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:7px;font-family:JetBrains Mono,monospace;color:rgba(230,237,243,0.8);cursor:pointer;\`;
          cell.title = \`\${ASSETS6[i]}×\${ASSETS6[j]}: \${val.toFixed(2)}\`;
          cell.textContent = i === j ? '—' : val.toFixed(2);
          grid.appendChild(cell);
        }
      }
      el.appendChild(grid);
    }

    // ── MACRO SCOREBOARD ──
    const MACRO_TABS = {
      fx: [
        { sym:'USD/KRW', val:'1,381', chg:'+0.12%', pos:true  },
        { sym:'USD/JPY', val:'154.2', chg:'+0.08%', pos:true  },
        { sym:'EUR/USD', val:'1.074', chg:'-0.11%', pos:false },
        { sym:'GBP/USD', val:'1.264', chg:'-0.04%', pos:false },
        { sym:'AUD/USD', val:'0.653', chg:'+0.18%', pos:true  },
        { sym:'USD/CNY', val:'7.246', chg:'+0.06%', pos:true  },
        { sym:'DXY',     val:'104.4', chg:'-0.18%', pos:false },
      ],
      idx: [
        { sym:'S&P 500', val:'5,421', chg:'+0.43%', pos:true  },
        { sym:'NASDAQ',  val:'19,284',chg:'+0.71%', pos:true  },
        { sym:'Dow',     val:'38,742',chg:'+0.22%', pos:true  },
        { sym:'KOSPI',   val:'2,782', chg:'-0.31%', pos:false },
        { sym:'Nikkei',  val:'38,712',chg:'+0.54%', pos:true  },
        { sym:'DAX',     val:'18,142',chg:'+0.33%', pos:true  },
        { sym:'FTSE',    val:'8,214', chg:'-0.08%', pos:false },
      ],
      cmdty: [
        { sym:'WTI',  val:'82.16', chg:'+0.57%', pos:true  },
        { sym:'BRENT',val:'86.42', chg:'+0.48%', pos:true  },
        { sym:'GOLD', val:'2,384', chg:'+0.29%', pos:true  },
        { sym:'SILV', val:'28.14', chg:'+0.44%', pos:true  },
        { sym:'NATG', val:'2.84',  chg:'-1.21%', pos:false },
        { sym:'COPR', val:'4.61',  chg:'+0.32%', pos:true  },
        { sym:'CORN', val:'448',   chg:'-0.54%', pos:false },
      ],
    };

    function setMacroTab(btn, tab) {
      document.querySelectorAll('.db-panel-acts .db-mini-btn').forEach(b => {
        if (['환율','지수','원자재'].includes(b.textContent)) b.classList.remove('active');
      });
      btn.classList.add('active');
      buildMacroBoard(tab);
    }

    function buildMacroBoard(tab) {
      const el = document.getElementById('macro-board-list');
      if (!el) return;
      const rows = MACRO_TABS[tab] || MACRO_TABS.fx;
      const maxChg = Math.max(...rows.map(r => Math.abs(parseFloat(r.chg))));
      el.innerHTML = rows.map(r => {
        const chgAbs = Math.abs(parseFloat(r.chg));
        const w = Math.round((chgAbs / maxChg) * 100);
        const color = r.pos ? '#3FB950' : '#F85149';
        const cl = r.pos ? 'positive' : 'negative';
        return \`<div class="macro-board-row">
          <span class="mb-sym">\${r.sym}</span>
          <div class="mb-bar-track"><div class="mb-bar-fill" style="width:\${w}%;background:\${color};"></div></div>
          <span class="mb-val \${cl}">\${r.val}</span>
          <span class="mb-chg \${cl}">\${r.chg}</span>
        </div>\`;
      }).join('');
    }

    // ── PORTFOLIO MINI DONUT ──
    let pfMiniChart = null;
    function buildPfMiniDonut() {
      const canvas = document.getElementById('pfMiniDonut');
      if (!canvas) return;
      pfMiniChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [26, 18.6, 12.4, 8.1, 34.9],
            backgroundColor: ['#3B82F6','#22D3EE','#F59E0B','#A78BFA','#6B7280'],
            borderColor: '#12161F', borderWidth: 1.5,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: true, cutout: '70%',
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          animation: false,
        }
      });
    }

    function buildPfMiniTable() {
      const el = document.getElementById('pf-mini-table');
      if (!el) return;
      const rows = [
        { t:'AAPL', w:'14.2%', ret:'+18.4%', d:'+0.92%', pos:true },
        { t:'NVDA', w:'11.8%', ret:'+42.1%', d:'+2.14%', pos:true },
        { t:'TLT',  w:'18.6%', ret:'-8.2%',  d:'+0.31%', pos:false },
        { t:'GLD',  w:'12.4%', ret:'+9.7%',  d:'+0.28%', pos:true },
        { t:'BTC',  w:'8.1%',  ret:'+56.3%', d:'+1.24%', pos:true },
        { t:'CASH', w:'34.9%', ret:'+5.1%',  d:'+0.01%', pos:true },
      ];
      el.innerHTML = rows.map(r => \`
        <div class="pf-mini-row">
          <span class="pf-mini-ticker">\${r.t}</span>
          <span class="pf-mini-wgt">\${r.w}</span>
          <span class="pf-mini-ret \${r.pos?'positive':'negative'}">\${r.ret}</span>
          <span class="pf-mini-1d \${r.pos?'positive':'negative'}">\${r.d}</span>
        </div>
      \`).join('');
    }

    // ── CALENDAR ──
    function buildCalendar() {
      const el = document.getElementById('db-calendar');
      const lbl = document.getElementById('cal-month-label');
      if (!el) return;
      const now = new Date();
      const year = now.getFullYear(), month = now.getMonth();
      if (lbl) lbl.textContent = \`\${year}년 \${month+1}월\`;
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = now.getDate();

      // High-impact event days
      const highDays = new Set([5, 12, 17, 25]);
      const eventDays = new Set([3, 8, 14, 19, 22, 28]);

      const DOW = ['일','월','화','수','목','금','토'];
      let html = '<div class="db-calendar-grid">';
      DOW.forEach(d => { html += \`<div class="cal-dow">\${d}</div>\`; });
      for (let i = 0; i < firstDay; i++) html += '<div></div>';
      for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === today;
        const isHigh  = highDays.has(d);
        const hasEvt  = eventDays.has(d);
        const cls = [
          'cal-day',
          isToday ? 'today' : '',
          isHigh  ? 'has-high' : hasEvt ? 'has-event' : '',
        ].filter(Boolean).join(' ');
        html += \`<div class="\${cls}" title="\${isHigh?'고임팩트 이벤트':hasEvt?'경제지표':''}">\${d}</div>\`;
      }
      html += '</div>';
      el.innerHTML = html;
    }

    // ── EVENT LIST ──
    const EVENTS_DATA = [
      { date:'6/18', title:'FOMC 금리 결정', sub:'25bp 동결 컨센서스 98%', impact:'impact-hi' },
      { date:'6/19', title:'미국 CPI (5월)', sub:'전월比 +0.3% 예상', impact:'impact-hi' },
      { date:'6/20', title:'ECB 통화정책회의', sub:'25bp 추가 인하 예상', impact:'impact-mid' },
      { date:'6/21', title:'미국 소매판매 (5월)', sub:'+0.4% 예상', impact:'impact-mid' },
      { date:'6/25', title:'GDP (1분기 최종)', sub:'+1.3% 확정 예상', impact:'impact-mid' },
      { date:'6/26', title:'Jerome Powell 연설', sub:'반기 의회 증언', impact:'impact-hi' },
      { date:'6/28', title:'PCE 물가지수 (5월)', sub:'핵심 PCE +2.6% 예상', impact:'impact-hi' },
    ];

    function buildEventList() {
      const el = document.getElementById('event-list');
      if (!el) return;
      el.innerHTML = EVENTS_DATA.map(e => \`
        <div class="event-item">
          <span class="event-date-badge">\${e.date}</span>
          <div>
            <div class="event-title">\${e.title}</div>
            <div class="event-sub">\${e.sub}</div>
          </div>
          <span class="event-impact \${e.impact}">\${e.impact.includes('hi')?'HIGH':e.impact.includes('mid')?'MID':'LOW'}</span>
        </div>
      \`).join('');
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
      buildDashboard();    // Main dashboard panels
      initDonutChart();
      initHeatmap();
      initTimelineChart();
      renderIssueCards();  // Initialize issue page
    });

    // Re-build dashboard charts on navigate to dashboard
    const _origNavigate = navigate;
    window._dbBuilt = false;

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
