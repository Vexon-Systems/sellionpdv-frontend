export interface DashboardKpisDTO {
  faturamentoTotal: number;
  quantidadeVendas: number;
  ticketMedio: number;
  comparativoPeriodoAnterior?: {
    faturamentoPercentual: number;
    vendasPercentual: number;
    ticketMedioPercentual: number;
  };
}

export interface ProdutoTopDTO {
  produtoId: number;
  nomeProduto: string;
  quantidadeVendida: number;
  valorGerado: number;
}

export interface CategoriaDashboardDTO {
  categoriaId: number;
  nomeCategoria: string;
  quantidadeVendida: number;
  valorGerado: number;
  percentualFaturamento: number;
}

export interface PagamentoDashboardDTO {
  formaPagamento: string;
  valorTotal: number;
  quantidadeTransacoes: number;
  percentualFaturamento: number;
}

export interface SerieTemporalDTO {
  label: string;
  valor: number;
}

export interface CaixaDashboardDTO {
  quantidadeTurnosAbertos: number;
  totalSangrias: number;
  totalReforcos: number;
  saldoInicialMedio: number;
  diferencaCaixaTotal: number;
}

export interface AdicionalTopDTO {
  opcaoId: number;
  nomeOpcao: string;
  quantidadeVendida: number;
  valorGerado: number;
}