import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    criarFechamentoDTO,
    FechamentoCaixaModal,
} from "./FechamentoCaixaModal";

describe("SEL-SEC-007 — fechamento com numerário físico", () => {
    it("cria o payload somente com o dinheiro contado", () => {
        expect(criarFechamentoDTO(210)).toEqual({
            saldoFinalInformado: 210,
        });
    });

    it("não solicita PIX nem fechamento de lote no modal", () => {
        render(
            <FechamentoCaixaModal
                isOpen
                onClose={vi.fn()}
                onSave={vi.fn().mockResolvedValue(undefined)}
                isSalvando={false}
            />,
        );

        expect(screen.getByText("Dinheiro em Espécie (Total na Gaveta)")).toBeInTheDocument();
        expect(screen.queryByText(/PIX/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Maquininhas/i)).not.toBeInTheDocument();
        expect(screen.getAllByPlaceholderText("R$ 0,00")).toHaveLength(1);
    });
});
