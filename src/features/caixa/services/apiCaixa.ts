import { api } from "@/lib/api"; 

export interface CaixaAtualDTO {
  id: number;
  status: "ABERTO" | "FECHADO";
  dataAbertura: string;
  saldoInicial: number;
}

export interface FechamentoDTO {
  saldoFinalInformado: number;
}

export interface MovimentacaoDTO {
  tipo: "SANGRIA" | "REFORCO";
  valor: number;
  motivo: string;
}

export const apiVendas = {
  listarVendasTurno: async (): Promise<any[]> => {
    const response = await api.get("/api/vendas");
    return response.data;
  }
};

export const apiCaixa = {
  // Busca o caixa aberto atual para o Tenant
  buscarAtual: async (): Promise<CaixaAtualDTO> => {
    const response = await api.get<CaixaAtualDTO>("/api/caixa/atual");
    return response.data;
  },

  // Abre um novo turno
  abrir: async (saldoInicial: number): Promise<CaixaAtualDTO> => {
    const response = await api.post<CaixaAtualDTO>("/api/caixa/abrir", { saldoInicial });
    return response.data;
  },

  // Registra Sangria ou Reforço
  movimentacao: async (dados: MovimentacaoDTO): Promise<void> => {
    const response = await api.post("/api/caixa/movimentacao", dados);
    return response.data;
  },

  // Envia a contagem cega para fechar o caixa
  fechar: async (dados: FechamentoDTO): Promise<void> => {
    const response = await api.post("/api/caixa/fechar", dados);
    return response.data;
  },

  listarMovimentacoes: async (): Promise<any[]> => {
    try {
        const response = await api.get("/api/caixa/movimentacao");
        return response.data;
    } catch {
        return [];
    }
  }
};