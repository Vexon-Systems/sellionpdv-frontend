import { api } from '@/lib/api';
import type { MaquininhaDTO, NovaMaquininhaDTO } from '../types/maquininha';

export const apiMaquininhas = {
    listarTodas: async (): Promise<MaquininhaDTO[]> => {
        const response = await api.get<MaquininhaDTO[]>('/api/maquininhas');
        return response.data;
    },

    salvar: async (maquininha: Partial<MaquininhaDTO>): Promise<MaquininhaDTO> => {
        if (maquininha.id) {
            const response = await api.put<MaquininhaDTO>(`/api/maquininhas/${maquininha.id}`, maquininha);
            return response.data;
        } else {
            const response = await api.post<MaquininhaDTO>('/api/maquininhas', maquininha);
            return response.data;
        }
    },

    excluir: async (id: number): Promise<void> => {
        try {
            await api.delete(`/api/maquininhas/${id}`);
        } catch (error: any) {
            if (error.response?.status === 405 || error.response?.status === 404) {
                console.warn("Rota DELETE não encontrada, enviando requisição PUT para inativar...");
                const lista = await apiMaquininhas.listarTodas();
                const maq = lista.find(m => m.id === id);
                if (maq) {
                    await api.put(`/api/maquininhas/${id}`, { ...maq, ativo: false });
                }
            } else {
                throw error;
            }
        }
    }
};