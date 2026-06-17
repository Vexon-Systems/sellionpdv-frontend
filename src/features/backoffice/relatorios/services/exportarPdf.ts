import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import type { DreResponse, VendaResumo, RelatorioCaixa } from "../types/relatorios";

// --- Paleta RGB (segura para jsPDF) ---
const AZUL     = [30,  58, 138] as [number, number, number];
const BRANCO   = [255, 255, 255] as [number, number, number];
const VERDE    = [16,  185, 129] as [number, number, number];
const VERDE_BG = [209, 250, 229] as [number, number, number];
const VERDE_TXT= [4,   120,  87] as [number, number, number];
const VERM     = [239,  68,  68] as [number, number, number];
const VERM_BG  = [254, 226, 226] as [number, number, number];
const LANJ     = [249, 115,  22] as [number, number, number];
const LANJ_BG  = [255, 237, 213] as [number, number, number];
const AZUL_BG  = [219, 234, 254] as [number, number, number];
const CINZA_BG = [243, 244, 246] as [number, number, number];
const CINZA_ALT= [249, 250, 251] as [number, number, number];
const CINZA_BD = [229, 231, 235] as [number, number, number];
const CINZA_TXT= [107, 114, 128] as [number, number, number];
const ESCURO   = [17,   24,  39] as [number, number, number];

function R(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function dtHr(iso: string | null): string {
    if (!iso) return "—";
    return format(new Date(iso), "dd/MM/yy HH:mm");
}

function cabecalho(doc: jsPDF, titulo: string, subtitulo: string): void {
    const w = doc.internal.pageSize.getWidth();

    doc.setFillColor(...AZUL);
    doc.rect(0, 0, w, 28, "F");

    doc.setTextColor(...BRANCO);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("SellionPDV", 14, 11);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(titulo, 14, 20);

    doc.setFontSize(8);
    doc.setTextColor(180, 200, 240);
    doc.text(subtitulo, w - 14, 20, { align: "right" });

    const ts = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    doc.setFontSize(7);
    doc.setTextColor(150, 170, 210);
    doc.text(`Gerado em ${ts}`, w - 14, 25, { align: "right" });
}

function rodape(doc: jsPDF): void {
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    const total = (doc.internal as any).getNumberOfPages() as number;

    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setDrawColor(...CINZA_BD);
        doc.setLineWidth(0.3);
        doc.line(14, h - 12, w - 14, h - 12);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...CINZA_TXT);
        doc.text("SellionPDV — Gestão de Restaurantes", 14, h - 7);
        doc.text(`Página ${i} de ${total}`, w - 14, h - 7, { align: "right" });
    }
}

// ============================================================
//  DRE
// ============================================================
export async function exportarDrePdf(data: DreResponse, periodo: string): Promise<void> {
    try {
        const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
        const w = doc.internal.pageSize.getWidth();

        cabecalho(doc, "Demonstração de Resultado (DRE)", periodo);

        const totalDeducoes = data.deducoes.taxasMaquininhas + data.deducoes.totalCancelamentos;

        // KPI boxes
        const KY = 34;
        const KH = 22;
        const GAP = 4;
        const KW = (w - 28 - GAP * 3) / 4;

        const kpis = [
            { label: "RECEITA BRUTA",  valor: R(data.receitaBruta),                          cor: VERDE,   bg: VERDE_BG,  textCor: ESCURO  },
            { label: "DEDUÇÕES",       valor: `-${R(totalDeducoes)}`,                         cor: VERM,    bg: VERM_BG,   textCor: ESCURO  },
            { label: "CUSTOS (CMV)",   valor: `-${R(data.custos.custoMercadoriaVendida)}`,    cor: LANJ,    bg: LANJ_BG,   textCor: ESCURO  },
            { label: "LUCRO BRUTO",    valor: R(data.lucroBrutoEstimado),                     cor: BRANCO,  bg: AZUL,      textCor: BRANCO  },
        ];

        kpis.forEach((k, i) => {
            const x = 14 + i * (KW + GAP);
            doc.setFillColor(...k.bg);
            doc.roundedRect(x, KY, KW, KH, 2, 2, "F");
            doc.setFillColor(...k.cor);
            doc.rect(x, KY, 2, KH, "F");

            doc.setFontSize(6.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...(i === 3 ? [180, 200, 240] as [number,number,number] : CINZA_TXT));
            doc.text(k.label, x + 5, KY + 7);

            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...k.textCor);
            doc.text(k.valor, x + 5, KY + 17);
        });

        // Título da seção
        const TY = KY + KH + 9;
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...ESCURO);
        doc.text("Estrutura DRE", 14, TY - 2);

        // Tabela DRE
        const rows: any[][] = [
            [
                { content: "1. Receita Bruta de Vendas",        styles: { fontStyle: "bold", textColor: ESCURO } },
                { content: R(data.receitaBruta),                styles: { fontStyle: "bold", halign: "right", textColor: ESCURO } },
            ],
            [
                { content: "2. Deduções da Receita Bruta",      styles: { fontStyle: "bold", textColor: VERM, fillColor: VERM_BG } },
                { content: `-${R(totalDeducoes)}`,              styles: { fontStyle: "bold", halign: "right", textColor: VERM, fillColor: VERM_BG } },
            ],
            [
                { content: "    (-) Taxas de Maquininhas",      styles: { fontSize: 8, textColor: VERM, fillColor: [255, 242, 242] } },
                { content: `-${R(data.deducoes.taxasMaquininhas)}`, styles: { fontSize: 8, halign: "right", textColor: VERM, fillColor: [255, 242, 242] } },
            ],
            [
                { content: "    (-) Vendas Canceladas (Estornos)", styles: { fontSize: 8, textColor: VERM, fillColor: [255, 242, 242] } },
                { content: `-${R(data.deducoes.totalCancelamentos)}`, styles: { fontSize: 8, halign: "right", textColor: VERM, fillColor: [255, 242, 242] } },
            ],
            [
                { content: "3. Receita Líquida de Vendas",      styles: { fontStyle: "bold", textColor: AZUL, fillColor: AZUL_BG } },
                { content: R(data.receitaLiquida),              styles: { fontStyle: "bold", halign: "right", textColor: AZUL, fillColor: AZUL_BG } },
            ],
            [
                { content: "4. Custos Operacionais",            styles: { fontStyle: "bold", textColor: LANJ, fillColor: LANJ_BG } },
                { content: `-${R(data.custos.custoMercadoriaVendida)}`, styles: { fontStyle: "bold", halign: "right", textColor: LANJ, fillColor: LANJ_BG } },
            ],
            [
                { content: "    (-) Custo da Mercadoria Vendida (CMV)", styles: { fontSize: 8, textColor: LANJ, fillColor: [255, 247, 237] } },
                { content: `-${R(data.custos.custoMercadoriaVendida)}`, styles: { fontSize: 8, halign: "right", textColor: LANJ, fillColor: [255, 247, 237] } },
            ],
            [
                { content: "5. Lucro Bruto Operacional",        styles: { fontStyle: "bold", fontSize: 11, textColor: ESCURO, fillColor: CINZA_BG } },
                { content: R(data.lucroBrutoEstimado),          styles: { fontStyle: "bold", fontSize: 11, halign: "right", textColor: ESCURO, fillColor: CINZA_BG } },
            ],
            [
                { content: "Margem Bruta (%)",                  styles: { fontSize: 8, textColor: CINZA_TXT } },
                { content: `${data.margemBrutaPercentual}%`,    styles: { fontSize: 8, fontStyle: "bold", halign: "right", textColor: VERDE_TXT } },
            ],
        ];

        autoTable(doc, {
            startY: TY,
            body: rows,
            theme: "plain",
            styles: { fontSize: 9, cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 }, lineColor: CINZA_BD, lineWidth: 0.2 },
            columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 48 } },
            margin: { left: 14, right: 14 },
        });

        rodape(doc);
        doc.save("dre-gerencial.pdf");
    } catch (err) {
        console.error("[exportarDrePdf]", err);
        toast.error("Erro ao gerar o PDF do DRE.");
    }
}

// ============================================================
//  VENDAS
// ============================================================
export async function exportarVendasPdf(vendas: VendaResumo[], statusFiltro: string): Promise<void> {
    try {
        const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });

        const filtroLabel =
            statusFiltro === "TODAS"     ? "Todas as Vendas" :
            statusFiltro === "CONCLUIDA" ? "Apenas Concluídas" : "Apenas Canceladas";

        cabecalho(doc, "Histórico de Vendas", filtroLabel);

        const totalLiquido = vendas
            .filter(v => v.status === "CONCLUIDA")
            .reduce((acc, v) => acc + v.valorTotal, 0);
        const nConcluidas = vendas.filter(v => v.status === "CONCLUIDA").length;
        const nCanceladas = vendas.filter(v => v.status === "CANCELADA").length;

        const SY = 33;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...CINZA_TXT);
        doc.text(
            `${vendas.length} registro(s)  ·  ${nConcluidas} concluída(s)  ·  ${nCanceladas} cancelada(s)  ·  Total líquido: ${R(totalLiquido)}`,
            14, SY,
        );

        const rows: any[][] = vendas.map(v => [
            { content: `#${v.vendaId}`,                          styles: { textColor: CINZA_TXT } },
            { content: dtHr(v.dataVenda) },
            { content: v.nomeOperador },
            { content: v.formaPagamento },
            {
                content: v.status,
                styles: {
                    fontStyle: "bold", halign: "center",
                    textColor: v.status === "CONCLUIDA" ? VERDE_TXT : VERM,
                    fillColor: v.status === "CONCLUIDA" ? VERDE_BG  : VERM_BG,
                },
            },
            {
                content: R(v.valorTotal),
                styles: {
                    halign: "right", fontStyle: "bold",
                    textColor: v.status === "CANCELADA" ? [156, 163, 175] as [number,number,number] : ESCURO,
                },
            },
        ]);

        autoTable(doc, {
            startY: SY + 5,
            head: [["ID", "Data e Hora", "Operador", "Pagamento", "Status", "Valor"]],
            body: rows,
            theme: "grid",
            headStyles: { fillColor: AZUL, textColor: BRANCO, fontStyle: "bold", fontSize: 8 },
            styles: { fontSize: 8, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 } },
            alternateRowStyles: { fillColor: CINZA_ALT },
            columnStyles: {
                0: { cellWidth: 18 },
                1: { cellWidth: 36 },
                2: { cellWidth: "auto" },
                3: { cellWidth: 30 },
                4: { cellWidth: 32 },
                5: { cellWidth: 42, halign: "right" },
            },
            margin: { left: 14, right: 14 },
        });

        rodape(doc);
        doc.save("historico-de-vendas.pdf");
    } catch (err) {
        console.error("[exportarVendasPdf]", err);
        toast.error("Erro ao gerar o PDF de Vendas.");
    }
}

// ============================================================
//  CAIXAS
// ============================================================
export async function exportarCaixasPdf(caixas: RelatorioCaixa[], periodo: string): Promise<void> {
    try {
        const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });

        cabecalho(doc, "Auditoria de Turnos (Caixas)", periodo);

        const nFuros = caixas.filter(c => c.furoCaixa !== 0).length;
        const SY = 33;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...CINZA_TXT);
        doc.text(`${caixas.length} turno(s) auditado(s)  ·  ${nFuros} com divergência detectada`, 14, SY);

        const rows: any[][] = caixas.map(c => {
            const furoCor: [number,number,number] = c.furoCaixa < 0 ? VERM : c.furoCaixa > 0 ? LANJ : VERDE_TXT;
            const furoBg:  [number,number,number] = c.furoCaixa < 0 ? VERM_BG : c.furoCaixa > 0 ? LANJ_BG : VERDE_BG;

            return [
                { content: `#${c.caixaId}`,                styles: { textColor: CINZA_TXT } },
                {
                    content: c.status,
                    styles: {
                        fontStyle: "bold", halign: "center",
                        textColor: c.status === "ABERTO" ? VERDE_TXT : CINZA_TXT,
                        fillColor: c.status === "ABERTO" ? VERDE_BG  : CINZA_BG,
                    },
                },
                { content: dtHr(c.dataAbertura) },
                { content: dtHr(c.dataFechamento) },
                { content: c.operadorAbertura },
                { content: c.operadorFechamento ?? "—" },
                { content: R(c.totalVendas),        styles: { halign: "right" } },
                {
                    content: c.furoCaixa === 0 ? "OK" : R(c.furoCaixa),
                    styles: { fontStyle: "bold", halign: "right", textColor: furoCor, fillColor: furoBg },
                },
            ];
        });

        autoTable(doc, {
            startY: SY + 5,
            head: [["ID", "Status", "Abertura", "Fechamento", "Op. Abertura", "Op. Fechamento", "Entradas (R$)", "Diferença/Furo"]],
            body: rows,
            theme: "grid",
            headStyles: { fillColor: AZUL, textColor: BRANCO, fontStyle: "bold", fontSize: 7.5 },
            styles: { fontSize: 7.5, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 } },
            alternateRowStyles: { fillColor: CINZA_ALT },
            columnStyles: {
                0: { cellWidth: 16 },
                1: { cellWidth: 22 },
                2: { cellWidth: 32 },
                3: { cellWidth: 32 },
                4: { cellWidth: "auto" },
                5: { cellWidth: "auto" },
                6: { cellWidth: 36, halign: "right" },
                7: { cellWidth: 36, halign: "right" },
            },
            margin: { left: 14, right: 14 },
        });

        rodape(doc);
        doc.save("auditoria-de-caixas.pdf");
    } catch (err) {
        console.error("[exportarCaixasPdf]", err);
        toast.error("Erro ao gerar o PDF de Caixas.");
    }
}
