import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? "development",
    release: import.meta.env.VITE_APP_VERSION ?? 'unknown',
    // Sem tracesSampleRate/browserTracingIntegration: só captura de erro,
    // mesmo princípio de baixo ruído do Sentry no backend (ADR 020).
  });
}
