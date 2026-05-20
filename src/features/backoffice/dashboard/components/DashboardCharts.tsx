import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { formatarMoeda } from "@/lib/utils";
import type { CategoriaDashboardDTO, ProdutoTopDTO } from "../types/dashboard";
import { BarChart2, ChartPie } from "lucide-react";

interface DashboardChartsProps {
    categoriasData: CategoriaDashboardDTO[] | undefined;
    isLoadingCategorias: boolean;
    produtosData: ProdutoTopDTO[] | undefined;
    isLoadingProdutos: boolean;
}

export function DashboardCharts({
    categoriasData,
    isLoadingCategorias,
    produtosData,
    isLoadingProdutos
}: DashboardChartsProps) {
    
    // Configurações e Cores
    const chartConfigTopProdutos = {
        valorGerado: {
            label: "Faturamento R$",
            color: "hsl(var(--primary))",
        },
    };

    const CORES_CATEGORIAS = ['#1e3a8a', '#3b82f6', '#93c5fd', '#10b981', '#f59e0b', '#ef4444'];

    const dadosCategoriasFormatados = categoriasData?.map((cat, index) => ({
        ...cat,
        fill: CORES_CATEGORIAS[index % CORES_CATEGORIAS.length]
    })) || [];

    const chartConfigCategorias = dadosCategoriasFormatados.reduce((acc: any, curr) => {
        acc[curr.nomeCategoria] = {
            label: curr.nomeCategoria,
            color: curr.fill,
        };
        return acc;
    }, {});

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Gráfico de Barras (Top Produtos) */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                    <BarChart2 className="text-gray-600"/>    
                    Top Produtos (Faturamento)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingProdutos ? (
                        <div className="h-75 flex items-center justify-center text-gray-400 animate-pulse">Carregando gráfico...</div>
                    ) : produtosData?.length === 0 ? (
                        <div className="h-75 flex items-center justify-center text-gray-400">Nenhum dado para o período.</div>
                    ) : (
                        <ChartContainer config={chartConfigTopProdutos} className="min-h-75 w-full">
                            <BarChart data={produtosData} layout="horizontal" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                                <XAxis dataKey="nomeProduto" type="category" width={120} tickLine={false} axisLine={false} fontSize={12} />
                                <YAxis type="number" tickFormatter={(value) => `R$ ${value}`} />
                                <ChartTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} content={<ChartTooltipContent />} />
                                <Bar dataKey="valorGerado" fill="#162556" radius={[0, 4, 4, 0]} barSize={32} />
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* Gráfico de Rosca (Categoria)*/}
            <Card className="shadow-sm border-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                        <ChartPie className="text-gray-600"/>
                        Faturamento por Categoria
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingCategorias ? (
                        <div className="h-75 flex items-center justify-center text-gray-400 animate-pulse">Carregando gráfico...</div>
                    ) : dadosCategoriasFormatados.length === 0 ? (
                        <div className="h-75 flex items-center justify-center text-gray-400">Nenhum dado para o período.</div>
                    ) : (
                        <ChartContainer config={chartConfigCategorias} className="min-h-75 w-full">
                            <PieChart>
                                <Pie
                                    data={dadosCategoriasFormatados}
                                    dataKey="valorGerado"
                                    nameKey="nomeCategoria"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={2}
                                />
                                <ChartTooltip
                                    cursor={false} 
                                    content={
                                        <ChartTooltipContent
                                            nameKey="nomeCategoria"
                                            hideLabel
                                            formatter={(value) => formatarMoeda(Number(value))} 
                                        />
                                    } 
                                />
                                <ChartLegend 
                                    content={<ChartLegendContent nameKey="nomeCategoria" />} 
                                    className="-translate-y-2 flex-wrap gap-2" 
                                />
                            </PieChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}