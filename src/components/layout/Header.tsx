import { PanelLeft, Bell } from "lucide-react";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";
import { Separator } from "../ui/separator";

import { UserAvatarDropdown } from "@/features/usuarios/components/UserAvatarDropdown";

interface HeaderProps {
    titulo: string;
}

export function Header({ titulo }: HeaderProps){
    const { toggleSidebar } = useSidebar();

    return (
        <header className="flex justify-between items-center bg-white border-b border-gray-200 px-8 py-2 shrink-0">
            
            {/* Título e Botão Lateral */}
            <div className="flex items-center gap-3">
                <Button
                    onClick={toggleSidebar} 
                    className="text-primary transition duration-300 bg-transparent hover:bg-gray-100 hover:text-black py-3 cursor-pointer"
                >
                    <PanelLeft size={20} />
                </Button>
                <Separator orientation="vertical"/>
                <h1 className="text-xl font-semibold text-gray-900">{titulo}</h1>
            </div>

            {/* Ações e Perfil */}
            <div className="flex items-center gap-3">
                
                {/* Sino de Notificações */}
                <Button className="w-9 h-9 rounded-full bg-gray-100 border-accent cursor-pointer hover:bg-gray-300 transition-all">
                    <Bell className="text-gray-600"/>
                </Button>

                <UserAvatarDropdown />
                
            </div>
        </header>
    );
}