export type FormaPagamento = "CREDITO" | "DEBITO" | "PIX" | "DINHEIRO"

export interface ModificadorVendaDTO {
    opcaoId: number; 
}

export interface ItemVendaDTO {
    produtoId: number;
    quantidade: number;
    modificadores?: ModificadorVendaDTO[];
}

export interface VendaPayloadDTO{
    itens: ItemVendaDTO[];
    formaPagamento: FormaPagamento;
    maquininhaId: number | null;
    descontoAplicado: number;
}