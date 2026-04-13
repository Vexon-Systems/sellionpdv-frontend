import { useState, useEffect } from "react";
import type { ProdutoDTO } from "@/types/pdv";
import { useCartStore } from "@/store/useCartStore";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ProdutoModalProps {
    isOpen: boolean;
    onClose: () => void;
    produto: ProdutoDTO | null;
}

export function ProdutoModal({isOpen, onClose, produto}: ProdutoModalProps){
    const [saborSelecionado, setSaborSelecionado] = useState<string>("Misto");
    const [recheioSelecionado, setRecheioSelecionado] = useState<string>("Nada");

    const adicionarItem = useCartStore((state) => state.adicionarItem);

    useEffect(() => {
        if(isOpen) {
            setSaborSelecionado("Misto");
            setRecheioSelecionado("Nada");
        }
    }, [isOpen, produto]);

    if (!produto) return null;

    const handleSalvar = () => {
        const produtoComAdicionais = {
        ...produto,
        nome: `${produto.nome} (${saborSelecionado} + ${recheioSelecionado})`
        };

        adicionarItem(produtoComAdicionais);
        onClose();
    };

    return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-slate-50 border-none">
        
        <div className="bg-primary text-white p-4 flex justify-between items-center">
          <DialogTitle className="text-xl font-bold m-0">{produto.nome}</DialogTitle>
          
        </div>

        <div className="p-6 space-y-6">
          
          <div className="space-y-3">
            <h4 className="font-bold text-lg text-gray-800">Sabor</h4>
            <div className="flex flex-wrap gap-2">
              {["Chocolate", "Baunilha", "Misto"].map((sabor) => (
                <Button
                  key={sabor}
                  variant={saborSelecionado === sabor ? "default" : "outline"}
                  onClick={() => setSaborSelecionado(sabor)}
                  className="rounded-md"
                >
                  {sabor}
                </Button>
              ))}
            </div>
          </div>

          {/* Seção Recheio */}
          <div className="space-y-3">
            <h4 className="font-bold text-lg text-gray-800">Recheio</h4>
            <div className="flex flex-wrap gap-2">
              {["Nada", "Kit Kat", "Nutella"].map((recheio) => (
                <Button
                  key={recheio}
                  variant={recheioSelecionado === recheio ? "default" : "outline"}
                  onClick={() => setRecheioSelecionado(recheio)}
                  className="rounded-md"
                >
                  {recheio}
                </Button>
              ))}
            </div>
          </div>

        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="bg-gray-200 p-4 flex justify-between items-center mt-2">
          <span className="text-xl font-bold text-gray-900">
            {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose} className="bg-white">Cancelar</Button>
            <Button onClick={handleSalvar}>Salvar</Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>   
    );
}