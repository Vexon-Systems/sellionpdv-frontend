import { api } from "@/lib/api";
import type { 
  UsuarioMeDTO, 
  AlterarPerfilPayload, 
  AlterarSenhaPayload, 
  AlterarPreferenciasPayload 
} from "../types/usuario";

export const apiUsuarios = {
  buscarMe: async (): Promise<UsuarioMeDTO> => {
    const { data } = await api.get<UsuarioMeDTO>('/api/usuarios/me');
    return data;
  },

  atualizarPerfil: async (payload: AlterarPerfilPayload): Promise<UsuarioMeDTO> => {
    const { data } = await api.put<UsuarioMeDTO>('/api/usuarios/me', payload);
    return data;
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<{ avatarUrl: string }>('/api/usuarios/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  alterarSenha: async (payload: AlterarSenhaPayload): Promise<void> => {
    await api.put('/api/usuarios/me/senha', payload);
  },

  alterarPreferencias: async (payload: AlterarPreferenciasPayload): Promise<AlterarPreferenciasPayload> => {
    const { data } = await api.put<AlterarPreferenciasPayload>('/api/usuarios/me/preferencias', payload);
    return data;
  },

  configurarPin: async (pin: string): Promise<{ usaPin: boolean }> => {
    const { data } = await api.put<{ usaPin: boolean }>('/api/usuarios/me/pin', { pin });
    return data;
  }
};