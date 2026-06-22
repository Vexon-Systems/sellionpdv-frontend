import { api } from "@/lib/api"
import type { LancamentoDTO, LancamentoPayloadDTO } from "../types/lancamento"

export const apiLancamentos = {
    listar: async (dataInicial: string, dataFinal: string): Promise<LancamentoDTO[]> => {
        const response = await api.get<LancamentoDTO[]>("/api/financeiro/lancamentos", {
            params: { dataInicial, dataFinal },
        })
        return response.data
    },

    criar: async (payload: LancamentoPayloadDTO): Promise<LancamentoDTO> => {
        const response = await api.post<LancamentoDTO>("/api/financeiro/lancamentos", payload)
        return response.data
    },

    atualizar: async (id: number, payload: LancamentoPayloadDTO): Promise<LancamentoDTO> => {
        const response = await api.put<LancamentoDTO>(`/api/financeiro/lancamentos/${id}`, payload)
        return response.data
    },

    excluir: async (id: number): Promise<void> => {
        await api.delete(`/api/financeiro/lancamentos/${id}`)
    },
}
