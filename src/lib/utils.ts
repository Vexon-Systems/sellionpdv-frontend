import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isAxiosError } from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extrairMensagemErro(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;
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
