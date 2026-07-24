import type { BandeiraCartao, FormaPagamento } from "../types/venda";

export function exigeDadosCartao(formaPagamento: FormaPagamento | null): boolean {
    return formaPagamento === "CREDITO" || formaPagamento === "DEBITO";
}

export function pagamentoProntoParaConfirmar(
    formaPagamento: FormaPagamento | null,
    maquininhaId: number | string | null | undefined,
    bandeiraCartao: BandeiraCartao | null | undefined,
): boolean {
    if (!formaPagamento) return false;
    if (!exigeDadosCartao(formaPagamento)) return true;
    return maquininhaId != null && maquininhaId !== "" && bandeiraCartao != null;
}

export function normalizarCamposPagamento(
    formaPagamento: FormaPagamento,
    maquininhaId: number | null | undefined,
    bandeiraCartao: BandeiraCartao | null | undefined,
) {
    if (!exigeDadosCartao(formaPagamento)) {
        return { maquininhaId: null, bandeiraCartao: null };
    }
    return {
        maquininhaId: maquininhaId ?? null,
        bandeiraCartao: bandeiraCartao ?? null,
    };
}
