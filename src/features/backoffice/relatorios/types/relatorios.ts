export interface PaginatedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface DreDespesaOperacional {
    categoria: string;
    total: number;
}

export interface DreResponse {
    periodo: string;
    receitaBruta: number;
    deducoes: {
      totalCancelamentos: number;
      taxasMaquininhas: number;
    };
    receitaLiquida: number;
    custos: {
      custoMercadoriaVendida: number;
    };
    lucroBrutoEstimado: number;
    margemBrutaPercentual: number;
    despesasOperacionais: DreDespesaOperacional[];
    totalDespesasOperacionais: number;
    lucroLiquido: number;
    margemLiquidaPercentual: number;
}

export interface VendaResumo {
    vendaId: number;
    dataVenda: string;
    valorTotal: number;
    formaPagamento: 'PIX' | 'DINHEIRO' | 'CREDITO' | 'DEBITO';
    status: 'CONCLUIDA' | 'CANCELADA';
    nomeOperador: string;
    motivoDesconto?: string | null;
}

export interface VendaItemModificador {
    nomeOpcao: string;
    valorAdicional: number;
}

export interface VendaItem {
    produtoId: number;
    nomeProduto: string;
    quantidade: number;
    valorUnitario: number;
    subtotalItem: number;
    modificadores: VendaItemModificador[];
}

export interface VendaDetalhes {
    vendaId: number;
    dataVenda: string;
    caixaId: number;
    nomeOperador: string;
    valorTotal: number;
    formaPagamento: string;
    status: 'CONCLUIDA' | 'CANCELADA';
    justificativaCancelamento?: string;
    dataCancelamento?: string;
    itens: VendaItem[];
}

export interface RelatorioCaixa {
    caixaId: number;
    status: 'ABERTO' | 'FECHADO';
    operadorAbertura: string;
    operadorFechamento: string | null;
    dataAbertura: string;
    dataFechamento: string | null;
    saldoInicial: number;
    totalVendas: number;
    totalSangrias: number;
    totalReforcos: number;
    saldoFinalCalculado: number;
    saldoFinalInformado: number;
    furoCaixa: number;
}

export interface PeriodoComparativo {
    rotulo: string;
    faturamentoTotal: number;
    quantidadeVendas: number;
    ticketMedio: number;
    lucroEstimado: number;
}

export interface VariacaoPercentual {
    faturamentoPercentual: number;
    vendasPercentual: number;
    ticketMedioPercentual: number;
    lucroPercentual: number;
}

export interface RelatorioComparativoResponse {
    escalaSelecionada: string;
    periodoAtual: PeriodoComparativo;
    periodoAnterior: PeriodoComparativo;
    variacaoPercentual: VariacaoPercentual;
}
