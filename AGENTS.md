# SellionPDV — Contexto do Projeto (Frontend)

SellionPDV é um POS SaaS multi-tenant para franquias alimentícias, em produção. Este arquivo fornece contexto persistente para o Codex.

## Stack

- **Framework:** React 18 + TypeScript + Vite
- **Estilização:** Tailwind CSS v4 + shadcn/ui (componentes Radix UI)
- **Roteamento:** TanStack Router (flat routes)
- **Data fetching:** TanStack React Query (useQuery + useMutation)
- **Estado global:** Zustand (`useAuthStore`)
- **Formulários:** react-hook-form + zod + Controller
- **Inputs numéricos:** react-number-format (`NumericFormat`)
- **Datas:** date-fns com locale ptBR
- **HTTP:** axios com interceptor JWT em `src/services/api.ts`

## Arquitetura — Feature-Sliced Design (FSD)

```
src/
├── features/
│   ├── auth/                  # Login
│   ├── pdv/                   # Frente de caixa (produto grid, carrinho, checkout)
│   ├── caixa/                 # Controle de caixa
│   └── backoffice/
│       ├── catalogo/          # Catálogo de produtos e categorias
│       ├── dashboard/         # KPIs e gráficos
│       ├── equipe/            # Funcionários
│       ├── financeiro/        # Lançamentos de despesas + DRE
│       ├── maquininhas/       # Maquininhas e taxas por bandeira
│       ├── modificadores/     # Modificadores de produto
│       └── relatorios/        # Relatórios de vendas, caixa, DRE
├── components/                # Componentes globais sem estado de feature
│   └── layout/                # Header, AppSidebar
├── store/                     # Zustand stores
└── routes/root.tsx            # Todas as rotas registradas aqui
```

Cada feature segue a estrutura: `types/ → services/ → hooks/ → components/ → pages/`

## Padrão para criar uma feature nova

```
1. src/features/dominio/types/nomeFeature.ts
   - Interfaces TypeScript, union types, constantes de label
   
2. src/features/dominio/services/apiNome.ts
   - Funções axios puras: listar(), criar(), atualizar(), excluir()
   
3. src/features/dominio/hooks/useNome.ts
   - useQuery para GET com queryKey + queryFn
   - useMutation para POST/PUT/DELETE com onSuccess → invalidateQueries
   
4. src/features/dominio/components/NomeFormModal.tsx
   - react-hook-form + zod + Controller para todos os campos
   
5. src/features/dominio/pages/NomePage.tsx
   - Importa Header + hook + componentes
   
6. src/routes/root.tsx
   - Adicionar lazy import: const NomePage = lazy(...)
   - Adicionar createRoute com beforeLoad: requireAdmin ou requireAuth
   - Adicionar à routeTree
   
7. src/components/layout/app-sidebar.tsx
   - Adicionar link no SidebarGroup adequado
```

## Restrições críticas (nunca violar)

| Regra | Detalhe |
|---|---|
| **react-hook-form + Controller** | Componentes shadcn/ui (Select, Checkbox, Switch, etc.) REQUEREM `Controller`. Nunca usar `register` nesses componentes |
| **NumericFormat para dinheiro** | Nunca `<input type="number">` para valores monetários. Sempre `<NumericFormat ... customInput={Input}>` |
| **Radix UI SelectItem sem string vazia** | `value=""` causa erro em runtime. Usar sentinel como `"NENHUMA"` e mapear para `null` no `onValueChange` |
| **Fragment em condicionais admin** | `{isAdmin && (...)}` aceita apenas uma raiz. Para múltiplos filhos: `{isAdmin && (<>...<A/><B/></>)}` |
| **Rotas sempre flat** | TanStack Router usa rotas flat em `root.tsx`. Não criar sub-routers ou route trees aninhados |
| **Datas com UTC offset** | `new Date("2025-01-15")` resulta em 23h do dia anterior em UTC-3. Sempre usar `new Date(str + "T12:00:00")` ou `parseISO` do date-fns |
| **Invalidar queries após mutação** | Todo `useMutation` deve ter `onSuccess: () => queryClient.invalidateQueries({queryKey: [...]})` |

## Estado de autenticação

```ts
// src/store/useAuthStore.ts
const { user, token, isAuthenticated, clearAuth } = useAuthStore()

// user.role é 'ROLE_ADMIN' ou 'ROLE_OPERADOR'
const isAdmin = user?.role === 'ROLE_ADMIN'
```

## Padrão de formulário (modelo de referência)

```tsx
const schema = z.object({
  nome: z.string().min(1, "Obrigatório"),
  valor: z.number().positive("Deve ser positivo"),
  categoria: z.enum(["A", "B"]),
})

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: { nome: "", valor: 0, categoria: "A" },
})

// Para campos shadcn/ui:
<Controller
  control={form.control}
  name="categoria"
  render={({ field }) => (
    <Select value={field.value} onValueChange={field.onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="A">Opção A</SelectItem>
      </SelectContent>
    </Select>
  )}
/>
```

## Documentação de referência

- `docs/CODING_GUIDE.md` — regras detalhadas de código e padrões
- `docs/ARCHITECTURE.md` — arquitetura completa e decisões técnicas
- `docs/API_CONTRACT.md` — padrões de integração com o backend
- `docs/BUSINESS_RULES.md` — regras de negócio do sistema
- `docs/Contrato_Rotas_API.md` — todos os endpoints com request/response
- `docs/specs/SPEC_TEMPLATE.md` — template para especificar novas features (SDD)
