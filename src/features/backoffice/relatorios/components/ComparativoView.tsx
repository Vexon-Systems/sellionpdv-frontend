import { useState, useEffect } from "react";
import { fetchComparativo } from "../services/apiRelatorios";
import { type RelatorioComparativoResponse } from "../types/relatorios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Percent, PiggyBank } from "lucide-react";

const formatarMoeda = (valor: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

export function ComparativoView() {
  const [escala, setEscala] = useState<'HOJE' | 'SEMANA' | 'MES'>('MES');
  const [data, setData] = useState<RelatorioComparativoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const carregarComparativo = async () => {
    setIsLoading(true);
    try {
      const response = await fetchComparativo(escala);
      setData(response);
    } catch (error) {
      console.error("Erro ao carregar Relatório Comparativo", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarComparativo();
  }, [escala]);

  // Componente interno para renderizar o Card de Métrica com UX refinada
  const MetricCard = ({ 
    titulo, icone, valorAtual, valorAnterior, percentual, formatador = String 
  }: { 
    titulo: string, icone: React.ReactNode, valorAtual: number, valorAnterior: number, percentual: number, formatador?: (v: number) => string 
  }) => {
    const isPositivo = percentual >= 0;
    
    return (
      <Card className="bg-white shadow-sm border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
          <div className="h-8 w-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500">
            {icone}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{formatador(valorAtual)}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              vs {formatador(valorAnterior)}
            </p>
            <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
              isPositivo ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
            }`}>
              {isPositivo ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
              {percentual > 0 ? '+' : ''}{percentual.toFixed(1)}%
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Controles de Escopo */}
      <Card className="bg-white">
        <CardContent className="px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Monitoramento de Crescimento</h2>
            <p className="text-sm text-gray-500">Contraponto operacional em relação ao ciclo anterior.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['HOJE', 'SEMANA', 'MES'] as const).map((opcao) => (
              <Button
                key={opcao}
                variant={escala === opcao ? "default" : "ghost"}
                className={`text-sm ${escala === opcao ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                onClick={() => setEscala(opcao)}
                disabled={isLoading}
              >
                {opcao === 'HOJE' ? 'Hoje' : opcao === 'SEMANA' ? 'Semana' : 'Mês'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {!data && isLoading && (
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-950" /></div>
      )}

      {/* Dashboards */}
      {data && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50/50 p-3 rounded-md border border-blue-100">
            <span className="font-semibold text-blue-800">Período Atual:</span> {data.periodoAtual.rotulo}
            <span className="mx-2 text-gray-300">|</span>
            <span className="font-semibold text-blue-800">Anterior:</span> {data.periodoAnterior.rotulo}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              titulo="Faturamento Bruto" 
              icone={<DollarSign size={18} />}
              valorAtual={data.periodoAtual.faturamentoTotal}
              valorAnterior={data.periodoAnterior.faturamentoTotal}
              percentual={data.variacaoPercentual.faturamentoPercentual}
              formatador={formatarMoeda}
            />
            
            <MetricCard 
              titulo="Lucro Estimado" 
              icone={<PiggyBank size={18} />}
              valorAtual={data.periodoAtual.lucroEstimado}
              valorAnterior={data.periodoAnterior.lucroEstimado}
              percentual={data.variacaoPercentual.lucroPercentual}
              formatador={formatarMoeda}
            />

            <MetricCard 
              titulo="Volume de Vendas" 
              icone={<ShoppingCart size={18} />}
              valorAtual={data.periodoAtual.quantidadeVendas}
              valorAnterior={data.periodoAnterior.quantidadeVendas}
              percentual={data.variacaoPercentual.vendasPercentual}
            />

            <MetricCard 
              titulo="Ticket Médio" 
              icone={<Percent size={18} />}
              valorAtual={data.periodoAtual.ticketMedio}
              valorAnterior={data.periodoAnterior.ticketMedio}
              percentual={data.variacaoPercentual.ticketMedioPercentual}
              formatador={formatarMoeda}
            />
          </div>
        </div>
      )}
    </div>
  );
}