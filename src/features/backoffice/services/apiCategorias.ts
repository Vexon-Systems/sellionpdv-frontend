import { api } from "@/lib/api";

export interface CategoriaDTO {
    id: number;
    nome: string;
}

export const fetchCategorias = async (): Promise<CategoriaDTO[]> => {
    const response = await api.get<CategoriaDTO[]>('/api/categorias');
    return response.data;
};

export const criarCategoria = async (nome: string): Promise<CategoriaDTO> => {
    const response = await api.post<CategoriaDTO>('/api/categorias', { nome });
    return response.data;
};

export const atualizarCategoria = async (id: number, nome: string): Promise<CategoriaDTO> => {
    const response = await api.put<CategoriaDTO>(`/api/categorias/${id}`, { nome });
    return response.data;
};


export const excluirCategoria = async (id: number): Promise<void> => {
    await api.delete(`/api/categorias/${id}`);
};