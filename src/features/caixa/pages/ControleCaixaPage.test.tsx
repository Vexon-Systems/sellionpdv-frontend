import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ResumoCaixaAberto } from "./ControleCaixaPage";

const kpis = {
    fundoTroco: 100,
    vendasDinheiro: 200,
    saldoFisico: 300,
};

afterEach(cleanup);

describe("SEL-SEC-008 — resumo do caixa por visibilidade", () => {
    it("operador não recebe KPIs monetários na interface", () => {
        render(<ResumoCaixaAberto visaoAdministrativa={false} kpis={kpis} />);

        expect(screen.getByText("Conferência cega ativa")).toBeInTheDocument();
        expect(screen.queryByText("Saldo Físico Estimado")).not.toBeInTheDocument();
        expect(screen.queryByText("Fundo de Troco")).not.toBeInTheDocument();
        expect(screen.queryByText("Vendas em Dinheiro")).not.toBeInTheDocument();
        expect(screen.queryByText("R$ 300,00")).not.toBeInTheDocument();
    });

    it("administrador mantém a visão de supervisão aprovada", () => {
        render(<ResumoCaixaAberto visaoAdministrativa kpis={kpis} />);

        expect(screen.getByText("Saldo Físico Estimado")).toBeInTheDocument();
        expect(screen.getByText("Fundo de Troco")).toBeInTheDocument();
        expect(screen.getByText("Vendas em Dinheiro")).toBeInTheDocument();
        expect(screen.queryByText("Conferência cega ativa")).not.toBeInTheDocument();
    });
});
