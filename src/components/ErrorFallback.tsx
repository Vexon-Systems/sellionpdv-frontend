import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error?: unknown;
}

export function ErrorFallback({ error }: ErrorFallbackProps = {}) {
  if (import.meta.env.DEV && error) {
    console.error(error);
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-xl font-semibold">Algo deu errado</h1>
      <p className="text-muted-foreground max-w-md">
        Encontramos um erro inesperado. Recarregue a página para continuar. Se o problema persistir, entre em contato com o suporte.
      </p>
      <Button onClick={() => window.location.reload()}>Recarregar</Button>
    </div>
  );
}
