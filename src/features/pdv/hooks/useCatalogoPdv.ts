import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProdutos } from "../../backoffice/catalogo/services/apiProdutos";
import { apiCategorias } from "@/features/backoffice/catalogo/services/apiCategorias";
import { useAuthStore } from "@/store/useAuthStore";
import { useDebounce } from "@/hooks/useDebounce";

export function useCatalogoPdv(termoBusca: string, categoriaAtiva: number) {
    const token = useAuthStore((state) => state.accessToken);
    const termoDebouncado = useDebounce(termoBusca, 300);

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
        queryFn: apiCategorias.listar,
        enabled: !!token,
    });

    const produtosFiltrados = useMemo(() => {
        if (!produtos) return [];
        const termoNormalizado = termoDebouncado.toLowerCase().trim();
        return produtos.filter((produto) => {
            const atendeCategoria =
                categoriaAtiva === 0 || produto.categoriaId === categoriaAtiva;
            const atendeBusca =
                termoNormalizado === "" ||
                produto.nome.toLowerCase().includes(termoNormalizado);
            return atendeCategoria && atendeBusca;
        });
    }, [produtos, categoriaAtiva, termoDebouncado]);

    return {
        produtos,
        produtosFiltrados,
        categorias,
        isLoadingProdutos,
        isErrorProdutos,
        isLoadingCategorias,
    };
}
