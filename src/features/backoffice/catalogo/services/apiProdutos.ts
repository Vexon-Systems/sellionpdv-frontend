import { api } from '@/lib/api';
import type { ProdutoDTO } from '@/types/pdv';

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
        const { id: _id, ...produtoNovo } = produto;
        const response = await api.post<ProdutoDTO>('/api/produtos', produtoNovo);
        return response.data;
    }
};
 
export const excluirProduto = async (id: number): Promise<void> => {
    await api.delete(`/api/produtos/${id}`);
};

export const uploadImagemProduto = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file); 

    const response = await api.post('/api/produtos/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return typeof response.data === 'string' ? response.data : response.data.imagemUrl || response.data.url;
};