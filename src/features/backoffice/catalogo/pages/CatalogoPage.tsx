import { useState } from "react";
import { Package, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";

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
        <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">
            <Header titulo="Catálogo de Produtos" />

            <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-8 flex-1 overflow-y-auto lg:overflow-hidden">
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
                            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 rounded-lg gap-3 text-gray-400">
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
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                                <Package size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">Nenhum produto selecionado</h3>
                            <p className="text-gray-500 mt-2 max-w-sm text-center">
                                Selecione um produto na lista ou clique em "Novo Produto" para cadastrar.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}