import { useMutation } from "@tanstack/react-query";
import { finalizarVenda } from "../services/apiVendas";
import type { ItemCarrinho } from "../../../types/pdv"; 
import type { FormaPagamento } from "../types/venda"; //

export interface FormatoVendaFrontend {
    formaPagamento: FormaPagamento; 
    maquininhaId?: number | null;
    descontoAplicado?: number;
    itens: ItemCarrinho[];
}

export const useFinalizarVenda = () => {
    return useMutation({
        mutationFn: async (dadosFrontend: FormatoVendaFrontend) => {
            const idempotencyKey = crypto.randomUUID();

            const payloadLimpo = {
                formaPagamento: dadosFrontend.formaPagamento,
                maquininhaId: dadosFrontend.maquininhaId || null,
                descontoAplicado: dadosFrontend.descontoAplicado || 0,
                
                itens: dadosFrontend.itens.map(item => ({
                    produtoId: item.produto.id,
                    quantidade: item.quantidade,
                    modificadores: item.modificadores ? item.modificadores.map(mod => mod.opcaoId) : []
                }))
            };

            return await finalizarVenda(payloadLimpo, idempotencyKey);
        },
    });
};