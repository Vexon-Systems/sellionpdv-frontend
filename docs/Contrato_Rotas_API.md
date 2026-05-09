# Contrato de API - SellionPDV (Módulo 1 - MVP)

**Regra de Ouro (Segurança e Isolamento):** Todas as rotas abaixo (exceto o `/login`) exigem que o Frontend envie o cabeçalho `Authorization: Bearer <token>`. O Backend deve extrair o `tenant_id` e o `usuario_id` diretamente da assinatura do token JWT. O Frontend NUNCA enviará estas chaves no corpo (JSON) da requisição.

---

### 1. Autenticação e Acesso

*   **`POST /api/auth/login`**
    *   **Descrição:** Autentica o utilizador e devolve as credenciais de acesso.
    *   **Payload (Frontend):**
        ```json
        {
          "email": "user@example.com",
          "senha": "string"
        }
        ```
    *   **Retorno (200 OK):**
        ```json
        {
          "token": "string",
          "usuario": {
            "id": 0,
            "nome": "string",
            "email": "string",
            "role": "string"
          }
        }
        ```

---

### 2. Módulo de Categorias

*   **`GET /api/categorias`**
    *   **Descrição:** Retorna todas as categorias do Tenant.
    *   **Retorno (200 OK):**
        ```json
        [
          {
            "id": 0,
            "nome": "string"
          }
        ]
        ```

*   **`POST /api/categorias`**
    *   **Descrição:** Cria uma nova categoria.
    *   **Payload (Frontend):**
        ```json
        {
          "nome": "string"
        }
        ```
    *   **Retorno (201 Created):** Retorna o objeto da categoria criada.

*   **`PUT /api/categorias/{id}`** *(Adicionada para CRUD completo)*
    *   **Descrição:** Atualiza os dados de uma categoria existente.
    *   **Payload (Frontend):**
        ```json
        {
          "nome": "string"
        }
        ```
    *   **Retorno (200 OK):** Retorna a categoria atualizada.

*   **`DELETE /api/categorias/{id}`** *(Adicionada para Soft-Delete)*
    *   **Descrição:** Realiza a exclusão lógica (soft-delete) da categoria, marcando-a como inativa e ocultando-a das listagens padrão.

---

### 3. Gestão de Modificadores

*   **`GET /api/modificadores`**
    *   **Descrição:** Retorna a lista completa de grupos de modificadores e suas opções ativas para o Tenant.

    *  **Retorno (200: OK):**
        ```json
          [
            {
              "id": 0,
              "nome": "string",
              "opcoes": [
                {
                  "id": 0,
                  "nome": "string",
                  "precoAdicional": 0
                }
              ]
            }
          ]
        ```

*   **`POST /api/modificadores`**
    *   **Descrição:** Cria um novo Grupo de Modificadores, permitindo incluir suas opções no mesmo payload.
    *   **Payload Exemplo:**
        ```json
        {
          "nome": "Adicionais",
          "opcoes": [
            { "nome": "Bacon", "precoAdicional": 3.00 }
          ]
        }
        ```

*   **`PUT /api/modificadores/{id}`**
    *   **Descrição:** Atualiza o Grupo e realiza a sincronização (merge) inteligente de suas opções.

*   **`DELETE /api/modificadores/{id}`**
    *   **Descrição:** Executa a exclusão lógica (soft-delete) do grupo de modificadores e, em cascata, de suas opções.

---

### 4. Catálogo de Produtos

*   **`GET /api/produtos`**
    *   **Descrição:** Retorna todos os produtos do Tenant. A tela de Gestão mostra todos; a tela de PDV filtra apenas os ativos localmente. O payload inclui a estrutura aninhada com os grupos de modificadores e opções ativas.
    *   **Retorno (200 OK):**
        ```json
        [
          {
            "id": 0,
            "nome": "string",
            "precoBase": 0,
            "ativo": true,
            "categoriaId": 0,
            "gruposModificadores": [
              {
                "grupoId": 0,
                "nome": "string",
                "tipoEscolha": "string",
                "minOpcoes": 0,
                "maxOpcoes": 0,
                "opcoes": [
                  {
                    "id": 0,
                    "nome": "string",
                    "precoAdicional": 0
                  }
                ]
              }
            ]
          }
        ]
        ```

*   **`POST /api/produtos`** e **`PUT /api/produtos/{id}`**
    *   **Descrição:** Cria ou atualiza um produto e gerencia os seus vínculos com grupos modificadores (definindo regras como `minOpcoes` e `maxOpcoes`).
    *   **Payload (Frontend):**
        ```json
        {
          "nome": "string",
          "precoBase": 0,
          "ativo": true,
          "categoriaId": 0,
          "gruposModificadores": [
            {
              "grupoId": 0,
              "tipoEscolha": "string",
              "minOpcoes": 0,
              "maxOpcoes": 0
            }
          ]
        }
        ```
    *   **Retorno:** Status 201 Created (para POST) ou 200 OK (para PUT) com o objeto atualizado.

*   **`DELETE /api/produtos/{id}`** *(Adicionada para Soft-Delete)*
    *   **Descrição:** Realiza a exclusão lógica do produto (`ativo = false`), mantendo sua integridade para relatórios e histórico de vendas passadas.

---

### 5. Módulo de Caixa (Turno)

*   **`GET /api/caixa/atual`**
    *   **Descrição:** Retorna os dados do caixa que estiver com status `ABERTO` para o Tenant atual, essencial para o PDV validar se pode operar. Retorna 404 se não houver caixa aberto.

    * **Resposta de Sucesso (HTTP 200 OK)**
        ```json
        {
          "id": 105,
          "status": "ABERTO",
          "dataAbertura": "2026-05-06T08:00:00Z",
          "saldoInicial": 150.50
        }
        ```

    * **Resposta de Erro (HTTP 404 Not Found)**
        ```json
        {
          "type": "about:blank",
          "title": "Not Found",
          "status": 404,
          "detail": "Nenhum caixa aberto encontrado para o tenant atual.",
          "instance": "/api/caixa/atual"
        }
        ```

*   **`POST /api/caixa/abrir`**
    *   **Descrição:** Abre o turno de trabalho. O backend deve validar se já não existe um caixa aberto para este Tenant.
    *   **Payload (Frontend):**
        ```json
        {
          "saldoInicial": 50.00
        }
        ```
    *   **Retorno (201 Created):**
        ```json
        {
          "id": 0,
          "status": "string",
          "dataAbertura": "2026-03-24T08:00:00Z",
          "saldoInicial": 50.00
        }
        ```

*   **`POST /api/caixa/movimentacao`**
    *   **Descrição:** Regista entradas (Reforço) ou saídas (Sangria) não originadas de vendas.
    *   **Payload (Frontend):**
        ```json
        {
          "tipo": "SANGRIA",
          "valor": 100.00,
          "justificativa": "Pagamento de fornecedor de gelo"
        }
        ```
        *(Nota: tipo pode ser "SANGRIA" ou "REFORCO")*
    *   **Retorno:** Status 201 Created.

*   **`POST /api/caixa/fechar`**
    *   **Descrição:** Encerra o turno. O Frontend envia a contagem cega, e o Backend calcula e regista a diferença (furo).
    *   **Payload (Frontend):**
        ```json
        {
          "saldoFinalInformado": 450.00
        }
        ```
    *   **Retorno (200 OK):** Retorna os totais consolidados do dia.

---

### 6. Frente de Caixa (Vendas)

*   **`GET /api/vendas`** 
    *   **Descrição:** Retorna as vendas associadas ao caixa atual (aberto). Fundamental para alimentar o histórico do turno no PDV.

*   **`POST /api/vendas`**
    *   **Descrição:** Regista uma nova venda. Obrigatório enviar o cabeçalho `Idempotency-Key` (UUID) para evitar duplicação por falha de rede. O cálculo do total da venda é feito no Backend com base nos preços armazenados no banco (Zero Trust).
    *   **Payload (Frontend):**
        ```json
        {
          "itens": [
            { "produtoId": 1, "quantidade": 2 }
          ],
          "formaPagamento": "CREDITO",
          "maquininhaId": 3,
          "descontoAplicado": 0.00
        }
        ```
        *(Nota: O campo maquininhaId é obrigatório se a forma de pagamento for "CREDITO" ou "DEBITO", e deve ser null para "DINHEIRO" ou "PIX".)*
    *   **Retorno (201 Created):** Objeto completo da venda com o ID gerado.

*   **`POST /api/vendas/{id}/cancelar`**
    *   **Descrição:** Executa o estorno de uma venda do caixa atual. Nunca apaga a venda do banco de dados.
    *   **Payload (Frontend):**
        ```json
        {
          "justificativa": "Cliente desistiu da compra antes da entrega."
        }
        ```
    *   **Retorno (200 OK):** Status indicando o sucesso do cancelamento.