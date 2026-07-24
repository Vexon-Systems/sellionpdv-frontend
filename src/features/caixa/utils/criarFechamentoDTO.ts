import type { FechamentoDTO } from "../types/caixa";

export function criarFechamentoDTO(dinheiroContado: number): FechamentoDTO {
    return { saldoFinalInformado: dinheiroContado };
}
