import { api } from "@/lib/api";
import { toast } from "sonner";
import type { AxiosResponse } from "axios";

/**
 * Baixa um PDF gerado pelo backend e dispara o download no browser.
 * - Usa o `api` axios (com interceptor de auth já configurado).
 * - Prefere o filename vindo do header `Content-Disposition`; se ausente, usa o fallback informado.
 * - Emite toast de erro via sonner caso a requisição falhe.
 */
export async function downloadPdf(
  endpoint: string,
  fallbackFilename: string,
  params?: Record<string, string | number | undefined>
): Promise<void> {
  try {
    const response = await api.get<Blob>(endpoint, {
      params,
      responseType: "blob",
    });

    const filename = extrairFilenameDeContentDisposition(response) ?? fallbackFilename;
    const blob = response.data;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("[downloadPdf]", endpoint, err);
    toast.error("Não foi possível gerar o PDF. Tente novamente.");
    throw err;
  }
}

function extrairFilenameDeContentDisposition(response: AxiosResponse<Blob>): string | null {
  const header = response.headers["content-disposition"];
  if (typeof header !== "string") return null;

  // Tenta filename*=UTF-8''... primeiro (RFC 5987) e depois filename="..."
  const rfc5987 = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(header);
  if (rfc5987?.[1]) {
    try {
      return decodeURIComponent(rfc5987[1].trim().replace(/^"|"$/g, ""));
    } catch {
      // fallback abaixo
    }
  }

  const simple = /filename="?([^";]+)"?/i.exec(header);
  return simple?.[1]?.trim() ?? null;
}
