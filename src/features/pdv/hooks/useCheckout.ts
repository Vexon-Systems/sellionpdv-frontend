import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/store/useCartStore";
import { useFinalizarVenda } from "./useFinalizarVenda";
import { apiMaquininhas } from "@/features/backoffice/maquininhas/services/apiMaquininhas";
import { toast } from "sonner";
import type { BandeiraCartao, FormaPagamento } from "../types/venda";
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

    useEffect(() => {
        if (!exigeMaquininha) setMaquininhaId(null);
    }, [exigeMaquininha]);

    useEffect(() => {
        if (!isOpen) {
            setFormaPagamento(null);
            setMaquininhaId(null);
            setBandeiraCartao(null);
        }
    }, [isOpen]);

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
            onSuccess: (respostaDaApi: any) => {
                const dadosCongelados: DadosSucesso = {
                    id: respostaDaApi?.id,
                    itens: [...itens],
                    total: subtotal,
                };
                onSuccess(dadosCongelados);
                limparCarrinho();
                onClose();
            },
            onError: (error: any) => {
                const mensagem =
                    error.response?.data?.detail || "Não foi possível processar. Tente novamente.";
                toast.error("Erro na Venda", { description: mensagem });
            },
        });
    }

    return {
        formaPagamento,
        setFormaPagamento,
        maquininhaId,
        setMaquininhaId,
        bandeiraCartao,
        setBandeiraCartao,
        maquininhasAtivas,
        isLoadingMaquininhas,
        exigeMaquininha,
        isPending,
        handleConfirmar,
    };
}
