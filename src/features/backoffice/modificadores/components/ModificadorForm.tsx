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
        })
    ).min(1, "Adicione pelo menos uma opção!"),
});

type FormInputs = z.infer<typeof modificadorSchema>;

const DEFAULT_VALUES = { nome: "", opcoes: [{ nome: "", precoAdicional: 0 }] };

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
                    <CardTitle className="text-xl text-gray-900">
                        {grupoInicial?.id ? `Editar: ${grupoInicial.nome}` : "Novo Grupo de Modificadores"}
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
                        <AlertDialogContent className="bg-white">
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
                <form onSubmit={handleSubmit(onSave as any)} className="space-y-8">
                    {/* Nome do Grupo */}
                    <div className="space-y-2">
                        <Label htmlFor="nomeGrupo" className="text-sm font-semibold">Nome do Grupo</Label>
                        <Input id="nomeGrupo" {...register("nome")} placeholder="Ex: Escolha o Tamanho" className="max-w-md bg-white" />
                        {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
                    </div>

                    {/* Lista Dinâmica */}
                    <div className="space-y-4">
                        <div className="hidden sm:flex gap-4 px-1 border-b border-gray-100 pb-2">
                            <div className="flex-1"><Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Nome da Opção</Label></div>
                            <div className="w-32"><Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Preço Extra</Label></div>
                            <div className="w-10"></div>
                        </div>
                
                        <div className="space-y-4 sm:space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex flex-wrap sm:flex-nowrap gap-3 sm:gap-4 items-end sm:items-start bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-md border sm:border-none">
                                    <div className="w-full flex-1 space-y-1">
                                        <Label className="text-xs sm:hidden">Nome</Label>
                                        <Input {...register(`opcoes.${index}.nome` as const)} placeholder="Ex: Copo 300ml" className="bg-white w-full h-9" />
                                        {errors.opcoes?.[index]?.nome && <p className="text-red-500 text-xs">{errors.opcoes[index]?.nome?.message}</p>}
                                    </div>
                                    
                                    <div className="flex-1 sm:w-32 space-y-1">
                                        <Label className="text-xs sm:hidden">Preço</Label>
                                        <Controller
                                            name={`opcoes.${index}.precoAdicional`}
                                            control={control}
                                            render={({ field: controllerField }) => (
                                                <NumericFormat
                                                    getInputRef={controllerField.ref}
                                                    value={controllerField.value}
                                                    onValueChange={(values) => controllerField.onChange(values.floatValue || 0)}
                                                    thousandSeparator="."
                                                    decimalSeparator=","
                                                    prefix="R$ "
                                                    decimalScale={2}
                                                    fixedDecimalScale
                                                    allowNegative={false}
                                                    placeholder="R$ 0,00"
                                                    className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                />
                                            )}
                                        />
                                        {errors.opcoes?.[index]?.precoAdicional && <p className="text-red-500 text-xs">{errors.opcoes[index]?.precoAdicional?.message}</p>}
                                    </div>

                                    <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => remove(index)} disabled={fields.length === 1}>
                                        <X size={20} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        
                        <Button type="button" variant="outline" className="w-full border-dashed border-2 text-primary hover:bg-primary/5" onClick={() => append({ nome: "", precoAdicional: 0 })}>
                            <Plus size={16} className="mr-2" /> Adicionar nova opção
                        </Button>
                        {errors.opcoes?.root && <p className="text-red-500 text-sm mt-2">{errors.opcoes.root.message}</p>}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100 gap-2">
                        <Button 
                            type="button"
                            variant={"outline"} 
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