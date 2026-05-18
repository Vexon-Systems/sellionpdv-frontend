import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, CreditCard, Pen, Trash2, AlertCircle } from "lucide-react";

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { apiMaquininhas } from "../services/apiMaquininhas.tsx";
import type { MaquininhaDTO } from "../types/maquininha.ts";
import { MaquininhaFormModal } from "../components/MaquininhaFormModal";

export function MaquininhasPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [maquininhaEmEdicao, setMaquininhaEmEdicao] = useState<MaquininhaDTO | null>(null);
    const [maquininhaParaExcluir, setMaquininhaParaExcluir] = useState<MaquininhaDTO | null>(null);

    const { data: maquininhas, isLoading, isError } = useQuery({
        queryKey: ['lista-maquininhas'],
        queryFn: apiMaquininhas.listarTodas,
    });

    const mutationExcluir = useMutation({
        mutationFn: apiMaquininhas.excluir,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lista-maquininhas'] });
            toast.success("Maquininha removida com sucesso!");
            setMaquininhaParaExcluir(null);
        },
        onError: () => {
            toast.error("Erro ao excluir", { description: "Não foi possível remover a maquininha." });
        }
    });

    const handleNovaMaquininha = () => {
        setMaquininhaEmEdicao(null);
        setIsModalOpen(true);
    };

    const handleEditar = (maquininha: MaquininhaDTO) => {
        setMaquininhaEmEdicao(maquininha);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">
            <Header titulo="Gestão de Maquininhas" />

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                
                {/* Cabeçalho da Página */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">                    
                    <Button onClick={handleNovaMaquininha} className="bg-primary hover:bg-primary/90 text-white shadow-md">
                        <Plus size={18} className="mr-2" /> Cadastrar Maquininha
                    </Button>
                </div>

                {/* Estados de Carregamento e Erro */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20 text-gray-400 animate-pulse">
                        Carregando terminais...
                    </div>
                )}

                {isError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
                        <AlertCircle size={20} />
                        <p>Ocorreu um erro ao buscar as maquininhas. Tente novamente mais tarde.</p>
                    </div>
                )}

                {/* Grid de Maquininhas */}
                {maquininhas && maquininhas.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-gray-400 bg-white">
                        <CreditCard size={48} className="mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-gray-600 mb-1">Nenhuma maquininha cadastrada</h3>
                        <p className="text-center text-sm mb-4">Adicione seu primeiro terminal para habilitar pagamentos em cartão no PDV.</p>
                        <Button variant="outline" onClick={handleNovaMaquininha}>Cadastrar Agora</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {maquininhas?.map((maq) => (
                            <div key={maq.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
                                
                                {/* Tarja visual para inativos */}
                                {!maq.ativo && <div className="absolute top-0 left-0 w-full h-1 bg-gray-300" />}
                                {maq.ativo && <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />}

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-full ${maq.ativo ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{maq.nome}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${maq.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {maq.ativo ? 'Em Operação' : 'Inativa'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 my-4 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">Taxa de Débito</p>
                                        <p className="text-lg font-bold text-gray-800">{maq.taxaDebito.toFixed(2)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">Taxa de Crédito</p>
                                        <p className="text-lg font-bold text-gray-800">{maq.taxaCredito.toFixed(2)}%</p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditar(maq)} className="text-gray-600 hover:text-primary">
                                        <Pen size={16} className="mr-2" /> Editar
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setMaquininhaParaExcluir(maq)} className="text-gray-400 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modais */}
            <MaquininhaFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                maquininhaEdicao={maquininhaEmEdicao} 
            />

            <AlertDialog open={!!maquininhaParaExcluir} onOpenChange={(open) => !open && setMaquininhaParaExcluir(null)}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Maquininha?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja inativar o terminal <strong>{maquininhaParaExcluir?.nome}</strong>? 
                            Ele deixará de aparecer nas opções do Frente de Caixa. O histórico financeiro será mantido.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => maquininhaParaExcluir && mutationExcluir.mutate(maquininhaParaExcluir.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Confirmar Exclusão
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}