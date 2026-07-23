import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Header } from "./Header";

interface PageShellProps {
  titulo: string;
  subtitulo?: ReactNode;
  acoes?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageShell({ titulo, subtitulo, acoes, children, className }: PageShellProps) {
  return <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-surface-sunken"><Header titulo={titulo} subtitulo={subtitulo} acoes={acoes} /><main className={cn("min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", className)}>{children}</main></div>;
}
