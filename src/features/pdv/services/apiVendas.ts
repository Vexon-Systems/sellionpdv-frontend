import { api } from "@/lib/api";
import { type VendaPayloadDTO } from "../types/venda";

export const finalizarVendaMock = async (
    payload: VendaPayloadDTO,
    idempotencyKey: string
) => {
    console.log("Enviando Header Idempotency-Key:", idempotencyKey);
    console.log("Payload enviado para a rede:", payload);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ id: 12345, status: "CONCLUIDA" });
        }, 1500);
    });
};