import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, CreditCard, Pen, Trash2, AlertCircle } from "lucide-react";

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { MaquininhaDTO } from "../types/maquininha";
import { useMaquininhas } from "../hooks/useMaquininhas";
import { MaquininhaFormModal } from "../components/MaquininhaFormModal";

export function MaquininhasPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [maquininhaEmEdicao, setMaquininhaEmEdicao] = useState<MaquininhaDTO | null>(null);
    const [maquininhaParaExcluir, setMaquininhaParaExcluir] = useState<MaquininhaDTO | null>(null);
    
    const [mostrarInativas, setMostrarInativas] = useState(false);

    const fecharModais = () => {
        setIsModalOpen(false);
        setMaquininhaParaExcluir(null);
    };

    const { maquininhas, isLoading, isError, salvar, isSalvando, excluir, isExcluindo } = useMaquininhas(fecharModais);

    // Se mostrarInativas for falso, esconde as inativas.
    const maquininhasFiltradas = mostrarInativas ? maquininhas : maquininhas.filter(m => m.ativo);

    const handleNovaMaquininha = () => {
        setMaquininhaEmEdicao(null);
        setIsModalOpen(true);
    };

    const handleEditar = (maquininha: MaquininhaDTO) => {
        setMaquininhaEmEdicao(maquininha);
        setIsModalOpen(true);
    };

    return (
        <PageShell titulo="Gestão de Maquininhas">
            <div>
                
                {/* Cabeçalho da Página */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">                    
                    <Button onClick={handleNovaMaquininha} size={"lg"}>
                        <Plus size={18} className="mr-2" /> Cadastrar Maquininha
                    </Button>

                    {/* Toggle de Inativas */}
                    <div className="flex items-center space-x-2 rounded-lg border bg-surface-raised px-4 py-2">
                        <Switch id="inativas" checked={mostrarInativas} onCheckedChange={setMostrarInativas} />
                        <Label htmlFor="inativas" className="cursor-pointer text-muted-foreground">Mostrar Excluídas/Inativas</Label>
                    </div>
                </div>

                {/* Estados de Carregamento e Erro */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20 text-muted-foreground animate-pulse">
                        Carregando terminais...
                    </div>
                )}

                {isError && (
                    <div className="flex items-center gap-3 rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-destructive">
                        <AlertCircle size={20} />
                        <p>Ocorreu um erro ao buscar as maquininhas. Tente novamente mais tarde.</p>
                    </div>
                )}

                {/* Grid de Maquininhas */}
                {!isLoading && !isError && maquininhasFiltradas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface p-12 text-muted-foreground">
                        <CreditCard size={48} className="mb-4 opacity-30" />
                        <h3 className="mb-1 text-lg font-medium text-foreground">Nenhuma maquininha encontrada</h3>
                        <p className="text-center text-sm mb-4">
                            {maquininhas.length > 0 
                                ? "Você possui maquininhas cadastradas, mas elas estão inativas." 
                                : "Adicione seu primeiro terminal para habilitar pagamentos em cartão no PDV."}
                        </p>
                        {maquininhas.length === 0 && <Button variant="outline" onClick={handleNovaMaquininha}>Cadastrar Agora</Button>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {maquininhasFiltradas.map((maq) => (
                            <div key={maq.id} className={`relative flex flex-col overflow-hidden rounded-xl border bg-surface-raised p-6 shadow-card transition-shadow hover:shadow-floating ${!maq.ativo && 'opacity-60 grayscale'}`}>
                                
                                {/* Tarja visual para inativos */}
                                {!maq.ativo && <div className="absolute top-0 left-0 h-1 w-full bg-muted-foreground" />}
                                {maq.ativo && <div className="absolute top-0 left-0 h-1 w-full bg-success" />}

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`rounded-full p-3 ${maq.ativo ? 'bg-info/15 text-info' : 'bg-muted text-muted-foreground'}`}>
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">{maq.nome}</h3>
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${maq.ativo ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
                                                {maq.ativo ? 'Em Operação' : 'Excluída/Inativa'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="my-4 grid grid-cols-2 gap-4 rounded-lg border bg-surface-sunken/70 p-3">
                                    <div>
                                        <p className="mb-1 text-xs font-medium text-muted-foreground">Taxa de Débito</p>
                                        <p className="text-lg font-bold text-foreground">{maq.taxaDebito.toFixed(2)}%</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-xs font-medium text-muted-foreground">Taxa de Crédito</p>
                                        <p className="text-lg font-bold text-foreground">{maq.taxaCredito.toFixed(2)}%</p>
                                    </div>
                                </div>

                                <div className="mt-auto flex justify-end gap-2 border-t pt-4">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditar(maq)} className="text-muted-foreground hover:text-primary">
                                        <Pen size={16} className="mr-2" /> Editar
                                    </Button>
                                    {maq.ativo && (
                                        <Button variant="ghost" size="sm" onClick={() => setMaquininhaParaExcluir(maq)} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modais */}
            <MaquininhaFormModal 
                isOpen={isModalOpen} 
                onClose={fecharModais} 
                maquininhaEdicao={maquininhaEmEdicao} 
                onSave={salvar}
                isSalvando={isSalvando}
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
                        <AlertDialogCancel disabled={isExcluindo}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            disabled={isExcluindo}
                            onClick={() => maquininhaParaExcluir && excluir(maquininhaParaExcluir.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isExcluindo ? "Inativando..." : "Confirmar Exclusão"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageShell>
    );
}
