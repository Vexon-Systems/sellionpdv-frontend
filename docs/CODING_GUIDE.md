# Coding Standards - SellionPDV

## 1. Padrões de Frontend (React + TypeScript)
A aplicação adota o **Feature-Sliced Design (FSD)** para modularidade do código.
* **`/features` (O Coração):** O código deve ser agrupado por domínio de negócio (ex: `/pdv`, `/catalogo`). Cada feature é independente e deve conter suas próprias subpastas internas: `/components`, `/services` (chamadas de API), `/hooks`, `/pages` e `/types`.
* **`/components` (Componentes Globais/"Burros"):** Reservado estritamente para componentes universais de UI (como botões, modais e tabelas do shadcn/ui) e layouts básicos. Eles não devem fazer chamadas de API nem possuir regras de negócio complexas, apenas receber propriedades (props).
* **`/store` (Estado Global):** Utiliza Zustand. Deve ser usado exclusivamente para dados que precisam sobreviver à navegação entre páginas (ex: carrinho de compras no PDV ou dados de sessão).
* **Fluxo de Criação de Feature:** 1. Criar a pasta do domínio -> 2. Definir contratos (`/types`) -> 3. Criar os consumos de API (`/services`) -> 4. Construir os componentes locais -> 5. Montar a página (`/pages`) -> 6. Registrar a página nas rotas (`/routes` com TanStack Router) e no menu lateral.

## 2. Padrões de Backend (Spring Boot + Java)
A aplicação utiliza a arquitetura **Package by Feature** (Módulos por Funcionalidade), visando a alta coesão e navegação simplificada.
* **Organização de Pastas:** Cada domínio (ex: `/venda`, `/produto`, `/caixa`) possui seu próprio pacote contendo todas as suas camadas: `Controller`, `Service`, `Repository`, `Entity` e a subpasta `/dto`. Classes transversais vivem em pacotes como `/security`, `/config` e `/exception`.
* **Camada Controller (A Recepção):** O Controller é "burro". Ele apenas atende a requisição, valida a entrada (`@Valid`), e repassa o DTO para o Service. Nunca acessa o banco de dados diretamente.
* **Camada Service (O Cérebro):** Toda regra de negócio, cálculos financeiros (Zero Trust) e validações de tenant moram aqui. O Service processa os dados, interage com os Repositories e devolve a resposta mapeada.
* **Transações Seguras:** Todo fluxo que envolva alteração no banco de dados (`INSERT`, `UPDATE`, `DELETE`) ou que modifique múltiplas tabelas simultaneamente, deve obrigatoriamente estar envelopado pela anotação `@Transactional` para garantir o rollback em caso de falha.

## 3. Regras de Ouro (Invioláveis)
* **Zero Trust (Confiança Zero):** O Backend NUNCA confia em valores financeiros ou cálculos totais enviados no payload (JSON) do Frontend. O Backend deve sempre ir ao banco de dados, buscar o preço base daquele momento e recalcular tudo na camada Service.
* **Isolamento de Entidades:** É expressamente proibido retornar ou receber uma Entidade JPA (ex: a classe `Produto` mapeada com `@Entity`) diretamente no Controller. Toda a comunicação externa deve ser feita através de Records do Java encapsulados em DTOs.