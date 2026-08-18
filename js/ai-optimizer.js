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
    
    const settings = {
        enabled: toggle.checked,
        apiKey: apiKeyInput.value.trim(),
        model: modelSelect.value,
        endpoint: 'https://opencode.ai/zen/go/v1/chat/completions'
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
 * @returns {Promise<Object>} Resultado otimizado JSON gerado pela IA.
 */
async function runAIOptimization(pedidos, vehicleConfigs, rotasVeiculoMap) {
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

    const systemPrompt = `
Você é um algoritmo especialista em logística (Bin Packing 3D e Roteirização).
Sua missão é agrupar os pedidos fornecidos em cargas (veículos), respeitando as capacidades máximas de PESO (kg) e VOLUME (m³).

REGRA 1: Sempre agrupe pedidos do MESMO CLIENTE (mesmo "cli") no mesmo veículo.
REGRA 2: Respeite os limites dos veículos:
${JSON.stringify(vehicleConfigs, null, 2)}
REGRA 3: Tente usar o menor número de veículos possível (otimização).

Você DEVE retornar APENAS um JSON estrito, sem Markdown, sem textos adicionais, neste formato exato:
{
  "cargas": [
    {
      "tipo_veiculo": "van", // ou fiorino, toco, tresQuartos
      "rota_base": "1234", // rota predominante
      "pedidos_ids": ["ID_1", "ID_2"] // IDs exatos dos pedidos alocados aqui
    }
  ],
  "pedidos_nao_alocados": ["ID_3"] // Se faltar espaço
}
    `.trim();

    const userPrompt = `Aqui estão os pedidos a serem roteirizados:\n${JSON.stringify(dadosOtimizados)}`;

    const response = await fetch(settings.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
            model: settings.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.1, // Baixa temperatura para lógica rigorosa
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Erro na API OpenCode: ${err}`);
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
