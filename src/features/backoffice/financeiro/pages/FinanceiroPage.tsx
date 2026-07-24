import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, AlertCircle, TrendingDown, AlignJustify, TrendingUp, RotateCcw } from "lucide-react"

import { PageShell } from "@/components/layout/PageShell"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { DreView } from "@/features/backoffice/relatorios/components/DreView"
import { LancamentoFormModal } from "../components/LancamentoFormModal"
import { useLancamentos } from "../hooks/useLancamentos"
import { CATEGORIA_LABELS, type LancamentoDTO, type LancamentoPayloadDTO } from "../types/lancamento"

const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)

const CATEGORIA_DOT_COLOR: Record<string, string> = {
    ALUGUEL: "#3b82f6",
    ENERGIA: "#eab308",
    AGUA: "#06b6d4",
    INTERNET_TELEFONE: "#6366f1",
    CONTADOR: "#8b5cf6",
    FOLHA_PAGAMENTO: "#a855f7",
    PRO_LABORE: "#d946ef",
    COMPRA_MERCADORIA: "#22c55e",
    EMBALAGENS_MATERIAIS: "#10b981",
    IMPOSTOS: "#f97316",
    TAXAS_BANCARIAS: "#ef4444",
    MANUTENCAO: "#78716c",
    MARKETING: "#ec4899",
    OUTROS: "#9ca3af",
}

export function FinanceiroPage() {
    const [mesReferencia, setMesReferencia] = useState(() => startOfMonth(new Date()))
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [lancamentoEdicao, setLancamentoEdicao] = useState<LancamentoDTO | null>(null)
    const [lancamentoParaExcluir, setLancamentoParaExcluir] = useState<LancamentoDTO | null>(null)

    const dataInicial = format(startOfMonth(mesReferencia), "yyyy-MM-dd")
    const dataFinal = format(endOfMonth(mesReferencia), "yyyy-MM-dd")

    const { lancamentos, isLoading, isError, criar, atualizar, excluir, isSalvando, isExcluindo } =
        useLancamentos(dataInicial, dataFinal)

    const totalMes = lancamentos.reduce((acc, l) => acc + l.valor, 0)
    const maiorDespesa = lancamentos.length > 0 ? [...lancamentos].sort((a, b) => b.valor - a.valor)[0] : null
    const maiorPct = maiorDespesa && totalMes > 0 ? Math.round((maiorDespesa.valor / totalMes) * 100) : 0
    const nomeMes = format(mesReferencia, "MMMM", { locale: ptBR })
    const mesAtual = startOfMonth(new Date())
    const exibindoMesAtual = format(mesReferencia, "yyyy-MM") === format(mesAtual, "yyyy-MM")
    const showLegacyTable = import.meta.env.DEV && false

    const handleSalvar = (dados: LancamentoPayloadDTO, id?: number) => {
        const payload: LancamentoPayloadDTO = {
            descricao: dados.descricao,
            valor: dados.valor,
            categoria: dados.categoria,
            dataReferencia: dados.dataReferencia,
        }
        if (id) {
            atualizar(
                { id, payload },
                { onSuccess: () => { setIsModalOpen(false); setLancamentoEdicao(null) } }
            )
        } else {
            criar(payload, { onSuccess: () => setIsModalOpen(false) })
        }
    }

    const handleEditar = (lancamento: LancamentoDTO) => {
        setLancamentoEdicao(lancamento)
        setIsModalOpen(true)
    }

    const handleNovoLancamento = () => {
        setLancamentoEdicao(null)
        setIsModalOpen(true)
    }

    const handleFecharModal = () => {
        setIsModalOpen(false)
        setLancamentoEdicao(null)
    }

    const colunasLancamentos = useMemo<ColumnDef<LancamentoDTO>[]>(() => [
        {
            accessorKey: "dataReferencia",
            header: "Data",
            cell: ({ row }) => (
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {format(new Date(`${row.original.dataReferencia}T12:00:00`), "dd/MM")}
                </span>
            ),
        },
        {
            accessorKey: "descricao",
            header: "Descrição",
            cell: ({ row }) => <span className="font-medium text-foreground">{row.original.descricao}</span>,
        },
        {
            accessorKey: "categoria",
            header: "Categoria",
            cell: ({ row }) => (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: CATEGORIA_DOT_COLOR[row.original.categoria] ?? "#9ca3af" }} />
                    {CATEGORIA_LABELS[row.original.categoria]}
                </span>
            ),
        },
        {
            accessorKey: "valor",
            header: "Valor",
            cell: ({ row }) => <span className="block text-right font-semibold tabular-nums text-foreground">{formatarMoeda(row.original.valor)}</span>,
        },
        {
            id: "acoes",
            enableSorting: false,
            header: "",
            cell: ({ row }) => (
                <div className="flex justify-end gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <button type="button" onClick={() => handleEditar(row.original)} className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Editar ${row.original.descricao}`}>
                        <Pencil size={14} />
                    </button>
                    <button type="button" onClick={() => setLancamentoParaExcluir(row.original)} className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Excluir ${row.original.descricao}`}>
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ], [])

    return (
        <PageShell titulo="Financeiro">
            <div>
                <Tabs defaultValue="lancamentos" className="w-full">
                    <TabsList className="mb-6 grid w-full max-w-sm grid-cols-2 bg-muted">
                        <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
                        <TabsTrigger value="dre">DRE Gerencial</TabsTrigger>
                    </TabsList>

                    {/* ─── ABA LANÇAMENTOS ─── */}
                    <TabsContent value="lancamentos" className="outline-none mt-0 space-y-6">

                        {/* Navegação de mês + botão */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="inline-flex items-center rounded-xl border bg-surface-raised p-1 shadow-card">
                                <button
                                    onClick={() => setMesReferencia((m) => subMonths(m, 1))}
                                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    aria-label="Ver mês anterior"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <div className="flex min-w-44 items-center gap-2 px-2"><CalendarDays size={16} className="text-primary" aria-hidden="true" /><div className="leading-tight"><p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Período</p><p className="text-sm font-semibold capitalize text-foreground">{format(mesReferencia, "MMMM 'de' yyyy", { locale: ptBR })}</p></div></div>
                                <button
                                    onClick={() => setMesReferencia((m) => addMonths(m, 1))}
                                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    aria-label="Ver próximo mês"
                                >
                                    <ChevronRight size={18} />
                                </button>
                              </div>
                              {!exibindoMesAtual && <Button variant="ghost" size="sm" onClick={() => setMesReferencia(mesAtual)}><RotateCcw size={15} /> Mês atual</Button>}
                            </div>

                            <Button
                                onClick={handleNovoLancamento}
                                className="shadow-sm"
                            >
                                <Plus size={15} className="mr-1.5" /> Novo Lançamento
                            </Button>
                        </div>

                        {/* Cards de resumo */}
                        {!isLoading && !isError && lancamentos.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Total do mês */}
                                <div className="rounded-xl border bg-surface-raised p-5 shadow-card">
                                    <div className="flex items-start justify-between mb-3">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total do Mês</p>
                                        <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
                                            Saída
                                        </span>
                                    </div>
                                    <p className="mb-1 text-2xl font-bold text-foreground">{formatarMoeda(totalMes)}</p>
                                    <p className="text-xs text-muted-foreground">{lancamentos.length} lançamentos no período</p>
                                </div>

                                {/* Quantidade */}
                                <div className="rounded-xl border bg-surface-raised p-5 shadow-card">
                                    <div className="flex items-start justify-between mb-3">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Lançamentos</p>
                                        <AlignJustify size={14} className="mt-0.5 text-muted-foreground" />
                                    </div>
                                    <p className="mb-1 text-2xl font-bold text-foreground">{lancamentos.length}</p>
                                    <p className="text-xs text-muted-foreground">registros em {nomeMes}</p>
                                </div>

                                {/* Maior despesa */}
                                <div className="rounded-xl border bg-surface-raised p-5 shadow-card">
                                    <div className="flex items-start justify-between mb-3">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Maior Despesa</p>
                                        <TrendingUp size={14} className="mt-0.5 text-muted-foreground" />
                                    </div>
                                    <p className="mb-1 truncate text-lg font-bold text-foreground">
                                        {maiorDespesa ? CATEGORIA_LABELS[maiorDespesa.categoria] : "—"}
                                    </p>
                                    <p className="text-xs font-medium text-destructive">
                                        {maiorDespesa ? `${formatarMoeda(maiorDespesa.valor)} · ${maiorPct}% do total` : "—"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Carregando */}
                        {isLoading && (
                            <div className="flex justify-center py-20 text-sm text-muted-foreground animate-pulse">
                                Carregando lançamentos...
                            </div>
                        )}

                        {/* Erro */}
                        {isError && (
                            <div className="flex items-center gap-3 rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
                                <AlertCircle size={18} />
                                <p>Erro ao carregar os lançamentos. Tente novamente.</p>
                            </div>
                        )}

                        {/* Vazio */}
                        {!isLoading && !isError && lancamentos.length === 0 && (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface p-16 text-center">
                                <TrendingDown size={40} className="mb-3 text-muted-foreground/40" />
                                <h3 className="mb-1 text-base font-semibold text-foreground">Nenhum lançamento em {nomeMes}</h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Registre as despesas operacionais para um DRE completo.
                                </p>
                                <Button variant="outline" onClick={handleNovoLancamento} className="text-sm">
                                    Registrar agora
                                </Button>
                            </div>
                        )}

                        {!isLoading && !isError && lancamentos.length > 0 && (
                            <DataTable
                                columns={colunasLancamentos}
                                data={lancamentos}
                                search={{ column: "descricao", placeholder: "Buscar lançamento..." }}
                                pageSize={8}
                                getRowClassName={() => "group"}
                            />
                        )}
                        {showLegacyTable && <section className="overflow-hidden border-y bg-surface-raised">
                                <div className="overflow-x-auto px-4 md:px-5">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-surface-sunken/70">
                                            <th className="w-20 px-2 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Data</th>
                                            <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Descrição</th>
                                            <th className="hidden px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:table-cell">Categoria</th>
                                            <th className="w-36 px-2 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Valor</th>
                                            <th className="px-4 py-3.5 w-16" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lancamentos.map((l, idx) => (
                                            <tr
                                                key={l.id}
                                                className={`group transition-colors hover:bg-muted/50 ${idx !== lancamentos.length - 1 ? "border-b" : ""}`}
                                            >
                                                <td className="px-2 py-4 font-mono text-xs tabular-nums text-muted-foreground">
                                                    {format(new Date(l.dataReferencia + "T12:00:00"), "dd/MM")}
                                                </td>
                                                <td className="px-4 py-4 font-medium text-foreground">{l.descricao}</td>
                                                <td className="px-4 py-4 hidden sm:table-cell">
                                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span
                                                            className="w-2 h-2 rounded-full shrink-0"
                                                            style={{ backgroundColor: CATEGORIA_DOT_COLOR[l.categoria] ?? "#9ca3af" }}
                                                        />
                                                        {CATEGORIA_LABELS[l.categoria]}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-4 text-right font-semibold tabular-nums text-foreground">
                                                    {formatarMoeda(l.valor)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditar(l)}
                                                            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                        >
                                                            <Pencil size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => setLancamentoParaExcluir(l)}
                                                            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                </div>
                            </section>}
                    </TabsContent>

                    {/* ─── ABA DRE ─── */}
                    <TabsContent value="dre" className="outline-none mt-0">
                        <DreView />
                    </TabsContent>
                </Tabs>
            </div>

            <LancamentoFormModal
                isOpen={isModalOpen}
                onClose={handleFecharModal}
                lancamentoEdicao={lancamentoEdicao}
                onSalvar={handleSalvar}
                isSalvando={isSalvando}
            />

            <AlertDialog
                open={!!lancamentoParaExcluir}
                onOpenChange={(open) => !open && setLancamentoParaExcluir(null)}
            >
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir{" "}
                            <strong>"{lancamentoParaExcluir?.descricao}"</strong>? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isExcluindo}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isExcluindo}
                            onClick={() => {
                                if (lancamentoParaExcluir) {
                                    excluir(lancamentoParaExcluir.id, {
                                        onSuccess: () => setLancamentoParaExcluir(null),
                                    })
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isExcluindo ? "Excluindo..." : "Confirmar Exclusão"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageShell>
    )
}
