import { useState, useEffect } from "react";
import { fetchCaixas } from "../services/apiRelatorios";
import { type RelatorioCaixa } from "../types/relatorios";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search } from "lucide-react";

const formatarMoeda = (valor: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

const formatarData = (isoString: string | null) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};

export function CaixasView() {
  const [dataInicial, setDataInicial] = useState("2026-05-01");
  const [dataFinal, setDataFinal] = useState("2026-05-28");
  
  const [caixas, setCaixas] = useState<RelatorioCaixa[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const carregarCaixas = async () => {
    setIsLoading(true);
    try {
      const response = await fetchCaixas(dataInicial, dataFinal, 0, 100); 
      setCaixas(response.content);
    } catch (error) {
      console.error("Erro ao carregar Caixas", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarCaixas();
  }, []);

  return (
    <div className="space-y-6">
      
      <Card className="bg-white">
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
            <Button onClick={carregarCaixas} disabled={isLoading} className="w-full md:w-auto bg-blue-950 hover:bg-blue-900">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Buscar Caixas
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Abertura</TableHead>
                  <TableHead>Fechamento</TableHead>
                  <TableHead>Operador (Abertura)</TableHead>
                  <TableHead className="text-right">Entradas (Dinheiro)</TableHead>
                  <TableHead className="text-right">Diferença / Furo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && caixas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                      Nenhum caixa encontrado neste período.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && caixas.map((caixa) => (
                  <TableRow key={caixa.caixaId} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium text-gray-600">#{caixa.caixaId}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        caixa.status === 'FECHADO' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                      }`}>
                        {caixa.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{formatarData(caixa.dataAbertura)}</TableCell>
                    <TableCell className="text-sm">{formatarData(caixa.dataFechamento)}</TableCell>
                    <TableCell className="text-sm text-gray-700">{caixa.operadorAbertura}</TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatarMoeda(caixa.totalVendasDinheiro)}
                    </TableCell>
                    <TableCell className={`text-right text-sm font-bold ${
                      caixa.furoCaixa < 0 ? 'text-red-600' : caixa.furoCaixa > 0 ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {caixa.furoCaixa !== 0 ? formatarMoeda(caixa.furoCaixa) : 'OK'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}