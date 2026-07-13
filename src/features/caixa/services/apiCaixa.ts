import { api } from "@/lib/api";
import type { CaixaAtualDTO, FechamentoDTO, MovimentacaoDTO } from "../types/caixa";

export const apiCaixa = {
    buscarAtual: async (): Promise<CaixaAtualDTO> => {
        const { data } = await api.get<CaixaAtualDTO>("/api/caixa/atual");
        return data;
    },

    abrir: async (saldoInicial: number): Promise<CaixaAtualDTO> => {
        const { data } = await api.post<CaixaAtualDTO>("/api/caixa/abrir", { saldoInicial });
        return data;
    },

    movimentacao: async (dados: MovimentacaoDTO & { idempotencyKey: string }): Promise<void> => {
        const { idempotencyKey, ...payload } = dados;
        await api.post("/api/caixa/movimentacao", payload, {
            headers: { 'Idempotency-Key': idempotencyKey }
        });
    },

    fechar: async (dados: FechamentoDTO): Promise<void> => {
        await api.post("/api/caixa/fechar", dados);
    },

    listarMovimentacoes: async (): Promise<MovimentacaoDTO[]> => {
        try {
            const { data } = await api.get<MovimentacaoDTO[]>("/api/caixa/movimentacao");
            return data;
        } catch {
            return [];
        }
    }
};