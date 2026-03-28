import { create } from "zustand";
import type { ItemCarrinho, ProdutoDTO } from "@/types/pdv";

interface CartState {
    itens: ItemCarrinho[];

    // Ações
    adicionarItem: (produto: ProdutoDTO) => void;
    removerItem: (id_temporario: string) => void;
    alterarQuantidade: (id_temporario: String, delta: number) => void;
    limparCarrinho: () => void;
}

export const useCartStore = create<CartState>((set) => ({
    // Carrinho se inicia vazio
    itens: [],

    adicionarItem: (produto) => set((state) => {
        const itemExistente = state.itens.find((item) => item.produto.id === produto.id);

        // Se produto existe, adiciona +1 na qtd
        if (itemExistente) {
        return {
            itens: state.itens.map((item) =>
            item.produto.id === produto.id
                ? { ...item, quantidade: item.quantidade + 1 }
                : item
            ),
        };
        }

        // Se não existe, cria um item novo com qtd 1
        const novoItem: ItemCarrinho = {
        id_temporario: crypto.randomUUID(), 
        produto,
        quantidade: 1,
        };

        return { itens: [...state.itens, novoItem] };
    }),

    removerItem: (id_temporario) => set((state) => ({
        // Mantém todos os itens que não tiverem este ID
        itens: state.itens.filter((item) => item.id_temporario !== id_temporario),
    })),

    alterarQuantidade: (id_temporario, delta) => set((state) => ({
        itens: state.itens.map((item) => {
        if (item.id_temporario === id_temporario) {
            const novaQuantidade = Math.max(1, item.quantidade + delta);
            return { ...item, quantidade: novaQuantidade };
        }
        return item;
        }),
    })),

    limparCarrinho: () => set({ itens: [] }),
}));