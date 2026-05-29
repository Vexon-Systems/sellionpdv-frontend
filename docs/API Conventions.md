# API Conventions - SellionPDV

## 1. Segurança e Identificação
* **Autenticação:** Todas as rotas (exceto a rota de `/login`) exigem o envio obrigatório do cabeçalho `Authorization: Bearer <token>`.
* **Isolamento e Identidade:** O Backend deve extrair o `tenant_id` e o `usuario_id` diretamente e estritamente da assinatura do token JWT. O Frontend nunca enviará estas chaves no corpo (JSON) da requisição ou na URL, garantindo a prevenção contra manipulação.

## 2. Estrutura de Requisição (Request)
* **Idempotência Financeira:** O registro de vendas (como em `POST /api/vendas`) exige obrigatoriamente o envio de um UUID no cabeçalho `Idempotency-Key`. Isso evita a duplicação de cobranças ou baixas geradas por instabilidades de rede.
* **Filtros Temporais:** Parâmetros de data para relatórios e dashboards devem sempre trafegar via *Query Parameters* na URL, adotando o formato `?dataInicial=YYYY-MM-DD` e `?dataFinal=YYYY-MM-DD`.
* **Movimentação Inversa (Cancelamentos):** Estornos e cancelamentos operacionais (ex: de uma venda) não apagam dados físicos. Eles são realizados via rotas de ação específicas, como `POST /api/vendas/{id}/cancelar`, exigindo sempre o envio de uma `justificativa` no corpo da requisição.

## 3. Estrutura de Resposta (Response)
* **Padrão de Sucesso (HTTP 20x):** Requisições bem-sucedidas devolvem o objeto JSON (DTO) diretamente, sem a utilização de envelopes extras. O sucesso é sinalizado pelo próprio *Status Code* (ex: 200 OK ou 201 Created).
* **Padrão de Paginação:** Envelopes são adotados exclusivamente em rotas que exigem paginação (ex: listagens de auditoria ou caixas em `/api/relatorios/*`). Estas rotas retornam os arrays de dados dentro da chave `content`, acompanhados dos metadados `page`, `size`, `totalElements` e `totalPages`.
* **Tratamento de Erros (HTTP 4xx e 5xx):** Toda exceção capturada pelo Backend é traduzida para o formato padronizado RFC 7807. O JSON de erro contém as chaves `type`, `title`, `status`, `detail` e `instance`. O Frontend consome a mensagem contida na chave `detail` para exibi-la ao usuário.
* **Exclusão Lógica (Soft-Delete):** Chamadas ao método `DELETE` em cadastros base (como `/api/categorias/{id}` ou `/api/produtos/{id}`) retornam status de sucesso e executam a inativação lógica do item. Isso oculta o registro de listagens padrão, mas mantém intacta a sua integridade para relatórios e históricos passados.