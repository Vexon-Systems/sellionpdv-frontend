import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProdutos, salvarProduto, excluirProduto, uploadImagemProduto } from "../services/apiProdutos"; // Ajuste o caminho se necessário
import { toast } from "sonner";
import type { ProdutoDTO } from "@/types/pdv";
import { extrairMensagemErro } from "@/lib/utils";

export function useProdutos(onSuccessCallback?: () => void) {
    const queryClient = useQueryClient();

    const query = useQuery({ queryKey: ['produtos'], queryFn: fetchProdutos });

    const salvar = useMutation({
        mutationFn: salvarProduto,
        onSuccess: () => {
            toast.success("Produto salvo com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error) => toast.error(extrairMensagemErro(error, "Erro ao salvar o produto."))
    });

    const excluir = useMutation({
        mutationFn: excluirProduto,
        onSuccess: () => {
            toast.success("Produto excluído!");
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error) => toast.error(extrairMensagemErro(error, "Erro ao excluir o produto."))
    });

    const upload = useMutation({ mutationFn: uploadImagemProduto });

    return {
        produtos: query.data || [],
        isLoading: query.isLoading,
        salvar: salvar.mutateAsync,
        isSalvando: salvar.isPending,
        excluir: excluir.mutateAsync,
        upload: upload.mutateAsync,
        isUploading: upload.isPending
    };
}