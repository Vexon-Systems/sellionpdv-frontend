import { api } from '@/lib/api';
import type { FuncionarioDTO, CriarFuncionarioDTO, AtualizarFuncionarioDTO } from '../types/funcionario';

export const apiFuncionarios = {
    listar: async (): Promise<FuncionarioDTO[]> => {
        const response = await api.get<FuncionarioDTO[]>('/api/funcionarios');
        return response.data;
    },

    criar: async (dados: CriarFuncionarioDTO): Promise<FuncionarioDTO> => {
        const response = await api.post<FuncionarioDTO>('/api/funcionarios', dados);
        return response.data;
    },

    atualizar: async ({ id, ...dados }: AtualizarFuncionarioDTO & { id: number }): Promise<FuncionarioDTO> => {
        const response = await api.put<FuncionarioDTO>(`/api/funcionarios/${id}`, dados);
        return response.data;
    },

    excluir: async (id: number): Promise<void> => {
        await api.delete(`/api/funcionarios/${id}`);
    },
};
