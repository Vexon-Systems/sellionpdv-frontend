# API_CONTRACT.md - SellionPDV

## 1. Regras de Cabeçalho (Headers)
* **Autenticação:** Todas as rotas (exceto `/login`) exigem o cabeçalho `Authorization: Bearer <token>`. O `tenant_id` é extraído exclusivamente deste token pelo Backend. O Frontend NUNCA envia IDs de tenant ou usuário no JSON ou na URL (prevenção de IDOR).
* **Idempotência:** Rotas críticas de criação (ex: `POST /api/vendas`) exigem o cabeçalho `Idempotency-Key` (UUID gerado no Frontend) para evitar transações duplicadas em falhas de rede.
* **Dados de fechamento:** Consultas operacionais de caixa e o response do fechamento usam `Cache-Control: no-store`. Durante caixa aberto, operadores consomem somente `GET /api/caixa/operacional`; contratos monetários completos são administrativos.

## 2. Padrões de Resposta (Responses)
* **Sucesso (200 OK / 201 Created):** Retornam o DTO completo da entidade requisitada ou criada diretamente na raiz do JSON, sem envelopes extras (como `{"data": {...}}`).
* **Erros (4xx e 5xx):** Seguem estritamente o padrão RFC 7807 (Problem Details). O JSON de erro contém as chaves: `type`, `title`, `status`, `detail` e `instance`. O Frontend deve exibir ao usuário a mensagem contida no campo `detail`.
* **Paginação:** Rotas de listagem que suportam paginação (ex: relatórios) retornam a matriz de resultados dentro da chave `content`, junto com os metadados `page`, `size`, `totalElements` e `totalPages`.

## 3. Padrões de Requisição (Requests)
* **Filtros e Datas:** Passados obrigatoriamente via Query Parameters (ex: `?dataInicial=YYYY-MM-DD&dataFinal=YYYY-MM-DD`).
* **Payloads Limpos:** O Frontend envia dados sanitizados. Sem formatação visual de moeda, CPF ou telefone no JSON (ex: enviar `34999999999` e não `(34) 9999-9999`).
