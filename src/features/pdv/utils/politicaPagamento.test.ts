import { describe, expect, it } from "vitest";
import {
    normalizarCamposPagamento,
    pagamentoProntoParaConfirmar,
} from "./politicaPagamento";

describe("SEL-SEC-004 — política de pagamento no frontend", () => {
    it.each(["DINHEIRO", "PIX"] as const)(
        "%s remove campos de cartão do payload",
        (formaPagamento) => {
            expect(normalizarCamposPagamento(formaPagamento, 99, "VISA")).toEqual({
                maquininhaId: null,
                bandeiraCartao: null,
            });
        },
    );

    it.each(["CREDITO", "DEBITO"] as const)(
        "%s preserva maquininha e bandeira no payload",
        (formaPagamento) => {
            expect(normalizarCamposPagamento(formaPagamento, 10, "MASTERCARD")).toEqual({
                maquininhaId: 10,
                bandeiraCartao: "MASTERCARD",
            });
        },
    );

    it("permite dinheiro e PIX sem dados de cartão", () => {
        expect(pagamentoProntoParaConfirmar("DINHEIRO", null, null)).toBe(true);
        expect(pagamentoProntoParaConfirmar("PIX", null, null)).toBe(true);
    });

    it("bloqueia cartão enquanto faltar maquininha ou bandeira", () => {
        expect(pagamentoProntoParaConfirmar("CREDITO", null, "VISA")).toBe(false);
        expect(pagamentoProntoParaConfirmar("CREDITO", 1, null)).toBe(false);
        expect(pagamentoProntoParaConfirmar("DEBITO", 1, "VISA")).toBe(true);
    });
});
