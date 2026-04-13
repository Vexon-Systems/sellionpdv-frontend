import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown, Store } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface HeaderProps {
    titulo: string;
    subtitulo: string;
}

export function Header({ titulo, subtitulo}: HeaderProps){
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

    return (
        <header className="flex justify-between items-center bg-white border-b border-gray-200 px-8 py-2 shrink-0">
            {/* Título e Sub-título */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
                <p className="text-sm text-gray-500">{subtitulo}</p>
            </div>

            <div className="flex items-center gap-4">
        
                {/* Data */}
                <div className="flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 rounded-md text-sm text-gray-600 shadow-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium capitalize">{dataAtual}</span>
                </div>

                {/* Dropdown de Loja/Franquia */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 rounded-md text-sm text-gray-700 shadow-sm hover:bg-gray-50 outline-none">
                        <Store size={16} className="text-gray-400" />
                            <span className="font-medium">Nome da Franquia</span>
                        <ChevronDown size={14} className="text-gray-400 ml-1" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48 bg-white">
                        <DropdownMenuLabel>Minhas Lojas</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">MySorvetes ITBA</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">MySorvetes Centro</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

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