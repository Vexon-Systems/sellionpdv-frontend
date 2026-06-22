export type BandeiraCartao = "VISA" | "MASTERCARD" | "ELO" | "HIPERCARD" | "AMEX"
export type TipoTransacaoCartao = "DEBITO" | "CREDITO"

export interface TaxaBandeiraDTO {
    bandeira: BandeiraCartao;
    tipo: TipoTransacaoCartao;
    taxa: number;
}

export interface MaquininhaDTO {
    id: number;
    nome: string;
    marca: string;
    taxaDebito: number;
    taxaCredito: number;
    ativo: boolean;
    taxasPorBandeira: TaxaBandeiraDTO[];
}

export type NovaMaquininhaDTO = Omit<MaquininhaDTO, 'id'>;