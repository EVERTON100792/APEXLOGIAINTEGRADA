# inject_admin_html.ps1
$htmlPath = 'c:\Users\Everton Moura\Documents\GitHub\APEX-LOG-3.0\index.html'
$content = Get-Content $htmlPath -Raw -Encoding UTF8

$adminHtml = @'

<!-- APEX COMMAND CENTER: PIN MODAL -->
<div id="apex-pin-modal" style="display:none">
  <div class="acc-pin-card">
    <div class="acc-pin-logo">&#x2B21;</div>
    <h2 class="acc-pin-title">APEX COMMAND CENTER</h2>
    <p class="acc-pin-sub">Acesso restrito &mdash; insira seu PIN</p>
    <div class="acc-pin-display" id="apex-pin-display">_ _ _ _</div>
    <p class="acc-pin-error" id="apex-pin-error" style="display:none">PIN incorreto</p>
    <div class="acc-pin-grid">
      <button class="acc-pin-btn" onclick="apexPinKey('1')">1</button>
      <button class="acc-pin-btn" onclick="apexPinKey('2')">2</button>
      <button class="acc-pin-btn" onclick="apexPinKey('3')">3</button>
      <button class="acc-pin-btn" onclick="apexPinKey('4')">4</button>
      <button class="acc-pin-btn" onclick="apexPinKey('5')">5</button>
      <button class="acc-pin-btn" onclick="apexPinKey('6')">6</button>
      <button class="acc-pin-btn" onclick="apexPinKey('7')">7</button>
      <button class="acc-pin-btn" onclick="apexPinKey('8')">8</button>
      <button class="acc-pin-btn" onclick="apexPinKey('9')">9</button>
      <button class="acc-pin-btn acc-pin-cancel" onclick="apexPinClose()">X</button>
      <button class="acc-pin-btn" onclick="apexPinKey('0')">0</button>
      <button class="acc-pin-btn acc-pin-ok" onclick="apexPinConfirm()">OK</button>
    </div>
    <button class="acc-pin-back" onclick="apexPinBackspace()">Apagar</button>
  </div>
</div>

<!-- APEX COMMAND CENTER: MAIN PANEL -->
<div id="apex-command-center" style="display:none">
  <div class="acc-container">
    <div class="acc-header">
      <div class="acc-header-left">
        <span class="acc-logo-icon">&#x2B21;</span>
        <div>
          <h1 class="acc-title">APEX COMMAND CENTER</h1>
          <p class="acc-subtitle">Painel de Super Usuario &mdash; Controle Total do Sistema</p>
        </div>
      </div>
      <button class="acc-close-btn" onclick="closeCommandCenter()">X</button>
    </div>
    <div id="acc-alert" class="acc-alert" style="display:none"></div>
    <div class="acc-tabs">
      <button class="acc-tab active" data-tab="banco" onclick="switchAdminTab('banco')">Banco de Dados</button>
      <button class="acc-tab" data-tab="rotas" onclick="switchAdminTab('rotas')">Rotas e Veiculos</button>
      <button class="acc-tab" data-tab="config" onclick="switchAdminTab('config')">Configuracoes</button>
      <button class="acc-tab" data-tab="saude" onclick="switchAdminTab('saude')">Saude do Sistema</button>
    </div>

    <!-- PANE: Banco -->
    <div id="acc-pane-banco" class="acc-pane active">
      <div class="acc-grid-2">
        <div class="acc-card">
          <h3 class="acc-card-title">Limpeza de Dados</h3>
          <div class="acc-stat-row"><span>Total de registros:</span><strong id="acc-db-count" class="acc-amber">--</strong></div>
          <div class="acc-form-group">
            <label class="acc-label">Limpar por mes/ano</label>
            <div class="acc-row-inline">
              <select id="acc-mes" class="acc-select">
                <option value="">Mes</option>
                <option value="01">Jan</option><option value="02">Fev</option><option value="03">Mar</option>
                <option value="04">Abr</option><option value="05">Mai</option><option value="06">Jun</option>
                <option value="07">Jul</option><option value="08">Ago</option><option value="09">Set</option>
                <option value="10">Out</option><option value="11">Nov</option><option value="12">Dez</option>
              </select>
              <input id="acc-ano" class="acc-input" type="number" placeholder="Ano" min="2020" max="2030" value="2025" style="width:90px">
              <button class="acc-btn acc-btn-warning" onclick="accLimparPeriodo()">Limpar</button>
            </div>
          </div>
          <div class="acc-form-group">
            <label class="acc-label">Limpar por Estado</label>
            <div class="acc-row-inline">
              <select id="acc-uf-select" class="acc-select">
                <option value="SP">Sao Paulo (SP)</option>
                <option value="PR">Parana (PR)</option>
                <option value="AMBOS">SP e PR</option>
              </select>
              <button class="acc-btn acc-btn-warning" onclick="accLimparUF()">Limpar</button>
            </div>
          </div>
          <div class="acc-form-group">
            <label class="acc-label">Limpar por Rota especifica</label>
            <div class="acc-row-inline">
              <input id="acc-rota-input" class="acc-input" type="text" placeholder="Ex: 10101">
              <button class="acc-btn acc-btn-warning" onclick="accLimparRota()">Limpar</button>
            </div>
          </div>
          <div class="acc-danger-zone">
            <p class="acc-danger-label">ZONA DE PERIGO</p>
            <button class="acc-btn acc-btn-danger" onclick="accLimparTudo()">Apagar TUDO do banco</button>
          </div>
        </div>
        <div class="acc-card">
          <h3 class="acc-card-title">Backup e Rollback</h3>
          <div class="acc-form-group">
            <label class="acc-label">Exportar backup completo</label>
            <div class="acc-row-inline">
              <select id="acc-export-format" class="acc-select">
                <option value="json">JSON</option>
                <option value="excel">Excel</option>
              </select>
              <button class="acc-btn acc-btn-primary" onclick="accExportarBackup()">Exportar</button>
            </div>
          </div>
          <div class="acc-form-group">
            <label class="acc-label">Salvar Snapshot (para rollback)</label>
            <div class="acc-row-inline">
              <input id="acc-snapshot-name" class="acc-input" type="text" placeholder="Nome do snapshot">
              <button class="acc-btn acc-btn-primary" onclick="accSalvarSnapshot()">Salvar</button>
            </div>
          </div>
          <div class="acc-form-group">
            <label class="acc-label">Snapshots salvos</label>
            <div id="acc-snapshot-list" class="acc-snapshot-container"><p style="color:#64748b;font-size:0.8rem">Carregando...</p></div>
          </div>
        </div>
      </div>
      <div class="acc-card acc-mt">
        <h3 class="acc-card-title">Log de Acoes</h3>
        <div class="acc-table-scroll">
          <table class="acc-table">
            <thead><tr><th>Data/Hora</th><th>Usuario</th><th>Acao</th><th>Registros</th></tr></thead>
            <tbody id="acc-audit-tbody"><tr><td colspan="4" style="text-align:center;color:#64748b;padding:1rem">Carregando...</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PANE: Rotas -->
    <div id="acc-pane-rotas" class="acc-pane">
      <div class="acc-card">
        <div class="acc-card-header-row">
          <h3 class="acc-card-title">Override de Veiculo por Rota</h3>
          <div class="acc-row-inline">
            <button class="acc-btn acc-btn-primary" onclick="accSalvarRotas()">Salvar Alteracoes</button>
            <button class="acc-btn acc-btn-ghost" onclick="accResetarRotas()">Resetar Tudo</button>
          </div>
        </div>
        <div class="acc-table-scroll acc-mt">
          <table class="acc-table">
            <thead>
              <tr>
                <th style="width: 80px">Código</th>
                <th style="width: 150px">Nome Padrão</th>
                <th style="width: 250px">Nome Custom</th>
                <th style="width: 120px">Veículo</th>
                <th style="width: 100px">Posição</th>
              </tr>
            </thead>
            <tbody id="acc-rotas-tbody">
              <tr><td colspan="5" style="text-align:center;color:#64748b;padding:2rem">Carregando rotas...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PANE: Config -->
    <div id="acc-pane-config" class="acc-pane">
      <div class="acc-card" style="margin-bottom: 1.5rem;">
        <div class="acc-card-header-row">
          <h3 class="acc-card-title"><i class="bi bi-truck me-2" style="margin-right:0.5rem"></i>CONFIGURACOES DE VEICULOS</h3>
          <button class="acc-btn acc-btn-primary" onclick="accSalvarVehicleConfig()">Salvar Alteracoes</button>
        </div>
        
        <!-- Fiorino -->
        <div style="border-bottom: 1px solid #1e293b; padding-bottom: 1.5rem; margin-top: 1rem;">
          <strong style="color: #10b981; font-size: 1.25rem; display: block; margin-bottom: 1rem;">Fiorino</strong>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 1rem;">
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Peso Min (kg)</label><input id="acc-vc-fiorino-minKg" class="acc-input" type="number"></div>
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Peso Pref. (kg)</label><input id="acc-vc-fiorino-softMax" class="acc-input" type="number"></div>
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Cubagem Pref. (m3)</label><input id="acc-vc-fiorino-cubage" class="acc-input" type="number" step="0.1"></div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
              <div></div>
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Peso Max Final (kg)</label><input id="acc-vc-fiorino-hardMax" class="acc-input" type="number"></div>
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Cubagem Max Final (m3)</label><input id="acc-vc-fiorino-hardCubage" class="acc-input" type="number" step="0.1"></div>
          </div>
        </div>

        <!-- Van -->
        <div style="border-bottom: 1px solid #1e293b; padding: 1.5rem 0;">
          <strong style="color: #3b82f6; font-size: 1.25rem; display: block; margin-bottom: 1rem;">Van</strong>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 1rem;">
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Peso Min (kg)</label><input id="acc-vc-van-minKg" class="acc-input" type="number"></div>
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Peso Pref. (kg)</label><input id="acc-vc-van-softMax" class="acc-input" type="number"></div>
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Cubagem Pref. (m3)</label><input id="acc-vc-van-cubage" class="acc-input" type="number" step="0.1"></div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
              <div></div>
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Peso Max Final (kg)</label><input id="acc-vc-van-hardMax" class="acc-input" type="number"></div>
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Cubagem Max Final (m3)</label><input id="acc-vc-van-hardCubage" class="acc-input" type="number" step="0.1"></div>
          </div>
        </div>

        <!-- 3/4 -->
        <div style="border-bottom: 1px solid #1e293b; padding: 1.5rem 0;">
          <strong style="color: #f59e0b; font-size: 1.25rem; display: block; margin-bottom: 1rem;">3/4</strong>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Peso Min (kg)</label><input id="acc-vc-tresQuartos-minKg" class="acc-input" type="number"></div>
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Peso Max (kg)</label><input id="acc-vc-tresQuartos-hardMax" class="acc-input" type="number" oninput="document.getElementById('acc-vc-tresQuartos-softMax').value=this.value"><input id="acc-vc-tresQuartos-softMax" type="hidden"></div>
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Cubagem Max (m3)</label><input id="acc-vc-tresQuartos-hardCubage" class="acc-input" type="number" step="0.1" oninput="document.getElementById('acc-vc-tresQuartos-cubage').value=this.value"><input id="acc-vc-tresQuartos-cubage" type="hidden"></div>
          </div>
        </div>

        <!-- Toco -->
        <div style="padding-top: 1.5rem;">
          <strong style="color: #f8fafc; font-size: 1.25rem; display: block; margin-bottom: 1rem;">Toco</strong>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Peso Min (kg)</label><input id="acc-vc-toco-minKg" class="acc-input" type="number"></div>
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Peso Max (kg)</label><input id="acc-vc-toco-hardMax" class="acc-input" type="number" oninput="document.getElementById('acc-vc-toco-softMax').value=this.value"><input id="acc-vc-toco-softMax" type="hidden"></div>
              <div><label class="acc-label" style="font-weight:bold;margin-bottom:0.25rem">Cubagem Max (m3)</label><input id="acc-vc-toco-hardCubage" class="acc-input" type="number" step="0.1" oninput="document.getElementById('acc-vc-toco-cubage').value=this.value"><input id="acc-vc-toco-cubage" type="hidden"></div>
          </div>
        </div>
      </div>

      <div class="acc-grid-2">
        <div class="acc-card">
          <div class="acc-card-header-row">
            <h3 class="acc-card-title">Modulos do Sistema</h3>
            <button class="acc-btn acc-btn-primary acc-btn-sm" onclick="accSalvarModulos()">Salvar</button>
          </div>
          <div class="acc-toggle-list mt-3">
            <label class="acc-toggle-row"><span>Relatorio Varejo</span><input type="checkbox" id="acc-mod-relatorioVarejo" class="acc-toggle-input"></label>
            <label class="acc-toggle-row"><span>Modulo Varejo</span><input type="checkbox" id="acc-mod-varejo" class="acc-toggle-input"></label>
            <label class="acc-toggle-row"><span>Modulo Toco</span><input type="checkbox" id="acc-mod-toco" class="acc-toggle-input"></label>
            <label class="acc-toggle-row"><span>Cargas Fechadas</span><input type="checkbox" id="acc-mod-cargasFechadas" class="acc-toggle-input"></label>
            <label class="acc-toggle-row"><span>Roteirizacao</span><input type="checkbox" id="acc-mod-roteirizacao" class="acc-toggle-input"></label>
            <label class="acc-toggle-row"><span>Gerador de E-mails</span><input type="checkbox" id="acc-mod-emailGenerator" class="acc-toggle-input"></label>
          </div>
        </div>
        <div class="acc-card">
          <h3 class="acc-card-title">Alterar PIN de Acesso</h3>
          <div class="acc-form-group acc-mt-sm">
            <input id="acc-new-pin" class="acc-input" type="password" maxlength="4" placeholder="Novo PIN (4 digitos)">
            <input id="acc-confirm-pin" class="acc-input" type="password" maxlength="4" placeholder="Confirmar PIN" style="margin-top:0.5rem">
            <button class="acc-btn acc-btn-primary" style="margin-top:0.5rem;width:100%" onclick="accAlterarPin()">Alterar PIN</button>
          </div>
          <button class="acc-btn acc-btn-danger" style="width:100%;margin-top:0.75rem" onclick="accLimparCache()">Limpar Cache do Navegador</button>
        </div>
      </div>
    </div>

    <!-- PANE: Saude -->
    <div id="acc-pane-saude" class="acc-pane">
      <div class="acc-grid-3">
        <div class="acc-stat-card"><div class="acc-stat-icon">&#x1F4E6;</div><div class="acc-stat-value" id="acc-health-count">--</div><div class="acc-stat-label">Pedidos no banco</div></div>
        <div class="acc-stat-card"><div class="acc-stat-icon">&#x1F4C5;</div><div class="acc-stat-value acc-stat-sm" id="acc-health-range">--</div><div class="acc-stat-label">Periodo coberto</div></div>
        <div class="acc-stat-card"><div class="acc-stat-icon">&#x1F4BE;</div><div class="acc-stat-value" id="acc-health-ls">--</div><div class="acc-stat-label">LocalStorage</div></div>
      </div>
      <div class="acc-card acc-mt">
        <h3 class="acc-card-title">Ultimo Processamento</h3>
        <p id="acc-health-lastprocess" class="acc-mono">--</p>
      </div>
      <div class="acc-card acc-mt">
        <h3 class="acc-card-title">Log de Erros Recentes</h3>
        <div id="acc-health-errors" class="acc-error-log"></div>
      </div>
    </div>
  </div>
    </div>
  </div>
</div>
<script src="js/admin.js"></script>
<!-- APEX_ADMIN_END -->
</body>
<script>
  // Script bridge if needed for the admin panel to talk to main UI
</script>
</html>
'@

# Clean out existing injection if present
$startMarker = '<!-- APEX_ADMIN_START -->'
$endMarker = '<!-- APEX_ADMIN_END -->'

$startIndex = $content.IndexOf($startMarker)
$endIndex = $content.IndexOf($endMarker)

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
  # We found an existing block, remove it
  $lengthToRemove = ($endIndex + $endMarker.Length) - $startIndex
  $content = $content.Remove($startIndex, $lengthToRemove)
  Write-Host "Replaced existing admin panel injection."
}

# Find the last </body> and replace it
$lastBodyIdx = $content.LastIndexOf('</body>')
if ($lastBodyIdx -ge 0) {
  # Ensure the injected HTML has the markers wrapping it just before </body>
  $wrappedHtml = "$startMarker`n$adminHtml"
  $newContent = $content.Substring(0, $lastBodyIdx) + $wrappedHtml
  [System.IO.File]::WriteAllText($htmlPath, $newContent, [System.Text.Encoding]::UTF8)
  Write-Host "SUCCESS: Admin HTML injected ($($adminHtml.Length) chars)"
}
else {
  Write-Host "ERROR: </body> not found"
}
