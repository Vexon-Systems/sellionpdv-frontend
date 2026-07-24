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

                <Card className="w-full overflow-hidden border-none rounded-2xl shadow-floating">
                    <CardContent className="grid bg-surface-raised p-0 md:grid-cols-2">
                        
                        <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
                            <img src={img_pgm_sucesso} alt="Imagem de Sucesso" className="w-50" />
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold text-foreground">Venda Finalizada!</h2>
                                <p className="text-muted-foreground">
                                    Pedido <span className="font-bold text-slate-800">#{dadosVenda?.id}</span> processado com sucesso.
                                </p>
                            </div>
                            <div className="flex flex-col w-full gap-3 mt-4">
                                <Button
                                    size="lg"
                                    className="h-12 w-full gap-2 text-base"
                                    onClick={handleImprimir}
                                    disabled={isImprimindo}
                                >
                                    {isImprimindo ? <Loader2 size={20} className="animate-spin" /> : <Printer size={20} />}
                                    {isImprimindo ? "Gerando recibo..." : "Imprimir Recibo"}
                                </Button>
                                <Button variant="outline" size="lg" className="h-12 w-full gap-2 text-base" onClick={onNovaVenda}>
                                    <PlusCircle size={20} />
                                    Nova Venda
                                </Button>
                            </div>
                        </div>

                        <div className="mr-4 hidden h-125 flex-col rounded-md border-l bg-surface-sunken p-8 md:flex">
                            <CheckCircle2 className="mx-auto mb-6 size-16 text-success" />
                            <h3 className="mb-4 border-b pb-2 text-lg font-bold text-foreground">Resumo do Pedido</h3>
                            <div className="flex-1 overflow-y-auto space-y-3">
                                {dadosVenda?.itens.map((item, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{item.quantidade}x {item.produto.nome}</span>
                                        <span className="font-medium text-foreground">
                                            R$ {item.subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t pt-4">
                                <span className="font-bold text-muted-foreground">Total Pago</span>
                                <span className="text-xl font-bold tabular-nums text-primary">
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
