import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { toast } from "sonner";

export async function exportarElementoComoPdf(elemento: HTMLElement, nomeArquivo: string) {
    try {
        const canvas = await html2canvas(elemento, { scale: 2, backgroundColor: "#ffffff", useCORS: true, imageTimeout: 0 });
        const imagemPng = canvas.toDataURL("image/png");

        const larguraPaginaMm = 210;
        const margemMm = 8;
        const larguraUtilMm = larguraPaginaMm - margemMm * 2;
        const alturaImagemMm = (canvas.height * larguraUtilMm) / canvas.width;

        const doc = new jsPDF({ unit: "mm", format: "a4" });
        const alturaPaginaMm = doc.internal.pageSize.getHeight() - margemMm * 2;

        let alturaRestanteMm = alturaImagemMm;
        let offsetMm = 0;

        while (alturaRestanteMm > 0) {
            doc.addImage(
                imagemPng,
                "PNG",
                margemMm,
                margemMm - offsetMm,
                larguraUtilMm,
                alturaImagemMm
            );
            alturaRestanteMm -= alturaPaginaMm;
            offsetMm += alturaPaginaMm;
            if (alturaRestanteMm > 0) doc.addPage();
        }

        doc.save(`${nomeArquivo}.pdf`);
    } catch (err) {
        console.error("[exportarPdf] Erro ao gerar PDF:", err);
        toast.error("Erro ao gerar o PDF. Tente novamente.");
    }
}
