import { api } from "@/lib/api";
import type { GrupoModificadorDTO } from "@/types/pdv";

export const apiModificadores = {
    listar: async (): Promise<GrupoModificadorDTO[]> => {
        const { data } = await api.get<GrupoModificadorDTO[]>('/api/modificadores');
        return data;
    },

    salvar: async (grupo: GrupoModificadorDTO): Promise<GrupoModificadorDTO> => {
        if (grupo.id && grupo.id > 0) {
            const { data } = await api.put<GrupoModificadorDTO>(`/api/modificadores/${grupo.id}`, grupo);
            return data;
        } else {
            const { id: _id, ...grupoNovo } = grupo;
            const { data } = await api.post<GrupoModificadorDTO>('/api/modificadores', grupoNovo);
            return data;
        }
    },

    excluir: async (id: number): Promise<void> => {
        await api.delete(`/api/modificadores/${id}`);
    }
};