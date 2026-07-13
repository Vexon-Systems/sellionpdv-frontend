import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumericFormat } from "react-number-format";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MovimentacaoDTO } from "../types/caixa";

const formSchema = z.object({
    valor: z.number().min(0.01, "O valor deve ser maior que R$ 0,00."),
    motivo: z.string().min(5, "A justificativa é obrigatória (mín. 5 caracteres).")
});

type FormInputs = z.infer<typeof formSchema>;

interface MovimentacaoCaixaModalProps {
    tipo: 'SANGRIA' | 'REFORCO' | null;
    onClose: () => void;
    onSave: (dados: Omit<MovimentacaoDTO, 'tipo'> & { idempotencyKey: string }) => Promise<void>;
    isSalvando: boolean;
}

export function MovimentacaoCaixaModal({ tipo, onClose, onSave, isSalvando }: MovimentacaoCaixaModalProps) {
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormInputs>({
        resolver: zodResolver(formSchema),
        defaultValues: { valor: 0, motivo: "" }
    });

    // Nova chave a cada abertura do modal (tipo muda de null para SANGRIA/REFORCO) —
    // um retry manual dentro da mesma tentativa reusa a mesma chave, evitando
    // duplicar a movimentação (SAST-19).
    const idempotencyKey = useMemo(() => crypto.randomUUID(), [tipo]);

    useEffect(() => {
        if (tipo) reset({ valor: 0, motivo: "" });
    }, [tipo, reset]);

    if (!tipo) return null;

    const isSangria = tipo === 'SANGRIA';

    function onSubmit(dados: FormInputs) {
        return onSave({ ...dados, idempotencyKey });
    }

    return (
        <Dialog open={!!tipo} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{isSangria ? "Fazer Sangria" : "Inserir Reforço"}</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Insira o valor e a justificativa para o registro
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    
                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-800">Valor (R$)</Label>
                        <Controller
                            name="valor"
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
                        {errors.valor && <p className="text-red-500 text-sm">{errors.valor.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-800">Justificativa</Label>
                        <Textarea placeholder="Digite o motivo da operação..." className="resize-none h-24" disabled={isSalvando} {...register("motivo")} />
                        {errors.motivo && <p className="text-red-500 text-sm">{errors.motivo.message}</p>}
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSalvando}>Cancelar</Button>
                        <Button type="submit" disabled={isSalvando} className="bg-primary hover:bg-primary/90 text-white">
                            {isSalvando ? "Salvando..." : "Confirmar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}