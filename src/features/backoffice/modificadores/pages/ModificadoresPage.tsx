import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Layers } from "lucide-react";
import type { GrupoModificadorDTO } from "@/types/pdv";

import { useModificadores } from "../hooks/useModificadores";
import { ModificadorSidebar } from "../components/ModificadorSidebar";
import { ModificadorForm } from "../components/ModificadorForm";

export function ModificadoresPage() {
    const [grupoSelecionado, setGrupoSelecionado] = useState<GrupoModificadorDTO | null>(null);
    const [isCriandoNovo, setIsCriandoNovo] = useState(false);

    const { grupos, isLoading, salvar, isSalvando, excluir, isExcluindo } = useModificadores(() => {
        setGrupoSelecionado(null);
        setIsCriandoNovo(false);
    });

    const handleSelectGrupo = (grupo: GrupoModificadorDTO) => {
        setGrupoSelecionado(grupo);
        setIsCriandoNovo(false);
    };

    const handleNovoGrupo = () => {
        setGrupoSelecionado(null);
        setIsCriandoNovo(true);
    };

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">
            <Header titulo="Catálogo de Modificadores" />
        
            <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-8 flex-1 overflow-y-auto lg:overflow-hidden">
                
                {/* 1. Barra Lateral */}
                <ModificadorSidebar 
                    grupos={grupos}
                    isLoading={isLoading}
                    grupoSelecionado={grupoSelecionado}
                    isCriandoNovo={isCriandoNovo}
                    onSelect={handleSelectGrupo}
                    onNovo={handleNovoGrupo}
                />

                {/* 2. Conteúdo Principal (Formulário ou Empty State) */}
                {grupoSelecionado || isCriandoNovo ? (
                    <ModificadorForm 
                        grupoInicial={grupoSelecionado}
                        onSave={salvar}
                        onDelete={excluir}
                        onCancel={() => {
                            setGrupoSelecionado(null);
                            setIsCriandoNovo(false);
                        }}
                        isSalvando={isSalvando}
                        isExcluindo={isExcluindo}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                        <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                            <Layers size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">Nenhum grupo selecionado</h3>
                        <p className="text-gray-500 mt-2 max-w-sm text-center">
                            Selecione um grupo na lista ao lado para editar as suas opções, ou clique em "Novo Modificador" para criar um do zero.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}