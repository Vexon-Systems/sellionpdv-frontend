import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
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
        <PageShell titulo="Catálogo de Modificadores" className="overflow-y-auto lg:overflow-hidden">
            <div className="flex min-h-0 flex-col gap-4 lg:flex-row lg:gap-6 lg:overflow-hidden">
                
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
                    <div className="flex min-h-96 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Layers size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">Nenhum grupo selecionado</h3>
                        <p className="mt-2 max-w-sm text-muted-foreground">
                            Selecione um grupo na lista ao lado para editar as suas opções, ou clique em "Novo Modificador" para criar um do zero.
                        </p>
                    </div>
                )}
            </div>
        </PageShell>
    );
}
