import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDre } from './useDre';
import { fetchDre } from '../services/apiRelatorios';
import type { DreResponse } from '../types/relatorios';

vi.mock('../services/apiRelatorios', () => ({ fetchDre: vi.fn() }));
vi.mock('@/lib/errorReporting', () => ({ reportOperationalError: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return renderHook(() => useDre(), { wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
}
const range = (month: number) => ({ from: new Date(2026, month, 1), to: new Date(2026, month, 2) });

describe('DRE por período', () => {
  it('não deixa resposta atrasada substituir o período atual', async () => {
    let completeOld!: (value: DreResponse) => void;
    vi.mocked(fetchDre).mockImplementationOnce(() => new Promise(resolve => { completeOld = resolve; }));
    vi.mocked(fetchDre).mockResolvedValueOnce({ receitaBruta: 20 } as DreResponse);
    const { result } = setup();
    await waitFor(() => expect(fetchDre).toHaveBeenCalledTimes(1));
    act(() => result.current.handleCalendarChange(range(0)));
    await waitFor(() => expect(result.current.data?.receitaBruta).toBe(20));
    await act(async () => completeOld({ receitaBruta: 10 } as DreResponse));
    expect(result.current.data?.receitaBruta).toBe(20);
  });
  it('mostra erro sem preservar valores antigos e permite recuperar', async () => {
    vi.mocked(fetchDre).mockResolvedValueOnce({ receitaBruta: 10 } as DreResponse)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ receitaBruta: 30 } as DreResponse);
    const { result } = setup();
    await waitFor(() => expect(result.current.data?.receitaBruta).toBe(10));
    act(() => result.current.handleCalendarChange(range(1)));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeNull();
    await act(async () => { await result.current.tentarNovamente(); });
    await waitFor(() => expect(result.current.data?.receitaBruta).toBe(30));
    act(() => result.current.handleCalendarChange(undefined));
    expect(result.current.data).toBeNull();
  });
});
