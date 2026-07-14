import { useState } from "react";
import { Layers, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GrupoModificadorDTO } from "@/types/pdv";

interface ModificadorSidebarProps {
    grupos: GrupoModificadorDTO[];
    isLoading: boolean;
    grupoSelecionado: GrupoModificadorDTO | null;
    isCriandoNovo: boolean;
    onSelect: (grupo: GrupoModificadorDTO) => void;
    onNovo: () => void;
}

export function ModificadorSidebar({
    grupos,
    isLoading,
    grupoSelecionado,
    isCriandoNovo,
    onSelect,
    onNovo
}: ModificadorSidebarProps) {
    const [busca, setBusca] = useState("");

    const gruposFiltrados = busca.trim()
        ? grupos.filter(g => g.nome.toLowerCase().includes(busca.toLowerCase()))
        : grupos;

    return (
        <Card className="flex h-100 w-full shrink-0 flex-col overflow-hidden lg:h-full lg:w-[320px] xl:w-95">
            <CardHeader className="flex flex-col space-y-3 border-b px-5 py-4">
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                    <Layers className="h-5 w-5 text-primary" />
                    Grupos de Modificadores
                </CardTitle>
                <Button onClick={onNovo} className="w-full shadow-sm" variant={isCriandoNovo ? "secondary" : "default"}>
                    <Plus size={16} className="mr-2" />
                    {isCriandoNovo ? "A Criar Novo..." : "Novo Modificador"}
                </Button>
                <div className="relative w-full">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        placeholder="Buscar grupo..."
                        className="pl-9 h-8 text-sm"
                    />
                </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
                {isLoading && <p className="text-muted-foreground text-sm text-center py-4 animate-pulse">Carregando...</p>}

                {!isLoading && gruposFiltrados.length === 0 && (
                    <p className="text-muted-foreground/70 text-sm text-center py-4">
                        {busca ? "Nenhum grupo encontrado." : "Nenhum grupo cadastrado."}
                    </p>
                )}

                {gruposFiltrados.map((grupo) => {
                    const isSelected = grupoSelecionado?.id === grupo.id && !isCriandoNovo;
                    return (
                        <button type="button"
                            key={grupo.id}
                            onClick={() => onSelect(grupo)}
                            className={`w-full p-3 text-left rounded-lg cursor-pointer border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                isSelected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border hover:border-border hover:bg-muted/50'
                            }`}
                        >
                            <h3 className="font-medium text-foreground">{grupo.nome}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                {grupo.opcoes.length} {grupo.opcoes.length === 1 ? 'opção' : 'opções'}
                            </p>
                        </button>
                    );
                })}
            </CardContent>
        </Card>
    );
}
