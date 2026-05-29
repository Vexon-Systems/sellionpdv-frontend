import { useState, useEffect } from "react";
import { fetchDre } from "../services/apiRelatorios";
import { type DreResponse } from "../types/relatorios";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Loader2, Calculator, Printer, DollarSign, TrendingDown, Percent, Wallet } from "lucide-react";

const formatarMoeda = (valor: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

export function DreView() {
  const [dataInicial, setDataInicial] = useState("2026-05-01");
  const [dataFinal, setDataFinal] = useState("2026-05-28");
  
  const [data, setData] = useState<DreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const carregarDre = async () => {
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

  useEffect(() => {
    carregarDre();
  }, []);

  const exportarParaPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:m-0 print:bg-white">
      
      <Card className="bg-white print:hidden">
        <CardContent className="px-4 flex flex-col md:flex-row items-end justify-between gap-4">
          <div className="flex flex-col md:flex-row items-end gap-4 w-full md:w-auto">
            <div className="space-y-1 w-full md:w-auto">
              <label className="text-xs font-medium text-muted-foreground">Data Inicial</label>
              <Input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />
            </div>
            <div className="space-y-1 w-full md:w-auto">
              <label className="text-xs font-medium text-muted-foreground">Data Final</label>
              <Input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} />
            </div>
            <Button onClick={carregarDre} disabled={isLoading} className="w-full md:w-auto bg-blue-950 hover:bg-blue-900">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
              Calcular DRE
            </Button>
          </div>

          {/* <Button onClick={exportarParaPdf} variant="outline" disabled={isLoading || !data} className="w-full md:w-auto">
            <Printer className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button> */}
        </CardContent>
      </Card>

      {/* Loading State */}
      {!data && isLoading && (
        <div className="flex justify-center p-12 print:hidden"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      )}

      {/* Conteúdo do Relatório */}
      {data && (
        <div className="space-y-6 print:block">
          
          {/* Cabeçalho exclusivo para o PDF */}
          <div className="hidden print:block mb-8 border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">Demonstração do Resultado do Exercício (DRE)</h1>
            <p className="text-sm text-gray-500 mt-1">Período de apuração: {dataInicial} até {dataFinal}</p>
            <p className="text-sm text-gray-500">Gerado pelo sistema SellionPDV</p>
          </div>

          {/* 2. KPIs Compactos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm border-l-4 border-l-blue-500 print:shadow-none print:border">
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Receita Bruta</span>
                  <DollarSign size={16} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{formatarMoeda(data.receitaBruta)}</h3>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-l-4 border-l-red-400 print:shadow-none print:border">
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Deduções</span>
                  <TrendingDown size={16} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-red-600">
                  -{formatarMoeda(data.deducoes.taxasMaquininhas + data.deducoes.totalCancelamentos)}
                </h3>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-l-4 border-l-orange-400 print:shadow-none print:border">
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custos (CMV)</span>
                  <Wallet size={16} className="text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">-{formatarMoeda(data.custos.custoMercadoriaVendida)}</h3>
              </CardContent>
            </Card>

            <Card className="bg-blue-950 text-white shadow-sm border-none print:bg-white print:text-gray-900 print:border print:shadow-none print:border-l-4 print:border-l-green-600">
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-200 uppercase tracking-wider print:text-muted-foreground">Lucro Bruto</span>
                  <Percent size={16} className="text-green-400 print:text-green-600" />
                </div>
                <h3 className="text-xl font-bold">{formatarMoeda(data.lucroBrutoEstimado)}</h3>
              </CardContent>
            </Card>
          </div>

          {/* 3. Tabela DRE Contábil */}
          <Card className="bg-white shadow-sm print:shadow-none print:border-none">
            <CardContent className="p-0">
              <Table className="print:text-sm">
                <TableBody>
                  {/* Grupo 1: Receitas */}
                  <TableRow className="hover:bg-gray-50/50">
                    <TableCell className="font-bold text-gray-900 pb-2">1. Receita Bruta de Vendas</TableCell>
                    <TableCell className="text-right font-bold text-gray-900 pb-2">{formatarMoeda(data.receitaBruta)}</TableCell>
                  </TableRow>

                  {/* Grupo 2: Deduções */}
                  <TableRow className="hover:bg-transparent border-b-0">
                    <TableCell className="font-semibold text-gray-700 pt-4 pb-2">2. Deduções da Receita Bruta</TableCell>
                    <TableCell className="text-right text-red-500 pt-4 pb-2">
                      -{formatarMoeda(data.deducoes.taxasMaquininhas + data.deducoes.totalCancelamentos)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b-0">
                    <TableCell className="text-muted-foreground pl-8 py-2">(-) Taxas de Maquininhas</TableCell>
                    <TableCell className="text-right text-red-500/80 py-2">-{formatarMoeda(data.deducoes.taxasMaquininhas)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground pl-8 py-2">(-) Vendas Canceladas (Estornos)</TableCell>
                    <TableCell className="text-right text-red-500/80 py-2">-{formatarMoeda(data.deducoes.totalCancelamentos)}</TableCell>
                  </TableRow>

                  {/* Grupo 3: Receita Líquida */}
                  <TableRow className="bg-green-50/30 hover:bg-green-50/30 print:bg-transparent">
                    <TableCell className="font-bold text-green-700 py-4">3. Receita Líquida de Vendas</TableCell>
                    <TableCell className="text-right font-bold text-green-700">{formatarMoeda(data.receitaLiquida)}</TableCell>
                  </TableRow>

                  {/* Grupo 4: Custos */}
                  <TableRow className="hover:bg-transparent border-b-0">
                    <TableCell className="font-semibold text-gray-700 pt-4 pb-2">4. Custos Operacionais</TableCell>
                    <TableCell className="text-right text-red-500 pt-4 pb-2">-{formatarMoeda(data.custos.custoMercadoriaVendida)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground pl-8 py-2">(-) Custo da Mercadoria Vendida (CMV)</TableCell>
                    <TableCell className="text-right text-red-500/80 py-2">-{formatarMoeda(data.custos.custoMercadoriaVendida)}</TableCell>
                  </TableRow>

                  {/* Grupo 5: Lucro */}
                  <TableRow className="bg-blue-50/50 hover:bg-blue-50/50 print:bg-transparent">
                    <TableCell className="font-bold text-blue-900 py-5 text-base">5. Lucro Bruto Operacional</TableCell>
                    <TableCell className="text-right font-bold text-blue-900 text-base">{formatarMoeda(data.lucroBrutoEstimado)}</TableCell>
                  </TableRow>
                  
                  {/* Margem Final */}
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="text-sm font-medium text-gray-500 py-3">Margem Bruta (%)</TableCell>
                    <TableCell className="text-right font-bold text-green-600">{data.margemBrutaPercentual}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}