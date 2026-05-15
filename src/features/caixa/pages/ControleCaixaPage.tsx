// src/features/caixa/pages/ControleCaixaPage.tsx
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { 
    LockOpen, Lock, Box, Coins, DollarSign, 
    ArrowDownToLine, ArrowUpFromLine, Receipt, KeyRound, CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/Header";

import { apiCaixa } from "../services/apiCaixa";
import { apiVendas } from "@/features/pdv/services/apiVendas";
import { useCaixaStore } from "@/store/useCaixaStore";
import { MovimentacaoCaixaModal } from "../components/MovimentacaoCaixaModal";
import { FechamentoCaixaModal } from "../components/FechamentoCaixaModal";

const formAberturaSchema = z.object({
    saldoInicial: z.number().min(0, "O saldo inicial não pode ser negativo.")
});

type FormAberturaInputs = z.infer<typeof formAberturaSchema>;

interface ExtratoItem {
    id: string;
    tipo: 'VENDA' | 'SANGRIA' | 'REFORCO' | 'ABERTURA';
    titulo: string;
    subtitulo: string;
    horario: string;
    timestamp: number;
    valor: number;
    isEntrada: boolean;
}

export function ControleCaixaPage() {
    const queryClient = useQueryClient();
    const { setCaixa, limparCaixa } = useCaixaStore();

    const [modalAtivo, setModalAtivo] = useState<'SANGRIA' | 'REFORCO' | null>(null);
    const [isFechamentoOpen, setIsFechamentoOpen] = useState(false);

    const { data: caixaAtual, isLoading: isLoadingCaixa, isError } = useQuery({
        queryKey: ['caixa-atual'],
        queryFn: apiCaixa.buscarAtual,
        retry: false, 
    });

    const isCaixaAberto = !!caixaAtual && !isError;

    const { data: vendas = [] } = useQuery({
        queryKey: ['vendas-turno', caixaAtual?.id],
        queryFn: apiVendas.listarVendasTurno,
        enabled: isCaixaAberto,
    });

    const { data: movimentacoes = [] } = useQuery({
        queryKey: ['movimentacoes-turno', caixaAtual?.id],
        queryFn: apiCaixa.listarMovimentacoes,
        enabled: isCaixaAberto,
    });

    useEffect(() => {
        if (caixaAtual) setCaixa(caixaAtual);
        else if (isError) limparCaixa();
    }, [caixaAtual, isError, setCaixa, limparCaixa]);

    const fundoTroco = caixaAtual?.saldoInicial || 0;
    
    const vendasDinheiro = useMemo(() => {
        return vendas
            // Blindagem: Garante que null/undefined não quebre o toUpperCase
            .filter((v: any) => v.formaPagamento?.toUpperCase() === 'DINHEIRO')
            .reduce((acc: number, v: any) => acc + (v.totalFinal || 0), 0);
    }, [vendas]);

    const totalSangrias = useMemo(() => {
        return movimentacoes
            .filter((m: any) => m.tipo === 'SANGRIA')
            .reduce((acc: number, m: any) => acc + (m.valor || 0), 0);
    }, [movimentacoes]);

    const totalReforcos = useMemo(() => {
        return movimentacoes
            .filter((m: any) => m.tipo === 'REFORCO')
            .reduce((acc: number, m: any) => acc + (m.valor || 0), 0);
    }, [movimentacoes]);

    const saldoFisico = fundoTroco + vendasDinheiro + totalReforcos - totalSangrias;

    const extratoUnificado = useMemo(() => {
        const itens: ExtratoItem[] = [];

        if (caixaAtual) {
            itens.push({
                id: `abertura-${caixaAtual.id}`,
                tipo: 'ABERTURA',
                titulo: 'Abertura de Caixa',
                subtitulo: 'Saldo inicial do turno',
                horario: new Date(caixaAtual.dataAbertura).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date(caixaAtual.dataAbertura).getTime(),
                valor: caixaAtual.saldoInicial,
                isEntrada: true
            });
        }

        vendas.forEach((venda: any) => {
            const dataVenda = new Date(venda.dataVenda || new Date());
            const formaPgto = venda.formaPagamento || 'Não Informada'; // Fallback para o Undefined
            
            itens.push({
                id: `venda-${venda.id}`,
                tipo: 'VENDA',
                titulo: `Venda #${venda.id}`,
                subtitulo: `Pagamento via ${formaPgto}`, // Detalhe da forma de pagamento
                horario: dataVenda.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                timestamp: dataVenda.getTime(),
                valor: venda.totalFinal || 0,
                isEntrada: true
            });
        });

        movimentacoes.forEach((mov: any) => {
            const dataMov = new Date(mov.dataMovimentacao || new Date());
            itens.push({
                id: `mov-${mov.id}`,
                tipo: mov.tipo,
                titulo: mov.tipo === 'SANGRIA' ? 'Retirada (Sangria)' : 'Entrada Extra (Reforço)',
                subtitulo: mov.motivo || 'Sem justificativa',
                horario: dataMov.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                timestamp: dataMov.getTime(),
                valor: mov.valor || 0,
                isEntrada: mov.tipo === 'REFORCO'
            });
        });

        return itens.sort((a, b) => b.timestamp - a.timestamp);
    }, [caixaAtual, vendas, movimentacoes]);

    // Mutação Abertura
    const { register, handleSubmit, formState: { errors } } = useForm<FormAberturaInputs>({
        resolver: zodResolver(formAberturaSchema),
        defaultValues: { saldoInicial: 0 }
    });

    const { mutateAsync: abrirCaixa, isPending: isAbrindo } = useMutation({
        mutationFn: apiCaixa.abrir,
        onSuccess: (novoCaixa) => {
            queryClient.setQueryData(['caixa-atual'], novoCaixa);
            toast.success("Caixa aberto com sucesso!");
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.detail || "Não foi possível abrir o caixa.";
            toast.error("Falha na abertura", { description: mensagem });
        }
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
            <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">
                <Header titulo="Controle de Caixa"/>
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500 font-medium animate-pulse">Carregando informações do caixa...</p>
                </div>
            </div>
        );
    }

    if (!isCaixaAberto) {
        return (
            <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">
                <Header titulo="Controle de Caixa"/>
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Caixa Fechado</h2>
                        <p className="text-gray-500 mb-6 text-sm">
                            É necessário informar o saldo em dinheiro presente na gaveta para iniciar um novo turno de vendas.
                        </p>
                        <form onSubmit={handleSubmit(async (dados) => await abrirCaixa(dados.saldoInicial))} className="space-y-4 text-left">
                            <div className="space-y-2">
                                <Label className="font-semibold text-gray-800">Fundo de Troco / Saldo Inicial (R$)</Label>
                                <Input type="number" step="0.01" placeholder="R$ 0.00" disabled={isAbrindo} {...register("saldoInicial", { valueAsNumber: true })} />
                                {errors.saldoInicial && <p className="text-red-500 text-sm">{errors.saldoInicial.message}</p>}
                            </div>
                            <Button type="submit" disabled={isAbrindo} className="w-full bg-primary hover:bg-primary/90 text-white mt-4">
                                {isAbrindo ? "Abrindo Caixa..." : "Abrir Caixa Agora"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50">
            <Header titulo="Controle de Caixa"/>
            <div className="flex-col justify-between items-start px-4 sm:px-8 py-6 overflow-y-auto">
                <div className="flex justify-between items-start">                    
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md flex items-center gap-2 font-medium border border-green-200 shadow-sm">
                        <LockOpen size={18} />
                        Caixa Aberto
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 w-full">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-800 text-sm truncate">Saldo Físico Estimado</h3>
                            <Box size={20} className="text-gray-400 shrink-0 ml-2" />
                        </div>
                        <p className="text-2xl font-bold text-primary mb-1 truncate w-full">
                            {saldoFisico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <p className="text-xs text-gray-500 truncate">Dinheiro que deve estar na gaveta.</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-800 text-sm truncate">Fundo de Troco</h3>
                            <Coins size={20} className="text-gray-400 shrink-0 ml-2" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-1 truncate w-full">
                            {fundoTroco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <p className="text-xs text-gray-500 truncate">Lançado na abertura.</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-800 text-sm truncate">Vendas em Dinheiro</h3>
                            <DollarSign size={20} className="text-gray-400 shrink-0 ml-2" />
                        </div>
                        <p className="text-2xl font-bold text-green-600 mb-1 truncate w-full">
                            {vendasDinheiro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <p className="text-xs text-gray-500 truncate">Apenas em espécie.</p>
                    </div>
                </div>

                {/* Ações */}
                <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                        <Button onClick={() => setModalAtivo('SANGRIA')} variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                            <ArrowDownToLine size={16} className="mr-2 shrink-0" /> Sangria (Retirada)
                        </Button>
                        <Button onClick={() => setModalAtivo('REFORCO')} variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                            <ArrowUpFromLine size={16} className="mr-2 shrink-0" /> Reforço (Entrada)
                        </Button>
                    </div>
                    <Button onClick={() => setIsFechamentoOpen(true)} className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto mt-2 sm:mt-0">
                        <Lock size={16} className="mr-2 shrink-0" /> Iniciar Fechamento
                    </Button>
                </div>

                {/* Área do Extrato Refinada */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-100">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                        <h3 className="font-semibold text-gray-800">Extrato do Turno</h3>
                        <span className="text-xs text-gray-500 font-medium">
                            Aberto às {new Date(caixaAtual.dataAbertura).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    
                    <div className="overflow-y-auto flex-1">
                        {extratoUnificado.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 space-y-3">
                                <CheckCircle2 size={48} className="text-gray-200" />
                                <p>Nenhuma movimentação registrada neste turno.</p>
                            </div>
                        ) : (
                            <div className="p-2">
                                {extratoUnificado.map((item, index) => (
                                    <div 
                                        key={item.id} 
                                        className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-lg ${index !== extratoUnificado.length - 1 ? 'border-b border-gray-100' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                            ${item.tipo === 'SANGRIA' ? 'bg-red-100' : item.tipo === 'ABERTURA' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                                {renderIconeExtrato(item.tipo)}
                                            </div>
                                            <div>
                                                {/* Título*/}
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-gray-800 text-sm">{item.titulo}</p>
                                                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-sm">{item.horario}</span>
                                                </div>
                                                {/* Subtítulo*/}
                                                <p className="text-xs text-gray-500 mt-0.5">{item.subtitulo}</p>
                                            </div>
                                        </div>
                                        <div className={`font-bold text-sm sm:text-base ${item.isEntrada ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.isEntrada ? '+ ' : '- '}
                                            {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                <MovimentacaoCaixaModal tipo={modalAtivo} onClose={() => setModalAtivo(null)} />
                <FechamentoCaixaModal isOpen={isFechamentoOpen} onClose={() => setIsFechamentoOpen(false)} />
            </div>
        </div>
    );
}