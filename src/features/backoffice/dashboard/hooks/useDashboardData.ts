import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import type { DateRange } from "react-day-picker";
import { apiDashboard } from "../services/apiDashboard";

export function useDashboardData() {
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

    const kpisQuery = useQuery({
        queryKey: ['dashboard-kpis', dataInicialStr, dataFinalStr],
        queryFn: () => apiDashboard.getKpis(dataInicialStr, dataFinalStr),
    });

    const categoriasQuery = useQuery({
        queryKey: ['dashboard-categorias', dataInicialStr, dataFinalStr],
        queryFn: () => apiDashboard.getCategorias(dataInicialStr, dataFinalStr),
    });

    const produtosQuery = useQuery({
        queryKey: ['dashboard-top-produtos', dataInicialStr, dataFinalStr],
        queryFn: () => apiDashboard.getTopProdutos(dataInicialStr, dataFinalStr),
    });

    // NOVAS QUERIES
    const serieTemporalQuery = useQuery({
        queryKey: ['dashboard-serie-temporal', dataInicialStr, dataFinalStr],
        queryFn: () => apiDashboard.getSerieTemporal(dataInicialStr, dataFinalStr),
    });

    const pagamentosQuery = useQuery({
        queryKey: ['dashboard-pagamentos', dataInicialStr, dataFinalStr],
        queryFn: () => apiDashboard.getPagamentos(dataInicialStr, dataFinalStr),
    });

    const caixaResumoQuery = useQuery({
        queryKey: ['dashboard-caixa', dataInicialStr, dataFinalStr],
        queryFn: () => apiDashboard.getCaixaResumo(dataInicialStr, dataFinalStr),
    });

    return {
        date,
        tabAtiva,
        dataInicialStr,
        dataFinalStr,
        handleTabChange,
        handleCalendarChange,
        queries: {
            kpis: kpisQuery,
            categorias: categoriasQuery,
            produtos: produtosQuery,
            serieTemporal: serieTemporalQuery,
            pagamentos: pagamentosQuery,
            caixa: caixaResumoQuery
        }
    };
}