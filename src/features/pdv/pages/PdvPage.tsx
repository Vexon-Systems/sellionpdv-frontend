import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import { Search } from "lucide-react";

import { usePdv } from "../hooks/usePdv";
import { CartSidebar } from "../components/CartSidebar";
import { ProductGrid } from "../components/ProductGrid";
import { ProdutoVendaModal } from "../components/ProdutoVendaModal";
import { CheckoutModal } from "../components/CheckoutModal";
import { SuccessView } from "../components/SuccessView";


export function PdvPage() {
  const {
    produtoSelecionado,
    setProdutoSelecionado,
    categoriaAtiva,
    setCategoriaAtiva,
    termoBusca,
    setTermoBusca,
    isCheckoutOpen,
    setIsCheckoutOpen,
    vendaConcluida,

    produtosFiltrados,
    categorias,
    itens,
    subtotal,

    isLoadingProdutos,
    isErrorProdutos,
    isLoadingCategorias,

    removerItem,
    alterarQuantidade,

    handleCliqueProduto,
    handleVendaConcluida,
    handleNovaVenda,
  } = usePdv();

  return (
    <div className="flex flex-col h-screen w-full overflow-y-auto">
      <Header titulo="Frente de Caixa" />

      <main className="flex flex-1 flex-col lg:flex-row min-h-0 w-full bg-gray-50 overflow-hidden">
        {/* Área principal: busca, categorias e vitrine */}
        <div className="flex flex-1 flex-col px-4 md:px-8 py-6 min-w-0 overflow-y-auto">
          {/* Barra de busca */}
          <div className="relative w-full max-w-md shrink-0">
            <Search className="absolute left-2 top-3 text-gray-800" size={18} />
            <Input
              type="text"
              placeholder="Buscar produto por nome"
              className="pl-10 h-10 w-full bg-white border-gray-200"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </div>

          {/* Abas de categorias */}
          <div className="my-6 w-full">
            {isLoadingCategorias ? (
              <div className="h-10 w-full animate-pulse bg-white rounded-lg" />
            ) : (
              <Tabs
                value={categoriaAtiva.toString()}
                onValueChange={(val) => setCategoriaAtiva(Number(val))}
                className="w-full"
              >
                <TabsList
                  variant="line"
                  className="flex w-full justify-start h-auto p-1 rounded-lg overflow-x-auto"
                >
                  <TabsTrigger
                    value="0"
                    className="whitespace-nowrap px-4 py-2 rounded-md transition-all cursor-pointer"
                  >
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

            {/* Vitrine de produtos */}
            <ProductGrid
              produtos={produtosFiltrados}
              isLoading={isLoadingProdutos}
              isError={isErrorProdutos}
              onCliqueProduto={handleCliqueProduto}
            />
          </div>
        </div>

        {/* Carrinho lateral */}
        <CartSidebar
          itens={itens}
          subtotal={subtotal}
          onAlterarQuantidade={alterarQuantidade}
          onRemoverItem={removerItem}
          onConfirmarVenda={() => setIsCheckoutOpen(true)}
        />
      </main>

      {/* Modais */}
      {produtoSelecionado && (
        <ProdutoVendaModal
          isOpen={!!produtoSelecionado}
          produto={produtoSelecionado}
          onClose={() => setProdutoSelecionado(null)}
        />
      )}

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        subtotal={subtotal}
        onSuccessCallback={handleVendaConcluida}
      />

      <SuccessView dadosVenda={vendaConcluida} onNovaVenda={handleNovaVenda} />
    </div>
  );
}