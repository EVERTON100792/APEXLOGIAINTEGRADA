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

    const systemPrompt = `
Você é um Profissional de Logística Sênior com 20 anos de experiência (Especialista em Roteirização e Bin Packing 3D).
Sua missão é agrupar os pedidos fornecidos em cargas (veículos), garantindo o máximo de aproveitamento de espaço (mínimo de sobras), mas respeitando RIGOROSAMENTE as Regras de Negócio e o Efeito Sanfona (Cascata).

DADOS DO CENÁRIO ATUAL:
- Tipo de Veículo Alvo Principal desta Rota: "${baseVehicleType}"
- Limites Rigorosos (hardMaxKg e hardMaxCubage) por veículo:
${JSON.stringify(vehicleConfigs, null, 2)}

REGRA 1 - AGRUPAMENTO OBRIGATÓRIO:
Sempre agrupe pedidos do MESMO CLIENTE (mesmo "cli") no mesmo veículo. Não separe pedidos do mesmo cliente.

REGRA 2 - EFEITO SANFONA (CASCATA):
Você não deve simplesmente jogar tudo no maior caminhão! Você deve seguir a progressão natural:
- Se o Alvo for "fiorino": Tente montar o MÁXIMO possível de cargas de 'fiorino' chegando o mais perto possível do limite máximo sem estourar. Se sobrar um pedido (ou um grupo de um cliente) que sozinho seja pesado/volumoso demais para a fiorino, ou se as sobras fizerem sentido juntas, escale SOMENTE ESSA carga para uma 'van'. Se for muito para 'van', escale para 'tresQuartos'.
- Se o Alvo for "van": Monte o máximo de 'van'. Escale para 'tresQuartos' APENAS as cargas/pedidos que não couberem em 'van'.
- Se o Alvo for "tresQuartos": Monte o máximo de 'tresQuartos'. Escale para 'toco' apenas o que não couber.

REGRA 3 - LIMITES MATEMÁTICOS:
Um veículo NUNCA pode carregar mais KG que o seu "hardMaxCapacity" ou "hardMaxKg", nem mais M³ que o seu "hardCubage". A matemática deve bater 100%.

OBJETIVO DA IA: Faça montagens INTELIGENTES. Tente agrupar clientes menores de forma que o caminhão fique o mais "cheio" e rentável possível, reduzindo sobras espalhadas, mas mantendo a lógica de começar sempre pelos veículos menores exigidos pela Rota Alvo ("${baseVehicleType}").

Você DEVE retornar APENAS um JSON estrito, sem Markdown, sem textos adicionais, neste formato exato:
{
  "cargas": [
    {
      "tipo_veiculo": "van", // fiorino, van, tresQuartos ou toco (dependendo da cascata usada para aquela carga)
      "rota_base": "1234", 
      "pedidos_ids": ["ID_1", "ID_2"]
    }
  ],
  "pedidos_nao_alocados": ["ID_3"] // Apenas se for fisicamente impossível alocar
}
    `.trim();

    const userPrompt = `Aqui estão os pedidos a serem roteirizados:\n${JSON.stringify(dadosOtimizados)}`;

    const payload = {
        model: settings.model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature: 0.1, // Baixa temperatura para lógica rigorosa
        response_format: { type: "json_object" }
    };

    // Chamando nosso Proxy Serverless na Vercel para evitar erro de CORS
    const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            endpoint: settings.endpoint,
            apiKey: settings.apiKey,
            payload: payload
        })
    });

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
