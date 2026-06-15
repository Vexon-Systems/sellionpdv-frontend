import { useState, useMemo } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useCatalogoPdv } from "./useCatalogoPdv";
import type { ProdutoDTO, DadosSucesso } from "../../../types/pdv";

export type { DadosSucesso };

export function usePdv() {
    const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoDTO | null>(null);
    const [categoriaAtiva, setCategoriaAtiva] = useState<number>(0);
    const [termoBusca, setTermoBusca] = useState("");
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [vendaConcluida, setVendaConcluida] = useState<DadosSucesso | null>(null);

    const { itens, adicionarItem, removerItem, alterarQuantidade, limparCarrinho } = useCartStore();

    const {
        produtosFiltrados,
        categorias,
        isLoadingProdutos,
        isErrorProdutos,
        isLoadingCategorias,
    } = useCatalogoPdv(termoBusca, categoriaAtiva);

    const subtotal = useMemo(
        () => itens.reduce((acc, item) => acc + item.subtotal, 0),
        [itens]
    );

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
