
// --- FREIGHT SYSTEM LOGIC ---

// --- FREIGHT SYSTEM LOGIC ---

// DEFINIÇÃO DAS TABELAS DE FRETE (Fonte: Imagens do Usuário)
// --- FREIGHT SYSTEM LOGIC ---

// DEFINIÇÃO DAS TABELAS DE FRETE (Fonte: Imagens do Usuário)
// Agora é um 'let' para permitir personalização via UI
let freightTables = {
    fiorino: {
        ranges: [
            { max: 150, value: 207.80 }
        ],
        exceedingRate: 1.40 // Valor por KM rodado se passar do limite máximo das faixas
    },
    van: {
        ranges: [
            { max: 100, value: 335.94 },
            { max: 150, value: 413.09 },
            { max: 200, value: 478.35 },
            { max: 300, value: 576.50 },
            { max: 400, value: 686.55 },
            { max: 500, value: 828.63 }
        ],
        exceedingRate: 1.80
    },
    tresQuartos: {
        ranges: [
            { max: 100, value: 568.25 },
            { max: 150, value: 641.60 },
            { max: 200, value: 732.07 },
            { max: 300, value: 829.10 },
            { max: 400, value: 976.39 },
            { max: 500, value: 1155.32 }
        ],
        exceedingRate: 2.85
    },
    toco: {
        ranges: [
            { max: 100, value: 636.00 },
            { max: 150, value: 732.38 },
            { max: 200, value: 828.74 },
            { max: 300, value: 963.65 },
            { max: 400, value: 1117.84 },
            { max: 500, value: 1310.58 }
        ],
        exceedingRate: 3.53
    }
};

// Carrega configurações ao iniciar
loadFreightConfig();

async function getFreightConfigFromSupabase() {
    try {
        const sb = window.supabaseClient || window.supabase; // Fallback ou uso do client correto
        if (!sb || !sb.auth) return null; // Verifica se tem .auth (é o client inicializado)

        const user = await sb.auth.getUser();
        if (!user || !user.data || !user.data.user) return null;

        // Tenta buscar a configuração mais recente (assumindo uma global ou por usuário)
        // Por simplicidade, pega a última criada/atualizada
        const { data, error } = await sb
            .from('freight_configs')
            .select('config_data')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            // Se o erro for "zero rows", é normal na primeira vez
            if (error.code !== 'PGRST116') console.warn("Supabase load error:", error);
            return null;
        }
        return data?.config_data;
    } catch (e) {
        console.error("Erro ao conectar Supabase:", e);
        return null;
    }
}

/**
 * Mescla a configuração carregada (do banco ou local) com a configuração do código,
 * garantindo compatibilidade e resiliência das chaves e faixas.
 */
function mergeFreightConfig(loaded) {
    if (!loaded) return;
    
    const keys = ['fiorino', 'van', 'tresQuartos', 'toco'];
    
    keys.forEach(key => {
        if (!loaded[key]) return;
        
        // Carrega taxa excedente
        if (loaded[key].exceedingRate !== undefined) {
            freightTables[key].exceedingRate = loaded[key].exceedingRate;
        }
        
        // Carrega faixas
        if (loaded[key].ranges && Array.isArray(loaded[key].ranges)) {
            loaded[key].ranges.forEach((range, idx) => {
                if (freightTables[key].ranges[idx]) {
                    freightTables[key].ranges[idx].value = range.value;
                    if (range.max !== undefined && key === 'fiorino') {
                        // Apenas a Fiorino tem o limite da faixa editável na UI original
                        freightTables[key].ranges[idx].max = range.max;
                    }
                }
            });
        }
    });
}

async function loadFreightConfig() {
    try {
        // 1. Tenta carregar do Supabase (prioridade)
        const cloudConfig = await getFreightConfigFromSupabase();

        if (cloudConfig) {
            mergeFreightConfig(cloudConfig);
            console.log("Configuração de fretes carregada do Supabase.");
            // Atualiza localStorage para manter sincronia offline
            localStorage.setItem('apexFreightTables', JSON.stringify(freightTables));
        } else {
            // 2. Fallback para LocalStorage
            const stored = localStorage.getItem('apexFreightTables');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && parsed.fiorino && parsed.van) {
                    mergeFreightConfig(parsed);
                    console.log("Configuração de fretes carregada do armazenamento local.");
                }
            }
        }
        
        // Preenche o painel visual
        updateFreightTableUI();
    } catch (e) {
        console.error("Erro ao carregar fretes:", e);
    }
}

function getFreightConfig() {
    return {
        fiorino: {
            limit: freightTables.fiorino.ranges[0].max,
            fixed: freightTables.fiorino.ranges[0].value,
            rate: freightTables.fiorino.exceedingRate
        },
        van: {
            limit: 500,
            tableValue: 0,
            rate: freightTables.van.exceedingRate
        },
        tresQuartos: {
            limit: 500,
            tableValue: 0,
            rate: freightTables.tresQuartos.exceedingRate
        },
        toco: {
            limit: 500,
            tableValue: 0,
            rate: freightTables.toco.exceedingRate
        }
    };
}

/**
 * Renderiza dinamicamente as tabelas e campos de faixas de frete
 * na aba "Configurar Valores" do modal.
 */
function renderFreightConfigForm() {
    const container = document.getElementById('dynamic-freight-config-container');
    if (!container) return;

    let html = '';
    const vehiclesInfo = {
        fiorino: { name: 'Fiorino', colorClass: 'border-success', headerBg: 'bg-success text-white', isSimple: true },
        van: { name: 'Van', colorClass: 'border-primary', headerBg: 'bg-primary text-white', isSimple: false },
        tresQuartos: { name: '3/4 (Truck)', colorClass: 'border-warning', headerBg: 'bg-warning text-dark', isSimple: false },
        toco: { name: 'Toco', colorClass: 'border-secondary', headerBg: 'bg-secondary text-white', isSimple: false }
    };

    Object.entries(vehiclesInfo).forEach(([key, info]) => {
        const table = freightTables[key];
        if (!table) return;

        // Cabeçalho e Taxa Excedente / Fixo dependendo do veículo
        let inputsHtml = '';
        if (key === 'fiorino') {
            inputsHtml = `
                <div class="row g-2 mb-3">
                    <div class="col-md-4">
                        <label class="form-label small text-muted fw-bold mb-1">Limite Km (Fixo)</label>
                        <input type="number" class="form-control form-control-sm bg-dark border-secondary text-light font-monospace" 
                               id="${key}-limit-0" step="1" value="${table.ranges[0].max}">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small text-muted fw-bold mb-1">Valor Fixo (R$)</label>
                        <input type="number" class="form-control form-control-sm bg-dark border-secondary text-light font-monospace" 
                               id="${key}-val-0" step="0.01" value="${table.ranges[0].value}">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small text-muted fw-bold mb-1">Taxa/Km Excedente</label>
                        <input type="number" class="form-control form-control-sm bg-dark border-secondary text-light font-monospace" 
                               id="${key}-exceeding-rate" step="0.01" value="${table.exceedingRate}">
                    </div>
                </div>
            `;
        } else {
            inputsHtml = `
                <div class="row g-2 mb-3">
                    <div class="col-md-6 col-lg-4">
                        <label class="form-label small text-muted fw-bold mb-1">Taxa/Km Excedente (R$)</label>
                        <input type="number" class="form-control form-control-sm bg-dark border-secondary text-light font-monospace" 
                               id="${key}-exceeding-rate" step="0.01" value="${table.exceedingRate}">
                    </div>
                </div>
            `;
        }

        // Seção das faixas de frete
        let rangesTableRows = '';
        if (key !== 'fiorino') {
            table.ranges.forEach((range, idx) => {
                const labelDist = idx === 0 
                    ? `Até ${range.max} km` 
                    : `${table.ranges[idx-1].max + 1} a ${range.max} km`;

                rangesTableRows += `
                    <tr>
                        <td class="small fw-semibold text-light align-middle" style="width: 40%;">${labelDist}</td>
                        <td style="width: 60%;">
                            <div class="input-group input-group-sm" style="max-width: 160px;">
                                <span class="input-group-text bg-dark-subtle border-secondary text-muted" style="font-size: 0.75rem;">R$</span>
                                <input type="number" class="form-control bg-dark border-secondary text-light text-end font-monospace" 
                                       id="${key}-range-val-${idx}" step="0.01" value="${range.value}">
                            </div>
                        </td>
                    </tr>
                `;
            });
        }

        let rangesSectionHtml = '';
        if (key !== 'fiorino') {
            rangesSectionHtml = `
                <h6 class="text-secondary small fw-bold text-uppercase border-bottom border-secondary-subtle pb-1 mb-2 mt-3" style="font-size: 0.75rem;">Faixas de Frete Progressivo</h6>
                <div class="table-responsive">
                    <table class="table table-sm table-dark table-borderless align-middle mb-0" style="background: transparent;">
                        <tbody>
                            ${rangesTableRows}
                        </tbody>
                    </table>
                </div>
            `;
        }

        html += `
        <div class="card mb-3 ${info.colorClass}" style="background: rgba(25, 25, 30, 0.4); border: 1px solid rgba(255,255,255,0.06);">
            <div class="card-header ${info.headerBg} py-1 fw-semibold" style="font-size: 0.85rem;">
                ${info.name}
            </div>
            <div class="card-body py-2">
                ${inputsHtml}
                ${rangesSectionHtml}
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
}

async function saveFreightConfig() {
    try {
        const keys = ['fiorino', 'van', 'tresQuartos', 'toco'];
        
        keys.forEach(key => {
            const table = freightTables[key];
            if (!table) return;

            // 1. Salva a taxa excedente (comum a todos)
            const rateInput = document.getElementById(`${key}-exceeding-rate`);
            if (rateInput) {
                const rateVal = parseFloat(rateInput.value);
                if (!isNaN(rateVal)) table.exceedingRate = rateVal;
            }

            // 2. Salva as faixas de distância
            if (key === 'fiorino') {
                const limitInput = document.getElementById('fiorino-limit-0');
                const valInput = document.getElementById('fiorino-val-0');
                if (limitInput) {
                    const limitVal = parseInt(limitInput.value);
                    if (!isNaN(limitVal)) table.ranges[0].max = limitVal;
                }
                if (valInput) {
                    const valVal = parseFloat(valInput.value);
                    if (!isNaN(valVal)) table.ranges[0].value = valVal;
                }
            } else {
                table.ranges.forEach((range, idx) => {
                    const rangeInput = document.getElementById(`${key}-range-val-${idx}`);
                    if (rangeInput) {
                        const val = parseFloat(rangeInput.value);
                        if (!isNaN(val)) range.value = val;
                    }
                });
            }
        });

        // 3. Salva no LocalStorage
        localStorage.setItem('apexFreightTables', JSON.stringify(freightTables));

        // 4. Salva no Supabase
        const sb = window.supabaseClient || window.supabase;
        let savedOnCloud = false;
        let cloudError = null;

        if (sb && sb.auth) {
            const user = await sb.auth.getUser();
            if (user && user.data && user.data.user) {
                const { error } = await sb
                    .from('freight_configs')
                    .insert([
                        {
                            config_data: freightTables,
                            user_id: user.data.user.id
                        }
                    ]);
                // Nota: Idealmente seria um UPSERT ou Update do ID existente, 
                // mas Insert com Order By desc no Load funciona como log de histórico.

                if (error) {
                    console.error("Erro ao salvar no Supabase:", error);
                    cloudError = error;
                } else {
                    console.log("Configuração salva no Supabase.");
                    savedOnCloud = true;
                }
            } else {
                console.warn("Usuário não autenticado no Supabase.");
                cloudError = { message: "Usuário não autenticado no Supabase." };
            }
        } else {
            console.warn("Cliente do Supabase não inicializado.");
            cloudError = { message: "Cliente do Supabase não inicializado." };
        }

        // Atualiza UI e Recalcula
        updateFreightTableUI();
        recalcAllFreights();

        if (typeof showToast === 'function') {
            if (savedOnCloud) {
                showToast("Valores de frete atualizados e salvos (Nuvem + Local)!", "success");
            } else {
                showToast(`Salvo localmente. Erro na Nuvem: ${cloudError?.message || 'Sem conexão com o Supabase'}`, "warning");
            }
        }
    } catch (e) {
        console.error("Erro ao salvar valores:", e);
        if (typeof showToast === 'function') showToast("Erro ao salvar valores: " + e.message, "error");
    }
}

function updateFreightTableUI() {
    try {
        const tbody = document.getElementById('freight-table-body');
        if (!tbody) return;

        let html = '';
        const vehiclesInfo = {
            fiorino: { name: 'Fiorino', icon: 'bi-truck', color: 'text-success' },
            van: { name: 'Van', icon: 'bi-truck-front', color: 'text-primary' },
            tresQuartos: { name: '3/4 (Truck)', icon: 'bi-truck-flatbed', color: 'text-warning' },
            toco: { name: 'Toco', icon: 'bi-inboxes-fill', color: 'text-secondary' }
        };

        Object.entries(vehiclesInfo).forEach(([key, info]) => {
            const table = freightTables[key];
            if (!table) return;

            let ruleText = '';
            let valuesText = '';

            if (key === 'fiorino') {
                const limit = table.ranges[0].max;
                const fixed = table.ranges[0].value;
                const rate = table.exceedingRate;
                ruleText = `Até ${limit}km: Fixo<br>Acima: R$ ${rate.toFixed(2)}/km`;
                valuesText = `<strong>R$ ${fixed.toFixed(2)}</strong> (Fixo)<br><span class="text-muted" style="font-size: 0.8em;">Excedente: R$ ${rate.toFixed(2)}/km</span>`;
            } else {
                ruleText = `<div class="d-flex flex-column gap-0.5" style="max-height: 120px; overflow-y: auto;">`;
                table.ranges.forEach((range, idx) => {
                    const labelDist = idx === 0 
                        ? `Até ${range.max} km` 
                        : `${table.ranges[idx-1].max + 1} a ${range.max} km`;
                    ruleText += `<span class="small text-muted" style="font-size: 0.75rem;">${labelDist}: <strong class="text-light">R$ ${range.value.toFixed(2)}</strong></span>`;
                });
                ruleText += `</div>`;
                
                valuesText = `<span class="fw-semibold text-light" style="font-size: 0.85rem;">Tabela Progressiva</span><br><span class="text-muted" style="font-size: 0.8em;">Acima 500km: R$ ${table.exceedingRate.toFixed(2)}/km</span>`;
            }

            html += `
                <tr>
                    <td class="fw-bold"><i class="bi ${info.icon} me-2 ${info.color}"></i>${info.name}</td>
                    <td>${ruleText}</td>
                    <td>${valuesText}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    } catch (e) {
        console.error("Erro ao atualizar UI de frete:", e);
    }
}

function generateFreightContainerHtml(load, vehicleType) {
    const distKm = load.distanceKm ? parseFloat(load.distanceKm) : null;
    const LIMITE_KM_RODADO = vehicleType === 'fiorino' ? 150 : 500;
    const isRodado = distKm !== null && distKm > LIMITE_KM_RODADO;
    
    // Título dinâmico: se passar do limite do veículo, exibe "Frete Rodado"
    const label = isRodado ? 'Frete Rodado' : 'Frete Dentro da Tabela';
    
    let valueHtml = "";
    if (distKm) {
        const freightValue = typeof calculateFreightValue === 'function' ? calculateFreightValue(vehicleType, distKm) : 0;
        
        if (isRodado) {
            // Acima do limite: Frete Rodado
            valueHtml = `
                <span class="load-meta-item badge bg-warning text-dark border border-warning fw-bold ms-2 no-print" style="font-size: 1.05rem !important; padding: 6px 12px !important; border-radius: 6px !important; cursor: pointer;" onclick="event.stopPropagation(); promptManualKm('${load.id}')">
                    <i class="bi bi-signpost-2 me-1.5"></i>${distKm} km<br>R$ _________________
                </span>
                <span class="print-only" style="display: none; font-size: 0.95rem; color: #111; font-weight: 600; line-height: 1.6;">
                    ${distKm} km<br>R$ _________________
                </span>
            `;
        } else if (freightValue > 0) {
            valueHtml = `
                <span id="freight-${load.id}" class="load-meta-item badge bg-success text-white border border-success fw-bold ms-2" style="font-size: 1.05rem !important; padding: 6px 12px !important; border-radius: 6px !important; cursor: pointer;" onclick="event.stopPropagation(); promptManualKm('${load.id}')" title="Clique para editar o KM manualmente">
                    <i class="bi bi-cash-stack me-1.5"></i>R$ ${freightValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span class="ms-1.5" style="font-size: 0.8em; opacity: 0.9; font-weight: 500; text-decoration: underline;">(${distKm} km)</span>
                </span>
            `;
        } else {
            valueHtml = `
                <span id="freight-${load.id}" class="load-meta-item badge bg-secondary text-white border border-secondary fw-bold ms-2" style="font-size: 1.05rem !important; padding: 6px 12px !important; border-radius: 6px !important; cursor: pointer;" onclick="event.stopPropagation(); promptManualKm('${load.id}')" title="Clique para editar o KM manualmente">
                    <i class="bi bi-cash-stack me-1.5"></i>A Definir <span class="ms-1.5" style="font-size: 0.8em; opacity: 0.9; font-weight: 500; text-decoration: underline;">(${distKm} km)</span>
                </span>
            `;
        }
    } else if (load.isCalculatingFreight) {
        valueHtml = `
            <span id="freight-${load.id}" class="load-meta-item badge bg-info text-white border border-info fw-normal ms-2" style="font-size: 1.0rem !important; padding: 6px 12px !important; border-radius: 6px !important; cursor: pointer;" onclick="event.stopPropagation(); promptManualKm('${load.id}')">
                <i class="spinner-border spinner-border-sm me-1.5" role="status"></i>Calculando KM...
            </span>
        `;
    } else {
        valueHtml = `
            <span id="freight-${load.id}" class="load-meta-item badge bg-dark text-muted border border-secondary fw-normal ms-2" style="font-size: 0.95rem !important; padding: 6px 12px !important; border-radius: 6px !important; cursor: pointer; transition: all 0.2s;" onclick="event.stopPropagation(); promptManualKm('${load.id}')">
                <i class="bi bi-calculator me-1.5"></i>Calc. KM p/ Frete
            </span>
        `;
    }

    return `
        <span class="metric-label">${label}</span>
        ${valueHtml}
    `;
}
window.generateFreightContainerHtml = generateFreightContainerHtml;

function calculateFreightValue(vehicleType, distanceKm) {
    if (!distanceKm || distanceKm <= 0) return 0;

    // Normaliza o tipo de veículo para chave da tabela
    // Ex: 'fiorino' -> 'fiorino', 'toco' -> 'toco'
    const table = freightTables[vehicleType];

    if (!table) {
        console.warn(`Tabela de frete não encontrada para: ${vehicleType}`);
        return 0;
    }

    // 1. Verificar se está dentro das faixas
    // As faixas devem estar ordenadas por 'max'
    for (const range of table.ranges) {
        if (distanceKm <= range.max) {
            return range.value;
        }
    }

    // 2. Se passou de todas as faixas, regra de excedente
    // Regra: "Acima X KM será pago Y o KM Rodado" -> Valor Total = Distância * Taxa
    // Isso foi confirmado pela interpretação das imagens (ex: Van > 500km = R$ 1,80 KM Rodado)
    return distanceKm * table.exceedingRate;
}

function updateLoadFreightDisplay(loadId, distanceKm = null) {
    const load = activeLoads[loadId];
    const containerEl = document.getElementById(`freight-container-${loadId}`);
    if (!load || !containerEl) return;

    // Atualiza a distância no objeto load se fornecida
    if (distanceKm !== null) {
        console.log(`UpdateFreight: Recebido ${distanceKm}km para carga ${loadId} (${load.vehicleType})`);
        load.distanceKm = parseFloat(distanceKm);
        if (typeof debouncedSaveState === 'function') debouncedSaveState();
        else saveStateToLocalStorage();
    }

    if (load.distanceKm) {
        load.freightValue = calculateFreightValue(load.vehicleType, parseFloat(load.distanceKm));
        if (typeof debouncedSaveState === 'function') debouncedSaveState();
        else saveStateToLocalStorage();
    }

    containerEl.innerHTML = generateFreightContainerHtml(load, load.vehicleType);
}



function recalcAllFreights() {
    Object.keys(activeLoads).forEach(loadId => {
        const load = activeLoads[loadId];
        if (load.distanceKm) {
            updateLoadFreightDisplay(loadId);
        }
    });
}

async function promptManualKm(loadId) {
    const load = activeLoads[loadId];
    if (!load) return;
    
    const currentKm = load.distanceKm || '';
    const loadNum = load.numero || load.id.split('-').pop();
    
    const input = await showCustomPrompt({
        title: `Ajustar KM Manualmente`,
        description: `Insira a quilometragem (KM) calculada pelo Google Maps para a carga ${loadNum}:`,
        defaultValue: String(currentKm),
        placeholder: `Ex: 593.1`,
        confirmText: `Confirmar`,
        cancelText: `Cancelar`
    });
    
    if (input === null) return; // Cancelado pelo usuário
    
    const parsedKm = parseFloat(input.replace(',', '.'));
    if (isNaN(parsedKm) || parsedKm < 0) {
        if (typeof showToast === 'function') showToast("KM inválido inserido.", "error");
        else alert("KM inválido inserido.");
        return;
    }
    
    updateLoadFreightDisplay(loadId, parsedKm);
    if (typeof showToast === 'function') {
        showToast(`Quilometragem atualizada para ${parsedKm} km.`, "success");
    }
}

/**
 * Exibe um modal popup customizado e estilizado (estilo glassmorphism) 
 * substituindo o prompt padrão do navegador.
 */
function showCustomPrompt(options) {
    return new Promise((resolve) => {
        // Criar o fundo (overlay) com desfoque
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 10, 12, 0.75);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            opacity: 0;
            transition: opacity 0.2s ease-out;
        `;

        // Card do Modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: rgba(28, 28, 33, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 24px;
            width: 90%;
            max-width: 420px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
            transform: scale(0.92);
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            color: #f5f5f7;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
        `;

        // Título
        const title = document.createElement('h3');
        title.style.cssText = `
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 1.2rem;
            font-weight: 600;
            color: #ffffff;
            letter-spacing: -0.01em;
        `;
        title.innerText = options.title || 'Ajustar KM';

        // Descrição
        const description = document.createElement('p');
        description.style.cssText = `
            font-size: 0.88rem;
            color: #a1a1a6;
            margin-bottom: 20px;
            line-height: 1.45;
        `;
        description.innerText = options.description || '';

        // Input Wrapper
        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = `
            margin-bottom: 24px;
            position: relative;
        `;

        // Input
        const input = document.createElement('input');
        input.type = 'text';
        input.value = options.defaultValue || '';
        input.placeholder = options.placeholder || '';
        input.style.cssText = `
            width: 100%;
            padding: 12px 14px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            color: #ffffff;
            font-size: 1.1rem;
            font-weight: 500;
            outline: none;
            transition: all 0.2s ease;
            box-sizing: border-box;
            text-align: center;
        `;
        
        // Efeitos de foco no input
        input.addEventListener('focus', () => {
            input.style.borderColor = '#ffc107'; // Destaque em amarelo/laranja combinando com o sistema
            input.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.2)';
            input.style.background = 'rgba(0, 0, 0, 0.5)';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            input.style.boxShadow = 'none';
            input.style.background = 'rgba(0, 0, 0, 0.3)';
        });

        // Botões de Ação
        const actions = document.createElement('div');
        actions.style.cssText = `
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        `;

        // Botão Cancelar
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.innerText = options.cancelText || 'Cancelar';
        cancelBtn.style.cssText = `
            padding: 10px 18px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            color: #e5e5ea;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = 'rgba(255, 255, 255, 0.12)';
            cancelBtn.style.color = '#ffffff';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = 'rgba(255, 255, 255, 0.08)';
            cancelBtn.style.color = '#e5e5ea';
        });

        // Botão Confirmar
        const confirmBtn = document.createElement('button');
        confirmBtn.type = 'button';
        confirmBtn.innerText = options.confirmText || 'Confirmar';
        confirmBtn.style.cssText = `
            padding: 10px 22px;
            background: linear-gradient(135deg, #ff9f0a, #ff3b30);
            border: none;
            border-radius: 8px;
            color: #ffffff;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(255, 159, 10, 0.25);
        `;
        confirmBtn.addEventListener('mouseenter', () => {
            confirmBtn.style.transform = 'translateY(-1px)';
            confirmBtn.style.boxShadow = '0 6px 16px rgba(255, 159, 10, 0.35)';
        });
        confirmBtn.addEventListener('mouseleave', () => {
            confirmBtn.style.transform = 'none';
            confirmBtn.style.boxShadow = '0 4px 12px rgba(255, 159, 10, 0.25)';
        });

        // Montagem da árvore do DOM
        inputContainer.appendChild(input);
        modal.appendChild(title);
        if (options.description) {
            modal.appendChild(description);
        }
        modal.appendChild(inputContainer);
        actions.appendChild(cancelBtn);
        actions.appendChild(confirmBtn);
        modal.appendChild(actions);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Animação de entrada
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        });

        // Autoselecionar texto para edição imediata
        setTimeout(() => {
            input.focus();
            input.select();
        }, 50);

        // Lógica de encerramento do modal
        const close = (value) => {
            overlay.style.opacity = '0';
            modal.style.transform = 'scale(0.92)';
            setTimeout(() => {
                overlay.remove();
                resolve(value);
            }, 200);
        };

        // Eventos
        confirmBtn.addEventListener('click', () => {
            close(input.value);
        });
        
        cancelBtn.addEventListener('click', () => {
            close(null);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                close(input.value);
            } else if (e.key === 'Escape') {
                close(null);
            }
        });

        // Fechar ao clicar fora do modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                close(null);
            }
        });
    });
}

