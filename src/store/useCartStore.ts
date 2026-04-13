import { create } from "zustand";
import type { ItemCarrinho, ProdutoDTO, ModificadorSelecionado } from "@/types/pdv";

interface CartStore {
    itens: ItemCarrinho[];
    adicionarItem: (produto: ProdutoDTO, modificadores?: ModificadorSelecionado[]) => void;
    removerItem: (id_temporario: string) => void;
    alterarQuantidade: (id_temporario: string, delta: number) => void;
    limparCarrinho: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
    itens: [],

    adicionarItem: (produto, modificadores = []) => set((state) => {
        // Calcula o preço total deste item específico
        const somaModificadores = modificadores.reduce((acc, mod) => acc + mod.precoAdicional, 0);
        const valorUnitarioTotal = produto.precoBase + somaModificadores;

        // Lógica de Agrupamento: Só aumenta a QTD se for o MESMO produto com os mesmos modificadores
        const itemExistente = state.itens.find((item) => {
            if (item.produto.id !== produto.id) return false;
            if (item.modificadores.length !== modificadores.length) return false;
            
            // Compara se todos os IDs de modificadores são iguais
            const idsExistentes = item.modificadores.map(m => m.opcaoId).sort();
            const idsNovos = modificadores.map(m => m.opcaoId).sort();
            return JSON.stringify(idsExistentes) === JSON.stringify(idsNovos);
        });

        if (itemExistente) {
            return {
                itens: state.itens.map((item) =>
                item.idCarrinho === itemExistente.idCarrinho
                    ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * item.valorUnitarioTotal }
                    : item
                ),
            };
        }

        // Se é um combo novo, cria nova linha
        const novoItem: ItemCarrinho = {
            idCarrinho: crypto.randomUUID(),
            produto,
            quantidade: 1,
            modificadores,
            valorUnitarioTotal,
            subtotal: valorUnitarioTotal,
        };

        return { itens: [...state.itens, novoItem] };
    }),

    removerItem: (id_temporario) => set((state) => ({
        itens: state.itens.filter((item) => item.idCarrinho !== id_temporario),
    })),

    alterarQuantidade: (id_temporario, delta) => set((state) => ({
        itens: state.itens.map((item) => {
        if (item.idCarrinho === id_temporario) {
            const novaQuantidade = Math.max(1, item.quantidade + delta);
            return { ...item, quantidade: novaQuantidade, subtotal: novaQuantidade * item.valorUnitarioTotal };
        }
        return item;
        }),
    })),

    limparCarrinho: () => set({ itens: [] }),
}));