export interface CaixaAtualDTO {
    id: number;
    status: "ABERTO" | "FECHADO";
    dataAbertura: string;
    saldoInicial: number;
    operadorAberturaId: number | null;
    operadorAberturaNome: string | null;
}

export interface FechamentoDTO {
    saldoFinalInformado: number;
}

export interface MovimentacaoDTO {
    id?: number;
    tipo: "SANGRIA" | "REFORCO";
    valor: number;
    motivo: string;
    dataMovimentacao?: string;
}

// Interface auxiliar para a UI (Extrato)
export interface ExtratoItem {
    id: string;
    tipo: 'VENDA' | 'SANGRIA' | 'REFORCO' | 'ABERTURA';
    titulo: string;
    subtitulo: string;
    horario: string;
    timestamp: number;
    valor: number;
    isEntrada: boolean;
}