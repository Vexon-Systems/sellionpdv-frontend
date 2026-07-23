import { memo } from "react";
import { Minus, Pencil, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatarMoeda } from "@/lib/utils";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import type { ItemCarrinho } from "../../../types/pdv";

interface CartSidebarProps {
  itens: ItemCarrinho[];
  subtotal: number;
  onAlterarQuantidade: (idCarrinho: string, delta: number) => void;
  onRemoverItem: (idCarrinho: string) => void;
  onEditarItem: (idCarrinho: string) => void;
  onConfirmarVenda: () => void;
}

export function CartSidebar({ itens, subtotal, onAlterarQuantidade, onRemoverItem, onEditarItem, onConfirmarVenda }: CartSidebarProps) {
  const hasItems = itens.length > 0;
  useKeyboardShortcut("F2", onConfirmarVenda, { enabled: hasItems });

  return (
    <aside className="flex h-[25rem] w-full shrink-0 flex-col border-t bg-surface-raised lg:h-full lg:w-[22rem] lg:border-l lg:border-t-0 xl:w-[24rem]" aria-label="Carrinho de compras">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground"><ShoppingCart size={18} aria-hidden="true" /> Carrinho</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">{itens.length} {itens.length === 1 ? "item" : "itens"}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-sunken/60 p-3">
        {hasItems ? <div className="space-y-2.5">{itens.map((item) => <CartItemCard key={item.idCarrinho} item={item} onAlterarQuantidade={onAlterarQuantidade} onRemover={onRemoverItem} onEditar={onEditarItem} />)}</div> : <EmptyCartMessage />}
      </div>
      <div className="border-t bg-surface-raised p-4 shadow-[0_-8px_18px_oklch(0.18_0.02_264_/_4%)]">
        <div className="mb-4 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="font-medium tabular-nums text-foreground">{formatarMoeda(subtotal)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Desconto</span><span className="font-medium tabular-nums text-foreground">{formatarMoeda(0)}</span></div>
          <div className="flex justify-between border-t pt-3 text-lg font-bold text-foreground"><span>Total</span><span className="tabular-nums text-primary">{formatarMoeda(subtotal)}</span></div>
        </div>
        <Button disabled={!hasItems} onClick={onConfirmarVenda} size="lg" className="h-12 w-full justify-between px-4 text-base">
          <span>Cobrar {formatarMoeda(subtotal)}</span>
          <kbd className="hidden rounded border border-white/25 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold sm:inline-flex">F2</kbd>
        </Button>
      </div>
    </aside>
  );
}

interface CartItemCardProps { item: ItemCarrinho; onAlterarQuantidade: (idCarrinho: string, delta: number) => void; onRemover: (idCarrinho: string) => void; onEditar: (idCarrinho: string) => void; }

const CartItemCard = memo(function CartItemCard({ item, onAlterarQuantidade, onRemover, onEditar }: CartItemCardProps) {
  const temModificadores = (item.modificadores?.length ?? 0) > 0;
  return (
    <article className="group rounded-xl border bg-surface-raised p-3 shadow-sm transition-shadow hover:shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0"><h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">{item.produto.nome}</h3>{temModificadores && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.modificadores.map((modifier) => modifier.nome).join(" · ")}</p>}</div>
        <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">{formatarMoeda(item.valorUnitarioTotal)}</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex h-8 items-center rounded-lg border bg-surface-sunken">
          <Button onClick={() => onAlterarQuantidade(item.idCarrinho, -1)} variant="ghost" size="icon-sm" className="h-full rounded-r-none" aria-label={`Diminuir quantidade de ${item.produto.nome}`}><Minus size={14} /></Button>
          <span className="w-8 text-center text-xs font-semibold tabular-nums text-foreground">{item.quantidade}</span>
          <Button onClick={() => onAlterarQuantidade(item.idCarrinho, 1)} variant="ghost" size="icon-sm" className="h-full rounded-l-none" aria-label={`Aumentar quantidade de ${item.produto.nome}`}><Plus size={14} /></Button>
        </div>
        <div className="flex items-center gap-1">
          {temModificadores && <Button onClick={() => onEditar(item.idCarrinho)} variant="ghost" size="icon-sm" aria-label={`Editar ${item.produto.nome}`}><Pencil size={14} /></Button>}
          <Button onClick={() => onRemover(item.idCarrinho)} variant="ghost" size="icon-sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label={`Remover ${item.produto.nome}`}><Trash2 size={14} /></Button>
        </div>
      </div>
    </article>
  );
});

function EmptyCartMessage() {
  return <div className="flex h-full flex-col items-center justify-center px-6 text-center"><div className="rounded-full bg-muted p-4 text-muted-foreground"><ShoppingCart size={28} aria-hidden="true" /></div><p className="mt-4 text-sm font-medium text-foreground">Seu carrinho está vazio</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Selecione um produto para iniciar a venda.</p></div>;
}
