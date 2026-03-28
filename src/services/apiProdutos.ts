import { type ProdutoDTO } from '@/types/pdv';
import { produtosMock as produtosIniciais } from '@/features/pdv/MockData';

let bdFalso = [...produtosIniciais]

// GET
export const fetchProdutos = async (): Promise<ProdutoDTO[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [...bdFalso];
};

// POST ou PUT
export const salvarProduto = async (produto: Omit<ProdutoDTO, 'id'> & { id?: number }): Promise<ProdutoDTO> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (produto.id) {
    // É uma edição (PUT)
    bdFalso = bdFalso.map(p => p.id === produto.id ? produto as ProdutoDTO : p);
    return produto as ProdutoDTO;
  } else {
    // É uma criação (POST)
    const novoProduto: ProdutoDTO = {
      ...produto,
      id: Math.floor(Math.random() * 10000), // Backend falso gerando ID
    } as ProdutoDTO;
    bdFalso.push(novoProduto);
    return novoProduto;
  }
};

// 3. EXCLUIR (DELETE)
export const excluirProduto = async (id: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  bdFalso = bdFalso.filter(p => p.id !== id);
};