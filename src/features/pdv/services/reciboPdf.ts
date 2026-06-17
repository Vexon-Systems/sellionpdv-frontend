import { jsPDF } from "jspdf";
import type { ItemCarrinho } from "@/types/pdv";
import { formatarMoeda } from "@/lib/utils";

interface DadosRecibo {
    id: number;
    itens: ItemCarrinho[];
    total: number;
}

const LARGURA_MM = 80;
const MARGEM_MM = 4;

export function gerarReciboPdf(dadosVenda: DadosRecibo) {
    const doc = new jsPDF({
        unit: "mm",
        format: [LARGURA_MM, 200],
    });

    const larguraUtil = LARGURA_MM - MARGEM_MM * 2;
    let y = 8;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Sellion PDV", LARGURA_MM / 2, y, { align: "center" });
    y += 5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Pedido #${dadosVenda.id}`, LARGURA_MM / 2, y, { align: "center" });
    y += 4;
    doc.text(new Date().toLocaleString("pt-BR"), LARGURA_MM / 2, y, { align: "center" });
    y += 4;

    doc.line(MARGEM_MM, y, LARGURA_MM - MARGEM_MM, y);
    y += 4;

    dadosVenda.itens.forEach((item) => {
        doc.setFont("helvetica", "bold");
        const linhaItem = `${item.quantidade}x ${item.produto.nome}`;
        const linhasQuebradas = doc.splitTextToSize(linhaItem, larguraUtil - 16);
        doc.text(linhasQuebradas, MARGEM_MM, y);
        doc.text(formatarMoeda(item.subtotal), LARGURA_MM - MARGEM_MM, y, { align: "right" });
        y += 4 * linhasQuebradas.length;

        item.modificadores?.forEach((mod) => {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.text(`  + ${mod.nome}`, MARGEM_MM, y);
            y += 3.5;
            doc.setFontSize(9);
        });
    });

    y += 1;
    doc.line(MARGEM_MM, y, LARGURA_MM - MARGEM_MM, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Total", MARGEM_MM, y);
    doc.text(formatarMoeda(dadosVenda.total), LARGURA_MM - MARGEM_MM, y, { align: "right" });
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Obrigado pela preferência!", LARGURA_MM / 2, y, { align: "center" });

    doc.save(`recibo-pedido-${dadosVenda.id}.pdf`);
}
