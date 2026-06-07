import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatarMoeda } from "@/lib/utils";
import { Activity } from "lucide-react";
import type { SerieTemporalDTO } from "../types/dashboard";

interface DashboardSerieTemporalProps {
    data: SerieTemporalDTO[] | undefined;
    isLoading: boolean;
}

export function DashboardSerieTemporal({ data, isLoading }: DashboardSerieTemporalProps) {
    const chartConfig = {
        valor: {
            label: "Faturamento",
            color: "#3b82f6",
        },
    };

    return (
        <Card className="shadow-sm border-gray-200 mb-6">
            <CardHeader>
                <CardTitle className="flex gap-2 text-lg font-bold text-gray-800 items-center">
                    <Activity className="h-5 w-5 text-gray-500" />
                    Evolução do Faturamento
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-70 flex items-center justify-center text-gray-400 animate-pulse">
                        A carregar gráfico...
                    </div>
                ) : !data || data.length === 0 ? (
                    <div className="h-70 flex items-center justify-center text-gray-400">
                        Nenhum dado para o período selecionado.
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-70 w-full">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="20%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis 
                                tickFormatter={(value) => `R$ ${value}`} 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={8} 
                                width={70}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => formatarMoeda(Number(value))} />} />
                            <Area 
                                type="monotone" 
                                dataKey="valor" 
                                fillOpacity={1} 
                                fill="url(#colorValor)" 
                            />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}