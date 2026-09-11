import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TrocarSenhaPage } from './TrocarSenhaPage';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

vi.mock('@tanstack/react-router', () => ({ useNavigate: () => vi.fn() }));
vi.mock('@/lib/api', () => ({ api: { put: vi.fn(), get: vi.fn() } }));
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); useAuthStore.getState().setAuth({ id: 1, nome: 'Admin', email: 'a@example.invalid', role: 'ROLE_ADMIN', deveTrocarSenha: true }, 'access', 'refresh'); });
async function preencher() {
    const client = new QueryClient();
    client.setQueryData(['privado'], 'dados');
    render(<QueryClientProvider client={client}><TrocarSenhaPage /></QueryClientProvider>);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Senha temporária'), 'temporaria');
    await user.type(screen.getByLabelText('Nova senha'), 'definitiva123');
    await user.type(screen.getByLabelText('Confirme a nova senha'), 'definitiva123');
    await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));
    return client;
}
it('troca sem consultar perfil, limpa sessão e cache após sucesso', async () => {
    vi.mocked(api.put).mockResolvedValue({});
    const client = await preencher();
    expect(await screen.findByText('Senha alterada')).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
    expect(api.put).toHaveBeenCalledWith('/api/usuarios/me/senha', { senhaAtual: 'temporaria', novaSenha: 'definitiva123' }, { timeout: 30_000 });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(client.getQueryCache().getAll()).toHaveLength(0);
});
it('senha inválida mantém restrição', async () => {
    vi.mocked(api.put).mockRejectedValue({ isAxiosError: true, response: { status: 400 } });
    await preencher();
    expect(await screen.findByRole('alert')).toHaveTextContent('Confira a senha atual');
    expect(useAuthStore.getState().user?.deveTrocarSenha).toBe(true);
});
it('timeout não repete gravação e orienta verificar com novo login', async () => {
    vi.mocked(api.put).mockRejectedValue({ isAxiosError: true, code: 'ECONNABORTED' });
    await preencher();
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível confirmar');
    expect(screen.getByRole('button', { name: 'Salvar nova senha' })).toBeDisabled();
    expect(api.put).toHaveBeenCalledTimes(1);
});
