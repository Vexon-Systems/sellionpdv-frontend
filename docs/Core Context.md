# Core Context - SellionPDV

## 1. Visão Geral do Produto
* **O que é:** Plataforma SaaS web de Gestão Financeira e Frente de Caixa (PDV), otimizada inicialmente para quiosques de sorvete.
* **Proposta de Valor:** Unificar vendas diárias rápidas e intuitivas com uma retaguarda estratégica (Backoffice/Mini-ERP) para substituição de controles manuais e planilhas.
* **Modelo de Negócio:** Arquitetura Multi-tenant escalável, desenhada desde o dia zero para atender e isolar logicamente os dados de múltiplas lojas e redes de franquias.

## 2. Perfis de Usuário (RBAC)
* **ADMIN (Gerente/Proprietário):** Acesso irrestrito. Responsável por gerenciar o catálogo, configurar engenharia de cardápio (modificadores), auditar caixas passados e analisar dados financeiros (DRE Gerencial).
* **OPERADOR (Caixa):** Acesso estritamente operacional. Bloqueado no ambiente de PDV para realizar vendas, abertura/fechamento de turno do dia, sangrias e reforços.

## 3. Dicionário de Domínio e Regras de Negócio
* **Tenant:** Unidade de franquia ou loja. Todos os dados da aplicação são isolados logicamente e roteados pelo `tenant_id`.
* **Caixa (Turno):** Sessão de trabalho diária. O sistema exige controle estrito: apenas um caixa aberto por Tenant, exigência de saldo inicial e utilização de "Fechamento Cego" (o operador informa o dinheiro em gaveta antes de ver os relatórios de quebra/furo).
* **Catálogo e Modificadores:** Produtos não possuem controle de estoque físico no MVP. A engenharia de cardápio permite grupos de opções (ex: coberturas, tamanhos) com regras estritas de mínimo e máximo de escolhas.
* **Zero Trust Financeiro:** Regra absoluta onde o Backend é a única fonte de verdade. Preços e subtotais enviados pelo Frontend no carrinho de compras são sumariamente ignorados; o Backend recalcula tudo buscando valores diretos do banco de dados.
* **Movimentação Inversa (Soft-Delete):** Transações financeiras não são apagadas do banco de dados. O cancelamento de vendas altera o ativo para false, em alguns casos, exigindo justificativa obrigatória para manter a integridade da auditoria.
* **Idempotência:** Vendas exigem chaves únicas de idempotência para evitar que falhas de rede causem cobranças duplicadas no cartão ou baixas duplicadas no banco.