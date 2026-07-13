import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface AtalhosDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Atalho {
  tecla: string;
  descricao: string;
}

const ATALHOS: Atalho[] = [
  { tecla: "F2", descricao: "Cobrar (abre o modal de pagamento)" },
  { tecla: "/", descricao: "Focar o campo de busca de produto" },
  { tecla: "?", descricao: "Abrir este painel de atalhos" },
];

export function AtalhosDialog({ isOpen, onOpenChange }: AtalhosDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <Keyboard size={18} />
            Atalhos do teclado
          </DialogTitle>
          <DialogDescription>
            Use as teclas abaixo para operar o PDV mais rápido, sem tirar a mão do teclado.
          </DialogDescription>
        </DialogHeader>

        <ul className="mt-2 space-y-2">
          {ATALHOS.map(({ tecla, descricao }) => (
            <li
              key={tecla}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100"
            >
              <span className="text-sm text-slate-700">{descricao}</span>
              <kbd className="inline-flex items-center px-2 py-1 text-xs font-mono font-semibold text-slate-800 bg-white border border-slate-300 rounded shadow-sm">
                {tecla}
              </kbd>
            </li>
          ))}
        </ul>

        <p className="text-xs text-slate-400 mt-2">
          Atalhos não disparam enquanto você está digitando em um campo de texto.
        </p>
      </DialogContent>
    </Dialog>
  );
}
