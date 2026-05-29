import { useState } from "react";
import { useNavigate } from "@tanstack/react-router"; // Assumindo TanStack Router conforme sua documentação
import { useAuthStore } from "@/store/useAuthStore";
import { useUsuarioMe } from "../hooks/useUsuarioMe";

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, ShieldCheck } from "lucide-react";

// Utilitário para formatar a Role do Backend para exibição amigável
const formatarRole = (role?: string) => {
  if (!role) return "Usuário";
  if (role.includes("ADMIN")) return "Administrador";
  if (role.includes("GERENTE")) return "Gerente da Loja";
  if (role.includes("OPERADOR")) return "Operador de Caixa";
  return role;
};

export function UserAvatarDropdown() {
  const navigate = useNavigate();
  const { usuario, isLoading } = useUsuarioMe();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  if (isLoading || !usuario) {
    return <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />;
  }

  const iniciais = usuario.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    clearAuth();
    navigate({ to: "/login" });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none cursor-pointer">
          <Avatar className="w-10 h-10 border-2 border-primary/10 hover:opacity-85 transition-opacity shadow-sm">
            <AvatarImage src={usuario.avatarUrl || undefined} alt={usuario.nome} />
            <AvatarFallback className="bg-primary text-white text-xs font-bold">
              {iniciais}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64 bg-white shadow-xl rounded-xl p-1 border border-gray-100">
          <DropdownMenuLabel className="px-3 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 truncate">{usuario.nome}</span>
              <span className="text-xs text-gray-500 font-medium truncate flex items-center gap-1.5 mt-1">
                <ShieldCheck size={14} className="text-primary" /> {formatarRole(usuario.role)}
              </span>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 cursor-pointer rounded-lg hover:bg-gray-50"
            onSelect={() => navigate({ to: '/configuracoes' })}
          >
            <Settings size={16} className="text-gray-500" />
            Configurações da Conta
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 cursor-pointer rounded-lg hover:bg-red-50 focus:bg-red-50"
            onSelect={(e) => { e.preventDefault(); setIsLogoutOpen(true); }}
          >
            <LogOut size={16} />
            Sair do Sistema
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de Confirmação de Logout Protegido */}
      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do Sistema?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja encerrar a sua sessão? Você precisará fazer login novamente para acessar o sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
              Sim, encerrar sessão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}