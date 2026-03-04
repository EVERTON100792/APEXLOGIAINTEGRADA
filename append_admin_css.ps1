# append_admin_css.ps1
$cssPath = 'c:\Users\Everton Moura\Documents\GitHub\APEX-LOG-3.0\css\style.css'

$adminCss = @'

/* ═══════════════════════════════════════════════════════════════════
   APEX COMMAND CENTER — Admin Panel Styles
   Dark terminal aesthetic: #050c1a bg, amber accents, monospace data
═══════════════════════════════════════════════════════════════════ */

/* PIN Modal */
#apex-pin-modal {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(5, 12, 26, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px);
    opacity: 0;
    transition: opacity 0.25s ease;
}
#apex-pin-modal.visible { opacity: 1; }

.acc-pin-card {
    background: #0a1628;
    border: 1px solid #f59e0b;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    width: 320px;
    box-shadow: 0 0 60px rgba(245, 158, 11, 0.2);
}
.acc-pin-logo {
    font-size: 2.5rem;
    color: #f59e0b;
    margin-bottom: 0.5rem;
}
.acc-pin-title {
    font-size: 1rem;
    font-weight: 700;
    color: #f59e0b;
    letter-spacing: 0.15em;
    margin-bottom: 0.25rem;
}
.acc-pin-sub {
    font-size: 0.75rem;
    color: #64748b;
    margin-bottom: 1.5rem;
}
.acc-pin-display {
    font-family: 'Courier New', monospace;
    font-size: 1.5rem;
    letter-spacing: 0.5em;
    color: #f59e0b;
    background: #050c1a;
    border: 1px solid #1e3a5f;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-bottom: 0.75rem;
}
.acc-pin-error {
    color: #ef4444;
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
}
.acc-pin-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}
.acc-pin-btn {
    background: #0f2044;
    border: 1px solid #1e3a5f;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 1.1rem;
    font-weight: 600;
    padding: 0.75rem;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
}
.acc-pin-btn:hover { background: #1e3a5f; border-color: #f59e0b; color: #f59e0b; }
.acc-pin-cancel { color: #ef4444; border-color: #ef4444; }
.acc-pin-cancel:hover { background: rgba(239,68,68,0.15); }
.acc-pin-ok { background: #f59e0b; color: #050c1a; border-color: #f59e0b; font-weight: 700; }
.acc-pin-ok:hover { background: #d97706; }
.acc-pin-back {
    background: none;
    border: none;
    color: #64748b;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0.25rem;
}
.acc-pin-back:hover { color: #94a3b8; }

/* Command Center Main Panel */
#apex-command-center {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(5, 12, 26, 0.97);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    overflow-y: auto;
    padding: 1rem;
    opacity: 0;
    transform: translateY(-20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
}
#apex-command-center.visible { opacity: 1; transform: translateY(0); }

.acc-container {
    width: 100%;
    max-width: 1200px;
    padding-bottom: 2rem;
}

/* ACC Header */
.acc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 0 1rem;
    border-bottom: 1px solid #f59e0b;
    margin-bottom: 1rem;
}
.acc-header-left { display: flex; align-items: center; gap: 1rem; }
.acc-logo-icon { font-size: 2.5rem; color: #f59e0b; }
.acc-title {
    font-size: 1.1rem;
    font-weight: 800;
    color: #f59e0b;
    letter-spacing: 0.12em;
    margin: 0;
}
.acc-subtitle { font-size: 0.75rem; color: #64748b; margin: 0; }
.acc-close-btn {
    background: none;
    border: 1px solid #ef4444;
    border-radius: 8px;
    color: #ef4444;
    font-size: 1rem;
    padding: 0.4rem 0.75rem;
    cursor: pointer;
    transition: background 0.15s ease;
}
.acc-close-btn:hover { background: rgba(239,68,68,0.15); }

/* Alert bar */
.acc-alert {
    border: 1px solid;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    color: #e2e8f0;
    background: rgba(0,0,0,0.4);
}

/* Tabs */
.acc-tabs {
    display: flex;
    gap: 0.25rem;
    border-bottom: 1px solid #1e3a5f;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
}
.acc-tab {
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.625rem 1rem;
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease;
    letter-spacing: 0.04em;
}
.acc-tab:hover { color: #94a3b8; }
.acc-tab.active { color: #f59e0b; border-bottom-color: #f59e0b; }

/* Panes */
.acc-pane { display: none; }
.acc-pane.active { display: block; }

/* Cards */
.acc-card {
    background: #0a1628;
    border: 1px solid #1e3a5f;
    border-radius: 10px;
    padding: 1.25rem;
}
.acc-card-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 1rem 0;
}
.acc-card-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.acc-card-header-row .acc-card-title { margin: 0; }

/* Grid layouts */
.acc-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.acc-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
@media (max-width: 768px) {
    .acc-grid-2, .acc-grid-3 { grid-template-columns: 1fr; }
}
.acc-mt { margin-top: 1rem; }
.acc-mt-sm { margin-top: 0.5rem; }

/* Stat cards */
.acc-stat-card {
    background: #0a1628;
    border: 1px solid #1e3a5f;
    border-radius: 10px;
    padding: 1.5rem;
    text-align: center;
}
.acc-stat-icon { font-size: 1.75rem; margin-bottom: 0.5rem; }
.acc-stat-value { font-size: 1.5rem; font-weight: 700; color: #f59e0b; margin-bottom: 0.25rem; font-family: 'Courier New', monospace; }
.acc-stat-sm { font-size: 0.95rem; }
.acc-stat-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }

/* Forms */
.acc-form-group { margin-bottom: 1rem; }
.acc-label { display: block; font-size: 0.78rem; color: #64748b; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.06em; }
.acc-input {
    width: 100%;
    background: #050c1a;
    border: 1px solid #1e3a5f;
    border-radius: 6px;
    color: #e2e8f0;
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
}
.acc-input:focus { outline: none; border-color: #f59e0b; }
.acc-input-sm {
    background: #050c1a;
    border: 1px solid #1e3a5f;
    border-radius: 4px;
    color: #e2e8f0;
    font-size: 0.8rem;
    padding: 0.3rem 0.5rem;
    width: 80px;
}
.acc-select {
    background: #050c1a;
    border: 1px solid #1e3a5f;
    border-radius: 6px;
    color: #e2e8f0;
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
    appearance: none;
}
.acc-select:focus { outline: none; border-color: #f59e0b; }
.acc-row-inline { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

/* Stat row */
.acc-stat-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 0.875rem; color: #94a3b8; }
.acc-amber { color: #f59e0b; font-family: 'Courier New', monospace; }

/* Buttons */
.acc-btn {
    background: #0f2044;
    border: 1px solid #1e3a5f;
    border-radius: 6px;
    color: #e2e8f0;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.5rem 0.9rem;
    transition: background 0.15s ease, border-color 0.15s ease;
    white-space: nowrap;
}
.acc-btn:hover { background: #1e3a5f; }
.acc-btn-primary { background: #1d4ed8; border-color: #1d4ed8; color: #fff; }
.acc-btn-primary:hover { background: #1e40af; }
.acc-btn-warning { background: #92400e; border-color: #f59e0b; color: #f59e0b; }
.acc-btn-warning:hover { background: rgba(245,158,11,0.15); }
.acc-btn-danger { background: rgba(239,68,68,0.1); border-color: #ef4444; color: #ef4444; }
.acc-btn-danger:hover { background: rgba(239,68,68,0.2); }
.acc-btn-ghost { background: none; border-color: #334155; color: #64748b; }
.acc-btn-ghost:hover { border-color: #94a3b8; color: #94a3b8; }
.acc-btn-sm { font-size: 0.75rem; padding: 0.35rem 0.6rem; }

/* Danger zone */
.acc-danger-zone {
    background: rgba(239,68,68,0.05);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-top: 1rem;
}
.acc-danger-label { font-size: 0.7rem; text-transform: uppercase; color: #ef4444; letter-spacing: 0.1em; margin: 0 0 0.5rem 0; font-weight: 700; }

/* Table */
.acc-table-scroll { overflow-x: auto; }
.acc-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.acc-table th {
    background: #050c1a;
    border-bottom: 1px solid #1e3a5f;
    color: #64748b;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 0.5rem 0.75rem;
    text-align: left;
    text-transform: uppercase;
}
.acc-table td { border-bottom: 1px solid #0f2044; color: #94a3b8; padding: 0.5rem 0.75rem; }
.acc-table tr:hover td { background: rgba(245,158,11,0.04); }
.acc-table code { background: #050c1a; border-radius: 4px; color: #f59e0b; font-size: 0.75rem; padding: 0.1rem 0.3rem; }

/* Snapshot list */
.acc-snapshot-container { display: flex; flex-direction: column; gap: 0.5rem; max-height: 220px; overflow-y: auto; }
.acc-snapshot-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #050c1a;
    border: 1px solid #1e3a5f;
    border-radius: 6px;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
}
.acc-snapshot-item strong { display: block; font-size: 0.8rem; color: #e2e8f0; }
.acc-snapshot-item small { color: #64748b; font-size: 0.72rem; }

/* Toggle switches */
.acc-toggle-list { display: flex; flex-direction: column; gap: 0.5rem; }
.acc-toggle-row {
    align-items: center;
    background: #050c1a;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    font-size: 0.85rem;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    color: #94a3b8;
}
.acc-toggle-input {
    width: 36px;
    height: 20px;
    cursor: pointer;
    accent-color: #f59e0b;
}

/* Health / Mono */
.acc-mono { font-family: 'Courier New', monospace; font-size: 0.875rem; color: #f59e0b; margin: 0; }
.acc-error-log { max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.3rem; }
.acc-error-item { font-family: 'Courier New', monospace; font-size: 0.75rem; color: #ef4444; border-bottom: 1px solid #0f2044; padding-bottom: 0.25rem; }

/* Hint text */
.acc-hint { font-size: 0.78rem; color: #64748b; margin-bottom: 0.75rem; }

/* Capacity Bar */
.acc-capacity-container {
    width: 100%;
    height: 12px;
    background: #050c1a;
    border: 1px solid #1e3a5f;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
}
.acc-capacity-bar {
    height: 100%;
    width: 0%;
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.5s ease;
    position: relative;
    background-size: 30px 30px;
    background-image: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
    );
    animation: acc-stripes 2s linear infinite;
}

@keyframes acc-stripes {
    from { background-position: 0 0; }
    to { background-position: 30px 0; }
}

.acc-bar-safe { background-color: #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); }
.acc-bar-warning { background-color: #f59e0b; box-shadow: 0 0 15px rgba(245, 158, 11, 0.4); }
.acc-bar-danger { background-color: #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }
'@

Add-Content -Path $cssPath -Value $adminCss -Encoding UTF8
Write-Host "SUCCESS: Admin CSS appended ($($adminCss.Length) chars)"
