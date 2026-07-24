import { useState } from "react";
import { useNavigate } from "@tanstack/react-router"; // Assumindo TanStack Router conforme sua documentação
import { useLogout } from "@/features/auth/hooks/useLogout";
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
  const handleLogout = useLogout();

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  if (isLoading || !usuario) {
    return <div className="size-9 rounded-full bg-muted animate-pulse" aria-label="Carregando perfil" />;
  }

  const iniciais = usuario.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
          <Avatar className="size-9 border border-border shadow-sm transition-opacity hover:opacity-85">
            <AvatarImage src={usuario.avatarUrl || undefined} alt={usuario.nome} />
            <AvatarFallback className="bg-primary text-white text-xs font-bold">
              {iniciais}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64 rounded-xl border-border bg-popover p-1 shadow-floating">
          <DropdownMenuLabel className="px-3 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground truncate">{usuario.nome}</span>
              <span className="text-xs text-muted-foreground font-medium truncate flex items-center gap-1.5 mt-1">
                <ShieldCheck size={14} className="text-primary" /> {formatarRole(usuario.role)}
              </span>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-foreground focus:bg-muted"
            onSelect={() => navigate({ to: '/configuracoes' })}
          >
            <Settings size={16} className="text-muted-foreground" />
            Configurações da Conta
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-destructive focus:bg-destructive/10"
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
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-white hover:bg-destructive/90">
              Sim, encerrar sessão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
