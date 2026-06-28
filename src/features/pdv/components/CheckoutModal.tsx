import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, Banknote, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldContent, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { formatarMoeda } from "@/lib/utils";
import { useCheckout } from "../hooks/useCheckout";
import type { DadosSucesso } from "@/types/pdv";
import pix from "../../../assets/pix.png";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    subtotal: number;
    onSuccessCallback: (dados: DadosSucesso) => void;
}

export function CheckoutModal({ isOpen, onClose, subtotal, onSuccessCallback }: CheckoutModalProps) {
    const {
        formaPagamento,
        setFormaPagamento,
        maquininhaId,
        setMaquininhaId,
        bandeiraCartao,
        setBandeiraCartao,
        maquininhasAtivas,
        isLoadingMaquininhas,
        exigeMaquininha,
        isPending,
        handleConfirmar,
    } = useCheckout({ isOpen, subtotal, onSuccess: onSuccessCallback, onClose });

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
                    onValueChange={(val) => setFormaPagamento(val as any)}
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

                {exigeMaquininha && (
                    <div className="space-y-3 pt-2 border-t border-gray-100 animate-in fade-in-50 duration-200">
                        <div className="space-y-2">
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

                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-800">
                                Bandeira do Cartão <span className="text-gray-400 font-normal">(opcional)</span>
                            </Label>
                            <Select
                                value={bandeiraCartao ?? "NENHUMA"}
                                onValueChange={(val) => setBandeiraCartao(val === "NENHUMA" ? null : val as any)}
                                disabled={isPending}
                            >
                                <SelectTrigger className="w-full bg-white h-11 border-gray-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="NENHUMA">Não informar</SelectItem>
                                    <SelectItem value="VISA">Visa</SelectItem>
                                    <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                                    <SelectItem value="ELO">Elo</SelectItem>
                                    <SelectItem value="HIPERCARD">Hipercard</SelectItem>
                                    <SelectItem value="AMEX">American Express</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {formaPagamento === "PIX" && (
                    <div className="flex flex-col items-center justify-center bg-slate-50 p-4 border rounded-xl border-dashed animate-in fade-in-50 duration-300">
                        <img src={pix} alt="QR Code Pix" className="w-20 h-20 object-contain" />
                        <p className="text-xs text-slate-500 mt-2">Aguarde a confirmação no aplicativo bancário.</p>
                    </div>
                )}

                <div className="bg-slate-100 px-4 py-3 rounded-xl flex justify-between items-center border border-slate-200 mt-2">
                    <span className="text-slate-600 font-medium text-sm">Total a cobrar:</span>
                    <span className="text-xl font-bold text-blue-950">
                        {formatarMoeda(subtotal)}
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
