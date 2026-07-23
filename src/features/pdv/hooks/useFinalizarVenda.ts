import { useMutation } from "@tanstack/react-query";
import { finalizarVenda } from "../services/apiVendas";
import type { ItemCarrinho } from "../../../types/pdv"; 
import type { BandeiraCartao, FormaPagamento } from "../types/venda"; //
import { normalizarCamposPagamento } from "../utils/politicaPagamento";

export interface FormatoVendaFrontend {
    formaPagamento: FormaPagamento;
    maquininhaId?: number | null;
    bandeiraCartao?: BandeiraCartao | null;
    descontoAplicado?: number;
    motivoDesconto?: string | null;
    itens: ItemCarrinho[];
    idempotencyKey: string;
}

export const criarPayloadVenda = (dadosFrontend: FormatoVendaFrontend) => {
    const camposPagamento = normalizarCamposPagamento(
        dadosFrontend.formaPagamento,
        dadosFrontend.maquininhaId,
        dadosFrontend.bandeiraCartao,
    );

    return {
        formaPagamento: dadosFrontend.formaPagamento,
        ...camposPagamento,
        descontoAplicado: dadosFrontend.descontoAplicado || 0,
        motivoDesconto: dadosFrontend.motivoDesconto || null,
        itens: dadosFrontend.itens.map(item => ({
            produtoId: item.produto.id,
            quantidade: item.quantidade,
            modificadores: item.modificadores ? item.modificadores.map(mod => mod.opcaoId) : []
        }))
    };
};

export const useFinalizarVenda = () => {
    return useMutation({
        mutationFn: async (dadosFrontend: FormatoVendaFrontend) => {
            const payloadLimpo = criarPayloadVenda(dadosFrontend);

            return await finalizarVenda(payloadLimpo, dadosFrontend.idempotencyKey);
        },
    });
};
