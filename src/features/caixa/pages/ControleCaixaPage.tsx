import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumericFormat } from "react-number-format";

import { Lock, Box, Coins, DollarSign, ArrowDownToLine, ArrowUpFromLine, Receipt, KeyRound, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/layout/PageShell";

import { useControleCaixa } from "../hooks/useControleCaixa";
import { MovimentacaoCaixaModal } from "../components/MovimentacaoCaixaModal";
import { FechamentoCaixaModal } from "../components/FechamentoCaixaModal";

const formAberturaSchema = z.object({
    saldoInicial: z.number().min(0, "O saldo inicial não pode ser negativo.")
});

type FormAberturaInputs = z.infer<typeof formAberturaSchema>;

interface ResumoCaixaAbertoProps {
    visaoAdministrativa: boolean;
    kpis: {
        fundoTroco: number;
        vendasDinheiro: number;
        saldoFisico: number;
    };
}

export function ResumoCaixaAberto({ visaoAdministrativa, kpis }: ResumoCaixaAbertoProps) {
    if (!visaoAdministrativa) {
        return (
            <div className="mb-6 flex w-full items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
                <ShieldCheck className="mt-0.5 shrink-0 text-blue-700" size={22} />
                <div>
                    <h3 className="font-semibold">Conferência cega ativa</h3>
                    <p className="text-sm text-blue-800">
                        Os valores esperados permanecem ocultos até a conclusão do fechamento.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 w-full">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center min-w-0">
                <div className="flex justify-between items-start mb-2"><h3 className="font-semibold text-gray-800 text-sm truncate">Saldo Físico Estimado</h3><Box size={20} className="text-gray-400 shrink-0 ml-2" /></div>
                <p className="text-2xl font-bold text-primary mb-1 truncate w-full">{kpis.saldoFisico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                <p className="text-xs text-gray-500 truncate">Dinheiro que deve estar na gaveta.</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center min-w-0">
                <div className="flex justify-between items-start mb-2"><h3 className="font-semibold text-gray-800 text-sm truncate">Fundo de Troco</h3><Coins size={20} className="text-gray-400 shrink-0 ml-2" /></div>
                <p className="text-2xl font-bold text-gray-900 mb-1 truncate w-full">{kpis.fundoTroco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                <p className="text-xs text-gray-500 truncate">Lançado na abertura.</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center min-w-0">
                <div className="flex justify-between items-start mb-2"><h3 className="font-semibold text-gray-800 text-sm truncate">Vendas em Dinheiro</h3><DollarSign size={20} className="text-gray-400 shrink-0 ml-2" /></div>
                <p className="text-2xl font-bold text-green-600 mb-1 truncate w-full">{kpis.vendasDinheiro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                <p className="text-xs text-gray-500 truncate">Apenas em espécie.</p>
            </div>
        </div>
    );
}

export function ControleCaixaPage() {
    const [modalAtivo, setModalAtivo] = useState<'SANGRIA' | 'REFORCO' | null>(null);
    const [isFechamentoOpen, setIsFechamentoOpen] = useState(false);

    const fecharModais = () => {
        setModalAtivo(null);
        setIsFechamentoOpen(false);
    };

    const { 
        caixaAtual, isCaixaAberto, isLoadingCaixa, 
        kpis, extratoUnificado, visaoAdministrativa,
        abrir, isAbrindo, movimentar, isMovimentando, fechar, isFechando 
    } = useControleCaixa(fecharModais);

    const { handleSubmit, control, formState: { errors } } = useForm<FormAberturaInputs>({
        resolver: zodResolver(formAberturaSchema),
        defaultValues: { saldoInicial: 0 }
    });

    const renderIconeExtrato = (tipo: string) => {
        switch(tipo) {
            case 'VENDA': return <Receipt size={18} className="text-gray-500" />;
            case 'SANGRIA': return <ArrowDownToLine size={18} className="text-red-500" />;
            case 'REFORCO': return <ArrowUpFromLine size={18} className="text-green-500" />;
            case 'ABERTURA': return <KeyRound size={18} className="text-primary" />;
            default: return <Box size={18} />;
        }
    };

    if (isLoadingCaixa) {
        return (
            <PageShell titulo="Controle de Caixa">
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500 font-medium animate-pulse">Carregando informações do caixa...</p>
                </div>
            </PageShell>
        );
    }

    if (!isCaixaAberto) {
        return (
            <PageShell titulo="Controle de Caixa">
                <div className="flex min-h-full flex-col items-center justify-center p-6">
                    <div className="w-full max-w-md rounded-xl border bg-surface-raised p-8 text-center shadow-card">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <Lock size={32} />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-foreground">Caixa Fechado</h2>
                        <p className="mb-6 text-sm text-muted-foreground">É necessário informar o saldo em dinheiro presente na gaveta para iniciar um novo turno de vendas.</p>
                        
                        <form onSubmit={handleSubmit((dados) => abrir(dados.saldoInicial))} className="space-y-4 text-left">
                            {/* Campo Saldo Inicial Refatorado */}
                            <div className="space-y-2">
                                <Label className="font-semibold text-foreground">Fundo de Troco / Saldo Inicial (R$)</Label>
                                <Controller
                                    name="saldoInicial"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            getInputRef={field.ref}
                                            value={field.value}
                                            onValueChange={(values) => field.onChange(values.floatValue || 0)}
                                            thousandSeparator="." decimalSeparator="," prefix="R$ " decimalScale={2} fixedDecimalScale allowNegative={false}
                                            disabled={isAbrindo}
                                            placeholder="R$ 0,00"
                                            className="flex h-9 w-full rounded-md border border-input bg-surface-raised px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    )}
                                />
                                {errors.saldoInicial && <p className="text-sm text-destructive">{errors.saldoInicial.message}</p>}
                            </div>
                            
                            <Button type="submit" disabled={isAbrindo} className="mt-4 w-full">
                                {isAbrindo ? "Abrindo Caixa..." : "Abrir Caixa Agora"}
                            </Button>
                        </form>
                    </div>
                </div>
            </PageShell>
        );
    }

    const dataAbertura = caixaAtual?.dataAbertura;

    return (
        <PageShell titulo="Controle de Caixa">
            <div className="flex-col items-start justify-between">

                <ResumoCaixaAberto visaoAdministrativa={visaoAdministrativa} kpis={kpis} />

                <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                        <Button onClick={() => setModalAtivo('SANGRIA')} variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"><ArrowDownToLine size={16} className="mr-2 shrink-0" /> Sangria (Retirada)</Button>
                        <Button onClick={() => setModalAtivo('REFORCO')} variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"><ArrowUpFromLine size={16} className="mr-2 shrink-0" /> Reforço (Entrada)</Button>
                    </div>
                    <Button onClick={() => setIsFechamentoOpen(true)} className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto mt-2 sm:mt-0"><Lock size={16} className="mr-2 shrink-0" /> Iniciar Fechamento</Button>
                </div>

                <div className="min-h-100 flex flex-1 flex-col overflow-hidden rounded-xl border bg-surface-raised shadow-card">
                    <div className="flex flex-col items-start justify-between gap-2 border-b p-4 sm:flex-row sm:items-center md:px-5">
                        <h3 className="font-semibold text-foreground">Extrato do Turno</h3>
                        
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse shrink-0" />
                            {dataAbertura && (
                                <span className="text-sm text-gray-700 font-normal">
                                    Caixa aberto dia <span className="font-bold">{new Date(dataAbertura).toLocaleDateString('pt-BR')}</span> às <span className="font-bold">{new Date(dataAbertura).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-3 md:px-4">
                        {extratoUnificado.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 space-y-3"><CheckCircle2 size={48} className="text-gray-200" /><p>Nenhuma movimentação registrada.</p></div>
                        ) : (
                            <div>
                                {extratoUnificado.map((item, index) => (
                                    <div key={item.id} className={`flex items-center justify-between px-2 py-4 transition-colors hover:bg-muted/50 ${index !== extratoUnificado.length - 1 ? 'border-b' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.tipo === 'SANGRIA' ? 'bg-red-100' : item.tipo === 'ABERTURA' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                                {renderIconeExtrato(item.tipo)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2"><p className="font-semibold text-gray-800 text-sm">{item.titulo}</p><span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-sm">{item.horario}</span></div>
                                                <p className="text-xs text-gray-500 mt-0.5">{item.subtitulo}</p>
                                            </div>
                                        </div>
                                        {typeof item.valor === 'number' && (
                                            <div className={`font-bold text-sm sm:text-base ${item.isEntrada ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.isEntrada ? '+ ' : '- '} {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                <MovimentacaoCaixaModal tipo={modalAtivo} onClose={() => setModalAtivo(null)} onSave={(dados) => movimentar({ tipo: modalAtivo!, ...dados })} isSalvando={isMovimentando} />
                <FechamentoCaixaModal isOpen={isFechamentoOpen} onClose={() => setIsFechamentoOpen(false)} onSave={fechar} isSalvando={isFechando} />
            </div>
        </PageShell>
    );
}
