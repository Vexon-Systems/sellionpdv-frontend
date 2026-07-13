import { useState, useMemo } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useCatalogoPdv } from "./useCatalogoPdv";
import type { ProdutoDTO, DadosSucesso, ModificadorSelecionado } from "../../../types/pdv";

export type { DadosSucesso };

/**
 * Contexto de edição: quando o usuário clica "Editar" numa linha do carrinho,
 * o modal abre pré-preenchido e ao confirmar substitui aquela linha em vez de criar nova.
 */
export interface ContextoEdicao {
    idCarrinho: string;
    modificadoresIniciais: ModificadorSelecionado[];
}

export function usePdv() {
    const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoDTO | null>(null);
    const [contextoEdicao, setContextoEdicao] = useState<ContextoEdicao | null>(null);
    const [categoriaAtiva, setCategoriaAtiva] = useState<number>(0);
    const [termoBusca, setTermoBusca] = useState("");
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [vendaConcluida, setVendaConcluida] = useState<DadosSucesso | null>(null);

    const { itens, adicionarItem, removerItem, alterarQuantidade, limparCarrinho } = useCartStore();

    const {
        produtos,
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

    /**
     * Contagem de produtos por categoria (id → total). O id 0 representa a aba "Todos".
     * Baseado na lista completa (não a filtrada) — a contagem não muda quando o usuário
     * filtra por busca ou muda de aba.
     */
    const contagemPorCategoria = useMemo(() => {
        const contagem: Record<number, number> = { 0: produtos?.length ?? 0 };
        produtos?.forEach((p) => {
            contagem[p.categoriaId] = (contagem[p.categoriaId] ?? 0) + 1;
        });
        return contagem;
    }, [produtos]);

    /**
     * Quantidade total no carrinho por produto (produtoId → quantidade).
     * Soma quantidade entre linhas diferentes do mesmo produto (mesmo produto pode
     * aparecer múltiplas vezes no carrinho quando configurado diferente).
     */
    const contagemPorProduto = useMemo(() => {
        const contagem: Record<number, number> = {};
        itens.forEach((it) => {
            contagem[it.produto.id] = (contagem[it.produto.id] ?? 0) + it.quantidade;
        });
        return contagem;
    }, [itens]);

    function handleCliqueProduto(produto: ProdutoDTO) {
        const possuiModificadores =
            produto.gruposModificadores && produto.gruposModificadores.length > 0;

        if (possuiModificadores) {
            setContextoEdicao(null); // clique novo sempre limpa contexto de edição
            setProdutoSelecionado(produto);
        } else {
            adicionarItem(produto, []);
        }
    }

    function handleEditarItem(idCarrinho: string) {
        const item = itens.find((it) => it.idCarrinho === idCarrinho);
        if (!item) return;
        setContextoEdicao({
            idCarrinho: item.idCarrinho,
            modificadoresIniciais: item.modificadores,
        });
        setProdutoSelecionado(item.produto);
    }

    function handleFecharProdutoModal() {
        setProdutoSelecionado(null);
        setContextoEdicao(null);
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
        contextoEdicao,
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
        contagemPorCategoria,
        contagemPorProduto,
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
        handleEditarItem,
        handleFecharProdutoModal,
        handleVendaConcluida,
        handleNovaVenda,
    };
}
