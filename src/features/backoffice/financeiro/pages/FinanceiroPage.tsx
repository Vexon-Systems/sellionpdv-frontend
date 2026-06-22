import { useState } from "react"
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, AlertCircle, TrendingDown, AlignJustify, TrendingUp } from "lucide-react"

import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { DreView } from "@/features/backoffice/relatorios/components/DreView"
import { LancamentoFormModal } from "../components/LancamentoFormModal"
import { useLancamentos } from "../hooks/useLancamentos"
import { CATEGORIA_LABELS, type LancamentoDTO } from "../types/lancamento"

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

    const handleSalvar = (dados: any, id?: number) => {
        const payload = {
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

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">
            <Header titulo="Financeiro" />

            <div className="flex-1 overflow-y-auto p-4 md:px-8 py-6">
                <Tabs defaultValue="lancamentos" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-sm mb-6 bg-gray-200">
                        <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
                        <TabsTrigger value="dre">DRE Gerencial</TabsTrigger>
                    </TabsList>

                    {/* ─── ABA LANÇAMENTOS ─── */}
                    <TabsContent value="lancamentos" className="outline-none mt-0 space-y-6">

                        {/* Navegação de mês + botão */}
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                                <button
                                    onClick={() => setMesReferencia((m) => subMonths(m, 1))}
                                    className="p-1 rounded hover:bg-gray-100 transition text-gray-500"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="font-semibold text-gray-800 min-w-40 text-center capitalize text-sm">
                                    {format(mesReferencia, "MMMM 'de' yyyy", { locale: ptBR })}
                                </span>
                                <button
                                    onClick={() => setMesReferencia((m) => addMonths(m, 1))}
                                    className="p-1 rounded hover:bg-gray-100 transition text-gray-500"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <Button
                                onClick={handleNovoLancamento}
                                className="bg-blue-950 hover:bg-blue-900 text-white shadow-sm rounded-lg"
                            >
                                <Plus size={15} className="mr-1.5" /> Novo Lançamento
                            </Button>
                        </div>

                        {/* Cards de resumo */}
                        {!isLoading && !isError && lancamentos.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Total do mês */}
                                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                    <div className="flex items-start justify-between mb-3">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total do Mês</p>
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                                            Saída
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 mb-1">{formatarMoeda(totalMes)}</p>
                                    <p className="text-xs text-gray-400">{lancamentos.length} lançamentos no período</p>
                                </div>

                                {/* Quantidade */}
                                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                    <div className="flex items-start justify-between mb-3">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Lançamentos</p>
                                        <AlignJustify size={14} className="text-gray-300 mt-0.5" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 mb-1">{lancamentos.length}</p>
                                    <p className="text-xs text-gray-400">registros em {nomeMes}</p>
                                </div>

                                {/* Maior despesa */}
                                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                    <div className="flex items-start justify-between mb-3">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Maior Despesa</p>
                                        <TrendingUp size={14} className="text-gray-300 mt-0.5" />
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 mb-1 truncate">
                                        {maiorDespesa ? CATEGORIA_LABELS[maiorDespesa.categoria] : "—"}
                                    </p>
                                    <p className="text-xs font-medium text-red-500">
                                        {maiorDespesa ? `${formatarMoeda(maiorDespesa.valor)} · ${maiorPct}% do total` : "—"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Carregando */}
                        {isLoading && (
                            <div className="flex justify-center py-20 text-gray-400 animate-pulse text-sm">
                                Carregando lançamentos...
                            </div>
                        )}

                        {/* Erro */}
                        {isError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3 text-sm">
                                <AlertCircle size={18} />
                                <p>Erro ao carregar os lançamentos. Tente novamente.</p>
                            </div>
                        )}

                        {/* Vazio */}
                        {!isLoading && !isError && lancamentos.length === 0 && (
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-16 flex flex-col items-center justify-center text-center bg-white">
                                <TrendingDown size={40} className="mb-3 text-gray-200" />
                                <h3 className="text-base font-semibold text-gray-600 mb-1">Nenhum lançamento em {nomeMes}</h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    Registre as despesas operacionais para um DRE completo.
                                </p>
                                <Button variant="outline" onClick={handleNovoLancamento} className="text-sm">
                                    Registrar agora
                                </Button>
                            </div>
                        )}

                        {/* Tabela editorial */}
                        {!isLoading && !isError && lancamentos.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-20">Data</th>
                                            <th className="text-left px-4 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Descrição</th>
                                            <th className="text-left px-4 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Categoria</th>
                                            <th className="text-right px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-36">Valor</th>
                                            <th className="px-4 py-3.5 w-16" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lancamentos.map((l, idx) => (
                                            <tr
                                                key={l.id}
                                                className={`group hover:bg-gray-50/70 transition-colors ${idx !== lancamentos.length - 1 ? "border-b border-gray-50" : ""}`}
                                            >
                                                <td className="px-6 py-4 text-gray-400 font-mono text-xs tabular-nums">
                                                    {format(new Date(l.dataReferencia + "T12:00:00"), "dd/MM")}
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-800">{l.descricao}</td>
                                                <td className="px-4 py-4 hidden sm:table-cell">
                                                    <span className="flex items-center gap-2 text-gray-600 text-sm">
                                                        <span
                                                            className="w-2 h-2 rounded-full shrink-0"
                                                            style={{ backgroundColor: CATEGORIA_DOT_COLOR[l.categoria] ?? "#9ca3af" }}
                                                        />
                                                        {CATEGORIA_LABELS[l.categoria]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-semibold text-gray-900 tabular-nums">
                                                    {formatarMoeda(l.valor)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditar(l)}
                                                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                                                        >
                                                            <Pencil size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => setLancamentoParaExcluir(l)}
                                                            className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
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
                        )}
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
        </div>
    )
}
