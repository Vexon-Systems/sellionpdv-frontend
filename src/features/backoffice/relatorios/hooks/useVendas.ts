import { useState, useEffect, useCallback } from "react";
import { fetchVendas, fetchVendaDetalhes } from "../services/apiRelatorios";
import { type VendaResumo, type VendaDetalhes } from "../types/relatorios";
import { api } from "@/lib/api";
import { reportOperationalError } from "@/lib/errorReporting";

export function useVendas() {
  const [vendas, setVendas] = useState<VendaResumo[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [statusFiltro, setStatusFiltro] = useState<string>("TODAS");
  const [isLoading, setIsLoading] = useState(false);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [detalhesVenda, setDetalhesVenda] = useState<VendaDetalhes | null>(null);
  const [isLoadingDetalhes, setIsLoadingDetalhes] = useState(false);

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [vendaSelecionadaParaCancelamento, setVendaSelecionadaParaCancelamento] = useState<number | null>(null);

  const carregarVendas = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam = statusFiltro === "TODAS" ? undefined : statusFiltro;
      const response = await fetchVendas(paginaAtual, 15, statusParam);
      setVendas(response.content);
      setTotalPaginas(response.totalPages);
    } catch (error) {
      reportOperationalError("relatorios.vendas.listar", error);
    } finally {
      setIsLoading(false);
    }
  }, [paginaAtual, statusFiltro]);

  useEffect(() => {
    carregarVendas();
  }, [carregarVendas]);

  useEffect(() => {
    setPaginaAtual(0);
  }, [statusFiltro]);

  const abrirDetalhes = async (id: number) => {
    setIsSheetOpen(true);
    setIsLoadingDetalhes(true);
    try {
      const detalhes = await fetchVendaDetalhes(id);
      setDetalhesVenda(detalhes);
    } catch (error) {
      reportOperationalError("relatorios.vendas.detalhes", error);
    } finally {
      setIsLoadingDetalhes(false);
    }
  };

  const abrirModalCancelamento = (id: number) => {
    setVendaSelecionadaParaCancelamento(id);
    setIsCancelDialogOpen(true);
  };

  const cancelarVenda = async (justificativa: string) => {
    if (!vendaSelecionadaParaCancelamento) return;
    
    try {
      await api.post(`/api/vendas/${vendaSelecionadaParaCancelamento}/cancelar`, { justificativa });
      
      setIsCancelDialogOpen(false);
      setVendaSelecionadaParaCancelamento(null);
      await carregarVendas();
      
      if (isSheetOpen && detalhesVenda?.vendaId === vendaSelecionadaParaCancelamento) {
         await abrirDetalhes(vendaSelecionadaParaCancelamento);
      }
    } catch (error) {
      reportOperationalError("relatorios.vendas.cancelar", error);
      throw error;
    }
  };

  return {
    vendas,
    isLoading,
    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    statusFiltro,
    setStatusFiltro,
    isSheetOpen,
    setIsSheetOpen,
    detalhesVenda,
    isLoadingDetalhes,
    abrirDetalhes,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    abrirModalCancelamento,
    vendaSelecionadaParaCancelamento,
    cancelarVenda
  };
}
