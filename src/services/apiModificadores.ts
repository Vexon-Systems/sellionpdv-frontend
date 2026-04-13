import { api } from "./api";

export interface OpcaoModificadorDTO {
    id?: number;
    nome: string;
    precoAdicional: number;
}

export interface GrupoModificadorDTO {
    id?: number; 
    nome: string;
    opcoes: OpcaoModificadorDTO[];
}

export const fetchModificadores = async (): Promise<GrupoModificadorDTO[]> => {
    const response = await api.get<GrupoModificadorDTO[]>('/api/modificadores');
    return response.data;
};

export const salvarModificador = async (grupo: GrupoModificadorDTO): Promise<GrupoModificadorDTO> => {
    if (grupo.id && grupo.id > 0) {
        // PUT
        const response = await api.put<GrupoModificadorDTO>(`/api/modificadores/${grupo.id}`, grupo);
        return response.data;
    } else {
        // POST
        const { id, ...grupoNovo } = grupo;
        const response = await api.post<GrupoModificadorDTO>('/api/modificadores', grupoNovo);
        return response.data;
    }
};

export const excluirModificador = async (id: number): Promise<void> => {
    await api.delete(`/api/modificadores/${id}`);
};