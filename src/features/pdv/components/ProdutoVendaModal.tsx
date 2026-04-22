import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/store/useCartStore";
import type { ProdutoDTO, ModificadorSelecionado, OpcaoModificadorDTO } from "../types/pdv";
import { ShoppingCart, AlertCircle } from "lucide-react";

interface Props {
    produto: ProdutoDTO;
    isOpen: boolean;
    onClose: () => void;
}

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
})

export function ProdutoVendaModal({ produto, isOpen, onClose}: Props){
    const adicionarItem = useCartStore((state) => state.adicionarItem);
    const [selecao, setSelecao] = useState<ModificadorSelecionado[]>([]);

    // Mapa de otimização:
    // Relaciona id_da_opcao -> id_do_grupo em tempo constante
    const grupoPorOpcao = useMemo(() => {
        const mapa = new Map<number, number>();
        produto.gruposModificadores.forEach((grupo) => {
            grupo.opcoes.forEach((opcao) => mapa.set(opcao.id, grupo.grupoId))
        })
        return mapa;
    }, [produto.gruposModificadores])

    // Preço total
    const precoTotal = useMemo(() => {
        const adicional = selecao.reduce((acc, item) => acc + item.precoAdicional, 0);
        return produto.precoBase + adicional;
    }, [selecao, produto.precoBase])

    // Validação otimizada
    const isValido = useMemo(() => {
        if (!produto || !produto.gruposModificadores) return false;

        return produto.gruposModificadores.every(grupo => {
        const selecionadosNoGrupo = selecao.filter(s => 
            grupo.opcoes.some(o => o.id === s.opcaoId)
        ).length;
        
        return selecionadosNoGrupo >= grupo.minOpcoes;
        });
    }, [produto, selecao]);

    const toggleOpcao = (grupoId: number, opcao: OpcaoModificadorDTO, tipo: 'UNICA' | 'MULTIPLA', max: number) => {
        if (!opcao.id) return;

        setSelecao(prev => {

        const grupoAtual = produto.gruposModificadores.find(g => g.grupoId === grupoId);
        if (!grupoAtual) return prev;

        if (tipo === 'UNICA') {
            const outrasOpcoes = prev.filter(s => !grupoAtual.opcoes.some(o => o.id === s.opcaoId));
            return [...outrasOpcoes, { opcaoId: opcao.id, nome: opcao.nome, precoAdicional: opcao.precoAdicional }];
        }

        const isJaSelecionado = prev.some(s => s.opcaoId === opcao.id);
            if (isJaSelecionado) {
                return prev.filter(s => s.opcaoId !== opcao.id);
            }

        const selecionadosNesteGrupo = prev.filter(s => 
            grupoAtual.opcoes.some(o => o.id === s.opcaoId)
        ).length;

        if (selecionadosNesteGrupo >= max) {
            return prev; 
        }

        return [...prev, { opcaoId: opcao.id, nome: opcao.nome, precoAdicional: opcao.precoAdicional }];
        });
    };

    const handleConfirmar = () => {
        adicionarItem(produto, selecao);
        setSelecao([]);
        onClose();
    };

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
                        {formatadorMoeda.format(precoTotal)}
                    </p>
                    </div>
                </div>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] p-6">
                <div className="space-y-8">
                    {produto.gruposModificadores.map((grupo) => {
                    const qtdSelecionadaNoGrupo = selecao.filter(
                        (s) => grupoPorOpcao.get(s.opcaoId) === grupo.grupoId
                    ).length;
                    const atendeRequisito = qtdSelecionadaNoGrupo >= grupo.minOpcoes;

                    return (
                        <div key={grupo.grupoId} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-lg font-bold text-gray-800">{grupo.nome}</Label>
                            <Badge variant={atendeRequisito ? "secondary" : "destructive"}>
                            {grupo.minOpcoes > 0 ? `Mínimo ${grupo.minOpcoes}` : "Opcional"}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {grupo.opcoes.map((opcao) => {
                            const isSelected = selecao.some((s) => s.opcaoId === opcao.id);

                            return (
                                <div
                                    key={opcao.id}
                                    onClick={() => toggleOpcao(grupo.grupoId, opcao, grupo.tipoEscolha, grupo.maxOpcoes)}
                                    role="button"
                                    tabIndex={0} 
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleOpcao(grupo.grupoId, opcao, grupo.tipoEscolha, grupo.maxOpcoes);
                                        }
                                    }}
                                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                        isSelected
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-100 hover:border-gray-200'
                                    }`}
                                >
                                <div className="flex items-center gap-3">
                                    <Checkbox 
                                    checked={isSelected} 
                                    // Evita a propagação dupla do clique (um do Checkbox e um da Div)
                                    onClick={(e) => e.stopPropagation()} 
                                    onCheckedChange={() => toggleOpcao(grupo.grupoId, opcao, grupo.tipoEscolha, grupo.maxOpcoes)}
                                    className="rounded-full" 
                                    />
                                    <span className="font-medium text-gray-700">{opcao.nome}</span>
                                </div>
                                {opcao.precoAdicional > 0 && (
                                    <span className="text-sm font-bold text-green-600">
                                    + {formatadorMoeda.format(opcao.precoAdicional)}
                                    </span>
                                )}
                                </div>
                            );
                            })}
                        </div>
                        </div>
                    );
                    })}
                </div>
                </ScrollArea>

                <DialogFooter className="p-6 border-t bg-gray-50">
                    <Button variant="ghost" onClick={onClose} className="cursor-pointer">
                        Cancelar
                    </Button>
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