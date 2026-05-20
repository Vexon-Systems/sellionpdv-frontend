import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { formatarMoeda } from "@/lib/utils";
import { Wallet, Calculator, ArrowDownCircle, ArrowUpCircle, CheckCircle, AlertTriangle } from "lucide-react";
import type { PagamentoDashboardDTO, CaixaDashboardDTO } from "../types/dashboard";

interface DashboardOperacoesProps {
    pagamentosData: PagamentoDashboardDTO[] | undefined;
    isLoadingPagamentos: boolean;
    caixaData: CaixaDashboardDTO | undefined;
    isLoadingCaixa: boolean;
}

export function DashboardOperacoes({
    pagamentosData,
    isLoadingPagamentos,
    caixaData,
    isLoadingCaixa
}: DashboardOperacoesProps) {
    
    const CORES_PAGAMENTO: Record<string, string> = {
        'PIX': '#10b981',
        'CREDITO': '#3b82f6',
        'DEBITO': '#8b5cf6',
        'DINHEIRO': '#f59e0b'
    };

    const pagamentosFormatados = pagamentosData?.map((pag) => ({
        ...pag,
        fill: CORES_PAGAMENTO[pag.formaPagamento] || '#94a3b8'
    })) || [];

    const chartConfigPagamentos = pagamentosFormatados.reduce((acc: any, curr) => {
        acc[curr.formaPagamento] = {
            label: curr.formaPagamento,
            color: curr.fill,
        };
        return acc;
    }, {});

    const totalMovimentacoes = (caixaData?.totalSangrias || 0) + (caixaData?.totalReforcos || 0);
    const percentualSangria = totalMovimentacoes > 0 ? ((caixaData?.totalSangrias || 0) / totalMovimentacoes) * 100 : 0;
    const percentualReforco = totalMovimentacoes > 0 ? ((caixaData?.totalReforcos || 0) / totalMovimentacoes) * 100 : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            
            <Card className="shadow-sm border-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                        <Wallet className="h-5 w-5 text-gray-600" />
                        Formas de Pagamento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingPagamentos ? (
                        <div className="h-75 flex items-center justify-center text-gray-400 animate-pulse">A carregar...</div>
                    ) : pagamentosFormatados.length === 0 ? (
                        <div className="h-75 flex items-center justify-center text-gray-400">Sem transações.</div>
                    ) : (
                        <ChartContainer config={chartConfigPagamentos} className="min-h-75 w-full">
                            <PieChart>
                                <Pie
                                    data={pagamentosFormatados}
                                    dataKey="valorTotal"
                                    nameKey="formaPagamento"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={2}
                                >
                                    {pagamentosFormatados.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(value) => formatarMoeda(Number(value))} />} />
                                <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap gap-2" />
                            </PieChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200 flex flex-col">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 mb-4 text-gray-800">
                        <Calculator className="h-5 w-5 text-gray-600" />
                        Auditoria de Caixa
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                    {isLoadingCaixa ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 animate-pulse">A carregar dados...</div>
                    ) : !caixaData ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400">Nenhum turno registado.</div>
                    ) : (
                        <div className="space-y-6">
                            
                            {/* Bloco Superior: Turnos e Diferença */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center">
                                    <p className="text-sm text-gray-500 mb-1">Turnos Abertos</p>
                                    <p className="text-3xl font-bold text-gray-800">{caixaData.quantidadeTurnosAbertos}</p>
                                </div>
                                
                                <div className={`p-4 rounded-xl border flex flex-col justify-center ${caixaData.diferencaCaixaTotal === 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <p className={`text-sm flex items-center mb-1 font-medium ${caixaData.diferencaCaixaTotal === 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        {caixaData.diferencaCaixaTotal === 0 ? <CheckCircle className="h-4 w-4 mr-1" /> : <AlertTriangle className="h-4 w-4 mr-1" />}
                                        Diferença (Furo)
                                    </p>
                                    <p className={`text-2xl font-bold ${caixaData.diferencaCaixaTotal === 0 ? 'text-green-800' : 'text-red-800'}`}>
                                        {formatarMoeda(caixaData.diferencaCaixaTotal)}
                                    </p>
                                </div>
                            </div>

                            {/* Bloco Inferior: Barra de Balanço Visual */}
                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                <h4 className="text-sm font-medium text-gray-600 mb-4">Balanço de Movimentações</h4>
                                
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <p className="text-xs text-red-500 flex items-center font-medium"><ArrowDownCircle className="h-3 w-3 mr-1"/> Sangrias</p>
                                        <p className="text-lg font-bold text-red-600">{formatarMoeda(caixaData.totalSangrias)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-green-500 flex items-center justify-end font-medium"><ArrowUpCircle className="h-3 w-3 mr-1"/> Reforços</p>
                                        <p className="text-lg font-bold text-green-600">{formatarMoeda(caixaData.totalReforcos)}</p>
                                    </div>
                                </div>

                                {/* Barra de Progresso Dividida */}
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                                    <div style={{ width: `${percentualSangria}%` }} className="bg-red-500 h-full transition-all duration-500" />
                                    <div style={{ width: `${percentualReforco}%` }} className="bg-green-500 h-full transition-all duration-500" />
                                </div>
                            </div>

                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}