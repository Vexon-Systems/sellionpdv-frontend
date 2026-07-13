import { useEffect } from "react";

interface Options {
  /** Se true, o atalho não dispara quando o usuário está digitando em input/textarea. Default: true. */
  ignorarEmInputs?: boolean;
  /** Se false, desabilita o atalho temporariamente. Default: true. */
  enabled?: boolean;
}

/**
 * Registra um atalho de teclado global. Dispara `handler` quando o usuário aperta a `tecla`.
 *
 * Exemplo:
 *   useKeyboardShortcut("F2", () => confirmarVenda(), { enabled: temItens });
 */
export function useKeyboardShortcut(
  tecla: string,
  handler: () => void,
  { ignorarEmInputs = true, enabled = true }: Options = {}
) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== tecla) return;

      if (ignorarEmInputs) {
        const alvo = event.target as HTMLElement | null;
        const tag = alvo?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || alvo?.isContentEditable) {
          return;
        }
      }

      event.preventDefault();
      handler();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tecla, handler, ignorarEmInputs, enabled]);
}
