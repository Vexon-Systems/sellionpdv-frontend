# Módulo: Gestão de Equipe (Usuários)

## 1. Visão Geral do Módulo
* **Objetivo:** Permitir a administração de credenciais de acesso, gerenciando os funcionários (operadores de caixa e gerentes) da franquia.
* **Atores:** Exclusivo para usuários com a role `ADMIN`.
* **Pré-requisito:** A rota do frontend e os endpoints do backend devem ser estritamente protegidos, garantindo que perfis de `OPERADOR` não consigam acessar a listagem ou realizar mutações na equipe.

## 2. Estrutura de Dados (Modelagem)
Este módulo manipula a entidade central de acesso:
* **Usuario:** Tabela principal contendo `tenant_id`, `nome`, `email`, `senha_hash`, `role`, `telefone`, `avatar_url` e a flag de soft-delete `ativo`.

## 3. Contratos de API Específicos (Endpoints)
* **`GET /api/usuarios`**
  * **Uso:** Lista todos os funcionários ativos daquele Tenant.
  * **Comportamento:** O isolamento do `tenant_id` e a filtragem de inativos (`ativo = false`) são automáticos via anotações do Hibernate.
* **`POST /api/usuarios`**
  * **Uso:** Criação de um novo funcionário.
  * **Payload esperado:** `nome`, `email`, `senha`, `role` (restrito a `ADMIN` ou `OPERADOR`), e `telefone` (obrigatoriamente apenas números).
* **`PUT /api/usuarios/{id}`**
  * **Uso:** Atualização de dados cadastrais (nome, telefone, role). 
  * **Regra:** Não deve ser utilizado para trocar a senha diretamente (rotas de credenciais possuem fluxo próprio de validação).
* **`DELETE /api/usuarios/{id}`**
  * **Uso:** Desligamento de um funcionário.
  * **Regra:** Aciona o Soft-Delete (`ativo = false`), revogando o acesso imediatamente, mas preservando o histórico do usuário nas tabelas de `vendas` e `caixas`.

## 4. Frontend (Interface e Estado)
* **Localização:** Todo o código visual e de integração deve viver na pasta `/features/equipe`.
* **Componentes Principais:** `EquipePage.tsx` (tabela de listagem) e `UsuarioFormModal.tsx` (formulário de adição/edição utilizando shadcn/ui).
* **Formulário e Limpeza de Dados (Zod):** * A interface exibe a máscara `(XX) XXXXX-XXXX` para facilitar a digitação.
  * O esquema Zod intercepta o envio e higieniza a string: `z.string().transform((val) => val.replace(/\D/g, ''))`.
* **Integração:** Consumo da API abstraído no arquivo `/features/equipe/services/apiEquipe.ts`.

## 5. Regras de Negócio do Domínio (Invioláveis)
1. **Higienização Restrita (Backend):** O `UsuarioRequestDTO` deve atuar como barreira, utilizando a anotação `@Pattern` para garantir que o campo telefone chegue ao banco de dados estritamente limpo.
2. **Criptografia Obrigatória:** A API jamais persiste a senha em texto limpo. O `UsuarioService` deve receber a senha embutida no DTO e submetê-la ao hash irreversível do algoritmo `Argon2id` antes de salvar.
3. **Identidade Injetada:** O `tenant_id` do novo funcionário é herdado automaticamente pela extração do token JWT do `ADMIN` que disparou a requisição. O Frontend NUNCA deve enviar o ID da franquia no JSON.