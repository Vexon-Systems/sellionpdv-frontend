import { ProdutoImagem } from './ProdutoImagem';
import { ProdutoModificadores } from './ProdutoModificadores';
import { calcularMargem, calcularCusto } from '../utils/precificacao';
import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { GerenciarCategoriasDialog } from "./GerenciarCategoriasDialog";
import { Save, Trash2 } from "lucide-react";
import { NumericFormat } from 'react-number-format';

import type { ProdutoDTO, GrupoModificadorDTO, ProdutoGrupoModificadorDTO } from "@/types/pdv";
import type { CategoriaDTO } from "../types/categoria";

interface ProdutoFormProps {
    produtoInicial: ProdutoDTO | null;
    categorias: CategoriaDTO[];
    gruposDisponiveis: GrupoModificadorDTO[];
    onSave: (dados: Partial<ProdutoDTO>) => void;
    onDelete: (id: number) => void;
    onUploadImagem: (file: File) => Promise<string>;
    onCancel: () => void;
    isSalvando: boolean;
    isUploading: boolean;
}

const formSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 letras"),
    precoBase: z.number().min(0.01, "O preço deve ser maior que zero."),
    custoEstimado: z.number().min(0, "O custo não pode ser negativo").default(0),
    margemBruta: z.number().default(0),
    categoriaId: z.number().min(1, "Selecione uma categoria"),
    ativo: z.boolean(),
    imagemUrl: z.string().optional(),
    gruposModificadores: z.array(
        z.object({
            grupoId: z.number().min(1, "Selecione um grupo válido"),
            tipoEscolha: z.enum(["UNICA", "MULTIPLA"]),
            minOpcoes: z.number().min(0),
            maxOpcoes: z.number().min(1),
            opcoes: z.any().optional()
        })
    ).default([])
}).refine((dados) => dados.custoEstimado <= dados.precoBase, {
    message: "O custo estimado não pode ser maior que o preço de venda.",
    path: ["custoEstimado"],
});

type FormInputs = z.input<typeof formSchema>;

export function ProdutoForm({ produtoInicial, categorias, gruposDisponiveis, onSave, onDelete, onCancel, onUploadImagem, isSalvando, isUploading }: ProdutoFormProps) {
    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);

    const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm<FormInputs>({
        resolver: zodResolver(formSchema),
        defaultValues: { nome: "", precoBase: 0, custoEstimado: 0, margemBruta: 0, categoriaId: 0, ativo: true, imagemUrl: "", gruposModificadores: [] }
    });

    const { fields, append, remove, replace } = useFieldArray({ control, name: "gruposModificadores" });

    // Sincroniza dados quando um produto é selecionado.
    // Para produto novo, categoriaId começa em 0; o effect abaixo (linha 96) define
    // a categoria padrão assim que a lista de categorias carrega.
    useEffect(() => {
        if (produtoInicial) {
            reset({
                ...produtoInicial,
                custoEstimado: produtoInicial.custoEstimado || 0,
                margemBruta: produtoInicial.margemBruta || 0,
                gruposModificadores: produtoInicial.gruposModificadores || []
            });
            replace(produtoInicial.gruposModificadores || []);
        } else {
            reset({ nome: "", precoBase: 0, custoEstimado: 0, margemBruta: 0, categoriaId: 0, ativo: true, imagemUrl: "", gruposModificadores: [] });
            replace([]);
        }
    }, [produtoInicial, reset, replace]);

    const categoriaId = watch("categoriaId");

    // Preenche a categoria padrão assim que a lista carrega (evita Select vazio na primeira abertura)
    useEffect(() => {
        if (!produtoInicial && !categoriaId && categorias.length > 0) {
            setValue("categoriaId", categorias[0].id);
        }
    }, [categorias, produtoInicial, categoriaId, setValue]);

    // Observadores para reatividade
    const isAtivo = watch("ativo");
    const imagemAtual = watch("imagemUrl");
    const precoBase = watch("precoBase") || 0;
    const custoEstimado = watch("custoEstimado") || 0;
    const margemBruta = watch("margemBruta") || 0;

    // Lógicas de Cálculo Bidirecional
    const handlePrecoChange = (val: number) => {
        setValue("precoBase", val, { shouldValidate: true });
        if (val > 0) {
            const novaMargem = calcularMargem(val, custoEstimado);
            setValue("margemBruta", novaMargem);
        } else {
            setValue("margemBruta", 0);
        }
    };

    const handleCustoChange = (val: number) => {
        setValue("custoEstimado", val, { shouldValidate: true });
        if (precoBase > 0) {
            const novaMargem = calcularMargem(precoBase, val);
            setValue("margemBruta", novaMargem);
        }
    };

    const handleMargemChange = (val: number) => {
        setValue("margemBruta", val, { shouldValidate: true });
        if (precoBase > 0) {
            const novoCusto = calcularCusto(precoBase, val);
            setValue("custoEstimado", novoCusto, { shouldValidate: true });
        }
    };

    const onSubmit = (dados: FormInputs) => {
        const { margemBruta: _margemBruta, gruposModificadores: gruposForm, ...resto } = dados;
        const gruposCompletos: ProdutoGrupoModificadorDTO[] = (gruposForm ?? []).map((g) => {
            const grupoDisp = gruposDisponiveis.find((gd) => gd.id === g.grupoId);
            return {
                grupoId: g.grupoId,
                nome: grupoDisp?.nome,
                tipoEscolha: g.tipoEscolha,
                minOpcoes: g.minOpcoes,
                maxOpcoes: g.maxOpcoes,
                opcoes: grupoDisp?.opcoes ?? [],
            };
        });
        onSave({
            ...resto,
            gruposModificadores: gruposCompletos,
            id: produtoInicial?.id || undefined,
        });
    };

    return (
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <div className="flex items-center gap-5">
                    <ProdutoImagem imagemAtual={imagemAtual} isUploading={isUploading} onUploadImagem={onUploadImagem} onChange={(url) => setValue("imagemUrl", url)} />

                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-gray-900">{produtoInicial?.id ? watch("nome") || "Sem Nome" : "Novo Produto"}</h2>
                            {isAtivo && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Ativo</span>}
                        </div>
                        <p className="text-sm text-gray-500">Preencha os detalhes e a precificação do produto.</p>
                    </div>
                </div>

                {produtoInicial?.id && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"><Trash2 size={16} className="mr-2" /> Excluir</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>Deseja excluir o produto "{watch("nome")}" ?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(produtoInicial.id!)} className="bg-red-600 hover:bg-red-700 text-white">Confirmar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                
                {/* SEÇÃO DE PRECIFICAÇÃO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
                    
                    {/* Input de Preço Base (Moeda) */}
                    <div className="space-y-2">
                        <Label>Preço Base (PDV)</Label>
                        <Controller
                            name="precoBase"
                            control={control}
                            render={({ field: { ref } }) => (
                                <NumericFormat
                                    getInputRef={ref}
                                    value={precoBase}
                                    onValueChange={(values) => {
                                        const numLimpo = values.floatValue || 0;
                                        handlePrecoChange(numLimpo);
                                    }}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix="R$ "
                                    decimalScale={2}
                                    fixedDecimalScale
                                    allowNegative={false}
                                    className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            )}
                        />
                        {errors.precoBase && <p className="text-red-500 text-xs">{errors.precoBase.message}</p>}
                    </div>

                    {/* Input de Custo Estimado (Moeda) */}
                    <div className="space-y-2">
                        <Label>Custo Estimado</Label>
                        <Controller
                            name="custoEstimado"
                            control={control}
                            render={({ field: { ref } }) => (
                                <NumericFormat
                                    getInputRef={ref}
                                    value={custoEstimado}
                                    onValueChange={(values) => {
                                        const numLimpo = values.floatValue || 0;
                                        handleCustoChange(numLimpo);
                                    }}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix="R$ "
                                    decimalScale={2}
                                    fixedDecimalScale
                                    allowNegative={false}
                                    className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            )}
                        />
                        {errors.custoEstimado && <p className="text-red-500 text-xs">{errors.custoEstimado.message}</p>}
                    </div>

                    {/* Input de Margem Bruta (Porcentagem) */}
                    <div className="space-y-2">
                        <Label className="text-green-700 font-semibold">Margem Bruta de Lucro</Label>
                        <Controller
                            name="margemBruta"
                            control={control}
                            render={({ field: { ref } }) => (
                                <NumericFormat
                                    getInputRef={ref}
                                    value={margemBruta}
                                    onValueChange={(values) => {
                                        const numLimpo = values.floatValue || 0;
                                        handleMargemChange(numLimpo);
                                    }}
                                    decimalSeparator=","
                                    suffix=" %"
                                    decimalScale={2}
                                    allowNegative={true} // Permite margem negativa (prejuízo)
                                    className="flex h-9 w-full rounded-md border border-green-200 bg-green-50 text-green-800 font-medium px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500"
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Nome do Produto</Label>
                        <Input {...register("nome")} placeholder="Ex: Casquinha Trufada" />
                        {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Categoria</Label>
                            <button type="button" onClick={() => setIsCategoriaModalOpen(true)} className="text-xs text-primary font-medium hover:underline cursor-pointer">
                                Gerenciar categorias
                            </button>
                        </div>
                        <Controller
                            name="categoriaId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    key={field.value ? `cat-${field.value}` : 'cat-empty'}
                                    value={field.value ? String(field.value) : undefined}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                >
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {categorias.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.categoriaId && <p className="text-red-500 text-sm">{errors.categoriaId.message}</p>}
                    </div>
                </div>

                <ProdutoModificadores fields={fields} gruposDisponiveis={gruposDisponiveis} append={append} remove={remove} />

                <div className="pt-6 flex justify-end gap-2 border-t">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={isSalvando} className="bg-primary text-white"><Save size={16} className="mr-2" /> {isSalvando ? "Salvando..." : "Salvar Produto"}</Button>
                </div>

                <GerenciarCategoriasDialog isOpen={isCategoriaModalOpen} onClose={() => setIsCategoriaModalOpen(false)} onCategoriaCriada={(idNovo) => setValue("categoriaId", idNovo)} />
            </form>
        </div>
    );
}