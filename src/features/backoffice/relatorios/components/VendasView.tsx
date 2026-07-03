import { useState } from "react";
import { format } from "date-fns";
import { useVendas } from "../hooks/useVendas";
import { downloadPdf } from "@/lib/downloadPdf";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// 1. Importações do Pagination do Shadcn
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

import { Loader2, Eye, Receipt, AlertCircle, Ban, MoreHorizontal, FileDown } from "lucide-react";

const formatarMoeda = (valor: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

const formatarDataHora = (dataIso: string) => 
  format(new Date(dataIso), "dd/MM/yyyy 'às' HH:mm");

export function VendasView() {
  const {
    vendas, isLoading, paginaAtual, setPaginaAtual, totalPaginas,
    statusFiltro, setStatusFiltro, isSheetOpen, setIsSheetOpen,
    detalhesVenda, isLoadingDetalhes, abrirDetalhes,
    isCancelDialogOpen, setIsCancelDialogOpen, abrirModalCancelamento,
    vendaSelecionadaParaCancelamento, cancelarVenda
  } = useVendas();

  const [justificativa, setJustificativa] = useState("");
  const [isCancelando, setIsCancelando] = useState(false);
  const [isExportando, setIsExportando] = useState(false);

  const handleExportarPdf = async () => {
    if (isExportando) return;
    setIsExportando(true);
    try {
      const status = statusFiltro === "TODAS" ? undefined : statusFiltro;
      await downloadPdf(
        "/api/relatorios/vendas.pdf",
        "historico-vendas.pdf",
        { status }
      );
    } catch {
      // Erro já foi comunicado via toast dentro de downloadPdf.
    } finally {
      setIsExportando(false);
    }
  };

  const handleConfirmarCancelamento = async () => {
    if (!justificativa.trim()) return;
    
    setIsCancelando(true);
    try {
      await cancelarVenda(justificativa);
      setJustificativa("");
    } catch (error) {
      console.error("Erro ao cancelar venda:", error);
      alert("Não foi possível cancelar a venda. Verifique se o caixa já foi fechado.");
    } finally {
      setIsCancelando(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-sm border-gray-200">
        <CardContent className="p-0">
          <div className="pb-4 px-4 pt-4 border-b flex flex-col md:flex-row items-center justify-between gap-3 bg-white rounded-t-xl">
            <h3 className="font-semibold text-gray-700 w-full md:w-auto">Últimas Transações</h3>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="w-full md:w-64">
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
              <Button variant="outline" className="border-gray-200 gap-2 w-full sm:w-auto" onClick={handleExportarPdf} disabled={isExportando}>
                {isExportando ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                Exportar PDF
              </Button>
            </div>
          </div>

          <div className="relative w-full overflow-auto min-h-[400px] px-4">
            {isLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-900 h-8 w-8" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data e Hora</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-12.5"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma venda encontrada.</TableCell></TableRow>
                  ) : (
                    vendas.map((venda) => (
                      <TableRow key={venda.vendaId} className={venda.status === 'CANCELADA' ? 'bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-gray-50/50'}>
                        <TableCell className="font-medium text-gray-500 pl-2">#{venda.vendaId}</TableCell>
                        <TableCell className="text-sm">{formatarDataHora(venda.dataVenda)}</TableCell>
                        <TableCell className="text-sm">{venda.nomeOperador}</TableCell>
                        <TableCell className="text-sm">{venda.formaPagamento}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            venda.status === 'CONCLUIDA' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {venda.status}
                          </span>
                        </TableCell>
                        <TableCell className={`text-right font-bold text-sm ${venda.status === 'CANCELADA' ? 'line-through text-red-400' : 'text-gray-900'}`}>
                          {formatarMoeda(venda.valorTotal)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => abrirDetalhes(venda.vendaId)} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4 text-gray-500" />
                                <span>Ver Detalhes do Pedido</span>
                              </DropdownMenuItem>
                              
                              {venda.status === 'CONCLUIDA' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => abrirModalCancelamento(venda.vendaId)}
                                    className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    <span>Estornar Venda</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between px-4 pt-4 border-t rounded-b-lg gap-4 sm:gap-0">
            <span className="text-sm text-gray-500 font-medium">
              Mostrando página {paginaAtual + 1} de {totalPaginas}
            </span>
            
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (paginaAtual > 0 && !isLoading) setPaginaAtual(p => p - 1);
                    }}
                    className={paginaAtual === 0 || isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                <PaginationItem>
                  <PaginationLink href="#" isActive className="pointer-events-none">
                    {paginaAtual + 1}
                  </PaginationLink>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (paginaAtual < totalPaginas - 1 && !isLoading) setPaginaAtual(p => p + 1);
                    }}
                    className={paginaAtual >= totalPaginas - 1 || isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

        </CardContent>
      </Card>

      {/* MODAL ISOLADO: Estorno da Venda */}
      <Dialog open={isCancelDialogOpen} onOpenChange={(open) => { setIsCancelDialogOpen(open); if(!open) setJustificativa(""); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Confirmar Estorno
            </DialogTitle>
            <DialogDescription className="pt-2 text-gray-600">
              Você está prestes a cancelar a Venda <strong>#{vendaSelecionadaParaCancelamento}</strong>. Esta ação anulará a entrada financeira. E não poderá ser desfeita!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Justificativa da Auditoria</label>
              <Input 
                placeholder="Ex: Cliente desistiu antes do preparo" 
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
              />
              <p className="text-xs text-gray-500">Motivo será registrado para auditoria de caixas.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)} disabled={isCancelando}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleConfirmarCancelamento} disabled={!justificativa.trim() || isCancelando}>
              {isCancelando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmar Estorno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ABA LATERAL ISOLADA: Recibo Apenas Leitura */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-gray-50 p-4">
          <SheetHeader className="mb-6 border-b pb-4">
            <div className="flex items-center gap-2">
              <Receipt className="text-blue-900" />
              <SheetTitle>Recibo da Venda</SheetTitle>
            </div>
          </SheetHeader>

          {isLoadingDetalhes || !detalhesVenda ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-900" /></div>
          ) : (
            <div className="space-y-6">
              
              <div className="bg-white p-4 rounded-lg border shadow-sm space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Pedido nº</span><span className="font-bold">#{detalhesVenda.vendaId}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Data</span><span>{formatarDataHora(detalhesVenda.dataVenda)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Operador</span><span>{detalhesVenda.nomeOperador}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pagamento</span><span>{detalhesVenda.formaPagamento}</span></div>
              </div>

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

              <div>
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">Itens Vendidos</h4>
                <div className="space-y-3">
                  {detalhesVenda.itens.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border shadow-sm text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900">{item.quantidade}x {item.nomeProduto}</span>
                        <span className="font-semibold">{formatarMoeda(item.subtotalItem)}</span>
                      </div>
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

              <div className={`p-4 rounded-lg shadow-md flex justify-between items-center ${detalhesVenda.status === 'CANCELADA' ? 'bg-gray-300 text-gray-500' : 'bg-blue-950 text-white'}`}>
                <span className={`font-medium uppercase tracking-wider text-sm ${detalhesVenda.status === 'CANCELADA' ? 'text-gray-500' : 'text-blue-200'}`}>Total da Venda</span>
                <span className={`text-2xl font-bold ${detalhesVenda.status === 'CANCELADA' ? 'line-through' : ''}`}>{formatarMoeda(detalhesVenda.valorTotal)}</span>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}