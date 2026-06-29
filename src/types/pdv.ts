export interface ProdutoDTO {
    id: number;
    nome: string;
    precoBase: number;
    custoEstimado?: number; 
    margemBruta?: number;   
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
    valorUnitarioTotal: number;
    subtotal: number;
}

export interface ProdutoGrupoModificadorDTO {
    grupoId: number;
    nome?: string;
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
    custoEstimado?: number | null;
}

export interface DadosSucesso {
  id: number;
  itens: ItemCarrinho[]; 
  total: number;
}


