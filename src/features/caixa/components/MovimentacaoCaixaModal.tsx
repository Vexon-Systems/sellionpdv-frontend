// src/features/caixa/MovimentacaoCaixaModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "radix-ui";
import { toast } from "sonner";

const formSchema = z.object({
    valor: z.number().min(0.01, "O valor deve ser maior que R$ 0,00."),
    motivo: z.string().min(5, "A justificativa é obrigatória (mín. 5 caracteres).")
});

type FormInputs = z.infer<typeof formSchema>;

interface MovimentacaoCaixaModalProps {
    tipo: 'SANGRIA' | 'REFORCO' | null;
    onClose: () => void;
}

export function MovimentacaoCaixaModal({ tipo, onClose }: MovimentacaoCaixaModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
        resolver: zodResolver(formSchema),
        defaultValues: { valor: 0, motivo: "" }
    });

    useEffect(() => {
        reset({ valor: 0, motivo: "" });
    }, [tipo, reset]);

    if (!tipo) return null;

    const isSangria = tipo === 'SANGRIA';
    const titulo = isSangria ? "Fazer Sangria" : "Inserir Reforço";

    const onSubmit = (dados: FormInputs) => {
        // API: POST /api/caixa/movimentacao
        console.log(`Payload para API (${tipo}):`, {
            tipo: tipo,
            valor: dados.valor,
            motivo: dados.motivo
        });
        
        toast.success(`${titulo} realizado com sucesso!`, {
            description: `Valor registrado: R$ ${dados.valor.toFixed(2)}`
        }
        )

        onClose();
    };

    return (
        <Dialog open={!!tipo} onOpenChange={(open) => !open && onClose()}>
        {/* Retiramos as cores agressivas e o padding zero. Deixamos o padrão limpo do shadcn. */}
        <DialogContent className="sm:max-w-[425px] bg-white">
            
            <DialogHeader>
            <DialogTitle className="text-xl font-bold">{titulo}</DialogTitle>
            <DialogDescription className="text-gray-500">
                Insira o valor e a justificativa para o registro
            </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            
            <div className="space-y-2">
                <Label className="font-semibold text-gray-800">Valor (R$)</Label>
                <Input 
                type="number" 
                step="0.01" 
                placeholder="R$ 0.00" 
                {...register("valor", { valueAsNumber: true })} 
                />
                {errors.valor && <p className="text-red-500 text-sm">{errors.valor.message}</p>}
            </div>

            <div className="space-y-2">
                <Label className="font-semibold text-gray-800">Justificativa</Label>
                <Textarea 
                placeholder="Digite o motivo da operação..." 
                className="resize-none h-24"
                {...register("motivo")} 
                />
                {errors.motivo && <p className="text-red-500 text-sm">{errors.motivo.message}</p>}
            </div>

            <div className="pt-4 flex justify-end gap-3">
                {/* O asChild no cancelar é opcional, mas manter a consistência de botões é bom */}
                <Button type="button" variant="outline" onClick={onClose} className="border-gray-300">
                Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                Confirmar
                </Button>
            </div>

            </form>
        </DialogContent>
        </Dialog>
    );
}