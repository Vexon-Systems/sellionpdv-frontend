import { useQuery } from '@tanstack/react-query';
import { apiCaixa } from '../services/apiCaixa';
import { reportOperationalError } from '@/lib/errorReporting';

export function useCaixaOperacional() {
  return useQuery({
    queryKey: ['caixa-operacional'],
    queryFn: async () => {
      try {
        return await apiCaixa.buscarOperacional();
      } catch (error) {
        reportOperationalError('caixa.consultar', error);
        throw error;
      }
    },
    retry: false,
  });
}
