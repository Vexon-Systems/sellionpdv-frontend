# Spec: [Nome da Feature]

**Status:** `Rascunho` | `Em Revisão` | `Aprovado` | `Implementado`  
**Data:** YYYY-MM-DD  
**Autor:** [nome]  
**Branch:** `feature/nome-da-feature`

---

## 1. Contexto e Problema

> Por que esta feature é necessária? Qual dor ou necessidade de negócio ela resolve?
> Referencie tickets, feedbacks de usuário, ou decisões de produto se houver.

---

## 2. User Stories

- Como **[role: admin / operador / cliente]**, quero **[ação]**, para **[benefício]**.
- Como **[role]**, quero **[ação]**, para **[benefício]**.

---

## 3. Fora de Escopo

> O que explicitamente **não** será feito nesta iteração. Isso evita scope creep durante a implementação.

- Não incluído: [exemplo: relatório PDF desta feature]
- Não incluído: [exemplo: integração com sistema externo X]

---

## 4. Modelo de Dados (Backend)

### Novas tabelas / colunas

```sql
-- Migration a executar no Supabase antes da implementação

CREATE TABLE nome_tabela (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    -- campos do domínio
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice de tenant para performance
CREATE INDEX idx_nome_tabela_tenant ON nome_tabela(tenant_id);
```

### Entidades afetadas

| Entidade | Mudança |
|---|---|
| `NomeEntidade` | Adicionar campo `nomeCampo: Tipo` |
| `OutraEntidade` | Sem mudança |

### Enums novos

```java
public enum NomeEnum {
    VALOR_A, VALOR_B, VALOR_C
}
```

---

## 5. API Backend

### Endpoints

| Método | Path | Auth | Request Body | Response |
|--------|------|------|--------------|----------|
| `GET` | `/api/dominio` | ADMIN | — | `List<NomeResponseDTO>` |
| `POST` | `/api/dominio` | ADMIN | `NomeRequestDTO` | `NomeResponseDTO` |
| `PUT` | `/api/dominio/{id}` | ADMIN | `NomeRequestDTO` | `NomeResponseDTO` |
| `DELETE` | `/api/dominio/{id}` | ADMIN | — | `204 No Content` |

### DTOs

```java
// Request
public record NomeRequestDTO(
    @NotBlank String nome,
    @NotNull @Positive BigDecimal valor,
    @NotNull NomeEnum categoria
) {}

// Response
public record NomeResponseDTO(
    Long id,
    String nome,
    BigDecimal valor,
    NomeEnum categoria,
    OffsetDateTime criadoEm
) {
    public NomeResponseDTO(NomeEntidade e) {
        this(e.getId(), e.getNome(), e.getValor(), e.getCategoria(), e.getCriadoEm());
    }
}
```

---

## 6. Frontend

### Rota

| Rota | Page | Auth |
|---|---|---|
| `/nome-feature` | `NomeFeaturePage` | ADMIN |

### Componentes novos

| Componente | Responsabilidade |
|---|---|
| `NomeFeaturePage.tsx` | Página principal com listagem e navegação |
| `NomeFormModal.tsx` | Modal de criação e edição (react-hook-form + zod) |

### Hooks

```ts
// features/dominio/hooks/useNomeDominio.ts
useNomeDominio(params) → {
  dados: NomeDTO[]
  isLoading: boolean
  isError: boolean
  criar: (payload) → void
  atualizar: ({ id, payload }) → void
  excluir: (id) → void
  isSalvando: boolean
  isExcluindo: boolean
}
```

### Sidebar

- Adicionar item em `app-sidebar.tsx` no grupo `[Gestão | Financeiro | Operação]`
- Ícone sugerido: `[NomeIcone]` do lucide-react

---

## 7. Regras de Negócio e Validações

- [ ] [Ex.: valor deve ser maior que zero]
- [ ] [Ex.: descrição é obrigatória, mínimo 3 caracteres]
- [ ] [Ex.: não pode existir dois registros com o mesmo nome para o mesmo tenant]
- [ ] [Ex.: hard delete / soft delete — qual se aplica?]

---

## 8. Critérios de Aceite

> Cada item deve ser testável de forma objetiva.

- [ ] Admin consegue criar um registro via modal — aparece na listagem imediatamente
- [ ] Admin consegue editar um registro existente — valores são pré-preenchidos no modal
- [ ] Admin consegue excluir com confirmação via AlertDialog
- [ ] Usuário sem role ADMIN não consegue acessar a rota (redireciona para `/`)
- [ ] Validações do formulário exibem mensagens de erro visíveis ao usuário
- [ ] Backend rejeita request inválido com status 400 e mensagem descritiva

---

## 9. Dependências

> Outras features, migrations ou configurações que precisam existir antes da implementação.

- [ ] Migration da tabela `nome_tabela` executada no Supabase
- [ ] [Outra feature ou pré-requisito, se houver]

---

## 10. Notas de Implementação

> Campo livre para decisões técnicas, trade-offs ou alertas que surgirem durante a spec.

---

*Template: `docs/specs/SPEC_TEMPLATE.md` — copiar este arquivo para `docs/specs/NOME_FEATURE.md` ao iniciar uma nova spec.*
