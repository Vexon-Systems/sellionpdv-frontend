import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { categoriasMock, produtosMock} from "./MockData";
import { Search, ShoppingCart, Minus, Plus, Trash, Percent, Banknote, CreditCard, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ProdutoDTO } from "@/types/pdv";
import { ProdutoModal } from "./ProdutoModal";
import { useCartStore } from "@/store/useCartStore";
import { useQuery } from "@tanstack/react-query";
import { fetchProdutos } from "@/services/apiProdutos";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PdvView(){
    const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoDTO | null>(null);
    const [categoriaAtiva, setCategoriaAtiva] = useState<string>("Todos");

    const { itens, removerItem, alterarQuantidade } = useCartStore();
    const subtotal = itens.reduce((total, item) => total + (item.produto.preco * item.quantidade), 0);

    const { data: produtos, isLoading, isError } = useQuery({
        queryKey: ['lista-produtos'],
        queryFn: fetchProdutos, 
    });

    const idCategoriaAtiva = categoriasMock.indexOf(categoriaAtiva);
    const produtosFiltrados = produtos?.filter(produto =>
        categoriaAtiva === "Todos" || produto.categoriaId === idCategoriaAtiva
    );

    return (
        <div className="flex flex-1 h-screen w-full bg-slate-50 overflow-hidden">

            {/* Bloco: Conteúdo Principal */}
            <main className="flex flex-1 flex-col bg-slate-50 p-8 overflow-y-auto">

                {/* 1. CABEÇALHO */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">Frente de Caixas</h1>
                        <p className="text-sm mt-1 text-gray-500">Realize vendas dos produtos.</p>
                    </div>
                    
                    <div className="relative w-90">
                        <Search className="absolute left-2 top-1/5 text-gray-800" size={18}/>
                        <Input
                            type="text"
                            placeholder="Pesquisar por produto..."
                            className="bg-white pl-10 border-gray-200"
                        />
                    </div>
                </div>

                {/* Topo: Título e Pesquisa */}
                <div className="flex flex-col gap-3 justify-between mb-8">
                    
                    
                </div>

                {/* 2. CATEGORIAS (Navegação com Tabs do shadcn) */}
                <div className="mb-6">
                    <Tabs value={categoriaAtiva} onValueChange={setCategoriaAtiva} className="w-full">
                        <TabsList className="flex w-full justify-start gap-6 rounded-md border-gray-200 bg-gray-100 h-auto">
                        
                            {categoriasMock.map((categoria) => (
                                <TabsTrigger
                                key={categoria}
                                value={categoria}
                                className="rounded-md transition-all"
                                >
                                {categoria}
                                </TabsTrigger>
                            ))}

                        </TabsList>
                    </Tabs>
                </div>

                {/* 3. VITRINE DE PRODUTOS */}
                {isLoading && (
                <div className="flex justify-center items-center h-64 w-full">
                    <p className="text-gray-500 font-medium animate-pulse">Carregando catálogo...</p>
                </div>
                )}

                {isError && (
                <div className="flex justify-center items-center h-64 w-full text-red-500">
                    <p>Erro ao conectar com o servidor. Tente novamente.</p>
                </div>
                )}

                {!isLoading && !isError && produtosFiltrados && (
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-6">
                    
                    {produtosFiltrados.map((produto) => (
                    <Card 
                        key={produto.id} 
                        onClick={() => setProdutoSelecionado(produto)}
                        className="cursor-pointer hover:shadow-md transition-shadow border-gray-200 overflow-hidden"
                    >                        
                        <div className={`h-30 w-full ${produto.imagemUrl || 'bg-gray-200'} flex items-center justify-center`}>
                            <span className="text-white font-bold opacity-50">IMAGEM</span>
                        </div>

                        <CardContent className="p-2">
                            <h3 className="font-medium text-gray-800">{produto.nome}</h3>
                            <p className="font-bold text-primary">
                            {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </CardContent>

                    </Card>
                    ))}
                    
                    {/* Mensagem amigável caso uma categoria não tenha produtos ativos */}
                    {produtosFiltrados.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400">
                        <p>Nenhum produto encontrado nesta categoria.</p>
                    </div>
                    )}

                </div>
                )}

            </main>



            {/* Bloco: Carrinho */}
            <aside className="w-1/5 bg-slate-50 border-l border-gray-200 flex flex-col">
                {/* Título do Carrinho */}
                <div className="p-4 border-b border-gray-200 bg-slate-50 flex gap-2">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <ShoppingCart size={24}/>
                        Carrinho
                    </h2>
                </div>

                {/* Lista de Itens */}
                <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-4">
                    {itens.map((item) => (
                        <div key={item.id_temporario} className="bg-slate-50 p-4 rounded-mds shadow-sm">
                            {/* Linha 1: Nome e Preço */}
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                <h4 className="font-semibold text-gray-800">{item.produto.nome}</h4>
                                {/* Lista de adicionais*/}
                                </div>
                                <span className="font-bold text-gray-800">
                                {item.produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>

                            {/* Linha 2: Controles de Quantidade e Ações */}
                            <div className="flex justify-between items-center mt-4">
                                {/* Botões de - e + */}
                                <div className="flex items-center border border-gray-200 rounded-md">
                                    {/* Ação de diminuir quantidade (-1) */}
                                    <button 
                                        onClick={() => alterarQuantidade(item.id_temporario, -1)}
                                        className="px-2 py-1 text-primary hover:bg-gray-100 transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>

                                    <span className="px-3 font-medium text-sm">{item.quantidade}</span>

                                    {/* Ação de aumentar quantidade (+1) */}
                                    <button 
                                        onClick={() => alterarQuantidade(item.id_temporario, 1)}
                                        className="px-2 py-1 text-white bg-primary hover:bg-primary/90 transition-colors rounded-md"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                {/* Botões de Desconto e Lixeira */}
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50">
                                        <Percent size={14} />
                                    </Button>

                                    {/* Ação de Lixeira */}
                                    <Button 
                                        onClick={() => removerItem(item.id_temporario)}
                                        variant="outline" 
                                        size="icon" 
                                        className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        <Trash size={14} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Mensagem se o carrinho estiver vazio */}
                    {itens.length === 0 && (
                        <div className="text-center text-gray-400 mt-10">
                        <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Seu carrinho está vazio.</p>
                        </div>
                    )}
                </div>

                {/* 3. RESUMO*/}
                <div className="bg-slate-50 p-4 border-t border-gray-200">
                
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-medium">
                                {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                        <div className="flex justify-between text-green-600">
                            <span>Desconto</span>
                            <span className="font-medium">R$ 0,00</span>
                        </div>
                        <div className="flex justify-between text-gray-900 text-lg font-bold pt-2 border-t border-gray-100">
                            <span>Total</span>
                            <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 bg-slate-50 pr-4 pl-4 pb-2">
                    <h4 className="text-md font-semibold text-gray-800">Método de Pagamento</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" className="flex flex-col h-16 gap-1 text-gray-600 hover:border-primary hover:text-primary">
                                <Banknote size={20} />
                                <span className="text-xs">Dinheiro</span>
                            </Button>

                            <Button variant="outline" className="flex flex-col h-16 gap-1 text-gray-600 hover:border-primary hover:text-primary">
                                <CreditCard size={20} />
                                <span className="text-xs">Cartão</span>
                            </Button>

                            <Button variant="outline" className="flex flex-col h-16 gap-1 text-gray-600 hover:border-primary hover:text-primary">
                                <QrCode size={20} />
                                <span className="text-xs">PIX</span>
                            </Button>
                    </div>

                    <Button className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-white mt-2">
                    Processar Pagamento
                    </Button>
                </div>
            </aside>

            <ProdutoModal 
                isOpen={!!produtoSelecionado}
                produto={produtoSelecionado} 
                onClose={() => setProdutoSelecionado(null)}
                />
        </div>
    );
}