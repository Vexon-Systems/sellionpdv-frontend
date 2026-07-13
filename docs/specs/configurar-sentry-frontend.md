# Spec: Observabilidade de Erros no Frontend (Sentry + ErrorBoundary)

> **Status**: Concluído e validado em produção em 2026-07-10 — `ErrorBoundary` + `errorComponent` do TanStack Router testados com erro forçado real (tela de recuperação renderiza corretamente); deploy publicado em `https://sellionpdv.vercel.app` com `VITE_SENTRY_DSN` configurado. Achado durante a implementação: o `Sentry.ErrorBoundary` sozinho não pega erro de renderização de rota — o TanStack Router intercepta antes; a captura real depende do `errorComponent` na `rootRoute` (ver `src/routes/RootErrorComponent.tsx`).
> **Esforço estimado**: ~2-3 horas (setup + validação) — a mais simples das três specs de hardening pro piloto
> **Prioridade**: Alta — primeiro item da lista de hardening pro piloto de Agosto (quiosque de sorvete, cliente de teste sem cobrança)
>
> **Por que este é o primeiro dos três**: sem isso, não temos como saber se os outros dois fixes (idempotência na venda, `NumericFormat` nas taxas de maquininha) realmente funcionam em produção — ou se qualquer outra coisa quebra no dia a dia do cliente. É a base de visibilidade antes de mexer em mais nada.

---

## 1. Resumo

Hoje o backend tem Sentry desde o Tier 1 (ADR 020 do backend) — captura erro 500 inesperado, erros de negócio (4xx) não são enviados (ruído baixo, sinal alto). O frontend não tem **nenhuma** observabilidade: sem Sentry, sem `ErrorBoundary` em lugar nenhum (nem global, nem por rota no TanStack Router). Se a tela quebrar no caixa do cliente, ele vê uma tela branca e a única forma de você saber é ele te avisar.

Isso é particularmente ruim pro objetivo deste piloto: o cliente não paga, o retorno dele é *feedback* — e um bug silencioso que ele nem sabe descrever direito é o pior tipo de feedback perdido.

Esta spec resolve dois problemas com a mesma dependência:
1. **Captura de erro real**: exceções não tratadas (JS runtime, promise rejeitada) chegam no Sentry, com o mesmo princípio do backend — só o que é inesperado, sem ruído de erro de validação/negócio.
2. **Tela branca vira tela de recuperação**: `Sentry.ErrorBoundary` envolve a aplicação — em vez de branco, mostra uma mensagem com botão "Recarregar", e opcionalmente deixa o usuário descrever o que aconteceu (`showDialog`), que cai direto no Sentry anexado ao erro. Isso é literalmente um canal de feedback estruturado vindo do próprio cliente piloto.

**Fora de escopo deliberado**: performance tracing (`browserTracingIntegration`) e Session Replay. O backend também não faz tracing, só captura exceção — mantendo a mesma filosofia de "baixo ruído" e evitando estourar a cota do plano Free do Sentry (compartilhada com o backend, mesma conta). Isso pode virar uma spec futura se o volume de erro real for baixo e sobrar cota.

---

## 2. Onde isso se encaixa (achado de arquitetura)

O projeto Sentry do backend não pode ser reaproveitado diretamente — DSN é por **projeto**, e projeto Sentry é atrelado a uma plataforma (Java/Spring vs. JavaScript/React). A conta/organização Sentry já existe (mesma usada pelo backend); só precisa de um **projeto novo** dentro dela, tipo "React", com seu próprio DSN. Mesma lógica do ADR 020: staging e produção do backend reaproveitam o mesmo projeto (só muda a tag de `environment`) — aqui vale o mesmo: um projeto Sentry frontend, com `VITE_SENTRY_ENVIRONMENT` diferenciando `staging`/`production`/`development`.

React 19 (confirmado em `package.json`) precisa de uma configuração um pouco diferente da doc genérica do Sentry (que assume React ≤18): os error handlers (`onUncaughtError`, `onCaughtError`, `onRecoverableError`) precisam ser passados como opções do `createRoot()`, não só o `ErrorBoundary` sozinho. Sem isso, alguns erros capturados internamente pelo React 19 não chegam ao Sentry.

---

## 3. Arquivos exatos a criar/modificar

| Arquivo | Ação | O que muda |
|---|---|---|
| `package.json` | Modificar | Nova dependência `@sentry/react` |
| `src/instrument.ts` | **Criar** | `Sentry.init(...)` — importado primeiro, antes de qualquer outro import |
| `src/main.tsx` | Modificar | Importa `./instrument` no topo; `createRoot()` recebe os error handlers do React 19 |
| `src/App.tsx` | Modificar | `<RouterProvider>` envolvido por `<Sentry.ErrorBoundary>` |
| `src/components/ErrorFallback.tsx` | **Criar** | UI de fallback (mensagem + botão "Recarregar"), usando `Button` do shadcn/ui já existente |
| `.env` | Modificar (local, não commitado) | `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT` |
| `.env.example` | **Criar** | Documentar as duas variáveis novas sem valor real (esse arquivo hoje não existe no repo — vale criar já que não há nenhum modelo de `.env` versionado) |

---

## 4. Dependências a instalar

```bash
npm install @sentry/react --save
```

Nenhuma outra dependência nova — sem plugin de source maps (`@sentry/vite-plugin`) nesta versão, pra não exigir token de auth do Sentry no CI. Sem isso os stack traces em produção vêm minificados (menos legíveis, mas funcionais); é uma melhoria razoável pra depois, não bloqueante pro piloto.

---

## 5. Variáveis de ambiente

```bash
# .env (local, staging, produção — cada ambiente com seu próprio valor)
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=development
```

Igual ao padrão do backend (`sentry.dsn=${SENTRY_DSN:}` — desligado com segurança por padrão): `VITE_SENTRY_DSN` vazio faz o `Sentry.init` não enviar nada, sem quebrar a aplicação. Em desenvolvimento local, deixar vazio é o esperado (não queremos erro de `localhost` poluindo o Sentry).

No Vercel: configurar `VITE_SENTRY_DSN` e `VITE_SENTRY_ENVIRONMENT=production` no ambiente de produção, e (se existir preview/staging no Vercel) `VITE_SENTRY_ENVIRONMENT=staging` separadamente — mesma DSN (mesmo projeto Sentry), só a tag de ambiente muda, igual o backend faz entre staging e produção (ADR 024).

---

## 6. Desenho do código

```ts
// src/instrument.ts
import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? "development",
    // Sem tracesSampleRate/browserTracingIntegration: só captura de erro,
    // mesmo princípio de baixo ruído do Sentry no backend (ADR 020).
  });
}
```

```tsx
// src/main.tsx
import './instrument' // precisa ser o primeiro import do arquivo

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!, {
  onUncaughtError: Sentry.reactErrorHandler(),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

```tsx
// src/components/ErrorFallback.tsx
import { Button } from "@/components/ui/button";

export function ErrorFallback() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-xl font-semibold">Algo deu errado</h1>
      <p className="text-muted-foreground max-w-md">
        Encontramos um erro inesperado. Já fomos notificados — recarregue a página para continuar.
      </p>
      <Button onClick={() => window.location.reload()}>Recarregar</Button>
    </div>
  );
}
```

```tsx
// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import * as Sentry from '@sentry/react';
import { router } from './routes/root';
import { Toaster } from './components/ui/sonner';
import { ErrorFallback } from './components/ErrorFallback';

const queryClient = new QueryClient();

function App() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />} showDialog>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position='top-right' richColors />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;
```

`showDialog` abre o widget nativo do Sentry pro usuário escrever o que estava fazendo quando o erro aconteceu — anexado automaticamente ao evento capturado. Dado que o objetivo desse cliente é dar o máximo de feedback possível, isso transforma um crash em um canal de feedback estruturado, em vez de só um log que só você vê.

---

## 7. Passo a passo para testar antes do deploy

### Passo 1 — Criar o projeto Sentry (plataforma React)

Na mesma organização/conta Sentry já usada pelo backend, criar um projeto novo com plataforma "React". Copiar o DSN gerado.

### Passo 2 — Configurar `.env` local e rodar

```bash
npm install
# VITE_SENTRY_DSN= (vazio — não queremos eventos de localhost)
npm run dev
```

Confirmar que a aplicação sobe normalmente sem DSN configurado (comportamento "desligado com segurança").

### Passo 3 — Forçar um erro de propósito

Temporariamente, jogar um `throw new Error("teste sentry")` dentro de algum componente (ex.: `PdvPage.tsx`, atrás de um `if` que só ativa com uma query string de teste) com `VITE_SENTRY_DSN` apontando pro projeto de teste. Confirmar:
- A tela mostra o `ErrorFallback` (não a tela branca do navegador).
- O evento aparece no painel do Sentry em segundos.
- O widget de feedback (`showDialog`) abre e, se preenchido, o comentário aparece anexado ao evento no Sentry.

Reverter o `throw` de teste antes de commitar.

### Passo 4 — Validar em staging (se existir ambiente de preview no Vercel)

Configurar `VITE_SENTRY_DSN`/`VITE_SENTRY_ENVIRONMENT=staging` no ambiente correspondente do Vercel, repetir o Passo 3 apontando pra URL de staging, e confirmar que o evento chega marcado com `environment: staging` (não deve se misturar com eventos de produção no painel).

### Passo 5 — Rodar lint + build (mesmo gate do CI)

```bash
npm run lint
npm run build
```

### Passo 6 — Deploy

Configurar `VITE_SENTRY_DSN` (mesmo DSN do projeto) e `VITE_SENTRY_ENVIRONMENT=production` na Vercel, ambiente de produção. Sem migration, sem mudança de contrato de API — deploy independente do backend.

---

## 8. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Cota do plano Free do Sentry estourar (compartilhada com o backend, mesma conta) | Sem tracing/replay, só captura de exceção — pegada bem menor que o backend em volume. Reavaliar se o volume de erro real for alto (sinal de bug recorrente, não de configuração) |
| `throw` de teste do Passo 3 esquecido no código | Só ativa atrás de uma query string de teste explícita; ainda assim, revisar o diff antes do commit final |
| Stack traces minificados em produção (sem source maps) dificultam debug | Aceitável pro estágio atual — o objetivo aqui é saber *que* algo quebrou e *quando*, não ter o stack trace perfeito. Adicionar `@sentry/vite-plugin` é uma melhoria futura, não bloqueante |
| DSN do frontend exposto no bundle (client-side, visível a qualquer um que inspecionar o JS) | Comportamento esperado e aceito pela própria Sentry — o DSN só permite *enviar* eventos, não ler dados. Mesmo padrão de qualquer SDK client-side (Google Analytics, etc.) |
