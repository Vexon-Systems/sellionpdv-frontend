import { PageShell } from "@/components/layout/PageShell";
import { useDashboardData } from "../hooks/useDashboardData";

import { DashboardFilters } from "../components/DashboardFilters";
import { DashboardKpis } from "../components/DashboardKpis";
import { DashboardCharts } from "../components/DashboardCharts";
import { DashboardSerieTemporal } from "../components/DashboardSerieTemporal";
import { DashboardOperacoes } from "../components/DashboardOperacoes";

export function DashboardPage() {
    const {
        date,
        tabAtiva,
        handleTabChange,
        handleCalendarChange,
        handleRefresh,
        isRefreshing,
        queries,
    } = useDashboardData();

    return (
        <PageShell titulo="Dashboard">
                
                {/* 1. Filtros e Controlos de Data */}
                <DashboardFilters
                    date={date}
                    tabAtiva={tabAtiva}
                    onTabChange={handleTabChange}
                    onCalendarChange={handleCalendarChange}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                />

                {/* 2. Indicadores Principais (KPIs) */}
                <DashboardKpis 
                    data={queries.kpis.data} 
                    isLoading={queries.kpis.isLoading} 
                />

                {/* 3. Série Temporal (Evolução do Faturamento) */}
                <DashboardSerieTemporal 
                    data={queries.serieTemporal.data}
                    isLoading={queries.serieTemporal.isLoading}
                />

                {/* 4. Gráficos de Produtos e Categorias */}
                <DashboardCharts 
                    categoriasData={queries.categorias.data}
                    isLoadingCategorias={queries.categorias.isLoading}
                    produtosData={queries.produtos.data}
                    isLoadingProdutos={queries.produtos.isLoading}
                />

                {/* 5. Gráficos de Pagamentos e Resumo de Caixa */}
                <DashboardOperacoes 
                    pagamentosData={queries.pagamentos.data}
                    isLoadingPagamentos={queries.pagamentos.isLoading}
                    caixaData={queries.caixa.data}
                    isLoadingCaixa={queries.caixa.isLoading}
                />

        </PageShell>
    );
}
