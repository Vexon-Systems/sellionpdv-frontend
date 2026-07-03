import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, Printer, PlusCircle } from "lucide-react";
import { downloadPdf } from "@/lib/downloadPdf";
import type { ItemCarrinho } from "../../../types/pdv";
import img_pgm_sucesso from "../../../assets/Img_Pagamento_Sucesso.png"

interface SuccessViewProps {
    dadosVenda: {
        id: number;
        itens: ItemCarrinho[];
        total: number;
    } | null;
  onNovaVenda: () => void;
}

export function SuccessView({ dadosVenda, onNovaVenda }: SuccessViewProps) {
    const isOpen = !!dadosVenda;
    const [isImprimindo, setIsImprimindo] = useState(false);

    const handleImprimir = async () => {
        if (!dadosVenda || isImprimindo) return;
        setIsImprimindo(true);
        try {
            await downloadPdf(
                `/api/vendas/${dadosVenda.id}/recibo.pdf`,
                `recibo-venda-${dadosVenda.id}.pdf`
            );
        } catch {
            // Erro já foi comunicado via toast dentro de downloadPdf.
        } finally {
            setIsImprimindo(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onNovaVenda(); }}>
            
            <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none [&>button:last-child]:hidden">

                <Card className="overflow-hidden border-none shadow-2xl rounded-2xl w-full">
                    <CardContent className="grid p-0 md:grid-cols-2 bg-white">
                        
                        <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
                            <img src={img_pgm_sucesso} alt="Imagem de Sucesso" className="w-50" />
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold text-slate-800">Venda Finalizada!</h2>
                                <p className="text-slate-500">
                                    Pedido <span className="font-bold text-slate-800">#{dadosVenda?.id}</span> processado com sucesso.
                                </p>
                            </div>
                            <div className="flex flex-col w-full gap-3 mt-4">
                                <Button
                                    className="w-full bg-linear-to-br from-blue-950 to-blue-900 hover:-translate-y-0.5 hover:brightness-130 transition-all duration-300 text-white shadow-md gap-2 h-12 text-md cursor-pointer"
                                    onClick={handleImprimir}
                                    disabled={isImprimindo}
                                >
                                    {isImprimindo ? <Loader2 size={20} className="animate-spin" /> : <Printer size={20} />}
                                    {isImprimindo ? "Gerando recibo..." : "Imprimir Recibo"}
                                </Button>
                                <Button variant="outline" className="w-full border-gray-300 gap-2 h-12 text-md cursor-pointer hover:-translate-y-0.5 hover:bg-gray-100 transition-all duration-300" onClick={onNovaVenda}>
                                    <PlusCircle size={20} />
                                    Nova Venda
                                </Button>
                            </div>
                        </div>

                        <div className="hidden md:flex flex-col bg-slate-50 rounded-md p-8 mr-4 border-l border-slate-100 h-125">
                            <CheckCircle2 className="w-16 h-16 mb-6 mx-auto text-emerald-500" />
                            <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Resumo do Pedido</h3>
                            <div className="flex-1 overflow-y-auto space-y-3">
                                {dadosVenda?.itens.map((item, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span className="text-slate-600">{item.quantidade}x {item.produto.nome}</span>
                                        <span className="font-medium text-slate-800">
                                            R$ {item.subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                                <span className="font-bold text-slate-600">Total Pago</span>
                                <span className="text-xl font-bold text-blue-900">
                                    R$ {dadosVenda?.total.toFixed(2)}
                                </span>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
}