import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProdutos } from "./services/apiProdutos";
import { fetchCategorias } from "../backoffice/services/apiCategorias";
import { useCartStore } from "@/store/useCartStore";
import type { ProdutoDTO } from "./types/pdv";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import { ProdutoVendaModal } from "./components/ProdutoVendaModal";
import { Button } from "@/components/ui/button";

import { Search, ShoppingCart, Minus, Plus, Trash, Percent, Banknote, CreditCard, QrCode } from "lucide-react";

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL'
});

export function PdvView() {

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
		<div className="flex flex-col h-screen w-full bg-gray-100 overflow-hidden">
			<Header titulo="Frente de Caixas" subtitulo="Realize vendas dos produtos." />

			<main className="flex flex-1 flex-row min-h-0 w-full bg-gray-100">

				{/* ESQUERDA: CATÁLOGO */}
				<div className="flex flex-1 flex-col px-8 py-6">
					{/* BUSCA */}
					<div className="relative w-90">
						<Search className="absolute left-2 top-2.5 text-gray-800" size={18}/>
						<Input
							type="text"
							placeholder="Buscar produto por nome"
							className="pl-10 w-full bg-white border-gray-200 shadow-md"
							value={termoBusca}
							onChange={(e) => setTermoBusca(e.target.value)}
						/>
					</div>

					{/* CATEGORIAS */}
					<div className="my-6 w-full">
						{isLoadingCategorias ? (
							<div className="h-10 w-full animate-pulse bg-white rounded-lg" />
						) : (
							<Tabs 
								value={categoriaAtiva.toString()} 
								onValueChange={handleMudarCategoria} 
								className="w-full"
							>
								<TabsList className="flex w-full justify-start h-auto p-1 bg-gray-200 rounded-lg overflow-x-auto shadow-md">
									<TabsTrigger value="0" className="whitespace-nowrap px-4 py-2 rounded-md transition-all">
										Todos
									</TabsTrigger>
									{categorias?.map((cat) => (
										<TabsTrigger 
											key={cat.id} 
											value={cat.id.toString()} 
											className="whitespace-nowrap px-4 py-2 rounded-md transition-all"
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
										className="cursor-pointer hover:shadow-md hover:scale-105 transition-all border-gray-200 overflow-hidden"
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
				<aside className="w-1/4 m-2 border-2 rounded-md shadow-md bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
					<div className="px-4 py-2 border-b border-gray-200 bg-white flex gap-2">
						<h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">Carrinho</h2>
					</div>

					{/* LISTA DE ITENS DO CARRINHO */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4">
						{itens.map((item) => (
							<div key={item.idCarrinho} className="bg-slate-50 border border-gray-100 p-3 rounded-lg shadow-sm">
								<div className="flex justify-between items-start mb-2">
									<div>
										<h4 className="font-semibold text-gray-800 text-sm">{item.produto.nome}</h4>
										{item.modificadores && item.modificadores.length > 0 && (
											<ul className="text-xs text-gray-500 mt-1 space-y-0.5">
												{item.modificadores.map((mod, i) => (
													<li key={i}>+ {mod.nome}</li> 
												))}
											</ul>
										)}
									</div>
									<span className="font-bold text-gray-900 text-sm">
										{formatadorMoeda.format(item.valorUnitarioTotal)}
									</span>
								</div>

								<div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200/50">
									<div className="flex items-center border border-gray-200 rounded-md bg-white">
										<button 
											onClick={() => alterarQuantidade(item.idCarrinho, -1)} 
											className="px-2 py-1 text-primary hover:bg-gray-100 rounded-l-md transition-colors"
											aria-label="Diminuir quantidade"
										>
											<Minus size={14} />
										</button>
										<span className="px-3 font-medium text-xs w-8 text-center">{item.quantidade}</span>
										<button 
											onClick={() => alterarQuantidade(item.idCarrinho, 1)} 
											className="px-2 py-1 text-white bg-primary hover:bg-primary/90 rounded-r-md transition-colors"
											aria-label="Aumentar quantidade"
										>
											<Plus size={14} />
										</button>
									</div>
									<div className="flex gap-2">
										<Button variant="outline" size="icon" className="h-7 w-7 text-green-600 hover:bg-green-50">
											<Percent size={12} />
										</Button>
										<Button 
											onClick={() => removerItem(item.idCarrinho)} 
											variant="outline" 
											size="icon" 
											className="h-7 w-7 text-red-600 hover:bg-red-50"
										>
											<Trash size={12} />
										</Button>
									</div>
								</div>
							</div>
						))}

						{itens.length === 0 && (
							<div className="text-center text-gray-400 mt-10">
								<ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
								<p className="text-sm">Seu carrinho está vazio.</p>
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
								<Button variant="outline" className="flex flex-col h-14 gap-1 text-gray-600 hover:border-primary hover:text-primary">
									<Banknote size={18} />
									<span className="text-[12px]">Dinheiro</span>
								</Button>
								<Button variant="outline" className="flex flex-col h-14 gap-1 text-gray-600 hover:border-primary hover:text-primary">
									<CreditCard size={18} />
									<span className="text-[12px]">Cartão</span>
								</Button>
								<Button variant="outline" className="flex flex-col h-14 gap-1 text-gray-600 hover:border-primary hover:text-primary">
									<QrCode size={18} />
									<span className="text-[12px]">PIX</span>
								</Button>
							</div>
							<Button 
								disabled={itens.length === 0} 
								className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white mt-2 cursor-pointer shadow-md"
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