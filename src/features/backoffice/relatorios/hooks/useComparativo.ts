import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { fetchComparativo } from "../services/apiRelatorios";
import { type RelatorioComparativoResponse } from "../types/relatorios";
import { reportOperationalError } from "@/lib/errorReporting";

export function useComparativo() {
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const hoje = new Date();
    return {
      from: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      to: hoje
    };
  });
  const [tabAtiva, setTabAtiva] = useState<string>("mes");
  
  const [data, setData] = useState<RelatorioComparativoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    const carregarComparativo = async () => {
      if (!date?.from || !date?.to) return;
      
      const dataInicialStr = format(date.from, 'yyyy-MM-dd');
      const dataFinalStr = format(date.to, 'yyyy-MM-dd');

      setIsLoading(true);
      try {
        const response = await fetchComparativo(dataInicialStr, dataFinalStr);
        setData(response);
      } catch (error) {
        reportOperationalError("relatorios.comparativo", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarComparativo();
  }, [date]);

  return {
    date,
    tabAtiva,
    handleTabChange,
    handleCalendarChange,
    data,
    isLoading
  };
}
