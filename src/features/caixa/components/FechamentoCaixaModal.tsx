import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumericFormat } from "react-number-format";
import { Info } from "lucide-react";
import type { FechamentoDTO } from "../types/caixa";
import { criarFechamentoDTO } from "../utils/criarFechamentoDTO";

const formSchema = z.object({
    dinheiro: z.number().min(0, "O valor não pode ser negativo."),
});

type FormInputs = z.infer<typeof formSchema>;

interface FechamentoCaixaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dados: FechamentoDTO) => Promise<void>;
    isSalvando: boolean;
}

export function FechamentoCaixaModal({ isOpen, onClose, onSave, isSalvando }: FechamentoCaixaModalProps) {
    const { handleSubmit, reset, control, formState: { errors } } = useForm<FormInputs>({
        resolver: zodResolver(formSchema),
        defaultValues: { dinheiro: 0 }
    });

    useEffect(() => {
        if (isOpen) reset({ dinheiro: 0 });
    }, [isOpen, reset]);

    const onSubmit = (dados: FormInputs) => {
        onSave(criarFechamentoDTO(dados.dinheiro));
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Fechamento de Caixa</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Informe exclusivamente o dinheiro contado fisicamente na gaveta.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    {/* Campo Dinheiro */}
                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-800">Dinheiro em Espécie (Total na Gaveta)</Label>
                        <Controller
                            name="dinheiro"
                            control={control}
                            render={({ field }) => (
                                <NumericFormat
                                    getInputRef={field.ref}
                                    value={field.value}
                                    onValueChange={(values) => field.onChange(values.floatValue || 0)}
                                    thousandSeparator="." decimalSeparator="," prefix="R$ " decimalScale={2} fixedDecimalScale allowNegative={false}
                                    disabled={isSalvando}
                                    placeholder="R$ 0,00"
                                    className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            )}
                        />
                        {errors.dinheiro && <p className="text-red-500 text-sm">{errors.dinheiro.message}</p>}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg flex gap-3 items-start mt-4">
                        <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
                        <div>
                            <p className="font-semibold text-sm mb-1 text-blue-900">Atenção</p>
                            <p className="text-xs">Confira os valores com cuidado. Após o envio, a conferência com o sistema será feita automaticamente e eventuais divergências serão reportadas à gerência.</p>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSalvando}>Cancelar</Button>
                        <Button type="submit" disabled={isSalvando} className="bg-primary hover:bg-primary/90 text-white">
                            {isSalvando ? "Fechando..." : "Confirmar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
