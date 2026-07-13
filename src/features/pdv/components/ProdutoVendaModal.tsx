import { useState, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/store/useCartStore";
import type { ProdutoDTO, ModificadorSelecionado, OpcaoModificadorDTO } from "../../../types/pdv";
import { ShoppingCart, Save } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";

interface Props {
    produto: ProdutoDTO;
    isOpen: boolean;
    onClose: () => void;
    /**
     * Se presente, o modal opera em modo edição: pré-preenche a seleção e ao confirmar
     * substitui o item existente (mantendo idCarrinho e quantidade) em vez de adicionar novo.
     */
    modoEdicao?: {
        idCarrinho: string;
        modificadoresIniciais: ModificadorSelecionado[];
    };
}

export function ProdutoVendaModal({ produto, isOpen, onClose, modoEdicao}: Props){
    const adicionarItem = useCartStore((state) => state.adicionarItem);
    const substituirModificadores = useCartStore((state) => state.substituirModificadores);
    const isEdicao = !!modoEdicao;
    const [selecao, setSelecao] = useState<ModificadorSelecionado[]>(
        modoEdicao?.modificadoresIniciais ?? []
    );

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

    const toggleOpcao = useCallback((grupoId: number, opcao: OpcaoModificadorDTO, tipo: 'UNICA' | 'MULTIPLA', max: number) => {
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
    }, [produto.gruposModificadores]);

    const handleConfirmar = () => {
        if (modoEdicao) {
            substituirModificadores(modoEdicao.idCarrinho, selecao);
        } else {
            adicionarItem(produto, selecao);
        }
        setSelecao([]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white">
                <DialogHeader className="px-6 py-3 bg-slate-50 border-b border-slate-100">
                    <DialogTitle className="text-2xl font-bold text-slate-800">
                        {produto.nome}
                        <p className="text-sm font-normal text-slate-500">
                            {isEdicao ? "Editando item do carrinho" : "Personalize seu pedido abaixo"}
                        </p>
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] px-6 py-2">
                    <div className="space-y-4">
                        {produto.gruposModificadores.map((grupo) => {
                            const qtdSelecionadaNoGrupo = selecao.filter(
                                (s) => grupoPorOpcao.get(s.opcaoId) === grupo.grupoId
                            ).length;
                            const atendeRequisito = qtdSelecionadaNoGrupo >= grupo.minOpcoes;

                            return (
                                <div key={grupo.grupoId} className="space-y-4">
                                    
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                        <Label className="text-lg font-bold text-slate-800">
                                            {grupo.nome}
                                        </Label>
                                        <Badge variant={atendeRequisito ? "secondary" : "destructive"}>
                                            {grupo.minOpcoes > 0 ? `Mínimo ${grupo.minOpcoes}` : `Escolha até ${grupo.maxOpcoes}`}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                                    className={`
                                                        flex items-center justify-between p-2 rounded-xl border-2 cursor-pointer 
                                                        hover:-translate-y-1 hover:shadow-sm transition-all duration-300
                                                        ${isSelected
                                                            ? 'border-blue-900 bg-blue-50/50'
                                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox 
                                                            checked={isSelected} 
                                                            onClick={(e) => e.stopPropagation()} 
                                                            onCheckedChange={() => toggleOpcao(grupo.grupoId, opcao, grupo.tipoEscolha, grupo.maxOpcoes)}
                                                            className={grupo.maxOpcoes === 1 ? "rounded-full" : "rounded-sm"} 
                                                        />
                                                        <span className="font-semibold text-slate-700">
                                                            {opcao.nome}
                                                        </span>
                                                    </div>
                                                    
                                                    {opcao.precoAdicional > 0 && (
                                                        <span className="text-sm font-bold text-emerald-500 p-1 rounded-md">
                                                            + {formatarMoeda(opcao.precoAdicional)}
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
                     
                <div className="px-6">
                    <div className="bg-slate-100 px-4 py-2 rounded-lg flex justify-between items-center border border-slate-100">
                        <span className="text-slate-600 font-medium">Total do Item:</span>
                        <span className="text-xl font-bold text-blue-900">
                            {formatarMoeda(precoTotal)}
                        </span>
                    </div>
                </div>

                <DialogFooter className="px-6 pb-8">
                    <Button variant="outline" onClick={onClose} className="cursor-pointer" size={"lg"}>
                        Cancelar
                    </Button>
                    <Button
                        disabled={!isValido}
                        onClick={handleConfirmar}
                        size={"lg"}
                        className="bg-linear-to-br from-blue-950 to-blue-900 hover:-translate-y-0.5 hover:brightness-130 transition-all duration-300 text-white shadow-md cursor-pointer px-8"
                    >
                        {isEdicao
                            ? <><Save className="mr-2 h-5 w-5" /> Salvar Alterações</>
                            : <><ShoppingCart className="mr-2 h-5 w-5" /> Adicionar ao Carrinho</>
                        }
                    </Button>
                </DialogFooter>
                
            </DialogContent>
        </Dialog>
);
}