export interface CaixaAtualDTO {
    id: number;
    status: "ABERTO" | "FECHADO";
    dataAbertura: string;
    saldoInicial: number;
    operadorAberturaId: number | null;
    operadorAberturaNome: string | null;
}

export interface EventoCaixaOperacionalDTO {
    id: string;
    tipo: 'ABERTURA' | 'VENDA' | 'SANGRIA' | 'REFORCO';
    status: string;
    descricao: string;
    dataEvento: string;
}

export interface CaixaOperacionalDTO {
    caixaAberto: boolean;
    visaoAdministrativa: boolean;
    id: number | null;
    status: "ABERTO" | "FECHADO" | null;
    dataAbertura: string | null;
    operadorAberturaId: number | null;
    operadorAberturaNome: string | null;
    eventos: EventoCaixaOperacionalDTO[];
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
    valor?: number;
    isEntrada?: boolean;
}
