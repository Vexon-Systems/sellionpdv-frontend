import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray} from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { fetchCategorias } from "../services/apiCategorias";
import { fetchModificadores } from "../services/apiModificadores";
import { criarCategoria } from "../services/apiCategorias";
import { Dialog, DialogContent, DialogClose, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { ProdutoDTO } from "@/features/pdv/types/pdv";
import { salvarProduto, excluirProduto } from "@/features/pdv/services/apiProdutos"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

import { type ProdutoGrupoModificadorDTO } from "@/features/pdv/types/pdv";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { GerenciarCategoriasDialog } from "./GerenciarCategoriasDialog";

import { Pen, Save, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 letras"),
    precoBase: z.number().min(0.01, "O preço deve ser maior que zero."),
    categoriaId: z.number(),
    ativo: z.boolean(),

    gruposModificadores: z.array(
        z.object({
            grupoId: z.number().min(1, "Selecione um grupo válido"),
            tipoEscolha: z.enum(["UNICA", "MULTIPLA"]),
            minOpcoes: z.number().min(0),
            maxOpcoes: z.number().min(1),
            opcoes: z.any().optional()
        })
    ).default([])
});

type FormInputs = z.input<typeof formSchema>;

interface ProdutoFormProps {
    produtoId: number | null,
    produtoAtual: ProdutoDTO | undefined;
    onClose: () => void;
}

export function ProdutoForm({produtoId, produtoAtual, onClose}: ProdutoFormProps){
    const queryClient = useQueryClient();

    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);

    const { data: categorias, isLoading: isLoadingCategorias } = useQuery({
        queryKey: ['lista-categorias'],
        queryFn: fetchCategorias,
    });
    
    const {register, handleSubmit, reset, watch, setValue, control, formState: {errors}} = useForm<FormInputs>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: "",
            precoBase: 0,
            categoriaId: 1,
            ativo: true,
            gruposModificadores: [],
        }
    });


    const precoAtual = watch("precoBase") || 0;

    const custoEstimado = precoAtual * 0.4;
    const margemBruta = precoAtual > 0 ? ((precoAtual - custoEstimado) / precoAtual) * 100 : 0;
    
    const isAtivo = watch("ativo");

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "gruposModificadores",
    });

    useEffect(() => {
        if (produtoAtual) {
            reset({
                nome: produtoAtual.nome,
                precoBase: produtoAtual.precoBase,
                categoriaId: produtoAtual.categoriaId,
                ativo: produtoAtual.ativo,
                gruposModificadores: produtoAtual.gruposModificadores || [],
            });

            replace(produtoAtual.gruposModificadores || []);
        } else {
            reset({nome: "", precoBase: 0, categoriaId: 1, ativo: true, gruposModificadores: []});
            replace([]);
        }
    }, [produtoAtual, reset, replace]);

    const mutationSalvar = useMutation({
        mutationFn: (dados: FormInputs) => {
            return salvarProduto({ ...dados, id: produtoId || undefined });
        },
        onSuccess: () => {
            toast.success(`Produto salvo com sucesso!`)
            queryClient.invalidateQueries({queryKey: ['lista-produtos']});
            onClose();
        }
    });

    const mutationExcluir = useMutation({
        mutationFn: excluirProduto,
        onSuccess: () => {
            toast.success(`Produto deletado com sucesso!`)
            queryClient.invalidateQueries({queryKey: ['lista-produtos']});
            onClose();
        }
    });

    const onSubmit = (dados: FormInputs) => {
        mutationSalvar.mutate(dados);
    }

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [novoVinculo, setNovoVinculo] = useState({
        grupoId: 0,
        tipoEscolha: 'MULTIPLA' as "UNICA" | "MULTIPLA",
        minOpcoes: 0,
        maxOpcoes: 1
    });

    const handleAdicionarVinculo = () => {
        if (novoVinculo.grupoId === 0) {
            toast.error("Selecione um grupo de modificadores!");
            return;
        }
        
        // Verifica se o grupo já não está vinculado para evitar duplicidade
        if (fields.some(f => f.grupoId === novoVinculo.grupoId)) {
            toast.error("Este grupo já está vinculado ao produto!");
            return;
        }

        append(novoVinculo);
        setIsPopoverOpen(false); 
        setNovoVinculo({ grupoId: 0, tipoEscolha: 'MULTIPLA', minOpcoes: 0, maxOpcoes: 1 }); // Reseta
    };

    const { data: listaDeTodosOsGrupos } = useQuery({
        queryKey: ['lista-modificadores'],
        queryFn: fetchModificadores,
    });

    return (
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                    {produtoId ? watch("nome") || "Sem Nome" : "Novo Produto"}
                </h2>
                {isAtivo && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Ativo</span>}
                </div>
                
                {/* Ações (Editar, Inativar, Excluir) */}
                {produtoId && (
                <div className="flex gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant="destructive" 
                                className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                            >
                                <Trash2 size={16}/> Excluir
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="bg-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Deseja excluir o produto "{watch("nome")}" ? Está ação não poderá ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => mutationExcluir.mutate(produtoId)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Confirmar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    
                </div>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* CARDS DE MÉTRICAS*/}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
                        <p className="text-sm text-gray-500 mb-1">Preço Base (PDV)</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {precoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
                        <p className="text-sm text-gray-500 mb-1">Custo Estimado</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {custoEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm text-green-700 mb-1">Margem Bruta</p>
                        <p className="text-2xl font-bold text-green-700">
                            {margemBruta.toFixed(0)}%
                        </p>
                    </div>
                </div>


                <div className="space-y-2">
                    <Label>Nome do Produto</Label>
                    <Input {...register("nome")} placeholder="Ex: Casquinha Trufada" />
                    {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Preço Base */}
                    <div className="space-y-2">
                        <Label>Preço Base (R$)</Label>
                        <Input type="number" step="0.01" {...register("precoBase", { valueAsNumber: true })} />
                        {errors.precoBase && <p className="text-red-500 text-sm">{errors.precoBase.message}</p>}
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Categoria</Label>
                            <button 
                                type="button" 
                                onClick={() => setIsCategoriaModalOpen(true)}
                                className="text-xs text-primary font-medium flex items-center hover:underline cursor-pointer"
                            >
                                Gerenciar categorias
                            </button>
                        </div>


                        <Controller
                            name="categoriaId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                value={field.value?.toString()} 
                                onValueChange={(valorEmTexto) => {
                                    field.onChange(Number(valorEmTexto)); // Volta para número ao salvar no Zod
                                }}
                                >
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                    
                                    <SelectContent className="bg-white">
                                        {isLoadingCategorias && (
                                            <div className="p-2 text-sm text-gray-500 text-center">Carregando...</div>
                                        )}
                                        
                                        {categorias?.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
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

                {/* Status (Ativo/Inativo) */}
                {/* <div className="space-y-2 pt-4 border-t">
                    <Label>Status de Venda</Label>
                    <div className="flex gap-4 mt-2">
                        <Button
                            type="button"
                            variant={isAtivo ? "default" : "outline"}
                            className={isAtivo ? "text-green-700 bg-green-100 hover:bg-green-200 hover:text-green-900 cursor-pointer" : "cursor-pointer" }
                            onClick={() => setValue("ativo", true)}
                        >
                            Ativo (Visível no PDV)
                        </Button>
                        <Button
                            type="button"
                            className="cursor-pointer"
                            variant={!isAtivo ? "destructive" : "outline"}
                            onClick={() => setValue("ativo", false)}
                        >
                            Inativo (Oculto)
                        </Button>
                    </div>
                </div> */}

                {/* MODIFICADORES DINÂMICOS */}
                <div className="space-y-4 pt-6 border-t">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">Modificadores do Produto</h3>
                            <p className="text-sm text-gray-500">Adicione tamanhos, sabores ou adicionais.</p>
                        </div>

                        {/* O NOSSO NOVO POPOVER MÁGICO */}
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="outline" size="sm" className="border-dashed border-2 hover:bg-gray-50">
                                    <Plus size={16} className="mr-2" /> Vincular Grupo
                                </Button>
                            </PopoverTrigger>
                            
                            <PopoverContent align="end" className="w-80 bg-white p-4 shadow-xl border-gray-200">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900 border-b pb-2">Novo Vínculo</h4>
                                    
                                    <div className="space-y-2">
                                        <Label className="text-xs">Selecione o Grupo</Label>
                                        <Select 
                                            value={novoVinculo.grupoId.toString()} 
                                            onValueChange={(val) => setNovoVinculo({...novoVinculo, grupoId: Number(val)})}
                                        >
                                            <SelectTrigger className="w-full bg-white h-9"><SelectValue placeholder="Escolha um grupo..." /></SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {listaDeTodosOsGrupos?.map(g => (
                                                    <SelectItem key={g.id} value={g.id.toString()}>{g.nome}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs">Tipo de Escolha</Label>
                                        <Select 
                                            value={novoVinculo.tipoEscolha} 
                                            onValueChange={(val: "UNICA" | "MULTIPLA") => setNovoVinculo({...novoVinculo, tipoEscolha: val})}
                                        >
                                            <SelectTrigger className="w-full bg-white h-9"><SelectValue /></SelectTrigger>
                                            <SelectContent className="bg-white">
                                                <SelectItem value="UNICA">Escolha Única (Ex: Tamanho)</SelectItem>
                                                <SelectItem value="MULTIPLA">Múltipla Escolha (Ex: Adicionais)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Mínimo</Label>
                                            <Input 
                                                type="number" min={0} className="h-9" 
                                                value={novoVinculo.minOpcoes} 
                                                onChange={(e) => setNovoVinculo({...novoVinculo, minOpcoes: Number(e.target.value)})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Máximo</Label>
                                            <Input 
                                                type="number" min={1} className="h-9" 
                                                value={novoVinculo.maxOpcoes} 
                                                onChange={(e) => setNovoVinculo({...novoVinculo, maxOpcoes: Number(e.target.value)})}
                                            />
                                        </div>
                                    </div>

                                    <Button type="button" onClick={handleAdicionarVinculo} className="w-full mt-2">
                                        Confirmar Vínculo
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* LISTA DE GRUPOS JÁ VINCULADOS */}
                    {fields.length === 0 ? (
                        <div className="p-6 border-2 border-dashed rounded-lg text-center bg-gray-50 text-gray-400">
                            Nenhum modificador vinculado a este produto.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {fields.map((field, index) => {
                                // Buscamos o nome do grupo na lista global para exibir na tela
                                const grupoInfo = listaDeTodosOsGrupos?.find(g => g.id === field.grupoId);
                                
                                return (
                                    <div key={field.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-primary/30 transition-colors">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-sm">{grupoInfo?.nome || "Grupo Carregando..."}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${field.tipoEscolha === 'UNICA' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {field.tipoEscolha === 'UNICA' ? 'Única' : 'Múltipla'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    (Min: {field.minOpcoes} | Máx: {field.maxOpcoes})
                                                </span>
                                            </div>
                                        </div>
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => remove(index)}
                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Rodapé: Salvar */}
                <div className="pt-6 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={mutationSalvar.isPending} className="bg-primary hover:bg-primary/80 cursor-pointer">
                        <Save size={16} className="mr-2" />
                        {mutationSalvar.isPending ? "Salvando..." : "Salvar Produto"}
                    </Button>
                </div>
            
            {/* Modal de Gerencia de Categoria */}
            <GerenciarCategoriasDialog 
                isOpen={isCategoriaModalOpen} 
                onClose={() => setIsCategoriaModalOpen(false)} 
                onCategoriaCriada={(idNovo) => setValue("categoriaId", idNovo)}
            />

            </form>


        </div>
    )
}
