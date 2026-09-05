import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isAxiosError } from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extrairMensagemErro(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      const method = error.config?.method?.toLowerCase();
      if (method && !['get', 'head', 'options'].includes(method)) {
        return 'Não foi possível confirmar o resultado da operação. Consulte os registros antes de iniciar outra operação.';
      }
      return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
    }
    const detail = error.response?.data?.detail;
    if (detail === 'Venda já processada com esta chave.') {
      return 'Esta venda já foi registrada. Confira o histórico com o responsável antes de iniciar uma nova venda.';
    }
    if (typeof detail === "string" && detail.trim().length > 0) {
      return detail;
    }
  }
  return fallback;
}

const moedaFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
 
export function formatarMoeda(valor: number): string {
  return moedaFormatter.format(valor);
}

/**
 * Encurta o nome completo em "Primeiro + inicial do último".
 * "João Silva" → "João S."
 * "Ana Maria Souza" → "Ana S."
 * "João" → "João"
 */
export function formatarNomeCurto(nomeCompleto: string | null | undefined): string {
  if (!nomeCompleto) return "";
  const partes = nomeCompleto.trim().split(/\s+/);
  if (partes.length === 1) return partes[0];
  const inicial = partes[partes.length - 1]?.charAt(0)?.toUpperCase() ?? "";
  return inicial ? `${partes[0]} ${inicial}.` : partes[0];
}
