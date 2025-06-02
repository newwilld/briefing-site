// 1. Estrutura de Dados Inicial
let dadosDashboard = {
    valorVendasTotal: 0,
    vendasOntem: 0,
    vendasHoje: 0,
    qtdTotalLeads: 0,
    valorInvestidoAnuncios: 0,
    // Para os percentuais, vamos armazenar os valores base que os originam
    // e calcular os percentuais na hora de exibir.
    // Se quisermos que o próprio percentual seja editável diretamente,
    // podemos mudar a abordagem, mas geralmente eles são derivados.
    // Por agora, vamos assumir que temos valores absolutos para despesas e impostos
    // e que o valorVendasTotal é a base para esses percentuais.
    valorDespesas: 0, // Valor absoluto das despesas
    valorImpostos: 0, // Valor absoluto dos impostos
    // Calculados (não editáveis diretamente, mas atualizados no display)
    // percentualDespesas: 0, (será calculado)
    // percentualImpostos: 0, (será calculado)
    qtdClientes: 0,
    novosClientesDia: 0,
    novosClientesMes: 0,
    valorInvestidoDia: 0,
    valorInvestidoMes: 0,
    valorInvestidoAno: 0,
    // vendasDiarias: {} // Objeto para armazenar vendas por data. Ex: {'2023-10-26': 150.00} (Substituído por vendasPorDiaArray)
    vendasPorDiaArray: [] // Array para armazenar valores de vendas diárias sequenciais
};

const LOCAL_STORAGE_KEY = 'dashboardData';
const CORES_VENDAS_DIARIAS = ['#7CB5EC', '#434348', '#90ED7D', '#F7A35C', '#8085E9'];

// Funções auxiliares de formatação
function formatCurrency(value) {
    if (typeof value !== 'number') value = 0;
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function formatPercentage(value) {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) value = 0;
    return `${(value * 100).toFixed(2)}%`.replace('.', ',');
}

// 2. Carregar Dados do localStorage
function carregarDados() {
    const dadosSalvos = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (dadosSalvos) {
        try {
            const parsedData = JSON.parse(dadosSalvos);
            // Mescla os dados salvos com os padrões para garantir que novas chaves sejam adicionadas
            dadosDashboard = { ...dadosDashboard, ...parsedData };

            // Garante que vendasPorDiaArray exista, mesmo se carregando dados antigos
            if (!dadosDashboard.vendasPorDiaArray) {
                dadosDashboard.vendasPorDiaArray = [];
            }

        } catch (error) {
            console.error("Erro ao parsear dados do localStorage:", error);
            // Mantém os dados padrão se houver erro, incluindo a inicialização de vendasPorDiaArray
            if (!dadosDashboard.vendasPorDiaArray) {
                dadosDashboard.vendasPorDiaArray = [];
            }
        }
    } else {
        // Se não houver dados salvos, garante que a estrutura padrão (com vendasPorDiaArray) seja usada
        if (!dadosDashboard.vendasPorDiaArray) {
            dadosDashboard.vendasPorDiaArray = [];
        }
    }
}

// 3. Salvar Dados no localStorage
function salvarDados() {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dadosDashboard));
    } catch (error) {
        console.error("Erro ao salvar dados no localStorage:", error);
    }
}

// 4. Atualizar Display na Interface
function atualizarDisplay() {
    // Métricas Principais
    document.getElementById('valor-vendas-total-display').textContent = formatCurrency(dadosDashboard.valorVendasTotal);
    document.getElementById('vendas-ontem-display').textContent = formatCurrency(dadosDashboard.vendasOntem);
    document.getElementById('vendas-hoje-display').textContent = formatCurrency(dadosDashboard.vendasHoje);
    document.getElementById('qtd-total-leads-display').textContent = dadosDashboard.qtdTotalLeads;
    document.getElementById('valor-investido-anuncios-display').textContent = formatCurrency(dadosDashboard.valorInvestidoAnuncios);

    // Calcular e exibir percentuais
    // Assumindo que despesas e impostos são percentuais do Valor de Vendas Total
    // Se valorVendasTotal for 0, o percentual também será 0 para evitar divisão por zero.
    const percentualDespesas = dadosDashboard.valorVendasTotal > 0 ? (dadosDashboard.valorDespesas / dadosDashboard.valorVendasTotal) : 0;
    const percentualImpostos = dadosDashboard.valorVendasTotal > 0 ? (dadosDashboard.valorImpostos / dadosDashboard.valorVendasTotal) : 0;

    document.getElementById('percentual-despesas-display').textContent = formatPercentage(percentualDespesas);
    document.getElementById('percentual-impostos-display').textContent = formatPercentage(percentualImpostos);

    // Clientes
    document.getElementById('qtd-clientes-display').textContent = dadosDashboard.qtdClientes;
    document.getElementById('novos-clientes-dia-display').textContent = dadosDashboard.novosClientesDia;
    document.getElementById('novos-clientes-mes-display').textContent = dadosDashboard.novosClientesMes;

    // Investimento Detalhado
    document.getElementById('valor-investido-dia-display').textContent = formatCurrency(dadosDashboard.valorInvestidoDia);
    document.getElementById('valor-investido-mes-display').textContent = formatCurrency(dadosDashboard.valorInvestidoMes);
    document.getElementById('valor-investido-ano-display').textContent = formatCurrency(dadosDashboard.valorInvestidoAno);

    renderizarVendasDiarias();
}


// Funções para Vendas Diárias
function renderizarVendasDiarias() {
    const container = document.getElementById('vendas-diarias-container');
    if (!container) {
        console.error('Container de vendas diárias não encontrado!');
        return;
    }
    container.innerHTML = ''; // Limpa o conteúdo atual

    if (!dadosDashboard.vendasPorDiaArray || dadosDashboard.vendasPorDiaArray.length === 0) {
        container.innerHTML = '<p>Nenhuma venda diária registrada.</p>';
        return;
    }

    dadosDashboard.vendasPorDiaArray.forEach((valor, index) => {
        const blocoDiv = document.createElement('div');
        blocoDiv.classList.add('bloco-venda-dia'); // Classe para estilização CSS geral
        blocoDiv.style.backgroundColor = CORES_VENDAS_DIARIAS[index % CORES_VENDAS_DIARIAS.length];
        blocoDiv.style.color = '#fff'; // Texto branco para melhor contraste com fundos coloridos
        blocoDiv.style.padding = '10px';
        blocoDiv.style.borderRadius = '4px';
        blocoDiv.style.textAlign = 'center';

        blocoDiv.textContent = `Dia ${index + 1}: ${formatCurrency(valor)}`;
        container.appendChild(blocoDiv);
    });
}

function adicionarNovaVendaDiaria() {
    const novoValorStr = prompt("Digite o valor da venda para o novo dia:");
    if (novoValorStr === null) return; // Usuário cancelou

    const novoValor = parseFloat(novoValorStr.replace(',', '.'));
    if (isNaN(novoValor) || novoValor < 0) {
        alert("Valor inválido. Por favor, insira um número positivo.");
        return;
    }

    dadosDashboard.vendasPorDiaArray.push(novoValor);
    salvarDados();
    renderizarVendasDiarias(); // Atualiza a exibição dos blocos de vendas
    atualizarDisplay(); // Para atualizar outras métricas, se necessário no futuro
    // Nota: Se o Valor de Vendas Total devesse ser a soma das vendas diárias,
    // a lógica em atualizarDisplay() para 'valor-vendas-total-display' precisaria mudar.
}


// 6. Funcionalidade de Edição (Base)
function adicionarListenersEdicao() {
    const camposEditaveis = [
        { idDisplay: 'valor-vendas-total-display', idBtn: 'valor-vendas-total-edit-btn', chave: 'valorVendasTotal', tipo: 'numero' },
        { idDisplay: 'vendas-ontem-display', idBtn: 'vendas-ontem-edit-btn', chave: 'vendasOntem', tipo: 'numero' },
        { idDisplay: 'vendas-hoje-display', idBtn: 'vendas-hoje-edit-btn', chave: 'vendasHoje', tipo: 'numero' },
        { idDisplay: 'qtd-total-leads-display', idBtn: 'qtd-total-leads-edit-btn', chave: 'qtdTotalLeads', tipo: 'inteiro' },
        { idDisplay: 'valor-investido-anuncios-display', idBtn: 'valor-investido-anuncios-edit-btn', chave: 'valorInvestidoAnuncios', tipo: 'numero' },
        // Para % Despesas e % Impostos, editaremos os valores base (valorDespesas, valorImpostos)
        // Os percentuais serão recalculados.
        { idDisplay: 'percentual-despesas-display', idBtn: 'percentual-despesas-edit-btn', chave: 'valorDespesas', tipo: 'numero', labelPrompt: 'Novo valor para Despesas (base para %)' },
        { idDisplay: 'percentual-impostos-display', idBtn: 'percentual-impostos-edit-btn', chave: 'valorImpostos', tipo: 'numero', labelPrompt: 'Novo valor para Impostos (base para %)' },
        { idDisplay: 'qtd-clientes-display', idBtn: 'qtd-clientes-edit-btn', chave: 'qtdClientes', tipo: 'inteiro' },
        { idDisplay: 'novos-clientes-dia-display', idBtn: 'novos-clientes-dia-edit-btn', chave: 'novosClientesDia', tipo: 'inteiro' },
        { idDisplay: 'novos-clientes-mes-display', idBtn: 'novos-clientes-mes-edit-btn', chave: 'novosClientesMes', tipo: 'inteiro' },
        { idDisplay: 'valor-investido-dia-display', idBtn: 'valor-investido-dia-edit-btn', chave: 'valorInvestidoDia', tipo: 'numero' },
        { idDisplay: 'valor-investido-mes-display', idBtn: 'valor-investido-mes-edit-btn', chave: 'valorInvestidoMes', tipo: 'numero' },
        { idDisplay: 'valor-investido-ano-display', idBtn: 'valor-investido-ano-edit-btn', chave: 'valorInvestidoAno', tipo: 'numero' },
    ];

    camposEditaveis.forEach(campo => {
        const btn = document.getElementById(campo.idBtn);
        if (btn) {
            btn.addEventListener('click', () => {
                const valorAtual = dadosDashboard[campo.chave];
                const label = campo.labelPrompt || `Novo valor para ${document.getElementById(campo.idDisplay).previousSibling.textContent.replace(':', '').trim()}`;
                const novoValorStr = prompt(`${label}:`, valorAtual);

                if (novoValorStr === null) return; // Usuário cancelou

                let novoValor;
                if (campo.tipo === 'numero') {
                    novoValor = parseFloat(novoValorStr.replace(',', '.'));
                    if (isNaN(novoValor)) {
                        alert("Valor inválido. Por favor, insira um número.");
                        return;
                    }
                } else if (campo.tipo === 'inteiro') {
                    novoValor = parseInt(novoValorStr, 10);
                    if (isNaN(novoValor)) {
                        alert("Valor inválido. Por favor, insira um número inteiro.");
                        return;
                    }
                } else { // string (não usado atualmente, mas para extensibilidade)
                    novoValor = novoValorStr;
                }

                dadosDashboard[campo.chave] = novoValor;
                salvarDados();
                atualizarDisplay();
            });
        } else {
            console.warn(`Botão com ID ${campo.idBtn} não encontrado.`);
        }
    });
}


// Funções para Exportar/Importar
function exportarDados() {
    const dadosJSON = JSON.stringify(dadosDashboard, null, 4); // null, 4 para indentação
    const blob = new Blob([dadosJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dados_dashboard.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importarDadosHandler(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const jsonData = e.target.result;
            const dadosImportados = JSON.parse(jsonData);

            // Validação mínima (verificar algumas chaves principais)
            if (dadosImportados && typeof dadosImportados === 'object' &&
                dadosImportados.hasOwnProperty('valorVendasTotal') && // Verifica uma chave qualquer
                dadosImportados.hasOwnProperty('qtdTotalLeads')) { // Verifica outra chave

                // Confirmação antes de substituir (opcional, mas bom para UX)
                if (confirm("Tem certeza que deseja importar os novos dados? Os dados atuais serão sobrescritos.")) {
                    dadosDashboard = { ...dadosDashboard, ...dadosImportados }; // Faz um merge, priorizando dados importados
                    salvarDados();
                    atualizarDisplay();
                    alert('Dados importados com sucesso!');
                }
            } else {
                alert('Arquivo JSON inválido ou não contém a estrutura esperada.');
            }
        } catch (error) {
            console.error("Erro ao importar dados:", error);
            alert('Erro ao importar o arquivo. Verifique o formato e o conteúdo.');
        } finally {
            // Limpa o valor do input para permitir a importação do mesmo arquivo novamente
            document.getElementById('importar-dados-input').value = null;
        }
    };
    reader.onerror = () => {
        alert('Erro ao ler o arquivo.');
        document.getElementById('importar-dados-input').value = null;
    };
    reader.readAsText(file);
}


// 5. Inicialização
window.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    atualizarDisplay();
    adicionarListenersEdicao();

    // Listeners para Exportar/Importar
    const exportBtn = document.getElementById('exportar-dados-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportarDados);
    }

    const importBtn = document.getElementById('importar-dados-btn');
    const importFileInput = document.getElementById('importar-dados-input');

    if (importBtn && importFileInput) {
        importBtn.addEventListener('click', () => importFileInput.click());
        importFileInput.addEventListener('change', importarDadosHandler);
    }

    // Listener para Adicionar Venda Diária
    // O botão precisa ser adicionado ao HTML. Ex: <button id="add-venda-dia-btn">Adicionar Venda do Dia</button>
    const addVendaDiaBtn = document.getElementById('add-venda-dia-btn');
    if (addVendaDiaBtn) {
        addVendaDiaBtn.addEventListener('click', adicionarNovaVendaDiaria);
    } else {
        // Isso é esperado na primeira execução, antes do HTML ser atualizado.
        console.warn("Botão 'add-venda-dia-btn' não encontrado. Adicione-o ao HTML.");
    }
});
