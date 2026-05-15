import { create } from 'zustand';
import type { CaixaAtualDTO } from '@/features/caixa/services/apiCaixa';

interface CaixaState {
  caixaAtual: CaixaAtualDTO | null;
  setCaixa: (caixa: CaixaAtualDTO) => void;
  limparCaixa: () => void;
  isCaixaAberto: () => boolean;
}

export const useCaixaStore = create<CaixaState>((set, get) => ({
  caixaAtual: null,
  setCaixa: (caixa) => set({ caixaAtual: caixa }),
  limparCaixa: () => set({ caixaAtual: null }),
  
  isCaixaAberto: () => get().caixaAtual?.status === 'ABERTO',
}));