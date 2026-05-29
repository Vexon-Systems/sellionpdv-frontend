# Architecture - SellionPDV

## 1. Stack Tecnológica
* **Frontend:** Single Page Application (SPA) construída com React e Vite.
* **Bibliotecas Frontend:** Tailwind CSS, TanStack Router, TanStack Query, Zustand,
shadcn/ui + Radix UI e React Hook Form + Zod

* **Backend:** API RESTful baseada em Java (17+) com o framework Spring Boot (3+).
* **Bibliotecas Backend:** Spring Data JPA, Spring Security, Spring Web, Lombok,
Springdoc-openapi e MapStruct
* **Banco de Dados:** PostgreSQL (gerenciado via Supabase).
* **Documentação da API:** Gerada via SpringDoc OpenAPI 3.x, exposta na rota `/swagger-ui/index.html`.

## 2. Segurança e Multi-Tenant
* **Autenticação (JWT):** O sistema é `STATELESS` (sem estado de sessão no servidor) e tem a proteção CSRF desativada. Os tokens são gerados pela biblioteca `java-jwt` (HMAC256) carregando `tenantId` e `usuarioId` em claims customizados.
* **Interceptação de Segurança:** O `SecurityFilter` (que estende `OncePerRequestFilter`) extrai o token, valida a assinatura e injeta o usuário no contexto do Spring.
* **Hashing de Senhas:** Utilização estrita do algoritmo `Argon2PasswordEncoder` para resistência contra força bruta.
* **Gestão de Segredos:** Credenciais e chaves sensíveis são injetadas nativamente via Classpath através do arquivo `application-secret.properties`, que é ignorado no versionamento.
* **Isolamento de Banco de Dados:** É realizado automaticamente pelo Backend. O `CurrentTenantIdentifierResolver` repassa o ID para a anotação `@TenantId` do Hibernate 6 presente nas entidades operacionais, injetando a trava de locatário em todos os comandos SQL.

## 3. Persistência de Dados e JPA
* **Soft Delete:** A inativação lógica é padronizada usando colunas booleanas (`ativo = true/false`) e filtrada de forma automática nas consultas pelo Repository utilizando `findAllByAtivoTrue`.
* **Acesso a Dados:** Baseado em Query Methods do Spring Data JPA. O uso de anotações `@Query` com instrução `JOIN FETCH` é reservado para otimização e prevenção do problema de N+1.
* **Sincronização JPA (Evitar Conflitos):** É proibido o uso de `.clear()` para recriar relacionamentos aninhados complexos (ex: modificadores). A camada Service utiliza algoritmos de "Merge Inteligente" para adicionar, atualizar ou remover dependências sem quebrar o contexto de persistência.

## 4. Performance e Estrutura
* **Payloads Otimizados para Cache:** Endpoints pesados (como a listagem do Catálogo) retornam árvores JSON profundas e aninhadas (Nested DTOs) em uma única requisição. Isso evita chamadas sucessivas e permite que o Frontend monte um cache completo na memória (RAM) para zerar a latência no PDV.
* **Testes de Qualidade:** Foco em testes unitários velozes na camada `Service` (onde moram as regras de negócio e validações "Zero Trust"), utilizando JUnit 5 e Mockito para o isolamento do banco de dados.