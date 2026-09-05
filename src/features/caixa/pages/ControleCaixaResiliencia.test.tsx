import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import { ControleCaixaPage } from './ControleCaixaPage';
import { apiCaixa } from '../services/apiCaixa';
import { apiVendas } from '@/features/pdv/services/apiVendas';

vi.mock('../services/apiCaixa', () => ({ apiCaixa: { buscarOperacional: vi.fn(), buscarAtual: vi.fn(), listarMovimentacoes: vi.fn() } }));
vi.mock('@/features/pdv/services/apiVendas', () => ({ apiVendas: { listarVendasTurno: vi.fn() } }));
vi.mock('@/lib/errorReporting', () => ({ reportOperationalError: vi.fn() }));
vi.mock('@/components/layout/PageShell', () => ({ PageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it('falha da consulta não significa caixa fechado; retry recupera resposta válida', async () => {
  vi.mocked(apiCaixa.buscarOperacional).mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ caixaAberto: false, visaoAdministrativa: false, id: null, status: null, dataAbertura: null, operadorAberturaId: null, operadorAberturaNome: null, eventos: [] });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(<QueryClientProvider client={client}><ControleCaixaPage /></QueryClientProvider>);
  expect(await screen.findByText('Não foi possível consultar o caixa')).toBeInTheDocument();
  expect(screen.queryByText('Caixa Fechado')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Abrir Caixa Agora' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  await waitFor(() => expect(screen.getByText('Caixa Fechado')).toBeInTheDocument());
});

it('falha no extrato administrativo não apresenta saldo parcial como válido', async () => {
  vi.mocked(apiCaixa.buscarOperacional).mockResolvedValue({ caixaAberto: true, visaoAdministrativa: true,
    id: 1, status: 'ABERTO', dataAbertura: '2026-09-05T10:00:00Z', operadorAberturaId: 1,
    operadorAberturaNome: 'Admin', eventos: [] });
  vi.mocked(apiCaixa.buscarAtual).mockResolvedValue({ id: 1, status: 'ABERTO', saldoInicial: 100,
    dataAbertura: '2026-09-05T10:00:00Z', operadorAberturaId: 1, operadorAberturaNome: 'Admin' });
  vi.mocked(apiCaixa.listarMovimentacoes).mockResolvedValue([]);
  vi.mocked(apiVendas.listarVendasTurno).mockRejectedValueOnce(new Error('offline')).mockResolvedValue([]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(<QueryClientProvider client={client}><ControleCaixaPage /></QueryClientProvider>);
  expect(await screen.findByText('Não foi possível consultar o caixa')).toBeInTheDocument();
  expect(screen.queryByText('Saldo Físico Estimado')).not.toBeInTheDocument();
  expect(screen.queryByText('Caixa Fechado')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(await screen.findByText('Saldo Físico Estimado')).toBeInTheDocument();
});
