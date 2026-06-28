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
          "bandeiraCartao": "VISA",
          "descontoAplicado": 0.00
        }
        ```
        *(Nota: `maquininhaId` é obrigatório se a forma de pagamento for `"CREDITO"` ou `"DEBITO"`, e deve ser `null` para `"DINHEIRO"` ou `"PIX"`. `bandeiraCartao` é opcional; valores aceitos: `"VISA"`, `"MASTERCARD"`, `"ELO"`, `"HIPERCARD"`, `"AMEX"`. Quando informado, permite aplicar a taxa específica da bandeira no DRE.)*
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

---

### 7. Maquininhas
*Todas as rotas a seguir devem ser protegidas pelo SecurityFilter e aplicar isolamento de dados pelo @TenantID do Hibernate*

* **`GET /api/maquininhas`**
    *   **Descrição:** Retorna a lista de todas as maquininhas cadastradas para a franquia, incluindo as taxas por bandeira.
        
    *   **Retorno (200 OK):**
        ```json
        [
          {
            "id": 1,
            "nome": "Cielo Balcão Principal",
            "marca": "Cielo",
            "taxaDebito": 1.99,
            "taxaCredito": 4.99,
            "taxasPorBandeira": [
              { "bandeira": "VISA", "tipo": "DEBITO", "taxa": 1.50 },
              { "bandeira": "VISA", "tipo": "CREDITO", "taxa": 3.99 },
              { "bandeira": "MASTERCARD", "tipo": "DEBITO", "taxa": 1.75 }
            ],
            "ativo": true
          }
        ]
        ```
        *(Nota: `taxasPorBandeira` pode ser uma lista vazia `[]` se nenhuma taxa específica estiver cadastrada. Nesse caso o sistema usa `taxaDebito` / `taxaCredito` como fallback.)*

* **`POST /api/maquininhas/`**
    *   **Descrição:** Cadastra um novo terminal de pagamento.
        
    *   **Payload (Frontend):**
        ```json
        {
          "nome": "Stone Sem Fio",
          "marca": "Stone",
          "taxaDebito": 1.20,
          "taxaCredito": 3.50,
          "taxasPorBandeira": [
            { "bandeira": "VISA", "tipo": "DEBITO", "taxa": 1.00 },
            { "bandeira": "VISA", "tipo": "CREDITO", "taxa": 2.99 }
          ]
        }
        ```
        *(Nota: `taxasPorBandeira` é opcional. `bandeira` aceita: `"VISA"`, `"MASTERCARD"`, `"ELO"`, `"HIPERCARD"`, `"AMEX"`. `tipo` aceita: `"DEBITO"` ou `"CREDITO"`.)*
    *   **Retorno (201 Created):** Retorna o objeto da maquininha recém-criada com seu respectivo `id`.

* **`PUT /api/maquininhas/{id}`**
    *   **Descrição:** Atualiza os dados de uma maquininha existente. O backend realiza merge inteligente das taxas por bandeira.
        
    *   **Payload (Frontend):**
        ```json
        {
          "nome": "Stone Sem Fio",
          "marca": "Stone",
          "taxaDebito": 1.20,
          "taxaCredito": 3.50,
          "taxasPorBandeira": [
            { "bandeira": "VISA", "tipo": "DEBITO", "taxa": 1.00 }
          ]
        }
        ```
    *   **Retorno (200 OK):** Retorna o objeto atualizado.

* **`DELETE /api/maquininhas/{id}`**
    *   **Descrição:** Realiza a exclusão lógica alterando a coluna ativo para false. É vital que seja Soft-Delete, pois vendas passadas (histórico e DRE) estarão atreladas ao ID desta maquininha.
        
    *   **Retorno (200 OK ou 204 No Content):** Confirmação de inativação.

---
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
              "percentualFaturamento": 42.0
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

---

### 9. Relatórios

* **`GET /api/relatorios/vendas`**
    *   **Descrição:** Retorna a listagem de vendas realizadas em um determinado período. Suporta paginação e filtros opcionais por status (ex: CONCLUIDA, CANCELADA) para facilitar a auditoria.
        
    *   **Retorno (200 OK):**
        ```json
          {
            "content": [
              {
                "vendaId": 1045,
                "dataVenda": "2026-05-24T14:30:00Z",
                "valorTotal": 45.90,
                "formaPagamento": "PIX",
                "status": "CONCLUIDA",
                "nomeOperador": "João Silva"
              },
              {
                "vendaId": 1044,
                "dataVenda": "2026-05-24T14:15:00Z",
                "valorTotal": 12.00,
                "formaPagamento": "CREDITO",
                "status": "CANCELADA",
                "nomeOperador": "Maria Oliveira"
              }
            ],
            "page": 0,
            "size": 20,
            "totalElements": 150,
            "totalPages": 8
          }
        ```

* **`GET /api/relatorios/vendas/{id}`**
    *   **Descrição:** Retorna o "recibo" detalhado de uma venda específica. É fundamental para analisar exatamente quais itens e modificadores foram vendidos, ou para visualizar a justificativa de um estorno/cancelamento.
        
    *   **Retorno (200 OK):**
        ```json
          {
            "vendaId": 1044,
            "dataVenda": "2026-05-24T14:15:00Z",
            "caixaId": 12,
            "nomeOperador": "Maria Oliveira",
            "valorTotal": 12.00,
            "formaPagamento": "CREDITO",
            "status": "CANCELADA",
            "justificativaCancelamento": "Cliente desistiu da compra após o pagamento. Estorno realizado na maquineta.",
            "dataCancelamento": "2026-05-24T14:18:00Z",
            "itens": [
              {
                "produtoId": 5,
                "nomeProduto": "Casquinha Trufada",
                "quantidade": 1,
                "valorUnitario": 8.00,
                "subtotalItem": 12.00,
                "modificadores": [
                  {
                    "nomeOpcao": "Borda de Nutella",
                    "valorAdicional": 4.00
                  }
                ]
              }
            ]
          }
        ```

* **`GET /api/relatorios/caixas`**
    *   **Descrição:** Retorna a listagem de turnos (caixas) passados. Ideal para conferência de saldos, sangrias e furos de caixa de dias anteriores.
        
    *   **Retorno (200 OK):**
        ```json
          {
            "content": [
              {
                "caixaId": 12,
                "status": "FECHADO",
                "operadorAbertura": "Maria Oliveira",
                "operadorFechamento": "João Silva",
                "dataAbertura": "2026-05-23T08:00:00Z",
                "dataFechamento": "2026-05-23T18:00:00Z",
                "saldoInicial": 150.00,
                "totalVendasDinheiro": 300.00,
                "totalSangrias": 200.00,
                "totalReforcos": 0.00,
                "saldoFinalCalculado": 250.00,
                "saldoFinalInformado": 240.00,
                "furoCaixa": -10.00
              }
            ],
            "page": 0,
            "size": 20,
            "totalElements": 30,
            "totalPages": 2
          }
        ```

* **`GET /api/relatorios/dre`**
    *   **Descrição:** Diferente do comparativo, este endpoint retorna a estrutura contábil completa (em cascata) do período selecionado. Desconta taxas de maquininhas e custo de produtos para mostrar a margem real.
        
    *   **Retorno (200 OK):**
        ```json
          {
            "periodo": "01/05/2026 a 24/05/2026",
            "receitaBruta": 15250.00,
            "deducoes": {
              "totalCancelamentos": 150.00,
              "taxasMaquininhas": 380.50
            },
            "receitaLiquida": 14719.50,
            "custos": {
              "custoMercadoriaVendida": 5569.50
            },
            "lucroBrutoEstimado": 9150.00,
            "margemBrutaPercentual": 60.0,
            "despesasOperacionais": [
              { "categoria": "ALUGUEL", "total": 2500.00 },
              { "categoria": "FOLHA_PAGAMENTO", "total": 3000.00 },
              { "categoria": "ENERGIA", "total": 450.00 }
            ],
            "totalDespesasOperacionais": 5950.00,
            "lucroLiquido": 3200.00,
            "margemLiquidaPercentual": 21.7
          }
        ```
        *(Nota: `despesasOperacionais` agrega os lançamentos financeiros do módulo Financeiro registrados dentro do período consultado. Se não houver lançamentos, a lista é vazia e `lucroLiquido` = `lucroBrutoEstimado`. A `categoria` retorna o valor do enum `CategoriaLancamento`: ALUGUEL, ENERGIA, AGUA, INTERNET_TELEFONE, CONTADOR, FOLHA_PAGAMENTO, PRO_LABORE, COMPRA_MERCADORIA, EMBALAGENS_MATERIAIS, IMPOSTOS, TAXAS_BANCARIAS, MANUTENCAO, MARKETING, OUTROS.)*

* **`GET /api/relatorios/auditoria`**
    *   **Descrição:** Endpoint de segurança (Insert-Only) para listar as ações sensíveis realizadas no sistema (ex: alterações de preço, sangrias, cancelamentos de vendas).

    *   **Retorno (200 OK):**
        ```json
          {
            "content": [
              {
                "logId": 9982,
                "dataHora": "2026-05-24T10:15:00Z",
                "usuarioId": 2,
                "nomeUsuario": "João Silva",
                "tipoAcao": "SANGRIA",
                "entidadeAfetada": "CAIXA",
                "entidadeId": 13,
                "detalhes": "Sangria registrada no valor de R$ 100.00. Motivo: Pagamento de fornecedor (Gelo)."
              },
              {
                "logId": 9981,
                "dataHora": "2026-05-23T20:00:00Z",
                "usuarioId": 1,
                "nomeUsuario": "Admin",
                "tipoAcao": "ALTERACAO_PRECO",
                "entidadeAfetada": "PRODUTO",
                "entidadeId": 5,
                "detalhes": "Preço base do produto 'Casquinha Trufada' alterado de R$ 6.00 para R$ 8.00."
              }
            ],
            "page": 0,
            "size": 50,
            "totalElements": 412,
            "totalPages": 9
          }
        ```

* **`GET /api/relatorios/comparativo`**
    *   **Descrição:** Devolve o balanço financeiro e operacional contrapondo o período selecionado ao seu intervalo imediatamente anterior equivalente para fins de auditoria e monitoramento de crescimento. Aceita o parâmetro de query escala com os tokens mapeados (HOJE, SEMANA, MES).
        
    *   **Retorno (200 OK):**
        ```json
          {
            "escalaSelecionada": "MES",
            "periodoAtual": {
              "rotulo": "Este Mês (01/05 a 24/05)",
              "faturamentoTotal": 15250.00,
              "quantidadeVendas": 510,
              "ticketMedio": 29.90,
              "lucroEstimado": 9150.00
            },
            "periodoAnterior": {
              "rotulo": "Mês Passado (01/04 a 24/04)",
              "faturamentoTotal": 13400.00,
              "quantidadeVendas": 480,
              "ticketMedio": 27.91,
              "lucroEstimado": 8040.00
            },
            "variacaoPercentual": {
              "faturamentoPercentual": 13.8,
              "vendasPercentual": 6.2,
              "ticketMedioPercentual": 7.1,
              "lucroPercentual": 13.8
            }
          }
        ```

---

### 10. Usuários e Preferências

* **`GET /api/auth/me`**
    *   **Descrição:** Rota crítica de inicialização do sistema. Valida o Token JWT no cabeçalho, identifica o usuário e retorna os seus dados de identidade combinados com o objeto de preferências da tabela satélite.
        
    *   **Retorno (200 OK):**
        ```json
          {
            "id": 2,
            "tenantId": 1,
            "nome": "Eduardo Silva",
            "email": "eduardo@sellion.com",
            "telefone": "34999999999",
            "role": "GERENTE",
            "avatarUrl": "https://url-do-supabase.com/avatar-eduardo.png",
            "preferencias": {
              "tema": "DARK",
              "sonsAtivos": true,
              "tamanhoInterface": "PADRAO",
              "usaPin": true
            }
          }
        ```

* **`PUT /api/usuarios/me`**
    *   **Descrição:** Modifica os dados cadastrais contidos estritamente na tabela usuarios.

    * **Payload (Frontend):**
        ```json
          {
            "nome": "Eduardo Gonçalves Silva",
            "telefone": "34988888888"
          }
        ```
        
    *   **Retorno (200 OK):**
        ```json
          {
            "id": 2,
            "nome": "Eduardo Silva",
            "email": "eduardo@sellion.com",
            "telefone": "34999999999",
            "role": "GERENTE",
            "avatarUrl": "https://url-do-supabase.com/avatar.png",
            "preferencias": {
              "tema": "DARK",
              "sonsAtivos": true,
              "tamanhoInterface": "PADRAO",
              "usaPin": true
            }
          }
        ```

* **`PUT /api/usuarios/me/avatar`**
    *   **Descrição:** Realiza o upload do arquivo de imagem para o Storage do Supabase e atualiza a coluna avatar_url na tabela usuarios.

    * **Payload (Frontend):** Arquivo binário (file)
        
    *   **Retorno (200 OK):**
        ```json
          {
            "avatarUrl": "https://url-do-supabase.com/storage/v1/object/public/avatars/user_2.png"
          }
        ```

* **`PUT /api/usuarios/me/senha`**
    *   **Descrição:** Atualiza a credencial de acesso na tabela usuarios. O backend deve validar a senhaAtual usando Argon2id antes de computar o hash da nova senha.

    * **Payload (Frontend):**
        ```json
          {
            "senhaAtual": "minha_senha_antiga",
            "novaSenha": "nova_senha_ultra_segura"
          }
        ```
        
    *   **Retorno (204 No Content):** Sucesso sem corpo de retorno.

* **`PUT /api/usuarios/me/preferencias`**
    *   **Descrição:** Atualiza as propriedades de comportamento visual e de áudio da interface na tabela satélite usuario_preferencias.

    * **Payload (Frontend):**
        ```json
          {
            "tema": "DARK",
            "sonsAtivos": false,
            "tamanhoInterface": "PADRAO"
          }
        ```
        
    *   **Retorno (200 OK):**
        ```json
          {
            "tema": "DARK",
            "sonsAtivos": false,
            "tamanhoInterface": "PADRAO"
          }
        ```

* **`PUT /api/usuarios/me/pin`**
    *   **Descrição:** Cadastra ou altera o PIN numérico de acesso rápido ao PDV. Atualiza as colunas usa_pin para true e gera o pin_hash na tabela usuario_preferencias. Passar um PIN vazio ou nulo desativa a funcionalidade (usa_pin = false).

    * **Payload (Frontend):**
        ```json
          {
            "pin": "4815"
          }
        ```
        
    *   **Retorno (200 OK):**
        ```json
          {
            "usaPin": true
          }
        ```

### 11. Gestão de Equipe (Funcionários)

*Todas as rotas protegidas por `ROLE_ADMIN`. Isolamento automático por tenant.*

* **`GET /api/funcionarios`**
    *   **Descrição:** Retorna a listagem de todos os funcionários ativos vinculados ao Tenant do usuário logado.
    *   **Retorno (200 OK):**
        ```json
        [
          {
            "id": 1,
            "nome": "João Silva",
            "email": "joao.silva@sellion.com.br",
            "role": "OPERADOR",
            "ativo": true
          },
          {
            "id": 2,
            "nome": "Maria Gestora",
            "email": "maria.gerente@sellion.com.br",
            "role": "ADMIN",
            "ativo": true
          }
        ]
        ```

* **`POST /api/funcionarios`**
    *   **Descrição:** Cadastra um novo colaborador na equipe do Tenant. O e-mail deve ser único entre usuários ativos. O backend gera o hash Argon2id da senha.
    *   **Payload (Frontend):**
        ```json
        {
          "nome": "Carlos Caixa",
          "email": "carlos.caixa@sellion.com.br",
          "senha": "SenhaSeguraAqui123",
          "role": "OPERADOR"
        }
        ```
        *(Nota: `role` aceita estritamente `"ADMIN"` ou `"OPERADOR"`.)*
    *   **Retorno (201 Created):**
        ```json
        {
          "id": 3,
          "nome": "Carlos Caixa",
          "email": "carlos.caixa@sellion.com.br",
          "role": "OPERADOR",
          "ativo": true
        }
        ```

* **`PUT /api/funcionarios/{id}`**
    *   **Descrição:** Atualiza nome ou role do funcionário. O e-mail é imutável após o cadastro (integridade de auditoria).
    *   **Payload (Frontend):**
        ```json
        {
          "nome": "Carlos Eduardo Caixa",
          "role": "ADMIN"
        }
        ```
    *   **Retorno (200 OK):**
        ```json
        {
          "id": 3,
          "nome": "Carlos Eduardo Caixa",
          "email": "carlos.caixa@sellion.com.br",
          "role": "ADMIN",
          "ativo": true
        }
        ```

* **`DELETE /api/funcionarios/{id}`**
    *   **Descrição:** Soft delete — marca `ativo = false`. Registro histórico preservado para auditoria.
    *   **Retorno (204 No Content).**

---

### 12. Financeiro (Lançamentos de Despesas)

*Todas as rotas protegidas por `ROLE_ADMIN`. Filtro de período obrigatório via query params. Hard delete (sem soft delete).*

* **`GET /api/financeiro/lancamentos?dataInicial=YYYY-MM-DD&dataFinal=YYYY-MM-DD`**
    *   **Descrição:** Retorna todos os lançamentos de despesas com `data_referencia` dentro do período. Ordenados por data decrescente.
    *   **Retorno (200 OK):**
        ```json
        [
          {
            "id": 1,
            "descricao": "Aluguel do ponto comercial",
            "valor": 2500.00,
            "categoria": "ALUGUEL",
            "dataReferencia": "2026-06-01",
            "criadoEm": "2026-06-05T10:30:00Z"
          },
          {
            "id": 2,
            "descricao": "Conta de energia elétrica",
            "valor": 450.00,
            "categoria": "ENERGIA",
            "dataReferencia": "2026-06-10",
            "criadoEm": "2026-06-10T08:00:00Z"
          }
        ]
        ```

* **`POST /api/financeiro/lancamentos`**
    *   **Descrição:** Registra uma nova despesa operacional.
    *   **Payload (Frontend):**
        ```json
        {
          "descricao": "Aluguel do ponto comercial",
          "valor": 2500.00,
          "categoria": "ALUGUEL",
          "dataReferencia": "2026-06-01"
        }
        ```
        *(Nota: `categoria` aceita: `ALUGUEL`, `ENERGIA`, `AGUA`, `INTERNET_TELEFONE`, `CONTADOR`, `FOLHA_PAGAMENTO`, `PRO_LABORE`, `COMPRA_MERCADORIA`, `EMBALAGENS_MATERIAIS`, `IMPOSTOS`, `TAXAS_BANCARIAS`, `MANUTENCAO`, `MARKETING`, `OUTROS`.)*
    *   **Retorno (201 Created):** Objeto completo do lançamento criado.

* **`PUT /api/financeiro/lancamentos/{id}`**
    *   **Descrição:** Atualiza um lançamento existente.
    *   **Payload (Frontend):** Mesmo formato do POST.
    *   **Retorno (200 OK):** Objeto atualizado.

* **`DELETE /api/financeiro/lancamentos/{id}`**
    *   **Descrição:** Exclusão permanente (hard delete). Não há recuperação após confirmação.
    *   **Retorno (204 No Content).**

---