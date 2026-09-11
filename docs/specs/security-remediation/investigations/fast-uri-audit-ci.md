# Dependência `fast-uri` vulnerável no CI

## Classificação

**Confirmado.** O workflow da PR #42 falha no passo `npm audit --omit=dev --audit-level=high` porque o lockfile resolve `fast-uri` para `3.1.5`.

## Evidências

- `npm ls fast-uri --all` mostra `fast-uri@3.1.5`, transitivo de `shadcn` por `@dotenvx/dotenvx`/`conf`/`ajv` e por `@modelcontextprotocol/sdk`/`ajv`.
- O run `34531194616` do GitHub Actions reportou quatro advisories de severidade alta para essa versão e encerrou com código 1.
- A advisory `GHSA-5jgf-p345-68v8` registra a linha 3.x como corrigida a partir de `3.1.6`. Uma advisory posterior, `GHSA-58mr-gqgx-xq4g`, afeta exatamente `3.1.6` e é corrigida em `3.1.7`. Portanto, a versão alvo mínima é `3.1.7`.

## Escopo e fluxos afetados

O pacote é ferramenta transitiva de desenvolvimento/CLI e não é carregado pelo bundle Vite entregue ao navegador. O impacto confirmado no projeto é o bloqueio do CI da PR #42; não há demonstração de uma entrada controlada pelo usuário que alcance `fast-uri` no runtime da aplicação.

## Remediação aprovada

Adicionar um override explícito de `fast-uri` para `3.1.7`, regenerar apenas o lockfile e validar instalação determinística, audit, lint, testes e build. Não usar `npm audit fix` nem `--force`.

## Evidências de validação

- O diff de dependências ficou limitado a `package.json` e `package-lock.json`: o override e a resolução de `fast-uri` de `3.1.5` para `3.1.7`.
- `npm ci --ignore-scripts` instalou a árvore declarada no lockfile; `npm ls fast-uri --all` confirmou `3.1.7` em todos os caminhos.
- `npm audit --omit=dev --audit-level=high` retornou `found 0 vulnerabilities`.
- `npm run lint` concluiu com código 0.
- `npm test` concluiu com 14 arquivos e 42 testes aprovados.
- `VITE_API_URL=https://api.example.invalid npm run build` concluiu com código 0. O aviso de chunks acima de 500 kB é preexistente e não foi introduzido pela remediação.

## Revisão adversarial

- Após integrar a `main`, o lockfile foi regenerado usando o manifesto combinado: preserva `@hookform/resolvers@5.7.1` da atualização Dependabot e fixa `fast-uri@3.1.7`. A instalação determinística, o audit, o lint, os 42 testes e o build foram executados novamente com sucesso.
- A correção não altera contratos públicos, rotas, modelos de dados ou regras de negócio.
- O override está na linha 3.x compatível com os pedidos transitivos `^3.0.1`; não introduz uma atualização de major.
- Não foram usados `npm audit fix`, `--force` nem scripts de ciclo de vida para produzir a alteração.
