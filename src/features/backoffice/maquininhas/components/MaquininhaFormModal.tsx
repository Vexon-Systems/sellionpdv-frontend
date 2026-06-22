import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumericFormat } from "react-number-format";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import type { BandeiraCartao, MaquininhaDTO, TaxaBandeiraDTO, TipoTransacaoCartao } from "../types/maquininha";

const BANDEIRAS: BandeiraCartao[] = ["VISA", "MASTERCARD", "ELO", "HIPERCARD", "AMEX"];
const BANDEIRA_LABELS: Record<BandeiraCartao, string> = {
    VISA: "Visa",
    MASTERCARD: "Mastercard",
    ELO: "Elo",
    HIPERCARD: "Hipercard",
    AMEX: "Amex",
};

const formSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    marca: z.string().min(2, "Informe a marca"),
    taxaDebito: z.number().min(0, "A taxa não pode ser negativa."),
    taxaCredito: z.number().min(0, "A taxa não pode ser negativa."),
    ativo: z.boolean(),
    taxasPorBandeira: z.array(z.object({
        bandeira: z.string(),
        tipo: z.string(),
        taxa: z.number().min(0).nullable().optional(),
    })),
});

type FormInputs = z.infer<typeof formSchema>;

function buildTaxasGrid(existentes: TaxaBandeiraDTO[] = []): FormInputs["taxasPorBandeira"] {
    const tipos: TipoTransacaoCartao[] = ["DEBITO", "CREDITO"];
    return BANDEIRAS.flatMap((bandeira) =>
        tipos.map((tipo) => {
            const encontrada = existentes.find((t) => t.bandeira === bandeira && t.tipo === tipo);
            return { bandeira, tipo, taxa: encontrada?.taxa ?? null };
        })
    );
}

interface MaquininhaFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    maquininhaEdicao?: MaquininhaDTO | null;
    onSave: (dados: Partial<MaquininhaDTO>) => void;
    isSalvando: boolean;
}

export function MaquininhaFormModal({ isOpen, onClose, maquininhaEdicao, onSave, isSalvando }: MaquininhaFormModalProps) {

    const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm<FormInputs>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: "", marca: "", taxaDebito: 0, taxaCredito: 0, ativo: true,
            taxasPorBandeira: buildTaxasGrid(),
        }
    });

    const isAtivo = watch("ativo");

    useEffect(() => {
        if (maquininhaEdicao) {
            reset({
                nome: maquininhaEdicao.nome,
                marca: maquininhaEdicao.marca,
                taxaDebito: maquininhaEdicao.taxaDebito,
                taxaCredito: maquininhaEdicao.taxaCredito,
                ativo: maquininhaEdicao.ativo,
                taxasPorBandeira: buildTaxasGrid(maquininhaEdicao.taxasPorBandeira),
            });
        } else {
            reset({ nome: "", marca: "", taxaDebito: 0, taxaCredito: 0, ativo: true, taxasPorBandeira: buildTaxasGrid() });
        }
    }, [maquininhaEdicao, isOpen, reset]);

    const onSubmit = (dados: FormInputs) => {
        const taxasFiltradas = dados.taxasPorBandeira
            .filter((t) => t.taxa != null && t.taxa >= 0)
            .map((t) => ({ bandeira: t.bandeira as BandeiraCartao, tipo: t.tipo as TipoTransacaoCartao, taxa: t.taxa! }));

        onSave({
            id: maquininhaEdicao?.id,
            nome: dados.nome,
            marca: dados.marca,
            taxaDebito: dados.taxaDebito,
            taxaCredito: dados.taxaCredito,
            ativo: dados.ativo,
            taxasPorBandeira: taxasFiltradas,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] bg-white max-h-[90vh] overflow-y-auto">
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
                            <Label className="font-semibold text-gray-800">Taxa Débito Genérica (%)</Label>
                            <Input type="number" step="0.01" {...register("taxaDebito", { valueAsNumber: true })} disabled={isSalvando} />
                            {errors.taxaDebito && <p className="text-red-500 text-sm">{errors.taxaDebito.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-800">Taxa Crédito Genérica (%)</Label>
                            <Input type="number" step="0.01" {...register("taxaCredito", { valueAsNumber: true })} disabled={isSalvando} />
                            {errors.taxaCredito && <p className="text-red-500 text-sm">{errors.taxaCredito.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-gray-100">
                        <div>
                            <Label className="font-semibold text-gray-800">Taxas por Bandeira (%)</Label>
                            <p className="text-xs text-gray-400 mt-0.5">Opcional. Deixe em branco para usar a taxa genérica.</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 text-xs">
                                        <th className="text-left font-medium py-1 pr-3 w-28">Bandeira</th>
                                        <th className="text-center font-medium py-1 px-2">Débito (%)</th>
                                        <th className="text-center font-medium py-1 px-2">Crédito (%)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {BANDEIRAS.map((bandeira, bIdx) => (
                                        <tr key={bandeira}>
                                            <td className="py-1.5 pr-3 text-gray-700 font-medium text-xs">
                                                {BANDEIRA_LABELS[bandeira]}
                                            </td>
                                            {(["DEBITO", "CREDITO"] as TipoTransacaoCartao[]).map((tipo) => {
                                                const idx = bIdx * 2 + (tipo === "DEBITO" ? 0 : 1);
                                                return (
                                                    <td key={tipo} className="py-1.5 px-2">
                                                        <Controller
                                                            control={control}
                                                            name={`taxasPorBandeira.${idx}.taxa`}
                                                            render={({ field: f }) => (
                                                                <NumericFormat
                                                                    value={f.value ?? ""}
                                                                    onValueChange={(v) => f.onChange(v.floatValue ?? null)}
                                                                    decimalSeparator=","
                                                                    thousandSeparator="."
                                                                    decimalScale={4}
                                                                    allowNegative={false}
                                                                    placeholder="—"
                                                                    disabled={isSalvando}
                                                                    className="w-full h-8 text-center border border-gray-200 rounded-md px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                                                                />
                                                            )}
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
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
