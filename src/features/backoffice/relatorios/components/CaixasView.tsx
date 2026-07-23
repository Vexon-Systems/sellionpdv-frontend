import { useMemo, useState } from "react";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { downloadPdf } from "@/lib/downloadPdf";

import { useCaixas } from "../hooks/useCaixas";
import type { RelatorioCaixa } from "../types/relatorios";
import { RelatoriosFilter } from "./RelatoriosFilter";

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

const formatarData = (isoString: string | null) => {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
};

export function CaixasView() {
  const { date, tabAtiva, handleTabChange, handleCalendarChange, caixas, isLoading } = useCaixas();
  const [isExportando, setIsExportando] = useState(false);

  const columns = useMemo<ColumnDef<RelatorioCaixa>[]>(() => [
    {
      accessorKey: "caixaId",
      header: "ID",
      cell: ({ row }) => <span className="font-medium tabular-nums text-muted-foreground">#{row.original.caixaId}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${row.original.status === "FECHADO" ? "bg-muted text-muted-foreground" : "bg-success/15 text-success"}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "dataAbertura",
      header: "Abertura",
      cell: ({ row }) => <span className="text-sm">{formatarData(row.original.dataAbertura)}</span>,
    },
    {
      accessorKey: "dataFechamento",
      header: "Fechamento",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatarData(row.original.dataFechamento)}</span>,
    },
    {
      accessorKey: "operadorAbertura",
      header: "Operador de abertura",
      cell: ({ row }) => <span className="text-sm">{row.original.operadorAbertura}</span>,
    },
    {
      accessorKey: "operadorFechamento",
      header: "Operador de fechamento",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.operadorFechamento ?? "—"}</span>,
    },
    {
      accessorKey: "totalVendas",
      header: "Total de vendas",
      cell: ({ row }) => <span className="block text-right font-semibold tabular-nums">{formatarMoeda(row.original.totalVendas)}</span>,
    },
    {
      accessorKey: "furoCaixa",
      header: "Diferença",
      cell: ({ row }) => {
        const diferenca = row.original.furoCaixa;
        const tone = diferenca < 0 ? "bg-destructive/10 text-destructive" : diferenca > 0 ? "bg-info/10 text-info" : "bg-success/15 text-success";
        return <span className={`ml-auto block w-fit rounded-md px-2.5 py-1 text-right text-xs font-semibold tabular-nums ${tone}`}>{diferenca === 0 ? "Sem diferença" : formatarMoeda(diferenca)}</span>;
      },
    },
  ], []);

  const handleExportarPdf = async () => {
    if (!date?.from || !date?.to || isExportando) return;
    setIsExportando(true);
    try {
      const dataInicial = format(date.from, "yyyy-MM-dd");
      const dataFinal = format(date.to, "yyyy-MM-dd");
      await downloadPdf("/api/relatorios/caixas.pdf", `caixas-${dataInicial}-a-${dataFinal}.pdf`, { dataInicial, dataFinal });
    } finally {
      setIsExportando(false);
    }
  };

  return (
    <div className="space-y-6">
      <RelatoriosFilter
        titulo="Auditoria de Turnos (Caixas)"
        subtitulo="Acompanhamento de sangrias, reforços e diferenças operacionais."
        date={date}
        tabAtiva={tabAtiva}
        isLoading={isLoading}
        onTabChange={handleTabChange}
        onCalendarChange={handleCalendarChange}
        onExportarPdf={handleExportarPdf}
        isExportando={isExportando}
      />

      <DataTable
        columns={columns}
        data={caixas}
        emptyMessage="Nenhum caixa encontrado para o período selecionado."
        isLoading={isLoading}
        pageSize={10}
      />
    </div>
  );
}
