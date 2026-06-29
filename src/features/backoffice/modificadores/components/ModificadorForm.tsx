import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Save, X } from "lucide-react";
import { NumericFormat } from "react-number-format";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import type { GrupoModificadorDTO } from "@/types/pdv";

const modificadorSchema = z.object({
    id: z.number().optional(),
    nome: z.string().min(3, "O nome do grupo deve ter pelo menos 3 letras"),
    opcoes: z.array(
        z.object({
            id: z.number().optional(),
            nome: z.string().min(2, "Informe o nome"),
            precoAdicional: z.number().min(0, "Não pode ser negativo"),
            custoEstimado: z.number().min(0, "Não pode ser negativo").nullable().optional(),
        })
    ).min(1, "Adicione pelo menos uma opção!"),
});

type FormInputs = z.infer<typeof modificadorSchema>;

const DEFAULT_OPCAO = { nome: "", precoAdicional: 0, custoEstimado: null };
const DEFAULT_VALUES = { nome: "", opcoes: [DEFAULT_OPCAO] };

interface ModificadorFormProps {
    grupoInicial: GrupoModificadorDTO | null;
    onSave: (dados: GrupoModificadorDTO) => void;
    onDelete: (id: number) => void;
    onCancel: () => void;
    isSalvando: boolean;
    isExcluindo: boolean;
}

export function ModificadorForm({ grupoInicial, onSave, onDelete, onCancel, isSalvando, isExcluindo }: ModificadorFormProps) {

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
        resolver: zodResolver(modificadorSchema),
        defaultValues: grupoInicial || DEFAULT_VALUES
    });

    const { fields, append, remove } = useFieldArray({ control, name: "opcoes" });

    useEffect(() => {
        reset(grupoInicial || DEFAULT_VALUES);
    }, [grupoInicial, reset]);

    return (
        <Card className="flex-1 flex flex-col overflow-y-auto">
            <CardHeader className="border-b flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-xl text-foreground">
                        {grupoInicial?.id ? `Editando ${grupoInicial.nome}` : "Novo Grupo de Modificadores"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                        Configure as opções que o cliente poderá escolher.
                    </CardDescription>
                </div>

                {grupoInicial?.id && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white" disabled={isExcluindo}>
                                <Trash2 size={16} className="mr-2" /> Excluir
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-background">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Excluir "{grupoInicial.nome}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(grupoInicial.id!)} className="bg-red-600 hover:bg-red-700">
                                    Sim, excluir
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </CardHeader>

            <CardContent className="px-6">
                <form onSubmit={handleSubmit((data) => onSave({
                    id: data.id ?? 0,
                    nome: data.nome,
                    opcoes: data.opcoes.map(o => ({
                        id: o.id ?? 0,
                        nome: o.nome,
                        precoAdicional: o.precoAdicional,
                        custoEstimado: o.custoEstimado ?? null,
                    })),
                }))} className="space-y-8">
                    {/* Nome do Grupo */}
                    <div className="space-y-2">
                        <Label htmlFor="nomeGrupo" className="text-sm font-semibold">Nome do Grupo</Label>
                        <Input id="nomeGrupo" {...register("nome")} placeholder="Ex: Escolha o Tamanho" className="max-w-md bg-background" />
                        {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
                    </div>

                    {/* Lista Dinâmica */}
                    <div className="space-y-2">
                        {/* Cabeçalho das colunas — grid com mesmas proporções das linhas */}
                        <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_140px_140px_36px] gap-x-3 px-1 pb-2 border-b border-border/60">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome da Opção</Label>
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preço Extra</Label>
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Custo Est.
                                <span className="ml-1 font-normal text-muted-foreground/60">(opcional)</span>
                            </Label>
                            <div />
                        </div>

                        <div className="space-y-1">
                            {fields.map((field, index) => (
                                <div key={field.id}>
                                    {/* Desktop: grid alinhado com o cabeçalho */}
                                    <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_140px_140px_36px] gap-x-3 items-start py-1.5">
                                        {/* Nome */}
                                        <div className="space-y-1">
                                            <Input
                                                {...register(`opcoes.${index}.nome` as const)}
                                                placeholder="Ex: Copo 300ml"
                                                className="bg-background h-9"
                                            />
                                            {errors.opcoes?.[index]?.nome && (
                                                <p className="text-red-500 text-xs">{errors.opcoes[index]?.nome?.message}</p>
                                            )}
                                        </div>

                                        {/* Preço Extra */}
                                        <div className="space-y-1">
                                            <Controller
                                                name={`opcoes.${index}.precoAdicional`}
                                                control={control}
                                                render={({ field: f }) => (
                                                    <NumericFormat
                                                        getInputRef={f.ref}
                                                        value={f.value}
                                                        onValueChange={(v) => f.onChange(v.floatValue ?? 0)}
                                                        thousandSeparator="."
                                                        decimalSeparator=","
                                                        prefix="R$ "
                                                        decimalScale={2}
                                                        fixedDecimalScale
                                                        allowNegative={false}
                                                        placeholder="R$ 0,00"
                                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    />
                                                )}
                                            />
                                            {errors.opcoes?.[index]?.precoAdicional && (
                                                <p className="text-red-500 text-xs">{errors.opcoes[index]?.precoAdicional?.message}</p>
                                            )}
                                        </div>

                                        {/* Custo Estimado */}
                                        <div className="space-y-1">
                                            <Controller
                                                name={`opcoes.${index}.custoEstimado`}
                                                control={control}
                                                render={({ field: f }) => (
                                                    <NumericFormat
                                                        getInputRef={f.ref}
                                                        value={f.value ?? ""}
                                                        onValueChange={(v) => f.onChange(v.floatValue ?? null)}
                                                        thousandSeparator="."
                                                        decimalSeparator=","
                                                        prefix="R$ "
                                                        decimalScale={2}
                                                        fixedDecimalScale
                                                        allowNegative={false}
                                                        placeholder="R$ 0,00"
                                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    />
                                                )}
                                            />
                                            {errors.opcoes?.[index]?.custoEstimado && (
                                                <p className="text-red-500 text-xs">{errors.opcoes[index]?.custoEstimado?.message}</p>
                                            )}
                                        </div>

                                        {/* Botão deletar */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground/70 hover:text-red-600 hover:bg-red-50 mt-0.5"
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1}
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>

                                    {/* Mobile: layout empilhado com labels visíveis */}
                                    <div className="sm:hidden flex flex-col gap-3 bg-muted/50 p-3 rounded-md border">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Nome</Label>
                                            <Input
                                                {...register(`opcoes.${index}.nome` as const)}
                                                placeholder="Ex: Copo 300ml"
                                                className="bg-background h-9"
                                            />
                                            {errors.opcoes?.[index]?.nome && (
                                                <p className="text-red-500 text-xs">{errors.opcoes[index]?.nome?.message}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-1 space-y-1">
                                                <Label className="text-xs">Preço Extra</Label>
                                                <Controller
                                                    name={`opcoes.${index}.precoAdicional`}
                                                    control={control}
                                                    render={({ field: f }) => (
                                                        <NumericFormat
                                                            getInputRef={f.ref}
                                                            value={f.value}
                                                            onValueChange={(v) => f.onChange(v.floatValue ?? 0)}
                                                            thousandSeparator="."
                                                            decimalSeparator=","
                                                            prefix="R$ "
                                                            decimalScale={2}
                                                            fixedDecimalScale
                                                            allowNegative={false}
                                                            placeholder="R$ 0,00"
                                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <Label className="text-xs">Custo Est. <span className="text-muted-foreground">(opc.)</span></Label>
                                                <Controller
                                                    name={`opcoes.${index}.custoEstimado`}
                                                    control={control}
                                                    render={({ field: f }) => (
                                                        <NumericFormat
                                                            getInputRef={f.ref}
                                                            value={f.value ?? ""}
                                                            onValueChange={(v) => f.onChange(v.floatValue ?? null)}
                                                            thousandSeparator="."
                                                            decimalSeparator=","
                                                            prefix="R$ "
                                                            decimalScale={2}
                                                            fixedDecimalScale
                                                            allowNegative={false}
                                                            placeholder="R$ 0,00"
                                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="self-end text-muted-foreground/70 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => remove(index)}
                                                disabled={fields.length === 1}
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-dashed border-2 text-primary hover:bg-primary/5"
                            onClick={() => append(DEFAULT_OPCAO)}
                        >
                            <Plus size={16} className="mr-2" /> Adicionar nova opção
                        </Button>
                        {errors.opcoes?.root && <p className="text-red-500 text-sm mt-2">{errors.opcoes.root.message}</p>}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-border/60 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto px-8"
                            onClick={onCancel}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="w-full sm:w-auto px-8" disabled={isSalvando}>
                            <Save size={16} className="mr-2" /> {isSalvando ? "A salvar..." : "Salvar Grupo"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}