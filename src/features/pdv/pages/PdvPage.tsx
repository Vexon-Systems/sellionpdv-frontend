import { useRef, useState } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import { Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { usePdv } from "../hooks/usePdv";
import { useCaixaStore } from "@/store/useCaixaStore";
import { formatarNomeCurto } from "@/lib/utils";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { AtalhosDialog } from "../components/AtalhosDialog";
import { CartSidebar } from "../components/CartSidebar";
import { ProductGrid } from "../components/ProductGrid";
import { ProdutoVendaModal } from "../components/ProdutoVendaModal";
import { CheckoutModal } from "../components/CheckoutModal";
import { SuccessView } from "../components/SuccessView";


export function PdvPage() {
  const {
    produtoSelecionado,
    categoriaAtiva,
    setCategoriaAtiva,
    termoBusca,
    setTermoBusca,
    isCheckoutOpen,
    setIsCheckoutOpen,
    vendaConcluida,

    produtosFiltrados,
    categorias,
    contagemPorCategoria,
    contagemPorProduto,
    itens,
    subtotal,

    isLoadingProdutos,
    isErrorProdutos,
    isLoadingCategorias,

    removerItem,
    alterarQuantidade,

    handleCliqueProduto,
    handleEditarItem,
    handleFecharProdutoModal,
    handleVendaConcluida,
    handleNovaVenda,
    contextoEdicao,
  } = usePdv();

  const caixaAtual = useCaixaStore((s) => s.caixaAtual);
  const buscaRef = useRef<HTMLInputElement>(null);
  const [isAtalhosOpen, setIsAtalhosOpen] = useState(false);

  // Atalho "/" foca o campo de busca. Atalho "?" abre o painel de ajuda.
  useKeyboardShortcut("/", () => buscaRef.current?.focus());
  useKeyboardShortcut("?", () => setIsAtalhosOpen(true));
  const subtituloTurno = caixaAtual
    ? (
      <span className="inline-flex items-center gap-1">
        <span>Turno aberto</span>
        <span className="font-medium text-gray-700">
          {format(new Date(caixaAtual.dataAbertura), "HH:mm")}
        </span>
        {caixaAtual.operadorAberturaNome && (
          <>
            <span className="text-gray-300">·</span>
            <span className="font-medium text-gray-700">
              {formatarNomeCurto(caixaAtual.operadorAberturaNome)}
            </span>
          </>
        )}
      </span>
    )
    : undefined;

  return (
    <div className="flex flex-col h-screen w-full overflow-y-auto">
      <Header
        titulo="Frente de Caixa"
        subtitulo={subtituloTurno}
        acoes={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAtalhosOpen(true)}
            className="gap-1.5 cursor-pointer"
            title="Ver atalhos do teclado"
          >
            <HelpCircle size={14} />
            Atalhos
            <kbd className="hidden sm:inline-flex ml-1 items-center px-1 py-0.5 text-[10px] font-mono font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
              ?
            </kbd>
          </Button>
        }
      />

      <main className="flex flex-1 flex-col lg:flex-row min-h-0 w-full bg-gray-50 overflow-hidden">
        {/* Área principal: busca, categorias e vitrine */}
        <div className="flex flex-1 flex-col px-4 md:px-8 py-6 min-w-0 overflow-y-auto">
          {/* Barra de busca */}
          <div className="relative w-full max-w-md shrink-0">
            <Search className="absolute left-2 top-3 text-gray-800" size={18} />
            <Input
              ref={buscaRef}
              type="text"
              placeholder="Buscar por nome"
              className="pl-10 pr-12 h-10 w-full bg-white border-gray-200"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
            <kbd className="hidden sm:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
              /
            </kbd>
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
                    <span className="ml-1.5 text-xs text-gray-400 font-normal">
                      {contagemPorCategoria[0] ?? 0}
                    </span>
                  </TabsTrigger>
                  {categorias?.map((cat) => (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id.toString()}
                      className="whitespace-nowrap px-4 py-2 rounded-md cursor-pointer transition-all"
                    >
                      {cat.nome}
                      <span className="ml-1.5 text-xs text-gray-400 font-normal">
                        {contagemPorCategoria[cat.id] ?? 0}
                      </span>
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
              contagemPorProduto={contagemPorProduto}
            />
          </div>
        </div>

        {/* Carrinho lateral */}
        <CartSidebar
          itens={itens}
          subtotal={subtotal}
          onAlterarQuantidade={alterarQuantidade}
          onRemoverItem={removerItem}
          onEditarItem={handleEditarItem}
          onConfirmarVenda={() => setIsCheckoutOpen(true)}
        />
      </main>

      {/* Modais */}
      {produtoSelecionado && (
        <ProdutoVendaModal
          key={contextoEdicao?.idCarrinho ?? `novo-${produtoSelecionado.id}`}
          isOpen={!!produtoSelecionado}
          produto={produtoSelecionado}
          onClose={handleFecharProdutoModal}
          modoEdicao={contextoEdicao ?? undefined}
        />
      )}

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        subtotal={subtotal}
        onSuccessCallback={handleVendaConcluida}
      />

      <SuccessView dadosVenda={vendaConcluida} onNovaVenda={handleNovaVenda} />

      <AtalhosDialog isOpen={isAtalhosOpen} onOpenChange={setIsAtalhosOpen} />
    </div>
  );
}