import { api } from '@/lib/api';
import type { ProdutoDTO } from '../types/pdv';

export const fetchProdutos = async (): Promise<ProdutoDTO[]> => {
  const response = await api.get<ProdutoDTO[]>('/api/produtos');
  return response.data;
};

export const fetchProdutoPorId = async (id: number): Promise<ProdutoDTO> => {
  const response = await api.get<ProdutoDTO>(`/api/produtos/${id}`);
  return response.data;
};

export const salvarProduto = async (produto: Partial<ProdutoDTO>): Promise<ProdutoDTO> => {
  
  if (produto.id) {
    const response = await api.put<ProdutoDTO>(`/api/produtos/${produto.id}`, produto);
    return response.data;
  } else {
    const { id, ...produtoNovo } = produto; 
    const response = await api.post<ProdutoDTO>('/api/produtos', produtoNovo);
    return response.data;
  }
};
 
export const excluirProduto = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/produtos/${id}`);
  } catch (error: any) {
    if (error.response?.status === 405 || error.response?.status === 404) {
      console.warn("Rota DELETE não encontrada, executando Soft Delete via PUT...");
      const produto = await fetchProdutoPorId(id);
      await api.put(`/api/produtos/${id}`, { ...produto, ativo: false });
    } else {
      throw error;
    }
  }
};