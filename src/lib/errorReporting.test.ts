import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/react';
import { reportOperationalError } from './errorReporting';

const { setTag } = vi.hoisted(() => ({ setTag: vi.fn() }));
vi.mock('@sentry/react', () => ({
  withScope: vi.fn((callback: (scope: { setTag: typeof setTag }) => void) => callback({ setTag })),
  captureMessage: vi.fn(),
}));
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

it('registra contexto operacional sem serializar credenciais ou resposta HTTP', () => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_SENTRY_ENVIRONMENT', 'staging');
  vi.stubEnv('VITE_APP_VERSION', 'release-sha');
  const config: InternalAxiosRequestConfig = {
    headers: new AxiosHeaders({ Authorization: 'Bearer secret-token' }),
    data: 'secret-payload',
  };
  const error = new AxiosError('secret-error', 'ERR_BAD_RESPONSE', config, undefined, {
    config, data: 'secret-response', status: 503, statusText: 'Unavailable', headers: {},
  });
  reportOperationalError('relatorios.vendas.listar', error);
  expect(setTag.mock.calls).toEqual([
    ['context', 'relatorios.vendas.listar'], ['environment', 'staging'],
    ['release', 'release-sha'], ['http.status_code', 503], ['failure.kind', 'http'],
  ]);
  expect(Sentry.captureMessage).toHaveBeenCalledWith('Operational request failed', 'error');
  expect(JSON.stringify([setTag.mock.calls, vi.mocked(Sentry.captureMessage).mock.calls])).not.toContain('secret');
});
