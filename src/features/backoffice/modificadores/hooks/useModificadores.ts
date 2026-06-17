import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiModificadores } from "../services/apiModificadores";
import type { GrupoModificadorDTO } from "@/types/pdv";
import { toast } from "sonner";
import { extrairMensagemErro } from "@/lib/utils";

export function useModificadores(onSuccessCallback?: () => void) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['modificadores'],
        queryFn: apiModificadores.listar,
    });

    const salvar = useMutation({
        mutationFn: apiModificadores.salvar,
        onSuccess: () => {
            toast.success("Grupo salvo com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['modificadores'] });
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error) => toast.error(extrairMensagemErro(error, "Erro ao salvar o grupo de modificadores."))
    });

    const excluir = useMutation({
        mutationFn: apiModificadores.excluir,
        onSuccess: () => {
            toast.success("Grupo excluído com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['modificadores'] });
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error) => toast.error(extrairMensagemErro(error, "Erro ao excluir. Verifique se está em uso por algum produto."))
    });

    return {
        grupos: query.data || [],
        isLoading: query.isLoading,
        salvar: salvar.mutateAsync,
        isSalvando: salvar.isPending,
        excluir: excluir.mutateAsync,
        isExcluindo: excluir.isPending
    };
}