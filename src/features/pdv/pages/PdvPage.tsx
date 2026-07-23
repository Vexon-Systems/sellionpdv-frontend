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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-surface-sunken">
      <Header
        titulo="Frente de Caixa"
        subtitulo={subtituloTurno}
        acoes={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAtalhosOpen(true)}
            className="gap-1.5"
            title="Ver atalhos do teclado"
          >
            <HelpCircle size={14} />
            Atalhos
            <kbd className="ml-1 hidden items-center rounded border bg-muted px-1 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground sm:inline-flex">
              ?
            </kbd>
          </Button>
        }
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Área principal: busca, categorias e vitrine */}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto px-4 py-5 md:px-6 lg:px-8">
          {/* Barra de busca */}
          <div className="relative w-full max-w-xl shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              ref={buscaRef}
              type="text"
              placeholder="Buscar por nome"
              className="h-11 w-full bg-surface-raised pl-10 pr-12"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
            <kbd className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground sm:inline-flex">
              /
            </kbd>
          </div>

          {/* Abas de categorias */}
          <div className="mt-5 w-full">
            {isLoadingCategorias ? (
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            ) : (
              <Tabs
                value={categoriaAtiva.toString()}
                onValueChange={(val) => setCategoriaAtiva(Number(val))}
                className="w-full"
              >
                <TabsList className="h-auto w-full flex-wrap justify-start rounded-none bg-transparent p-0">
                  <TabsTrigger
                    value="0"
                    className="h-9 flex-none whitespace-nowrap rounded-md px-4 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
                      className="h-9 flex-none whitespace-nowrap rounded-md px-4 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
