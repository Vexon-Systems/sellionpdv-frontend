import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardFiltersProps {
    date: DateRange | undefined;
    tabAtiva: string;
    onTabChange: (valor: string) => void;
    onCalendarChange: (novoRange: DateRange | undefined) => void;
    onRefresh: () => void;
    isRefreshing: boolean;
}

export function DashboardFilters({
    date,
    tabAtiva,
    onTabChange,
    onCalendarChange,
    onRefresh,
    isRefreshing,
}: DashboardFiltersProps) {
    return (
        <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-xl border bg-surface-raised px-4 py-3 xl:flex-row xl:items-center">
            <div>
                <h2 className="text-lg font-semibold text-foreground">Visão Geral</h2>
                <p className="text-sm text-muted-foreground">Acompanhe o desempenho da sua loja em tempo real.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Tabs value={tabAtiva} onValueChange={onTabChange} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-3 bg-muted">
                        <TabsTrigger value="hoje" className="transition-all duration-300 ease-out">Hoje</TabsTrigger>
                        <TabsTrigger value="7dias" className="transition-all duration-300 ease-out">7 Dias</TabsTrigger>
                        <TabsTrigger value="mes" className="transition-all duration-300 ease-out">Este Mês</TabsTrigger>
                        <TabsTrigger value="custom" className="hidden">Custom</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    title="Atualizar dados"
                    className="shrink-0"
                >
                    <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                </Button>

                <div className="grid gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant="outline"
                                className={cn(
                                    "w-65 justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "dd 'de' MMM", { locale: ptBR })} -{" "}
                                            {format(date.to, "dd 'de' MMM, yyyy", { locale: ptBR })}
                                        </>
                                    ) : (
                                        format(date.from, "dd 'de' MMM, yyyy", { locale: ptBR })
                                    )
                                ) : (
                                    <span>Selecione um período</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={onCalendarChange}
                                numberOfMonths={2}
                                locale={ptBR}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
}
