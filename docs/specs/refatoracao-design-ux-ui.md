# Spec: Refinamento de Design, UX e UI

**Status:** `Em andamento — Fase 1`  
**Data:** 2026-07-13  
**Autor:** SellionPDV  
**Branch sugerida:** `feature/refatoracao-design-ux-ui`

---

## 1. Contexto e Problema

O SellionPDV já possui uma base funcional sólida: React, Tailwind v4, shadcn/ui, fonte Geist, componentes reutilizáveis e fluxos operacionais estabelecidos. Contudo, a interface foi construída por feature e acumulou estilos locais de cor, sombra, raio, tipografia e estado. Isso gera inconsistência visual entre telas, dificulta a evolução e impede que os tokens de tema existentes sustentem o dark mode de forma confiável.

Esta iniciativa não é um redesenho de produto. O objetivo é refinar a experiência existente para um padrão SaaS sóbrio, moderno e profissional, preservando a identidade azul da Sellion e a velocidade de operação do caixa.

### Decisões de produto já aprovadas

- Prioridade inicial: fundação visual, navegação e PDV.
- Direção estética: SaaS sóbrio; superfícies neutras, hierarquia clara e azul Sellion usado para ações e informação relevante.
- PDV: densidade operacional compacta para desktop e tablet de caixa.
- Escopo de UX: melhorar hierarquia, ergonomia, feedback e acessibilidade sem alterar regras, rotas ou jornadas de negócio.
- Acessibilidade: WCAG AA essencial nas áreas redesenhadas.
- Movimento: microinterações funcionais e sutis, com respeito a `prefers-reduced-motion`.
- Tema: preparar a fundação para dark mode; lançar apenas o tema claro nesta iniciativa.

---

## 2. User Stories

- Como **operador**, quero localizar produtos, entender o estado do carrinho e finalizar uma venda rapidamente, para atender clientes sem ruído visual ou perda de contexto.
- Como **operador**, quero ver foco, estados e ações importantes de forma inequívoca, para operar também por teclado e em telas touch de caixa.
- Como **admin**, quero uma navegação e uma estrutura visual consistentes, para alternar entre operação e gestão com confiança.
- Como **time de desenvolvimento**, quero tokens e componentes de apresentação reutilizáveis, para evoluir novas telas sem repetir estilos arbitrários.

---

## 3. Fora de Escopo

- Alterar endpoints, DTOs, banco de dados, autenticação, permissões ou regras de negócio.
- Alterar rotas, nomenclaturas de domínio ou a jornada de venda já existente.
- Lançar dark mode ou criar seletor de tema nesta primeira iniciativa.
- Refatorar visualmente todas as telas administrativas na mesma entrega inicial.
- Trocar Tailwind, shadcn/ui, TanStack Router, Zustand ou adicionar uma biblioteca de design/animação.
- Criar um novo logotipo, paleta de marca ou protótipo Figma como requisito de implementação.

---

## 4. Modelo de Dados e API Backend

Não há mudanças de banco, entidades, payloads, contratos de API ou permissões. A refatoração é exclusivamente de apresentação e interação client-side.

---

## 5. Frontend

### Arquitetura visual

Manter React, Tailwind v4 e shadcn/ui. A refatoração deve concentrar decisões visuais em tokens semânticos e componentes-base, evitando que novas telas dependam diretamente de `gray-*`, `slate-*`, `blue-*`, sombras ou raios arbitrários.

| Área | Decisão |
|---|---|
| Tokens | Evoluir `src/index.css` com cores semânticas de fundo, superfície, texto, borda, foco, sucesso, aviso e perigo; manter o azul Sellion como `primary`. |
| Tipografia | Manter Geist; definir escala consistente para título de página, título de seção, corpo, metadado e valor financeiro. |
| Espaçamento | Adotar escala fixa de espaçamento e densidade compacta no PDV; evitar valores avulsos sem justificativa. |
| Superfícies | Padronizar página, card, painel, tabela, modal e item selecionável com borda sutil, contraste suficiente e sombra apenas quando comunicar elevação. |
| Estados | Padronizar hover, ativo, selecionado, foco, desabilitado, carregamento, vazio, erro e sucesso. Estados não podem depender somente de cor. |
| Movimento | Usar transições curtas para hover, foco, abertura de painel e confirmação; desativar/reduzir animações sob `prefers-reduced-motion`. |

### Contratos internos de componentes

Não haverá API pública nova. Os componentes internos de layout devem expor variantes previsíveis para reduzir classes locais:

| Componente | Contrato de apresentação |
|---|---|
| `Header` | Densidade, título/subtítulo, ações e comportamento responsivo consistentes em todas as páginas. |
| `AppSidebar` | Estado ativo inequívoco, grupos legíveis, modo recolhido acessível e área de usuário/saída estável. |
| Componentes UI existentes | `Button`, `Card`, `Input`, `Tabs`, `Dialog`, `Table`, `Badge` e `Skeleton` usam tokens semânticos e mantêm suas APIs atuais. |
| Primitivos novos, se necessários | Criar somente componentes de apresentação reutilizáveis, como `PageShell`, `PageHeader`, `Surface` e `EmptyState`; sem encapsular regra de negócio. |

### Experiência do PDV

- Preservar busca, atalhos `/`, `?` e `F2`, categorias, grade, carrinho, edição de item, checkout e tela de sucesso.
- Priorizar a área de produto e o total/cobrança na leitura visual; o carrinho deve manter contraste, quantidade e preço facilmente escaneáveis.
- Em desktop/tablet, usar grade compacta, controles com alvo de toque adequado e carrinho estável no eixo lateral. Em larguras menores, preservar a adaptação atual sem esconder a ação de cobrar.
- Exibir foco de teclado visível em busca, categorias, cartões de produto, controles de quantidade, ações de carrinho e checkout.
- Manter erros, carregamentos e estados vazios como componentes coerentes e com mensagem acionável.

---

## 6. Planejamento em Fases

### Fase 0 — Auditoria e linha de base

**Objetivo:** consolidar o inventário antes de mudar estilos.

1. Mapear cores, sombras, raios, tipografia e espaçamentos repetidos em `src/`.
2. Registrar capturas de referência do login, PDV, caixa, dashboard, catálogo e relatórios em desktop e tablet.
3. Listar componentes shadcn já usados e identificar variantes que podem ser configuradas sem quebrar APIs.
4. Verificar contraste e navegação por teclado nos fluxos prioritários.

**Saída:** inventário de padrões, baseline visual e checklist de regressão. Não há alteração de comportamento.

**Execução parcial (2026-07-13):** o inventário estático encontrou 131 arquivos TypeScript/TSX, com 556 ocorrências de classes de paleta hardcoded (`gray`, `slate` e `blue`), 98 usos de sombra, 241 de raio, 147 breakpoints e 109 estilos explícitos de foco. A concentração atual é: backoffice 309 ocorrências, PDV 113, caixa 55, usuários 32 e autenticação 4. Foram identificados os componentes prioritários de layout (`AppSidebar`, `Header`) e do PDV (página, grade, carrinho, checkout, modais, sucesso e atalhos). As capturas visuais e a verificação interativa de desktop/tablet permanecem pendentes porque o navegador local não pôde ser conectado nesta sessão; devem ser concluídas antes de aprovar a Fase 0.

### Fase 1 — Fundação visual e acessibilidade

**Objetivo:** criar a linguagem compartilhada que sustentará as migrações seguintes.

1. Refinar tokens semânticos de `index.css`, preservando os tokens atuais usados pelo shadcn.
2. Definir escalas de tipografia, espaçamento, raio, borda, elevação e foco.
3. Atualizar os componentes UI transversais necessários para consumir tokens, sem mudar suas props públicas.
4. Adicionar tratamento global de redução de movimento e revisar contraste/foco para WCAG AA.
5. Remover hardcodes de cores e superfícies dos componentes tocados; o tema claro é a referência de entrega e os tokens devem permitir uma futura classe `.dark` completa.

**Critério de saída:** primitives e tokens aprovados em uma página de referência interna; nenhuma regressão de teclado ou contraste nas primitives alteradas.

**Execução inicial (2026-07-13):** foram adicionados tokens semânticos para superfícies (`surface`, `surface-raised`, `surface-sunken`), estados (`success`, `warning`, `info`), elevação (`shadow-card`, `shadow-floating`) e foco. A escala de raio foi refinada, mantendo a paleta azul da Sellion como `primary`. As primitives `Button`, `Card`, `Input`, `Tabs`, `Dialog` e `Skeleton` foram atualizadas para consumir a fundação, fornecer foco mais evidente e respeitar redução de movimento. Validação visual realizada no login em desktop e tablet; o campo de e-mail exibe foco visível. `npm run lint` passou sem novos erros (cinco avisos preexistentes) e `npm run build` passou. A validação visual das telas autenticadas será concluída durante as Fases 2 e 3.

### Fase 2 — Casca de navegação

**Objetivo:** tornar a troca de contexto entre operação e gestão mais clara e profissional.

1. Refatorar `AppSidebar`, `Header` e o shell compartilhado de páginas.
2. Padronizar estado ativo, grupos, ícones, tooltips no modo recolhido, área de perfil e ações globais.
3. Padronizar cabeçalhos de página, subtítulos, ações contextuais e áreas roláveis.
4. Garantir responsividade para tablet e foco acessível para toggle da sidebar, links e menus.

**Critério de saída:** todas as rotas existentes mantêm navegação, permissões visuais e comportamento atual; a sidebar e o header têm a mesma aparência em PDV, caixa e backoffice.

### Fase 3 — PDV operacional

**Objetivo:** aplicar a linguagem ao fluxo de maior frequência sem alterar a venda.

1. Refatorar busca, abas de categoria, grade de produtos, cartões, badges de quantidade e estados de catálogo.
2. Refatorar carrinho, controles de quantidade, resumo financeiro e chamada para cobrança, preservando atalhos e callbacks.
3. Aplicar os mesmos padrões a modais de produto, checkout, sucesso e atalhos, priorizando contraste, leitura e alvo touch.
4. Validar layout em desktop e tablet de caixa, inclusive com carrinho vazio, carrinho longo, imagens ausentes e nomes extensos.

**Critério de saída:** operador consegue concluir a mesma venda por mouse/touch e teclado; não há mudança de payload, cálculo, atalhos, modal ou rota.

### Fase 4 — Migração progressiva do backoffice

**Objetivo:** estender a fundação sem uma migração arriscada de uma só vez.

1. Migrar dashboard e relatórios primeiro, por compartilharem cards, filtros, tabelas e dados financeiros.
2. Migrar catálogo, modificadores, equipe, maquininhas, financeiro, caixa e configurações em entregas pequenas por domínio.
3. Substituir hardcodes restantes por tokens e primitives; manter cada página funcional antes de iniciar a próxima.

**Critério de saída:** cada feature migrada preserva todos os formulários, permissões, filtros, upload e mutações existentes.

### Fase 5 — Dark mode e governança contínua

**Objetivo:** lançar tema escuro somente após a migração das superfícies relevantes.

1. Completar os valores `.dark` dos tokens semânticos e implementar a preferência de tema com `next-themes`.
2. Validar contraste, gráficos, imagens, modais, tabelas e estados em ambos os temas.
3. Documentar tokens, variantes e checklist visual no guia de código; incluir revisão de UX/UI em pull requests que criem telas ou componentes.

**Critério de saída:** troca de tema sem flash perceptível, sem hardcodes de cor nas telas migradas e com preferência persistida de forma não sensível.

---

## 7. Regras de UX, Acessibilidade e Validações

- Todo controle interativo novo ou alterado deve ser acessível por teclado, ter nome acessível e foco visível.
- Ações destrutivas, indisponíveis e de carregamento devem ser distinguíveis por texto/ícone/estado, não apenas por cor.
- Textos e componentes interativos tocados devem atingir contraste WCAG AA; valores financeiros, preços e totais devem manter legibilidade em todas as superfícies.
- Alvos primários de operação no PDV devem ter dimensão adequada a touch; não reduzir o alvo para ganhar densidade.
- Respeitar `prefers-reduced-motion`; nenhuma animação pode atrasar uma ação de venda ou esconder mudança de estado.
- Não introduzir texto, ícone ou botão decorativo sem função, tooltip ou rótulo acessível quando necessário.
- O código de domínio, hooks, serviços, stores, query keys e payloads não devem ser alterados por esta refatoração.

---

## 8. Critérios de Aceite

### Fundação e navegação

- [ ] As áreas redesenhadas usam tokens semânticos; novos hardcodes de paleta não são introduzidos.
- [ ] Header e sidebar mantêm rotas, visibilidade por papel e comportamento recolhido existentes.
- [ ] Estado ativo, hover, foco, desabilitado e carregamento são visíveis e consistentes.
- [ ] Navegação por teclado alcança todos os controles da casca e apresenta foco perceptível.
- [ ] Contraste das áreas migradas atende WCAG AA para texto e controles essenciais.

### PDV

- [ ] Busca por `/`, ajuda por `?` e cobrança por `F2` continuam funcionando.
- [ ] Seleção de categoria, clique/teclado em produto, ajuste de quantidade, edição, remoção e checkout mantêm o comportamento atual.
- [ ] Carrinho vazio, longo e com modificadores permanece legível em desktop e tablet.
- [ ] Estados de carregamento, vazio e erro do catálogo são coerentes com o sistema visual.
- [ ] Nenhum cálculo, preço, desconto, payload ou integração de venda é alterado.

### Qualidade

- [ ] `npm run lint` passa sem novos erros.
- [ ] `npm run build` passa.
- [ ] Smoke test manual cobre login, navegação, PDV, checkout, caixa, dashboard e uma tela administrativa após cada fase aplicável.
- [ ] Capturas antes/depois e checklist de regressão acompanham cada pull request de fase.

---

## 9. Dependências

- Nenhuma dependência de backend, banco, API ou migration.
- Nenhuma biblioteca nova é necessária; usar Tailwind v4, shadcn/ui, Radix, lucide-react e `next-themes` já presentes.
- A Fase 3 depende da conclusão e aprovação das Fases 1 e 2.
- A Fase 5 depende da migração suficiente das superfícies para não misturar tokens com hardcodes legados.

---

## 10. Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| Regressão visual em tela operacional | Migrar por fase e validar com capturas e smoke test de venda antes de avançar. |
| Alteração involuntária de regra de negócio | Limitar mudanças a JSX, classes, primitives e apresentação; revisar diffs de hooks, serviços e stores como exceção. |
| Perda de densidade no PDV | Validar quantidade de produtos e itens visíveis em desktop/tablet antes de aprovar a Fase 3. |
| Dark mode incompleto | Não expor seletor de tema antes de eliminar hardcodes das superfícies migradas. |
| Animações prejudicarem operação | Usar apenas transições curtas e respeitar `prefers-reduced-motion`. |
| Inconsistência voltar em features futuras | Documentar tokens e exigir revisão de UI para novos componentes. |

---

## 11. Notas de Implementação

- A migração deve preferir substituir classes locais por tokens e variantes existentes, não criar uma camada de abstração para cada elemento simples.
- Preservar as APIs dos componentes shadcn e usar `cn()` para variantes locais quando necessário.
- A primeira PR de implementação deve conter somente Fase 1; Fases 2 e 3 devem ser PRs separadas para facilitar revisão e rollback.
- O dark mode é uma consequência da fundação de tokens, não um requisito de aceite da primeira entrega.
