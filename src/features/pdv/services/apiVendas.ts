import { api } from "@/lib/api";
import { type VendaPayloadDTO, type VendaTurnoDTO } from "../types/venda";

export const finalizarVenda = async (
    payload: VendaPayloadDTO,
    idempotencyKey: string
): Promise<VendaTurnoDTO> => {
    const response = await api.post<VendaTurnoDTO>("/api/vendas", payload, {
        headers: {
            'Idempotency-Key': idempotencyKey
        }
    });

    return response.data;
};

export const apiVendas = {

  listarVendasTurno: async (): Promise<VendaTurnoDTO[]> => {
    const response = await api.get<VendaTurnoDTO[]>("/api/vendas");
    return response.data;
  }
};