import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiLancamentos } from "../services/apiLancamentos"
import type { CancelamentoLancamentoPayloadDTO, LancamentoPayloadDTO } from "../types/lancamento"

export function useLancamentos(dataInicial: string, dataFinal: string) {
    const queryClient = useQueryClient()
    const queryKey = ["lancamentos", dataInicial, dataFinal]

    const { data: lancamentos = [], isLoading, isError } = useQuery({
        queryKey,
        queryFn: () => apiLancamentos.listar(dataInicial, dataFinal),
        enabled: !!dataInicial && !!dataFinal,
    })

    const invalidate = () => queryClient.invalidateQueries({ queryKey })

    const { mutate: criar, isPending: isCriando } = useMutation({
        mutationFn: (payload: LancamentoPayloadDTO) => apiLancamentos.criar(payload),
        onSuccess: () => {
            toast.success("Lançamento registrado com sucesso.")
            invalidate()
        },
        onError: () => toast.error("Erro ao registrar lançamento."),
    })

    const { mutate: atualizar, isPending: isAtualizando } = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: LancamentoPayloadDTO }) =>
            apiLancamentos.atualizar(id, payload),
        onSuccess: () => {
            toast.success("Lançamento atualizado com sucesso.")
            invalidate()
        },
        onError: () => toast.error("Erro ao atualizar lançamento."),
    })

    const { mutate: cancelar, isPending: isCancelando } = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: CancelamentoLancamentoPayloadDTO }) =>
            apiLancamentos.cancelar(id, payload),
        onSuccess: () => {
            toast.success("Lançamento cancelado. O registro foi preservado.")
            invalidate()
        },
        onError: () => toast.error("Erro ao cancelar lançamento."),
    })

    return {
        lancamentos,
        isLoading,
        isError,
        criar,
        isCriando,
        atualizar,
        isAtualizando,
        cancelar,
        isCancelando,
        isSalvando: isCriando || isAtualizando,
    }
}
