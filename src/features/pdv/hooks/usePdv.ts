// /features/pdv/hooks/usePdv.ts
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProdutos } from "../services/apiProdutos";
import { fetchCategorias } from "@/features/backoffice/services/apiCategorias";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { ProdutoDTO, DadosSucesso } from "../types/pdv";

export type { DadosSucesso };

export function usePdv() {
  const token = useAuthStore((state) => state.accessToken);
  
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoDTO | null>(null);
  const [categoriaAtiva, setCategoriaAtiva] = useState<number>(0);
  const [termoBusca, setTermoBusca] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [vendaConcluida, setVendaConcluida] = useState<DadosSucesso | null>(null);

  const { itens, adicionarItem, removerItem, alterarQuantidade, limparCarrinho } = useCartStore();

  const {
    data: produtos,
    isLoading: isLoadingProdutos,
    isError: isErrorProdutos,
  } = useQuery({
    queryKey: ["lista-produtos"],
    queryFn: fetchProdutos,
    enabled: !!token,
  });

  const { data: categorias, isLoading: isLoadingCategorias } = useQuery({
    queryKey: ["lista-categorias"],
    queryFn: fetchCategorias,
    enabled: !!token,
  });

  const subtotal = useMemo(
    () => itens.reduce((acc, item) => acc + item.subtotal, 0),
    [itens]
  );

  const produtosFiltrados = useMemo(() => {
    if (!produtos) return [];
    const termoNormalizado = termoBusca.toLowerCase().trim();
    return produtos.filter((produto) => {
      const atendeCategoria =
        categoriaAtiva === 0 || produto.categoriaId === categoriaAtiva;
      const atendeBusca =
        termoNormalizado === "" ||
        produto.nome.toLowerCase().includes(termoNormalizado);
      return atendeCategoria && atendeBusca;
    });
  }, [produtos, categoriaAtiva, termoBusca]);

  function handleCliqueProduto(produto: ProdutoDTO) {
    const possuiModificadores =
      produto.gruposModificadores && produto.gruposModificadores.length > 0;

    if (possuiModificadores) {
      setProdutoSelecionado(produto);
    } else {
      adicionarItem(produto, []);
    }
  }

  function handleVendaConcluida(dados: DadosSucesso) {
    setVendaConcluida(dados);
    setIsCheckoutOpen(false);
  }

  function handleNovaVenda() {
    limparCarrinho();
    setVendaConcluida(null);
  }

  return {
    // Estado da UI
    produtoSelecionado,
    setProdutoSelecionado,
    categoriaAtiva,
    setCategoriaAtiva,
    termoBusca,
    setTermoBusca,
    isCheckoutOpen,
    setIsCheckoutOpen,
    vendaConcluida,

    // Dados
    produtos,
    produtosFiltrados,
    categorias,
    itens,
    subtotal,

    // Estados de carregamento
    isLoadingProdutos,
    isErrorProdutos,
    isLoadingCategorias,

    // Ações do carrinho
    removerItem,
    alterarQuantidade,

    // Handlers
    handleCliqueProduto,
    handleVendaConcluida,
    handleNovaVenda,
  };
}