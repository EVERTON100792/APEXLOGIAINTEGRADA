/**
 * APEX LOGÍSTICA INTEGRADA - MÓDULO DE PEDIDOS EM ATRASO (TXT - ROLÂNDIA)
 * =====================================================================
 * Importa o arquivo TXT de relatório de atrasos (> 6 dias),
 * extrai exclusivamente os pedidos da filial ROLÂNDIA,
 * lista todas as colunas originais do relatório,
 * cruza com a planilha ativa para identificar se é VAREJO ou NÃO VAREJO
 * (Carga Fechada / FOB / Transferência / Funcionário / etc.),
 * identifica os pedidos que NÃO estão romaneados (sem 'sim' na coluna ROM)
 * e prioriza automaticamente os de VAREJO no sistema para montagem de cargas.
 */

(function () {
    'use strict';

    window.rolandiaAtrasosData = [];
    let filtroAtual = 'varejo_sem_rom'; // 'varejo_sem_rom', 'sem_rom', 'nao_varejo', 'todos', 'com_rom', 'priorizados'
    let buscaAtual = '';

    // =========================================================================
    // 1. CLASSIFICAÇÃO DE VAREJO vs NÃO VAREJO (CRUZAMENTO COM PLANILHA APEX)
    // =========================================================================
    window.classificarTipoPedidoAtraso = function (numPedido, rotaTxt) {
        const numStr = String(numPedido).trim();

        // 1. Cruzamento prioritário com a planilha carregada (planilhaData)
        if (typeof planilhaData !== 'undefined' && Array.isArray(planilhaData) && planilhaData.length > 0) {
            const p = planilhaData.find(item => item && String(item.Num_Pedido).trim() === numStr);
            if (p) {
                const isNumericCF = (typeof isNumeric === 'function') ? isNumeric(p.CF) : (p.CF && /^\d+$/.test(String(p.CF).trim()));
                const col5 = String(p.Coluna5 || '').toUpperCase();
                const col4 = String(p.Coluna4 || '').toUpperCase();

                // Carga Fechada (CF numérico / FOB)
                if (isNumericCF) {
                    return {
                        isVarejo: false,
                        tipo: 'nao_varejo',
                        categoria: 'Carga Fechada',
                        detalhe: `CF ${p.CF}`,
                        badgeClass: 'badge bg-danger text-white border border-danger fw-bold shadow-sm',
                        label: 'NÃO VAREJO (CF)'
                    };
                }

                // Categorias especiais operacionais
                if (col5.includes('TBL FUNCIONARIO') || col4.includes('FUNCIONARIO')) {
                    return {
                        isVarejo: false,
                        tipo: 'nao_varejo',
                        categoria: 'Funcionário',
                        detalhe: 'Tbl Funcionário',
                        badgeClass: 'badge bg-danger text-white border border-danger fw-bold',
                        label: 'NÃO VAREJO (Func)'
                    };
                }
                if (col5.includes('TABELA TRANSFER') || col5.includes('TRANSF. TODESCH') || col5.includes('INSTITUCIONAL') || col4.includes('TRANSFER')) {
                    return {
                        isVarejo: false,
                        tipo: 'nao_varejo',
                        categoria: 'Transferência',
                        detalhe: 'Transferência',
                        badgeClass: 'badge bg-danger text-white border border-danger fw-bold',
                        label: 'NÃO VAREJO (Transf)'
                    };
                }
                if (col5.includes('TBL EXPORTACAO') || col4.includes('EXPORTACAO')) {
                    return {
                        isVarejo: false,
                        tipo: 'nao_varejo',
                        categoria: 'Exportação',
                        detalhe: 'Exportação',
                        badgeClass: 'badge bg-danger text-white border border-danger fw-bold',
                        label: 'NÃO VAREJO (Export)'
                    };
                }
                if (col5.includes('MOINHO') || col4.includes('MOINHO')) {
                    return {
                        isVarejo: false,
                        tipo: 'nao_varejo',
                        categoria: 'Moinho',
                        detalhe: 'Moinho',
                        badgeClass: 'badge bg-danger text-white border border-danger fw-bold',
                        label: 'NÃO VAREJO (Moinho)'
                    };
                }
                if (col5.includes('MARCA PROPRIA') || col4.includes('MARCA PROPRIA')) {
                    return {
                        isVarejo: false,
                        tipo: 'nao_varejo',
                        categoria: 'Marca Própria',
                        detalhe: 'Marca Própria',
                        badgeClass: 'badge bg-danger text-white border border-danger fw-bold',
                        label: 'NÃO VAREJO (Marca Própria)'
                    };
                }

                // Pedido regular de varejo
                return {
                    isVarejo: true,
                    tipo: 'varejo',
                    categoria: 'Varejo Regular',
                    detalhe: `Rota ${p.Cod_Rota || rotaTxt}`,
                    badgeClass: 'badge bg-primary-subtle text-info border border-info border-opacity-50 fw-semibold',
                    label: 'VAREJO'
                };
            }
        }

        // 2. Se a planilha ainda não foi anexada, faz a inferência por rotas conhecidas
        const rotaStr = String(rotaTxt || '').trim();
        if (rotaStr === '1' || rotaStr === '0') {
            return {
                isVarejo: false,
                tipo: 'nao_varejo',
                categoria: 'Rota Especial / Sem Carga',
                detalhe: `Rota ${rotaStr}`,
                badgeClass: 'badge bg-danger text-white border border-danger fw-bold',
                label: 'NÃO VAREJO'
            };
        }

        return {
            isVarejo: true,
            tipo: 'varejo',
            categoria: 'Varejo Regular',
            detalhe: `Rota ${rotaStr}`,
            badgeClass: 'badge bg-primary-subtle text-info border border-info border-opacity-50 fw-semibold',
            label: 'VAREJO'
        };
    };

    // =========================================================================
    // 2. PARSER DO ARQUIVO TXT (COLUNAS DE LARGURA FIXA COM HIGIENE ROBUSTA)
    // =========================================================================
    function parseTxtAtrasosContent(text) {
        if (!text || typeof text !== 'string') return [];

        const lines = text.split(/\r?\n/);
        const pedidosRolandia = [];

        lines.forEach((line) => {
            const trimmed = line.trim();
            // Ignora linhas vazias ou sumário do cabeçalho "22 ROLANDIA 203"
            if (!trimmed || trimmed.startsWith('22 ROLANDIA') || !line.includes('ROLANDIA')) return;

            const rolandiaIdx = line.indexOf('ROLANDIA');
            if (rolandiaIdx < 0) return;

            const sub = line.substring(rolandiaIdx);
            if (sub.length < 30) return;

            const empresa = sub.substring(0, 8).trim();
            const pedido = sub.substring(8, 16).trim();
            const codigo = sub.substring(16, 23).trim();
            const cliente = sub.substring(23, 36).trim();
            const entrega = sub.substring(36, 47).trim();
            const atraso = sub.substring(47, 53).trim();
            const fat_dias = sub.substring(53, 57).trim();
            const blq = sub.substring(57, 61).trim();
            const res = sub.substring(61, 65).trim();
            const rom = sub.substring(65, 69).trim();
            const fat = sub.substring(69, 73).trim();
            const rota = sub.substring(73).trim();

            if (empresa.toUpperCase() === 'ROLANDIA' && /^\d+$/.test(pedido)) {
                const isRomaneadoNoTxt = rom.toLowerCase() === 'sim';
                const classif = window.classificarTipoPedidoAtraso(pedido, rota);

                pedidosRolandia.push({
                    empresa: 'ROLANDIA',
                    pedido: String(pedido).trim(),
                    codigo: codigo,
                    cliente: cliente,
                    entrega: entrega,
                    atraso: parseInt(atraso, 10) || atraso,
                    fat_dias: parseInt(fat_dias, 10) || fat_dias,
                    blq: blq,
                    res: res,
                    rom: rom,
                    fat: fat,
                    rota: rota,
                    isRomaneadoNoTxt: isRomaneadoNoTxt,
                    semRomaneio: !isRomaneadoNoTxt,
                    isVarejo: classif.isVarejo,
                    classificacao: classif
                });
            }
        });

        return pedidosRolandia;
    }

    // =========================================================================
    // 3. STATUS DO PEDIDO DENTRO DO SISTEMA APEX
    // =========================================================================
    function obterStatusPedidoNoSistema(numPedido) {
        const numStr = String(numPedido).trim();

        // 1. Verifica se está em alguma carga montada (activeLoads)
        if (typeof activeLoads === 'object' && activeLoads !== null) {
            for (const [loadId, load] of Object.entries(activeLoads)) {
                if (load && Array.isArray(load.pedidos)) {
                    const found = load.pedidos.some(p => p && String(p.Num_Pedido).trim() === numStr);
                    if (found) {
                        return {
                            tipo: 'montado',
                            label: `Carga ${loadId}`,
                            badgeClass: 'badge bg-info text-dark',
                            icon: 'bi-truck'
                        };
                    }
                }
            }
        }

        // 2. Verifica se está disponível na Mesa de Trabalho (pedidosGeraisAtuais)
        if (typeof pedidosGeraisAtuais !== 'undefined' && Array.isArray(pedidosGeraisAtuais)) {
            const foundGeral = pedidosGeraisAtuais.find(p => p && String(p.Num_Pedido).trim() === numStr);
            if (foundGeral) {
                return {
                    tipo: 'disponivel',
                    label: `Mesa (${foundGeral.Cod_Rota || 'Rota'})`,
                    badgeClass: 'badge bg-success text-white',
                    icon: 'bi-check-circle-fill'
                };
            }
        }

        // 3. Verifica se está bloqueado
        if (typeof pedidosBloqueados !== 'undefined' && pedidosBloqueados instanceof Set) {
            if (pedidosBloqueados.has(numStr)) {
                return {
                    tipo: 'bloqueado',
                    label: 'Bloqueado',
                    badgeClass: 'badge bg-danger text-white',
                    icon: 'bi-lock-fill'
                };
            }
        }

        // 4. Verifica se está na planilha bruta carregada
        if (typeof planilhaData !== 'undefined' && Array.isArray(planilhaData) && planilhaData.length > 0) {
            const foundPlanilha = planilhaData.find(p => p && String(p.Num_Pedido).trim() === numStr);
            if (foundPlanilha) {
                return {
                    tipo: 'planilha',
                    label: `Planilha (${foundPlanilha.Cod_Rota || 'Rota'})`,
                    badgeClass: 'badge bg-secondary text-white',
                    icon: 'bi-file-earmark-spreadsheet'
                };
            }
        }

        return {
            tipo: 'nao_carregado',
            label: 'Não na Planilha',
            badgeClass: 'badge bg-dark text-muted border border-secondary',
            icon: 'bi-question-circle'
        };
    }

    // =========================================================================
    // 4. ARMAZENAMENTO E RESTAURAÇÃO LOCAL
    // =========================================================================
    function salvarDadosTxtLocal(dados) {
        try {
            localStorage.setItem('apex_rolandia_txt_atrasos', JSON.stringify(dados));
        } catch (e) {
            console.warn('[AtrasosRolandia] Erro ao salvar dados no LocalStorage:', e);
        }
    }

    function carregarDadosTxtSalvos() {
        if (window.rolandiaAtrasosData && window.rolandiaAtrasosData.length > 0) {
            // Re-avalia classificação com a planilha atual em memória
            reclassificarPedidosComPlanilha();
            return window.rolandiaAtrasosData;
        }
        try {
            const salvo = localStorage.getItem('apex_rolandia_txt_atrasos');
            if (salvo) {
                const dados = JSON.parse(salvo);
                if (Array.isArray(dados) && dados.length > 0) {
                    window.rolandiaAtrasosData = dados;
                    reclassificarPedidosComPlanilha();
                    atualizarBadgeSidebar();
                    return dados;
                }
            }
        } catch (e) {
            console.warn('[AtrasosRolandia] Erro ao carregar dados do LocalStorage:', e);
        }
        return [];
    }

    function reclassificarPedidosComPlanilha() {
        if (!window.rolandiaAtrasosData || window.rolandiaAtrasosData.length === 0) return;
        window.rolandiaAtrasosData.forEach(p => {
            const classif = window.classificarTipoPedidoAtraso(p.pedido, p.rota);
            p.isVarejo = classif.isVarejo;
            p.classificacao = classif;
        });
    }

    function atualizarBadgeSidebar() {
        const statusEl = document.getElementById('sidebar-txt-atrasos-status');
        if (!statusEl) return;
        const dados = window.rolandiaAtrasosData || [];
        if (dados.length > 0) {
            const varejoSemRom = dados.filter(p => p.semRomaneio && p.isVarejo).length;
            const naoVarejo = dados.filter(p => !p.isVarejo).length;
            statusEl.innerHTML = `<span class="badge bg-warning text-dark">${varejoSemRom} Varejo Pend.</span>${naoVarejo > 0 ? ` <span class="badge bg-danger text-white ms-1">${naoVarejo} Não Varejo</span>` : ''}`;
        } else {
            statusEl.innerText = 'Importar e Priorizar';
        }
    }

    // =========================================================================
    // 5. PROCESSAMENTO DO ARQUIVO OU TEXTO
    // =========================================================================
    window.handleTxtAtrasoFile = function (file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            processarConteudoTxt(content, file.name);
        };
        reader.readAsText(file, 'UTF-8');
    };

    window.processarTextoColadoTxt = function () {
        const textarea = document.getElementById('txtAtrasoTextareaInput');
        if (!textarea) return;
        const content = textarea.value.trim();
        if (!content) {
            if (typeof showToast === 'function') showToast('Cole o conteúdo do arquivo TXT primeiro.', 'warning');
            return;
        }
        processarConteudoTxt(content, 'Texto Colado Manualmente');
        textarea.value = '';
        const collapseEl = document.getElementById('collapsePasteTxtAtrasos');
        if (collapseEl && typeof bootstrap !== 'undefined') {
            const bsCollapse = bootstrap.Collapse.getInstance(collapseEl);
            if (bsCollapse) bsCollapse.hide();
        }
    };

    function processarConteudoTxt(content, nomeOrigem) {
        const pedidos = parseTxtAtrasosContent(content);

        if (!pedidos || pedidos.length === 0) {
            if (typeof showToast === 'function') {
                showToast('Nenhum pedido de ROLÂNDIA encontrado no arquivo TXT informado.', 'error');
            } else {
                alert('Nenhum pedido de ROLÂNDIA encontrado no arquivo TXT informado.');
            }
            return;
        }

        window.rolandiaAtrasosData = pedidos;
        salvarDadosTxtLocal(pedidos);
        atualizarBadgeSidebar();

        const varejoSemRom = pedidos.filter(p => p.semRomaneio && p.isVarejo);
        const naoVarejo = pedidos.filter(p => !p.isVarejo);
        const comRomaneio = pedidos.filter(p => p.isRomaneadoNoTxt);

        // Feedback informativo
        let msg = `Arquivo lido: ${pedidos.length} pedidos de ROLÂNDIA. `;
        msg += `Encontrados ${varejoSemRom.length} de VAREJO sem romaneio! `;
        if (naoVarejo.length > 0) {
            msg += `(${naoVarejo.length} identificados como NÃO VAREJO).`;
        }
        if (typeof showToast === 'function') {
            showToast(msg, 'success');
        }

        // Auto-priorização dos pedidos de VAREJO pendentes
        const autoPriorizarChk = document.getElementById('txtAtrasosAutoPriorizarCheck');
        const deveAutoPriorizar = autoPriorizarChk ? autoPriorizarChk.checked : true;

        if (deveAutoPriorizar && varejoSemRom.length > 0) {
            priorizarPedidosLoteInterno(varejoSemRom.map(p => p.pedido), true);
            if (typeof showToast === 'function') {
                setTimeout(() => {
                    showToast(`⚡ ${varejoSemRom.length} pedidos de VAREJO não romaneados de Rolândia priorizados automaticamente no sistema!`, 'warning');
                }, 600);
            }
        }

        // Filtro inicial focado no varejo pendente
        filtroAtual = varejoSemRom.length > 0 ? 'varejo_sem_rom' : (naoVarejo.length > 0 ? 'nao_varejo' : 'todos');

        renderizarResumoEKPIs();
        renderizarTabelaAtrasos();
    }

    // =========================================================================
    // 6. PRIORIZAÇÃO NO SISTEMA APEX
    // =========================================================================
    function priorizarPedidosLoteInterno(listaNumeros, silencioso = false) {
        if (!Array.isArray(listaNumeros) || listaNumeros.length === 0) return 0;

        if (typeof window.priorizarListaPedidos === 'function') {
            return window.priorizarListaPedidos(listaNumeros, silencioso);
        }

        let adicionados = 0;
        if (typeof pedidosPrioritarios !== 'undefined') {
            listaNumeros.forEach(num => {
                const s = String(num).trim();
                if (s && !pedidosPrioritarios.includes(s)) {
                    pedidosPrioritarios.push(s);
                    adicionados++;
                }
            });
            window.pedidosPrioritarios = pedidosPrioritarios;
            if (adicionados > 0) {
                if (typeof saveStateToLocalStorage === 'function') saveStateToLocalStorage();
                if (typeof renderAllUI === 'function') renderAllUI();
                if (!silencioso && typeof showToast === 'function') {
                    showToast(`${adicionados} pedido(s) priorizado(s) no sistema com sucesso!`, 'success');
                }
            }
        }
        return adicionados;
    }

    // Prioriza apenas pedidos de VAREJO pendentes de romaneio
    window.priorizarVarejoNaoRomaneadosRolandia = function () {
        const dados = window.rolandiaAtrasosData || [];
        const varejoSemRom = dados.filter(p => p.semRomaneio && p.isVarejo);

        if (varejoSemRom.length === 0) {
            if (typeof showToast === 'function') showToast('Nenhum pedido de Varejo de Rolândia pendente de romaneio encontrado.', 'info');
            return;
        }

        const nums = varejoSemRom.map(p => p.pedido);
        priorizarPedidosLoteInterno(nums, false);

        renderizarResumoEKPIs();
        renderizarTabelaAtrasos();
    };

    // Prioriza todos que estão sem romaneio (inclusive não varejo, se o operador desejar)
    window.priorizarNaoRomaneadosRolandia = function () {
        window.priorizarVarejoNaoRomaneadosRolandia();
    };

    window.priorizarSelecionadosTxtRolandia = function () {
        const checkboxes = document.querySelectorAll('.check-atraso-pedido:checked');
        if (checkboxes.length === 0) {
            if (typeof showToast === 'function') showToast('Selecione pelo menos um pedido na tabela para priorizar.', 'warning');
            return;
        }

        const nums = Array.from(checkboxes).map(cb => cb.value);
        priorizarPedidosLoteInterno(nums, false);

        renderizarResumoEKPIs();
        renderizarTabelaAtrasos();
    };

    window.despriorizarSelecionadosTxtRolandia = function () {
        const checkboxes = document.querySelectorAll('.check-atraso-pedido:checked');
        if (checkboxes.length === 0) {
            if (typeof showToast === 'function') showToast('Selecione os pedidos que deseja remover a prioridade.', 'warning');
            return;
        }

        const nums = Array.from(checkboxes).map(cb => cb.value);
        if (typeof window.despriorizarListaPedidos === 'function') {
            window.despriorizarListaPedidos(nums);
        } else if (typeof pedidosPrioritarios !== 'undefined') {
            nums.forEach(num => {
                const idx = pedidosPrioritarios.indexOf(String(num).trim());
                if (idx > -1) pedidosPrioritarios.splice(idx, 1);
            });
            window.pedidosPrioritarios = pedidosPrioritarios;
            if (typeof saveStateToLocalStorage === 'function') saveStateToLocalStorage();
            if (typeof renderAllUI === 'function') renderAllUI();
            if (typeof showToast === 'function') showToast(`${nums.length} pedidos despriorizados.`, 'info');
        }

        renderizarResumoEKPIs();
        renderizarTabelaAtrasos();
    };

    window.togglePrioridadeIndividualTxt = function (numPedido) {
        const numStr = String(numPedido).trim();
        const jaPrioritario = (typeof window.isPedidoPrioritario === 'function')
            ? window.isPedidoPrioritario(numStr)
            : (typeof pedidosPrioritarios !== 'undefined' && pedidosPrioritarios.includes(numStr));

        if (jaPrioritario) {
            if (typeof window.despriorizarListaPedidos === 'function') {
                window.despriorizarListaPedidos([numStr]);
            } else if (typeof despriorizarPedido === 'function') {
                despriorizarPedido(numStr);
            }
        } else {
            if (typeof window.priorizarListaPedidos === 'function') {
                window.priorizarListaPedidos([numStr]);
            } else if (typeof priorizarPedido === 'function') {
                priorizarPedido(numStr);
            }
        }

        renderizarResumoEKPIs();
        renderizarTabelaAtrasos();
    };

    window.montarCargasDosPrioritariosTxt = function () {
        const modalEl = document.getElementById('modalTxtAtraso');
        if (modalEl && typeof bootstrap !== 'undefined') {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }

        setTimeout(() => {
            if (typeof montarCargasPrioritarias === 'function') {
                montarCargasPrioritarias();
            } else {
                if (typeof showToast === 'function') {
                    showToast('A função montarCargasPrioritarias() não está disponível no momento.', 'error');
                }
            }
        }, 350);
    };

    // Re-aplicação das prioridades quando a planilha for processada
    window.reaplicarPrioridadesTxtRolandia = function () {
        const dados = carregarDadosTxtSalvos();
        if (!dados || dados.length === 0) return;

        reclassificarPedidosComPlanilha();

        // Prioriza automaticamente os pedidos de VAREJO pendentes
        const varejoSemRom = dados.filter(p => p.semRomaneio && p.isVarejo).map(p => p.pedido);
        if (varejoSemRom.length > 0) {
            console.log(`[AtrasosRolandia] Reaplicando prioridade para ${varejoSemRom.length} pedidos de VAREJO não romaneados de Rolândia...`);
            priorizarPedidosLoteInterno(varejoSemRom, true);
        }
        atualizarBadgeSidebar();
    };

    // =========================================================================
    // 7. RENDERIZAÇÃO DA INTERFACE (KPIS, ABAS E TABELA)
    // =========================================================================
    window.abrirModalTxtAtraso = function () {
        carregarDadosTxtSalvos();
        renderizarResumoEKPIs();
        renderizarTabelaAtrasos();

        const modalEl = document.getElementById('modalTxtAtraso');
        if (modalEl && typeof bootstrap !== 'undefined') {
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    };

    window.limparDadosTxtAtraso = function () {
        const confirmModalEl = document.getElementById('confirmLimparTxtModal');
        if (confirmModalEl && typeof bootstrap !== 'undefined') {
            const confirmModal = bootstrap.Modal.getOrCreateInstance(confirmModalEl);
            confirmModal.show();
        } else {
            window.confirmarLimpezaDadosTxtAtraso();
        }
    };

    window.confirmarLimpezaDadosTxtAtraso = function () {
        const confirmModalEl = document.getElementById('confirmLimparTxtModal');
        if (confirmModalEl && typeof bootstrap !== 'undefined') {
            const confirmModal = bootstrap.Modal.getInstance(confirmModalEl);
            if (confirmModal) confirmModal.hide();
        }
        window.rolandiaAtrasosData = [];
        try {
            localStorage.removeItem('apex_rolandia_txt_atrasos');
        } catch (e) { }
        atualizarBadgeSidebar();
        renderizarResumoEKPIs();
        renderizarTabelaAtrasos();
        if (typeof showToast === 'function') showToast('Dados de atraso TXT limpos com sucesso.', 'info');
    };

    window.setFiltroAtrasos = function (filtro) {
        filtroAtual = filtro;
        document.querySelectorAll('.btn-filtro-atraso').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filtro === filtro);
        });
        renderizarTabelaAtrasos();
    };

    window.filtrarTabelaAtrasosInput = function (valor) {
        buscaAtual = String(valor || '').trim().toLowerCase();
        renderizarTabelaAtrasos();
    };

    window.toggleSelectAllAtrasos = function (mainCheckbox) {
        const checked = mainCheckbox.checked;
        document.querySelectorAll('.check-atraso-pedido').forEach(cb => {
            cb.checked = checked;
        });
        atualizarContadorSelecionados();
    };

    window.atualizarContadorSelecionados = function () {
        const totalChecked = document.querySelectorAll('.check-atraso-pedido:checked').length;
        const badge = document.getElementById('txt-atrasos-selecionados-count');
        if (badge) {
            badge.innerText = `${totalChecked} selecionado(s)`;
            badge.classList.toggle('d-none', totalChecked === 0);
        }
    };

    function renderizarResumoEKPIs() {
        const dados = window.rolandiaAtrasosData || [];
        const containerKPIs = document.getElementById('txt-atrasos-kpis-container');
        const emptyState = document.getElementById('txt-atrasos-empty-state');
        const tableContainer = document.getElementById('txt-atrasos-table-wrapper');

        if (!dados || dados.length === 0) {
            if (containerKPIs) containerKPIs.classList.add('d-none');
            if (tableContainer) tableContainer.classList.add('d-none');
            if (emptyState) emptyState.classList.remove('d-none');
            return;
        }

        if (containerKPIs) containerKPIs.classList.remove('d-none');
        if (tableContainer) tableContainer.classList.remove('d-none');
        if (emptyState) emptyState.classList.add('d-none');

        const totalRolandia = dados.length;
        const varejoSemRom = dados.filter(p => p.semRomaneio && p.isVarejo).length;
        const naoVarejo = dados.filter(p => !p.isVarejo).length;
        const comRomaneio = dados.filter(p => p.isRomaneadoNoTxt).length;

        // Verifica quantos estão priorizados no sistema
        const prioritarios = dados.filter(p => {
            return (typeof window.isPedidoPrioritario === 'function')
                ? window.isPedidoPrioritario(p.pedido)
                : (typeof pedidosPrioritarios !== 'undefined' && pedidosPrioritarios.includes(String(p.pedido)));
        }).length;

        // Atualiza os cards
        const elTotal = document.getElementById('kpi-rolandia-total');
        const elVarejoSemRom = document.getElementById('kpi-rolandia-varejo-sem-rom');
        const elNaoVarejo = document.getElementById('kpi-rolandia-nao-varejo');
        const elComRom = document.getElementById('kpi-rolandia-com-rom');
        const elPrioritarios = document.getElementById('kpi-rolandia-prioritarios');
        const btnPriorizarSemRom = document.getElementById('btn-priorizar-sem-rom-header');

        if (elTotal) elTotal.innerText = totalRolandia;
        if (elVarejoSemRom) elVarejoSemRom.innerText = varejoSemRom;
        if (elNaoVarejo) elNaoVarejo.innerText = naoVarejo;
        if (elComRom) elComRom.innerText = comRomaneio;
        if (elPrioritarios) elPrioritarios.innerText = prioritarios;

        if (btnPriorizarSemRom) {
            btnPriorizarSemRom.innerHTML = `<i class="bi bi-lightning-charge-fill me-1"></i>Priorizar Varejo Pendente (${varejoSemRom})`;
            btnPriorizarSemRom.disabled = varejoSemRom === 0;
        }

        // Atualiza labels dos botões de filtro
        const btnFiltroVarejoSemRom = document.querySelector('.btn-filtro-atraso[data-filtro="varejo_sem_rom"]');
        const btnFiltroNaoVarejo = document.querySelector('.btn-filtro-atraso[data-filtro="nao_varejo"]');
        const btnFiltroSemRom = document.querySelector('.btn-filtro-atraso[data-filtro="sem_rom"]');
        const btnFiltroTodos = document.querySelector('.btn-filtro-atraso[data-filtro="todos"]');
        const btnFiltroComRom = document.querySelector('.btn-filtro-atraso[data-filtro="com_rom"]');
        const btnFiltroPriorizados = document.querySelector('.btn-filtro-atraso[data-filtro="priorizados"]');

        if (btnFiltroVarejoSemRom) btnFiltroVarejoSemRom.innerHTML = `🛒 Varejo Sem ROM (${varejoSemRom})`;
        if (btnFiltroNaoVarejo) btnFiltroNaoVarejo.innerHTML = `🚫 Não Varejo (${naoVarejo})`;
        if (btnFiltroSemRom) btnFiltroSemRom.innerHTML = `⚠️ Todos Sem ROM (${varejoSemRom + naoVarejo})`;
        if (btnFiltroTodos) btnFiltroTodos.innerHTML = `📋 Todos (${totalRolandia})`;
        if (btnFiltroComRom) btnFiltroComRom.innerHTML = `✅ Romaneados (${comRomaneio})`;
        if (btnFiltroPriorizados) btnFiltroPriorizados.innerHTML = `⭐ Priorizados (${prioritarios})`;
    }

    function renderizarTabelaAtrasos() {
        const tbody = document.getElementById('txt-atrasos-table-body');
        if (!tbody) return;

        const dados = window.rolandiaAtrasosData || [];
        if (dados.length === 0) {
            tbody.innerHTML = '';
            return;
        }

        // Aplica o filtro selecionado
        let filtrados = dados.filter(p => {
            if (filtroAtual === 'varejo_sem_rom') return p.semRomaneio && p.isVarejo;
            if (filtroAtual === 'nao_varejo') return !p.isVarejo;
            if (filtroAtual === 'sem_rom') return p.semRomaneio;
            if (filtroAtual === 'com_rom') return p.isRomaneadoNoTxt;
            if (filtroAtual === 'priorizados') {
                return (typeof window.isPedidoPrioritario === 'function')
                    ? window.isPedidoPrioritario(p.pedido)
                    : (typeof pedidosPrioritarios !== 'undefined' && pedidosPrioritarios.includes(String(p.pedido)));
            }
            return true;
        });

        // Aplica busca textual se houver
        if (buscaAtual) {
            filtrados = filtrados.filter(p => {
                return p.pedido.toLowerCase().includes(buscaAtual) ||
                    p.cliente.toLowerCase().includes(buscaAtual) ||
                    p.codigo.toLowerCase().includes(buscaAtual) ||
                    p.rota.toLowerCase().includes(buscaAtual) ||
                    p.entrega.toLowerCase().includes(buscaAtual) ||
                    (p.classificacao && p.classificacao.label.toLowerCase().includes(buscaAtual));
            });
        }

        const countSpan = document.getElementById('txt-atrasos-filtered-count');
        if (countSpan) countSpan.innerText = `${filtrados.length} pedido(s) listado(s)`;

        if (filtrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="16" class="text-center py-4 text-muted">
                        <i class="bi bi-search fs-3 d-block mb-2 text-secondary"></i>
                        Nenhum pedido encontrado para o filtro e busca aplicados.
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        filtrados.forEach((p) => {
            const isPrioritario = (typeof window.isPedidoPrioritario === 'function')
                ? window.isPedidoPrioritario(p.pedido)
                : (typeof pedidosPrioritarios !== 'undefined' && pedidosPrioritarios.includes(String(p.pedido)));

            const statusSistema = obterStatusPedidoNoSistema(p.pedido);
            const classif = p.classificacao || window.classificarTipoPedidoAtraso(p.pedido, p.rota);

            // Romaneio badge
            let romBadge = '';
            if (p.isRomaneadoNoTxt) {
                romBadge = `<span class="badge bg-success-subtle text-success border border-success border-opacity-50 px-2 py-1"><i class="bi bi-check-lg me-1"></i>sim</span>`;
            } else {
                romBadge = `<span class="badge bg-danger text-white px-2 py-1 shadow-sm"><i class="bi bi-exclamation-octagon-fill me-1"></i>NÃO</span>`;
            }

            // Destaque de atraso
            const diasAtrasoNum = parseInt(p.atraso, 10) || 0;
            const atrasoClass = diasAtrasoNum >= 15 ? 'text-danger fw-bold' : (diasAtrasoNum >= 10 ? 'text-warning fw-bold' : 'text-light');

            // Linha com estilo de destaque
            let rowStyle = '';
            if (!classif.isVarejo) {
                rowStyle = 'style="background: rgba(239, 68, 68, 0.12); border-left: 3px solid #ef4444;"';
            } else if (isPrioritario) {
                rowStyle = 'style="background: rgba(234, 179, 8, 0.08); border-left: 3px solid #eab308;"';
            } else if (p.semRomaneio) {
                rowStyle = 'style="background: rgba(245, 158, 11, 0.06); border-left: 3px solid #f59e0b;"';
            }

            html += `
                <tr ${rowStyle} class="align-middle border-bottom border-secondary border-opacity-10">
                    <td class="text-center" style="width: 40px;">
                        <input type="checkbox" class="form-check-input check-atraso-pedido" value="${p.pedido}" onchange="atualizarContadorSelecionados()">
                    </td>
                    <td>
                        <span class="${classif.badgeClass}" title="${classif.detalhe}">
                            ${classif.isVarejo ? '<i class="bi bi-shop me-1"></i>' : '<i class="bi bi-x-octagon-fill me-1"></i>'}${classif.label}
                        </span>
                        ${!classif.isVarejo && classif.detalhe ? `<span class="d-block small text-danger font-monospace" style="font-size: 0.68rem;">${classif.detalhe}</span>` : ''}
                    </td>
                    <td>
                        <strong class="text-info font-monospace">${p.pedido}</strong>
                        ${isPrioritario ? '<span class="badge bg-warning text-dark ms-1" title="Priorizado no sistema"><i class="bi bi-star-fill"></i></span>' : ''}
                    </td>
                    <td class="font-monospace small text-secondary">${p.codigo}</td>
                    <td class="text-truncate text-light fw-medium" style="max-width: 170px;" title="${p.cliente}">${p.cliente}</td>
                    <td class="text-nowrap small text-muted">${p.entrega}</td>
                    <td class="text-center ${atrasoClass}">${p.atraso}d</td>
                    <td class="text-center small text-muted">${p.fat_dias || '-'}</td>
                    <td class="text-center small">${p.blq ? '<span class="badge bg-warning text-dark">sim</span>' : '-'}</td>
                    <td class="text-center small">${p.res ? '<span class="badge bg-info text-dark">sim</span>' : '-'}</td>
                    <td class="text-center">${romBadge}</td>
                    <td class="text-center small">${p.fat ? '<span class="badge bg-secondary">sim</span>' : '-'}</td>
                    <td><span class="badge bg-dark border border-primary text-primary-emphasis font-monospace fw-bold">${p.rota}</span></td>
                    <td>
                        <span class="${statusSistema.badgeClass} d-inline-flex align-items-center gap-1" style="font-size: 0.72rem;">
                            <i class="bi ${statusSistema.icon}"></i>
                            ${statusSistema.label}
                        </span>
                    </td>
                    <td class="text-end">
                        <button type="button" 
                            class="btn btn-sm ${isPrioritario ? 'btn-warning text-dark' : 'btn-outline-warning'} py-0 px-2"
                            style="font-size: 0.75rem;"
                            onclick="togglePrioridadeIndividualTxt('${p.pedido}')"
                            title="${isPrioritario ? 'Remover prioridade' : 'Priorizar pedido'}">
                            <i class="bi ${isPrioritario ? 'bi-star-fill' : 'bi-star'} me-1"></i>
                            ${isPrioritario ? 'Priorizado' : 'Priorizar'}
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        window.atualizarContadorSelecionados();
    }

    // =========================================================================
    // 8. EXPORTAÇÃO EXCEL DO RELATÓRIO FILTRADO DE ROLÂNDIA
    // =========================================================================
    window.exportarAtrasosRolandiaExcel = function () {
        const dados = window.rolandiaAtrasosData || [];
        if (dados.length === 0) {
            if (typeof showToast === 'function') showToast('Não há dados para exportar.', 'warning');
            return;
        }

        if (typeof XLSX === 'undefined') {
            if (typeof showToast === 'function') showToast('Biblioteca SheetJS (XLSX) não encontrada.', 'error');
            return;
        }

        const linhasExport = dados.map(p => {
            const st = obterStatusPedidoNoSistema(p.pedido);
            const isPri = (typeof window.isPedidoPrioritario === 'function')
                ? window.isPedidoPrioritario(p.pedido)
                : (typeof pedidosPrioritarios !== 'undefined' && pedidosPrioritarios.includes(String(p.pedido)));
            const classif = p.classificacao || window.classificarTipoPedidoAtraso(p.pedido, p.rota);

            return {
                'Empresa': p.empresa,
                'Nº Pedido': p.pedido,
                'Segmento': classif.isVarejo ? 'VAREJO' : 'NÃO VAREJO',
                'Detalhe Segmento': classif.categoria + (classif.detalhe ? ` (${classif.detalhe})` : ''),
                'Cód. Cliente': p.codigo,
                'Cliente': p.cliente,
                'Data Entrega': p.entrega,
                'Dias Atraso': p.atraso,
                'Dias Fat': p.fat_dias,
                'Lib Blq': p.blq,
                'Res': p.res,
                'Romaneado no TXT (ROM)': p.rom || 'NÃO',
                'Fat': p.fat,
                'Rota': p.rota,
                'Status no Sistema': st.label,
                'Prioritário no Sistema': isPri ? 'SIM' : 'NÃO'
            };
        });

        const ws = XLSX.utils.json_to_sheet(linhasExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rolandia_Atrasos');
        XLSX.writeFile(wb, `Atrasos_Rolandia_${new Date().toISOString().slice(0, 10)}.xlsx`);

        if (typeof showToast === 'function') showToast('Relatório Excel gerado com sucesso!', 'success');
    };

    // Inicialização ao carregar o script
    document.addEventListener('DOMContentLoaded', () => {
        carregarDadosTxtSalvos();

        const confirmEl = document.getElementById('confirmLimparTxtModal');
        if (confirmEl) {
            confirmEl.addEventListener('show.bs.modal', function () {
                setTimeout(() => {
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    if (backdrops.length > 1) {
                        backdrops[backdrops.length - 1].style.zIndex = '1058';
                    }
                }, 10);
            });
            confirmEl.addEventListener('hidden.bs.modal', function () {
                const principalModal = document.getElementById('modalTxtAtraso');
                if (principalModal && principalModal.classList.contains('show')) {
                    document.body.classList.add('modal-open');
                }
            });
        }
    });

})();
