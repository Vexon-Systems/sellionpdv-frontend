import { useQuery } from '@tanstack/react-query';
import { useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { fetchCaixas } from "../services/apiRelatorios";
import { reportOperationalError } from "@/lib/errorReporting";

export function useCaixas() {
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const hoje = new Date();
    return {
      from: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      to: hoje
    };
  });
  const [tabAtiva, setTabAtiva] = useState<string>("mes");
  

  const handleTabChange = (valor: string) => {
    setTabAtiva(valor);
    const hoje = new Date();
    
    if (valor === "hoje") {
      setDate({ from: hoje, to: hoje });
    } else if (valor === "7dias") {
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(hoje.getDate() - 6);
      setDate({ from: seteDiasAtras, to: hoje });
    } else if (valor === "mes") {
      const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      setDate({ from: primeiroDia, to: hoje });
    }
  };

  const handleCalendarChange = (novoRange: DateRange | undefined) => {
    setDate(novoRange);
    if (novoRange?.from && novoRange?.to) {
      setTabAtiva("custom");
    }
  };

  const dataInicial = date?.from ? format(date.from, 'yyyy-MM-dd') : '';
  const dataFinal = date?.to ? format(date.to, 'yyyy-MM-dd') : '';
  const query = useQuery({
    queryKey: ['relatorios', 'caixas', dataInicial, dataFinal],
    enabled: !!dataInicial && !!dataFinal,
    queryFn: async () => {
      try {
        return await fetchCaixas(dataInicial, dataFinal, 0, 100);
      } catch (error) {
        reportOperationalError('relatorios.caixas', error);
        throw error;
      }
    },
    retry: false,
  });

  return {
    date,
    tabAtiva,
    handleTabChange,
    handleCalendarChange,
    caixas: query.isError || !dataInicial || !dataFinal ? [] : query.data?.content ?? [],
    isLoading: query.isFetching,
    isError: query.isError,
    tentarNovamente: query.refetch
  };
}
