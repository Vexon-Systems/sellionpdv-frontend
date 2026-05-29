import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

const formSchema = z.object({
    dinheiro: z.number().min(0, "O valor não pode ser negativo."),
    maquininhas: z.number().min(0, "O valor não pode ser negativo."),
    pix: z.number().min(0, "O valor não pode ser negativo."),
});

type FormInputs = z.infer<typeof formSchema>;

interface FechamentoCaixaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dados: any) => Promise<void>;
    isSalvando: boolean;
}

export function FechamentoCaixaModal({ isOpen, onClose, onSave, isSalvando }: FechamentoCaixaModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
        resolver: zodResolver(formSchema),
        defaultValues: { dinheiro: 0, maquininhas: 0, pix: 0 }
    });

    useEffect(() => {
        if (isOpen) reset({ dinheiro: 0, maquininhas: 0, pix: 0 });
    }, [isOpen, reset]);

    const onSubmit = (dados: FormInputs) => {
        const saldoFinalInformado = dados.dinheiro + dados.maquininhas + dados.pix;
        onSave({ saldoFinalInformado });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Fechamento de Caixa</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Informe exatamente o que está fisicamente no caixa ou nos comprovantes de lote.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-800">Dinheiro em Espécie (Total na Gaveta)</Label>
                        <Input type="number" step="0.01" placeholder="R$ 0.00" disabled={isSalvando} {...register("dinheiro", { valueAsNumber: true })} />
                        {errors.dinheiro && <p className="text-red-500 text-sm">{errors.dinheiro.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-800">Fechamento de Lote (Maquininhas)</Label>
                        <Input type="number" step="0.01" placeholder="R$ 0.00" disabled={isSalvando} {...register("maquininhas", { valueAsNumber: true })} />
                        {errors.maquininhas && <p className="text-red-500 text-sm">{errors.maquininhas.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-800">Total PIX Informado</Label>
                        <Input type="number" step="0.01" placeholder="R$ 0.00" disabled={isSalvando} {...register("pix", { valueAsNumber: true })} />
                        {errors.pix && <p className="text-red-500 text-sm">{errors.pix.message}</p>}
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