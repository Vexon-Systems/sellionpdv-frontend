export interface ProdutoDTO {
    id: number;
    nome: string;
    preco: number;
    ativo: boolean;
    categoriaId: number;
    imagemUrl?: string;
}

export interface ItemCarrinho{
    id_temporario: string;
    produto: ProdutoDTO;
    quantidade: number;
}