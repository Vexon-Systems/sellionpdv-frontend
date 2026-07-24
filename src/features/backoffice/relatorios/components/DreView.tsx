import { useState } from "react";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DollarSign, Landmark, Receipt, ShoppingCart, TrendingDown } from "lucide-react";

import { useDre } from "../hooks/useDre";
import { RelatoriosFilter } from "./RelatoriosFilter";
import { downloadPdf } from "@/lib/downloadPdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formatarMoeda = (valor: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

function ResumoDre({ icon: Icon, label, value, tone = "default" }: { icon: typeof DollarSign; label: string; value: string; tone?: "default" | "danger" | "warning" | "success" }) {
  const tones = {
    default: "bg-primary/10 text-primary",
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/15 text-success",
  };
  return <div className="flex min-w-0 items-center gap-3 rounded-xl border bg-surface-raised p-4 shadow-card"><span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}><Icon size={18} /></span><div className="min-w-0"><p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className={`truncate text-base font-bold ${tone === "danger" ? "text-destructive" : tone === "success" ? "text-success" : "text-foreground"}`}>{value}</p></div></div>;
}

function DreRow({ label, value, tone = "default", detail = false, emphasis = false }: { label: string; value: string; tone?: "default" | "danger" | "primary" | "success"; detail?: boolean; emphasis?: boolean }) {
  const colors = { default: "text-foreground", danger: "text-destructive", primary: "text-primary", success: "text-success" };
  return <TableRow className={emphasis ? "bg-surface-sunken/70 hover:bg-surface-sunken/70" : "hover:bg-muted/40"}><TableCell className={`${detail ? "pl-8 text-sm text-muted-foreground" : `font-semibold ${colors[tone]}`} py-3`}>{detail && "(–) "}{label}</TableCell><TableCell className={`py-3 text-right tabular-nums ${detail ? "text-sm text-muted-foreground" : `font-semibold ${colors[tone]}`}`}>{value}</TableCell></TableRow>;
}

export function DreView() {
  const { date, tabAtiva, handleTabChange, handleCalendarChange, data, isLoading } = useDre();
  const [isExportando, setIsExportando] = useState(false);

  const handleExportarPdf = async () => {
    if (!date?.from || !date?.to || isExportando) return;
    setIsExportando(true);
    try {
      const dataInicial = format(date.from, "yyyy-MM-dd");
      const dataFinal = format(date.to, "yyyy-MM-dd");
      await downloadPdf("/api/relatorios/dre.pdf", `dre-${dataInicial}-a-${dataFinal}.pdf`, { dataInicial, dataFinal });
    } finally {
      setIsExportando(false);
    }
  };

  const totalDeducoes = data ? data.deducoes.taxasMaquininhas + data.deducoes.totalCancelamentos : 0;
  const lucroLiquidoPositivo = (data?.lucroLiquido ?? 0) >= 0;
  const fluxoResultado = data ? [
    { etapa: "Receita", base: 0, valor: data.receitaBruta, total: data.receitaBruta, cor: "var(--primary)", texto: formatarMoeda(data.receitaBruta) },
    { etapa: "Deduções", base: data.receitaLiquida, valor: totalDeducoes, total: -totalDeducoes, cor: "var(--destructive)", texto: `-${formatarMoeda(totalDeducoes)}` },
    { etapa: "Líquida", base: 0, valor: data.receitaLiquida, total: data.receitaLiquida, cor: "var(--info)", texto: formatarMoeda(data.receitaLiquida) },
    { etapa: "CMV", base: data.lucroBrutoEstimado, valor: data.custos.custoMercadoriaVendida, total: -data.custos.custoMercadoriaVendida, cor: "var(--warning)", texto: `-${formatarMoeda(data.custos.custoMercadoriaVendida)}` },
    { etapa: "Bruto", base: 0, valor: data.lucroBrutoEstimado, total: data.lucroBrutoEstimado, cor: "var(--primary)", texto: formatarMoeda(data.lucroBrutoEstimado) },
    { etapa: "Despesas", base: Math.max(0, data.lucroLiquido), valor: data.totalDespesasOperacionais, total: -data.totalDespesasOperacionais, cor: "var(--destructive)", texto: `-${formatarMoeda(data.totalDespesasOperacionais)}` },
    { etapa: "Resultado", base: 0, valor: Math.abs(data.lucroLiquido), total: data.lucroLiquido, cor: lucroLiquidoPositivo ? "var(--success)" : "var(--destructive)", texto: formatarMoeda(data.lucroLiquido) },
  ] : [];

  return <div className="space-y-6 print:m-0 print:bg-white">
    <RelatoriosFilter titulo="Demonstração de Resultado" subtitulo="Apuração em tempo real do período fiscal." date={date} tabAtiva={tabAtiva} isLoading={isLoading} onTabChange={handleTabChange} onCalendarChange={handleCalendarChange} onExportarPdf={data ? handleExportarPdf : undefined} isExportando={isExportando} />

    {data && <div className="space-y-6 print:block">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <ResumoDre icon={DollarSign} label="Receita bruta" value={formatarMoeda(data.receitaBruta)} />
        <ResumoDre icon={TrendingDown} label="Deduções" value={`-${formatarMoeda(totalDeducoes)}`} tone="danger" />
        <ResumoDre icon={ShoppingCart} label="Custos (CMV)" value={`-${formatarMoeda(data.custos.custoMercadoriaVendida)}`} tone="warning" />
        <ResumoDre icon={Receipt} label="Despesas" value={data.totalDespesasOperacionais > 0 ? `-${formatarMoeda(data.totalDespesasOperacionais)}` : formatarMoeda(0)} tone={data.totalDespesasOperacionais > 0 ? "danger" : "default"} />
        <ResumoDre icon={Landmark} label="Lucro líquido" value={formatarMoeda(data.lucroLiquido)} tone={lucroLiquidoPositivo ? "success" : "danger"} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="overflow-hidden rounded-xl border bg-surface-raised shadow-card print:border-none print:shadow-none">
          <div className="flex items-start justify-between gap-4 border-b px-5 py-4"><div><h3 className="font-semibold text-foreground">Estrutura DRE</h3><p className="mt-1 text-sm text-muted-foreground">Do faturamento ao resultado líquido do período.</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${lucroLiquidoPositivo ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>{lucroLiquidoPositivo ? "Resultado positivo" : "Resultado negativo"}</span></div>
          <div className="overflow-x-auto px-4 md:px-5"><Table className="print:text-sm"><TableHeader><TableRow className="bg-surface-sunken/70 hover:bg-surface-sunken/70"><TableHead className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Descrição</TableHead><TableHead className="px-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Valor</TableHead></TableRow></TableHeader><TableBody>
            <DreRow label="1. Receita bruta de vendas" value={formatarMoeda(data.receitaBruta)} emphasis />
            <DreRow label="2. Deduções da receita bruta" value={`-${formatarMoeda(totalDeducoes)}`} tone="danger" />
            <DreRow detail label="Taxas de maquininhas" value={`-${formatarMoeda(data.deducoes.taxasMaquininhas)}`} />
            <DreRow detail label="Vendas canceladas (estornos)" value={`-${formatarMoeda(data.deducoes.totalCancelamentos)}`} />
            <DreRow label="3. Receita líquida de vendas" value={formatarMoeda(data.receitaLiquida)} tone="primary" emphasis />
            <DreRow label="4. Custos operacionais" value={`-${formatarMoeda(data.custos.custoMercadoriaVendida)}`} tone="danger" />
            <DreRow detail label="Custo da mercadoria vendida (CMV)" value={`-${formatarMoeda(data.custos.custoMercadoriaVendida)}`} />
            <DreRow label="5. Lucro bruto operacional" value={formatarMoeda(data.lucroBrutoEstimado)} emphasis />
            <DreRow label="Margem bruta" value={`${data.margemBrutaPercentual?.toFixed(2)}%`} tone="success" />
            {data.despesasOperacionais?.length > 0 && <><DreRow label="6. Despesas operacionais" value={`-${formatarMoeda(data.totalDespesasOperacionais)}`} tone="danger" />{data.despesasOperacionais.map((despesa) => <DreRow key={despesa.categoria} detail label={despesa.categoria.replace(/_/g, " ").replace(/\b\w/g, (letra) => letra.toUpperCase())} value={`-${formatarMoeda(despesa.total)}`} />)}</>}
            <DreRow label={`${data.despesasOperacionais?.length ? "7" : "6"}. Lucro líquido`} value={formatarMoeda(data.lucroLiquido)} tone={lucroLiquidoPositivo ? "success" : "danger"} emphasis />
            {data.despesasOperacionais?.length > 0 && <DreRow label="Margem líquida" value={`${data.margemLiquidaPercentual?.toFixed(2)}%`} tone={lucroLiquidoPositivo ? "success" : "danger"} />}
          </TableBody></Table></div>
        </section>

        <Card className="gap-0">
          <CardHeader className="border-b pb-4"><CardTitle>Fluxo do resultado</CardTitle><p className="text-sm text-muted-foreground">Cada queda mostra o impacto de custos e despesas no resultado final.</p></CardHeader>
          <CardContent className="h-105 pt-6"><ResponsiveContainer width="100%" height="100%"><BarChart data={fluxoResultado} margin={{ top: 26, right: 12, left: -14, bottom: 2 }}><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" /><XAxis dataKey="etapa" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(valor) => `R$ ${valor}`} /><Tooltip formatter={(valor) => formatarMoeda(Number(valor ?? 0))} labelStyle={{ color: "var(--foreground)", fontWeight: 600 }} contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: 10 }} /><Bar dataKey="base" stackId="resultado" fill="transparent" isAnimationActive={false} /><Bar dataKey="valor" stackId="resultado" radius={[5, 5, 2, 2]}><LabelList dataKey="texto" position="top" style={{ fontSize: 10, fill: "var(--muted-foreground)" }} />{fluxoResultado.map((item) => <Cell key={item.etapa} fill={item.cor} />)}</Bar></BarChart></ResponsiveContainer></CardContent>
        </Card>
      </div>
    </div>}
  </div>;
}
