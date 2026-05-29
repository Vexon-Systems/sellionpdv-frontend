import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
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
}

export function DashboardFilters({
    date,
    tabAtiva,
    onTabChange,
    onCalendarChange
}: DashboardFiltersProps) {
    return (
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
            <div>
                <h2 className="font-bold text-gray-800 text-lg">Visão Geral</h2>
                <p className="text-gray-500 text-sm">Acompanhe o desempenho da sua loja em tempo real.</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <Tabs value={tabAtiva} onValueChange={onTabChange} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                        <TabsTrigger value="hoje" className="transition-all duration-300 ease-out">Hoje</TabsTrigger>
                        <TabsTrigger value="7dias" className="transition-all duration-300 ease-out">7 Dias</TabsTrigger>
                        <TabsTrigger value="mes" className="transition-all duration-300 ease-out">Este Mês</TabsTrigger>
                        <TabsTrigger value="custom" className="hidden">Custom</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="grid gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant="outline"
                                className={cn(
                                    "w-65 justify-start text-left font-normal border-gray-200",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
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
                        <PopoverContent className="w-auto p-0 bg-white" align="end">
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