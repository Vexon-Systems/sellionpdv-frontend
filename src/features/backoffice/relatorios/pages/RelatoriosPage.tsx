import { PageShell } from "@/components/layout/PageShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VendasView } from "../components/VendasView";
import { CaixasView } from "../components/CaixasView";
import { ComparativoView } from "../components/ComparativoView";

export function RelatoriosPage() {
  return (
    <PageShell titulo="Relatórios e Auditoria">
        <div className="w-full max-w-full mx-auto space-y-6">

          <Tabs defaultValue="comparativo" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-3 bg-muted">
              <TabsTrigger value="comparativo">Crescimento</TabsTrigger>
              <TabsTrigger value="vendas">Histórico de Vendas</TabsTrigger>
              <TabsTrigger value="caixas">Auditoria de Caixas</TabsTrigger>
            </TabsList>

            <TabsContent value="comparativo" className="outline-none mt-0">
              <ComparativoView />
            </TabsContent>

            <TabsContent value="vendas" className="outline-none mt-0">
              <VendasView />
            </TabsContent>

            <TabsContent value="caixas" className="outline-none mt-0">
              <CaixasView />
            </TabsContent>
          </Tabs>

        </div>
    </PageShell>
  );
}
