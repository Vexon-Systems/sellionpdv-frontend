import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCaixas } from "../hooks/useCaixas";
import { RelatoriosFilter } from "./RelatoriosFilter";
import { exportarCaixasPdf } from "../services/exportarPdf";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

const formatarData = (isoString: string | null) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};

export function CaixasView() {
  const { date, tabAtiva, handleTabChange, handleCalendarChange, caixas, isLoading } = useCaixas();
  const [isExportando, setIsExportando] = useState(false);

  const handleExportarPdf = async () => {
    setIsExportando(true);
    const periodo = date?.from && date?.to
      ? `${format(date.from, "dd/MM/yyyy", { locale: ptBR })} — ${format(date.to, "dd/MM/yyyy", { locale: ptBR })}`
      : "Período selecionado";
    await exportarCaixasPdf(caixas, periodo);
    setIsExportando(false);
  };

  return (
    <div className="space-y-6">
      <RelatoriosFilter
        titulo="Auditoria de Turnos (Caixas)"
        subtitulo="Acompanhamento de sangrias, reforços e furos operacionais."
        date={date}
        tabAtiva={tabAtiva}
        isLoading={isLoading}
        onTabChange={handleTabChange}
        onCalendarChange={handleCalendarChange}
        onExportarPdf={handleExportarPdf}
        isExportando={isExportando}
      />

      {/* Tabela de Auditoria */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardContent className="p-4">
          <div className="overflow-x-auto min-h-100">
            <Table>
              <TableHeader className="bg-white">
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Abertura</TableHead>
                  <TableHead>Fechamento</TableHead>
                  <TableHead>Op. Abertura</TableHead>
                  <TableHead>Op. Fechamento</TableHead>
                  <TableHead className="text-right">Total de Vendas</TableHead>
                  <TableHead className="text-right">Diferença / Furo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && caixas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                    </TableCell>
                  </TableRow>
                ) : caixas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                      Nenhum caixa encontrado para o período selecionado.
                    </TableCell>
                  </TableRow>
                ) : (
                  caixas.map((caixa) => (
                    <TableRow key={caixa.caixaId} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-600">#{caixa.caixaId}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-[11px] font-bold tracking-wider ${
                          caixa.status === 'FECHADO' ? 'bg-gray-200 text-gray-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {caixa.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{formatarData(caixa.dataAbertura)}</TableCell>
                      <TableCell className="text-sm">{formatarData(caixa.dataFechamento)}</TableCell>
                      <TableCell className="text-sm text-gray-700">{caixa.operadorAbertura}</TableCell>
                      <TableCell className="text-sm text-gray-700">{caixa.operadorFechamento || '-'}</TableCell>
                      
                      <TableCell className="text-right text-sm font-medium">
                        {formatarMoeda(caixa.totalVendas)}
                      </TableCell>
                      
                      {/* Lógica Semântica de Cores para Auditoria */}
                      <TableCell className="text-right p-0 align-middle">
                        <div className={`h-full w-full px-4 py-3 text-sm font-bold flex items-center justify-end ${
                          caixa.furoCaixa < 0 ? 'text-red-600 bg-red-50 border-l-2 border-red-500' : 
                          caixa.furoCaixa > 0 ? 'text-orange-600 bg-orange-50 border-l-2 border-orange-500' : 
                          'text-emerald-600'
                        }`}>
                          {caixa.furoCaixa !== 0 ? formatarMoeda(caixa.furoCaixa) : 'OK'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}