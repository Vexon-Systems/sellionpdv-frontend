# DATABASE.md - SellionPDV

## 1. Visão Geral e Infraestrutura
* **SGBD:** PostgreSQL (gerenciado via Supabase).
* **Estratégia Multi-Tenant:** `Shared Database / Shared Schema`. Todas as tabelas operacionais compartilham o mesmo banco, mas o isolamento é garantido lógicamente.

## 2. Regras de Ouro do Banco (Invioláveis)
* **Isolamento (`tenant_id`):** Todas as entidades de negócio (Usuários, Produtos, Vendas, Caixas) possuem obrigatoriamente a coluna `tenant_id` (BigInt), que é uma Chave Estrangeira para a tabela `tenants`. A IA nunca deve criar uma query que ignore essa coluna.
* **Soft Delete (`ativo`):** Registros inativados ou excluídos não sofrem `DELETE`. Eles utilizam a coluna `ativo` (Boolean, default `true`). O motor do banco e o JPA backend aplicam restrições automáticas para ignorar `ativo = false` nas buscas padrão.

## 3. Estrutura Principal das Tabelas
* **Identidade e Acesso:**
  * `tenants`: Unidades de negócio (lojas/franquias).
  * `usuarios`: Controle de acesso e perfil (`role`), atrelados a um `tenant_id`.
* **Catálogo:**
  * `categorias`, `produtos`, `grupos_modificadores`, `opcoes_modificadores`.
  * Relação complexa: Produtos ligam-se a grupos através de uma tabela intermediária `produto_grupos_modificadores` para definir regras (`min_opcoes`, `max_opcoes`).
* **Operacional e Financeiro:**
  * `caixas`: Turnos de trabalho (status: ABERTO/FECHADO). Índice único garante apenas um caixa ABERTO por `tenant_id`.
  * `vendas`: Cabeçalho da transação, possui `idempotency_key` (UUID) para evitar duplicidade.
  * `itens_venda` e `itens_venda_modificadores`: Detalhamento imutável dos preços cobrados no momento exato da venda.