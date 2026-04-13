import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, LogOut, ChefHat, Inbox, PanelLeft, SlidersHorizontal } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import sellionLogoFullNeg from '@/assets/logo_sellion_negativa.png';
import sellionLogoFullPos from '@/assets/logo_sellion_positiva.png';
import sellionSimbolo from '@/assets/simbolo_sellion.png';

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
  useSidebar,
} from '@/components/ui/sidebar';

export function AppSidebar(){
  const {user, clearAuth} = useAuthStore();
  const navigate = useNavigate();

  const {toggleSidebar} = useSidebar();

  const handleLogout = () => {
    clearAuth();
    navigate({to: "/login"});
  }

  return(
    <Sidebar variant="inset" collapsible="icon" className="bg-primary text-white border-none w-65">

      {/* Topo do Sidebar */}
      <SidebarHeader className="h-16 flex justify-center items-center bg-primary">
        <img 
           src={sellionLogoFullNeg} 
           alt="Sellion" 
           className="w-32 object-contain transition-all duration-300 group-data-[collapsible=icon]:hidden" 
         />

        <img 
           src={sellionSimbolo} 
           alt="Sellion" 
           className="hidden w-10 h-10 object-contain transition-all duration-300 group-data-[collapsible=icon]:block" 
         />
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="bg-primary overflow-y-auto">

        {/* Grupo de Operação */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-white/70 mb-1">Operação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-1">

              {/* Item 1: PDV */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-white hover:bg-blue-800/70 hover:text-white py-5">
                  <Link to="/" activeProps={{ className: "bg-blue-800 text-white font-bold"}}>
                    <ShoppingCart size={20} color="white"/>
                    <span className="ml-1 text-2sm">Frente de Caixa</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Item 3: Controle de Caixa */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-white hover:bg-blue-800/70 hover:text-white py-5">
                  <Link to="/caixa" activeProps={{ className: "bg-blue-800 text-white font-medium"}}>
                    <Inbox/>
                    <span className="ml-1 text-2sm">Controle de Caixa</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>


            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Grupo de Gestão */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-white/70 mb-1">Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-1">

              {/* Item 1: Catalálo de Produtos */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-white hover:bg-blue-800/70 hover:text-white py-5">
                  <Link to="/catalogo" activeProps={{ className: "bg-blue-800 text-white font-medium"}}>
                    <ChefHat />
                    <span className="ml-1 text-sm">Catálogo & Ficha Técnica</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Item 2: Modificadores */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-white hover:bg-blue-800/70 hover:text-white py-5">
                  <Link to="/modificadores" activeProps={{ className: "bg-blue-800 text-white font-medium"}}>
                    <SlidersHorizontal />
                    <span className="ml-1 text-sm">Modificadores</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Rodapé */}
      <SidebarFooter className="bg-primary">

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-white/70 mb-1">Configurações e Sair</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-1">  

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={toggleSidebar} 
                    className="text-white hover:bg-white/10 hover:text-white py-5 cursor-pointer"
                  >
                    <PanelLeft size={20} />
                    <span className="ml-1 text-sm font-semibold">Recolher Menu</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>        

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-white hover:bg-red-500/20 hover:text-red-200 py-5">
                  <Link to="/" activeProps={{ className: 'font-semibold' }}>
                    <LogOut className="text-red-400"/>
                    <span className="ml-1 text-sm">Sair</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  )

}

