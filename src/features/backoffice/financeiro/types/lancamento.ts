export type CategoriaLancamento =
    | "ALUGUEL"
    | "ENERGIA"
    | "AGUA"
    | "INTERNET_TELEFONE"
    | "CONTADOR"
    | "FOLHA_PAGAMENTO"
    | "PRO_LABORE"
    | "COMPRA_MERCADORIA"
    | "EMBALAGENS_MATERIAIS"
    | "IMPOSTOS"
    | "TAXAS_BANCARIAS"
    | "MANUTENCAO"
    | "MARKETING"
    | "OUTROS"

export const CATEGORIA_LABELS: Record<CategoriaLancamento, string> = {
    ALUGUEL: "Aluguel",
    ENERGIA: "Energia Elétrica",
    AGUA: "Água e Saneamento",
    INTERNET_TELEFONE: "Internet / Telefone",
    CONTADOR: "Contador / Honorários",
    FOLHA_PAGAMENTO: "Folha de Pagamento",
    PRO_LABORE: "Pró-labore",
    COMPRA_MERCADORIA: "Compra de Mercadoria",
    EMBALAGENS_MATERIAIS: "Embalagens / Materiais",
    IMPOSTOS: "Impostos (MEI / Simples)",
    TAXAS_BANCARIAS: "Taxas Bancárias",
    MANUTENCAO: "Manutenção / Reparos",
    MARKETING: "Marketing / Publicidade",
    OUTROS: "Outros",
}

export const CATEGORIAS_AGRUPADAS = [
    {
        grupo: "Custos Operacionais",
        itens: ["ALUGUEL", "ENERGIA", "AGUA", "INTERNET_TELEFONE", "CONTADOR"] as CategoriaLancamento[],
    },
    {
        grupo: "Pessoal",
        itens: ["FOLHA_PAGAMENTO", "PRO_LABORE"] as CategoriaLancamento[],
    },
    {
        grupo: "Mercadorias e Insumos",
        itens: ["COMPRA_MERCADORIA", "EMBALAGENS_MATERIAIS"] as CategoriaLancamento[],
    },
    {
        grupo: "Impostos e Taxas",
        itens: ["IMPOSTOS", "TAXAS_BANCARIAS"] as CategoriaLancamento[],
    },
    {
        grupo: "Outros",
        itens: ["MANUTENCAO", "MARKETING", "OUTROS"] as CategoriaLancamento[],
    },
]

export interface LancamentoDTO {
    id: number
    descricao: string
    valor: number
    categoria: CategoriaLancamento
    dataReferencia: string
    criadoEm: string
}

export interface LancamentoPayloadDTO {
    descricao: string
    valor: number
    categoria: CategoriaLancamento
    dataReferencia: string
}
