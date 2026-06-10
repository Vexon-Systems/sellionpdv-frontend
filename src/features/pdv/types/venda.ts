export type FormaPagamento = "CREDITO" | "DEBITO" | "PIX" | "DINHEIRO"

export interface ItemVendaDTO {
    produtoId: number;
    quantidade: number;
    modificadores?: number[]; 
}

export interface VendaPayloadDTO {
    itens: ItemVendaDTO[];
    formaPagamento: FormaPagamento;
    maquininhaId: number | null;
    descontoAplicado: number;
}