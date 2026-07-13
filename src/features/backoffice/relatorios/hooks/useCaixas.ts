import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { fetchCaixas } from "../services/apiRelatorios";
import { type RelatorioCaixa } from "../types/relatorios";
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
  
  const [caixas, setCaixas] = useState<RelatorioCaixa[]>([]);
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
    const carregarCaixas = async () => {
      if (!date?.from || !date?.to) return;

      const dataInicialStr = format(date.from, 'yyyy-MM-dd');
      const dataFinalStr = format(date.to, 'yyyy-MM-dd');

      setIsLoading(true);
      try {
        const response = await fetchCaixas(dataInicialStr, dataFinalStr, 0, 100); 
        setCaixas(response.content);
      } catch (error) {
        reportOperationalError("relatorios.caixas", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarCaixas();
  }, [date]);

  return {
    date,
    tabAtiva,
    handleTabChange,
    handleCalendarChange,
    caixas,
    isLoading
  };
}
