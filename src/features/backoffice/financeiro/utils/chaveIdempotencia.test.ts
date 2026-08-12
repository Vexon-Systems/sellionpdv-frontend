import { describe, expect, it, vi } from "vitest"
import { ChaveIdempotenciaCriacao } from "./chaveIdempotencia"

describe("ChaveIdempotenciaCriacao", () => {
    it("reutiliza a chave no retry da mesma intenção e gera outra após concluir", () => {
        const randomUUID = vi.fn()
            .mockReturnValueOnce("0d2dce97-9b70-4b39-9251-790dad6e2755")
            .mockReturnValueOnce("11c1ca2e-83a9-4cc5-b0ed-4976430ed344")
        vi.stubGlobal("crypto", { randomUUID })
        const chave = new ChaveIdempotenciaCriacao()

        expect(chave.obter()).toBe("0d2dce97-9b70-4b39-9251-790dad6e2755")
        expect(chave.obter()).toBe("0d2dce97-9b70-4b39-9251-790dad6e2755")
        expect(randomUUID).toHaveBeenCalledTimes(1)

        chave.concluirIntento()

        expect(chave.obter()).toBe("11c1ca2e-83a9-4cc5-b0ed-4976430ed344")
        expect(randomUUID).toHaveBeenCalledTimes(2)
    })
})
