import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { NumericFormat } from "react-number-format"
import { format } from "date-fns"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

import { CATEGORIAS_AGRUPADAS, CATEGORIA_LABELS, type LancamentoDTO } from "../types/lancamento"

const CATEGORIA_VALUES = Object.keys(CATEGORIA_LABELS) as [keyof typeof CATEGORIA_LABELS, ...Array<keyof typeof CATEGORIA_LABELS>]

const schema = z.object({
    descricao: z.string().min(2, "Informe uma descrição"),
    valor: z.number({ error: "Informe o valor" }).positive("O valor deve ser positivo"),
    categoria: z.enum(CATEGORIA_VALUES, { error: "Selecione uma categoria" }),
    dataReferencia: z.string().min(1, "Informe a data"),
})

type FormInputs = z.infer<typeof schema>

interface LancamentoFormModalProps {
    isOpen: boolean
    onClose: () => void
    lancamentoEdicao?: LancamentoDTO | null
    onSalvar: (dados: FormInputs, id?: number) => void
    isSalvando: boolean
}

export function LancamentoFormModal({ isOpen, onClose, lancamentoEdicao, onSalvar, isSalvando }: LancamentoFormModalProps) {
    const hoje = format(new Date(), "yyyy-MM-dd")

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormInputs>({
        resolver: zodResolver(schema),
        defaultValues: { descricao: "", valor: undefined, categoria: undefined, dataReferencia: hoje },
    })

    useEffect(() => {
        if (lancamentoEdicao) {
            reset({
                descricao: lancamentoEdicao.descricao,
                valor: lancamentoEdicao.valor,
                categoria: lancamentoEdicao.categoria,
                dataReferencia: lancamentoEdicao.dataReferencia,
            })
        } else {
            reset({ descricao: "", valor: undefined, categoria: undefined, dataReferencia: hoje })
        }
    }, [lancamentoEdicao, isOpen, reset, hoje])

    const onSubmit = (dados: FormInputs) => {
        onSalvar(dados, lancamentoEdicao?.id)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSalvando && onClose()}>
            <DialogContent className="sm:max-w-[440px] bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        {lancamentoEdicao ? "Editar Lançamento" : "Novo Lançamento"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Registre uma despesa operacional para inclusão no DRE.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-800">Descrição</Label>
                        <Input
                            placeholder="Ex: Aluguel do ponto comercial"
                            {...register("descricao")}
                            disabled={isSalvando}
                        />
                        {errors.descricao && <p className="text-red-500 text-sm">{errors.descricao.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-800">Categoria</Label>
                        <Controller
                            control={control}
                            name="categoria"
                            render={({ field }) => (
                                <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={isSalvando}>
                                    <SelectTrigger className="w-full bg-white border-gray-200 h-10">
                                        <SelectValue placeholder="Selecione uma categoria..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {CATEGORIAS_AGRUPADAS.map((grupo) => (
                                            <SelectGroup key={grupo.grupo}>
                                                <SelectLabel className="text-xs text-gray-400 font-bold uppercase tracking-wider px-2 py-1">
                                                    {grupo.grupo}
                                                </SelectLabel>
                                                {grupo.itens.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {CATEGORIA_LABELS[cat]}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.categoria && <p className="text-red-500 text-sm">{errors.categoria.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-800">Valor (R$)</Label>
                            <Controller
                                control={control}
                                name="valor"
                                render={({ field: f }) => (
                                    <NumericFormat
                                        value={f.value ?? ""}
                                        onValueChange={(v) => f.onChange(v.floatValue)}
                                        decimalSeparator=","
                                        thousandSeparator="."
                                        decimalScale={2}
                                        fixedDecimalScale
                                        allowNegative={false}
                                        prefix="R$ "
                                        placeholder="R$ 0,00"
                                        disabled={isSalvando}
                                        className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    />
                                )}
                            />
                            {errors.valor && <p className="text-red-500 text-sm">{errors.valor.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-800">Data de referência</Label>
                            <Input
                                type="date"
                                {...register("dataReferencia")}
                                disabled={isSalvando}
                                className="h-10"
                            />
                            {errors.dataReferencia && <p className="text-red-500 text-sm">{errors.dataReferencia.message}</p>}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSalvando}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSalvando} className="bg-primary hover:bg-primary/90 text-white">
                            {isSalvando ? "Salvando..." : "Salvar Lançamento"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
