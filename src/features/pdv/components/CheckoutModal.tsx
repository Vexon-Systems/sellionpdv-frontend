import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { QrCode, CreditCard, Banknote, Landmark, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { useCartStore } from "@/store/useCartStore";
import type { FormaPagamento } from "../types/venda";
import { useFinalizarVenda } from "../hooks/useFinalizarVenda";
import { toast } from "sonner";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    subtotal: number;
    onSuccessCallback: (dados: any) => void; 
}

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL'
});

export function CheckoutModal({isOpen, onClose, subtotal, onSuccessCallback}: CheckoutModalProps ){
    const { itens, limparCarrinho } = useCartStore();
    const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setFormaPagamento(null);
        }
    }, [isOpen]);

    const {mutate, isPending} = useFinalizarVenda();

    const handleConfirmar = () => {
        if (!formaPagamento) {
            toast.warning("Atenção", {
                description: "Por favor, selecione uma forma de pagamento."
            });
            return;
        }
        
        const itensFormatados = itens.map((item) => {
            return {
                produtoId: item.produto.id,
                quantidade: item.quantidade,

                modificadores: item.modificadores ? item.modificadores.map((mod) => ({
                    opcaoId: mod.opcaoId
                })) : []
            };
        });
        
        const payload = {
                itens: itensFormatados,
                formaPagamento: formaPagamento,
                maquininhaId: null,
                descontoAplicado: 0.00
            };

        mutate(payload, {
            onSuccess: (respostaDaApi: any) => {
                const dadosCongelados = {
                    id: respostaDaApi?.id || Math.floor(Math.random() * 10000), 
                    itens: [...itens], 
                    total: subtotal
                };
                
                onSuccessCallback(dadosCongelados);
                
                toast.success("Venda finalizada com sucesso!");
                onClose();
            },
            onError: (error) => {
                console.error(error);
                toast.error("Erro na Venda", {
                    description: "Não foi possível processar. Tente novamente."
                });
            }
        });
        
        // mutate(payload, {
        //     onSuccess: () => {
        //         limparCarrinho();
        //         onClose();
        //         toast.success("Sucesso!", {
        //             description: "Venda finalizada com sucesso."
        //         });
        //     },
        //     onError: (error) => {
        //         console.error(error);
        //         toast.error("Erro na Venda", {
        //             description: "Não foi possível processar. Tente novamente."
        //         });
        //     }
        // })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-100 gap-4">

                <DialogHeader className="flex items-center text-center p-2">
                    <DialogTitle>Confirmar Venda</DialogTitle>
                    <DialogDescription>Selecione a forma de pagamento desejada para processar a venda</DialogDescription>
                </DialogHeader>
                
                {isPending ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <Loader2 className="h-32 w-32 animate-spin text-blue-900" />
                        <h3 className="text-xl font-semibold text-slate-800">Processando Pagamento...</h3>
                        <p className="text-sm text-slate-500 text-center">
                            Por favor, aguarde alguns instantes enquanto registramos a venda.
                        </p>
                    </div>
                ): (
                    <>
                        <RadioGroup 
                            value={formaPagamento || ""}
                            onValueChange={(selectValue) => setFormaPagamento(selectValue as FormaPagamento)}
                            className="flex flex-col gap-4"
                        >

                            <FieldLabel className="shadow-sm hover:-translate-y-1 hover:transition-all duration-300 cursor-pointer hover:shadow-md">
                                <Field orientation={"horizontal"}>
                                    <FieldContent className="flex flex-row gap-3">
                                        <div className="flex w-6 h-full">
                                            <Banknote className="text-gray-500"/>
                                        </div>
                                        <FieldTitle className="font-semibold">Dinheiro</FieldTitle>
                                    </FieldContent>
                                    <RadioGroupItem value="DINHEIRO"/>
                                </Field>
                            </FieldLabel>

                            <FieldLabel className="shadow-sm hover:-translate-y-1 hover:transition-all duration-300 cursor-pointer hover:shadow-md">
                                <Field orientation={"horizontal"}>
                                    <FieldContent className="flex flex-row gap-3">
                                        <div className="flex w-6 h-full">
                                            <CreditCard className="text-gray-500"/>
                                        </div>
                                        <FieldTitle className="font-semibold">Crédito</FieldTitle>
                                    </FieldContent>
                                    <RadioGroupItem value="CREDITO"/>
                                </Field>
                            </FieldLabel>

                            <FieldLabel className="shadow-sm hover:-translate-y-1 hover:transition-all duration-300 cursor-pointer hover:shadow-md">
                                <Field orientation={"horizontal"}>
                                    <FieldContent className="flex flex-row gap-3">
                                        <div className="flex w-6 h-full">
                                            <Landmark className="text-gray-500"/>
                                        </div>
                                        <FieldTitle className="font-semibold">Débito</FieldTitle>
                                    </FieldContent>
                                    <RadioGroupItem value="DEBITO"/>
                                </Field>
                            </FieldLabel>

                            <FieldLabel className="shadow-sm hover:-translate-y-1 hover:transition-all duration-300 cursor-pointer hover:shadow-md">
                                <Field orientation={"horizontal"}>
                                    <FieldContent className="flex flex-row gap-3">
                                        <div className="flex w-6 h-full">
                                            <QrCode className="text-teal-400"/>
                                        </div>
                                        <FieldTitle className="font-semibold">PIX</FieldTitle>
                                    </FieldContent>
                                    <RadioGroupItem value="PIX"/>
                                </Field>
                            </FieldLabel>
                        </RadioGroup>
                    </>
                )}

                

                <div className="bg-slate-100 px-4 py-2 rounded-lg flex justify-between items-center border border-slate-100">
                    <span className="text-slate-600 font-medium">Total a cobrar:</span>
                    <span className="text-xl font-bold text-blue-900">
                        {formatadorMoeda.format(subtotal)}
                    </span>
                </div>
                
                <DialogFooter>
                    <Button 
                    onClick={handleConfirmar}
                    disabled={!formaPagamento || isPending}
                    className="w-full h-10 bg-linear-to-br from-blue-950 to-blue-900 hover:-translate-y-0.5 hover:brightness-130 transition-all duration-300 text-white shadow-md cursor-pointer">
                        {isPending ? "Processando..." : "Confirmar Pagamento"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}