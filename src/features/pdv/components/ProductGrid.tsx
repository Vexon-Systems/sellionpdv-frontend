import { memo, type ReactNode } from "react";
import { ImageOff, PackageOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatarMoeda } from "@/lib/utils";
import type { ProdutoDTO } from "../../../types/pdv";

interface ProductGridProps {
  produtos: ProdutoDTO[];
  isLoading: boolean;
  isError: boolean;
  onCliqueProduto: (produto: ProdutoDTO) => void;
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
      <div className="grid grid-cols-2 gap-3 py-5 sm:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6" aria-label="Carregando catálogo">
        {Array.from({ length: 12 }, (_, index) => <Skeleton key={index} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  if (isError) {
    return <CatalogState icon={<PackageOpen />} title="Não foi possível carregar o catálogo" description="Verifique sua conexão e tente novamente." />;
  }

  if (produtos.length === 0) {
    return <CatalogState icon={<PackageOpen />} title="Nenhum produto encontrado" description="Ajuste sua busca ou selecione outra categoria." />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 py-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {produtos.map((produto) => {
        const qtdeNoCarrinho = contagemPorProduto?.[produto.id] ?? 0;
        return (
          <Card
            key={produto.id}
            onClick={() => onCliqueProduto(produto)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onCliqueProduto(produto);
              }
            }}
            className="min-h-0 cursor-pointer gap-0 overflow-hidden p-0 shadow-none transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/40"
            aria-label={`${produto.nome}, ${formatarMoeda(produto.precoBase)}${qtdeNoCarrinho ? `, ${qtdeNoCarrinho} no carrinho` : ""}`}
          >
            <div className="relative flex h-28 w-full shrink-0 items-center justify-center overflow-hidden bg-surface-sunken sm:h-32">
              <span className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground">
                <ImageOff size={18} aria-hidden="true" />
                Sem imagem
              </span>
              {produto.imagemUrl && (
                <img src={produto.imagemUrl} alt="" loading="lazy" className="relative z-10 size-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
              )}
              {qtdeNoCarrinho > 0 && (
                <span className="absolute right-2 top-2 z-20 inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground shadow-sm" aria-hidden="true">
                  {qtdeNoCarrinho}x
                </span>
              )}
            </div>
            <CardContent className="flex min-h-17 flex-1 flex-col justify-between px-3 py-2.5">
              <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground" title={produto.nome}>{produto.nome}</h3>
              <p className="mt-2 text-base font-bold tabular-nums text-primary">{formatarMoeda(produto.precoBase)}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

function CatalogState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-surface-raised p-6 text-center">
      <div className="rounded-full bg-muted p-3 text-muted-foreground">{icon}</div>
      <div><p className="font-medium text-foreground">{title}</p><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>
    </div>
  );
}
