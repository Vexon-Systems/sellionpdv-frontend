import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/store/useCartStore";
import { useFinalizarVenda } from "./useFinalizarVenda";
import { apiMaquininhas } from "@/features/backoffice/maquininhas/services/apiMaquininhas";
import { toast } from "sonner";
import { extrairMensagemErro } from "@/lib/utils";
import type { BandeiraCartao, FormaPagamento, VendaTurnoDTO } from "../types/venda";
import type { DadosSucesso } from "@/types/pdv";

interface UseCheckoutOptions {
    isOpen: boolean;
    subtotal: number;
    onSuccess: (dados: DadosSucesso) => void;
    onClose: () => void;
}

export function useCheckout({ isOpen, subtotal, onSuccess, onClose }: UseCheckoutOptions) {
    const { itens, limparCarrinho } = useCartStore();
    const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | null>(null);
    const [maquininhaId, setMaquininhaId] = useState<string | null>(null);
    const [bandeiraCartao, setBandeiraCartao] = useState<BandeiraCartao | null>(null);

    const { mutate, isPending } = useFinalizarVenda();

    const { data: maquininhas = [], isLoading: isLoadingMaquininhas } = useQuery({
        queryKey: ["lista-maquininhas"],
        queryFn: apiMaquininhas.listarTodas,
        enabled: isOpen,
    });

    const maquininhasAtivas = maquininhas.filter((m) => m.ativo);
    const exigeMaquininha = formaPagamento === "CREDITO" || formaPagamento === "DEBITO";

    function handleFormaPagamentoChange(forma: FormaPagamento | null) {
        setFormaPagamento(forma);
        if (forma !== "CREDITO" && forma !== "DEBITO") {
            setMaquininhaId(null);
            setBandeiraCartao(null);
        }
    }

    function resetEFechar() {
        setFormaPagamento(null);
        setMaquininhaId(null);
        setBandeiraCartao(null);
        onClose();
    }

    function handleConfirmar() {
        if (!formaPagamento) {
            toast.warning("Atenção", { description: "Por favor, selecione uma forma de pagamento." });
            return;
        }
        if (exigeMaquininha && !maquininhaId) {
            toast.warning("Atenção", { description: "Por favor, selecione qual maquininha foi utilizada." });
            return;
        }

        const payload = {
            itens,
            formaPagamento,
            maquininhaId: exigeMaquininha ? Number(maquininhaId) : null,
            bandeiraCartao: exigeMaquininha ? bandeiraCartao : null,
            descontoAplicado: 0,
        };

        mutate(payload, {
            onSuccess: (respostaDaApi: VendaTurnoDTO) => {
                const dadosCongelados: DadosSucesso = {
                    id: respostaDaApi?.id,
                    itens: [...itens],
                    total: subtotal,
                };
                onSuccess(dadosCongelados);
                limparCarrinho();
                resetEFechar();
            },
            onError: (error) => {
                toast.error("Erro na Venda", {
                    description: extrairMensagemErro(error, "Não foi possível processar. Tente novamente."),
                });
            },
        });
    }

    return {
        formaPagamento,
        setFormaPagamento: handleFormaPagamentoChange,
        maquininhaId,
        setMaquininhaId,
        bandeiraCartao,
        setBandeiraCartao,
        maquininhasAtivas,
        isLoadingMaquininhas,
        exigeMaquininha,
        isPending,
        handleConfirmar,
        handleClose: resetEFechar,
    };
}
