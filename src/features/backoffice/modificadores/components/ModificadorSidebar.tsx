import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    return (
        <Card className="w-full lg:w-[320px] xl:w-95 shrink-0 rounded-md border-gray-200 flex flex-col h-100 lg:h-full lg:overflow-hidden">
            <CardHeader className="flex flex-col space-y-2 border-b px-6 py-1">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                    <Layers className="h-5 w-5 text-primary" />
                    Grupos de Modificadores
                </CardTitle>
                <Button onClick={onNovo} className="w-full shadow-sm" variant={isCriandoNovo ? "secondary" : "default"}>
                    <Plus size={16} className="mr-2" /> 
                    {isCriandoNovo ? "A Criar Novo..." : "Novo Modificador"}
                </Button>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto px-4 py-1 space-y-2">
                {isLoading && <p className="text-gray-500 text-sm text-center py-4 animate-pulse">Carregando...</p>}
                {!isLoading && grupos.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">Nenhum grupo cadastrado.</p>
                )}
            
                {grupos.map((grupo) => {
                    const isSelected = grupoSelecionado?.id === grupo.id && !isCriandoNovo;
                    return (
                        <div
                            key={grupo.id}
                            onClick={() => onSelect(grupo)}
                            className={`p-3 rounded-lg cursor-pointer border transition-all ${
                                isSelected 
                                ? 'border-primary bg-primary/5 shadow-sm' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <h3 className="font-medium text-gray-900">{grupo.nome}</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                {grupo.opcoes.length} {grupo.opcoes.length === 1 ? 'opção' : 'opções'}
                            </p>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}