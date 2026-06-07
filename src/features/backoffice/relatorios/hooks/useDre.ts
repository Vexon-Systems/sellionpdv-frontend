import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { fetchDre } from "../services/apiRelatorios";
import { type DreResponse } from "../types/relatorios";

export function useDre() {
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const hoje = new Date();
    return {
      from: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      to: hoje
    };
  });
  const [tabAtiva, setTabAtiva] = useState<string>("mes");
  
  const [data, setData] = useState<DreResponse | null>(null);
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
    const carregarDre = async () => {
      if (!date?.from || !date?.to) return;

      const dataInicial = format(date.from, 'yyyy-MM-dd');
      const dataFinal = format(date.to, 'yyyy-MM-dd');

      setIsLoading(true);
      try {
        const response = await fetchDre(dataInicial, dataFinal);
        setData(response);
      } catch (error) {
        console.error("Erro ao carregar DRE", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDre();
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