import { useMutation } from "@tanstack/react-query";
import { finalizarVenda } from "../services/apiVendas";
import { type VendaPayloadDTO } from "../types/venda";

export const useFinalizarVenda = () => {
    return useMutation({
        mutationFn: async (payload: VendaPayloadDTO) => {
            const idempotencyKey = crypto.randomUUID();
            return await finalizarVenda(payload, idempotencyKey);
        },
    });
};