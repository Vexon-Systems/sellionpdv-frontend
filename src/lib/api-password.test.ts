import axios, { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, expect, it, vi } from 'vitest';
import { api } from './api';
import { useAuthStore } from '@/store/useAuthStore';

const adapterOriginal = api.defaults.adapter;
afterEach(() => { api.defaults.adapter = adapterOriginal; vi.restoreAllMocks(); useAuthStore.getState().clearAuth(); });
function entrar() {
    useAuthStore.getState().setAuth({ id: 1, nome: 'Admin', email: 'a@example.invalid', role: 'ROLE_ADMIN', deveTrocarSenha: false }, 'access', 'refresh');
}
function unauthorized(config: Parameters<NonNullable<import('axios').AxiosAdapter>>[0]) {
    return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, { status: 401, statusText: 'Unauthorized', data: {}, headers: new AxiosHeaders(), config });
}
it('401 na troca não dispara refresh nem repete PUT', async () => {
    entrar();
    const post = vi.spyOn(axios, 'post');
    const adapter = vi.fn(async config => { throw unauthorized(config); });
    api.defaults.adapter = adapter;
    await expect(api.put('/api/usuarios/me/senha', {})).rejects.toBeInstanceOf(AxiosError);
    expect(adapter).toHaveBeenCalledTimes(1);
    expect(post).not.toHaveBeenCalled();
});
it('refresh atualiza indicador e usuário junto com os tokens', async () => {
    entrar();
    const usuario = { ...useAuthStore.getState().user!, nome: 'Nome atual', deveTrocarSenha: false };
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { accessToken: 'novo', refreshToken: 'novo-refresh', usuario } });
    let count = 0;
    api.defaults.adapter = async config => {
        if (++count === 1) throw unauthorized(config);
        return { status: 200, statusText: 'OK', data: {}, config, headers: new AxiosHeaders() };
    };
    await api.get('/api/usuarios/me');
    expect(useAuthStore.getState().user).toEqual(usuario);
    expect(useAuthStore.getState().accessToken).toBe('novo');
});
it('refresh restrito não repete a consulta operacional', async () => {
    entrar();
    const usuario = { ...useAuthStore.getState().user!, deveTrocarSenha: true };
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { accessToken: 'restrito', refreshToken: 'novo-refresh', usuario } });
    const adapter = vi.fn(async config => { throw unauthorized(config); });
    api.defaults.adapter = adapter;
    await expect(api.get('/api/usuarios/me')).rejects.toBeInstanceOf(AxiosError);
    expect(adapter).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user?.deveTrocarSenha).toBe(true);
});
