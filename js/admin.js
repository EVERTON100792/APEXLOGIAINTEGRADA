/**
 * APEX COMMAND CENTER — Admin Panel
 * Trigger: Type A→P→E→X within 2 seconds anywhere
 * PIN: 1234 (default, changeable inside panel)
 * All configs stored in Supabase for multi-user sync
 */

(function () {
    'use strict';

    // ─── State ───────────────────────────────────────────────────────────────
    let adminUnlocked = false;
    let keySequence = [];
    let sequenceTimer = null;
    const TARGET_SEQUENCE = ['a', 'p', 'e', 'x'];

    // Capture JS errors globally for the health dashboard
    window._apexAdminErrors = [];
    const _origError = window.onerror;
    window.onerror = function (msg, src, line, col, err) {
        window._apexAdminErrors.unshift({ msg, src, line, time: new Date().toLocaleTimeString('pt-BR') });
        if (window._apexAdminErrors.length > 20) window._apexAdminErrors.pop();
        if (_origError) return _origError.apply(this, arguments);
    };

    // ─── Secret Keyboard Trigger ─────────────────────────────────────────────
    document.addEventListener('keydown', function (e) {
        // Don't trigger when user is typing in an input
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

        keySequence.push(e.key.toLowerCase());
        if (keySequence.length > TARGET_SEQUENCE.length) keySequence.shift();

        if (sequenceTimer) clearTimeout(sequenceTimer);
        sequenceTimer = setTimeout(() => { keySequence = []; }, 2000);

        if (keySequence.join('') === TARGET_SEQUENCE.join('')) {
            keySequence = [];
            clearTimeout(sequenceTimer);
            openPinModal();
        }
    });

    // Physical keyboard support for PIN modal
    const pinKeyHandler = function (e) {
        const modal = document.getElementById('apex-pin-modal');
        if (!modal || modal.style.display === 'none') return;

        // Prevent default only if we are handling the key
        const handledKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Enter', 'Escape'];
        if (handledKeys.includes(e.key)) {
            e.preventDefault();
            e.stopPropagation(); // Stop propagation to prevent double triggers if button is focused

            if (e.key >= '0' && e.key <= '9') { window.apexPinKey(e.key); }
            else if (e.key === 'Backspace') { window.apexPinBackspace(); }
            else if (e.key === 'Enter') { window.apexPinConfirm(); }
            else if (e.key === 'Escape') { window.apexPinClose(); }
        }
    };
    document.addEventListener('keydown', pinKeyHandler);

    function openPinModal() {
        const modal = document.getElementById('apex-pin-modal');
        if (!modal) return;
        document.getElementById('apex-pin-display').textContent = '_ _ _ _';
        document.getElementById('apex-pin-error').style.display = 'none';
        window._apexPinBuffer = '';
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('visible'), 10);
    }

    function closePinModal() {
        const modal = document.getElementById('apex-pin-modal');
        if (!modal) return;
        modal.classList.remove('visible');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }

    window.apexPinKey = function (digit) {
        if (!window._apexPinBuffer) window._apexPinBuffer = '';
        if (window._apexPinBuffer.length >= 4) return;
        window._apexPinBuffer += digit;
        const dots = window._apexPinBuffer.length;
        document.getElementById('apex-pin-display').textContent =
            '● '.repeat(dots) + '_ '.repeat(4 - dots);

        // Auto-confirm when 4 digits are entered? No, user requested "OK" button/Enter
    };

    window.apexPinBackspace = function () {
        if (!window._apexPinBuffer) return;
        window._apexPinBuffer = window._apexPinBuffer.slice(0, -1);
        const dots = window._apexPinBuffer.length;
        document.getElementById('apex-pin-display').textContent =
            '● '.repeat(dots) + '_ '.repeat(4 - dots);
    };

    let isPinConfirming = false;
    window.apexPinConfirm = async function () {
        if (isPinConfirming) return;
        const pin = window._apexPinBuffer || '';
        if (pin.length !== 4) return;

        isPinConfirming = true;
        try {
            // Get stored PIN hash from Supabase
            const sb = window.supabaseClient || window.supabase;
            if (!sb) { alert('Supabase não disponível.'); return; }

            const { data, error } = await sb.from('apex_admin_config')
                .select('config_value')
                .eq('config_key', 'admin_pin_hash')
                .single();

            // Fallback: SHA-256 of '1234'
            const storedHash = data?.config_value?.replace(/"/g, '') || '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';
            const enteredHash = await sha256(pin);

            if (enteredHash === storedHash) {
                closePinModal();
                adminUnlocked = true;
                localStorage.setItem('apexAdminUnlocked', 'true');
                localStorage.setItem('apexAdminSessionTime', Date.now().toString());
                setTimeout(openCommandCenter, 350);
            } else {
                document.getElementById('apex-pin-error').style.display = 'block';
                window._apexPinBuffer = '';
                document.getElementById('apex-pin-display').textContent = '_ _ _ _';
            }
        } finally {
            isPinConfirming = false;
        }
    };

    window.apexPinClose = closePinModal;

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }


    // ─── Command Center ───────────────────────────────────────────────────────
    function openCommandCenter() {
        const cc = document.getElementById('apex-command-center');
        if (!cc) return;
        cc.style.display = 'flex';
        setTimeout(() => cc.classList.add('visible'), 10);
        loadAdminData();
    }

    window.closeCommandCenter = function () {
        const cc = document.getElementById('apex-command-center');
        if (!cc) return;
        cc.classList.remove('visible');
        setTimeout(() => { cc.style.display = 'none'; }, 400);
    };

    window.switchAdminTab = function (tabId) {
        document.querySelectorAll('.acc-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.acc-pane').forEach(p => p.classList.remove('active'));
        document.querySelector(`.acc-tab[data-tab="${tabId}"]`)?.classList.add('active');
        document.getElementById(`acc-pane-${tabId}`)?.classList.add('active');

        localStorage.setItem('apexAdminTab', tabId);

        if (tabId === 'saude') loadHealthData();
        if (tabId === 'config') loadConfigData();
        if (tabId === 'rotas') loadRotasData();
        if (tabId === 'regras') loadRegrasData();
    };

    // ─── Load all admin data on open ─────────────────────────────────────────
    async function loadAdminData() {
        await loadDbStats();
        await loadAuditLog();
    }

    // ─── TAB 1: Banco de Dados ───────────────────────────────────────────────
    async function loadDbStats() {
        const sb = window.supabaseClient || window.supabase;
        if (!sb) return;
        const { count } = await sb.from('historico_pedidos_varejo').select('*', { count: 'exact', head: true });
        const el = document.getElementById('acc-db-count');
        if (el) el.textContent = (count || 0).toLocaleString('pt-BR');
    }

    async function loadAuditLog() {
        const sb = window.supabaseClient || window.supabase;
        if (!sb) return;
        const { data } = await sb.from('apex_admin_audit_log')
            .select('*').order('created_at', { ascending: false }).limit(20);
        const tbody = document.getElementById('acc-audit-tbody');
        if (!tbody) return;
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#64748b;padding:1rem">Nenhuma ação registrada ainda.</td></tr>';
            return;
        }
        tbody.innerHTML = data.map(row => `
            <tr>
                <td>${new Date(row.created_at).toLocaleString('pt-BR')}</td>
                <td>${row.actor || 'admin'}</td>
                <td>${row.action}</td>
                <td>${row.records_affected || 0} registros</td>
            </tr>`).join('');
    }

    window.accLimparPeriodo = async function () {
        const mes = document.getElementById('acc-mes').value;
        const ano = document.getElementById('acc-ano').value;
        if (!mes || !ano) { showAdminAlert('Selecione mÃªs e ano.', 'warning'); return; }

        const inicio = `${ano}-${mes.padStart(2, '0')}-01`;
        const fim = new Date(ano, parseInt(mes), 0).toISOString().split('T')[0];

        if (!confirm(`Apagar TODOS os pedidos de ${mes}/${ano}? Esta aÃ§Ã£o nÃ£o pode ser desfeita.`)) return;

        const sb = window.supabaseClient || window.supabase;

        const { data: deleted, error } = await sb.from('historico_pedidos_varejo')
            .delete()
            .gte('data_pedido', inicio)
            .lte('data_pedido', fim)
            .select();

        if (error) { showAdminAlert('Erro ao apagar: ' + error.message, 'danger'); return; }

        const countDeleted = deleted ? deleted.length : 0;
        await logAction(`Limpar por perÃ­odo ${mes}/${ano}`, countDeleted);

        // Refresh all Admin tabs
        await loadDbStats();
        await loadAuditLog();
        if (typeof loadHealthData === 'function') await loadHealthData();

        // Clear Varejo cache so the main UI updates
        window.currentVarejoData = null;
        if (typeof carregarRelatorioVarejo === 'function') {
            const emptyState = document.getElementById('resultadoRelatorioVarejo');
            if (emptyState) emptyState.style.display = 'none';
        }

        showAdminAlert(`âœ… ${countDeleted} pedidos de ${mes}/${ano} removidos com sucesso.`, 'success');
    };

    window.accLimparUF = async function () {
        const uf = document.getElementById('acc-uf-select').value;
        if (!uf) { showAdminAlert('Selecione uma UF.', 'warning'); return; }

        let displayUF = uf;
        if (uf === 'AMBOS') displayUF = 'SP, PR e MS';
        if (!confirm(`Apagar pedidos de ${displayUF}?`)) return;

        const sb = window.supabaseClient || window.supabase;
        let query = sb.from('historico_pedidos_varejo').delete();

        if (uf === 'SP') query = query.eq('uf', 'SP');
        else if (uf === 'PR') query = query.eq('uf', 'PR');
        else if (uf === 'MS') query = query.eq('uf', 'MS');
        else query = query.in('uf', ['SP', 'PR', 'MS']);

        // Use select() to count actual deleted rows
        const { data: deleted, error } = await query.select();
        if (error) { showAdminAlert('Erro: ' + error.message, 'danger'); return; }

        const countDeleted = deleted ? deleted.length : 0;
        await logAction(`Limpar por UF: ${uf}`, countDeleted);

        // Refresh all Admin tabs
        await loadDbStats();
        await loadAuditLog();
        if (typeof loadHealthData === 'function') await loadHealthData();

        // Clear Varejo cache so the main UI updates
        window.currentVarejoData = null;
        if (typeof carregarRelatorioVarejo === 'function') {
            const emptyState = document.getElementById('resultadoRelatorioVarejo');
            if (emptyState) emptyState.style.display = 'none';
        }

        showAdminAlert(`âœ… ${countDeleted} pedidos de ${uf} removidos.`, 'success');
    };

    window.accLimparRota = async function () {
        const rota = document.getElementById('acc-rota-input').value.trim();
        if (!rota) { showAdminAlert('Digite o cÃ³digo da rota.', 'warning'); return; }
        if (!confirm(`Apagar pedidos da rota ${rota}?`)) return;

        const sb = window.supabaseClient || window.supabase;

        // Use select() to count actual deleted rows
        const { data: deleted, error } = await sb.from('historico_pedidos_varejo')
            .delete()
            .eq('rota', rota)
            .select();

        if (error) { showAdminAlert('Erro: ' + error.message, 'danger'); return; }

        const countDeleted = deleted ? deleted.length : 0;
        await logAction(`Limpar rota ${rota}`, countDeleted);

        // Refresh all Admin tabs
        await loadDbStats();
        await loadAuditLog();
        if (typeof loadHealthData === 'function') await loadHealthData();

        // Clear Varejo cache so the main UI updates
        window.currentVarejoData = null;
        if (typeof carregarRelatorioVarejo === 'function') {
            const emptyState = document.getElementById('resultadoRelatorioVarejo');
            if (emptyState) emptyState.style.display = 'none';
        }

        showAdminAlert(`âœ… ${countDeleted} pedidos da rota ${rota} removidos.`, 'success');
    };

    window.accLimparTudo = async function () {
        const confirmText = prompt('⚠️ AÇÃO IRREVERSÍVEL!\n\nDigite "APAGAR TUDO" para confirmar:');
        if (confirmText !== 'APAGAR TUDO') { showAdminAlert('Cancelado.', 'info'); return; }

        const sb = window.supabaseClient || window.supabase;
        const { count: total } = await sb.from('historico_pedidos_varejo').select('*', { count: 'exact', head: true });
        const { error } = await sb.from('historico_pedidos_varejo').delete().not('num_pedido', 'is', null);

        if (error) { showAdminAlert('Erro: ' + error.message, 'danger'); return; }
        await logAction('Limpar TODO o banco de dados', total || 0);
        await loadDbStats();
        await loadAuditLog();
        showAdminAlert(`✅ ${total || 0} pedidos removidos. Banco zerado.`, 'success');
    };

    window.accExportarBackup = async function () {
        const fmt = document.getElementById('acc-export-format').value;
        const sb = window.supabaseClient || window.supabase;
        const { data, error } = await sb.from('historico_pedidos_varejo').select('*').order('data_pedido', { ascending: false });

        if (error || !data) { showAdminAlert('Erro ao exportar.', 'danger'); return; }

        const timestamp = new Date().toISOString().slice(0, 10);

        if (fmt === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            downloadBlob(blob, `apex_backup_${timestamp}.json`);
        } else {
            // Excel via SheetJS if available
            if (window.XLSX) {
                const ws = XLSX.utils.json_to_sheet(data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Backup');
                XLSX.writeFile(wb, `apex_backup_${timestamp}.xlsx`);
            } else {
                showAdminAlert('SheetJS não carregado. Use JSON.', 'warning');
                return;
            }
        }

        await logAction(`Exportar backup (${fmt.toUpperCase()})`, data.length);
        showAdminAlert(`✅ Backup de ${data.length.toLocaleString('pt-BR')} registros exportado.`, 'success');
    };

    window.accSalvarSnapshot = async function () {
        const nome = document.getElementById('acc-snapshot-name').value.trim() || `Snapshot ${new Date().toLocaleString('pt-BR')}`;
        const sb = window.supabaseClient || window.supabase;
        const { data } = await sb.from('historico_pedidos_varejo').select('*');

        showAdminAlert('Salvando snapshot...', 'info');

        const { error } = await sb.from('apex_admin_snapshots').insert({
            snapshot_name: nome,
            snapshot_data: data || [],
            total_records: data?.length || 0
        });

        if (error) { showAdminAlert('Erro: ' + error.message, 'danger'); return; }
        await logAction(`Salvar snapshot: ${nome}`, data?.length || 0);
        await loadSnapshotList();
        showAdminAlert(`✅ Snapshot "${nome}" salvo com ${data?.length || 0} registros.`, 'success');
    };

    async function loadSnapshotList() {
        const sb = window.supabaseClient || window.supabase;
        const { data } = await sb.from('apex_admin_snapshots').select('id, snapshot_name, total_records, created_at').order('created_at', { ascending: false }).limit(10);
        const container = document.getElementById('acc-snapshot-list');
        if (!container) return;
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="color:#64748b;font-size:0.8rem">Nenhum snapshot.</p>';
            return;
        }
        container.innerHTML = data.map(s => `
            <div class="acc-snapshot-item">
                <div>
                    <strong>${s.snapshot_name}</strong>
                    <small>${new Date(s.created_at).toLocaleString('pt-BR')} &mdash; ${s.total_records.toLocaleString('pt-BR')} registros</small>
                </div>
                <button class="acc-btn acc-btn-warning acc-btn-sm" onclick="accRestaurarSnapshot('${s.id}','${s.snapshot_name}')">↩ Restaurar</button>
            </div>`).join('');
    }

    window.accRestaurarSnapshot = async function (id, nome) {
        if (!confirm(`Restaurar snapshot "${nome}"? Os dados atuais serão SUBSTITUÍDOS.`)) return;
        const sb = window.supabaseClient || window.supabase;
        const { data: snap } = await sb.from('apex_admin_snapshots').select('snapshot_data').eq('id', id).single();
        if (!snap?.snapshot_data) { showAdminAlert('Snapshot inválido.', 'danger'); return; }

        showAdminAlert('Restaurando... aguarde.', 'info');

        // Clear and re-insert
        await sb.from('historico_pedidos_varejo').delete().not('num_pedido', 'is', null);
        const chunks = chunkArray(snap.snapshot_data, 500);
        for (const chunk of chunks) {
            await sb.from('historico_pedidos_varejo').upsert(chunk, { onConflict: 'num_pedido' });
        }

        await logAction(`Restaurar snapshot: ${nome}`, snap.snapshot_data.length);
        await loadDbStats();
        showAdminAlert(`✅ Snapshot "${nome}" restaurado com ${snap.snapshot_data.length.toLocaleString('pt-BR')} registros.`, 'success');
    };
    // ─── TAB 2: Rotas e Veículos ──────────────────────────────────────────────
    async function loadRotasData() {
        const sb = window.supabaseClient || window.supabase;
        const { data } = await sb.from('apex_admin_config').select('config_value').eq('config_key', 'route_overrides').single();
        const overrides = data?.config_value || {};

        const map = window.rotaVeiculoMap || {};
        const tbody = document.getElementById('acc-rotas-tbody');
        if (!tbody) return;

        const rows = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#64748b;padding:1rem">Processe uma planilha primeiro para ver as rotas.</td></tr>';
            return;
        }

        tbody.innerHTML = rows.map(([code, info]) => {
            const ov = overrides[code] || {};
            const vehicleType = ov.type || info.type;
            const customName = ov.name || '';
            const order = (ov.order !== undefined && ov.order !== null) ? ov.order : '';

            return `<tr>
                <td style="width: 80px"><code>${code}</code></td>
                <td style="color:#94a3b8;font-size:0.8rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${info.title || code}">${info.title || code}</td>
                <td style="width: 250px">
                    <input class="acc-input" data-rota="${code}" type="text" 
                        placeholder="Novo nome para a rota..." value="${customName}" 
                        style="width:100%; height: 32px; background: #050c1a; border: 1px solid #1e3a5f; color: #fff; padding: 4px 8px; cursor: text; pointer-events: auto !important; position: relative; z-index: 5;"
                        oninput="window._apexRotaChanges = window._apexRotaChanges || {}; window._apexRotaChanges['${code}'] = window._apexRotaChanges['${code}'] || {}; window._apexRotaChanges['${code}'].name = this.value;">
                </td>
                <td style="width: 120px">
                    <select class="acc-select" data-rota="${code}" style="width: 100%; height: 32px; cursor: pointer; pointer-events: auto !important;"
                        onchange="window._apexRotaChanges = window._apexRotaChanges || {}; window._apexRotaChanges['${code}'] = window._apexRotaChanges['${code}'] || {}; window._apexRotaChanges['${code}'].type = this.value;">
                        ${['fiorino', 'van', 'tresQuartos', 'toco'].map(v =>
                `<option value="${v}" ${vehicleType === v ? 'selected' : ''}>${v === 'tresQuartos' ? '3/4' : v.charAt(0).toUpperCase() + v.slice(1)}</option>`
            ).join('')}
                    </select>
                </td>
                <td style="width: 100px">
                    <input class="acc-input" data-rota="${code}" type="number" 
                        placeholder="Ord" value="${order}" min="1" max="999"
                        style="width:100%; height: 32px; background: #050c1a; border: 1px solid #1e3a5f; color: #fff; text-align: center; cursor: text; pointer-events: auto !important;"
                        oninput="window._apexRotaChanges = window._apexRotaChanges || {}; window._apexRotaChanges['${code}'] = window._apexRotaChanges['${code}'] || {}; window._apexRotaChanges['${code}'].order = parseInt(this.value) || null;">
                </td>
            </tr>`;
        }).join('');
    }

    window.accSalvarRotas = async function () {
        const changes = window._apexRotaChanges || {};
        if (Object.keys(changes).length === 0) { showAdminAlert('Nenhuma alteração feita.', 'info'); return; }

        const sb = window.supabaseClient || window.supabase;
        const { data: curr } = await sb.from('apex_admin_config').select('config_value').eq('config_key', 'route_overrides').single();
        const existing = curr?.config_value || {};

        // Deep merge changes into existing config
        const merged = { ...existing };
        for (const [code, delta] of Object.entries(changes)) {
            merged[code] = { ...(existing[code] || {}), ...delta };
        }

        const { error } = await sb.from('apex_admin_config')
            .update({ config_value: merged, updated_at: new Date().toISOString() })
            .eq('config_key', 'route_overrides');

        if (error) { showAdminAlert('Erro: ' + error.message, 'danger'); return; }

        // Apply locally to in-memory map immediately
        if (window.rotaVeiculoMap) {
            for (const [code, delta] of Object.entries(changes)) {
                if (window.rotaVeiculoMap[code]) {
                    if (delta.type) window.rotaVeiculoMap[code].type = delta.type;
                    if (delta.name !== undefined) window.rotaVeiculoMap[code].customName = delta.name;
                    if (delta.order !== undefined) window.rotaVeiculoMap[code].order = delta.order;
                }
            }
        }

        // Update the global override cache used by script.js
        window._apexRouteOverrides = merged;

        await logAction(`Override de rotas: ${Object.keys(changes).length} rota(s) atualizadas`, 0);
        window._apexRotaChanges = {};
        showAdminAlert(`✅ ${Object.keys(changes).length} rota(s) atualizadas. Re-processe para aplicar as mudanças visuais.`, 'success');
    };

    window.accResetarRotas = async function () {
        if (!confirm('Deseja realmente resetar TODOS os nomes e customizações de rotas? Esta ação não pode ser desfeita.')) return;

        const sb = window.supabaseClient || window.supabase;
        const { error } = await sb.from('apex_admin_config')
            .update({ config_value: {}, updated_at: new Date().toISOString() })
            .eq('config_key', 'route_overrides');

        if (error) { showAdminAlert('Erro: ' + error.message, 'danger'); return; }

        // Limpa estado local
        window._apexRouteOverrides = {};
        window._apexRotaChanges = {};

        if (window.rotaVeiculoMap) {
            Object.values(window.rotaVeiculoMap).forEach(v => {
                delete v.customName;
                delete v.order;
            });
        }

        await logAction('Resetar todos os overrides de rotas', 0);
        await loadRotasData();
        showAdminAlert('✅ Todos os nomes e ordens foram resetados.', 'success');
    };

    // ─── TAB 3: Configurações do Sistema ─────────────────────────────────────
    async function loadConfigData() {
        const sb = window.supabaseClient || window.supabase;

        // Load vehicle config — use HTML inputs (already populated with defaultConfigs) as fallback
        const { data: vcData } = await sb.from('apex_admin_config').select('config_value').eq('config_key', 'vehicle_config').single();
        const vc = vcData?.config_value || {};
        const vehicles = ['fiorino', 'van', 'tresQuartos', 'toco'];
        // Map from admin panel field names to the original HTML input field names
        const htmlMap = {
            fiorino: { minKg: 'fiorinoMinCapacity', softMaxKg: 'fiorinoMaxCapacity', hardMaxKg: 'fiorinoHardMaxCapacity', cubage: 'fiorinoCubage', hardCubage: 'fiorinoHardCubage' },
            van: { minKg: 'vanMinCapacity', softMaxKg: 'vanMaxCapacity', hardMaxKg: 'vanHardMaxCapacity', cubage: 'vanCubage', hardCubage: 'vanHardCubage' },
            tresQuartos: { minKg: 'tresQuartosMinCapacity', softMaxKg: 'tresQuartosMaxCapacity', hardMaxKg: 'tresQuartosHardMaxCapacity', cubage: 'tresQuartosCubage', hardCubage: 'tresQuartosHardCubage' },
            toco: { minKg: 'tocoMinCapacity', softMaxKg: 'tocoMaxCapacity', hardMaxKg: 'tocoHardMaxCapacity', cubage: 'tocoCubage', hardCubage: 'tocoHardCubage' }
        };
        vehicles.forEach(v => {
            const cfg = vc[v] || {};
            const el = (id) => document.getElementById(`acc-vc-${v}-${id}`);
            const htmlEl = (key) => document.getElementById(htmlMap[v][key]);
            // Use Supabase value → fallback to existing HTML input (defaultConfigs loaded by loadConfigurations)
            if (el('minKg')) el('minKg').value = cfg.minKg ?? htmlEl('minKg')?.value ?? '';
            if (el('softMax')) el('softMax').value = cfg.softMaxKg ?? htmlEl('softMaxKg')?.value ?? '';
            if (el('hardMax')) el('hardMax').value = cfg.hardMaxKg ?? htmlEl('hardMaxKg')?.value ?? '';
            if (el('cubage')) el('cubage').value = cfg.softMaxCubage ?? htmlEl('cubage')?.value ?? '';
            if (el('hardCubage')) el('hardCubage').value = cfg.hardMaxCubage ?? htmlEl('hardCubage')?.value ?? '';
        });

        // Load modules
        const { data: modData } = await sb.from('apex_admin_config').select('config_value').eq('config_key', 'modules_enabled').single();
        const mods = modData?.config_value || {};
        Object.entries(mods).forEach(([key, val]) => {
            const toggle = document.getElementById(`acc-mod-${key}`);
            if (toggle) toggle.checked = val;
        });
    }

    window.accSalvarVehicleConfig = async function () {
        const sb = window.supabaseClient || window.supabase;
        const vehicles = ['fiorino', 'van', 'tresQuartos', 'toco'];
        const config = {};
        vehicles.forEach(v => {
            const el = (id) => document.getElementById(`acc-vc-${v}-${id}`);
            config[v] = {
                minKg: parseFloat(el('minKg')?.value) || 0,
                softMaxKg: parseFloat(el('softMax')?.value) || 0,
                hardMaxKg: parseFloat(el('hardMax')?.value) || 0,
                minCubage: 0,
                softMaxCubage: parseFloat(el('cubage')?.value) || 0,
                hardMaxCubage: parseFloat(el('hardCubage')?.value) || 0
            };
        });

        const { error } = await sb.from('apex_admin_config')
            .update({ config_value: config, updated_at: new Date().toISOString() })
            .eq('config_key', 'vehicle_config');

        if (error) { showAdminAlert('Erro: ' + error.message, 'danger'); return; }
        await logAction('Atualizar limites de veículos', 0);
        showAdminAlert('✅ Limites de peso atualizados para todos os usuários.', 'success');
    };

    window.accSalvarModulos = async function () {
        const sb = window.supabaseClient || window.supabase;
        const moduleKeys = ['varejo', 'toco', 'cargasFechadas', 'roteirizacao', 'emailGenerator', 'relatorioVarejo'];
        const mods = {};
        moduleKeys.forEach(k => {
            const toggle = document.getElementById(`acc-mod-${k}`);
            if (toggle) mods[k] = toggle.checked;
        });

        const { error } = await sb.from('apex_admin_config')
            .update({ config_value: mods, updated_at: new Date().toISOString() })
            .eq('config_key', 'modules_enabled');

        if (error) { showAdminAlert('Erro: ' + error.message, 'danger'); return; }
        await logAction('Atualizar módulos do sistema', 0);
        showAdminAlert('✅ Módulos atualizados. Usuários precisarão recarregar.', 'success');
    };

    window.accAlterarPin = async function () {
        const novo = document.getElementById('acc-new-pin').value.trim();
        const confirm = document.getElementById('acc-confirm-pin').value.trim();
        if (novo.length !== 4 || !/^\d{4}$/.test(novo)) { showAdminAlert('PIN deve ter 4 dígitos.', 'warning'); return; }
        if (novo !== confirm) { showAdminAlert('Os PINs não coincidem.', 'warning'); return; }

        const hash = await sha256(novo);
        const sb = window.supabaseClient || window.supabase;
        await sb.from('apex_admin_config').update({ config_value: `"${hash}"` }).eq('config_key', 'admin_pin_hash');

        await logAction('Alteração de PIN de Administração', 0);

        document.getElementById('acc-new-pin').value = '';
        document.getElementById('acc-confirm-pin').value = '';
        showAdminAlert('✅ PIN alterado com sucesso.', 'success');
    };

    window.accLimparCache = function () {
        if (!confirm('Limpar LocalStorage e IndexedDB do navegador atual?')) return;
        localStorage.clear();
        indexedDB.deleteDatabase('ApexLogDB');
        showAdminAlert('✅ Cache limpo. A página será recarregada.', 'success');
        setTimeout(() => location.reload(), 1500);
    };

    // ─── TAB 4: Saúde do Sistema ──────────────────────────────────────────────
    async function loadHealthData() {
        const sb = window.supabaseClient || window.supabase;
        const CAPACITY_LIMIT = 100000; // Recommended limit for performance

        // Record count
        const { count } = await sb.from('historico_pedidos_varejo').select('*', { count: 'exact', head: true });
        const total = count || 0;
        setEl('acc-health-count', total.toLocaleString('pt-BR'));

        // Update Capacity Bar
        const pct = Math.min((total / CAPACITY_LIMIT) * 100, 100);
        const bar = document.getElementById('acc-health-bar');
        const pctEl = document.getElementById('acc-health-pct');
        const limitEl = document.getElementById('acc-health-limit');

        if (bar && pctEl) {
            bar.style.width = pct + '%';
            pctEl.textContent = pct.toFixed(1) + '%';
            limitEl.textContent = CAPACITY_LIMIT.toLocaleString('pt-BR');

            // Change color based on usage using classes
            bar.classList.remove('acc-bar-safe', 'acc-bar-warning', 'acc-bar-danger');
            if (pct > 90) bar.classList.add('acc-bar-danger');
            else if (pct > 70) bar.classList.add('acc-bar-warning');
            else bar.classList.add('acc-bar-safe');
        }

        // Months covered
        const { data: months } = await sb.from('historico_pedidos_varejo')
            .select('data_pedido').order('data_pedido', { ascending: true }).limit(1);
        const { data: monthsDesc } = await sb.from('historico_pedidos_varejo')
            .select('data_pedido').order('data_pedido', { ascending: false }).limit(1);
        if (months?.[0] && monthsDesc?.[0]) {
            setEl('acc-health-range', `${months[0].data_pedido} → ${monthsDesc[0].data_pedido}`);
        }

        // Last processar
        const { data: lastP } = await sb.from('apex_admin_config').select('config_value').eq('config_key', 'last_processar').single();
        setEl('acc-health-lastprocess', lastP?.config_value && lastP.config_value !== 'null'
            ? JSON.stringify(lastP.config_value).replace(/"/g, '')
            : 'Não registrado');

        // LocalStorage size
        let lsSize = 0;
        for (const key in localStorage) { if (localStorage.hasOwnProperty(key)) lsSize += localStorage[key].length; }
        setEl('acc-health-ls', (lsSize / 1024).toFixed(1) + ' KB');

        // Error log
        const errors = window._apexAdminErrors || [];
        const errEl = document.getElementById('acc-health-errors');
        if (errEl) {
            errEl.innerHTML = errors.length === 0
                ? '<p style="color:#10b981">✅ Sem erros recentes.</p>'
                : errors.map(e => `<div class="acc-error-item"><span style="color:#64748b">${e.time}</span> ${e.msg}</div>`).join('');
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    // === TAB 5: Regras de Negocio =============================================
    async function loadRegrasData() {
        const sb = window.supabaseClient || window.supabase;

        // 1. Fiorino cities
        const { data: fcData } = await sb.from('apex_admin_config').select('config_value').eq('config_key', 'fiorino_cities_extra').single();
        const fiorinoMap = fcData?.config_value || {};
        renderFiorinoCities(fiorinoMap);

        // 2. Special clients
        const { data: scData } = await sb.from('apex_admin_config').select('config_value').eq('config_key', 'special_clients_extra').single();
        const clients = scData?.config_value || [];
        renderSpecialClients(clients);

        // 3. Agendamento overrides
        const { data: agData } = await sb.from('apex_admin_config').select('config_value').eq('config_key', 'agendamento_overrides').single();
        window._apexAgendamentoOverrides = agData?.config_value || {};
        renderAgendamento(window._apexAgendamentoOverrides);

        // Load client observations
        await loadObsData();
    }

    // -- Fiorino Cities --
    function renderFiorinoCities(map) {
        const container = document.getElementById('acc-fiorino-routes');
        if (!container) return;
        container.innerHTML = '';
        const routeCodes = Object.keys(window.rotaVeiculoMap || {})
            .filter(k => (window._apexAdminRouteOverrides?.[k] || window.rotaVeiculoMap[k]?.type) === 'fiorino');
        // Also include any existing routes in the map
        const allCodes = [...new Set([...Object.keys(map), ...routeCodes])];

        if (allCodes.length === 0) {
            container.innerHTML = '<p style="color:#64748b;font-size:0.82rem">Processe uma planilha ou salve overrides de rota para ver as rotas Fiorino aqui.</p>';
            return;
        }

        allCodes.sort().forEach(code => {
            const cities = (map[code] || []).join(', ');
            container.insertAdjacentHTML('beforeend', `
                <div class="acc-regra-row" data-rota="${code}">
                    <div class="acc-regra-label">Rota <code>${code}</code></div>
                    <textarea class="acc-textarea" id="acc-fc-${code}" placeholder="Cidades separadas por virgula (maiusculo)">${cities}</textarea>
                </div>`);
        });
    }

    window.accSalvarFiorinoCities = async function () {
        const container = document.getElementById('acc-fiorino-routes');
        if (!container) return;
        const map = {};
        container.querySelectorAll('.acc-regra-row').forEach(row => {
            const code = row.dataset.rota;
            const val = row.querySelector('textarea')?.value || '';
            map[code] = val.split(',').map(c => c.trim().toUpperCase()).filter(Boolean);
        });
        const sb = window.supabaseClient || window.supabase;
        const { error } = await sb.from('apex_admin_config')
            .update({ config_value: map, updated_at: new Date().toISOString() })
            .eq('config_key', 'fiorino_cities_extra');
        if (error) { showAdminAlert('Erro: ' + error.message, 'danger'); return; }
        // Apply locally
        if (window.rotasEspeciaisFiorino) {
            for (const [code, cities] of Object.entries(map)) {
                window.rotasEspeciaisFiorino[code] = cities;
            }
        }
        window._apexFiorinoCitiesExtra = map;
        await logAction('Atualizar cidades Fiorino por rota', 0);
        showAdminAlert('Cidades Fiorino salvas. Reprocesse para aplicar.', 'success');
    };

    window.accAdicionarRotaFiorino = function () {
        const code = document.getElementById('acc-fc-new-code').value.trim();
        if (!code) { showAdminAlert('Digite o codigo da rota.', 'warning'); return; }
        const container = document.getElementById('acc-fiorino-routes');
        if (container.querySelector(`[data-rota="${code}"]`)) { showAdminAlert('Rota ja existe.', 'info'); return; }
        container.insertAdjacentHTML('beforeend', `
            <div class="acc-regra-row" data-rota="${code}">
                <div class="acc-regra-label">Rota <code>${code}</code></div>
                <textarea class="acc-textarea" id="acc-fc-${code}" placeholder="Cidades separadas por virgula"></textarea>
            </div>`);
        document.getElementById('acc-fc-new-code').value = '';
    };

    // -- Special Clients --
    function renderSpecialClients(clients) {
        const container = document.getElementById('acc-special-clients-list');
        if (!container) return;
        container.innerHTML = clients.map((name, i) => `
            <div class="acc-tag-row">
                <span class="acc-tag">${name}</span>
                <button class="acc-btn acc-btn-danger acc-btn-sm" onclick="accRemoverClienteEspecial(${i})">X</button>
            </div>`).join('');
        window._apexSpecialClientsLocal = [...clients];
    }

    window.accAdicionarClienteEspecial = async function () {
        const input = document.getElementById('acc-sc-new').value.trim().toUpperCase();
        if (!input) { showAdminAlert('Digite o nome do cliente.', 'warning'); return; }
        const clients = window._apexSpecialClientsLocal || [];
        if (clients.includes(input)) { showAdminAlert('Cliente ja existe.', 'info'); return; }
        clients.push(input);
        const sb = window.supabaseClient || window.supabase;
        await sb.from('apex_admin_config').update({ config_value: clients, updated_at: new Date().toISOString() }).eq('config_key', 'special_clients_extra');
        // Apply locally
        if (window.specialClientNames) window.specialClientNames.push(input);
        renderSpecialClients(clients);
        document.getElementById('acc-sc-new').value = '';
        await logAction('Adicionar cliente especial: ' + input, 0);
        showAdminAlert('Cliente especial adicionado.', 'success');
    };

    window.accRemoverClienteEspecial = async function (idx) {
        const clients = window._apexSpecialClientsLocal || [];
        const removed = clients.splice(idx, 1)[0];
        const sb = window.supabaseClient || window.supabase;
        await sb.from('apex_admin_config').update({ config_value: clients, updated_at: new Date().toISOString() }).eq('config_key', 'special_clients_extra');
        // Apply locally
        if (window.specialClientNames) {
            const li = window.specialClientNames.indexOf(removed);
            if (li >= 0) window.specialClientNames.splice(li, 1);
        }
        renderSpecialClients(clients);
        await logAction('Remover cliente especial: ' + removed, 0);
        showAdminAlert('Cliente removido.', 'success');
    };

    // -- Agendamento Overrides --
    function renderAgendamento(overrides) {
        const tbody = document.getElementById('acc-agend-tbody');
        if (!tbody) return;
        const entries = Object.entries(overrides);
        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#64748b;padding:1rem">Nenhum override de agendamento ainda.</td></tr>';
            return;
        }
        tbody.innerHTML = entries.map(([code, val]) => `
            <tr>
                <td><code>${code}</code></td>
                <td><span class="${val === 'Sim' ? 'acc-badge-yes' : 'acc-badge-no'}">${val}</span></td>
                <td><button class="acc-btn acc-btn-danger acc-btn-sm" onclick="accRemoverAgendamento('${code}')">Remover</button></td>
            </tr>`).join('');
    }

    window.accAdicionarAgendamento = async function () {
        const code = document.getElementById('acc-ag-code').value.trim();
        const val = document.getElementById('acc-ag-val').value;
        if (!code) { showAdminAlert('Digite o codigo do cliente.', 'warning'); return; }
        const overrides = window._apexAgendamentoOverrides || {};
        overrides[code] = val;
        const sb = window.supabaseClient || window.supabase;
        await sb.from('apex_admin_config').update({ config_value: overrides, updated_at: new Date().toISOString() }).eq('config_key', 'agendamento_overrides');
        // Apply locally
        if (val === 'Sim') {
            if (window.agendamentoClientCodes) window.agendamentoClientCodes.add(code);
        } else {
            if (window.agendamentoClientCodes) window.agendamentoClientCodes.delete(code);
        }
        window._apexAgendamentoOverrides = overrides;
        renderAgendamento(overrides);
        document.getElementById('acc-ag-code').value = '';
        await logAction('Override agendamento: ' + code + ' = ' + val, 0);
        showAdminAlert('Agendamento atualizado.', 'success');
    };

    window.accRemoverAgendamento = async function (code) {
        const overrides = window._apexAgendamentoOverrides || {};
        delete overrides[code];
        const sb = window.supabaseClient || window.supabase;
        await sb.from('apex_admin_config').update({ config_value: overrides, updated_at: new Date().toISOString() }).eq('config_key', 'agendamento_overrides');
        window._apexAgendamentoOverrides = overrides;
        renderAgendamento(overrides);
        await logAction('Remover override agendamento: ' + code, 0);
        showAdminAlert('Override removido.', 'success');
    };

    // -- Client Observations --
    async function loadObsData() {
        const sb = window.supabaseClient || window.supabase;
        const { data } = await sb.from('apex_admin_config').select('config_value').eq('config_key', 'client_observations').single();
        const obs = data?.config_value || {};
        window._apexClientObservations = obs;
        renderObs(obs);
    }

    function renderObs(obs) {
        const tbody = document.getElementById('acc-obs-tbody');
        if (!tbody) return;
        const entries = Object.entries(obs);
        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#64748b;padding:1rem">Nenhuma observacao cadastrada.</td></tr>';
            return;
        }
        tbody.innerHTML = entries.map(([code, text]) => `
            <tr>
                <td><code>${code}</code></td>
                <td style="font-size:0.83rem;color:#cbd5e1">${text}</td>
                <td><button class="acc-btn acc-btn-danger acc-btn-sm" onclick="accRemoverObs('${code}')">Remover</button></td>
            </tr>`).join('');
    }

    window.accSalvarObsCliente = async function () {
        const code = document.getElementById('acc-obs-code').value.trim();
        const text = document.getElementById('acc-obs-text').value.trim();
        if (!code || !text) { showAdminAlert('Preencha o codigo e a observacao.', 'warning'); return; }
        const sb = window.supabaseClient || window.supabase;
        const obs = window._apexClientObservations || {};
        obs[code] = text;
        const { error } = await sb.from('apex_admin_config').update({ config_value: obs, updated_at: new Date().toISOString() }).eq('config_key', 'client_observations');
        if (error) { showAdminAlert('Erro: ' + error.message, 'danger'); return; }
        window._apexClientObservations = obs;
        document.getElementById('acc-obs-code').value = '';
        document.getElementById('acc-obs-text').value = '';
        renderObs(obs);
        if (window._apexApplyClientObservations) window._apexApplyClientObservations();
        await logAction('Salvar obs cliente: ' + code, 0);
        showAdminAlert('Observacao salva. Cards atualizados.', 'success');
    };

    window.accRemoverObs = async function (code) {
        const sb = window.supabaseClient || window.supabase;
        const obs = window._apexClientObservations || {};
        delete obs[code];
        await sb.from('apex_admin_config').update({ config_value: obs, updated_at: new Date().toISOString() }).eq('config_key', 'client_observations');
        window._apexClientObservations = obs;
        renderObs(obs);
        if (window._apexApplyClientObservations) window._apexApplyClientObservations();
        await logAction('Remover obs cliente: ' + code, 0);
        showAdminAlert('Observacao removida.', 'success');
    };

    async function logAction(action, recordsAffected = 0) {
        const sb = window.supabaseClient || window.supabase;
        await sb.from('apex_admin_audit_log').insert({ action, actor: 'admin', records_affected: recordsAffected });
    }

    function showAdminAlert(msg, type = 'info') {
        const el = document.getElementById('acc-alert');
        if (!el) return;
        const colors = { success: '#10b981', danger: '#ef4444', warning: '#f59e0b', info: '#0ea5e9' };
        el.style.display = 'block';
        el.style.borderColor = colors[type] || colors.info;
        el.textContent = msg;
        clearTimeout(el._timer);
        el._timer = setTimeout(() => { el.style.display = 'none'; }, 5000);
    }

    function setEl(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    }

    function chunkArray(arr, size) {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
        return chunks;
    }

    // ─── Init: Preload admin configs from Supabase on startup ────────────────
    document.addEventListener('DOMContentLoaded', async () => {
        // Load snapshots whenever the DB tab becomes visible
        const dbPane = document.getElementById('acc-pane-banco');
        if (dbPane) {
            const observer = new MutationObserver(() => {
                if (dbPane.classList.contains('active')) loadSnapshotList();
            });
            observer.observe(dbPane, { attributes: true, attributeFilter: ['class'] });
        }

        // Preload admin configs from Supabase so they apply before processar()
        try {
            // Wait briefly for supabase client to initialize
            await new Promise(r => setTimeout(r, 800));
            const sb = window.supabaseClient || window.supabase;
            if (!sb) return;

            // 1. Vehicle config overrides → window._apexAdminVehicleConfig
            const { data: vcData } = await sb.from('apex_admin_config')
                .select('config_value').eq('config_key', 'vehicle_config').single();
            if (vcData?.config_value) {
                window._apexAdminVehicleConfig = vcData.config_value;
            }

            // 2. Route overrides → apply to rotaVeiculoMap when it's ready
            const { data: routeData } = await sb.from('apex_admin_config')
                .select('config_value').eq('config_key', 'route_overrides').single();
            if (routeData?.config_value && Object.keys(routeData.config_value).length > 0) {
                window._apexAdminRouteOverrides = routeData.config_value;
                // Apply to rotaVeiculoMap if already loaded
                if (window.rotaVeiculoMap) {
                    for (const [code, type] of Object.entries(routeData.config_value)) {
                        if (window.rotaVeiculoMap[code]) window.rotaVeiculoMap[code].type = type;
                    }
                }
            }
            // 3. Fiorino cities extra → patch rotasEspeciaisFiorino
            const { data: fcData } = await sb.from('apex_admin_config')
                .select('config_value').eq('config_key', 'fiorino_cities_extra').single();
            if (fcData?.config_value && Object.keys(fcData.config_value).length > 0) {
                window._apexFiorinoCitiesExtra = fcData.config_value;
                if (window.rotasEspeciaisFiorino) {
                    for (const [code, cities] of Object.entries(fcData.config_value)) {
                        window.rotasEspeciaisFiorino[code] = cities;
                    }
                }
            }

            // 4. Special clients extra → append to specialClientNames
            const { data: scData } = await sb.from('apex_admin_config')
                .select('config_value').eq('config_key', 'special_clients_extra').single();
            if (scData?.config_value && Array.isArray(scData.config_value)) {
                window._apexSpecialClientsLocal = scData.config_value;
                if (window.specialClientNames) {
                    scData.config_value.forEach(n => {
                        if (!window.specialClientNames.includes(n)) window.specialClientNames.push(n);
                    });
                }
            }

            // 5. Agendamento overrides → apply to agendamentoClientCodes Set
            const { data: agData } = await sb.from('apex_admin_config')
                .select('config_value').eq('config_key', 'agendamento_overrides').single();
            if (agData?.config_value && typeof agData.config_value === 'object') {
                window._apexAgendamentoOverrides = agData.config_value;
                if (window.agendamentoClientCodes) {
                    for (const [code, val] of Object.entries(agData.config_value)) {
                        if (val === 'Sim') window.agendamentoClientCodes.add(code);
                        else window.agendamentoClientCodes.delete(code);
                    }
                }
            }

            // 6. Client observations → make available for renderLoadCard
            const { data: coData } = await sb.from('apex_admin_config')
                .select('config_value').eq('config_key', 'client_observations').single();
            if (coData?.config_value && typeof coData.config_value === 'object') {
                window._apexClientObservations = coData.config_value;
            }
        } catch (e) {
            // Silent fail — admin preload is non-critical
        }

        // MutationObserver: applies client observation notes whenever new load cards appear
        function applyClientObservations() {
            const obs = window._apexClientObservations || {};
            if (Object.keys(obs).length === 0) return;
            document.querySelectorAll('[id^="apex-obs-"]').forEach(div => {
                if (div.dataset.apexObsApplied) return;
                // Read client codes embedded at render time via data-clients attribute
                const clientCodes = [...new Set((div.dataset.clients || '').split(',').filter(Boolean))];
                const notes = clientCodes.filter(c => obs[c]).map(c =>
                    `<div class="apex-client-obs-badge"><i class="bi bi-info-circle-fill me-1"></i><strong>Cod ${c}:</strong> ${obs[c]}</div>`
                ).join('');
                if (notes) {
                    div.innerHTML = notes;
                    div.style.display = 'block';
                }
                div.dataset.apexObsApplied = '1';
            });
        }

        // Watch all resultado containers for new cards
        const resultContainers = document.querySelectorAll(
            '#botoes-fiorino, #botoes-van, #botoes-34, #resultado-toco, ' +
            '#resultado-fiorino-geral, #resultado-van-geral, #resultado-34-geral'
        );
        const obsObserver = new MutationObserver(() => applyClientObservations());
        resultContainers.forEach(el => {
            if (el) obsObserver.observe(el, { childList: true, subtree: true });
        });
        // Also expose it so admin panel can trigger re-apply after saving
        window._apexApplyClientObservations = applyClientObservations;
    });

    // ─── Expose global API for other scripts ──────────────────────────────────
    window.apexAdmin = {
        loadAdminData,
        loadRotasData,
        loadConfigData,
        loadHealthData,
        getRouteOverrides: async () => {
            const sb = window.supabaseClient || window.supabase;
            const { data } = await sb.from('apex_admin_config').select('config_value').eq('config_key', 'route_overrides').single();
            return data?.config_value || {};
        },
        getVehicleConfig: async () => {
            const sb = window.supabaseClient || window.supabase;
            const { data } = await sb.from('apex_admin_config').select('config_value').eq('config_key', 'vehicle_config').single();
            return data?.config_value || null;
        },
        getModulesEnabled: async () => {
            const sb = window.supabaseClient || window.supabase;
            const { data } = await sb.from('apex_admin_config').select('config_value').eq('config_key', 'modules_enabled').single();
            return data?.config_value || {};
        },
        logLastProcessar: async () => {
            const sb = window.supabaseClient || window.supabase;
            const ts = new Date().toLocaleString('pt-BR');
            await sb.from('apex_admin_config').upsert({ config_key: 'last_processar', config_value: `"${ts}"`, updated_at: new Date().toISOString() }, { onConflict: 'config_key' });
        }
    };

    // ─── Bootstrap Focus Trap Bypass ─────────────────────────────────────────
    // Previne que modais do Bootstrap roubem o foco dos inputs do Command Center
    document.addEventListener('focusin', function (e) {
        const cc = document.getElementById('apex-command-center');
        const pin = document.getElementById('apex-pin-modal');
        if ((cc && cc.contains(e.target)) || (pin && pin.contains(e.target))) {
            e.stopImmediatePropagation();
        }
    }, true);


    // Initial check for persisted session
    document.addEventListener('DOMContentLoaded', () => {
        const isUnlocked = localStorage.getItem('apexAdminUnlocked') === 'true';
        const sessionTime = parseInt(localStorage.getItem('apexAdminSessionTime') || '0');
        const now = Date.now();

        // Session valid for 24 hours
        if (isUnlocked && (now - sessionTime < 1000 * 60 * 60 * 24)) {
            adminUnlocked = true;
            console.log('APEX: Painel Restaurado');
            const savedTab = localStorage.getItem('apexAdminTab') || 'banco';
            // Open silently
            const cc = document.getElementById('apex-command-center');
            if (cc) {
                cc.style.display = 'flex';
                setTimeout(() => cc.classList.add('visible'), 10);
                setTimeout(() => window.switchAdminTab(savedTab), 100);
            }
        } else {
            localStorage.removeItem('apexAdminUnlocked');
            localStorage.removeItem('apexAdminSessionTime');
        }
    });

})();
