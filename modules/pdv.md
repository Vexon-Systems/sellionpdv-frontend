# Módulo: Frente de Caixa (PDV)

## 1. Visão Geral do Módulo
* **Objetivo:** Interface principal de operação diária para registrar vendas de forma rápida e intuitiva. 
* **Atores:** OPERADOR e ADMIN.
* **Pré-requisito:** O sistema deve obrigatoriamente checar se existe um turno aberto (`GET /api/caixa/atual`). Se retornar 404 (nenhum caixa aberto), a tela do PDV deve ser bloqueada.

## 2. Estrutura de Dados (Modelagem)
Este módulo manipula estritamente as seguintes entidades no banco de dados:
* **Venda:** Armazena a transação "cabeçalho" (`tenant_id`, `caixa_id`, `forma_pagamento`, `maquininha_id`, `subtotal`, `desconto_aplicado`, `total_final`, `idempotency_key`, `status`).
* **ItemVenda:** Armazena o produto vendido. Grava um snapshot estático do `preco_unitario_cobrado`.
* **ItemVendaModificadores:** Armazena as opções de modificadores escolhidas para aquele item (ex: Adicional de Nutella), com a `quantidade` e `preco_adicional_cobrado`.

## 3. Contratos de API Específicos (Endpoints)
* **`GET /api/produtos`**
  * **Uso:** Carrega o catálogo na tela do PDV.
  * **Comportamento:** Retorna uma Árvore JSON Profunda (Nested) contendo os produtos, seus grupos de modificadores e opções ativas. O Frontend deve fazer cache disso na memória (RAM) para zerar a latência durante a venda.
* **`POST /api/vendas`**
  * **Uso:** Finaliza o carrinho de compras.
  * **Regra de Segurança:** O cabeçalho `Idempotency-Key` (UUID) é OBRIGATÓRIO.
  * **Payload esperado:** Array de `itens` (com seus respectivos modificadores), `formaPagamento`, `descontoAplicado` e `maquininhald` (obrigatório se for DÉBITO ou CRÉDITO, `null` para PIX e DINHEIRO).
* **`POST /api/vendas/{id}/cancelar`**
  * **Uso:** Estorna uma venda concluída.
  * **Regra:** Exige payload com campo `justificativa`. Nunca deleta do banco, apenas muda o status para "CANCELADA".

## 4. Frontend (Interface e Estado)
* **Localização:** Todo o código visual deve viver em `/features/pdv`.
* **Componentes Principais:** `ProductGrid.tsx`, `CartSidebar.tsx`, `ProdutoVendaModal.tsx`, `CheckoutModal.tsx`, `SuccessView.tsx`.
* **Estado Global (Zustand):** O carrinho de compras deve ser gerenciado pelo `useCartStore.ts` (na pasta `/store`), garantindo que os itens não sejam perdidos se o operador mudar de aba acidentalmente.
* **Hooks Customizados:** A lógica complexa da tela deve ser extraída para `/hooks/usePdv.ts` e `/hooks/useFinalizarVenda.ts`.

## 5. Regras de Negócio do Domínio (Invioláveis)
1. **Zero Trust Absoluto:** O Frontend envia apenas os IDs dos produtos, IDs dos modificadores e quantidades. O subtotal e o total final enviados pelo carrinho DEVEM ser recalculados do zero pelo Backend buscando os valores originais do banco de dados (snapshot de preço).
2. **Sem Estoque:** O sistema não bloqueia vendas por falta de estoque. Se está ativo no banco, pode ser vendido.
3. **Atomicidade:** A gravação da Venda, dos Itens da Venda e dos Itens Modificadores deve ocorrer sob a mesma anotação `@Transactional` no Spring Boot. Se um falhar, tudo sofre *rollback*.