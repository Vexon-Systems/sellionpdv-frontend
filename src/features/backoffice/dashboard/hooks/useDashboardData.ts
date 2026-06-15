import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import type { DateRange } from "react-day-picker";
import { apiDashboard } from "../services/apiDashboard";

const STALE_TIME = 5 * 60 * 1000; // 5 minutos

export function useDashboardData() {
    const queryClient = useQueryClient();

    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    });
    const [tabAtiva, setTabAtiva] = useState("hoje");

    const dataInicialStr = date?.from ? format(date.from, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    const dataFinalStr = date?.to ? format(date.to, 'yyyy-MM-dd') : dataInicialStr;

    const handleTabChange = (valor: string) => {
        setTabAtiva(valor);
        const hoje = new Date();

        if (valor === "hoje") {
            setDate({ from: hoje, to: hoje });
        } else if (valor === "7dias") {
            setDate({ from: subDays(hoje, 7), to: hoje });
        } else if (valor === "mes") {
            setDate({ from: startOfMonth(hoje), to: endOfMonth(hoje) });
        }
    };

    const handleCalendarChange = (novoRange: DateRange | undefined) => {
        setDate(novoRange);
        setTabAtiva("custom");
    };

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    const kpisQuery = useQuery({
        queryKey: ['dashboard', 'kpis', dataInicialStr, dataFinalStr],
        queryFn: () => apiDashboard.getKpis(dataInicialStr, dataFinalStr),
        staleTime: STALE_TIME,
    });

    const categoriasQuery = useQuery({
        queryKey: ['dashboard', 'categorias', dataInicialStr, dataFinalStr],
        queryFn: () => apiDashboard.getCategorias(dataInicialStr, dataFinalStr),
        staleTime: STALE_TIME,
    });

    const produtosQuery = useQuery({
        queryKey: ['dashboard', 'top-produtos', dataInicialStr, dataFinalStr],
        queryFn: () => apiDashboard.getTopProdutos(dataInicialStr, dataFinalStr),
        staleTime: STALE_TIME,
    });

    const serieTemporalQuery = useQuery({
        queryKey: ['dashboard', 'serie-temporal', dataInicialStr, dataFinalStr],
        queryFn: () => apiDashboard.getSerieTemporal(dataInicialStr, dataFinalStr),
        staleTime: STALE_TIME,
    });

    const pagamentosQuery = useQuery({
        queryKey: ['dashboard', 'pagamentos', dataInicialStr, dataFinalStr],
        queryFn: () => apiDashboard.getPagamentos(dataInicialStr, dataFinalStr),
        staleTime: STALE_TIME,
    });

    const caixaResumoQuery = useQuery({
        queryKey: ['dashboard', 'caixa', dataInicialStr, dataFinalStr],
        queryFn: () => apiDashboard.getCaixaResumo(dataInicialStr, dataFinalStr),
        staleTime: STALE_TIME,
    });

    const isRefreshing = [
        kpisQuery, categoriasQuery, produtosQuery,
        serieTemporalQuery, pagamentosQuery, caixaResumoQuery,
    ].some((q) => q.isFetching);

    return {
        date,
        tabAtiva,
        dataInicialStr,
        dataFinalStr,
        handleTabChange,
        handleCalendarChange,
        handleRefresh,
        isRefreshing,
        queries: {
            kpis: kpisQuery,
            categorias: categoriasQuery,
            produtos: produtosQuery,
            serieTemporal: serieTemporalQuery,
            pagamentos: pagamentosQuery,
            caixa: caixaResumoQuery,
        },
    };
}
