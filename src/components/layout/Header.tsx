import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PanelLeft, Bell } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";
import { Separator } from "../ui/separator";

interface HeaderProps {
    titulo: string;
}

export function Header({ titulo}: HeaderProps){
    const { user } = useAuthStore();

    const dataAtual = new Date().toLocaleDateString('pt-br', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).replace(' de', '');

    const getIniciais = (nome?: string) => {
        if (!nome) return "US";
            const partes = nome.split(" ");
        if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();

        return nome.substring(0, 2).toUpperCase();
    };

    const { toggleSidebar } = useSidebar();

    return (
        <header className="flex justify-between items-center bg-white border-b border-gray-200 px-8 py-2 shrink-0">
            
            {/* Título e Sub-título */}
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

            <div className="flex items-center gap-3">
        
                {/* Data */}
                {/* <div className="flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 rounded-md text-sm text-gray-600 shadow-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium capitalize">{dataAtual}</span>
                </div> */}

                {/* Sino de Notificações */}
                <Button className="w-9 h-9 rounded-full bg-gray-100 border-accent cursor-pointer hover:bg-gray-300 transition-all">
                    <Bell className="text-gray-600"/>
                </Button>

                {/* Avatar do Usuário */}
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                    <AvatarImage src="" alt={user?.nome} />
                    <AvatarFallback className="bg-blue-900 text-white font-bold">
                        {getIniciais(user?.nome)}
                    </AvatarFallback>
                </Avatar>
                
            </div>
        </header>
    )
}