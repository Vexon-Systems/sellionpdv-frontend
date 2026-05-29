import { api } from "@/lib/api";
import type { DreResponse, PaginatedResponse, VendaResumo, VendaDetalhes } from "../types/relatorios";
import type { RelatorioCaixa, RelatorioComparativoResponse } from "../types/relatorios";

export const fetchDre = async (dataInicial: string, dataFinal: string): Promise<DreResponse> => {
  const response = await api.get<DreResponse>('/api/relatorios/dre', {
    params: { dataInicial, dataFinal }
  });
  return response.data;
};

export const fetchVendas = async (
  page: number = 0, 
  size: number = 20, 
  status?: string
): Promise<PaginatedResponse<VendaResumo>> => {
  const response = await api.get<PaginatedResponse<VendaResumo>>('/api/relatorios/vendas', {
    params: { page, size, status }
  });
  return response.data;
};

export const fetchVendaDetalhes = async (id: number): Promise<VendaDetalhes> => {
  const response = await api.get<VendaDetalhes>(`/api/relatorios/vendas/${id}`);
  return response.data;
};

export const fetchCaixas = async (
  dataInicial: string,
  dataFinal: string,
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponse<RelatorioCaixa>> => {
  const response = await api.get<PaginatedResponse<RelatorioCaixa>>('/api/relatorios/caixas', {
    params: { dataInicial, dataFinal, page, size }
  });
  return response.data;
};

export const fetchComparativo = async (escala: 'HOJE' | 'SEMANA' | 'MES'): Promise<RelatorioComparativoResponse> => {
  const response = await api.get<RelatorioComparativoResponse>('/api/relatorios/comparativo', {
    params: { escala }
  });
  return response.data;
};