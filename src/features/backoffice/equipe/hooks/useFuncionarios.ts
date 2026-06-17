import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFuncionarios } from "../services/apiFuncionarios";
import { extrairMensagemErro } from "@/lib/utils";
import type { CriarFuncionarioDTO, AtualizarFuncionarioDTO } from "../types/funcionario";

export function useFuncionarios(onSuccessCallback?: () => void) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['funcionarios'],
        queryFn: apiFuncionarios.listar,
    });

    const criar = useMutation({
        mutationFn: apiFuncionarios.criar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
            toast.success("Funcionário cadastrado com sucesso!");
            onSuccessCallback?.();
        },
        onError: (error) => {
            toast.error(extrairMensagemErro(error, "Erro ao cadastrar o funcionário."));
        },
    });

    const atualizar = useMutation({
        mutationFn: apiFuncionarios.atualizar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
            toast.success("Funcionário atualizado com sucesso!");
            onSuccessCallback?.();
        },
        onError: (error) => {
            toast.error(extrairMensagemErro(error, "Erro ao atualizar o funcionário."));
        },
    });

    const excluir = useMutation({
        mutationFn: apiFuncionarios.excluir,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
            toast.success("Funcionário removido da equipe.");
            onSuccessCallback?.();
        },
        onError: (error) => {
            toast.error(extrairMensagemErro(error, "Erro ao remover o funcionário."));
        },
    });

    return {
        funcionarios: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        criar: (dados: CriarFuncionarioDTO) => criar.mutateAsync(dados),
        atualizar: (id: number, dados: AtualizarFuncionarioDTO) => atualizar.mutateAsync({ id, ...dados }),
        excluir: (id: number) => excluir.mutateAsync(id),
        isSalvando: criar.isPending || atualizar.isPending,
        isExcluindo: excluir.isPending,
    };
}
