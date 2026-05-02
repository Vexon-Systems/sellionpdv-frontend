import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProdutos } from "../services/apiProdutos";
import { fetchCategorias } from "@/features/backoffice/services/apiCategorias";
import { useCartStore } from "@/store/useCartStore";
import type { ProdutoDTO } from "../types/pdv";
import { ProdutoVendaModal } from "../components/ProdutoVendaModal";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import { Search, ShoppingCart, Minus, Plus, Trash, Percent, Banknote, CreditCard, QrCode } from "lucide-react";

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL'
});

export function PdvPage() {

	const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoDTO | null>(null);
	const [categoriaAtiva, setCategoriaAtiva] = useState<number>(0);
	const [termoBusca, setTermoBusca] = useState("");

	const { itens, adicionarItem, removerItem, alterarQuantidade } = useCartStore();

	const { data: produtos, isLoading: isLoadingProdutos, isError: isErrorProdutos } = useQuery({
		queryKey: ['lista-produtos'],
		queryFn: fetchProdutos, 
	});

	const { data: categorias, isLoading: isLoadingCategorias } = useQuery({
		queryKey: ['lista-categorias'],
		queryFn: fetchCategorias,
	});

	const subtotal = useMemo(() => {
		return itens.reduce((total, item) => total + item.subtotal, 0);
	}, [itens]);

	const produtosFiltrados = useMemo(() => {
		if (!produtos) return [];
		
		const termoBuscaFormatado = termoBusca.toLowerCase().trim();

		return produtos.filter((produto) => {
			const atendeCategoria = categoriaAtiva === 0 || produto.categoriaId === categoriaAtiva;
			const atendeBusca = termoBuscaFormatado === "" || produto.nome.toLowerCase().includes(termoBuscaFormatado);
			
			return atendeCategoria && atendeBusca;
		});
	}, [produtos, categoriaAtiva, termoBusca]);

	const handleCliqueProduto = (produto: ProdutoDTO) => {
		const possuiModificadores = produto.gruposModificadores && produto.gruposModificadores.length > 0;
		
		if (possuiModificadores) {
			setProdutoSelecionado(produto); 
		} else {
			adicionarItem(produto, []); 
		}
	};

	const handleMudarCategoria = (valorAba: string) => {
		setCategoriaAtiva(Number(valorAba));
	};

	return (
		<div className="flex flex-col h-screen w-full overflow-hidden">
			<Header titulo="Frente de Caixa"/>

			<main className="flex flex-1 flex-row min-h-0 w-full bg-gray-50">

				<div className="flex flex-1 flex-col px-8 py-6">
					{/* BUSCA */}
					<div className="relative w-90">
						<Search className="absolute left-2 top-1.5 text-gray-800" size={18}/>
						<Input
							type="text"
							placeholder="Buscar produto por nome"
							className="pl-10 w-full bg-white border-gray-200 shadow-md"
							value={termoBusca}
							onChange={(e) => setTermoBusca(e.target.value)}
						/>
					</div>

					{/* Tab de Categorias */}
					<div className="my-6 w-full">
						{isLoadingCategorias ? (
							<div className="h-10 w-full animate-pulse bg-white rounded-lg" />
						) : (
							<Tabs 
								value={categoriaAtiva.toString()} 
								onValueChange={handleMudarCategoria} 
								className="w-full"
							>
								<TabsList variant="line" className="flex w-full justify-start h-auto p-1 rounded-lg overflow-x-auto">
									<TabsTrigger value="0" className="whitespace-nowrap px-4 py-2 rounded-md transition-all cursor-pointer">
										Todos
									</TabsTrigger>
									{categorias?.map((cat) => (
										<TabsTrigger 
											key={cat.id} 
											value={cat.id.toString()} 
											className="whitespace-nowrap px-4 py-2 rounded-md cursor-pointer transition-all"
										>
											{cat.nome}
										</TabsTrigger>
									))}
								</TabsList>
							</Tabs>
						)}

						{/* VITRINE */}
						{isLoadingProdutos && (
							<div className="flex justify-center items-center h-64">
								<p className="text-gray-500 animate-pulse">Carregando catálogo...</p>
							</div>
						)}
						
						{isErrorProdutos && (
							<div className="flex justify-center items-center h-64 text-red-500">
								<p>Erro ao conectar com o servidor.</p>
							</div>
						)}

						{!isLoadingProdutos && !isErrorProdutos && (
							<div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-6 my-6">
								{produtosFiltrados.map((produto) => (
									<Card 
										key={produto.id} 
										onClick={() => handleCliqueProduto(produto)}
										role="button"
										tabIndex={0}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												handleCliqueProduto(produto);
											}
										}}
										className="cursor-pointer shadow-md hover:shadow-xl hover:scale-105 transition-all border-gray-200 overflow-hidden"
									>						
										<div className={`h-30 w-full ${produto.imagemUrl || 'bg-gray-200'} flex items-center justify-center`}>
											<span className="text-white font-bold opacity-50">IMAGEM</span>
										</div>
										<CardContent className="px-4">
											<h3 className="font-medium text-gray-800 line-clamp-1" title={produto.nome}>
												{produto.nome}
											</h3>
											<p className="font-bold text-primary">
												{formatadorMoeda.format(produto.precoBase)}
											</p>
										</CardContent>
									</Card>
								))}
								
								{produtosFiltrados.length === 0 && (
									<div className="col-span-full py-12 text-center text-gray-400">
										Nenhum produto encontrado.
									</div>
								)}
							</div>
						)}
					</div>
				</div>
				
				{/* DIREITA: CARRINHO */}
				<aside className="w-1/4 border-x-2 shadow-md bg-white border-gray-200 flex flex-col overflow-y-auto">
					<div className="px-4 py-2 border-b border-gray-200 bg-white flex gap-2">
						<h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">Carrinho</h2>
					</div>

					{/* LISTA DE ITENS DO CARRINHO */}
					<div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
						{itens.map((item) => (
							<div 
								key={item.idCarrinho} 
								className="group flex flex-col gap-2 p-3 bg-white border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-colors"
							>
								{/* Topo: Nome do Produto e Preço */}
								<div className="flex justify-between items-start gap-2">
									<div className="flex-1">
										<h4 className="font-semibold text-slate-800 text-sm leading-tight">
											{item.produto.nome}
										</h4>
										
										{/* Modificadores */}
										{item.modificadores && item.modificadores.length > 0 && (
											<ul className="mt-1 flex flex-col gap-0.5">
												{item.modificadores.map((mod, i) => (
													<li key={i} className="text-[11px] text-slate-500 flex items-center">
														<span className="text-slate-300 mr-1.5">-</span> {mod.nome}
													</li> 
												))}
											</ul>
										)}
									</div>
									
									<span className="font-bold text-slate-900 text-sm whitespace-nowrap">
										{formatadorMoeda.format(item.valorUnitarioTotal)}
									</span>
								</div>

								{/* Base: Controles e Ações*/}
								<div className="flex justify-between items-center mt-1">
									
									{/* Controle de Quantidade Elegante */}
									<div className="flex items-center bg-slate-50 border border-slate-200 rounded-md h-8">
										<Button 
											onClick={() => alterarQuantidade(item.idCarrinho, -1)}
											variant="ghost" 
											size="icon" 
											className="h-full w-8 cursor-pointer rounded-none rounded-l-md text-slate-600 hover:text-blue-600 hover:bg-blue-50"
											aria-label="Diminuir quantidade"
										>
											<Minus size={14} />
										</Button>
										
										<span className="w-8 font-semibold text-xs text-center text-slate-800">
											{item.quantidade}
										</span>
										
										<Button 
											onClick={() => alterarQuantidade(item.idCarrinho, 1)}
											variant="ghost" 
											size="icon" 
											className="h-full w-8 cursor-pointer rounded-none rounded-r-md text-slate-600 hover:text-blue-600 hover:bg-blue-50"
											aria-label="Aumentar quantidade"
										>
											<Plus size={14} />
										</Button>
									</div>

									{/* Botões de Ação */}
									<div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
										<Button 
											variant="ghost" 
											size="icon" 
											className="h-8 w-8 cursor-pointer text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 bg-emerald-50/50"
											title="Aplicar Desconto"
										>
											<Percent size={14} />
										</Button>
										
										<Button 
											onClick={() => removerItem(item.idCarrinho)} 
											variant="ghost" 
											size="icon" 
											className="h-8 w-8 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-600 bg-red-50/50"
											title="Remover Item"
										>
											<Trash size={14} />
										</Button>
									</div>
								</div>
							</div>
						))}

						{/* ESTADO VAZIO (Elegante e minimalista) */}
						{itens.length === 0 && (
							<div className="flex flex-col items-center justify-center h-full text-slate-400 mt-12 space-y-3">
								<div className="bg-slate-100 p-4 rounded-full">
									<ShoppingCart size={32} className="text-slate-300" />
								</div>
								<p className="text-sm font-medium text-slate-500">Seu carrinho está vazio</p>
								<p className="text-xs text-slate-400">Adicione produtos para iniciar a venda</p>
							</div>
						)}
					</div>

					{/* RESUMO E PAGAMENTO */}
					<div className="bg-white px-4 py-3 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
						<div className="space-y-1 mb-4 text-sm">
							<div className="flex justify-between text-gray-600">
								<span>Subtotal</span>
								<span className="font-medium">{formatadorMoeda.format(subtotal)}</span>
							</div>
							<div className="flex justify-between text-green-600">
								<span>Desconto</span>
								<span className="font-medium">{formatadorMoeda.format(0)}</span>
							</div>
							<div className="flex justify-between text-gray-900 text-lg font-bold pt-2 mt-2 border-t border-gray-100">
								<span>Total</span>
								<span>{formatadorMoeda.format(subtotal)}</span>
							</div>
						</div>

						<div className="space-y-3">
							<h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Formas de Pagamento</h4>
							<div className="grid grid-cols-3 gap-2">
								<Button variant="outline" className="cursor-pointer flex flex-col h-14 gap-1 text-gray-600 hover:-translate-y-0.5 hover:bg-linear-to-br from-blue-950 to-blue-900 transition-all duration-300 hover:text-white">
									<Banknote size={18} />
									<span className="text-[12px]">Dinheiro</span>
								</Button>
								<Button variant="outline" className="cursor-pointer flex flex-col h-14 gap-1 text-gray-600 hover:-translate-y-0.5 hover:bg-linear-to-br from-blue-950 to-blue-900 transition-all duration-300 hover:text-white">
									<CreditCard size={18} />
									<span className="text-[12px]">Cartão</span>
								</Button>
								<Button variant="outline" className="cursor-pointer flex flex-col h-14 gap-1 text-gray-600 hover:-translate-y-0.5 hover:bg-linear-to-br from-blue-950 to-blue-900 transition-all duration-300 hover:text-white">
									<QrCode size={18} />
									<span className="text-[12px]">PIX</span>
								</Button>
							</div>
							<Button 
								disabled={itens.length === 0} 
								className="cursor-pointer w-full h-12 text-base font-bold bg-linear-to-br from-blue-950 to-blue-900 hover:-translate-y-0.5 hover:brightness-130 transition-all duration-300 text-white mt-2 shadow-md"
							>
								Processar Venda
							</Button>
						</div>
					</div>
				</aside>
			</main>

			{/* Modal de personalização é montado condicionalmente só se houver produtoSelecionado */}
			{produtoSelecionado && (
				<ProdutoVendaModal 
					isOpen={!!produtoSelecionado}
					produto={produtoSelecionado} 
					onClose={() => setProdutoSelecionado(null)}
				/>
			)}
		</div>
	);
}