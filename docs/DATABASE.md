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
* **Pagamentos:**
  * `maquininhas`: Terminais de cartão da loja (nome, marca, taxaDebito, taxaCredito, ativo). Soft delete.
  * `taxas_maquininha`: Taxas específicas por bandeira e tipo de transação (FK para maquininha, `bandeira_cartao` VARCHAR, `tipo_transacao` VARCHAR, `taxa` DECIMAL). Permite sobrescrever a taxa genérica por bandeira (VISA, MASTERCARD, ELO, HIPERCARD, AMEX).
* **Operacional:**
  * `caixas`: Turnos de trabalho (status: ABERTO/FECHADO). Índice único garante apenas um caixa ABERTO por `tenant_id`.
  * `movimentacoes_caixa`: Sangrias e reforços vinculados a um caixa (tipo: SANGRIA/REFORCO, valor, justificativa).
  * `vendas`: Cabeçalho da transação. Possui `idempotency_key` (UUID) e campo `bandeira_cartao` VARCHAR (nullable — preenchido quando pagamento for crédito/débito com bandeira informada).
  * `itens_venda` e `itens_venda_modificadores`: Detalhamento imutável dos preços cobrados no momento exato da venda.
* **Equipe:**
  * `funcionarios` (alias `usuarios` com `tenant_id`): Colaboradores da loja. Role restrito a `ROLE_ADMIN` ou `ROLE_OPERADOR`. E-mail imutável. Soft delete via `ativo`.
* **Financeiro:**
  * `lancamentos_financeiros`: Despesas operacionais manuais (descricao, valor DECIMAL, categoria VARCHAR, data_referencia DATE, criado_em TIMESTAMPTZ). Hard delete — sem soft delete. Usado pelo `RelatorioService` para compor `despesasOperacionais` e calcular `lucroLiquido` no DRE.