import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchModificadores, salvarModificador, excluirModificador } from "@/services/apiModificadores";
import { type GrupoModificadorDTO } from "@/services/apiModificadores";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";

import { Plus, Trash2, Save, X, Layers } from "lucide-react";
import { toast } from "sonner";

const modificadorSchema = z.object({
    id: z.number().optional(),
    nome: z.string().min(3, "O nome do grupo deve ter pelo menos 3 letras"),
    opcoes: z.array(
        z.object({
        id: z.number().optional(),
        nome: z.string().min(2, "Informe o nome da opção"),
        precoAdicional: z.number().min(0, "O preço não pode ser negativo"),
        })
    ).min(1, "Adicione pelo menos uma opção neste grupo!"),
});

type FormInputs = z.infer<typeof modificadorSchema>;

export function ModificadoresView(){
    const queryClient = useQueryClient();
    const [grupoSelecionado, setGrupoSelecionado] = useState<GrupoModificadorDTO | null>(null);

    const { data: grupos, isLoading } = useQuery({
        queryKey: ['lista-modificadores'],
        queryFn: fetchModificadores,
    });

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
        resolver: zodResolver(modificadorSchema),
        defaultValues: { nome: "", opcoes: [{ nome: "", precoAdicional: 0 }] }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "opcoes",
    });

    useEffect(() => {
        if (grupoSelecionado) {
            reset(grupoSelecionado);
        } else {
            reset({ nome: "", opcoes: [{ nome: "", precoAdicional: 0 }] });
        }
    }, [grupoSelecionado, reset]);

    const mutationSalvar = useMutation({
        mutationFn: salvarModificador,
        onSuccess: () => {
            toast.success("Grupo salvo com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['lista-modificadores'] });
            setGrupoSelecionado(null); // Limpa o form após salvar
        }
    });

    const mutationExcluir = useMutation({
        mutationFn: excluirModificador,
        onSuccess: () => {
            toast.success("Grupo excluído!");
            queryClient.invalidateQueries({ queryKey: ['lista-modificadores'] });
            setGrupoSelecionado(null);
        },
        onError: () => toast.error("Erro ao excluir. Verifique se está em uso por algum produto.")
    });

    const onSubmit = (data: FormInputs) => {
        mutationSalvar.mutate(data);
    };

    return (
        <div className="flex flex-col h-full w-full mx-auto bg-gray-100">
            <Header 
                titulo="Catálogo de Modificadores" 
                subtitulo="Gerencie os grupos e opções de modificadores dos produtos." 
            />

            {/* Cabeçalho */}
            <div className="flex justify-between items-start mx-8 my-6">
                <div className="flex justify-end">
                    <Button size="lg" className="shadow-md" onClick={() => setGrupoSelecionado(null)}>
                            <Plus size={16} className="mr-2" /> Novo Modificador
                    </Button>
                </div>
            </div>
        
            <div className="flex flex-row ml-8 overflow-y-auto">
                {/* Grupo de Modificadores*/}
                <Card className="w-90 bg-white border-2 rounded-md border-gray-200 flex flex-col overflow-y-auto">

                    <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b px-6">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Layers className="h-5 w-5" />
                            Grupos de Modificadores
                        </CardTitle>
                    </CardHeader>
                    
                
                    <CardContent className="flex-1 overflow-y-auto px-4 space-y-2">
                        {isLoading ? <p className="text-gray-500 text-sm text-center py-4">Carregando...</p> : null}
                        {grupos?.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Nenhum grupo cadastrado.</p>}
                    
                        {grupos?.map((grupo) => (
                            <div
                                key={grupo.id}
                                onClick={() => setGrupoSelecionado(grupo)}
                                className={`p-3 rounded-lg cursor-pointer border transition-all ${grupoSelecionado?.id === grupo.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-300 hover:border-gray-300 hover:bg-gray-50'}`}
                            >
                            <h3 className="font-medium text-gray-900">{grupo.nome}</h3>
                                <p className="text-xs text-gray-500 mt-1">{grupo.opcoes.length} {grupo.opcoes.length === 1 ? 'opção' : 'opções'}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Formulário */}
                <Card className="flex-1 flex flex-col overflow-y-auto mx-8 border-2">
                    <CardHeader className="border-b bg-gray-50/50 flex flex-row items-start justify-between">
                        <div>
                            <CardTitle className="text-xl text-gray-900">
                                {grupoSelecionado ? `Grupo ${grupoSelecionado.nome}` : "Novo Grupo de Modificadores"}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Configure as opções que o cliente poderá escolher.
                            </CardDescription>
                        </div>
                
                    {grupoSelecionado && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                <Trash2 size={16} className="mr-2" /> Excluir
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir "{grupoSelecionado.nome}"?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Se este grupo já estiver vinculado a algum produto, a exclusão poderá falhar.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => mutationExcluir.mutate(grupoSelecionado.id!)}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        Sim, excluir grupo
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    </CardHeader>

                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    
                            {/* NOME DO GRUPO */}
                            <div className="space-y-2">
                                <Label htmlFor="nomeGrupo" className="text-sm font-semibold">Nome do Grupo</Label>
                                <Input id="nomeGrupo" {...register("nome")} placeholder="Ex: Escolha o Tamanho, Adicionais Extras" className="max-w-md" />
                                {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
                            </div>
                            {/* Lista dinamica de opcoes */}
                            <div className="space-y-4">

                            <div className="flex gap-4 px-1 border-b border-gray-100 pb-2">
                                <div className="flex-1">
                                    <Label className="text-xs font-semibold uppercase tracking-wider">Nome da Opção</Label>
                                </div>
                                <div className="w-30">
                                    <Label className="text-xs font-semibold uppercase tracking-wider">Preço Adicional</Label>
                                </div>
                                <div className="w-10"></div> {/* Espaço do botão remover */}
                            </div>
                    
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-start group">
                    
                                    <div className="flex-1 space-y-1">
                                        <Input {...register(`opcoes.${index}.nome` as const)} placeholder="Ex: Copo 300ml, Nutella" />
                                        {errors.opcoes?.[index]?.nome && <p className="text-red-500 text-xs">{errors.opcoes[index]?.nome?.message}</p>}
                                    </div>
                                    
                                    <div className="w-32 space-y-1 relative">
                                        <span className="absolute left-2.5 top-[6px] text-gray-500 text-sm">R$</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            className="pl-8"
                                            {...register(`opcoes.${index}.precoAdicional` as const, { valueAsNumber: true })}
                                        />
                                        {errors.opcoes?.[index]?.precoAdicional && <p className="text-red-500 text-xs">{errors.opcoes[index]?.precoAdicional?.message}</p>}
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                        >
                                        <X size={20} />
                                    </Button>
                                </div>
                                ))}
                            </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full border-dashed border-2 text-gray-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5"
                                    onClick={() => append({ nome: "", precoAdicional: 0 })}
                                >
                                    <Plus size={16} className="mr-2" /> Adicionar nova opção
                                </Button>
                                {errors.opcoes?.root && <p className="text-red-500 text-sm mt-2">{errors.opcoes.root.message}</p>}
                            </div>
                            {/* AÇÕES SALVAR */}
                            <div className="flex justify-end pt-6 border-t">
                                <Button type="submit" className="px-8" disabled={mutationSalvar.isPending}>
                                    <Save size={16} className="mr-2" /> {mutationSalvar.isPending ? "Salvando..." : "Salvar Grupo"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}