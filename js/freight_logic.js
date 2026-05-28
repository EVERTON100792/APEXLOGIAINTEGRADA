
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
            { max: 100, value: 305.40 },
            { max: 150, value: 375.54 },
            { max: 200, value: 434.86 },
            { max: 300, value: 524.09 },
            { max: 400, value: 624.14 },
            { max: 500, value: 753.30 }
        ],
        exceedingRate: 1.80
    },
    tresQuartos: {
        ranges: [
            { max: 100, value: 516.59 },
            { max: 150, value: 583.27 },
            { max: 200, value: 665.52 },
            { max: 300, value: 753.73 },
            { max: 400, value: 887.63 },
            { max: 500, value: 1050.29 }
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
            .select('config_json')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            // Se o erro for "zero rows", é normal na primeira vez
            if (error.code !== 'PGRST116') console.warn("Supabase load error:", error);
            return null;
        }
        return data?.config_json;
    } catch (e) {
        console.error("Erro ao conectar Supabase:", e);
        return null;
    }
}

async function loadFreightConfig() {
    try {
        // 1. Tenta carregar do Supabase (prioridade)
        const cloudConfig = await getFreightConfigFromSupabase();

        if (cloudConfig) {
            freightTables = cloudConfig;
            console.log("Configuração de fretes carregada do Supabase.");
            // Atualiza localStorage para manter sincronia offline
            localStorage.setItem('apexFreightTables', JSON.stringify(freightTables));
        } else {
            // 2. Fallback para LocalStorage
            const stored = localStorage.getItem('apexFreightTables');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && parsed.fiorino && parsed.van) {
                    freightTables = parsed;
                    console.log("Configuração de fretes carregada do armazenamento local.");
                }
            }
        }
    } catch (e) {
        console.error("Erro ao carregar fretes:", e);
    }
}

function getFreightConfig() {
    // Retorna a estrutura adaptada para a UI antiga, mas baseada nos dados reais de 'freightTables'
    // Isso garante que os inputs mostrem os valores reais de taxa excedente
    return {
        fiorino: {
            limit: freightTables.fiorino.ranges[0].max,
            fixed: freightTables.fiorino.ranges[0].value,
            rate: freightTables.fiorino.exceedingRate
        },
        van: {
            limit: 500, // Fixo conforme tabela imagem
            tableValue: 0, // Não usado na edição simples
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

async function saveFreightConfig() {
    try {
        // 1. Atualiza Fiorino (Simples)
        const fiorinoLimit = parseFloat(document.getElementById('fiorinoLimit').value);
        const fiorinoFixed = parseFloat(document.getElementById('fiorinoFixed').value);
        const fiorinoRate = parseFloat(document.getElementById('fiorinoRate').value);

        if (!isNaN(fiorinoLimit)) freightTables.fiorino.ranges[0].max = fiorinoLimit;
        if (!isNaN(fiorinoFixed)) freightTables.fiorino.ranges[0].value = fiorinoFixed;
        if (!isNaN(fiorinoRate)) freightTables.fiorino.exceedingRate = fiorinoRate;

        // 2. Atualiza Outros (Apenas Taxa Excedente por enquanto, pois a tabela é complexa)
        const updateComplexVehicle = (idRate, type) => {
            const valRate = parseFloat(document.getElementById(idRate).value);
            if (!isNaN(valRate)) freightTables[type].exceedingRate = valRate;
        };

        updateComplexVehicle('vanRate', 'van');
        updateComplexVehicle('truck34Rate', 'tresQuartos');
        updateComplexVehicle('tocoRate', 'toco');

        // 3. Salva no LocalStorage
        localStorage.setItem('apexFreightTables', JSON.stringify(freightTables));

        // 4. Salva no Supabase
        const sb = window.supabaseClient || window.supabase;
        if (sb && sb.auth) {
            const user = await sb.auth.getUser();
            if (user && user.data && user.data.user) {
                const { error } = await sb
                    .from('freight_configs')
                    .insert([
                        {
                            config_json: freightTables,
                            updated_by: user.data.user.id
                        }
                    ]);
                // Nota: Idealmente seria um UPSERT ou Update do ID existente, 
                // mas Insert com Order By desc no Load funciona como log de histórico.

                if (error) console.error("Erro ao salvar no Supabase:", error);
                else console.log("Configuração salva no Supabase.");
            }
        }

        // Atualiza UI e Recalcula
        updateFreightTableUI();
        recalcAllFreights();

        if (typeof showToast === 'function') {
            showToast("Valores de frete atualizados e salvos (Nuvem + Local)!", "success");
        }
    } catch (e) {
        console.error("Erro ao salvar valores:", e);
        if (typeof showToast === 'function') showToast("Erro ao salvar valores.", "error");
    }
}

function updateFreightTableUI() {
    try {
        const config = getFreightConfig();

        // Popula Inputs
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = typeof val === 'number' ? val.toFixed(2).replace('.00', '') : val;
        };

        setVal('fiorinoLimit', config.fiorino.limit);
        setVal('fiorinoFixed', config.fiorino.fixed);
        setVal('fiorinoRate', config.fiorino.rate);

        // Para os complexos, mostramos apenas a taxa e limitamos a edição da 'tableValue'
        setVal('vanLimit', 500);
        setVal('vanRate', config.van.rate);
        const vanTableInput = document.getElementById('vanTableValue');
        if (vanTableInput) { vanTableInput.value = ''; vanTableInput.placeholder = 'Ver Tabela (Fixo)'; vanTableInput.disabled = true; }

        setVal('truck34Limit', 500);
        setVal('truck34Rate', config.tresQuartos.rate);
        const t34TableInput = document.getElementById('truck34TableValue');
        if (t34TableInput) { t34TableInput.value = ''; t34TableInput.placeholder = 'Ver Tabela (Fixo)'; t34TableInput.disabled = true; }

        setVal('tocoLimit', 500);
        setVal('tocoRate', config.toco.rate);
        const tocoTableInput = document.getElementById('tocoTableValue');
        if (tocoTableInput) { tocoTableInput.value = ''; tocoTableInput.placeholder = 'Ver Tabela (Fixo)'; tocoTableInput.disabled = true; }


        // Popula Tabela Visual (Resumo)
        const tbody = document.getElementById('freight-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td><i class="bi bi-truck me-2 text-success"></i>Fiorino</td>
                    <td>Até ${config.fiorino.limit}km: Fixo<br>Acima: R$ ${config.fiorino.rate}/km</td>
                    <td><strong>R$ ${config.fiorino.fixed.toFixed(2)}</strong> (Fixo)<br><span class="text-muted">Excedente: R$ ${config.fiorino.rate} / km</span></td>
                </tr>
                <tr>
                    <td><i class="bi bi-truck-front me-2 text-primary"></i>Van</td>
                    <td>Até 500km (Tabela Progressiva)</td>
                    <td><strong>Ver Tabela Detalhada</strong><br><span class="text-muted">Acima 500km: R$ ${config.van.rate} / km</span></td>
                </tr>
                <tr>
                    <td><i class="bi bi-truck-flatbed me-2 text-warning"></i>3/4</td>
                    <td>Até 500km (Tabela Progressiva)</td>
                    <td><strong>Ver Tabela Detalhada</strong><br><span class="text-muted">Acima 500km: R$ ${config.tresQuartos.rate} / km</span></td>
                </tr>
                <tr>
                    <td><i class="bi bi-inboxes-fill me-2 text-secondary"></i>Toco</td>
                    <td>Até 500km (Tabela Progressiva)</td>
                    <td><strong>Ver Tabela Detalhada</strong><br><span class="text-muted">Acima 500km: R$ ${config.toco.rate} / km</span></td>
                </tr>
            `;
        }
    } catch (e) {
        console.error("Erro ao atualizar UI de frete:", e);
    }
}

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
    const freightEl = document.getElementById(`freight-${loadId}`);
    if (!load || !freightEl) return;

    // Atualiza a distância no objeto load se fornecida
    if (distanceKm !== null) {
        console.log(`UpdateFreight: Recebido ${distanceKm}km para carga ${loadId} (${load.vehicleType})`);
        load.distanceKm = parseFloat(distanceKm);
        if (typeof debouncedSaveState === 'function') debouncedSaveState();
        else saveStateToLocalStorage();
    }


    if (load.distanceKm) {
        const freightValue = calculateFreightValue(load.vehicleType, load.distanceKm);
        load.freightValue = freightValue; // Salva valor calculado
        if (typeof debouncedSaveState === 'function') debouncedSaveState();
        else saveStateToLocalStorage();


        if (freightValue > 0) {
            freightEl.innerHTML = `<i class="bi bi-cash-stack me-1.5"></i>R$ ${freightValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span class="ms-1.5" style="font-size: 0.8em; opacity: 0.9; font-weight: 500; cursor: pointer; text-decoration: underline;" onclick="event.stopPropagation(); promptManualKm('${loadId}')" title="Clique para editar o KM manualmente">(${load.distanceKm} km)</span>`;
            freightEl.className = "load-meta-item badge bg-success text-white border border-success fw-bold ms-2";
            freightEl.style.cssText = "font-size: 1.05rem !important; padding: 6px 12px !important; border-radius: 6px !important; box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;";
        } else {
            // Se valor for 0 (ex: Van 'A combinar'), mostra texto informativo com KM
            freightEl.innerHTML = `<i class="bi bi-cash-stack me-1.5"></i>A Definir <span class="ms-1.5" style="font-size: 0.8em; opacity: 0.9; font-weight: 500; cursor: pointer; text-decoration: underline;" onclick="event.stopPropagation(); promptManualKm('${loadId}')" title="Clique para editar o KM manualmente">(${load.distanceKm} km)</span>`;
            freightEl.className = "load-meta-item badge bg-secondary text-white border border-secondary fw-bold ms-2";
            freightEl.style.cssText = "font-size: 1.05rem !important; padding: 6px 12px !important; border-radius: 6px !important; box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;";
        }
        freightEl.classList.remove('d-none');
    } else {
        // Se não tem distância e está calculando, mostra spinner
        if (load.isCalculatingFreight) {
            freightEl.innerHTML = `<i class="spinner-border spinner-border-sm me-1.5" role="status"></i>Calculando KM...`;
            freightEl.className = "load-meta-item badge bg-info text-white border border-info fw-normal ms-2";
            freightEl.style.cssText = "font-size: 1.0rem !important; padding: 6px 12px !important; border-radius: 6px !important;";
        } else {
            // Se não tem distância, mostra placeholder informativo amigável
            freightEl.innerHTML = `<i class="bi bi-calculator me-1.5"></i>Calc. KM p/ Frete`;
            freightEl.className = "load-meta-item badge bg-dark text-muted border border-secondary fw-normal ms-2";
            freightEl.style.cssText = "font-size: 0.95rem !important; padding: 6px 12px !important; border-radius: 6px !important; cursor: pointer; transition: all 0.2s;";
        }
        freightEl.classList.remove('d-none');
    }
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

