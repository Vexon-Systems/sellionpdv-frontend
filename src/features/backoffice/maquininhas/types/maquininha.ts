export interface MaquininhaDTO {
    id: number;
    nome: string;
    marca: string;
    taxaDebito: number;
    taxaCredito: number;
    ativo: boolean;
}

export type NovaMaquininhaDTO = Omit<MaquininhaDTO, 'id'>;