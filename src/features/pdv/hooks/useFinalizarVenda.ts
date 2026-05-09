import { useMutation } from "@tanstack/react-query";
import { finalizarVendaMock } from "../services/apiVendas";
import { type VendaPayloadDTO } from "../types/venda";

export const useFinalizarVenda = () => {
    return useMutation({
        mutationFn: async (payload: VendaPayloadDTO) => {
            const idempotencyKey = crypto.randomUUID();

            return await finalizarVendaMock(payload, idempotencyKey);
        },

        onSuccess: (data) => {
            console.log("Venda finalizada com ID: ", data.id);
        },

        onError: (error) => {
            console.log("Erro ao finalizar venda: ", error);
        }
    });
};