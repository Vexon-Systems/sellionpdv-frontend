export interface UsuarioPreferenciasDTO {
  tema: 'LIGHT' | 'DARK';
  sonsAtivos: boolean;
  tamanhoInterface: 'PADRAO' | 'AMPLA';
  usaPin: boolean;
}

export interface UsuarioMeDTO {
  id: number;
  tenantId: number;
  nome: string;
  email: string;
  telefone: string | null;
  role: 'ADMIN' | 'GERENTE' | 'OPERADOR';
  avatarUrl: string | null;
  preferencias: UsuarioPreferenciasDTO;
}

export interface AlterarPerfilPayload {
  nome: string;
  telefone: string;
}

export interface AlterarSenhaPayload {
  senhaAtual: string;
  novaSenha: string;
}

export interface AlterarPreferenciasPayload {
  tema: 'LIGHT' | 'DARK';
  sonsAtivos: boolean;
  tamanhoInterface: 'PADRAO' | 'AMPLA';
}