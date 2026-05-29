import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiCaixa } from "../services/apiCaixa";
import { apiVendas } from "@/features/pdv/services/apiVendas"; 
import { useCaixaStore } from "@/store/useCaixaStore";
import type { ExtratoItem } from "../types/caixa";

export function useControleCaixa(onSuccessCallback?: () => void) {
    const queryClient = useQueryClient();
    const { setCaixa, limparCaixa } = useCaixaStore();

    // 1. Buscas (Queries)
    const { data: caixaAtual, isLoading: isLoadingCaixa, isError } = useQuery({
        queryKey: ['caixa-atual'],
        queryFn: apiCaixa.buscarAtual,
        retry: false,
    });

    const isCaixaAberto = !!caixaAtual && !isError;

    const { data: vendas = [] } = useQuery({
        queryKey: ['vendas-turno', caixaAtual?.id],
        queryFn: apiVendas.listarVendasTurno,
        enabled: isCaixaAberto,
    });

    const { data: movimentacoes = [] } = useQuery({
        queryKey: ['movimentacoes-turno', caixaAtual?.id],
        queryFn: apiCaixa.listarMovimentacoes,
        enabled: isCaixaAberto,
    });

    // 2. Cálculos (KPIs e Extrato)
    const fundoTroco = caixaAtual?.saldoInicial || 0;
    
    const vendasDinheiro = useMemo(() => {
        return vendas
            .filter((v: any) => v.formaPagamento?.toUpperCase() === 'DINHEIRO')
            .reduce((acc: number, v: any) => acc + (v.totalFinal || 0), 0);
    }, [vendas]);

    const totalSangrias = useMemo(() => {
        return movimentacoes
            .filter((m) => m.tipo === 'SANGRIA')
            .reduce((acc, m) => acc + (m.valor || 0), 0);
    }, [movimentacoes]);

    const totalReforcos = useMemo(() => {
        return movimentacoes
            .filter((m) => m.tipo === 'REFORCO')
            .reduce((acc, m) => acc + (m.valor || 0), 0);
    }, [movimentacoes]);

    const saldoFisico = fundoTroco + vendasDinheiro + totalReforcos - totalSangrias;

    const extratoUnificado = useMemo(() => {
        const itens: ExtratoItem[] = [];

        if (caixaAtual) {
            itens.push({
                id: `abertura-${caixaAtual.id}`,
                tipo: 'ABERTURA',
                titulo: 'Abertura de Caixa',
                subtitulo: 'Saldo inicial do turno',
                horario: new Date(caixaAtual.dataAbertura).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date(caixaAtual.dataAbertura).getTime(),
                valor: caixaAtual.saldoInicial,
                isEntrada: true
            });
        }

        vendas.forEach((venda: any) => {
            const dataVenda = new Date(venda.dataVenda || new Date());
            itens.push({
                id: `venda-${venda.id}`,
                tipo: 'VENDA',
                titulo: `Venda #${venda.id}`,
                subtitulo: `Pagamento via ${venda.formaPagamento || 'Não Informada'}`,
                horario: dataVenda.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                timestamp: dataVenda.getTime(),
                valor: venda.totalFinal || 0,
                isEntrada: true
            });
        });

        movimentacoes.forEach((mov) => {
            const dataMov = new Date(mov.dataMovimentacao || new Date());
            itens.push({
                id: `mov-${mov.id || Math.random()}`,
                tipo: mov.tipo,
                titulo: mov.tipo === 'SANGRIA' ? 'Retirada (Sangria)' : 'Entrada Extra (Reforço)',
                subtitulo: mov.motivo || 'Sem justificativa',
                horario: dataMov.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                timestamp: dataMov.getTime(),
                valor: mov.valor || 0,
                isEntrada: mov.tipo === 'REFORCO'
            });
        });

        return itens.sort((a, b) => b.timestamp - a.timestamp);
    }, [caixaAtual, vendas, movimentacoes]);

    // 3. Mutações
    const abrir = useMutation({
        mutationFn: apiCaixa.abrir,
        onSuccess: (novoCaixa) => {
            queryClient.setQueryData(['caixa-atual'], novoCaixa);
            setCaixa(novoCaixa);
            toast.success("Caixa aberto com sucesso!");
        },
        onError: (error: any) => {
            toast.error("Falha na abertura", { description: error.response?.data?.detail || "Não foi possível abrir o caixa." });
        }
    });

    const movimentar = useMutation({
        mutationFn: apiCaixa.movimentacao,
        onSuccess: (_, variaveis) => {
            queryClient.invalidateQueries({ queryKey: ['movimentacoes-turno'] });
            toast.success(`${variaveis.tipo === 'SANGRIA' ? 'Sangria' : 'Reforço'} realizado!`);
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error: any) => {
            toast.error("Falha na operação", { description: error.response?.data?.detail });
        }
    });

    const fechar = useMutation({
        mutationFn: apiCaixa.fechar,
        onSuccess: (_, variaveis) => {
            queryClient.invalidateQueries({ queryKey: ['caixa-atual'] });
            limparCaixa(); 
            toast.success(`Caixa fechado com sucesso!`);
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error: any) => {
            toast.error("Erro no fechamento", { description: error.response?.data?.detail });
        }
    });

    return {
        caixaAtual,
        isCaixaAberto,
        isLoadingCaixa,
        kpis: { fundoTroco, vendasDinheiro, saldoFisico },
        extratoUnificado,
        abrir: abrir.mutateAsync,
        isAbrindo: abrir.isPending,
        movimentar: movimentar.mutateAsync,
        isMovimentando: movimentar.isPending,
        fechar: fechar.mutateAsync,
        isFechando: fechar.isPending
    };
}