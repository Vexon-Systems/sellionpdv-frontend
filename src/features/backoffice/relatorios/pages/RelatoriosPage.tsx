import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DreView } from "../components/DreView";
import { VendasView } from "../components/VendasView";
import { CaixasView } from "../components/CaixasView";
import { ComparativoView } from "../components/ComparativoView";

export function RelatoriosPage() {
  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">
      <Header titulo="Relatórios e Auditoria" />

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="w-full max-w-full mx-auto space-y-6">
          
          <Tabs defaultValue="comparativo" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-4 bg-gray-200">
              <TabsTrigger value="comparativo">Crescimento</TabsTrigger>
              <TabsTrigger value="dre">DRE Gerencial</TabsTrigger>
              <TabsTrigger value="vendas">Histórico de Vendas</TabsTrigger>
              <TabsTrigger value="caixas">Auditoria de Caixas</TabsTrigger>
            </TabsList>

            <TabsContent value="comparativo" className="outline-none mt-0">
              <ComparativoView />
            </TabsContent>

            <TabsContent value="dre" className="outline-none mt-0">
              <DreView />
            </TabsContent>

            <TabsContent value="vendas" className="outline-none mt-0">
              <VendasView />
            </TabsContent>

            <TabsContent value="caixas" className="outline-none mt-0">
              <CaixasView />
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
}