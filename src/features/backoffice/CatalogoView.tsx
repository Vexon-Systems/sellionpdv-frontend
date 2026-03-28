import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProdutos } from "@/services/apiProdutos";

import { Search, Plus, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {ProdutoForm} from "./ProdutoForm";

export function CatalogoView() {
    const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<number | null>(null);

    const { data: produtos, isLoading} = useQuery({
        queryKey: ['lista-produtos'],
        queryFn: fetchProdutos,
    });


    const produtoClicado = produtos?.find(p => p.id === produtoSelecionadoId);

    const handleLimparSelecao = () => setProdutoSelecionadoId(null);

    return (
        <div className="flex h-screen w-full bg-slate-100 overflow-hidden">
        
            {/* Coluna de Listagem (Esquerda)*/}
            <aside className="w-90 m-6 bg-white border-2 rounded-md border-gray-200 flex flex-col">


                {/* Topo da Listagem: Título e Pesquisa */}
                <div className="p-6 border-b border-gray-100 space-y-4">
                    
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Catálogo de Produtos</h1>
                        <p className="text-sm text-gray-500">Gerencie o portfólio e preços.</p>
                    </div>
                    <div className="relative bg-white">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input placeholder="Buscar Produto..." className="pl-9 bg-gray-50" />
                    </div>
                </div>

                {/* Lista de Itens */}
                <div className="flex-1 overflow-y-auto p-4">
                    
                    {isLoading && <p className="text-center text-gray-400 mt-10 animate-pulse">Carregando...</p>}

                    {produtos?.map((produto) => {
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
                            
                            <p className="text-xs text-gray-500">Sorvetes</p>
                            <p className={`text-sm font-bold mt-1 ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                            {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                        );
                    })}
                    
                </div>
            </aside>

            {/* COLUNA 2: DETALHES DO PRODUTO (Direita) */}
            <main className="flex-1 flex flex-col bg-slate-100 overflow-y-auto">
                
                {/* Topo Global de Ações */}
                <div className="p-6 flex justify-end">

                <Button onClick={() => setProdutoSelecionadoId(0)} className="bg-primary hover:bg-primary/90">
                    <Plus size={16} className="mr-2" />
                    Novo Produto
                </Button>
                </div>

                {/* Área de Detalhes do Produto */}
                <div className="px-10 pb-10">
                
                {produtoSelecionadoId === null ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-md h-96 flex flex-col items-center justify-center text-gray-400 bg-white">
                    <Package size={48} className="mb-4 opacity-20" />
                    <p>Selecione um produto na lista ou crie um novo.</p>
                    </div>
                ) : (
                    // Se clicou em algo (ou em Novo Produto), renderiza o nosso Formulário Mágico!
                    <ProdutoForm 
                    produtoId={produtoSelecionadoId === 0 ? null : produtoSelecionadoId} 
                    produtoAtual={produtoClicado} 
                    onClose={handleLimparSelecao}
                    />
                )}

                </div>
            </main>

        </div>
    );
}