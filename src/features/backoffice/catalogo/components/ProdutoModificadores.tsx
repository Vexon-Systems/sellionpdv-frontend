import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { GrupoModificadorDTO } from '@/types/pdv';
interface Vinculo { grupoId: number; tipoEscolha: 'UNICA' | 'MULTIPLA'; minOpcoes: number; maxOpcoes: number }

export function ProdutoModificadores({ fields, gruposDisponiveis, append, remove }: {
    fields: (Vinculo & { id: string })[]; gruposDisponiveis: GrupoModificadorDTO[];
    append: (vinculo: Vinculo) => void; remove: (index: number) => void;
}) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [novoVinculo, setNovoVinculo] = useState({
        grupoId: 0, tipoEscolha: 'MULTIPLA' as "UNICA" | "MULTIPLA", minOpcoes: 0, maxOpcoes: 1
    });

    const handleAdicionarVinculo = () => {
        if (novoVinculo.grupoId === 0) { toast.error("Selecione um grupo!"); return; }
        if (fields.some(f => f.grupoId === novoVinculo.grupoId)) { toast.error("Este grupo já está vinculado!"); return; }
        append(novoVinculo);
        setIsPopoverOpen(false);
        setNovoVinculo({ grupoId: 0, tipoEscolha: 'MULTIPLA', minOpcoes: 0, maxOpcoes: 1 });
    };


    return (
        <div className="space-y-4 pt-6 border-t">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div><h3 className="font-bold text-lg text-gray-800">Modificadores</h3><p className="text-sm text-gray-500">Tamanhos, sabores ou adicionais.</p></div>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="border-dashed border-2 cursor-pointer"><Plus size={16} className="mr-2" /> Vincular Grupo</Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80 bg-white p-4 shadow-xl">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 border-b pb-2">Novo Vínculo</h4>
                            <div className="space-y-2">
                                <Label className="text-xs">Grupo</Label>
                                <Select value={novoVinculo.grupoId.toString()} onValueChange={(val) => setNovoVinculo({ ...novoVinculo, grupoId: Number(val) })}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Escolha..." /></SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {gruposDisponiveis.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.nome}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Tipo de Escolha</Label>
                                <Select value={novoVinculo.tipoEscolha} onValueChange={(val) => setNovoVinculo({ ...novoVinculo, tipoEscolha: val as "UNICA" | "MULTIPLA" })}>
                                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white"><SelectItem value="UNICA">Única</SelectItem><SelectItem value="MULTIPLA">Múltipla</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2"><Label className="text-xs">Mínimo</Label><Input type="number" min={0} className="h-9" value={novoVinculo.minOpcoes} onChange={(e) => setNovoVinculo({ ...novoVinculo, minOpcoes: Number(e.target.value) })} /></div>
                                <div className="space-y-2"><Label className="text-xs">Máximo</Label><Input type="number" min={1} className="h-9" value={novoVinculo.maxOpcoes} onChange={(e) => setNovoVinculo({ ...novoVinculo, maxOpcoes: Number(e.target.value) })} /></div>
                            </div>
                            <Button type="button" onClick={handleAdicionarVinculo} className="w-full mt-2">Confirmar</Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {fields.length === 0 ? (
                <div className="p-6 border-2 border-dashed rounded-lg text-center bg-gray-50 text-gray-400">Nenhum modificador vinculado.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fields.map((field, index) => {
                        const grupoInfo = gruposDisponiveis.find(g => g.id === field.grupoId);
                        return (
                            <div key={field.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">{grupoInfo?.nome || "Carregando..."}</h4>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${field.tipoEscolha === 'UNICA' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{field.tipoEscolha}</span>
                                        <span className="text-xs text-gray-500">(Min: {field.minOpcoes} | Máx: {field.maxOpcoes})</span>
                                    </div>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500"><Trash2 size={16} /></Button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

);
}
