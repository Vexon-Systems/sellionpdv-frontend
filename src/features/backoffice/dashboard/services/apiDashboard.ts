import { api } from "@/lib/api";
import type { 
  DashboardKpisDTO, 
  ProdutoTopDTO, 
  CategoriaDashboardDTO,
  PagamentoDashboardDTO,
  SerieTemporalDTO,
  CaixaDashboardDTO,
  AdicionalTopDTO
} from "../types/dashboard";

export const apiDashboard = {
    getKpis: async (dataInicial: string, dataFinal: string): Promise<DashboardKpisDTO> => {
        const { data } = await api.get<DashboardKpisDTO>('/api/dashboard/kpis', { params: { dataInicial, dataFinal } });
        return data;
    },

    getTopProdutos: async (dataInicial: string, dataFinal: string): Promise<ProdutoTopDTO[]> => {
        const { data } = await api.get<ProdutoTopDTO[]>('/api/dashboard/produtos/top', { params: { dataInicial, dataFinal } });
        return data;
    },

    getCategorias: async (dataInicial: string, dataFinal: string): Promise<CategoriaDashboardDTO[]> => {
        const { data } = await api.get<CategoriaDashboardDTO[]>('/api/dashboard/categorias', { params: { dataInicial, dataFinal } });
        return data;
    },

    getPagamentos: async (dataInicial: string, dataFinal: string): Promise<PagamentoDashboardDTO[]> => {
        const { data } = await api.get<PagamentoDashboardDTO[]>('/api/dashboard/pagamentos', { params: { dataInicial, dataFinal } });
        return data;
    },

    getSerieTemporal: async (dataInicial: string, dataFinal: string): Promise<SerieTemporalDTO[]> => {
        const { data } = await api.get<SerieTemporalDTO[]>('/api/dashboard/faturamento/serie-temporal', { params: { dataInicial, dataFinal } });
        return data;
    },

    getCaixaResumo: async (dataInicial: string, dataFinal: string): Promise<CaixaDashboardDTO> => {
        const { data } = await api.get<CaixaDashboardDTO>('/api/dashboard/caixa', { params: { dataInicial, dataFinal } });
        return data;
    },

    getTopAdicionais: async (dataInicial: string, dataFinal: string): Promise<AdicionalTopDTO[]> => {
        const { data } = await api.get<AdicionalTopDTO[]>('/api/dashboard/adicionais/top', { params: { dataInicial, dataFinal } });
        return data;
    }
};