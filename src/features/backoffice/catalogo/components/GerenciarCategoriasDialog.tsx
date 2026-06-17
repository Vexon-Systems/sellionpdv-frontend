import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCategorias } from "../services/apiCategorias";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { extrairMensagemErro } from "@/lib/utils";

interface Props{
    isOpen: boolean;
    onClose: () => void;
    onCategoriaCriada?: (id: number) => void; 
}

export function GerenciarCategoriasDialog({ isOpen, onClose, onCategoriaCriada }: Props) {
    const queryClient = useQueryClient();
    const [novaCategoria, setNovaCategoria] = useState("");
    
    // Estados para edição In-line
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [nomeEditado, setNomeEditado] = useState("");

    const { data: categorias, isLoading } = useQuery({
        queryKey: ['categorias'],
        queryFn: apiCategorias.listar,
    });

    const mutationCriar = useMutation({
        mutationFn: apiCategorias.criar,
        onSuccess: (dados) => {
            setNovaCategoria("");
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            toast.success("Categoria criada!");
            if (onCategoriaCriada) onCategoriaCriada(dados.id);
        },
        onError: (error) => toast.error(extrairMensagemErro(error, "Erro ao criar categoria."))
    });

    const mutationAtualizar = useMutation({
        // CORREÇÃO: Passando o nome envelopado num objeto para respeitar o NovaCategoriaDTO
        mutationFn: ({ id, nome }: { id: number, nome: string }) => apiCategorias.atualizar(id, { nome }),
        onSuccess: () => {
            setEditandoId(null);
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            toast.success("Categoria atualizada!");
        },
        onError: (error) => toast.error(extrairMensagemErro(error, "Erro ao atualizar categoria."))
    });

    const mutationExcluir = useMutation({
        mutationFn: apiCategorias.excluir,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            toast.success("Categoria excluída!");
        },
        onError: () => {
            toast.error("Não foi possível excluir.", {
                description: "Existem produtos vinculados a esta categoria. Mude os produtos de categoria primeiro."
            });
        }
    });

    const handleSalvarEdicao = (id: number) => {
        if (nomeEditado.trim().length < 3) {
            toast.error("O nome deve ter pelo menos 3 letras.");
            return;
        }
        mutationAtualizar.mutate({ id, nome: nomeEditado });
    };

    const handleCriar = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (novaCategoria.trim().length < 3) return;
        
        // CORREÇÃO: Enviando o objeto { nome } exigido pelo NovaCategoriaDTO
        mutationCriar.mutate({ nome: novaCategoria });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>Gerenciar Categorias</DialogTitle>
                </DialogHeader>

                {/* Forms de nova categoria */}
                <form onSubmit={handleCriar} className="flex items-end gap-2 pt-4 border-t border-gray-200">
                    <div className="space-y-1 flex-1">
                        <Label className="text-xs text-gray-500 mb-2">Adicionar Nova Categoria</Label>
                        <Input 
                            placeholder="Nome da nova categoria..." 
                            value={novaCategoria}
                            onChange={(e) => setNovaCategoria(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={mutationCriar.isPending || novaCategoria.trim().length < 3}>
                        <Plus size={16} className="mr-2" /> Adicionar
                    </Button>
                </form>

                <div className="space-y-4 pt-4">
                    <div className="max-h-62 overflow-y-auto space-y-2 pr-2">
                        {isLoading ? (
                        <p className="text-center text-sm text-gray-500">Carregando...</p>
                        ) : (
                        categorias?.map((cat) => (
                            <div key={cat.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-100">
                            
                            {/* Edit Mode */}
                            {editandoId === cat.id ? (
                                <div className="flex items-center gap-2 w-full">
                                <Input 
                                    value={nomeEditado} 
                                    onChange={(e) => setNomeEditado(e.target.value)}
                                    className="h-8"
                                    autoFocus
                                />
                                <Button size="icon" variant="ghost" onClick={() => handleSalvarEdicao(cat.id)} className="text-green-600 h-8 w-8">
                                    <Check size={16} />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => setEditandoId(null)} className="text-gray-500 h-8 w-8">
                                    <X size={16} />
                                </Button>
                                </div>
                            ) : (
                                // View Mode
                                <>
                                <span className="text-sm font-medium text-gray-700">{cat.nome}</span>
                                <div className="flex gap-1">
                                    <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-black cursor-pointer hover:text-gray-600"
                                    onClick={() => {
                                        setEditandoId(cat.id);
                                        setNomeEditado(cat.nome);
                                    }}
                                    >
                                    <Pencil size={14} />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-black hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-white">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Deseja excluir a categoria "{cat.nome}"? Essa ação não pode ser desfeita.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => mutationExcluir.mutate(cat.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                    Confirmar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                </>
                            )}
                            </div>
                        ))
                        )}
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}