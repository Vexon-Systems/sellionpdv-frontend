import { useState } from "react";
import { Search, Plus, Utensils } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProdutoDTO } from "@/types/pdv";
import type { CategoriaDTO } from "../types/categoria";

interface ProdutoSidebarProps {
    produtos: ProdutoDTO[];
    categorias: CategoriaDTO[];
    isLoading: boolean;
    produtoSelecionado: ProdutoDTO | null;
    isCriandoNovo: boolean;
    onSelect: (produto: ProdutoDTO) => void;
    onNovo: () => void;
}

export function ProdutoSidebar({ produtos, categorias, isLoading, produtoSelecionado, isCriandoNovo, onSelect, onNovo }: ProdutoSidebarProps) {
    const [termoBusca, setTermoBusca] = useState("");

    const produtosFiltrados = produtos.filter((p) => p.nome.toLowerCase().includes(termoBusca.toLowerCase()));

    return (
        <Card className="flex h-125 w-full shrink-0 flex-col overflow-hidden lg:h-full lg:w-[320px] xl:w-95">
            <CardHeader className="flex flex-col space-y-3 border-b px-5 py-4">
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                    <Utensils className="h-5 w-5 text-primary" />
                    Produtos
                </CardTitle>
                
                <Button onClick={onNovo} variant={isCriandoNovo ? "secondary" : "default"} className="w-full shadow-sm">
                    <Plus size={16} className="mr-2" /> {isCriandoNovo ? "A Criar Novo..." : "Novo Produto"}
                </Button>

                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input placeholder="Buscar produtos..." className="pl-9 h-9" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
                </div>
            </CardHeader>

            <div className="flex-1 overflow-y-auto px-2 py-2">
                {isLoading && <p className="mt-4 text-center text-muted-foreground animate-pulse">Carregando...</p>}
                {!isLoading && produtosFiltrados.length === 0 && <p className="mt-4 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</p>}
                
                {produtosFiltrados.map((produto) => {
                    const isSelected = produtoSelecionado?.id === produto.id && !isCriandoNovo;
                    return (
                        <button key={produto.id} type="button" onClick={() => onSelect(produto)} className={`group mb-1 flex w-full cursor-pointer flex-col gap-1 rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? 'border-primary/30 bg-primary/10' : 'border-transparent hover:bg-muted/70'}`}>
                            <div className="flex items-center justify-between">
                                <p className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>{produto.nome}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${produto.ativo ? 'bg-success/15 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                    {produto.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{categorias.find(c => c.id === produto.categoriaId)?.nome || "Sem Categoria"}</p>
                            <p className={`mt-1 text-sm font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                {produto.precoBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </button>
                    );
                })}
            </div>
        </Card>
    );
}
