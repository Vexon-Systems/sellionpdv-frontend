import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fetchVendas, fetchVendaDetalhes } from "../services/apiRelatorios";
import { type VendaResumo, type VendaDetalhes } from "../types/relatorios";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye, Receipt, AlertCircle } from "lucide-react";

const formatarMoeda = (valor: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

const formatarDataHora = (dataIso: string) => 
  format(new Date(dataIso), "dd/MM/yyyy 'às' HH:mm");

export function VendasView() {
  const [vendas, setVendas] = useState<VendaResumo[]>([]);
  const [statusFiltro, setStatusFiltro] = useState<string>("TODAS");
  const [isLoading, setIsLoading] = useState(false);

  // Estados do Modal Lateral (Sheet)
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [detalhesVenda, setDetalhesVenda] = useState<VendaDetalhes | null>(null);
  const [isLoadingDetalhes, setIsLoadingDetalhes] = useState(false);

  const carregarVendas = async () => {
    setIsLoading(true);
    try {
      const statusParam = statusFiltro === "TODAS" ? undefined : statusFiltro;
      const response = await fetchVendas(0, 50, statusParam); 
      setVendas(response.content);
    } catch (error) {
      console.error("Erro ao carregar vendas", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarVendas();
  }, [statusFiltro]);

  const abrirDetalhes = async (id: number) => {
    setIsSheetOpen(true);
    setIsLoadingDetalhes(true);
    try {
      const detalhes = await fetchVendaDetalhes(id);
      setDetalhesVenda(detalhes);
    } catch (error) {
      console.error("Erro ao carregar detalhes", error);
    } finally {
      setIsLoadingDetalhes(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtro e Tabela */}
      <Card className="bg-white">
        <CardContent className="p-0">
          <div className="px-4 pb-3 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Últimas Transações</h3>
            <div className="w-45">
              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAS">Todas as Vendas</SelectItem>
                  <SelectItem value="CONCLUIDA">Apenas Concluídas</SelectItem>
                  <SelectItem value="CANCELADA">Apenas Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative w-full overflow-auto max-h-150">
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data e Hora</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma venda encontrada para este filtro.</TableCell></TableRow>
                  ) : (
                    vendas.map((venda) => (
                      <TableRow key={venda.vendaId} className={venda.status === 'CANCELADA' ? 'bg-red-50/30' : ''}>
                        <TableCell className="font-medium text-gray-500">#{venda.vendaId}</TableCell>
                        <TableCell>{formatarDataHora(venda.dataVenda)}</TableCell>
                        <TableCell>{venda.nomeOperador}</TableCell>
                        <TableCell>{venda.formaPagamento}</TableCell>
                        <TableCell>
                          <Badge variant={venda.status === 'CONCLUIDA' ? 'default' : 'destructive'} 
                                 className={venda.status === 'CONCLUIDA' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                            {venda.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-bold ${venda.status === 'CANCELADA' ? 'line-through text-red-400' : 'text-gray-900'}`}>
                          {formatarMoeda(venda.valorTotal)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => abrirDetalhes(venda.vendaId)}>
                            <Eye size={18} className="text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Slide-out (Sheet) para Detalhes da Venda */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-gray-50 p-4">
          <SheetHeader className="mb-6 border-b pb-4">
            <div className="flex items-center gap-2">
              <Receipt className="text-primary" />
              <SheetTitle>Recibo da Venda</SheetTitle>
            </div>
            <SheetDescription>
              Detalhes completos da transação.
            </SheetDescription>
          </SheetHeader>

          {isLoadingDetalhes || !detalhesVenda ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-6">
              {/* Header do Recibo */}
              <div className="bg-white p-4 rounded-lg border shadow-sm space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Pedido nº</span><span className="font-bold">#{detalhesVenda.vendaId}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Data</span><span>{formatarDataHora(detalhesVenda.dataVenda)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Operador</span><span>{detalhesVenda.nomeOperador}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pagamento</span><span>{detalhesVenda.formaPagamento}</span></div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={detalhesVenda.status === 'CONCLUIDA' ? 'default' : 'destructive'}>{detalhesVenda.status}</Badge>
                </div>
              </div>

              {/* Justificativa em caso de Cancelamento */}
              {detalhesVenda.status === 'CANCELADA' && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex gap-3 text-red-800 text-sm">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1">Venda Estornada</p>
                    <p>{detalhesVenda.justificativaCancelamento}</p>
                    <p className="text-xs mt-2 opacity-70">Cancelado em {detalhesVenda.dataCancelamento ? formatarDataHora(detalhesVenda.dataCancelamento) : 'N/A'}</p>
                  </div>
                </div>
              )}

              {/* Itens da Venda */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">Itens Vendidos</h4>
                <div className="space-y-3">
                  {detalhesVenda.itens.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900">{item.quantidade}x {item.nomeProduto}</span>
                        <span className="font-semibold">{formatarMoeda(item.subtotalItem)}</span>
                      </div>
                      
                      {/* Lista de Modificadores do Produto */}
                      {item.modificadores && item.modificadores.length > 0 && (
                        <ul className="pl-6 space-y-1 text-xs text-muted-foreground list-disc marker:text-gray-300 mt-2 border-t pt-2">
                          {item.modificadores.map((mod, modIdx) => (
                            <li key={modIdx} className="flex justify-between">
                              <span>+ {mod.nomeOpcao}</span>
                              {mod.valorAdicional > 0 && <span>{formatarMoeda(mod.valorAdicional)}</span>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Totalizador */}
              <div className="bg-blue-950 text-white p-4 rounded-lg shadow-md flex justify-between items-center">
                <span className="font-medium uppercase tracking-wider text-sm text-blue-200">Total da Venda</span>
                <span className="text-2xl font-bold">{formatarMoeda(detalhesVenda.valorTotal)}</span>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
}