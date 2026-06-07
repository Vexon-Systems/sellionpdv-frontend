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