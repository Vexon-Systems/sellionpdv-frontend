import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatarMoeda } from "@/lib/utils";
import type { ProdutoDTO } from "../../../types/pdv";

interface ProductGridProps {
  produtos: ProdutoDTO[];
  isLoading: boolean;
  isError: boolean;
  onCliqueProduto: (produto: ProdutoDTO) => void;
  /** Quantidade no carrinho por produto (produtoId → total). Ausente ou 0 = não renderizar badge. */
  contagemPorProduto?: Record<number, number>;
}

export const ProductGrid = memo(function ProductGrid({
  produtos,
  isLoading,
  isError,
  onCliqueProduto,
  contagemPorProduto,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 animate-pulse">Carregando catálogo...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>Erro ao conectar com o servidor.</p>
      </div>
    );
  }

  if (produtos.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-gray-400">
        Nenhum produto encontrado.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-6 my-6">
      {produtos.map((produto) => {
        const qtdeNoCarrinho = contagemPorProduto?.[produto.id] ?? 0;
        return (
        <Card
          key={produto.id}
          onClick={() => onCliqueProduto(produto)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onCliqueProduto(produto);
            }
          }}
          className="cursor-pointer shadow-md hover:shadow-xl hover:scale-105 transition-all border-gray-200 overflow-hidden p-0 flex flex-col"
        >
          <div className="h-35 w-full bg-slate-100 flex items-center justify-center relative overflow-hidden shrink-0">
            <span className="text-slate-400 text-sm font-medium absolute z-0 text-center px-2">
              Sem Imagem
            </span>

            {/* Imagem do produto */}
            {produto.imagemUrl && (
              <img
                src={produto.imagemUrl}
                alt={`Foto de ${produto.nome}`}
                loading="lazy"
                className="w-full h-full object-cover relative z-10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}

            {/* Badge de quantidade no carrinho — só aparece se o produto já foi adicionado */}
            {qtdeNoCarrinho > 0 && (
              <div
                className="absolute top-2 right-2 z-20 min-w-[28px] h-7 px-2 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center shadow-md"
                aria-label={`${qtdeNoCarrinho} unidades no carrinho`}
              >
                {qtdeNoCarrinho}x
              </div>
            )}
          </div>

          <CardContent className="px-4 pb-4 flex flex-col justify-between flex-1">
            <h3
              className="font-medium text-gray-800 line-clamp-1 leading-tight"
              title={produto.nome}
            >
              {produto.nome}
            </h3>
            <p className="font-bold text-primary mt-2 text-base">
              {formatarMoeda(produto.precoBase)}
            </p>

          </CardContent>
        </Card>
        );
      })}
    </div>
  );
});