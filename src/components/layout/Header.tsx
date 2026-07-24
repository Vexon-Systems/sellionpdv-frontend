import type { ReactNode } from "react";
import { PanelLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import { UserAvatarDropdown } from "@/features/usuarios/components/UserAvatarDropdown";

interface HeaderProps {
  titulo: string;
  subtitulo?: ReactNode;
  acoes?: ReactNode;
}

export function Header({ titulo, subtitulo, acoes }: HeaderProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b bg-surface-raised px-4 py-3 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon-lg" onClick={toggleSidebar} className="shrink-0" aria-label="Alternar navegação lateral" title="Alternar navegação lateral">
          <PanelLeft aria-hidden="true" />
        </Button>
        <Separator orientation="vertical" className="hidden h-6 sm:block" />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-foreground md:text-xl">{titulo}</h1>
          {subtitulo && <div className="mt-0.5 truncate text-sm text-muted-foreground">{subtitulo}</div>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {acoes}
        <UserAvatarDropdown />
      </div>
    </header>
  );
}
