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
        <Card className="w-full lg:w-[320px] xl:w-95 shrink-0 bg-white rounded-md border-gray-200 flex flex-col h-125 lg:h-full lg:overflow-hidden">
            <CardHeader className="flex flex-col space-y-2 border-b px-6 py-1">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                    <Utensils className="h-5 w-5 text-primary" />
                    Produtos
                </CardTitle>
                
                <Button onClick={onNovo} variant={isCriandoNovo ? "secondary" : "default"} className="w-full shadow-sm">
                    <Plus size={16} className="mr-2" /> {isCriandoNovo ? "A Criar Novo..." : "Novo Produto"}
                </Button>

                <div className="relative bg-white rounded-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input placeholder="Buscar produtos..." className="pl-9 h-9" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
                </div>
            </CardHeader>

            <div className="flex-1 overflow-y-auto px-2 py-2">
                {isLoading && <p className="text-center text-gray-400 mt-4 animate-pulse">Carregando...</p>}
                {!isLoading && produtosFiltrados.length === 0 && <p className="text-center text-sm text-gray-400 mt-4">Nenhum produto encontrado.</p>}
                
                {produtosFiltrados.map((produto) => {
                    const isSelected = produtoSelecionado?.id === produto.id && !isCriandoNovo;
                    return (
                        <div key={produto.id} onClick={() => onSelect(produto)} className={`group cursor-pointer py-3 px-3 transition-all flex flex-col gap-1 mb-1 rounded-md ${isSelected ? 'bg-primary/5 border border-primary/30 shadow-sm' : 'border border-transparent hover:bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                                <p className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-gray-800'}`}>{produto.nome}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${produto.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {produto.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">{categorias.find(c => c.id === produto.categoriaId)?.nome || "Sem Categoria"}</p>
                            <p className={`text-sm font-bold mt-1 ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                                {produto.precoBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}