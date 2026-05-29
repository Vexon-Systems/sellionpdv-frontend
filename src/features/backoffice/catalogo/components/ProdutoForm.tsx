import { useEffect, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { GerenciarCategoriasDialog } from "./GerenciarCategoriasDialog";
import { Pen, Save, Trash2, Plus, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { ProdutoDTO, GrupoModificadorDTO } from "@/types/pdv";
import type { CategoriaDTO } from "../types/categoria";

interface ProdutoFormProps {
    produtoInicial: ProdutoDTO | null;
    categorias: CategoriaDTO[];
    gruposDisponiveis: GrupoModificadorDTO[];
    onSave: (dados: any) => void;
    onDelete: (id: number) => void;
    onUploadImagem: (file: File) => Promise<string>;
    onCancel: () => void;
    isSalvando: boolean;
    isUploading: boolean;
}

const formSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 letras"),
    precoBase: z.number().min(0.01, "O preço deve ser maior que zero."),
    categoriaId: z.number(),
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
});

type FormInputs = z.input<typeof formSchema>;

export function ProdutoForm({ produtoInicial, categorias, gruposDisponiveis, onSave, onDelete, onCancel, onUploadImagem, isSalvando, isUploading }: ProdutoFormProps) {
    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [novoVinculo, setNovoVinculo] = useState({
        grupoId: 0, tipoEscolha: 'MULTIPLA' as "UNICA" | "MULTIPLA", minOpcoes: 0, maxOpcoes: 1
    });

    const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm<FormInputs>({
        resolver: zodResolver(formSchema),
        defaultValues: produtoInicial || { nome: "", precoBase: 0, categoriaId: 1, ativo: true, imagemUrl: "", gruposModificadores: [] }
    });

    const { fields, append, remove, replace } = useFieldArray({ control, name: "gruposModificadores" });

    useEffect(() => {
        if (produtoInicial) {
            reset({ ...produtoInicial, gruposModificadores: produtoInicial.gruposModificadores || [] });
            replace(produtoInicial.gruposModificadores || []);
        } else {
            reset({ nome: "", precoBase: 0, categoriaId: 1, ativo: true, imagemUrl: "", gruposModificadores: [] });
            replace([]);
        }
    }, [produtoInicial, reset, replace]);

    const precoAtual = watch("precoBase") || 0;
    const custoEstimado = precoAtual * 0.4;
    const margemBruta = precoAtual > 0 ? ((precoAtual - custoEstimado) / precoAtual) * 100 : 0;
    const isAtivo = watch("ativo");
    const imagemAtual = watch("imagemUrl");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const url = await onUploadImagem(file);
                setValue("imagemUrl", url);
                toast.success("Imagem enviada com sucesso!");
            } catch {
                toast.error("Erro no upload", { description: "Verifique se a API está aceitando multipart/form-data." });
            }
        }
    };

    const handleAdicionarVinculo = () => {
        if (novoVinculo.grupoId === 0) { toast.error("Selecione um grupo!"); return; }
        if (fields.some(f => f.grupoId === novoVinculo.grupoId)) { toast.error("Este grupo já está vinculado!"); return; }
        append(novoVinculo);
        setIsPopoverOpen(false);
        setNovoVinculo({ grupoId: 0, tipoEscolha: 'MULTIPLA', minOpcoes: 0, maxOpcoes: 1 });
    };

    return (
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <div className="flex items-center gap-5">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative group shrink-0" onClick={() => fileInputRef.current?.click()}>
                        {imagemAtual ? (
                            <><img src={imagemAtual} alt="Produto" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Pen className="text-white w-6 h-6" /></div></>
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                {isUploading ? <Loader2 className="animate-spin w-8 h-8" /> : <><ImagePlus className="w-8 h-8 mb-1" /><span className="text-[10px] font-medium uppercase tracking-wider">Adicionar</span></>}
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

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

            <form onSubmit={handleSubmit((dados) => onSave({ ...dados, id: produtoInicial?.id || undefined }))} className="space-y-6 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center overflow-hidden">
                        <p className="text-xs xl:text-sm text-gray-500 mb-1">Preço Base (PDV)</p>
                        <p className="text-lg xl:text-xl font-bold text-gray-900">{precoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center overflow-hidden">
                        <p className="text-xs xl:text-sm text-gray-500 mb-1">Custo Estimado</p>
                        <p className="text-lg xl:text-xl font-bold text-gray-900">{custoEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm flex flex-col justify-center overflow-hidden">
                        <p className="text-xs xl:text-sm text-green-700 mb-1">Margem Bruta</p>
                        <p className="text-lg xl:text-xl font-bold text-green-700">{margemBruta.toFixed(0)}%</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Nome do Produto</Label>
                    <Input {...register("nome")} placeholder="Ex: Casquinha Trufada" />
                    {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Preço Base (R$)</Label>
                        <Input type="number" step="0.01" {...register("precoBase", { valueAsNumber: true })} />
                        {errors.precoBase && <p className="text-red-500 text-sm">{errors.precoBase.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Categoria</Label>
                            <button type="button" onClick={() => setIsCategoriaModalOpen(true)} className="text-xs text-primary font-medium hover:underline cursor-pointer">Gerenciar categorias</button>
                        </div>
                        <Controller name="categoriaId" control={control} render={({ field }) => (
                            <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))}>
                                <SelectTrigger className="w-full bg-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent className="bg-white">
                                    {categorias.map((cat) => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nome}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )} />
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div><h3 className="font-bold text-lg text-gray-800">Modificadores</h3><p className="text-sm text-gray-500">Tamanhos, sabores ou adicionais.</p></div>
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="outline" size="sm" className="border-dashed border-2 cursor-pointer"><Plus size={16} className="mr-2" /> Vincular Grupo</Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-80 bg-white p-4 shadow-xl">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900 border-b pb-2">Novo Vínculo</h4>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Grupo</Label>
                                        <Select value={novoVinculo.grupoId.toString()} onValueChange={(val) => setNovoVinculo({ ...novoVinculo, grupoId: Number(val) })}>
                                            <SelectTrigger className="h-9"><SelectValue placeholder="Escolha..." /></SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {gruposDisponiveis.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.nome}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Tipo de Escolha</Label>
                                        <Select value={novoVinculo.tipoEscolha} onValueChange={(val: any) => setNovoVinculo({ ...novoVinculo, tipoEscolha: val })}>
                                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                            <SelectContent className="bg-white"><SelectItem value="UNICA">Única</SelectItem><SelectItem value="MULTIPLA">Múltipla</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2"><Label className="text-xs">Mínimo</Label><Input type="number" min={0} className="h-9" value={novoVinculo.minOpcoes} onChange={(e) => setNovoVinculo({ ...novoVinculo, minOpcoes: Number(e.target.value) })} /></div>
                                        <div className="space-y-2"><Label className="text-xs">Máximo</Label><Input type="number" min={1} className="h-9" value={novoVinculo.maxOpcoes} onChange={(e) => setNovoVinculo({ ...novoVinculo, maxOpcoes: Number(e.target.value) })} /></div>
                                    </div>
                                    <Button type="button" onClick={handleAdicionarVinculo} className="w-full mt-2">Confirmar</Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {fields.length === 0 ? (
                        <div className="p-6 border-2 border-dashed rounded-lg text-center bg-gray-50 text-gray-400">Nenhum modificador vinculado.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {fields.map((field, index) => {
                                const grupoInfo = gruposDisponiveis.find(g => g.id === field.grupoId);
                                return (
                                    <div key={field.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-sm">{grupoInfo?.nome || "Carregando..."}</h4>
                                            <div className="flex gap-2 mt-1">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${field.tipoEscolha === 'UNICA' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{field.tipoEscolha}</span>
                                                <span className="text-xs text-gray-500">(Min: {field.minOpcoes} | Máx: {field.maxOpcoes})</span>
                                            </div>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500"><Trash2 size={16} /></Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="pt-6 flex justify-end gap-2 border-t">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={isSalvando} className="bg-primary text-white"><Save size={16} className="mr-2" /> {isSalvando ? "Salvando..." : "Salvar Produto"}</Button>
                </div>

                <GerenciarCategoriasDialog isOpen={isCategoriaModalOpen} onClose={() => setIsCategoriaModalOpen(false)} onCategoriaCriada={(idNovo) => setValue("categoriaId", idNovo)} />
            </form>
        </div>
    );
}