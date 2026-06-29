# BUSINESS_RULES.md - SellionPDV

## 1. Regras Operacionais (Caixa e Vendas)
* **Caixa Único:** É proibida a existência de dois caixas abertos simultaneamente para a mesma loja (Tenant). Validação a nível de banco de dados.
* **Fechamento Cego:** O operador deve informar o dinheiro físico em gaveta no fim do turno ANTES de ver os relatórios de quebra ou furo de caixa gerados pelo sistema.
* **Preço Imutável na Venda:** No ato da venda, o sistema deve gravar o `valor_unitario` e o `nome_produto` no registro da transação. Mudanças futuras no catálogo não afetam o histórico financeiro.
* **Sem Estoque Físico:** O MVP não gerencia quantidades em estoque. Todos os produtos ativos estão sempre disponíveis para venda.

## 2. Regras de Integridade e Dados
* **Soft Delete:** É proibido apagar registros físicos do banco de dados (exclusão física). Entidades desativadas (como produtos ou modificadores) recebem apenas a atualização `ativo = false`.
* **Movimentação Inversa:** O cancelamento de vendas nunca aciona o comando DELETE. O status da venda é alterado para CANCELADA e exige obrigatoriamente o envio de uma justificativa descritiva.
* **Idempotência:** Toda requisição de finalização de venda (checkout) deve conter um cabeçalho `Idempotency-Key` com um UUID gerado pelo cliente para evitar cobranças duplicadas em caso de erro na rede.

## 3. Higienização de Dados (Tratamento)
* **Telefones:** O Frontend aplica máscara visual, mas o JSON enviado ao Backend deve conter apenas os 10 ou 11 números (`34999999999`).
* **Valores (Financeiro):** O Frontend exibe Reais (R$ 15,50), mas converte para Float padrão (`15.50`) no JSON. O Backend trata os valores como `BigDecimal` e não aceita números negativos (via anotações como `@PositiveOrZero`).

## 4. Regras de Maquininhas e Taxas
* **Taxa por bandeira:** Cada maquininha pode ter taxas específicas por bandeira (VISA, MASTERCARD, ELO, HIPERCARD, AMEX) via tabela `taxas_maquininha`. Se não houver taxa cadastrada para uma bandeira, o sistema usa `taxaDebito` / `taxaCredito` como fallback.
* **Bandeira opcional na venda:** O campo `bandeiraCartao` na venda é opcional. Se não informado, o DRE usa a taxa genérica da maquininha. A bandeira só faz diferença se taxas por bandeira estiverem cadastradas.
* **Soft delete obrigatório:** Maquininhas não podem ser excluídas fisicamente — vendas históricas têm FK para o `maquininha_id`.

## 5. Regras do Módulo Financeiro
* **Acesso restrito:** Apenas usuários com `ROLE_ADMIN` podem criar, editar ou excluir lançamentos financeiros.
* **Hard delete:** Lançamentos podem ser excluídos permanentemente (sem soft delete). Não há necessidade de histórico retroativo para despesas manuais.
* **Impacto no DRE:** Os lançamentos do período são somados por categoria e subtraídos do `lucroBrutoEstimado` para gerar o `lucroLiquido`. O DRE só reflete lançamentos dentro do intervalo `dataInicial–dataFinal` consultado.
* **Data de referência:** O campo `dataReferencia` (LocalDate) determina em qual período o lançamento aparece no DRE — independente de quando foi criado (`criadoEm`).

## 6. Regras de Gestão de Equipe
* **E-mail imutável:** Após o cadastro de um funcionário, o e-mail corporativo não pode ser alterado (integridade de auditoria).
* **Role restrita:** O campo `role` aceita apenas `"ADMIN"` ou `"OPERADOR"`. Não existe role intermediário.
* **Soft delete:** Funcionários desligados recebem `ativo = false`. O registro histórico é preservado para auditoria de vendas e turnos passados.