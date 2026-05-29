import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { formatarMoeda } from "@/lib/utils";
import type { CategoriaDashboardDTO, ProdutoTopDTO } from "../types/dashboard";
import { ChartPie, ChartColumnBig } from "lucide-react";

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
    // Estado para controlar a visão do gráfico (Faturamento ou Vendas)
    const [viewTopProdutos, setViewTopProdutos] = useState<"faturamento" | "quantidade">("faturamento");

    // Configuração de cores e rótulos (Produtos)
    const chartConfigTopProdutos = {
        valor: {
            label: viewTopProdutos === "faturamento" ? "Faturamento R$" : "Quantidade Vendida",
            color: "hsl(var(--primary))",
        },
    };

    // Configuração de cores e rótulos (Categorias)
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
            
            {/* GRÁFICO: TOP PRODUTOS COM TOGGLE */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="flex gap-2 text-lg font-bold text-gray-800">
                        <ChartColumnBig className="text-gray-500"/>    Top Produtos ({viewTopProdutos === "faturamento" ? "Faturamento" : "Vendas"})
                    </CardTitle>
                    
                    <Tabs value={viewTopProdutos} onValueChange={(v) => setViewTopProdutos(v as any)}>
                        <TabsList className="bg-gray-100 h-8">
                            <TabsTrigger value="faturamento" className="text-xs px-3">Faturamento</TabsTrigger>
                            <TabsTrigger value="quantidade" className="text-xs px-3">Vendas</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                    {isLoadingProdutos ? (
                        <div className="h-70 flex items-center justify-center text-gray-400 animate-pulse">Carregando...</div>
                    ) : !produtosData || produtosData.length === 0 ? (
                        <div className="h-70 flex items-center justify-center text-gray-400">Nenhum dado.</div>
                    ) : (
                        <ChartContainer config={chartConfigTopProdutos} className="h-70 w-full">
                            <BarChart 
                                data={produtosData}
                                layout="vertical" 
                                margin={{ top: -10, right: 10, left: 20, bottom: 0 }}
                            >
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    type="number" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    fontSize={12}
                                    tickFormatter={(value) => viewTopProdutos === "faturamento" ? `R$ ${value}` : value}
                                />
                                <YAxis
                                    type="category" 
                                    dataKey="nomeProduto" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    fontSize={12}
                                    interval={0}
                                />
                                <ChartTooltip 
                                    cursor={{ fill: 'rgba(0,0,0,0.03)' }} 
                                    content={
                                        <ChartTooltipContent 
                                            formatter={(value) => viewTopProdutos === "faturamento" ? formatarMoeda(Number(value)) : `${value} unidades`} 
                                        />
                                    } 
                                />
                                <Bar 
                                    dataKey={viewTopProdutos === "faturamento" ? "valorGerado" : "quantidadeVendida"} 
                                    fill="#0276F3" 
                                    radius={[0, 4, 4, 0]} 
                                    barSize={24} 
                                />
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* GRÁFICO DE ROSCA: CATEGORIAS */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader>
                    <CardTitle className="flex gap-2 text-lg font-bold text-gray-800">
                    <ChartPie className="text-gray-500"/>   Faturamento por Categoria
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingCategorias ? (
                        <div className="h-70 flex items-center justify-center text-gray-400 animate-pulse">Carregando...</div>
                    ) : dadosCategoriasFormatados.length === 0 ? (
                        <div className="h-70 flex items-center justify-center text-gray-400">Nenhum dado.</div>
                    ) : (
                        <ChartContainer config={chartConfigCategorias} className="h-70 w-full">
                            <PieChart>
                                <Pie
                                    data={dadosCategoriasFormatados}
                                    dataKey="valorGerado"
                                    nameKey="nomeCategoria"
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent 
                                            formatter={(value) => formatarMoeda(Number(value))} 
                                        />
                                    }
                                />
                                <ChartLegend content={<ChartLegendContent nameKey="nomeCategoria" />} className="flex-wrap gap-2" />
                            </PieChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}