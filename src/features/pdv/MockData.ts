// src/features/pdv/mockData.ts
import type { ProdutoDTO, ItemCarrinho } from "@/types/pdv";

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
  imagem: string; 
}

export interface Carrinho {
  id: string; 
  produtoNome: string;
  adicionais: string[];
  precoUnitario: number;
  quantidade: number;
}

// 2. A lista de categorias
export const categoriasMock = [
  "Todos",
  "Casquinhas",
  "Cascão",
  "Açaí",
  "Milkshakes",
  "Sundae",
  "Flurry"
];

// 3. O nosso "Banco de Dados" temporário
export const produtosMock: ProdutoDTO[] = [
  { id: 1, nome: "Casquinha Mista", preco: 6.00, categoriaId: 1, ativo: true, imagemUrl: "bg-cyan-400" },
  { id: 2, nome: "Cascão Trufado", preco: 7.50, categoriaId: 2, ativo: true, imagemUrl: "bg-red-400" },
  { id: 3, nome: "Açaí 300ml", preco: 9.50, categoriaId: 3, ativo: true, imagemUrl: "bg-purple-600" },
  { id: 4, nome: "Milkshake Morango", preco: 12.00, categoriaId: 4, ativo: true, imagemUrl: "bg-pink-400" },
  { id: 5, nome: "Sundae Chocolate", preco: 8.50, categoriaId: 5, ativo: true, imagemUrl: "bg-amber-700" },
  { id: 6, nome: "Flurry Ovomaltine", preco: 14.00, categoriaId: 6, ativo: true, imagemUrl: "bg-orange-300" },
];


export const carrinhoMock: Carrinho[] = [
  {
    id: "item-1",
    produtoNome: "Casquinha",
    adicionais: ["Misto", "Nutella"],
    precoUnitario: 6.00,
    quantidade: 1,
  },
  {
    id: "item-2",
    produtoNome: "Cascão",
    adicionais: ["Misto", "Kit Kat"],
    precoUnitario: 8.00,
    quantidade: 1,
  }
];