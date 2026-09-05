import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchVendas, fetchVendaDetalhes } from '../services/apiRelatorios';
import { api } from '@/lib/api';
import { reportOperationalError } from '@/lib/errorReporting';

export function useVendas() {
  const client = useQueryClient();
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [statusFiltro, atualizarStatus] = useState('TODAS');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [vendaDetalheId, setVendaDetalheId] = useState<number | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [vendaSelecionadaParaCancelamento, setVendaSelecionadaParaCancelamento] = useState<number | null>(null);
  const lista = useQuery({
    queryKey: ['relatorios', 'vendas', paginaAtual, statusFiltro],
    queryFn: async () => {
      try {
        return await fetchVendas(paginaAtual, 15, statusFiltro === 'TODAS' ? undefined : statusFiltro);
      } catch (error) {
        reportOperationalError('relatorios.vendas.listar', error);
        throw error;
      }
    },
    retry: false,
  });
  const detalhe = useQuery({
    queryKey: ['relatorios', 'venda', vendaDetalheId],
    queryFn: async () => {
      try {
        return await fetchVendaDetalhes(vendaDetalheId!);
      } catch (error) {
        reportOperationalError('relatorios.vendas.detalhes', error);
        throw error;
      }
    },
    enabled: isSheetOpen && vendaDetalheId !== null,
    retry: false,
  });
  function setStatusFiltro(status: string) { atualizarStatus(status); setPaginaAtual(0); }
  function abrirDetalhes(id: number) { setVendaDetalheId(id); setIsSheetOpen(true); }
  function abrirModalCancelamento(id: number) { setVendaSelecionadaParaCancelamento(id); setIsCancelDialogOpen(true); }
  async function cancelarVenda(justificativa: string) {
    if (!vendaSelecionadaParaCancelamento) return;
    await api.post('/api/vendas/' + vendaSelecionadaParaCancelamento + '/cancelar', { justificativa });
    setIsCancelDialogOpen(false);
    setVendaSelecionadaParaCancelamento(null);
    await client.invalidateQueries({ queryKey: ['relatorios'] });
  }
  return {
    vendas: lista.isError ? [] : lista.data?.content ?? [],
    isLoading: lista.isFetching, isError: lista.isError, tentarNovamente: lista.refetch,
    paginaAtual, setPaginaAtual, totalPaginas: lista.data?.totalPages ?? 1,
    statusFiltro, setStatusFiltro, isSheetOpen, setIsSheetOpen,
    detalhesVenda: detalhe.isError ? null : detalhe.data ?? null,
    isLoadingDetalhes: detalhe.isFetching, isErrorDetalhes: detalhe.isError,
    tentarDetalhesNovamente: detalhe.refetch, abrirDetalhes,
    isCancelDialogOpen, setIsCancelDialogOpen, abrirModalCancelamento,
    vendaSelecionadaParaCancelamento, cancelarVenda,
  };
}
