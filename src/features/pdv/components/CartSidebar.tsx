// /features/pdv/components/CartSidebar.tsx
import { ShoppingCart, Minus, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatarMoeda } from "@/lib/utils";
import type { ItemCarrinho } from "../../../types/pdv";

interface CartSidebarProps {
  itens: ItemCarrinho[];
  subtotal: number;
  onAlterarQuantidade: (idCarrinho: string, delta: number) => void;
  onRemoverItem: (idCarrinho: string) => void;
  onConfirmarVenda: () => void;
}

export function CartSidebar({
  itens,
  subtotal,
  onAlterarQuantidade,
  onRemoverItem,
  onConfirmarVenda,
}: CartSidebarProps) {
  const hasItems = itens.length > 0;

  return (
    <aside
      className={`
        bg-white flex flex-col border-gray-200 shadow-md shrink-0
        transition-all duration-500 ease-in-out overflow-hidden
        ${
          hasItems
            ? "w-full lg:w-[320px] xl:w-[400px] h-[45vh] lg:h-full opacity-100 border-t-2 lg:border-t-0 lg:border-l-2"
            : "w-full lg:w-0 h-0 opacity-0 border-0"
        }
      `}
    >
      <div className="px-4 py-2 border-b border-gray-200 bg-white flex gap-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          Carrinho
        </h2>
      </div>

      {/* Lista de itens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {hasItems ? (
          itens.map((item) => (
            <CartItemCard
              key={item.idCarrinho}
              item={item}
              onAlterarQuantidade={onAlterarQuantidade}
              onRemover={onRemoverItem}
            />
          ))
        ) : (
          <EmptyCartMessage />
        )}
      </div>

      {/* Resumo e pagamento */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="space-y-1 mb-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium">{formatarMoeda(subtotal)}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Desconto</span>
            <span className="font-medium">{formatarMoeda(0)}</span>
          </div>
          <div className="flex justify-between text-gray-900 text-lg font-bold pt-2 mt-2 border-t border-gray-100">
            <span>Total</span>
            <span>{formatarMoeda(subtotal)}</span>
          </div>
        </div>

        <Button
          disabled={!hasItems}
          onClick={onConfirmarVenda}
          className="cursor-pointer w-full h-12 text-base font-bold bg-linear-to-br from-blue-950 to-blue-900 hover:-translate-y-0.5 hover:brightness-130 transition-all duration-300 text-white shadow-md"
        >
          Confirmar Venda
        </Button>
      </div>
    </aside>
  );
}

// --- Sub-componentes internos (privados ao CartSidebar) ---

interface CartItemCardProps {
  item: ItemCarrinho;
  onAlterarQuantidade: (idCarrinho: string, delta: number) => void;
  onRemover: (idCarrinho: string) => void;
}

function CartItemCard({ item, onAlterarQuantidade, onRemover }: CartItemCardProps) {
  return (
    <div className="group flex flex-col gap-2 p-3 bg-white border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-colors">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-800 text-sm leading-tight">
            {item.produto.nome}
          </h4>

          {item.modificadores && item.modificadores.length > 0 && (
            <ul className="mt-1 flex flex-col gap-0.5">
              {item.modificadores.map((mod, i) => (
                <li key={i} className="text-[11px] text-slate-500 flex items-center">
                  <span className="text-slate-300 mr-1.5">-</span>
                  {mod.nome}
                </li>
              ))}
            </ul>
          )}
        </div>

        <span className="font-bold text-slate-900 text-sm whitespace-nowrap">
          {formatarMoeda(item.valorUnitarioTotal)}
        </span>
      </div>

      <div className="flex justify-between items-center mt-1">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md h-8">
          <Button
            onClick={() => onAlterarQuantidade(item.idCarrinho, -1)}
            variant="ghost"
            size="icon"
            className="h-full w-8 cursor-pointer rounded-none rounded-l-md text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            aria-label="Diminuir quantidade"
          >
            <Minus size={14} />
          </Button>

          <span className="w-8 font-semibold text-xs text-center text-slate-800">
            {item.quantidade}
          </span>

          <Button
            onClick={() => onAlterarQuantidade(item.idCarrinho, 1)}
            variant="ghost"
            size="icon"
            className="h-full w-8 cursor-pointer rounded-none rounded-r-md text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            aria-label="Aumentar quantidade"
          >
            <Plus size={14} />
          </Button>
        </div>

        <Button
          onClick={() => onRemover(item.idCarrinho)}
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-600 bg-red-50/50 opacity-80 group-hover:opacity-100 transition-opacity"
          title="Remover Item"
        >
          <Trash size={14} />
        </Button>
      </div>
    </div>
  );
}

function EmptyCartMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 mt-12 space-y-3">
      <div className="bg-slate-100 p-4 rounded-full">
        <ShoppingCart size={32} className="text-slate-300" />
      </div>
      <p className="text-sm font-medium text-slate-500">Seu carrinho está vazio</p>
      <p className="text-xs text-slate-400">Adicione produtos para iniciar a venda</p>
    </div>
  );
}