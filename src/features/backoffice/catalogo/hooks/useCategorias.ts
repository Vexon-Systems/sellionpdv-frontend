import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCategorias } from "../services/apiCategorias";
import { toast } from "sonner";

export function useCategorias() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['categorias'],
        queryFn: apiCategorias.listar, 
    });

    const salvar = useMutation({
        mutationFn: (dados: { id?: number, nome: string }) => 
            dados.id ? apiCategorias.atualizar(dados.id, dados.nome) : apiCategorias.criar(dados.nome),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            toast.success("Categoria salva!");
        }
    });

    const excluir = useMutation({
        mutationFn: apiCategorias.excluir,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            toast.success("Categoria inativada!");
        },
        onError: () => toast.error("Erro: Verifique se há produtos vinculados.")
    });

    return {
        categorias: query.data || [],
        isLoading: query.isLoading,
        salvar: salvar.mutateAsync,
        excluir: excluir.mutateAsync
    };
}