import { Button } from './ui/button';

export function QueryError({ message = 'Não foi possível carregar os dados.', onRetry }: {
  message?: string;
  onRetry: () => void;
}) {
  return <div role="alert" className="m-4 rounded-lg border border-destructive/25 bg-destructive/10 p-4">
    <p className="mb-3 text-sm text-destructive">{message}</p>
    <Button variant="outline" onClick={onRetry}>Tentar novamente</Button>
  </div>;
}
