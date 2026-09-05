# Execução e publicação do frontend

Runtime: Node.js 22 (mínimo 22.13), React 19, Vite e TypeScript.
Para desenvolver, copie `.env.example` para `.env.local`, configure a API local,
execute `npm ci` e `npm run dev`. Variáveis `VITE_*` são públicas; não guardar
chaves privadas nelas. O cliente HTTP está em `src/lib/api.ts`.

## Verificação e configuração

CI: `npm ci`, auditoria de produção (high), `npm run lint`, `npm test`,
`npm run build`. O build do CI usa `https://api.example.invalid` apenas para
compilar; seu artefato não serve para publicação.

Todo build exige `VITE_API_URL` HTTPS válida, sem localhost. Configure essa
variável com a API de staging no ambiente Preview e com a API de produção em
Production. As variáveis são incorporadas ao JavaScript durante o build.
Configure também `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT` e a versão em
`VITE_APP_VERSION` (SHA; Vercel fornece `VERCEL_GIT_COMMIT_SHA` no build remoto).
Manter as origens correspondentes no CORS do backend.

## Release manual

Branch curta → PR para main → CI → merge → CI do SHA final → staging → produção.
Exigir o check `Lint e Build do Frontend` em main. Não exigir revisão por outra
pessoa como condição universal para operação solo. O CI do backend também
precisa estar verde no SHA que será publicado com este frontend.

`vercel.json` desativa o deploy Git automático da main. Outras branches podem
gerar Preview, mas não substituem a validação do SHA final em staging.
Conferir que a Production Branch do projeto permanece main.
[Configuração Git da Vercel](https://vercel.com/docs/project-configuration/git-configuration).

Para publicar o SHA exato, use um checkout limpo desse commit, vincule ao projeto
correto com o CLI da Vercel autenticado e confira `git rev-parse HEAD` e
`git status --short`. Após staging e aprovação do par de SHAs, publique o backend
retrocompatível e execute `vercel deploy --prod` nesse checkout do frontend.
O build remoto deve usar as variáveis Production. Não promover o artefato Preview
que aponta para staging e não usar o artefato do CI.
[Deploy pelo CLI](https://vercel.com/docs/cli/deploy).

Registrar SHA, URL do deployment, responsável, horário e versão anterior.
Validar login, abertura, venda, recibo, movimentação, fechamento e relatórios.
Rollback retorna ao deployment de produção anterior; não restaura o banco.

## Falhas e resultado incerto

Consultas comuns têm prazo de 30s, refresh 15s e PDF 60s. Gravações não têm retry
automático. Se uma venda perder a resposta, manter o checkout e os dados originais:
a nova tentativa manual reutiliza a chave. A API atual responde 422 quando a venda
já foi processada. Consultar o histórico/responsável antes de iniciar outra venda;
não fechar o checkout, alterar o carrinho ou recarregar para contornar o erro.
O contrato atual não recupera automaticamente o recibo da operação anterior.

Erros de consulta não são caixa fechado nem relatório vazio. O botão de nova
consulta recupera a tela quando o serviço volta. Em staging, simular rede/500 e
confirmar no Sentry o ambiente, versão, operação/status e a notificação recebida.
