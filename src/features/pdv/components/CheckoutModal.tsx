// src/features/pdv/components/CheckoutModal.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { QrCode, CreditCard, Banknote, Landmark, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"; 

import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { useCartStore } from "@/store/useCartStore";
import type { FormaPagamento } from "../types/venda";
import { useFinalizarVenda } from "../hooks/useFinalizarVenda";
import { apiMaquininhas } from "@/features/backoffice/maquininhas/services/apiMaquininhas";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import pix from "../../../assets/pix.png";

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
    const [maquininhaId, setMaquininhaId] = useState<string | null>(null); // Estado para a maquininha selecionada

    const { mutate, isPending } = useFinalizarVenda();

    // 1. Busca as maquininhas cadastradas no banco de dados
    const { data: maquininhas = [], isLoading: isLoadingMaquininhas } = useQuery({
        queryKey: ['lista-maquininhas'],
        queryFn: apiMaquininhas.listarTodas,
        enabled: isOpen, // Só busca se o modal estiver aberto
    });

    // Filtra apenas as maquininhas que estão ativas para operação
    const maquininhasAtivas = maquininhas.filter(m => m.ativo);

    // Limpa a seleção da maquininha se mudar a forma de pagamento
    useEffect(() => {
        if (formaPagamento !== 'CREDITO' && formaPagamento !== 'DEBITO') {
            setMaquininhaId(null);
        }
    }, [formaPagamento]);

    // Reseta os estados ao fechar ou abrir o modal
    useEffect(() => {
        if (!isOpen) {
            setFormaPagamento(null);
            setMaquininhaId(null);
        }
    }, [isOpen]);

    const handleConfirmar = () => {
        if (!formaPagamento) {
            toast.warning("Atenção", { description: "Por favor, selecione uma forma de pagamento." });
            return;
        }

        const exigeMaquininha = formaPagamento === 'CREDITO' || formaPagamento === 'DEBITO';
        
        if (exigeMaquininha && !maquininhaId) {
            toast.warning("Atenção", { description: "Por favor, selecione qual maquininha foi utilizada." });
            return;
        }

        const payload = {
            itens: itens, 
            formaPagamento: formaPagamento,
            maquininhaId: exigeMaquininha ? Number(maquininhaId) : null,
            descontoAplicado: 0.00
        };

        mutate(payload, {
            onSuccess: (respostaDaApi: any) => {
                const dadosCongelados = {
                    id: respostaDaApi?.id,
                    itens: [...itens], 
                    total: subtotal
                };
                
                onSuccessCallback(dadosCongelados);
                limparCarrinho();
                onClose();
            },
            onError: (error: any) => {
                const mensagem = error.response?.data?.detail || "Não foi possível processar. Tente novamente.";
                toast.error("Erro na Venda", { description: mensagem });
            }
        });
    };

    const exigeMaquininha = formaPagamento === 'CREDITO' || formaPagamento === 'DEBITO';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
            <DialogContent className="sm:max-w-120 bg-white gap-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">Finalizar Venda</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Escolha o método de pagamento para concluir a transação.
                    </DialogDescription>
                </DialogHeader>

                <RadioGroup 
                    value={formaPagamento || ""} 
                    onValueChange={(val) => setFormaPagamento(val as FormaPagamento)}
                    disabled={isPending}
                    className="grid grid-cols-2 gap-3"
                >
                    <FieldLabel>
                        <Field className="h-14">
                            <FieldContent>
                                <div className="flex p-2 justify-between items-center text-green-600 rounded-full">
                                    <div className="flex gap-3">
                                        <Banknote size={20}/>
                                        <FieldTitle className="font-semibold text-gray-800">Dinheiro</FieldTitle>
                                    </div>
                                    <RadioGroupItem value="DINHEIRO"/>
                                </div>
                            </FieldContent>
                        </Field>
                    </FieldLabel>

                    <FieldLabel>
                        <Field className="h-14">
                            <FieldContent>
                                <div className="flex p-2 justify-between items-center text-cyan-600 rounded-full">
                                    <div className="flex gap-3">
                                        <img src={pix} alt="Logo do PIX" className="w-5" />
                                        <FieldTitle className="font-semibold text-gray-800">PIX</FieldTitle>
                                    </div>
                                    <RadioGroupItem value="PIX"/>
                                </div>
                            </FieldContent>
                        </Field>
                    </FieldLabel>

                    <FieldLabel>
                        <Field className="h-14">
                            <FieldContent>
                                <div className="flex p-2 justify-between items-center text-blue-600 rounded-full">
                                    <div className="flex gap-3">
                                        <CreditCard/>
                                        <FieldTitle className="font-semibold text-gray-800">Crédito</FieldTitle>
                                    </div>
                                    <RadioGroupItem value="CREDITO"/>
                                </div>
                            </FieldContent>
                        </Field>
                    </FieldLabel>

                    <FieldLabel>
                        <Field className="h-14">
                            <FieldContent>
                                <div className="flex p-2 justify-between items-center text-purple-600 rounded-full">
                                    <div className="flex gap-3">
                                        <CreditCard/>
                                        <FieldTitle className="font-semibold text-gray-800">Débito</FieldTitle>
                                    </div>
                                    <RadioGroupItem value="DEBITO"/>
                                </div>
                            </FieldContent>
                        </Field>
                    </FieldLabel>
                </RadioGroup>

                {/* EXIBIÇÃO DINÂMICA DA SELEÇÃO DE MAQUININHA */}
                {exigeMaquininha && (
                    <div className="space-y-2 pt-2 border-t border-gray-100 animate-in fade-in-50 duration-200">
                        <Label className="font-semibold text-gray-800">Selecione a Maquininha Utilizada</Label>
                        
                        <Select 
                            value={maquininhaId || ""} 
                            onValueChange={setMaquininhaId}
                            disabled={isPending || isLoadingMaquininhas}
                        >
                            <SelectTrigger className="w-full bg-white h-11 border-gray-200">
                                <SelectValue placeholder={isLoadingMaquininhas ? "Carregando terminais..." : "Selecione o terminal..."} />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {maquininhasAtivas.length === 0 ? (
                                    <div className="p-3 text-sm text-center text-gray-500">
                                        Nenhum terminal ativo cadastrado.
                                    </div>
                                ) : (
                                    maquininhasAtivas.map((maq) => (
                                        <SelectItem key={maq.id} value={maq.id.toString()}>
                                            {maq.nome} ({maq.marca})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Imagem do QR Code estática para o PIX */}
                {formaPagamento === "PIX" && (
                    <div className="flex flex-col items-center justify-center bg-slate-50 p-4 border rounded-xl border-dashed animate-in fade-in-50 duration-300">
                        <img src={pix} alt="QR Code Pix" className="w-20 h-20 object-contain" />
                        <p className="text-xs text-slate-500 mt-2">Aguarde a confirmação no aplicativo bancário.</p>
                    </div>
                )}

                <div className="bg-slate-100 px-4 py-3 rounded-xl flex justify-between items-center border border-slate-200 mt-2">
                    <span className="text-slate-600 font-medium text-sm">Total a cobrar:</span>
                    <span className="text-xl font-bold text-blue-950">
                        {formatadorMoeda.format(subtotal)}
                    </span>
                </div>
                
                <DialogFooter>
                    <Button 
                        onClick={handleConfirmar}
                        disabled={!formaPagamento || (exigeMaquininha && !maquininhaId) || isPending}
                        className="w-full h-11 bg-linear-to-br from-blue-950 to-blue-900 hover:brightness-110 text-white shadow-md cursor-pointer rounded-xl font-medium"
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin w-4 h-4" />
                                Processando Transação...
                            </div>
                        ) : "Confirmar Pagamento"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}