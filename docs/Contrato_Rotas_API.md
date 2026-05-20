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

### 7. Maquininhas
*Todas as rotas a seguir devem ser protegidas pelo SecurityFilter e aplicar isolamento de dados pelo @TenantID do Hibernate*

* **`GET /api/maquininhas`**
    *   **Descrição:** Retorna a lista de todas as maquininhas cadastradas para a franquia.
        
    *   **Retorno (200 OK):** Status indicando o sucesso.
        ```json
        [
          {
            "id": 1,
            "nome": "Cielo Balcão Principal",
            "marca": "Cielo",
            "taxaDebito": 1.99,
            "taxaCredito": 4.99,
            "ativo": true
          }
        ]
        ```
* **`POST /api/maquininhas/`**
    *   **Descrição:** Cadastra um novo terminal de pagamento (Maquininha)
        
    *   **Payload (Frontend):**
        ```json
          {
            "nome": "Stone Sem Fio",
            "marca": "Stone",
            "taxaDebito": 1.20,
            "taxaCredito": 3.50,
            "ativo": true
          }
        ```
    *   **Retorno (201 Created):** Retorna o objeto da maquininha recém-criada com seu respectivo `id`.

* **`PUT /api/maquininhas{id}`**
    *   **Descrição:** Atualiza os dados de uma maquininha existente
        
    *   **Payload (Frontend):** 
        ```json
          {
            "nome": "Stone Sem Fio",
            "marca": "Stone",
            "taxaDebito": 1.20,
            "taxaCredito": 3.50,
            "ativo": true
          }
        ```
    *   **Retorno (200 OK):** Retorna o objeto atualizado.

* **`DELETE /api/maquininhas/{id}`**
    *   **Descrição:** Realiza a exclusão lógica alterando a coluna ativo para false. É vital que seja Soft-Delete, pois vendas passadas (histórico e DRE) estarão atreladas ao ID desta maquininha.
        
    *   **Retorno (200 OK ou 204 No Content):** Confirmação de inativação.

### 8. Dashboard (Estatísticas)
*Todas as rotas a seguir devem receber ?dataInicial=YYYY-MM-DD e ?dataFinal=YYYY-MM-DD como parâmetros de query (@RequestParam). Devem ser protegidas pelo SecurityFilter e filtrar as vendas concluídas (ignorar vendas com status cancelada)*


* **`GET /api/dashboard/kpis`**
    *   **Descrição:** Retorna os indicadores macro de faturamento para os cards do topo do Dashboard.
        
    *   **Retorno (200 OK):**
        ```json
          {
            "faturamentoTotal": 1250.75,
            "quantidadeVendas": 42,
            "ticketMedio": 29.77,
            "comparativoPeriodoAnterior": {
              "faturamentoPercentual": 15.5,
              "vendasPercentual": 8.2,
              "ticketMedioPercentual": -2.1
            }
          }
        ```

* **`GET /api/dashboard/pagamentos`**
    *   **Descrição:** Agrupa o faturamento pelas formas de pagamento (PIX, Crédito, Débito, Dinheiro). Essencial para a conciliação financeira.
        
    *   **Retorno (200 OK):**
        ```json
          [
            {
              "formaPagamento": "PIX",
              "valorTotal": 600.00,
              "quantidadeTransacoes": 20,
              "percentualFaturamento": 48.0
            },
            {
              "formaPagamento": "CREDITO",
              "valorTotal": 450.75,
              "quantidadeTransacoes": 12,
              "percentualFaturamento": 20.0
            },
            {
              "formaPagamento": "DEBITO",
              "valorTotal": 300.75,
              "quantidadeTransacoes": 10,
              "percentualFaturamento": 26.0
            },
            {
              "formaPagamento": "DINHEIRO",
              "valorTotal": 200.00,
              "quantidadeTransacoes": 10,
              "percentualFaturamento": 12.0
            }
          ]
        ```
        
* **`GET /api/dashboard/produtos/top`**
    *   **Descrição:** Retorna os produtos mais vendidos no período, ordenados pela quantidade ou pelo valor gerado. Ajuda na gestão do estoque.
        
    *   **Retorno (200 OK):**
        ```json
          [
            {
              "produtoId": 5,
              "nomeProduto": "Milkshake Básico",
              "quantidadeVendida": 18,
              "valorGerado": 180.00
            },
            {
              "produtoId": 2,
              "nomeProduto": "Casquinha Trufada",
              "quantidadeVendida": 15,
              "valorGerado": 105.00
            }
          ]
        ```

* **`GET /api/dashboard/faturamento/serie-temporal`**
    *   **Descrição:** Se o filtro for de apenas 1 dia (Hoje), o backend devolve o faturamento agrupado por hora (ex: 10h, 11h, 12h). Se o filtro for de uma semana ou mês, devolve agrupado por dia (ex: 01/05, 02/05).
        
    *   **Retorno (200 OK):**
        ```json
          [
            {
              "label": "10:00",
              "valor": 150.00
            },
            {
              "label": "11:00",
              "valor": 320.50
            },
            {
              "label": "12:00",
              "valor": 45.00
            }
          ]
        ```

* **`GET /api/dashboard/categorias`**
    *   **Descrição:** Agrupa o volume de vendas e o faturamento pelas categorias de produtos (ex: Sorvetes, Bebidas, Sobremesas). Excelente para identificar o carro-chefe da loja.
        
    *   **Retorno (200 OK):**
        ```json
          [
            {
              "categoriaId": 1,
              "nomeCategoria": "Milkshakes",
              "quantidadeVendida": 85,
              "valorGerado": 1250.00,
              "percentualFaturamento": 45.5
            },
            {
              "categoriaId": 2,
              "nomeCategoria": "Casquinhas e Sundaes",
              "quantidadeVendida": 120,
              "valorGerado": 800.00,
              "percentualFaturamento": 29.1
            },
            {
              "categoriaId": 3,
              "nomeCategoria": "Bebidas",
              "quantidadeVendida": 40,
              "valorGerado": 200.00,
              "percentualFaturamento": 7.3
            }
          ]
        ```

* **`GET /api/dashboard/caixa`**
    *   **Descrição:** Retorna um consolidado das operações de caixa no período selecionado. Permite ao gerente visualizar rapidamente se está havendo muita retirada (Sangria) ou se há um acúmulo de quebras de caixa (furo/diferença).
        
    *   **Retorno (200 OK):**
        ```json
          [
            {
              "quantidadeTurnosAbertos": 7,
              "totalSangrias": 450.00,
              "totalReforcos": 100.00,
              "saldoInicialMedio": 150.00,
              "diferencaCaixaTotal": -12.50 
            }
          ]
        ```

* **`GET /api/dashboard/adicionais/top`**
    *   **Descrição:** Identifica quais opções de modificadores (ex: Adicional de Nutella, Borda Recheada) estão gerando mais receita extra.
        
    *   **Retorno (200 OK):**
        ```json
          [
            {
              "opcaoId": 12,
              "nomeOpcao": "Cobertura de Nutella",
              "quantidadeVendida": 45,
              "valorGerado": 225.00
            },
            {
              "opcaoId": 8,
              "nomeOpcao": "Adicional de Morango",
              "quantidadeVendida": 30,
              "valorGerado": 90.00
            },
          ]
        ```