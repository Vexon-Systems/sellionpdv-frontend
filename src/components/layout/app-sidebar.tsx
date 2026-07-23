import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ChefHat,
  ClipboardList,
  CreditCard,
  Inbox,
  LogOut,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Users,
  Wallet,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import sellionLogoFullNeg from "@/assets/logo_sellion_negativa.png";
import sellionSimbolo from "@/assets/simbolo_sellion.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

type NavigationItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  description: string;
};

const navigation = {
  operacao: [
    { label: "Frente de Caixa", to: "/", icon: ShoppingCart, description: "Realize vendas rápidas" },
    { label: "Controle de Caixa", to: "/caixa", icon: Inbox, description: "Aberturas, fechamentos e sangrias" },
  ],
  gestao: [
    { label: "Catálogo e Ficha Técnica", to: "/catalogo", icon: ChefHat, description: "Produtos e ficha técnica" },
    { label: "Modificadores", to: "/modificadores", icon: SlidersHorizontal, description: "Grupos de modificadores" },
    { label: "Dashboard", to: "/dashboard", icon: BarChart3, description: "Indicadores do negócio" },
    { label: "Relatórios", to: "/relatorios", icon: ClipboardList, description: "Relatórios e auditoria" },
    { label: "Equipe", to: "/equipe", icon: Users, description: "Gestão da equipe" },
    { label: "Maquininhas", to: "/maquininhas", icon: CreditCard, description: "Meios de pagamento" },
  ],
  financeiro: [
    { label: "Financeiro", to: "/financeiro", icon: Wallet, description: "Despesas e DRE gerencial" },
  ],
} satisfies Record<string, NavigationItem[]>;

function NavigationGroup({ label, items }: { label: string; items: NavigationItem[] }) {
  return (
    <SidebarGroup className="px-2 py-2">
      <SidebarGroupLabel className="px-2 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/60">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map(({ label: itemLabel, to, icon: Icon, description }) => (
            <SidebarMenuItem key={to}>
              <SidebarMenuButton
                asChild
                size="lg"
                tooltip={{ children: description, className: "max-w-56" }}
                className="h-10 rounded-lg px-2.5 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-sm"
              >
                <Link
                  to={to}
                  activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm" }}
                >
                  <Icon aria-hidden="true" />
                  <span>{itemLabel}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { user } = useAuthStore();
  const handleLogout = useLogout();
  const isAdmin = user?.role === "ROLE_ADMIN";

  return (
    <TooltipProvider delayDuration={250}>
      <Sidebar
        variant="inset"
        collapsible="icon"
        className="border-none bg-primary text-primary-foreground [--sidebar:var(--primary)] [--sidebar-foreground:var(--primary-foreground)] [--sidebar-primary:oklch(0.3_0.075_268)] [--sidebar-primary-foreground:var(--primary-foreground)] [--sidebar-accent:oklch(1_0_0_/_10%)] [--sidebar-accent-foreground:var(--primary-foreground)] [--sidebar-border:oklch(1_0_0_/_12%)] [--sidebar-ring:var(--ring)]"
      >
        <SidebarHeader className="h-16 items-center justify-center border-b border-sidebar-border bg-sidebar px-3 py-3">
          <img src={sellionLogoFullNeg} alt="Sellion" className="h-8 w-32 object-contain group-data-[collapsible=icon]:hidden" />
          <img src={sellionSimbolo} alt="Sellion" className="hidden size-8 object-contain group-data-[collapsible=icon]:block" />
        </SidebarHeader>

        <SidebarContent className="bg-sidebar py-2">
          <NavigationGroup label="Operação" items={navigation.operacao} />
          {isAdmin && <>
            <NavigationGroup label="Gestão" items={navigation.gestao} />
            <NavigationGroup label="Financeiro" items={navigation.financeiro} />
          </>}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-2">
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="lg"
                tooltip="Configurações da conta"
                className="h-10 rounded-lg px-2.5 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
              >
                <Link
                  to="/configuracoes"
                  activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" }}
                >
                  <Settings aria-hidden="true" />
                  <span>Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <SidebarMenuButton size="lg" tooltip="Encerrar sessão" className="h-10 rounded-lg px-2.5 text-sidebar-foreground/80 hover:bg-destructive/15 hover:text-primary-foreground">
                    <LogOut className="text-destructive" aria-hidden="true" />
                    <span>Sair</span>
                  </SidebarMenuButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deseja mesmo sair?</AlertDialogTitle>
                    <AlertDialogDescription>Sua sessão atual será encerrada e será necessário fazer login novamente.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-destructive text-white hover:bg-destructive/90">Confirmar saída</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
