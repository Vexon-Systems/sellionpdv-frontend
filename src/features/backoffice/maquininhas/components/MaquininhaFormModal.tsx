import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; 

import type { MaquininhaDTO } from "../types/maquininha";

const formSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    marca: z.string().min(2, "Informe a marca"),
    taxaDebito: z.number().min(0, "A taxa não pode ser negativa."),
    taxaCredito: z.number().min(0, "A taxa não pode ser negativa."),
    ativo: z.boolean()
});

type FormInputs = z.infer<typeof formSchema>;

interface MaquininhaFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    maquininhaEdicao?: MaquininhaDTO | null; 
    onSave: (dados: Partial<MaquininhaDTO>) => void;
    isSalvando: boolean;
}

export function MaquininhaFormModal({ isOpen, onClose, maquininhaEdicao, onSave, isSalvando }: MaquininhaFormModalProps) {
    
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormInputs>({
        resolver: zodResolver(formSchema),
        defaultValues: { nome: "", marca: "", taxaDebito: 0, taxaCredito: 0, ativo: true }
    });

    const isAtivo = watch("ativo");

    useEffect(() => {
        if (maquininhaEdicao) {
            reset({
                nome: maquininhaEdicao.nome,
                marca: maquininhaEdicao.marca,
                taxaDebito: maquininhaEdicao.taxaDebito,
                taxaCredito: maquininhaEdicao.taxaCredito,
                ativo: maquininhaEdicao.ativo
            });
        } else {
            reset({ nome: "", marca: "", taxaDebito: 0, taxaCredito: 0, ativo: true });
        }
    }, [maquininhaEdicao, isOpen, reset]);

    const onSubmit = (dados: FormInputs) => {
        onSave({ ...dados, id: maquininhaEdicao?.id });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        {maquininhaEdicao ? "Editar Maquininha" : "Nova Maquininha"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Configure as taxas cobradas pelo adquirente para manter seu DRE correto.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    
                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-800">Identificação (Nome)</Label>
                        <Input placeholder="Ex: Stone Balcão 1, PagSeguro..." {...register("nome")} disabled={isSalvando} />
                        {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-800">Marca</Label>
                        <Input placeholder="Ex: Stone, Cielo, PagSeguro, ..." {...register("marca")} disabled={isSalvando} />
                        {errors.marca && <p className="text-red-500 text-sm">{errors.marca.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-800">Taxa Débito (%)</Label>
                            <Input type="number" step="0.01" {...register("taxaDebito", { valueAsNumber: true })} disabled={isSalvando} />
                            {errors.taxaDebito && <p className="text-red-500 text-sm">{errors.taxaDebito.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-800">Taxa Crédito (%)</Label>
                            <Input type="number" step="0.01" {...register("taxaCredito", { valueAsNumber: true })} disabled={isSalvando} />
                            {errors.taxaCredito && <p className="text-red-500 text-sm">{errors.taxaCredito.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50 mt-4">
                        <div>
                            <Label className="font-semibold text-gray-800 text-base">Status de Operação</Label>
                            <p className="text-xs text-gray-500">Maquininhas inativas não aparecem no PDV.</p>
                        </div>
                        <Switch 
                            checked={isAtivo} 
                            onCheckedChange={(val) => setValue("ativo", val)}
                            disabled={isSalvando}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSalvando}>Cancelar</Button>
                        <Button type="submit" disabled={isSalvando} className="bg-primary hover:bg-primary/90 text-white">
                            {isSalvando ? "Salvando..." : "Salvar Configuração"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}