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

    // Normalizando configs para a IA entender melhor
    const estruturedConfigs = {
        fiorino: { maxKg: vehicleConfigs.fiorinoHardMaxCapacity || vehicleConfigs.fiorinoMaxCapacity, maxM3: vehicleConfigs.fiorinoHardCubage || vehicleConfigs.fiorinoCubage },
        van: { maxKg: vehicleConfigs.vanHardMaxCapacity || vehicleConfigs.vanMaxCapacity, maxM3: vehicleConfigs.vanHardCubage || vehicleConfigs.vanCubage },
        tresQuartos: { maxKg: vehicleConfigs.tresQuartosHardMaxCapacity || vehicleConfigs.tresQuartosMaxCapacity, maxM3: vehicleConfigs.tresQuartosHardCubage || vehicleConfigs.tresQuartosCubage },
        toco: { maxKg: vehicleConfigs.tocoHardMaxCapacity || vehicleConfigs.tocoMaxCapacity, maxM3: vehicleConfigs.tocoHardCubage || vehicleConfigs.tocoCubage }
    };

    const systemPrompt = `
Você é um Profissional de Logística Sênior com 20 anos de experiência (Especialista em Roteirização e Bin Packing 3D).
Sua missão é agrupar os pedidos em cargas (veículos), garantindo o máximo de aproveitamento de espaço (mínimo de sobras), mas respeitando RIGOROSAMENTE as Regras de Negócio e o Efeito Sanfona (Cascata).

DADOS DO CENÁRIO ATUAL:
- Tipo de Veículo Alvo Principal desta Rota: "${baseVehicleType}"
- Limites Rigorosos (maxKg e maxM3) por veículo:
${JSON.stringify(estruturedConfigs, null, 2)}

REGRA 1 - AGRUPAMENTO OBRIGATÓRIO:
Sempre agrupe pedidos do MESMO CLIENTE (mesmo "cli") no mesmo veículo. Não separe pedidos do mesmo cliente.

REGRA 2 - EFEITO SANFONA (CASCATA - EXTREMAMENTE IMPORTANTE):
O seu objetivo PRINCIPAL é esgotar a capacidade dos veículos menores exigidos pela Rota Alvo ("${baseVehicleType}") antes de sequer pensar em veículos maiores!
- Se o Alvo for "fiorino": VOCÊ É OBRIGADO a tentar criar o máximo de cargas do tipo 'fiorino' possível. Junte clientes até chegar perto de ${estruturedConfigs.fiorino.maxKg}KG. SÓ crie uma carga do tipo 'van' se um grupo de pedidos de um ÚNICO CLIENTE for maior que o limite da fiorino e não puder ser separado. NUNCA junte vários clientes pequenos em uma Van se eles couberem separados em várias Fiorinos!
- Se o Alvo for "van": Crie o máximo de cargas 'van' (${estruturedConfigs.van.maxKg}KG). Só escale para 'tresQuartos' se um único cliente ultrapassar o limite da van.
- Se o Alvo for "tresQuartos": Crie o máximo de 'tresQuartos'. Escale para 'toco' apenas o que não couber.

Se você colocar vários clientes pequenos dentro de uma Van numa rota de Fiorino, você falhará na sua missão!

REGRA 3 - LIMITES MATEMÁTICOS (INVIOLÁVEIS):
A soma de "kg" e "m3" dos pedidos de uma carga NUNCA pode ser maior que o "maxKg" e "maxM3" do tipo_veiculo escolhido.

Você DEVE retornar APENAS um JSON estrito neste formato exato (inclua o passo a passo no "raciocinio" para garantir qualidade):
{
  "raciocinio": "Explique detalhadamente: 1. Por que você não conseguiu colocar todos na ${baseVehicleType}? 2. Se você usou um veículo maior, prove que o peso de um cliente único obrigou isso e que não eram apenas clientes pequenos agrupados.",
  "cargas": [
    {
      "tipo_veiculo": "van", // fiorino, van, tresQuartos ou toco
      "rota_base": "1234", 
      "pedidos_ids": ["ID_1", "ID_2"]
    }
  ],
  "pedidos_nao_alocados": []
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
