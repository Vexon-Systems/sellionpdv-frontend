export interface ProdutoDTO {
    id: number;
    nome: string;
    precoBase: number;
    ativo: boolean;
    categoriaId: number;
    imagemUrl?: string;
    gruposModificadores: ProdutoGrupoModificadorDTO[];
}

export interface ModificadorSelecionado {
    opcaoId: number;
    nome: string;
    precoAdicional: number;
}

export interface ItemCarrinho{
    idCarrinho: string;
    produto: ProdutoDTO;
    quantidade: number;
    modificadores: ModificadorSelecionado[];
    valorUnitarioTotal: number; // Preço base + soma dos modificadores
    subtotal: number;
}

export interface ProdutoGrupoModificadorDTO {
    grupoId: number;
    nome: string; 
    tipoEscolha: 'UNICA' | 'MULTIPLA';
    minOpcoes: number;
    maxOpcoes: number;
    opcoes: OpcaoModificadorDTO[];
}

export interface GrupoModificadorDTO {
    id: number; 
    nome: string;
    opcoes: OpcaoModificadorDTO[];
}

export interface OpcaoModificadorDTO {
    id: number;
    nome: string;
    precoAdicional: number;
}


