// src/features/backoffice/ProdutoForm.tsx
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ProdutoDTO } from "@/types/pdv";
import { salvarProduto, excluirProduto } from "@/services/apiProdutos";
import { categoriasMock } from "@/features/pdv/MockData"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Pen, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 letras"),
    preco: z.number().min(0.01, "O preço deve ser maior que zero."),
    categoriaId: z.number(),
    ativo: z.boolean(),
});

type FormInputs = z.infer<typeof formSchema>;

// O que o formulário precisa receber da tela principal
interface ProdutoFormProps {
    produtoId: number | null,
    produtoAtual: ProdutoDTO | undefined;
    onClose: () => void;
}

export function ProdutoForm({produtoId, produtoAtual, onClose}: ProdutoFormProps){
    const queryClient = useQueryClient();
    
    const {register, handleSubmit, reset, watch, setValue, control, formState: {errors}} = useForm<FormInputs>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: "",
            preco: 0,
            categoriaId: 1,
            ativo: true,
        }
    });

    const precoAtual = watch("preco") || 0;

    // Simulando que o custo é sempre 40%
    const custoEstimado = precoAtual * 0.4;
    const margemBruta = precoAtual > 0 ? ((precoAtual - custoEstimado) / precoAtual) * 100 : 0;
    
    const isAtivo = watch("ativo");

    // Se o usuário clicar em um produto, o form é preenchido
    useEffect(() => {
        if (produtoAtual) {
            reset({
                nome: produtoAtual.nome,
                preco: produtoAtual.preco,
                categoriaId: produtoAtual.categoriaId,
                ativo: produtoAtual.ativo,
            });
        } else {
            reset({nome: "", preco: 0, categoriaId: 1, ativo: true});
        }
    }, [produtoAtual, reset]);

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
                    <Button 
                        variant="destructive" 
                        onClick={() => mutationExcluir.mutate(produtoId)}
                        disabled={mutationExcluir.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                    <Trash2 size={16}/> Excluir
                    </Button>
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
                        <Input type="number" step="0.01" {...register("preco", { valueAsNumber: true })} />
                        {errors.preco && <p className="text-red-500 text-sm">{errors.preco.message}</p>}
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                        <Label>Categoria</Label>
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
                                        {categoriasMock.map((cat, index) => {
                                        if (cat === "Todos") return null; // Ignora a aba "Todos"
                                        return (
                                            <SelectItem key={index} value={index.toString()}>
                                            {cat}
                                            </SelectItem>
                                        );
                                        })}
                                    </SelectContent>
                                </Select>
                        )}
                        />
                        {errors.categoriaId && <p className="text-red-500 text-sm">{errors.categoriaId.message}</p>}
                    </div>
                </div>

                {/* Status (Ativo/Inativo) */}
                <div className="space-y-2 pt-4 border-t">
                    <Label>Status de Venda</Label>
                    <div className="flex gap-4 mt-2">
                        <Button
                            type="button"
                            variant={isAtivo ? "default" : "outline"}
                            className={isAtivo ? "bg-green-600 hover:bg-green-700" : ""}
                            onClick={() => setValue("ativo", true)}
                        >
                            Ativo (Visível no PDV)
                        </Button>
                        <Button
                            type="button"
                            variant={!isAtivo ? "destructive" : "outline"}
                            onClick={() => setValue("ativo", false)}
                        >
                            Inativo (Oculto)
                        </Button>
                    </div>
                </div>

                {/* Rodapé: Salvar */}
                <div className="pt-6 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={mutationSalvar.isPending} className="bg-primary">
                        <Save size={16} className="mr-2" />
                        {mutationSalvar.isPending ? "Salvando..." : "Salvar Produto"}
                    </Button>
                </div>

            </form>


        </div>
    )
}
