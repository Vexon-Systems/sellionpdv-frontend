import { beforeEach, expect, it } from 'vitest';
import { useAuthStore } from '@/store/useAuthStore';
import { requireAuth, requireAdmin, requireSession } from './auth-guards';

beforeEach(() => useAuthStore.getState().clearAuth());
function entrar(deveTrocarSenha?: boolean) {
    useAuthStore.getState().setAuth({ id: 1, nome: 'Admin', email: 'admin@example.invalid', role: 'ROLE_ADMIN', deveTrocarSenha }, 'access', 'refresh');
}
it('conta restrita acessa troca mas não operação nem administração', () => {
    entrar(true);
    expect(requireSession).not.toThrow();
    expect(requireAuth).toThrow();
    expect(requireAdmin).toThrow();
});
it('conta normal preserva acesso', () => {
    entrar(false);
    expect(requireAuth).not.toThrow();
    expect(requireAdmin).not.toThrow();
});
it('sessão antiga sem indicador exige autenticação novamente', () => {
    entrar();
    expect(requireAuth).toThrow();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
});
