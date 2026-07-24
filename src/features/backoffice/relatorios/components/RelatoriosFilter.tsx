import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2, FileDown } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface FiltroPeriodoProps {
  titulo: string;
  subtitulo: string;
  date: DateRange | undefined;
  tabAtiva: string;
  isLoading?: boolean;
  onTabChange: (valor: string) => void;
  onCalendarChange: (novoRange: DateRange | undefined) => void;
  onExportarPdf?: () => void;
  isExportando?: boolean;
}

export function RelatoriosFilter({
  titulo,
  subtitulo,
  date,
  tabAtiva,
  isLoading,
  onTabChange,
  onCalendarChange,
  onExportarPdf,
  isExportando
}: FiltroPeriodoProps) {
  return (
    <Card className="print:hidden">
      <CardContent className="px-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{titulo}</h2>
          <p className="text-sm text-muted-foreground">{subtitulo}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          
          <Tabs value={tabAtiva} onValueChange={onTabChange} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 bg-muted">
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

          {onExportarPdf && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={onExportarPdf}
              disabled={isExportando}
            >
              {isExportando ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              Exportar PDF
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
