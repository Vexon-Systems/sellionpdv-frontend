import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUsuarios } from "../services/apiUsuarios";
import { toast } from "sonner";
import { extrairMensagemErro } from "@/lib/utils";

export function useUsuarioMe() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['usuario-me'],
    queryFn: apiUsuarios.buscarMe,
    staleTime: 1000 * 60 * 10, // Cache por 10 minutos
  });

  const atualizarPerfil = useMutation({
    mutationFn: apiUsuarios.atualizarPerfil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuario-me'] });
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (error) => toast.error(extrairMensagemErro(error, "Erro ao atualizar perfil."))
  });

  const uploadAvatar = useMutation({
    mutationFn: apiUsuarios.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuario-me'] });
      toast.success("Foto de perfil atualizada!");
    },
    onError: () => toast.error("Erro ao enviar a imagem.")
  });

  const alterarSenha = useMutation({
    mutationFn: apiUsuarios.alterarSenha,
    onSuccess: () => toast.success("Senha alterada com sucesso!"),
    onError: (error) => toast.error(extrairMensagemErro(error, "Senha atual incorreta."))
  });

  const alterarPreferencias = useMutation({
    mutationFn: apiUsuarios.alterarPreferencias,
    onSuccess: (novasPrefs) => {
      queryClient.invalidateQueries({ queryKey: ['usuario-me'] });

      if (novasPrefs.tema === 'DARK') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      toast.success("Preferências salvas com sucesso!");
    }
  });

  const configurarPin = useMutation({
    mutationFn: apiUsuarios.configurarPin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuario-me'] });
      toast.success("PIN de acesso atualizado!");
    },
    onError: (error) => toast.error(extrairMensagemErro(error, "Erro ao configurar PIN."))
  });

  return {
    usuario: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    atualizarPerfil: atualizarPerfil.mutateAsync,
    isAtualizandoPerfil: atualizarPerfil.isPending,
    uploadAvatar: uploadAvatar.mutateAsync,
    isUploadingAvatar: uploadAvatar.isPending,
    alterarSenha: alterarSenha.mutateAsync,
    isAlterandoSenha: alterarSenha.isPending,
    alterarPreferencias: alterarPreferencias.mutateAsync,
    configurarPin: configurarPin.mutateAsync,
  };
}