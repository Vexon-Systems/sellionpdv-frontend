import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, LogOut, ChefHat, Inbox, SlidersHorizontal } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import sellionLogoFullNeg from '@/assets/logo_sellion_negativa.png';
import sellionSimbolo from '@/assets/simbolo_sellion.png';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";

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

            <TooltipProvider delayDuration={300}>
              <SidebarMenu className="flex flex-col gap-1">

                {/* Item 1: PDV */}
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild className="text-white hover:bg-blue-800 transition duration-300 hover:text-white py-5">
                        <Link to="/" activeProps={{ className: "bg-linear-to-br from-blue-900 to-blue-600 text-white font-bold"}}>
                          <ShoppingCart size={20} color="white"/>
                          <span className="ml-1 text-2sm">Frente de Caixa</span>
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    
                    <TooltipContent side="right" className="bg-black text-white border-none shadow-lg">
                      <p className="text-sm">Acesse o PDV para realizar vendas rápidas</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>

                {/* Item 3: Controle de Caixa */}
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild className="text-white hover:bg-blue-800 transition duration-300 hover:text-white py-5">
                        <Link to="/caixa" activeProps={{ className: "bg-linear-to-br from-blue-900 to-blue-600 text-white font-medium"}}>
                          <Inbox color="white" />
                          <span className="ml-1 text-2sm">Controle de Caixa</span>
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    
                    <TooltipContent side="right" className="bg-black text-white border-none shadow-lg">
                      <p className="text-sm">Gerencie aberturas, fechamentos e sangrias</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>

              </SidebarMenu>
            </TooltipProvider>


          </SidebarGroupContent>
        </SidebarGroup>

        {/* Grupo de Gestão */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-white/70 mb-1">Gestão</SidebarGroupLabel>
          <SidebarGroupContent>

            <TooltipProvider delayDuration={300}>
              <SidebarMenu className="flex flex-col gap-1">

                {/* Item 1: Catalálo de Produtos */}
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild className="text-white hover:bg-blue-800 transition duration-300 hover:text-white py-5">
                        <Link to="/catalogo" activeProps={{ className: "bg-linear-to-br from-blue-900 to-blue-600 text-white font-medium"}}>
                          <ChefHat />
                          <span className="ml-1 text-sm">Catálogo & Ficha Técnica</span>
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>

                    <TooltipContent side="right" className="bg-black text-white border-none shadow-lg">
                      <p className="text-sm">Gerencie o catálogo de produtos</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>

                {/* Item 2: Modificadores */}
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild className="text-white hover:bg-blue-800 transition duration-300 hover:text-white py-5">
                        <Link to="/modificadores" activeProps={{ className: "bg-linear-to-br from-blue-900 to-blue-600 text-white font-medium"}}>
                          <SlidersHorizontal />
                          <span className="ml-1 text-sm">Modificadores</span>
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>

                    <TooltipContent side="right" className="bg-black text-white border-none shadow-lg">
                      <p className="text-sm">Gerencie os grupos de modificadores</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              
              </SidebarMenu>
            </TooltipProvider>

          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Rodapé */}
      <SidebarFooter className="bg-primary mt-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-white/70 mb-1">Configurações e Sair</SidebarGroupLabel>
          <SidebarGroupContent>
            <TooltipProvider>
              <SidebarMenu className="flex flex-col gap-1">
                <SidebarMenuItem>
                  
                  <AlertDialog>
                    <Tooltip>
                      <AlertDialogTrigger asChild>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton 
                            className="text-white hover:bg-red-500/20 hover:text-red-200 py-5 cursor-pointer"
                          >
                            <LogOut className="text-red-400" size={20} />
                            <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                              Sair
                            </span>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                      </AlertDialogTrigger>
                      
                      <TooltipContent side="right" className="bg-black text-red-400 border-none shadow-lg">
                        <p className="text-sm">Sair do SellionPDV</p>
                      </TooltipContent>
                    </Tooltip>

                    <AlertDialogContent className="bg-white border-none">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-900">Deseja mesmo sair?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600">
                          Sua sessão atual será encerrada e você precisará fazer login novamente para acessar o sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-slate-200 text-slate-600 hover:bg-slate-100">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleLogout}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Confirmar Saída
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                </SidebarMenuItem>
              </SidebarMenu>
            </TooltipProvider>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  )

}

