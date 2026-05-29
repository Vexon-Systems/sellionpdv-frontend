import { DollarSign, ShoppingBag, Receipt, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoeda } from "@/lib/utils";
import type { DashboardKpisDTO } from "../types/dashboard";

interface DashboardKpisProps {
    data: DashboardKpisDTO | undefined;
    isLoading: boolean;
}

export function DashboardKpis({ data, isLoading }: DashboardKpisProps) {
    const renderPercentual = (valor?: number) => {
        if (valor === undefined || valor === null) return null;
        const isPositivo = valor >= 0;
        return (
            <div className={`flex items-center text-xs mt-1 font-medium ${isPositivo ? 'text-green-600' : 'text-red-600'}`}>
                {isPositivo ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {Math.abs(valor).toFixed(1)}% em relação ao período anterior
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-500">Faturamento Bruto</CardTitle>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                        {isLoading ? "..." : formatarMoeda(data?.faturamentoTotal || 0)}
                    </div>
                    {renderPercentual(data?.comparativoPeriodoAnterior?.faturamentoPercentual)}
                </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-500">Vendas Realizadas</CardTitle>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShoppingBag size={20} /></div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                        {isLoading ? "..." : data?.quantidadeVendas || 0}
                    </div>
                    {renderPercentual(data?.comparativoPeriodoAnterior?.vendasPercentual)}
                </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-500">Ticket Médio</CardTitle>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Receipt size={20} /></div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-blue-950">
                        {isLoading ? "..." : formatarMoeda(data?.ticketMedio || 0)}
                    </div>
                    {renderPercentual(data?.comparativoPeriodoAnterior?.ticketMedioPercentual)}
                </CardContent>
            </Card>
        </div>
    );
}