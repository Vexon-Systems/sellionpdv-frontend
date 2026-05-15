import { api } from "@/lib/api";
import { type VendaPayloadDTO } from "../types/venda";

export const finalizarVenda = async (
    payload: VendaPayloadDTO,
    idempotencyKey: string
) => {
    const response = await api.post("/api/vendas", payload, {
        headers: {
            'Idempotency-Key': idempotencyKey
        }
    });
    
    return response.data; 
};

export const apiVendas = {

  listarVendasTurno: async (): Promise<any[]> => {
    const response = await api.get("/api/vendas");
    return response.data;
  }
};