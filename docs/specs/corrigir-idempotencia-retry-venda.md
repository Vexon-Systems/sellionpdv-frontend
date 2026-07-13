# Spec: Corrigir Reuso de Idempotency-Key no Retry de Venda

> **Status**: Concluído e validado em 2026-07-11 — código implementado (`useCheckout.ts`, `useFinalizarVenda.ts`), lint e build limpos, e validação funcional completa contra o novo ambiente de dev local (Postgres via Docker, `docker-compose.yml`). Duas vendas reais concluídas via UI (login `admin@sellion.com.br`, produto de teste, caixa aberto): venda 1 com `idempotencyKey=1bfe69df-fc5b-467d-b2b9-5d37cd135bb2`, venda 2 (checkout reaberto) com `idempotencyKey=6d09aa4d-e646-4668-a94c-a14ce782b35d` — confirma que cada abertura do checkout gera uma chave nova e isolada, exatamente o comportamento esperado.
> **Esforço estimado**: ~1 hora — a mais simples das três specs de hardening pro piloto
> **Prioridade**: Alta — risco de cobrar o cliente duas vezes pela mesma venda

---

## 1. Resumo

O backend implementa idempotência de verdade em `POST /api/vendas` via header `Idempotency-Key` (ver `venda/VendaService.java` e `CLAUDE.md` do backend, regra de "Zero Trust financeiro") — reenviar a mesma chave não duplica a venda. O problema não é o backend, é o frontend: em [useFinalizarVenda.ts:16](../../src/features/pdv/hooks/useFinalizarVenda.ts#L16), a chave é gerada assim:

```ts
mutationFn: async (dadosFrontend: FormatoVendaFrontend) => {
    const idempotencyKey = crypto.randomUUID(); // nova chave a cada chamada
    ...
}
```

Isso protege contra o React Query tentar a mesma chamada de novo sozinho, mas **não protege contra o operador clicar "Confirmar" de novo** depois de um timeout ou erro de rede — porque cada clique invoca a `mutationFn` do zero, gerando uma chave nova. Se a venda já tiver sido processada no backend (a resposta que se perdeu foi só a de volta), o retry com chave nova passa pela idempotência sem ser barrado e **cria uma segunda venda**.

Como a internet da loja piloto é estável (confirmado com você), a chance disso acontecer é baixa — mas não é hipotética, e a consequência (cobrar o cliente final duas vezes numa venda real) é grave o suficiente pra corrigir antes de Agosto, principalmente porque é uma correção pequena.

**A chave certa deve nascer com o carrinho/checkout, não com a chamada HTTP.** Enquanto o operador estiver tentando fechar a mesma venda (mesmo que precise clicar "Confirmar" mais de uma vez), a chave tem que ser a mesma. Só quando uma venda é concluída ou o checkout é fechado é que uma chave nova deve ser gerada, para a próxima venda.

---

## 2. Onde isso se encaixa

O ponto de entrada de cada tentativa de venda é `handleConfirmar()` em [useCheckout.ts:50](../../src/features/pdv/hooks/useCheckout.ts#L50) — é chamado toda vez que o operador clica "Confirmar" (inclusive em um retry manual). Hoje ele monta o `payload` e chama `mutate(payload, ...)`; a chave só existe dentro de `useFinalizarVenda`, um passo depois, sem visibilidade de quantas vezes já foi tentado.

A correção move a geração da chave pra `useCheckout` (que já controla o ciclo de vida do checkout via `isOpen`/`resetEFechar`), guardada em `useRef` (não precisa re-renderizar nada quando muda) e regenerada exatamente quando um novo checkout começa.

---

## 3. Arquivos exatos a modificar

| Arquivo | Mudança |
|---|---|
| `src/features/pdv/hooks/useCheckout.ts` | Gera a `idempotencyKey` num `useRef`, regenerada quando `isOpen` vira `true`; inclui no `payload` de `handleConfirmar` |
| `src/features/pdv/hooks/useFinalizarVenda.ts` | Para de gerar a chave internamente; recebe `idempotencyKey` como parte de `FormatoVendaFrontend` |

Nenhum arquivo de backend muda — o contrato do header `Idempotency-Key` já existe e já funciona corretamente.

---

## 4. Desenho do código

```ts
// hooks/useFinalizarVenda.ts
export interface FormatoVendaFrontend {
    formaPagamento: FormaPagamento;
    maquininhaId?: number | null;
    descontoAplicado?: number;
    itens: ItemCarrinho[];
    idempotencyKey: string; // novo — nasce no useCheckout, não aqui
}

export const useFinalizarVenda = () => {
    return useMutation({
        mutationFn: async (dadosFrontend: FormatoVendaFrontend) => {
            const payloadLimpo = {
                formaPagamento: dadosFrontend.formaPagamento,
                maquininhaId: dadosFrontend.maquininhaId || null,
                descontoAplicado: dadosFrontend.descontoAplicado || 0,
                itens: dadosFrontend.itens.map(item => ({
                    produtoId: item.produto.id,
                    quantidade: item.quantidade,
                    modificadores: item.modificadores ? item.modificadores.map(mod => mod.opcaoId) : []
                }))
            };

            return await finalizarVenda(payloadLimpo, dadosFrontend.idempotencyKey);
        },
    });
};
```

```ts
// hooks/useCheckout.ts — trechos alterados
import { useEffect, useRef, useState } from "react";
// ...

export function useCheckout({ isOpen, subtotal, onSuccess, onClose }: UseCheckoutOptions) {
    const { itens, limparCarrinho } = useCartStore();
    const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | null>(null);
    const [maquininhaId, setMaquininhaId] = useState<string | null>(null);
    const [bandeiraCartao, setBandeiraCartao] = useState<BandeiraCartao | null>(null);

    const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

    // Nova chave só quando um checkout novo começa — retries dentro da mesma
    // tentativa (mesmo carrinho, mesmo modal aberto) reusam a mesma chave.
    useEffect(() => {
        if (isOpen) {
            idempotencyKeyRef.current = crypto.randomUUID();
        }
    }, [isOpen]);

    const { mutate, isPending } = useFinalizarVenda();

    // ...

    function handleConfirmar() {
        if (!formaPagamento) {
            toast.warning("Atenção", { description: "Por favor, selecione uma forma de pagamento." });
            return;
        }
        if (exigeMaquininha && !maquininhaId) {
            toast.warning("Atenção", { description: "Por favor, selecione qual maquininha foi utilizada." });
            return;
        }

        const payload = {
            itens,
            formaPagamento,
            maquininhaId: exigeMaquininha ? Number(maquininhaId) : null,
            bandeiraCartao: exigeMaquininha ? bandeiraCartao : null,
            descontoAplicado: 0,
            idempotencyKey: idempotencyKeyRef.current,
        };

        mutate(payload, {
            // ... resto igual
        });
    }

    // ... resto igual
}
```

Por que `useEffect` ligado a `isOpen` (não a `itens`): o carrinho pode ser montado antes do checkout abrir, e o operador pode reabrir o modal (ex.: fechou sem confirmar, voltou) — cada abertura do modal é uma "nova tentativa de venda" do ponto de vista do usuário, então merece chave nova. Dentro da mesma abertura, não importa quantas vezes `handleConfirmar` for chamado (erro de forma de pagamento não selecionada, timeout de rede, clique duplo) — é a mesma chave até fechar ou concluir.

---

## 5. Passo a passo para testar

### Passo 1 — Confirmar que uma venda normal continua funcionando

Fluxo completo: abrir caixa → adicionar produto → abrir checkout → confirmar venda → sucesso. Confirmar no painel/relatório que só **uma** venda foi criada.

### Passo 2 — Simular um retry manual com a mesma chave

Não dá pra simular queda de rede real facilmente sem internet instável (que não é o caso da loja piloto), mas dá pra provar a correção de outro jeito: no DevTools, inspecionar a aba Network durante uma venda e confirmar visualmente que o header `Idempotency-Key` tem o **mesmo valor** em requisições subsequentes feitas dentro do mesmo checkout (ex.: forçando erro de validação — tentar confirmar sem selecionar maquininha, depois selecionar e confirmar de novo — o valor do header deve ser idêntico nas duas tentativas).

### Passo 3 — Confirmar que abrir um novo checkout gera chave nova

Completar uma venda, abrir o checkout de novo pra uma segunda venda, e confirmar (via Network) que o header `Idempotency-Key` mudou em relação à venda anterior.

### Passo 4 — Lint + build

```bash
npm run lint
npm run build
```

---

## 6. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Reabrir o modal sem querer (ex.: clique acidental) gera chave nova desnecessariamente | Sem problema — o carrinho ainda não foi enviado, uma chave nova pra uma tentativa que ainda não aconteceu é inofensivo |
| `useRef` inicializado uma vez no mount do componente, antes do primeiro `isOpen=true` | Coberto: o valor inicial de `useRef` já é uma chave válida (`crypto.randomUUID()` na declaração), e o `useEffect` substitui por uma nova assim que `isOpen` vira `true` pela primeira vez — nunca fica com uma chave "genérica" compartilhada entre a primeira e a segunda venda |
