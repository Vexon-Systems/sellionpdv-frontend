import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/useCartStore';
import { useCheckout } from './useCheckout';

const originalAdapter = api.defaults.adapter;
afterEach(() => { cleanup(); api.defaults.adapter = originalAdapter; useCartStore.getState().limparCarrinho(); });

it('reenvia a mesma chave após resposta perdida, mantendo uma venda e seu total', async () => {
  useCartStore.getState().adicionarItem({ id: 1, nome: 'Produto', precoBase: 20, ativo: true, categoriaId: 1, gruposModificadores: [] });
  const sales = new Map<string, { id: number; totalFinal: number }>();
  const keys: string[] = [];
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    if (config.method !== 'post') return { data: [], status: 200, statusText: 'OK', headers: {}, config };
    const key = String(config.headers['Idempotency-Key']);
    keys.push(key);
    if (sales.has(key)) {
      // Contrato vigente: duplicata é rejeitada com 422, sem replay do response.
      throw new AxiosError('duplicate', 'ERR_BAD_REQUEST', config, undefined, {
        data: { detail: 'Venda já processada com esta chave.' }, status: 422,
        statusText: 'Unprocessable Entity', headers: {}, config,
      });
    }
    sales.set(key, { id: sales.size + 1, totalFinal: 20 });
    throw new AxiosError('response lost after commit', 'ECONNABORTED', config);
  };
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } });
  const onSuccess = vi.fn();
  const { result } = renderHook(() => useCheckout({ isOpen: true, subtotal: 20, onClose: vi.fn(), onSuccess }), {
    wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
  act(() => result.current.setFormaPagamento('DINHEIRO'));
  act(() => result.current.handleConfirmar());
  await waitFor(() => expect(keys).toHaveLength(1));
  await waitFor(() => expect(result.current.isPending).toBe(false));
  expect(onSuccess).not.toHaveBeenCalled();
  expect(useCartStore.getState().itens).toHaveLength(1);
  act(() => result.current.handleConfirmar());
  await waitFor(() => expect(keys).toHaveLength(2));
  await waitFor(() => expect(result.current.isPending).toBe(false));
  expect(onSuccess).not.toHaveBeenCalled();
  expect(keys).toHaveLength(2);
  expect(keys[1]).toBe(keys[0]);
  expect(sales.size).toBe(1);
  expect([...sales.values()][0].totalFinal).toBe(20);
  // Sem confirmação de sucesso o frontend não apaga o carrinho.
  expect(useCartStore.getState().itens).toHaveLength(1);
});
