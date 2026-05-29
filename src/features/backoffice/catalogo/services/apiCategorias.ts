import { api } from "@/lib/api";
import type { CategoriaDTO, NovaCategoriaDTO } from "../types/categoria";

export const apiCategorias = {
    listar: async (): Promise<CategoriaDTO[]> => {
        const response = await api.get<CategoriaDTO[]>('/api/categorias');
        return response.data;
    },

    criar: async (payload: NovaCategoriaDTO): Promise<CategoriaDTO> => {
        const response = await api.post<CategoriaDTO>('/api/categorias', payload);
        return response.data;
    },

    atualizar: async (id: number, payload: NovaCategoriaDTO): Promise<CategoriaDTO> => {
        const response = await api.put<CategoriaDTO>(`/api/categorias/${id}`, payload);
        return response.data;
    },

    excluir: async (id: number): Promise<void> => {
        await api.delete(`/api/categorias/${id}`);
    }
};