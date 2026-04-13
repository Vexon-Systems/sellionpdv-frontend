import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/store/useCartStore";
import type { ProdutoDTO, ModificadorSelecionado } from "@/types/pdv";
import { ShoppingCart, AlertCircle } from "lucide-react";

interface Props {
    produto: ProdutoDTO;
    isOpen: boolean;
    onClose: () => void;
}

export function ProdutoVendaModal({ produto, isOpen, onClose}: Props){
    const adicionarItem = useCartStore((state) => state.adicionarItem);
    const [selecao, setSelecao] = useState<ModificadorSelecionado[]>([]);
    const [precoTotal, setPrecoTotal] = useState(produto.precoBase);

    // Recalcula o preço total sempre que a seleção muda
    useEffect(() => {
        const adicional = selecao.reduce((acc, item) => acc + item.precoAdicional, 0);
        setPrecoTotal(produto.precoBase + adicional);
    }, [selecao, produto.precoBase]);

    const toggleOpcao = (grupoId: number, opcao: any, tipo: 'UNICA' | 'MULTIPLA', max: number) => {
    setSelecao(prev => {
            // Se for ÚNICA, remove qualquer outra opção do mesmo grupo antes de adicionar a nova
            if (tipo === 'UNICA') {
                const outrasOpcoes = prev.filter(s => !produto.gruposModificadores.find(g => g.grupoId === grupoId)?.opcoes.find(o => o.id === s.opcaoId));
                return [...outrasOpcoes, { opcaoId: opcao.id, nome: opcao.nome, precoAdicional: opcao.precoAdicional }];
            }

            // Se for MÚLTIPLA
            const existe = prev.find(s => s.opcaoId === opcao.id);
            if (existe) {
                return prev.filter(s => s.opcaoId !== opcao.id);
            }

            // Verifica limite máximo
            const selecionadosNoGrupo = prev.filter(s => produto.gruposModificadores.find(g => g.grupoId === grupoId)?.opcoes.find(o => o.id === s.opcaoId)).length;
            if (selecionadosNoGrupo >= max) return prev;

            return [...prev, { opcaoId: opcao.id, nome: opcao.nome, precoAdicional: opcao.precoAdicional }];
        });
    };

    const handleConfirmar = () => {
            adicionarItem(produto, selecao);
            onClose();
            setSelecao([]);
    };

    // Validação simples: todos os grupos com minOpcoes > 0 foram atendidos?
    const isValido = produto.gruposModificadores.every(grupo => {
            const selecionadosNoGrupo = selecao.filter(s => grupo.opcoes.find(o => o.id === s.opcaoId)).length;
            return selecionadosNoGrupo >= grupo.minOpcoes;
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-125 p-0 overflow-hidden bg-white">
                <DialogHeader className="p-6 bg-gray-50 border-b">
                <div className="flex justify-between items-start">
                    <div>
                    <DialogTitle className="text-2xl font-bold">{produto.nome}</DialogTitle>
                    <p className="text-sm text-gray-500">Personalize seu pedido abaixo</p>
                    </div>
                    <div className="text-right px-5">
                        <p className="text-xs text-gray-400 uppercase font-bold">Total do Item</p>
                        <p className="text-2xl font-black text-primary">
                            {precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                </div>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] p-6">
                <div className="space-y-8">
                    {produto.gruposModificadores.map((grupo) => (
                    <div key={grupo.grupoId} className="space-y-4">
                        <div className="flex justify-between items-center">
                        <Label className="text-lg font-bold text-gray-800">{grupo.nome}</Label>
                        <Badge variant={selecao.filter(s => grupo.opcoes.find(o => o.id === s.opcaoId)).length < grupo.minOpcoes ? "destructive" : "secondary"}>
                            {grupo.minOpcoes > 0 ? `Mínimo ${grupo.minOpcoes}` : "Opcional"}
                        </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                        {grupo.opcoes.map((opcao) => {
                            const isSelected = selecao.some(s => s.opcaoId === opcao.id);
                            return (
                            <div 
                                key={opcao.id}
                                onClick={() => toggleOpcao(grupo.grupoId, opcao, grupo.tipoEscolha, grupo.maxOpcoes)}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                isSelected ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                <Checkbox checked={isSelected} className="rounded-full" />
                                <span className="font-medium text-gray-700">{opcao.nome}</span>
                                </div>
                                {opcao.precoAdicional > 0 && (
                                <span className="text-sm font-bold text-green-600">
                                    + {opcao.precoAdicional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                                )}
                            </div>
                            );
                        })}
                        </div>
                    </div>
                    ))}
                </div>
                </ScrollArea>

                <DialogFooter className="p-6 border-t bg-gray-50">
                <Button variant="ghost" onClick={onClose} className="cursor-pointer">Cancelar</Button>
                <Button 
                    disabled={!isValido} 
                    onClick={handleConfirmar}
                    className="bg-primary hover:bg-primary/90 px-8 cursor-pointer"
                >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Adicionar ao Carrinho
                </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}