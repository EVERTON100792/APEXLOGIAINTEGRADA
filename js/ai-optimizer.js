// js/ai-optimizer.js

// Configuração padrão da IA
const defaultAiSettings = {
    apiKey: '',
    model: 'gpt-5.6-luna',
    endpoint: 'https://opencode.ai/zen/go/v1/chat/completions',
    enabled: false
};

// Carregar configurações salvas
function getAiSettings() {
    const saved = localStorage.getItem('apexLogAiSettings');
    return saved ? JSON.parse(saved) : { ...defaultAiSettings };
}

// Salvar configurações
function saveAiSettings(settings) {
    localStorage.setItem('apexLogAiSettings', JSON.stringify(settings));
}

// Lógica de Interface
function initAiUi() {
    const settings = getAiSettings();
    const toggle = document.getElementById('aiEnabledToggle');
    const apiKeyInput = document.getElementById('aiApiKey');
    const modelSelect = document.getElementById('aiModelSelect');

    if (toggle) toggle.checked = settings.enabled;
    if (apiKeyInput) apiKeyInput.value = settings.apiKey;
    if (modelSelect) modelSelect.value = settings.model;
}

window.toggleAiEngine = function() {
    const toggle = document.getElementById('aiEnabledToggle');
    const settings = getAiSettings();
    settings.enabled = toggle.checked;
    saveAiSettings(settings);
    
    // Mostra um toast ou alerta visual (se a função showToast existir no escopo global)
    if (typeof showToast === 'function') {
        showToast(`Inteligência Artificial ${settings.enabled ? 'ATIVADA' : 'DESATIVADA'}!`, settings.enabled ? 'success' : 'warning');
    }
}

window.saveAiUiSettings = function() {
    const toggle = document.getElementById('aiEnabledToggle');
    const apiKeyInput = document.getElementById('aiApiKey');
    const modelSelect = document.getElementById('aiModelSelect');
    
    const selectedModel = modelSelect.value;
    let endpointUrl = 'https://opencode.ai/zen/go/v1/chat/completions';
    
    // Alguns modelos da OpenCode exigem um endpoint diferente segundo a documentação
    if (selectedModel === 'grok-4.5' || selectedModel === 'gpt-5.6-luna') {
        endpointUrl = 'https://opencode.ai/zen/go/v1/responses';
    }

    const settings = {
        enabled: toggle.checked,
        apiKey: apiKeyInput.value.trim(),
        model: selectedModel,
        endpoint: endpointUrl
    };
    
    saveAiSettings(settings);
    if (typeof showToast === 'function') {
        showToast("Configurações da IA salvas com sucesso!", "success");
    }
}

// Inicializar a UI quando o DOM carregar
document.addEventListener('DOMContentLoaded', initAiUi);

/**
 * Monta as cargas usando IA da OpenCode
 * @param {Array} pedidos - Lista de pedidos brutos a serem roteirizados.
 * @param {Object} vehicleConfigs - Capacidades dos caminhões (min/max kg e cubagem).
 * @param {Object} rotasVeiculoMap - Mapeamento de rotas e tipos de veículos preferenciais.
 * @param {String} baseVehicleType - Tipo de veículo padrão para a rota (fiorino, van, tresQuartos).
 * @returns {Promise<Object>} Resultado otimizado JSON gerado pela IA.
 */
async function runAIOptimization(pedidos, vehicleConfigs, rotasVeiculoMap, baseVehicleType) {
    const settings = getAiSettings();

    if (!settings.enabled || !settings.apiKey) {
        throw new Error('A Otimização por IA não está ativada ou a chave da API está ausente.');
    }

    // Preparando os dados de forma otimizada para economizar tokens
    const dadosOtimizados = pedidos.map(p => ({
        id: p.Pedido, // Assume que 'Pedido' é o identificador único
        cli: p.Nome_Cliente || p.Cliente, // Nome do cliente para agrupar
        rota: p.Cod_Rota,
        kg: parseFloat(p.Quilos_Saldo).toFixed(2),
        m3: parseFloat(p.Cubagem).toFixed(2)
    }));

    // Normalizando configs para a IA entender melhor
    const estruturedConfigs = {
        fiorino: { maxKg: vehicleConfigs.fiorinoHardMaxCapacity || vehicleConfigs.fiorinoMaxCapacity, maxM3: vehicleConfigs.fiorinoHardCubage || vehicleConfigs.fiorinoCubage },
        van: { maxKg: vehicleConfigs.vanHardMaxCapacity || vehicleConfigs.vanMaxCapacity, maxM3: vehicleConfigs.vanHardCubage || vehicleConfigs.vanCubage },
        tresQuartos: { maxKg: vehicleConfigs.tresQuartosHardMaxCapacity || vehicleConfigs.tresQuartosMaxCapacity, maxM3: vehicleConfigs.tresQuartosHardCubage || vehicleConfigs.tresQuartosCubage },
        toco: { maxKg: vehicleConfigs.tocoHardMaxCapacity || vehicleConfigs.tocoMaxCapacity, maxM3: vehicleConfigs.tocoHardCubage || vehicleConfigs.tocoCubage }
    };

    // Extrai APENAS a configuração do veículo alvo para focar a IA
    const targetConfig = estruturedConfigs[baseVehicleType];

    const systemPrompt = `
Você é um Profissional de Logística Sênior com 20 anos de experiência (Especialista em Roteirização e Bin Packing 3D).
Sua missão EXCLUSIVA é agrupar os pedidos formando cargas APENAS para veículos do tipo "${baseVehicleType}".

LIMITE MATEMÁTICO INVIOLÁVEL PARA CADA CARGA:
- Peso Máximo: ${targetConfig.maxKg} KG
- Cubagem Máxima: ${targetConfig.maxM3} M3

REGRA 1 - AGRUPAMENTO OBRIGATÓRIO:
Sempre agrupe pedidos do MESMO CLIENTE (mesmo "cli") na mesma carga. Não separe pedidos do mesmo cliente.

REGRA 2 - FOCO ÚNICO:
Você SÓ TEM PERMISSÃO para criar cargas do tipo "${baseVehicleType}". NÃO crie cargas de outros tipos. 
Se um cliente (ou grupo de clientes) for maior que o limite de ${targetConfig.maxKg} KG, ou se simplesmente não couber de forma otimizada em nenhuma carga, jogue OBRIGATORIAMENTE na lista "pedidos_nao_alocados".

REGRA 3 - OTIMIZAÇÃO:
Preencha as cargas chegando o mais perto possível do Peso Máximo, combinando clientes diferentes se necessário, desde que não estoure o limite.

Você DEVE retornar APENAS um JSON estrito neste formato exato (sem texto adicional):
{
  "cargas": [
    {
      "tipo_veiculo": "${baseVehicleType}",
      "rota_base": "1234", 
      "pedidos_ids": ["ID_1", "ID_2"]
    }
  ],
  "pedidos_nao_alocados": ["ID_X", "ID_Y"]
}
    `.trim();

    const userPrompt = `Aqui estão os pedidos a serem roteirizados:\n${JSON.stringify(dadosOtimizados)}`;

    const payload = {
        model: settings.model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature: 0.2 // Removido response_format pois algumas APIs da OpenCode podem não suportar
    };

    // Timeout de 120 segundos para a requisição
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    let response;
    try {
        // Chamando nosso Proxy Serverless na Vercel para evitar erro de CORS
        response = await fetch('/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                endpoint: settings.endpoint,
                apiKey: settings.apiKey,
                payload: payload
            }),
            signal: controller.signal
        });
    } catch (fetchErr) {
        if (fetchErr.name === 'AbortError') {
            throw new Error("A Inteligência Artificial demorou mais de 120 segundos para responder. Servidor sobrecarregado.");
        }
        throw fetchErr;
    } finally {
        clearTimeout(timeoutId);
    }


    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Erro no Proxy da API: ${err}`);
    }

    const data = await response.json();
    
    try {
        let content = data.choices[0].message.content;
        // Limpar caso venha com blocos de código
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(content);
    } catch (e) {
        console.error("Erro ao parsear retorno da IA:", e, data);
        throw new Error("A IA não retornou um JSON válido.");
    }
}
