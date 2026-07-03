import { useState } from "react";
import { format } from "date-fns";
import { useDre } from "../hooks/useDre";
import { RelatoriosFilter } from "./RelatoriosFilter";
import { downloadPdf } from "@/lib/downloadPdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingDown, ShoppingCart, Receipt, Landmark } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

export function DreView() {
  const { date, tabAtiva, handleTabChange, handleCalendarChange, data, isLoading } = useDre();
  const [isExportando, setIsExportando] = useState(false);

  const handleExportarPdf = async () => {
    if (!date?.from || !date?.to || isExportando) return;
    setIsExportando(true);
    try {
      const dataInicial = format(date.from, "yyyy-MM-dd");
      const dataFinal = format(date.to, "yyyy-MM-dd");
      await downloadPdf(
        "/api/relatorios/dre.pdf",
        `dre-${dataInicial}-a-${dataFinal}.pdf`,
        { dataInicial, dataFinal }
      );
    } catch {
      // Erro já foi comunicado via toast dentro de downloadPdf.
    } finally {
      setIsExportando(false);
    }
  };

  const totalDeducoes = data ? (data.deducoes.taxasMaquininhas + data.deducoes.totalCancelamentos) : 0;
  const lucroLiquidoPositivo = data ? data.lucroLiquido >= 0 : true;

  const dadosCascata = data ? [
    { name: 'Bruto', valor: [0, data.receitaBruta], cor: '#10b981' },
    { name: 'Deduções', valor: [data.receitaLiquida, data.receitaBruta], cor: '#ef4444' },
    { name: 'Líquido', valor: [0, data.receitaLiquida], cor: '#3b82f6' },
    { name: 'CMV', valor: [data.lucroBrutoEstimado, data.receitaLiquida], cor: '#f97316' },
    { name: 'L. Bruto', valor: [0, data.lucroBrutoEstimado], cor: '#1e3a8a' },
    { name: 'Despesas', valor: [Math.max(0, data.lucroLiquido), data.lucroBrutoEstimado], cor: '#dc2626' },
    { name: 'L. Líquido', valor: [0, Math.max(0, data.lucroLiquido)], cor: data.lucroLiquido >= 0 ? '#065f46' : '#ef4444' },
  ] : [];

  return (
    <div className="space-y-6 print:m-0 print:bg-white">
      
      <RelatoriosFilter 
        titulo="Demonstração de Resultado"
        subtitulo="Apuração em tempo real do período fiscal."
        date={date}
        tabAtiva={tabAtiva}
        isLoading={isLoading}
        onTabChange={handleTabChange}
        onCalendarChange={handleCalendarChange}
        onExportarPdf={data ? handleExportarPdf : undefined}
        isExportando={isExportando}
      />

      {data && (
        <div className="space-y-6 print:block">

          <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
            {/* Receita Bruta */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <DollarSign size={18} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Receita Bruta</p>
                <p className="text-base font-bold text-gray-900 truncate">{formatarMoeda(data.receitaBruta)}</p>
              </div>
            </div>

            {/* Deduções */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <TrendingDown size={18} className="text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Deduções</p>
                <p className="text-base font-bold text-red-600 truncate">-{formatarMoeda(totalDeducoes)}</p>
              </div>
            </div>

            {/* Custos CMV */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <ShoppingCart size={18} className="text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Custos (CMV)</p>
                <p className="text-base font-bold text-amber-600 truncate">-{formatarMoeda(data.custos.custoMercadoriaVendida)}</p>
              </div>
            </div>

            {/* Despesas Operacionais */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <Receipt size={18} className="text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Despesas</p>
                <p className="text-base font-bold text-orange-600 truncate">
                  {data.totalDespesasOperacionais > 0 ? `-${formatarMoeda(data.totalDespesasOperacionais)}` : formatarMoeda(0)}
                </p>
              </div>
            </div>

            {/* Lucro Líquido — tile invertido */}
            <div className={`rounded-xl p-4 flex items-center gap-3 shadow-sm col-span-2 xl:col-span-1 ${lucroLiquidoPositivo ? 'bg-blue-950' : 'bg-blue-950'}`}>
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Landmark size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-0.5">Lucro Líquido</p>
                <p className={`text-base font-bold truncate ${lucroLiquidoPositivo ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatarMoeda(data.lucroLiquido)}
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico e Tabela Lado a Lado em Telas Grandes */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* 2. Tabela DRE Contábil */}
            <Card className="bg-white shadow-sm border-gray-200 print:shadow-none print:border-none">
              <CardHeader className="pb-0 border-b">
                <CardTitle className="text-base font-semibold text-gray-800">Estrutura DRE</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="print:text-sm">
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-bold text-gray-900 pb-3">1. Receita Bruta de Vendas</TableCell>
                      <TableCell className="text-right font-bold text-gray-900 py-3">{formatarMoeda(data.receitaBruta)}</TableCell>
                    </TableRow>

                    <TableRow className="bg-red-50/30 border-b-0 hover:bg-red-50/40">
                      <TableCell className="font-semibold text-red-700 pt-3 pb-2">2. Deduções da Receita Bruta</TableCell>
                      <TableCell className="text-right font-bold text-red-700 pt-3 pb-2">-{formatarMoeda(totalDeducoes)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-red-50/10 border-b-0">
                      <TableCell className="text-red-700/70 pl-8 py-2 text-sm">(-) Taxas de Maquininhas</TableCell>
                      <TableCell className="text-right text-red-700/70 py-2 text-sm">-{formatarMoeda(data.deducoes.taxasMaquininhas)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-red-50/10">
                      <TableCell className="text-red-700/70 pl-8 py-2 text-sm">(-) Vendas Canceladas (Estornos)</TableCell>
                      <TableCell className="text-right text-red-700/70 py-2 text-sm">-{formatarMoeda(data.deducoes.totalCancelamentos)}</TableCell>
                    </TableRow>

                    <TableRow className="bg-blue-50/30">
                      <TableCell className="font-bold text-blue-800 py-3">3. Receita Líquida de Vendas</TableCell>
                      <TableCell className="text-right font-bold text-blue-800">{formatarMoeda(data.receitaLiquida)}</TableCell>
                    </TableRow>

                    <TableRow className="bg-orange-50/30 border-b-0 hover:bg-orange-50/40">
                      <TableCell className="font-semibold text-orange-700 pt-3 pb-2">4. Custos Operacionais</TableCell>
                      <TableCell className="text-right font-bold text-orange-700 pt-3 pb-2">-{formatarMoeda(data.custos.custoMercadoriaVendida)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-orange-50/10">
                      <TableCell className="text-orange-700/70 pl-8 py-2 text-sm">(-) Custo da Mercadoria Vendida (CMV)</TableCell>
                      <TableCell className="text-right text-orange-700/70 py-2 text-sm">-{formatarMoeda(data.custos.custoMercadoriaVendida)}</TableCell>
                    </TableRow>

                    <TableRow className="bg-gray-100">
                      <TableCell className="font-bold text-gray-900 py-4 text-base">5. Lucro Bruto Operacional</TableCell>
                      <TableCell className="text-right font-bold text-gray-900 text-base">{formatarMoeda(data.lucroBrutoEstimado)}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="text-sm font-medium text-gray-500 py-3">Margem Bruta (%)</TableCell>
                      <TableCell className="text-right font-bold text-emerald-600">{data.margemBrutaPercentual?.toFixed(2)}%</TableCell>
                    </TableRow>

                    {data.despesasOperacionais && data.despesasOperacionais.length > 0 && (<>
                      <TableRow className="bg-red-50/30 border-b-0 hover:bg-red-50/40">
                        <TableCell className="font-semibold text-red-700 pt-3 pb-2">6. Despesas Operacionais</TableCell>
                        <TableCell className="text-right font-bold text-red-700 pt-3 pb-2">-{formatarMoeda(data.totalDespesasOperacionais)}</TableCell>
                      </TableRow>
                      {data.despesasOperacionais.map((d) => (
                        <TableRow key={d.categoria} className="bg-red-50/10 border-b-0">
                          <TableCell className="text-red-700/70 pl-8 py-2 text-sm">(-) {d.categoria.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</TableCell>
                          <TableCell className="text-right text-red-700/70 py-2 text-sm">-{formatarMoeda(d.total)}</TableCell>
                        </TableRow>
                      ))}
                    </>)}

                    <TableRow className={lucroLiquidoPositivo ? "bg-emerald-50" : "bg-red-50"}>
                      <TableCell className={`font-bold py-4 text-base ${lucroLiquidoPositivo ? "text-emerald-800" : "text-red-700"}`}>
                        {data.despesasOperacionais?.length > 0 ? "7." : "6."} Lucro Líquido
                      </TableCell>
                      <TableCell className={`text-right font-bold text-base ${lucroLiquidoPositivo ? "text-emerald-800" : "text-red-700"}`}>
                        {formatarMoeda(data.lucroLiquido)}
                      </TableCell>
                    </TableRow>

                    {data.despesasOperacionais?.length > 0 && (
                      <TableRow>
                        <TableCell className="text-sm font-medium text-gray-500 py-3">Margem Líquida (%)</TableCell>
                        <TableCell className={`text-right font-bold ${lucroLiquidoPositivo ? "text-emerald-600" : "text-red-600"}`}>
                          {data.margemLiquidaPercentual?.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base font-semibold text-gray-700">Composição do Lucro (Gráfico em Cascata)</CardTitle>
              </CardHeader>
              <CardContent className="h-90 pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosCascata} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${val}`} tick={{ fontSize: 12, fill: '#4b5563' }} />
                    <Tooltip
                      formatter={(value) => {
                        const v = value as [number, number];
                        const valReal = Math.abs(v[1] - v[0]);
                        return formatarMoeda(valReal);
                      }}
                      labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="valor" radius={[4, 4, 4, 4]}>
                      {dadosCascata.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
}