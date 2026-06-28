import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiMaquininhas } from "../services/apiMaquininhas";
import { toast } from "sonner";
import { extrairMensagemErro } from "@/lib/utils";

export function useMaquininhas(onSuccessCallback?: () => void) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['lista-maquininhas'],
        queryFn: apiMaquininhas.listarTodas,
    });

    const salvar = useMutation({
        mutationFn: apiMaquininhas.salvar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lista-maquininhas'] });
            toast.success("Operação realizada com sucesso!");
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error) => {
            toast.error("Falha na operação", { description: extrairMensagemErro(error, "Erro ao salvar a maquininha.") });
        }
    });

    const excluir = useMutation({
        mutationFn: apiMaquininhas.excluir,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lista-maquininhas'] });
            toast.success("Maquininha inativada com sucesso!");
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: () => {
            toast.error("Erro ao inativar", { description: "Não foi possível inativar a maquininha." });
        }
    });

    return {
        maquininhas: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        salvar: salvar.mutateAsync,
        isSalvando: salvar.isPending,
        excluir: excluir.mutateAsync,
        isExcluindo: excluir.isPending
    };
}