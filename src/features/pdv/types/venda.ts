export type FormaPagamento = "CREDITO" | "DEBITO" | "PIX" | "DINHEIRO"

export interface ItemVendaDTO {
    produtoId: number;
    quantidade: number;
    modificadores?: number[]; 
}

export type BandeiraCartao = "VISA" | "MASTERCARD" | "ELO" | "HIPERCARD" | "AMEX"

export interface VendaPayloadDTO {
    itens: ItemVendaDTO[];
    formaPagamento: FormaPagamento;
    maquininhaId: number | null;
    bandeiraCartao?: BandeiraCartao | null;
    descontoAplicado: number;
}

export interface VendaTurnoDTO {
    id: number;
    formaPagamento: FormaPagamento;
    totalFinal: number;
    dataVenda: string;
}