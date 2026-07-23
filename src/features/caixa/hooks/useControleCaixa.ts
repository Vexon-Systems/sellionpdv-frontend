import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiCaixa } from "../services/apiCaixa";
import { apiVendas } from "@/features/pdv/services/apiVendas";
import { useCaixaStore } from "@/store/useCaixaStore";
import { extrairMensagemErro } from "@/lib/utils";
import type { ExtratoItem } from "../types/caixa";

export function useControleCaixa(onSuccessCallback?: () => void) {
    const queryClient = useQueryClient();
    const { limparCaixa } = useCaixaStore();

    // 1. Buscas (Queries)
    const { data: caixaOperacional, isLoading: isLoadingCaixa } = useQuery({
        queryKey: ['caixa-operacional'],
        queryFn: apiCaixa.buscarOperacional,
        retry: false,
    });

    const isCaixaAberto = caixaOperacional?.caixaAberto === true;
    const visaoAdministrativa = caixaOperacional?.visaoAdministrativa === true;

    const { data: caixaAdministrativo } = useQuery({
        queryKey: ['caixa-atual-administrativo', caixaOperacional?.id],
        queryFn: apiCaixa.buscarAtual,
        enabled: isCaixaAberto && visaoAdministrativa,
        retry: false,
    });

    const { data: vendas = [] } = useQuery({
        queryKey: ['vendas-turno-administrativo', caixaOperacional?.id],
        queryFn: apiVendas.listarVendasTurno,
        enabled: isCaixaAberto && visaoAdministrativa,
    });

    const { data: movimentacoes = [] } = useQuery({
        queryKey: ['movimentacoes-turno-administrativo', caixaOperacional?.id],
        queryFn: apiCaixa.listarMovimentacoes,
        enabled: isCaixaAberto && visaoAdministrativa,
    });

    useEffect(() => {
        if (caixaOperacional && !caixaOperacional.visaoAdministrativa) {
            queryClient.removeQueries({ queryKey: ['caixa-atual-administrativo'] });
            queryClient.removeQueries({ queryKey: ['vendas-turno-administrativo'] });
            queryClient.removeQueries({ queryKey: ['movimentacoes-turno-administrativo'] });
        }
    }, [caixaOperacional, queryClient]);

    // 2. Cálculos (KPIs e Extrato)
    const fundoTroco = caixaAdministrativo?.saldoInicial || 0;
    
    const vendasDinheiro = useMemo(() => {
        return vendas
            .filter((v) => v.formaPagamento?.toUpperCase() === 'DINHEIRO')
            .reduce((acc, v) => acc + (v.totalFinal || 0), 0);
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
        if (!visaoAdministrativa) {
            return (caixaOperacional?.eventos ?? []).map((evento): ExtratoItem => ({
                id: evento.id,
                tipo: evento.tipo,
                titulo: evento.descricao,
                subtitulo: evento.status,
                horario: new Date(evento.dataEvento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date(evento.dataEvento).getTime(),
            }));
        }

        const itens: ExtratoItem[] = [];

        if (caixaAdministrativo) {
            itens.push({
                id: `abertura-${caixaAdministrativo.id}`,
                tipo: 'ABERTURA',
                titulo: 'Abertura de Caixa',
                subtitulo: 'Saldo inicial do turno',
                horario: new Date(caixaAdministrativo.dataAbertura).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date(caixaAdministrativo.dataAbertura).getTime(),
                valor: caixaAdministrativo.saldoInicial,
                isEntrada: true
            });
        }

        vendas.forEach((venda) => {
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

        movimentacoes.forEach((mov, index) => {
            const dataMov = new Date(mov.dataMovimentacao || new Date());
            itens.push({
                id: `mov-${mov.id ?? `idx-${index}`}`,
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
    }, [caixaAdministrativo, caixaOperacional, movimentacoes, vendas, visaoAdministrativa]);

    // 3. Mutações
    const abrir = useMutation({
        mutationFn: apiCaixa.abrir,
        onSuccess: () => {
            limparCaixa();
            queryClient.invalidateQueries({ queryKey: ['caixa-operacional'] });
            toast.success("Caixa aberto com sucesso!");
        },
        onError: (error) => {
            toast.error("Falha na abertura", { description: extrairMensagemErro(error, "Não foi possível abrir o caixa.") });
        }
    });

    const movimentar = useMutation({
        mutationFn: apiCaixa.movimentacao,
        onSuccess: (_, variaveis) => {
            queryClient.invalidateQueries({ queryKey: ['caixa-operacional'] });
            queryClient.invalidateQueries({ queryKey: ['movimentacoes-turno-administrativo'] });
            toast.success(`${variaveis.tipo === 'SANGRIA' ? 'Sangria' : 'Reforço'} realizado!`);
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error) => {
            toast.error("Falha na operação", { description: extrairMensagemErro(error, "Não foi possível realizar a movimentação.") });
        }
    });

    const fechar = useMutation({
        mutationFn: apiCaixa.fechar,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['caixa-atual-administrativo'] });
            queryClient.removeQueries({ queryKey: ['vendas-turno-administrativo'] });
            queryClient.removeQueries({ queryKey: ['movimentacoes-turno-administrativo'] });
            queryClient.invalidateQueries({ queryKey: ['caixa-operacional'] });
            limparCaixa();
            toast.success(`Caixa fechado com sucesso!`);
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error) => {
            toast.error("Erro no fechamento", { description: extrairMensagemErro(error, "Não foi possível fechar o caixa.") });
        }
    });

    return {
        caixaAtual: caixaOperacional,
        isCaixaAberto,
        isLoadingCaixa,
        visaoAdministrativa,
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
