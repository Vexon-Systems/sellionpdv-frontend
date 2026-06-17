import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDre } from "../hooks/useDre";
import { RelatoriosFilter } from "./RelatoriosFilter";
import { exportarDrePdf } from "../services/exportarPdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingDown, Percent, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

export function DreView() {
  const { date, tabAtiva, handleTabChange, handleCalendarChange, data, isLoading } = useDre();
  const [isExportando, setIsExportando] = useState(false);

  const handleExportarPdf = async () => {
    if (!data) return;
    setIsExportando(true);
    const periodo = date?.from && date?.to
      ? `${format(date.from, "dd/MM/yyyy", { locale: ptBR })} — ${format(date.to, "dd/MM/yyyy", { locale: ptBR })}`
      : "Período selecionado";
    await exportarDrePdf(data, periodo);
    setIsExportando(false);
  };

  const totalDeducoes = data ? (data.deducoes.taxasMaquininhas + data.deducoes.totalCancelamentos) : 0;
  
  const dadosCascata = data ? [
    { name: 'Bruto', valor: [0, data.receitaBruta], cor: '#10b981' }, 
    { name: 'Deduções', valor: [data.receitaLiquida, data.receitaBruta], cor: '#ef4444' },
    { name: 'Líquido', valor: [0, data.receitaLiquida], cor: '#3b82f6' },
    { name: 'CMV', valor: [data.lucroBrutoEstimado, data.receitaLiquida], cor: '#f97316' },
    { name: 'Lucro', valor: [0, data.lucroBrutoEstimado], cor: '#1e3a8a' } 
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm border-l-4 border-l-emerald-500">
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Receita Bruta</span>
                  <DollarSign size={16} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{formatarMoeda(data.receitaBruta)}</h3>
              </CardContent>
            </Card>

            <Card className="bg-red-50/30 shadow-sm border-l-4 border-l-red-500">
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-red-700 uppercase tracking-wider">Deduções</span>
                  <TrendingDown size={16} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-red-600">
                  -{formatarMoeda(totalDeducoes)}
                </h3>
              </CardContent>
            </Card>

            <Card className="bg-orange-50/30 shadow-sm border-l-4 border-l-orange-500">
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-orange-700 uppercase tracking-wider">Custos (CMV)</span>
                  <Wallet size={16} className="text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-orange-600">-{formatarMoeda(data.custos.custoMercadoriaVendida)}</h3>
              </CardContent>
            </Card>

            <Card className="bg-blue-950 text-white shadow-sm border-none">
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-200 uppercase tracking-wider">Lucro Bruto</span>
                  <Percent size={16} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">{formatarMoeda(data.lucroBrutoEstimado)}</h3>
              </CardContent>
            </Card>
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
                      <TableCell className="text-right font-bold text-emerald-600">{data.margemBrutaPercentual}%</TableCell>
                    </TableRow>
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
                      formatter={(value: any) => {
                        const valReal = Math.abs(value[1] - value[0]);
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