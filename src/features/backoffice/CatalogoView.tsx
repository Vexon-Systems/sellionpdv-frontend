import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProdutos } from "@/services/apiProdutos";
import { fetchCategorias } from "@/services/apiCategorias";

import { Search, Plus, Package, Utensils } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

import {ProdutoForm} from "./ProdutoForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle  } from "@/components/ui/card";

export function CatalogoView() {
    const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<number | null>(null);
    const [termoBusca, setTermoBusca] = useState(""); 

    const { data: produtos, isLoading} = useQuery({
        queryKey: ['lista-produtos'],
        queryFn: fetchProdutos,
    });

    const { data: categorias } = useQuery({
        queryKey: ['lista-categorias'],
        queryFn: fetchCategorias,
    });

    const produtosFiltrados = produtos?.filter((produto) =>
        produto.nome.toLowerCase().includes(termoBusca.toLowerCase())
    );

    const produtoClicado = produtos?.find(p => p.id === produtoSelecionadoId);

    const handleLimparSelecao = () => setProdutoSelecionadoId(null);

    return (
        <div className="flex flex-col h-screen w-full bg-gray-100 overflow-hidden">
            <Header 
                titulo="Catálogo de Produtos" 
                subtitulo="Gerencie o portfólio e preços." 
            />

            {/* Cabeçalho */}
            <div className="flex justify-between items-start mx-8 my-6">
                <div className="flex justify-center items-center gap-5">
                    <Button size="lg" onClick={() => setProdutoSelecionadoId(0)} className="cursor-pointer shadow-md">
                        <Plus size={16} className="mr-2" />
                        Novo Produto
                    </Button>

                    <div className="relative bg-white rounded-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                            placeholder="Buscar produtos..."
                            className="pl-10 py-4 shadow-md"
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                        />
                    </div>
                </div>
                
            </div>
        
            <div className="flex flex-row ml-8 overflow-y-auto">

                {/* Coluna de Listagem (Esquerda)*/}
                <Card className="w-90 bg-white border-2 rounded-md border-gray-200 flex flex-col overflow-y-auto">
                    {/* Topo da Listagem: Título e Pesquisa */}
                    <div className="space-y-4 px-2">

                        <CardHeader className="flex flex-col items-start gap-3 justify-between space-y-0 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Utensils className="h-5 w-5" />
                                Produtos
                            </CardTitle>

                        </CardHeader>
                    </div>

                    {/* Lista de Itens */}
                    <div className="flex-1 overflow-y-auto">
                
                        {isLoading && <p className="text-center text-gray-400 mt-10 animate-pulse">Carregando...</p>}
                        {produtosFiltrados?.map((produto) => {
                            const isSelected = produtoSelecionadoId === produto.id;
                
                            return (
                            <div
                                key={produto.id}
                                onClick={() => setProdutoSelecionadoId(produto.id)}
                                className={`group cursor-pointer py-3 px-4 transition-all flex flex-col gap-1
                                ${isSelected
                                    ? 'border-l-4 border-primary bg-primary/5'
                                    : 'border-l-4 border-transparent hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                <p className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-gray-800'}`}>
                                    {produto.nome}
                                </p>
                
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                                    ${produto.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                `}>
                                    {produto.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                                </div>
                
                                <p className="text-xs text-gray-500">
                                    {categorias?.find(cat => cat.id === produto.categoriaId)?.nome || "Sem Categoria"}
                                </p>
                                <p className={`text-sm font-bold mt-1 ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                                {produto.precoBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                            </div>
                            );
                        })}
                
                    </div>
                </Card>

                {/* Coluna de detalhes do Produto (Direita) */}
                <main className="flex-1 flex flex-col bg-gray-100 overflow-y-auto">
                    
                    {/* Área de Detalhes do Produto */}
                    <div className="px-8 pb-10">
                    
                    {produtoSelecionadoId === null ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-md h-96 flex flex-col items-center justify-center text-gray-400 bg-white">
                            <Package size={48} className="mb-4 opacity-20" />
                            <p>Selecione um produto na lista ou crie um novo.</p>
                        </div>
                    ) : (
                        <ProdutoForm 
                            produtoId={produtoSelecionadoId === 0 ? null : produtoSelecionadoId} 
                            produtoAtual={produtoClicado} 
                            onClose={handleLimparSelecao}
                        />
                    )}

                    </div>
                </main>
            </div>

            

        </div>
    );
}