import * as Sentry from "@sentry/react";
import { isAxiosError } from 'axios';

/**
 * Records operational failures without serializing HTTP responses, headers,
 * request bodies, or credentials into production logs/telemetry.
 */
export function reportOperationalError(context: string, error: unknown) {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag("context", context);
    scope.setTag("environment", import.meta.env.VITE_SENTRY_ENVIRONMENT ?? 'development');
    scope.setTag("release", import.meta.env.VITE_APP_VERSION ?? 'unknown');
    if (isAxiosError(error)) {
      scope.setTag('http.status_code', error.response?.status ?? 'unavailable');
      scope.setTag('failure.kind', error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' ? 'timeout' : error.response ? 'http' : 'network');
    }
    Sentry.captureMessage("Operational request failed", "error");
  });
}
