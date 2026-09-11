import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';
import { useAuthStore } from '@/store/useAuthStore';

const originalAdapter = api.defaults.adapter;
beforeEach(() => useAuthStore.setState({ accessToken: 'old', refreshToken: 'refresh', isAuthenticated: true }));
afterEach(() => { api.defaults.adapter = originalAdapter; vi.restoreAllMocks(); useAuthStore.getState().clearAuth(); });
const unauthorized = (config: InternalAxiosRequestConfig) => new AxiosError('unauthorized', 'ERR_BAD_REQUEST', config, undefined, { data: {}, status: 401, statusText: 'Unauthorized', headers: {}, config });

describe('fila de refresh', () => {
  it('renova uma vez e libera todas as requisições com o novo token', async () => {
    let complete!: (value: unknown) => void;
    const refresh = vi.spyOn(axios, 'post').mockImplementation(() => new Promise(resolve => { complete = resolve; }));
    api.defaults.adapter = async config => {
      if (config.headers.Authorization === 'Bearer old') throw unauthorized(config);
      return { data: 'ok', status: 200, statusText: 'OK', headers: {}, config };
    };
    const pending = Promise.all([api.get('/one'), api.get('/two')]);
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    complete({ data: { accessToken: 'new', refreshToken: 'rotated', usuario: { id: 1, nome: 'Admin', email: 'admin@example.invalid', role: 'ROLE_ADMIN', deveTrocarSenha: false } } });
    expect((await pending).map(r => r.data)).toEqual(['ok', 'ok']);
    expect(refresh.mock.calls[0][2]).toEqual({ timeout: 15_000 });
  });
  it.each(['ECONNABORTED', 'ERR_NETWORK'])('libera todos os aguardando após %s', async code => {
    let fail!: (error: Error) => void;
    const refresh = vi.spyOn(axios, 'post').mockImplementation(() => new Promise((_resolve, reject) => { fail = reject; }));
    api.defaults.adapter = async config => { throw unauthorized(config); };
    const pending = Promise.allSettled([api.get('/one'), api.get('/two')]);
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    fail(new AxiosError('refresh failed', code));
    expect((await pending).map(r => r.status)).toEqual(['rejected', 'rejected']);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
  it('não repete POST após timeout', async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => { throw new AxiosError('timeout', 'ECONNABORTED', config); });
    api.defaults.adapter = adapter;
    await expect(api.post('/api/vendas', {})).rejects.toMatchObject({ code: 'ECONNABORTED' });
    expect(adapter).toHaveBeenCalledTimes(1);
    expect(adapter.mock.calls[0][0].timeout).toBe(30_000);
  });
});
