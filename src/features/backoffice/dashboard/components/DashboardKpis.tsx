import { DollarSign, ShoppingBag, Receipt, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoeda } from "@/lib/utils";
import type { DashboardKpisDTO } from "../types/dashboard";

interface DashboardKpisProps {
    data: DashboardKpisDTO | undefined;
    isLoading: boolean;
}

export function DashboardKpis({ data, isLoading }: DashboardKpisProps) {
    const renderPercentual = (valor?: number, inverse = false) => {
        if (valor === undefined || valor === null) return null;
        const isPositivo = valor >= 0;
        return (
            <div className={`mt-1 flex items-center text-xs font-medium ${inverse ? 'text-primary-foreground/80' : isPositivo ? 'text-success' : 'text-destructive'}`}>
                {isPositivo ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {Math.abs(valor).toFixed(1)}% em relação ao período anterior
            </div>
        );
    };

    return (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-primary bg-primary text-primary-foreground shadow-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-white">Faturamento Bruto</CardTitle>
                    <div className="rounded-lg bg-white/10 p-2"><DollarSign size={20} /></div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-white">
                        {isLoading ? "..." : formatarMoeda(data?.faturamentoTotal || 0)}
                    </div>
                    {renderPercentual(data?.comparativoPeriodoAnterior?.faturamentoPercentual, true)}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Vendas Realizadas</CardTitle>
                    <div className="rounded-lg bg-muted p-2 text-primary"><ShoppingBag size={20} /></div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">
                        {isLoading ? "..." : data?.quantidadeVendas || 0}
                    </div>
                    {renderPercentual(data?.comparativoPeriodoAnterior?.vendasPercentual)}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
                    <div className="rounded-lg bg-muted p-2 text-primary"><Receipt size={20} /></div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">
                        {isLoading ? "..." : formatarMoeda(data?.ticketMedio || 0)}
                    </div>
                    {renderPercentual(data?.comparativoPeriodoAnterior?.ticketMedioPercentual)}
                </CardContent>
            </Card>
        </div>
    );
}
