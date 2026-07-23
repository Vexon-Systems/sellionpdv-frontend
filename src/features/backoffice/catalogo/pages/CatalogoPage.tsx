import { useState } from "react";
import { Package, Loader2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";

import { useProdutos } from "../hooks/useProdutos.ts";
import { useCategorias } from "../hooks/useCategorias";
import { useModificadores } from "../../modificadores/hooks/useModificadores.ts";

import { ProdutoSidebar } from "../components/ProdutoSidebar";
import { ProdutoForm } from "../components/ProdutoForm";
import type { ProdutoDTO } from "@/types/pdv";

export function CatalogoPage() {
    const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoDTO | null>(null);
    const [isCriandoNovo, setIsCriandoNovo] = useState(false);

    const resetSelection = () => {
        setProdutoSelecionado(null);
        setIsCriandoNovo(false);
    };

    const { produtos, isLoading, salvar, isSalvando, excluir, upload, isUploading } = useProdutos(resetSelection);
    const { categorias, isLoading: loadingCategorias } = useCategorias();
    const { grupos: gruposDisponiveis } = useModificadores();

    return (
        <PageShell titulo="Catálogo de Produtos" className="overflow-y-auto lg:overflow-hidden">
            <div className="flex min-h-0 flex-col gap-4 lg:flex-row lg:gap-6 lg:overflow-hidden">
                <ProdutoSidebar 
                    produtos={produtos}
                    categorias={categorias}
                    isLoading={isLoading || loadingCategorias}
                    produtoSelecionado={produtoSelecionado}
                    isCriandoNovo={isCriandoNovo}
                    onSelect={(p) => { setProdutoSelecionado(p); setIsCriandoNovo(false); }}
                    onNovo={() => { setProdutoSelecionado(null); setIsCriandoNovo(true); }}
                />

                <main className="flex-1 flex flex-col h-full lg:overflow-hidden">
                    {produtoSelecionado || isCriandoNovo ? (
                        categorias.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface text-muted-foreground">
                                <Loader2 className="animate-spin" size={28} />
                                <p className="text-sm">Carregando categorias...</p>
                            </div>
                        ) : (
                            <ProdutoForm
                                produtoInicial={produtoSelecionado}
                                categorias={categorias}
                                gruposDisponiveis={gruposDisponiveis}
                                onSave={salvar}
                                onDelete={excluir}
                                onUploadImagem={upload}
                                onCancel={resetSelection}
                                isSalvando={isSalvando}
                                isUploading={isUploading}
                            />
                        )
                    ) : (
                        <div className="flex min-h-96 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Package size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">Nenhum produto selecionado</h3>
                            <p className="mt-2 max-w-sm text-muted-foreground">
                                Selecione um produto na lista ou clique em "Novo Produto" para cadastrar.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </PageShell>
    );
}
