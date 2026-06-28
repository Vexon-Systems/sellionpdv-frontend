import type { ReactNode } from "react";
import { useComparativo } from "../hooks/useComparativo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RelatoriosFilter } from "./RelatoriosFilter";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Percent, PiggyBank, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatarMoeda } from "@/lib/utils";

interface MetricCardProps {
  titulo: string;
  icone: ReactNode;
  valorAtual: number;
  valorAnterior: number;
  percentual: number;
  formatador?: (valor: number) => string;
}

function MetricCard({ titulo, icone, valorAtual, valorAnterior, percentual, formatador = (v) => String(v) }: MetricCardProps) {
  const isNovo = valorAnterior === 0 && valorAtual > 0;
  const isNeutro = valorAnterior === 0 && valorAtual === 0;
  const isPositivo = percentual > 0;

  return (
    <Card className="bg-white shadow-sm border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
        <div className="h-8 w-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500">{icone}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{formatador(valorAtual)}</div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">vs {formatador(valorAnterior)}</p>

          {isNeutro ? (
            <div className="flex items-center text-xs font-semibold px-2 py-1 rounded-full text-gray-500 bg-gray-100">
              <Minus className="mr-1 h-3 w-3" /> 0%
            </div>
          ) : isNovo ? (
            <div className="flex items-center text-xs font-semibold px-2 py-1 rounded-full text-purple-700 bg-purple-100">
              <TrendingUp className="mr-1 h-3 w-3" /> Inicial
            </div>
          ) : (
            <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
              isPositivo ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
            }`}>
              {isPositivo ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
              {isPositivo ? '+' : ''}{percentual.toFixed(1)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ComparativoView() {
  const { date, tabAtiva, handleTabChange, handleCalendarChange, data, isLoading } = useComparativo();

  // Dados mockados
  const dadosGrafico = [
    { name: 'Sem 1', Atual: data?.periodoAtual?.faturamentoTotal ? Number(data.periodoAtual.faturamentoTotal) * 0.2 : 0, Anterior: data?.periodoAnterior?.faturamentoTotal ? Number(data.periodoAnterior.faturamentoTotal) * 0.2 : 0 },
    { name: 'Sem 2', Atual: data?.periodoAtual?.faturamentoTotal ? Number(data.periodoAtual.faturamentoTotal) * 0.3 : 0, Anterior: data?.periodoAnterior?.faturamentoTotal ? Number(data.periodoAnterior.faturamentoTotal) * 0.4 : 0 },
    { name: 'Sem 3', Atual: data?.periodoAtual?.faturamentoTotal ? Number(data.periodoAtual.faturamentoTotal) * 0.1 : 0, Anterior: data?.periodoAnterior?.faturamentoTotal ? Number(data.periodoAnterior.faturamentoTotal) * 0.1 : 0 },
    { name: 'Sem 4', Atual: data?.periodoAtual?.faturamentoTotal ? Number(data.periodoAtual.faturamentoTotal) * 0.4 : 0, Anterior: data?.periodoAnterior?.faturamentoTotal ? Number(data.periodoAnterior.faturamentoTotal) * 0.3 : 0 },
  ];

  return (
    <div className="space-y-6">

      <RelatoriosFilter 
        titulo="Monitoramento de Crescimento"
        subtitulo="Comparativo de períodos."
        date={date}
        tabAtiva={tabAtiva}
        isLoading={isLoading}
        onTabChange={handleTabChange}
        onCalendarChange={handleCalendarChange}
      />

      {/* Dashboards */}
      {data && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 bg-blue-50/50 p-3 rounded-md border border-blue-100">
            <span className="font-semibold text-blue-800">Período Selecionado:</span> {data.periodoAtual.rotulo}
            <span className="hidden md:inline mx-2 text-gray-300">|</span>
            <span className="font-semibold text-blue-800 mt-2 md:mt-0">Período de Contraponto:</span> {data.periodoAnterior.rotulo}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              titulo="Faturamento Bruto" icone={<DollarSign size={18} />}
              valorAtual={data.periodoAtual.faturamentoTotal} valorAnterior={data.periodoAnterior.faturamentoTotal}
              percentual={data.variacaoPercentual.faturamentoPercentual} formatador={formatarMoeda}
            />
            
            <MetricCard 
              titulo="Lucro Estimado" icone={<PiggyBank size={18} />}
              valorAtual={data.periodoAtual.lucroEstimado} valorAnterior={data.periodoAnterior.lucroEstimado}
              percentual={data.variacaoPercentual.lucroPercentual} formatador={formatarMoeda}
            />

            <MetricCard 
              titulo="Volume de Vendas" icone={<ShoppingCart size={18} />}
              valorAtual={data.periodoAtual.quantidadeVendas} valorAnterior={data.periodoAnterior.quantidadeVendas}
              percentual={data.variacaoPercentual.vendasPercentual}
            />

            <MetricCard
              titulo="Ticket Médio" icone={<Percent size={18} />}
              valorAtual={data.periodoAtual.ticketMedio} valorAnterior={data.periodoAnterior.ticketMedio}
              percentual={data.variacaoPercentual.ticketMedioPercentual} formatador={formatarMoeda}
            />
          </div>

          <Card className="bg-white p-4">
            <CardHeader>
              <CardTitle className="text-base">Evolução do Faturamento Estimado</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosGrafico} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `R$ ${val}`} />
                  <Tooltip formatter={(value) => formatarMoeda(value as number)} />
                  <Line type="monotone" name="Período Atual" dataKey="Atual" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Período Anterior" dataKey="Anterior" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}